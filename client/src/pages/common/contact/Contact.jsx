import { useState } from "react";
import { 
  FaFacebook, 
  FaInstagram, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaClock,
  FaPaperPlane,
  FaCheckCircle,
  FaHeadset,
  FaQuestionCircle,
  FaBuilding
} from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { IoLogoLinkedin } from "react-icons/io5";
import { MdLocationOn, MdEmail, MdPhone } from "react-icons/md";
import { GiJewelCrown } from "react-icons/gi";
import { useTranslation } from "react-i18next";

export default function Contact() {
  const { t } = useTranslation(["contact", "common"]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  
  const [formStatus, setFormStatus] = useState({ submitted: false, success: false });
  const [activeFaq, setActiveFaq] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setFormStatus({ submitted: true, success: true });
    setTimeout(() => setFormStatus({ submitted: false, success: false }), 3000);
    // Reset form
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  const faqs = t("faq.items", { returnObjects: true });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1423666639041-f56000c27a9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center mix-blend-overlay"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="inline-block p-3 bg-white/10 backdrop-blur-lg rounded-2xl mb-8">
            <GiJewelCrown className="text-6xl text-yellow-300" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            {t("heroTitlePrefix")} <span className="text-yellow-300">{t("heroTitleHighlight")}</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            {t("heroSubtitle")}
          </p>
        </div>
      </section>

      {/* Quick Contact Cards */}
      <section className="max-w-7xl mx-auto px-6 -mt-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <MdPhone className="text-3xl" />, title: t("cards.call"), content: "+91 1800-123-4567", sub: t("cards.hours") },
            { icon: <MdEmail className="text-3xl" />, title: t("cards.email"), content: "support@jewelcancy.com", sub: t("cards.support") },
            { icon: <MdLocationOn className="text-3xl" />, title: t("cards.visit"), content: "www.jewelcancy.com", sub: t("cards.city") }
          ].map((item, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition group">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition">
                <div className="text-blue-600 group-hover:text-white transition">{item.icon}</div>
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">{item.title}</h3>
              <p className="text-blue-600 font-medium">{item.content}</p>
              <p className="text-sm text-gray-500 mt-1">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: Contact Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{t("form.title")}</h2>
                <p className="text-gray-600">{t("form.subtitle")}</p>
              </div>

              {formStatus.success && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  <span>{t("form.success")}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                      {t("fields.fullName", { ns: "common" })} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t("placeholders.fullName", { ns: "common" })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                      {t("fields.emailAddress", { ns: "common" })} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t("placeholders.email", { ns: "common" })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                      {t("fields.phoneNumber", { ns: "common" })}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={t("placeholders.phone", { ns: "common" })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">
                      {t("fields.subject", { ns: "common" })} <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                    >
                      <option value="">{t("form.selectSubject")}</option>
                      <option value="general">{t("form.subjects.general")}</option>
                      <option value="support">{t("form.subjects.support")}</option>
                      <option value="sales">{t("form.subjects.sales")}</option>
                      <option value="partnership">{t("form.subjects.partnership")}</option>
                      <option value="feedback">{t("form.subjects.feedback")}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
                    {t("fields.message", { ns: "common" })} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t("placeholders.message", { ns: "common" })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <FaPaperPlane className="text-lg" />
                  {t("form.send")}
                </button>
              </form>
            </div>

            {/* Right: Contact Info & Map */}
            <div className="space-y-8">
              {/* Office Info Card */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <FaBuilding />
                  {t("office.title")}
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <FaMapMarkerAlt className="text-xl mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{t("office.address1")}</p>
                      <p className="text-blue-100">{t("office.address2")}</p>
                      <p className="text-blue-100">{t("office.address3")}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <FaPhone className="text-xl" />
                    <div>
                      <p className="font-medium">+91 1800-123-4567</p>
                      <p className="text-blue-100 text-sm">{t("office.phoneLabel")}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <FaEnvelope className="text-xl" />
                    <div>
                      <p className="font-medium">support@jewelcancy.com</p>
                      <p className="text-blue-100 text-sm">{t("office.emailLabel")}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <FaClock className="text-xl" />
                    <div>
                      <p className="font-medium">{t("office.weekday")}</p>
                      <p className="text-blue-100 text-sm">{t("office.saturday")}</p>
                      <p className="text-blue-100 text-sm">{t("office.sunday")}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-blue-400">
                  <h4 className="font-semibold mb-4">{t("office.connect")}</h4>
                  <div className="flex gap-4">
                    <a href="#" className="bg-white/10 hover:bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center text-xl transition">
                      <FaFacebook />
                    </a>
                    <a href="#" className="bg-white/10 hover:bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center text-xl transition">
                      <FaSquareXTwitter />
                    </a>
                    <a href="#" className="bg-white/10 hover:bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center text-xl transition">
                      <IoLogoLinkedin />
                    </a>
                    <a href="#" className="bg-white/10 hover:bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center text-xl transition">
                      <FaInstagram />
                    </a>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="bg-gray-200 rounded-2xl overflow-hidden h-64 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
                <iframe
                  title={t("office.mapTitle")}
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241316.64333236168!2d72.74110157651448!3d19.08252232224541!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1710844345678!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale hover:grayscale-0 transition"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">{t("faq.title")}</h2>
            <p className="text-gray-600">{t("faq.subtitle")}</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <span className="font-medium text-gray-800">{faq.question}</span>
                  <span className={`transform transition ${activeFaq === index ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                {activeFaq === index && (
                  <div className="px-6 py-4 bg-gray-50 text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Team Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaHeadset className="text-4xl text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">{t("support.title")}</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              {t("support.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg">
                {t("support.liveChat")}
              </button>
              <button className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
                {t("support.callback")}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gray-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold mb-3">{t("newsletter.title")}</h3>
          <p className="text-gray-400 mb-6">{t("newsletter.subtitle")}</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder={t("placeholders.email", { ns: "common" })}
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-4 focus:ring-blue-500 outline-none"
            />
            <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition">
              {t("actions.subscribe", { ns: "common" })}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
