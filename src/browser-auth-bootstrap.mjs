import { validateRuntimeConfig } from './runtime-config.mjs';
import { createAuthSessionController, AuthSessionError } from './auth-session-controller.mjs';
import { createAuthorityAdapter, AuthorityBridgeError } from './authority-adapter.mjs';

const CDN_VERSION = '2.118.0';

async function loadCapabilityMap() {
  const response = await fetch('./contracts/authority-capability-map.json', { cache: 'no-store' });
  if (!response.ok) throw new Error(`Capability map HTTP ${response.status}`);
  return response.json();
}

export async function bootstrapBrowserAuth({ config = globalThis.MP_CONFIG ?? {}, onState = () => {}, audit = () => {} } = {}) {
  const validated = validateRuntimeConfig(config);
  if (!validated.configured) {
    const previewState = { phase: 'preview_only', configured: false, authorizedSurfaces: [], selectedSurface: 'public', assuranceLevel: null };
    onState(previewState);
    return { configured: false, controller: null, version: CDN_VERSION };
  }

  const [{ createClient }, capabilityMap] = await Promise.all([
    import(`https://esm.sh/@supabase/supabase-js@${CDN_VERSION}?bundle`),
    loadCapabilityMap()
  ]);
  const supabase = createClient(validated.supabaseUrl, validated.supabasePublishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  const controller = createAuthSessionController({ supabase, onState, audit });
  const adapters = new Map();
  const getAdapter = (surface) => {
    if (!adapters.has(surface)) adapters.set(surface, createAuthorityAdapter({ supabase, capabilityMap, surface, audit }));
    return adapters.get(surface);
  };

  async function invoke(surface, capability, input = {}) {
    return getAdapter(surface).invoke(capability, input);
  }

  async function refreshPublicCatalogue() {
    return invoke('public', 'public.catalogue.read', {});
  }

  async function refreshSurface(surface, storeId = null) {
    const state = controller.getState();
    controller.selectSurface(surface);
    if (surface === 'private') {
      const membership = (state.access?.memberships ?? []).find(m => ['private','private_client'].includes(m.access_role));
      const dbRole = membership?.db_role ?? (membership?.access_role === 'private_client' ? 'private_client' : 'private_client');
      return invoke('private', 'private.snapshot.read', { p_access_role: dbRole, p_store_id: null });
    }
    if (surface === 'wholesale') {
      const membership = (state.access?.memberships ?? []).find(m => ['buyer','wholesale'].includes(m.access_role));
      const dbRole = membership?.db_role ?? (membership?.access_role === 'buyer' ? 'buyer' : 'buyer');
      const effectiveStore = storeId ?? membership?.client_store_id ?? null;
      return invoke('wholesale', 'wholesale.snapshot.read', { p_access_role: dbRole, p_store_id: effectiveStore });
    }
    if (surface === 'admin') {
      return invoke('admin', 'admin.snapshot.read', {});
    }
    throw new AuthSessionError('SURFACE_UNSUPPORTED', `Cannot refresh ${surface}`);
  }

  await controller.bootstrap();
  return { configured: true, controller, supabase, capabilityMap, invoke, refreshPublicCatalogue, refreshSurface, version: CDN_VERSION };
}

export { AuthSessionError, AuthorityBridgeError };