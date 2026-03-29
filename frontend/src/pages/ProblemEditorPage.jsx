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
    starterCode: { javascript: "", python: "", java: "" },
    expectedOutput: { javascript: "", python: "", java: "" },
  });

  const [activeTab, setActiveTab] = useState("info");

  const { data: problems, isLoading } = useQuery({
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
          starterCode: existing.starterCode || { javascript: "", python: "", java: "" },
          expectedOutput: existing.expectedOutput || { javascript: "", python: "", java: "" },
        });
      }
    }
  }, [isEditMode, problems, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(isEditMode ? "Updating problem..." : "Publishing problem...");
    try {
      const payload = {
        title: formData.title,
        difficulty: formData.difficulty,
        category: formData.category.split(',').map(s => s.trim()).filter(Boolean),
        description: { text: formData.text, notes: [] },
        starterCode: formData.starterCode,
        expectedOutput: formData.expectedOutput,
        isPublished: true,
      };
      
      if (isEditMode) {
        await axiosInstance.put(`/admin/problems/${id}`, payload);
        toast.success("Problem updated successfully!", { id: loadingToast });
      } else {
        await axiosInstance.post("/admin/problems", payload);
        toast.success("Problem published successfully!", { id: loadingToast });
      }
      navigate("/admin/problems");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save problem", { id: loadingToast });
    }
  };

  return (
    <div className="space-y-8 p-6 lg:p-8 mx-auto max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
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

        <div className="flex bg-[#1e1e1e] border border-white/10 rounded-lg p-1">
          {["info", "code"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === tab ? "bg-white text-black shadow-md" : "text-neutral-400 hover:text-white"
              }`}
            >
              {tab === "info" ? "Basic Info" : "Code Config"}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 md:p-8 rounded-xl border border-white/10 bg-[#1e1e1e]">
        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === "info" ? (
            <>
              <div className="group">
                <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2 group-focus-within:text-white transition-colors">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Reverse a Linked List"
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 group-hover:border-white/20 rounded-xl text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all font-medium placeholder:text-neutral-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2 group-focus-within:text-white transition-colors">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 group-hover:border-white/20 rounded-xl text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all font-medium appearance-none [color-scheme:dark]"
                  >
                    <option value="Easy" className="bg-[#1e1e1e] text-white">Easy</option>
                    <option value="Medium" className="bg-[#1e1e1e] text-white">Medium</option>
                    <option value="Hard" className="bg-[#1e1e1e] text-white">Hard</option>
                  </select>
                </div>
                <div className="group">
                  <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2 group-focus-within:text-white transition-colors">Categories (comma separated)</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Array, LinkedList"
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 group-hover:border-white/20 rounded-xl text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all font-medium placeholder:text-neutral-600"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2 group-focus-within:text-white transition-colors">Description Markdown</label>
                <textarea
                  required
                  rows={12}
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Write the problem statement here in markdown..."
                  className="w-full px-4 py-4 bg-black/40 border border-white/10 group-hover:border-white/20 rounded-xl text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all font-mono text-sm leading-relaxed resize-y custom-scrollbar placeholder:text-neutral-600"
                />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                  Starter Code
                </h3>
                {["javascript", "python", "java"].map((lang) => (
                  <div key={lang} className="group">
                    <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-2 pl-1">{lang}</label>
                    <textarea
                      value={formData.starterCode[lang]}
                      onChange={(e) => setFormData({
                        ...formData,
                        starterCode: { ...formData.starterCode, [lang]: e.target.value }
                      })}
                      rows={5}
                      placeholder={`Enter ${lang} implementation template...`}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 group-hover:border-white/20 rounded-xl text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all font-mono text-xs placeholder:text-neutral-600"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <span className="size-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                  Expected Output
                </h3>
                {["javascript", "python", "java"].map((lang) => (
                  <div key={lang} className="group">
                    <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-2 pl-1">{lang} Output</label>
                    <textarea
                      value={formData.expectedOutput[lang]}
                      onChange={(e) => setFormData({
                        ...formData,
                        expectedOutput: { ...formData.expectedOutput, [lang]: e.target.value }
                      })}
                      rows={5}
                      placeholder={`Enter exact expected output for ${lang}...`}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 group-hover:border-white/20 rounded-xl text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all font-mono text-xs placeholder:text-neutral-600"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/5 mt-8">
            <button
              type="button"
              onClick={() => navigate("/admin/problems")}
              className="px-5 py-2.5 text-sm font-medium text-neutral-400 hover:text-white transition-colors w-full md:w-auto text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-2.5 bg-white hover:bg-neutral-200 text-black rounded-lg transition-colors font-semibold text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]"
            >
              {isEditMode ? "Save Changes" : "Publish Problem"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
