type AssistantProfile = {
  name?: string | null;
  title?: string | null;
  heroDescription?: string | null;
  bio?: string | null;
  interests?: string | null;
  approach?: string | null;
  learningGoals?: string | null;
  ambitions?: string | null;
  education?: string | null;
  publicEmail?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  isAvailable?: boolean;
  aboutVisible?: boolean;
};

type AssistantProject = {
  title: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  category?: string | null;
  role?: string | null;
  technologies: string[];
  features: string[];
  githubUrl?: string | null;
  liveUrl?: string | null;
};

type AssistantSkill = {
  name: string;
  category: string;
  url?: string | null;
};

type AssistantExperience = {
  kind: string;
  title: string;
  organization?: string | null;
  description?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  current: boolean;
  url?: string | null;
};

type AssistantService = {
  title: string;
  description?: string | null;
  url?: string | null;
};

export type PortfolioAssistantData = {
  profile: AssistantProfile;
  projects: AssistantProject[];
  skills: AssistantSkill[];
  experience: AssistantExperience[];
  services: AssistantService[];
  contactEmail?: string | null;
};

type PortfolioAssistantContext = {
  profile: {
    name?: string;
    title?: string;
    introduction?: string;
    interests?: string;
    engineeringApproach?: string;
    learningGoals?: string;
    ambitions?: string;
    educationSummary?: string;
    openToWork?: boolean;
    contactEmail?: string;
    github?: string;
    linkedIn?: string;
  };
  projects: Array<{
    title?: string;
    purpose?: string;
    category?: string;
    role?: string;
    technologies: string[];
    features: Array<string | undefined>;
    portfolioPage: string;
    source?: string;
    liveDemo?: string;
  }>;
  publishedSkills: Array<{ name?: string; category?: string; details?: string }>;
  publishedExperienceEducationAndCertificates: Array<{
    kind: string;
    title?: string;
    organization?: string;
    description?: string;
    startYear?: number;
    endYear?: number | "Present";
    details?: string;
  }>;
  publishedServices: Array<{
    title?: string;
    description?: string;
    details?: string;
  }>;
};

function cleanText(value: string | null | undefined, maxLength = 1000) {
  const cleaned = value?.trim().slice(0, maxLength);
  return cleaned || undefined;
}

function safeUrl(value: string | null | undefined) {
  const input = cleanText(value, 500);
  if (!input) return undefined;

  try {
    const url = new URL(input);
    if (
      (url.protocol !== "https:" && url.protocol !== "http:") ||
      url.username ||
      url.password
    ) {
      return undefined;
    }

    if (
      url.pathname === "/" &&
      !url.search &&
      !url.hash &&
      (url.hostname === "github.com" || url.hostname === "linkedin.com")
    ) {
      return undefined;
    }

    return url.toString();
  } catch {
    return undefined;
  }
}

function safeEmail(value: string | null | undefined) {
  const email = cleanText(value, 254);
  if (
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.toLowerCase().endsWith("@example.com")
  ) {
    return undefined;
  }
  return email;
}

function year(date: Date | null | undefined) {
  return date instanceof Date && Number.isFinite(date.getTime())
    ? date.getFullYear()
    : undefined;
}

