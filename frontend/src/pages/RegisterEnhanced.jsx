import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import API from "../api/axiosClient";
import { useAuth } from "../hooks/useAuth";
import FormField, { validators } from "../components/FormField";
import PasswordStrengthIndicator from "../components/PasswordStrengthIndicator";
import ButtonMinimal from "../components/ButtonMinimal";

export default function RegisterEnhanced() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "creator",
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

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (form.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailValidation = validators.email()(form.email);
      if (emailValidation !== true) {
        newErrors.email = emailValidation || "Please enter a valid email address";
      }
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else {
      const passwordValidation = validators.password()(form.password);
      if (passwordValidation !== true) {
        newErrors.password = passwordValidation;
      }
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      const { data } = await API.post("/api/users/register", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      });

      if (data.success) {
        login(data.data, data.data.token, data.data.refreshToken);
        toast.success(data.message || "Registration successful! Please verify your email.");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Registration error:", error);
      
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        errorMessage = "Network error: Cannot connect to server. Please make sure the backend server is running.";
      } else if (error.response) {
        // Handle rate limiting (429 status)
        if (error.response.status === 429) {
          const retryAfter = error.response?.data?.error?.retryAfter;
          if (retryAfter) {
            const retryDate = new Date(retryAfter);
            const minutesLeft = Math.ceil((retryDate.getTime() - Date.now()) / (1000 * 60));
            errorMessage = `Too many signup attempts. Please wait ${minutesLeft} minute(s) before trying again.`;
          } else {
            errorMessage = "Too many signup attempts. Please wait 15 minutes before trying again.";
          }
        } else {
          errorMessage = 
            error.response?.data?.error?.message || 
            error.response?.data?.message || 
            `Server error: ${error.response.status} ${error.response.statusText}`;

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
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
              Create Account
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Join IdeaVerse and start collaborating
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <FormField
              id="name"
              label="Full Name"
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              error={errors.name}
              required
              placeholder="John Doe"
              validationRules={[
                validators.required("Name is required"),
                validators.minLength(3, "Name must be at least 3 characters"),
              ]}
              aria-label="Full name"
            />

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
            />

            <div>
              <FormField
                id="password"
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                error={errors.password}
                required
                placeholder="Create a strong password"
                validationRules={[validators.required("Password is required"), validators.password()]}
                aria-label="Password"
                autoComplete="new-password"
              />
              {form.password && <PasswordStrengthIndicator password={form.password} />}
            </div>

            <FormField
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              error={errors.confirmPassword}
              required
              placeholder="Confirm your password"
              validationRules={[
                validators.required("Please confirm your password"),
                validators.match(form.password, "Passwords do not match"),
              ]}
              aria-label="Confirm password"
              autoComplete="new-password"
            />

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
              >
                Role
              </label>
              <select
                id="role"
                value={form.role}
                onChange={(e) => handleChange("role", e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-purple-800/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:border-brand-500 dark:focus:border-neon-500 focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-neon-500/20 transition-all"
                aria-label="Select your role"
              >
                <option value="creator">Creator</option>
                <option value="freelancer">Freelancer</option>
                <option value="recruiter">Recruiter</option>
              </select>
            </div>

            <ButtonMinimal type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </ButtonMinimal>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-brand-500 dark:text-neon-400 hover:text-brand-600 dark:hover:text-neon-300 font-medium transition-theme"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

