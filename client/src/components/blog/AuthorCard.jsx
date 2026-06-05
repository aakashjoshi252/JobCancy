import { ExternalLink, MapPin, UserRoundPlus } from "lucide-react";
import { getAuthorAvatar, getAuthorName } from "./blogConfig";

export default function AuthorCard({ blog, t }) {
  const author = blog?.authorId || {};
  const company = blog?.companyId || {};
  const avatar = getAuthorAvatar(blog);

  return (
    <aside className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start gap-4">
        {avatar ? (
          <img
            src={avatar}
            alt={getAuthorName(blog)}
            className="h-14 w-14 rounded-full border border-slate-100 object-cover shadow-sm"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-lg font-black text-white">
            {getAuthorName(blog).slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {t ? t("writtenBy", { defaultValue: "Written by" }) : "Written by"}
          </p>
          <h3 className="truncate text-lg font-bold text-slate-950 dark:text-white">{getAuthorName(blog)}</h3>
          {author?.bio && <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{author.bio}</p>}
        </div>
      </div>

      {(company?.companyName || company?.location || company?.website) && (
        <div className="mt-5 rounded-[8px] bg-slate-50 p-4 dark:bg-slate-900">
          {company?.companyName && (
            <p className="text-sm font-bold text-slate-900 dark:text-white">{company.companyName}</p>
          )}
          {company?.location && (
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="h-4 w-4" />
              {company.location}
            </p>
          )}
          {company?.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-700"
            >
              {t ? t("visitWebsite", { defaultValue: "Visit website" }) : "Visit website"}
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      )}

      <button
        type="button"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[8px] border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      >
        <UserRoundPlus className="h-4 w-4" />
        {t ? t("followAuthor", { defaultValue: "Follow author" }) : "Follow author"}
      </button>
    </aside>
  );
}
