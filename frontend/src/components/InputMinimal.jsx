import React from "react";

export default function InputMinimal({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">{label}</label>}
      <input
        className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-background-dark-card text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:border-brand-500 dark:focus:border-accent-dark focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-accent-dark/20 transition-all"
        {...props}
      />
    </div>
  );
}

