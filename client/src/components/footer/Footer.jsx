import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaPinterest,
  FaTwitter,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { Heart } from "lucide-react";
import logo from "../../assets/JewelCancy_logo.png";

const quickLinks = [
  { to: "/", label: "Home" },
  { to: "/jobs", label: "Find Jobs" },
  { to: "/#services", label: "Services" },
  { to: "/#stories", label: "Success Stories" },
  { to: "/blogs", label: "Blog" },
  { to: "/contact", label: "Contact Us" },
];

const employerLinks = [
  { to: "/register?role=recruiter", label: "Post a Job" },
  { to: "/recruiter/jobpost", label: "Bulk Hiring" },
  { to: "/recruiter/subscription/plans", label: "Pricing Plans" },
  { to: "/recruiter/dashboard", label: "Employer Dashboard" },
  { to: "/resources/interview-tips", label: "Resources" },
];

const candidateLinks = [
  { to: "/jobs", label: "Browse Jobs" },
  { to: "/resources/resume-tips", label: "Create Resume" },
  { to: "/resources/salary-guide", label: "Career Tips" },
  { to: "/company-stories", label: "Success Stories" },
  { to: "/resources/salary-guide", label: "Help Center" },
];

export default function Footer() {
  return (
    <footer className="border-t border-[#4c123f] bg-[#4c0e42] text-[#f8eaf3]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.25fr_0.85fr_0.85fr_0.85fr_1.1fr] md:px-6 lg:px-8">
        <div>
          <NavLink to="/" className="mb-4 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg border border-white/20 bg-white">
              <img src={logo} alt="" className="h-full w-full object-cover" />
            </span>
            <span className="font-serif text-2xl font-bold text-white">Jewelcancy</span>
          </NavLink>
          <p className="max-w-xs text-sm leading-6 text-[#efd5e8]">
            Jewelcancy is a specialized hiring platform connecting top jewelry talent with leading employers across the globe.
          </p>
          <div className="mt-5 flex items-center gap-3 text-[#f8ddec]">
            <NavLink to="#" aria-label="Facebook" className="transition hover:text-white">
              <FaFacebook />
            </NavLink>
            <NavLink to="#" aria-label="Instagram" className="transition hover:text-white">
              <FaInstagram />
            </NavLink>
            <NavLink to="#" aria-label="Twitter" className="transition hover:text-white">
              <FaTwitter />
            </NavLink>
            <NavLink to="#" aria-label="Pinterest" className="transition hover:text-white">
              <FaPinterest />
            </NavLink>
            <NavLink to="#" aria-label="LinkedIn" className="transition hover:text-white">
              <FaLinkedin />
            </NavLink>
          </div>
        </div>

        <FooterColumn title="Quick Links" links={quickLinks} />
        <FooterColumn title="For Employers" links={employerLinks} />
        <FooterColumn title="For Candidates" links={candidateLinks} />

        <div>
          <h3 className="mb-4 text-sm font-bold text-white">Newsletter</h3>
          <p className="text-sm leading-6 text-[#efd5e8]">
            Get the latest hiring insights and jewelry industry updates.
          </p>
          <form className="mt-4 flex gap-2" onSubmit={(event) => event.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white px-3 py-2.5 text-sm text-[#261723] outline-none transition placeholder:text-[#ad98a6] focus:border-white focus:ring-2 focus:ring-white/25"
            />
            <button
              type="submit"
              className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#5d0f51] transition hover:bg-[#fff7fb]"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-[#efd5e8] sm:flex-row md:px-6 lg:px-8">
          <p>(c) 2026 Jewelcancy. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <NavLink to="/privacy-policy" className="transition hover:text-white">
              Privacy Policy
            </NavLink>
            <NavLink to="/faq" className="transition hover:text-white">
              Terms of Use
            </NavLink>
          </div>
          <p className="inline-flex items-center gap-1.5">
            Made with <Heart className="h-3.5 w-3.5 fill-[#f8ddec] text-[#f8ddec]" /> for the jewelry industry
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-bold text-white">{title}</h3>
      <ul className="space-y-2.5 text-sm text-[#efd5e8]">
        {links.map((link) => (
          <li key={`${title}-${link.label}`}>
            <NavLink to={link.to} className="transition hover:text-white">
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
