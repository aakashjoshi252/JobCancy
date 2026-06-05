import { Mail, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

export default function NewsletterBox({ t, compact = false }) {
  const [email, setEmail] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim()) return;

    toast.success(t ? t("newsletterSaved", { defaultValue: "You are subscribed to blog updates." }) : "You are subscribed to blog updates.");
    setEmail("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-[8px] border border-slate-200 bg-slate-950 p-5 text-white shadow-xl shadow-slate-950/10 ${
        compact ? "" : "sm:p-7"
      }`}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-white/10">
        <Mail className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-xl font-black">
        {t ? t("newsletterTitle", { defaultValue: "Get sharper career reads" }) : "Get sharper career reads"}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">
        {t
          ? t("newsletterText", {
              defaultValue: "Weekly hiring trends, interview playbooks, and resume ideas in one concise email.",
            })
          : "Weekly hiring trends, interview playbooks, and resume ideas in one concise email."}
      </p>
      <div className="mt-5 flex gap-2">
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          required
          placeholder={t ? t("emailPlaceholder", { defaultValue: "you@example.com" }) : "you@example.com"}
          className="h-11 min-w-0 flex-1 rounded-[8px] border border-white/15 bg-white/10 px-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-blue-300"
        />
        <button
          type="submit"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] bg-white text-slate-950 transition hover:bg-blue-100"
          aria-label={t ? t("subscribe", { defaultValue: "Subscribe" }) : "Subscribe"}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
