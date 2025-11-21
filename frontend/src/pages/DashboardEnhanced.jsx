import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axiosClient";
import { useAuth } from "../hooks/useAuth";
import InputMinimal from "../components/InputMinimal";
import ButtonMinimal from "../components/ButtonMinimal";
import AnimatedCard from "../components/AnimatedCard";
import ConfirmModal from "../components/ConfirmModal";
import ChatRoom from "../components/ChatRoom";

export default function DashboardEnhanced() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    headline: "",
    bio: "",
    skills: "",
  });
  const [profileError, setProfileError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(null);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/api/users/dashboard");
        if (data.success) {
          setDashboardData(data.data);
          setProfileForm({
            name: data.data.user.name || "",
            email: data.data.user.email || "",
            headline: data.data.user.headline || "",
            bio: data.data.user.bio || "",
            skills: data.data.user.skills?.join(", ") || "",
          });
        }
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    try {
      const payload = {
        ...profileForm,
        skills: profileForm.skills.split(",").map((s) => s.trim()).filter(Boolean),
      };
      const { data } = await API.put("/api/users/profile", payload);
      if (data.success) {
        login(data.data, localStorage.getItem("ideaverse_token"));
        setProfileSuccess("Profile updated successfully!");
        setEditMode(false);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || "Failed to update profile";
      setProfileError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const openProjectChat = async (ideaId) => {
    try {
      const { data } = await API.get(`/api/chat/project/${ideaId}`);
      if (data.success) {
        setSelectedChatRoom(data.data._id);
      }
    } catch (error) {
      toast.error("Failed to open chat");
    }
  };

  const openJobChat = async (jobId) => {
    try {
      const { data } = await API.get(`/api/chat/job/${jobId}`);
      if (data.success) {
        setSelectedChatRoom(data.data._id);
      }
    } catch (error) {
      toast.error("Failed to open chat");
    }
  };

  if (!user) {
    return null;
  }

  const { stats, ideas, jobsPosted, applications } = dashboardData || {};
  const isCreator = user.role === "creator";
  const isFreelancer = user.role === "freelancer";
  const isRecruiter = user.role === "recruiter";

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "profile", label: "Profile", icon: "👤" },
    ...(isCreator ? [{ id: "ideas", label: "My Ideas", icon: "💡" }] : []),
    ...(isRecruiter ? [{ id: "jobs", label: "My Jobs", icon: "💼" }] : []),
    ...(isFreelancer ? [{ id: "applications", label: "Applications", icon: "📝" }] : []),
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
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
        transition={{ duration: 0.5 }}
        className="mb-10 md:mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
          {user.name}'s Dashboard
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg">
          Manage your profile, {isCreator && "ideas"}, {isRecruiter && "jobs"}, {isFreelancer && "applications"}
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

      {activeTab === "overview" && (
        <>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-10">
            {isCreator && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card rounded-2xl p-6 md:p-8 text-center"
              >
                <div className="text-4xl mb-4">💡</div>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                  {stats?.ideasCount || 0}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">My Ideas</p>
              </motion.div>
            )}

            {isRecruiter && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-2xl p-6 md:p-8 text-center"
              >
                <div className="text-4xl mb-4">💼</div>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                  {stats?.jobsPostedCount || 0}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">Jobs Posted</p>
              </motion.div>
            )}

            {isFreelancer && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card rounded-2xl p-6 md:p-8 text-center"
              >
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                  {stats?.applicationsCount || 0}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">Applications</p>
              </motion.div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {isCreator && ideas && ideas.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card rounded-2xl p-6"
              >
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                  Recent Ideas
                </h2>
                <div className="space-y-3">
                  {ideas.slice(0, 3).map((idea) => (
                    <Link
                      key={idea._id}
                      to={`/ideas/${idea._id}`}
                      className="block p-3 rounded-lg bg-neutral-100 dark:bg-purple-900/20 hover:bg-neutral-200 dark:hover:bg-purple-900/30 transition-theme"
                    >
                      <p className="font-medium text-neutral-900 dark:text-white truncate">
                        {idea.title}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        {new Date(idea.createdAt).toLocaleDateString()}
                      </p>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}

            {isFreelancer && applications && applications.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card rounded-2xl p-6"
              >
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                  Recent Applications
                </h2>
                <div className="space-y-3">
                  {applications.slice(0, 3).map((app) => (
                    <Link
                      key={app.job._id}
                      to={`/jobs/${app.job._id}`}
                      className="block p-3 rounded-lg bg-neutral-100 dark:bg-purple-900/20 hover:bg-neutral-200 dark:hover:bg-purple-900/30 transition-theme"
                    >
                      <p className="font-medium text-neutral-900 dark:text-white truncate">
                        {app.job.title}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        Status: {app.application.status} •{" "}
                        {new Date(app.application.createdAt).toLocaleDateString()}
                      </p>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </>
      )}

      {activeTab === "profile" && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 md:p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">My Profile</h2>
            <ButtonMinimal onClick={() => setEditMode(!editMode)} variant="secondary">
              {editMode ? "Cancel" : "Edit Profile"}
            </ButtonMinimal>
          </div>

          {profileSuccess && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg">
              {profileSuccess}
            </div>
          )}
          {profileError && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
              {profileError}
            </div>
          )}

          {editMode ? (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <InputMinimal
                label="Name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                required
              />
              <InputMinimal
                label="Email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                required
              />
              <InputMinimal
                label="Headline"
                value={profileForm.headline}
                onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                placeholder="e.g., Full Stack Developer | AI Enthusiast"
              />
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-background-dark-card text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:border-brand-500 dark:focus:border-accent-dark focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-accent-dark/20 transition-all resize-none"
                  rows="4"
                  placeholder="Tell us about yourself..."
                ></textarea>
              </div>
              <InputMinimal
                label="Skills (comma separated)"
                value={profileForm.skills}
                onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                placeholder="e.g., React, Node.js, MongoDB, UI/UX"
              />
              <ButtonMinimal type="submit" className="w-full">
                Save Changes
              </ButtonMinimal>
            </form>
          ) : (
            <div className="space-y-3 text-neutral-700 dark:text-neutral-300">
              <p>
                <span className="font-semibold">Name:</span> {dashboardData?.user.name}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {dashboardData?.user.email}
              </p>
              {dashboardData?.user.headline && (
                <p>
                  <span className="font-semibold">Headline:</span> {dashboardData.user.headline}
                </p>
              )}
              {dashboardData?.user.bio && (
                <p>
                  <span className="font-semibold">Bio:</span> {dashboardData.user.bio}
                </p>
              )}
              {dashboardData?.user.skills?.length > 0 && (
                <p>
                  <span className="font-semibold">Skills:</span> {dashboardData.user.skills.join(", ")}
                </p>
              )}
              <p>
                <span className="font-semibold">Role:</span>{" "}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                    user.role === "admin"
                      ? "bg-purple-500/20 text-purple-400"
                      : user.role === "recruiter"
                      ? "bg-blue-500/20 text-blue-400"
                      : user.role === "freelancer"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-neutral-500/20 text-neutral-400"
                  }`}
                >
                  {user.role}
                </span>
              </p>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === "ideas" && isCreator && (
        <div className="space-y-6">
          {ideas && ideas.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ideas.map((idea) => (
                <AnimatedCard
                  key={idea._id}
                  title={idea.title}
                  description={idea.description?.slice(0, 100)}
                  tags={idea.tags}
                  to={`/ideas/${idea._id}`}
                  meta={new Date(idea.createdAt).toLocaleDateString()}
                >
                  <div className="mt-4 flex gap-2">
                    <Link
                      to={`/ideas/${idea._id}/edit`}
                      className="flex-1 px-3 py-1 text-xs bg-brand-500 dark:bg-neon-500 text-white rounded hover:bg-brand-600 dark:hover:bg-neon-600 text-center"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => openProjectChat(idea._id)}
                      className="flex-1 px-3 py-1 text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-500/30"
                    >
                      💬 Chat
                    </button>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 glass-card rounded-2xl">
              <div className="text-6xl mb-4">💡</div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">No ideas yet</p>
              <Link
                to="/create"
                className="inline-block px-6 py-2 bg-brand-500 dark:bg-neon-500 text-white rounded-lg hover:bg-brand-600 dark:hover:bg-neon-600"
              >
                Create Your First Idea
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === "jobs" && isRecruiter && (
        <div className="space-y-6">
          {jobsPosted && jobsPosted.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobsPosted.map((job) => (
                <AnimatedCard
                  key={job._id}
                  title={job.title}
                  description={job.description?.slice(0, 100)}
                  tags={job.skills}
                  to={`/jobs/${job._id}`}
                  meta={job.budgetRange || "No budget specified"}
                >
                  <div className="mt-4 flex gap-2">
                    <Link
                      to={`/jobs/${job._id}/applications`}
                      className="flex-1 px-3 py-1 text-xs bg-brand-500 dark:bg-neon-500 text-white rounded hover:bg-brand-600 dark:hover:bg-neon-600 text-center"
                    >
                      View Apps ({job.applications?.length || 0})
                    </Link>
                    <button
                      onClick={() => openJobChat(job._id)}
                      className="flex-1 px-3 py-1 text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-500/30"
                    >
                      💬 Chat
                    </button>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 glass-card rounded-2xl">
              <div className="text-6xl mb-4">💼</div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">No jobs posted yet</p>
              <Link
                to="/recruiter"
                className="inline-block px-6 py-2 bg-brand-500 dark:bg-neon-500 text-white rounded-lg hover:bg-brand-600 dark:hover:bg-neon-600"
              >
                Post Your First Job
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === "applications" && isFreelancer && (
        <div className="space-y-6">
          {applications && applications.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applications.map((app) => (
                <AnimatedCard
                  key={app.job._id}
                  title={app.job.title}
                  subtitle={`Posted by ${app.job.postedBy?.name || "Unknown"}`}
                  description={`Status: ${app.application.status}`}
                  meta={new Date(app.application.createdAt).toLocaleDateString()}
                  to={`/jobs/${app.job._id}`}
                >
                  <div className="mt-4">
                    <button
                      onClick={() => openJobChat(app.job._id)}
                      className="w-full px-3 py-1 text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-500/30"
                    >
                      💬 Open Chat
                    </button>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 glass-card rounded-2xl">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">No applications yet</p>
              <Link
                to="/jobs"
                className="inline-block px-6 py-2 bg-brand-500 dark:bg-neon-500 text-white rounded-lg hover:bg-brand-600 dark:hover:bg-neon-600"
              >
                Browse Jobs
              </Link>
            </div>
          )}
        </div>
      )}

      {selectedChatRoom && (
        <ChatRoom roomId={selectedChatRoom} onClose={() => setSelectedChatRoom(null)} />
      )}
    </div>
  );
}

