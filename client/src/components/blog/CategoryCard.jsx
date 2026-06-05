import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { getBlogCategory } from "./blogConfig";

export default function CategoryCard({ category, active, onClick, t, index = 0 }) {
  const meta = getBlogCategory(category?.key || category?.slug || category, t);
  const Icon = meta.icon;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.035, 0.2) }}
      className={`group min-h-[150px] rounded-[8px] border p-4 text-left transition duration-300 ${
        active
          ? "border-slate-900 bg-slate-950 text-white shadow-xl shadow-slate-950/15"
          : "border-slate-200 bg-white text-slate-950 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950 dark:text-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-[8px] border ${
            active ? "border-white/15 bg-white/10 text-white" : meta.className
          }`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <ArrowRight
          className={`h-4 w-4 transition group-hover:translate-x-1 ${
            active ? "text-white" : "text-slate-400"
          }`}
        />
      </div>
      <h3 className="mt-4 text-base font-bold">{category?.name || meta.label}</h3>
      <p className={`mt-2 line-clamp-2 text-sm leading-5 ${active ? "text-slate-300" : "text-slate-500"}`}>
        {category?.description || meta.description}
      </p>
      <p className={`mt-4 text-xs font-semibold ${active ? "text-white" : "text-slate-500"}`}>
        {category?.count || 0} {t ? t("articles", { defaultValue: "articles" }) : "articles"}
      </p>
    </motion.button>
  );
}
