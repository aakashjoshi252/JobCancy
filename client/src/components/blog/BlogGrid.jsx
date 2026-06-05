import BlogCard from "./BlogCard";

export function BlogGridSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm">
          <div className="h-56 animate-pulse bg-slate-200" />
          <div className="space-y-4 p-5">
            <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
            <div className="h-6 w-5/6 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BlogGrid({ blogs = [], loading, t }) {
  if (loading) return <BlogGridSkeleton />;

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {blogs.map((blog, index) => (
        <BlogCard key={blog._id || blog.slug} blog={blog} index={index} t={t} />
      ))}
    </div>
  );
}
