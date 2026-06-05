import { useEffect, useState } from "react";
import { getProfileImageUrl, getUserInitials } from "../../utils/profileImage";

export default function UserAvatar({
  user,
  alt,
  className = "",
  imageClassName = "",
  fallbackClassName = "",
}) {
  const imageUrl = getProfileImageUrl(user);
  const [brokenImage, setBrokenImage] = useState(false);

  useEffect(() => {
    setBrokenImage(false);
  }, [imageUrl]);

  return (
    <span
      className={`inline-flex shrink-0 overflow-hidden rounded-full bg-blue-600 text-white ${className}`}
      title={user?.username || user?.email || "User"}
    >
      {imageUrl && !brokenImage ? (
        <img
          src={imageUrl}
          alt={alt || user?.username || "Profile"}
          loading="lazy"
          decoding="async"
          onError={() => setBrokenImage(true)}
          className={`h-full w-full object-cover ${imageClassName}`}
        />
      ) : (
        <span
          className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 font-semibold ${fallbackClassName}`}
        >
          {getUserInitials(user)}
        </span>
      )}
    </span>
  );
}
