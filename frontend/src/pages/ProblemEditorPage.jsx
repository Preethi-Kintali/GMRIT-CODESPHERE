import { useState } from "react";
import axiosInstance from "../lib/axios";
import { toast } from "react-hot-toast";

export default function ProblemEditorPage() {
  const [formData, setFormData] = useState({
    title: "",
    difficulty: "Medium",
    category: "",
    text: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        difficulty: formData.difficulty,
        category: formData.category.split(',').map(s => s.trim()),
        description: { text: formData.text, notes: [] },
        isPublished: true,
      };
      await axiosInstance.post("/admin/problems", payload);
      toast.success("Problem published successfully!");
      setFormData({ title: "", difficulty: "Medium", category: "", text: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create problem");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text mb-2">Create New Problem</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-base-200/50 p-8 rounded-2xl border border-base-300 shadow-sm space-y-6">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium text-base-content/80">Title</span>
            </label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="input input-bordered w-full bg-base-100 focus:outline-none" 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium text-base-content/80">Difficulty</span>
              </label>
              <select 
                value={formData.difficulty}
                onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                className="select select-bordered w-full bg-base-100 focus:outline-none"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium text-base-content/80">Categories (comma separated)</span>
              </label>
              <input 
                type="text" 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="input input-bordered w-full bg-base-100 focus:outline-none" 
              />
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium text-base-content/80">Description Markdown</span>
            </label>
            <textarea 
              required
              rows={8}
              value={formData.text}
              onChange={(e) => setFormData({...formData, text: e.target.value})}
              className="textarea textarea-bordered w-full bg-base-100 focus:outline-none text-base" 
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="btn btn-accent w-full md:w-auto">
            Publish Problem
          </button>
        </div>
      </form>
    </div>
  );
}
