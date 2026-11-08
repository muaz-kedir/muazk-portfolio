/* eslint-disable no-console */
/**
 * Idempotent seed: creates the first admin (from env), profile, site settings,
 * the five named projects (upsert by slug), and default skills/services.
 *
 * Run with:  npm run db:seed
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, ProjectStatus } from "../src/generated/prisma/client.js";
import { hashPassword } from "../src/lib/auth/password.js";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  // ---- Admin ----
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@example.com").toLowerCase();
  const existingAdmin = await prisma.admin.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const pw = process.env.ADMIN_INITIAL_PASSWORD || randomPassword();
    await prisma.admin.create({
      data: {
        email: adminEmail,
        name: "Mukti",
        passwordHash: await hashPassword(pw),
      },
    });
    console.log(`Created admin: ${adminEmail}`);
    if (!process.env.ADMIN_INITIAL_PASSWORD) {
      console.log(`Generated admin password (set ADMIN_INITIAL_PASSWORD to avoid this): ${pw}`);
    }
  } else {
    console.log(`Admin already exists: ${adminEmail}`);
  }

  // ---- Profile ----
  if (!(await prisma.profile.findFirst())) {
    await prisma.profile.create({
      data: {
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
        publicEmail: "hello@example.com",
        githubUrl: "https://github.com/",
        linkedinUrl: "https://www.linkedin.com/",
        isAvailable: true,
        aboutVisible: true,
        cvVisible: false,
      },
    });
    console.log("Created profile");
  }

  // ---- Site settings ----
  if (!(await prisma.siteSettings.findFirst())) {
    await prisma.siteSettings.create({
      data: {
        siteTitle: "Mukti — Software Engineer",
        metaDescription:
          "Mukti is a software engineer and full-stack developer building web and mobile applications. Explore projects, skills, and ways to collaborate.",
        footerContent: "Mukti — Software Engineer. Built with Next.js.",
        contactEmail: "hello@example.com",
        themeAccent: "blue",
        cvVisible: false,
      },
    });
    console.log("Created site settings");
  }

  // ---- Projects (upsert by slug) ----
  const projects = [
    {
      title: "FoodGio",
      slug: "foodgio",
      category: "Food & Food-Service Application",
      shortDescription: "A food & food-service application. Details editable from the admin dashboard.",
      description:
        "FoodGio is a food and food-service application. The exact functionality is being finalized — replace this overview with a clear description of what the app actually does, who it serves, and the value it provides.",
      role: "Developer",
      technologies: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
      features: [
        "Core application flow (describe the implemented features here)",
        "Responsive interface",
        "Editable from the admin dashboard",
      ],
      status: ProjectStatus.PUBLISHED,
      isFeatured: true,
      displayOrder: 0,
    },
    {
      title: "IslamPro",
      slug: "islampro",
      category: "Islamic Application",
      shortDescription: "An Islamic application. Details editable from the admin dashboard.",
      description:
        "IslamPro is an Islamic application. Replace this overview with a factual description of the audience it serves and the features that are actually implemented.",
      role: "Developer",
      technologies: ["Flutter", "Dart", "Firebase"],
      features: [
        "Implemented features (list the real ones here)",
        "Mobile interface",
        "Editable from the admin dashboard",
      ],
      status: ProjectStatus.PUBLISHED,
      isFeatured: false,
      displayOrder: 1,
    },
    {
      title: "School Management System",
      slug: "school-management-system",
      category: "Education Technology",
      shortDescription: "A school management system. Details editable from the admin dashboard.",
      description:
        "A school management system intended to support school operations. Replace this overview with the modules that are actually implemented (for example student records, attendance, grades, or reporting) and the users they serve.",
      role: "Developer",
      technologies: ["React", "Node.js", "REST APIs", "PostgreSQL"],
      features: [
        "Modules (describe the implemented ones here)",
        "Role-based access",
        "Editable from the admin dashboard",
      ],
      status: ProjectStatus.PUBLISHED,
      isFeatured: false,
      displayOrder: 2,
    },
    {
      title: "FamilyGuard",
      slug: "familyguard",
      category: "Family Safety & Mobile Application",
      shortDescription:
        "A family-safety app helping parents manage children's digital wellbeing.",
      description:
        "FamilyGuard is a family-safety application designed to help parents manage children's digital wellbeing through parental controls, app permissions, screen-time management, and family-related features.",
      role: "Developer",
      technologies: ["Flutter", "Dart", "Firebase", "REST APIs"],
      features: [
        "Parent and child accounts",
        "App permissions",
        "Screen-time rules",
        "Family relationships",
        "Firebase integration",
      ],
      status: ProjectStatus.PUBLISHED,
      isFeatured: true,
      displayOrder: 3,
    },
    {
      title: "English Learning Platform",
      slug: "english-learning-platform",
      category: "Education Technology",
      shortDescription: "An English learning platform. Details editable from the admin dashboard.",
      description:
        "An English learning platform intended for self-directed learners. Replace this overview with the actual learners it targets, the lessons and activities that are implemented, and the technologies used.",
      role: "Developer",
      technologies: ["React", "Next.js", "TypeScript", "Firebase"],
      features: [
        "Learning features (list the implemented ones here)",
        "Editable from the admin dashboard",
      ],
      status: ProjectStatus.PUBLISHED,
      isFeatured: false,
      displayOrder: 4,
    },
  ];

  for (const p of projects) {
    await prisma.project.upsert({
      where: { slug: p.slug },
      create: {
        title: p.title,
        slug: p.slug,
        category: p.category,
        shortDescription: p.shortDescription,
        description: p.description,
        role: p.role,
        technologies: p.technologies,
        features: p.features,
        status: p.status,
        isFeatured: p.isFeatured,
        displayOrder: p.displayOrder,
        publishedAt: p.status === ProjectStatus.PUBLISHED ? new Date() : null,
      },
      update: {},
    });
  }
  console.log(`Seeded ${projects.length} projects`);

  // ---- Skills (draft by default; publish only the ones you know) ----
  if ((await prisma.skill.count()) === 0) {
    const skills = [
      { name: "HTML", category: "Frontend", icon: "Code2", displayOrder: 0 },
      { name: "CSS", category: "Frontend", icon: "Palette", displayOrder: 1 },
      { name: "JavaScript", category: "Frontend", icon: "Braces", displayOrder: 2 },
      { name: "React", category: "Frontend", icon: "Atom", displayOrder: 3 },
      { name: "Next.js", category: "Frontend", icon: "Triangle", displayOrder: 4 },
      { name: "TypeScript", category: "Frontend", icon: "FileCode", displayOrder: 5 },
      { name: "Tailwind CSS", category: "Frontend", icon: "Wind", displayOrder: 6 },
      { name: "Flutter", category: "Mobile", icon: "Smartphone", displayOrder: 10 },
      { name: "Dart", category: "Mobile", icon: "Smartphone", displayOrder: 11 },
      { name: "Node.js", category: "Backend", icon: "Server", displayOrder: 20 },
      { name: "REST APIs", category: "Backend", icon: "Network", displayOrder: 21 },
      { name: "Firebase", category: "Backend", icon: "Flame", displayOrder: 22 },
      { name: "PostgreSQL", category: "Database", icon: "Database", displayOrder: 30 },
      { name: "Prisma ORM", category: "Database", icon: "Database", displayOrder: 31 },
      { name: "Cloud Firestore", category: "Database", icon: "Cloud", displayOrder: 32 },
      { name: "Git", category: "Tools", icon: "GitBranch", displayOrder: 40 },
      { name: "GitHub", category: "Tools", icon: "Github", displayOrder: 41 },
      { name: "VS Code", category: "Tools", icon: "Code", displayOrder: 42 },
      { name: "Postman", category: "Tools", icon: "Send", displayOrder: 43 },
    ];
    for (const s of skills) {
      await prisma.skill.create({ data: { ...s, published: false } });
    }
    console.log(`Seeded ${skills.length} skills (all unpublished)`);
  }

  // ---- Services ----
  if ((await prisma.service.count()) === 0) {
    const services = [
      { title: "Website Development", icon: "Globe", displayOrder: 0, description: "Modern, responsive websites built with Next.js and Tailwind CSS." },
      { title: "Web Application Development", icon: "AppWindow", displayOrder: 1, description: "Full-stack web apps with typed APIs and a PostgreSQL data layer." },
      { title: "Flutter Mobile Development", icon: "Smartphone", displayOrder: 2, description: "Cross-platform mobile apps with Flutter and Firebase." },
      { title: "Firebase Integration", icon: "Flame", displayOrder: 3, description: "Auth, Firestore, storage, and messaging integration." },
      { title: "API & Database Integration", icon: "Network", displayOrder: 4, description: "REST API design and database integration with Prisma." },
      { title: "Landing Pages", icon: "LayoutTemplate", displayOrder: 5, description: "Fast, conversion-focused landing pages." },
    ];
    for (const s of services) {
      await prisma.service.create({ data: { ...s, published: true } });
    }
    console.log(`Seeded ${services.length} services`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

function randomPassword(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < 24; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}
