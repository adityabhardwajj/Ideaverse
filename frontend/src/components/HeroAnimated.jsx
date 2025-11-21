import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import ButtonMinimal from "./ButtonMinimal";

export default function HeroAnimated({ 
  title = "Welcome to IdeaVerse", 
  subtitle = "Where creators, freelancers, and recruiters connect to turn ideas into impact." 
}) {
  const titleWords = title.split(" ");
  const lastWord = titleWords.pop();
  const restTitle = titleWords.join(" ");

  return (
    <section className="relative flex flex-col items-center justify-center text-center py-16 sm:py-24 md:py-32 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-neutral-50/50 to-transparent dark:from-bg-dark dark:via-purple-950/20 dark:to-transparent pointer-events-none" />
      
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl float-animation pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl float-animation pointer-events-none" style={{ animationDelay: '2s' }} />
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.h1
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-neutral-900 dark:text-white mb-6 leading-tight"
        >
          {restTitle}{" "}
          <span className="gradient-text inline-block">
            {lastWord}
          </span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-neutral-600 dark:text-neutral-300 text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto mb-10 sm:mb-12 leading-relaxed px-4"
        >
          {subtitle}
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center items-center px-4"
        >
          <Link to="/register" className="w-full sm:w-auto">
            <motion.div 
              whileHover={{ scale: 1.05, y: -2 }} 
              whileTap={{ scale: 0.98 }} 
              className="w-full sm:w-auto"
            >
              <ButtonMinimal className="w-full sm:w-auto text-base px-8 py-4 shadow-lg">
                Get Started
              </ButtonMinimal>
            </motion.div>
          </Link>
          <Link to="/ideas" className="w-full sm:w-auto">
            <motion.div 
              whileHover={{ scale: 1.05, y: -2 }} 
              whileTap={{ scale: 0.98 }} 
              className="w-full sm:w-auto"
            >
              <ButtonMinimal variant="ghost" className="w-full sm:w-auto text-base px-8 py-4">
                Explore Ideas
              </ButtonMinimal>
            </motion.div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
        >
          {[
            { icon: "💡", text: "Share Ideas" },
            { icon: "💼", text: "Find Jobs" },
            { icon: "🚀", text: "Build Together" },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="p-4 rounded-xl glass-card"
            >
              <div className="text-3xl mb-2">{feature.icon}</div>
              <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {feature.text}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

