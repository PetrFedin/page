\set ON_ERROR_STOP on
BEGIN;
\i /tmp/v31_4_hardening_body.sql
\i /tmp/v31_5_lifecycle_body.sql
\i /tmp/v31_6_relation_body.sql
\i marco-pescarolo-v31-7/sql/18_v31_5_lifecycle_smoke.sql
\i marco-pescarolo-v31-7/sql/22_v31_6_relation_concurrency_smoke.sql
\i /tmp/v31_7_event_body.sql
\i marco-pescarolo-v31-7/sql/26_v31_7_event_execution_smoke.sql
\i /tmp/v31_9_outbox_body.sql
\i marco-pescarolo-v31-9/sql/31_outbox_worker_smoke.sql
ROLLBACK;
