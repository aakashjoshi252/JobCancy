export const normalizeJobStatus = (status) => {
  const aliases = {
    Open: "active",
    Paused: "paused",
    Closed: "closed",
    active: "active",
    paused: "paused",
    closed: "closed",
    expired: "expired",
    draft: "draft",
  };

  return aliases[status] || status || "active";
};

export const getJobExpiryDate = (job) => job?.expiresAt || job?.deadline || null;

export const isExpiredJob = (job) => {
  const expiry = getJobExpiryDate(job);
  return Boolean(
    job?.isExpired
    || normalizeJobStatus(job?.status) === "expired"
    || (expiry && new Date(expiry).getTime() <= Date.now())
  );
};

export const getDisplayJobStatus = (job) =>
  isExpiredJob(job) ? "expired" : normalizeJobStatus(job?.status);

export const getCompanyDisplayName = (job, isAuthenticated = false) => {
  if (!isAuthenticated) {
    return job?.companyLabel || "Login to view company";
  }

  if (job?.companyName) return job.companyName;
  if (job?.companyId?.companyName) return job.companyId.companyName;
  if (job?.companyLabel) return job.companyLabel;
  return "Company";
};

export const canCandidateApply = (job, user) =>
  user?.role === "candidate"
  && getDisplayJobStatus(job) === "active"
  && !isExpiredJob(job);
