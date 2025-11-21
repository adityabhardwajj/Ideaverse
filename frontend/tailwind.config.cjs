module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Purple neon palette
        neon: {
          50: '#f6f3ff',
          100: '#efe9ff',
          200: '#e6dbff',
          300: '#d3b8ff',
          400: '#b083ff',
          500: '#7c3aed', // base neon purple
          600: '#6b2dd6',
          700: '#561fb0',
          800: '#3b176f',
          900: '#24103f',
        },
        bg: {
          light: '#faf9fb',
          dark: '#07060a', // deep dark for neon contrast
          panel: '#0b0710',
        },
        glass: 'rgba(255,255,255,0.03)',
        accent: '#a78bfa', // soft complementary
        // Keep existing colors for backward compatibility
        brand: {
          500: "#7c3aed", // updated to neon purple
          400: "#6b2dd6",
          300: "#561fb0"
        },
        neutral: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827"
        },
        background: {
          light: '#faf9fb',
          dark: '#07060a',
          'dark-card': '#0b0710'
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        xl: "14px",
      },
      boxShadow: {
        'neon-sm': '0 6px 20px rgba(124,58,237,0.08)',
        'neon-lg': '0 20px 50px rgba(124,58,237,0.18)',
        'glow-sm': '0 6px 18px rgba(124,58,237,0.18)',
        'glow-lg': '0 30px 60px rgba(124,58,237,0.28)',
        // Keep existing shadows for backward compatibility
        subtle: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)",
        card: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)",
        hover: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
        'dark-subtle': "0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.4)",
        'dark-card': "0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -1px rgba(0,0,0,0.3)",
        'dark-hover': "0 10px 15px -3px rgba(0,0,0,0.5), 0 4px 6px -2px rgba(0,0,0,0.4)",
      },
      transitionTimingFunction: {
        'in-expo': 'cubic-bezier(.2,.9,.2,1)',
        'soft-hero': 'cubic-bezier(.2,.9,.3,1)',
      },
      keyframes: {
        neonPulse: {
          '0%': { transform: 'translateY(0) scale(1)', boxShadow: '0 8px 30px rgba(124,58,237,0.16)' },
          '50%': { transform: 'translateY(-6px) scale(1.01)', boxShadow: '0 24px 50px rgba(124,58,237,0.28)' },
          '100%': { transform: 'translateY(0) scale(1)', boxShadow: '0 8px 30px rgba(124,58,237,0.16)' },
        },
        slowGlow: {
          '0%': { opacity: 0.85 },
          '50%': { opacity: 1 },
          '100%': { opacity: 0.85 },
        }
      },
      animation: {
        'neon-pulse': 'neonPulse 3s ease-in-out infinite',
        'slow-glow': 'slowGlow 6s linear infinite',
      },
      spacing: {
        18: "4.5rem",
      },
      screens: {
        xs: "420px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },
    },
  },
  plugins: [],
}
