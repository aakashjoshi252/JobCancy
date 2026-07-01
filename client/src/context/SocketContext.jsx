import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { SOCKET_BASE_URL } from "../api/api";

const SocketContext = createContext();
const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === "true";
const socketLog = (...args) => {
  if (DEBUG_MODE) console.log(...args);
};
const socketWarn = (...args) => {
  if (DEBUG_MODE) console.warn(...args);
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const user = useSelector((state) => state.auth.user);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const maxReconnectAttempts = 5;

  // Show browser notification
  const showNotification = useCallback(async (title, body, icon = null, onClick = null) => {
    if (!("Notification" in window) || !document.hidden) return;

    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }

    if (permission === "granted") {
      const notification = new Notification(title, {
        body: body,
        icon: icon || "/logo.png",
        silent: false,
      });
      
      if (onClick) {
        notification.onclick = () => {
          window.focus();
          onClick();
          notification.close();
        };
      }
      
      setTimeout(() => notification.close(), 5000);
    }
  }, []);

  // Connect to socket
  const connectSocket = useCallback(() => {
    if (!user?._id) {
      socketLog("No user ID, skipping socket connection");
      return null;
    }

    if (socketRef.current) {
      return socketRef.current;
    }

    try {
      const SOCKET_URL = SOCKET_BASE_URL;
      socketLog(`Connecting to Socket.IO: ${SOCKET_URL}`);

      const newSocket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: maxReconnectAttempts,
        timeout: 10000,
        auth: {
          token: localStorage.getItem('token') || sessionStorage.getItem('token')
        }
      });

      newSocket.on("connect", () => {
        socketLog("Connected to socket server, ID:", newSocket.id);
        setIsConnected(true);
        setConnectionError(null);
        setReconnectAttempts(0);
        
        newSocket.emit("userOnline");
      });

      newSocket.on("connect_error", (error) => {
        socketWarn("Socket connection error:", error.message);
        setConnectionError(error.message);
        setIsConnected(false);
        setReconnectAttempts(prev => prev + 1);
      });

      newSocket.on("disconnect", (reason) => {
        socketLog("Socket disconnected:", reason);
        setIsConnected(false);
        
        if (reason === "io server disconnect") {
          setTimeout(() => {
            if (newSocket) newSocket.connect();
          }, 1000);
        }
      });

      newSocket.on("reconnect", (attemptNumber) => {
        socketLog(`Socket reconnected after ${attemptNumber} attempts`);
        setIsConnected(true);
        setConnectionError(null);
        newSocket.emit("userOnline");
      });

      newSocket.on("userStatusChange", ({ userId, status }) => {
        socketLog(`User ${userId} is now ${status}`);
        setOnlineUsers(prev => {
          if (status === "online") {
            return [...new Set([...prev, userId])];
          } else {
            return prev.filter(id => id !== userId);
          }
        });
      });

      newSocket.on("onlineUsers", (users) => {
        socketLog("Online users:", users);
        setOnlineUsers(users || []);
      });

      newSocket.on("messageError", (error) => {
        socketWarn("Message error:", error);
      });

      newSocket.on("messageSent", ({ success, messageId, timestamp }) => {
        if (success) {
          socketLog("Message sent successfully:", messageId);
        }
      });

      newSocket.on("joinedChat", ({ chatId, success }) => {
        if (success) {
          socketLog("Joined chat:", chatId);
        }
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
      
      return newSocket;
    } catch (error) {
      socketWarn("Failed to create socket connection:", error);
      setConnectionError(error.message);
      setIsConnected(false);
      return null;
    }
  }, [user]);

  // Disconnect socket
  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketLog("Disconnecting socket...");
      window.dispatchEvent(new Event("chat:logout"));
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      setOnlineUsers([]);
    }
  }, []);

  // Reconnect socket
  const reconnectSocket = useCallback(() => {
    socketLog("Attempting to reconnect...");
    disconnectSocket();
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connectSocket();
    }, 1000);
  }, [disconnectSocket, connectSocket]);

  // Send event with callback
  const emit = useCallback((event, data, callback) => {
    if (socketRef.current && isConnected) {
      if (callback) {
        socketRef.current.emit(event, data, callback);
      } else {
        socketRef.current.emit(event, data);
      }
      return true;
    }
    socketWarn(`Cannot emit event "${event}", socket not connected`);
    return false;
  }, [isConnected]);

  // Listen to event
  const on = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
      return () => socketRef.current.off(event, callback);
    }
    return () => {};
  }, []);

  // Remove event listener
  const off = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []);

  // Connect on user change
  useEffect(() => {
    if (user?._id) {
      const connectTimeout = setTimeout(() => {
        connectSocket();
      }, 500);
      
      return () => {
        clearTimeout(connectTimeout);
        disconnectSocket();
      };
    } else {
      disconnectSocket();
    }
  }, [user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      disconnectSocket();
    };
  }, []);

  const value = {
    socket: socketRef.current,
    isConnected,
    connectionError,
    onlineUsers,
    reconnectAttempts,
    emit,
    on,
    off,
    reconnect: reconnectSocket,
    disconnect: disconnectSocket,
    showNotification,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook for online status
export const useUserOnlineStatus = (userId) => {
  const { onlineUsers } = useSocket();
  return onlineUsers.includes(userId);
};

// Custom hook for socket events
export const useSocketEvent = (event, handler, deps = []) => {
  const { on } = useSocket();
  
  useEffect(() => {
    if (!handler) return;
    const cleanup = on(event, handler);
    return cleanup;
  }, [event, handler, on, ...deps]);
};
