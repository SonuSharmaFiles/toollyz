import type { Metadata } from "next";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { Prose } from "@/components/shared/prose";
import { buildMetadata } from "@/lib/seo/metadata";
import { SITE } from "@/lib/seo/constants";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: `How ${SITE.name} handles your data — short version: most tools run entirely in your browser and we collect as little as possible.`,
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <div className="container-page space-y-10 py-10 sm:py-14">
      <header className="space-y-4">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Privacy Policy", href: "/privacy-policy" },
          ]}
        />
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Privacy Policy
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
          Your privacy matters. This policy explains what we collect, why, and how to
          control your data on {SITE.name}.
        </p>

        <h2>Data we don&apos;t collect</h2>
        <p>
          The majority of our tools run entirely in your browser. Inputs you paste,
          files you upload to client-side tools and outputs you generate never reach
          our servers.
        </p>

        <h2>Data we may collect</h2>
        <ul>
          <li>Basic analytics — page views and anonymous performance data.</li>
          <li>
            Voluntary submissions — when you email us, we use your message and address
            only to reply.
          </li>
        </ul>

        <h2>Cookies</h2>
        <p>
          We use minimal first-party cookies for things like your theme preference. We
          don&apos;t set third-party advertising cookies.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about your data? Email{" "}
          <a href="mailto:privacy@toollyz.com">privacy@toollyz.com</a>.
        </p>
      </Prose>
    </div>
  );
}
