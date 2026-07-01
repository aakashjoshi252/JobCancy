import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { jobsApi } from "../../../../api/api";
import { setJob } from "../../../../redux/slices/job";
import {
    canCandidateApply,
    getCompanyDisplayName,
    getJobExpiryDate,
    isExpiredJob,
} from "../../../../utils/jobVisibility";
import {
    HiHeart, HiOutlineHeart, HiShare, HiLocationMarker, HiBriefcase,
    HiClock, HiSearch, HiMail, HiGlobe, HiCurrencyDollar,
    HiCalendar, HiAcademicCap, HiDocumentText, HiOutlineInformationCircle,
    HiSparkles, HiCheckCircle, HiUsers
} from "react-icons/hi";
import { GiDiamondRing, GiGoldBar, GiJewelCrown } from "react-icons/gi";
import { FaCheckCircle, FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";
import { VscOrganization } from "react-icons/vsc";
import { MdCategory } from "react-icons/md";

// Constants
const SOCIAL_SHARES = [
    { icon: FaFacebook, label: "Facebook", color: "hover:bg-blue-100 text-blue-700", shareUrl: "https://www.facebook.com/sharer/sharer.php?u=" },
    { icon: FaTwitter, label: "Twitter", color: "hover:bg-sky-100 text-sky-700", shareUrl: "https://twitter.com/intent/tweet?url=" },
    { icon: FaLinkedin, label: "LinkedIn", color: "hover:bg-blue-100 text-blue-700", shareUrl: "https://www.linkedin.com/shareArticle?mini=true&url=" }
];

const COLOR_CLASSES = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    orange: 'text-orange-600 bg-orange-50 border-orange-200',
    red: 'text-red-600 bg-red-50 border-red-200'
};

// Utility Functions
const getDaysAgo = (date) => {
    if (!date) return "Recently";
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
};

const formatDate = (date) => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

const formatSalary = (job) => {
    if (!job?.salary) return [];
    const parts = [];
    Object.entries(job.salary).forEach(([type, range]) => {
        if (range?.min || range?.max) {
            const minStr = range.min ? `₹${Number(range.min).toLocaleString('en-IN')}` : '';
            const maxStr = range.max ? `₹${Number(range.max).toLocaleString('en-IN')}` : '';
            const rangeStr = minStr && maxStr ? `${minStr} - ${maxStr}` : (minStr || maxStr);
            const typeLabel = type === 'perPiece' ? 'Per Piece' : type.charAt(0).toUpperCase() + type.slice(1);
            parts.push({ type, label: typeLabel, range: rangeStr, min: range.min, max: range.max });
        }
    });
    return parts;
};

const getCompanyId = (companyId) => {
    if (!companyId) return null;
    if (typeof companyId === 'object' && companyId._id) return companyId._id;
    if (typeof companyId === 'string') return companyId;
    return null;
};

