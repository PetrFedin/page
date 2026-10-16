\set ON_ERROR_STOP on
BEGIN;
\i /tmp/v31_4_hardening_body.sql
\i marco-pescarolo-v31-4/sql/15_v31_4_internal_integrity_smoke.sql
ROLLBACK;