import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axiosClient";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";

export default function IdeaDetail() {
  const { id } = useParams();
  const [idea, setIdea] = useState(null);
  const [comment, setComment] = useState("");
  const { user } = useAuth();

  const fetch = async () => {
    try {
      const { data } = await API.get(`/api/ideas/${id}`);
      if (data.success) {
        setIdea(data.data);
      }
    } catch (err) {
      console.error("Failed to load idea:", err);
    }
  };

  useEffect(() => { fetch(); }, [id]);

  const addComment = async () => {
    if (!comment) return;
    try {
      const { data } = await API.post(`/api/ideas/${id}/comments`, { text: comment });
      if (data.success) {
        setComment("");
        fetch();
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const toggleLike = async () => {
    try {
      await API.put(`/api/ideas/${id}/like`);
      fetch();
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  if (!idea) return <div className="container mx-auto mt-6 text-neutral-600 dark:text-neutral-400">Loading...</div>;

  return (
    <div className="container mx-auto mt-6 max-w-4xl">
      <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">{idea.title}</h1>
      <p className="mt-4 text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed">{idea.description}</p>

      {idea.tags && idea.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {idea.tags.map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1 text-xs font-medium bg-brand-500/10 dark:bg-accent-dark/20 text-brand-600 dark:text-accent-dark rounded-full border border-brand-500/20 dark:border-accent-dark/30"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center gap-4 flex-wrap">
        <button 
          onClick={toggleLike} 
          className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-background-dark-card text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors font-medium"
        >
          ❤️ Like ({idea.likes?.length || 0})
        </button>
        {user && String(user._id || user.id) === String(idea.createdBy?._id || idea.createdBy?.id || idea.createdById) && !idea.isPitched && (
          <button
            onClick={async () => {
              try {
                const { data } = await API.post(`/api/ideas/${id}/pitch`);
                if (data.success) {
                  toast.success("Idea has been pitched for investment!");
                  fetch();
                }
              } catch (error) {
                toast.error(error.response?.data?.error?.message || "Failed to pitch idea");
              }
            }}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors font-medium shadow-sm"
          >
            🚀 Pitch for Investment
          </button>
        )}
        {idea.isPitched && (
          <span className="px-4 py-2 bg-green-500/20 text-green-600 dark:text-green-400 rounded-md font-medium">
            ✓ Pitched for Investment
          </span>
        )}
      </div>

      <div className="mt-8 border-t border-neutral-200 dark:border-neutral-700/50 pt-8">
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Comments</h3>
        <div className="mt-4 space-y-4">
          {idea.comments?.map(c => (
            <div key={c._id} className="p-4 bg-neutral-50/80 dark:bg-background-dark-card rounded-lg shadow-sm dark:shadow-dark-card border border-neutral-200/60 dark:border-neutral-700/50 backdrop-blur-sm">
              <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">{c.user?.name || "User"}</div>
              <div className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{c.text}</div>
            </div>
          ))}
        </div>
        {user ? (
          <div className="mt-6">
            <textarea 
              value={comment} 
              onChange={e=>setComment(e.target.value)} 
              className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-background-dark-card text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:border-brand-500 dark:focus:border-accent-dark focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-accent-dark/20 transition-all resize-none" 
              placeholder="Add a comment..."
              rows="3"
            />
            <button onClick={addComment} className="mt-3 px-4 py-2 bg-brand-500 hover:bg-brand-600 dark:bg-accent-dark dark:hover:bg-accent-dark/90 text-white rounded-md transition-colors font-medium shadow-sm">
              Submit Comment
            </button>
          </div>
        ) : (
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Please login to comment.</p>
        )}
      </div>
    </div>
  );
}

