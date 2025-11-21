import React, { useEffect, useState } from "react";
import API from "../api/axiosClient";
import InputMinimal from "../components/InputMinimal";
import ButtonMinimal from "../components/ButtonMinimal";
import AnimatedCard from "../components/AnimatedCard";

export default function Recruiter() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", skills: "", budgetRange: "" });
  const [err, setErr] = useState(null);

  const fetch = async () => {
    const { data } = await API.get("/api/jobs");
    setJobs(data.jobs || data);
  };

  useEffect(() => { fetch(); }, []);

  const create = async () => {
    try {
      await API.post("/api/jobs", { 
        ...form, 
        skills: form.skills.split(",").map(s=>s.trim()).filter(s=>s) 
      });
      setForm({ title: "", description: "", skills: "", budgetRange: "" });
      setErr(null);
      fetch();
    } catch (error) {
      setErr(error.response?.data?.message || "Failed to post job");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">Recruiter Dashboard</h2>
      
      <div className="bg-neutral-50/80 dark:bg-background-dark-card p-6 rounded-lg shadow-sm dark:shadow-dark-card border border-neutral-200/60 dark:border-neutral-700/50 mb-8 backdrop-blur-sm">
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">Post a Job</h3>
        <div className="space-y-4">
          <InputMinimal
            label="Job Title"
            required
            placeholder="e.g., Senior Frontend Developer"
            value={form.title}
            onChange={e=>setForm({...form,title:e.target.value})}
          />
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Description</label>
            <textarea 
              required
              placeholder="Describe the job requirements and responsibilities..."
              value={form.description} 
              onChange={e=>setForm({...form,description:e.target.value})} 
              className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-background-dark-card text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:border-brand-500 dark:focus:border-accent-dark focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-accent-dark/20 transition-all resize-none"
              rows="5"
            />
          </div>
          <InputMinimal
            label="Required Skills (comma separated)"
            placeholder="e.g., React, Node.js, MongoDB"
            value={form.skills}
            onChange={e=>setForm({...form,skills:e.target.value})}
          />
          <InputMinimal
            label="Budget Range"
            placeholder="e.g., $1000-$2000"
            value={form.budgetRange}
            onChange={e=>setForm({...form,budgetRange:e.target.value})}
          />
          <ButtonMinimal onClick={create} className="w-full">Post Job</ButtonMinimal>
          {err && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">{err}</p>}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">Your Jobs</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {jobs.map(j => (
            <AnimatedCard
              key={j._id}
              title={j.title}
              subtitle={`Status: ${j.status}`}
              description={j.description?.slice(0, 120) + "..."}
              tags={j.skills}
              meta={j.budgetRange ? `Budget: ${j.budgetRange}` : ""}
            />
          ))}
        </div>
        {jobs.length === 0 && (
          <p className="text-neutral-500 dark:text-neutral-400 text-center py-8">No jobs posted yet. Create your first job above!</p>
        )}
      </div>
    </div>
  );
}

