import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  HiBell,
  HiBriefcase,
  HiChatAlt2,
  HiCheck,
  HiCheckCircle,
  HiClock,
  HiDocumentText,
  HiInformationCircle,
  HiRefresh,
  HiTrash,
  HiXCircle,
} from "react-icons/hi";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  clearAllNotifications,
  deleteNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../../redux/slices/notificationSlice";
import { getNotificationLink, getNotificationTone } from "../../../utils/notificationLinks";
import { getNotificationText } from "../../../utils/notificationsI18n";

const notificationTypes = [
  { value: "all", labelKey: "all" },
  { value: "job_applied", labelKey: "categories.applications" },
  { value: "application_status_changed", labelKey: "categories.status" },
  { value: "interview_scheduled", labelKey: "categories.interviews" },
  { value: "message_received", labelKey: "categories.messages" },
  { value: "recruiter_approved", labelKey: "categories.recruiter" },
  { value: "job_approved", labelKey: "categories.jobs" },
  { value: "job_rejected", labelKey: "categories.rejected" },
  { value: "system_alert", labelKey: "categories.system" },
];

const getIcon = (type) => {
  const icons = {
    job_applied: <HiDocumentText />,
    application_status_changed: <HiCheckCircle />,
    interview_scheduled: <HiClock />,
    message_received: <HiChatAlt2 />,
    recruiter_approved: <HiCheckCircle />,
    job_approved: <HiBriefcase />,
    job_rejected: <HiXCircle />,
    profile_updated: <HiInformationCircle />,
    system_alert: <HiInformationCircle />,
  };

  return icons[type] || <HiBell />;
};

const NotificationsPage = () => {
  const { t } = useTranslation(["notifications", "common", "errors"]);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { items, loading, error, unreadCount, totalCount, pagination } = useSelector(
    (state) => state.notifications
  );
  const [readFilter, setReadFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);

  const loadNotifications = () => {
    dispatch(
      fetchNotifications({
        page,
        limit: 20,
        unreadOnly: readFilter === "unread",
        ...(typeFilter !== "all" ? { type: typeFilter } : {}),
      })
    );
  };

  useEffect(() => {
    loadNotifications();
  }, [dispatch, page, readFilter, typeFilter]);

  const handleMarkRead = (notificationId) => {
    dispatch(markNotificationRead(notificationId));
  };

  const handleClearAll = () => {
    if (!window.confirm(t("clearConfirm"))) return;
    dispatch(clearAllNotifications());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                <HiBell className="text-3xl" />
              </span>
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">{t("title")}</h1>
                <p className="mt-1 text-sm text-blue-100">
                  {t("summary", { unread: unreadCount, total: totalCount })}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={loadNotifications}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold transition hover:bg-white/25"
            >
              <HiRefresh />
              {t("common.refresh", { ns: "common" })}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="-mt-10 mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {["all", "unread"].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => {
                    setReadFilter(filter);
                    setPage(1);
                  }}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
                    readFilter === filter
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {t(filter)}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {notificationTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setTypeFilter(type.value);
                    setPage(1);
                  }}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    typeFilter === type.value
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {t(type.labelKey)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => dispatch(markAllNotificationsRead())}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                <HiCheck />
                {t("markAllRead")}
              </button>
            )}
            {totalCount > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <HiTrash />
                {t("common.clearAll", { ns: "common" })}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {t(`errors:${error}`, { defaultValue: error })}
          </div>
        )}

        <div className="space-y-3">
          {loading ? (
            <NotificationSkeleton />
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
              <HiBell className="mx-auto mb-4 text-6xl text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-950">{t("noNotifications")}</h3>
              <p className="mt-2 text-gray-500">
                {t("caughtUp")}
              </p>
            </div>
          ) : (
            items.map((notification) => (
              <NotificationCard
                key={notification._id}
                notification={notification}
                role={user?.role}
                t={t}
                onMarkRead={handleMarkRead}
                onDelete={(id, isRead) => dispatch(deleteNotification({ id, isRead }))}
              />
            ))
          )}
        </div>

        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
            <button
              type="button"
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("common.previous", { ns: "common" })}
            </button>
            <span className="text-sm text-gray-600">
              {t("common.pageOf", { ns: "common", page: pagination.page, pages: pagination.totalPages })}
            </span>
            <button
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((value) => value + 1)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("common.next", { ns: "common" })}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

function NotificationCard({ notification, role, onMarkRead, onDelete, t }) {
  const target = getNotificationLink(notification, role);
  const tone = getNotificationTone(notification.type);
  const notificationText = getNotificationText(notification, t);

  return (
    <div
      className={`rounded-xl border bg-white shadow-sm transition hover:shadow-md ${
        !notification.isRead ? "border-blue-200" : "border-gray-200"
      }`}
    >
      <div className="flex gap-4 p-4 sm:p-5">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${tone}`}>
          {getIcon(notification.type)}
        </span>
        <Link
          to={target}
          onClick={() => !notification.isRead && onMarkRead(notification._id)}
          className="min-w-0 flex-1"
        >
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-gray-950 transition hover:text-blue-600">
              {notificationText.title}
            </h3>
            {!notification.isRead && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                {t("common.new", { ns: "common" })}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-600">{notificationText.message}</p>
          <p className="mt-2 text-xs text-gray-400">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </Link>
        <div className="flex shrink-0 flex-col gap-2">
          {!notification.isRead && (
            <button
              type="button"
              onClick={() => onMarkRead(notification._id)}
              className="rounded-lg p-2 text-green-600 transition hover:bg-green-50"
              title={t("markAsRead")}
            >
              <HiCheck className="text-xl" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(notification._id, notification.isRead)}
            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
            title={t("common.delete", { ns: "common" })}
          >
            <HiTrash className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="animate-pulse rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex gap-4">
            <div className="h-12 w-12 rounded-xl bg-gray-100" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-1/3 rounded bg-gray-100" />
              <div className="h-3 w-full rounded bg-gray-100" />
              <div className="h-3 w-24 rounded bg-gray-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default NotificationsPage;
