import { serve } from "bun";
import index from "./index.html";
import { MEMBERS, getMemberByUrl, getAdjacentMembers } from "./members";

function cors(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

function redirect(url: string) {
  return new Response(null, { status: 302, headers: { Location: url } });
}

function getSiteFromRequest(req: Request): string {
  const fromQuery = new URL(req.url).searchParams.get("url");
  if (fromQuery) return fromQuery;
  const referer = req.headers.get("Referer");
  if (referer) return referer;
  return "";
}

const server = serve({
  routes: {
    "/lanyard.png": async () => {
      const file = Bun.file("./public/lanyard.png");
      return new Response(file, {
        headers: { "Content-Type": "image/png" },
      });
    },

    "/api/members": {
      async GET() {
        return cors(MEMBERS);
      },
      OPTIONS() {
        return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS" } });
      },
    },

    "/api/ring": {
      async GET(req) {
        const site = getSiteFromRequest(req);
        const current = getMemberByUrl(site) || null;
        if (current) {
          const { prev, next } = getAdjacentMembers(current.url);
          const others = MEMBERS.filter((m) => m.url !== current.url);
          const random = others.length > 0
            ? others[Math.floor(Math.random() * others.length)]
            : MEMBERS[0]!;
          return cors({ current, prev, next, random, members: MEMBERS });
        }
        const randomIndex = Math.floor(Math.random() * MEMBERS.length);
        return cors({ current: null, prev: MEMBERS[randomIndex]!, next: MEMBERS[(randomIndex + 1) % MEMBERS.length]!, random: MEMBERS[randomIndex]!, members: MEMBERS });
      },
      OPTIONS() {
        return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS" } });
      },
    },

    "/api/ring/prev": {
      GET(req) {
        const site = getSiteFromRequest(req);
        const current = getMemberByUrl(site);
        if (current) {
          const { prev } = getAdjacentMembers(current.url);
          return redirect(prev.url);
        }
        return redirect(MEMBERS[Math.floor(Math.random() * MEMBERS.length)]!.url);
      },
    },

    "/api/ring/next": {
      GET(req) {
        const site = getSiteFromRequest(req);
        const current = getMemberByUrl(site);
        if (current) {
          const { next } = getAdjacentMembers(current.url);
          return redirect(next.url);
        }
        return redirect(MEMBERS[Math.floor(Math.random() * MEMBERS.length)]!.url);
      },
    },

    "/api/ring/random": {
      GET() {
        return redirect(MEMBERS[Math.floor(Math.random() * MEMBERS.length)]!.url);
      },
    },

    "/api/embed.js": {
        async GET() {
          const script = generateEmbedScript();
          return new Response(script, {
            headers: {
              "Content-Type": "application/javascript; charset=utf-8",
              "Access-Control-Allow-Origin": "*",
            },
          });
        },
      },

      "/*": index,
    },

    development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`☕ lanyard.cafe running at ${server.url}`);

function generateEmbedScript(): string {
  return `
(function() {
  var host = location.hostname.replace(/^www\\./, '');
  var container = document.createElement('div');
  container.id = 'lc-embed';
  container.style.cssText = 'position:fixed;bottom:16px;left:16px;z-index:99999;font-family:Quicksand,system-ui,sans-serif;';
  document.body.appendChild(container);

  var script = document.currentScript || document.querySelector('script[src*="embed.js"]');
  var dark = script && script.getAttribute('data-theme') === 'dark';

  var bg = dark ? '#2C2420' : 'rgb(255, 248, 240)';
  var border = dark ? '#5A4A40' : '#F5EDE0';
  var text = dark ? '#E8D5C4' : '#8B7A6A';
  var textStrong = dark ? '#FFF8F0' : '#4A3728';
  var pinkBg = dark ? '#4A2A33' : '#FCE4EC';
  var pinkText = dark ? '#F4A7B9' : '#E8879E';
  var lavenderBg = dark ? '#352B45' : '#EEE6F5';
  var lavenderText = dark ? '#D4C5E2' : '#9B7EB5';

  fetch(${JSON.stringify("https://lanyard.cafe")} + '/api/ring?url=' + encodeURIComponent(host))
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var prev = data.prev, next = data.next, random = data.random;
      var isMember = data.current !== null;
      var currentLine = isMember ? '<p style="margin:0;font-size:14px;color:' + text + ';">you are at <span style="font-weight:600;color:' + textStrong + ';">' + data.current.url + '</span></p>' : '';
      container.innerHTML =
        '<section style="margin-bottom:48px;">' +
        '<div style="background:' + bg + ';backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border:1.5px solid ' + border + ';border-radius:16px;padding:16px;display:inline-block;min-width:260px;font-size:14px;">' +
        '<div style="display:flex;gap:12px;' + (isMember ? 'margin-bottom:12px;' : '') + '">' +
        '<a href="' + prev.url + '" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:12px;background:' + pinkBg + ';color:' + pinkText + ';font-weight:600;font-size:14px;text-decoration:none;white-space:nowrap;">\\u25C0 prev</a>' +
        '<a href="' + random.url + '" style="display:inline-flex;align-items:center;padding:8px 16px;border-radius:12px;background:' + lavenderBg + ';color:' + lavenderText + ';font-weight:600;font-size:14px;text-decoration:none;white-space:nowrap;">random</a>' +
        '<a href="' + next.url + '" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:12px;background:' + pinkBg + ';color:' + pinkText + ';font-weight:600;font-size:14px;text-decoration:none;white-space:nowrap;">next \\u25B6</a>' +
        '</div>' +
        currentLine +
        '</div>' +
        '</section>';
    })
    .catch(function() {});
})();
  `.trim();
}
