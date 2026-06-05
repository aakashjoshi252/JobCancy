import { Link } from "react-router-dom";
import { ArrowUpRight, Clock3, Eye } from "lucide-react";
import { motion } from "framer-motion";
import {
  estimateReadingTime,
  formatCount,
  getBlogCategory,
  getBlogPath,
  getCoverImage,
} from "./blogConfig";

export default function FeaturedBlogCard({ blog, t, active = false }) {
  if (!blog) return null;

  const category = getBlogCategory(blog.category, t);
  const CategoryIcon = category.icon;

  return (
    <motion.article
      layout
      className={`relative h-full min-h-[360px] overflow-hidden rounded-[8px] border transition duration-300 ${
        active
          ? "border-white/60 shadow-2xl shadow-slate-950/20"
          : "border-white/30 shadow-lg shadow-slate-950/10"
      }`}
    >
      <Link to={getBlogPath(blog)} className="group block h-full">
        <img
          src={getCoverImage(blog)}
          alt={blog.coverImage?.alt || blog.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-950/5" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <span
            className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${category.className}`}
          >
            <CategoryIcon className="h-4 w-4" />
            {category.label}
          </span>
          <h3 className="max-w-2xl text-2xl font-black leading-tight text-white sm:text-4xl">
            {blog.title}
          </h3>
          <p className="mt-3 max-w-xl line-clamp-2 text-sm leading-6 text-slate-200">
            {blog.excerpt || blog.description}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm font-medium text-slate-200">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-4 w-4" />
              {blog.readingTime || estimateReadingTime(blog.content)}{" "}
              {t ? t("minRead", { defaultValue: "min read" }) : "min read"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              {formatCount(blog.views)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-slate-950 transition group-hover:bg-blue-600 group-hover:text-white">
              {t ? t("readArticle", { defaultValue: "Read article" }) : "Read article"}
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
