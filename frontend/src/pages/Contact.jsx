import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import InputMinimal from "../components/InputMinimal";
import ButtonMinimal from "../components/ButtonMinimal";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      toast.success("Thank you for your message! We'll get back to you soon.");
      setForm({ name: "", email: "", subject: "", message: "" });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="page-transition max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 md:mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
          Contact Us
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg">
          Have a question? We'd love to hear from you!
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6 md:p-8"
        >
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            Get in Touch
          </h2>
          <div className="space-y-4 text-neutral-600 dark:text-neutral-400">
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">Email</h3>
              <p>support@ideaverse.com</p>
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">Response Time</h3>
              <p>We typically respond within 24-48 hours</p>
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">Community</h3>
              <p>Join our community for updates and discussions</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6 md:p-8"
        >
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            Send a Message
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputMinimal
              label="Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <InputMinimal
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <InputMinimal
              label="Subject"
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Message
              </label>
              <textarea
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-background-dark-card text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:border-brand-500 dark:focus:border-accent-dark focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-accent-dark/20 transition-all resize-none"
                rows="6"
                placeholder="Your message..."
              ></textarea>
            </div>
            <ButtonMinimal type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </ButtonMinimal>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

