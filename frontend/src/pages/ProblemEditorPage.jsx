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
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white mb-6">Create New Problem</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#1e1e2e] p-6 rounded-xl border border-white/5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Difficulty</label>
              <select 
                value={formData.difficulty}
                onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Categories (comma separated)</label>
              <input 
                type="text" 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description Markdown</label>
            <textarea 
              required
              rows={6}
              value={formData.text}
              onChange={(e) => setFormData({...formData, text: e.target.value})}
              className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none" 
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium">
            Publish Problem
          </button>
        </div>
      </form>
    </div>
  );
}
