import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import API from "../api/axiosClient";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";

export default function ChatRoom({ roomId, onClose }) {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!roomId || !token) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || "http://localhost:5000";
    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("Connected to chat server");
      newSocket.emit("join-room", roomId);
    });

    newSocket.on("joined-room", () => {
      fetchMessages();
    });

    newSocket.on("new-message", (data) => {
      if (data.roomId === roomId) {
        setMessages((prev) => [...prev, data.message]);
        scrollToBottom();
      }
    });

    newSocket.on("user-typing", (data) => {
      if (data.roomId === roomId) {
        setTypingUsers((prev) => {
          if (!prev.includes(data.userName)) {
            return [...prev, data.userName];
          }
          return prev;
        });
      }
    });

    newSocket.on("user-stopped-typing", (data) => {
      if (data.roomId === roomId) {
        setTypingUsers((prev) => prev.filter((name) => name !== data.userName));
      }
    });

    newSocket.on("error", (error) => {
      toast.error(error.message || "Chat error occurred");
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit("leave-room", roomId);
      newSocket.disconnect();
    };
  }, [roomId, token]);

  const fetchMessages = async () => {
    try {
      const { data } = await API.get(`/api/chat/rooms/${roomId}`);
      if (data.success) {
        setMessages(data.data.messages || []);
        scrollToBottom();
      }
    } catch (error) {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    socket.emit("send-message", {
      roomId,
      text: newMessage.trim(),
    });

    setNewMessage("");
    handleStopTyping();
  };

  const handleTyping = () => {
    if (!socket || !isTyping) {
      setIsTyping(true);
      socket?.emit("typing", { roomId });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 3000);
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      socket?.emit("stop-typing", { roomId });
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="glass-card p-6 rounded-xl">
          <div className="w-8 h-8 border-4 border-brand-500 dark:border-neon-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-neutral-200/50 dark:border-purple-900/30">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Chat</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-purple-900/20 rounded-lg transition-theme"
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.sender?._id === user?._id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender?._id === user?._id
                      ? "bg-brand-500 dark:bg-neon-500 text-white"
                      : "bg-neutral-100 dark:bg-purple-900/20 text-neutral-900 dark:text-white"
                  }`}
                >
                  {message.sender?._id !== user?._id && (
                    <div className="text-xs font-semibold mb-1 opacity-80">
                      {message.sender?.name}
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {typingUsers.length > 0 && (
            <div className="text-sm text-neutral-500 dark:text-neutral-400 italic">
              {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-neutral-200/50 dark:border-purple-900/30">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onBlur={handleStopTyping}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-purple-800/50 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-neon-500"
              maxLength={5000}
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-6 py-2 bg-brand-500 dark:bg-neon-500 text-white rounded-lg hover:bg-brand-600 dark:hover:bg-neon-600 disabled:opacity-50 disabled:cursor-not-allowed transition-theme"
            >
              Send
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

