import {
  BriefcaseBusiness,
  CalendarClock,
  ClipboardList,
  CreditCard,
  FileChartColumnIncreasing,
  FileUser,
  Heart,
  LayoutDashboard,
  MessageSquare,
  Newspaper,
  Settings,
  SquarePen,
  UserRoundSearch,
  UsersRound,
} from "lucide-react";

export const getDashboardHome = (role) => {
  if (role === "admin") return "/admin";
  if (role === "recruiter") return "/recruiter/dashboard";
  return "/candidate/home";
};

const translate = (t, key, fallback) => (typeof t === "function" ? t(key, { defaultValue: fallback }) : fallback);

export const getRoleLabel = (role, t) => {
  if (role === "admin") return translate(t, "roles.adminPanel", "Admin Panel");
  if (role === "recruiter") return translate(t, "roles.recruiterPanel", "Recruiter Panel");
  return translate(t, "roles.candidatePanel", "Candidate Panel");
};

export const getProfilePath = (role) => {
  if (role === "admin") return "/admin/profile";
  if (role === "recruiter") return "/recruiter/profile";
  return "/candidate/profile";
};

export const getSettingsPath = (role) => {
  if (role === "admin") return "/admin/settings";
  if (role === "recruiter") return "/recruiter/settings";
  return "/candidate/settings";
};

export const getDashboardNavigation = ({ role, company, t }) => {
  if (role === "admin") {
    return [
      { label: translate(t, "admin:dashboard", "Dashboard"), href: "/admin", icon: LayoutDashboard, end: true },
      {
        label: translate(t, "admin:manageCandidates", "Manage Candidates"),
        href: "/admin/users?role=candidate",
        icon: UserRoundSearch,
        search: "role=candidate",
      },
      {
        label: translate(t, "admin:manageRecruiters", "Manage Recruiters"),
        href: "/admin/users?role=recruiter",
        icon: UsersRound,
        search: "role=recruiter",
      },
      { label: translate(t, "admin:manageJobs", "Manage Jobs"), href: "/admin/jobs", icon: BriefcaseBusiness },
      { label: translate(t, "admin:blogs", "Blogs"), href: "/admin/blogs", icon: Newspaper },
      { label: translate(t, "admin:applications", "Applications"), href: "/admin/applications", icon: ClipboardList },
      { label: translate(t, "admin:subscriptions", "Subscriptions"), href: "/admin/subscriptions", icon: CreditCard },
      { label: translate(t, "admin:reports", "Reports"), href: "/admin/reports", icon: FileChartColumnIncreasing },
      { label: translate(t, "admin:settings", "Settings"), href: "/admin/settings", icon: Settings },
    ];
  }

  if (role === "recruiter") {
    return [
      { label: translate(t, "recruiter:dashboard", "Dashboard"), href: "/recruiter/dashboard", icon: LayoutDashboard },
      {
        label: translate(t, "recruiter:companyProfile", "Company Profile"),
        href: company?._id ? `/recruiter/company/${company._id}` : "/recruiter/company/registration",
        icon: FileUser,
      },
      { label: translate(t, "recruiter:postJob", "Post Job"), href: "/recruiter/jobpost", icon: SquarePen },
      { label: translate(t, "recruiter:manageJobs", "Manage Jobs"), href: "/recruiter/postedjobs", icon: BriefcaseBusiness },
      { label: translate(t, "recruiter:subscription", "Subscription"), href: "/recruiter/subscription", icon: CreditCard },
      { label: translate(t, "recruiter:applicants", "Applicants"), href: "/recruiter/candidates-list", icon: UsersRound },
      { label: translate(t, "recruiter:interviews", "Interviews"), href: "/recruiter/interview-scheduler", icon: CalendarClock },
      { label: translate(t, "recruiter:blogs", "Blogs"), href: "/recruiter/blogs", icon: Newspaper },
      { label: translate(t, "recruiter:messages", "Messages"), href: "/recruiter/chat", icon: MessageSquare },
      { label: translate(t, "recruiter:settings", "Settings"), href: "/recruiter/settings", icon: Settings },
    ];
  }

  return [
    { label: translate(t, "candidate:dashboard", "Dashboard"), href: "/candidate/home", icon: LayoutDashboard },
    { label: translate(t, "candidate:recommendedJobs", "Recommended Jobs"), href: "/candidate/jobs", icon: BriefcaseBusiness },
    { label: translate(t, "candidate:appliedJobs", "Applied Jobs"), href: "/candidate/applications", icon: ClipboardList },
    { label: translate(t, "candidate:savedJobs", "Saved Jobs"), href: "/candidate/saved-jobs", icon: Heart },
    { label: translate(t, "candidate:profile", "Resume/Profile"), href: "/candidate/profile", icon: FileUser },
    { label: translate(t, "candidate:messages", "Messages"), href: "/candidate/chat", icon: MessageSquare },
    { label: translate(t, "candidate:settings", "Settings"), href: "/candidate/settings", icon: Settings },
  ];
};
