import type { ToolFAQ } from "@/lib/tools/types";

interface FAQSectionProps {
  faqs: ToolFAQ[];
  title?: string;
}

export function FAQSection({ faqs, title = "Frequently asked questions" }: FAQSectionProps) {
  if (!faqs.length) return null;
  return (
    <section aria-labelledby="faq-heading" className="space-y-6">
      <h2 id="faq-heading" className="font-heading text-2xl font-semibold tracking-tight">
        {title}
      </h2>
      <div className="divide-y divide-border rounded-2xl border border-border bg-card">
        {faqs.map((faq, idx) => (
          <details key={idx} className="group p-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
              <h3 className="text-sm font-medium text-foreground">{faq.q}</h3>
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
    </section>
  );
}
