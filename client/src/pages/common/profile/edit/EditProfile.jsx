import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { apiHelpers } from "../../../../api/api";
import { useNavigate } from "react-router-dom";
import { FaCamera, FaEnvelope, FaGlobe, FaImage, FaLock, FaMapMarkerAlt, FaPhone, FaTrash, FaUser } from "react-icons/fa";
import UserAvatar from "../../../../components/ui/UserAvatar";
import { updateUser } from "../../../../redux/slices/authSlice";

const getUserFromProfileResponse = (response) =>
  response.data?.data?.user || response.data?.user || response.data?.data || null;

export default function EditProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const role = user?.role;
  const imageInputRef = useRef(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    jobProfession: "",
    location: "",
    website: "",
    bio: "",
  });
  const [loading, setLoading] = useState(false);
  const [removingImage, setRemovingImage] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [draggingImage, setDraggingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Populate form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        jobProfession: user.jobProfession || "",
        location: user.location || "",
        website: user.website || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  useEffect(() => () => {
    if (profileImagePreview) URL.revokeObjectURL(profileImagePreview);
  }, [profileImagePreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear messages when user starts typing
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = new FormData();
      payload.append("username", formData.username);
      payload.append("phone", formData.phone);
      payload.append("location", formData.location);
      payload.append("website", formData.website);
      payload.append("bio", formData.bio);

      if (role === "candidate") {
        payload.append("jobProfession", formData.jobProfession);
      }

      if (profileImageFile) {
        payload.append("profileImage", profileImageFile);
      }

      const response = await apiHelpers.user.updateProfile(payload, {
        onUploadProgress: (event) => {
          if (!event.total) return;
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        },
      });
      let updatedUser = getUserFromProfileResponse(response);
      if (!updatedUser?._id) {
        const profileResponse = await apiHelpers.user.getMe();
        updatedUser = getUserFromProfileResponse(profileResponse);
      }
      if (updatedUser) dispatch(updateUser(updatedUser));

      setSuccess("Profile updated successfully!");
      toast.success("Profile updated successfully");
      clearSelectedImage();

      // Navigate back after short delay
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update profile";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const setValidatedProfileImage = (file) => {
    if (!file) return;

    const imageTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
    const imageNameAllowed = /\.(jpe?g|png|webp)$/i.test(file.name);

    if (!imageTypes.has(file.type) || !imageNameAllowed) {
      toast.error("Use a JPG, JPEG, PNG, or WebP profile image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile images must be 5MB or smaller.");
      return;
    }

    if (profileImagePreview) URL.revokeObjectURL(profileImagePreview);
    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
    setUploadProgress(0);
    setError("");
  };

  const handleImageChange = (event) => {
    setValidatedProfileImage(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleImageDrop = (event) => {
    event.preventDefault();
    setDraggingImage(false);
    setValidatedProfileImage(event.dataTransfer.files?.[0]);
  };

  const clearSelectedImage = () => {
    if (profileImagePreview) URL.revokeObjectURL(profileImagePreview);
    setProfileImageFile(null);
    setProfileImagePreview("");
    setUploadProgress(0);
  };

  const handleRemoveImage = async () => {
    if (profileImageFile) {
      clearSelectedImage();
      return;
    }

    try {
      setRemovingImage(true);
      const response = await apiHelpers.user.deleteProfileImage();
      let updatedUser = getUserFromProfileResponse(response);
      if (!updatedUser?._id) {
        const profileResponse = await apiHelpers.user.getMe();
        updatedUser = getUserFromProfileResponse(profileResponse);
      }
      if (updatedUser) dispatch(updateUser(updatedUser));
      toast.success("Profile image removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to remove profile image.");
    } finally {
      setRemovingImage(false);
    }
  };

  const previewUser = profileImagePreview
    ? { ...user, profileImage: { ...(user.profileImage || {}), url: profileImagePreview } }
    : user;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-4 max-w-3xl px-3 sm:mt-10 sm:px-4">
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xl sm:p-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">Edit Profile</h2>
            <p className="text-gray-600 mt-1">Update your personal information</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-800 sm:w-auto"
          >
            Cancel
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative mx-auto sm:mx-0">
                <UserAvatar
                  user={previewUser}
                  className="h-32 w-32 border-4 border-white text-3xl shadow-xl"
                />
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="absolute bottom-1 right-1 inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-lg transition hover:bg-blue-700"
                  aria-label="Change profile image"
                >
                  <FaCamera />
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-gray-950">Profile Picture</h3>
                  <p className="text-sm text-gray-600">
                    Drop an image here or choose a JPG, PNG, or WebP file up to 5MB.
                  </p>
                </div>

                <input
                  ref={imageInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />

                <div
                  onDragEnter={(event) => {
                    event.preventDefault();
                    setDraggingImage(true);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDraggingImage(true);
                  }}
                  onDragLeave={() => setDraggingImage(false)}
                  onDrop={handleImageDrop}
                  className={`rounded-xl border border-dashed p-4 transition ${
                    draggingImage
                      ? "border-blue-500 bg-blue-100/70"
                      : "border-blue-200 bg-white/80 hover:border-blue-400"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                        <FaImage />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {profileImageFile?.name || "Choose a new profile image"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Preview appears before the form is saved.
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap">
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={loading || removingImage}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {profileImageFile ? "Change" : "Upload"}
                      </button>
                      {(profileImageFile || user.profileImage?.url || user.profilePicture) && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          disabled={loading || removingImage}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <FaTrash className="text-xs" />
                          {profileImageFile ? "Clear" : removingImage ? "Removing..." : "Remove"}
                        </button>
                      )}
                    </div>
                  </div>

                  {profileImageFile && (loading || uploadProgress > 0) ? (
                    <div className="mt-4">
                      <div className="mb-1 flex justify-between text-xs font-medium text-blue-700">
                        <span>Uploading image</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-blue-100">
                        <div className="h-full bg-blue-600 transition-all" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          {/* Read-only Email */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              <FaEnvelope className="inline mr-2" />
              Email Address
            </label>
            <p className="text-gray-900 font-medium">{formData.email}</p>
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          {/* Username */}
          <InputField
            icon={<FaUser />}
            label="Full Name"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />

          {/* Phone */}
          <InputField
            icon={<FaPhone />}
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter 10-digit phone number"
            pattern="[0-9]{10}"
            maxLength="10"
            required
          />

          {/* Job Profession - Only for Candidates */}
          {role === "candidate" && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                <FaEnvelope className="inline mr-2" />
                Job Profession
              </label>
              <p className="text-gray-900 font-medium">{formData.jobProfession}</p>
              <p className="text-xs text-gray-500 mt-1">Job profession cannot be changed</p>
            </div>
          )}

          {/* Location */}
          <InputField
            icon={<FaMapMarkerAlt />}
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. Mumbai, Maharashtra"
          />

          {/* Website */}
          {
            role === "recruiter" && (
              <InputField
                icon={<FaGlobe />}
                label="Website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            )
          }


          {/* Bio */}
          <div className="space-y-2">
            <label className="block font-medium text-gray-700">
              <FaUser className="inline mr-2" />
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              maxLength={500}
              placeholder="Tell us a little about yourself..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            />
            <p className="text-xs text-gray-500 text-right">
              {formData.bio.length}/500 characters
            </p>
          </div>

          {/* Account Type (Read-only) */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <FaLock className="text-gray-500" />
              <p className="text-sm font-medium text-gray-600">Account Information</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
                {role}
              </span>
              <span className="text-sm text-gray-500">Member since {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-blue-600 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 sm:text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Changes...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-gray-300 px-8 py-3 text-base font-semibold transition hover:bg-gray-50 sm:text-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Enhanced InputField component
function InputField({
  icon,
  label,
  name,
  value,
  onChange,
  placeholder = "",
  type = "text",
  pattern,
  maxLength,
  required = false
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block font-medium text-gray-700">
        {icon && <span className="inline mr-2 text-gray-500">{icon}</span>}
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        pattern={pattern}
        maxLength={maxLength}
        required={required}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
      />
      {pattern === "[0-9]{10}" && (
        <p className="text-xs text-gray-500">Enter 10-digit mobile number</p>
      )}
    </div>
  );
}
