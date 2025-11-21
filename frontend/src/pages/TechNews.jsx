import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API from "../api/axiosClient";
import AnimatedCard from "../components/AnimatedCard";
import SkeletonCard from "../components/SkeletonCard";
import { toast } from "react-toastify";

export default function TechNews() {
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchNews = async () => {
    try {
      setError(null);
      const { data } = await API.get("/api/news");
      if (data.success) {
        setNews(data.data || []);
        setLastUpdated(data.lastUpdated);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || err.message || "Failed to load tech news";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    
    // Auto-refresh every 5 minutes if enabled
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchNews();
      }, 5 * 60 * 1000); // 5 minutes
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh]);

  const handleRefresh = () => {
    setLoading(true);
    fetchNews();
  };

  return (
    <div className="page-transition">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 md:mb-12"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
              📰 Tech News
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">
              Stay updated with the latest technology news and trends
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-brand-500 dark:bg-neon-500 text-white hover:bg-brand-600 dark:hover:bg-neon-600 disabled:opacity-50 disabled:cursor-not-allowed transition-theme"
            >
              {loading ? "Refreshing..." : "🔄 Refresh"}
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg border transition-theme ${
                autoRefresh
                  ? "bg-brand-500/10 dark:bg-neon-500/10 border-brand-500 dark:border-neon-500 text-brand-600 dark:text-neon-400"
                  : "border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400"
              }`}
            >
              {autoRefresh ? "⏸️ Auto-refresh ON" : "▶️ Auto-refresh OFF"}
            </button>
          </div>
        </div>

        {lastUpdated && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </p>
        )}
      </motion.div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {loading && !news ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : !news || news.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="text-6xl mb-4">📰</div>
          <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            No news available
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400">
            Check back later for the latest tech news!
          </p>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {news.map((article, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <AnimatedCard
                title={article.title}
                subtitle={article.source}
                description={article.description}
                meta={new Date(article.publishedAt).toLocaleDateString()}
                onClick={() => window.open(article.url, "_blank", "noopener,noreferrer")}
              >
                {article.imageUrl && (
                  <div className="mt-4 mb-2">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                  <span>{article.author || "Anonymous"}</span>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-500 dark:text-neon-400 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Read more →
                  </a>
                </div>
              </AnimatedCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

