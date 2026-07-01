import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { jobsApi, subscriptionApi } from "../../../api/api";
import { useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { GiDiamondRing } from "react-icons/gi";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { FaCheckCircle } from "react-icons/fa";
import { translateProfession } from "../../../utils/professions";

/* ================= INITIAL VALUES (MATCHING NEW SCHEMA) ================= */
const initialValues = {
  title: "",
  description: "",
  jobProfession: "",
  jewelrySpecialization: [],
  jobLocation: "",
  empType: "Full-time",
  experience: "Fresher-0",
  salary: {
    monthly: { min: "", max: "" },
    hourly: { min: "", max: "" },
    perPiece: { min: "", max: "" },
    contract: { min: "", max: "" }
  },
  openings: 1,
  deadline: "",
  skills: "",
  additionalRequirement: "",
  companyName: "",
  companyEmail: "",
  companyAddress: "",
  companyWebsite: "",
  companyDescription: "",
  companyId: "",
  recruiterId: "",
};

/* ================= JOB TITLE SUGGESTIONS ================= */
const JOB_TITLE_SUGGESTIONS = [
  "Filler", "Polisher", "Gold/Silver Smith", "Micro Setter (Diamond/Gem)",
  "Hand Setter (Diamond/Gem)", "Wax Setter (Diamond/Gem)", "Caster/Casting",
  "Model Maker/Wax Carver", "Waxing/Wax Puller", "Hand Engraver/Stamping",
  "Chain Maker", "Sample Maker (Sample Lining Executive)", "Helper/Training Staff",
  "Rhodium/Enamal", "CAM Machine Operator", "CAM Worker",
  "General Manager / Chief Manager", "Sr.Production Manager", "Asst.Production Manager",
  "Production Coordinator / PPC", "Production Supervisor", "Operations Manager",
  "Factory Coordinator / Manager", "Loss Control Manager", "Sourcing Manager / Executive(Gold / Gems)",
  "Inventory Executive / Stock Manager", "Finding Executive", "Store Manager",
  "Diamond Baging Executive", "CAD Designer", "Manual Designer",
  "Jewellery Merchandiser", "Laser Machine Operator / CNC", "Visual Merchandiser(VM)",
  "PD / R & D", "Final QC Analyst / Specialist", "Setting QC", "Filling QC",
  "Polish QC", "Metal QC", "Diamond QC", "Diamond Assorter / Grader",
  "Analytical Tester", "Color Stone Executive / Grader", "HR Manager / Executive",
  "HR Plant Operations", "Admin Work", "Data Entry Operator", "Central / Gold Control Staff",
  "EXIM Manager / Executive", "Sr.Accountant", "Jr.Accountant", "Purchase Executive",
  "Packing Department Staff", "Casting Manager", "Surveillance Executive",
  "Maintanance/Technical Staff", "MIS Executive", "Reception Staff",
  "Marketing Head Executive", "Marketing Executive", "Sales Head Executive",
  "Sales Executive", "Order Executive", "Jewellery Consultant", "Shop Manager",
  "Accounts Assistant", "Assorter", "B2B Sales Manager (International)",
  "CAD Designer (Export)", "CAD HOD", "Corel Designer (Local Market)",
  "Creative Graphic Designer", "Data Entry Operator (Diamond Department)",
  "Gold Central Accountant", "Gold Central HOD (EMR Software)",
  "Gold Central HOD (Gati Software)", "Graphic Designer", "HR Assistant",
  "IGI Data Operator (Gati)", "MIS Executive", "Marketing Back Office (EMR / Gati)",
  "PD Assistant", "PD Merchandiser", "Production Manager", "QA Manager",
  "Sales Executive (USA, Europe, Middle East)", "Senior Assorter", "Senior CRM",
];

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Remote", "Internship /Trainee"];

const EXPERIENCE_LEVELS = [
  "Fresher-0", "1-year", "2-years", "3-years", "4-years", "5-years",
  "6-years", "7-years", "8-years", "9-years", "10+ years"
];

const JOB_PROFESSIONS = [
  "Filler", "Accounts Assistant", "Analytical Tester", "Assorter",
  "Asst.Production Manager", "B2B Sales Manager (International)",
  "Back Office Executive", "CAD Designer", "CAD Designer (Export)",
  "CAD HOD", "CAM Machine Operator", "CAM Worker", "Caster/Casting",
  "Chain Maker", "Color Stone Executive / Grader", "Corel Designer (local Market)",
  "Creative Graphic Designer", "Data Entry Operator", "Data Entry Operator (Diamond Department)",
  "Diamond Assorter / Grader", "Diamond Baging Executive", "Diamond QC",
  "EXIM Manager / Executive", "Final QC Analyst / Specialist", "Finding Executive",
  "General Manager / Chief Manager", "Gold Central Accountant",
  "Gold Central HOD (EMR Software)", "Gold Central HOD (Gati Software)",
  "Gold/Silver Smith", "Graphic Designer", "Hand Engraver/Stamping",
  "Hand Setter (Diamond/Gem)", "Helper/Training Staff", "HOD", "HR Assistant",
  "HR Manager / Executive", "HR Plant Operations", "IGI Data Operator (Gati)",
  "Inventory Executive / Stock Manager", "Jewellery Consultant", "Jewellery Merchandiser",
  "Laser Machine Operator / CNC", "Loss Control Manager", "MIS Executive",
  "Maintanance/Technical Staff", "Manual Designer", "Marketing Back Office (EMR / Gati)",
  "Marketing Executive", "Marketing Head Executive", "Micro Setter (Diamond/Gem)",
  "Model Maker/Wax Carver", "PD / R & D", "PD Assistant", "PD Merchandiser",
  "Polish QC", "Polisher", "Production Coordinator / PPC", "Production Manager",
  "Production Supervisor", "Purchase Executive", "QA Manager", "Reception Staff",
  "Rhodium/Enamal", "Sample Maker (Sample Lining Executive)", "Sales Executive",
  "Sales Executive (USA, Europe, Middle East)", "Sales Head Executive", "Senior Assorter",
  "Senior CRM", "Setting QC", "Shop Manager", "Sourcing Manager / Executive(Gold / Gems)",
  "Store Manager", "Surveillance Executive", "Visual Merchandiser(VM)",
  "Waxing/Wax Puller", "Wax Setter (Diamond/Gem)",
];

/* ================= VALIDATION ================= */
const validate = (values, t = (key, options = {}) => options.defaultValue || key) => {
  const errors = {};

  if (!values.title) errors.title = t("validation:jobTitleRequired", { defaultValue: "Job title is required" });
  if (!values.description) errors.description = t("validation:jobDescriptionRequired", { defaultValue: "Job description is required" });
  if (!values.jobProfession) errors.jobProfession = t("validation:jobProfessionRequired", { defaultValue: "Job profession is required" });
  if (!values.jobLocation) errors.jobLocation = t("validation:jobLocationRequired", { defaultValue: "Job location is required" });
  if (!values.companyName) errors.companyName = t("validation:companyNameRequired", { defaultValue: "Company name is required" });
  if (!values.companyEmail) {
    errors.companyEmail = t("validation:emailRequired", { defaultValue: "Company email is required" });
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.companyEmail)) {
    errors.companyEmail = t("validation:emailInvalid", { defaultValue: "Invalid email address" });
  }
  if (!values.skills) {
    errors.skills = t("validation:skillsRequired", { defaultValue: "Skills are required" });
  }
  const hasSalary = Object.values(values.salary).some(
    type => type.min || type.max
  );
  if (!hasSalary) {
    errors.salary = "At least one salary type must be specified";
  }
  Object.entries(values.salary).forEach(([type, range]) => {
    if (range.min && range.max && Number(range.min) >= Number(range.max)) {
      errors[`salary_${type}`] = `Maximum must be greater than minimum for ${type}`;
    }
  });
  if (values.deadline) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(values.deadline);
    if (deadlineDate < today) {
      errors.deadline = "Deadline must be in the future";
    }
  }
  if (values.openings < 1) {
    errors.openings = "Openings must be at least 1";
  }
  return errors;
};

