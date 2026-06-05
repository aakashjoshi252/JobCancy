import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaPinterest,
  FaLinkedin,
  FaYoutube,
  FaGithub,
  FaWhatsapp,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  const user = useSelector((state) => state.auth.user);

  const homeLink = user
    ? user.role === "candidate"
      ? "/candidate/home"
      : "/recruiter/home"
    : "/";

  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-10">
      <div className="max-w-7xl mx-auto px-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <h5 className="text-lg font-semibold text-white mb-3">{t("footer.aboutTitle")}</h5>
          <p className="text-sm leading-relaxed">{t("footer.aboutText")}</p>
        </div>

        <div>
          <h5 className="text-lg font-semibold text-white mb-3">{t("footer.quickLinks")}</h5>
          <ul className="space-y-2 text-sm">
            <li><NavLink to={homeLink} className="hover:text-white">{t("nav.home")}</NavLink></li>
            <li><NavLink to="/jobs" className="hover:text-white">{t("nav.jobs")}</NavLink></li>
            <li><NavLink to="/about" className="hover:text-white">{t("nav.about")}</NavLink></li>
            <li><NavLink to="/contact" className="hover:text-white">{t("nav.contact")}</NavLink></li>
          </ul>
        </div>

        <div>
          <h5 className="text-lg font-semibold text-white mb-3">{t("footer.customerService")}</h5>
          <ul className="space-y-2 text-sm">
            <li><NavLink to="/faq" className="hover:text-white">{t("footer.faqs")}</NavLink></li>
            <li><NavLink to="/privacy-policy" className="hover:text-white">{t("footer.privacyPolicy")}</NavLink></li>
            <li><NavLink to="/blogs" className="hover:text-white">{t("footer.blogs")}</NavLink></li>
          </ul>
        </div>

        <div>
          <h5 className="text-lg font-semibold text-white mb-3">{t("footer.connect")}</h5>
          <div className="flex items-center flex-wrap gap-4 text-xl mb-4">
            <NavLink to="#" className="hover:text-white"><FaFacebook /></NavLink>
            <NavLink to="#" className="hover:text-white"><FaInstagram /></NavLink>
            <NavLink to="#" className="hover:text-white"><FaTwitter /></NavLink>
            <NavLink to="#" className="hover:text-white"><FaPinterest /></NavLink>
            <NavLink to="#" className="hover:text-white"><FaLinkedin /></NavLink>
            <NavLink to="#" className="hover:text-white"><FaYoutube /></NavLink>
            <NavLink to="#" className="hover:text-white"><FaGithub /></NavLink>
            <NavLink to="#" className="hover:text-white"><FaWhatsapp /></NavLink>
          </div>

          <p className="text-sm whitespace-pre-line">{t("footer.address")}</p>
        </div>
      </div>

      <div className="text-center text-gray-500 text-sm mt-10 border-t border-gray-700 pt-4">
        {t("footer.copyright", { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}
