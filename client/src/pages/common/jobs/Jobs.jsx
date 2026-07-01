// src/components/candidates/jobs/Jobs.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Pagination from "../../../components/pagination/Pagination";
import { useGetCandidateJobsQuery, useGetJobsQuery } from "../../../services/apiSlice";
import { translateApiError } from "../../../utils/apiErrors";
import { translateProfession } from "../../../utils/professions";
import {
  getCompanyDisplayName,
  getJobExpiryDate,
  isExpiredJob,
} from "../../../utils/jobVisibility";
import { GiDiamondRing } from "react-icons/gi";
import { 
  HiSearch, 
  HiFilter, 
  HiX, 
  HiLocationMarker, 
  HiBriefcase, 
  HiAcademicCap,
  HiSparkles,
  HiClock,
  HiCurrencyDollar
} from "react-icons/hi";

// Constants
const ITEMS_PER_PAGE = 9;

const FILTER_OPTIONS = {
  EXPERIENCE_LEVELS: [
    "All Levels", "Fresher-0", "1-year", "2-years", "3-years", "4-years",
    "5-years", "6-years", "7-years", "8-years", "9-years", "10+ years"
  ],
  EMPLOYMENT_TYPES: [
    "All Types", "Full-time", "Part-time", "Contract", "Remote", "Internship /Trainee"
  ],
  JOB_PROFESSIONS: [
    "All Professions", "Filler", "Polisher", "Jewellery-Designer", "CAD Designer",
    "Goldsmith", "Stone Setter", "Quality Control", "Sales Executive", "Production Manager"
  ],
  SALARY_TYPES: [
    { value: "all", label: "All Salary Types" },
    { value: "monthly", label: "Monthly" },
    { value: "hourly", label: "Hourly" },
    { value: "perPiece", label: "Per Piece" },
    { value: "contract", label: "Contract" }
  ]
};

const POPULAR_SEARCHES = [
  "JewelleryDesigner", "CAD Designer", "Goldsmith", "Stone Setter",
  "Polisher", "Quality Control", "Sales Executive", "Production Manager"
];

// Utility functions
const getDaysAgo = (date) => {
  if (!date) return 0;
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
};

const formatSalaryDisplay = (job) => {
  if (!job?.salary) return [];

  const parts = [];
  Object.entries(job.salary).forEach(([type, range]) => {
    if (range?.min || range?.max) {
      const minStr = range.min ? `₹${Number(range.min).toLocaleString('en-IN')}` : '';
      const maxStr = range.max ? `₹${Number(range.max).toLocaleString('en-IN')}` : '';
      const rangeStr = minStr && maxStr ? `${minStr} - ${maxStr}` : (minStr || maxStr);
      const typeLabel = type === 'perPiece' ? 'Per Piece' : type.charAt(0).toUpperCase() + type.slice(1);
      parts.push({ type, label: typeLabel, range: rangeStr });
    }
  });
  return parts;
};

