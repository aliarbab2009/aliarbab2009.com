import type { Metadata } from "next";
import Link from "next/link";

import { getProjectBySlug } from "@/config/projects";
import { siteConfig } from "@/config/site";
import { OriginBlock } from "@/components/project/origin-block";
import { JsonLd } from "@/components/seo/json-ld";
import { projectJsonLd } from "@/lib/json-ld";
import { buildMetadata } from "@/lib/seo";

const project = getProjectBySlug("maglock")!;

export const metadata: Metadata = buildMetadata({
  title: "MagLock Protocol — Cyberpunk IoT smart lock",
  description:
    "MagLock Protocol is a dual-door smart lock with live ESP32-CAM video and an optional Hinglish voice assistant. Flutter app, two ESP32s, no cloud servers.",
  path: "/projects/maglock",
  ogImage: "/og/projects/maglock.png",
  ogImageAlt: "MagLock Protocol — neon dual-door smart lock UI",
  ogType: "article",
  publishedTime: `${project.year}-11-20T00:00:00.000Z`,
  keywords: ["MagLock", "ESP32", "IoT", "Smart lock", "Flutter", "Voice assistant"],
});

export default function MagLockPage() {
  return (
    <div className="relative mx-auto w-full max-w-[1400px] px-6 pt-16 pb-16 sm:pt-20">
      <JsonLd data={projectJsonLd("maglock")} />
      <div className="brutalist-grid" aria-hidden />

      {/* MASTHEAD */}
      <header className="mb-16 grid grid-cols-12 gap-4 border-b-2 border-[var(--color-border)] pb-6">
        <div className="col-span-6 flex flex-col gap-2 md:col-span-3">
          <p className="font-mono text-[10px] tracking-[0.3em] text-[var(--color-muted)] uppercase">
            Author
          </p>
          <p className="font-mono text-sm font-medium">{siteConfig.author}</p>
        </div>
        <div className="col-span-6 flex flex-col gap-2 md:col-span-3">
          <p className="font-mono text-[10px] tracking-[0.3em] text-[var(--color-muted)] uppercase">
            Project
          </p>
          <p className="font-mono text-sm font-medium">03 / {project.name}</p>
        </div>
        <div className="col-span-6 flex flex-col gap-2 md:col-span-3">
          <p className="font-mono text-[10px] tracking-[0.3em] text-[var(--color-muted)] uppercase">
            Status
          </p>
          <p className="font-mono text-sm font-medium text-[var(--color-primary)]">
            ◆ {project.statusLabel}
          </p>
        </div>
        <div className="col-span-6 flex flex-col gap-2 md:col-span-3">
          <p className="font-mono text-[10px] tracking-[0.3em] text-[var(--color-muted)] uppercase">
            Navigate
          </p>
          <p className="font-mono text-sm font-medium">
            <Link href="/projects" className="hover:text-[var(--color-primary)]">
              ← projects
            </Link>
          </p>
        </div>
      </header>

      {/* § 01 — HEADLINE + PITCH */}
      <section className="mb-20 grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-2">
          <p className="font-mono text-[10px] tracking-[0.3em] text-[var(--color-muted)] uppercase">
            § 01
          </p>
          <p className="font-mono text-[10px] tracking-[0.3em] text-[var(--color-primary)] uppercase">
            Pitch
          </p>
        </div>
        <div className="col-span-12 flex flex-col gap-8 md:col-span-10">
          <h1
            className="text-[clamp(3rem,7vw,6rem)] leading-[0.9] font-medium tracking-[-0.02em] text-[var(--color-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {project.name}
          </h1>
          <p
            className="max-w-3xl text-2xl leading-snug font-medium text-[var(--color-fg)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {project.tagline}.
          </p>
          <p className="max-w-prose text-base leading-relaxed text-[var(--color-fg)]">
            {project.description}
          </p>
        </div>
      </section>

      {/* § 02 — ACCESS */}
      <section className="mb-20 grid grid-cols-12 gap-4 border-t-2 border-[var(--color-border)] pt-10">
        <div className="col-span-12 md:col-span-2">
          <p className="font-mono text-[10px] tracking-[0.3em] text-[var(--color-muted)] uppercase">
            § 02
          </p>
          <p className="font-mono text-[10px] tracking-[0.3em] text-[var(--color-primary)] uppercase">
            Access
          </p>
        </div>
        <div className="col-span-12 md:col-span-10">
          <ul className="grid grid-cols-1 gap-0 border-2 border-[var(--color-border)] md:grid-cols-2">
            <li className="border-b-2 border-[var(--color-border)] p-6 md:border-r-2 md:border-b-0">
              <p className="font-mono text-[10px] tracking-[0.25em] text-[var(--color-muted)] uppercase">
                Deployment
              </p>
              <p className="mt-2 font-mono text-lg font-medium text-[var(--color-muted)]">
                Hardware-dependent
              </p>
              <p className="mt-2 font-mono text-[10px] tracking-[0.2em] text-[var(--color-muted)] uppercase">
                Flutter + ESP32 · local-network only
              </p>
            </li>
            <li className="p-6">
              <p className="font-mono text-[10px] tracking-[0.25em] text-[var(--color-muted)] uppercase">
                Source
              </p>
              <Link
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-baseline gap-2 font-mono text-lg font-medium hover:text-[var(--color-primary)]"
              >
                github.com/aliarbab2009/MagLock-Protocol <span aria-hidden>↗</span>
              </Link>
              <p className="mt-2 font-mono text-[10px] tracking-[0.2em] text-[var(--color-muted)] uppercase">
                Flutter · Dart · ESP32 · Arduino C++
              </p>
            </li>
          </ul>
        </div>
      </section>

      {/* § 03 — STACK */}
      <section className="mb-20 grid grid-cols-12 gap-4 border-t-2 border-[var(--color-border)] pt-10">
        <div className="col-span-12 md:col-span-2">
          <p className="font-mono text-[10px] tracking-[0.3em] text-[var(--color-muted)] uppercase">
            § 03
          </p>
          <p className="font-mono text-[10px] tracking-[0.3em] text-[var(--color-primary)] uppercase">
            Stack
          </p>
        </div>
        <div className="col-span-12 md:col-span-10">
          <ul className="flex flex-wrap gap-0">
            {project.stack.map((tech) => (
              <li
                key={tech}
                className="-mr-px -mb-px border border-[var(--color-border)] px-4 py-2 font-mono text-[11px] tracking-[0.2em] uppercase"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* § 04 — ORIGIN (problem · why me · learned + pull-quote) */}
      <section className="mb-20 grid grid-cols-12 gap-4 border-t-2 border-[var(--color-border)] pt-10">
        <div className="col-span-12 md:col-span-2">
          <p className="font-mono text-[10px] tracking-[0.3em] text-[var(--color-muted)] uppercase">
            § 04
          </p>
          <p className="font-mono text-[10px] tracking-[0.3em] text-[var(--color-primary)] uppercase">
            Origin
          </p>
        </div>
        <div className="col-span-12 md:col-span-10">
          <OriginBlock slug="maglock" />
        </div>
      </section>

      {/* § 05 — ARCHITECTURE */}
      <section className="grid grid-cols-12 gap-4 border-t-2 border-[var(--color-border)] pt-10">
        <div className="col-span-12 md:col-span-2">
          <p className="font-mono text-[10px] tracking-[0.3em] text-[var(--color-muted)] uppercase">
            § 05
          </p>
          <p className="font-mono text-[10px] tracking-[0.3em] text-[var(--color-primary)] uppercase">
            Architecture
          </p>
        </div>
        <div className="col-span-12 flex flex-col gap-6 md:col-span-10">
          <h2
            className="text-[clamp(1.75rem,3vw,2.75rem)] leading-tight font-medium tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Three independent components on one closed network.
          </h2>
          <p className="max-w-prose text-base leading-relaxed text-[var(--color-fg)]">
            <strong className="font-medium">ESP32 lock controller</strong> — station-mode WiFi with
            a fixed IP (<code className="font-mono text-sm">192.168.4.100</code>), holding two
            relays and serving a tiny synchronous HTTP API on port 80. Routes:{" "}
            <code className="font-mono text-sm">GET /status</code>,{" "}
            <code className="font-mono text-sm">{`POST /lock?relay={1|2|all}`}</code>,{" "}
            <code className="font-mono text-sm">{`POST /unlock?relay={1|2|all}`}</code>,{" "}
            <code className="font-mono text-sm">POST /timer</code> (JSON body{" "}
            <code className="font-mono text-sm">{`{"seconds":N}`}</code>). Auto-lock duration
            persists in NVS under the namespace{" "}
            <code className="font-mono text-sm">&quot;nexus&quot;</code>. Door state is
            intentionally NOT persisted — a brown-out reboot mid-unlock comes back with both relays
            driven LOW (locked) before the radio is even started.
          </p>
          <p className="max-w-prose text-base leading-relaxed text-[var(--color-fg)]">
            <strong className="font-medium">ESP32-CAM (AI-Thinker)</strong> — a separate fixed-IP
            device (<code className="font-mono text-sm">192.168.4.101</code>) running its own HTTP
            server. <code className="font-mono text-sm">GET /stream</code> returns a{" "}
            <code className="font-mono text-sm">multipart/x-mixed-replace; boundary=frame</code>{" "}
            MJPEG at SVGA 800×600 ~25fps; <code className="font-mono text-sm">GET /capture</code>{" "}
            returns a single QXGA 2048×1536 JPEG at quality 1. Streaming runs in a FreeRTOS task
            pinned to core 1 (8KB stack), leaving core 0 free for the WebServer + WiFi stack.
          </p>
          <p className="max-w-prose text-base leading-relaxed text-[var(--color-fg)]">
            <strong className="font-medium">Flutter app</strong> — a single{" "}
            <code className="font-mono text-sm">LockProvider</code> (ChangeNotifier, ~280 lines) is
            the only orchestrator. Two services hang off it:{" "}
            <code className="font-mono text-sm">Esp32Service</code> (HTTP control plane, returns{" "}
            <code className="font-mono text-sm">{`ServiceResult<T>`}</code> instead of throwing) and{" "}
            <code className="font-mono text-sm">StorageService</code> (a thin{" "}
            <code className="font-mono text-sm">shared_preferences</code> wrapper). The MJPEG
            consumer lives directly in <code className="font-mono text-sm">CameraFeedWidget</code>,
            parsing JPEG SOI/EOI markers out of the raw byte stream.
          </p>
          <p className="max-w-prose text-base leading-relaxed text-[var(--color-fg)]">
            <strong className="font-medium">Transport.</strong> Plain HTTP. No TLS. No WebSocket. No
            MQTT. No bearer token, HMAC, or pre-shared key. CORS is permissive (
            <code className="font-mono text-sm">*</code>). This is a deliberate scope choice: the
            trust boundary is the AP itself — the device pair lives on a SoftAP-style subnet
            that&apos;s not bridged to the home WiFi or the internet, and the only client expected
            to talk to it is a phone the owner has paired by typing the IP into a settings screen.
            Adding HMAC-signed POSTs with a shared secret in NVS is the natural v2 step.
          </p>
        </div>
      </section>
    </div>
  );
}
