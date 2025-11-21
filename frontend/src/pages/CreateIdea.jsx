import React, { useState } from "react";
import API from "../api/axiosClient";
import { useNavigate } from "react-router-dom";
import InputMinimal from "../components/InputMinimal";
import ButtonMinimal from "../components/ButtonMinimal";

export default function CreateIdea() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", tags: "" });
  const [err, setErr] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setFieldErrors({});
    setLoading(true);
    
    // Client-side validation
    const errors = {};
    if (!form.title.trim()) {
      errors.title = "Title is required";
    } else if (form.title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters";
    } else if (form.title.trim().length > 200) {
      errors.title = "Title must be less than 200 characters";
    }
    
    if (!form.description.trim()) {
      errors.description = "Description is required";
    } else if (form.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters";
    } else if (form.description.trim().length > 5000) {
      errors.description = "Description must be less than 5000 characters";
    }
    
    // Validate tags
    if (form.tags.trim()) {
      const tagsArray = form.tags.split(",").map(t => t.trim()).filter(t => t);
      if (tagsArray.length > 10) {
        errors.tags = "Maximum 10 tags allowed";
      } else {
        tagsArray.forEach((tag, index) => {
          if (tag.length > 30) {
            errors.tags = `Tag ${index + 1} must be less than 30 characters`;
          }
        });
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }
    
    try {
      // Process tags: split by comma, trim, and filter out empty strings
      const tagsArray = form.tags.trim() 
        ? form.tags.split(",").map(t => t.trim()).filter(t => t)
        : [];
      
      const payload = { 
        title: form.title.trim(), 
        description: form.description.trim(), 
        tags: tagsArray 
      };
      
      await API.post("/api/ideas", payload);
      navigate("/ideas");
    } catch (error) {
      // Better error handling - check multiple possible error formats
      let errorMessage = "Failed to create idea. Please check your input and try again.";
      const newFieldErrors = {};
      
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        errorMessage = "Network error: Cannot connect to server. Please make sure the backend server is running on http://localhost:5000";
      } else if (error.response) {
        // Server responded with error
        if (error.response?.data?.error?.details && Array.isArray(error.response.data.error.details)) {
          // Map validation errors to fields
          error.response.data.error.details.forEach((detail) => {
            const field = detail.path || detail.param || detail.field;
            const msg = detail.msg || detail.message;
            if (field && msg) {
              // Map backend field names to frontend field names
              if (field === "title") newFieldErrors.title = msg;
              else if (field === "description") newFieldErrors.description = msg;
              else if (field === "tags") newFieldErrors.tags = msg;
              else newFieldErrors[field] = msg;
            }
          });
          
          // If we have field errors, show them; otherwise show general message
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
            `Server error: ${error.response.status} ${error.response.statusText}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "No response from server. Please check if the backend server is running.";
      } else {
        // Something else happened
        errorMessage = error.message || errorMessage;
      }
      
      setErr(errorMessage);
      if (Object.keys(newFieldErrors).length > 0) {
        setFieldErrors(newFieldErrors);
      }
      console.error("Create idea error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">Create Idea</h2>
      <form onSubmit={submit} className="space-y-5">
        <div>
          <InputMinimal
            label="Title"
            required
            placeholder="Enter a compelling title for your idea (3-200 characters)"
            value={form.title}
            onChange={e=>{
              setForm({...form,title:e.target.value});
              if (fieldErrors.title) setFieldErrors({...fieldErrors, title: null});
            }}
            error={fieldErrors.title}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea 
            required 
            placeholder="Describe your idea in detail... (minimum 10 characters)"
            value={form.description} 
            onChange={e=>{
              setForm({...form,description:e.target.value});
              if (fieldErrors.description) setFieldErrors({...fieldErrors, description: null});
            }}
            className={`w-full p-3 border rounded-md bg-white dark:bg-background-dark-card text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:ring-2 transition-all resize-none h-32 ${
              fieldErrors.description 
                ? "border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20 dark:focus:ring-red-400/20"
                : "border-neutral-300 dark:border-neutral-600 focus:border-brand-500 dark:focus:border-accent-dark focus:ring-brand-500/20 dark:focus:ring-accent-dark/20"
            }`}
          />
          {fieldErrors.description && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.description}</p>
          )}
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {form.description.length}/5000 characters
          </p>
        </div>
        <div>
          <InputMinimal
            label="Tags (comma separated)"
            placeholder="e.g., AI, Tech, Innovation (max 10 tags, 30 chars each)"
            value={form.tags}
            onChange={e=>{
              setForm({...form,tags:e.target.value});
              if (fieldErrors.tags) setFieldErrors({...fieldErrors, tags: null});
            }}
            error={fieldErrors.tags}
          />
          {form.tags && (
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              {form.tags.split(",").filter(t => t.trim()).length} tag(s) entered
            </p>
          )}
        </div>
        <ButtonMinimal type="submit" className="w-full" disabled={loading}>
          {loading ? "Publishing..." : "Publish Idea"}
        </ButtonMinimal>
        {err && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">{err}</p>}
      </form>
    </div>
  );
}

