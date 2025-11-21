import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api/axiosClient";
import { useAuth } from "../hooks/useAuth";
import InputMinimal from "../components/InputMinimal";
import ButtonMinimal from "../components/ButtonMinimal";

export default function EditIdea() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", tags: "" });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIdea = async () => {
      try {
        const { data } = await API.get(`/api/ideas/${id}`);
        if (data.success) {
          const idea = data.data;
          if (user._id !== idea.createdBy?._id && user.role !== "admin") {
            toast.error("You don't have permission to edit this idea");
            navigate("/ideas");
            return;
          }
          setForm({
            title: idea.title || "",
            description: idea.description || "",
            tags: (idea.tags || []).join(", "),
          });
        }
      } catch (err) {
        const errorMsg = err.response?.data?.error?.message || "Failed to load idea";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchIdea();
    }
  }, [id, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const payload = {
        title: form.title,
        description: form.description,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
      };

      const { data } = await API.put(`/api/ideas/${id}`, payload);
      if (data.success) {
        toast.success("Idea updated successfully");
        navigate(`/ideas/${id}`);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || "Failed to update idea";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-brand-500 dark:border-neon-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">Edit Idea</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <InputMinimal
          label="Title"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Enter idea title"
        />

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Description
          </label>
          <textarea
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe your idea..."
            className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-background-dark-card text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:border-brand-500 dark:focus:border-accent-dark focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-accent-dark/20 transition-all resize-none"
            rows="8"
          />
        </div>

        <InputMinimal
          label="Tags (comma separated)"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          placeholder="tag1, tag2, tag3"
        />

        <div className="flex gap-3">
          <ButtonMinimal type="submit" className="flex-1">
            Update Idea
          </ButtonMinimal>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-background-dark-card text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