export function getPortfolioQuickAnswer(
  question: string,
  data: PortfolioAssistantData
): string {
  const query = question.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ");
  const context = JSON.parse(
    buildPortfolioAssistantContext(data)
  ) as PortfolioAssistantContext;
  const { profile, projects, publishedSkills, publishedExperienceEducationAndCertificates: experience, publishedServices } = context;
  const answerLabel = "Based on the published portfolio:";

  if (
    /\b(who|introduce|background|bio|biography|yourself|interest|interests|goal|goals|ambition|approach|focus)\b/.test(query)
  ) {
    const details = [
      [profile.name, profile.title].filter(Boolean).join(" — "),
      profile.introduction,
      profile.educationSummary,
      profile.interests,
      profile.engineeringApproach,
      profile.learningGoals,
      profile.ambitions,
    ].filter((detail): detail is string => Boolean(detail));

    return details.length > 0
      ? `${answerLabel}\n${details.join("\n\n")}\n\nMore: /#about`
      : `${answerLabel} About details are not published. See the [portfolio](/) or [contact page](/contact).`;
  }

  if (/\b(skill|technology|technologies|tech|stack|programming|language|backend|frontend|strength|strongest|area)\b/.test(query)) {
    const skills = publishedSkills
      .map((skill) =>
        skill.name
          ? `${skill.name}${skill.category ? ` (${skill.category})` : ""}`
          : undefined
      )
      .filter((name): name is string => Boolean(name));
    const focus = profile.title ? `\nPortfolio title: ${profile.title}.` : "";
    return skills.length > 0
      ? `${answerLabel} ${skills.join(", ")}.${focus}\n\nThe portfolio does not rank skills by strength. More: /#skills`
      : `${answerLabel} no skills are currently published. More: /#skills`;
  }

  if (/\b(project|projects|portfolio|built|build|made|create|created|feature|features|demo|repository)\b/.test(query)) {
    const matchingProjects = projects.filter((project) =>
      project.title && query.includes(project.title.toLowerCase())
    );
    const relevantProjects = matchingProjects.length > 0 ? matchingProjects : projects;
    return relevantProjects.length > 0
      ? `${answerLabel}\n${relevantProjects
          .map((project) => {
            const details = [
              project.purpose,
              project.role && `Role: ${project.role}`,
              project.category && `Category: ${project.category}`,
              project.technologies.length > 0 && `Technologies: ${project.technologies.join(", ")}`,
              project.features.length > 0 && `Features: ${project.features.filter(Boolean).join(", ")}`,
              project.source && `GitHub: ${project.source}`,
              project.liveDemo && `Live demo: ${project.liveDemo}`,
            ].filter((detail): detail is string => typeof detail === "string");
            return `• ${project.title ?? "Project"}: ${details.join(". ")}. [Project page](${project.portfolioPage})`;
          })
          .join("\n")}`
      : `${answerLabel} no projects are currently published. See [projects](/projects).`;
  }

  if (/\b(education|study|studies|university|certificate|certificates|certification|certifications|experience|career)\b/.test(query)) {
    const entries = experience.map((item) => {
      const organization = item.organization ? ` — ${item.organization}` : "";
      const dates = item.startYear
        ? ` (${item.startYear}${item.endYear ? `–${item.endYear}` : ""})`
        : "";
      const description = item.description ? `: ${item.description}` : "";
      const details = item.details ? ` ${item.details}` : "";
      return `• ${item.title ?? item.kind}${organization}${dates}${description}${details}`;
    });

    if (profile.educationSummary) entries.unshift(profile.educationSummary);
    return entries.length > 0
      ? `${answerLabel}\n${entries.join("\n")}\n\nMore: /#experience`
      : `${answerLabel} education and experience details are not published.`;
  }

  if (/\b(contact|email|reach|github|linkedin|linked in|social)\b/.test(query)) {
    const links = [
      profile.contactEmail && `Email: ${profile.contactEmail}`,
      profile.github && `GitHub: ${profile.github}`,
      profile.linkedIn && `LinkedIn: ${profile.linkedIn}`,
      "Portfolio contact page: /contact",
    ].filter((link): link is string => Boolean(link));
    return `${answerLabel}\n${links.join("\n")}`;
  }

  if (/\b(available|availability|hire|hiring|job|work|open to work)\b/.test(query)) {
    return profile.openToWork === undefined
      ? `${answerLabel} availability is not specified. See [contact](/contact).`
      : profile.openToWork
        ? `${answerLabel} Mukti is listed as available for work. See [contact](/contact).`
        : `${answerLabel} Mukti is not currently listed as available for work. See [contact](/contact).`;
  }

  if (/\b(service|services|hire|freelance|offer|offers)\b/.test(query)) {
    return publishedServices.length > 0
      ? `${answerLabel}\n${publishedServices
          .map((service) =>
            [
              service.title,
              service.description,
              service.details && `More: ${service.details}`,
            ]
              .filter(Boolean)
              .join(": ")
          )
          .join("\n")}\n\nContact: /contact`
      : `${answerLabel} no services are currently listed. You can still [contact Mukti](/contact).`;
  }

  const terms = [...new Set(
    query
      .split(/\s+/)
      .filter((term) => term.length > 2 && !COMMON_QUERY_WORDS.has(term))
  )];
  const knowledge = [
    profile.introduction
      ? { text: profile.introduction, link: "/#about" }
      : undefined,
    profile.educationSummary
      ? { text: profile.educationSummary, link: "/#experience" }
      : undefined,
    profile.interests ? { text: profile.interests, link: "/#about" } : undefined,
    profile.engineeringApproach
      ? { text: profile.engineeringApproach, link: "/#about" }
      : undefined,
    profile.learningGoals
      ? { text: profile.learningGoals, link: "/#about" }
      : undefined,
    profile.ambitions ? { text: profile.ambitions, link: "/#about" } : undefined,
    ...publishedSkills.map((skill) => ({
      text: [skill.name, skill.category].filter(Boolean).join(" "),
      link: "/#skills",
    })),
    ...projects.map((project) => ({
      text: [
        project.title,
        project.purpose,
        project.category,
        project.role,
        ...project.technologies,
        ...project.features,
      ]
        .filter(Boolean)
        .join(" "),
      link: project.portfolioPage,
    })),
    ...experience.map((item) => ({
      text: [item.title, item.organization, item.description, item.kind]
        .filter(Boolean)
        .join(" "),
      link: "/#experience",
    })),
    ...publishedServices.map((service) => ({
      text: [service.title, service.description].filter(Boolean).join(" "),
      link: "/contact",
    })),
  ].filter((item): item is { text: string; link: string } => Boolean(item?.text));

  const matches = knowledge
    .map((item) => ({
      ...item,
      score: terms.reduce(
        (score, term) => score + (item.text.toLowerCase().includes(term) ? 1 : 0),
        0
      ),
    }))
    .filter((item) => item.score > 0 && item.score / terms.length >= 0.6)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);

  if (matches.length > 0) {
    return `${answerLabel} I found these related details:\n${matches
      .map((item) => `• ${item.text} [More](${item.link})`)
      .join("\n")}`;
  }

  const overview = [
    profile.name && profile.title && `${profile.name} — ${profile.title}.`,
    profile.introduction,
    publishedSkills.length > 0 &&
      `Published skills: ${publishedSkills.map((skill) => skill.name).filter(Boolean).join(", ")}.`,
    projects.length > 0 &&
      `Projects: ${projects.map((project) => project.title).filter(Boolean).join(", ")}.`,
  ].filter((detail): detail is string => typeof detail === "string");

  return `That specific detail is not listed in Mukti's portfolio. ${overview.join(" ")}\n\nExplore [skills](/#skills), [projects](/projects), [experience](/#experience), or [contact](/contact).`;
}

