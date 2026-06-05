import {
  Award,
  Bot,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Cpu,
  FileText,
  Gem,
  GraduationCap,
  LineChart,
  MessagesSquare,
  Newspaper,
  Sparkles,
  TrendingUp,
  UsersRound,
  Wifi,
} from "lucide-react";

export const fallbackCoverImage =
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&h=900&fit=crop";

export const blogCategoryMeta = [
  {
    key: "technology",
    nameKey: "categories.technology",
    fallbackName: "Technology",
    descriptionKey: "categoryDescriptions.technology",
    fallbackDescription: "Tools, platforms, and digital skills shaping modern hiring.",
    icon: Cpu,
    className: "bg-blue-50 text-blue-700 border-blue-100",
    accentClass: "from-blue-500 to-cyan-500",
  },
  {
    key: "career-tips",
    nameKey: "categories.careerTips",
    fallbackName: "Career Tips",
    descriptionKey: "categoryDescriptions.careerTips",
    fallbackDescription: "Practical guidance for growing a placement-ready career.",
    icon: BriefcaseBusiness,
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
    accentClass: "from-emerald-500 to-teal-500",
  },
  {
    key: "interview-preparation",
    nameKey: "categories.interviewPreparation",
    fallbackName: "Interview Preparation",
    descriptionKey: "categoryDescriptions.interviewPreparation",
    fallbackDescription: "Interview frameworks, questions, and confidence builders.",
    icon: MessagesSquare,
    className: "bg-violet-50 text-violet-700 border-violet-100",
    accentClass: "from-violet-500 to-fuchsia-500",
  },
  {
    key: "resume-tips",
    nameKey: "categories.resumeTips",
    fallbackName: "Resume Tips",
    descriptionKey: "categoryDescriptions.resumeTips",
    fallbackDescription: "Resume, portfolio, and profile improvements recruiters notice.",
    icon: FileText,
    className: "bg-amber-50 text-amber-700 border-amber-100",
    accentClass: "from-amber-500 to-orange-500",
  },
  {
    key: "industry-news",
    nameKey: "categories.industryNews",
    fallbackName: "Industry News",
    descriptionKey: "categoryDescriptions.industryNews",
    fallbackDescription: "Market updates and career news across hiring sectors.",
    icon: Newspaper,
    className: "bg-rose-50 text-rose-700 border-rose-100",
    accentClass: "from-rose-500 to-red-500",
  },
  {
    key: "jewelry-industry",
    nameKey: "categories.jewelryIndustry",
    fallbackName: "Jewelry Industry",
    descriptionKey: "categoryDescriptions.jewelryIndustry",
    fallbackDescription: "Specialized insights for jewelry, gems, retail, and design careers.",
    icon: Gem,
    className: "bg-cyan-50 text-cyan-700 border-cyan-100",
    accentClass: "from-cyan-500 to-blue-500",
  },
  {
    key: "hiring-trends",
    nameKey: "categories.hiringTrends",
    fallbackName: "Hiring Trends",
    descriptionKey: "categoryDescriptions.hiringTrends",
    fallbackDescription: "What recruiters are looking for and how hiring is changing.",
    icon: TrendingUp,
    className: "bg-indigo-50 text-indigo-700 border-indigo-100",
    accentClass: "from-indigo-500 to-blue-500",
  },
  {
    key: "freelancing",
    nameKey: "categories.freelancing",
    fallbackName: "Freelancing",
    descriptionKey: "categoryDescriptions.freelancing",
    fallbackDescription: "Independent work, clients, contracts, and portfolio growth.",
    icon: Sparkles,
    className: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100",
    accentClass: "from-fuchsia-500 to-pink-500",
  },
  {
    key: "remote-jobs",
    nameKey: "categories.remoteJobs",
    fallbackName: "Remote Jobs",
    descriptionKey: "categoryDescriptions.remoteJobs",
    fallbackDescription: "Remote hiring, async work, and distributed team advice.",
    icon: Wifi,
    className: "bg-sky-50 text-sky-700 border-sky-100",
    accentClass: "from-sky-500 to-cyan-500",
  },
  {
    key: "ai-tech",
    nameKey: "categories.aiTech",
    fallbackName: "AI & Tech",
    descriptionKey: "categoryDescriptions.aiTech",
    fallbackDescription: "AI skills, automation, and job-search technology.",
    icon: Bot,
    className: "bg-slate-100 text-slate-700 border-slate-200",
    accentClass: "from-slate-700 to-blue-500",
  },
  {
    key: "skill-development",
    nameKey: "categories.skillDevelopment",
    fallbackName: "Skill Development",
    descriptionKey: "categoryDescriptions.skillDevelopment",
    fallbackDescription: "Learning paths, certifications, and upskilling strategies.",
    icon: GraduationCap,
    className: "bg-teal-50 text-teal-700 border-teal-100",
    accentClass: "from-teal-500 to-emerald-500",
  },
  {
    key: "event",
    nameKey: "categories.events",
    fallbackName: "Events",
    descriptionKey: "categoryDescriptions.events",
    fallbackDescription: "Hiring events, webinars, workshops, and meetups.",
    icon: CalendarDays,
    className: "bg-blue-50 text-blue-700 border-blue-100",
    accentClass: "from-blue-500 to-indigo-500",
  },
  {
    key: "achievement",
    nameKey: "categories.achievements",
    fallbackName: "Achievements",
    descriptionKey: "categoryDescriptions.achievements",
    fallbackDescription: "Milestones, awards, and success stories.",
    icon: Award,
    className: "bg-amber-50 text-amber-700 border-amber-100",
    accentClass: "from-amber-500 to-yellow-500",
  },
  {
    key: "growth",
    nameKey: "categories.growth",
    fallbackName: "Growth",
    descriptionKey: "categoryDescriptions.growth",
    fallbackDescription: "Company expansion, team growth, and new opportunities.",
    icon: LineChart,
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
    accentClass: "from-emerald-500 to-lime-500",
  },
  {
    key: "culture",
    nameKey: "categories.culture",
    fallbackName: "Culture",
    descriptionKey: "categoryDescriptions.culture",
    fallbackDescription: "Workplace culture, teams, and people stories.",
    icon: UsersRound,
    className: "bg-violet-50 text-violet-700 border-violet-100",
    accentClass: "from-violet-500 to-indigo-500",
  },
  {
    key: "news",
    nameKey: "categories.companyNews",
    fallbackName: "Company News",
    descriptionKey: "categoryDescriptions.companyNews",
    fallbackDescription: "Announcements, company updates, and placement stories.",
    icon: Building2,
    className: "bg-pink-50 text-pink-700 border-pink-100",
    accentClass: "from-pink-500 to-rose-500",
  },
];

