import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  HiPencil,
  HiNewspaper,
  HiEye,
  HiHeart,
  HiClock,
  HiUsers,
  HiOfficeBuilding,
  HiMail,
  HiPhone,
  HiGlobe,
  HiLocationMarker,
  HiStar
} from "react-icons/hi";
import { HiCheckBadge } from "react-icons/hi2";
import { useGetCompanyBlogsQuery } from "../../../services/apiSlice";
import { useTranslation } from "react-i18next";

export default function CompanyView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const company = useSelector((state) => state.company.data);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const { data: blogs = [], isLoading: loadingBlogs } = useGetCompanyBlogsQuery(
    { companyId: company?._id, status: "published", limit: 3 },
    { skip: !company?._id }
  );

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
            <HiOfficeBuilding className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{t("company.noProfile")}</h2>
          <p className="text-sm text-gray-500 mb-6">{t("company.createProfileHint")}</p>
          <button
            onClick={() => navigate("/recruiter/company/registration")}
            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium text-sm shadow-sm hover:bg-blue-700 transition"
          >
            {t("company.createProfile")}
          </button>
        </div>
      </div>
    );
  }

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header - Matching Dashboard Style */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg mb-6 overflow-hidden">
          <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{t("company.profile")}</h1>
                <p className="text-blue-100 text-sm mt-1">{t("company.manageDetails")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Company Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Header with company info */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              {/* Logo */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border-2 border-white/30 flex-shrink-0">
                {company.uploadLogo && !imageError ? (
                  <>
                    {imageLoading && (
                      <div className="absolute inset-0 bg-white/20 rounded-xl flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      </div>
                    )}
                    <img
                      src={company.uploadLogo}
                      alt={`${company.companyName} Logo`}
                      className={`w-full h-full object-contain rounded-lg transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                      onError={handleImageError}
                      onLoad={handleImageLoad}
                    />
                  </>
                ) : (
                  <HiOfficeBuilding className="w-8 h-8 sm:w-10 sm:h-10 text-white/80" />
                )}
              </div>

              {/* Company Name and Info */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  {company.companyName}
                </h2>
                <p className="text-sm text-blue-100 mb-2">{company.industry || t("company.industry")}</p>
                {company.companyType && (
                  <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-medium text-white border border-white/30">
                    {company.companyType}
                  </span>
                )}
              </div>

              {/* Edit Button */}
              <button
                onClick={() => navigate(`/recruiter/company/edit/${company._id}`)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition text-sm shadow-sm w-full sm:w-auto justify-center"
              >
                <HiPencil className="w-4 h-4" />
                {t("company.editProfile")}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              <DetailCard label={t("company.companyType")} value={company.companyType} />
              <DetailCard label={t("company.companySize")} value={company.size} />
              <DetailCard label={t("company.established")} value={company.establishedYear} />
              <DetailCard label={t("company.industry")} value={company.industry} />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <ContactInfo
                icon={HiLocationMarker}
                label={t("common.location")}
                value={company.location}
              />
              <ContactInfo
                icon={HiMail}
                label={t("common.email")}
                value={company.contactEmail}
                type="email"
              />
              <ContactInfo
                icon={HiPhone}
                label={t("common.phone")}
                value={company.contactNumber}
                type="phone"
              />
            </div>

            {/* Website */}
            {company.website && (
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <HiGlobe className="text-blue-600 text-sm" />
                  {t("common.website")}
                </div>
                <a
                  href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 hover:underline break-all text-sm"
                >
                  {company.website}
                </a>
              </div>
            )}

            {/* Specializations & Certifications */}
            <div className="grid lg:grid-cols-2 gap-4">
              {company.specializations?.length > 0 && (
                <TagSection
                  title={t("company.specializations")}
                  items={company.specializations}
                  icon={HiStar}
                  color="blue"
                />
              )}
              {company.certifications?.length > 0 && (
                <TagSection
                  title={t("company.certifications")}
                  items={company.certifications}
                  icon={HiCheckBadge}
                  color="green"
                />
              )}
            </div>

            {/* Description */}
            {company.description && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">{t("company.aboutCompany")}</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                  {company.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Blogs Section */}
        {blogs.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                <HiNewspaper className="text-blue-600 text-lg" />
                {t("company.latestBlogs")}
              </h3>
              <button
                onClick={() => navigate('/recruiter/blogs')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {t("company.viewAll")}
              </button>
            </div>

            {loadingBlogs ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => <BlogSkeleton key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {blogs.map((blog) => (
                  <BlogCard key={blog._id} blog={blog} navigate={navigate} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Action Buttons */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ActionButton
            title={t("company.postAJob")}
            onClick={() => navigate("/recruiter/company/jobpost")}
            icon="rocket"
          />
          <ActionButton
            title={t("company.viewJobs")}
            onClick={() => navigate("/recruiter/company/postedjobs")}
            icon="list"
          />
          <ActionButton
            title={t("company.writeBlog")}
            onClick={() => navigate("/recruiter/blogs/create")}
            icon="edit"
          />
        </section>
      </div>
    </div>
  );
}

// Helper Components
const DetailCard = ({ label, value }) => (
  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="text-sm font-medium text-gray-900 truncate">
      {value || <span className="text-gray-400">—</span>}
    </p>
  </div>
);

const ContactInfo = ({ icon: Icon, label, value, type }) => {
  if (!value) return null;

  const renderValue = () => {
    if (type === 'email') {
      return (
        <a href={`mailto:${value}`} className="text-blue-600 hover:text-blue-700 hover:underline truncate text-sm">
          {value}
        </a>
      );
    }
    if (type === 'phone') {
      return (
        <a href={`tel:${value}`} className="text-blue-600 hover:text-blue-700 hover:underline text-sm">
          {value}
        </a>
      );
    }
    return <span className="text-sm font-medium text-gray-900 truncate">{value}</span>;
  };

  return (
    <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
      <Icon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="truncate">{renderValue()}</p>
      </div>
    </div>
  );
};

const TagSection = ({ title, items, icon: Icon, color }) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      hover: 'hover:bg-blue-100'
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      hover: 'hover:bg-green-100'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
        <Icon className={`w-4 h-4 ${color === 'blue' ? 'text-blue-600' : 'text-green-600'}`} />
        {title} ({items.length})
      </h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span
            key={index}
            className={`px-2 py-1 ${colors.bg} ${colors.text} rounded-lg text-xs font-medium border ${colors.border} ${colors.hover} transition-colors cursor-default`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

const ActionButton = ({ title, onClick, icon }) => (
  <button
    onClick={onClick}
    className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center group"
  >
    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-2 group-hover:bg-blue-100 transition-colors">
      {icon === 'rocket' && (
        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )}
      {icon === 'list' && (
        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      )}
      {icon === 'edit' && <HiPencil className="w-5 h-5 text-blue-600" />}
    </div>
    <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{title}</h4>
  </button>
);

const BlogCard = ({ blog, navigate }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={() => navigate(`/blogs/${blog._id}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden group"
    >
      <div className="h-40 bg-gray-100 relative overflow-hidden">
        {blog.image && !imgError ? (
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <HiNewspaper className="w-8 h-8 text-gray-400" />
          </div>
        )}
        {blog.category && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-lg border border-gray-200">
            {blog.category}
          </span>
        )}
      </div>
      <div className="p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {blog.title}
        </h4>
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{blog.description}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <HiEye className="w-3 h-3" />
              {blog.views || 0}
            </span>
            <span className="flex items-center gap-1">
              <HiHeart className="w-3 h-3" />
              {blog.likes || 0}
            </span>
          </div>
          <span>
            {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  );
};

// Skeleton Components
const BlogSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
    <div className="h-40 bg-gray-200"></div>
    <div className="p-4 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-full"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      <div className="flex justify-between pt-2">
        <div className="h-3 bg-gray-200 rounded w-16"></div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  </div>
);
