import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    VscArrowLeft,
    VscCheck,
    VscEdit,
    VscFile,
    VscLightbulb,
    VscStarFull,
    VscVerified,
    VscWarning,
    VscCopy,
    VscEye,
    VscGraphLine,
    VscRocket,
    VscThumbsup,
    VscTools
} from "react-icons/vsc";
import { MdDescription } from "react-icons/md";
import { HiOutlineDocumentText, HiOutlineSparkles } from "react-icons/hi";

export default function ResumeTips() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("tips");
    const [copiedTemplate, setCopiedTemplate] = useState(null);

    const tips = [
        {
            id: 1,
            title: "Use a Clean, Professional Format",
            description: "Keep your resume simple and easy to read. Use consistent formatting, clear headings, and plenty of white space.",
            icon: VscFile,
            color: "blue",
            examples: [
                "Use standard fonts like Arial, Calibri, or Helvetica",
                "Keep font size between 10-12pt for body text",
                "Use bold and italics sparingly for emphasis",
                "Save as PDF to preserve formatting"
            ]
        },
        {
            id: 2,
            title: "Tailor Your Resume for Each Job",
            description: "Customize your resume to match the specific job description and requirements.",
            icon: VscEdit,
            color: "green",
            examples: [
                "Highlight relevant skills mentioned in the job posting",
                "Use keywords from the job description",
                "Emphasize accomplishments that align with the role",
                "Reorder bullet points to prioritize relevant experience"
            ]
        },
        {
            id: 3,
            title: "Highlight Achievements, Not Just Duties",
            description: "Focus on quantifiable accomplishments rather than just listing job responsibilities.",
            icon: VscGraphLine,
            color: "purple",
            examples: [
                "Increased sales by 45% within 6 months",
                "Managed a team of 15 developers",
                "Reduced operational costs by $50K annually",
                "Launched 3 successful products in 2 years"
            ]
        },
        {
            id: 4,
            title: "Include Relevant Keywords",
            description: "Many companies use Applicant Tracking Systems (ATS) to scan resumes. Include relevant industry keywords.",
            icon: VscTools,
            color: "orange",
            examples: [
                "Technical skills: React, Node.js, Python, AWS",
                "Soft skills: Leadership, Communication, Problem-solving",
                "Industry terms: Agile, Scrum, DevOps, CI/CD",
                "Certifications: PMP, AWS Certified, Scrum Master"
            ]
        },
        {
            id: 5,
            title: "Keep It Concise",
            description: "Recruiters spend an average of 6-7 seconds scanning a resume. Make every word count.",
            icon: VscWarning,
            color: "red",
            examples: [
                "Limit to 1-2 pages maximum",
                "Use bullet points instead of paragraphs",
                "Remove outdated or irrelevant experience",
                "Focus on the last 10-15 years of experience"
            ]
        },
        {
            id: 6,
            title: "Proofread and Get Feedback",
            description: "Errors can make you look unprofessional. Always proofread and get a second opinion.",
            icon: VscEye,
            color: "indigo",
            examples: [
                "Check for spelling and grammar errors",
                "Ensure consistent formatting throughout",
                "Ask a friend or mentor to review",
                "Read aloud to catch awkward phrasing"
            ]
        }
    ];

    const sections = [
        {
            name: "Contact Information",
            tips: [
                "Include full name, phone number, email address",
                "Add LinkedIn profile and portfolio website",
                "Use a professional email address",
                "Include city and state (full address optional)"
            ]
        },
        {
            name: "Professional Summary",
            tips: [
                "Write 2-3 sentences highlighting your experience and skills",
                "Tailor to the specific role you're applying for",
                "Include your years of experience and key strengths",
                "Mention career achievements and goals"
            ]
        },
        {
            name: "Work Experience",
            tips: [
                "List positions in reverse chronological order",
                "Use action verbs to start each bullet point",
                "Quantify achievements with numbers and percentages",
                "Focus on results, not just responsibilities"
            ]
        },
        {
            name: "Education",
            tips: [
                "Include degree, institution, and graduation year",
                "List relevant coursework or honors",
                "Add GPA if 3.5 or higher",
                "Include certifications and professional development"
            ]
        },
        {
            name: "Skills",
            tips: [
                "Categorize skills (technical, soft, languages)",
                "List proficiency levels when relevant",
                "Include both hard and soft skills",
                "Highlight skills mentioned in job description"
            ]
        }
    ];

    const resumeTemplates = [
        {
            id: "modern",
            name: "Modern Professional",
            description: "Clean, contemporary design with a focus on readability",
            features: ["Two-column layout", "Skill highlights", "Professional summary section"],
            preview: "bg-gradient-to-br from-blue-50 to-indigo-50"
        },
        {
            id: "classic",
            name: "Classic Traditional",
            description: "Timeless format preferred by traditional industries",
            features: ["Single-column layout", "Chronological experience", "Clean typography"],
            preview: "bg-gradient-to-br from-gray-50 to-slate-50"
        },
        {
            id: "creative",
            name: "Creative Portfolio",
            description: "Perfect for design, marketing, and creative roles",
            features: ["Visual elements", "Portfolio integration", "Unique layout"],
            preview: "bg-gradient-to-br from-purple-50 to-pink-50"
        },
        {
            id: "executive",
            name: "Executive Suite",
            description: "Sophisticated format for senior-level positions",
            features: ["Executive summary", "Leadership highlights", "Achievement focus"],
            preview: "bg-gradient-to-br from-amber-50 to-orange-50"
        }
    ];

    const commonMistakes = [
        "Typos and grammatical errors",
        "Using an unprofessional email address",
        "Including irrelevant personal information",
        "Having gaps in employment without explanation",
        "Using a generic objective statement",
        "Listing every job since high school",
        "Using complex formatting that ATS can't read",
        "Including salary requirements or references on resume"
    ];

    const actionVerbs = [
        "Achieved", "Managed", "Created", "Developed", "Led", "Increased",
        "Reduced", "Improved", "Implemented", "Designed", "Launched", "Optimized",
        "Coordinated", "Analyzed", "Directed", "Established", "Generated", "Transformed"
    ];

    const copyToClipboard = (text, templateId) => {
        navigator.clipboard.writeText(text);
        setCopiedTemplate(templateId);
        setTimeout(() => setCopiedTemplate(null), 2000);
    };

    const sampleBulletPoints = [
        "Led a team of 8 developers to successfully launch a new SaaS platform, resulting in $2.5M annual recurring revenue within the first year",
        "Implemented agile methodologies across 5 cross-functional teams, increasing delivery speed by 40% and improving team satisfaction scores by 35%",
        "Optimized database queries and caching strategies, reducing average page load time from 3.2s to 0.8s and improving user engagement by 25%",
        "Developed and executed a comprehensive digital marketing strategy that grew organic traffic by 150% and generated $1.2M in qualified leads"
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
                    >
                        <VscArrowLeft className="text-xl" />
                        Back
                    </button>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-white/20 p-3 rounded-xl">
                            <HiOutlineDocumentText className="text-3xl" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold">Resume Tips & Guide</h1>
                    </div>
                    <p className="text-xl text-blue-100 max-w-3xl">
                        Create a standout resume that gets noticed by recruiters and passes through Applicant Tracking Systems (ATS)
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab("tips")}
                        className={`px-6 py-3 font-medium transition-all rounded-t-lg ${activeTab === "tips"
                                ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <VscLightbulb className="text-lg" />
                            Resume Tips
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab("sections")}
                        className={`px-6 py-3 font-medium transition-all rounded-t-lg ${activeTab === "sections"
                                ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <MdDescription className="text-lg" />
                            Resume Sections
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab("templates")}
                        className={`px-6 py-3 font-medium transition-all rounded-t-lg ${activeTab === "templates"
                                ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <VscFile className="text-lg" />
                            Templates
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab("examples")}
                        className={`px-6 py-3 font-medium transition-all rounded-t-lg ${activeTab === "examples"
                                ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <VscStarFull className="text-lg" />
                            Examples & Tools
                        </div>
                    </button>
                </div>

                {/* Tips Tab */}
                {activeTab === "tips" && (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                            {tips.map((tip) => (
                                <div
                                    key={tip.id}
                                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-100 group"
                                >
                                    <div className={`bg-${tip.color}-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <tip.icon className={`text-${tip.color}-600 text-xl`} />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{tip.title}</h3>
                                    <p className="text-gray-600 mb-4">{tip.description}</p>
                                    <div className="space-y-2">
                                        {tip.examples.map((example, idx) => (
                                            <div key={idx} className="flex items-start gap-2 text-sm text-gray-500">
                                                <VscCheck className="text-green-500 mt-0.5 flex-shrink-0" />
                                                <span>{example}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Common Mistakes Section */}
                        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-red-100 p-2 rounded-lg">
                                    <VscWarning className="text-red-600 text-xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">Common Resume Mistakes to Avoid</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {commonMistakes.map((mistake, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-gray-600">
                                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                                        <span>{mistake}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Verbs Section */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-white p-2 rounded-lg">
                                    <VscRocket className="text-blue-600 text-xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">Powerful Action Verbs</h2>
                            </div>
                            <p className="text-gray-600 mb-4">
                                Start your bullet points with these strong action verbs to make your achievements stand out:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {actionVerbs.map((verb, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors cursor-pointer"
                                    >
                                        {verb}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Sections Tab */}
                {activeTab === "sections" && (
                    <div>
                        <div className="grid grid-cols-1 gap-6">
                            {sections.map((section, idx) => (
                                <div key={idx} className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
                                    <h3 className="text-xl font-bold text-gray-800 mb-3">{section.name}</h3>
                                    <ul className="space-y-2">
                                        {section.tips.map((tip, tipIdx) => (
                                            <li key={tipIdx} className="flex items-start gap-2 text-gray-600">
                                                <VscCheck className="text-green-500 mt-1 flex-shrink-0" />
                                                <span>{tip}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Bonus Tips */}
                        <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <HiOutlineSparkles className="text-purple-600 text-2xl" />
                                <h3 className="text-xl font-bold text-gray-800">Bonus Tips for ATS Optimization</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-2">
                                    <VscVerified className="text-green-500 mt-1" />
                                    <span className="text-gray-700">Use standard section headings (Work Experience, Education, Skills)</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <VscVerified className="text-green-500 mt-1" />
                                    <span className="text-gray-700">Avoid tables, columns, and graphics that ATS can't parse</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <VscVerified className="text-green-500 mt-1" />
                                    <span className="text-gray-700">Submit as .docx or .pdf (check job posting for preference)</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <VscVerified className="text-green-500 mt-1" />
                                    <span className="text-gray-700">Include keywords from the job description throughout your resume</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Templates Tab */}
                {activeTab === "templates" && (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {resumeTemplates.map((template) => (
                                <div
                                    key={template.id}
                                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden group cursor-pointer"
                                >
                                    <div className={`h-48 ${template.preview} p-6 relative group-hover:scale-105 transition-transform duration-300`}>
                                        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4">
                                            <div className="w-12 h-12 bg-blue-600 rounded-lg mb-3"></div>
                                            <div className="h-3 bg-gray-300 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">{template.name}</h3>
                                        <p className="text-gray-600 mb-4">{template.description}</p>
                                        <div className="space-y-2 mb-4">
                                            {template.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                                                    <VscCheck className="text-green-500" />
                                                    <span>{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                                            Use This Template
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-blue-50 rounded-xl p-6 text-center">
                            <div className="text-4xl text-blue-600 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Need a Custom Template?</h3>
                            <p className="text-gray-600 mb-4">Download our professionally designed resume templates</p>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium inline-flex items-center gap-2">
                                <div />
                                Download Templates
                            </button>
                        </div>
                    </div>
                )}

                {/* Examples Tab */}
                {activeTab === "examples" && (
                    <div>
                        {/* Sample Bullet Points */}
                        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <VscStarFull className="text-green-600 text-xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">Strong Achievement Bullet Points</h2>
                            </div>
                            <div className="space-y-4">
                                {sampleBulletPoints.map((point, idx) => (
                                    <div key={idx} className="border-l-4 border-green-500 pl-4 py-2 bg-gray-50 rounded-r-lg">
                                        <p className="text-gray-700">{point}</p>
                                        <button
                                            onClick={() => copyToClipboard(point, `sample-${idx}`)}
                                            className="mt-2 text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                                        >
                                            {copiedTemplate === `sample-${idx}` ? (
                                                <>
                                                    <VscCheck className="text-green-500" />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <VscCopy />
                                                    Copy to clipboard
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Before & After Examples */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <VscWarning className="text-red-500 text-xl" />
                                    <h3 className="text-lg font-bold text-gray-800">Before (Weak)</h3>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                    <p className="text-gray-600 italic">"Responsible for managing social media accounts and creating content"</p>
                                </div>
                                <div className="flex items-center gap-2 mb-4 mt-6">
                                    <VscThumbsup className="text-green-500 text-xl" />
                                    <h3 className="text-lg font-bold text-gray-800">After (Strong)</h3>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-gray-700">"Grew social media following by 200% and increased engagement rate by 150% through strategic content planning and community management"</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <VscWarning className="text-red-500 text-xl" />
                                    <h3 className="text-lg font-bold text-gray-800">Before (Weak)</h3>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                    <p className="text-gray-600 italic">"Worked on improving website performance"</p>
                                </div>
                                <div className="flex items-center gap-2 mb-4 mt-6">
                                    <VscThumbsup className="text-green-500 text-xl" />
                                    <h3 className="text-lg font-bold text-gray-800">After (Strong)</h3>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-gray-700">"Optimized website performance, reducing load time by 60% and improving Core Web Vitals scores, resulting in a 25% increase in conversion rate"</p>
                                </div>
                            </div>
                        </div>

                        {/* Tools & Resources */}
                        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <VscTools className="text-2xl text-indigo-600" />
                                <h2 className="text-2xl font-bold text-gray-800">Recommended Tools & Resources</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-800 mb-2">Resume Builders</h4>
                                    <ul className="space-y-1 text-sm text-gray-600">
                                        <li>• Canva</li>
                                        <li>• Novoresume</li>
                                        <li>• Zety</li>
                                    </ul>
                                </div>
                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-800 mb-2">ATS Checkers</h4>
                                    <ul className="space-y-1 text-sm text-gray-600">
                                        <li>• Jobscan</li>
                                        <li>• ResumeWorded</li>
                                        <li>• SkillSyncer</li>
                                    </ul>
                                </div>
                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-800 mb-2">Grammar Tools</h4>
                                    <ul className="space-y-1 text-sm text-gray-600">
                                        <li>• Grammarly</li>
                                        <li>• Hemingway Editor</li>
                                        <li>• ProWritingAid</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer CTA */}
            <div className="bg-gray-900 text-white py-12 mt-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h3 className="text-2xl font-bold mb-4">Ready to Create Your Perfect Resume?</h3>
                    <p className="text-gray-300 mb-6">Use our tips and templates to build a resume that stands out</p>
                    <button
                        onClick={() => navigate("/jobs")}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all inline-flex items-center gap-2"
                    >
                        Browse Jobs
                        <VscRocket />
                    </button>
                </div>
            </div>
        </div>
    );
}