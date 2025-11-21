import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { motion } from "framer-motion";
import DarkModeNeonToggle from "./DarkModeNeonToggle";

export default function NavMinimal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { to: "/ideas", label: "Ideas" },
    { to: "/jobs", label: "Jobs" },
    { to: "/news", label: "Tech News" },
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white/80 dark:bg-bg-panel/80 backdrop-blur-xl border-b border-neutral-200/50 dark:border-purple-900/30 sticky top-0 z-50 shadow-sm dark:shadow-purple-900/10"
    >
      <div className="container-wide flex items-center justify-between h-16 md:h-18">
        <Link
          to="/"
          className="text-xl md:text-2xl font-bold text-brand-500 dark:text-white gradient-text hover:scale-105 transition-transform duration-300"
        >
          IdeaVerse
        </Link>
        <nav className="flex items-center gap-2 md:gap-4 text-sm">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`hidden sm:inline-block px-3 py-2 rounded-lg font-medium transition-theme relative ${
                  isActive
                    ? "text-brand-500 dark:text-neon-400 bg-brand-50 dark:bg-purple-900/20"
                    : "text-neutral-700 dark:text-neutral-300 hover:text-brand-500 dark:hover:text-neon-400 hover:bg-neutral-100 dark:hover:bg-purple-900/10"
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-brand-100 dark:bg-purple-900/20 rounded-lg -z-10"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
                  <div className="ml-2 md:ml-4">
                    <DarkModeNeonToggle />
                  </div>
                  {user ? (
                    <>
                      <Link
                        to="/chat"
                        className="px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-neon-400 transition-theme font-medium rounded-lg hover:bg-neutral-100 dark:hover:bg-purple-900/10 hidden sm:inline-block"
                      >
                        💬 Messages
                      </Link>
                      <Link
                        to="/create"
                        className="px-4 py-2 border border-neutral-300 dark:border-purple-800/50 rounded-lg hover:bg-neutral-50 dark:hover:bg-purple-900/20 transition-theme text-sm font-medium hidden md:inline-block"
                      >
                        Create Idea
                      </Link>
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="px-4 py-2 bg-purple-600 dark:bg-neon-600 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-neon-700 transition-theme text-sm font-medium hidden md:inline-block neon-glow"
                >
                  Admin
                </Link>
              )}
              {user.role === "recruiter" && (
                <Link
                  to="/recruiter"
                  className="px-4 py-2 border border-neutral-300 dark:border-purple-800/50 rounded-lg hover:bg-neutral-50 dark:hover:bg-purple-900/20 transition-theme text-sm font-medium hidden md:inline-block"
                >
                  Recruiter
                </Link>
              )}
              {user.role === "investor" && (
                <Link
                  to="/investor/discussions"
                  className="px-4 py-2 bg-green-600 dark:bg-green-600 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-700 transition-theme text-sm font-medium hidden md:inline-block"
                >
                  💰 Investor
                </Link>
              )}
              <Link
                to="/dashboard"
                className="px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-neon-400 transition-theme font-medium rounded-lg hover:bg-neutral-100 dark:hover:bg-purple-900/10 hidden sm:inline-block"
              >
                Dashboard
              </Link>
              <span className="px-3 py-2 text-xs text-neutral-500 dark:text-neutral-400 hidden md:inline-block">
                {user.name} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-neon-400 transition-theme rounded-lg hover:bg-neutral-100 dark:hover:bg-purple-900/10"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-neon-400 transition-theme font-medium rounded-lg hover:bg-neutral-100 dark:hover:bg-purple-900/10"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg hover:scale-105 transition-all duration-300 text-sm font-medium bg-brand-500 dark:bg-neon-500 text-white border-transparent hover:bg-brand-600 dark:hover:bg-neon-600 neon-glow dark:neon-glow shadow-lg"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </motion.header>
  );
}
