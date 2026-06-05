import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";
import { blogApi } from "../../api/api";

const getAvatar = (user) =>
  user?.profileImage?.url ||
  user?.profilePicture ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "User")}&background=0f172a&color=fff`;

export default function CommentSection({ blogId, t }) {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await blogApi.get(`/${blogId}/comments`, { skipAuthRedirect: true });
        if (isMounted) setComments(response.data.data?.comments || response.data.comments || []);
      } catch (error) {
        console.error("Failed to load comments", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (blogId) fetchComments();

    return () => {
      isMounted = false;
    };
  }, [blogId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user || !token) {
      toast.info(t ? t("loginToComment", { defaultValue: "Please login to comment." }) : "Please login to comment.");
      navigate("/login");
      return;
    }

    if (!comment.trim()) return;

    try {
      setSubmitting(true);
      const response = await blogApi.post(`/${blogId}/comments`, { content: comment.trim() });
      setComments((prev) => [response.data.data?.comment || response.data.comment, ...prev]);
      setComment("");
      toast.success(t ? t("commentAdded", { defaultValue: "Comment added." }) : "Comment added.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      setDeletingId(commentId);
      await blogApi.delete(`/${blogId}/comments/${commentId}`);
      setComments((prev) => prev.filter((item) => item._id !== commentId));
      toast.success(t ? t("commentDeleted", { defaultValue: "Comment deleted." }) : "Comment deleted.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete comment");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="mt-12 rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-7">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-blue-50 text-blue-700">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-950 dark:text-white">
            {t ? t("comments", { defaultValue: "Comments" }) : "Comments"}
          </h2>
          <p className="text-sm text-slate-500">
            {comments.length} {t ? t("responses", { defaultValue: "responses" }) : "responses"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={4}
          placeholder={
            t ? t("commentPlaceholder", { defaultValue: "Share a thoughtful response..." }) : "Share a thoughtful response..."
          }
          className="w-full resize-none rounded-[8px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
        />
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={submitting || !comment.trim()}
            className="inline-flex items-center gap-2 rounded-[8px] bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {submitting
              ? t
                ? t("posting", { defaultValue: "Posting..." })
                : "Posting..."
              : t
                ? t("postComment", { defaultValue: "Post comment" })
                : "Post comment"}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/4 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length ? (
        <div className="space-y-4">
          {comments.map((item) => {
            const itemUser = item.userId || {};
            const canDelete = user?.role === "admin" || user?._id === itemUser?._id;

            return (
              <article key={item._id} className="rounded-[8px] border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <img
                      src={getAvatar(itemUser)}
                      alt={itemUser.username || "User"}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-slate-900">{itemUser.username || "User"}</p>
                      <p className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(item._id)}
                      disabled={deletingId === item._id}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      aria-label="Delete comment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">{item.content}</p>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[8px] border border-dashed border-slate-200 p-8 text-center">
          <p className="font-semibold text-slate-700">
            {t ? t("noComments", { defaultValue: "No comments yet." }) : "No comments yet."}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {t
              ? t("startConversation", { defaultValue: "Start the conversation with a useful thought." })
              : "Start the conversation with a useful thought."}
          </p>
        </div>
      )}
    </section>
  );
}
