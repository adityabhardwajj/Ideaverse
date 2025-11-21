import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api/axiosClient";
import InputMinimal from "../components/InputMinimal";
import ButtonMinimal from "../components/ButtonMinimal";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await API.post("/api/auth/request-password-reset", { email });
      if (data.success) {
        setSent(true);
        toast.success(data.message || "Password reset link sent to your email");
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to send reset email";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
        Reset Password
      </h2>

      {sent ? (
        <div className="glass-card p-6 rounded-xl text-center">
          <div className="text-5xl mb-4">📧</div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
            Check your email
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            We've sent a password reset link to {email}
          </p>
          <Link
            to="/login"
            className="text-brand-500 dark:text-neon-400 hover:underline"
          >
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          <InputMinimal
            label="Email"
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <ButtonMinimal type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </ButtonMinimal>
          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-brand-500 dark:text-neon-400 hover:underline"
            >
              Back to login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

