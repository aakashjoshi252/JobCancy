import { useState } from "react";
import PdfForm from "./builder/PdfForm";
import PdfLibrary from "./builder/PdfLibrary";
import { FileText, PlusCircle, Library } from "lucide-react";

export default function Pdf() {
  const [activeTab, setActiveTab] = useState("create"); // "create" or "library"

  return (
    <div className="min-h-screen bg-[#FFF7F3]">
      <div className="mx-auto max-w-[1500px] px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
        
        {/* Header */}
        <div className="mb-5 overflow-hidden rounded-lg border border-[#E9D5FF] bg-white shadow-sm">
          <div className="bg-[linear-gradient(135deg,#6B21A8,#8B5CF6)] px-4 py-6 text-center text-white sm:px-6">
            <div className="mb-3 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <FileText className="h-10 w-10" />
              <h1 className="text-3xl font-bold tracking-tight">Resume Builder</h1>
            </div>
            <p className="mx-auto max-w-2xl text-sm leading-6 text-white/85 sm:text-base">
              Create, preview, download, and manage professional resumes for jewellery industry roles.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-5 flex justify-center">
          <div className="flex w-full max-w-md gap-2 rounded-lg border border-[#E5E7EB] bg-white p-1 shadow-sm">
            <button
              onClick={() => setActiveTab("create")}
              className={`flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition-all duration-200 ${
                activeTab === "create"
                  ? "bg-[#6B21A8] text-white shadow-sm"
                  : "text-[#6B7280] hover:bg-[#FFF7F3] hover:text-[#1F2937]"
              }`}
            >
              <PlusCircle className="w-5 h-5" />
              Create Resume
            </button>
            <button
              onClick={() => setActiveTab("library")}
              className={`flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition-all duration-200 ${
                activeTab === "library"
                  ? "bg-[#6B21A8] text-white shadow-sm"
                  : "text-[#6B7280] hover:bg-[#FFF7F3] hover:text-[#1F2937]"
              }`}
            >
              <Library className="w-5 h-5" />
              My Resumes
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-4">
          {activeTab === "create" ? (
            <PdfForm />
          ) : (
            <PdfLibrary />
          )}
        </div>
      </div>
    </div>
  );
}
