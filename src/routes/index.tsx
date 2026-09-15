import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import texture from "@/assets/wardogs-texture.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Install Wardogs Chat in StreamElements" },
      {
        name: "description",
        content: "Install the Wardogs Chat overlay directly into your StreamElements library.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: InstallHandoff,
});

const installUrl = import.meta.env.VITE_STREAMELEMENTS_INSTALL_URL?.trim();

function InstallHandoff() {
  useEffect(() => {
    if (!installUrl) return;

    const redirect = window.setTimeout(() => {
      window.location.replace(installUrl);
    }, 550);

    return () => window.clearTimeout(redirect);
  }, []);

  const configured = Boolean(installUrl);

  return (
    <main className="installer-shell">
      <img
        src={texture}
        alt=""
        aria-hidden="true"
        className="installer-texture"
        width={1920}
        height={1088}
      />
      <section className="installer-panel" aria-labelledby="installer-heading">
        <div className="installer-unit-line">
          <span>WD // K9</span>
          <span>{configured ? "TRANSFER ACTIVE" : "LOCAL PREVIEW"}</span>
        </div>

        <p className="installer-eyebrow">Wardogs Chat</p>
        <h1 id="installer-heading">
          {configured ? "Opening StreamElements" : "Install link required"}
        </h1>
        <p className="installer-copy">
          {configured
            ? "Stand by. Your secure StreamElements install is opening now."
            : "Add your StreamElements overlay share URL to enable the one-click customer install."}
        </p>

        <a
          className="installer-action"
          href={installUrl || "/widget/demo.html"}
          rel={configured ? "noreferrer" : undefined}
        >
          <span>{configured ? "Install in StreamElements" : "Open widget preview"}</span>
          <span aria-hidden="true">↗</span>
        </a>

        <p className="installer-note">
          {configured
            ? "You may be asked to sign in before the overlay is added to your library."
            : "Development mode · set VITE_STREAMELEMENTS_INSTALL_URL to the share link"}
        </p>
      </section>
    </main>
  );
}
