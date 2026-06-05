// InterviewTips.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  VscArrowLeft,
  VscCheck,
  VscMic,
  VscOrganization,
  VscPerson,
  VscQuestion,
  VscLightbulb,
  VscStarFull,
  VscWarning,
  VscBook,
  VscChevronRight ,
  VscThumbsup,
  VscDeviceCameraVideo ,
  VscCalendar,
  VscMail,
  VscSmiley,
  VscWatch,
  VscDebug,
  VscCopy ,
  VscFeedback,
  VscListOrdered,
  VscGroupByRefType
} from "react-icons/vsc";
import { MdWork, MdSchool, MdTrendingUp, MdRecordVoiceOver } from "react-icons/md";
import { FaRegBuilding, FaRegLightbulb, FaChartLine, FaHandshake } from "react-icons/fa";
import { HiOutlineDocumentText, HiOutlineSparkles, HiOutlineClipboardList } from "react-icons/hi";

export default function InterviewTips() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("preparation");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [copiedAnswer, setCopiedAnswer] = useState(null);

  const interviewTypes = [
    {
      type: "Phone Screening",
      icon: VscMic,
      color: "blue",
      tips: [
        "Find a quiet location with good reception",
        "Have your resume and notes nearby",
        "Speak clearly and smile (it affects your tone)",
        "Prepare a brief introduction about yourself",
        "Have questions ready for the interviewer"
      ]
    },
    {
      type: "Video Interview",
      icon: VscDeviceCameraVideo ,
      color: "purple",
      tips: [
        "Test your camera and microphone beforehand",
        "Ensure good lighting (natural light is best)",
        "Dress professionally from head to toe",
        "Look at the camera, not the screen",
        "Choose a clean, professional background"
      ]
    },
    {
      type: "In-Person",
      icon: VscPerson,
      color: "green",
      tips: [
        "Arrive 10-15 minutes early",
        "Bring multiple copies of your resume",
        "Research the company culture and dress code",
        "Firm handshake and maintain eye contact",
        "Send a thank-you email within 24 hours"
      ]
    },
    {
      type: "Technical",
      icon: VscDebug,
      color: "orange",
      tips: [
        "Review core concepts and fundamentals",
        "Practice coding problems (if applicable)",
        "Explain your thought process out loud",
        "Ask clarifying questions before solving",
        "Be honest about what you don't know"
      ]
    },
    {
      type: "Panel Interview",
      icon: VscGroupByRefType,
      color: "red",
      tips: [
        "Address everyone in the room",
        "Make eye contact with the person who asked the question",
        "Take notes to remember names and questions",
        "Prepare to answer the same question from different perspectives",
        "Send individual thank-you notes"
      ]
    },
    {
      type: "Case Study",
      icon: FaChartLine,
      color: "indigo",
      tips: [
        "Structure your approach before diving in",
        "Ask for clarification on ambiguous points",
        "Show your analytical thinking process",
        "Use frameworks but adapt to the situation",
        "Summarize your recommendation clearly"
      ]
    }
  ];

  const commonQuestions = [
    {
      id: 1,
      question: "Tell me about yourself.",
      category: "Introduction",
      sampleAnswer: "I'm a [Your Role] with [X] years of experience in [Industry/Field]. I started my career at [Previous Company] where I [Key Achievement]. Currently at [Current Company], I've been focusing on [Current Projects/Responsibilities]. I'm passionate about [Industry/Technology] and I'm excited about this opportunity because [Reason].",
      tips: [
        "Keep it to 2-3 minutes max",
        "Focus on professional experience",
        "Connect your past to this role",
        "End with why you're interested"
      ]
    },
    {
      id: 2,
      question: "Why do you want to work here?",
      category: "Company Fit",
      sampleAnswer: "I've been following [Company Name] for some time and I'm impressed by [Specific Achievement/Product/Culture]. Your mission to [Company Mission] resonates with my values. I believe my experience in [Your Skill] would help me contribute to [Specific Goal/Project]. I'm excited about the opportunity to grow with a company that [Positive Aspect].",
      tips: [
        "Research the company thoroughly",
        "Reference specific projects or values",
        "Connect your skills to their needs",
        "Show genuine enthusiasm"
      ]
    },
    {
      id: 3,
      question: "What are your greatest strengths?",
      category: "Self-Assessment",
      sampleAnswer: "My greatest strength is [Key Strength], which I've demonstrated through [Specific Example]. For instance, when [Situation], I [Action] which resulted in [Quantifiable Result]. This skill would be valuable for this role because [Connection to Position].",
      tips: [
        "Choose strengths relevant to the role",
        "Provide specific examples",
        "Use the STAR method",
        "Be authentic and specific"
      ]
    },
    {
      id: 4,
      question: "What is your greatest weakness?",
      category: "Self-Assessment",
      sampleAnswer: "I sometimes struggle with [Weakness], but I've been actively working on improving this by [Action Taken]. For example, I recently [Situation] where I [Action] to overcome this challenge. I've seen significant improvement in [Result].",
      tips: [
        "Be honest but strategic",
        "Show self-awareness",
        "Demonstrate improvement efforts",
        "Avoid clichés like 'I work too hard'"
      ]
    },
    {
      id: 5,
      question: "Tell me about a challenging situation you faced and how you handled it.",
      category: "Problem Solving",
      sampleAnswer: "Using the STAR method: Situation: [Context], Task: [Your Responsibility], Action: [Steps You Took], Result: [Outcome with numbers]. This experience taught me [Lesson Learned] and I now apply this approach when facing similar challenges.",
      tips: [
        "Use the STAR method",
        "Focus on your role, not the team",
        "Include metrics when possible",
        "Highlight problem-solving skills"
      ]
    },
    {
      id: 6,
      question: "Where do you see yourself in 5 years?",
      category: "Career Goals",
      sampleAnswer: "In 5 years, I see myself as a [Senior Role/Expert] in [Area] where I can leverage my skills in [Skill Set] to drive [Impact]. I'm particularly interested in [Growth Area] and I believe this role offers the perfect opportunity to develop in that direction while contributing to the company's success.",
      tips: [
        "Show ambition but be realistic",
        "Connect to the role's growth path",
        "Show commitment to the field",
        "Align with company goals"
      ]
    }
  ];

  const preparationSteps = [
    {
      title: "Research the Company",
      icon: VscOrganization,
      steps: [
        "Read the company's mission, values, and recent news",
        "Understand their products, services, and competitors",
        "Look up your interviewers on LinkedIn",
        "Check Glassdoor for interview experiences",
        "Follow the company on social media"
      ]
    },
    {
      title: "Review the Job Description",
      icon: HiOutlineClipboardList,
      steps: [
        "Identify key requirements and responsibilities",
        "Prepare examples that match each requirement",
        "Understand the skills they're prioritizing",
        "Note any specific tools or technologies mentioned",
        "Prepare questions about unclear aspects"
      ]
    },
    {
      title: "Practice Your Responses",
      icon: MdRecordVoiceOver,
      steps: [
        "Record yourself answering common questions",
        "Practice with a friend or mentor",
        "Time your responses (2-3 minutes ideal)",
        "Prepare your 30-second elevator pitch",
        "Use the STAR method for behavioral questions"
      ]
    },
    {
      title: "Prepare Your Questions",
      icon: VscQuestion,
      steps: [
        "What does success look like in this role?",
        "What are the biggest challenges for this position?",
        "How would you describe the team culture?",
        "What opportunities for growth are available?",
        "What are the next steps in the interview process?"
      ]
    },
    {
      title: "Logistics & Tech Check",
      icon: VscDeviceCameraVideo ,
      steps: [
        "Confirm date, time, and format",
        "Test your equipment for virtual interviews",
        "Plan your route and parking for in-person",
        "Prepare backup contact information",
        "Set up your space (clean background, good lighting)"
      ]
    }
  ];

  const dosAndDonts = {
    dos: [
      "Arrive 10-15 minutes early",
      "Dress professionally (one level above company dress code)",
      "Bring copies of your resume and portfolio",
      "Take notes during the interview",
      "Show enthusiasm and positive energy",
      "Ask thoughtful questions",
      "Send a thank-you email within 24 hours",
      "Follow up if you haven't heard back in a week"
    ],
    donts: [
      "Speak negatively about previous employers",
      "Interrupt the interviewer",
      "Use your phone during the interview",
      "Lie or exaggerate your experience",
      "Ask about salary and benefits too early",
      "Forget to follow up after the interview",
      "Appear unprepared or unenthusiastic",
      "Overshare personal information"
    ]
  };

  const bodyLanguageTips = [
    "Maintain good posture - sit up straight",
    "Make eye contact (but don't stare)",
    "Use hand gestures naturally",
    "Smile and nod to show engagement",
    "Lean in slightly to show interest",
    "Keep your hands visible and relaxed",
    "Mirror the interviewer's energy",
    "Take deep breaths if nervous"
  ];

  const followUpTemplate = {
    subject: "Thank You - [Your Name] - [Position] Interview",
    body: `Dear [Interviewer Name],

Thank you so much for taking the time to meet with me today. I truly enjoyed learning more about the [Position] role and the exciting work being done at [Company Name].

Our conversation about [Specific Topic Discussed] particularly resonated with me, and I'm excited about the possibility of contributing to [Specific Project/Goal]. Based on our discussion, I'm confident that my experience in [Your Skill/Experience] would allow me to make an immediate impact.

I've attached my portfolio/resume for your reference. Please don't hesitate to reach out if you need any additional information.

Thank you again for your time and consideration. I look forward to hearing about the next steps!

Best regards,
[Your Name]
[Phone Number]
[LinkedIn Profile]`
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedAnswer(id);
    setTimeout(() => setCopiedAnswer(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-800 text-white">
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
              <MdRecordVoiceOver className="text-3xl" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Interview Tips & Guide</h1>
          </div>
          <p className="text-xl text-purple-100 max-w-3xl">
            Master your next interview with proven strategies, common questions, and expert tips to land your dream job
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("preparation")}
            className={`px-6 py-3 font-medium transition-all rounded-t-lg ${
              activeTab === "preparation"
                ? "text-purple-600 border-b-2 border-purple-600 bg-white"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <VscBook className="text-lg" />
              Preparation
            </div>
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            className={`px-6 py-3 font-medium transition-all rounded-t-lg ${
              activeTab === "questions"
                ? "text-purple-600 border-b-2 border-purple-600 bg-white"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <VscQuestion className="text-lg" />
              Common Questions
            </div>
          </button>
          <button
            onClick={() => setActiveTab("types")}
            className={`px-6 py-3 font-medium transition-all rounded-t-lg ${
              activeTab === "types"
                ? "text-purple-600 border-b-2 border-purple-600 bg-white"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <VscOrganization className="text-lg" />
              Interview Types
            </div>
          </button>
          <button
            onClick={() => setActiveTab("etiquette")}
            className={`px-6 py-3 font-medium transition-all rounded-t-lg ${
              activeTab === "etiquette"
                ? "text-purple-600 border-b-2 border-purple-600 bg-white"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <FaHandshake className="text-lg" />
              Etiquette & Follow-up
            </div>
          </button>
        </div>

        {/* Preparation Tab */}
        {activeTab === "preparation" && (
          <div>
            <div className="grid grid-cols-1 gap-6 mb-8">
              {preparationSteps.map((step, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <step.icon className="text-purple-600 text-xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{step.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {step.steps.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-2 text-gray-600">
                        <VscCheck className="text-green-500 mt-1 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Body Language Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <VscPerson className="text-2xl text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Body Language Tips</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {bodyLanguageTips.map((tip, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white rounded-lg p-3">
                    <VscSmiley className="text-blue-500" />
                    <span className="text-sm text-gray-700">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Checklist */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <VscListOrdered className="text-2xl text-green-600" />
                <h2 className="text-2xl font-bold text-gray-800">Interview Day Checklist</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <VscCalendar className="text-purple-500" />
                    <span>Confirm time and location</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <VscWatch className="text-purple-500" />
                    <span>Arrive 10-15 minutes early</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiOutlineDocumentText className="text-purple-500" />
                    <span>Bring extra copies of resume</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <VscOrganization className="text-purple-500" />
                    <span>Research notes handy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <VscQuestion className="text-purple-500" />
                    <span>Prepared questions ready</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <VscMail className="text-purple-500" />
                    <span>Thank you note prepared</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === "questions" && (
          <div>
            <div className="grid grid-cols-1 gap-4 mb-8">
              {commonQuestions.map((q) => (
                <div
                  key={q.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all"
                >
                  <button
                    onClick={() => setSelectedQuestion(selectedQuestion === q.id ? null : q.id)}
                    className="w-full text-left p-6 flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <span className="text-sm text-purple-600 font-medium">{q.category}</span>
                      <h3 className="text-lg font-semibold text-gray-800 mt-1">{q.question}</h3>
                    </div>
                    <VscChevronRight className={`text-gray-400 transition-transform ${selectedQuestion === q.id ? 'rotate-90' : ''}`} />
                  </button>
                  
                  {selectedQuestion === q.id && (
                    <div className="border-t border-gray-100 p-6 bg-gray-50">
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <VscStarFull className="text-yellow-500" />
                          Sample Answer:
                        </h4>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <p className="text-gray-700">{q.sampleAnswer}</p>
                          <button
                            onClick={() => copyToClipboard(q.sampleAnswer, `answer-${q.id}`)}
                            className="mt-3 text-sm text-purple-600 hover:text-purple-700 inline-flex items-center gap-1"
                          >
                            {copiedAnswer === `answer-${q.id}` ? (
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
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <VscLightbulb className="text-yellow-500" />
                          Tips:
                        </h4>
                        <ul className="space-y-1">
                          {q.tips.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                              <VscCheck className="text-green-500 mt-0.5" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* STAR Method Section */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <VscStarFull className="text-2xl text-yellow-600" />
                <h2 className="text-2xl font-bold text-gray-800">The STAR Method</h2>
              </div>
              <p className="text-gray-700 mb-4">Use this framework to structure your answers to behavioral questions:</p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-bold text-blue-600 mb-2">S - Situation</h4>
                  <p className="text-sm text-gray-600">Set the scene and give necessary details of the context</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-bold text-green-600 mb-2">T - Task</h4>
                  <p className="text-sm text-gray-600">Describe what your responsibility was in that situation</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-bold text-purple-600 mb-2">A - Action</h4>
                  <p className="text-sm text-gray-600">Explain exactly what steps you took to address it</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-bold text-red-600 mb-2">R - Result</h4>
                  <p className="text-sm text-gray-600">Share what outcomes your actions achieved</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interview Types Tab */}
        {activeTab === "types" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {interviewTypes.map((type, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-100">
                  <div className={`bg-${type.color}-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <type.icon className={`text-${type.color}-600 text-xl`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{type.type}</h3>
                  <ul className="space-y-2">
                    {type.tips.map((tip, tipIdx) => (
                      <li key={tipIdx} className="flex items-start gap-2 text-sm text-gray-600">
                        <VscCheck className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Remote Interview Tips */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <VscDeviceCameraVideo  className="text-2xl text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Remote Interview Pro Tips</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Technical Setup</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Use a wired internet connection if possible</li>
                    <li>• Close unnecessary applications and tabs</li>
                    <li>• Have a backup device ready</li>
                    <li>• Test audio and video quality beforehand</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Environment</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Choose a quiet, private space</li>
                    <li>• Ensure good lighting (facing you)</li>
                    <li>• Remove distractions from background</li>
                    <li>• Have water and notes within reach</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Etiquette & Follow-up Tab */}
        {activeTab === "etiquette" && (
          <div>
            {/* Do's and Don'ts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
                <div className="flex items-center gap-2 mb-4">
                  <VscThumbsup className="text-green-500 text-2xl" />
                  <h2 className="text-xl font-bold text-gray-800">Do's</h2>
                </div>
                <ul className="space-y-2">
                  {dosAndDonts.dos.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-600">
                      <VscCheck className="text-green-500 mt-1 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
                <div className="flex items-center gap-2 mb-4">
                  <VscWarning className="text-red-500 text-2xl" />
                  <h2 className="text-xl font-bold text-gray-800">Don'ts</h2>
                </div>
                <ul className="space-y-2">
                  {dosAndDonts.donts.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-600">
                      <VscWarning className="text-red-500 mt-1 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Follow-up Email Template */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <VscMail className="text-2xl text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Follow-up Email Template</h2>
              </div>
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="mb-3">
                  <p className="font-semibold text-gray-700">Subject: {followUpTemplate.subject}</p>
                </div>
                <div className="whitespace-pre-wrap text-gray-600 mb-4">
                  {followUpTemplate.body}
                </div>
                <button
                  onClick={() => copyToClipboard(followUpTemplate.body, "followup")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
                >
                  {copiedAnswer === "followup" ? (
                    <>
                      <VscCheck />
                      Copied!
                    </>
                  ) : (
                    <>
                      <VscCopy />
                      Copy Template
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Additional Tips */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <VscFeedback className="text-2xl text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-800">Post-Interview Best Practices</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <VscCalendar className="text-purple-600 text-xl" />
                  </div>
                  <p className="font-semibold text-gray-800">Within 24 Hours</p>
                  <p className="text-sm text-gray-600">Send thank-you emails to all interviewers</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <VscWatch className="text-purple-600 text-xl" />
                  </div>
                  <p className="font-semibold text-gray-800">After 1 Week</p>
                  <p className="text-sm text-gray-600">Follow up if you haven't heard back</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <VscFeedback className="text-purple-600 text-xl" />
                  </div>
                  <p className="font-semibold text-gray-800">Regardless of Outcome</p>
                  <p className="text-sm text-gray-600">Ask for feedback to improve</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white py-12 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Ace Your Interview?</h3>
          <p className="text-purple-200 mb-6">Practice with our resources and land your dream job</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/jobs")}
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-all inline-flex items-center gap-2"
            >
              Browse Jobs
            </button>
            <button
              onClick={() => setActiveTab("questions")}
              className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-3 rounded-lg font-semibold transition-all"
            >
              Practice Questions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
