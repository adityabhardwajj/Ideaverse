import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API from "../api/axiosClient";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";

export default function ChatList({ onSelectRoom }) {
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    fetchChatRooms();
  }, [activeFilter]);

  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/api/chat/rooms?type=${activeFilter === "all" ? "" : activeFilter}`);
      if (data.success) {
        setChatRooms(data.data || []);
      }
    } catch (error) {
      toast.error("Failed to load chat rooms");
    } finally {
      setLoading(false);
    }
  };

  const getLastMessage = (room) => {
    if (!room.messages || room.messages.length === 0) {
      return "No messages yet";
    }
    const lastMsg = room.messages[room.messages.length - 1];
    return lastMsg.text?.substring(0, 50) + (lastMsg.text?.length > 50 ? "..." : "");
  };

  const getRoomName = (room) => {
    if (room.name) return room.name;
    if (room.type === "project" && room.relatedTo?.idea) {
      return `Project: ${room.relatedTo.idea.title}`;
    }
    if (room.type === "job" && room.relatedTo?.job) {
      return `Job: ${room.relatedTo.job.title}`;
    }
    return "Chat Room";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-500 dark:border-neon-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        {["all", "project", "job", "direct"].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-theme capitalize ${
              activeFilter === filter
                ? "bg-brand-500 dark:bg-neon-500 text-white"
                : "bg-neutral-100 dark:bg-purple-900/20 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-purple-900/30"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {chatRooms.length === 0 ? (
        <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
          No chat rooms yet. Start a conversation!
        </div>
      ) : (
        <div className="space-y-2">
          {chatRooms.map((room) => (
            <motion.div
              key={room._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectRoom(room._id)}
              className="glass-card p-4 rounded-lg cursor-pointer hover:border-brand-500 dark:hover:border-neon-500 transition-theme"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
                    {getRoomName(room)}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                    {getLastMessage(room)}
                  </p>
                  {room.lastMessageAt && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                      {new Date(room.lastMessageAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {room.messages && room.messages.length > 0 && (
                  <div className="ml-2 flex-shrink-0">
                    <div className="w-2 h-2 bg-brand-500 dark:bg-neon-500 rounded-full" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

