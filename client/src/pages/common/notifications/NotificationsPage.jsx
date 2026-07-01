import { useEffect, useMemo, useState } from "react";
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

const filters = [
  { value: "all", label: "All", icon: HiBell, params: {} },
  { value: "unread", label: "Unread", icon: HiInformationCircle, params: { unreadOnly: true } },
  { value: "applications", label: "Applications", icon: HiDocumentText, params: { type: "job_applied" } },
  { value: "interviews", label: "Interviews", icon: HiClock, params: { type: "interview_scheduled" } },
  { value: "messages", label: "Messages", icon: HiChatAlt2, params: { type: "message_received" } },
  { value: "jobs", label: "Jobs", icon: HiBriefcase, params: { type: "job_approved" } },
  { value: "system", label: "System", icon: HiInformationCircle, params: { type: "system_alert" } },
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
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(1);

  const activeFilterConfig = useMemo(
    () => filters.find((filter) => filter.value === activeFilter) || filters[0],
    [activeFilter]
  );

  const loadNotifications = () => {
    dispatch(
      fetchNotifications({
        page,
        limit: 20,
        ...activeFilterConfig.params,
      })
    );
  };

  useEffect(() => {
    loadNotifications();
  }, [dispatch, page, activeFilter]);

  const handleMarkRead = (notificationId) => {
    dispatch(markNotificationRead(notificationId));
  };

  const handleClearAll = () => {
    if (!window.confirm(t("clearConfirm"))) return;
    dispatch(clearAllNotifications());
  };

  return (
    <div className="min-h-screen bg-[#FFF7F3] text-[#1F2937]">
      <header className="bg-[linear-gradient(135deg,#6B21A8,#8B5CF6)] text-white">
        <div className="mx-auto max-w-[1400px] px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                JewelCancy alerts
              </p>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85">
                {t("summary", { unread: unreadCount, total: totalCount })}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:min-w-[24rem]">
              <Stat label="Unread" value={unreadCount} />
              <Stat label="Total" value={totalCount} />
              <Stat label="Showing" value={items.length} className="col-span-2 sm:col-span-1" />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1400px] gap-4 px-3 py-4 sm:px-4 lg:grid-cols-[17rem_minmax(0,1fr)] lg:px-6">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-sm">
            <div className="mb-3 hidden px-2 text-xs font-bold uppercase tracking-wide text-[#6B7280] lg:block">
              Filters
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
              {filters.map((filter) => {
                const Icon = filter.icon;
                const active = activeFilter === filter.value;
                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => {
                      setActiveFilter(filter.value);
                      setPage(1);
                    }}
                    className={`flex min-h-[44px] min-w-[9.5rem] items-center gap-2 rounded-lg border px-3 text-sm font-bold transition lg:min-w-0 ${
                      active
                        ? "border-[#6B21A8] bg-[#F3E8FF] text-[#581C87]"
                        : "border-transparent text-[#6B7280] hover:bg-[#FFF7F3] hover:text-[#1F2937]"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="truncate">{filter.label}</span>
                  </button>
                );
              })}
            </div>
          </section>
        </aside>

        <section className="min-w-0">
          <div className="-mt-10 mb-4 rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-sm sm:p-4 lg:mt-0">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-[#1F2937]">{activeFilterConfig.label} notifications</h2>
                <p className="mt-1 text-sm text-[#6B7280]">
                  Manage read status, open linked activity, or clear old notifications.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={loadNotifications}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm font-bold text-[#374151] hover:bg-[#FFF7F3]"
                >
                  <HiRefresh />
                  {t("common.refresh", { ns: "common" })}
                </button>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => dispatch(markAllNotificationsRead())}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#16A34A] px-4 text-sm font-bold text-white hover:bg-[#15803D]"
                  >
                    <HiCheck />
                    {t("markAllRead")}
                  </button>
                )}
                {totalCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[#FCA5A5] bg-white px-4 text-sm font-bold text-[#DC2626] hover:bg-[#FEF2F2]"
                  >
                    <HiTrash />
                    {t("common.clearAll", { ns: "common" })}
                  </button>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-4 text-sm font-semibold text-[#B91C1C]">
              {t(`errors:${error}`, { defaultValue: error })}
            </div>
          )}

          <div className="space-y-3">
            {loading ? (
              <NotificationSkeleton />
            ) : items.length === 0 ? (
              <NotificationEmptyState activeLabel={activeFilterConfig.label} />
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
            <div className="mt-6 flex flex-col gap-3 rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                disabled={!pagination.hasPrevPage}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="min-h-[44px] rounded-lg border border-[#E5E7EB] px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("common.previous", { ns: "common" })}
              </button>
              <span className="text-center text-sm font-semibold text-[#6B7280]">
                {t("common.pageOf", { ns: "common", page: pagination.page, pages: pagination.totalPages })}
              </span>
              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() => setPage((value) => value + 1)}
                className="min-h-[44px] rounded-lg border border-[#E5E7EB] px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("common.next", { ns: "common" })}
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

function NotificationCard({ notification, role, onMarkRead, onDelete, t }) {
  const target = getNotificationLink(notification, role);
  const tone = getNotificationTone(notification.type);
  const notificationText = getNotificationText(notification, t);

  return (
    <article
      className={`overflow-hidden rounded-lg border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        !notification.isRead ? "border-[#C4B5FD]" : "border-[#E5E7EB]"
      }`}
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-2xl ${tone}`}>
          {getIcon(notification.type)}
        </span>
        <Link
          to={target}
          onClick={() => !notification.isRead && onMarkRead(notification._id)}
          className="min-w-0 flex-1"
        >
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-words font-bold text-[#1F2937] transition hover:text-[#6B21A8]">
              {notificationText.title}
            </h3>
            {!notification.isRead && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F3E8FF] px-2 py-0.5 text-xs font-bold text-[#6B21A8]">
                <span className="h-2 w-2 rounded-full bg-[#6B21A8]" />
                {t("common.new", { ns: "common" })}
              </span>
            )}
          </div>
          <p className="mt-1 break-words text-sm leading-6 text-[#6B7280]">{notificationText.message}</p>
          <p className="mt-3 text-xs font-semibold text-[#9CA3AF]">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </Link>
        <div className="flex shrink-0 gap-2 sm:flex-col">
          {!notification.isRead && (
            <button
              type="button"
              onClick={() => onMarkRead(notification._id)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-[#16A34A] transition hover:bg-[#DCFCE7]"
              title={t("markAsRead")}
              aria-label={t("markAsRead")}
            >
              <HiCheck className="text-xl" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(notification._id, notification.isRead)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-[#DC2626] transition hover:bg-[#FEF2F2]"
            title={t("common.delete", { ns: "common" })}
            aria-label={t("common.delete", { ns: "common" })}
          >
            <HiTrash className="text-lg" />
          </button>
        </div>
      </div>
    </article>
  );
}

function NotificationSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="animate-pulse rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <div className="flex gap-4">
            <div className="h-12 w-12 rounded-lg bg-[#F3F4F6]" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-1/3 rounded bg-[#F3F4F6]" />
              <div className="h-3 w-full rounded bg-[#F3F4F6]" />
              <div className="h-3 w-24 rounded bg-[#F3F4F6]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function NotificationEmptyState({ activeLabel }) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-8 text-center shadow-sm sm:p-12">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F3E8FF] text-[#6B21A8]">
        <HiBell className="text-4xl" />
      </span>
      <h3 className="mt-4 text-xl font-bold text-[#1F2937]">No {activeLabel.toLowerCase()} notifications</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6B7280]">
        You are caught up. New application, interview, message, job, and system updates will appear here.
      </p>
    </div>
  );
}

function Stat({ label, value, className = "" }) {
  return (
    <div className={`rounded-lg bg-white/12 p-3 text-center ${className}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-[11px] font-bold uppercase tracking-wide text-white/70">{label}</div>
    </div>
  );
}

export default NotificationsPage;
