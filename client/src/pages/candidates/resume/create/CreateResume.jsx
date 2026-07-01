import { useMemo, useState } from "react";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Award,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Gem,
  GraduationCap,
  Image,
  Languages,
  Loader2,
  Palette,
  Plus,
  Save,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";
import { resumeApi } from "../../../../api/api";
import { setResume } from "../../../../redux/slices/resumeSlice";

const SPECIALIZATIONS = [
  "Jewelry Designer",
  "CAD Designer",
  "Goldsmith",
  "Silversmith",
  "Stone Setter",
  "Polisher",
  "Gemologist",
  "Diamond Grader",
  "Quality Controller",
  "Sales Consultant",
  "Store Manager",
  "Production Manager",
  "Bench Jeweler",
  "Engraver",
  "Casting Specialist",
  "Other",
];

const MATERIALS_EXPERTISE = [
  "Gold (22K, 18K, 14K)",
  "Silver (925 Sterling)",
  "Platinum",
  "Diamonds",
  "Precious Gemstones",
  "Semi-Precious Stones",
  "Pearls",
  "Lab-Grown Diamonds",
  "Kundan",
  "Meenakari",
  "Polki",
];

const TECHNICAL_SKILLS = [
  "Hand Fabrication",
  "CAD/CAM (Rhino, Matrix, JewelCAD)",
  "3D Printing",
  "Casting",
  "Stone Setting",
  "Soldering",
  "Polishing",
  "Engraving",
  "Enameling",
  "Filigree Work",
  "Traditional Techniques",
];

const CERTIFICATIONS = [
  "GIA (Gemological Institute of America)",
  "IGI (International Gemological Institute)",
  "HRD Antwerp",
  "AGS (American Gem Society)",
  "NIGm (National Institute of Gemology Mumbai)",
  "BIS Hallmark Certification",
  "JJA (Jewellers Association)",
  "CAD Software Certification (Rhino, Matrix, JewelCAD)",
  "3D Printing Certification",
  "Jewelry Design Diploma",
  "Goldsmith Certification",
  "Other",
];

const PORTFOLIO_CATEGORIES = [
  "Ring",
  "Necklace",
  "Bracelet",
  "Earring",
  "Pendant",
  "Brooch",
  "Custom Design",
  "CAD Model",
  "Other",
];

const SECTION_TABS = [
  { id: "basic", label: "Profile", icon: User },
  { id: "jewelry", label: "Expertise", icon: Gem },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "certifications", label: "Certifications", icon: Award },
  { id: "portfolio", label: "Portfolio", icon: Image },
];

const emptyExperience = { companyName: "", experienceTitle: "", duration: "", workDetails: "" };
const emptyEducation = { degree: "", institution: "", year: "" };
const emptyCertification = {
  name: "",
  issuingOrganization: "",
  issueDate: "",
  expiryDate: "",
  certificateUrl: "",
};
const emptyPortfolio = {
  title: "",
  description: "",
  imageUrl: "",
  category: "",
  materials: [],
  techniques: [],
  year: "",
};

const draftKey = (candidateId) => `jewelcancy_resume_draft_${candidateId || "guest"}`;

