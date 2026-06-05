import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notificationApi } from "../../api/api";
import { getApiErrorKey } from "../../utils/apiErrors";

const getPayload = (response) => response.data?.data || response.data || {};

const normalizeNotification = (notification) => {
  if (!notification?._id) return notification;
  return {
    ...notification,
    recipient: notification.recipient || notification.recipientId,
    recipientId: notification.recipientId || notification.recipient,
    sender: notification.sender || notification.senderId || null,
    senderId: notification.senderId || notification.sender || null,
    relatedEntityId: notification.relatedEntityId || notification.relatedId || null,
    relatedEntityType: notification.relatedEntityType || notification.relatedModel || null,
  };
};

const uniqueNotifications = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?._id || seen.has(item._id)) return false;
    seen.add(item._id);
    return true;
  });
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await notificationApi.get("/", { params });
      return getPayload(response);
    } catch (error) {
      return rejectWithValue(getApiErrorKey(error) || "failedToFetchNotifications");
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationApi.get("/unread-count");
      return getPayload(response).unreadCount ?? response.data?.count ?? 0;
    } catch (error) {
      return rejectWithValue(getApiErrorKey(error) || "failedToFetchUnreadCount");
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  "notifications/markRead",
  async (id, { rejectWithValue }) => {
    try {
      const response = await notificationApi.patch(`/${id}/read`);
      return getPayload(response);
    } catch (error) {
      return rejectWithValue(getApiErrorKey(error) || "failedToMarkNotificationRead");
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationApi.patch("/mark-all-read");
      return getPayload(response);
    } catch (error) {
      return rejectWithValue(getApiErrorKey(error) || "failedToMarkAllNotificationsRead");
    }
  }
);

export const deleteNotification = createAsyncThunk(
  "notifications/delete",
  async ({ id, isRead }, { rejectWithValue }) => {
    try {
      const response = await notificationApi.delete(`/${id}`);
      return { id, isRead, ...getPayload(response) };
    } catch (error) {
      return rejectWithValue(getApiErrorKey(error) || "failedToDeleteNotification");
    }
  }
);

export const clearAllNotifications = createAsyncThunk(
  "notifications/clearAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationApi.delete("/clear-all");
      return getPayload(response);
    } catch (error) {
      return rejectWithValue(getApiErrorKey(error) || "failedToClearNotifications");
    }
  }
);

const initialState = {
  items: [],
  unreadCount: 0,
  totalCount: 0,
  pagination: {
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },
  loading: false,
  countLoading: false,
  error: "",
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addRealtimeNotification: (state, action) => {
      const notification = normalizeNotification(action.payload);
      if (!notification?._id) return;
      const existed = state.items.some((item) => item._id === notification._id);
      state.items = uniqueNotifications([notification, ...state.items]);
      if (!existed) {
        state.totalCount += 1;
      }
      if (!notification.isRead && !existed) {
        state.unreadCount += 1;
      }
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = Math.max(0, Number(action.payload) || 0);
    },
    clearNotificationState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        const payload = action.payload || {};
        state.loading = false;
        state.items = uniqueNotifications((payload.notifications || []).map(normalizeNotification));
        state.unreadCount = payload.unreadCount ?? state.unreadCount;
        state.totalCount = payload.totalCount ?? state.items.length;
        state.pagination = payload.pagination || state.pagination;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch notifications";
      })
      .addCase(fetchUnreadCount.pending, (state) => {
        state.countLoading = true;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.countLoading = false;
        state.unreadCount = Math.max(0, Number(action.payload) || 0);
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.countLoading = false;
        state.error = action.payload || "Failed to fetch unread count";
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notification = normalizeNotification(action.payload?.notification);
        state.items = state.items.map((item) =>
          item._id === notification?._id ? { ...item, ...notification, isRead: true } : item
        );
        state.unreadCount = Math.max(0, action.payload?.unreadCount ?? state.unreadCount - 1);
      })
      .addCase(markAllNotificationsRead.fulfilled, (state, action) => {
        state.items = state.items.map((item) => ({ ...item, isRead: true, readAt: item.readAt || new Date().toISOString() }));
        state.unreadCount = Math.max(0, action.payload?.unreadCount ?? 0);
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload.id);
        state.unreadCount = Math.max(0, action.payload?.unreadCount ?? (action.payload.isRead ? state.unreadCount : state.unreadCount - 1));
        state.totalCount = Math.max(0, state.totalCount - 1);
      })
      .addCase(clearAllNotifications.fulfilled, (state, action) => {
        state.items = [];
        state.unreadCount = Math.max(0, action.payload?.unreadCount ?? 0);
        state.totalCount = 0;
      });
  },
});

export const {
  addRealtimeNotification,
  setUnreadCount,
  clearNotificationState,
} = notificationSlice.actions;

export default notificationSlice.reducer;
