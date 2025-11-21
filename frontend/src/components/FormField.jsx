import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Enhanced form field component with validation feedback
 */
export default function FormField({
  label,
  type = "text",
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  placeholder,
  className = "",
  validationRules = [],
  showValidationOnBlur = true,
  ...props
}) {
  const [touched, setTouched] = useState(false);
  const [focused, setFocused] = useState(false);

  const validate = (val) => {
    if (!validationRules.length) return null;
    for (const rule of validationRules) {
      const result = rule(val);
      if (result !== true) return result;
    }
    return null;
  };

  const shouldShowError = touched && (showValidationOnBlur || focused);
  const validationError = shouldShowError ? validate(value) : null;
  const displayError = error || validationError;

  const handleBlur = (e) => {
    setTouched(true);
    setFocused(false);
    if (props.onBlur) props.onBlur(e);
  };

  const handleFocus = (e) => {
    setFocused(true);
    if (props.onFocus) props.onFocus(e);
  };

  const inputClasses = `
    w-full px-4 py-3 rounded-lg border transition-all duration-200
    bg-white dark:bg-neutral-800
    text-neutral-900 dark:text-neutral-100
    placeholder:text-neutral-400 dark:placeholder:text-neutral-500
    ${
      displayError
        ? "border-red-500 dark:border-red-400 focus:ring-2 focus:ring-red-500/20 dark:focus:ring-red-400/20"
        : focused
        ? "border-brand-500 dark:border-neon-500 focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-neon-500/20"
        : "border-neutral-300 dark:border-purple-800/50 focus:border-brand-500 dark:focus:border-neon-500 focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-neon-500/20"
    }
    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
    ${className}
  `;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={props.id}
          className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          {label}
          {required && (
            <span className="ml-1 text-red-500 dark:text-red-400" aria-label="required">
              *
            </span>
          )}
        </label>
      )}

      {type === "textarea" ? (
        <textarea
          {...props}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          disabled={disabled}
          placeholder={placeholder}
          className={inputClasses}
          aria-invalid={!!displayError}
          aria-describedby={displayError ? `${props.id}-error` : helperText ? `${props.id}-help` : undefined}
        />
      ) : (
        <input
          {...props}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          disabled={disabled}
          placeholder={placeholder}
          className={inputClasses}
          aria-invalid={!!displayError}
          aria-describedby={displayError ? `${props.id}-error` : helperText ? `${props.id}-help` : undefined}
        />
      )}

      <AnimatePresence>
        {displayError && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            id={`${props.id}-error`}
            className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{displayError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {!displayError && helperText && (
        <p id={`${props.id}-help`} className="text-sm text-neutral-500 dark:text-neutral-400">
          {helperText}
        </p>
      )}
    </div>
  );
}

export const validators = {
  required: (message = "This field is required") => (value) => {
    if (!value || (typeof value === "string" && !value.trim())) {
      return message;
    }
    return true;
  },
  minLength: (length, message) => (value) => {
    if (value && value.length < length) {
      return message || `Must be at least ${length} characters`;
    }
    return true;
  },
  maxLength: (length, message) => (value) => {
    if (value && value.length > length) {
      return message || `Must be no more than ${length} characters`;
    }
    return true;
  },
  email: (message = "Please enter a valid email address") => (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return message;
    }
    return true;
  },
  url: (message = "Please enter a valid URL") => (value) => {
    try {
      if (value) new URL(value);
      return true;
    } catch {
      return message;
    }
  },
  password: (message) => {
    const minLength = 8;
    const hasUpper = /[A-Z]/;
    const hasLower = /[a-z]/;
    const hasNumber = /[0-9]/;
    const hasSpecial = /[@$!%*?&]/;

    return (value) => {
      if (!value) return true; // Let required handle empty
      if (value.length < minLength) {
        return message || `Password must be at least ${minLength} characters`;
      }
      if (!hasUpper.test(value)) {
        return message || "Password must contain at least one uppercase letter";
      }
      if (!hasLower.test(value)) {
        return message || "Password must contain at least one lowercase letter";
      }
      if (!hasNumber.test(value)) {
        return message || "Password must contain at least one number";
      }
      if (!hasSpecial.test(value)) {
        return message || "Password must contain at least one special character (@$!%*?&)";
      }
      return true;
    };
  },
  match: (otherValue, message = "Values do not match") => (value) => {
    if (value !== otherValue) {
      return message;
    }
    return true;
  },
};

