import React from "react";

/**
 * Password strength indicator component
 */
export default function PasswordStrengthIndicator({ password }) {
  const getStrength = (pwd) => {
    if (!pwd) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[@$!%*?&]/.test(pwd)) strength++;

    if (strength <= 2) return { strength: 1, label: "Weak", color: "bg-red-500" };
    if (strength <= 4) return { strength: 2, label: "Fair", color: "bg-yellow-500" };
    if (strength <= 5) return { strength: 3, label: "Good", color: "bg-blue-500" };
    return { strength: 4, label: "Strong", color: "bg-green-500" };
  };

  const { strength, label, color } = getStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              level <= strength ? color : "bg-neutral-200 dark:bg-neutral-700"
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
      <p className="text-xs text-neutral-600 dark:text-neutral-400">
        Password strength: <span className="font-medium">{label}</span>
      </p>
    </div>
  );
}

