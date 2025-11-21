import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api/axiosClient";
import { useAuth } from "../hooks/useAuth";
import ChatRoom from "../components/ChatRoom";
import AnimatedCard from "../components/AnimatedCard";
import ButtonMinimal from "../components/ButtonMinimal";

export default function InvestorDiscussions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pitchedIdeas, setPitchedIdeas] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [activeTab, setActiveTab] = useState("ideas"); // "ideas" or "discussions"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || (user.role !== "investor" && user.role !== "admin")) {
      navigate("/");
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ideasRes, discussionsRes] = await Promise.all([
        API.get("/api/investor/pitched-ideas"),
        API.get("/api/investor/discussions"),
      ]);

      if (ideasRes.data.success) {
        setPitchedIdeas(ideasRes.data.data || []);
      }
      if (discussionsRes.data.success) {
        setDiscussions(discussionsRes.data.data || []);
      }
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const startDiscussion = async (ideaId) => {
    try {
      const { data } = await API.get(`/api/investor/discussions/idea/${ideaId}`);
      if (data.success) {
        toast.success("Discussion room opened");
        setSelectedRoomId(data.data.id);
        setActiveTab("discussions");
        fetchData(); // Refresh discussions list
      }
    } catch (error) {
      toast.error(error.response?.data?.error?.message || "Failed to start discussion");
    }
  };

  if (loading) {
    return (
      <div className="page-transition flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-brand-500 dark:border-neon-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="page-transition">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 md:mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
          Investor Discussions
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg">
          Private discussions about pitched projects
        </p>
      </motion.div>

      <div className="flex gap-2 mb-6 border-b border-neutral-200/50 dark:border-purple-900/30">
        <button
          onClick={() => setActiveTab("ideas")}
          className={`px-4 py-2 font-medium transition-theme ${
            activeTab === "ideas"
              ? "text-brand-500 dark:text-neon-400 border-b-2 border-brand-500 dark:border-neon-400"
              : "text-neutral-600 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-neon-400"
          }`}
        >
          💡 Pitched Ideas ({pitchedIdeas.length})
        </button>
        <button
          onClick={() => setActiveTab("discussions")}
          className={`px-4 py-2 font-medium transition-theme ${
            activeTab === "discussions"
              ? "text-brand-500 dark:text-neon-400 border-b-2 border-brand-500 dark:border-neon-400"
              : "text-neutral-600 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-neon-400"
          }`}
        >
          💬 My Discussions ({discussions.length})
        </button>
      </div>

      {activeTab === "ideas" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pitchedIdeas.length === 0 ? (
            <div className="col-span-full glass-card rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">💡</div>
              <p className="text-neutral-600 dark:text-neutral-400">
                No pitched ideas available yet
              </p>
            </div>
          ) : (
            pitchedIdeas.map((idea) => (
              <AnimatedCard
                key={idea.id}
                title={idea.title}
                description={idea.description?.slice(0, 150)}
                subtitle={`By ${idea.createdBy?.name || "Unknown"}`}
                tags={idea.tags}
                meta={idea.pitchedAt ? new Date(idea.pitchedAt).toLocaleDateString() : ""}
              >
                <div className="mt-4 flex gap-2">
                  <ButtonMinimal
                    onClick={() => startDiscussion(idea.id)}
                    className="flex-1"
                  >
                    Start Discussion
                  </ButtonMinimal>
                  <ButtonMinimal
                    onClick={() => navigate(`/ideas/${idea.id}`)}
                    variant="ghost"
                  >
                    View Details
                  </ButtonMinimal>
                </div>
              </AnimatedCard>
            ))
          )}
        </div>
      )}

      {activeTab === "discussions" && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="glass-card rounded-2xl p-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Discussion Rooms
              </h3>
              <div className="space-y-2">
                {discussions.length === 0 ? (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    No discussions yet
                  </p>
                ) : (
                  discussions.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`w-full text-left p-3 rounded-lg transition-theme ${
                        selectedRoomId === room.id
                          ? "bg-brand-500/20 dark:bg-neon-500/20 border border-brand-500/50 dark:border-neon-500/50"
                          : "bg-neutral-100 dark:bg-purple-900/20 hover:bg-neutral-200 dark:hover:bg-purple-900/30"
                      }`}
                    >
                      <div className="font-medium text-neutral-900 dark:text-white text-sm truncate">
                        {room.name}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        {room.participants?.length || 0} investors
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            {selectedRoomId ? (
              <ChatRoom roomId={selectedRoomId} />
            ) : (
              <div className="glass-card rounded-2xl p-12 text-center">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Select a discussion room to start chatting
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

