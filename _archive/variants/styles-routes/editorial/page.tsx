import Link from "next/link";

import { PROJECTS } from "@/config/projects";

export default function EditorialVariantPage() {
  return (
    <main className="mx-auto w-full max-w-[1200px] px-6 pt-24 pb-16 sm:pt-28">
      {/* ============================================================
          HEADER — masthead bar + date line
          ============================================================ */}
      <header className="mb-20 flex items-baseline justify-between border-b border-[var(--color-border)] pb-4">
        <p className="font-mono text-[11px] tracking-[0.2em] uppercase">
          <span className="text-[var(--color-primary)]">&mdash; ali arbab</span>{" "}
          <span className="text-[var(--color-muted)]">&middot; essays, artifacts, & three
          projects</span>
        </p>
        <p className="font-mono text-[11px] tracking-[0.2em] text-[var(--color-muted)] uppercase">
          vol. I &middot; issue 01
        </p>
      </header>

      {/* ============================================================
          HERO — massive Instrument Serif display, drop cap lede
          ============================================================ */}
      <section className="grid gap-12 lg:grid-cols-[1fr_280px]">
        <div className="max-w-[720px]">
          <p className="mb-6 font-mono text-[11px] tracking-[0.3em] uppercase">
            <span style={{ color: "var(--color-primary)" }}>&#9632;</span>{" "}
            <span className="text-[var(--color-muted)]">Class XII &middot; 2026</span>
          </p>

          <h1
            style={{ fontFamily: "var(--font-display)" }}
            className="text-[clamp(3.5rem,9vw,7.5rem)] leading-[0.88] tracking-[-0.025em]"
          >
            <span className="block italic text-[var(--color-primary)]">Three</span>
            <span className="block">projects, three</span>
            <span className="block italic text-[var(--color-muted)]">worlds,</span>
            <span className="block">one student.</span>
          </h1>

          <p
            className="variant-editorial-dropcap mt-10 text-[1.15rem] leading-[1.7] text-[var(--color-fg)]/90"
            style={{ fontFamily: "var(--font-display)" }}
          >
            I build software for people who are usually left out of it. An AI coach teaching teens
            how markets actually behave. A voice-first ledger for shopkeepers whose fingers know
            the calculation better than any app. A dual-door smart lock running on two ESP32s and
            a lot of late nights. They don&apos;t share a stack or a domain &mdash; they share a
            question: who has been ignored, and what would it take to notice them?
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-5 text-sm">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 border-b border-[var(--color-primary)] pb-1 font-medium text-[var(--color-primary)] transition-opacity hover:opacity-70"
            >
              Read the projects
              <span aria-hidden>&rarr;</span>
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 border-b border-transparent pb-1 text-[var(--color-fg)]/70 transition-colors hover:border-[var(--color-fg)]/60 hover:text-[var(--color-fg)]"
            >
              About the author
            </Link>
            <Link
              href="/resume"
              className="inline-flex items-center gap-2 border-b border-transparent pb-1 text-[var(--color-fg)]/70 transition-colors hover:border-[var(--color-fg)]/60 hover:text-[var(--color-fg)]"
            >
              Download CV
            </Link>
          </div>
        </div>

        {/* Side-rail — marginalia notes + a small portrait placeholder */}
        <aside className="flex flex-col gap-8 border-l border-[var(--color-border)] pl-6 text-sm lg:pt-20">
          <div>
            <p
              className="mb-1 font-mono text-[10px] tracking-[0.25em] text-[var(--color-muted)] uppercase"
            >
              Editor&apos;s note
            </p>
            <p
              className="italic text-[var(--color-fg)]/80"
              style={{ fontFamily: "var(--font-display)" }}
            >
              &ldquo;The goal isn&apos;t to impress &mdash; it&apos;s to make something that
              actually works for the person on the other side of the screen.&rdquo;
            </p>
          </div>

          <div>
            <p
              className="mb-2 font-mono text-[10px] tracking-[0.25em] text-[var(--color-muted)] uppercase"
            >
              In this issue
            </p>
            <ol className="flex flex-col gap-2 text-[var(--color-fg)]/80">
              <li>
                <span className="font-mono text-xs text-[var(--color-muted)]">01</span>{" "}
                <Link
                  href="/projects/stocksaathi"
                  className="underline decoration-[var(--color-border)] underline-offset-4 transition-colors hover:decoration-[var(--color-primary)]"
                >
                  The teen who doesn&apos;t know a P/E ratio
                </Link>
              </li>
              <li>
                <span className="font-mono text-xs text-[var(--color-muted)]">02</span>{" "}
                <Link
                  href="/projects/bolhisaab"
                  className="underline decoration-[var(--color-border)] underline-offset-4 transition-colors hover:decoration-[var(--color-primary)]"
                >
                  The shopkeeper who doesn&apos;t type in English
                </Link>
              </li>
              <li>
                <span className="font-mono text-xs text-[var(--color-muted)]">03</span>{" "}
                <Link
                  href="/projects/maglock"
                  className="underline decoration-[var(--color-border)] underline-offset-4 transition-colors hover:decoration-[var(--color-primary)]"
                >
                  The building that doesn&apos;t trust the cloud
                </Link>
              </li>
            </ol>
          </div>

          <div>
            <p
              className="mb-2 font-mono text-[10px] tracking-[0.25em] text-[var(--color-muted)] uppercase"
            >
              Colophon
            </p>
            <p className="text-xs leading-relaxed text-[var(--color-muted)]">
              Set in Instrument Serif and Inter. Hand-coded in Next.js and Tailwind. No A/B tests,
              no tracking beyond vitals. The kind of website you&apos;d read on a Sunday.
            </p>
          </div>
        </aside>
      </section>

      {/* ============================================================
          FEATURE STORIES — numbered articles in the editorial grid
          ============================================================ */}
      <section className="mt-28">
        <div className="mb-12 flex items-baseline justify-between border-b border-[var(--color-border)] pb-4">
          <h2
            className="text-4xl tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Features
          </h2>
          <p className="font-mono text-[11px] tracking-[0.2em] text-[var(--color-muted)] uppercase">
            three projects, three write-ups
          </p>
        </div>

        <div className="flex flex-col gap-20">
          {PROJECTS.map((p, i) => (
            <article key={p.slug} className="grid gap-8 lg:grid-cols-[120px_1fr_280px]">
              <div className="hidden lg:block">
                <p
                  className="font-mono text-[64px] leading-none tracking-tight text-[var(--color-primary)]/80"
                  style={{ fontFeatureSettings: "'ss01'" }}
                >
                  0{i + 1}
                </p>
              </div>

              <div className="flex max-w-[640px] flex-col gap-4">
                <p className="font-mono text-[11px] tracking-[0.2em] text-[var(--color-muted)] uppercase lg:hidden">
                  feature 0{i + 1}
                </p>
                <h3
                  className="text-[clamp(2rem,4.5vw,3.5rem)] leading-[0.95] tracking-[-0.02em]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {p.name} &mdash;{" "}
                  <span className="italic text-[var(--color-fg)]/60">{p.tagline}.</span>
                </h3>
                <p
                  className="text-[1.05rem] leading-[1.7] text-[var(--color-fg)]/80"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {p.description}
                </p>
                <div className="mt-2">
                  <Link
                    href={`/projects/${p.slug}`}
                    className="inline-flex items-center gap-2 border-b border-[var(--color-primary)] pb-1 font-medium text-[var(--color-primary)] transition-opacity hover:opacity-70"
                  >
                    Read the full case study
                    <span aria-hidden>&rarr;</span>
                  </Link>
                </div>
              </div>

              <aside className="flex flex-col gap-4 border-l border-[var(--color-border)] pl-5 text-xs text-[var(--color-muted)]">
                <div>
                  <p className="mb-1 font-mono text-[10px] tracking-[0.25em] uppercase">status</p>
                  <p className="text-[var(--color-fg)]">{p.statusLabel}</p>
                </div>
                <div>
                  <p className="mb-1 font-mono text-[10px] tracking-[0.25em] uppercase">year</p>
                  <p className="text-[var(--color-fg)]">{p.year}</p>
                </div>
                <div>
                  <p className="mb-1 font-mono text-[10px] tracking-[0.25em] uppercase">
                    built with
                  </p>
                  <p className="leading-relaxed text-[var(--color-fg)]">{p.stack.join(" &middot; ")}</p>
                </div>
              </aside>
            </article>
          ))}
        </div>
      </section>

      {/* ============================================================
          CLOSING — signature block with drop-cap serif
          ============================================================ */}
      <footer className="mt-32 flex flex-col gap-4 border-t border-[var(--color-border)] pt-6">
        <p className="font-mono text-[11px] tracking-[0.2em] text-[var(--color-muted)] uppercase">
          end of issue
        </p>
        <p
          className="max-w-2xl text-lg leading-relaxed text-[var(--color-fg)]/80"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Thanks for reading. If any of it resonated &mdash; a project, a sentence, a turn of
          phrase &mdash; I&apos;d love to hear from you. The quickest way is{" "}
          <Link href="/contact" className="underline decoration-[var(--color-primary)] underline-offset-4">
            a note
          </Link>
          .
        </p>
        <p
          className="mt-4 text-sm italic text-[var(--color-fg)]/60"
          style={{ fontFamily: "var(--font-display)" }}
        >
          &mdash; Ali
        </p>
      </footer>
    </main>
  );
}
