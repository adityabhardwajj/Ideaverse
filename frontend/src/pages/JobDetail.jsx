import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axiosClient";
import { useAuth } from "../hooks/useAuth";
import InputMinimal from "../components/InputMinimal";
import ButtonMinimal from "../components/ButtonMinimal";

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [form, setForm] = useState({ coverLetter: "", portfolioUrl: "", expectedBudget: "" });
  const [err, setErr] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await API.get(`/api/jobs/${id}`);
      setJob(data);
    };
    fetch();
  }, [id]);

  const apply = async () => {
    if (!user) {
      setErr("Please login as a freelancer to apply");
      return;
    }
    
    setErr(null);
    setFieldErrors({});
    setLoading(true);
    
    // Client-side validation
    const errors = {};
    if (form.coverLetter && form.coverLetter.length > 2000) {
      errors.coverLetter = "Cover letter must be less than 2000 characters";
    }
    
    if (form.portfolioUrl && form.portfolioUrl.trim()) {
      try {
        new URL(form.portfolioUrl);
      } catch {
        errors.portfolioUrl = "Please enter a valid URL (e.g., https://example.com)";
      }
    }
    
    if (form.expectedBudget && form.expectedBudget.length > 100) {
      errors.expectedBudget = "Expected budget must be less than 100 characters";
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }
    
    try {
      await API.post(`/api/jobs/${id}/apply`, {
        coverLetter: form.coverLetter.trim() || undefined,
        portfolioUrl: form.portfolioUrl.trim() || undefined,
        expectedBudget: form.expectedBudget.trim() || undefined,
      });
      setSuccess(true);
      setForm({ coverLetter: "", portfolioUrl: "", expectedBudget: "" });
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      let errorMessage = "Failed to apply. Please check your input and try again.";
      const newFieldErrors = {};
      
      if (error.response?.data?.error?.details && Array.isArray(error.response.data.error.details)) {
        error.response.data.error.details.forEach((detail) => {
          const field = detail.path || detail.param || detail.field;
          const msg = detail.msg || detail.message;
          if (field && msg) {
            if (field === "coverLetter") newFieldErrors.coverLetter = msg;
            else if (field === "portfolioUrl") newFieldErrors.portfolioUrl = msg;
            else if (field === "expectedBudget") newFieldErrors.expectedBudget = msg;
            else newFieldErrors[field] = msg;
          }
        });
        
        if (Object.keys(newFieldErrors).length > 0) {
          setFieldErrors(newFieldErrors);
          errorMessage = "Please fix the validation errors below";
        } else {
          errorMessage = error.response.data.error.details.map(d => d.msg || d.message).join(", ");
        }
      } else {
        errorMessage = 
          error.response?.data?.error?.message || 
          error.response?.data?.message || 
          "Failed to apply. Please try again.";
      }
      
      setErr(errorMessage);
      console.error("Apply job error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!job) return <div className="container mx-auto mt-6 text-neutral-600 dark:text-neutral-400">Loading...</div>;
  
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">{job.title}</h2>
      <p className="mt-4 text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed">{job.description}</p>
      
      {job.skills && job.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {job.skills.map((skill, i) => (
            <span
              key={i}
              className="px-3 py-1 text-xs font-medium bg-brand-500/10 dark:bg-accent-dark/20 text-brand-600 dark:text-accent-dark rounded-full border border-brand-500/20 dark:border-accent-dark/30"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
      
      <div className="mt-8 p-6 bg-neutral-50/80 dark:bg-background-dark-card rounded-lg shadow-sm dark:shadow-dark-card border border-neutral-200/60 dark:border-neutral-700/50 backdrop-blur-sm">
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Apply for this Job</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Cover Letter (Optional)
            </label>
            <textarea 
              placeholder="Tell us why you're a great fit... (max 2000 characters)" 
              value={form.coverLetter} 
              onChange={e=>{
                setForm({...form,coverLetter:e.target.value});
                if (fieldErrors.coverLetter) setFieldErrors({...fieldErrors, coverLetter: null});
              }}
              className={`w-full p-3 border rounded-md bg-white dark:bg-background-dark-card text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:ring-2 transition-all resize-none ${
                fieldErrors.coverLetter 
                  ? "border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20 dark:focus:ring-red-400/20"
                  : "border-neutral-300 dark:border-neutral-600 focus:border-brand-500 dark:focus:border-accent-dark focus:ring-brand-500/20 dark:focus:ring-accent-dark/20"
              }`}
              rows="4"
            />
            {fieldErrors.coverLetter && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.coverLetter}</p>
            )}
            {form.coverLetter && (
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                {form.coverLetter.length}/2000 characters
              </p>
            )}
          </div>
          <div>
            <InputMinimal
              label="Portfolio URL (Optional)"
              type="url"
              placeholder="https://yourportfolio.com"
              value={form.portfolioUrl}
              onChange={e=>{
                setForm({...form,portfolioUrl:e.target.value});
                if (fieldErrors.portfolioUrl) setFieldErrors({...fieldErrors, portfolioUrl: null});
              }}
              error={fieldErrors.portfolioUrl}
            />
          </div>
          <div>
            <InputMinimal
              label="Expected Budget (Optional)"
              placeholder="e.g., $500-$1000"
              value={form.expectedBudget}
              onChange={e=>{
                setForm({...form,expectedBudget:e.target.value});
                if (fieldErrors.expectedBudget) setFieldErrors({...fieldErrors, expectedBudget: null});
              }}
              error={fieldErrors.expectedBudget}
            />
          </div>
          <ButtonMinimal onClick={apply} className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit Application"}
          </ButtonMinimal>
          {success && <p className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-800">Application submitted successfully!</p>}
          {err && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">{err}</p>}
        </div>
      </div>
    </div>
  );
}