export default function JobDetailsPage() {
    const navigate = useNavigate();
    const { jobId } = useParams();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const isAuthenticated = Boolean(user);

    const [allJobs, setAllJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [savedJobs, setSavedJobs] = useState([]);
    const [showShareModal, setShowShareModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [copySuccess, setCopySuccess] = useState(false);

    // Fetch jobs
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                const [jobsResponse, jobResponse] = await Promise.all([
                    jobsApi.get("/"),
                    jobId ? jobsApi.get(`/${jobId}`) : Promise.resolve({ data: null }),
                ]);
                const jobsData = jobsResponse.data?.data || jobsResponse.data || [];
                setAllJobs(jobsData);

                if (jobId) {
                    const job = jobResponse.data?.data || jobResponse.data;
                    setSelectedJob(job || null);
                    if (job) dispatch(setJob(job));
                }
            } catch (error) {
                console.error("Error fetching jobs:", error);
                setSelectedJob(null);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [dispatch, jobId]);

    // Memoized filtered jobs
    const filteredJobs = useMemo(() =>
        allJobs.filter(job =>
            job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (isAuthenticated && getCompanyDisplayName(job, true)?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            job.jobLocation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.jobProfession?.toLowerCase().includes(searchQuery.toLowerCase())
        ), [allJobs, isAuthenticated, searchQuery]
    );

    // Memoized similar jobs
    const similarJobs = useMemo(() => {
        if (!selectedJob || allJobs.length === 0) return [];
        return allJobs
            .filter(job =>
                job._id !== selectedJob._id &&
                (job.jobProfession === selectedJob.jobProfession ||
                    job.jewelrySpecialization?.some(spec =>
                        selectedJob.jewelrySpecialization?.includes(spec)
                    ) ||
                    job.empType === selectedJob.empType)
            )
            .slice(0, 5);
    }, [selectedJob, allJobs]);

    const handleJobSelect = useCallback((job) => {
        setSelectedJob(job);
        dispatch(setJob(job));
        navigate(`/jobs/${job._id}`, { replace: true });
    }, [dispatch, navigate]);

    const toggleSaveJob = useCallback((jobId, e) => {
        e?.stopPropagation();
        setSavedJobs(prev =>
            prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
        );
    }, []);

    const handleCopyLink = useCallback(() => {
        navigator.clipboard.writeText(window.location.href);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    }, []);

    if (loading) return <SkeletonLoader />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                onCopyLink={handleCopyLink}
                copySuccess={copySuccess}
            />

            <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 sm:py-6 lg:py-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
                    {/* Left Sidebar */}
                    <JobListingSidebar
                        filteredJobs={filteredJobs}
                        selectedJob={selectedJob}
                        savedJobs={savedJobs}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onJobSelect={handleJobSelect}
                        onToggleSave={toggleSaveJob}
                        formatSalary={formatSalary}
                        getDaysAgo={getDaysAgo}
                        isAuthenticated={isAuthenticated}
                    />

                    {/* Right Side - Job Details */}
                    <div className="min-w-0 lg:w-3/5">
                        {selectedJob ? (
                            <JobDetailsContent
                                job={selectedJob}
                                isSaved={savedJobs.includes(selectedJob._id)}
                                isExpired={isExpiredJob(selectedJob)}
                                user={user}
                                isAuthenticated={isAuthenticated}
                                onToggleSave={toggleSaveJob}
                                onShare={() => setShowShareModal(true)}
                                onCompanyView={(companyId) => navigate(`/company/${companyId}`)}
                                similarJobs={similarJobs}
                                onSimilarJobSelect={handleJobSelect}
                                formatSalary={formatSalary}
                                formatDate={formatDate}
                                getDaysAgo={getDaysAgo}
                                navigate={navigate}
                            />
                        ) : (
                            <EmptyState onBrowse={() => navigate('/jobs')} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============ Reusable Components ============

function ShareModal({ isOpen, onClose, onCopyLink, copySuccess }) {
    if (!isOpen) return null;

    const handleSocialShare = (url, shareUrl) => {
        window.open(shareUrl + encodeURIComponent(url), '_blank', 'noopener,noreferrer,width=600,height=500');
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="max-h-[calc(100dvh-1rem)] w-full max-w-md overflow-y-auto rounded-lg bg-white p-4 shadow-2xl transition-all animate-slideUp sm:p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Share this job</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Close modal"
                    >
                        ✕
                    </button>
                </div>

                <div className="mb-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                            type="text"
                            value={window.location.href}
                            readOnly
                            className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={onCopyLink}
                            className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-all sm:w-auto ${copySuccess
                                    ? 'bg-green-600 text-white'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            {copySuccess ? (
                                <><HiCheckCircle className="inline mr-1" /> Copied!</>
                            ) : "Copy"}
                        </button>
                    </div>
                </div>

                <div className="space-y-2 mb-4">
                    {SOCIAL_SHARES.map(({ icon: Icon, label, color, shareUrl }) => (
                        <button
                            key={label}
                            onClick={() => handleSocialShare(window.location.href, shareUrl)}
                            className={`w-full p-3 bg-gray-50 ${color} rounded-lg transition-all font-medium flex items-center gap-3 hover:scale-105`}
                        >
                            <Icon className="text-xl" />
                            Share on {label}
                        </button>
                    ))}
                </div>

                <button
                    onClick={onClose}
                    className="w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

function JobListingSidebar({
    filteredJobs, selectedJob, savedJobs, searchQuery, onSearchChange,
    onJobSelect, onToggleSave, formatSalary, getDaysAgo, isAuthenticated
}) {
    return (
        <div className="min-w-0 lg:w-2/5">
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg transition-all hover:shadow-xl lg:sticky lg:top-24">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search jobs..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        />
                        <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                    </div>
                </div>

                <div className="max-h-[22rem] overflow-y-auto lg:h-[calc(100dvh-320px)] lg:max-h-none">
                    {filteredJobs.length > 0 ? (
                        filteredJobs.map((job) => (
                            <JobListItem
                                key={job._id}
                                job={job}
                                isSelected={selectedJob?._id === job._id}
                                isSaved={savedJobs.includes(job._id)}
                                onSelect={onJobSelect}
                                onToggleSave={onToggleSave}
                                formatSalary={formatSalary}
                                getDaysAgo={getDaysAgo}
                                isAuthenticated={isAuthenticated}
                            />
                        ))
                    ) : (
                        <div className="p-8 text-center">
                            <HiSearch className="text-5xl text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No jobs match your search</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function JobListItem({
    job, isSelected, isSaved, onSelect, onToggleSave, formatSalary, getDaysAgo, isAuthenticated
}) {
    const salaryParts = formatSalary(job);
    const companyName = getCompanyDisplayName(job, isAuthenticated);

    return (
        <div
            onClick={() => onSelect(job)}
            className={`p-5 border-b border-gray-100 cursor-pointer transition-all duration-200 ${isSelected
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-600 shadow-sm'
                    : 'hover:bg-blue-50/50'
                }`}
        >
            <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900 line-clamp-1 flex-1">
                    {job.title}
                </h3>
                <button
                    onClick={(e) => onToggleSave(job._id, e)}
                    className="ml-2 transition-all transform hover:scale-110"
                    aria-label={isSaved ? "Remove from saved" : "Save job"}
                >
                    {isSaved ? (
                        <HiHeart className="text-red-500 text-xl" />
                    ) : (
                        <HiOutlineHeart className="text-gray-300 hover:text-red-500 text-xl" />
                    )}
                </button>
            </div>

            <p className="text-sm text-gray-600 mb-2 flex items-center gap-1 truncate">
                <VscOrganization className="text-blue-500 flex-shrink-0" />
                <span className="truncate">{companyName}</span>
            </p>

            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-2">
                <span className="flex items-center gap-1">
                    <HiLocationMarker className="text-orange-500" />
                    {job.jobLocation}
                </span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="flex items-center gap-1">
                    <HiBriefcase className="text-blue-500" />
                    {job.empType || 'Full-time'}
                </span>
            </div>

            {job.jobProfession && (
                <div className="mb-2">
                    <span className="text-xs px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                        {job.jobProfession}
                    </span>
                </div>
            )}

            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                    <HiClock />
                    {getDaysAgo(job.createdAt)}
                </span>
                {salaryParts.length > 0 && (
                    <span className="text-sm font-bold text-blue-600">
                        {salaryParts[0].range}
                    </span>
                )}
            </div>
        </div>
    );
}

function JobDetailsContent({
    job, isSaved, isExpired, user, isAuthenticated, onToggleSave, onShare, onCompanyView, similarJobs,
    onSimilarJobSelect, formatSalary, formatDate, getDaysAgo, navigate
}) {
    const companyId = getCompanyId(job.companyId);
    const companyName = getCompanyDisplayName(job, isAuthenticated);
    const expiryDate = getJobExpiryDate(job);
    const applyLabel = !isAuthenticated
        ? "Login to Apply"
        : user?.role === "candidate"
            ? "Apply for this Position"
            : "Candidate Account Required";
    const canApply = canCandidateApply(job, user);
    const handleApply = () => {
        if (!isAuthenticated) {
            navigate("/login", { state: { from: `/jobs/${job._id}` } });
            return;
        }

        if (user?.role !== "candidate") return;
        navigate(`/candidate/job/apply/${job._id}`);
    };

    return (
        <div className="space-y-6">
            {/* Main Job Card */}
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg transition-all hover:shadow-xl">
                <div className="p-4 sm:p-6 lg:p-8">
                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                                {job.title}
                            </h1>
                            <div className="flex items-center gap-3 flex-wrap">
                                <p className="text-gray-600 flex items-center gap-2 font-medium">
                                    <VscOrganization className="text-blue-500" />
                                    {companyName}
                                </p>
                                <span className={`text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1 ${isExpired
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-green-100 text-green-700'
                                    }`}>
                                    <FaCheckCircle className="text-xs" />
                                    {isExpired ? 'Expired' : 'Active'}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <ActionButton
                                onClick={(e) => onToggleSave(job._id, e)}
                                icon={isSaved ? HiHeart : HiOutlineHeart}
                                iconColor={isSaved ? "text-red-500" : "text-gray-400"}
                                label="Save job"
                                hoverClass="hover:bg-red-50 hover:border-red-300"
                            />
                            <ActionButton
                                onClick={onShare}
                                icon={HiShare}
                                iconColor="text-gray-400"
                                label="Share job"
                                hoverClass="hover:bg-blue-50 hover:border-blue-300"
                            />
                        </div>
                    </div>

                    {/* Quick Info Grid */}
                    <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <InfoCard icon={<HiBriefcase />} label="Employment" value={job.empType || 'Full-time'} color="blue" />
                        <InfoCard icon={<HiAcademicCap />} label="Experience" value={job.experience || 'Fresher'} color="green" />
                        <InfoCard icon={<HiUsers />} label="Openings" value={job.openings || 1} color="purple" />
                        <InfoCard
                            icon={<HiCalendar />}
                            label="Deadline"
                            value={expiryDate ? formatDate(expiryDate) : 'Rolling'}
                            color={isExpired ? "red" : "orange"}
                        />
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-3 mb-8">
                        <Badge icon={GiJewelCrown} text={job.jobProfession || 'Not specified'} color="blue" />
                        <Badge icon={HiLocationMarker} text={job.jobLocation} color="orange" />
                    </div>

                    {/* Salary Section */}
                    {formatSalary(job).length > 0 && (
                        <SalarySection salaryParts={formatSalary(job)} />
                    )}

                    {/* Job Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <JobDetailsList job={job} />
                        {job.jewelrySpecialization?.length > 0 && (
                            <SpecializationsList specializations={job.jewelrySpecialization} />
                        )}
                    </div>

                    {/* Skills */}
                    {job.skills?.length > 0 && <SkillsList skills={job.skills} />}

                    {/* Description */}
                    {job.description && <DescriptionSection description={job.description} />}

                    {/* Additional Requirements */}
                    {job.additionalRequirement && <RequirementsSection requirements={job.additionalRequirement} />}

                    {/* Apply Button */}
                    <ApplyButton
                        onClick={handleApply}
                        disabled={isExpired || (isAuthenticated && !canApply)}
                        label={isExpired ? "Job Expired" : applyLabel}
                    />

                    <p className="text-xs text-gray-500 text-center mt-4 flex items-center justify-center gap-1">
                        <HiClock />
                        Posted {getDaysAgo(job.createdAt)}
                    </p>
                </div>
            </div>

            {/* Company Info */}
            {isAuthenticated && companyId && (
                <CompanySection
                    companyName={companyName}
                    companyId={companyId}
                    companyEmail={job.companyEmail}
                    companyWebsite={job.companyWebsite}
                    companyAddress={job.companyAddress}
                    companyDescription={job.companyDescription}
                    onViewDetails={onCompanyView}
                />
            )}

            {/* Similar Jobs */}
            {similarJobs.length > 0 && (
                <SimilarJobsSection
                    similarJobs={similarJobs}
                    onSelect={onSimilarJobSelect}
                    formatSalary={formatSalary}
                    isAuthenticated={isAuthenticated}
                />
            )}
        </div>
    );
}

function ActionButton({ onClick, icon: Icon, iconColor, label, hoverClass }) {
    return (
        <button
            onClick={onClick}
            className={`p-3 border border-gray-300 rounded-lg transition-all transform hover:scale-105 ${hoverClass}`}
            aria-label={label}
        >
            <Icon className={`${iconColor} text-xl`} />
        </button>
    );
}

function Badge({ icon: Icon, text, color }) {
    const colors = {
        blue: "bg-blue-50 text-blue-700",
        orange: "bg-orange-50 text-orange-700",
        purple: "bg-purple-50 text-purple-700",
        green: "bg-green-50 text-green-700"
    };

    return (
        <span className={`inline-flex items-center gap-2 px-4 py-2 ${colors[color]} rounded-full text-sm font-medium`}>
            <Icon />
            {text}
        </span>
    );
}

function SalarySection({ salaryParts }) {
    const typeColors = {
        monthly: 'bg-green-100 text-green-700',
        hourly: 'bg-blue-100 text-blue-700',
        perPiece: 'bg-purple-100 text-purple-700',
        contract: 'bg-orange-100 text-orange-700'
    };

    return (
        <div className="mb-8 rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 p-4 sm:p-6">
            <p className="text-sm text-gray-700 mb-4 flex items-center gap-2 font-semibold">
                <HiCurrencyDollar className="text-blue-600 text-lg" />
                Salary Package
            </p>
            <div className="space-y-3">
                {salaryParts.map((part, idx) => (
                    <div key={idx} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-sm text-gray-700 font-medium">{part.label}:</span>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-lg font-bold text-blue-600">{part.range}</span>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${typeColors[part.type] || 'bg-gray-100 text-gray-700'}`}>
                                {part.label}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function JobDetailsList({ job }) {
    const details = [
        { icon: HiLocationMarker, label: "Location", value: job.jobLocation, color: "text-orange-500" },
        { icon: HiBriefcase, label: "Employment Type", value: job.empType, color: "text-blue-500" },
        { icon: HiAcademicCap, label: "Experience", value: job.experience, color: "text-green-500" }
    ];

    return (
        <div>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                <MdCategory className="text-blue-600" />
                Job Details
            </h3>
            <div className="space-y-4">
                {details.map((detail, idx) => (
                    <DetailItem key={idx} {...detail} />
                ))}
            </div>
        </div>
    );
}

function SpecializationsList({ specializations }) {
    return (
        <div>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                <GiGoldBar className="text-yellow-600" />
                Specializations
            </h3>
            <div className="flex flex-wrap gap-2">
                {specializations.map((spec, idx) => (
                    <span key={idx} className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-200 transition">
                        {spec}
                    </span>
                ))}
            </div>
        </div>
    );
}

function SkillsList({ skills }) {
    return (
        <div className="mb-8">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                    <span key={idx} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                        {skill}
                    </span>
                ))}
            </div>
        </div>
    );
}

function DescriptionSection({ description }) {
    return (
        <div className="mb-8">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                <HiDocumentText className="text-blue-600" />
                Job Description
            </h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {description}
                </p>
            </div>
        </div>
    );
}

function RequirementsSection({ requirements }) {
    return (
        <div className="mb-8">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                <HiOutlineInformationCircle className="text-blue-600" />
                Additional Requirements
            </h3>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <p className="text-gray-700">{requirements}</p>
            </div>
        </div>
    );
}

function ApplyButton({ onClick, disabled = false, label = "Apply for this Position" }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-full rounded-lg py-3 text-base font-bold shadow-lg transition-all sm:py-4 sm:text-lg ${
                disabled
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transform hover:scale-[1.02]"
            }`}
        >
            {label}
        </button>
    );
}

function CompanySection({ companyName, companyId, companyEmail, companyWebsite, companyAddress, companyDescription, onViewDetails }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg transition-all hover:shadow-xl sm:p-6 lg:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <VscOrganization className="text-blue-600" />
                About the Company
            </h3>
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                    <VscOrganization className="text-4xl text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-gray-900 mb-2 text-lg">
                        {companyName}
                    </h4>
                    {companyDescription && (
                        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                            {companyDescription}
                        </p>
                    )}
                    <div className="mb-4 flex flex-wrap gap-3 text-sm sm:gap-4">
                        {companyEmail && (
                            <a href={`mailto:${companyEmail}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition">
                                <HiMail className="text-lg" />
                                {companyEmail}
                            </a>
                        )}
                        {companyWebsite && (
                            <a
                                href={companyWebsite.startsWith('http') ? companyWebsite : `https://${companyWebsite}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition"
                            >
                                <HiGlobe className="text-lg" />
                                Visit Website
                            </a>
                        )}
                        {companyAddress && (
                            <span className="flex items-center gap-2 text-gray-600">
                                <HiLocationMarker className="text-orange-500 text-lg" />
                                {companyAddress}
                            </span>
                        )}
                    </div>
                    {companyId && (
                        <button
                            onClick={() => onViewDetails(companyId)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold transform hover:scale-105"
                        >
                            View Company Details
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function SimilarJobsSection({ similarJobs, onSelect, formatSalary, isAuthenticated }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg transition-all hover:shadow-xl sm:p-6 lg:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <HiSparkles className="text-yellow-500" />
                Similar Jobs
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {similarJobs.map((job) => (
                    <div
                        key={job._id}
                        onClick={() => onSelect(job)}
                        className="border border-gray-200 rounded-lg p-5 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group"
                    >
                        <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                            {job.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                            <VscOrganization className="text-blue-500 flex-shrink-0" />
                            {getCompanyDisplayName(job, isAuthenticated)}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <HiLocationMarker className="text-orange-500" />
                                {job.jobLocation}
                            </span>
                            <span className="font-semibold text-blue-600">
                                {formatSalary(job)[0]?.range || 'Not specified'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function EmptyState({ onBrowse }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-lg animate-fadeIn sm:p-10 lg:p-16">
            <GiDiamondRing className="text-7xl text-gray-300 mx-auto mb-6" />
            <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl">Select a Job to View Details</h2>
            <p className="mb-8 text-base text-gray-600 sm:text-lg">
                Choose a job from the left panel to see detailed information
            </p>
            <button
                onClick={onBrowse}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-semibold transform hover:scale-105"
            >
                Browse All Jobs
            </button>
        </div>
    );
}

function InfoCard({ icon, label, value, color }) {
    return (
        <div className={`p-4 rounded-lg border ${COLOR_CLASSES[color] || COLOR_CLASSES.blue} transition-all hover:shadow-md`}>
            <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{icon}</span>
                <span className="text-xs font-semibold text-gray-700">{label}</span>
            </div>
            <p className="font-bold text-sm truncate">{value}</p>
        </div>
    );
}

function DetailItem({ icon: Icon, label, value, color }) {
    return (
        <div className="flex items-start gap-3">
            <Icon className={`mt-0.5 text-lg flex-shrink-0 ${color}`} />
            <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{value || 'Not specified'}</p>
            </div>
        </div>
    );
}

// ============ Skeleton Loader ============

function SkeletonLoader() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-3 sm:p-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar Skeleton */}
                    <div className="min-w-0 lg:w-2/5">
                        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg lg:sticky lg:top-24">
                            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                                <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                            </div>
                            <div className="max-h-[22rem] overflow-y-auto lg:h-[calc(100dvh-320px)] lg:max-h-none">
                                {[...Array(5)].map((_, idx) => (
                                    <div key={idx} className="p-5 border-b border-gray-100">
                                        <div className="mb-3">
                                            <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse mb-2"></div>
                                            <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                                        </div>
                                        <div className="space-y-2 mb-3">
                                            <div className="h-3 bg-gray-100 rounded w-4/5 animate-pulse"></div>
                                            <div className="h-3 bg-gray-100 rounded w-3/5 animate-pulse"></div>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div className="h-3 bg-gray-100 rounded w-1/4 animate-pulse"></div>
                                            <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Skeleton */}
                    <div className="min-w-0 space-y-6 lg:w-3/5">
                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg animate-pulse sm:p-6 lg:p-8">
                            <div className="h-8 bg-gray-200 rounded w-2/3 animate-pulse mb-4"></div>
                            <div className="flex gap-3 mb-6">
                                <div className="h-6 bg-gray-100 rounded w-1/4 animate-pulse"></div>
                                <div className="h-6 bg-gray-100 rounded w-1/5 animate-pulse"></div>
                            </div>
                            <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                                {[...Array(4)].map((_, idx) => (
                                    <div key={idx} className="p-4 rounded-lg border border-gray-200">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse mb-2"></div>
                                        <div className="h-5 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                                    </div>
                                ))}
                            </div>
                            <div className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
