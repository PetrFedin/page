\set ON_ERROR_STOP on
BEGIN;
\i /tmp/v31_4_hardening_body.sql
\i /tmp/v31_5_lifecycle_body.sql
\i marco-pescarolo-v31-5/sql/18_v31_5_lifecycle_smoke.sql
ROLLBACK;