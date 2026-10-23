import { CommerceError, verifyClientScope, projectAdmin, validId } from '../core/commerce-engine.mjs';

const READ_RPCS = new Set([
  'mp_my_access', 'mp_client_snapshot', 'mp_client_delivery_ledger',
  'mp_client_issued_proformas', 'mp_admin_snapshot', 'mp_admin_money_evidence',
  'mp_admin_fulfillment_queue'
]);
export function validateConfig(config) {
  if (!config || typeof config !== 'object') throw new CommerceError('CONFIGURATION_REQUIRED');
  let url;
  try { url = new URL(config.url); } catch { throw new CommerceError('INVALID_SUPABASE_URL'); }
  if (url.protocol !== 'https:' || !/^[-a-z0-9]+\.supabase\.co$/.test(url.hostname) || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new CommerceError('INVALID_SUPABASE_URL');
  }
  if (typeof config.publishableKey !== 'string' || !/^sb_publishable_[\w-]+$/.test(config.publishableKey)) {
    throw new CommerceError('PUBLISHABLE_KEY_REQUIRED');
  }
  return { url: url.origin, publishableKey: config.publishableKey };
}
function errFromResponse(body, code, status) {
  const detail = String(body?.msg || body?.error_description || body?.message || body?.error || code);
  return new CommerceError(code, `${detail.slice(0, 150)} (${status})`);
}
function isObject(value) { return Boolean(value && typeof value === 'object' && !Array.isArray(value)); }

/** Browser-only in-memory session; read RPCs, server authority is always enforced by RLS/definer guards. */
export class CommercialGateway {
  constructor(config, transport = globalThis.fetch) {
    this.config = validateConfig(config);
    if (typeof transport !== 'function') throw new CommerceError('FETCH_UNAVAILABLE');
    this.fetch = (...args) => transport.apply(globalThis, args); // Keep the native browser receiver for fetch.
    this.session = null;
    this.identity = null;
    this.refreshPromise = null;
  }
  get signedIn() { return Boolean(this.session?.access_token && this.identity); }
  get currentUser() { return this.identity?.user_id ?? null; }
  async request(path, { method = 'POST', body, accessToken = null } = {}) {
    const headers = { apikey: this.config.publishableKey, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    const url = this.config.url + path;
    let response;
    try { response = await this.fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), cache: 'no-store', credentials: 'omit' }); }
    catch { throw new CommerceError('NETWORK_UNAVAILABLE', 'Secure server connection unavailable'); }
    const raw = await response.text();
    let value = null;
    try { value = raw ? JSON.parse(raw) : null; } catch { throw new CommerceError('NON_JSON_SERVER_RESPONSE'); }
    if (!response.ok) throw errFromResponse(value, 'SERVER_REQUEST_FAILED', response.status);
    return value;
  }
  async signIn(email, password) {
    this.clear();
    if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new CommerceError('VALID_EMAIL_REQUIRED');
    if (typeof password !== 'string' || password.length < 1) throw new CommerceError('PASSWORD_REQUIRED');
    const session = await this.request('/auth/v1/token?grant_type=password', { body: { email, password } });
    if (!session?.access_token || !session?.refresh_token || !validId(session.user?.id) || session.user?.is_anonymous === true) {
      throw new CommerceError('INVALID_AUTH_SESSION');
    }
    this.session = { access_token: session.access_token, refresh_token: session.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + Number(session.expires_in || 3600) };
    try {
      const identity = await this.rpc('mp_my_access', {});
      if (!isObject(identity) || identity.user_id !== session.user.id) throw new CommerceError('AUTHORITY_IDENTITY_MISMATCH');
      this.identity = identity;
      return identity;
    } catch (e) { this.clear(); throw e; }
  }
  async refresh() {
    if (!this.session?.refresh_token) throw new CommerceError('AUTHENTICATION_REQUIRED');
    if (!this.refreshPromise) this.refreshPromise = (async () => {
      const result = await this.request('/auth/v1/token?grant_type=refresh_token', {
        body: { refresh_token: this.session.refresh_token }
      });
      if (!result?.access_token || !result?.refresh_token) { this.clear(); throw new CommerceError('SESSION_EXPIRED'); }
      this.session = { access_token: result.access_token, refresh_token: result.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + Number(result.expires_in || 3600) };
    })().finally(() => { this.refreshPromise = null; });
    return this.refreshPromise;
  }
  async rpc(name, params = {}) {
    if (!READ_RPCS.has(name)) throw new CommerceError('RPC_NOT_ALLOWLISTED');
    if (!this.session?.access_token) throw new CommerceError('AUTHENTICATION_REQUIRED');
    if (this.session.expires_at < Math.floor(Date.now() / 1000) + 60) await this.refresh();
    return this.request('/rest/v1/rpc/' + name, { body: params, accessToken: this.session.access_token });
  }
  getContexts() {
    if (!this.signedIn) return [];
    const ms = Array.isArray(this.identity.memberships) ? this.identity.memberships : [];
    const contexts = [];
    if (this.identity.admin === true) contexts.push({ role: 'admin', label: 'Brand administration' });
    const count = new Map();
    for (const m of ms) if (m.db_role === 'buyer' || m.db_role === 'private_client') count.set(m.db_role, (count.get(m.db_role) || 0) + 1);
    for (const m of ms) {
      if (!['buyer','private_client'].includes(m.db_role) || m.status !== 'active') continue;
      if (count.get(m.db_role) !== 1) continue; // RPC selects first membership; fail closed on ambiguity.
      if (m.db_role === 'buyer' && !validId(m.client_store_id)) continue;
      contexts.push({ role: m.db_role === 'buyer' ? 'wholesale' : 'private', label: m.db_role === 'buyer' ? `Wholesale · ${m.store_name || 'Assigned store'}` : `Private · ${m.client_name || 'Client'}`, membership: m });
    }
    return contexts;
  }
  async load(role) {
    if (!this.signedIn) throw new CommerceError('AUTHENTICATION_REQUIRED');
    const context = this.getContexts().find(c => c.role === role);
    if (!context) throw new CommerceError('ROLE_NOT_GRANTED');
    if (role === 'admin') {
      const [admin, finance, queue] = await Promise.all([
        this.rpc('mp_admin_snapshot'), this.rpc('mp_admin_money_evidence'), this.rpc('mp_admin_fulfillment_queue')
      ]);
      return { role, admin, finance, queue, analysis: projectAdmin(admin, finance, queue) };
    }
    const m = context.membership;
    const storeId = role === 'wholesale' ? m.client_store_id : null;
    const dbRole = role === 'wholesale' ? 'buyer' : 'private_client';
    const [snapshot, ledger, proformas] = await Promise.all([
      this.rpc('mp_client_snapshot', { p_access_role: dbRole, p_store_id: storeId }),
      this.rpc('mp_client_delivery_ledger', { p_access_role: dbRole, p_store_id: storeId }),
      this.rpc('mp_client_issued_proformas', { p_access_role: dbRole })
    ]);
    return { role, snapshot, ledger, proformas,
      analysis: verifyClientScope(snapshot, ledger, m, proformas), membership: m };
  }
  clear() { this.identity = null; this.session = null; }
  async signOut() {
    const accessToken = this.session?.access_token;
    this.clear();
    if (accessToken) {
      try { await this.request('/auth/v1/logout', { accessToken }); } catch { /* already cleared locally */ }
    }
  }
}
