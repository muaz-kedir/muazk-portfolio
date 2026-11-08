import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getProfile,
  getFeaturedProjects,
  getPublishedSkills,
  getPublishedExperience,
  getPublishedServices,
  getStatistics,
} from "@/lib/queries";
import { connection } from "next/server";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Skills } from "@/components/sections/skills";
import { FeaturedProjects } from "@/components/sections/featured-projects";
import { ExperienceSection } from "@/components/sections/experience";
import { Services } from "@/components/sections/services";
import { Statistics } from "@/components/sections/statistics";
import { ContactCTA } from "@/components/sections/contact-cta";
import { HomeGraphicBackground } from "@/components/ui/home-graphic-background";

async function HomeContent() {
  await connection();
  const [profile, projects, skills, experience, services, stats] = await Promise.all([
    getProfile(),
    getFeaturedProjects(),
    getPublishedSkills(),
    getPublishedExperience(),
    getPublishedServices(),
    getStatistics(),
  ]);

  return (
    <div className="relative">
      {/* ── Best-in-class Graphic Design Background System ── */}
      <HomeGraphicBackground />

      <Hero profile={profile} />
      <About profile={profile} />
      <Statistics stats={stats} />
      <Skills skills={skills} />
      <FeaturedProjects projects={projects} />
      <ExperienceSection items={experience} />
      <Services services={services} />
      <ContactCTA />
    </div>
  );
}

function HeroFallback() {
  return (
    <Container size="wide" className="py-20 sm:py-28">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-7">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-14 w-3/4" />
          <Skeleton className="h-14 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-12 w-44 rounded-full" />
            <Skeleton className="h-12 w-44 rounded-full" />
          </div>
        </div>
        <div className="lg:col-span-5">
          <Skeleton className="aspect-square w-full max-w-sm rounded-3xl" />
        </div>
      </div>
    </Container>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HeroFallback />}>
      <HomeContent />
    </Suspense>
  );
}