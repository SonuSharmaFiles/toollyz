import Link from "next/link";
import { GithubIcon } from "@/components/shared/social-icons";
import { Logo } from "@/components/shared/logo";
import { FOOTER_LINKS, SITE } from "@/lib/seo/constants";
import { categories } from "@/lib/tools/categories";

// Only links we actually own. We previously linked out to twitter.com,
// github.com and linkedin.com root URLs — those went to brand
// homepages, not to any Toollyz profile, and crawlers (rightly) read
// them as broken/placeholder external signals. The GitHub link below
// points at the real source repository that powers this deployment.
const SOCIAL_LINKS = [
  {
    label: "GitHub",
    href: "https://github.com/SonuSharmaFiles/toollyz",
    Icon: GithubIcon,
  },
];

export function Footer() {
  const year = new Date().getFullYear();
  const isoYear = `${year}`;

  return (
    <footer
      aria-labelledby="footer-heading"
      className="border-t border-border/60 bg-card/40"
    >
      <h2 id="footer-heading" className="sr-only">
        Site footer
      </h2>
      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,_1fr)]">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {SITE.description}
            </p>
            <address className="not-italic">
              <ul
                aria-label="Social media"
                className="flex list-none items-center gap-1.5 p-0"
              >
                {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      aria-label={label}
                      rel="noopener noreferrer"
                      target="_blank"
                      className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Icon className="size-4" />
                    </a>
                  </li>
                ))}
              </ul>
            </address>
          </div>
          {FOOTER_LINKS.map((column) => (
            <nav
              key={column.title}
              aria-labelledby={`footer-${column.title.toLowerCase()}`}
              className="space-y-3"
            >
              <h3
                id={`footer-${column.title.toLowerCase()}`}
                className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {column.title}
              </h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          {/* Real category links — gives crawlers 8 more internal-link signals
              per page and lets users jump straight into each section. */}
          <nav
            aria-labelledby="footer-categories"
            className="space-y-3"
          >
            <h3
              id="footer-categories"
              className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Categories
            </h3>
            <ul className="space-y-2">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/category/${c.slug}`}
                    className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>
            © <time dateTime={isoYear}>{year}</time> {SITE.name}. All rights reserved.
          </p>
          <p>Built with care · No signup · Privacy-first · Free forever.</p>
        </div>
      </div>
    </footer>
  );
}
