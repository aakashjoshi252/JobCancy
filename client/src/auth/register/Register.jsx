import { useFormik } from "formik";
import { createRegisterSchema } from "../../schema";
import { NavLink, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { userApi } from "../../api/api";
import LanguageSwitcher from "../../components/languageSwitcher/LanguageSwitcher";
import { translateProfession } from "../../utils/professions";
import { translateApiError } from "../../utils/apiErrors";

const initialValue = {
  username: "",
  email: "",
  password: "",
  role: "",
  phone: "",
  jobProfession: "",
  checkbox: false,
};

export default function Register() {
  const { t } = useTranslation(["auth", "common", "validation", "professions", "errors"]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [showJobProfession, setShowJobProfession] = useState(false);

  const jobProfessions = [
    "Accounts Assistant",
      "Analytical Tester",
      "Assorter",
      "Asst.Production Manager",
      "B2B Sales Manager (International)",
      "Back Office Executive",
      "CAD Designer",
      "CAD Designer (Export)",
      "CAD HOD",
      "CAM Machine Operator",
      "CAM Worker",
      "Caster/Casting",
      "Chain Maker",
      "Color Stone Executive / Grader",
      "Corel Designer (local Market)",
      "Creative Graphic Designer",
      "Data Entry Operator",
      "Data Entry Operator (Diamond Department)",
      "Diamond Assorter / Grader",
      "Diamond Baging Executive",
      "Diamond QC",
      "EXIM Manager / Executive",
      "Filler",
      "Final QC Analyst / Specialist",
      "Finding Executive",
      "General Manager / Chief Manager",
      "Gold Central Accountant",
      "Gold Central HOD (EMR Software)",
      "Gold Central HOD (Gati Software)",
      "Gold/Silver Smith",
      "Graphic Designer",
      "Hand Engraver/Stamping",
      "Hand Setter (Diamond/Gem)",
      "Helper/Traini",    //ng Staff
      "HOD",
      "HR Assistant",
      "HR Manager / Executive",
      "HR Plant Operations",
      "IGI Data Operator (Gati)",
      "Inventory Executive / Stock Manager",
      "Jewellery Consultant",
      "Jewellery Merchandiser",
      "Laser Machine Operator / CNC",
      "Loss Control Manager",
      "MIS Executive",
      "Maintanance/Technical Staff",
      "Manual Designer",
      "Marketing Back Office (EMR / Gati)",
      "Marketing Executive",
      "Marketing Head Executive",
      "Micro Setter (Diamond/Gem)",
      "Model Maker/Wax Carver",
      "PD / R & D",
      "PD Assistant",
      "PD Merchandiser",
      "Polish QC",
      "Polisher",
      "Production Coordinator / PPC",
      "Production Manager",
      "Production Supervisor",
      "Purchase Executive",
      "QA Manager",
      "Reception Staff",
      "Rhodium/Enamal",
      "Sample Maker (Sample Lining Executive)",
      "Sales Executive",
      "Sales Executive (USA, Europe, Middle East)",
      "Sales Head Executive",
      "Senior Assorter",
      "Senior CRM",
      "Setting QC",
      "Shop Manager",
      "Sourcing Manager / Executive(Gold / Gems)",
      "Store Manager",
      "Surveillance Executive",
      "Visual Merchandiser(VM)",
      "Waxing/Wax Puller",
      "Wax Setter (Diamond/Gem)",
  ];
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const normalizeText = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z]/gi, "") // remove spaces & special chars
    .split("")
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
    .join("");

const filteredProfessions = jobProfessions.filter((profession) =>
  normalizeText(profession).includes(normalizeText(search))
);

  const validationSchema = useMemo(() => createRegisterSchema(t), [t]);

  const formik = useFormik({
    initialValues: initialValue,
    validationSchema,
    onSubmit: async (values, { resetForm, setFieldError }) => {
      setLoading(true);
      try {
        const payload = {
          username: values.username,
          email: values.email,
          password: values.password,
          phone: values.phone,
          role: values.role,
        };

        if (values.role === "candidate") {
          payload.jobProfession = values.jobProfession;
        }

        await userApi.post("/register", payload);

        localStorage.setItem("verifyEmail", values.email);

        setSuccessMsg(t("register.success"));

        resetForm();
        setShowJobProfession(false);

        navigate("/email-verify");

      } catch (error) {
        const msg = translateApiError(error, t, "unexpected") || t("register.failed");
        if (error.response?.data?.data) {
          setFieldError(error.response.data.data, msg);
        } else {
          setFieldError("email", msg);
        }
      } finally {
        setLoading(false);
      }
    },
  });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleSubmit,
    handleBlur,
    setFieldValue,
  } = formik;

  useEffect(() => {
    if (values.role === "candidate") {
      setShowJobProfession(true);
    } else {
      setShowJobProfession(false);
      setFieldValue("jobProfession", "");
    }
  }, [values.role, setFieldValue]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 py-8">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <div className="mb-5 flex justify-end">
          <LanguageSwitcher compact />
        </div>

        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
          {t("register.title")}
        </h2>

        {successMsg && (
          <p className="text-green-600 text-center mb-3 bg-green-50 p-2 rounded-lg">
            {successMsg}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Username */}
          <div>
            <label className="block font-medium mb-1">
              {t("fields.username", { ns: "common" })} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              placeholder={t("placeholders.username", { ns: "common" })}
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full rounded-lg p-2.5 bg-gray-50 border focus:ring-2 focus:ring-blue-500 outline-none
              ${errors.username && touched.username ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.username && touched.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block font-medium mb-1">
              {t("fields.email", { ns: "common" })} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder={t("placeholders.email", { ns: "common" })}
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full rounded-lg p-2.5 bg-gray-50 border focus:ring-2 focus:ring-blue-500 outline-none
              ${errors.email && touched.email ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.email && touched.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block font-medium mb-1">
              {t("fields.password", { ns: "common" })} <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              placeholder={t("placeholders.password", { ns: "common" })}
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full rounded-lg p-2.5 bg-gray-50 border focus:ring-2 focus:ring-blue-500 outline-none
              ${errors.password && touched.password ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.password && touched.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {t("register.passwordHint")}
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="block font-medium mb-1">
              {t("fields.phone", { ns: "common" })} <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              placeholder={t("placeholders.phone", { ns: "common" })}
              value={values.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full rounded-lg p-2.5 bg-gray-50 border focus:ring-2 focus:ring-blue-500 outline-none
              ${errors.phone && touched.phone ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.phone && touched.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block font-medium mb-1">
              {t("fields.role", { ns: "common" })} <span className="text-red-500">*</span>
            </label>
            <select
              name="role"
              value={values.role}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full rounded-lg p-2.5 bg-gray-50 border focus:ring-2 focus:ring-blue-500 outline-none
              ${errors.role && touched.role ? "border-red-500" : "border-gray-300"}`}
            >
              <option value="">{t("register.selectRolePlaceholder")}</option>
              <option value="candidate">{t("register.candidateRole")}</option>
              <option value="recruiter">{t("register.recruiterRole")}</option>
            </select>
            {errors.role && touched.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role}</p>
            )}
          </div>

          {/* Job Profession - Only for Candidates */}
          {showJobProfession && (
            <div>
              <label className="block font-medium mb-1">
                {t("fields.jobProfession", { ns: "common" })} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="jobProfession"
                  placeholder={t("placeholders.jobProfession", { ns: "common" })}
                  value={values.jobProfession}
                  onChange={(e) => {
                    handleChange(e);
                    setSearch(e.target.value);
                    setShowDropdown(true);
                  }}
                  onBlur={handleBlur}
                  onFocus={() => setShowDropdown(true)}
                  className={`w-full rounded-lg p-2.5 bg-gray-50 border focus:ring-2 focus:ring-blue-500 outline-none
    ${errors.jobProfession && touched.jobProfession ? "border-red-500" : "border-gray-300"}`}
                />

                {showDropdown && filteredProfessions.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-md">
                    {filteredProfessions.map((profession, index) => (
                      <li
                        key={index}
                        onMouseDown={() => {
                          setFieldValue("jobProfession", profession);
                          setSearch(profession);
                          setShowDropdown(false);
                        }}
                        className="px-3 py-2 cursor-pointer hover:bg-blue-50"
                      >
                        {translateProfession(profession, t)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                <strong>{t("register.note")}</strong> {t("register.professionNote")}
              </p>
              {errors.jobProfession && touched.jobProfession && (
                <p className="text-red-500 text-sm mt-1">{errors.jobProfession}</p>
              )}
            </div>
          )}

          {/* Terms */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              name="checkbox"
              checked={values.checkbox}
              onChange={handleChange}
              className="mt-1"
            />
            <label className="text-sm text-gray-700">
              {t("register.termsPrefix")} <span className="text-blue-600 cursor-pointer hover:underline">{t("register.terms")}</span> {t("register.termsAnd")} <span className="text-blue-600 cursor-pointer hover:underline">{t("register.privacy")}</span>
            </label>
          </div>
          {errors.checkbox && touched.checkbox && (
            <p className="text-red-500 text-sm">{errors.checkbox}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !values.checkbox}
            className={`w-full py-3 rounded-lg text-white font-semibold transition-all
              ${loading || !values.checkbox
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t("register.submitting")}
              </span>
            ) : (
              t("register.submit")
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center mt-6 text-gray-600">
          {t("register.alreadyHaveAccount")}{" "}
          <NavLink to="/login" className="text-blue-600 font-semibold hover:underline">
            {t("login.submit")}
          </NavLink>
        </p>
      </div>
    </div>
  );
}
