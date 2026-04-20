import Link from "next/link";

import { FeaturedProjects } from "@/components/home/featured-projects";
import { HomeHero } from "@/components/home/home-hero";
import { VariantSwitcher } from "@/components/styles/variant-switcher";

export default function HomePage() {
  return (
    <>
      <VariantSwitcher />
      <HomeHero />
      <FeaturedProjects />
      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <p className="max-w-2xl text-sm text-[var(--color-muted)]">
          This site is a work in progress &mdash; more detail across the project pages, a longer
          About, and a downloadable resume are shipping through Phase 0&ndash;4 of the build.{" "}
          <Link
            href="/styles"
            className="underline decoration-[var(--color-border)] underline-offset-4 transition-colors hover:decoration-[var(--color-primary)] hover:text-[var(--color-fg)]"
          >
            Compare aesthetic variants &rarr;
          </Link>
        </p>
      </section>
    </>
  );
}