const COMMON_QUERY_WORDS = new Set([
  "about", "and", "are", "can", "could", "does", "for", "from", "his",
  "how", "is", "mukti", "muktar", "of", "please", "tell", "that", "the",
  "their", "them", "there", "this", "what", "when", "where", "which",
  "who", "why", "with", "would", "built", "build", "made", "create",
  "created", "using", "uses", "favorite", "food",
]);

export function buildPortfolioAssistantContext(data: PortfolioAssistantData) {
  const aboutVisible = data.profile.aboutVisible !== false;
  const profile = {
    name: cleanText(data.profile.name, 120),
    title: cleanText(data.profile.title, 180),
    introduction: aboutVisible
      ? cleanText(data.profile.bio, 1600) ??
        cleanText(data.profile.heroDescription, 1600)
      : undefined,
    interests: aboutVisible ? cleanText(data.profile.interests, 1000) : undefined,
    engineeringApproach: aboutVisible
      ? cleanText(data.profile.approach, 1000)
      : undefined,
    learningGoals: aboutVisible
      ? cleanText(data.profile.learningGoals, 1000)
      : undefined,
    ambitions: aboutVisible ? cleanText(data.profile.ambitions, 1000) : undefined,
    educationSummary: aboutVisible
      ? cleanText(data.profile.education, 1200)
      : undefined,
    openToWork: data.profile.isAvailable,
    contactEmail: safeEmail(data.contactEmail) ?? safeEmail(data.profile.publicEmail),
    github: safeUrl(data.profile.githubUrl),
    linkedIn: safeUrl(data.profile.linkedinUrl),
  };

  const projects = data.projects.slice(0, 20).map((project) => ({
    title: cleanText(project.title, 160),
    purpose: cleanText(project.shortDescription ?? project.description, 1200),
    category: cleanText(project.category, 100),
    role: cleanText(project.role, 200),
    technologies: project.technologies.slice(0, 24),
    features: project.features.slice(0, 16).map((feature) => cleanText(feature, 240)),
    portfolioPage: `/projects/${encodeURIComponent(project.slug)}`,
    source: safeUrl(project.githubUrl),
    liveDemo: safeUrl(project.liveUrl),
  }));

  const skills = data.skills.slice(0, 100).map((skill) => ({
    name: cleanText(skill.name, 120),
    category: cleanText(skill.category, 100),
    details: safeUrl(skill.url),
  }));

  const experience = data.experience.slice(0, 40).map((item) => ({
    kind: item.kind,
    title: cleanText(item.title, 180),
    organization: cleanText(item.organization, 180),
    description: cleanText(item.description, 1200),
    startYear: year(item.startDate),
    endYear: item.current ? "Present" : year(item.endDate),
    details: safeUrl(item.url),
  }));

  const services = data.services.slice(0, 20).map((service) => ({
    title: cleanText(service.title, 160),
    description: cleanText(service.description, 1000),
    details: safeUrl(service.url),
  }));

  return JSON.stringify(
    {
      profile,
      portfolioSections: {
        ...(aboutVisible ? { about: "/#about" } : {}),
        skills: "/#skills",
        projects: "/projects",
        ...(data.experience.length > 0
          ? { experienceAndEducation: "/#experience" }
          : {}),
        contact: "/contact",
      },
      projects,
      publishedSkills: skills,
      publishedExperienceEducationAndCertificates: experience,
      publishedServices: services,
    },
    null,
    2
  );
}
