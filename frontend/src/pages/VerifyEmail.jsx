import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api/axiosClient";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError("Invalid verification link");
        setLoading(false);
        return;
      }

      try {
        const { data } = await API.get(`/api/auth/verify-email?token=${token}`);
        if (data.success) {
          setVerified(true);
          toast.success(data.message || "Email verified successfully");
        }
      } catch (error) {
        const errorMsg =
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to verify email";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="w-12 h-12 border-4 border-brand-500 dark:border-neon-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-neutral-600 dark:text-neutral-400">Verifying your email...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {verified ? (
        <div className="glass-card p-6 rounded-xl text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Email Verified!
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Your email has been successfully verified. You can now use all features of IdeaVerse.
          </p>
          <Link
            to="/ideas"
            className="inline-block px-6 py-2 bg-brand-500 dark:bg-neon-500 text-white rounded-lg hover:bg-brand-600 dark:hover:bg-neon-600 transition-theme"
          >
            Go to Ideas
          </Link>
        </div>
      ) : (
        <div className="glass-card p-6 rounded-xl text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Verification Failed
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            {error || "The verification link is invalid or has expired."}
          </p>
          <Link
            to="/login"
            className="text-brand-500 dark:text-neon-400 hover:underline"
          >
            Back to login
          </Link>
        </div>
      )}
    </div>
  );
}

