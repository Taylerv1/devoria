export const SITE_CONTENT_COLLECTION = "site_content";

export const SITE_CONTENT_DOCS = {
  home: "home",
  about: "about",
} as const;

export type SiteContentDocId =
  (typeof SITE_CONTENT_DOCS)[keyof typeof SITE_CONTENT_DOCS];

export const ABOUT_VALUE_ICON_OPTIONS = [
  "HiLightningBolt",
  "HiHeart",
  "HiEye",
  "HiShieldCheck",
  "HiGlobe",
  "HiCog",
] as const;

export type AboutValueIcon = (typeof ABOUT_VALUE_ICON_OPTIONS)[number];

export interface HomeStat {
  value: string;
  label: string;
}

export interface HomeHeroContent {
  badge: string;
  titleStart: string;
  titleHighlight: string;
  titleEnd: string;
  description: string;
  primaryButtonLabel: string;
  primaryButtonHref: string;
  secondaryButtonLabel: string;
  secondaryButtonHref: string;
}

export interface HomeSectionContent {
  eyebrow: string;
  title: string;
  description: string;
  buttonLabel: string;
  buttonHref: string;
}

export interface HomeCtaContent {
  title: string;
  description: string;
  buttonLabel: string;
  buttonHref: string;
}

export interface HomePageContent {
  hero: HomeHeroContent;
  stats: HomeStat[];
  services: HomeSectionContent;
  projects: HomeSectionContent;
  cta: HomeCtaContent;
}

export interface AboutValueItem {
  icon: AboutValueIcon;
  title: string;
  description: string;
}

export interface TeamMember {
  name: string;
  role: string;
  image: string;
}

export interface AboutPageContent {
  header: {
    title: string;
    description: string;
  };
  story: {
    title: string;
    body: string;
  };
  valuesTitle: string;
  values: AboutValueItem[];
  teamTitle: string;
  teamMembers: TeamMember[];
}

export const EMPTY_HOME_STAT: HomeStat = {
  value: "",
  label: "",
};

export const EMPTY_ABOUT_VALUE: AboutValueItem = {
  icon: ABOUT_VALUE_ICON_OPTIONS[0],
  title: "",
  description: "",
};

export const EMPTY_TEAM_MEMBER: TeamMember = {
  name: "",
  role: "",
  image: "",
};

export const DEFAULT_HOME_PAGE_CONTENT: HomePageContent = {
  hero: {
    badge: "We're building the future",
    titleStart: "We Build",
    titleHighlight: "Digital Products",
    titleEnd: "That Matter",
    description:
      "Devoria is a modern developer studio that turns bold ideas into exceptional software. From web apps to cloud infrastructure, we deliver end-to-end solutions.",
    primaryButtonLabel: "View Our Work",
    primaryButtonHref: "/projects",
    secondaryButtonLabel: "Start a Project",
    secondaryButtonHref: "/contact",
  },
  stats: [
    { value: "50+", label: "Projects Delivered" },
    { value: "30+", label: "Happy Clients" },
    { value: "5+", label: "Years Experience" },
    { value: "99%", label: "Client Satisfaction" },
  ],
  services: {
    eyebrow: "What We Do",
    title: "Services Built for Scale",
    description:
      "Focused service tracks for product strategy, platform delivery, and technical operations.",
    buttonLabel: "View All Services",
    buttonHref: "/services",
  },
  projects: {
    eyebrow: "Our Work",
    title: "Featured Projects",
    description:
      "Selected product work across dashboards, platforms, and digital experiences built for ambitious teams.",
    buttonLabel: "View All Projects",
    buttonHref: "/projects",
  },
  cta: {
    title: "Ready to Build Something Great?",
    description:
      "Let's collaborate and turn your vision into a product that users love. Reach out and start the conversation.",
    buttonLabel: "Get in Touch",
    buttonHref: "/contact",
  },
};