export default function JobPost() {
  const { t } = useTranslation(["jobs", "validation", "professions", "errors", "subscription"]);
  const user = useSelector((state) => state.auth.user);
  const company = useSelector((state) => state.company.data);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [skillsInput, setSkillsInput] = useState("");
  const [activeSalaryType, setActiveSalaryType] = useState("monthly");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [subscriptionUsage, setSubscriptionUsage] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [titleInput, setTitleInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let active = true;

    subscriptionApi
      .get("/usage")
      .then((response) => {
        if (active) setSubscriptionUsage(response.data.data || null);
      })
      .catch((error) => {
        if (active) {
          setSubscriptionUsage({
            hasSubscription: false,
            canPost: false,
            errorCode: error.response?.data?.code,
          });
        }
      })
      .finally(() => {
        if (active) setSubscriptionLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitleInput(value);
    formik.setFieldValue('title', value);

    if (value.length > 0) {
      const filtered = JOB_TITLE_SUGGESTIONS.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setTitleInput(suggestion);
    formik.setFieldValue('title', suggestion);
    setShowSuggestions(false);
  };

  const formik = useFormik({
    initialValues: {
      ...initialValues,
      recruiterId: user?._id || "",
      companyId: company?._id || "",
      companyName: company?.companyName || "",
      companyEmail: company?.contactEmail || "",
      companyAddress: company?.location || "",
      companyWebsite: company?.website || "",
      companyDescription: company?.description || "",
      jobLocation: company?.location || "Mumbai, Maharashtra",
    },
    enableReinitialize: true,
    validate: (values) => validate(values, t),
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      setSubmitError("");
      try {
        if (!subscriptionUsage?.canPost) {
          setSubmitError(
            subscriptionUsage?.hasSubscription
              ? t("subscription:limitOverBody", { defaultValue: "Your monthly job posting limit is over. Upgrade or renew to continue." })
              : t("subscription:beforePostBody", { defaultValue: "Choose a subscription plan before posting jobs." })
          );
          setLoading(false);
          return;
        }

        const skillsArray = values.skills
          ? values.skills.split(",").map((s) => s.trim()).filter(Boolean)
          : [];
        const processedSalary = {};
        Object.entries(values.salary).forEach(([type, range]) => {
          const processedRange = {};
          if (range.min && range.min.toString().trim() !== '') {
            processedRange.min = Number(range.min);
          }
          if (range.max && range.max.toString().trim() !== '') {
            processedRange.max = Number(range.max);
          }
          if (Object.keys(processedRange).length > 0) {
            processedSalary[type] = processedRange;
          }
        });
        const payload = {
          title: values.title.trim(),
          description: values.description.trim(),
          jobProfession: values.jobProfession,
          jobLocation: values.jobLocation.trim(),
          empType: values.empType,
          experience: values.experience,
          salary: processedSalary,
          openings: Number(values.openings),
          ...(values.deadline && { deadline: new Date(values.deadline) }),
          skills: skillsArray,
          ...(values.additionalRequirement?.trim() && { additionalRequirement: values.additionalRequirement.trim() }),
          companyId: values.companyId,
          recruiterId: values.recruiterId,
          companyName: values.companyName.trim(),
          companyEmail: values.companyEmail.trim().toLowerCase(),
          ...(values.companyAddress?.trim() && { companyAddress: values.companyAddress.trim() }),
          ...(values.companyWebsite?.trim() && { companyWebsite: values.companyWebsite.trim() }),
          ...(values.companyDescription?.trim() && { companyDescription: values.companyDescription.trim() }),
        };
        const response = await jobsApi.post("/create", payload);
        if (response.data.success) {
          setSubmitSuccess(true);
          setTimeout(() => {
            resetForm();
            setSkillsInput("");
            setTitleInput("");
            setSubmitSuccess(false);
            navigate("/recruiter/company/postedjobs");
          }, 2000);
        }
      } catch (error) {
        console.error("Error posting job:", error);
        setSubmitError(error.response?.data?.message || "Failed to post job. Please try again.");
        setTimeout(() => setSubmitError(""), 5000);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleSkillsChange = (e) => {
    const inputValue = e.target.value;
    setSkillsInput(inputValue);
    formik.setFieldValue('skills', inputValue);
  };

  const handleSalaryChange = (type, field, value) => {
    formik.setFieldValue(`salary.${type}.${field}`, value);
  };

  const PreviewModal = () => {
    if (!showPreview) return null;
    const formatSalaryPreview = () => {
      const parts = [];
      Object.entries(formik.values.salary).forEach(([type, range]) => {
        if (range.min || range.max) {
          const minStr = range.min ? `₹${Number(range.min).toLocaleString('en-IN')}` : '';
          const maxStr = range.max ? `₹${Number(range.max).toLocaleString('en-IN')}` : '';
          const rangeStr = minStr && maxStr ? `${minStr} - ${maxStr}` : (minStr || maxStr);
          const typeLabel = type === 'perPiece' ? 'Per Piece' : type;
          parts.push(`${typeLabel}: ${rangeStr}`);
        }
      });
      return parts.length > 0 ? parts.join(' • ') : 'Not specified';
    };
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-xl px-6 py-4 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Job Preview</h3>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{formik.values.title || "Job Title"}</h2>
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {formik.values.jobLocation || "Location"}
              </span>
              <span>•</span>
              <span>{formik.values.empType}</span>
              <span>•</span>
              <span>{formik.values.experience}</span>
            </div>
            <div className="prose max-w-none mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Job Description</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{formik.values.description || "No description provided"}</p>
            </div>
            {formik.values.jewelrySpecialization?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Specializations</h4>
                <div className="flex flex-wrap gap-2">
                  {formik.values.jewelrySpecialization.map((spec) => (
                    <span key={spec} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <div>
                  <span className="text-xs text-gray-500">Salary</span>
                  <p className="text-sm font-bold text-blue-600">
                    {formatSalaryPreview()}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xs text-gray-500">Company</span>
                  <p className="text-sm font-semibold text-gray-900">{formik.values.companyName || "Company Name"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!company) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-3 py-10 sm:px-4 sm:py-20">
        <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-5 text-center shadow-sm sm:p-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <GiDiamondRing className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">No Company Found</h2>
          <p className="text-sm text-gray-500 mb-6">Create your company profile first to post jobs</p>
          <button
            onClick={() => navigate("/recruiter/company/registration")}
            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium text-sm shadow-sm hover:bg-blue-700 transition"
          >
            Register Company
          </button>
        </div>
      </div>
    );
  }

  if (subscriptionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-3 py-10 sm:px-4 sm:py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!subscriptionUsage?.hasSubscription || !subscriptionUsage?.canPost) {
    const limitOver = subscriptionUsage?.hasSubscription && !subscriptionUsage?.canPost;

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-3 py-10 sm:px-4 sm:py-20">
        <div className="w-full max-w-lg rounded-lg border border-gray-200 bg-white p-5 text-center shadow-sm sm:p-8">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-teal-50 flex items-center justify-center">
            <HiOutlineInformationCircle className="h-9 w-9 text-teal-700" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
            {limitOver
              ? t("subscription:limitOverTitle", { defaultValue: "Job post limit reached" })
              : t("subscription:beforePostTitle", { defaultValue: "Subscription required" })}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {limitOver
              ? t("subscription:limitOverBody", { defaultValue: "Your monthly job posting limit is over. Upgrade or renew to continue." })
              : t("subscription:beforePostBody", { defaultValue: "Choose a subscription plan before posting jobs." })}
          </p>
          <button
            type="button"
            onClick={() => navigate("/recruiter/subscription")}
            className="w-full bg-teal-700 text-white py-2.5 px-4 rounded-lg font-medium text-sm shadow-sm hover:bg-teal-800 transition"
          >
            {t("subscription:viewPlans", { defaultValue: "View Plans" })}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-6 sm:px-8">
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <GiDiamondRing className="text-yellow-300" />
              Post a New Job
            </h1>
            <p className="text-blue-100 mt-1 text-sm">Find the perfect jewelry industry professional</p>
          </div>

          {/* Progress Steps */}
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-4 sm:px-8">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">1</span>
                <span className="ml-2 text-xs sm:text-sm font-medium text-gray-900">Job Details</span>
              </div>
              <div className="w-8 sm:w-12 h-0.5 bg-gray-300 mx-1 sm:mx-2"></div>
              <div className="flex items-center">
                <span className="w-7 h-7 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs font-semibold">2</span>
                <span className="ml-2 text-xs sm:text-sm font-medium text-gray-500">Specializations</span>
              </div>
              <div className="w-8 sm:w-12 h-0.5 bg-gray-300 mx-1 sm:mx-2"></div>
              <div className="flex items-center">
                <span className="w-7 h-7 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs font-semibold">3</span>
                <span className="ml-2 text-xs sm:text-sm font-medium text-gray-500">Company Info</span>
              </div>
            </div>
          </div>

          <div className="mx-6 sm:mx-8 mt-6 rounded-lg border border-teal-100 bg-teal-50 p-3 text-sm font-medium text-teal-900">
            {subscriptionUsage?.isUnlimited
              ? t("subscription:unlimitedUntil", {
                  date: new Date(subscriptionUsage.subscription?.endDate).toLocaleDateString("en-IN"),
                  defaultValue: "Unlimited posts until {{date}}",
                })
              : t("subscription:postsRemaining", {
                  count: subscriptionUsage?.remainingPosts || 0,
                  defaultValue: "{{count}} posts remaining this month",
                })}
          </div>

          {/* Success Message */}
          {submitSuccess && (
            <div className="mx-6 sm:mx-8 mt-6 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
              <FaCheckCircle className="text-green-500 text-lg" />
              <p className="text-sm text-green-700 font-medium">Job posted successfully! Redirecting...</p>
            </div>
          )}

          {/* Error Message */}
          {submitError && (
            <div className="mx-6 sm:mx-8 mt-6 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <HiOutlineInformationCircle className="text-red-500 text-lg" />
              <p className="text-sm text-red-700 font-medium">{submitError}</p>
            </div>
          )}

          {/* Validation Errors */}
          {Object.keys(formik.errors).length > 0 && !submitSuccess && (
            <div className="mx-6 sm:mx-8 mt-6 bg-red-50 border border-red-200 rounded-lg p-3">
              <h3 className="text-xs font-medium text-red-800 mb-1">Please fix the following errors:</h3>
              <ul className="list-disc list-inside text-xs text-red-600 space-y-0.5">
                {Object.entries(formik.errors).map(([key, error]) => {
                  if (typeof error === 'string') {
                    return <li key={key}>{error}</li>;
                  } else if (typeof error === 'object' && error !== null) {
                    return Object.entries(error).map(([subKey, subError]) => (
                      <li key={`${key}-${subKey}`}>{subError}</li>
                    ));
                  }
                  return null;
                })}
              </ul>
            </div>
          )}

          {/* Form */}
          <form onSubmit={formik.handleSubmit} className="p-4 sm:p-8">
            {/* Job Title */}
            <div className="mb-5 relative" ref={suggestionRef}>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Senior Goldsmith"
                value={titleInput}
                onChange={handleTitleChange}
                onFocus={() => titleInput.length > 0 && setShowSuggestions(true)}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400 ${formik.errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-gray-700 text-sm border-b border-gray-100 last:border-b-0 transition"
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
              {!showSuggestions && titleInput.length === 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-2">Popular job titles:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {JOB_TITLE_SUGGESTIONS.slice(0, 5).map((title, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionClick(title)}
                        className="px-2 py-1 bg-gray-100 hover:bg-blue-100 text-gray-700 rounded-lg text-xs transition"
                      >
                        {title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {formik.errors.title && (
                <p className="mt-1 text-xs text-red-600">{formik.errors.title}</p>
              )}
            </div>

            {/* Job Description */}
            <div className="mb-5">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                rows={5}
                placeholder="Describe the role, responsibilities, and requirements..."
                value={formik.values.description}
                onChange={formik.handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical ${formik.errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
              />
              {formik.errors.description && (
                <p className="mt-1 text-xs text-red-600">{formik.errors.description}</p>
              )}
            </div>

            {/* Job Location & Employment Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Job Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="jobLocation"
                    placeholder="e.g. Mumbai, Maharashtra"
                    value={formik.values.jobLocation}
                    onChange={formik.handleChange}
                    className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formik.errors.jobLocation ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                  />
                </div>
                {formik.errors.jobLocation && (
                  <p className="mt-1 text-xs text-red-600">{formik.errors.jobLocation}</p>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Employment Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="empType"
                  value={formik.values.empType}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {EMPLOYMENT_TYPES.map((type) => (
                    <option key={type} value={type}>{t(`jobTypes.${type.replace(/[^a-zA-Z]+(.)?/g, (_, chr) => chr ? chr.toUpperCase() : "").replace(/^./, (chr) => chr.toLowerCase())}`, { defaultValue: type })}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Job Profession & Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Job Profession <span className="text-red-500">*</span>
                </label>
                <select
                  name="jobProfession"
                  value={formik.values.jobProfession}
                  onChange={formik.handleChange}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formik.errors.jobProfession ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                >
                  <option value="">{t("jobs:selectProfession", { defaultValue: "Select a profession" })}</option>
                  {JOB_PROFESSIONS.map((prof) => (
                    <option key={prof} value={prof}>{translateProfession(prof, t)}</option>
                  ))}
                </select>
                {formik.errors.jobProfession && (
                  <p className="mt-1 text-xs text-red-600">{formik.errors.jobProfession}</p>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Experience Level <span className="text-red-500">*</span>
                </label>
                <select
                  name="experience"
                  value={formik.values.experience}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {EXPERIENCE_LEVELS.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Number of Openings */}
            <div className="mb-5">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                Number of Openings
              </label>
              <input
                type="number"
                name="openings"
                min="1"
                value={formik.values.openings}
                onChange={formik.handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {formik.errors.openings && (
                <p className="mt-1 text-xs text-red-600">{formik.errors.openings}</p>
              )}
            </div>

            {/* Salary Details */}
            <div className="mb-5">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                Salary Details <span className="text-red-500">*</span>
              </label>
              <div className="border-b border-gray-200 mb-3">
                <nav className="-mb-px flex flex-wrap gap-x-4 gap-y-2 sm:gap-x-6">
                  {['monthly', 'hourly', 'perPiece', 'contract'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setActiveSalaryType(type)}
                      className={`pb-2 px-1 text-xs sm:text-sm font-medium border-b-2 transition capitalize ${activeSalaryType === type
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                      {type === 'perPiece' ? 'Per Piece' : type}
                    </button>
                  ))}
                </nav>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Minimum {activeSalaryType === 'perPiece' ? 'Per Piece' : activeSalaryType} (₹)
                  </label>
                  <input
                    type="number"
                    value={formik.values.salary[activeSalaryType]?.min || ''}
                    onChange={(e) => handleSalaryChange(activeSalaryType, 'min', e.target.value)}
                    placeholder="Min"
                    min="0"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Maximum {activeSalaryType === 'perPiece' ? 'Per Piece' : activeSalaryType} (₹)
                  </label>
                  <input
                    type="number"
                    value={formik.values.salary[activeSalaryType]?.max || ''}
                    onChange={(e) => handleSalaryChange(activeSalaryType, 'max', e.target.value)}
                    placeholder="Max"
                    min="0"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              {formik.errors[`salary_${activeSalaryType}`] && (
                <p className="mt-2 text-xs text-red-600">{formik.errors[`salary_${activeSalaryType}`]}</p>
              )}
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <HiOutlineInformationCircle className="inline text-sm" />
                You can specify multiple salary types. Leave fields empty if not applicable.
              </p>
              {formik.errors.salary && typeof formik.errors.salary === 'string' && (
                <p className="mt-2 text-xs text-red-600">{formik.errors.salary}</p>
              )}
            </div>

            {/* Application Deadline */}
            <div className="mb-5">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                Application Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={formik.values.deadline}
                onChange={formik.handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formik.errors.deadline ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
              />
              {formik.errors.deadline && (
                <p className="mt-1 text-xs text-red-600">{formik.errors.deadline}</p>
              )}
            </div>

            {/* Required Skills */}
            <div className="mb-5">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                Required Skills <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Rhino, Matrix, Stone Setting, Polishing (comma separated)"
                value={skillsInput}
                onChange={handleSkillsChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formik.errors.skills ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
              />
              {formik.errors.skills && (
                <p className="mt-1 text-xs text-red-600">{formik.errors.skills}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Separate skills with commas</p>
            </div>

            {/* Additional Requirements */}
            <div className="mb-6">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                Additional Requirements
              </label>
              <textarea
                name="additionalRequirement"
                rows={3}
                placeholder="Any additional requirements or qualifications..."
                value={formik.values.additionalRequirement}
                onChange={formik.handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
              />
            </div>

            {/* Company Information Section */}
            <div className="mb-6 border-t border-gray-200 pt-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Company Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    placeholder="e.g. Krishan Jewellery"
                    value={formik.values.companyName}
                    onChange={formik.handleChange}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formik.errors.companyName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                  />
                  {formik.errors.companyName && (
                    <p className="mt-1 text-xs text-red-600">{formik.errors.companyName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    Company Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="companyEmail"
                    placeholder="contact@company.com"
                    value={formik.values.companyEmail}
                    onChange={formik.handleChange}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formik.errors.companyEmail ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                  />
                  {formik.errors.companyEmail && (
                    <p className="mt-1 text-xs text-red-600">{formik.errors.companyEmail}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    Company Address
                  </label>
                  <input
                    type="text"
                    name="companyAddress"
                    placeholder="e.g. Mumbai, Maharashtra"
                    value={formik.values.companyAddress}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    Company Website
                  </label>
                  <input
                    type="url"
                    name="companyWebsite"
                    placeholder="https://www.example.com"
                    value={formik.values.companyWebsite}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    Company Description
                  </label>
                  <textarea
                    name="companyDescription"
                    rows={3}
                    placeholder="Briefly describe your company..."
                    value={formik.values.companyDescription}
                    onChange={formik.handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                  />
                </div>
              </div>
            </div>

            <input type="hidden" name="companyId" value={formik.values.companyId} />
            <input type="hidden" name="recruiterId" value={formik.values.recruiterId} />

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading || Object.keys(formik.errors).length > 0 || submitSuccess}
                className="order-1 sm:order-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium text-sm shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Posting...
                  </span>
                ) : submitSuccess ? (
                  <span className="flex items-center justify-center gap-2">
                    <FaCheckCircle className="text-white" />
                    Posted!
                  </span>
                ) : (
                  'Post Job'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
                    formik.resetForm();
                    setSkillsInput("");
                    setTitleInput("");
                  }
                }}
                className="order-2 sm:order-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 px-4 rounded-lg font-medium text-sm transition"
                disabled={loading || submitSuccess}
              >
                Reset Form
              </button>
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="order-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 px-4 rounded-lg font-medium text-sm transition"
                disabled={loading || submitSuccess}
              >
                Preview
              </button>
            </div>

            <p className="mt-4 text-xs text-gray-400 text-center">
              By posting this job, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
