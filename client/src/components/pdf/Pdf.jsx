import { useState } from "react";
import PdfForm from "./builder/PdfForm";
import PdfLibrary from "./builder/PdfLibrary";
import { FileText, PlusCircle, Library } from "lucide-react";

export default function Pdf() {
  const [activeTab, setActiveTab] = useState("create"); // "create" or "library"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <FileText className="w-10 h-10 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
          </div>
          <p className="text-gray-600">
            Create professional resumes for jewelry industry professionals
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-1 flex gap-2">
            <button
              onClick={() => setActiveTab("create")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === "create"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <PlusCircle className="w-5 h-5" />
              Create Resume
            </button>
            <button
              onClick={() => setActiveTab("library")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === "library"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Library className="w-5 h-5" />
              My Resumes
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
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