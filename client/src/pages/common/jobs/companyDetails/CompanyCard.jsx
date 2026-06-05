import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Share2,
  UsersRound,
} from "lucide-react";
import {
  useGetCompanyBlogsQuery,
  useGetCompanyByIdQuery,
  useGetCompanyJobsQuery,
} from "../../../../services/apiSlice";
import EmptyState from "../../../../components/feedback/EmptyState";
import { PageShell } from "../../../../components/layout/PageShell";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import { SkeletonBlock } from "../../../../components/ui/Loader";
import StatCard from "../../../../components/ui/StatCard";
import { formatDate, formatNumber, formatSalary, getInitial } from "../../../../utils/formatters";
import { getMediaUrl } from "../../../../utils/profileImage";

const tabIds = ["about", "jobs", "locations", "credibility"];

export default function CompanyAboutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { companyId } = useParams();
  const user = useSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState("about");

  const {
    data: company,
    isLoading: companyLoading,
    isError: companyIsError,
    error: companyError,
    refetch,
  } = useGetCompanyByIdQuery(companyId, { skip: !companyId });
  const { data: jobs = [], isLoading: jobsLoading } = useGetCompanyJobsQuery(companyId, { skip: !companyId });
  const { data: blogs = [] } = useGetCompanyBlogsQuery({ companyId, limit: 3 }, { skip: !companyId });

  const tabs = useMemo(
    () => tabIds.map((id) => ({ id, label: t(`company.tabs.${id}`) })),
    [t]
  );

  const companyName = company?.companyName || company?.name || t("app.name");
  const logo = getMediaUrl(company?.uploadLogo || company?.logo);
  const openJobs = Array.isArray(jobs) ? jobs : [];
  const branches = Array.isArray(company?.branches) ? company.branches : [];
  const specializations = Array.isArray(company?.specializations) ? company.specializations : [];
  const facilities = Array.isArray(company?.workshopFacilities) ? company.workshopFacilities : [];
  const certifications = Array.isArray(company?.certifications) ? company.certifications : [];

  const handlePrimaryAction = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setActiveTab("jobs");
  };

  const shareCompany = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: companyName, url });
        return;
      }
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        toast.success(t("company.linkCopied"));
      }
    } catch {
      toast.error(t("toast.error"));
    }
  };

  if (companyLoading) return <CompanyDetailsSkeleton />;

  if (companyIsError) {
    return (
      <PageShell>
        <EmptyState
          title={t("company.somethingWrong")}
          description={companyError?.data?.message || t("company.detailsLoadError")}
          actionLabel={t("common.tryAgain")}
          onAction={refetch}
        />
      </PageShell>
    );
  }

  if (!company) {
    return (
      <PageShell>
        <EmptyState
          icon={Building2}
          title={t("company.noCompanies")}
          description={t("company.emptyHint")}
          actionLabel={t("common.goHome")}
          onAction={() => navigate("/companies")}
        />
      </PageShell>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="border-b border-gray-200 bg-gray-950 text-white">
        <PageShell className="bg-transparent">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-300 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t("company.back")}
          </button>

          <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white text-3xl font-bold text-blue-700 shadow-lg">
                {logo ? <img src={logo} alt={companyName} className="h-full w-full object-cover" /> : getInitial(companyName)}
              </div>
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge variant="success">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {t("company.verifiedCompany")}
                  </Badge>
                  {company.industry && <Badge variant="primary">{company.industry}</Badge>}
                </div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{companyName}</h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-300">
                  {company.description || t("company.noDescription")}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
              <Button onClick={handlePrimaryAction} className="bg-white text-gray-950 hover:bg-gray-100">
                <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
                {t("company.viewJobs")}
              </Button>
              <Button variant="ghost" onClick={shareCompany} className="text-white hover:bg-white/10">
                <Share2 className="h-4 w-4" aria-hidden="true" />
                {t("company.share")}
              </Button>
            </div>
          </div>
        </PageShell>
      </section>

      <PageShell>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={BriefcaseBusiness} label={t("company.jobs")} value={formatNumber(openJobs.length)} />
              <StatCard icon={UsersRound} label={t("company.employees")} value={company.size || company.employeeCount || t("common.na")} />
              <StatCard icon={CalendarDays} label={t("company.established")} value={company.establishedYear || company.founded || t("common.na")} />
              <StatCard icon={Building2} label={t("company.companyType")} value={company.companyType || t("common.na")} />
            </div>

            <nav className="overflow-x-auto rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
              <div className="flex min-w-max gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={[
                      "rounded-md px-4 py-2 text-sm font-semibold transition",
                      activeTab === tab.id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-950",
                    ].join(" ")}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </nav>

            {activeTab === "about" && (
              <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-950">{t("company.aboutCompany")}</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-700">
                  {company.description || t("company.noDescription")}
                </p>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <InfoTile label={t("company.industry")} value={company.industry} />
                  <InfoTile label={t("company.memberSince")} value={formatDate(company.createdAt)} />
                  <InfoTile label={t("company.companySize")} value={company.size || company.employeeCount} />
                </div>
              </section>
            )}

            {activeTab === "jobs" && (
              <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-950">{t("company.openRoles")}</h2>
                    <p className="text-sm text-gray-600">{t("company.openRolesHint", { count: openJobs.length })}</p>
                  </div>
                  <Button variant="secondary" onClick={() => navigate(`/jobs?company=${encodeURIComponent(companyName)}`)}>
                    {t("company.viewAll")}
                  </Button>
                </div>

                {jobsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => <SkeletonBlock key={index} className="h-24" />)}
                  </div>
                ) : openJobs.length > 0 ? (
                  <div className="space-y-3">
                    {openJobs.map((job) => (
                      <JobListItem key={job._id || job.id} job={job} navigate={navigate} t={t} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={BriefcaseBusiness}
                    title={t("company.noOpenRoles")}
                    description={t("company.noOpenRolesHint")}
                    actionLabel={t("company.backToCompanies")}
                    onAction={() => navigate("/companies")}
                  />
                )}
              </section>
            )}

            {activeTab === "locations" && (
              <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-950">{t("company.locations")}</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {company.location && (
                    <InfoTile icon={MapPin} label={t("common.location")} value={company.location} />
                  )}
                  {branches.map((branch, index) => (
                    <InfoTile
                      key={`${branch.city}-${index}`}
                      icon={MapPin}
                      label={branch.city || t("common.location")}
                      value={[branch.address, branch.type].filter(Boolean).join(" - ")}
                    />
                  ))}
                </div>
                {!company.location && branches.length === 0 && (
                  <EmptyState title={t("company.noLocations")} description={t("company.noLocationsHint")} />
                )}
              </section>
            )}

            {activeTab === "credibility" && (
              <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <div className="grid gap-6 lg:grid-cols-3">
                  <TagGroup title={t("company.specializations")} items={specializations} emptyText={t("company.noSpecializations")} />
                  <TagGroup title={t("company.facilities")} items={facilities} emptyText={t("company.noFacilities")} />
                  <TagGroup title={t("company.certifications")} items={certifications} emptyText={t("company.noCertifications")} />
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-5">
            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-950">{t("company.connectWithUs")}</h2>
              <div className="mt-4 space-y-3 text-sm">
                <ContactRow icon={Mail} label={t("common.email")} value={company.contactEmail || company.email} href={company.contactEmail || company.email ? `mailto:${company.contactEmail || company.email}` : null} />
                <ContactRow icon={Phone} label={t("common.phone")} value={company.contactNumber || company.phone} href={company.contactNumber || company.phone ? `tel:${company.contactNumber || company.phone}` : null} />
                <ContactRow icon={Globe2} label={t("common.website")} value={company.website} href={company.website} external />
                <ContactRow icon={MapPin} label={t("common.location")} value={company.location} />
              </div>
            </section>

            {blogs.length > 0 && (
              <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-950">{t("company.latestBlogs")}</h2>
                <div className="mt-4 space-y-3">
                  {blogs.map((blog) => (
                    <Link
                      key={blog._id || blog.id}
                      to={`/blogs/${blog._id || blog.id}`}
                      className="block rounded-lg border border-gray-200 p-3 transition hover:border-blue-300 hover:bg-blue-50"
                    >
                      <p className="line-clamp-2 text-sm font-semibold text-gray-900">{blog.title}</p>
                      <p className="mt-1 text-xs text-gray-500">{formatDate(blog.createdAt, { day: "numeric", month: "short", year: "numeric" })}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </PageShell>
    </div>
  );
}

function CompanyDetailsSkeleton() {
  return (
    <PageShell>
      <div className="space-y-5">
        <SkeletonBlock className="h-52" />
        <div className="grid gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <SkeletonBlock key={index} className="h-28" />)}
        </div>
        <SkeletonBlock className="h-80" />
      </div>
    </PageShell>
  );
}

function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      {Icon && <Icon className="mb-3 h-5 w-5 text-blue-600" aria-hidden="true" />}
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900">{value || "N/A"}</p>
    </div>
  );
}

function TagGroup({ title, items, emptyText }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-950">{title}</h3>
      {items.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item) => <Badge key={item}>{item}</Badge>)}
        </div>
      ) : (
        <p className="mt-3 text-sm text-gray-500">{emptyText}</p>
      )}
    </div>
  );
}

function ContactRow({ icon: Icon, label, value, href, external }) {
  if (!value) return null;
  const content = (
    <>
      <Icon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate">{value}</span>
      {external && <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-gray-700 transition hover:border-blue-300 hover:bg-blue-50"
        title={label}
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-gray-700" title={label}>
      {content}
    </div>
  );
}

function JobListItem({ job, navigate, t }) {
  const jobId = job._id || job.id;
  return (
    <article className="rounded-lg border border-gray-200 p-4 transition hover:border-blue-300 hover:bg-blue-50">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-gray-950">{job.title || job.jobTitle || t("company.role")}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
            {job.jobLocation && <Badge>{job.jobLocation}</Badge>}
            {job.empType && <Badge variant="primary">{job.empType}</Badge>}
            {job.experience && <Badge variant="success">{job.experience}</Badge>}
            {job.salary && <Badge variant="warning">{formatSalary(job.salary)}</Badge>}
          </div>
        </div>
        <Button size="sm" onClick={() => navigate(`/jobs/${jobId}`)}>
          {t("company.viewDetails")}
        </Button>
      </div>
    </article>
  );
}
