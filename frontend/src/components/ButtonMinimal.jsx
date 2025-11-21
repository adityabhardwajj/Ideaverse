import React from "react";
import clsx from "clsx";

/**
 * Props:
 * - variant: 'primary' | 'ghost'
 * - size: 'sm' | 'md'
 */
export default function ButtonMinimal({ children, variant = "primary", size = "md", className, ...props }) {
  const base = "inline-flex items-center justify-center font-medium rounded-xl transition-theme focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-900";
  const variants = {
    primary: "bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-300 dark:bg-neon-500 dark:hover:bg-neon-600 dark:focus:ring-neon-400/50 shadow-sm hover:shadow-md dark:neon-glow dark:hover:shadow-glow-lg",
    ghost: "bg-transparent text-brand-600 dark:text-neutral-300 border border-neutral-300 dark:border-purple-800/50 hover:bg-neutral-50 dark:hover:bg-purple-900/20 hover:border-brand-500 dark:hover:border-neon-500 hover:text-brand-500 dark:hover:text-neon-400 focus:ring-neutral-200 dark:focus:ring-neon-600",
  };
  const sizes = { sm: "text-sm px-3 py-1", md: "text-sm px-4 py-2" };
  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

