import React from "react";
import { motion } from "framer-motion";

export default function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card rounded-2xl p-6 md:p-7 border border-purple-900/30"
    >
      <div className="space-y-4">
        <div className="h-6 bg-neutral-800 rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-neutral-800 rounded w-full animate-pulse" />
        <div className="h-4 bg-neutral-800 rounded w-5/6 animate-pulse" />
        <div className="flex gap-2">
          <div className="h-6 bg-neutral-800 rounded-full w-16 animate-pulse" />
          <div className="h-6 bg-neutral-800 rounded-full w-20 animate-pulse" />
        </div>
        <div className="h-4 bg-neutral-800 rounded w-1/2 animate-pulse" />
      </div>
    </motion.div>
  );
}

