import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { toast } from "react-toastify";
import {
  Bold,
  Code2,
  Eye,
  Heading1,
  Heading2,
  Image,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Table,
  Upload,
} from "lucide-react";
import { blogApi } from "../../api/api";

const insertAtSelection = (value, selectionStart, selectionEnd, before, after = "", placeholder = "") => {
  const selected = value.slice(selectionStart, selectionEnd) || placeholder;
  const nextValue = `${value.slice(0, selectionStart)}${before}${selected}${after}${value.slice(selectionEnd)}`;
  const cursor = selectionStart + before.length + selected.length + after.length;
  return { nextValue, cursor };
};

export default function MarkdownEditor({ value, onChange, label, error, t }) {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);

  const applyFormat = (before, after = "", placeholder = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd } = textarea;
    const { nextValue, cursor } = insertAtSelection(value, selectionStart, selectionEnd, before, after, placeholder);
    onChange(nextValue);

    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const toolbar = [
    { icon: Heading1, label: "H1", action: () => applyFormat("# ", "", "Heading") },
    { icon: Heading2, label: "H2", action: () => applyFormat("## ", "", "Section heading") },
    { icon: Bold, label: "Bold", action: () => applyFormat("**", "**", "bold text") },
    { icon: Italic, label: "Italic", action: () => applyFormat("_", "_", "italic text") },
    { icon: List, label: "List", action: () => applyFormat("- ", "", "List item") },
    { icon: ListOrdered, label: "Ordered list", action: () => applyFormat("1. ", "", "List item") },
    { icon: Quote, label: "Quote", action: () => applyFormat("> ", "", "Important quote") },
    { icon: Code2, label: "Code", action: () => applyFormat("```\n", "\n```", "const example = true;") },
    { icon: LinkIcon, label: "Link", action: () => applyFormat("[", "](https://example.com)", "link text") },
    { icon: Image, label: "Image", action: () => applyFormat("![", "](https://image-url.com/image.jpg)", "image alt") },
    {
      icon: Table,
      label: "Table",
      action: () =>
        applyFormat(
          "",
          "",
          "| Skill | Focus |\n| --- | --- |\n| Resume | Metrics |\n| Interview | Stories |"
        ),
    },
  ];

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", file);
      const response = await blogApi.post("/upload-image", formData);

      const uploadData = response.data.data || response.data;
      const url = uploadData.imageUrl || uploadData.coverImage?.url;
      if (url) {
        applyFormat("", "", `![${file.name.replace(/\.[^.]+$/, "")}](${url})`);
        toast.success(t ? t("imageUploaded", { defaultValue: "Image uploaded." }) : "Image uploaded.");
      }
    } catch (uploadError) {
      toast.error(uploadError.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        {label && <label className="text-sm font-semibold text-slate-800">{label}</label>}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <Upload className="h-3.5 w-3.5" />
            {uploading
              ? t
                ? t("uploading", { defaultValue: "Uploading..." })
                : "Uploading..."
              : t
                ? t("uploadImage", { defaultValue: "Upload image" })
                : "Upload image"}
          </button>
          <button
            type="button"
            onClick={() => setPreview((current) => !current)}
            className="inline-flex items-center gap-1.5 rounded-[8px] bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
          >
            <Eye className="h-3.5 w-3.5" />
            {preview
              ? t
                ? t("write", { defaultValue: "Write" })
                : "Write"
              : t
                ? t("preview", { defaultValue: "Preview" })
                : "Preview"}
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleImageUpload}
        className="hidden"
      />

      <div className="overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm">
        {!preview && (
          <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2">
            {toolbar.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.action}
                  title={item.label}
                  className="flex h-9 w-9 items-center justify-center rounded-[8px] text-slate-600 transition hover:bg-white hover:text-slate-950 hover:shadow-sm"
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        )}

        {preview ? (
          <div className="blog-prose min-h-[420px] bg-white p-5">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {value || (t ? t("previewEmpty", { defaultValue: "Nothing to preview yet." }) : "Nothing to preview yet.")}
            </ReactMarkdown>
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            rows={18}
            placeholder={
              t
                ? t("editorPlaceholder", {
                    defaultValue: "Write with markdown. Add headings, tables, quotes, code blocks, and inline images.",
                  })
                : "Write with markdown. Add headings, tables, quotes, code blocks, and inline images."
            }
            className="min-h-[420px] w-full resize-y border-0 bg-white p-5 font-mono text-sm leading-7 text-slate-800 outline-none placeholder:text-slate-400"
          />
        )}
      </div>
      {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}
