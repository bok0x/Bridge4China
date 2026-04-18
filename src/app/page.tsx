import { HeroPremium } from "@/components/home/HeroPremium";
import { Hero } from "@/components/home/Hero";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { HowItWorks } from "@/components/home/HowItWorks";
import { UniversityMarquee } from "@/components/home/UniversityMarquee";
import { UniversityGallery } from "@/components/home/UniversityGallery";
import { HomeFAQ } from "@/components/home/HomeFAQ";
import type { Metadata } from "next";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
};

export default function HomePage() {
  return (
    <>
      <HeroPremium />
      <Hero />
      <UniversityGallery />
      <UniversityMarquee />
      <HowItWorks />
      <FeatureGrid />
      <HomeFAQ />
    </>
  );
}