export default function Jobs() {
  const { t } = useTranslation(["jobs", "common", "candidate", "professions", "errors"]);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useSelector((state) => state.auth.user);
  const isCandidateFeed = user?.role === "candidate";
  const isAuthenticated = Boolean(user);
  
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  // Filter states
  const [filters, setFilters] = useState({
    searchQuery: searchParams.get('search') || "",
    location: searchParams.get('location') || "",
    profession: searchParams.get('profession') || "All Professions",
    company: isAuthenticated ? searchParams.get('company') || "" : "",
    skills: searchParams.get('skills') || "",
    experience: searchParams.get('experience') || "All Levels",
    empType: searchParams.get('empType') || "All Types",
    salaryType: searchParams.get('salaryType') || "all",
    salaryRange: { 
      min: searchParams.get('minSalary') || "", 
      max: searchParams.get('maxSalary') || "" 
    }
  });

  const publicJobsQuery = useGetJobsQuery({}, { skip: isCandidateFeed });
  const candidateJobsQuery = useGetCandidateJobsQuery({}, { skip: !isCandidateFeed });
  const jobs = isCandidateFeed ? candidateJobsQuery.data?.jobs || [] : publicJobsQuery.data || [];
  const loading = isCandidateFeed ? candidateJobsQuery.isLoading : publicJobsQuery.isLoading;
  const loadError = isCandidateFeed ? candidateJobsQuery.error : publicJobsQuery.error;

  // Sync filters with URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.searchQuery) params.set('search', filters.searchQuery);
    if (filters.location) params.set('location', filters.location);
    if (filters.profession !== "All Professions") params.set('profession', filters.profession);
    if (isAuthenticated && filters.company) params.set('company', filters.company);
    if (filters.skills) params.set('skills', filters.skills);
    if (filters.experience !== "All Levels") params.set('experience', filters.experience);
    if (filters.empType !== "All Types") params.set('empType', filters.empType);
    if (filters.salaryType !== "all") params.set('salaryType', filters.salaryType);
    if (filters.salaryRange.min) params.set('minSalary', filters.salaryRange.min);
    if (filters.salaryRange.max) params.set('maxSalary', filters.salaryRange.max);
    setSearchParams(params);
  }, [filters, isAuthenticated, setSearchParams]);

  useEffect(() => {
    if (isCandidateFeed && user?.jobProfession) {
      setFilters((prev) => ({ ...prev, profession: user.jobProfession }));
    }
  }, [isCandidateFeed, user?.jobProfession]);

  useEffect(() => {
    if (loadError) {
      toast.error(translateApiError(loadError, t, "unexpected"));
    }
  }, [loadError, t]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const updateSalaryRange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      salaryRange: { ...prev.salaryRange, [field]: value }
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: "",
      location: "",
      profession: isCandidateFeed && user?.jobProfession ? user.jobProfession : "All Professions",
      company: "",
      skills: "",
      experience: "All Levels",
      empType: "All Types",
      salaryType: "all",
      salaryRange: { min: "", max: "" }
    });
    setCurrentPage(1);
    setShowFilters(false);
  };

  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.location) count++;
    if (filters.profession !== "All Professions") count++;
    if (isAuthenticated && filters.company) count++;
    if (filters.skills) count++;
    if (filters.experience !== "All Levels") count++;
    if (filters.empType !== "All Types") count++;
    if (filters.salaryType !== "all") count++;
    if (filters.salaryRange.min || filters.salaryRange.max) count++;
    return count;
  }, [filters, isAuthenticated]);

  // Filter jobs with memoization
