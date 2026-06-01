import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you were looking for doesn't exist. Browse all 207 tools or head home.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="container-page flex flex-1 items-center justify-center py-24">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">404</p>
        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          We couldn&apos;t find that page.
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          The link may be outdated, or the tool may have moved. Try browsing all tools.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button render={<Link href="/tools" />}>
            <ArrowLeft className="size-4" />
            Browse tools
          </Button>
          <Button variant="outline" render={<Link href="/" />}>
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
