import { Link } from "react-router-dom";
import { ArrowRight, Flame, Search, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import BlogSearchBar from "./BlogSearchBar";
import {
  estimateReadingTime,
  formatCount,
  getBlogCategory,
  getBlogPath,
  getCoverImage,
} from "./blogConfig";

export default function BlogHero({
  featuredBlog,
  searchValue,
  onSearchChange,
  onSearchClear,
  categories = [],
  onCategoryChange,
  trendingKeywords = [],
  t,
}) {
  const category = getBlogCategory(featuredBlog?.category, t);
  const CategoryIcon = category.icon;

  return (
    <section className="relative overflow-hidden rounded-[8px] bg-slate-950 text-white">
      <img
        src={featuredBlog ? getCoverImage(featuredBlog) : "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600&h=1000&fit=crop"}
        alt={featuredBlog?.title || "Career blog"}
        className="absolute inset-0 h-full w-full object-cover opacity-55"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/20" />
      <div className="relative px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
        <div className="max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] backdrop-blur"
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            {t ? t("heroEyebrow", { defaultValue: "Placement intelligence" }) : "Placement intelligence"}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-6 max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl"
          >
            {t
              ? t("heroTitle", { defaultValue: "Career stories, hiring signals, and practical job-search playbooks" })
              : "Career stories, hiring signals, and practical job-search playbooks"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="mt-5 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg"
          >
            {t
              ? t("heroDescription", {
                  defaultValue:
                    "Fresh guidance for candidates, recruiters, and jewelry industry professionals who want sharper careers and better placements.",
                })
              : "Fresh guidance for candidates, recruiters, and jewelry industry professionals who want sharper careers and better placements."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="mt-8 max-w-2xl"
          >
            <BlogSearchBar
              value={searchValue}
              onChange={onSearchChange}
              onClear={onSearchClear}
              placeholder={
                t
                  ? t("searchPlaceholder", { defaultValue: "Search resume tips, interviews, AI skills..." })
                  : "Search resume tips, interviews, AI skills..."
              }
            />
          </motion.div>

          <div className="mt-6 flex flex-wrap gap-2">
            {categories.slice(0, 6).map((categoryItem) => {
              const itemMeta = getBlogCategory(categoryItem.key || categoryItem.slug, t);
              const Icon = itemMeta.icon;
              return (
                <button
                  key={categoryItem.key || categoryItem.slug}
                  type="button"
                  onClick={() => onCategoryChange(categoryItem.key || categoryItem.slug)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-white hover:text-slate-950"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {categoryItem.name || itemMeta.label}
                </button>
              );
            })}
          </div>
        </div>

        {featuredBlog && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="mt-10 max-w-4xl rounded-[8px] border border-white/15 bg-white/10 p-4 backdrop-blur-md sm:p-5"
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <img
                src={getCoverImage(featuredBlog)}
                alt={featuredBlog.title}
                className="h-44 w-full rounded-[8px] object-cover md:w-64"
              />
              <div className="min-w-0 flex-1">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${category.className}`}>
                  <CategoryIcon className="h-3.5 w-3.5" />
                  {category.label}
                </span>
                <h2 className="mt-3 line-clamp-2 text-2xl font-black">{featuredBlog.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-200">
                  {featuredBlog.excerpt || featuredBlog.description}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-200">
                  <span className="inline-flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    {formatCount(featuredBlog.views)} {t ? t("views", { defaultValue: "views" }) : "views"}
                  </span>
                  <span>
                    {featuredBlog.readingTime || estimateReadingTime(featuredBlog.content)}{" "}
                    {t ? t("minRead", { defaultValue: "min read" }) : "min read"}
                  </span>
                  <Link
                    to={getBlogPath(featuredBlog)}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-semibold text-slate-950 transition hover:bg-blue-100"
                  >
                    {t ? t("readFeatured", { defaultValue: "Read featured" }) : "Read featured"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-slate-200">
          <span className="inline-flex items-center gap-2 font-semibold">
            <Flame className="h-4 w-4 text-amber-300" />
            {t ? t("trendingKeywords", { defaultValue: "Trending" }) : "Trending"}
          </span>
          {trendingKeywords.slice(0, 6).map((keyword) => (
            <button
              key={keyword}
              type="button"
              onClick={() => onSearchChange(keyword)}
              className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold transition hover:bg-white hover:text-slate-950"
            >
              <Search className="mr-1 inline h-3 w-3" />
              {keyword}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
