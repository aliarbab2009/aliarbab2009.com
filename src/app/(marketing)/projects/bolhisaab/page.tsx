import type { Metadata } from "next";
import Link from "next/link";

import { getProjectBySlug } from "@/config/projects";
import { siteConfig } from "@/config/site";
import { OriginBlock } from "@/components/project/origin-block";
import { JsonLd } from "@/components/seo/json-ld";
import { projectJsonLd } from "@/lib/json-ld";
import { buildMetadata } from "@/lib/seo";

const project = getProjectBySlug("bolhisaab")!;

export const metadata: Metadata = buildMetadata({
  title: "BolHisaab — Voice-first Hindi ledger",
  description:
    "BolHisaab is a voice-first Hindi ledger for shopkeepers. Speak a transaction, watch the entry write itself. Whisper, Llama three, append-only Supabase.",
  path: "/projects/bolhisaab",
  ogImage: "/og/projects/bolhisaab.png",
  ogImageAlt: "BolHisaab — voice-first Hindi ledger for shopkeepers",
  ogType: "article",
  publishedTime: `${project.year}-10-15T00:00:00.000Z`,
  keywords: ["BolHisaab", "Voice", "Hindi", "Ledger", "Shopkeepers", "Whisper"],
});

export default function BolHisaabPage() {
  return (
    <div className="relative mx-auto w-full max-w-[1400px] px-6 pt-16 pb-16 sm:pt-20">
      <JsonLd data={projectJsonLd("bolhisaab")} />
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
          <p className="font-mono text-sm font-medium">02 / {project.name}</p>
        </div>
        <div className="col-span-6 flex flex-col gap-2 md:col-span-3">
          <p className="font-mono text-[10px] tracking-[0.3em] text-[var(--color-muted)] uppercase">
            Status
          </p>
          <p className="font-mono text-sm font-medium text-[var(--color-primary)]">
            ◐ {project.statusLabel}
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
          <blockquote
            className="mt-2 max-w-2xl border-l-4 border-[var(--color-primary)] pl-6 text-xl leading-snug text-[var(--color-fg)] italic"
            style={{ fontFamily: "var(--font-display)" }}
          >
            &ldquo;Ram ne 500 udhaar liya.&rdquo;
            <span className="mt-2 block text-sm text-[var(--color-muted)] not-italic">
              — and the ledger writes itself.
            </span>
          </blockquote>
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
                Production
              </p>
              <p className="mt-2 font-mono text-lg font-medium text-[var(--color-muted)]">
                bolhisaab.in — coming soon
              </p>
              <p className="mt-2 font-mono text-[10px] tracking-[0.2em] text-[var(--color-muted)] uppercase">
                Domain registered · deploy pending
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
                github.com/aliarbab2009/BolHisaab <span aria-hidden>↗</span>
              </Link>
              <p className="mt-2 font-mono text-[10px] tracking-[0.2em] text-[var(--color-muted)] uppercase">
                Next 16 · Supabase · Sarvam · Groq Llama 3.1 / 3.3
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
          <OriginBlock slug="bolhisaab" />
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
            Four sequential calls collapsed into one. ~500–800ms saved.
          </h2>
          <p className="max-w-prose text-base leading-relaxed text-[var(--color-fg)]">
            The hot path is a single endpoint,{" "}
            <code className="font-mono text-sm">POST /api/voice</code>. It collapses what used to be
            four sequential calls (
            <code className="font-mono text-sm">/transcribe → /parse → handleIntent → commit</code>)
            into one round trip — saving ~500–800ms end-to-end. The route accepts either a
            pre-computed transcript (from the browser&apos;s Web Speech API) or an audio blob (from
            MediaRecorder), then runs STT → Llama parse → party resolution → confidence-gated
            auto-commit in a single Vercel function.
          </p>
          <p className="max-w-prose text-base leading-relaxed text-[var(--color-fg)]">
            Speech-to-text is a three-tier auto-select decided at mount time:{" "}
            <strong className="font-medium">Sarvam Saarika v2</strong> when the API key is set
            (flagship Indian-language ASR, far stronger than generic Whisper on Hinglish + Indian
            numerals), <strong className="font-medium">browser Web Speech</strong> on Chrome
            (streaming, free, audio never leaves device — saves ~400ms vs an upload round trip),{" "}
            <strong className="font-medium">Groq Whisper-large-v3-turbo</strong> as the floor for
            non-Chrome browsers, with a Devanagari prompt that biases the decoder toward shopkeeper
            vocabulary. After STT, a <code className="font-mono text-sm">dedupeRepeats()</code>{" "}
            helper collapses Whisper&apos;s known double-utterance hallucination before the LLM sees
            the text.
          </p>
          <p className="max-w-prose text-base leading-relaxed text-[var(--color-fg)]">
            Intent parsing is two-tier.{" "}
            <strong className="font-medium">Llama 3.1 8B-instant</strong> is the primary at{" "}
            <code className="font-mono text-sm">temperature: 0</code>,{" "}
            <code className="font-mono text-sm">max_tokens: 400</code>,{" "}
            <code className="font-mono text-sm">{`response_format: { type: "json_object" }`}</code>{" "}
            — returns in ~200ms. <strong className="font-medium">Llama 3.3 70B-versatile</strong> is
            the fallback (~800ms), reached only when 8B JSON cannot be parsed even after a regex
            extraction pass. <code className="font-mono text-sm">gpt-oss-120b</code> was explicitly
            rejected as primary — it failed Groq&apos;s strict{" "}
            <code className="font-mono text-sm">json_object</code> validator ~80% of the time,
            doubling effective latency to ~1800ms once the fallback kicked in.{" "}
            <strong className="font-medium">Smaller + tolerant beat bigger + brittle.</strong>
          </p>
          <p className="max-w-prose text-base leading-relaxed text-[var(--color-fg)]">
            The parser sits behind a 200-entry in-memory LRU keyed by transcript + context hash;
            only complete intents are cached. Defense-in-depth against malformed LLM JSON runs in{" "}
            <strong className="font-medium">five layers</strong>: JSON mode at the API boundary, a
            regex extractor for stray prose, a hand-written{" "}
            <code className="font-mono text-sm">normalize()</code> that fills missing keys with{" "}
            <code className="font-mono text-sm">null</code> and coerces enums, Zod parse, and a 70B
            fallback retry. If everything still fails, the route returns a hard-coded{" "}
            <code className="font-mono text-sm">UNKNOWN</code> so the user always gets some spoken
            response.
          </p>
        </div>
      </section>
    </div>
  );
}
