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

const COLOR_MAP = {
  blue: "text-blue-400",
  purple: "text-purple-400",
  green: "text-green-400",
  yellow: "text-yellow-400"
};

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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="text-center mb-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-4">
              <GiDiamondRing className="text-4xl sm:text-5xl text-yellow-300 animate-pulse" />
              <h1 className="font-serif text-2xl sm:text-4xl font-bold text-white leading-tight">
                {t("heroTitle", { defaultValue: "Find Your Dream Jewellery-Industry Job" })}
              </h1>
            </div>
            <p className="text-blue-200 text-sm sm:text-lg flex justify-center items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              {t("activeJobs", {
                count: filteredJobs.length,
                defaultValue: "{{count}} active jobs in Jewellery-Craftsmanship",
              })}
            </p>
            {isCandidateFeed && user?.jobProfession && (
              <p className="mt-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-sm text-blue-50">
                {t("candidate:matchingProfession", {
                  profession: translateProfession(user.jobProfession, t),
                  defaultValue: `Matching your selected profession: ${translateProfession(user.jobProfession, t)}`,
                })}
              </p>
            )}
          </div>

          {/* Search Section */}
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

          {/* Popular Searches */}
          <PopularSearches 
            searches={POPULAR_SEARCHES}
            onSearch={handlePopularSearch}
            t={t}
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <p className="text-gray-600">
          {t("showingJobs", {
            shown: paginatedJobs.length,
            total: filteredJobs.length,
            defaultValue: "Showing {{shown}} of {{total}} jobs",
          })}
        </p>
      </div>

      {/* Job Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 pb-12">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="mt-10">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Stats Footer */}
      <StatsFooter jobs={jobs} t={t} />

    </div>
  );
}

// ================= REUSABLE COMPONENTS =================

