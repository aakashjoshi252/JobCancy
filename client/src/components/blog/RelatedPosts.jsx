import BlogCard from "./BlogCard";

export default function RelatedPosts({ blogs = [], t }) {
  if (!blogs.length) return null;

  return (
    <section className="mt-12">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
            {t ? t("keepReading", { defaultValue: "Keep reading" }) : "Keep reading"}
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
            {t ? t("relatedPosts", { defaultValue: "Related posts" }) : "Related posts"}
          </h2>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {blogs.slice(0, 3).map((blog, index) => (
          <BlogCard key={blog._id || blog.slug} blog={blog} index={index} compact t={t} />
        ))}
      </div>
    </section>
  );
}
