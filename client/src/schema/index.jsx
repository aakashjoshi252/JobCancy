import * as yup from "yup"

const fallbackT = (key, options = {}) => options.defaultValue || key;

//  user Registration 
export const createRegisterSchema = (t = fallbackT) => yup.object({
  username: yup.string()
    .min(2, t("validation:usernameMin", { count: 2, defaultValue: "Username must be at least 2 characters" }))
    .max(50, t("validation:usernameMax", { count: 50, defaultValue: "Username must not exceed 50 characters" }))
    .required(t("validation:usernameRequired", { defaultValue: "Username is required" })),

  email: yup.string()
    .email(t("validation:emailInvalid", { defaultValue: "Please provide a valid email address" }))
    .lowercase()
    .required(t("validation:emailRequired", { defaultValue: "Email is required" })),

  password: yup.string()
    .min(6, t("validation:passwordMin", { count: 6, defaultValue: "Password must be at least 6 characters" }))
    .max(128, t("validation:passwordMax", { count: 128, defaultValue: "Password must not exceed 128 characters" }))
    .required(t("validation:passwordRequired", { defaultValue: "Password is required" })),

  phone: yup.string()
    .matches(/^[0-9]{10}$/, t("validation:phoneInvalid", { defaultValue: "Please provide a valid 10-digit phone number" }))
    .required(t("validation:phoneRequired", { defaultValue: "Phone number is required" })),

  role: yup.string()
    .oneOf(['candidate', 'recruiter'], t("validation:roleInvalid", { defaultValue: "Role must be either candidate or recruiter" }))
    .required(t("validation:roleRequired", { defaultValue: "Role is required" })),

  jobProfession: yup.string()
    .when('role', {
      is: 'candidate',
      then: (schema) => schema.required(t("validation:jobProfessionCandidateRequired", { defaultValue: "Job profession is required for candidates" })),
      otherwise: (schema) => schema.notRequired(),
    }),

  checkbox: yup.boolean()
    .oneOf([true], t("validation:termsRequired", { defaultValue: "You must accept the Terms & Conditions" }))
    .required(t("validation:termsRequired", { defaultValue: "You must accept the Terms & Conditions" })),
});

export const registerSchema = createRegisterSchema();

// Recruiter Compmpany Registration
export const companyValidation = yup.object({
  uploadLogo: yup.mixed().required("Logo upload is required"),
  companyName: yup.string().required("Company name is required"),
  industry: yup.string().required("Industry type is required"),
  size: yup.string().oneOf(["1-10", "11-50", "51-200", "201-500", "500+"], "Invalid company size").required("Company size is required"),
  establishedYear: yup.number().min(1800, "Year must be valid").max(new Date().getFullYear(), "Year can't be in the future").required("Established year is required"),
  website: yup.string().url("Must be a valid URL").nullable(),
  location: yup.string().required("Location is required"),
  description: yup.string().required("Description is required"),
  contactEmail: yup.string().email("Invalid email address").required("Contact email is required"),
  contactNumber: yup.string().required("Contact number is required"),
});

//  Job Posting 
export const jobValidationSchema = yup.object({
  title: yup.string().required("Job title is required").min(3, "Title must be at least 3 characters"),
  description: yup.string().required("Job description is required").min(20, "Description must be at least 20 characters"),
  jobLocation: yup.string().required("Job location is required"),
  jobType: yup.string().oneOf(["On-site", "Remote", "Hybrid"], "Invalid job type").required("Job type is required"),
  empType: yup.string().oneOf(["Full-time", "Part-time", "Contract", "Internship"], "Invalid employee type").required("Employee type is required"),
  experience: yup.string().oneOf(["Fresher", "Junior", "Mid", "Senior"], "Invalid experience level").required("Experience level is required"),
  salary: yup.string().required("Salary is required"),
  openings: yup.number().required("Number of openings required").min(1, "At least 1 opening is required"),
  deadline: yup.date().required("Deadline is required").min(new Date(), "Deadline must be a future date"),
  skills: yup.string().required("Skills are required").min(2, "Please enter at least 2 skills separated by commas"),
  additionalRequirement: yup.string().nullable(),
  companyName: yup.string().required("Company name is required"),
  CompanyEmail: yup.string().email("Invalid email format").required("Company email is required"),
  CompanyAddress: yup.string().required("Company address is required"),
  companyId: yup.string().required("Company selection is required"),
  recruiterId: yup.string().required("Recruiter ID missing. Please login again!"),
});
