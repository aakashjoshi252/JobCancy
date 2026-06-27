import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {
  ArrowLeft,
  Bookmark,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Copy,
  Eye,
  Heart,
  Home,
  Link as LinkIcon,
  MessageCircle,
  Share2,
} from "lucide-react";
import { blogApi } from "../../../api/api";
import AuthorCard from "../../../components/blog/AuthorCard";
import CommentSection from "../../../components/blog/CommentSection";
import RelatedPosts from "../../../components/blog/RelatedPosts";
import {
  estimateReadingTime,
  formatCount,
  getAuthorName,
  getBlogCategory,
  getBlogPath,
  getCoverImage,
  stripMarkdown,
} from "../../../components/blog/blogConfig";

const slugify = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const isObjectId = (value = "") => /^[a-f\d]{24}$/i.test(value);

const parseHeadings = (content = "") =>
  content
    .split("\n")
    .map((line) => {
      const match = line.match(/^(#{2,3})\s+(.+)$/);
      if (!match) return null;
      const text = match[2].replace(/[#*_`]/g, "").trim();
      return {
        level: match[1].length,
        text,
        id: slugify(text),
      };
    })
    .filter(Boolean);

const setMetaTag = (selector, attributes) => {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    Object.entries(attributes.identity || {}).forEach(([key, value]) => element.setAttribute(key, value));
    document.head.appendChild(element);
  }
  Object.entries(attributes.values || {}).forEach(([key, value]) => element.setAttribute(key, value));
};

export default function BlogDetails() {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("blog");
  const { user, token } = useSelector((state) => state.auth);

  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const headings = useMemo(() => parseHeadings(blog?.content), [blog?.content]);
  const category = getBlogCategory(blog?.category, t);
  const CategoryIcon = category.icon;
  const readTime = blog?.readingTime || estimateReadingTime(blog?.content);
  const coverImage = getCoverImage(blog);
  const articleUrl = typeof window !== "undefined" ? `${window.location.origin}${getBlogPath(blog || { _id: blogId })}` : "";

  useEffect(() => {
    let isMounted = true;

    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError(null);
        const detailPath = isObjectId(blogId) ? `/${blogId}` : `/slug/${blogId}`;
        const response = await blogApi.get(detailPath, {
          skipAuthRedirect: true,
          ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
        });
        const blogData = response.data.data?.blog || response.data.blog;
        if (!isMounted) return;
        setBlog(blogData);
        setIsLiked(Boolean(blogData.isLiked));
        setIsBookmarked(Boolean(blogData.isBookmarked));
        setLikeCount(blogData.likes || 0);
        setBookmarkCount(blogData.bookmarks || 0);
      } catch (fetchError) {
        console.error("Blog detail load failed", fetchError);
        if (isMounted) {
          setError(fetchError.response?.data?.message || t("detailLoadFailed", { defaultValue: "Blog not found." }));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBlog();

    return () => {
      isMounted = false;
    };
  }, [blogId, t, token]);

  useEffect(() => {
    let isMounted = true;

    const fetchRelated = async () => {
      if (!blog?._id) return;
      try {
        const response = await blogApi.get(`/related/${blog._id}`, {
          params: { limit: 3 },
          skipAuthRedirect: true,
        });
        if (isMounted) setRelatedBlogs(response.data.data?.blogs || response.data.blogs || []);
      } catch (relatedError) {
        console.error("Related blogs failed", relatedError);
      }
    };

    fetchRelated();

    return () => {
      isMounted = false;
    };
  }, [blog?._id]);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!blog) return undefined;

    const title = blog.seo?.metaTitle || blog.title;
    const description = blog.seo?.metaDescription || blog.excerpt || blog.description;
    const image = coverImage;

    document.title = `${title} | JewelCancy Blog`;
    setMetaTag('meta[name="description"]', {
      identity: { name: "description" },
      values: { content: description },
    });
    setMetaTag('meta[property="og:title"]', {
      identity: { property: "og:title" },
      values: { content: title },
    });
    setMetaTag('meta[property="og:description"]', {
      identity: { property: "og:description" },
      values: { content: description },
    });
    setMetaTag('meta[property="og:image"]', {
      identity: { property: "og:image" },
      values: { content: image },
    });
    setMetaTag('meta[property="og:type"]', {
      identity: { property: "og:type" },
      values: { content: "article" },
    });
    setMetaTag('meta[name="twitter:card"]', {
      identity: { name: "twitter:card" },
      values: { content: "summary_large_image" },
    });
    setMetaTag('meta[name="twitter:title"]', {
      identity: { name: "twitter:title" },
      values: { content: title },
    });
    setMetaTag('meta[name="twitter:description"]', {
      identity: { name: "twitter:description" },
      values: { content: description },
    });
    setMetaTag('meta[name="twitter:image"]', {
      identity: { name: "twitter:image" },
      values: { content: image },
    });

    const structuredData = document.createElement("script");
    structuredData.type = "application/ld+json";
    structuredData.dataset.blogStructuredData = "true";
    structuredData.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: blog.title,
      description,
      image,
      datePublished: blog.publishedAt || blog.createdAt,
      dateModified: blog.updatedAt,
      author: {
        "@type": "Person",
        name: getAuthorName(blog),
      },
      publisher: {
        "@type": "Organization",
        name: "JewelCancy",
      },
      mainEntityOfPage: articleUrl,
    });
    document.head.querySelector('script[data-blog-structured-data="true"]')?.remove();
    document.head.appendChild(structuredData);

    return () => {
      structuredData.remove();
    };
  }, [articleUrl, blog, coverImage]);

  const requireAuth = useCallback(() => {
    if (user && token) return true;
    toast.info(t("loginRequired", { defaultValue: "Please login to continue." }));
    navigate("/login");
    return false;
  }, [navigate, t, token, user]);

  const handleLike = async () => {
    if (!requireAuth()) return;
    try {
      const response = await blogApi.post(`/${blog._id}/like`);
      setIsLiked(response.data.data?.isLiked ?? response.data.isLiked);
      setLikeCount(response.data.data?.likes ?? response.data.likes);
    } catch (likeError) {
      toast.error(likeError.response?.data?.message || "Failed to update like");
    }
  };

  const handleBookmark = async () => {
    if (!requireAuth()) return;
    try {
      const response = await blogApi.post(`/${blog._id}/bookmark`);
      setIsBookmarked(response.data.data?.isBookmarked ?? response.data.isBookmarked);
      setBookmarkCount(response.data.data?.bookmarks ?? response.data.bookmarks);
    } catch (bookmarkError) {
      toast.error(bookmarkError.response?.data?.message || "Failed to update bookmark");
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt || blog.description,
          url: articleUrl,
        });
      } else {
        await navigator.clipboard.writeText(articleUrl);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
        toast.success(t("linkCopied", { defaultValue: "Link copied." }));
      }
      await blogApi.post(`/${blog._id}/share`, {}, { skipAuthRedirect: true });
    } catch (shareError) {
      if (shareError.name !== "AbortError") {
        toast.error(t("shareFailed", { defaultValue: "Unable to share this article." }));
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="h-[420px] animate-pulse rounded-[8px] bg-slate-200" />
          <div className="mx-auto mt-8 max-w-3xl space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-20">
        <div className="mx-auto max-w-md rounded-[8px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-slate-950">
            {t("notFoundTitle", { defaultValue: "Article unavailable" })}
          </h1>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/blogs")}
            className="mt-6 inline-flex items-center gap-2 rounded-[8px] bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backToBlog", { defaultValue: "Back to blog" })}
          </button>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="fixed left-0 top-0 z-50 h-1 bg-blue-600 transition-all" style={{ width: `${progress}%` }} />

      <section className="relative overflow-hidden rounded-[8px] bg-slate-950 text-white">
        <img src={coverImage} alt={blog.coverImage?.alt || blog.title} className="absolute inset-0 h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/20" />
        <div className="relative px-5 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
          <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-slate-200">
            <Link to="/" className="inline-flex items-center gap-1 hover:text-white">
              <Home className="h-4 w-4" />
              {t("home", { defaultValue: "Home" })}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/blogs" className="hover:text-white">
              {t("blog", { defaultValue: "Blog" })}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="line-clamp-1 max-w-[260px] text-white">{blog.title}</span>
          </nav>

          <div className="max-w-4xl">
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${category.className}`}>
              <CategoryIcon className="h-4 w-4" />
              {category.label}
            </span>
            <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">{blog.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">{blog.excerpt || blog.description}</p>
            <div className="mt-7 flex flex-wrap items-center gap-4 text-sm font-medium text-slate-200">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {format(new Date(blog.publishedAt || blog.createdAt), "MMM d, yyyy")}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                {readTime} {t("minRead", { defaultValue: "min read" })}
              </span>
              <span className="inline-flex items-center gap-2">
                <Eye className="h-4 w-4" />
                {formatCount(blog.views)} {t("views", { defaultValue: "views" })}
              </span>
              <span className="inline-flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                {formatCount(blog.commentsCount)} {t("comments", { defaultValue: "comments" })}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-7 lg:grid-cols-[280px_minmax(0,1fr)_300px]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-5">
            <button
              type="button"
              onClick={() => navigate("/blogs")}
              className="inline-flex items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("backToBlog", { defaultValue: "Back to blog" })}
            </button>
            {headings.length > 0 && (
              <nav className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                  {t("tableOfContents", { defaultValue: "Contents" })}
                </p>
                <div className="space-y-2">
                  {headings.map((heading) => (
                    <a
                      key={`${heading.id}-${heading.text}`}
                      href={`#${heading.id}`}
                      className={`block text-sm font-semibold leading-5 text-slate-600 transition hover:text-blue-700 ${
                        heading.level === 3 ? "pl-4" : ""
                      }`}
                    >
                      {heading.text}
                    </a>
                  ))}
                </div>
              </nav>
            )}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-slate-600">
              {t("byline", {
                defaultValue: "By {{author}}",
                author: getAuthorName(blog),
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleLike}
                className={`inline-flex items-center gap-2 rounded-[8px] px-4 py-2 text-sm font-semibold transition ${
                  isLiked
                    ? "bg-red-600 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-red-50 hover:text-red-600"
                }`}
              >
                <Heart className="h-4 w-4" />
                {formatCount(likeCount)}
              </button>
              <button
                type="button"
                onClick={handleBookmark}
                className={`inline-flex items-center gap-2 rounded-[8px] px-4 py-2 text-sm font-semibold transition ${
                  isBookmarked
                    ? "bg-amber-500 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-amber-50 hover:text-amber-700"
                }`}
              >
                <Bookmark className="h-4 w-4" />
                {formatCount(bookmarkCount)}
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                {copied ? t("copied", { defaultValue: "Copied" }) : t("share", { defaultValue: "Share" })}
              </button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="blog-prose rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm sm:p-8 lg:p-10"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                h2: ({ children }) => {
                  const text = stripMarkdown(String(children));
                  return <h2 id={slugify(text)}>{children}</h2>;
                },
                h3: ({ children }) => {
                  const text = stripMarkdown(String(children));
                  return <h3 id={slugify(text)}>{children}</h3>;
                },
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noreferrer">
                    {children}
                  </a>
                ),
                img: ({ src, alt }) => <img src={src} alt={alt || ""} loading="lazy" />,
              }}
            >
              {blog.content}
            </ReactMarkdown>
          </motion.div>

          {blog.tags?.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/blogs?tag=${tag}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          <RelatedPosts blogs={relatedBlogs} t={t} />
          <CommentSection blogId={blog._id} t={t} />
        </main>

        <aside className="space-y-5">
          <div className="lg:sticky lg:top-24 lg:space-y-5">
            <AuthorCard blog={blog} t={t} />
            <div className="mt-5 rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm lg:mt-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                {t("quickActions", { defaultValue: "Quick actions" })}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Heart, label: t("like", { defaultValue: "Like" }), onClick: handleLike },
                  { icon: Bookmark, label: t("save", { defaultValue: "Save" }), onClick: handleBookmark },
                  { icon: Copy, label: t("copy", { defaultValue: "Copy" }), onClick: handleShare },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      type="button"
                      key={item.label}
                      onClick={item.onClick}
                      className="flex flex-col items-center gap-2 rounded-[8px] border border-slate-200 p-3 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
