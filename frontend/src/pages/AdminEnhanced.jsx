import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import API from "../api/axiosClient";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import AnimatedCard from "../components/AnimatedCard";

export default function AdminEnhanced() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  
  const [users, setUsers] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [jobs, setJobs] = useState([]);
  
  const [usersPagination, setUsersPagination] = useState({ page: 1, totalPages: 1 });
  const [ideasPagination, setIdeasPagination] = useState({ page: 1, totalPages: 1 });
  const [jobsPagination, setJobsPagination] = useState({ page: 1, totalPages: 1 });
  
  const [usersSearch, setUsersSearch] = useState("");
  const [ideasSearch, setIdeasSearch] = useState("");
  const [jobsSearch, setJobsSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    if (activeTab === "ideas") fetchIdeas();
    if (activeTab === "jobs") fetchJobs();
  }, [activeTab, usersPagination.page, ideasPagination.page, jobsPagination.page]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/api/admin/stats");
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: usersPagination.page.toString(),
        limit: "20",
      });
      if (usersSearch) params.append("search", usersSearch);

      const { data } = await API.get(`/api/admin/users?${params.toString()}`);
      if (data.success) {
        setUsers(data.data.users || []);
        setUsersPagination(data.data.meta || { page: 1, totalPages: 1 });
      }
    } catch (error) {
      toast.error("Failed to load users");
    }
  };

  const fetchIdeas = async () => {
    try {
      const params = new URLSearchParams({
        page: ideasPagination.page.toString(),
        limit: "20",
      });
      if (ideasSearch) params.append("search", ideasSearch);

      const { data } = await API.get(`/api/admin/ideas?${params.toString()}`);
      if (data.success) {
        setIdeas(data.data.ideas || []);
        setIdeasPagination(data.data.meta || { page: 1, totalPages: 1 });
      }
    } catch (error) {
      toast.error("Failed to load ideas");
    }
  };

  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams({
        page: jobsPagination.page.toString(),
        limit: "20",
      });
      if (jobsSearch) params.append("search", jobsSearch);

      const { data } = await API.get(`/api/admin/jobs?${params.toString()}`);
      if (data.success) {
        setJobs(data.data.jobs || []);
        setJobsPagination(data.data.meta || { page: 1, totalPages: 1 });
      }
    } catch (error) {
      toast.error("Failed to load jobs");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await API.delete(`/api/admin/users/${userId}`);
      setUsers(users.filter((u) => (u.id || u._id) !== userId));
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.error?.message || "Failed to delete user");
    }
  };

  const handleDeleteIdea = async (ideaId) => {
    try {
      await API.delete(`/api/admin/ideas/${ideaId}`);
      setIdeas(ideas.filter((i) => (i.id || i._id) !== ideaId));
      toast.success("Idea deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.error?.message || "Failed to delete idea");
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await API.delete(`/api/admin/jobs/${jobId}`);
      setJobs(jobs.filter((j) => (j.id || j._id) !== jobId));
      toast.success("Job deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.error?.message || "Failed to delete job");
    }
  };

  const handleBlockUser = async (userId, currentStatus) => {
    try {
      await API.put(`/api/admin/users/${userId}/block`);
      setUsers(
        users.map((u) => ((u.id || u._id) === userId ? { ...u, isBlocked: !currentStatus } : u))
      );
      toast.success(currentStatus ? "User unblocked" : "User blocked");
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  if (!user || user.role !== "admin") return null;

  const { stats, recent } = dashboardData || {};

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "ideas", label: "Ideas", icon: "💡" },
    { id: "jobs", label: "Jobs", icon: "💼" },
  ];

  return (
    <div className="page-transition">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 md:mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
          Admin Dashboard
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg">
          Welcome, {user.name}! Manage your IdeaVerse platform
        </p>
      </motion.div>

      <div className="flex gap-2 mb-6 border-b border-neutral-200/50 dark:border-purple-900/30 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-theme whitespace-nowrap ${
              activeTab === tab.id
                ? "text-brand-500 dark:text-neon-400 border-b-2 border-brand-500 dark:border-neon-400"
                : "text-neutral-600 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-neon-400"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {loading && activeTab === "overview" ? (
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-brand-500 dark:border-neon-500 border-t-transparent rounded-full"
          />
        </div>
      ) : (
        <>
          {activeTab === "overview" && stats && (
            <>
              <div className="grid md:grid-cols-4 gap-6 md:gap-8 mb-10">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card rounded-2xl p-6 md:p-8"
                >
                  <div className="text-4xl mb-4">👥</div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                    {stats.totalUsers || 0}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">Total Users</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card rounded-2xl p-6 md:p-8"
                >
                  <div className="text-4xl mb-4">💡</div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                    {stats.totalIdeas || 0}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">Total Ideas</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card rounded-2xl p-6 md:p-8"
                >
                  <div className="text-4xl mb-4">💼</div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                    {stats.totalJobs || 0}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">Total Jobs</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="glass-card rounded-2xl p-6 md:p-8"
                >
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                    {stats.usersByRole
                      ? Object.values(stats.usersByRole).reduce((a, b) => a + b, 0)
                      : 0}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">Active Roles</p>
                </motion.div>
              </div>

              {stats.usersByRole && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="glass-card rounded-2xl p-6 md:p-8 mb-10"
                >
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                    Users by Role
                  </h2>
                  <div className="grid md:grid-cols-4 gap-4">
                    {Object.entries(stats.usersByRole).map(([role, count]) => (
                      <div
                        key={role}
                        className="p-4 rounded-lg bg-neutral-100 dark:bg-purple-900/20"
                      >
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 capitalize mb-1">
                          {role}
                        </p>
                        <p className="text-2xl font-bold text-neutral-900 dark:text-white">{count}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {recent && (
                <div className="grid md:grid-cols-3 gap-6">
                  {recent.users && recent.users.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card rounded-2xl p-6"
                    >
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                        Recent Users
                      </h3>
                      <div className="space-y-2">
                        {recent.users.slice(0, 5).map((u) => (
                          <div
                            key={u.id || u._id}
                            className="p-2 rounded-lg bg-neutral-100 dark:bg-purple-900/20"
                          >
                            <p className="font-medium text-neutral-900 dark:text-white">{u.name}</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{u.email}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {recent.ideas && recent.ideas.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="glass-card rounded-2xl p-6"
                    >
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                        Recent Ideas
                      </h3>
                      <div className="space-y-2">
                        {recent.ideas.slice(0, 5).map((idea) => (
                          <div
                            key={idea.id || idea._id}
                            className="p-2 rounded-lg bg-neutral-100 dark:bg-purple-900/20"
                          >
                            <p className="font-medium text-neutral-900 dark:text-white truncate">
                              {idea.title}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              By {idea.createdBy?.name || "Unknown"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {recent.jobs && recent.jobs.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="glass-card rounded-2xl p-6"
                    >
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                        Recent Jobs
                      </h3>
                      <div className="space-y-2">
                        {recent.jobs.slice(0, 5).map((job) => (
                          <div
                            key={job.id || job._id}
                            className="p-2 rounded-lg bg-neutral-100 dark:bg-purple-900/20"
                          >
                            <p className="font-medium text-neutral-900 dark:text-white truncate">
                              {job.title}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              By {job.postedBy?.name || "Unknown"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="flex gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setUsersPagination({ ...usersPagination, page: 1 });
                      fetchUsers();
                    }
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-purple-800/50 text-neutral-900 dark:text-white"
                />
                <button
                  onClick={fetchUsers}
                  className="px-4 py-2 bg-brand-500 dark:bg-neon-500 text-white rounded-lg hover:bg-brand-600 dark:hover:bg-neon-600"
                >
                  Search
                </button>
              </div>

              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-100 dark:bg-purple-900/20">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          Name
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          Email
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          Role
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          Joined
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => {
                        const userId = u.id || u._id;
                        const currentUserId = user?.id || user?._id;
                        return (
                          <tr
                            key={userId}
                            className="border-b border-neutral-200/50 dark:border-purple-900/30 hover:bg-neutral-100/50 dark:hover:bg-purple-900/10"
                          >
                            <td className="py-3 px-4 text-neutral-900 dark:text-white">{u.name}</td>
                            <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">{u.email}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                                  u.role === "admin"
                                    ? "bg-purple-500/20 text-purple-400"
                                    : u.role === "recruiter"
                                    ? "bg-blue-500/20 text-blue-400"
                                    : u.role === "freelancer"
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-neutral-500/20 text-neutral-400"
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  u.isBlocked
                                    ? "bg-red-500/20 text-red-400"
                                    : "bg-green-500/20 text-green-400"
                                }`}
                              >
                                {u.isBlocked ? "Blocked" : "Active"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400 text-sm">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                {userId !== currentUserId && (
                                  <>
                                    <button
                                      onClick={() => handleBlockUser(userId, u.isBlocked)}
                                      className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/30"
                                    >
                                      {u.isBlocked ? "Unblock" : "Block"}
                                    </button>
                                    <button
                                      onClick={() => setDeleteTarget({ type: "user", id: userId })}
                                      className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/30"
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {usersPagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 p-4 border-t border-neutral-200/50 dark:border-purple-900/30">
                    <button
                      onClick={() =>
                        setUsersPagination({ ...usersPagination, page: usersPagination.page - 1 })
                      }
                      disabled={usersPagination.page === 1}
                      className="px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-purple-800/50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2">
                      Page {usersPagination.page} of {usersPagination.totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setUsersPagination({ ...usersPagination, page: usersPagination.page + 1 })
                      }
                      disabled={usersPagination.page >= usersPagination.totalPages}
                      className="px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-purple-800/50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "ideas" && (
            <div className="space-y-4">
              <div className="flex gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Search ideas..."
                  value={ideasSearch}
                  onChange={(e) => setIdeasSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setIdeasPagination({ ...ideasPagination, page: 1 });
                      fetchIdeas();
                    }
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-purple-800/50 text-neutral-900 dark:text-white"
                />
                <button
                  onClick={fetchIdeas}
                  className="px-4 py-2 bg-brand-500 dark:bg-neon-500 text-white rounded-lg hover:bg-brand-600 dark:hover:bg-neon-600"
                >
                  Search
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ideas.map((idea) => {
                  const ideaId = idea.id || idea._id;
                  return (
                    <AnimatedCard
                      key={ideaId}
                      title={idea.title}
                      description={idea.description?.slice(0, 100)}
                      subtitle={`By ${idea.createdBy?.name || "Unknown"}`}
                      tags={idea.tags}
                      meta={new Date(idea.createdAt).toLocaleDateString()}
                    >
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => navigate(`/ideas/${ideaId}`)}
                          className="flex-1 px-3 py-1 text-xs bg-brand-500 dark:bg-neon-500 text-white rounded hover:bg-brand-600 dark:hover:bg-neon-600"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ type: "idea", id: ideaId })}
                          className="px-3 py-1 text-xs bg-red-500/20 text-red-600 dark:text-red-400 rounded hover:bg-red-500/30"
                        >
                          Delete
                        </button>
                      </div>
                    </AnimatedCard>
                  );
                })}
              </div>

              {ideasPagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() =>
                      setIdeasPagination({ ...ideasPagination, page: ideasPagination.page - 1 })
                    }
                    disabled={ideasPagination.page === 1}
                    className="px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-purple-800/50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2">
                    Page {ideasPagination.page} of {ideasPagination.totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setIdeasPagination({ ...ideasPagination, page: ideasPagination.page + 1 })
                    }
                    disabled={ideasPagination.page >= ideasPagination.totalPages}
                    className="px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-purple-800/50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "jobs" && (
            <div className="space-y-4">
              <div className="flex gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={jobsSearch}
                  onChange={(e) => setJobsSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setJobsPagination({ ...jobsPagination, page: 1 });
                      fetchJobs();
                    }
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-purple-800/50 text-neutral-900 dark:text-white"
                />
                <button
                  onClick={fetchJobs}
                  className="px-4 py-2 bg-brand-500 dark:bg-neon-500 text-white rounded-lg hover:bg-brand-600 dark:hover:bg-neon-600"
                >
                  Search
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => {
                  const jobId = job.id || job._id;
                  return (
                    <AnimatedCard
                      key={jobId}
                      title={job.title}
                      description={job.description?.slice(0, 100)}
                      subtitle={`By ${job.postedBy?.name || "Unknown"}`}
                      tags={job.skills}
                      meta={job.budgetRange || "No budget specified"}
                    >
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => navigate(`/jobs/${jobId}`)}
                          className="flex-1 px-3 py-1 text-xs bg-brand-500 dark:bg-neon-500 text-white rounded hover:bg-brand-600 dark:hover:bg-neon-600"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ type: "job", id: jobId })}
                          className="px-3 py-1 text-xs bg-red-500/20 text-red-600 dark:text-red-400 rounded hover:bg-red-500/30"
                        >
                          Delete
                        </button>
                      </div>
                    </AnimatedCard>
                  );
                })}
              </div>

              {jobsPagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() =>
                      setJobsPagination({ ...jobsPagination, page: jobsPagination.page - 1 })
                    }
                    disabled={jobsPagination.page === 1}
                    className="px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-purple-800/50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2">
                    Page {jobsPagination.page} of {jobsPagination.totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setJobsPagination({ ...jobsPagination, page: jobsPagination.page + 1 })
                    }
                    disabled={jobsPagination.page >= jobsPagination.totalPages}
                    className="px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-purple-800/50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {deleteTarget && (
        <ConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            if (deleteTarget.type === "user") {
              handleDeleteUser(deleteTarget.id);
            } else if (deleteTarget.type === "idea") {
              handleDeleteIdea(deleteTarget.id);
            } else if (deleteTarget.type === "job") {
              handleDeleteJob(deleteTarget.id);
            }
            setDeleteTarget(null);
          }}
          title={`Delete ${deleteTarget.type}`}
          message={`Are you sure you want to delete this ${deleteTarget.type}? This action cannot be undone.`}
          confirmText="Delete"
          danger={true}
        />
      )}
    </div>
  );
}

