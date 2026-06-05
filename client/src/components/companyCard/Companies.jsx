import { memo, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  HiBriefcase,
  HiGlobe,
  HiLocationMarker,
  HiMail,
  HiOutlineStar,
  HiSearch,
  HiStar,
  HiUsers,
} from "react-icons/hi";
import { VscOrganization } from "react-icons/vsc";
import { useGetCompaniesQuery } from "../../services/apiSlice";
import { useDebounce } from "../../hooks/useDebounce";
import Button from "../ui/Button";
import { SkeletonBlock } from "../ui/Loader";
import { useTranslation } from "react-i18next";
import EmptyStatePanel from "../feedback/EmptyState";
import { PageHeader, PageShell } from "../layout/PageShell";
import Pagination from "../ui/Pagination";
import { getMediaUrl } from "../../utils/profileImage";

const sortOptions = [
  { labelKey: "company.sortOptions.newest", value: "createdAt" },
  { labelKey: "company.sortOptions.name", value: "companyName" },
  { labelKey: "company.sortOptions.industry", value: "industry" },
  { labelKey: "company.sortOptions.established", value: "establishedYear" },
];

export default function Companies() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [industry, setIndustry] = useState(searchParams.get("industry") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "createdAt");
  const [followedCompanies, setFollowedCompanies] = useState([]);
  const debouncedSearch = useDebounce(search, 350);

  const queryArgs = useMemo(
    () => ({ page, limit: 9, search: debouncedSearch, industry, sort }),
    [page, debouncedSearch, industry, sort]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useGetCompaniesQuery(queryArgs);
  const companies = data?.companies ?? [];
  const pagination = data?.pagination ?? { page: 1, pages: 1, total: 0 };

  const industries = useMemo(() => {
    const options = companies.map((company) => company.industry).filter(Boolean);
    return [...new Set(options)].sort();
  }, [companies]);

  const updateSearch = (event) => {
    const value = event.target.value;
    setSearch(value);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      value ? next.set("search", value) : next.delete("search");
      return next;
    });
    setPage(1);
  };

  const updateIndustry = (event) => {
    const value = event.target.value;
    setIndustry(value);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      value ? next.set("industry", value) : next.delete("industry");
      return next;
    });
    setPage(1);
  };

  const updateSort = (event) => {
    const value = event.target.value;
    setSort(value);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      value !== "createdAt" ? next.set("sort", value) : next.delete("sort");
      return next;
    });
    setPage(1);
  };

  const toggleFollow = (companyId, event) => {
    event.stopPropagation();
    setFollowedCompanies((current) =>
      current.includes(companyId)
        ? current.filter((id) => id !== companyId)
        : [...current, companyId]
    );
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <PageShell>
        <PageHeader
          title={t("company.topCompanies")}
          description={t("company.discover")}
          actions={(
            <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 shadow-sm">
            {isFetching
              ? t("common.updatingResults")
              : t("company.companiesFound", { count: pagination.total ?? companies.length })}
            </div>
          )}
        />

        <section className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
            <label className="relative block">
              <span className="sr-only">{t("company.searchPlaceholder")}</span>
              <HiSearch className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={updateSearch}
                placeholder={t("company.searchPlaceholder")}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <select
              value={industry}
              onChange={updateIndustry}
              className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">{t("company.allIndustries")}</option>
              {industries.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={updateSort}
              className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {t("company.sort", { label: t(option.labelKey) })}
                </option>
              ))}
            </select>
          </div>
        </section>

        {isLoading && <CompanySkeletonLoader />}

        {isError && (
          <ErrorState
            message={error?.data?.message || t("company.loadError")}
            onRetry={refetch}
          />
        )}

        {!isLoading && !isError && companies.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {companies.map((company) => (
                <CompanyCard
                  key={company._id}
                  company={company}
                  isFollowed={followedCompanies.includes(company._id)}
                  onFollow={toggleFollow}
                  onClick={() => navigate(`/company/${company._id}`)}
                  t={t}
                />
              ))}
            </div>

            <Pagination
              page={pagination.page ?? page}
              pages={pagination.pages ?? 1}
              disabled={isFetching}
              onPageChange={setPage}
            />
          </>
        )}

        {!isLoading && !isError && companies.length === 0 && (
          <EmptyStatePanel
            icon={VscOrganization}
            title={t("company.noCompanies")}
            description={t("company.emptyHint")}
            actionLabel={t("common.clearFilters")}
            onAction={() => {
            setSearch("");
            setIndustry("");
            setSort("createdAt");
            setPage(1);
            setSearchParams({});
          }} />
        )}
      </PageShell>
    </main>
  );
}

