import { Hero } from "@/components/home/hero";
import { CategoriesGrid } from "@/components/home/categories-grid";
import { TrustStrip } from "@/components/home/trust-strip";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <CategoriesGrid />
    </>
  );
}
