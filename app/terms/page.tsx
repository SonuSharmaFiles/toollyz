import type { Metadata } from "next";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { Prose } from "@/components/shared/prose";
import { buildMetadata } from "@/lib/seo/metadata";
import { SITE } from "@/lib/seo/constants";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service",
  description: `The terms that govern your use of ${SITE.name}.`,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="container-page space-y-10 py-10 sm:py-14">
      <header className="space-y-4">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Terms of Service", href: "/terms" },
          ]}
        />
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated:{" "}
          <time dateTime={`${new Date().getFullYear()}`}>
            {new Date().getFullYear()}
          </time>
        </p>
      </header>

      <Prose>
        <p>
          By using {SITE.name}, you agree to these terms. We&apos;ve kept them short
          and human.
        </p>

        <h2>Use of the service</h2>
        <p>
          Our tools are provided free of charge for personal and commercial use.
          Don&apos;t use them to break the law, infringe on someone else&apos;s rights,
          or attempt to harm the service.
        </p>

        <h2>No warranty</h2>
        <p>
          {SITE.name} is provided &quot;as-is&quot;. While we strive for reliability,
          we don&apos;t make any warranty about availability, accuracy or fitness for
          purpose. Don&apos;t rely on any single tool for mission-critical work without
          verification.
        </p>

        <h2>Intellectual property</h2>
        <p>
          The site, design, and original tool implementations are © {new Date().getFullYear()}{" "}
          {SITE.name}. Outputs you generate using our tools are yours.
        </p>

        <h2>Changes</h2>
        <p>
          We may update these terms occasionally. Material changes will be announced on
          this page.
        </p>
      </Prose>
    </div>
  );
}
