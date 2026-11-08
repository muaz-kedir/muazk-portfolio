import { describe, expect, it } from "vitest";
import {
  buildPortfolioAssistantContext,
  getPortfolioQuickAnswer,
  type PortfolioAssistantData,
} from "@/lib/portfolio-assistant";

describe("portfolio assistant context", () => {
  const portfolio: PortfolioAssistantData = {
    profile: {
      name: "Muktar Abdulkader",
      title: "Software Engineer",
      bio: "A software engineering student and developer.",
      publicEmail: "mukti@example.com",
      githubUrl: "https://github.com/",
    },
    projects: [
      {
        title: "FoodieGo",
        slug: "foodiego",
        shortDescription: "A food delivery application.",
        technologies: ["React", "PostgreSQL"],
        features: ["Order tracking"],
        githubUrl: "https://github.com/mukti/foodiego",
        liveUrl: "javascript:alert(1)",
      },
    ],
    skills: [{ name: "React", category: "Frontend" }],
    experience: [
      {
        kind: "CERTIFICATION",
        title: "Web Development Certificate",
        organization: "Example Institute",
        startDate: new Date("2024-01-01T00:00:00.000Z"),
        endDate: null,
        current: false,
        url: "https://certificates.example.org/mukti",
      },
    ],
    services: [],
    contactEmail: "hello@mukti.dev",
  };

  it("uses published portfolio facts and creates links to the matching sections", () => {
    const context = JSON.parse(
      buildPortfolioAssistantContext(portfolio)
    ) as Record<string, unknown> & {
      profile: Record<string, unknown>;
      portfolioSections: Record<string, string>;
      projects: Array<Record<string, unknown>>;
      publishedExperienceEducationAndCertificates: Array<Record<string, unknown>>;
    };

    expect(context.profile.name).toBe("Muktar Abdulkader");
    expect(context.profile.contactEmail).toBe("hello@mukti.dev");
    expect(context.profile.github).toBeUndefined();
    expect(context.portfolioSections.contact).toBe("/contact");
    expect(context.projects[0]).toMatchObject({
      title: "FoodieGo",
      portfolioPage: "/projects/foodiego",
      source: "https://github.com/mukti/foodiego",
    });
    expect(context.projects[0].liveDemo).toBeUndefined();
    expect(context.publishedExperienceEducationAndCertificates[0]).toMatchObject({
      kind: "CERTIFICATION",
      startYear: 2024,
      details: "https://certificates.example.org/mukti",
    });
  });

  it("omits placeholder email addresses and falls back to the profile introduction", () => {
    const context = JSON.parse(
      buildPortfolioAssistantContext({
        ...portfolio,
        profile: {
          ...portfolio.profile,
          bio: "",
          heroDescription: "Portfolio introduction.",
          publicEmail: "hello@example.com",
        },
        contactEmail: null,
      })) as { profile: Record<string, unknown> };

    expect(context.profile.introduction).toBe("Portfolio introduction.");
    expect(context.profile.contactEmail).toBeUndefined();
  });

  it("does not expose about-only profile details when that section is hidden", () => {
    const context = JSON.parse(
      buildPortfolioAssistantContext({
        ...portfolio,
        profile: { ...portfolio.profile, aboutVisible: false },
      })
    ) as {
      profile: Record<string, unknown>;
      portfolioSections: Record<string, unknown>;
    };

    expect(context.profile.introduction).toBeUndefined();
    expect(context.portfolioSections.about).toBeUndefined();
  });

  it("answers common portfolio questions instantly from published data", () => {
    expect(getPortfolioQuickAnswer("Who is Mukti?", portfolio)).toContain(
      "Muktar Abdulkader"
    );
    expect(getPortfolioQuickAnswer("What technologies does he use?", portfolio)).toContain(
      "React"
    );
    expect(getPortfolioQuickAnswer("Tell me about his projects.", portfolio)).toContain(
      "/projects/foodiego"
    );
    expect(getPortfolioQuickAnswer("How can I contact him?", portfolio)).toContain(
      "hello@mukti.dev"
    );
    expect(getPortfolioQuickAnswer("What is his favorite food?", portfolio)).toContain(
      "That specific detail is not listed"
    );
  });

  it("does not include hidden About information in instant answers", () => {
    const answer = getPortfolioQuickAnswer("Who is Mukti?", {
      ...portfolio,
      profile: { ...portfolio.profile, aboutVisible: false },
    });

    expect(answer).toContain("Muktar Abdulkader");
    expect(answer).not.toContain("A software engineering student and developer.");
  });
});
