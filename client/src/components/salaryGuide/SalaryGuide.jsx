import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    VscArrowLeft,
    VscCheck,
    VscGraphLine,
    VscOrganization,
    VscPerson,
    VscLightbulb,
    VscStarFull,
    VscWarning,
    VscBook,
    VscThumbsup,
    VscTools,
    VscSymbolNumeric,
    VscCreditCard,
    VscGraph,
    VscInfo,
    VscFile,
    VscSearch,
    VscLocation,
    VscBriefcase,
    VscHistory,
    VscRocket,
    VscMail,
    VscCopy,
    VscCloudDownload,
    VscChevronRight  // Moved here from separate import
} from "react-icons/vsc";
import {VscWatch} from 'react-icons/vsc'
import { MdWork, MdSchool, MdTrendingUp, MdAttachMoney, MdRecordVoiceOver } from "react-icons/md";
import { FaRegBuilding, FaRegLightbulb, FaChartLine, FaHandshake, FaDollarSign, FaCalculator } from "react-icons/fa";
import { HiOutlineDocumentText, HiOutlineSparkles, HiOutlineClipboardList, HiOutlineCurrencyRupee } from "react-icons/hi";
export default function SalaryGuide() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("overview");
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedCity, setSelectedCity] = useState("bangalore");
    const [copiedText, setCopiedText] = useState(null);

    // Salary data by role and experience
    const salaryData = {
        "Software Development": {
            "Frontend Developer": { entry: 4.5, mid: 8.5, senior: 15, lead: 22 },
            "Backend Developer": { entry: 5, mid: 9.5, senior: 18, lead: 25 },
            "Full Stack Developer": { entry: 5.5, mid: 10, senior: 19, lead: 26 },
            "Mobile Developer": { entry: 4.8, mid: 9, senior: 16, lead: 23 },
            "DevOps Engineer": { entry: 5.5, mid: 11, senior: 20, lead: 28 },
            "Data Scientist": { entry: 6, mid: 12, senior: 22, lead: 30 },
            "Machine Learning Engineer": { entry: 7, mid: 14, senior: 25, lead: 35 },
            "Software Architect": { entry: 12, mid: 20, senior: 30, lead: 40 }
        },
        "IT & Infrastructure": {
            "System Administrator": { entry: 3.5, mid: 6.5, senior: 11, lead: 16 },
            "Network Engineer": { entry: 3.8, mid: 7, senior: 12, lead: 18 },
            "Database Administrator": { entry: 4, mid: 8, senior: 14, lead: 20 },
            "Cloud Engineer": { entry: 5, mid: 10, senior: 18, lead: 25 },
            "Security Analyst": { entry: 4.5, mid: 9, senior: 16, lead: 24 },
            "IT Support Manager": { entry: 4, mid: 7, senior: 12, lead: 18 }
        },
        "Data & Analytics": {
            "Data Analyst": { entry: 3.5, mid: 7, senior: 12, lead: 18 },
            "Business Analyst": { entry: 4, mid: 8, senior: 14, lead: 20 },
            "Data Engineer": { entry: 5, mid: 10, senior: 18, lead: 25 },
            "BI Analyst": { entry: 4, mid: 8, senior: 14, lead: 20 },
            "Analytics Manager": { entry: 8, mid: 14, senior: 22, lead: 30 }
        },
        "Product Management": {
            "Associate Product Manager": { entry: 5, mid: 9, senior: 15, lead: 22 },
            "Product Manager": { entry: 8, mid: 14, senior: 22, lead: 30 },
            "Senior Product Manager": { entry: 12, mid: 18, senior: 28, lead: 38 },
            "Product Owner": { entry: 6, mid: 11, senior: 18, lead: 25 },
            "Product Director": { entry: 20, mid: 30, senior: 45, lead: 60 }
        },
        "Design": {
            "UI Designer": { entry: 3.5, mid: 6.5, senior: 11, lead: 16 },
            "UX Designer": { entry: 4, mid: 8, senior: 14, lead: 20 },
            "Product Designer": { entry: 4.5, mid: 9, senior: 16, lead: 24 },
            "Graphic Designer": { entry: 2.5, mid: 5, senior: 8, lead: 12 },
            "Design Lead": { entry: 8, mid: 14, senior: 22, lead: 30 }
        },
        "Marketing": {
            "Digital Marketing Specialist": { entry: 3, mid: 6, senior: 10, lead: 15 },
            "SEO Specialist": { entry: 2.8, mid: 5.5, senior: 9, lead: 14 },
            "Content Marketing Manager": { entry: 4, mid: 8, senior: 13, lead: 18 },
            "Social Media Manager": { entry: 3.5, mid: 7, senior: 12, lead: 17 },
            "Marketing Director": { entry: 12, mid: 20, senior: 35, lead: 50 }
        },
        "Sales": {
            "Business Development Executive": { entry: 3, mid: 6, senior: 10, lead: 15 },
            "Account Executive": { entry: 4, mid: 8, senior: 14, lead: 20 },
            "Sales Manager": { entry: 6, mid: 12, senior: 20, lead: 30 },
            "Regional Sales Director": { entry: 12, mid: 20, senior: 35, lead: 50 },
            "Sales Development Rep": { entry: 2.5, mid: 5, senior: 8, lead: 12 }
        },
        "Human Resources": {
            "HR Generalist": { entry: 3, mid: 6, senior: 10, lead: 15 },
            "Recruiter": { entry: 3.5, mid: 7, senior: 12, lead: 18 },
            "HR Business Partner": { entry: 5, mid: 10, senior: 16, lead: 22 },
            "Talent Acquisition Manager": { entry: 6, mid: 12, senior: 18, lead: 25 },
            "HR Director": { entry: 12, mid: 20, senior: 30, lead: 40 }
        },
        "Finance": {
            "Financial Analyst": { entry: 4, mid: 8, senior: 14, lead: 20 },
            "Accountant": { entry: 3, mid: 6, senior: 10, lead: 15 },
            "Finance Manager": { entry: 8, mid: 14, senior: 22, lead: 30 },
            "Investment Banker": { entry: 10, mid: 18, senior: 30, lead: 45 },
            "CFO": { entry: 30, mid: 50, senior: 80, lead: 120 }
        }
    };

    const cityFactors = {
        bangalore: { name: "Bangalore", multiplier: 1.2, avgRent: 25000, costOfLiving: "High" },
        mumbai: { name: "Mumbai", multiplier: 1.15, avgRent: 30000, costOfLiving: "Very High" },
        delhi: { name: "Delhi NCR", multiplier: 1.1, avgRent: 20000, costOfLiving: "High" },
        hyderabad: { name: "Hyderabad", multiplier: 1.0, avgRent: 18000, costOfLiving: "Medium" },
        pune: { name: "Pune", multiplier: 1.0, avgRent: 15000, costOfLiving: "Medium" },
        chennai: { name: "Chennai", multiplier: 0.95, avgRent: 14000, costOfLiving: "Medium" },
        kolkata: { name: "Kolkata", multiplier: 0.85, avgRent: 12000, costOfLiving: "Low" },
        ahmedabad: { name: "Ahmedabad", multiplier: 0.9, avgRent: 10000, costOfLiving: "Low" }
    };

    const experienceLevels = [
        { level: "entry", name: "Entry Level", years: "0-2 years", color: "green" },
        { level: "mid", name: "Mid Level", years: "3-6 years", color: "blue" },
        { level: "senior", name: "Senior Level", years: "7-10 years", color: "purple" },
        { level: "lead", name: "Lead/Manager", years: "10+ years", color: "orange" }
    ];

    const negotiationTips = [
        {
            title: "Do Your Research",
            icon: VscSearch,
            tips: [
                "Research industry standards using platforms like Glassdoor, LinkedIn, and AmbitionBox",
                "Understand the company's size, funding stage, and location",
                "Know your market value based on skills and experience",
                "Consider the total compensation package, not just base salary"
            ]
        },
        {
            title: "Know Your Worth",
            icon: VscGraphLine,
            tips: [
                "Calculate your current total compensation (including bonuses, benefits)",
                "Quantify your achievements and impact on previous roles",
                "Get clear on your minimum acceptable offer",
                "Consider non-monetary factors like growth opportunities"
            ]
        },
        {
            title: "Timing is Everything",
            icon: VscWatch,
            tips: [
                "Never discuss salary in the first interview",
                "Wait for the employer to bring up numbers first",
                "Negotiate after receiving a formal offer",
                "Be prepared to negotiate during performance reviews"
            ]
        },
        {
            title: "Build Your Case",
            icon: VscFile,
            tips: [
                "Highlight your unique skills and accomplishments",
                "Show how you'll add value to the company",
                "Use market data to support your request",
                "Prepare examples of your impact on previous roles"
            ]
        },
        {
            title: "Consider the Full Package",
            icon: VscCreditCard,
            tips: [
                "Base salary is important, but consider bonuses, stock options",
                "Evaluate benefits like health insurance, retirement plans",
                "Factor in remote work flexibility and work-life balance",
                "Consider professional development opportunities"
            ]
        },
        {
            title: "Practice Your Pitch",
            icon: MdRecordVoiceOver,
            tips: [
                "Role-play with a friend or mentor",
                "Stay confident but flexible",
                "Use professional, collaborative language",
                "Be prepared for pushback and counter-offers"
            ]
        }
    ];

    const benefitsToConsider = [
        { name: "Health Insurance", importance: "Critical", typical: "Family floater up to 5-10 lakhs" },
        { name: "Performance Bonus", importance: "High", typical: "10-30% of annual salary" },
        { name: "Stock Options/ESOPs", importance: "Medium-High", typical: "Varies by company stage" },
        { name: "Retirement Benefits", importance: "Medium", typical: "PF, Gratuity, NPS" },
        { name: "Paid Time Off", importance: "Medium", typical: "20-30 days annually" },
        { name: "Work from Home", importance: "High", typical: "Flexible or hybrid options" },
        { name: "Professional Development", importance: "Medium", typical: "Training budget, certifications" },
        { name: "Transportation", importance: "Low-Medium", typical: "Cab service, travel allowance" }
    ];

    const negotiationScripts = [
        {
            scenario: "When asked about current salary",
            script: "I'd prefer to focus on the value I can bring to this role and understand what you've budgeted for this position. Based on my research and experience, I'm looking for something in the range of [X-Y]."
        },
        {
            scenario: "When receiving an offer below expectations",
            script: "Thank you for the offer. I'm very excited about this opportunity. Based on my experience in [specific skill] and my research on market rates for this role, I was hoping for something closer to [X]. Is there flexibility to adjust the offer?"
        },
        {
            scenario: "When negotiating additional benefits",
            script: "I understand the budget constraints on base salary. Would there be room to discuss other aspects of the compensation package, such as signing bonus, performance bonus structure, or additional vacation time?"
        },
        {
            scenario: "When considering multiple offers",
            script: "I'm very interested in joining your team. I have received another offer with a higher base salary, but I'm more excited about this role. Would you be able to match or come closer to that number?"
        }
    ];

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedText(id);
        setTimeout(() => setCopiedText(null), 2000);
    };

    const getSalaryForRole = (category, role, level) => {
        if (salaryData[category] && salaryData[category][role]) {
            const baseSalary = salaryData[category][role][level];
            const multiplier = cityFactors[selectedCity]?.multiplier || 1;
            return Math.round(baseSalary * multiplier);
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-teal-700 text-white">
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
                            <MdAttachMoney className="text-3xl" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold">Salary Guide & Negotiation Tips</h1>
                    </div>
                    <p className="text-xl text-green-100 max-w-3xl">
                        Know your worth, understand market rates, and master the art of salary negotiation
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab("overview")}
                        className={`px-6 py-3 font-medium transition-all rounded-t-lg ${activeTab === "overview"
                                ? "text-green-600 border-b-2 border-green-600 bg-white"
                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <VscGraphLine className="text-lg" />
                            Salary Overview
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab("byrole")}
                        className={`px-6 py-3 font-medium transition-all rounded-t-lg ${activeTab === "byrole"
                                ? "text-green-600 border-b-2 border-green-600 bg-white"
                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <VscBriefcase className="text-lg" />
                            By Role & Experience
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab("negotiation")}
                        className={`px-6 py-3 font-medium transition-all rounded-t-lg ${activeTab === "negotiation"
                                ? "text-green-600 border-b-2 border-green-600 bg-white"
                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <FaHandshake className="text-lg" />
                            Negotiation Tips
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab("benefits")}
                        className={`px-6 py-3 font-medium transition-all rounded-t-lg ${activeTab === "benefits"
                                ? "text-green-600 border-b-2 border-green-600 bg-white"
                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <VscCreditCard className="text-lg" />
                            Benefits & Perks
                        </div>
                    </button>
                </div>

                {/* Overview Tab */}
                {activeTab === "overview" && (
                    <div>
                        {/* Key Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 text-center">
                                <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <MdAttachMoney className="text-3xl text-green-700" />
                                </div>
                                <div className="text-3xl font-bold text-green-700 mb-2">₹4.5L - ₹35L+</div>
                                <p className="text-gray-600">Average Salary Range (Tech)</p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 text-center">
                                <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <VscGraph className="text-3xl text-blue-700" />
                                </div>
                                <div className="text-3xl font-bold text-blue-700 mb-2">10-15%</div>
                                <p className="text-gray-600">Average Annual Increment</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 text-center">
                                <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <VscLocation className="text-3xl text-purple-700" />
                                </div>
                                <div className="text-3xl font-bold text-purple-700 mb-2">20-30%</div>
                                <p className="text-gray-600">Higher Salary in Tier 1 Cities</p>
                            </div>
                        </div>

                        {/* Factors Affecting Salary */}
                        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <VscInfo className="text-2xl text-green-600" />
                                <h2 className="text-2xl font-bold text-gray-800">Factors Affecting Salary</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <VscPerson className="text-2xl text-green-600 mb-2" />
                                    <h3 className="font-semibold text-gray-800">Experience</h3>
                                    <p className="text-sm text-gray-600">More experience typically commands higher compensation</p>
                                </div>
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <VscOrganization className="text-2xl text-green-600 mb-2" />
                                    <h3 className="font-semibold text-gray-800">Company Size</h3>
                                    <p className="text-sm text-gray-600">Large companies often offer higher base salaries</p>
                                </div>
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <VscLocation className="text-2xl text-green-600 mb-2" />
                                    <h3 className="font-semibold text-gray-800">Location</h3>
                                    <p className="text-sm text-gray-600">Metro cities offer 15-30% higher compensation</p>
                                </div>
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <VscTools className="text-2xl text-green-600 mb-2" />
                                    <h3 className="font-semibold text-gray-800">Skills</h3>
                                    <p className="text-sm text-gray-600">In-demand skills command premium salaries</p>
                                </div>
                            </div>
                        </div>

                        {/* City Comparison */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <VscLocation className="text-2xl text-green-600" />
                                <h2 className="text-2xl font-bold text-gray-800">City-wise Salary Comparison</h2>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select City</label>
                                <select
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                >
                                    {Object.entries(cityFactors).map(([key, city]) => (
                                        <option key={key} value={key}>{city.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry Level</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mid Level</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Senior Level</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead/Manager</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {Object.entries(salaryData["Software Development"]).slice(0, 4).map(([role, salaries]) => (
                                            <tr key={role}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    ₹{Math.round(salaries.entry * (cityFactors[selectedCity]?.multiplier || 1))}L
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    ₹{Math.round(salaries.mid * (cityFactors[selectedCity]?.multiplier || 1))}L
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    ₹{Math.round(salaries.senior * (cityFactors[selectedCity]?.multiplier || 1))}L
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    ₹{Math.round(salaries.lead * (cityFactors[selectedCity]?.multiplier || 1))}L
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* By Role & Experience Tab */}
                {activeTab === "byrole" && (
                    <div>
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Salary by Role and Experience</h2>
                                <p className="text-gray-600">Click on any role to see detailed salary breakdown</p>
                            </div>

                            {Object.entries(salaryData).map(([category, roles]) => (
                                <div key={category} className="mb-8">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <VscBriefcase className="text-green-600" />
                                        {category}
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {Object.entries(roles).map(([role, salaries]) => (
                                            <div key={role} className="border border-gray-200 rounded-lg overflow-hidden">
                                                <button
                                                    onClick={() => setSelectedRole(selectedRole === role ? null : role)}
                                                    className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between items-center"
                                                >
                                                    <span className="font-semibold text-gray-800">{role}</span>
                                                    <VscChevronRight className={`transition-transform ${selectedRole === role ? 'rotate-90' : ''}`} />
                                                </button>
                                                {selectedRole === role && (
                                                    <div className="p-4 bg-white">
                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                            {experienceLevels.map((exp) => (
                                                                <div key={exp.level} className="bg-gray-50 rounded-lg p-3 text-center">
                                                                    <p className="text-sm text-gray-600 mb-1">{exp.name}</p>
                                                                    <p className="text-xs text-gray-500 mb-2">{exp.years}</p>
                                                                    <p className="text-xl font-bold text-green-600">
                                                                        ₹{getSalaryForRole(category, role, exp.level)}L
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Negotiation Tips Tab */}
                {activeTab === "negotiation" && (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {negotiationTips.map((tip, idx) => (
                                <div key={idx} className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-green-100 p-2 rounded-lg">
                                            <tip.icon className="text-green-600 text-xl" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800">{tip.title}</h3>
                                    </div>
                                    <ul className="space-y-2">
                                        {tip.tips.map((item, itemIdx) => (
                                            <li key={itemIdx} className="flex items-start gap-2 text-gray-600">
                                                <VscCheck className="text-green-500 mt-1 flex-shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Negotiation Scripts */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <MdRecordVoiceOver className="text-2xl text-blue-600" />
                                <h2 className="text-2xl font-bold text-gray-800">Negotiation Scripts</h2>
                            </div>
                            <div className="space-y-4">
                                {negotiationScripts.map((script, idx) => (
                                    <div key={idx} className="bg-white rounded-lg p-4">
                                        <h3 className="font-semibold text-gray-800 mb-2">{script.scenario}</h3>
                                        <p className="text-gray-600 mb-3 italic">"{script.script}"</p>
                                        <button
                                            onClick={() => copyToClipboard(script.script, `script-${idx}`)}
                                            className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                                        >
                                            {copiedText === `script-${idx}` ? (
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

                        {/* Key Negotiation Principles */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <VscLightbulb className="text-2xl text-yellow-600" />
                                <h2 className="text-2xl font-bold text-gray-800">Key Negotiation Principles</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <h3 className="font-semibold text-gray-800 mb-2">Always Negotiate</h3>
                                    <p className="text-sm text-gray-600">80% of employers expect negotiation. Always ask for more - the worst they can say is no.</p>
                                </div>
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <h3 className="font-semibold text-gray-800 mb-2">Be Professional</h3>
                                    <p className="text-sm text-gray-600">Maintain a collaborative tone. You're negotiating, not demanding.</p>
                                </div>
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <h3 className="font-semibold text-gray-800 mb-2">Know Your BATNA</h3>
                                    <p className="text-sm text-gray-600">Best Alternative To Negotiated Agreement - know your walk-away point.</p>
                                </div>
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <h3 className="font-semibold text-gray-800 mb-2">Get It in Writing</h3>
                                    <p className="text-sm text-gray-600">Always get the final offer in writing before accepting.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Benefits & Perks Tab */}
                {activeTab === "benefits" && (
                    <div>
                        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <VscCreditCard className="text-2xl text-green-600" />
                                <h2 className="text-2xl font-bold text-gray-800">Common Benefits to Consider</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Benefit</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Importance</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Typical Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {benefitsToConsider.map((benefit, idx) => (
                                            <tr key={idx}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{benefit.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${benefit.importance === 'Critical' ? 'bg-red-100 text-red-800' :
                                                            benefit.importance === 'High' ? 'bg-green-100 text-green-800' :
                                                                benefit.importance === 'Medium-High' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {benefit.importance}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{benefit.typical}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Total Compensation Calculator */}
                        <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <FaCalculator className="text-2xl text-green-600" />
                                <h2 className="text-2xl font-bold text-gray-800">Total Compensation Calculator</h2>
                            </div>
                            <p className="text-gray-600 mb-4">When evaluating offers, consider the total package value:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 mb-2">Base Salary</h3>
                                    <p className="text-sm text-gray-600">The foundation of your compensation</p>
                                    <input type="number" placeholder="Enter base salary" className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                </div>
                                <div className="bg-white rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 mb-2">Performance Bonus</h3>
                                    <p className="text-sm text-gray-600">Typically 10-30% of base salary</p>
                                </div>
                                <div className="bg-white rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 mb-2">Stock Options/ESOPs</h3>
                                    <p className="text-sm text-gray-600">Long-term wealth building potential</p>
                                </div>
                                <div className="bg-white rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 mb-2">Benefits Value</h3>
                                    <p className="text-sm text-gray-600">Typically 20-30% of base salary</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer CTA */}
            <div className="bg-gradient-to-r from-green-800 to-teal-800 text-white py-12 mt-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h3 className="text-2xl font-bold mb-4">Ready to Negotiate Your Next Salary?</h3>
                    <p className="text-green-200 mb-6">Use these insights to get the compensation you deserve</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate("/jobs")}
                            className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-all inline-flex items-center gap-2"
                        >
                            Browse Jobs
                            <VscRocket />
                        </button>
                        <button
                            onClick={() => setActiveTab("negotiation")}
                            className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-3 rounded-lg font-semibold transition-all"
                        >
                            Learn Negotiation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
