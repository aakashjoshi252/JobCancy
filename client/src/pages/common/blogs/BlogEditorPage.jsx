import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  BarChart3,
  Eye,
  FileText,
  ImagePlus,
  Loader2,
  Save,
  Search,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { blogApi } from "../../../api/api";
import MarkdownEditor from "../../../components/blog/MarkdownEditor";
import { blogCategoryMeta, estimateReadingTime, getBlogCategory, getCoverImage } from "../../../components/blog/blogConfig";

const slugify = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

const initialForm = {
  title: "",
  slug: "",
  description: "",
  excerpt: "",
  content: "",
  category: "career-tips",
  tags: "",
  image: "",
  coverImage: { url: "", publicId: "", alt: "" },
  status: "draft",
  featured: false,
  metaTitle: "",
  metaDescription: "",
  keywords: "",
};

export default function BlogEditorPage({ mode = "create", scope = "recruiter" }) {
  const { t } = useTranslation("blog");
  const navigate = useNavigate();
  const { blogId } = useParams();
  const fileInputRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const company = useSelector((state) => state.company.data);

  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const isEdit = mode === "edit";
  const listPath = scope === "admin" ? "/admin/blogs" : "/recruiter/blogs";

  const categoryOptions = useMemo(() => {
    if (categories.length) return categories;
    return blogCategoryMeta.map((category) => ({
      key: category.key,
      name: t(category.nameKey, { defaultValue: category.fallbackName }),
      description: t(category.descriptionKey, { defaultValue: category.fallbackDescription }),
    }));
  }, [categories, t]);

  const selectedCategory = getBlogCategory(form.category, t);
  const CategoryIcon = selectedCategory.icon;
  const readTime = estimateReadingTime(form.content);
  const seoScore = useMemo(() => {
    let score = 0;
    if (form.title.length >= 30 && form.title.length <= 70) score += 25;
    if (form.description.length >= 80 && form.description.length <= 170) score += 25;
    if (form.slug) score += 15;
    if (form.image || form.coverImage?.url) score += 15;
    if (form.tags.split(",").filter((tag) => tag.trim()).length >= 3) score += 20;
    return score;
  }, [form]);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const response = await blogApi.get("/categories", { skipAuthRedirect: true });
        if (isMounted) setCategories(response.data.data?.categories || response.data.categories || []);
      } catch (error) {
        console.error("Failed to load blog categories", error);
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchBlog = async () => {
      if (!isEdit || !blogId) return;
      try {
        setLoading(true);
        const response = await blogApi.get(`/${blogId}`);
        const blog = response.data.data?.blog || response.data.blog;
        if (!isMounted) return;
        setForm({
          title: blog.title || "",
          slug: blog.slug || "",
          description: blog.description || "",
          excerpt: blog.excerpt || "",
          content: blog.content || "",
          category: blog.category || "career-tips",
          tags: (blog.tags || []).join(", "),
          image: blog.image || blog.coverImage?.url || "",
          coverImage: blog.coverImage || { url: blog.image || "", publicId: "", alt: blog.title || "" },
          status: blog.status || "draft",
          featured: Boolean(blog.featured),
          metaTitle: blog.seo?.metaTitle || blog.title || "",
          metaDescription: blog.seo?.metaDescription || blog.description || "",
          keywords: (blog.seo?.keywords || blog.tags || []).join(", "),
        });
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load blog");
        navigate(listPath);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBlog();

    return () => {
      isMounted = false;
    };
  }, [blogId, isEdit, listPath, navigate]);

  const updateField = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "title" && !isEdit && !current.slug) {
        next.slug = slugify(value);
      }
      return next;
    });
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = t("validation.titleRequired", { defaultValue: "Title is required." });
    if (!form.description.trim()) nextErrors.description = t("validation.descriptionRequired", { defaultValue: "Description is required." });
    if (!form.content.trim() || form.content.trim().length < 50) {
      nextErrors.content = t("validation.contentLength", { defaultValue: "Content should be at least 50 characters." });
    }
    if (!form.category) nextErrors.category = t("validation.categoryRequired", { defaultValue: "Category is required." });
    if (scope === "recruiter" && !company?._id) {
      nextErrors.company = t("validation.companyRequired", { defaultValue: "Create your company profile before publishing blogs." });
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCoverUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const data = new FormData();
      data.append("image", file);
      const response = await blogApi.post("/upload-image", data);
      const uploadData = response.data.data || response.data;
      const coverImage = uploadData.coverImage || {
        url: uploadData.imageUrl,
        publicId: uploadData.publicId,
        alt: form.title || file.name,
      };
      setForm((current) => ({
        ...current,
        image: coverImage.url,
        coverImage: {
          ...coverImage,
          alt: current.coverImage.alt || current.title || file.name,
        },
      }));
      toast.success(t("imageUploaded", { defaultValue: "Image uploaded." }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const submit = async (status) => {
    if (!validate()) {
      toast.error(t("validation.fixErrors", { defaultValue: "Please fix the highlighted fields." }));
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: form.title.trim(),
        slug: slugify(form.slug || form.title),
        description: form.description.trim(),
        excerpt: form.excerpt.trim() || form.description.trim(),
        content: form.content,
        contentFormat: "markdown",
        category: form.category,
        categoryName: selectedCategory.label,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean),
        image: form.image || form.coverImage?.url,
        coverImage: {
          ...form.coverImage,
          url: form.image || form.coverImage?.url,
          alt: form.coverImage?.alt || form.title,
        },
        status,
        featured: status === "published" ? form.featured : false,
        companyId: scope === "recruiter" ? company?._id : null,
        authorId: user?._id,
        metaTitle: form.metaTitle || form.title,
        metaDescription: form.metaDescription || form.description,
        keywords: form.keywords,
      };

      if (isEdit) {
        await blogApi.patch(`/${blogId}`, payload);
        toast.success(t("updated", { defaultValue: "Blog updated." }));
      } else {
        await blogApi.post("/", payload);
        toast.success(
          status === "published"
            ? t("published", { defaultValue: "Blog published." })
            : t("draftSaved", { defaultValue: "Draft saved." })
        );
      }

      navigate(listPath);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save blog");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(listPath)}
              className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                {scope === "admin"
                  ? t("adminStudio", { defaultValue: "Admin blog studio" })
                  : t("recruiterStudio", { defaultValue: "Recruiter blog studio" })}
              </p>
              <h1 className="text-2xl font-black text-slate-950">
                {isEdit
                  ? t("editBlog", { defaultValue: "Edit blog" })
                  : t("createBlog", { defaultValue: "Create blog" })}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => submit("draft")}
              disabled={saving || uploading}
              className="inline-flex items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {t("saveDraft", { defaultValue: "Save draft" })}
            </button>
            <button
              type="button"
              onClick={() => submit("published")}
              disabled={saving || uploading}
              className="inline-flex items-center gap-2 rounded-[8px] bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              {t("publish", { defaultValue: "Publish" })}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <main className="space-y-6">
          {errors.company && (
            <div className="rounded-[8px] border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {errors.company}
            </div>
          )}

          <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-800">
                  {t("fields.title", { defaultValue: "Title" })}
                </span>
                <input
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  className="h-12 w-full rounded-[8px] border border-slate-200 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  placeholder={t("titlePlaceholder", { defaultValue: "How to prepare for a jewelry design interview" })}
                />
                {errors.title && <p className="mt-2 text-sm font-medium text-red-600">{errors.title}</p>}
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-800">
                  {t("fields.slug", { defaultValue: "SEO slug" })}
                </span>
                <input
                  value={form.slug}
                  onChange={(event) => updateField("slug", slugify(event.target.value))}
                  className="h-12 w-full rounded-[8px] border border-slate-200 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  placeholder="how-to-prepare-interview"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-800">
                  {t("fields.category", { defaultValue: "Category" })}
                </span>
                <select
                  value={form.category}
                  onChange={(event) => updateField("category", event.target.value)}
                  className="h-12 w-full rounded-[8px] border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                >
                  {categoryOptions.map((category) => (
                    <option key={category.key || category.slug} value={category.key || category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-800">
                  {t("fields.description", { defaultValue: "Short description" })}
                </span>
                <textarea
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  rows={3}
                  maxLength={500}
                  className="w-full resize-y rounded-[8px] border border-slate-200 p-4 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  placeholder={t("descriptionPlaceholder", {
                    defaultValue: "A concise summary used on cards, meta tags, and social previews.",
                  })}
                />
                <div className="mt-1 flex justify-between text-xs text-slate-500">
                  {errors.description ? <span className="font-medium text-red-600">{errors.description}</span> : <span />}
                  <span>{form.description.length}/500</span>
                </div>
              </label>
            </div>
          </section>

          <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <MarkdownEditor
              value={form.content}
              onChange={(value) => updateField("content", value)}
              label={t("fields.content", { defaultValue: "Article content" })}
              error={errors.content}
              t={t}
            />
          </section>

          <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <Search className="h-5 w-5 text-blue-700" />
              <h2 className="text-xl font-black text-slate-950">
                {t("seoSettings", { defaultValue: "SEO settings" })}
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-800">
                  {t("fields.metaTitle", { defaultValue: "Meta title" })}
                </span>
                <input
                  value={form.metaTitle}
                  onChange={(event) => updateField("metaTitle", event.target.value)}
                  maxLength={70}
                  className="h-12 w-full rounded-[8px] border border-slate-200 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
                <p className="mt-1 text-xs text-slate-500">{form.metaTitle.length}/70</p>
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-800">
                  {t("fields.keywords", { defaultValue: "Keywords" })}
                </span>
                <input
                  value={form.keywords}
                  onChange={(event) => updateField("keywords", event.target.value)}
                  className="h-12 w-full rounded-[8px] border border-slate-200 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  placeholder="resume, interview, jewelry jobs"
                />
              </label>
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-800">
                  {t("fields.metaDescription", { defaultValue: "Meta description" })}
                </span>
                <textarea
                  value={form.metaDescription}
                  onChange={(event) => updateField("metaDescription", event.target.value)}
                  rows={3}
                  maxLength={180}
                  className="w-full resize-y rounded-[8px] border border-slate-200 p-4 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
                <p className="mt-1 text-right text-xs text-slate-500">{form.metaDescription.length}/180</p>
              </label>
            </div>
          </section>
        </main>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <ImagePlus className="h-5 w-5 text-blue-700" />
              <h2 className="font-black text-slate-950">
                {t("coverImage", { defaultValue: "Cover image" })}
              </h2>
            </div>
            <div className="overflow-hidden rounded-[8px] border border-slate-200 bg-slate-100">
              {(form.image || form.coverImage?.url) ? (
                <img src={getCoverImage(form)} alt={form.title} className="h-48 w-full object-cover" />
              ) : (
                <div className="flex h-48 items-center justify-center text-slate-400">
                  <ImagePlus className="h-10 w-10" />
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleCoverUpload}
              className="hidden"
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-[8px] bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {t("upload", { defaultValue: "Upload" })}
              </button>
              {(form.image || form.coverImage?.url) && (
                <button
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, image: "", coverImage: { url: "", publicId: "", alt: "" } }))}
                  className="flex h-11 w-11 items-center justify-center rounded-[8px] border border-red-200 text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </section>

          <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <CategoryIcon className="h-5 w-5 text-blue-700" />
              <h2 className="font-black text-slate-950">
                {t("publishing", { defaultValue: "Publishing" })}
              </h2>
            </div>
            <label className="flex items-center justify-between gap-3 rounded-[8px] border border-slate-200 p-3">
              <span>
                <span className="block text-sm font-semibold text-slate-900">
                  {t("featurePost", { defaultValue: "Feature post" })}
                </span>
                <span className="text-xs text-slate-500">
                  {t("featurePostHint", { defaultValue: "Show in the landing page carousel." })}
                </span>
              </span>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => updateField("featured", event.target.checked)}
                className="h-5 w-5 rounded border-slate-300 text-blue-700"
              />
            </label>
            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-semibold text-slate-800">
                {t("fields.tags", { defaultValue: "Tags" })}
              </span>
              <input
                value={form.tags}
                onChange={(event) => updateField("tags", event.target.value)}
                className="h-11 w-full rounded-[8px] border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                placeholder="resume, career, interview"
              />
            </label>
          </section>

          <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-blue-700" />
              <h2 className="font-black text-slate-950">
                {t("contentScore", { defaultValue: "Content score" })}
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex justify-between text-sm font-semibold text-slate-700">
                  <span>{t("seoReadiness", { defaultValue: "SEO readiness" })}</span>
                  <span>{seoScore}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500" style={{ width: `${seoScore}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[8px] bg-slate-50 p-3">
                  <FileText className="mb-2 h-4 w-4 text-slate-500" />
                  <p className="text-lg font-black text-slate-950">{readTime}</p>
                  <p className="text-xs text-slate-500">{t("minRead", { defaultValue: "min read" })}</p>
                </div>
                <div className="rounded-[8px] bg-slate-50 p-3">
                  <Sparkles className="mb-2 h-4 w-4 text-slate-500" />
                  <p className="text-lg font-black text-slate-950">
                    {form.tags.split(",").filter((tag) => tag.trim()).length}
                  </p>
                  <p className="text-xs text-slate-500">{t("tags", { defaultValue: "tags" })}</p>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
