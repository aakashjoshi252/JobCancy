const ERROR_CODE_TO_KEY = {
  UNAUTHORIZED: "unauthorized",
  FORBIDDEN: "forbidden",
  SERVER_ERROR: "serverError",
  INTERNAL_SERVER_ERROR: "serverError",
  INVALID_CREDENTIALS: "invalidCredentials",
  EMAIL_ALREADY_EXISTS: "emailAlreadyExists",
  PROFILE_UPDATE_FAILED: "profileUpdateFailed",
  JOB_NOT_FOUND: "jobNotFound",
  APPLICATION_ALREADY_SUBMITTED: "applicationAlreadySubmitted",
  UPLOAD_FAILED: "uploadFailed",
};

const messageToKey = (message = "") => {
  const normalized = message.toLowerCase();
  if (normalized.includes("unauthorized")) return "unauthorized";
  if (normalized.includes("forbidden")) return "forbidden";
  if (normalized.includes("invalid") && normalized.includes("credential")) return "invalidCredentials";
  if (normalized.includes("email") && normalized.includes("exists")) return "emailAlreadyExists";
  if (normalized.includes("profile") && normalized.includes("failed")) return "profileUpdateFailed";
  if (normalized.includes("job") && normalized.includes("not found")) return "jobNotFound";
  if (normalized.includes("already") && normalized.includes("application")) return "applicationAlreadySubmitted";
  if (normalized.includes("upload")) return "uploadFailed";
  if (normalized.includes("server")) return "serverError";
  return null;
};

export const getApiErrorKey = (error) => {
  const code = error?.response?.data?.code || error?.code;
  if (code && ERROR_CODE_TO_KEY[code]) return ERROR_CODE_TO_KEY[code];
  return messageToKey(error?.response?.data?.message || error?.message);
};

export const translateApiError = (error, t, fallbackKey = "unexpected") => {
  const key = getApiErrorKey(error) || fallbackKey;
  return t(`errors:${key}`, {
    defaultValue: error?.response?.data?.message || error?.message || t(`errors:${fallbackKey}`),
  });
};