export const DEFAULT_ABOUT_PAGE_CONTENT: AboutPageContent = {
  header: {
    title: "About Devoria",
    description:
      "We're a team of engineers, designers, and strategists passionate about building exceptional digital products.",
  },
  story: {
    title: "Our Story",
    body:
      "Founded with a mission to bridge the gap between great ideas and outstanding software, Devoria has grown into a trusted partner for startups and enterprises alike.\n\nWe combine technical depth with creative design to deliver products that users love.",
  },
  valuesTitle: "Our Values",
  values: [
    {
      icon: "HiLightningBolt",
      title: "Innovation First",
      description:
        "We embrace cutting-edge technologies and forward-thinking approaches to solve complex problems.",
    },
    {
      icon: "HiHeart",
      title: "Craft & Quality",
      description:
        "Every line of code, every pixel, every interaction is thoughtfully crafted to deliver excellence.",
    },
    {
      icon: "HiEye",
      title: "Transparency",
      description:
        "Open communication, honest timelines, and clear processes. No surprises, just great results.",
    },
  ],
  teamTitle: "Meet the Team",
  teamMembers: [
    { name: "Mahmoud Shehadeh", role: "Full-Stack Developer", image: "" },
    { name: "Tarek Al-Dali", role: "Quality Assurance Engineer", image: "" },
    { name: "Hadi Diab", role: "Lead Designer", image: "" },
    { name: "Baraa Amouri", role: "DevOps Engineer", image: "" },
  ],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function cloneHomeStat(item: HomeStat): HomeStat {
  return { ...item };
}

function cloneAboutValue(item: AboutValueItem): AboutValueItem {
  return { ...item };
}

function cloneTeamMember(item: TeamMember): TeamMember {
  return { ...item };
}

function normalizeAboutIcon(
  value: unknown,
  fallback: AboutValueIcon
): AboutValueIcon {
  if (
    typeof value === "string" &&
    (ABOUT_VALUE_ICON_OPTIONS as readonly string[]).includes(value)
  ) {
    return value as AboutValueIcon;
  }

  return fallback;
}

function normalizeHomeStat(value: unknown, fallback: HomeStat): HomeStat {
  if (!isRecord(value)) {
    return cloneHomeStat(fallback);
  }

  return {
    value: readString(value.value, fallback.value),
    label: readString(value.label, fallback.label),
  };
}

function normalizeAboutValueItem(
  value: unknown,
  fallback: AboutValueItem
): AboutValueItem {
  if (!isRecord(value)) {
    return cloneAboutValue(fallback);
  }

  return {
    icon: normalizeAboutIcon(value.icon, fallback.icon),
    title: readString(value.title, fallback.title),
    description: readString(value.description, fallback.description),
  };
}

function normalizeTeamMember(value: unknown, fallback: TeamMember): TeamMember {
  if (!isRecord(value)) {
    return cloneTeamMember(fallback);
  }

  return {
    name: readString(value.name, fallback.name),
    role: readString(value.role, fallback.role),
    image: readString(value.image, fallback.image),
  };
}

export function createDefaultHomePageContent(): HomePageContent {
  return {
    hero: { ...DEFAULT_HOME_PAGE_CONTENT.hero },
    stats: DEFAULT_HOME_PAGE_CONTENT.stats.map(cloneHomeStat),
    services: { ...DEFAULT_HOME_PAGE_CONTENT.services },
    projects: { ...DEFAULT_HOME_PAGE_CONTENT.projects },
    cta: { ...DEFAULT_HOME_PAGE_CONTENT.cta },
  };
}

export function createDefaultAboutPageContent(): AboutPageContent {
  return {
    header: { ...DEFAULT_ABOUT_PAGE_CONTENT.header },
    story: { ...DEFAULT_ABOUT_PAGE_CONTENT.story },
    valuesTitle: DEFAULT_ABOUT_PAGE_CONTENT.valuesTitle,
    values: DEFAULT_ABOUT_PAGE_CONTENT.values.map(cloneAboutValue),
    teamTitle: DEFAULT_ABOUT_PAGE_CONTENT.teamTitle,
    teamMembers: DEFAULT_ABOUT_PAGE_CONTENT.teamMembers.map(cloneTeamMember),
  };
}

export function normalizeHomePageContent(value: unknown): HomePageContent {
  const defaults = createDefaultHomePageContent();
  const raw = isRecord(value) ? value : {};
  const hero = isRecord(raw.hero) ? raw.hero : {};
  const services = isRecord(raw.services) ? raw.services : {};
  const projects = isRecord(raw.projects) ? raw.projects : {};
  const cta = isRecord(raw.cta) ? raw.cta : {};
  const rawStats = Array.isArray(raw.stats) ? raw.stats : null;

  return {
    hero: {
      badge: readString(hero.badge, defaults.hero.badge),
      titleStart: readString(hero.titleStart, defaults.hero.titleStart),
      titleHighlight: readString(
        hero.titleHighlight,
        defaults.hero.titleHighlight
      ),
      titleEnd: readString(hero.titleEnd, defaults.hero.titleEnd),
      description: readString(hero.description, defaults.hero.description),
      primaryButtonLabel: readString(
        hero.primaryButtonLabel,
        defaults.hero.primaryButtonLabel
      ),
      primaryButtonHref: readString(
        hero.primaryButtonHref,
        defaults.hero.primaryButtonHref
      ),
      secondaryButtonLabel: readString(
        hero.secondaryButtonLabel,
        defaults.hero.secondaryButtonLabel
      ),
      secondaryButtonHref: readString(
        hero.secondaryButtonHref,
        defaults.hero.secondaryButtonHref
      ),
    },
    stats:
      rawStats === null
        ? defaults.stats
        : rawStats.map((item, index) =>
            normalizeHomeStat(item, defaults.stats[index] ?? EMPTY_HOME_STAT)
          ),
    services: {
      eyebrow: readString(services.eyebrow, defaults.services.eyebrow),
      title: readString(services.title, defaults.services.title),
      description: readString(
        services.description,
        defaults.services.description
      ),
      buttonLabel: readString(
        services.buttonLabel,
        defaults.services.buttonLabel
      ),
      buttonHref: readString(services.buttonHref, defaults.services.buttonHref),
    },
    projects: {
      eyebrow: readString(projects.eyebrow, defaults.projects.eyebrow),
      title: readString(projects.title, defaults.projects.title),
      description: readString(
        projects.description,
        defaults.projects.description
      ),
      buttonLabel: readString(
        projects.buttonLabel,
        defaults.projects.buttonLabel
      ),
      buttonHref: readString(projects.buttonHref, defaults.projects.buttonHref),
    },
    cta: {
      title: readString(cta.title, defaults.cta.title),
      description: readString(cta.description, defaults.cta.description),
      buttonLabel: readString(cta.buttonLabel, defaults.cta.buttonLabel),
      buttonHref: readString(cta.buttonHref, defaults.cta.buttonHref),
    },
  };
}

export function normalizeAboutPageContent(value: unknown): AboutPageContent {
  const defaults = createDefaultAboutPageContent();
  const raw = isRecord(value) ? value : {};
  const header = isRecord(raw.header) ? raw.header : {};
  const story = isRecord(raw.story) ? raw.story : {};
  const rawValues = Array.isArray(raw.values) ? raw.values : null;
  const rawTeamMembers = Array.isArray(raw.teamMembers) ? raw.teamMembers : null;

  return {
    header: {
      title: readString(header.title, defaults.header.title),
      description: readString(header.description, defaults.header.description),
    },
    story: {
      title: readString(story.title, defaults.story.title),
      body: readString(story.body, defaults.story.body),
    },
    valuesTitle: readString(raw.valuesTitle, defaults.valuesTitle),
    values:
      rawValues === null
        ? defaults.values
        : rawValues.map((item, index) =>
            normalizeAboutValueItem(
              item,
              defaults.values[index] ?? EMPTY_ABOUT_VALUE
            )
          ),
    teamTitle: readString(raw.teamTitle, defaults.teamTitle),
    teamMembers:
      rawTeamMembers === null
        ? defaults.teamMembers
        : rawTeamMembers.map((item, index) =>
            normalizeTeamMember(
              item,
              defaults.teamMembers[index] ?? EMPTY_TEAM_MEMBER
            )
          ),
  };
}
