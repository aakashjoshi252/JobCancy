import { useState, useRef } from "react";
import { pdfApi } from "../../../api/api";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  Download, 
  Plus, 
  X, 
  Eye, 
  FileText, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Palette, 
  Globe,
  Languages,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";

const ResumeForm = () => {
  const resumeRef = useRef();
  const navigate = useNavigate();
  const loggedUser = useSelector((state) => state.auth.user);
  const recruiterId = loggedUser?._id;
  
  const [form, setForm] = useState({
    fullName: "",
    jobTitle: "",
    email: "",
    phone: "",
    address: "",
    summary: "",
    specialization: [],
    materialsExpertise: [],
    technicalSkills: [],
    skills: "",
    experiences: [],
    education: [],
    certifications: [],
    portfolio: [],
    portfolioWebsite: "",
    languages: [],
    userId: recruiterId,
  });

  // UI States
  const [newExperience, setNewExperience] = useState({
    companyName: "",
    experienceTitle: "",
    duration: "",
    workDetails: ""
  });

  const [newEducation, setNewEducation] = useState({
    degree: "",
    institution: "",
    year: ""
  });

  const [newCertification, setNewCertification] = useState({
    name: "",
    issuingOrganization: "",
    issueDate: "",
    expiryDate: "",
    certificateUrl: ""
  });

  const [newPortfolio, setNewPortfolio] = useState({
    title: "",
    description: "",
    imageUrl: "",
    category: "",
    materials: "",
    techniques: "",
    year: ""
  });

  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [showCertificationForm, setShowCertificationForm] = useState(false);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateSuccess, setGenerateSuccess] = useState(false);
  const [generateError, setGenerateError] = useState(null);

  /* ================= HANDLE INPUT ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= HANDLE MULTISELECT ================= */
  const handleMultiselect = (e, field) => {
    const options = Array.from(e.target.selectedOptions, option => option.value);
    setForm({ ...form, [field]: options });
  };

  /* ================= HANDLE ARRAY INPUT ================= */
  const handleArrayInput = (field, value) => {
    const lines = value.split(",").filter(line => line.trim()).map(l => l.trim());
    setForm({
      ...form,
      [field]: lines
    });
  };

  /* ================= HANDLE EXPERIENCE ================= */
  const handleAddExperience = () => {
    if (!newExperience.companyName || !newExperience.experienceTitle) {
      alert("Please fill in company name and job title");
      return;
    }
    
    setForm({
      ...form,
      experiences: [...form.experiences, newExperience]
    });
    setNewExperience({
      companyName: "",
      experienceTitle: "",
      duration: "",
      workDetails: ""
    });
    setShowExperienceForm(false);
  };

  const handleRemoveExperience = (index) => {
    const updatedExperiences = form.experiences.filter((_, i) => i !== index);
    setForm({ ...form, experiences: updatedExperiences });
  };

  /* ================= HANDLE EDUCATION ================= */
  const handleAddEducation = () => {
    if (!newEducation.degree || !newEducation.institution) {
      alert("Please fill in degree and institution");
      return;
    }
    
    setForm({
      ...form,
      education: [...form.education, newEducation]
    });
    setNewEducation({
      degree: "",
      institution: "",
      year: ""
    });
    setShowEducationForm(false);
  };

  const handleRemoveEducation = (index) => {
    const updatedEducation = form.education.filter((_, i) => i !== index);
    setForm({ ...form, education: updatedEducation });
  };

  /* ================= HANDLE CERTIFICATIONS ================= */
  const handleAddCertification = () => {
    if (!newCertification.name || !newCertification.issuingOrganization) {
      alert("Please fill in certification name and issuing organization");
      return;
    }
    
    setForm({
      ...form,
      certifications: [...form.certifications, newCertification]
    });
    setNewCertification({
      name: "",
      issuingOrganization: "",
      issueDate: "",
      expiryDate: "",
      certificateUrl: ""
    });
    setShowCertificationForm(false);
  };

  const handleRemoveCertification = (index) => {
    const updatedCertifications = form.certifications.filter((_, i) => i !== index);
    setForm({ ...form, certifications: updatedCertifications });
  };

  /* ================= HANDLE PORTFOLIO ================= */
  const handleAddPortfolio = () => {
    if (!newPortfolio.title || !newPortfolio.imageUrl) {
      alert("Please fill in title and image URL");
      return;
    }
    
    setForm({
      ...form,
      portfolio: [...form.portfolio, {
        ...newPortfolio,
        materials: newPortfolio.materials.split(",").map(m => m.trim()).filter(m => m),
        techniques: newPortfolio.techniques.split(",").map(t => t.trim()).filter(t => t)
      }]
    });
    setNewPortfolio({
      title: "",
      description: "",
      imageUrl: "",
      category: "",
      materials: "",
      techniques: "",
      year: ""
    });
    setShowPortfolioForm(false);
  };

  const handleRemovePortfolio = (index) => {
    const updatedPortfolio = form.portfolio.filter((_, i) => i !== index);
    setForm({ ...form, portfolio: updatedPortfolio });
  };

  /* ================= VALIDATE FORM ================= */
  const validateForm = () => {
    if (!form.fullName.trim()) {
      alert("Please enter your full name");
      return false;
    }
    if (!form.jobTitle.trim()) {
      alert("Please enter your job title");
      return false;
    }
    if (!form.email.trim()) {
      alert("Please enter your email");
      return false;
    }
    if (!form.phone.trim()) {
      alert("Please enter your phone number");
      return false;
    }
    if (!form.summary.trim()) {
      alert("Please enter a professional summary");
      return false;
    }
    if (!form.skills.trim()) {
      alert("Please enter your skills");
      return false;
    }
    return true;
  };

  /* ================= GENERATE PDF ================= */
  const handleGenerate = async () => {
    if (!validateForm()) return;
    
    setIsGenerating(true);
    setGenerateError(null);
    setGenerateSuccess(false);

    try {
      const payload = {
        ...form,
        skills: form.skills.split(",").map(s => s.trim()).filter(s => s),
        languages: Array.isArray(form.languages) && form.languages.length
          ? form.languages
          : ["English"],
        userId: recruiterId
      };

      // Create resume in backend
      const createRes = await pdfApi.post("/create", payload);
      
      if (!createRes.data?.data?._id) {
        throw new Error("Failed to create resume");
      }

      const resumeId = createRes.data.data._id;

      // Download PDF from backend
      const pdfRes = await pdfApi.get(`/${resumeId}/download`, {
        responseType: "blob"
      });

      // Create file URL and download
      const url = window.URL.createObjectURL(new Blob([pdfRes.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${form.fullName.trim() || "resume"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setGenerateSuccess(true);
      
      // Show success message and redirect after 2 seconds
      setTimeout(() => {
        setGenerateSuccess(false);
        navigate("/recruiter/pdf-library");
      }, 2000);
      
    } catch (err) {
      console.error("PDF Generation Error:", err);
      setGenerateError(err.response?.data?.message || err.message || "Failed to generate resume PDF");
      setTimeout(() => setGenerateError(null), 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  /* ================= SKILLS ARRAY ================= */
  const skillsList = form.skills
    .split(",")
    .filter(s => s.trim())
    .map(s => s.trim());

  /* ================= ENUM OPTIONS ================= */
  const specializationOptions = [
    "Jewelry Designer", "CAD Designer", "Goldsmith", "Silversmith",
    "Stone Setter", "Polisher", "Gemologist", "Diamond Grader",
    "Quality Controller", "Sales Consultant", "Store Manager",
    "Production Manager", "Bench Jeweler", "Engraver", "Casting Specialist", "Other"
  ];

  const materialsOptions = [
    "Gold (22K, 18K, 14K)", "Silver (925 Sterling)", "Platinum",
    "Diamonds", "Precious Gemstones", "Semi-Precious Stones",
    "Pearls", "Lab-Grown Diamonds", "Kundan", "Meenakari", "Polki"
  ];

  const technicalSkillsOptions = [
    "Hand Fabrication", "CAD/CAM (Rhino, Matrix, JewelCAD)", "3D Printing",
    "Casting", "Stone Setting", "Soldering", "Polishing", "Engraving",
    "Enameling", "Filigree Work", "Traditional Techniques"
  ];

  const certificationOptions = [
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
    "Other"
  ];

  const portfolioCategories = [
    "Ring", "Necklace", "Bracelet", "Earring", "Pendant", "Brooch", "Custom Design", "CAD Model", "Other"
  ];

  const tabs = [
    { id: "basic", label: "Basic Info", icon: <User className="w-4 h-4" /> },
    { id: "jewelry", label: "Jewelry Details", icon: <Palette className="w-4 h-4" /> },
    { id: "experience", label: "Experience", icon: <Briefcase className="w-4 h-4" /> },
    { id: "education", label: "Education", icon: <GraduationCap className="w-4 h-4" /> },
    { id: "certifications", label: "Certifications", icon: <Award className="w-4 h-4" /> },
    { id: "portfolio", label: "Portfolio", icon: <Globe className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#FFF7F3]">
      <div className="mx-auto max-w-[1500px] p-0">
        
        {/* HEADER */}
        <header className="relative mb-5 overflow-hidden rounded-lg border border-[#E9D5FF] bg-[linear-gradient(135deg,#6B21A8,#8B5CF6)] p-4 text-center text-white shadow-sm sm:p-6">
          <div className="absolute inset-0 bg-black/0"></div>
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-3">
              <FileText className="w-8 h-8 sm:w-10 sm:h-10" />
              <h1 className="font-bold text-2xl sm:text-4xl tracking-tight leading-tight">
                Jewelry Professional Resume Studio
              </h1>
            </div>
            <p className="text-white/85 text-sm sm:text-lg">
              Create your professional jewelry industry resume instantly
            </p>
          </div>
        </header>

        {/* Success/Error Messages */}
        {generateSuccess && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Resume generated successfully! Redirecting...</span>
            </div>
          </div>
        )}
        
        {generateError && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{generateError}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,34rem)]">
          
          {/* ================= FORM SECTION ================= */}
          <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm">
            {/* Tabs */}
            <div className="border-b border-[#E5E7EB] bg-[#FFFBFA]">
              <div className="flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex min-h-[52px] items-center gap-2 whitespace-nowrap px-4 text-sm font-semibold transition-all duration-200 sm:px-6 ${
                      activeTab === tab.id
                        ? "text-[#6B21A8] border-b-2 border-[#6B21A8] bg-white"
                        : "text-[#6B7280] hover:text-[#1F2937] hover:bg-[#FFF7F3]"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-none overflow-y-auto p-4 sm:p-6 lg:max-h-[calc(100dvh-210px)]">
              {/* Basic Information Tab */}
              {activeTab === "basic" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        name="fullName"
                        placeholder="Enter your full name"
                        value={form.fullName}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Professional Title *
                      </label>
                      <input
                        name="jobTitle"
                        placeholder="e.g., Senior Jewelry Designer"
                        value={form.jobTitle}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          name="email"
                          type="email"
                          placeholder="your@email.com"
                          value={form.email}
                          onChange={handleChange}
                          className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          name="phone"
                          placeholder="+91 98765 43210"
                          value={form.phone}
                          onChange={handleChange}
                          className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        name="address"
                        placeholder="City, State, Country"
                        value={form.address}
                        onChange={handleChange}
                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Professional Summary *
                    </label>
                    <textarea
                      name="summary"
                      placeholder="Write a brief summary of your professional background, key achievements, and career goals..."
                      value={form.summary}
                      onChange={handleChange}
                      rows="4"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills (comma separated) *
                    </label>
                    <input
                      name="skills"
                      placeholder="e.g., Jewelry Design, CAD, Stone Setting"
                      value={form.skills}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    {skillsList.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {skillsList.map((skill, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Languages (comma separated)
                    </label>
                    <div className="relative">
                      <Languages className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        placeholder="English, Hindi, French"
                        onChange={(e) => handleArrayInput("languages", e.target.value)}
                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Jewelry Industry Details Tab */}
              {activeTab === "jewelry" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Jewelry Industry Details</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialization (Ctrl+Click to select multiple)
                    </label>
                    <select
                      multiple
                      size="4"
                      onChange={(e) => handleMultiselect(e, "specialization")}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {specializationOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    {form.specialization.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {form.specialization.map(spec => (
                          <span key={spec} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Materials Expertise
                    </label>
                    <select
                      multiple
                      size="4"
                      onChange={(e) => handleMultiselect(e, "materialsExpertise")}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {materialsOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Technical Skills
                    </label>
                    <select
                      multiple
                      size="4"
                      onChange={(e) => handleMultiselect(e, "technicalSkills")}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {technicalSkillsOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Portfolio Website
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        name="portfolioWebsite"
                        placeholder="https://yourportfolio.com"
                        value={form.portfolioWebsite}
                        onChange={handleChange}
                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Experience Tab */}
              {activeTab === "experience" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Work Experience</h3>
                    <button
                      onClick={() => setShowExperienceForm(!showExperienceForm)}
                      className="flex min-h-[44px] items-center gap-2 rounded-lg bg-[#6B21A8] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#581C87]"
                    >
                      <Plus className="w-4 h-4" />
                      Add Experience
                    </button>
                  </div>

                  {showExperienceForm && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                      <input
                        placeholder="Company Name *"
                        value={newExperience.companyName}
                        onChange={(e) => setNewExperience({...newExperience, companyName: e.target.value})}
                        className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        placeholder="Job Title *"
                        value={newExperience.experienceTitle}
                        onChange={(e) => setNewExperience({...newExperience, experienceTitle: e.target.value})}
                        className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        placeholder="Duration (e.g., 2020-2023) *"
                        value={newExperience.duration}
                        onChange={(e) => setNewExperience({...newExperience, duration: e.target.value})}
                        className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <textarea
                        placeholder="Work Details *"
                        value={newExperience.workDetails}
                        onChange={(e) => setNewExperience({...newExperience, workDetails: e.target.value})}
                        rows="3"
                        className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddExperience}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setShowExperienceForm(false)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {form.experiences.map((exp, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative group">
                      <button
                        onClick={() => handleRemoveExperience(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <p className="font-semibold text-gray-800">{exp.experienceTitle}</p>
                      <p className="text-sm text-blue-600">{exp.companyName}</p>
                      <p className="text-xs text-gray-500 mb-2">{exp.duration}</p>
                      <p className="text-sm text-gray-600">{exp.workDetails}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Education Tab */}
              {activeTab === "education" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Education</h3>
                    <button
                      onClick={() => setShowEducationForm(!showEducationForm)}
                      className="flex min-h-[44px] items-center gap-2 rounded-lg bg-[#6B21A8] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#581C87]"
                    >
                      <Plus className="w-4 h-4" />
                      Add Education
                    </button>
                  </div>

                  {showEducationForm && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                      <input
                        placeholder="Degree *"
                        value={newEducation.degree}
                        onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                        className="w-full p-3 mb-3 border border-gray-300 rounded-lg"
                      />
                      <input
                        placeholder="Institution *"
                        value={newEducation.institution}
                        onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}
                        className="w-full p-3 mb-3 border border-gray-300 rounded-lg"
                      />
                      <input
                        placeholder="Year *"
                        value={newEducation.year}
                        onChange={(e) => setNewEducation({...newEducation, year: e.target.value})}
                        className="w-full p-3 mb-3 border border-gray-300 rounded-lg"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddEducation}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setShowEducationForm(false)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {form.education.map((edu, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative group">
                      <button
                        onClick={() => handleRemoveEducation(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <p className="font-semibold text-gray-800">{edu.degree}</p>
                      <p className="text-sm text-gray-600">{edu.institution}</p>
                      <p className="text-xs text-gray-500">{edu.year}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Certifications Tab */}
              {activeTab === "certifications" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Certifications</h3>
                    <button
                      onClick={() => setShowCertificationForm(!showCertificationForm)}
                      className="flex min-h-[44px] items-center gap-2 rounded-lg bg-[#6B21A8] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#581C87]"
                    >
                      <Plus className="w-4 h-4" />
                      Add Certification
                    </button>
                  </div>

                  {showCertificationForm && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                      <select
                        value={newCertification.name}
                        onChange={(e) => setNewCertification({...newCertification, name: e.target.value})}
                        className="w-full p-3 mb-3 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select Certification *</option>
                        {certificationOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <input
                        placeholder="Issuing Organization *"
                        value={newCertification.issuingOrganization}
                        onChange={(e) => setNewCertification({...newCertification, issuingOrganization: e.target.value})}
                        className="w-full p-3 mb-3 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="date"
                        placeholder="Issue Date"
                        value={newCertification.issueDate}
                        onChange={(e) => setNewCertification({...newCertification, issueDate: e.target.value})}
                        className="w-full p-3 mb-3 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="date"
                        placeholder="Expiry Date"
                        value={newCertification.expiryDate}
                        onChange={(e) => setNewCertification({...newCertification, expiryDate: e.target.value})}
                        className="w-full p-3 mb-3 border border-gray-300 rounded-lg"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddCertification}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setShowCertificationForm(false)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {form.certifications.map((cert, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative group">
                      <button
                        onClick={() => handleRemoveCertification(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <p className="font-semibold text-gray-800">{cert.name}</p>
                      <p className="text-sm text-gray-600">{cert.issuingOrganization}</p>
                      {cert.issueDate && <p className="text-xs text-gray-500">Issued: {cert.issueDate}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Portfolio Tab */}
              {activeTab === "portfolio" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Portfolio Items</h3>
                    <button
                      onClick={() => setShowPortfolioForm(!showPortfolioForm)}
                      className="flex min-h-[44px] items-center gap-2 rounded-lg bg-[#6B21A8] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#581C87]"
                    >
                      <Plus className="w-4 h-4" />
                      Add Portfolio Item
                    </button>
                  </div>

                  {showPortfolioForm && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                      <input
                        placeholder="Title *"
                        value={newPortfolio.title}
                        onChange={(e) => setNewPortfolio({...newPortfolio, title: e.target.value})}
                        className="w-full p-3 mb-3 border border-gray-300 rounded-lg"
                      />
                      <textarea
                        placeholder="Description"
                        value={newPortfolio.description}
                        onChange={(e) => setNewPortfolio({...newPortfolio, description: e.target.value})}
                        rows="2"
                        className="w-full p-3 mb-3 border border-gray-300 rounded-lg"
                      />
                      <input
                        placeholder="Image URL *"
                        value={newPortfolio.imageUrl}
                        onChange={(e) => setNewPortfolio({...newPortfolio, imageUrl: e.target.value})}
                        className="w-full p-3 mb-3 border border-gray-300 rounded-lg"
                      />
                      <select
                        value={newPortfolio.category}
                        onChange={(e) => setNewPortfolio({...newPortfolio, category: e.target.value})}
                        className="w-full p-3 mb-3 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select Category</option>
                        {portfolioCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddPortfolio}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setShowPortfolioForm(false)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {form.portfolio.map((item, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200 relative group">
                        <button
                          onClick={() => handleRemovePortfolio(index)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <p className="font-semibold text-sm">{item.title}</p>
                        {item.category && <p className="text-xs text-blue-600">{item.category}</p>}
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[linear-gradient(135deg,#6B21A8,#8B5CF6)] py-4 font-bold text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Save & Download Resume PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ================= PREVIEW SECTION ================= */}
          <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm lg:sticky lg:top-24 lg:h-fit">
            <div className="bg-[linear-gradient(135deg,#6B21A8,#8B5CF6)] px-6 py-4">
              <h2 className="text-white text-xl font-semibold flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Live Preview
              </h2>
            </div>
            
            <div
              ref={resumeRef}
              className="bg-white overflow-y-auto lg:max-h-[calc(100dvh-210px)]"
            >
              <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
                
                {/* SIDEBAR */}
                <div className="bg-[linear-gradient(180deg,#581C87,#1F2937)] text-white p-6">
                  <h2 className="text-white text-2xl font-bold mb-1 break-words">
                    {form.fullName || <span className="text-gray-400 italic">Your Name</span>}
                  </h2>
                  <p className="text-[#E9D5FF] text-sm font-medium mb-4 pb-4 border-b border-white/15">
                    {form.jobTitle || <span className="text-gray-400 italic">Job Title</span>}
                  </p>

                  <h3 className="text-gray-400 text-xs font-semibold tracking-wider mt-6 mb-3 uppercase">
                    Contact
                  </h3>
                  {form.email && (
                    <p className="text-white/90 text-sm mb-2 flex items-center gap-2 break-all">
                      <Mail className="w-3 h-3 flex-shrink-0" /> 
                      <span className="break-all">{form.email}</span>
                    </p>
                  )}
                  {form.phone && (
                    <p className="text-white/90 text-sm mb-2 flex items-center gap-2">
                      <Phone className="w-3 h-3 flex-shrink-0" /> {form.phone}
                    </p>
                  )}
                  {form.address && (
                    <p className="text-white/90 text-sm mb-4 flex items-center gap-2">
                      <MapPin className="w-3 h-3 flex-shrink-0" /> {form.address}
                    </p>
                  )}

                  {/* Specialization */}
                  {form.specialization.length > 0 && (
                    <>
                      <h3 className="text-gray-400 text-xs font-semibold tracking-wider mt-6 mb-3 uppercase">
                        Specialization
                      </h3>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {form.specialization.map((spec, index) => (
                          <span key={index} className="bg-white/10 text-white px-2 py-1 rounded text-xs">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Skills */}
                  {skillsList.length > 0 && (
                    <>
                      <h3 className="text-gray-400 text-xs font-semibold tracking-wider mt-6 mb-3 uppercase">
                        Skills
                      </h3>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {skillsList.map((skill, index) => (
                          <span key={index} className="bg-white/10 text-white px-2 py-1 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Languages */}
                  {form.languages.length > 0 && (
                    <>
                      <h3 className="text-gray-400 text-xs font-semibold tracking-wider mt-6 mb-3 uppercase">
                        Languages
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {form.languages.map((lang, index) => (
                          <span key={index} className="bg-white/10 text-white px-2 py-1 rounded text-xs">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* MAIN CONTENT */}
                <div className="p-6">
                  {/* Summary */}
                  {form.summary && (
                    <div className="mb-6">
                      <h3 className="text-gray-800 text-sm font-semibold tracking-wider mb-2 uppercase border-b-2 border-blue-500 pb-2 inline-block">
                        Professional Summary
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mt-3">
                        {form.summary}
                      </p>
                    </div>
                  )}

                  {/* Technical Skills */}
                  {form.technicalSkills.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-gray-800 text-sm font-semibold tracking-wider mb-2 uppercase border-b-2 border-blue-500 pb-2 inline-block">
                        Technical Skills
                      </h3>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {form.technicalSkills.map((skill, index) => (
                          <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {form.experiences.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-gray-800 text-sm font-semibold tracking-wider mb-3 uppercase border-b-2 border-blue-500 pb-2 inline-block">
                        Experience
                      </h3>
                      {form.experiences.map((exp, index) => (
                        <div key={index} className="mb-4 mt-3">
                          <p className="font-semibold text-gray-800 text-sm">{exp.experienceTitle}</p>
                          <p className="text-sm text-blue-600">{exp.companyName}</p>
                          <p className="text-xs text-gray-500 mb-1">{exp.duration}</p>
                          <p className="text-sm text-gray-600">{exp.workDetails}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Education */}
                  {form.education.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-gray-800 text-sm font-semibold tracking-wider mb-3 uppercase border-b-2 border-blue-500 pb-2 inline-block">
                        Education
                      </h3>
                      {form.education.map((edu, index) => (
                        <div key={index} className="mt-3">
                          <p className="font-semibold text-gray-800 text-sm">{edu.degree}</p>
                          <p className="text-sm text-gray-600">{edu.institution}</p>
                          <p className="text-xs text-gray-500">{edu.year}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Certifications */}
                  {form.certifications.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-gray-800 text-sm font-semibold tracking-wider mb-3 uppercase border-b-2 border-blue-500 pb-2 inline-block">
                        Certifications
                      </h3>
                      {form.certifications.map((cert, index) => (
                        <div key={index} className="mt-3">
                          <p className="font-semibold text-gray-800 text-sm">{cert.name}</p>
                          <p className="text-sm text-gray-600">{cert.issuingOrganization}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style >{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ResumeForm;
