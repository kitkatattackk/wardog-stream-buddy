import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import emblem from "@/assets/wardogs-emblem.png";
import texture from "@/assets/wardogs-texture.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Wardogs Chat — Military Twitch Chat Overlay for StreamElements" },
      {
        name: "description",
        content:
          "A gritty military-themed Twitch chat overlay for StreamElements, with combat dispatch alerts for subs, gifted subs, bits, raids and follows.",
      },
      { property: "og:title", content: "Wardogs Chat — StreamElements Chat Overlay" },
      {
        property: "og:description",
        content:
          "Ammo-crate chat panels, stencil rank tags and combat dispatches for subs, bits, raids and more. Paste-in install, deep customization.",
      },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type FireKind =
  | "chat"
  | "firstchat"
  | "subscriber"
  | "cheer"
  | "raid"
  | "follower"
  | "tip";

type Trigger = {
  label: string;
  kind: FireKind;
  payload?: Record<string, unknown>;
};

const TRIGGERS: Trigger[] = [
  { label: "Chat line", kind: "chat" },
  { label: "New recruit (sub)", kind: "subscriber", payload: { name: "PVT_HALLOWAY", amount: 1, tier: "1000" } },
  { label: "Re-enlist (resub)", kind: "subscriber", payload: { name: "GHOST_RECON88", amount: 14, tier: "2000" } },
  {
    label: "Supply drop (5 gifted)",
    kind: "subscriber",
    payload: { name: "SIERRA_K9", sender: "SIERRA_K9", amount: 5, bulkGifted: true, gifted: true },
  },
  { label: "Tracer round (50 bits)", kind: "cheer", payload: { name: "TRENCHRAT", amount: 50, message: "keep firing" } },
  { label: "Mortar strike (2,500 bits)", kind: "cheer", payload: { name: "DELTA_MIKE", amount: 2500, message: "danger close" } },
  { label: "Airstrike (10,000 bits)", kind: "cheer", payload: { name: "K9Handler", amount: 10000, message: "fire mission out" } },
  { label: "Incoming convoy (raid)", kind: "raid", payload: { name: "WARHOUND_ACTUAL", amount: 312 } },
  { label: "Signed up (follow)", kind: "follower", payload: { name: "ROOKIE_12" } },
  { label: "First contact", kind: "firstchat" },
];

const FILES = [
  { id: "html", name: "HTML", path: "/widget/wardogs-chat.html", lang: "html" },
  { id: "css", name: "CSS", path: "/widget/wardogs-chat.css", lang: "css" },
  { id: "js", name: "JS", path: "/widget/wardogs-chat.js", lang: "js" },
  { id: "fields", name: "FIELDS", path: "/widget/wardogs-fields.json", lang: "json" },
] as const;

const DISPATCHES = [
  { tag: "New Recruit", body: "First-time subs get a stencilled enlistment card." },
  { tag: "Re-Enlisted", body: "Resubs call out the month count and tier." },
  { tag: "Supply Drop", body: "Gifted subs count the crates dropped on the squad." },
  { tag: "Fire Mission", body: "Bits escalate: tracer, frag, mortar, artillery, airstrike." },
  { tag: "Incoming Convoy", body: "Raids and hosts announce the troop count." },
  { tag: "First Contact", body: "First-time chatters and new follows get their own line." },
];

const STEPS = [
  "In StreamElements, open Streamer Dashboard, then My Overlays, and edit the overlay you want chat on.",
  "Add Widget, then Static / Custom, then Custom Widget, and place the box where chat should live.",
  "Open Settings, then Open Editor. You will see HTML, CSS, JS and FIELDS tabs.",
  "Paste each Wardogs file into the matching tab, replacing anything already there. Save the FIELDS tab last.",
  "Click Done. Every option now appears in the widget's settings panel: colors, size, rank tags, per-event toggles and sounds.",
];

