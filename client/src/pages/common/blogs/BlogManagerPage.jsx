import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";
import {
  BarChart3,
  Edit3,
  Eye,
  FileText,
  Heart,
  Loader2,
  MessageCircle,
  Plus,
  RefreshCcw,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import { blogApi } from "../../../api/api";
import { getBlogCategory, getBlogPath, getCoverImage } from "../../../components/blog/blogConfig";

const emptyStats = {
  totalBlogs: 0,
  publishedBlogs: 0,
  draftBlogs: 0,
  totalViews: 0,
  totalLikes: 0,
  totalComments: 0,
  totalShares: 0,
};

function StatTile({ icon: Icon, label, value, tone = "blue" }) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    slate: "bg-slate-100 text-slate-700",
    violet: "bg-violet-50 text-violet-700",
  }[tone];

  return (
    <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm">
      <span className={`flex h-10 w-10 items-center justify-center rounded-[8px] ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-2xl font-black text-slate-950">{Number(value || 0).toLocaleString()}</p>
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}

function ManageCard({ blog, t, onDelete, onStatusChange, editPath }) {
  const category = getBlogCategory(blog.category, t);
  const CategoryIcon = category.icon;
  const isPublished = blog.status === "published";

  return (
    <article className="overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img src={getCoverImage(blog)} alt={blog.title} className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
        <span
          className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${category.className}`}
        >
          <CategoryIcon className="h-3.5 w-3.5" />
          {category.label}
        </span>
        <span
          className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold ${
            isPublished ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {isPublished ? t("publishedStatus", { defaultValue: "Published" }) : t("draftStatus", { defaultValue: "Draft" })}
        </span>
      </div>

      <div className="p-5">
        <h3 className="line-clamp-2 text-lg font-black text-slate-950">{blog.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{blog.excerpt || blog.description}</p>

        <div className="mt-4 grid grid-cols-4 gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {blog.views || 0}
          </span>
          <span className="inline-flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            {blog.likes || 0}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            {blog.commentsCount || 0}
          </span>
          <span className="inline-flex items-center gap-1">
            <Send className="h-3.5 w-3.5" />
            {blog.shares || 0}
          </span>
        </div>

        <p className="mt-3 text-xs font-medium text-slate-400">
          {formatDistanceToNow(new Date(blog.updatedAt || blog.createdAt), { addSuffix: true })}
        </p>

        <div className="mt-5 grid grid-cols-4 gap-2 border-t border-slate-100 pt-4">
          <Link
            to={getBlogPath(blog)}
            className="inline-flex items-center justify-center rounded-[8px] border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <Link
            to={editPath}
            className="inline-flex items-center justify-center rounded-[8px] bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
          >
            <Edit3 className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => onStatusChange(blog)}
            className={`inline-flex items-center justify-center rounded-[8px] px-3 py-2 text-sm font-semibold ${
              isPublished ? "bg-amber-50 text-amber-700 hover:bg-amber-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            {isPublished ? t("draft", { defaultValue: "Draft" }) : t("publish", { defaultValue: "Publish" })}
          </button>
          <button
            type="button"
            onClick={() => onDelete(blog)}
            className="inline-flex items-center justify-center rounded-[8px] bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function BlogManagerPage({ scope = "recruiter" }) {
  const { t } = useTranslation("blog");
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(emptyStats);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("latest");

  const paths = {
    list: scope === "admin" ? "/admin/blogs" : "/recruiter/blogs",
    create: scope === "admin" ? "/admin/blogs/create" : "/recruiter/blogs/create",
    edit: (id) => (scope === "admin" ? `/admin/blogs/edit/${id}` : `/recruiter/blogs/edit/${id}`),
  };

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogApi.get("/manage/all", {
        params: { status, category, sort, search, limit: 60 },
      });
      setBlogs(response.data.data?.blogs || response.data.blogs || []);
      setStats(response.data.data?.stats || response.data.stats || emptyStats);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const response = await blogApi.get("/categories", { skipAuthRedirect: true });
        if (isMounted) setCategories(response.data.data?.categories || response.data.categories || []);
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(fetchBlogs, 250);
    return () => window.clearTimeout(timeout);
  }, [category, search, sort, status]);

  const filteredCategories = useMemo(() => categories.slice(0, 16), [categories]);

  const handleDelete = async (blog) => {
    if (!window.confirm(t("deleteConfirm", { defaultValue: "Delete this blog post? This cannot be undone." }))) return;

    try {
      await blogApi.delete(`/${blog._id}`);
      setBlogs((current) => current.filter((item) => item._id !== blog._id));
      toast.success(t("deleted", { defaultValue: "Blog deleted." }));
      fetchBlogs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete blog");
    }
  };

  const handleStatusChange = async (blog) => {
    const nextStatus = blog.status === "published" ? "draft" : "published";
    try {
      await blogApi.patch(`/${blog._id}`, { status: nextStatus });
      setBlogs((current) => current.map((item) => (item._id === blog._id ? { ...item, status: nextStatus } : item)));
      toast.success(
        nextStatus === "published"
          ? t("published", { defaultValue: "Blog published." })
          : t("draftSaved", { defaultValue: "Draft saved." })
      );
      fetchBlogs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <section className="rounded-[8px] bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/10 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
              {scope === "admin"
                ? t("adminBlogManagement", { defaultValue: "Admin blog management" })
                : t("recruiterBlogManagement", { defaultValue: "Recruiter blog management" })}
            </p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              {t("manageBlogsHeading", { defaultValue: "Create, publish, and measure articles" })}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              {t("manageBlogsText", {
                defaultValue:
                  "Draft polished career content, optimize SEO metadata, upload Cloudinary covers, and track reader engagement.",
              })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={fetchBlogs}
              className="inline-flex items-center gap-2 rounded-[8px] border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {t("refresh", { defaultValue: "Refresh" })}
            </button>
            <button
              type="button"
              onClick={() => navigate(paths.create)}
              className="inline-flex items-center gap-2 rounded-[8px] bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-blue-100"
            >
              <Plus className="h-4 w-4" />
              {t("createBlog", { defaultValue: "Create blog" })}
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatTile icon={FileText} label={t("stats.total", { defaultValue: "Total" })} value={stats.totalBlogs} tone="slate" />
        <StatTile icon={Eye} label={t("stats.published", { defaultValue: "Published" })} value={stats.publishedBlogs} tone="green" />
        <StatTile icon={Edit3} label={t("stats.drafts", { defaultValue: "Drafts" })} value={stats.draftBlogs} tone="amber" />
        <StatTile icon={BarChart3} label={t("stats.views", { defaultValue: "Views" })} value={stats.totalViews} tone="blue" />
        <StatTile icon={Heart} label={t("stats.likes", { defaultValue: "Likes" })} value={stats.totalLikes} tone="rose" />
        <StatTile icon={MessageCircle} label={t("stats.comments", { defaultValue: "Comments" })} value={stats.totalComments} tone="violet" />
      </section>

      <section className="mt-6 rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_220px_180px]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("managerSearchPlaceholder", { defaultValue: "Search title, description, or content..." })}
              className="h-11 w-full rounded-[8px] border border-slate-200 pl-10 pr-3 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-11 rounded-[8px] border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none"
          >
            <option value="all">{t("allStatuses", { defaultValue: "All statuses" })}</option>
            <option value="published">{t("publishedStatus", { defaultValue: "Published" })}</option>
            <option value="draft">{t("draftStatus", { defaultValue: "Draft" })}</option>
          </select>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-11 rounded-[8px] border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none"
          >
            <option value="all">{t("allCategories", { defaultValue: "All categories" })}</option>
            {filteredCategories.map((item) => (
              <option key={item.key || item.slug} value={item.key || item.slug}>
                {item.name}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="h-11 rounded-[8px] border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none"
          >
            <option value="latest">{t("sort.latest", { defaultValue: "Latest" })}</option>
            <option value="most-viewed">{t("sort.mostViewed", { defaultValue: "Most viewed" })}</option>
            <option value="most-liked">{t("sort.mostLiked", { defaultValue: "Most liked" })}</option>
            <option value="trending">{t("sort.trending", { defaultValue: "Trending" })}</option>
          </select>
        </div>
      </section>

      {loading ? (
        <div className="mt-10 flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
        </div>
      ) : blogs.length ? (
        <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {blogs.map((blog) => (
            <ManageCard
              key={blog._id}
              blog={blog}
              t={t}
              editPath={paths.edit(blog._id)}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </section>
      ) : (
        <section className="mt-6 rounded-[8px] border border-dashed border-slate-300 bg-white p-10 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-300" />
          <h2 className="mt-4 text-xl font-black text-slate-950">
            {t("noManagedBlogs", { defaultValue: "No blogs found" })}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {t("noManagedBlogsText", { defaultValue: "Create a new article or adjust your filters." })}
          </p>
          <button
            type="button"
            onClick={() => navigate(paths.create)}
            className="mt-5 inline-flex items-center gap-2 rounded-[8px] bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            {t("createBlog", { defaultValue: "Create blog" })}
          </button>
        </section>
      )}
    </div>
  );
}