export default function ResumeForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loggedUser = useSelector((state) => state.auth.user);
  const candidateId = loggedUser?._id;
  const candidateEmail = loggedUser?.email || "";

  const [activeTab, setActiveTab] = useState("basic");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [template, setTemplate] = useState("atelier");
  const [toast, setToast] = useState(null);

  const initialValues = useMemo(() => {
    const fallback = {
      fullName: "",
      jobTitle: "",
      email: candidateEmail,
      phone: "",
      address: "",
      summary: "",
      specialization: [],
      materialsExpertise: [],
      technicalSkills: [],
      skills: [""],
      experiences: [{ ...emptyExperience }],
      education: [{ ...emptyEducation }],
      certifications: [],
      portfolio: [],
      portfolioWebsite: "",
      languages: [""],
      candidateId,
    };

    try {
      const draft = window.localStorage.getItem(draftKey(candidateId));
      return draft ? { ...fallback, ...JSON.parse(draft), email: candidateEmail, candidateId } : fallback;
    } catch {
      return fallback;
    }
  }, [candidateEmail, candidateId]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validate: (values) => {
      const errors = {};
      if (!values.fullName?.trim()) errors.fullName = "Full name is required.";
      if (!values.jobTitle?.trim()) errors.jobTitle = "Job title is required.";
      if (!values.phone?.trim()) errors.phone = "Phone number is required.";
      if (!values.address?.trim()) errors.address = "Location is required.";
      if (!values.summary?.trim()) errors.summary = "Professional summary is required.";
      return errors;
    },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await resumeApi.post("/create", values);
        const savedResume = response.data?.data || response.data;
        if (savedResume?._id) {
          dispatch(setResume(savedResume));
          window.localStorage.removeItem(draftKey(candidateId));
          setToast({ type: "success", message: "Resume saved successfully." });
          setTimeout(() => navigate("/candidate/resume"), 700);
        }
      } catch (error) {
        console.error("Error saving resume:", error);
        setToast({
          type: "error",
          message: error.response?.data?.message || error.message || "Unable to save resume.",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const activeIndex = SECTION_TABS.findIndex((tab) => tab.id === activeTab);
  const completedSections = getCompletedSections(formik.values);

  const showToast = (message, type = "success") => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3200);
  };

  const handleMultiSelect = (field, value) => {
    const current = Array.isArray(formik.values[field]) ? formik.values[field] : [];
    formik.setFieldValue(
      field,
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  };

  const saveDraft = () => {
    window.localStorage.setItem(draftKey(candidateId), JSON.stringify(formik.values));
    showToast("Draft saved on this device.");
  };

  const goToTab = (direction) => {
    const nextIndex = Math.min(Math.max(activeIndex + direction, 0), SECTION_TABS.length - 1);
    setActiveTab(SECTION_TABS[nextIndex].id);
  };

  return (
    <div className="min-h-screen bg-[#FFF7F3] px-3 py-4 text-[#1F2937] sm:px-4 lg:px-6">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="mx-auto max-w-[1500px]">
        <header className="overflow-hidden rounded-lg border border-[#E9D5FF] bg-white shadow-sm">
          <div className="grid gap-5 bg-[linear-gradient(135deg,#6B21A8,#8B5CF6)] px-4 py-6 text-white sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                <Sparkles className="h-4 w-4" />
                JewelCancy resume studio
              </div>
              <h1 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
                Build a polished jewellery career resume
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/85 sm:text-base">
                Capture your craft, retail experience, certifications, and portfolio in one responsive resume builder.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-lg bg-white/12 p-3 text-center text-xs sm:min-w-[18rem]">
              <Stat label="Sections" value={`${completedSections}/${SECTION_TABS.length}`} />
              <Stat label="Skills" value={cleanList(formik.values.skills).length} />
              <Stat label="Portfolio" value={formik.values.portfolio.length} />
            </div>
          </div>
        </header>

        <div className="mt-4 grid gap-4 lg:grid-cols-[17rem_minmax(0,1fr)_minmax(22rem,30rem)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-sm">
              <div className="mb-3 hidden px-2 text-xs font-bold uppercase tracking-wide text-[#6B7280] lg:block">
                Builder steps
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
                {SECTION_TABS.map((tab, index) => {
                  const Icon = tab.icon;
                  const selected = activeTab === tab.id;
                  const complete = sectionComplete(tab.id, formik.values);
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex min-h-[44px] min-w-[9rem] items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition lg:min-w-0 ${
                        selected
                          ? "border-[#6B21A8] bg-[#F3E8FF] text-[#581C87]"
                          : "border-transparent text-[#6B7280] hover:bg-[#FFF7F3]"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{tab.label}</span>
                      </span>
                      {complete && <CheckCircle2 className="h-4 w-4 shrink-0 text-[#16A34A]" />}
                      <span className="sr-only">Step {index + 1}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 hidden rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm lg:block">
              <label className="text-xs font-bold uppercase tracking-wide text-[#6B7280]">Template</label>
              <div className="mt-3 grid gap-2">
                {["atelier", "classic", "portfolio"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setTemplate(item)}
                    className={`min-h-[44px] rounded-lg border px-3 text-left text-sm font-semibold capitalize ${
                      template === item
                        ? "border-[#8B5CF6] bg-[#F3E8FF] text-[#6B21A8]"
                        : "border-[#E5E7EB] text-[#6B7280]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <form onSubmit={formik.handleSubmit} className="min-w-0 space-y-4 pb-28 lg:pb-8">
            <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-5 flex flex-col gap-3 border-b border-[#E5E7EB] pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#8B5CF6]">
                    Step {activeIndex + 1} of {SECTION_TABS.length}
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-[#1F2937] sm:text-2xl">
                    {SECTION_TABS[activeIndex]?.label}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[#E9D5FF] px-4 text-sm font-semibold text-[#6B21A8] lg:hidden"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </button>
              </div>

              {activeTab === "basic" && <BasicSection formik={formik} />}
              {activeTab === "jewelry" && (
                <ExpertiseSection
                  formik={formik}
                  handleMultiSelect={handleMultiSelect}
                />
              )}
              {activeTab === "experience" && <ExperienceSection formik={formik} />}
              {activeTab === "education" && <EducationSection formik={formik} />}
              {activeTab === "certifications" && <CertificationSection formik={formik} />}
              {activeTab === "portfolio" && <PortfolioSection formik={formik} />}

              <div className="mt-6 flex flex-col gap-3 border-t border-[#E5E7EB] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => goToTab(-1)}
                  disabled={activeIndex === 0}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] px-4 text-sm font-semibold text-[#374151] disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => goToTab(1)}
                  disabled={activeIndex === SECTION_TABS.length - 1}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#6B21A8] px-4 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Next section
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </form>

          <aside className="hidden min-w-0 lg:block">
            <div className="sticky top-24 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-[#FFF7F3] px-4 py-3">
                <div>
                  <h3 className="font-bold text-[#1F2937]">Live preview</h3>
                  <p className="text-xs text-[#6B7280]">Updates as you type</p>
                </div>
                <span className="rounded-full bg-[#E9D5FF] px-3 py-1 text-xs font-bold text-[#6B21A8] capitalize">
                  {template}
                </span>
              </div>
              <div className="max-h-[calc(100dvh-11rem)] overflow-y-auto p-4">
                <ResumePreview values={formik.values} template={template} />
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E5E7EB] bg-white/95 px-3 py-3 shadow-2xl backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-[1500px] gap-2">
          <button
            type="button"
            onClick={saveDraft}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border border-[#E9D5FF] px-3 text-sm font-semibold text-[#6B21A8]"
          >
            <Save className="h-4 w-4" />
            Draft
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] px-3 text-sm font-semibold text-[#374151]"
          >
            <Download className="h-4 w-4" />
            PDF
          </button>
          <button
            type="button"
            onClick={formik.submitForm}
            disabled={formik.isSubmitting}
            className="inline-flex min-h-[44px] flex-[1.4] items-center justify-center gap-2 rounded-lg bg-[#6B21A8] px-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {formik.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Save
          </button>
        </div>
      </div>

      <div className="hidden lg:fixed lg:bottom-5 lg:left-1/2 lg:z-30 lg:flex lg:-translate-x-1/2 lg:gap-2 lg:rounded-lg lg:border lg:border-[#E5E7EB] lg:bg-white/95 lg:p-2 lg:shadow-xl lg:backdrop-blur">
        <button
          type="button"
          onClick={saveDraft}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#E9D5FF] px-4 text-sm font-semibold text-[#6B21A8]"
        >
          <Save className="h-4 w-4" />
          Save draft
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#E5E7EB] px-4 text-sm font-semibold text-[#374151]"
        >
          <Download className="h-4 w-4" />
          Print / PDF
        </button>
        <button
          type="button"
          onClick={formik.submitForm}
          disabled={formik.isSubmitting}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#6B21A8] px-5 text-sm font-bold text-white disabled:opacity-60"
        >
          {formik.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          {formik.isSubmitting ? "Saving..." : "Save resume"}
        </button>
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-[#1F2937]/70 p-2 sm:p-4 lg:hidden" role="dialog" aria-modal="true">
          <div className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
              <div>
                <h3 className="font-bold">Resume preview</h3>
                <p className="text-xs text-[#6B7280]">Mobile full-screen preview</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#FFF7F3]"
                aria-label="Close preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <ResumePreview values={formik.values} template={template} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BasicSection({ formik }) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Full name" name="fullName" required formik={formik} placeholder="e.g., Rajesh Kumar" />
        <Field label="Professional title" name="jobTitle" required formik={formik} placeholder="Senior Jewelry Designer" />
      </div>
      <input type="hidden" {...formik.getFieldProps("email")} />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Phone" name="phone" required formik={formik} placeholder="+91 98765 43210" />
        <Field label="Location" name="address" required formik={formik} placeholder="Mumbai, Maharashtra" />
      </div>
      <TextArea
        label="Professional summary"
        name="summary"
        required
        formik={formik}
        rows={5}
        placeholder="Summarize your jewellery expertise, signature work, team experience, and goals."
      />
      <ArrayInputs
        title="General skills"
        icon={Palette}
        values={formik.values.skills}
        placeholder="Customer service, merchandising, client handling"
        onChange={(values) => formik.setFieldValue("skills", values)}
      />
      <ArrayInputs
        title="Languages"
        icon={Languages}
        values={formik.values.languages}
        placeholder="English, Hindi, Gujarati"
        onChange={(values) => formik.setFieldValue("languages", values)}
      />
    </div>
  );
}

function ExpertiseSection({ formik, handleMultiSelect }) {
  return (
    <div className="space-y-5">
      <ChipPicker
        label="Specializations"
        values={SPECIALIZATIONS}
        selected={formik.values.specialization}
        onToggle={(value) => handleMultiSelect("specialization", value)}
      />
      <ChipPicker
        label="Materials expertise"
        values={MATERIALS_EXPERTISE}
        selected={formik.values.materialsExpertise}
        onToggle={(value) => handleMultiSelect("materialsExpertise", value)}
        tone="peach"
      />
      <ChipPicker
        label="Technical craft skills"
        values={TECHNICAL_SKILLS}
        selected={formik.values.technicalSkills}
        onToggle={(value) => handleMultiSelect("technicalSkills", value)}
      />
    </div>
  );
}

function ExperienceSection({ formik }) {
  return (
    <SectionRepeater
      title="Experience"
      emptyItem={emptyExperience}
      items={formik.values.experiences}
      onChange={(items) => formik.setFieldValue("experiences", items)}
      render={(item, index, update) => (
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Company" value={item.companyName} onChange={(value) => update("companyName", value)} placeholder="Kalyan Jewellers" />
            <Field label="Role" value={item.experienceTitle} onChange={(value) => update("experienceTitle", value)} placeholder="CAD Designer" />
          </div>
          <Field label="Duration" value={item.duration} onChange={(value) => update("duration", value)} placeholder="2021 - Present" />
          <TextArea label="Work details" value={item.workDetails} onChange={(value) => update("workDetails", value)} rows={4} placeholder="Mention results, collections, client segments, tools, or production impact." />
        </div>
      )}
    />
  );
}

function EducationSection({ formik }) {
  return (
    <SectionRepeater
      title="Education"
      emptyItem={emptyEducation}
      items={formik.values.education}
      onChange={(items) => formik.setFieldValue("education", items)}
      render={(item, index, update) => (
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Degree" value={item.degree} onChange={(value) => update("degree", value)} placeholder="Diploma in Jewelry Design" />
          <Field label="Institution" value={item.institution} onChange={(value) => update("institution", value)} placeholder="Design institute" />
          <Field label="Year" value={item.year} onChange={(value) => update("year", value)} placeholder="2024" />
        </div>
      )}
    />
  );
}

function CertificationSection({ formik }) {
  return (
    <SectionRepeater
      title="Certifications"
      emptyItem={emptyCertification}
      items={formik.values.certifications}
      onChange={(items) => formik.setFieldValue("certifications", items)}
      addLabel="Add certification"
      render={(item, index, update) => (
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField label="Certification" value={item.name} onChange={(value) => update("name", value)} options={CERTIFICATIONS} />
            <Field label="Issuing organization" value={item.issuingOrganization} onChange={(value) => update("issuingOrganization", value)} placeholder="GIA, IGI, BIS" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Issue date" type="month" value={item.issueDate} onChange={(value) => update("issueDate", value)} />
            <Field label="Expiry date" type="month" value={item.expiryDate} onChange={(value) => update("expiryDate", value)} />
            <Field label="Certificate URL" type="url" value={item.certificateUrl} onChange={(value) => update("certificateUrl", value)} placeholder="https://..." />
          </div>
        </div>
      )}
    />
  );
}

function PortfolioSection({ formik }) {
  return (
    <div className="space-y-5">
      <Field
        label="Portfolio website"
        type="url"
        value={formik.values.portfolioWebsite}
        onChange={(value) => formik.setFieldValue("portfolioWebsite", value)}
        placeholder="https://portfolio, Behance, Instagram, or Drive link"
      />
      <SectionRepeater
        title="Portfolio projects"
        emptyItem={emptyPortfolio}
        items={formik.values.portfolio}
        onChange={(items) => formik.setFieldValue("portfolio", items)}
        addLabel="Add portfolio item"
        render={(item, index, update) => (
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Design title" value={item.title} onChange={(value) => update("title", value)} placeholder="Bridal necklace set" />
              <SelectField label="Category" value={item.category} onChange={(value) => update("category", value)} options={PORTFOLIO_CATEGORIES} />
            </div>
            <Field label="Image URL" type="url" value={item.imageUrl} onChange={(value) => update("imageUrl", value)} placeholder="https://..." />
            <TextArea label="Description" value={item.description} onChange={(value) => update("description", value)} rows={3} placeholder="Describe inspiration, materials, and technique." />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Materials" value={(item.materials || []).join(", ")} onChange={(value) => update("materials", splitComma(value))} placeholder="18K Gold, Diamonds" />
              <Field label="Year" value={item.year} onChange={(value) => update("year", value)} placeholder="2025" />
            </div>
          </div>
        )}
      />
    </div>
  );
}

function Field({ label, name, formik, required, value, onChange, type = "text", placeholder = "" }) {
  const hasFormik = Boolean(formik && name);
  const inputValue = hasFormik ? formik.values[name] : value || "";
  const error = hasFormik && formik.touched[name] && formik.errors[name];

  return (
    <label className="block min-w-0">
      <span className="text-sm font-semibold text-[#374151]">
        {label}
        {required && <span className="text-[#DC2626]"> *</span>}
      </span>
      <input
        type={type}
        name={name}
        value={inputValue}
        onChange={hasFormik ? formik.handleChange : (event) => onChange?.(event.target.value)}
        onBlur={hasFormik ? formik.handleBlur : undefined}
        placeholder={placeholder}
        className={`mt-2 min-h-[44px] w-full rounded-lg border bg-white px-3 text-sm text-[#1F2937] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#E9D5FF] ${
          error ? "border-[#FCA5A5]" : "border-[#E5E7EB]"
        }`}
      />
      {error && <span className="mt-1 block text-xs font-medium text-[#DC2626]">{error}</span>}
    </label>
  );
}

function TextArea({ label, name, formik, required, value, onChange, rows = 3, placeholder = "" }) {
  const hasFormik = Boolean(formik && name);
  const inputValue = hasFormik ? formik.values[name] : value || "";
  const error = hasFormik && formik.touched[name] && formik.errors[name];

  return (
    <label className="block min-w-0">
      <span className="text-sm font-semibold text-[#374151]">
        {label}
        {required && <span className="text-[#DC2626]"> *</span>}
      </span>
      <textarea
        name={name}
        rows={rows}
        value={inputValue}
        onChange={hasFormik ? formik.handleChange : (event) => onChange?.(event.target.value)}
        onBlur={hasFormik ? formik.handleBlur : undefined}
        placeholder={placeholder}
        className={`mt-2 w-full resize-y rounded-lg border bg-white px-3 py-3 text-sm text-[#1F2937] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#E9D5FF] ${
          error ? "border-[#FCA5A5]" : "border-[#E5E7EB]"
        }`}
      />
      {error && <span className="mt-1 block text-xs font-medium text-[#DC2626]">{error}</span>}
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block min-w-0">
      <span className="text-sm font-semibold text-[#374151]">{label}</span>
      <select
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-[44px] w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#1F2937] outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#E9D5FF]"
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ChipPicker({ label, values, selected, onToggle, tone = "purple" }) {
  const activeClass = tone === "peach" ? "border-[#F9A8A8] bg-[#FDE8E4] text-[#7F1D1D]" : "border-[#A78BFA] bg-[#F3E8FF] text-[#581C87]";
  return (
    <section className="rounded-lg border border-[#E5E7EB] bg-[#FFFBFA] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold text-[#1F2937]">{label}</h3>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#6B7280]">
          {selected.length} selected
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {values.map((value) => {
          const active = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => onToggle(value)}
              className={`min-h-[44px] rounded-full border px-3 text-sm font-semibold transition ${
                active ? activeClass : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#A78BFA]"
              }`}
            >
              {value}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ArrayInputs({ title, icon: Icon, values, placeholder, onChange }) {
  const update = (index, value) => {
    const next = [...values];
    next[index] = value;
    onChange(next);
  };
  const remove = (index) => onChange(values.filter((_, itemIndex) => itemIndex !== index));

  return (
    <section className="rounded-lg border border-[#E5E7EB] bg-[#FFFBFA] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-bold text-[#1F2937]">
          <Icon className="h-4 w-4 text-[#6B21A8]" />
          {title}
        </h3>
        <button
          type="button"
          onClick={() => onChange([...values, ""])}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#F3E8FF] px-3 text-sm font-semibold text-[#6B21A8]"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>
      <div className="grid gap-2">
        {values.map((item, index) => (
          <div key={index} className="flex min-w-0 flex-col gap-2 sm:flex-row">
            <input
              value={item}
              onChange={(event) => update(index, event.target.value)}
              placeholder={placeholder}
              className="min-h-[44px] min-w-0 flex-1 rounded-lg border border-[#E5E7EB] px-3 text-sm outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#E9D5FF]"
            />
            <button
              type="button"
              disabled={values.length === 1}
              onClick={() => remove(index)}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[#FCA5A5] px-3 text-sm font-semibold text-[#DC2626] disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionRepeater({ title, items, emptyItem, onChange, render, addLabel = "Add item" }) {
  const add = () => onChange([...items, { ...emptyItem }]);
  const remove = (index) => onChange(items.filter((_, itemIndex) => itemIndex !== index));
  const update = (index, field, value) => {
    const next = items.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item));
    onChange(next);
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#1F2937]">{title}</h3>
          <p className="text-sm text-[#6B7280]">Add as many entries as you need. Cards stack cleanly on mobile.</p>
        </div>
        <button
          type="button"
          onClick={add}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#6B21A8] px-4 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" />
          {addLabel}
        </button>
      </div>
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#D8B4FE] bg-[#FFF7F3] p-8 text-center">
          <FileText className="mx-auto h-10 w-10 text-[#A78BFA]" />
          <p className="mt-3 font-semibold text-[#374151]">No {title.toLowerCase()} added yet.</p>
        </div>
      ) : (
        items.map((item, index) => (
          <div key={index} className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#F3F4F6] pb-3">
              <p className="font-bold text-[#374151]">
                {title} {index + 1}
              </p>
              <button
                type="button"
                onClick={() => remove(index)}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm font-semibold text-[#DC2626] hover:bg-[#FEF2F2]"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </div>
            {render(item, index, (field, value) => update(index, field, value))}
          </div>
        ))
      )}
    </section>
  );
}

function ResumePreview({ values, template }) {
  const skills = cleanList(values.skills);
  const languages = cleanList(values.languages);
  const accent = template === "classic" ? "#6B21A8" : template === "portfolio" ? "#8B5CF6" : "#581C87";
  const hasContent = values.fullName || values.jobTitle || values.summary || skills.length || values.experiences?.some((item) => item.companyName || item.experienceTitle);

  if (!hasContent) {
    return (
      <div className="rounded-lg border border-dashed border-[#D8B4FE] bg-[#FFF7F3] p-8 text-center">
        <Eye className="mx-auto h-10 w-10 text-[#A78BFA]" />
        <h4 className="mt-3 font-bold text-[#374151]">Preview is waiting</h4>
        <p className="mt-1 text-sm text-[#6B7280]">Start with your name and summary to see the resume take shape.</p>
      </div>
    );
  }

  return (
    <article className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white text-[#1F2937] shadow-sm">
      <div className="p-5 text-white" style={{ backgroundColor: accent }}>
        <h2 className="break-words text-2xl font-bold">{values.fullName || "Your Name"}</h2>
        <p className="mt-1 break-words text-sm text-white/85">{values.jobTitle || "Jewellery professional"}</p>
        <div className="mt-4 grid gap-1 text-xs text-white/80 sm:grid-cols-2">
          {values.email && <span className="break-all">{values.email}</span>}
          {values.phone && <span>{values.phone}</span>}
          {values.address && <span className="sm:col-span-2">{values.address}</span>}
        </div>
      </div>
      <div className="grid gap-5 p-5">
        <PreviewSection title="Profile" show={values.summary}>
          <p className="whitespace-pre-line break-words text-sm leading-6 text-[#4B5563]">{values.summary}</p>
        </PreviewSection>
        <PreviewSection title="Jewellery expertise" show={values.specialization?.length || values.materialsExpertise?.length || values.technicalSkills?.length}>
          <ChipList items={[...(values.specialization || []), ...(values.materialsExpertise || []), ...(values.technicalSkills || [])]} />
        </PreviewSection>
        <PreviewSection title="Skills" show={skills.length}>
          <ChipList items={skills} />
        </PreviewSection>
        <PreviewSection title="Experience" show={values.experiences?.some((item) => item.companyName || item.experienceTitle)}>
          <Timeline items={values.experiences} titleKey="experienceTitle" subtitleKey="companyName" metaKey="duration" bodyKey="workDetails" />
        </PreviewSection>
        <PreviewSection title="Education" show={values.education?.some((item) => item.degree || item.institution)}>
          <Timeline items={values.education} titleKey="degree" subtitleKey="institution" metaKey="year" />
        </PreviewSection>
        <PreviewSection title="Certifications" show={values.certifications?.some((item) => item.name)}>
          <Timeline items={values.certifications} titleKey="name" subtitleKey="issuingOrganization" metaKey="issueDate" />
        </PreviewSection>
        <PreviewSection title="Portfolio" show={values.portfolioWebsite || values.portfolio?.some((item) => item.title)}>
          {values.portfolioWebsite && <p className="mb-3 break-all text-sm font-semibold text-[#6B21A8]">{values.portfolioWebsite}</p>}
          <Timeline items={values.portfolio} titleKey="title" subtitleKey="category" metaKey="year" bodyKey="description" />
        </PreviewSection>
        <PreviewSection title="Languages" show={languages.length}>
          <ChipList items={languages} />
        </PreviewSection>
      </div>
    </article>
  );
}

function PreviewSection({ title, show, children }) {
  if (!show) return null;
  return (
    <section className="min-w-0">
      <h3 className="mb-3 border-b border-[#E9D5FF] pb-2 text-xs font-bold uppercase tracking-wide text-[#6B21A8]">
        {title}
      </h3>
      {children}
    </section>
  );
}

function ChipList({ items }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.filter(Boolean).map((item, index) => (
        <span key={`${item}-${index}`} className="rounded-full bg-[#F3E8FF] px-3 py-1 text-xs font-semibold text-[#581C87]">
          {item}
        </span>
      ))}
    </div>
  );
}

function Timeline({ items, titleKey, subtitleKey, metaKey, bodyKey }) {
  return (
    <div className="space-y-3">
      {items
        .filter((item) => item?.[titleKey] || item?.[subtitleKey] || item?.[bodyKey])
        .map((item, index) => (
          <div key={index} className="rounded-lg bg-[#FFFBFA] p-3">
            {item[titleKey] && <p className="break-words font-semibold text-[#1F2937]">{item[titleKey]}</p>}
            {item[subtitleKey] && <p className="break-words text-sm text-[#6B21A8]">{item[subtitleKey]}</p>}
            {item[metaKey] && <p className="text-xs text-[#6B7280]">{item[metaKey]}</p>}
            {bodyKey && item[bodyKey] && <p className="mt-2 whitespace-pre-line break-words text-sm text-[#4B5563]">{item[bodyKey]}</p>}
          </div>
        ))}
    </div>
  );
}

function Toast({ type, message, onClose }) {
  const isError = type === "error";
  return (
    <div className="fixed right-3 top-3 z-[60] max-w-[calc(100vw-1.5rem)] rounded-lg border bg-white p-3 shadow-xl">
      <div className="flex items-start gap-3">
        {isError ? <AlertTriangle className="h-5 w-5 shrink-0 text-[#DC2626]" /> : <CheckCircle2 className="h-5 w-5 shrink-0 text-[#16A34A]" />}
        <p className="text-sm font-semibold text-[#1F2937]">{message}</p>
        <button type="button" onClick={onClose} className="ml-1 rounded p-1 text-[#6B7280] hover:bg-[#F3F4F6]" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg bg-white/12 p-2">
      <div className="text-lg font-bold">{value}</div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-white/70">{label}</div>
    </div>
  );
}

function cleanList(values) {
  return (values || []).map((item) => String(item || "").trim()).filter(Boolean);
}

function splitComma(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function sectionComplete(section, values) {
  switch (section) {
    case "basic":
      return Boolean(values.fullName && values.jobTitle && values.summary);
    case "jewelry":
      return Boolean(values.specialization?.length || values.materialsExpertise?.length || values.technicalSkills?.length);
    case "experience":
      return Boolean(values.experiences?.some((item) => item.companyName || item.experienceTitle));
    case "education":
      return Boolean(values.education?.some((item) => item.degree || item.institution));
    case "certifications":
      return Boolean(values.certifications?.length);
    case "portfolio":
      return Boolean(values.portfolioWebsite || values.portfolio?.length);
    default:
      return false;
  }
}

function getCompletedSections(values) {
  return SECTION_TABS.filter((tab) => sectionComplete(tab.id, values)).length;
}
