const ACTIVE_STATUSES = ["active", "Open"];
const PAUSED_STATUSES = ["paused", "Paused"];
const CLOSED_STATUSES = ["closed", "Closed"];
const EXPIRED_STATUSES = ["expired"];
const DRAFT_STATUSES = ["draft"];

const STATUS_ALIASES = {
  Open: "active",
  Paused: "paused",
  Closed: "closed",
  active: "active",
  paused: "paused",
  closed: "closed",
  expired: "expired",
  draft: "draft",
};

const normalizeJobStatus = (status) => STATUS_ALIASES[status] || status || "active";

const getJobExpiryDate = (job) => {
  const source = job?._doc || job || {};
  return source.expiresAt || source.deadline || null;
};

const isJobExpired = (job, now = new Date()) => {
  if (!job) return false;
  const source = job?._doc || job;
  const status = normalizeJobStatus(source.status);
  const expiry = getJobExpiryDate(source);

  return Boolean(
    status === "expired"
    || source.isExpired
    || (expiry && new Date(expiry).getTime() <= now.getTime())
  );
};

const notExpiredClauses = (now = new Date()) => [
  { isExpired: { $ne: true } },
  { status: { $nin: EXPIRED_STATUSES } },
  {
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gt: now } },
    ],
  },
  {
    $or: [
      { deadline: { $exists: false } },
      { deadline: null },
      { deadline: { $gt: now } },
    ],
  },
];

const buildPublicJobsQuery = (now = new Date()) => ({
  $and: [
    {
      $or: [
        { status: { $in: ACTIVE_STATUSES } },
        { status: { $exists: false } },
        { status: null },
      ],
    },
    {
      $or: [
        { approvalStatus: "Approved" },
        { approvalStatus: { $exists: false } },
        { approvalStatus: null },
      ],
    },
    ...notExpiredClauses(now),
  ],
});

const buildExpiredJobsQuery = (now = new Date()) => ({
  $or: [
    { status: { $in: EXPIRED_STATUSES } },
    { isExpired: true },
    { expiresAt: { $lte: now } },
    { deadline: { $lte: now } },
  ],
});

const buildActiveStatusQuery = () => ({
  $or: [
    { status: { $in: ACTIVE_STATUSES } },
    { status: { $exists: false } },
    { status: null },
  ],
});

const buildPausedStatusQuery = () => ({ status: { $in: PAUSED_STATUSES } });
const buildClosedStatusQuery = () => ({ status: { $in: CLOSED_STATUSES } });
const buildDraftStatusQuery = () => ({ status: { $in: DRAFT_STATUSES } });

const isPubliclyVisibleJob = (job, now = new Date()) => {
  if (!job) return false;
  const source = job?._doc || job;
  const status = normalizeJobStatus(source.status);
  const approvalStatus = source.approvalStatus || "Approved";

  return status === "active"
    && approvalStatus === "Approved"
    && !isJobExpired(source, now);
};

const getCompanyName = (job) =>
  job.companyName
  || job.companyId?.companyName
  || job.company?.companyName
  || null;

const getOwnerId = (job) => {
  const recruiter = job?.recruiterId;
  if (!recruiter) return null;
  return String(recruiter._id || recruiter);
};

const isAdminViewer = (viewer) => viewer?.role === "admin";
const isOwnerRecruiter = (job, viewer) =>
  viewer?.role === "recruiter" && getOwnerId(job) === String(viewer._id);

const toPlainJob = (job) => (typeof job?.toObject === "function" ? job.toObject() : { ...(job || {}) });

const buildSafePublicJob = (job, computed) => ({
  _id: job._id,
  title: job.title,
  description: job.description,
  jobProfession: job.jobProfession,
  empType: job.empType,
  jobLocation: job.jobLocation,
  salary: job.salary,
  experience: job.experience,
  openings: job.openings,
  skills: job.skills,
  additionalRequirement: job.additionalRequirement,
  createdAt: job.createdAt,
  updatedAt: job.updatedAt,
  expiresAt: computed.expiresAt,
  deadline: computed.expiresAt,
  status: computed.status,
  isExpired: computed.isExpired,
  approvalStatus: job.approvalStatus,
  companyMasked: true,
  companyLabel: "Login to view company",
});

const sanitizeCompanyForAuthenticatedViewer = (company) => {
  if (!company || typeof company !== "object") return company;
  return {
    _id: company._id,
    companyName: company.companyName,
    location: company.location,
    logo: company.logo,
    uploadLogo: company.uploadLogo,
  };
};

const sanitizeJobForViewer = (jobDoc, viewer = null, options = {}) => {
  const job = toPlainJob(jobDoc);
  const isExpired = isJobExpired(job);
  const expiresAt = getJobExpiryDate(job);
  const status = isExpired ? "expired" : normalizeJobStatus(job.status);
  const computed = { isExpired, expiresAt, status };

  if (!viewer) {
    return buildSafePublicJob(job, computed);
  }

  if (isAdminViewer(viewer) || isOwnerRecruiter(job, viewer) || options.includePrivate) {
    return {
      ...job,
      expiresAt,
      deadline: expiresAt,
      status,
      isExpired,
    };
  }

  return {
    ...buildSafePublicJob(job, computed),
    companyMasked: false,
    companyLabel: getCompanyName(job),
    companyName: getCompanyName(job),
    companyId: sanitizeCompanyForAuthenticatedViewer(job.companyId),
  };
};

module.exports = {
  ACTIVE_STATUSES,
  PAUSED_STATUSES,
  CLOSED_STATUSES,
  EXPIRED_STATUSES,
  normalizeJobStatus,
  getJobExpiryDate,
  isJobExpired,
  isPubliclyVisibleJob,
  buildPublicJobsQuery,
  buildExpiredJobsQuery,
  buildActiveStatusQuery,
  buildPausedStatusQuery,
  buildClosedStatusQuery,
  buildDraftStatusQuery,
  sanitizeJobForViewer,
};
