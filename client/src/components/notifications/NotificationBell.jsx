import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { BiBell } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import NotificationDropdown from "./NotificationDropdown";
import { useSocket } from "../../context/SocketContext";
import { getNotificationText } from "../../utils/notificationsI18n";
import {
  addRealtimeNotification,
  fetchNotifications,
  fetchUnreadCount,
  setUnreadCount,
} from "../../redux/slices/notificationSlice";

const NotificationBell = () => {
  const { t } = useTranslation(["notifications", "common"]);
  const dispatch = useDispatch();
  const { socket, showNotification } = useSocket();
  const user = useSelector((state) => state.auth.user);
  const unreadCount = useSelector((state) => state.notifications.unreadCount);
  const [showDropdown, setShowDropdown] = useState(false);
  const seenRealtimeIds = useRef(new Set());

  useEffect(() => {
    if (!user?._id) return;

    dispatch(fetchUnreadCount());
    dispatch(fetchNotifications({ limit: 5, page: 1 }));
  }, [dispatch, user?._id]);

  useEffect(() => {
    if (!socket || !user?._id) return;

    const handleNewNotification = (notification) => {
      if (notification?._id && seenRealtimeIds.current.has(notification._id)) return;
      if (notification?._id) seenRealtimeIds.current.add(notification._id);

      dispatch(addRealtimeNotification(notification));
      const notificationText = getNotificationText(notification, t);
      toast(notificationText.title || t("title"), {
        icon: "!",
      });
      showNotification?.(
        notificationText.title || t("title"),
        notificationText.message || "",
        null,
        () => {
          window.location.href = notification.link || "/notifications";
        }
      );
    };

    const handleUnreadCount = (count) => {
      dispatch(setUnreadCount(count));
    };

    socket.on("notification:new", handleNewNotification);
    socket.on("newNotification", handleNewNotification);
    socket.on("notification:unreadCount", handleUnreadCount);
    socket.on("unreadNotificationCount", handleUnreadCount);

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("newNotification", handleNewNotification);
      socket.off("notification:unreadCount", handleUnreadCount);
      socket.off("unreadNotificationCount", handleUnreadCount);
    };
  }, [dispatch, showNotification, socket, t, user?._id]);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowDropdown((value) => !value)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
        aria-label={t("title")}
      >
        <BiBell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && <NotificationDropdown onClose={() => setShowDropdown(false)} />}
    </div>
  );
};

export default NotificationBell;
