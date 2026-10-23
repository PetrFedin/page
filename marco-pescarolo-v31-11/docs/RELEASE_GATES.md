# Marco Commercial OS v31.11 — release admission gates

| Gate | Current | Evidence |
|---|---|---|
| Node exact money / access tests | PASS (74) | `node --test` |
| Legacy v10 pytest static contracts | PASS 266 / SKIP 2 | pytest without PostgreSQL DSN |
| Source pushed to isolated GitHub branch | PASS | SHA on `marco-pescarolo-v31-11-commercial-os` |
| Authenticated browser with synthetic fixture | CI evaluation | Chromium workflow, marked synthetic |
| Live UI without configuration blocks login | CI evaluation | Chromium locked 375 / 768 / 1440 |
| v9 migrations on exact PostgreSQL clone | HOLD | PostgreSQL v10 reconstructed fixture not exact |
| Supabase real JWT five roles | HOLD | No actual users |
| Paris vs Dubai negative leak tests | HOLD | Must exercise signed tokens against isolated backend |
| Production catalogue/retail pricing | HOLD | No approved retail price / verified variants |
| Media commercial rights | HOLD | Reference-only imagery |
| Data provenance and immutable finance chain | HOLD | Signed finance/webhook proofs not verified |
| Real browser login and user task execution | HOLD | No accounts or backend migration |
| Netlify live publish | HOLD | Must not replace current live build |

Production switch requires **all** security, product, and end-to-end gates PASS. A synthetic fixture cannot count as production business evidence.
