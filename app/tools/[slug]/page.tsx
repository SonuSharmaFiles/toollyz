import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ToolLayout } from "@/components/shared/tool-layout";
import { ComingSoon } from "@/components/shared/coming-soon";
import { JsonLd, softwareApplicationSchema, faqSchema, breadcrumbSchema } from "@/lib/seo/json-ld";
import { getToolBySlug, tools } from "@/lib/tools/registry";
import { getToolComponent } from "@/lib/tools/components";
import { getCategoryById } from "@/lib/tools/categories";
import { toolMetadata } from "@/lib/seo/metadata";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  return toolMetadata(tool);
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const category = getCategoryById(tool.categoryId);
  const ToolComponent = getToolComponent(tool.slug);

  const schemas: object[] = [
    softwareApplicationSchema(tool),
    breadcrumbSchema([
      { name: "Home", href: "/" },
      { name: "Tools", href: "/tools" },
      ...(category ? [{ name: category.name, href: `/category/${category.slug}` }] : []),
      { name: tool.name, href: `/tools/${tool.slug}` },
    ]),
  ];
  if (tool.seo?.faqs?.length) schemas.push(faqSchema(tool.seo.faqs));

  return (
    <>
      <JsonLd data={schemas} />
      <ToolLayout tool={tool}>
        {ToolComponent ? <ToolComponent /> : <ComingSoon tool={tool} />}
      </ToolLayout>
    </>
  );
}
