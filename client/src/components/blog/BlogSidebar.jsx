import { Link } from "react-router-dom";
import { Facebook, Linkedin, MessageCircle, Share2, Tag, TrendingUp } from "lucide-react";
import { getBlogCategory, getBlogPath, getCoverImage } from "./blogConfig";
import NewsletterBox from "./NewsletterBox";

function MiniPost({ blog, t }) {
  const category = getBlogCategory(blog?.category, t);
  return (
    <Link to={getBlogPath(blog)} className="group flex gap-3">
      <img
        src={getCoverImage(blog)}
        alt={blog?.title}
        className="h-16 w-20 rounded-[8px] object-cover"
        loading="lazy"
      />
      <div className="min-w-0">
        <p className="text-xs font-semibold text-blue-700">{category.label}</p>
        <h4 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-slate-950 transition group-hover:text-blue-700 dark:text-white">
          {blog?.title}
        </h4>
      </div>
    </Link>
  );
}

export default function BlogSidebar({ popular = [], recent = [], categories = [], tags = [], t }) {
  return (
    <aside className="space-y-5 lg:sticky lg:top-24">
      <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-700" />
          <h3 className="font-black text-slate-950 dark:text-white">
            {t ? t("popularPosts", { defaultValue: "Popular posts" }) : "Popular posts"}
          </h3>
        </div>
        <div className="space-y-4">
          {popular.slice(0, 4).map((blog) => (
            <MiniPost key={blog._id || blog.slug} blog={blog} t={t} />
          ))}
        </div>
      </section>

      <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h3 className="mb-4 font-black text-slate-950 dark:text-white">
          {t ? t("recentPosts", { defaultValue: "Recent posts" }) : "Recent posts"}
        </h3>
        <div className="space-y-4">
          {recent.slice(0, 4).map((blog) => (
            <MiniPost key={blog._id || blog.slug} blog={blog} t={t} />
          ))}
        </div>
      </section>

      <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h3 className="mb-4 font-black text-slate-950 dark:text-white">
          {t ? t("categoriesTitle", { defaultValue: "Categories" }) : "Categories"}
        </h3>
        <div className="space-y-2">
          {categories.slice(0, 8).map((category) => {
            const meta = getBlogCategory(category.key || category.slug, t);
            const Icon = meta.icon;
            return (
              <Link
                key={category.key || category.slug}
                to={`/blogs?category=${category.key || category.slug}`}
                className="flex items-center justify-between rounded-[8px] border border-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {category.name || meta.label}
                </span>
                <span className="text-xs text-slate-400">{category.count || 0}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-center gap-2">
          <Tag className="h-5 w-5 text-blue-700" />
          <h3 className="font-black text-slate-950 dark:text-white">
            {t ? t("popularTags", { defaultValue: "Popular tags" }) : "Popular tags"}
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 18).map((item) => {
            const tag = item.tag || item;
            return (
              <Link
                to={`/blogs?tag=${tag}`}
                key={tag}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                #{tag}
              </Link>
            );
          })}
        </div>
      </section>

      <NewsletterBox t={t} compact />

      <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Share2 className="h-5 w-5 text-blue-700" />
          <h3 className="font-black text-slate-950">
            {t ? t("shareHub", { defaultValue: "Share hub" }) : "Share hub"}
          </h3>
        </div>
        <div className="flex gap-2">
          {[Facebook, Linkedin, MessageCircle].map((Icon, index) => (
            <button
              type="button"
              key={index}
              className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              aria-label="Share"
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}
