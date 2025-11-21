import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import API from "../api/axiosClient";
import AnimatedCard from "../components/AnimatedCard";
import SkeletonCard from "../components/SkeletonCard";
import { useNavigate } from "react-router-dom";

export default function Jobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applyingFor, setApplyingFor] = useState(null);
  const [applicationForms, setApplicationForms] = useState({});

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await API.get("/api/jobs?page=1&limit=5");
        if (data.success) {
          // Limit to 5 items maximum
          const jobsList = (data.data || []).slice(0, 5);
          setJobs(jobsList);
        }
      } catch (err) {
        const errorMsg = err.response?.data?.error?.message || err.message || "Failed to load jobs";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const updateForm = (jobId, field, value) => {
    setApplicationForms((prev) => ({
      ...prev,
      [jobId]: {
        ...prev[jobId],
        [field]: value,
      },
    }));
  };

  const apply = async (jobId) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setApplyingFor(jobId);
      const form = applicationForms[jobId] || {};
      const { data } = await API.post(`/api/jobs/${jobId}/apply`, {
        coverLetter: form.coverLetter?.trim() || undefined,
        portfolioUrl: form.portfolioUrl?.trim() || undefined,
        expectedBudget: form.expectedBudget?.trim() || undefined,
      });
      if (data.success) {
        toast.success(data.message || "Application submitted successfully!");
      }
      setApplicationForms((prev) => ({
        ...prev,
        [jobId]: { coverLetter: "", portfolioUrl: "", expectedBudget: "" },
      }));
    } catch (err) {
      let errorMsg = "Failed to submit application. Please check your input and try again.";
      
      if (err.response?.data?.error?.details && Array.isArray(err.response.data.error.details)) {
        const errors = err.response.data.error.details.map(d => d.msg || d.message).join(", ");
        errorMsg = errors || errorMsg;
      } else {
        errorMsg = 
          err.response?.data?.error?.message || 
          err.response?.data?.message || 
          errorMsg;
      }
      
      toast.error(errorMsg);
      console.error("Apply job error:", err);
    } finally {
      setApplyingFor(null);
    }
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
          Jobs & Freelance Projects
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg">
          Find your next opportunity or post a job
        </p>
      </motion.div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : !jobs || jobs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="text-6xl mb-4">💼</div>
          <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            No jobs available
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400">
            Check back later for new opportunities!
          </p>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {jobs.map((job, index) => {
            const form = applicationForms[job._id] || {
              coverLetter: "",
              portfolioUrl: "",
              expectedBudget: "",
            };
            return (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <AnimatedCard
                  title={job.title}
                  subtitle={`Posted by ${job.postedBy?.name || "Unknown"}`}
                  description={job.description?.slice(0, 150) || "No description"}
                  tags={job.skills}
                  meta={
                    job.budgetRange
                      ? `Budget: ${job.budgetRange}`
                      : job.isRemote
                      ? "Remote"
                      : job.location || ""
                  }
                />
                <div className="mt-4 glass-card p-4 rounded-xl border border-purple-900/30">
                  <input
                    type="text"
                    placeholder="Cover letter"
                    value={form.coverLetter}
                    onChange={(e) => updateForm(job._id, "coverLetter", e.target.value)}
                    className="w-full p-2 mb-2 rounded-lg bg-neutral-900/50 dark:bg-neutral-800/50 border border-purple-800/50 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neon-500"
                  />
                  <input
                    type="url"
                    placeholder="Portfolio URL"
                    value={form.portfolioUrl}
                    onChange={(e) => updateForm(job._id, "portfolioUrl", e.target.value)}
                    className="w-full p-2 mb-2 rounded-lg bg-neutral-900/50 dark:bg-neutral-800/50 border border-purple-800/50 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neon-500"
                  />
                  <input
                    type="text"
                    placeholder="Expected budget"
                    value={form.expectedBudget}
                    onChange={(e) => updateForm(job._id, "expectedBudget", e.target.value)}
                    className="w-full p-2 mb-3 rounded-lg bg-neutral-900/50 dark:bg-neutral-800/50 border border-purple-800/50 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neon-500"
                  />
                  <button
                    onClick={() => apply(job._id)}
                    disabled={applyingFor === job._id}
                    className="w-full px-4 py-2 bg-brand-500 dark:bg-neon-500 text-white rounded-lg hover:bg-brand-600 dark:hover:bg-neon-600 transition-theme font-medium disabled:opacity-50 disabled:cursor-not-allowed neon-glow"
                  >
                    {applyingFor === job._id ? "Applying..." : "Apply Now"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