const filteredJobs = useMemo(() => {
  return jobs.filter(job => {
    // Check if job is expired - skip expired jobs
    if (isExpiredJob(job)) {
      return false;
    }
    
    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesTitle = job.title?.toLowerCase().includes(query);
      const matchesCompany = isAuthenticated && getCompanyDisplayName(job, true)?.toLowerCase().includes(query);
      const matchesProfession = job.jobProfession?.toLowerCase().includes(query);
      const matchesSkills = job.skills?.some(skill => skill.toLowerCase().includes(query));
      if (!matchesTitle && !matchesCompany && !matchesProfession && !matchesSkills) return false;
    }

    // Location filter
    if (filters.location && !job.jobLocation?.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }

    // Profession filter
    if (filters.profession !== "All Professions" && job.jobProfession !== filters.profession) {
      return false;
    }

    if (isAuthenticated && filters.company && !getCompanyDisplayName(job, true)?.toLowerCase().includes(filters.company.toLowerCase())) {
      return false;
    }

    if (filters.skills) {
      const requestedSkills = filters.skills
        .split(",")
        .map((skill) => skill.trim().toLowerCase())
        .filter(Boolean);
      const jobSkills = (job.skills || []).map((skill) => skill.toLowerCase());
      if (requestedSkills.some((skill) => !jobSkills.some((jobSkill) => jobSkill.includes(skill)))) {
        return false;
      }
    }

    // Experience filter
    if (filters.experience !== "All Levels" && job.experience !== filters.experience) {
      return false;
    }

    // Employment type filter
    if (filters.empType !== "All Types" && job.empType !== filters.empType) {
      return false;
    }

    // Salary type filter
    if (filters.salaryType !== "all") {
      const hasSalaryType = job.salary?.[filters.salaryType] && 
                           (job.salary[filters.salaryType].min || job.salary[filters.salaryType].max);
      if (!hasSalaryType) return false;
    }

    // Salary range filter
    if (filters.salaryRange.min || filters.salaryRange.max) {
      let jobHasSalaryInRange = false;
      
      if (job.salary) {
        Object.values(job.salary).forEach(range => {
          if (range.min || range.max) {
            const min = range.min || 0;
            const max = range.max || Infinity;
            
            if (filters.salaryRange.min && filters.salaryRange.max) {
              if (min <= parseInt(filters.salaryRange.max) && max >= parseInt(filters.salaryRange.min)) {
                jobHasSalaryInRange = true;
              }
            } else if (filters.salaryRange.min) {
              if (max >= parseInt(filters.salaryRange.min)) jobHasSalaryInRange = true;
            } else if (filters.salaryRange.max) {
              if (min <= parseInt(filters.salaryRange.max)) jobHasSalaryInRange = true;
            }
          }
        });
      }
      
      if (!jobHasSalaryInRange) return false;
    }

    return true;
  });
}, [jobs, filters, isAuthenticated]);

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredJobs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredJobs, currentPage]);

  const handlePopularSearch = (query) => {
    updateFilter('searchQuery', query);
  };

  return (
    <div className="jc-soft-page min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#ead8e3] bg-white px-3 py-1.5 text-xs font-bold uppercase text-[#7a0e67]">
              <GiDiamondRing className="h-4 w-4" />
              Jewellery hiring marketplace
            </p>
            <h1 className="mt-3 font-serif text-3xl font-bold text-[#261723] sm:text-4xl">
              {t("heroTitle", { defaultValue: "Find Your Dream Jewellery-Industry Job" })}
            </h1>
            <p className="mt-2 text-sm text-[#7b6575]">
              {t("activeJobs", {
                count: filteredJobs.length,
                defaultValue: "{{count}} active jobs in Jewellery-Craftsmanship",
              })}
            </p>
            {isCandidateFeed && user?.jobProfession && (
              <p className="mt-3 inline-flex rounded-full bg-[#f7eef9] px-3 py-1 text-sm font-semibold text-[#5d0f51]">
                {t("candidate:matchingProfession", {
                  profession: translateProfession(user.jobProfession, t),
                  defaultValue: `Matching your selected profession: ${translateProfession(user.jobProfession, t)}`,
                })}
              </p>
            )}
          </div>
          <PopularSearches searches={POPULAR_SEARCHES.slice(0, 5)} onSearch={handlePopularSearch} t={t} />
        </div>

        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)_260px]">
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <SearchSection
              filters={filters}
              onFilterChange={updateFilter}
              onSalaryRangeChange={updateSalaryRange}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
              onReset={resetFilters}
              activeFilterCount={getActiveFilterCount()}
              lockedProfession={isCandidateFeed}
              canSearchCompany={isAuthenticated}
              t={t}
            />
          </aside>

          <main className="min-w-0">
            <div className="jc-panel mb-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#261723]">
                  {t("jobs", { defaultValue: "Jobs" })} ({filteredJobs.length})
                </h2>
                <p className="text-sm text-[#7b6575]">
                  {t("showingJobs", {
                    shown: paginatedJobs.length,
                    total: filteredJobs.length,
                    defaultValue: "Showing {{shown}} of {{total}} jobs",
                  })}
                </p>
              </div>
              <select className="h-10 w-full rounded-lg border border-[#ead8e3] bg-white px-3 text-sm text-[#4b3444] sm:w-auto">
                <option>Sort by Latest</option>
              </select>
            </div>

            {loading ? (
              <JobSkeletonGrid />
            ) : loadError ? (
              <ErrorState onRetry={() => {
                if (isCandidateFeed) candidateJobsQuery.refetch();
                else publicJobsQuery.refetch();
              }} />
            ) : paginatedJobs.length === 0 ? (
              <EmptyState onReset={resetFilters} />
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedJobs.map((job, index) => {
                    const jobData = job._doc || job;
                    const jobId = jobData._id || jobData.id || index;

                    return (
                      <JobCard
                        key={jobId}
                        job={jobData}
                        formatSalary={formatSalaryDisplay}
                        onClick={() => navigate(`/jobs/${jobId}`)}
                        t={t}
                        isAuthenticated={isAuthenticated}
                        onApply={(event) => {
                          event.stopPropagation();
                          if (!isAuthenticated) {
                            navigate("/login", { state: { from: `/jobs/${jobId}` } });
                            return;
                          }
                          navigate(`/jobs/${jobId}`);
                        }}
                      />
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </main>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
            <div className="jc-panel p-5">
              <h3 className="text-sm font-bold text-[#261723]">About JewelCancy</h3>
              <div className="mt-4 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#ead8e3] bg-[#fff7fb] text-[#5d0f51]">
                  <GiDiamondRing className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-semibold text-[#261723]">Specialized jewelry jobs</p>
                  <p className="text-xs text-[#7b6575]">India focused talent network</p>
                </div>
              </div>
              <ul className="mt-5 space-y-3 text-sm text-[#5f4a59]">
                {["Profile complete", "Verified recruiters", "Resume upload", "Direct application"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#7a0e67]" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => navigate(isAuthenticated ? "/profile" : "/register")}
                className="mt-5 w-full rounded-lg border border-[#d9bdcf] bg-white px-4 py-2 text-sm font-semibold text-[#5d0f51] transition hover:bg-[#fff7fb]"
              >
                Improve Profile
              </button>
            </div>
            <StatsFooter jobs={jobs} t={t} compact />
          </aside>
        </div>
      </div>
    </div>
  );
}

// ================= REUSABLE COMPONENTS =================

function SearchSection({ filters, onFilterChange, onSalaryRangeChange, showFilters, onToggleFilters, onReset, activeFilterCount, lockedProfession, canSearchCompany, t }) {
  return (
    <div className="jc-panel p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-[#261723]">
            {t("searchJobs", { defaultValue: "Search Jobs" })}
          </h2>
          <p className="text-xs text-[#7b6575]">
            {t("refineResults", { defaultValue: "Refine by role, place, skills and salary" })}
          </p>
        </div>
        {activeFilterCount > 0 && (
          <span className="rounded-full bg-[#f7eef9] px-2.5 py-1 text-xs font-bold text-[#5d0f51]">
            {activeFilterCount}
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div className="relative">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b8394] text-lg" />
          <input
            type="text"
            placeholder={t("searchJobs", { defaultValue: "Search by job title, profession, skills..." })}
            value={filters.searchQuery}
            onChange={(e) => onFilterChange('searchQuery', e.target.value)}
            className="h-11 w-full rounded-lg border border-[#ead8e3] bg-[#fffdfb] pl-10 pr-3 text-sm text-[#261723] outline-none transition focus:border-[#7a0e67] focus:ring-4 focus:ring-[#efd5e8]"
          />
        </div>

        <div className="relative">
          <HiLocationMarker className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b8394] text-lg" />
          <input
            type="text"
            placeholder={t("locationPlaceholder", { defaultValue: "Location (e.g., Mumbai, Jaipur)" })}
            value={filters.location}
            onChange={(e) => onFilterChange('location', e.target.value)}
            className="h-11 w-full rounded-lg border border-[#ead8e3] bg-[#fffdfb] pl-10 pr-3 text-sm text-[#261723] outline-none transition focus:border-[#7a0e67] focus:ring-4 focus:ring-[#efd5e8]"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onToggleFilters}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#5d0f51] px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3f0b38]"
          >
            <HiFilter className={`text-base transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            {t("filters")}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="h-10 rounded-lg border border-[#d9bdcf] bg-white px-3 text-sm font-semibold text-[#5d0f51] transition hover:bg-[#fff7fb]"
          >
            {t("actions.reset", { ns: "common" })}
          </button>
        </div>
      </div>

      {showFilters && (
        <AdvancedFilters
          filters={filters}
          onFilterChange={onFilterChange}
          onSalaryRangeChange={onSalaryRangeChange}
          lockedProfession={lockedProfession}
          canSearchCompany={canSearchCompany}
          t={t}
        />
      )}

      {activeFilterCount > 0 && (
        <ActiveFilters
          filters={filters}
          onFilterChange={onFilterChange}
          onReset={onReset}
          t={t}
        />
      )}
    </div>
  );
}

function AdvancedFilters({ filters, onFilterChange, onSalaryRangeChange, lockedProfession, canSearchCompany, t }) {
  return (
    <div className="mt-4 space-y-3 border-t border-[#f0dce8] pt-4 animate-slideDown">
      <div className="space-y-3">
        <FilterSelect
          label={t("jobProfession")}
          value={filters.profession}
          onChange={(val) => onFilterChange('profession', val)}
          options={FILTER_OPTIONS.JOB_PROFESSIONS.map((profession) => ({
            value: profession,
            label: profession === "All Professions" ? t("allProfessions") : translateProfession(profession, t),
          }))}
          disabled={lockedProfession}
        />
        <FilterSelect
          label={t("experienceLevel")}
          value={filters.experience}
          onChange={(val) => onFilterChange('experience', val)}
          options={FILTER_OPTIONS.EXPERIENCE_LEVELS}
        />
        <FilterSelect
          label={t("employmentType")}
          value={filters.empType}
          onChange={(val) => onFilterChange('empType', val)}
          options={FILTER_OPTIONS.EMPLOYMENT_TYPES}
        />
        <FilterSelect
          label={t("salaryType", { defaultValue: "Salary Type" })}
          value={filters.salaryType}
          onChange={(val) => onFilterChange('salaryType', val)}
          options={FILTER_OPTIONS.SALARY_TYPES.map((salaryType) => ({
            value: salaryType.value,
            label: t(`salaryTypes.${salaryType.value}`, { defaultValue: salaryType.label }),
          }))}
        />
      </div>

      <div className="space-y-3">
        <FilterInput
          label={t("fields.companyName", { ns: "common" })}
          placeholder={canSearchCompany ? t("companyPlaceholder", { defaultValue: "Search by company" }) : "Login to search by company"}
          value={filters.company}
          onChange={(val) => onFilterChange('company', val)}
          disabled={!canSearchCompany}
        />
        <FilterInput
          label={t("requiredSkills")}
          placeholder="CAD, rhino, sales"
          value={filters.skills}
          onChange={(val) => onFilterChange('skills', val)}
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#7b6575]">
          {t("salaryRange", { defaultValue: "Salary Range (₹)" })}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder={t("min", { defaultValue: "Min" })}
            value={filters.salaryRange.min}
            onChange={(e) => onSalaryRangeChange('min', e.target.value)}
            className="h-10 w-full rounded-lg border border-[#ead8e3] bg-[#fffdfb] px-3 text-sm text-[#261723] outline-none transition focus:border-[#7a0e67] focus:ring-4 focus:ring-[#efd5e8]"
          />
          <input
            type="number"
            placeholder={t("max", { defaultValue: "Max" })}
            value={filters.salaryRange.max}
            onChange={(e) => onSalaryRangeChange('max', e.target.value)}
            className="h-10 w-full rounded-lg border border-[#ead8e3] bg-[#fffdfb] px-3 text-sm text-[#261723] outline-none transition focus:border-[#7a0e67] focus:ring-4 focus:ring-[#efd5e8]"
          />
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, disabled = false }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#7b6575]">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-10 w-full cursor-pointer rounded-lg border border-[#ead8e3] bg-[#fffdfb] px-3 text-sm text-[#261723] outline-none transition focus:border-[#7a0e67] focus:ring-4 focus:ring-[#efd5e8] disabled:cursor-not-allowed disabled:bg-[#f8f1f5] disabled:text-[#9b8394]"
      >
        {options.map(opt => (
          <option key={opt.value || opt} value={opt.value || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function FilterInput({ label, value, onChange, placeholder, disabled = false }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#7b6575]">{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-[#ead8e3] bg-[#fffdfb] px-3 text-sm text-[#261723] outline-none transition focus:border-[#7a0e67] focus:ring-4 focus:ring-[#efd5e8] disabled:cursor-not-allowed disabled:bg-[#f8f1f5] disabled:text-[#9b8394]"
      />
    </div>
  );
}

function ActiveFilters({ filters, onFilterChange, onReset, t }) {
  const filterTags = [
    { show: filters.searchQuery, icon: HiSearch, value: filters.searchQuery, onClear: () => onFilterChange('searchQuery', '') },
    { show: filters.location, icon: HiLocationMarker, value: filters.location, onClear: () => onFilterChange('location', '') },
    { show: filters.profession !== "All Professions", icon: HiBriefcase, value: translateProfession(filters.profession, t), onClear: () => onFilterChange('profession', "All Professions") },
    { show: filters.company, icon: HiBriefcase, value: `Company: ${filters.company}`, onClear: () => onFilterChange('company', '') },
    { show: filters.skills, icon: HiSparkles, value: `Skills: ${filters.skills}`, onClear: () => onFilterChange('skills', '') },
    { show: filters.experience !== "All Levels", icon: HiAcademicCap, value: filters.experience, onClear: () => onFilterChange('experience', "All Levels") },
    { show: filters.empType !== "All Types", icon: HiBriefcase, value: filters.empType, onClear: () => onFilterChange('empType', "All Types") },
  ];

  return (
    <div className="mt-4 flex flex-wrap gap-2 border-t border-[#f0dce8] pt-4 animate-fadeIn">
      {filterTags.map((tag, idx) => tag.show && (
        <span key={idx} className="inline-flex items-center gap-2 rounded-full border border-[#e6cfe0] bg-[#f7eef9] px-3 py-1.5 text-xs font-semibold text-[#5d0f51] transition hover:border-[#d5a6c7]">
          <tag.icon className="text-xs" />
          {tag.value}
          <HiX className="cursor-pointer text-[#7a0e67] transition-colors hover:text-[#3f0b38]" onClick={tag.onClear} />
        </span>
      ))}
      <button
        type="button"
        onClick={onReset}
        className="text-xs font-semibold text-[#7a0e67] underline decoration-[#d9bdcf] underline-offset-4 transition hover:text-[#3f0b38]"
      >
        Clear all
      </button>
    </div>
  );
}

function PopularSearches({ searches, onSearch, t }) {
  return (
    <div className="mt-4">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#5d0f51]">
        <HiSparkles className="text-[#a34c83]" />
        Popular searches
      </p>
      <div className="flex flex-wrap gap-2">
        {searches.map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSearch(item)}
            className="rounded-full border border-[#e6cfe0] bg-white px-3 py-1.5 text-xs font-semibold text-[#5d0f51] transition hover:border-[#d5a6c7] hover:bg-[#fff7fb]"
          >
            {translateProfession(item, t)}
          </button>
        ))}
      </div>
    </div>
  );
}

function JobCard({ job, formatSalary, onClick, onApply, isAuthenticated, t }) {
  const salaryParts = formatSalary(job);
  const isExpired = isExpiredJob(job);
  const companyName = getCompanyDisplayName(job, isAuthenticated);
  const expiryDate = getJobExpiryDate(job);

  return (
    <article
      onClick={onClick}
      className="jc-panel group cursor-pointer p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[#d5a6c7] hover:shadow-[0_24px_50px_-36px_rgba(93,15,81,0.45)]"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[#ead8e3] bg-[#fff7fb] text-[#5d0f51]">
          <GiDiamondRing className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-[#261723] transition group-hover:text-[#5d0f51] sm:text-lg">
                {job.title}
              </h2>
              <p className="mt-1 text-sm text-[#7b6575]">{companyName}</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {isExpired && (
                <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                  Expired
                </span>
              )}
              <span className="rounded-full border border-[#e6cfe0] bg-[#f7eef9] px-3 py-1 text-xs font-semibold text-[#5d0f51]">
                {job.jobProfession ? translateProfession(job.jobProfession, t) : t("common.notSpecified", { ns: "common" })}
              </span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard icon={<HiLocationMarker />} text={job.jobLocation} />
            <InfoCard icon={<HiBriefcase />} text={job.empType} />
            <InfoCard icon={<HiAcademicCap />} text={job.experience} />
            <InfoCard icon={<HiClock />} text={`${job.openings || 0} openings`} />
          </div>

          {salaryParts.length > 0 && (
            <div className="mt-3 rounded-lg border border-[#f0dce8] bg-[#fffaf7] p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#5d0f51]">
                <HiCurrencyDollar />
                <span>Salary</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {salaryParts.slice(0, 2).map((part, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-[#7b6575]">{part.label}</span>
                    <span className="font-semibold text-[#261723]">{part.range}</span>
                  </div>
                ))}
                {salaryParts.length > 2 && (
                  <p className="text-xs font-semibold text-[#7a0e67]">+{salaryParts.length - 2} more</p>
                )}
              </div>
            </div>
          )}

          {job.skills?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {job.skills.slice(0, 3).map((skill, idx) => (
                <span key={idx} className="rounded-full bg-[#f8f1f5] px-2.5 py-1 text-xs font-medium text-[#6f5668]">
                  {skill}
                </span>
              ))}
              {job.skills.length > 3 && (
                <span className="rounded-full bg-[#f8f1f5] px-2.5 py-1 text-xs font-medium text-[#6f5668]">
                  +{job.skills.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="mt-4 flex flex-col gap-3 border-t border-[#f0dce8] pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#7b6575]">
              <span className="flex items-center gap-1">
                <HiClock />
                Posted {getDaysAgo(job.createdAt)} days ago
              </span>
              {expiryDate && (
                <span className={isExpired ? "text-red-600" : "text-[#7b6575]"}>
                  Expires {new Date(expiryDate).toLocaleDateString()}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onApply}
              disabled={isExpired}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                isExpired
                  ? "cursor-not-allowed bg-[#eee4ea] text-[#9b8394]"
                  : isAuthenticated
                    ? "bg-[#5d0f51] text-white hover:bg-[#3f0b38]"
                    : "border border-[#d9bdcf] bg-white text-[#5d0f51] hover:bg-[#fff7fb]"
              }`}
            >
              {isExpired ? "Expired" : isAuthenticated ? "View / Apply" : "Login to Apply"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function InfoCard({ icon, text }) {
  if (!text) return null;
  
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg bg-[#fff7fb] p-2 text-sm text-[#6f5668] transition-colors">
      <span className="shrink-0 text-[#7a0e67]">{icon}</span>
      <span className="truncate">{text}</span>
    </div>
  );
}

function StatsFooter({ jobs, t, compact = false }) {
  const stats = [
    { value: jobs.length, label: t("totalJobs", { defaultValue: "Total Jobs" }), icon: <HiBriefcase />, color: "blue" },
    { value: jobs.filter(j => j.jobProfession).length, label: t("jewelleryRoles", { defaultValue: "Jewellery Roles" }), icon: <GiDiamondRing />, color: "purple" },
    { value: jobs.filter(j => j.experience === "Fresher-0").length, label: t("fresherJobs", { defaultValue: "Fresher Jobs" }), icon: <HiAcademicCap />, color: "green" },
    { value: jobs.filter(j => j.empType === "Remote").length, label: t("remoteJobs", { defaultValue: "Remote Jobs" }), icon: <HiLocationMarker />, color: "yellow" }
  ];

  if (compact) {
    return (
      <div className="jc-panel p-5">
        <h3 className="text-sm font-bold text-[#261723]">Hiring snapshot</h3>
        <div className="mt-4 space-y-3">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex items-center justify-between rounded-lg bg-[#fff7fb] px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#5d0f51]">
                  {stat.icon}
                </span>
                <span className="truncate text-xs font-semibold text-[#7b6575]">{stat.label}</span>
              </div>
              <span className="text-sm font-bold text-[#261723]">{stat.value}+</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#f0dce8] bg-[#4c0e42] py-10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, icon }) {
  return (
    <div className="text-center group">
      <div className="mb-2 flex items-center justify-center gap-2 text-3xl font-bold text-white transition-transform duration-300 group-hover:scale-105">
        {icon}
        {value}+
      </div>
      <p className="text-sm font-medium uppercase tracking-wider text-[#f4dcec] transition-colors group-hover:text-white">
        {label}
      </p>
    </div>
  );
}

function EmptyState({ onReset }) {
  const { t } = useTranslation(["jobs", "common"]);
  return (
    <div className="jc-panel px-5 py-14 text-center">
      <GiDiamondRing className="mx-auto mb-4 text-5xl text-[#d4b7cd]" />
      <h3 className="mb-2 text-2xl font-bold text-[#261723]">{t("noJobs")}</h3>
      <p className="mx-auto mb-8 max-w-md text-[#7b6575]">
        {t("noJobsHint", { defaultValue: "We couldn't find any jobs matching your criteria. Try adjusting your filters or search query." })}
      </p>
      <button
        type="button"
        onClick={onReset}
        className="rounded-lg bg-[#5d0f51] px-8 py-3 font-semibold text-white shadow-sm transition hover:bg-[#3f0b38]"
      >
        {t("common.clearFilters", { ns: "common" })}
      </button>
    </div>
  );
}

function ErrorState({ onRetry }) {
  const { t } = useTranslation(["jobs", "common", "errors"]);
  return (
    <div className="jc-panel border-red-100 px-5 py-14 text-center">
      <h3 className="mb-2 text-2xl font-bold text-[#261723]">{t("jobsLoadError", { defaultValue: "Jobs could not load" })}</h3>
      <p className="mx-auto mb-8 max-w-md text-[#7b6575]">
        {t("jobsLoadErrorHint", { defaultValue: "The jobs service did not respond successfully. Try again before changing your filters." })}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg bg-[#5d0f51] px-8 py-3 font-semibold text-white transition hover:bg-[#3f0b38]"
      >
        {t("common.retry", { ns: "common" })}
      </button>
    </div>
  );
}

function JobSkeletonGrid() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="jc-panel animate-pulse p-4">
          <div className="flex gap-4">
            <div className="h-12 w-12 rounded-lg bg-[#f0dce8]" />
            <div className="flex-1">
              <div className="mb-3 h-5 w-1/2 rounded bg-[#f0dce8]" />
              <div className="mb-4 h-4 w-1/3 rounded bg-[#f5e8ef]" />
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                <div className="h-9 rounded bg-[#f5e8ef]" />
                <div className="h-9 rounded bg-[#f5e8ef]" />
                <div className="h-9 rounded bg-[#f5e8ef]" />
                <div className="h-9 rounded bg-[#f5e8ef]" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
