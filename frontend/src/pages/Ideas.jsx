import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api/axiosClient";
import AnimatedCard from "../components/AnimatedCard";
import SkeletonCard from "../components/SkeletonCard";
import ConfirmModal from "../components/ConfirmModal";
import { useAuth } from "../hooks/useAuth";

export default function Ideas() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchIdeas = async (pageNum = page) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "5",
        sort: "createdAt_desc",
      });
      
      if (searchQuery) params.append("search", searchQuery);
      if (selectedTags.length > 0) params.append("tags", selectedTags.join(","));

      const { data } = await API.get(`/api/ideas?${params.toString()}`);
      // Limit to 5 items maximum
      const ideasList = (data.data || []).slice(0, 5);
      setIdeas(ideasList);
      // Update pagination to reflect 5 items per page
      const meta = data.meta ? { ...data.meta, limit: 5, totalPages: Math.ceil((data.meta.totalItems || 0) / 5) } : null;
      setPagination(meta);
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || err.message || "Failed to load ideas";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas(1);
    setPage(1);
  }, [searchQuery, selectedTags]);

  useEffect(() => {
    fetchIdeas();
  }, [page]);

  const handleDeleteIdea = async (ideaId) => {
    try {
      await API.delete(`/api/ideas/${ideaId}`);
      toast.success("Idea deleted successfully");
      fetchIdeas();
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || "Failed to delete idea";
      toast.error(errorMsg);
    }
  };

  const handleEditIdea = (ideaId) => {
    navigate(`/ideas/${ideaId}/edit`);
  };

  return (
    <div className="page-transition">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 md:mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
          Idea Feed
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-6">
          Discover innovative ideas from creators around the world
        </p>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search ideas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-96 px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-purple-800/50 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-neon-500"
          />
        </div>
      </motion.div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : !ideas || ideas.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="text-6xl mb-4">💡</div>
          <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            No ideas yet
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400">
            Be the first to share your innovative idea!
          </p>
        </motion.div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {ideas.map((idea, index) => (
              <motion.div
                key={idea._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <AnimatedCard
                  title={idea.title}
                  subtitle={`By ${idea.author?.name || idea.createdBy?.name || "Anonymous"}`}
                  description={idea.summary || idea.description?.slice(0, 150) || "No description"}
                  tags={idea.tags}
                  meta={new Date(idea.createdAt).toLocaleDateString()}
                  onOpen={() => navigate(`/ideas/${idea._id}`)}
                />
                {user && (user._id === idea.createdBy?._id || user.role === "admin") && (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => handleEditIdea(idea._id)}
                      className="px-3 py-1 text-xs text-brand-500 dark:text-neon-400 hover:bg-brand-50 dark:hover:bg-purple-900/20 rounded transition-theme"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(idea._id)}
                      className="px-3 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-theme"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-purple-800/50 text-neutral-700 dark:text-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-purple-900/20 transition-theme"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-neutral-600 dark:text-neutral-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.totalPages}
                className="px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-purple-800/50 text-neutral-700 dark:text-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-purple-900/20 transition-theme"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {deleteConfirm && (
        <ConfirmModal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => handleDeleteIdea(deleteConfirm)}
          title="Delete Idea"
          message="Are you sure you want to delete this idea? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          danger={true}
        />
      )}
    </div>
  );
}

