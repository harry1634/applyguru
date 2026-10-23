import { Navbar }         from "@/components/layout/navbar";
import { Footer }         from "@/components/layout/footer";
import { Hero }           from "@/components/home/hero";
import { Categories }     from "@/components/home/categories";
import { TrustedBy }      from "@/components/home/trusted-by";
import { HowItWorks }     from "@/components/home/how-it-works";
import { FeaturedEvents } from "@/components/home/featured-events";
import { Testimonials }   from "@/components/home/testimonials";
import { CTA }            from "@/components/home/cta";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col">
        <Hero />
        <Categories />
        <TrustedBy />
        <HowItWorks />
        <FeaturedEvents />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
