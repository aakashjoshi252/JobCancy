import { BASE_URL } from "../api/api";

export const getUserInitials = (user) => {
  const name = user?.username || user?.fullName || user?.email || "User";

  return name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "U";
};

export const getProfileImageUrl = (user) => {
  const serverAvatar =
    user?.avatarUrl && !user.avatarUrl.includes("ui-avatars.com") ? user.avatarUrl : "";
  const imageUrl = user?.profileImage?.url || user?.profilePicture || serverAvatar;

  return getMediaUrl(imageUrl);
};

export const getMediaUrl = (imageUrl) => {
  if (!imageUrl) return "";
  if (/^(https?:|data:|blob:)/i.test(imageUrl)) return imageUrl;
  return `${BASE_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
};