function SearchSection({ filters, onFilterChange, onSalaryRangeChange, showFilters, onToggleFilters, onReset, activeFilterCount, lockedProfession, canSearchCompany, t }) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-5 relative">
          <HiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
          <input
            type="text"
            placeholder={t("searchJobs", { defaultValue: "Search by job title, profession, skills..." })}
            value={filters.searchQuery}
            onChange={(e) => onFilterChange('searchQuery', e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white text-gray-900 rounded-xl focus:ring-4 focus:ring-blue-300 outline-none transition-shadow"
          />
        </div>

        <div className="md:col-span-4 relative">
          <HiLocationMarker className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
          <input
            type="text"
            placeholder={t("locationPlaceholder", { defaultValue: "Location (e.g., Mumbai, Jaipur)" })}
            value={filters.location}
            onChange={(e) => onFilterChange('location', e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white text-gray-900 rounded-xl focus:ring-4 focus:ring-blue-300 outline-none transition-shadow"
          />
        </div>

        <div className="md:col-span-3 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onToggleFilters}
            className="flex-1 bg-white/20 hover:bg-white/30 text-white py-4 rounded-xl transition-all font-medium flex items-center justify-center gap-3 backdrop-blur-lg border border-white/30 group"
          >
            <HiFilter className={`text-xl transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            {t("filters")}
            {activeFilterCount > 0 && (
              <span className="bg-yellow-400 text-blue-900 px-2 py-0.5 rounded-full text-xs font-bold animate-pulse">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button
            onClick={onReset}
            className="px-6 py-4 sm:py-0 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all font-medium backdrop-blur-lg border border-white/30"
          >
            {t("actions.reset", { ns: "common" })}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
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

      {/* Active Search Tags */}
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
    <div className="mt-6 pt-6 border-t border-white/20 animate-slideDown">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Salary Range Filter */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-blue-100 mb-2">
          {t("salaryRange", { defaultValue: "Salary Range (₹)" })}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="number"
            placeholder={t("min", { defaultValue: "Min" })}
            value={filters.salaryRange.min}
            onChange={(e) => onSalaryRangeChange('min', e.target.value)}
            className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl focus:ring-4 focus:ring-blue-300 outline-none"
          />
          <input
            type="number"
            placeholder={t("max", { defaultValue: "Max" })}
            value={filters.salaryRange.max}
            onChange={(e) => onSalaryRangeChange('max', e.target.value)}
            className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl focus:ring-4 focus:ring-blue-300 outline-none"
          />
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, disabled = false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-blue-100 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl focus:ring-4 focus:ring-blue-300 outline-none cursor-pointer hover:shadow-md transition-shadow disabled:cursor-not-allowed disabled:bg-blue-50"
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
      <label className="block text-sm font-medium text-blue-100 mb-2">{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl focus:ring-4 focus:ring-blue-300 outline-none disabled:cursor-not-allowed disabled:bg-blue-50 disabled:text-gray-500"
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

  const colors = ['bg-blue-600', 'bg-purple-600', 'bg-green-600', 'bg-orange-600'];

  return (
    <div className="mt-4 flex flex-wrap gap-2 animate-fadeIn">
      {filterTags.map((tag, idx) => tag.show && (
        <span key={idx} className={`inline-flex items-center gap-2 px-3 py-1.5 ${colors[idx % colors.length]} text-white rounded-full text-sm transition-all hover:scale-105`}>
          <tag.icon className="text-xs" />
          {tag.value}
          <HiX className="cursor-pointer hover:text-gray-200 transition-colors" onClick={tag.onClear} />
        </span>
      ))}
      <button
        onClick={onReset}
        className="text-sm text-blue-200 hover:text-white underline transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}

function PopularSearches({ searches, onSearch, t }) {
  return (
    <div className="mt-6 text-center">
      <p className="text-blue-200 mb-3 text-sm flex items-center justify-center gap-2">
        <HiSparkles className="text-yellow-300" />
        Popular searches
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {searches.map((item, i) => (
          <button
            key={i}
            onClick={() => onSearch(item)}
          className="bg-blue-700/50 hover:bg-blue-600 text-white px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm transition-all border border-blue-400 hover:scale-105"
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
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:-translate-y-1"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {job.title}
          </h2>
          {isExpired && (
            <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full animate-pulse">
              Expired
            </span>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-3">{companyName}</p>

        <div className="mb-3">
          <span className="inline-block px-3 py-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full text-xs font-medium">
            {job.jobProfession ? translateProfession(job.jobProfession, t) : t("common.notSpecified", { ns: "common" })}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          <InfoCard icon={<HiLocationMarker />} text={job.jobLocation} />
          <InfoCard icon={<HiBriefcase />} text={job.empType} />
          <InfoCard icon={<HiAcademicCap />} text={job.experience} />
          <InfoCard icon={<HiClock />} text={`${job.openings} openings`} />
        </div>

        {salaryParts.length > 0 && (
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
            <div className="flex items-center gap-2 text-blue-700 mb-1">
              <HiCurrencyDollar />
              <span className="text-sm font-medium">Salary:</span>
            </div>
            <div className="space-y-1">
              {salaryParts.slice(0, 2).map((part, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{part.label}:</span>
                  <span className="font-semibold text-blue-600">{part.range}</span>
                </div>
              ))}
              {salaryParts.length > 2 && (
                <p className="text-xs text-gray-500">+{salaryParts.length - 2} more</p>
              )}
            </div>
          </div>
        )}

        {job.skills?.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {job.skills.slice(0, 3).map((skill, idx) => (
                <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  {skill}
                </span>
              ))}
              {job.skills.length > 3 && (
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  +{job.skills.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <HiClock />
            Posted {getDaysAgo(job.createdAt)} days ago
          </div>
          {expiryDate && (
            <div className={`text-xs ${isExpired ? "text-red-600" : "text-gray-500"}`}>
              Expires {new Date(expiryDate).toLocaleDateString()}
            </div>
          )}
        </div>
        <button
          onClick={onApply}
          disabled={isExpired}
          className={`mt-4 w-full rounded-lg px-4 py-2 text-sm font-semibold transition ${
            isExpired
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : isAuthenticated
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-amber-500 text-white hover:bg-amber-600"
          }`}
        >
          {isExpired ? "Expired" : isAuthenticated ? "View / Apply" : "Login to Apply"}
        </button>
      </div>
    </div>
  );
}

function InfoCard({ icon, text }) {
  if (!text) return null;
  
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition-colors">
      <span className="text-gray-500">{icon}</span>
      <span className="truncate">{text}</span>
    </div>
  );
}

function StatsFooter({ jobs, t }) {
  const stats = [
    { value: jobs.length, label: t("totalJobs", { defaultValue: "Total Jobs" }), icon: <HiBriefcase />, color: "blue" },
    { value: jobs.filter(j => j.jobProfession).length, label: t("jewelleryRoles", { defaultValue: "Jewellery Roles" }), icon: <GiDiamondRing />, color: "purple" },
    { value: jobs.filter(j => j.experience === "Fresher-0").length, label: t("fresherJobs", { defaultValue: "Fresher Jobs" }), icon: <HiAcademicCap />, color: "green" },
    { value: jobs.filter(j => j.empType === "Remote").length, label: t("remoteJobs", { defaultValue: "Remote Jobs" }), icon: <HiLocationMarker />, color: "yellow" }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-700 to-blue-800 text-black py-12">
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

function StatCard({ value, label, icon, color }) {
  return (
    <div className="text-center group">
      <div className={`text-4xl font-bold ${COLOR_MAP[color]} mb-2 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center gap-2`}>
        {icon}
        {value}+
      </div>
      <p className="text-gray-300 text-sm font-medium uppercase tracking-wider group-hover:text-white transition-colors">
        {label}
      </p>
    </div>
  );
}

function EmptyState({ onReset }) {
  const { t } = useTranslation(["jobs", "common"]);
  return (
    <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-200">
      <GiDiamondRing className="text-6xl text-gray-300 mx-auto mb-4 animate-pulse" />
      <h3 className="text-2xl font-bold text-gray-800 mb-2">{t("noJobs")}</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        {t("noJobsHint", { defaultValue: "We couldn't find any jobs matching your criteria. Try adjusting your filters or search query." })}
      </p>
      <button
        onClick={onReset}
        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        {t("common.clearFilters", { ns: "common" })}
      </button>
    </div>
  );
}

function ErrorState({ onRetry }) {
  const { t } = useTranslation(["jobs", "common", "errors"]);
  return (
    <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-red-100">
      <h3 className="text-2xl font-bold text-gray-800 mb-2">{t("jobsLoadError", { defaultValue: "Jobs could not load" })}</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        {t("jobsLoadErrorHint", { defaultValue: "The jobs service did not respond successfully. Try again before changing your filters." })}
      </p>
      <button
        onClick={onRetry}
        className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium"
      >
        {t("common.retry", { ns: "common" })}
      </button>
    </div>
  );
}

function JobSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );
}
