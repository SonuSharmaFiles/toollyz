import type { Metadata } from "next";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { Prose } from "@/components/shared/prose";
import { buildMetadata } from "@/lib/seo/metadata";
import { SITE } from "@/lib/seo/constants";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description: `Learn about ${SITE.name} — a privacy-first, beautifully crafted suite of online tools built for everyone.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="container-page space-y-10 py-10 sm:py-14">
      <header className="space-y-4">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "About", href: "/about" }]} />
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          About {SITE.name}
        </h1>
        <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
          A premium home for the tools you reach for every day — built with care,
          privacy and speed.
        </p>
      </header>

      <Prose>
        <h2>Our mission</h2>
        <p>
          The web is full of free tools — but most are slow, ad-ridden and treat your
          data as the product. {SITE.name} is different. We&apos;re building a single,
          beautifully crafted home for fast, private, no-nonsense utilities.
        </p>

        <h2>What we believe</h2>
        <ul>
          <li>
            <strong className="text-foreground">Privacy is the default.</strong>{" "}
            Wherever possible, tools run entirely in your browser.
          </li>
          <li>
            <strong className="text-foreground">Speed is a feature.</strong> We obsess
            over performance so you can ship faster.
          </li>
          <li>
            <strong className="text-foreground">Design matters.</strong> A tool you
            enjoy using is one you&apos;ll come back to.
          </li>
          <li>
            <strong className="text-foreground">Free, forever.</strong> No paywalls, no
            signups, no upsells.
          </li>
        </ul>

        <h2>What&apos;s next</h2>
        <p>
          We&apos;re building hundreds of tools across image, text, developer, SEO,
          converters and more. Have a tool you&apos;d love to see? Let us know on the{" "}
          <a href="/contact">contact page</a>.
        </p>
      </Prose>
    </div>
  );
}
