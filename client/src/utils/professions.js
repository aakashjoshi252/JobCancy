export const getProfessionKey = (value = "") =>
  value
    .replace(/&/g, "and")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((part, index) =>
      index === 0 ? part.charAt(0).toLowerCase() + part.slice(1) : part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join("");

export const translateProfession = (value, t) => {
  if (!value) return "";
  return t(`professions:${getProfessionKey(value)}`, { defaultValue: value });
};
