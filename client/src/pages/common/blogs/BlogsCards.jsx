import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaEye, 
  FaHeart, 
  FaRegHeart, 
  FaClock, 
  FaBuilding, 
  FaBookmark,
  FaRegBookmark,
  FaShareAlt,
  FaUser,
  FaTag,
  FaCalendarAlt
} from "react-icons/fa";
import { HiNewspaper, HiCalendar, HiStar, HiTrendingUp, HiUserGroup, HiOfficeBuilding } from "react-icons/hi";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";

// Dynamic category icon mapping
const categoryIconMap = {
  event: <HiCalendar className="text-sm" />,
  achievement: <HiStar className="text-sm" />,
  growth: <HiTrendingUp className="text-sm" />,
  culture: <HiUserGroup className="text-sm" />,
  news: <HiOfficeBuilding className="text-sm" />,
  default: <HiNewspaper className="text-sm" />
};

// Dynamic category color mapping
const categoryColorMap = {
  event: "blue",
  achievement: "yellow",
  growth: "green",
  culture: "purple",
  news: "pink",
  default: "gray"
};

// Dynamic category style mapping
const categoryStyleMap = {
  blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", hover: "hover:bg-blue-100" },
  yellow: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", hover: "hover:bg-yellow-100" },
  green: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", hover: "hover:bg-green-100" },
  purple: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", hover: "hover:bg-purple-100" },
  pink: { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200", hover: "hover:bg-pink-100" },
  gray: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", hover: "hover:bg-gray-100" }
};

export default function BlogCard({ 
  blog, 
  categories = [], 
  onClick, 
  onLike, 
  onBookmark,
  isLiked: externalIsLiked = false,
  isBookmarked: externalIsBookmarked = false
}) {
  const [internalIsLiked, setInternalIsLiked] = useState(externalIsLiked);
  const [internalIsBookmarked, setInternalIsBookmarked] = useState(externalIsBookmarked);
  const [likeCount, setLikeCount] = useState(blog.likes || 0);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  // Get category details dynamically
  const categoryDetails = useMemo(() => {
    const category = categories.find(c => c._id === blog.category);
    const iconKey = category?.icon || blog.category || 'default';
    const colorKey = category?.icon || blog.category || 'default';
    const color = categoryColorMap[colorKey] || categoryColorMap.default;
    
    return {
      name: category?.name || blog.category || "General",
      icon: categoryIconMap[iconKey] || categoryIconMap.default,
      color: color,
      style: categoryStyleMap[color] || categoryStyleMap.gray
    };
  }, [blog.category, categories]);

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const calculateReadTime = (content) => {
    if (!content) return 3;
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  const readTime = calculateReadTime(blog.content);
  const isFeatured = blog.featured || false;

  const handleLikeClick = async (e) => {
    e.stopPropagation();
    const newLiked = !internalIsLiked;
    setInternalIsLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1);
    
    if (onLike) {
      try {
        await onLike(blog._id, newLiked);
      } catch (error) {
        setInternalIsLiked(!newLiked);
        setLikeCount(prev => newLiked ? prev - 1 : prev + 1);
        toast.error("Failed to update like");
      }
    }
  };

  const handleBookmarkClick = async (e) => {
    e.stopPropagation();
    const newBookmarked = !internalIsBookmarked;
    setInternalIsBookmarked(newBookmarked);
    
    if (onBookmark) {
      try {
        await onBookmark(blog._id, newBookmarked);
        toast.success(newBookmarked ? "Added to bookmarks" : "Removed from bookmarks");
      } catch (error) {
        setInternalIsBookmarked(!newBookmarked);
        toast.error("Failed to update bookmark");
      }
    }
  };

  const handleShareClick = async (e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/blogs/${blog._id}`;
    const shareData = {
      title: blog.title,
      text: blog.description,
      url: shareUrl
    };
    
    try {
      if (navigator.share && /Mobile|Android|iPhone/i.test(navigator.userAgent)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShowShareTooltip(true);
        toast.success("✨ Link copied to clipboard!");
        setTimeout(() => setShowShareTooltip(false), 2000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      if (error.name !== 'AbortError') {
        toast.error("Failed to share");
      }
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onClick(blog._id)}
      className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md"
    >
      {/* Image Container */}
      <div className="relative h-44 overflow-hidden bg-gray-100">
        {/* Loading Skeleton */}
        <AnimatePresence>
          {!imageLoaded && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-gray-100"
            >
              <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Blog Image */}
        <motion.img
          src={blog.image || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500&h=300&fit=crop"}
          alt={blog.title}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isHovered ? "scale-105" : "scale-100"
          } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500&h=300&fit=crop";
          }}
        />
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        
        {/* Category Badge */}
        <motion.div
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="absolute top-3 left-3 z-10"
        >
          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${categoryDetails.style.bg} ${categoryDetails.style.text} border ${categoryDetails.style.border} shadow-sm`}>
            {categoryDetails.icon}
            <span>{categoryDetails.name}</span>
          </div>
        </motion.div>

        {/* Featured Badge */}
        {isFeatured && (
          <motion.div
            initial={{ x: 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="absolute top-3 right-3 z-10"
          >
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200 shadow-sm">
              <HiNewspaper className="text-xs" />
              <span>Featured</span>
            </div>
          </motion.div>
        )}

        {/* Stats Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
          {/* Read Time */}
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg">
            <FaClock className="text-xs text-blue-400" />
            <span className="font-medium">{readTime} min read</span>
          </div>

          {/* Views */}
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg">
            <FaEye className="text-xs text-blue-400" />
            <span className="font-medium">{formatNumber(blog.views || 0)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition">
          {blog.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
          {blog.description?.length > 100 
            ? `${blog.description.substring(0, 100)}...` 
            : blog.description}
        </p>

        {/* Meta Information */}
        <div className="space-y-1.5 mb-3">
          {/* Company & Author */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-gray-500">
              <FaBuilding className="text-blue-500 text-xs" />
              <span className="truncate max-w-[120px] font-medium">
                {blog.companyId?.companyName || blog.companyId?.name || "Anonymous"}
              </span>
            </div>
            {blog.authorId?.username && (
              <div className="flex items-center gap-1.5 text-gray-400">
                <FaUser className="text-xs" />
                <span className="truncate max-w-[100px] text-xs">
                  {blog.authorId.username}
                </span>
              </div>
            )}
          </div>

          {/* Date & Tags */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-gray-400">
              <FaCalendarAlt className="text-xs" />
              <span>
                {blog.createdAt 
                  ? formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })
                  : "Recently"}
              </span>
            </div>
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <FaTag className="text-xs text-gray-400" />
                <span className="text-gray-400 text-xs truncate max-w-[80px]">
                  {blog.tags[0]}{blog.tags.length > 1 ? ` +${blog.tags.length - 1}` : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Like Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLikeClick}
              className={`flex items-center gap-1 text-xs transition-colors ${
                internalIsLiked 
                  ? "text-red-600" 
                  : "text-gray-500 hover:text-red-600"
              }`}
              aria-label={internalIsLiked ? "Unlike" : "Like"}
            >
              <AnimatePresence mode="wait">
                {internalIsLiked ? (
                  <motion.div
                    key="liked"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", duration: 0.2 }}
                  >
                    <FaHeart className="text-sm" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="unliked"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <FaRegHeart className="text-sm" />
                  </motion.div>
                )}
              </AnimatePresence>
              <span className="font-medium">{formatNumber(likeCount)}</span>
            </motion.button>

            {/* Bookmark Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBookmarkClick}
              className={`flex items-center gap-1 text-xs transition-colors ${
                internalIsBookmarked 
                  ? "text-yellow-600" 
                  : "text-gray-500 hover:text-yellow-600"
              }`}
              aria-label={internalIsBookmarked ? "Remove bookmark" : "Bookmark"}
            >
              {internalIsBookmarked ? (
                <FaBookmark className="text-sm" />
              ) : (
                <FaRegBookmark className="text-sm" />
              )}
            </motion.button>

            {/* Share Button with Tooltip */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShareClick}
                className="text-gray-500 hover:text-blue-600 transition-colors text-xs"
                aria-label="Share"
              >
                <FaShareAlt className="text-sm" />
              </motion.button>
              
              <AnimatePresence>
                {showShareTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-0.5 bg-gray-800 text-white text-xs rounded whitespace-nowrap"
                  >
                    Copied!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Read More Link */}
          <span className="text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1 transition-all">
            Read More
            <svg 
              className="w-3 h-3 transition-transform group-hover:translate-x-0.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </motion.article>
  );
}