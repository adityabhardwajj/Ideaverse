import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How do I create an account?",
      answer:
        "Click on 'Sign Up' in the navigation bar, fill in your details (name, email, password), choose your role (creator, freelancer, or recruiter), and verify your email address.",
    },
    {
      question: "What roles are available?",
      answer:
        "IdeaVerse supports four roles: Creator (share ideas and collaborate), Freelancer (apply to jobs), Recruiter (post jobs and find talent), and Admin (platform management).",
    },
    {
      question: "How do I post an idea?",
      answer:
        "After logging in, click 'Create Idea' in the navigation. Fill in the title, description, and add relevant tags. Your idea will be visible to the community once posted.",
    },
    {
      question: "How do I apply for a job?",
      answer:
        "Browse jobs on the Jobs page, click on a job that interests you, and click 'Apply'. You can add a cover letter, portfolio URL, and expected budget.",
    },
    {
      question: "How does the chat feature work?",
      answer:
        "Chat rooms are automatically created for projects and jobs. Click on 'Messages' in the navigation or use the chat button on an idea/job to start collaborating in real-time.",
    },
    {
      question: "Can I edit or delete my ideas?",
      answer:
        "Yes! You can edit or delete your own ideas. Admins can also manage all ideas on the platform. Click the Edit or Delete button on your idea card.",
    },
    {
      question: "How do I reset my password?",
      answer:
        "Click 'Forgot password?' on the login page, enter your email, and check your inbox for a password reset link. The link expires after 1 hour.",
    },
    {
      question: "Is my email verified automatically?",
      answer:
        "No, you'll receive a verification email after registration. Click the link in the email to verify your account. You can request a new verification email if needed.",
    },
  ];

  return (
    <div className="page-transition max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 md:mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg">
          Find answers to common questions about IdeaVerse
        </p>
      </motion.div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card rounded-2xl overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-neutral-100/50 dark:hover:bg-purple-900/10 transition-theme"
              aria-expanded={openIndex === index}
            >
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white pr-4">
                {faq.question}
              </h3>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="flex-shrink-0"
              >
                <svg
                  className="w-5 h-5 text-neutral-600 dark:text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.div>
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 text-neutral-600 dark:text-neutral-400">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