function Index() {
  const frame = useRef<HTMLIFrameElement>(null);
  const [active, setActive] = useState<(typeof FILES)[number]["id"]>("css");
  const [sources, setSources] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      FILES.map((f) => fetch(f.path).then((r) => r.text()).then((t) => [f.id, t] as const)),
    ).then((entries) => {
      if (!cancelled) setSources(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const fire = (t: Trigger) => {
    frame.current?.contentWindow?.postMessage(
      { wd: "fire", kind: t.kind, payload: t.payload },
      "*",
    );
  };

  const copy = async (id: string) => {
    await navigator.clipboard.writeText(sources[id] ?? "");
    setCopied(id);
    setTimeout(() => setCopied(null), 1600);
  };

  return (
    <main className="min-h-screen">
      {/* HERO */}
      <header className="relative overflow-hidden border-b border-border">
        <img
          src={texture}
          alt=""
          aria-hidden="true"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background" />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 py-16 text-center md:py-24">
          <img
            src={emblem}
            alt="Wardogs K9 unit emblem"
            width={816}
            height={816}
            className="h-32 w-32 drop-shadow-[0_6px_0_rgba(0,0,0,0.6)] md:h-44 md:w-44"
          />
          <p className="stencil mt-6 text-xs text-primary md:text-sm">Twitch chat overlay · StreamElements</p>
          <h1 className="mt-3 text-4xl leading-none md:text-7xl">Wardogs Chat</h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground md:text-xl">
            Ammo-crate chat panels, stencilled rank tags and combat dispatches for every sub, bit
            and raid. Paste four files in, customize the rest from the StreamElements panel.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#files"
              className="stencil bg-primary px-6 py-3 text-sm text-primary-foreground transition-colors hover:bg-primary/85"
            >
              Get the files
            </a>
            <a
              href="#install"
              className="stencil border border-primary/60 px-6 py-3 text-sm text-primary transition-colors hover:bg-primary/10"
            >
              Install guide
            </a>
          </div>
        </div>
        <div className="tape h-2 w-full opacity-70" />
      </header>

      {/* LIVE PREVIEW */}
      <section className="mx-auto max-w-6xl px-6 py-14" aria-labelledby="preview-heading">
        <h2 id="preview-heading" className="text-2xl md:text-3xl">
          Live fire range
        </h2>
        <p className="mt-2 text-muted-foreground">
          This is the real widget code running. Trigger events to watch the dispatches land.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="crate rivets p-2">
            <iframe
              ref={frame}
              src="/widget/demo.html"
              title="Wardogs chat overlay preview"
              className="h-[520px] w-full border-0"
            />
          </div>

          <div className="crate rivets p-5">
            <p className="stencil text-xs text-primary">Fire control</p>
            <div className="mt-4 flex flex-col gap-2">
              {TRIGGERS.map((t) => (
                <button
                  key={t.label}
                  onClick={() => fire(t)}
                  className="border border-border bg-secondary px-4 py-2 text-left text-base font-semibold uppercase tracking-wide text-secondary-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DISPATCHES */}
      <section className="border-y border-border bg-card/40" aria-labelledby="dispatch-heading">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <h2 id="dispatch-heading" className="text-2xl md:text-3xl">
            Combat dispatches
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DISPATCHES.map((d) => (
              <article key={d.tag} className="crate rivets p-5">
                <span className="stencil inline-block bg-primary px-2 py-1 text-[11px] text-primary-foreground">
                  {d.tag}
                </span>
                <p className="mt-3 text-lg text-muted-foreground">{d.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FILES */}
      <section id="files" className="mx-auto max-w-6xl px-6 py-14" aria-labelledby="files-heading">
        <h2 id="files-heading" className="text-2xl md:text-3xl">
          The four files
        </h2>
        <p className="mt-2 text-muted-foreground">
          One tab each in the StreamElements custom widget editor.
        </p>

        <div className="mt-6 crate rivets">
          <div className="flex flex-wrap items-center gap-1 border-b border-border p-2">
            {FILES.map((f) => (
              <button
                key={f.id}
                onClick={() => setActive(f.id)}
                className={
                  "stencil px-4 py-2 text-xs transition-colors " +
                  (active === f.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-primary")
                }
              >
                {f.name}
              </button>
            ))}
            <div className="ml-auto flex gap-2 pr-1">
              <button
                onClick={() => copy(active)}
                className="stencil border border-primary/60 px-3 py-2 text-xs text-primary transition-colors hover:bg-primary/10"
              >
                {copied === active ? "Copied" : "Copy"}
              </button>
              <a
                href={FILES.find((f) => f.id === active)!.path}
                download
                className="stencil border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-primary"
              >
                Download
              </a>
            </div>
          </div>
          <pre className="max-h-[420px] overflow-auto bg-background/60 p-5 text-sm leading-relaxed">
            <code className="font-mono text-muted-foreground">
              {sources[active] ?? "Loading…"}
            </code>
          </pre>
        </div>
      </section>

      {/* INSTALL */}
      <section
        id="install"
        className="border-t border-border bg-card/40"
        aria-labelledby="install-heading"
      >
        <div className="mx-auto max-w-4xl px-6 py-14">
          <h2 id="install-heading" className="text-2xl md:text-3xl">
            Install order
          </h2>
          <ol className="mt-6 space-y-4">
            {STEPS.map((s, i) => (
              <li key={s} className="crate rivets flex gap-4 p-5">
                <span className="stencil text-2xl text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-lg text-muted-foreground">{s}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8 text-center">
        <p className="stencil text-xs text-muted-foreground">
          Wardogs Chat · Loyalty · Duty · Honor
        </p>
      </footer>
    </main>
  );
}
