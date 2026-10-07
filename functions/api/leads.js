import { authorized, gate } from './stats.js';

const HEAD = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' };
const STATUSES = new Set(['new','reviewed','contacted','demo_scheduled','nda','pilot_discussion','proposal','won','lost','nurture']);
const clean = (v, max = 500) => String(v ?? '').trim().slice(0, max);

export async function onRequestPost({ request, env }) {
  const ok = await authorized(request, env);
  if (ok !== true) return gate(ok);
  if (!env.DB) return new Response(JSON.stringify({ error: 'no-db' }), { status: 500, headers: HEAD });

  let body;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: 'bad-json' }), { status: 400, headers: HEAD });
  }

  const submissionId = Number(body.submissionId);
  const status = clean(body.status, 40);
  const owner = clean(body.owner, 120);
  const nextAction = clean(body.nextAction, 500);
  const dueDate = clean(body.dueDate, 20);
  const note = clean(body.note, 1000);

  if (!Number.isInteger(submissionId) || submissionId < 1) {
    return new Response(JSON.stringify({ error: 'bad-submission-id' }), { status: 400, headers: HEAD });
  }
  if (!STATUSES.has(status)) {
    return new Response(JSON.stringify({ error: 'bad-status' }), { status: 400, headers: HEAD });
  }
  if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    return new Response(JSON.stringify({ error: 'bad-due-date' }), { status: 400, headers: HEAD });
  }

  const row = await env.DB.prepare('SELECT id, vid, sid FROM submissions WHERE id = ?').bind(submissionId).first();
  if (!row) return new Response(JSON.stringify({ error: 'submission-not-found' }), { status: 404, headers: HEAD });

  const data = {
    submissionId,
    status,
    owner,
    nextAction,
    dueDate,
    note,
    changedAt: Date.now()
  };

  await env.DB.prepare(
    `INSERT INTO events (ts, vid, sid, type, path, target, label, data)
     VALUES (?,?,?,?,?,?,?,?)`
  ).bind(
    Date.now(),
    row.vid || '',
    row.sid || '',
    'lead_op',
    '/stats',
    String(submissionId),
    status,
    JSON.stringify(data)
  ).run();

  return new Response(JSON.stringify({ ok: true, operation: data }), { headers: HEAD });
}
