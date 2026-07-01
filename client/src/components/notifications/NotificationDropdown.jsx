import { useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { BiBell, BiCheck, BiCheckDouble, BiTrash, BiX } from "react-icons/bi";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  deleteNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../redux/slices/notificationSlice";
import { getNotificationLink, getNotificationTone } from "../../utils/notificationLinks";
import { getNotificationText } from "../../utils/notificationsI18n";

const roleNotificationPath = (role) =>
  role === "candidate"
    ? "/candidate/notifications"
    : role === "recruiter"
      ? "/recruiter/notifications"
      : role === "admin"
        ? "/admin/notifications"
        : "/notifications";

const NotificationDropdown = ({ onClose }) => {
  const { t } = useTranslation(["notifications", "common", "errors"]);
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);
  const { items, loading, error, unreadCount } = useSelector((state) => state.notifications);
  const user = useSelector((state) => state.auth.user);
  const notifications = items.slice(0, 5);

  useEffect(() => {
    dispatch(fetchNotifications({ limit: 5, page: 1 }));
  }, [dispatch]);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleOpenNotification = (notification) => {
    if (!notification.isRead) {
      dispatch(markNotificationRead(notification._id));
    }
    onClose?.();
  };

  const handleDelete = (event, notification) => {
    event.preventDefault();
    event.stopPropagation();
    dispatch(deleteNotification({ id: notification._id, isRead: notification.isRead }));
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-[#1F2937]/35 sm:hidden" aria-hidden="true" />
      <div
        ref={dropdownRef}
        className="fixed inset-x-0 bottom-0 z-50 flex max-h-[86dvh] w-full flex-col overflow-hidden rounded-t-lg border border-[#E5E7EB] bg-white shadow-2xl sm:absolute sm:bottom-auto sm:inset-x-auto sm:mt-3 sm:max-h-[80dvh] sm:w-[min(26rem,calc(100vw-1rem))] sm:rounded-lg"
        style={{ insetInlineEnd: 0 }}
      >
        <div className="border-b border-[#E5E7EB] bg-[#FFF7F3] p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-[#8B5CF6]">{t("title")}</p>
              <h3 className="mt-1 text-lg font-bold text-[#1F2937]">
                {t("unreadCount", { count: unreadCount })}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("close")}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[#6B7280] transition hover:bg-white hover:text-[#1F2937]"
            >
              <BiX size={24} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => dispatch(markAllNotificationsRead())}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#6B21A8] px-3 text-sm font-bold text-white hover:bg-[#581C87]"
              >
                <BiCheckDouble size={19} />
                {t("markAllRead")}
              </button>
            )}
            <Link
              to={roleNotificationPath(user?.role)}
              onClick={onClose}
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[#E9D5FF] bg-white px-3 text-sm font-bold text-[#6B21A8]"
            >
              {t("viewAll")}
            </Link>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white">
          {loading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="animate-pulse rounded-lg border border-[#E5E7EB] p-3">
                  <div className="mb-2 h-4 w-2/3 rounded bg-[#F3F4F6]" />
                  <div className="h-3 w-full rounded bg-[#F3F4F6]" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-center text-sm font-semibold text-[#DC2626]">
              {t(`errors:${error}`, { defaultValue: error })}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-[#6B7280]">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F3E8FF] text-[#6B21A8]">
                <BiBell className="text-3xl" aria-hidden="true" />
              </span>
              <p className="mt-3 font-bold text-[#1F2937]">{t("emptyTitle")}</p>
              <p className="mt-1 text-sm">{t("emptyDescription")}</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const target = getNotificationLink(notification, user?.role);
              const tone = getNotificationTone(notification.type);
              const notificationText = getNotificationText(notification, t);

              return (
                <Link
                  key={notification._id}
                  to={target}
                  onClick={() => handleOpenNotification(notification)}
                  className={`block border-b border-[#F3F4F6] p-4 transition hover:bg-[#FFF7F3] ${
                    !notification.isRead ? "bg-[#F3E8FF]/45" : "bg-white"
                  }`}
                >
                  <div className="flex min-w-0 gap-3">
                    <span className={`mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg ${tone}`}>
                      <BiBell size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="line-clamp-2 text-sm font-bold text-[#1F2937]">
                          {notificationText.title}
                        </h4>
                        {!notification.isRead && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#6B21A8]" />}
                      </div>
                      <p className="mt-1 line-clamp-2 break-words text-sm leading-5 text-[#6B7280]">
                        {notificationText.message}
                      </p>
                      <p className="mt-2 text-xs font-medium text-[#9CA3AF]">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      {!notification.isRead && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            dispatch(markNotificationRead(notification._id));
                          }}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#16A34A] transition hover:bg-[#DCFCE7]"
                          aria-label={t("markAsRead")}
                        >
                          <BiCheck size={19} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(event) => handleDelete(event, notification)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#DC2626] transition hover:bg-[#FEF2F2]"
                        aria-label={t("delete")}
                      >
                        <BiTrash size={17} />
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationDropdown;
