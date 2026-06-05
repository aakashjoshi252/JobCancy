export const formatNumber = (value, fallback = "0") => {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString("en-IN") : fallback;
};

export const formatDate = (value, options = { month: "short", year: "numeric" }) => {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("en-IN", options);
};

export const formatSalary = (salary) => {
  if (!salary) return "N/A";

  if (typeof salary === "object") {
    const salaryTypes = ["monthly", "hourly", "perPiece", "contract"];
    const selectedType = salaryTypes.find((type) => salary[type]?.min || salary[type]?.max);
    if (!selectedType) return "N/A";

    const min = salary[selectedType].min ? `Rs. ${formatNumber(salary[selectedType].min)}` : "";
    const max = salary[selectedType].max ? `Rs. ${formatNumber(salary[selectedType].max)}` : "";
    return `${selectedType}: ${min}${min && max ? " - " : ""}${max}`;
  }

  return `Rs. ${formatNumber(salary)}`;
};

export const getInitial = (value, fallback = "J") =>
  (value || fallback).trim().charAt(0).toUpperCase();
