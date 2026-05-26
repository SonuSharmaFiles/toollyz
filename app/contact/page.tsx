import type { Metadata } from "next";
import { Mail, MessageSquare, Sparkles } from "lucide-react";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { buildMetadata } from "@/lib/seo/metadata";
import { SITE } from "@/lib/seo/constants";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description: `Get in touch with the ${SITE.name} team. Suggest a tool, report a bug, or say hello.`,
  path: "/contact",
});

const channels = [
  {
    icon: Mail,
    title: "Email us",
    description: "For partnerships, press and general inquiries.",
    cta: "hello@toollyz.com",
    href: "mailto:hello@toollyz.com",
  },
  {
    icon: Sparkles,
    title: "Request a tool",
    description: "Got an idea for a utility we should build next?",
    cta: "Send a suggestion",
    href: "mailto:tools@toollyz.com?subject=Tool%20suggestion",
  },
  {
    icon: MessageSquare,
    title: "Report a bug",
    description: "Something not working as expected? Let us know.",
    cta: "bugs@toollyz.com",
    href: "mailto:bugs@toollyz.com",
  },
];

export default function ContactPage() {
  return (
    <div className="container-page space-y-10 py-10 sm:py-14">
      <header className="space-y-4">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact", href: "/contact" }]} />
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Get in touch
        </h1>
        <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
          We&apos;d love to hear from you. Pick the channel that fits — we read every
          message.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {channels.map(({ icon: Icon, title, description, cta, href }) => (
          <a
            key={title}
            href={href}
            className="group flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold tracking-tight">{title}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
            <span className="mt-auto text-sm font-medium text-primary group-hover:underline underline-offset-4">
              {cta} →
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
