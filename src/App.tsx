import { useEffect, useState } from "react";
import type { Member } from "./members";
import "./index.css";

interface RingData {
  current: Member;
  prev: Member;
  next: Member;
  random: Member;
  members: Member[];
}

const pagecount = 5;

export function App() {
  const [data, setData] = useState<RingData | null>(null);
  const [copied, setCopied] = useState(false);
  const [page, setPage] = useState(0);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    fetch("/api/ring")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("lc-theme");
    const pref = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(pref);
    document.documentElement.classList.toggle("dark", pref);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("lc-theme", next ? "dark" : "light");
  };

  const members = data?.members ?? [];
  const totalPages = Math.max(1, Math.ceil(members.length / pagecount));
  const safePage = Math.min(page, totalPages - 1);
  const pageMembers = members.slice(safePage * pagecount, (safePage + 1) * pagecount);

  const embedCode = `<script src="${window.location.origin}/api/embed.js"></script>`;

  return (
    <div className="min-h-screen flex flex-col">
        <div className="max-w-2xl mx-auto w-full px-6 md:px-8 py-12 md:py-16">
        <header className="mb-12">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                 <img src="/lanyard.png" alt="lanyard.cafe logo" className="w-10 h-10" />
                <h1 className="font-serif text-4xl md:text-5xl text-text leading-tight">
                  lanyard.cafe
                </h1>
              </div>
              <p className="font-sans text-text-light text-base mt-2 max-w-lg">
                the best webring around, built for the lanyard.rest community
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md bg-cream-dark/80 text-text-light hover:bg-cream-dark transition-all duration-200 text-1xl mt-3"
              aria-label="theme"
            >
              {dark ? "\u2600" : "\u263E"}
            </button>
          </div>
        </header>

        {data && (
          <section className="mb-12">
            <h2 className="font-serif text-2xl text-text mb-4">navigate</h2>
            <div className="bg-cream-dark/80 backdrop-blur-sm rounded-2xl p-5 border border-cream-dark inline-block min-w-[260px]">
              <div className="flex gap-3 mb-3">
                <a
                  href={data.prev.url}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-light text-pink-dark font-semibold text-sm hover:bg-pink hover:text-white transition-all duration-200"
                >
                  <span>◀</span> prev
                </a>
                <a
                  href={data.random.url}
                  className="px-4 py-2 rounded-xl bg-lavender-light text-[#9B7EB5] font-semibold text-sm hover:bg-lavender hover:text-white transition-all duration-200"
                >
                  random
                </a>
                <a
                  href={data.next.url}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-light text-pink-dark font-semibold text-sm hover:bg-pink hover:text-white transition-all duration-200"
                >
                  next <span>▶</span>
                </a>
              </div>
              <p className="text-sm text-text-light">
                you are at <span className="font-semibold text-text">lanyard.cafe</span>
              </p>
            </div>
          </section>
        )}

        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-2xl text-text">members</h2>
            {totalPages > 1 && (
              <div className="flex items-center gap-2 text-sm text-text-light">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={safePage === 0}
                  className="px-2 py-1 rounded-lg bg-pink-light text-pink-dark font-semibold hover:bg-pink hover:text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ◀
                </button>
                <span className="tabular-nums">{safePage + 1}/{totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={safePage === totalPages - 1}
                  className="px-2 py-1 rounded-lg bg-pink-light text-pink-dark font-semibold hover:bg-pink hover:text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ▶
                </button>
              </div>
            )}
          </div>
          <div className="grid gap-3">
            {pageMembers.map((site) => (
              <a
                key={site.name}
                href={site.url}
                className="group block bg-cream-dark/80 backdrop-blur-sm rounded-2xl p-5 border border-cream-dark hover:border-pink/40 hover:bg-cream-dark transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  {site.buttonUrl && (
                    <img
                      src={site.buttonUrl}
                      alt=""
                      className="w-[88px] h-[31px] flex-none"
                    />
                  )}
                  <div>
                    <h3
                      className="font-serif text-base text-text group-hover:text-pink-dark transition-colors"
                      title={site.url}
                    >
                      {site.name}
                    </h3>
                    <p className="text-sm text-text-light">
                      {site.url}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-text mb-4">join</h2>
          <div className="bg-cream-dark/80 backdrop-blur-sm rounded-2xl p-5 border border-cream-dark">
            <p className="text-sm text-text-light mb-4 max-w-md">
              want to add your site to the ring? open a pull request on our <a href="https://github.com/venqoi/lanyard.cafe" className="text-pink hover:underline">github repo</a>
            </p>

            <div className="mb-4">
              <p className="text-sm font-semibold text-text mb-2">
                add to your site:
              </p>
              <div className="flex gap-2 items-start">
                <code className="flex-1 bg-cream-dark text-text text-xs p-2.5 rounded-xl border border-cream-dark break-all font-mono">
                  {embedCode}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(embedCode);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="shrink-0 px-3 py-2 rounded-xl bg-brown-light text-brown-dark font-semibold text-xs hover:bg-brown hover:text-white transition-all duration-200"
                >
                  {copied ? "copied!" : "copy"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
