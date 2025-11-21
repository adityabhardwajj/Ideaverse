import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function AnimatedCard({ title, description, tags, to, subtitle, meta, children, onClick, onOpen }) {
  const handleClick = () => {
    if (onOpen) {
      onOpen();
    } else if (onClick) {
      onClick();
    }
  };

  const CardContent = (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.2, 0.9, 0.3, 1],
        layout: { duration: 0.3 }
      }}
      onClick={handleClick}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && (onOpen || onClick)) {
          e.preventDefault();
          handleClick();
        }
      }}
      role={onOpen || onClick ? "button" : undefined}
      tabIndex={onOpen || onClick ? 0 : undefined}
      className="relative p-6 md:p-7 bg-neutral-50/80 dark:glass-card rounded-2xl shadow-sm dark:shadow-neon-lg hover:shadow-md dark:hover:shadow-glow-lg cursor-pointer border border-neutral-200/60 dark:border-purple-900/30 group transition-theme overflow-hidden backdrop-blur-sm"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:via-purple-500/3 group-hover:to-purple-500/5 transition-all duration-500 rounded-2xl pointer-events-none" />
      
      <div className="relative z-10">
        <h3 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white mb-2 group-hover:text-brand-500 dark:group-hover:text-neon-400 transition-theme line-clamp-2">
          {to ? (
            <Link to={to} className="hover:underline block">
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>
        
        {subtitle && (
          <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 mb-3 font-medium">
            {subtitle}
          </div>
        )}
        
        {description && (
          <p className="text-neutral-600 dark:text-neutral-300 text-sm md:text-base mb-5 leading-relaxed line-clamp-3">
            {description}
          </p>
        )}
        
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, 4).map((tag, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.1 }}
                className="neon-tag"
              >
                #{tag}
              </motion.span>
            ))}
            {tags.length > 4 && (
              <span className="neon-tag opacity-60">
                +{tags.length - 4}
              </span>
            )}
          </div>
        )}
        
        {children}
        
        {meta && (
          <div className="mt-5 pt-4 border-t border-neutral-200/50 dark:border-purple-900/30 text-xs text-neutral-500 dark:text-neutral-400">
            {meta}
          </div>
        )}
      </div>
    </motion.div>
  );

  return CardContent;
}

