"use client";
import React, { useEffect, useState } from "react";
import { socket } from "../../../lib/socket";

type Job = {
  id?: string;
  title: string;
  description: string;
  companyname: string;
  salary?: number;
  location?: string;
  category?: string;
  jobType?: "FULL_TIME" | "PART_TIME" | "REMOTE";
};

export default function JobForm({
  editingJob,
  onSuccess,
  onCancel,
}: {
  editingJob?: Job | null;
  onSuccess?: (job: Job) => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<Job>({
    title: "",
    description: "",
    companyname: "",
    salary: 0,
    location: "",
    category: "",
    jobType: "FULL_TIME",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingJob) setForm(editingJob);
  }, [editingJob]);

  const change = (k: keyof Job, v: any) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const submit = () => {
    if (!form.title || !form.description || !form.companyname)
      return alert("Title, description and companyname required");
    setSaving(true);
    if (editingJob?.id) {
      socket.emit(
        "updateJob",
        { jobId: editingJob.id, data: form },
        (res: any) => {
          setSaving(false);
          if (res.status === "ok") {
            onSuccess?.(res.job);
          } else alert(res.message);
        }
      );
    } else {
      // JobForm.tsx
      socket.emit("createJob", form, (res: any) => {
        setSaving(false);
        if (res.status === "ok") {
          setForm({
            title: "",
            description: "",
            companyname: "",
            salary: 0,
            location: "",
            category: "",
            jobType: "FULL_TIME",
          });
          onSuccess?.(res.job); // trigger refresh
        } else alert(res.message);
      });
    }
  };

  return (
    <div className="card p-3 mb-3">
      <h5>{editingJob ? "Edit Job" : "Create Job"}</h5>

      <input
        className="form-control mb-2"
        placeholder="Company Name"
        value={form.companyname}
        onChange={(e) => change("companyname", e.target.value)}
      />
      <input
        className="form-control mb-2"
        placeholder="Title"
        value={form.title}
        onChange={(e) => change("title", e.target.value)}
      />
      <textarea
        className="form-control mb-2"
        placeholder="Description"
        value={form.description}
        onChange={(e) => change("description", e.target.value)}
      />
      <input
        className="form-control mb-2"
        placeholder="Salary"
        value={form.salary ?? ""}
        onChange={(e) => change("salary", Number(e.target.value))}
      />
      <input
        className="form-control mb-2"
        placeholder="Location"
        value={form.location ?? ""}
        onChange={(e) => change("location", e.target.value)}
      />
      <input
        className="form-control mb-2"
        placeholder="Category"
        value={form.category ?? ""}
        onChange={(e) => change("category", e.target.value)}
      />
      <select
        className="form-control mb-2"
        value={form.jobType}
        onChange={(e) => change("jobType", e.target.value as any)}
      >
        <option value="FULL_TIME">Full Time</option>
        <option value="PART_TIME">Part Time</option>
        <option value="REMOTE">Remote</option>
      </select>

      <div className="d-flex gap-2">
        <button className="btn btn-primary" onClick={submit} disabled={saving}>
          {saving ? "Saving..." : editingJob ? "Update" : "Create"}
        </button>
        {editingJob && (
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
