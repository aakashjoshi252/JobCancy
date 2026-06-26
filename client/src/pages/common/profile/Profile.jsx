import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCamera, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe, FaBriefcase, FaUser, FaCheckCircle, FaRegClock } from "react-icons/fa";
import { GiJewelCrown } from "react-icons/gi";
import { VscOrganization } from "react-icons/vsc";
import UserAvatar from "../../../components/ui/UserAvatar";
import { getMediaUrl } from "../../../utils/profileImage";

export default function Profile() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const resume = useSelector((state) => state.resume.data);
  const company = useSelector((state) => state.company.data);
  const userId = user?._id;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(false);
  }, [user, company]);

  if (!user || loading) {
    return <ProfileSkeleton />;
  }

  const role = user.role;
  const profileEditPath =
    role === "recruiter"
      ? `/recruiter/profile/edit/${userId}`
      : role === "candidate"
        ? `/candidate/profile/edit/${userId}`
        : `/admin/profile/edit/${userId}`;

  // Format date function
  const formatDate = (date) => {
    if (!date) return "Not provided";
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="mx-auto mt-4 max-w-4xl px-3 sm:mt-10 sm:px-4">
      <div className="relative rounded-2xl border border-gray-100 bg-white p-4 shadow-xl sm:p-8">

        {/* EDIT PROFILE BUTTON */}
        <button
          onClick={() => navigate(profileEditPath)}
          className="mb-5 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg sm:absolute sm:right-6 sm:top-6 sm:mb-0 sm:w-auto"
        >
          Edit Profile
        </button>

        {/* ------------------ RECRUITER VIEW ------------------ */}
        {role === "recruiter" && (
          <>
            <div className="mb-8 flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:gap-6 sm:pr-36 sm:text-left">
              <div className="group relative shrink-0">
                <UserAvatar
                  user={user}
                  className="h-24 w-24 border-4 border-blue-100 text-2xl shadow-md sm:h-28 sm:w-28 sm:text-3xl"
                />
                <button
                  type="button"
                  onClick={() => navigate(profileEditPath)}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-gray-950/0 text-white opacity-0 transition group-hover:bg-gray-950/45 group-hover:opacity-100"
                  aria-label="Edit profile picture"
                >
                  <FaCamera className="text-xl" />
                </button>
                {user.isEmailVerified && (
                  <span className="absolute bottom-0 right-0 bg-green-500 text-white p-1 rounded-full">
                    <FaCheckCircle className="text-sm" />
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <h1 className="break-words text-2xl font-bold text-gray-800 sm:text-3xl">{user.username}</h1>
                <p className="mt-1 flex min-w-0 items-center justify-center gap-2 text-gray-600 sm:justify-start">
                  <VscOrganization className="text-blue-500" />
                  <span className="truncate">{user.email}</span>
                </p>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                    Recruiter
                  </span>
                  {user.isEmailVerified ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <FaCheckCircle className="text-xs" />
                      Email Verified
                    </span>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <FaRegClock className="text-xs" />
                      Email Unverified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <ProfileField 
                icon={<FaUser />}
                label="Username" 
                value={user.username} 
              />
              <ProfileField 
                icon={<FaEnvelope />}
                label="Email" 
                value={user.email} 
              />
              <ProfileField 
                icon={<FaPhone />}
                label="Phone" 
                value={user.phone} 
              />
              <ProfileField 
                icon={<FaMapMarkerAlt />}
                label="Location" 
                value={user.location} 
              />
              <ProfileField 
                icon={<FaGlobe />}
                label="Website" 
                value={user.website}
                isLink={true}
              />
              <ProfileField 
                icon={<FaRegClock />}
                label="Member Since" 
                value={formatDate(user.createdAt)} 
              />
            </div>

            {user.bio && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Bio</h3>
                <p className="p-4 bg-gray-50 rounded-lg border text-gray-700 leading-relaxed">
                  {user.bio}
                </p>
              </div>
            )}

            <hr className="my-8 border-t-2 border-gray-100" />

            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <VscOrganization className="text-blue-600" />
              Company Information
            </h3>

            {!company ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-red-500 mb-3">Company profile not found.</p>
                <button
                  onClick={() => navigate("/recruiter/company/registration")}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Register Company
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6 flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-6 sm:text-left">
                  {company.uploadLogo && (
                    <img
                      src={getMediaUrl(company.uploadLogo)}
                      alt="Company Logo"
                      className="h-20 w-20 shrink-0 rounded-xl border bg-white object-contain p-2"
                    />
                  )}
                  <div className="min-w-0">
                    <h4 className="break-words text-xl font-semibold text-gray-800">{company.companyName}</h4>
                    <p className="text-gray-600">{company.industry}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProfileField label="Company Name" value={company.companyName} />
                  <ProfileField label="Company Email" value={company.contactEmail} />
                  <ProfileField label="Phone" value={company.contactNumber} />
                  <ProfileField label="Established Year" value={company.establishedYear} />
                  <ProfileField label="Industry" value={company.industry} />
                  <ProfileField 
                    icon={<FaMapMarkerAlt />}
                    label="Location" 
                    value={company.location} 
                  />
                  <ProfileField 
                    icon={<FaGlobe />}
                    label="Website" 
                    value={company.website}
                    isLink={true}
                  />
                </div>

                {company.description && (
                  <div className="mt-6">
                    <ProfileField
                      label="Description"
                      value={company.description}
                      isLongText={true}
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ------------------ CANDIDATE VIEW ------------------ */}
        {role === "candidate" && (
          <>
            <div className="mb-8 flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:gap-6 sm:pr-36 sm:text-left">
              <div className="group relative shrink-0">
                <UserAvatar
                  user={user}
                  className="h-24 w-24 border-4 border-blue-100 text-2xl shadow-md sm:h-28 sm:w-28 sm:text-3xl"
                />
                <button
                  type="button"
                  onClick={() => navigate(profileEditPath)}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-gray-950/0 text-white opacity-0 transition group-hover:bg-gray-950/45 group-hover:opacity-100"
                  aria-label="Edit profile picture"
                >
                  <FaCamera className="text-xl" />
                </button>
                {user.isEmailVerified && (
                  <span className="absolute bottom-0 right-0 bg-green-500 text-white p-1 rounded-full">
                    <FaCheckCircle className="text-sm" />
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <h1 className="break-words text-2xl font-bold text-gray-800 sm:text-3xl">{user.username}</h1>
                <p className="mt-1 flex min-w-0 items-center justify-center gap-2 text-gray-600 sm:justify-start">
                  <FaEnvelope className="text-blue-500" />
                  <span className="truncate">{user.email}</span>
                </p>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                    Candidate
                  </span>
                  {user.jobProfession && (
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <FaBriefcase className="text-xs" />
                      {user.jobProfession}
                    </span>
                  )}
                  {user.isEmailVerified ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <FaCheckCircle className="text-xs" />
                      Email Verified
                    </span>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <FaRegClock className="text-xs" />
                      Email Unverified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <ProfileField 
                icon={<FaUser />}
                label="Username" 
                value={user.username} 
              />
              <ProfileField 
                icon={<FaEnvelope />}
                label="Email" 
                value={user.email} 
              />
              <ProfileField 
                icon={<FaPhone />}
                label="Phone" 
                value={user.phone} 
              />
              {user.jobProfession && (
                <ProfileField 
                  icon={<FaBriefcase />}
                  label="Job Profession" 
                  value={user.jobProfession} 
                />
              )}
              <ProfileField 
                icon={<FaMapMarkerAlt />}
                label="Location" 
                value={user.location} 
              />
              <ProfileField 
                icon={<FaRegClock />}
                label="Member Since" 
                value={formatDate(user.createdAt)} 
              />
            </div>

            {user.bio && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">About Me</h3>
                <p className="p-4 bg-gray-50 rounded-lg border text-gray-700 leading-relaxed">
                  {user.bio}
                </p>
              </div>
            )}

            {/* Resume Section */}
            <hr className="my-8 border-t-2 border-gray-100" />
            
            <h3 className="mb-6 text-xl font-bold text-gray-800 sm:text-2xl">Resume Information</h3>
            
            {!resume ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-3">No resume found.</p>
                <button
                  onClick={() => navigate("/candidate/create-resume")}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Create Resume
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfileField label="Full Name" value={resume.fullName} />
                <ProfileField label="Email" value={resume.email} />
                <ProfileField label="Phone" value={resume.phone} />
                <ProfileField label="Experience" value={`${resume.experience || 0} years`} />
                {resume.skills && resume.skills.length > 0 && (
                  <div className="col-span-full">
                    <p className="text-gray-500 text-sm mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {resume.skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ------------------ ADMIN VIEW ------------------ */}
        {role === "admin" && (
          <div className="py-4">
            <div className="mb-8 flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
              <div className="group relative">
                <UserAvatar user={user} className="h-28 w-28 border-4 border-yellow-100 text-3xl shadow-md" />
                <button
                  type="button"
                  onClick={() => navigate(profileEditPath)}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-gray-950/0 text-white opacity-0 transition group-hover:bg-gray-950/45 group-hover:opacity-100"
                  aria-label="Edit profile picture"
                >
                  <FaCamera className="text-xl" />
                </button>
              </div>
              <div>
                <GiJewelCrown className="mb-2 text-3xl text-yellow-500" />
                <h2 className="text-2xl font-bold text-gray-800">Admin Profile</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <ProfileField icon={<FaUser />} label="Username" value={user.username} />
              <ProfileField icon={<FaEnvelope />} label="Email" value={user.email} />
              <ProfileField icon={<FaPhone />} label="Phone" value={user.phone} />
              <ProfileField icon={<FaRegClock />} label="Member Since" value={formatDate(user.createdAt)} />
              <ProfileField icon={<FaMapMarkerAlt />} label="Location" value={user.location} />
            </div>
            {user.bio && (
              <div className="mt-6">
                <ProfileField label="Bio" value={user.bio} isLongText />
              </div>
            )}
          </div>
        )}

        {/* ------------------ UNAUTHORIZED ------------------ */}
        {!["candidate", "recruiter", "admin"].includes(role) && (
          <div className="text-center py-12">
            <p className="text-red-500 text-lg font-semibold">
              Unauthorized Access
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileField({ label, value, icon, isLink = false, isLongText = false }) {
  if (!value && value !== 0) value = "Not Provided";
  const canOpenLink = isLink && value !== "Not Provided";

  return (
    <div className="flex flex-col">
      <p className="text-gray-500 text-sm mb-1 flex items-center gap-1">
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}
      </p>
      {canOpenLink ? (
        <a
          href={value.startsWith("http") ? value : `https://${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 bg-gray-50 rounded-lg border text-blue-600 hover:text-blue-700 hover:underline break-all"
        >
          {value}
        </a>
      ) : (
        <p className={`p-3 bg-gray-50 rounded-lg border text-gray-900 ${isLongText ? 'whitespace-pre-wrap' : 'break-words'}`}>
          {value}
        </p>
      )}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto mt-10 max-w-4xl animate-pulse px-4">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl sm:p-8">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="h-28 w-28 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-3">
            <div className="h-7 w-48 rounded bg-gray-200" />
            <div className="h-4 w-64 max-w-full rounded bg-gray-100" />
            <div className="h-6 w-28 rounded-full bg-blue-100" />
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="space-y-2">
              <div className="h-3 w-20 rounded bg-gray-100" />
              <div className="h-14 rounded-lg bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
