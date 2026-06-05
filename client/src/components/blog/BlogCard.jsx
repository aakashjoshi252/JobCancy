import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Bookmark, Clock3, Eye, Heart, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import {
  estimateReadingTime,
  formatCount,
  getAuthorAvatar,
  getAuthorName,
  getBlogCategory,
  getBlogPath,
  getCoverImage,
} from "./blogConfig";

export default function BlogCard({ blog, index = 0, compact = false, t }) {
  const category = getBlogCategory(blog?.category, t);
  const CategoryIcon = category.icon;
  const authorAvatar = getAuthorAvatar(blog);
  const readTime = blog?.readingTime || estimateReadingTime(blog?.content);
  const date = blog?.publishedAt || blog?.createdAt;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.24) }}
      className="group h-full overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950"
    >
      <Link to={getBlogPath(blog)} className="flex h-full flex-col">
        <div className={`relative overflow-hidden bg-slate-100 ${compact ? "h-44" : "h-56"}`}>
          <img
            src={getCoverImage(blog)}
            alt={blog?.coverImage?.alt || blog?.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.src =
                "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&h=650&fit=crop";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/5 to-transparent" />
          <div className="absolute left-4 top-4">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur ${category.className}`}
            >
              <CategoryIcon className="h-3.5 w-3.5" />
              {category.label}
            </span>
          </div>
          {blog?.featured && (
            <div className="absolute right-4 top-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm">
                <Bookmark className="h-3.5 w-3.5 text-amber-500" />
                {t ? t("featured", { defaultValue: "Featured" }) : "Featured"}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              {readTime} {t ? t("minRead", { defaultValue: "min read" }) : "min read"}
            </span>
            {date && <span>{format(new Date(date), "MMM d, yyyy")}</span>}
          </div>

          <h3 className="text-lg font-bold leading-snug text-slate-950 transition group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">
            <span className={compact ? "line-clamp-2" : "line-clamp-3"}>{blog?.title}</span>
          </h3>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {blog?.excerpt || blog?.description}
          </p>

          <div className="mt-auto pt-5">
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="flex min-w-0 items-center gap-2">
                {authorAvatar ? (
                  <img
                    src={authorAvatar}
                    alt={getAuthorName(blog)}
                    className="h-8 w-8 rounded-full border border-white object-cover shadow-sm"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                    {getAuthorName(blog).slice(0, 1).toUpperCase()}
                  </div>
                )}
                <span className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {getAuthorName(blog)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {formatCount(blog?.views)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" />
                  {formatCount(blog?.likes)}
                </span>
                <span className="hidden items-center gap-1 sm:inline-flex">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {formatCount(blog?.commentsCount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
