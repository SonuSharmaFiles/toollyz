import type { ReactNode } from "react";
import type { Tool, ToolSEO } from "@/lib/tools/types";
import { ToolHeader } from "@/components/shared/tool-header";
import { FAQSection } from "@/components/shared/faq-section";
import { RelatedTools } from "@/components/shared/related-tools";
import { Sparkles, BookOpen, CheckCircle2 } from "lucide-react";

interface ToolLayoutProps {
  tool: Tool;
  seo?: ToolSEO;
  children: ReactNode;
}

export function ToolLayout({ tool, seo, children }: ToolLayoutProps) {

  return (
    <article className="container-page space-y-12 py-10 sm:py-14 lg:py-16">
      <ToolHeader tool={tool} />

      <section
        aria-label={`${tool.name} interface`}
        className="rounded-3xl border border-border/70 bg-card/50 p-6 backdrop-blur-sm sm:p-8"
      >
        {children}
      </section>

      {(seo?.what || seo?.how || seo?.benefits) && (
        <section className="space-y-10">
          {seo?.what && (
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 font-heading text-2xl font-semibold tracking-tight">
                <BookOpen className="size-5 text-primary" />
                What is the {tool.name}?
              </h2>
              <p className="text-pretty max-w-3xl text-base leading-relaxed text-muted-foreground">
                {seo.what}
              </p>
            </div>
          )}

          {seo?.how && seo.how.length > 0 && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 font-heading text-2xl font-semibold tracking-tight">
                <Sparkles className="size-5 text-primary" />
                How to use it
              </h2>
              <ol className="space-y-3">
                {seo.how.map((step, idx) => (
                  <li key={idx} className="flex gap-3 max-w-3xl">
                    <span
                      aria-hidden
                      className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
                    >
                      {idx + 1}
                    </span>
                    <span className="text-base leading-relaxed text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {seo?.benefits && seo.benefits.length > 0 && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 font-heading text-2xl font-semibold tracking-tight">
                <CheckCircle2 className="size-5 text-primary" />
                Benefits
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {seo.benefits.map((benefit, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-card p-4"
                  >
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-500 mt-0.5" />
                    <span className="text-sm leading-relaxed text-foreground/90">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {seo?.faqs && seo.faqs.length > 0 && <FAQSection faqs={seo.faqs} />}

      <RelatedTools slug={tool.slug} categoryId={tool.categoryId} />
    </article>
  );
}
