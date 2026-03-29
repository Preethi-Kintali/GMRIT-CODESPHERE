import { useState, useEffect } from "react";
import axiosInstance from "../lib/axios";
import { toast } from "react-hot-toast";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Code2Icon, LoaderIcon } from "lucide-react";

export default function ProblemEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: "",
    difficulty: "Medium",
    category: "",
    text: "",
  });

  const { data: problems } = useQuery({
    queryKey: ["admin-problems"],
    queryFn: async () => (await axiosInstance.get("/admin/problems")).data,
    enabled: isEditMode,
  });

  useEffect(() => {
    if (isEditMode && problems) {
      const existing = problems.find(p => p._id === id);
      if (existing) {
        setFormData({
          title: existing.title,
          difficulty: existing.difficulty || "Medium",
          category: existing.category ? existing.category.join(", ") : "",
          text: existing.description?.text || "",
        });
      }
    }
  }, [isEditMode, problems, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        difficulty: formData.difficulty,
        category: formData.category.split(',').map(s => s.trim()).filter(Boolean),
        description: { text: formData.text, notes: [] },
        isPublished: true,
      };
      if (isEditMode) {
        await axiosInstance.put(`/admin/problems/${id}`, payload);
        toast.success("Problem updated successfully!");
        navigate("/admin/problems");
      } else {
        await axiosInstance.post("/admin/problems", payload);
        toast.success("Problem published successfully!");
        setFormData({ title: "", difficulty: "Medium", category: "", text: "" });
        navigate("/admin/problems");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save problem");
    }
  };

  return (
    <div className="space-y-8 p-6 lg:p-8 mx-auto max-w-4xl">
      <div className="flex md:items-center justify-between flex-col md:flex-row gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="size-8 rounded-lg border border-white/10 bg-[#1e1e1e] flex items-center justify-center shadow-lg">
              <Code2Icon className="size-4 text-white" />
            </div>
            <h1 className="text-3xl font-semibold text-white tracking-tight">
              {isEditMode ? "Edit Problem" : "Create New Problem"}
            </h1>
          </div>
          <p className="text-neutral-400 text-sm ml-11">Author a fully interactive coding challenge</p>
        </div>
      </div>

      <div className="p-6 rounded-xl border border-white/10 bg-[#1e1e1e]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Title</label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Reverse a Linked List"
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all font-medium" 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Difficulty</label>
              <select 
                value={formData.difficulty}
                onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all font-medium appearance-none [color-scheme:dark]"
              >
                <option className="bg-[#1e1e1e] text-white">Easy</option>
                <option className="bg-[#1e1e1e] text-white">Medium</option>
                <option className="bg-[#1e1e1e] text-white">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Categories (comma separated)</label>
              <input 
                type="text" 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                placeholder="e.g. Array, Dynamic Programming"
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all font-medium" 
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Description Markdown</label>
            <textarea 
              required
              rows={10}
              value={formData.text}
              onChange={(e) => setFormData({...formData, text: e.target.value})}
              placeholder="Write the problem statement here in markdown..."
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all font-mono text-sm leading-relaxed resize-y custom-scrollbar" 
            />
          </div>

          <div className="pt-6 flex justify-end gap-3 border-t border-white/5 mt-6">
            <button 
              type="button" 
              onClick={() => navigate("/admin/problems")} 
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-white hover:bg-neutral-200 text-black rounded-lg transition-colors font-semibold text-sm flex items-center gap-2"
            >
              {isEditMode ? "Save Changes" : "Publish Problem"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