export const sortOptions = [
  { value: "latest", labelKey: "sort.latest", fallback: "Latest" },
  { value: "trending", labelKey: "sort.trending", fallback: "Trending" },
  { value: "most-viewed", labelKey: "sort.mostViewed", fallback: "Most viewed" },
  { value: "most-liked", labelKey: "sort.mostLiked", fallback: "Most liked" },
];

export const getBlogCategory = (categoryKey, t) => {
  const meta =
    blogCategoryMeta.find((category) => category.key === categoryKey) ||
    blogCategoryMeta.find((category) => category.key === "career-tips");

  return {
    ...meta,
    label: t ? t(meta.nameKey, { defaultValue: meta.fallbackName }) : meta.fallbackName,
    description: t
      ? t(meta.descriptionKey, { defaultValue: meta.fallbackDescription })
      : meta.fallbackDescription,
  };
};

export const getCoverImage = (blog) =>
  blog?.coverImage?.url || blog?.image || fallbackCoverImage;

export const getAuthorName = (blog) =>
  blog?.authorId?.username || blog?.author?.username || blog?.companyId?.companyName || "Jobs Placements";

export const getAuthorAvatar = (blog) =>
  blog?.authorId?.profileImage?.url ||
  blog?.authorId?.profilePicture ||
  blog?.companyId?.uploadLogo ||
  "";

export const getBlogPath = (blog) => `/blog/${blog?.slug || blog?._id}`;

export const formatCount = (value = 0) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return `${value || 0}`;
};

export const stripMarkdown = (value = "") =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[[^\]]+\]\([^)]+\)/g, " ")
    .replace(/[`*_>#|[\]()~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const estimateReadingTime = (content = "") => {
  const words = stripMarkdown(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};
