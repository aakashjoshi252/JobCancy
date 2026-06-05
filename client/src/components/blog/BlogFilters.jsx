import { Filter, SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { getBlogCategory, sortOptions } from "./blogConfig";

export default function BlogFilters({
  categories = [],
  selectedCategory,
  selectedTag,
  tags = [],
  sort,
  onCategoryChange,
  onTagChange,
  onSortChange,
  onReset,
  showMobileFilters,
  onToggleMobileFilters,
  t,
}) {
  const content = (
    <div className="space-y-5">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            {t ? t("filterByCategory", { defaultValue: "Filter by category" }) : "Filter by category"}
          </p>
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900"
          >
            {t ? t("reset", { defaultValue: "Reset" }) : "Reset"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onCategoryChange("all")}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              selectedCategory === "all"
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            {t ? t("allCategories", { defaultValue: "All categories" }) : "All categories"}
          </button>
          {categories.map((category) => {
            const meta = getBlogCategory(category.key || category.slug, t);
            const Icon = meta.icon;
            const isActive = selectedCategory === (category.key || category.slug);

            return (
              <button
                key={category.key || category.slug}
                type="button"
                onClick={() => onCategoryChange(category.key || category.slug)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "border-slate-950 bg-slate-950 text-white"
                    : `${meta.className} hover:brightness-95`
                }`}
              >
                <Icon className="h-4 w-4" />
                {category.name || meta.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            {t ? t("popularTags", { defaultValue: "Popular tags" }) : "Popular tags"}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onTagChange("all")}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                selectedTag === "all"
                  ? "border-blue-700 bg-blue-700 text-white"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              {t ? t("allTags", { defaultValue: "All tags" }) : "All tags"}
            </button>
            {tags.slice(0, 14).map((item) => {
              const tag = item.tag || item;
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => onTagChange(tag)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    selectedTag === tag
                      ? "border-blue-700 bg-blue-700 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50"
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>
        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            {t ? t("sortBy", { defaultValue: "Sort by" }) : "Sort by"}
          </span>
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
            className="h-11 w-full rounded-[8px] border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {t ? t(option.labelKey, { defaultValue: option.fallback }) : option.fallback}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm lg:block">
        {content}
      </div>

      <button
        type="button"
        onClick={onToggleMobileFilters}
        className="inline-flex items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        {t ? t("filters", { defaultValue: "Filters" }) : "Filters"}
      </button>

      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/60 p-4 backdrop-blur-sm lg:hidden"
          >
            <motion.div
              initial={{ y: 28, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 28, opacity: 0 }}
              className="max-h-[88vh] overflow-y-auto rounded-[8px] bg-white p-5 shadow-2xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-700" />
                  <h2 className="text-lg font-bold text-slate-950">
                    {t ? t("filters", { defaultValue: "Filters" }) : "Filters"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onToggleMobileFilters}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600"
                  aria-label="Close filters"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {content}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
