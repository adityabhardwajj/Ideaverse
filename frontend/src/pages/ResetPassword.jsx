import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api/axiosClient";
import InputMinimal from "../components/InputMinimal";
import ButtonMinimal from "../components/ButtonMinimal";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link");
      navigate("/forgot-password");
    }
  }, [token, navigate]);

  const checkPasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength("");
      return;
    }
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSymbol = /[@$!%*?&]/.test(password);
    const hasLength = password.length >= 8;

    if (hasUpper && hasLower && hasDigit && hasSymbol && hasLength) {
      setPasswordStrength("strong");
    } else if ((hasUpper || hasLower) && hasDigit && hasLength) {
      setPasswordStrength("medium");
    } else {
      setPasswordStrength("weak");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { data } = await API.post("/api/auth/reset-password", {
        token,
        newPassword: form.newPassword,
      });
      if (data.success) {
        toast.success(data.message || "Password reset successful");
        navigate("/login");
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to reset password";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
        Set New Password
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <InputMinimal
            label="New Password"
            type="password"
            required
            placeholder="••••••••"
            value={form.newPassword}
            onChange={(e) => {
              setForm({ ...form, newPassword: e.target.value });
              checkPasswordStrength(e.target.value);
            }}
          />
          {passwordStrength && (
            <div className="mt-1 text-xs">
              <span
                className={`${
                  passwordStrength === "strong"
                    ? "text-green-500"
                    : passwordStrength === "medium"
                    ? "text-yellow-500"
                    : "text-red-500"
                }`}
              >
                Password strength: {passwordStrength}
              </span>
              <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                Must contain: uppercase, lowercase, digit, symbol, min 8 chars
              </p>
            </div>
          )}
        </div>

        <InputMinimal
          label="Confirm Password"
          type="password"
          required
          placeholder="••••••••"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
        />

        <ButtonMinimal type="submit" className="w-full" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
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
    </div>
  );
}

