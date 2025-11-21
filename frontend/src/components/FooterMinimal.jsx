import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function FooterMinimal() {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white/80 dark:bg-bg-panel/80 backdrop-blur-xl border-t border-neutral-200/50 dark:border-purple-900/30 mt-16"
    >
      <div className="container-wide py-8 md:py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">IdeaVerse</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Where Ideas Meet Opportunity. Connect, collaborate, and innovate.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/ideas"
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-neon-400 transition-theme"
                >
                  Ideas
                </Link>
              </li>
              <li>
                <Link
                  to="/jobs"
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-neon-400 transition-theme"
                >
                  Jobs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-neon-400 transition-theme"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-neon-400 transition-theme"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-neon-400 transition-theme"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy"
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-neon-400 transition-theme"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-neon-400 transition-theme"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-200/50 dark:border-purple-900/30 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            © {currentYear} IdeaVerse. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="text-neutral-600 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-neon-400 transition-theme"
              aria-label="Twitter"
            >
              Twitter
            </a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
