import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="page-transition max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 md:mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
          About IdeaVerse
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg">
          Where Ideas Meet Opportunity
        </p>
      </motion.div>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6 md:p-8"
        >
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">Our Mission</h2>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            IdeaVerse is an innovation and freelance collaboration platform designed to bridge the gap
            between creative ideas and real-world execution. We connect creators, freelancers, and
            recruiters to turn innovative concepts into successful projects.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6 md:p-8"
        >
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">What We Offer</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">💡 For Creators</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Share your innovative ideas, get feedback from the community, and find collaborators
                to bring your vision to life.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">💼 For Freelancers</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Discover exciting job opportunities, showcase your skills, and connect with
                recruiters looking for talent.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">🎯 For Recruiters</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Post job listings, find qualified freelancers, and manage applications all in one
                place.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">🚀 Collaboration</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Real-time chat, project management, and seamless communication tools to keep your
                team connected.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6 md:p-8"
        >
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">Get Started</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Join IdeaVerse today and start turning your ideas into reality!
          </p>
          <div className="flex gap-4">
            <Link
              to="/register"
              className="px-6 py-3 bg-brand-500 dark:bg-neon-500 text-white rounded-lg hover:bg-brand-600 dark:hover:bg-neon-600 transition-theme"
            >
              Sign Up
            </Link>
            <Link
              to="/ideas"
              className="px-6 py-3 border border-neutral-300 dark:border-purple-800/50 rounded-lg hover:bg-neutral-100 dark:hover:bg-purple-900/20 transition-theme"
            >
              Explore Ideas
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

