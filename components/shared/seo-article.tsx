import type { CategoryArticle } from "@/lib/seo/category-content";

interface SeoArticleProps {
  article: CategoryArticle;
  /** Visible h2 that opens the long-form section. */
  title: string;
}

/**
 * Server-rendered long-form SEO copy that sits below a category's tool
 * grid and above the footer. Uses a strict h2 → h3 heading hierarchy so
 * it slots under the page's h1 without skipping levels (WCAG 1.3.1 /
 * 2.4.6). Pure prose + lists — no client JS.
 */
export function SeoArticle({ article, title }: SeoArticleProps) {
  return (
    <section
      aria-labelledby="seo-article-heading"
      className="space-y-8 border-t border-border/60 pt-10"
    >
      <div className="space-y-4">
        <h2
          id="seo-article-heading"
          className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          {title}
        </h2>
        {article.lead.map((para, idx) => (
          <p
            key={idx}
            className="max-w-3xl text-pretty text-base leading-relaxed text-muted-foreground"
          >
            {para}
          </p>
        ))}
      </div>

      {article.blocks.map((block, bIdx) => (
        <div key={bIdx} className="space-y-3">
          <h3 className="font-heading text-xl font-semibold tracking-tight">
            {block.heading}
          </h3>
          {block.paragraphs.map((para, pIdx) => (
            <p
              key={pIdx}
              className="max-w-3xl text-pretty text-base leading-relaxed text-muted-foreground"
            >
              {para}
            </p>
          ))}
          {block.bullets && (
            <ul className="max-w-3xl space-y-2 pt-1">
              {block.bullets.lead && (
                <p className="text-base leading-relaxed text-muted-foreground">
                  {block.bullets.lead}
                </p>
              )}
              {block.bullets.items.map((item, iIdx) => (
                <li
                  key={iIdx}
                  className="flex gap-2.5 text-base leading-relaxed text-muted-foreground"
                >
                  <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary/60" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      {article.faqs && article.faqs.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-heading text-xl font-semibold tracking-tight">
            Frequently asked questions
          </h3>
          <div className="divide-y divide-border rounded-2xl border border-border bg-card">
            {article.faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group p-5 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                  <h4 className="text-sm font-medium text-foreground">{faq.q}</h4>
                  <span
                    aria-hidden
                    className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-transform group-open:rotate-45"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="size-3">
                      <path
                        d="M12 5v14M5 12h14"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
