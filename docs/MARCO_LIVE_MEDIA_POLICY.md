# Marco Pescarolo — live screenshot and walkthrough archive

Purpose: real, dated screenshots and 20–230-second MP4 walkthroughs of the actual public Netlify production domain. Never render imaginary or unauthenticated back-office data as live.

Capture: Playwright 1.56.1; desktop 1440×900 and mobile 390×844; screenshots of public homepage, editorial, catalogue, optional product detail, RU/IT language, optional login entry, return home, mobile homepage and editorial. MP4 is H.264 1280 px wide and silent.

Every manifest identifies exact URL, UTC capture date, live HTML and same-origin script/stylesheet hashes, screenshot and video SHA256, duration, navigation assertions, mobile overflow checks and warnings. A repository commit is not passed off as the Netlify deployment SHA.

Automation: feature-branch push / workflow_dispatch now; Monday 09:00 UTC weekly schedule starts only after merging workflow to default main. Every capture run uploads a GitHub Actions artifact retained for 30 days. Passing captures become permanent public GitHub Releases under tag mp-showroom-live-[first16chars-live-hash]; unchanged live build creates no duplicate permanent version.

Safety: public unauthenticated pages only. Admin, Wholesale and Private flow demonstrations need real identities and JWT/RLS browser acceptance first. v31.9 SQL CI is green, Supabase production and Netlify production were not changed. For syntha.pro portfolio, show only verified release screenshots and mp4 labeled public demo, and link dated archive for before/after comparison.
