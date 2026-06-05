import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Newspaper, Rss, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { blogApi } from "../../../api/api";
import { useDebounce } from "../../../hooks/useDebounce";
import BlogHero from "../../../components/blog/BlogHero";
import BlogGrid from "../../../components/blog/BlogGrid";
import BlogFilters from "../../../components/blog/BlogFilters";
import BlogSidebar from "../../../components/blog/BlogSidebar";
import CategoryCard from "../../../components/blog/CategoryCard";
import FeaturedBlogCard from "../../../components/blog/FeaturedBlogCard";
import NewsletterBox from "../../../components/blog/NewsletterBox";
import { blogCategoryMeta, getBlogPath } from "../../../components/blog/blogConfig";

const emptyStats = {
  totalViews: 0,
  totalLikes: 0,
  totalArticles: 0,
};

export default function EnhancedBlogList() {
  const { t } = useTranslation("blog");
  const [searchParams, setSearchParams] = useSearchParams();

  const [blogs, setBlogs] = useState([]);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [trendingBlogs, setTrendingBlogs] = useState([]);
  const [popularBlogs, setPopularBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedTag, setSelectedTag] = useState(searchParams.get("tag") || "all");
  const [sort, setSort] = useState(searchParams.get("sort") || "latest");
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));
  const [activeSlide, setActiveSlide] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const debouncedSearch = useDebounce(heroSearch, 350);

  const displayCategories = useMemo(() => {
    if (categories.length) return categories;
    return blogCategoryMeta.slice(0, 11).map((category) => ({
      key: category.key,
      name: t(category.nameKey, { defaultValue: category.fallbackName }),
      description: t(category.descriptionKey, { defaultValue: category.fallbackDescription }),
      count: 0,
    }));
  }, [categories, t]);

  const trendingKeywords = useMemo(() => {
    const tagNames = tags.map((item) => item.tag || item).slice(0, 5);
    return tagNames.length
      ? tagNames
      : ["resume", "interview", "remote jobs", "AI skills", "jewelry careers"];
  }, [tags]);

  const stats = useMemo(() => {
    const source = blogs.length ? blogs : [...featuredBlogs, ...trendingBlogs];
    if (!source.length) return emptyStats;

    return {
      totalArticles: pagination?.total || source.length,
      totalViews: source.reduce((sum, blog) => sum + (blog.views || 0), 0),
      totalLikes: source.reduce((sum, blog) => sum + (blog.likes || 0), 0),
    };
  }, [blogs, featuredBlogs, pagination?.total, trendingBlogs]);

  const heroBlog = featuredBlogs[activeSlide] || featuredBlogs[0] || trendingBlogs[0] || blogs[0];
  const recentBlogs = useMemo(() => blogs.slice(0, 5), [blogs]);

  useEffect(() => {
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (selectedCategory !== "all") params.category = selectedCategory;
    if (selectedTag !== "all") params.tag = selectedTag;
    if (sort !== "latest") params.sort = sort;
    if (page > 1) params.page = page;
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, selectedCategory, selectedTag, sort, page, setSearchParams]);

  useEffect(() => {
    let isMounted = true;

    const fetchMeta = async () => {
      try {
        const [categoryResponse, tagsResponse, featuredResponse, trendingResponse, popularResponse] =
          await Promise.allSettled([
            blogApi.get("/categories", { skipAuthRedirect: true }),
            blogApi.get("/tags", { skipAuthRedirect: true }),
            blogApi.get("/featured", { params: { limit: 6 }, skipAuthRedirect: true }),
            blogApi.get("/trending", { params: { limit: 8 }, skipAuthRedirect: true }),
            blogApi.get("/popular", { params: { limit: 6 }, skipAuthRedirect: true }),
          ]);

        if (!isMounted) return;
        const categoryData = categoryResponse.status === "fulfilled" ? categoryResponse.value.data : {};
        const tagData = tagsResponse.status === "fulfilled" ? tagsResponse.value.data : {};
        const featuredData = featuredResponse.status === "fulfilled" ? featuredResponse.value.data : {};
        const trendingData = trendingResponse.status === "fulfilled" ? trendingResponse.value.data : {};
        const popularData = popularResponse.status === "fulfilled" ? popularResponse.value.data : {};
        setCategories(categoryData.data?.categories || categoryData.categories || []);
        setTags(tagData.data?.tags || tagData.tags || []);
        setFeaturedBlogs(featuredData.data?.blogs || featuredData.blogs || []);
        setTrendingBlogs(trendingData.data?.blogs || trendingData.blogs || []);
        setPopularBlogs(popularData.data?.blogs || popularData.blogs || []);
      } catch (error) {
        console.error("Blog metadata load failed", error);
      }
    };

    fetchMeta();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await blogApi.get("/", {
          params: {
            page,
            limit: 9,
            sort,
            ...(selectedCategory !== "all" ? { category: selectedCategory } : {}),
            ...(selectedTag !== "all" ? { tag: selectedTag } : {}),
            ...(debouncedSearch ? { search: debouncedSearch } : {}),
          },
          skipAuthRedirect: true,
        });

        if (!isMounted) return;
        setBlogs(response.data.data?.blogs || response.data.blogs || []);
        setPagination(response.data.data?.pagination || response.data.pagination || null);
      } catch (error) {
        console.error("Blog load failed", error);
        if (isMounted) {
          setBlogs([]);
          toast.error(error.response?.data?.message || t("loadFailed", { defaultValue: "Failed to load blogs." }));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBlogs();

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, page, selectedCategory, selectedTag, sort, t]);

  useEffect(() => {
    if (featuredBlogs.length < 2) return undefined;
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % featuredBlogs.length);
    }, 6000);
    return () => window.clearInterval(interval);
  }, [featuredBlogs.length]);

  const resetFilters = useCallback(() => {
    setHeroSearch("");
    setSelectedCategory("all");
    setSelectedTag("all");
    setSort("latest");
    setPage(1);
  }, []);

  const changeCategory = (category) => {
    setSelectedCategory(category);
    setPage(1);
    setShowMobileFilters(false);
  };

  const changeTag = (tag) => {
    setSelectedTag(tag);
    setPage(1);
    setShowMobileFilters(false);
  };

  const changeSort = (value) => {
    setSort(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <BlogHero
        featuredBlog={heroBlog}
        searchValue={heroSearch}
        onSearchChange={(value) => {
          setHeroSearch(value);
          setPage(1);
        }}
        onSearchClear={() => setHeroSearch("")}
        categories={displayCategories}
        onCategoryChange={changeCategory}
        trendingKeywords={trendingKeywords}
        t={t}
      />

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          {
            icon: Newspaper,
            label: t("stats.articles", { defaultValue: "Articles" }),
            value: stats.totalArticles,
          },
          {
            icon: TrendingUp,
            label: t("stats.views", { defaultValue: "Views tracked" }),
            value: stats.totalViews.toLocaleString(),
          },
          {
            icon: Sparkles,
            label: t("stats.likes", { defaultValue: "Reader likes" }),
            value: stats.totalLikes.toLocaleString(),
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-blue-50 text-blue-700">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-2xl font-black text-slate-950 dark:text-white">{item.value}</p>
                  <p className="text-sm font-medium text-slate-500">{item.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="mt-10">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              {t("categoriesEyebrow", { defaultValue: "Browse by focus" })}
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
              {t("categoriesHeading", { defaultValue: "Career categories built for action" })}
            </h2>
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            {t("viewAll", { defaultValue: "View all" })}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {displayCategories.slice(0, 8).map((category, index) => (
            <CategoryCard
              key={category.key || category.slug}
              category={category}
              active={selectedCategory === (category.key || category.slug)}
              onClick={() => changeCategory(category.key || category.slug)}
              t={t}
              index={index}
            />
          ))}
        </div>
      </section>

      {featuredBlogs.length > 0 && (
        <section className="mt-12">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                {t("featuredEyebrow", { defaultValue: "Editor's shelf" })}
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
                {t("featuredHeading", { defaultValue: "Featured reads for this week" })}
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveSlide((current) => (current - 1 + featuredBlogs.length) % featuredBlogs.length)}
                className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
                aria-label="Previous featured blog"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setActiveSlide((current) => (current + 1) % featuredBlogs.length)}
                className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
                aria-label="Next featured blog"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
            <FeaturedBlogCard blog={featuredBlogs[activeSlide]} active t={t} />
            <div className="grid gap-4">
              {featuredBlogs.slice(0, 3).map((blog, index) => (
                <button
                  type="button"
                  key={blog._id || blog.slug}
                  onClick={() => setActiveSlide(index)}
                  className={`rounded-[8px] border p-4 text-left transition ${
                    activeSlide === index
                      ? "border-slate-950 bg-white shadow-lg"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
                    {t("featured", { defaultValue: "Featured" })} {index + 1}
                  </p>
                  <h3 className="mt-2 line-clamp-2 font-bold text-slate-950">{blog.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">{blog.excerpt || blog.description}</p>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mt-12 grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <BlogFilters
            categories={displayCategories}
            selectedCategory={selectedCategory}
            selectedTag={selectedTag}
            tags={tags}
            sort={sort}
            onCategoryChange={changeCategory}
            onTagChange={changeTag}
            onSortChange={changeSort}
            onReset={resetFilters}
            showMobileFilters={showMobileFilters}
            onToggleMobileFilters={() => setShowMobileFilters((current) => !current)}
            t={t}
          />

          <div className="flex flex-col gap-3 rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                {t("latestEyebrow", { defaultValue: "Latest articles" })}
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">
                {loading
                  ? t("updatingResults", { defaultValue: "Updating results..." })
                  : t("showingArticles", {
                      defaultValue: "{{count}} articles found",
                      count: pagination?.total || blogs.length,
                    })}
              </h2>
            </div>
            <Link
              to={heroBlog ? getBlogPath(heroBlog) : "/blogs"}
              className="inline-flex items-center gap-2 rounded-[8px] bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Rss className="h-4 w-4" />
              {t("startReading", { defaultValue: "Start reading" })}
            </Link>
          </div>

          {blogs.length || loading ? (
            <BlogGrid blogs={blogs} loading={loading} t={t} />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[8px] border border-dashed border-slate-300 bg-white p-10 text-center"
            >
              <Newspaper className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-xl font-black text-slate-950">
                {t("emptyTitle", { defaultValue: "No articles found" })}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {t("emptyText", { defaultValue: "Try another search, category, or tag filter." })}
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 rounded-[8px] bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
              >
                {t("clearFilters", { defaultValue: "Clear filters" })}
              </button>
            </motion.div>
          )}

          {pagination?.pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-700 disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <span className="px-3 text-sm font-semibold text-slate-600">
                {t("pageOf", {
                  defaultValue: "Page {{page}} of {{pages}}",
                  page,
                  pages: pagination.pages,
                })}
              </span>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(pagination.pages, current + 1))}
                disabled={page === pagination.pages}
                className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-700 disabled:opacity-40"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <BlogSidebar
          popular={popularBlogs.length ? popularBlogs : trendingBlogs}
          recent={recentBlogs}
          categories={displayCategories}
          tags={tags}
          t={t}
        />
      </section>

      <section className="mt-12">
        <NewsletterBox t={t} />
      </section>
    </div>
  );
}
