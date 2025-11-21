import React from "react";

/**
 * Skip link for keyboard navigation accessibility
 */
export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-500 dark:focus:bg-neon-500 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/50 dark:focus:ring-neon-500/50"
    >
      Skip to main content
    </a>
  );
}

