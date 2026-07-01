import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  Languages,
  Loader2,
  Plus,
  Save,
  Trash2,
  User,
} from "lucide-react";
import { resumeApi } from "../../../../api/api";
import { setResume } from "../../../../redux/slices/resumeSlice";

const emptyExperience = {
  companyName: "",
  experienceTitle: "",
  duration: "",
  workDetails: "",
};

const emptyEducation = {
  degree: "",
  institution: "",
  year: "",
};

export default function EditResume() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const resume = useSelector((state) => state.resume.data);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      fullName: resume?.fullName || "",
      jobTitle: resume?.jobTitle || "",
      email: user?.email || resume?.email || "",
      phone: resume?.phone || "",
      address: resume?.address || "",
      summary: resume?.summary || "",
      skills: resume?.skills?.length ? resume.skills : [""],
      experiences: resume?.experiences?.length ? resume.experiences : [{ ...emptyExperience }],
      education: resume?.education?.length ? resume.education : [{ ...emptyEducation }],
      languages: resume?.languages?.length ? resume.languages : [""],
    },
    validate: (values) => {
      const errors = {};
      if (!values.fullName?.trim()) errors.fullName = "Full name is required.";
      if (!values.jobTitle?.trim()) errors.jobTitle = "Job title is required.";
      if (!values.summary?.trim()) errors.summary = "Professional summary is required.";
      return errors;
    },
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      if (!resume?._id) {
        setStatus({ type: "error", message: "No resume was found to update." });
        setSubmitting(false);
        return;
      }

      try {
        const response = await resumeApi.put(`/update/${resume._id}`, values);
        const savedResume = response.data?.data || response.data;
        if (savedResume?._id) dispatch(setResume(savedResume));
        setStatus({ type: "success", message: "Resume updated successfully." });
        setTimeout(() => navigate("/candidate/resume"), 650);
      } catch (error) {
        console.error("Resume update error:", error);
        setStatus({
          type: "error",
          message: error.response?.data?.message || "Failed to save resume.",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (!resume) {
    return (
      <div className="min-h-screen bg-[#FFF7F3] px-4 py-8">
        <div className="mx-auto max-w-2xl rounded-lg border border-[#E5E7EB] bg-white p-8 text-center shadow-sm">
          <User className="mx-auto h-12 w-12 text-[#A78BFA]" />
          <h1 className="mt-4 text-2xl font-bold text-[#1F2937]">No resume found</h1>
          <p className="mt-2 text-[#6B7280]">Create a resume first, then you can edit and update it here.</p>
          <button
            type="button"
            onClick={() => navigate("/candidate/create-resume")}
            className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#6B21A8] px-5 text-sm font-bold text-white"
          >
            Create resume
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF7F3] px-3 py-4 text-[#1F2937] sm:px-4 lg:px-6">
      <div className="mx-auto grid max-w-[1300px] gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <form onSubmit={formik.handleSubmit} className="min-w-0 space-y-4 pb-24 lg:pb-6">
          <header className="overflow-hidden rounded-lg border border-[#E9D5FF] bg-white shadow-sm">
            <div className="bg-[linear-gradient(135deg,#6B21A8,#8B5CF6)] px-4 py-6 text-white sm:px-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mb-4 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-white/15 px-3 text-sm font-semibold"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <h1 className="text-2xl font-bold sm:text-3xl">Edit resume</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85">
                Update your jewellery career profile, work history, education, skills, and languages.
              </p>
            </div>
          </header>

          {formik.status?.message && (
            <div
              className={`rounded-lg border p-4 text-sm font-semibold ${
                formik.status.type === "error"
                  ? "border-[#FCA5A5] bg-[#FEF2F2] text-[#B91C1C]"
                  : "border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]"
              }`}
            >
              {formik.status.message}
            </div>
          )}

          <Panel title="Profile" icon={User}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full name" name="fullName" formik={formik} required />
              <Field label="Job title" name="jobTitle" formik={formik} required />
            </div>
            <input type="hidden" {...formik.getFieldProps("email")} />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Phone" name="phone" formik={formik} />
              <Field label="Location" name="address" formik={formik} />
            </div>
            <TextArea label="Professional summary" name="summary" formik={formik} rows={4} required />
          </Panel>

          <Panel title="Skills" icon={CheckCircle2}>
            <ArrayInputs
              values={formik.values.skills}
              placeholder="Jewelry design, CAD, merchandising"
              onChange={(values) => formik.setFieldValue("skills", values)}
            />
          </Panel>

          <Panel title="Work experience" icon={Briefcase}>
            <Repeater
              items={formik.values.experiences}
              emptyItem={emptyExperience}
              addLabel="Add experience"
              onChange={(items) => formik.setFieldValue("experiences", items)}
              render={(item, update) => (
                <div className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <InlineField label="Company" value={item.companyName} onChange={(value) => update("companyName", value)} />
                    <InlineField label="Role" value={item.experienceTitle} onChange={(value) => update("experienceTitle", value)} />
                  </div>
                  <InlineField label="Duration" value={item.duration} onChange={(value) => update("duration", value)} />
                  <InlineTextArea label="Work details" value={item.workDetails} onChange={(value) => update("workDetails", value)} />
                </div>
              )}
            />
          </Panel>

          <Panel title="Education" icon={GraduationCap}>
            <Repeater
              items={formik.values.education}
              emptyItem={emptyEducation}
              addLabel="Add education"
              onChange={(items) => formik.setFieldValue("education", items)}
              render={(item, update) => (
                <div className="grid gap-4 md:grid-cols-3">
                  <InlineField label="Degree" value={item.degree} onChange={(value) => update("degree", value)} />
                  <InlineField label="Institution" value={item.institution} onChange={(value) => update("institution", value)} />
                  <InlineField label="Year" value={item.year} onChange={(value) => update("year", value)} />
                </div>
              )}
            />
          </Panel>

          <Panel title="Languages" icon={Languages}>
            <ArrayInputs
              values={formik.values.languages}
              placeholder="English, Hindi, Gujarati"
              onChange={(values) => formik.setFieldValue("languages", values)}
            />
          </Panel>
        </form>

        <aside className="hidden min-w-0 lg:block">
          <div className="sticky top-24 rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-[#8B5CF6]">Quick preview</p>
            <h2 className="mt-2 break-words text-2xl font-bold">{formik.values.fullName || "Your Name"}</h2>
            <p className="mt-1 break-words text-sm font-semibold text-[#6B21A8]">
              {formik.values.jobTitle || "Jewellery professional"}
            </p>
            <div className="mt-4 space-y-2 text-sm text-[#6B7280]">
              {formik.values.phone && <p>{formik.values.phone}</p>}
              {formik.values.address && <p>{formik.values.address}</p>}
              {formik.values.email && <p className="break-all">{formik.values.email}</p>}
            </div>
            {formik.values.summary && (
              <p className="mt-5 whitespace-pre-line break-words rounded-lg bg-[#FFF7F3] p-4 text-sm leading-6 text-[#4B5563]">
                {formik.values.summary}
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              {cleanList(formik.values.skills).slice(0, 8).map((skill) => (
                <span key={skill} className="rounded-full bg-[#F3E8FF] px-3 py-1 text-xs font-semibold text-[#581C87]">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E5E7EB] bg-white/95 px-3 py-3 shadow-2xl backdrop-blur">
        <div className="mx-auto flex max-w-[1300px] gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] px-4 text-sm font-semibold text-[#374151] sm:flex-none"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <button
            type="button"
            disabled={formik.isSubmitting}
            onClick={formik.submitForm}
            className="inline-flex min-h-[44px] flex-[1.4] items-center justify-center gap-2 rounded-lg bg-[#6B21A8] px-5 text-sm font-bold text-white disabled:opacity-60 sm:flex-none"
          >
            {formik.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {formik.isSubmitting ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, icon: Icon, children }) {
  return (
    <section className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-5">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#1F2937]">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#F3E8FF] text-[#6B21A8]">
          <Icon className="h-5 w-5" />
        </span>
        {title}
      </h2>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function Field({ label, name, formik, required }) {
  const error = formik.touched[name] && formik.errors[name];
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#374151]">
        {label}
        {required && <span className="text-[#DC2626]"> *</span>}
      </span>
      <input
        {...formik.getFieldProps(name)}
        className={`mt-2 min-h-[44px] w-full rounded-lg border px-3 text-sm outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#E9D5FF] ${
          error ? "border-[#FCA5A5]" : "border-[#E5E7EB]"
        }`}
      />
      {error && <span className="mt-1 block text-xs font-medium text-[#DC2626]">{error}</span>}
    </label>
  );
}

function TextArea({ label, name, formik, rows = 3, required }) {
  const error = formik.touched[name] && formik.errors[name];
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#374151]">
        {label}
        {required && <span className="text-[#DC2626]"> *</span>}
      </span>
      <textarea
        {...formik.getFieldProps(name)}
        rows={rows}
        className={`mt-2 w-full rounded-lg border px-3 py-3 text-sm outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#E9D5FF] ${
          error ? "border-[#FCA5A5]" : "border-[#E5E7EB]"
        }`}
      />
      {error && <span className="mt-1 block text-xs font-medium text-[#DC2626]">{error}</span>}
    </label>
  );
}

function InlineField({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#374151]">{label}</span>
      <input
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-[44px] w-full rounded-lg border border-[#E5E7EB] px-3 text-sm outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#E9D5FF]"
      />
    </label>
  );
}

function InlineTextArea({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#374151]">{label}</span>
      <textarea
        value={value || ""}
        rows={3}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-[#E5E7EB] px-3 py-3 text-sm outline-none focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#E9D5FF]"
      />
    </label>
  );
}

function ArrayInputs({ values, placeholder, onChange }) {
  const update = (index, value) => {
    const next = [...values];
    next[index] = value;
    onChange(next);
  };

  return (
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
            onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[#FCA5A5] px-3 text-sm font-semibold text-[#DC2626] disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...values, ""])}
        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#F3E8FF] px-4 text-sm font-semibold text-[#6B21A8]"
      >
        <Plus className="h-4 w-4" />
        Add item
      </button>
    </div>
  );
}

function Repeater({ items, emptyItem, onChange, render, addLabel }) {
  const update = (index, field, value) => {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)));
  };

  return (
    <div className="grid gap-3">
      {items.map((item, index) => (
        <div key={index} className="rounded-lg border border-[#E5E7EB] bg-[#FFFBFA] p-4">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#F3F4F6] pb-3">
            <p className="font-bold text-[#374151]">Entry {index + 1}</p>
            <button
              type="button"
              disabled={items.length === 1}
              onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm font-semibold text-[#DC2626] disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          </div>
          {render(item, (field, value) => update(index, field, value))}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, { ...emptyItem }])}
        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[#E9D5FF] bg-white px-4 text-sm font-semibold text-[#6B21A8]"
      >
        <Plus className="h-4 w-4" />
        {addLabel}
      </button>
    </div>
  );
}

function cleanList(values) {
  return (values || []).map((item) => String(item || "").trim()).filter(Boolean);
}
