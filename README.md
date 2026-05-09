lanyard.cafe
============

A webring homepage for folks around lanyard.rest. Bun serves React 19 plus Tailwind 4 from src/index.ts. Member rows live in src/members.ts (url, display name, optional 88×31 buttonUrl).

Run and build
-------------

    bun install
    bun dev

Prints localhost once ready with hot reloading. Ship with bun run build (outputs dist, copies ./public). For production Bun, set NODE_ENV=production whatever way your shell supports before invoking bun src/index.ts.

HTTP surface
------------

GET /api/members. Full MEMBERS JSON, CORS open for widgets.

GET /api/ring. Prev, next, random, MEMBERS, plus recognized current Member when callers pass ?url= or Referer resolves to a known host.

GET /api/ring/prev, /next, or /random. Each answers 302 toward the picked site.

GET /api/embed.js. Floating Prev, Random, Next bar: load script src equal to origin plus /api/embed.js, optional data-theme="dark".

Everything else resolves to SPA HTML for the frontend.

Add the webring to your site
-----------------------------

List your homepage inside MEMBERS first (see Contributing). Paste one script before the closing body tag. The embed issues GET calls only and forwards your hostname to /api/ring.

    <script src="https://lanyard.cafe/api/embed.js"></script>

Floating bar pulls night colors when you flag data-theme equal to dark on the script element:

    <script src="https://lanyard.cafe/api/embed.js" data-theme="dark"></script>

Self-hosted clone? Swap https://lanyard.cafe for your own Bun origin everywhere below.

Prefer plain links? Point anchors at:

    https://lanyard.cafe/api/ring/prev
    https://lanyard.cafe/api/ring/next
    https://lanyard.cafe/api/ring/random

Prev and next pick your Member row from Referer hostname matching unless privacy tooling strips Referer. Add ?url= plus bare hostname, example …/api/ring/next?url=example.org, when anchors fire without Referer. Random skips identity checks altogether.

Building custom markup? Fetch GET /api/ring (same optional ?url=) and bind prev.url, next.url, plus random.url onto your controls. Returned JSON arrives with permissive cross-origin headers.

Contributing sites
------------------

Open a PR on https://github.com/venqoi/lanyard.cafe. Extend MEMBERS in order: prev/next loop follows array sequence.
