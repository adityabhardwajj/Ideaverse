import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import NavMinimal from "./components/NavMinimal";
import FooterMinimal from "./components/FooterMinimal";
import SkipLink from "./components/SkipLink";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/LoginEnhanced"));
const Register = lazy(() => import("./pages/RegisterEnhanced"));
const Ideas = lazy(() => import("./pages/Ideas"));
const IdeaDetail = lazy(() => import("./pages/IdeaDetail"));
const CreateIdea = lazy(() => import("./pages/CreateIdea"));
const EditIdea = lazy(() => import("./pages/EditIdea"));
const Jobs = lazy(() => import("./pages/Jobs"));
const JobDetail = lazy(() => import("./pages/JobDetail"));
const Recruiter = lazy(() => import("./pages/Recruiter"));
const AdminEnhanced = lazy(() => import("./pages/AdminEnhanced"));
const DashboardEnhanced = lazy(() => import("./pages/DashboardEnhanced"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const Chat = lazy(() => import("./pages/Chat"));
const InvestorDiscussions = lazy(() => import("./pages/InvestorDiscussions"));
const About = lazy(() => import("./pages/About"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Contact = lazy(() => import("./pages/Contact"));
const TechNews = lazy(() => import("./pages/TechNews"));

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4,
};

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-12 h-12 border-4 border-brand-500 dark:border-neon-500 border-t-transparent rounded-full"
    />
  </div>
);

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Home />
              </motion.div>
            }
          />
          <Route
            path="/ideas"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Ideas />
              </motion.div>
            }
          />
          <Route
            path="/ideas/:id"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <IdeaDetail />
              </motion.div>
            }
          />
          <Route
            path="/ideas/:id/edit"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <EditIdea />
              </motion.div>
            }
          />
          <Route
            path="/create"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <CreateIdea />
              </motion.div>
            }
          />
          <Route
            path="/jobs"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Jobs />
              </motion.div>
            }
          />
          <Route
            path="/jobs/:id"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <JobDetail />
              </motion.div>
            }
          />
          <Route
            path="/recruiter"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Recruiter />
              </motion.div>
            }
          />
          <Route
            path="/admin"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <AdminEnhanced />
              </motion.div>
            }
          />
          <Route
            path="/dashboard"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <DashboardEnhanced />
              </motion.div>
            }
          />
          <Route
            path="/login"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Login />
              </motion.div>
            }
          />
          <Route
            path="/register"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Register />
              </motion.div>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <ForgotPassword />
              </motion.div>
            }
          />
          <Route
            path="/reset-password"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <ResetPassword />
              </motion.div>
            }
          />
          <Route
            path="/verify-email"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <VerifyEmail />
              </motion.div>
            }
          />
          <Route
            path="/chat"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Chat />
              </motion.div>
            }
          />
          <Route
            path="/investor/discussions"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <InvestorDiscussions />
              </motion.div>
            }
          />
          <Route
            path="/about"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <About />
              </motion.div>
            }
          />
          <Route
            path="/faq"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <FAQ />
              </motion.div>
            }
          />
          <Route
            path="/contact"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Contact />
              </motion.div>
            }
          />
          <Route
            path="/news"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <TechNews />
              </motion.div>
            }
          />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[linear-gradient(180deg,#05030a,#0b0712)] text-neutral-800 dark:text-neutral-100">
      <BrowserRouter>
        <SkipLink />
        <NavMinimal />
        <main id="main-content" className="container-wide py-8 md:py-12 min-h-[calc(100vh-8rem)]">
          <AnimatedRoutes />
        </main>
        <FooterMinimal />
      </BrowserRouter>
    </div>
  );
}
