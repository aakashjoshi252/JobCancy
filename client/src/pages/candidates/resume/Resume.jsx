import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Briefcase, Edit3, FileText, Languages, MapPin, Plus, User } from "lucide-react";

export default function EmployeeResume() {
  const navigate = useNavigate();
  const resume = useSelector((state) => state.resume.data);

  if (!resume) {
    return (
      <div className="min-h-screen bg-[#FFF7F3] px-4 py-8">
        <div className="mx-auto max-w-2xl rounded-lg border border-[#E5E7EB] bg-white p-8 text-center shadow-sm">
          <FileText className="mx-auto h-14 w-14 text-[#A78BFA]" />
          <h1 className="mt-4 text-2xl font-bold text-[#1F2937]">No resume found</h1>
          <p className="mt-2 text-[#6B7280]">Create your JewelCancy resume to apply faster and showcase your craft.</p>
          <button
            type="button"
            onClick={() => navigate("/candidate/create-resume")}
            className="mt-6 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#6B21A8] px-5 text-sm font-bold text-white"
          >
            <Plus className="h-4 w-4" />
            Create resume
          </button>
        </div>
      </div>
    );
  }

  const skills = cleanList(resume.skills);
  const languages = cleanList(resume.languages);

  return (
    <div className="min-h-screen bg-[#FFF7F3] px-3 py-4 text-[#1F2937] sm:px-4 lg:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#374151]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <button
            type="button"
            onClick={() => navigate("/candidate/edit-resume")}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#6B21A8] px-5 text-sm font-bold text-white"
          >
            <Edit3 className="h-4 w-4" />
            Edit resume
          </button>
        </div>

        <article className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm">
          <header className="bg-[linear-gradient(135deg,#581C87,#8B5CF6)] p-5 text-white sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="mb-2 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                  Candidate resume
                </p>
                <h1 className="break-words text-3xl font-bold sm:text-4xl">{resume.fullName || "Unnamed candidate"}</h1>
                <p className="mt-2 break-words text-base font-semibold text-white/85">{resume.jobTitle || "Jewellery professional"}</p>
              </div>
              <div className="grid gap-2 rounded-lg bg-white/12 p-3 text-sm text-white/85">
                {resume.email && <span className="break-all">{resume.email}</span>}
                {resume.phone && <span>{resume.phone}</span>}
                {resume.address && (
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {resume.address}
                  </span>
                )}
              </div>
            </div>
          </header>

          <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <main className="min-w-0 space-y-6">
              <ResumeSection title="Professional summary" show={resume.summary}>
                <p className="whitespace-pre-line break-words text-sm leading-7 text-[#4B5563]">{resume.summary}</p>
              </ResumeSection>

              <ResumeSection title="Work experience" show={resume.experiences?.length}>
                <Timeline items={resume.experiences} titleKey="experienceTitle" subtitleKey="companyName" metaKey="duration" bodyKey="workDetails" />
              </ResumeSection>

              <ResumeSection title="Education" show={resume.education?.length}>
                <Timeline items={resume.education} titleKey="degree" subtitleKey="institution" metaKey="year" />
              </ResumeSection>
            </main>

            <aside className="min-w-0 space-y-4">
              <InfoCard title="Skills" icon={Briefcase} show={skills.length}>
                <ChipList items={skills} />
              </InfoCard>
              <InfoCard title="Languages" icon={Languages} show={languages.length}>
                <ChipList items={languages} />
              </InfoCard>
              <InfoCard title="Profile" icon={User} show>
                <dl className="grid gap-3 text-sm">
                  <InfoRow label="Email" value={resume.email} />
                  <InfoRow label="Phone" value={resume.phone} />
                  <InfoRow label="Location" value={resume.address} />
                </dl>
              </InfoCard>
            </aside>
          </div>
        </article>
      </div>
    </div>
  );
}

function ResumeSection({ title, show, children }) {
  if (!show) return null;
  return (
    <section className="min-w-0">
      <h2 className="mb-3 border-b border-[#E9D5FF] pb-2 text-sm font-bold uppercase tracking-wide text-[#6B21A8]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function InfoCard({ title, icon: Icon, show, children }) {
  if (!show) return null;
  return (
    <section className="rounded-lg border border-[#E5E7EB] bg-[#FFFBFA] p-4">
      <h3 className="mb-3 flex items-center gap-2 font-bold text-[#1F2937]">
        <Icon className="h-4 w-4 text-[#6B21A8]" />
        {title}
      </h3>
      {children}
    </section>
  );
}

function Timeline({ items, titleKey, subtitleKey, metaKey, bodyKey }) {
  return (
    <div className="space-y-3">
      {(items || [])
        .filter((item) => item?.[titleKey] || item?.[subtitleKey] || item?.[bodyKey])
        .map((item, index) => (
          <div key={index} className="rounded-lg border border-[#F3F4F6] bg-[#FFFBFA] p-4">
            {item[titleKey] && <h3 className="break-words font-bold text-[#1F2937]">{item[titleKey]}</h3>}
            {item[subtitleKey] && <p className="mt-1 break-words text-sm font-semibold text-[#6B21A8]">{item[subtitleKey]}</p>}
            {item[metaKey] && <p className="mt-1 text-xs text-[#6B7280]">{item[metaKey]}</p>}
            {bodyKey && item[bodyKey] && (
              <p className="mt-3 whitespace-pre-line break-words text-sm leading-6 text-[#4B5563]">{item[bodyKey]}</p>
            )}
          </div>
        ))}
    </div>
  );
}

function ChipList({ items }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="rounded-full bg-[#F3E8FF] px-3 py-1 text-xs font-semibold text-[#581C87]">
          {item}
        </span>
      ))}
    </div>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-[#6B7280]">{label}</dt>
      <dd className="mt-1 break-words text-[#374151]">{value}</dd>
    </div>
  );
}

function cleanList(values) {
  return (values || []).map((item) => String(item || "").trim()).filter(Boolean);
}
