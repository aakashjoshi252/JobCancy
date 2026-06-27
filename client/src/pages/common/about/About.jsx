import { useState, useEffect } from "react";
import { 
  FaUsers, 
  FaBuilding, 
  FaHandshake, 
  FaRocket, 
  FaChartLine, 
  FaGlobe,
  FaCheckCircle,
  FaQuoteLeft,
  FaLinkedin,
  FaTwitter,
  FaEnvelope
} from "react-icons/fa";
import { MdWork, MdLocationOn, MdEmail } from "react-icons/md";
import { GiDiamondRing, GiJewelCrown } from "react-icons/gi";
import { VscGraphLine } from "react-icons/vsc";
import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("story");

  // Company milestones
  const milestones = [
    { year: "2020", title: "Founded", description: "Started with a vision to revolutionize jewelry industry hiring" },
    { year: "2021", title: "1,000+ Jobs", description: "Reached milestone of 1000+ job postings" },
    { year: "2022", title: "500+ Companies", description: "Onboarded 500+ trusted companies" },
    { year: "2023", title: "10,000+ Candidates", description: "Helped 10k+ candidates find their dream jobs" },
    { year: "2024", title: "Global Expansion", description: "Expanded to serve international markets" },
  ];

  // Team members
  const team = [
    { 
      name: "Priya Sharma", 
      role: "Founder & CEO", 
      experience: "15+ years in Recruitment",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      linkedin: "#",
      twitter: "#"
    },
    { 
      name: "Rajesh Kumar", 
      role: "Head of Technology", 
      experience: "12+ years in Tech",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      linkedin: "#",
      twitter: "#"
    },
    { 
      name: "Anjali Mehta", 
      role: "Director of Operations", 
      experience: "10+ years in HR",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      linkedin: "#",
      twitter: "#"
    },
    { 
      name: "Vikram Singh", 
      role: "Head of Partnerships", 
      experience: "8+ years in Business Development",
      image: "https://randomuser.me/api/portraits/men/75.jpg",
      linkedin: "#",
      twitter: "#"
    },
  ];

  // Testimonials
  const testimonials = [
    {
      name: "Amit Patel",
      role: "HR Manager at Krishna Jewellers",
      content: "JewelCancy transformed our hiring process. We found our best designers within days!",
      rating: 5,
      image: "https://randomuser.me/api/portraits/men/52.jpg"
    },
    {
      name: "Neha Gupta",
      role: "Senior Jewelry Designer",
      content: "Found my dream job through this platform. The process was seamless and professional.",
      rating: 5,
      image: "https://randomuser.me/api/portraits/women/63.jpg"
    },
    {
      name: "Suresh Reddy",
      role: "Recruitment Head at Tanvi Jewelry",
      content: "The quality of candidates we get is exceptional. Highly recommended for the jewelry industry.",
      rating: 5,
      image: "https://randomuser.me/api/portraits/men/91.jpg"
    },
  ];

  // Stats counter animation
  const [counts, setCounts] = useState({ jobs: 0, companies: 0, candidates: 0, placements: 0 });
  
  useEffect(() => {
    const targetCounts = { jobs: 15000, companies: 850, candidates: 25000, placements: 12000 };
    const duration = 2000; // 2 seconds
    const steps = 50;
    const increment = {
      jobs: Math.ceil(targetCounts.jobs / steps),
      companies: Math.ceil(targetCounts.companies / steps),
      candidates: Math.ceil(targetCounts.candidates / steps),
      placements: Math.ceil(targetCounts.placements / steps)
    };
    
    let currentStep = 0;
    const timer = setInterval(() => {
      if (currentStep < steps) {
        setCounts(prev => ({
          jobs: Math.min(prev.jobs + increment.jobs, targetCounts.jobs),
          companies: Math.min(prev.companies + increment.companies, targetCounts.companies),
          candidates: Math.min(prev.candidates + increment.candidates, targetCounts.candidates),
          placements: Math.min(prev.placements + increment.placements, targetCounts.placements)
        }));
        currentStep++;
      } else {
        clearInterval(timer);
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section with Parallax Effect */}
      <section className="relative bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center mix-blend-overlay"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-24 text-center">
          <div className="inline-block p-3 bg-white/10 backdrop-blur-lg rounded-2xl mb-8">
            <GiJewelCrown className="text-6xl text-yellow-300" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            About <span className="text-yellow-300">JewelCancy</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Revolutionizing jewelry industry recruitment through innovation, 
            transparency, and meaningful connections.
          </p>
          
          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <FaBuilding className="text-3xl text-yellow-300 mx-auto mb-3" />
              <div className="text-3xl font-bold">{counts.companies.toLocaleString()}+</div>
              <div className="text-sm text-blue-200">Companies</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <MdWork className="text-3xl text-yellow-300 mx-auto mb-3" />
              <div className="text-3xl font-bold">{counts.jobs.toLocaleString()}+</div>
              <div className="text-sm text-blue-200">Jobs Posted</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <FaUsers className="text-3xl text-yellow-300 mx-auto mb-3" />
              <div className="text-3xl font-bold">{counts.candidates.toLocaleString()}+</div>
              <div className="text-sm text-blue-200">Candidates</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <FaHandshake className="text-3xl text-yellow-300 mx-auto mb-3" />
              <div className="text-3xl font-bold">{counts.placements.toLocaleString()}+</div>
              <div className="text-sm text-blue-200">Placements</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-xl shadow-lg p-2 flex flex-wrap justify-center gap-2">
          {[
            { id: "story", label: "Our Story", icon: <FaRocket /> },
            { id: "mission", label: "Mission & Vision", icon: <FaChartLine /> },
            { id: "team", label: "Leadership Team", icon: <FaUsers /> },
            { id: "values", label: "Core Values", icon: <FaCheckCircle /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Our Story Tab */}
        {activeTab === "story" && (
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <FaRocket className="text-blue-600" />
              Our Journey
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Founded in 2020, <span className="font-semibold text-blue-600">JewelCancy</span> emerged 
                  from a simple observation: the jewelry industry needed a specialized platform for recruitment. 
                  Generic recruitment platforms weren't addressing the unique needs of jewelers, designers, and craftspeople.
                </p>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Today, we've grown into India's leading jewelry-specific hiring platform, connecting 
                  talented professionals with renowned jewelry houses, manufacturers, and retailers across the country.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Our platform handles everything from CAD designers to master craftsmen, ensuring that 
                  every position finds the perfect match.
                </p>
              </div>
              
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="bg-blue-100 text-blue-600 font-bold py-2 px-4 rounded-lg min-w-[80px] text-center">
                      {milestone.year}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{milestone.title}</h4>
                      <p className="text-sm text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mission & Vision Tab */}
        {activeTab === "mission" && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl shadow-xl p-8">
              <div className="bg-white/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <FaRocket className="text-3xl" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-lg text-blue-100 leading-relaxed">
                To empower every jewelry professional with the opportunity to build a fulfilling career 
                while helping companies discover exceptional talent that drives innovation and excellence 
                in the jewelry industry.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-2xl shadow-xl p-8">
              <div className="bg-white/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <FaChartLine className="text-3xl" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-lg text-purple-100 leading-relaxed">
                To become the global standard for jewelry industry recruitment, creating a world where 
                every jewelry professional can find their perfect role, and every company can build 
                their dream team.
              </p>
            </div>
          </div>
        )}

        {/* Leadership Team Tab */}
        {activeTab === "team" && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Meet Our Leadership</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, index) => (
                <div key={index} className="text-center group">
                  <div className="relative mb-4">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-32 h-32 rounded-full mx-auto border-4 border-gray-200 group-hover:border-blue-400 transition-all"
                    />
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 rounded-full transition-opacity"></div>
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg">{member.name}</h3>
                  <p className="text-blue-600 font-medium text-sm mb-1">{member.role}</p>
                  <p className="text-gray-500 text-xs mb-3">{member.experience}</p>
                  <div className="flex justify-center gap-2">
                    <a href={member.linkedin} className="text-gray-400 hover:text-blue-600 transition">
                      <FaLinkedin />
                    </a>
                    <a href={member.twitter} className="text-gray-400 hover:text-blue-400 transition">
                      <FaTwitter />
                    </a>
                    <a href="#" className="text-gray-400 hover:text-red-500 transition">
                      <FaEnvelope />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Core Values Tab */}
        {activeTab === "values" && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our Core Values</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { 
                  icon: <GiDiamondRing className="text-4xl" />, 
                  title: "Excellence", 
                  desc: "We strive for excellence in every connection we facilitate, ensuring quality matches." 
                },
                { 
                  icon: <FaHandshake className="text-4xl" />, 
                  title: "Integrity", 
                  desc: "We operate with complete transparency and honesty in all our dealings." 
                },
                { 
                  icon: <FaRocket className="text-4xl" />, 
                  title: "Innovation", 
                  desc: "We continuously evolve our platform to meet changing industry needs." 
                },
                { 
                  icon: <FaUsers className="text-4xl" />, 
                  title: "Community", 
                  desc: "We foster a strong community of professionals and companies." 
                },
                { 
                  icon: <FaGlobe className="text-4xl" />, 
                  title: "Inclusivity", 
                  desc: "We embrace diversity and provide equal opportunities for all." 
                },
                { 
                  icon: <VscGraphLine className="text-4xl" />, 
                  title: "Growth", 
                  desc: "We're committed to the continuous growth of our users and platform." 
                },
              ].map((value, index) => (
                <div key={index} className="text-center p-6 bg-gray-50 rounded-xl hover:shadow-lg transition">
                  <div className="text-blue-600 mb-3">{value.icon}</div>
                  <h3 className="font-bold text-gray-800 mb-2">{value.title}</h3>
                  <p className="text-sm text-gray-600">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Testimonials Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">
            What People Say About Us
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 relative">
                <FaQuoteLeft className="absolute top-4 left-4 text-3xl text-blue-100" />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full border-2 border-blue-200"
                    />
                    <div>
                      <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <div className="flex gap-1 mt-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <span key={i} className="text-yellow-400">★</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.content}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & CTA Section */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-xl p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-lg text-blue-100 mb-8">
              Join thousands of jewellery professionals and trusted recruiters already using JewelCancy
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/register")}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition shadow-lg"
              >
                Create Free Account
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition"
              >
                Contact Sales
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-blue-400 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center gap-2">
                <MdEmail className="text-xl" />
                <span>support@jewelcancy.com</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <FaBuilding className="text-xl" />
                <span>Mumbai, India</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <FaGlobe className="text-xl" />
                <span>www.jewelcancy.com</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Stats Banner */}
      <div className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">24/7</div>
              <div className="text-sm text-gray-400">Support Available</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">98%</div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">15min</div>
              <div className="text-sm text-gray-400">Avg. Response Time</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">24/7</div>
              <div className="text-sm text-gray-400">Support Available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}