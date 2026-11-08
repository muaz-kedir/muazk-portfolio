/**
 * Sensible defaults used when the database has no Profile/Settings row yet
 * (e.g. before the seed script runs). These mirror the schema defaults so the
 * public site always renders; real content comes from the DB once seeded.
 */

export const defaultProfile = {
  id: "default",
  name: "Mukti",
  title: "Software Engineer | Full-Stack Developer",
  eyebrow: "SOFTWARE ENGINEER & DEVELOPER",
  heroHeadline: "Building Digital Products That Solve Real Problems.",
  heroDescription:
    "I develop thoughtful web and mobile applications by combining clean engineering, practical architecture, and user-centered design.",
  bio: "I'm Mukti, a software engineer and student passionate about building practical digital products that solve real-world problems. I enjoy developing web and mobile applications, designing reliable application architectures, and creating intuitive user experiences.",
  interests:
    "Web development, mobile development, application architecture, and developer experience.",
  approach:
    "I favor simple, well-typed architectures, clear boundaries, and shipping small reliable increments over clever but fragile code.",
  learningGoals: "Deepening distributed systems, security, and product design.",
  ambitions:
    "Secure software engineering roles and internships, and build a credible professional portfolio.",
  education: "",
  publicEmail: "hello@example.com",
  githubUrl: "https://github.com/",
  linkedinUrl: "https://www.linkedin.com/",
  otherLinks: null as unknown,
  isAvailable: true,
  aboutVisible: true,
  profileImageId: null,
  cvFileId: null,
  cvVisible: false,
  profileImage: null,
  cvFile: null,
  updatedAt: new Date(0),
} as const;

export const defaultSettings = {
  id: "default",
  siteTitle: "Mukti — Software Engineer",
  metaDescription:
    "Mukti is a software engineer and full-stack developer building web and mobile applications. Explore projects, skills, and ways to collaborate.",
  favicon: "/favicon.ico",
  footerContent: "© Mukti. Built with Next.js.",
  socialLinks: null as unknown,
  contactEmail: "hello@example.com",
  themeAccent: "blue",
  cvVisible: false,
  socialImageId: null,
  socialImage: null,
  updatedAt: new Date(0),
} as const;
