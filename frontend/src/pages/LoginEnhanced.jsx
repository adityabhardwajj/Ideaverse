import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import API from "../api/axiosClient";
import { useAuth } from "../hooks/useAuth";
import FormField, { validators } from "../components/FormField";
import ButtonMinimal from "../components/ButtonMinimal";

export default function LoginEnhanced() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validators.email()(form.email) === true) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post("/api/users/login", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (data.success) {
        login(data.data, data.data.token, data.data.refreshToken);
        toast.success("Login successful!");
        navigate("/dashboard");
      }
    } catch (error) {
      let errorMessage = "Login failed. Please try again.";
      
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        errorMessage = "Network error: Cannot connect to server. Please make sure the backend server is running.";
      } else if (error.response) {
        // Handle rate limiting (429 status)
        if (error.response.status === 429) {
          const retryAfter = error.response?.data?.error?.retryAfter;
          if (retryAfter) {
            const retryDate = new Date(retryAfter);
            const minutesLeft = Math.ceil((retryDate.getTime() - Date.now()) / (1000 * 60));
            errorMessage = `Too many login attempts. Please wait ${minutesLeft} minute(s) before trying again.`;
          } else {
            errorMessage = "Too many login attempts. Please wait 15 minutes before trying again.";
          }
        } else {
          errorMessage =
            error.response?.data?.error?.message || 
            error.response?.data?.message || 
            "Login failed. Please check your credentials.";

          if (error.response?.data?.error?.details) {
            const fieldErrors = {};
            error.response.data.error.details.forEach((detail) => {
              const field = detail.path || detail.param || detail.field;
              const msg = detail.msg || detail.message;
              if (field && msg) {
                fieldErrors[field] = msg;
              }
            });
            setErrors(fieldErrors);
          }
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check if the backend server is running.";
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-transition min-h-[calc(100vh-8rem)] flex items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Welcome Back</h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Sign in to your IdeaVerse account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <FormField
              id="email"
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              error={errors.email}
              required
              placeholder="john@example.com"
              validationRules={[validators.required("Email is required"), validators.email()]}
              aria-label="Email address"
              autoComplete="email"
              autoFocus
            />

            <FormField
              id="password"
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              error={errors.password}
              required
              placeholder="Enter your password"
              validationRules={[validators.required("Password is required")]}
              aria-label="Password"
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={form.rememberMe}
                  onChange={(e) => handleChange("rememberMe", e.target.checked)}
                  className="w-4 h-4 text-brand-500 dark:text-neon-500 border-neutral-300 dark:border-purple-800/50 rounded focus:ring-brand-500 dark:focus:ring-neon-500"
                  aria-label="Remember me"
                />
                <span className="ml-2 text-sm text-neutral-600 dark:text-neutral-400">
                  Remember me
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-brand-500 dark:text-neon-400 hover:text-brand-600 dark:hover:text-neon-300 transition-theme"
              >
                Forgot password?
              </Link>
            </div>

            <ButtonMinimal type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </ButtonMinimal>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-brand-500 dark:text-neon-400 hover:text-brand-600 dark:hover:text-neon-300 font-medium transition-theme"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

