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
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    <div
      ref={dropdownRef}
      className="absolute z-50 mt-2 flex max-h-[80dvh] w-[min(24rem,calc(100vw-1rem))] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
      style={{ insetInlineEnd: 0 }}
    >
      <div className="border-b border-gray-100 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-gray-950">{t("title")}</h3>
            <p className="text-xs text-gray-500">{t("unreadCount", { count: unreadCount })}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <BiX size={22} />
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => dispatch(markAllNotificationsRead())}
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <BiCheckDouble size={18} />
            {t("markAllRead")}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="animate-pulse rounded-lg border border-gray-100 p-3">
                <div className="mb-2 h-4 w-2/3 rounded bg-gray-100" />
                <div className="h-3 w-full rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-center text-sm text-red-600">{t(`errors:${error}`, { defaultValue: error })}</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <BiBell className="mx-auto text-4xl" aria-hidden="true" />
            <p className="mt-2 font-medium">{t("emptyTitle")}</p>
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
                className={`block border-b border-gray-100 p-4 transition hover:bg-gray-50 ${
                  !notification.isRead ? "bg-blue-50/60" : ""
                }`}
              >
                <div className="flex gap-3">
                  <span className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}>
                    <BiBell size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="line-clamp-1 text-sm font-semibold text-gray-950">
                        {notificationText.title}
                      </h4>
                      {!notification.isRead && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">{notificationText.message}</p>
                    <p className="mt-2 text-xs text-gray-400">
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
                        className="rounded p-1 text-blue-600 transition hover:bg-blue-100"
                        aria-label={t("markAsRead")}
                      >
                        <BiCheck size={18} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(event) => handleDelete(event, notification)}
                      className="rounded p-1 text-red-600 transition hover:bg-red-50"
                      aria-label={t("delete")}
                    >
                      <BiTrash size={16} />
                    </button>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      <div className="border-t border-gray-100 bg-gray-50 p-3 text-center">
        <Link
          to={user?.role === "candidate" ? "/candidate/notifications" : user?.role === "recruiter" ? "/recruiter/notifications" : user?.role === "admin" ? "/admin/notifications" : "/notifications"}
          onClick={onClose}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          {t("viewAll")}
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;