const CompanyCard = memo(function CompanyCard({ company, isFollowed, onFollow, onClick, t }) {
  const logo = getMediaUrl(company.uploadLogo || company.logo);
  const initial = company.companyName?.charAt(0).toUpperCase() || "C";

  return (
    <article
      onClick={onClick}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
    >
      <div className="relative h-24 bg-gradient-to-r from-blue-600 to-indigo-600">
        <button
          onClick={(event) => onFollow(company._id, event)}
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm transition hover:text-yellow-500"
          aria-label={isFollowed ? t("company.unfollow") : t("company.follow")}
        >
          {isFollowed ? <HiStar className="text-lg text-yellow-500" /> : <HiOutlineStar className="text-lg" />}
        </button>
      </div>

      <div className="relative px-5">
        <div className="absolute -top-10 left-5 flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border-4 border-white bg-blue-600 text-2xl font-bold text-white shadow-md">
          {logo ? <img src={logo} alt={company.companyName} className="h-full w-full object-cover" loading="lazy" /> : initial}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 pt-12">
        <div className="mb-3">
          <h2 className="line-clamp-1 text-lg font-bold text-gray-900 group-hover:text-blue-600">
            {company.companyName || t("app.name")}
          </h2>
          <p className="mt-1 inline-flex rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
            {company.industry || t("company.industry")}
          </p>
        </div>

        {company.description && (
          <p className="mb-4 line-clamp-2 text-sm leading-6 text-gray-600">{company.description}</p>
        )}

        <div className="mb-4 space-y-2 text-sm text-gray-600">
          <MetaRow icon={HiLocationMarker} value={company.location} />
          <MetaRow icon={HiMail} value={company.contactEmail || company.email} />
          <MetaRow icon={HiGlobe} value={company.website} />
        </div>

        <div className="mt-auto grid grid-cols-3 gap-2 border-t border-gray-100 pt-4 text-center">
          <Stat icon={HiBriefcase} value={company.stats?.jobCount ?? company.jobCount ?? 0} label={t("company.jobs")} />
          <Stat icon={HiUsers} value={company.size || company.employeeCount || t("common.na")} label={t("company.size")} />
          <Stat value={company.establishedYear || company.founded || t("common.na")} label={t("company.founded")} />
        </div>

        <Button className="mt-4 w-full" onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}>
          {t("company.viewDetails")}
        </Button>
      </div>
    </article>
  );
});

function MetaRow({ icon: Icon, value }) {
  if (!value) return null;

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icon className="h-4 w-4 flex-shrink-0 text-gray-400" />
      <span className="truncate">{value}</span>
    </div>
  );
}

function Stat({ icon: Icon, value, label }) {
  return (
    <div>
      <p className="mx-auto flex min-h-6 items-center justify-center gap-1 text-sm font-bold text-gray-900">
        {Icon && <Icon className="h-4 w-4 text-gray-400" />}
        <span className="truncate">{value}</span>
      </p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function CompanySkeletonLoader() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <SkeletonBlock className="h-24 rounded-none" />
          <div className="p-5 pt-12">
            <SkeletonBlock className="mb-3 h-6 w-2/3" />
            <SkeletonBlock className="mb-5 h-4 w-full" />
            <SkeletonBlock className="mb-2 h-4 w-4/5" />
            <SkeletonBlock className="mb-6 h-4 w-3/5" />
            <div className="grid grid-cols-3 gap-2">
              <SkeletonBlock className="h-10" />
              <SkeletonBlock className="h-10" />
              <SkeletonBlock className="h-10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-sm font-medium text-red-700">{message}</p>
      <Button className="mt-4" onClick={onRetry}>
        {t("common.tryAgain")}
      </Button>
    </div>
  );
}
