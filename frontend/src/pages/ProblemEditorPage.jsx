import { useState, useEffect } from "react";
import axiosInstance from "../lib/axios";
import { toast } from "react-hot-toast";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Code2Icon, LoaderIcon, SendIcon } from "lucide-react";

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
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");

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

  if (isEditMode && isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <LoaderIcon className="size-8 text-primary animate-spin" />
        <p className="text-neutral-500 font-medium animate-pulse">Syncing problem data...</p>
      </div>
    );
  }

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
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* STARTER CODE EDITOR */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="flex items-center justify-between pl-1">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-3">
                      <Code2Icon className="size-4 text-emerald-400" />
                      Starter Template
                    </h3>
                    
                    {/* PREMIUM DROPDOWN */}
                    <div className="relative group/select">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within/select:text-emerald-400">
                        <div className={`size-5 rounded flex items-center justify-center text-[8px] font-black border border-white/10 bg-black ${
                          selectedLanguage === 'javascript' ? 'text-[#f7df1e]' : 
                          selectedLanguage === 'python' ? 'text-[#3776ab]' : 'text-[#007396]'
                        }`}>
                          {selectedLanguage === 'javascript' ? 'JS' : selectedLanguage === 'python' ? 'PY' : 'JV'}
                        </div>
                      </div>
                      <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="pl-10 pr-8 py-1.5 bg-[#252525] border border-white/5 rounded-lg text-[10px] font-bold text-neutral-300 hover:text-white hover:border-white/20 transition-all outline-none appearance-none cursor-pointer uppercase tracking-widest min-w-[140px]"
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500 group-hover/select:text-white transition-colors">
                        <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`rounded-3xl border-2 transition-all p-1 bg-black/40 ${
                    selectedLanguage === 'javascript' ? 'border-[#f7df1e]/20' : 
                    selectedLanguage === 'python' ? 'border-[#3776ab]/20' : 'border-[#007396]/20'
                  }`}>
                    <textarea
                        value={formData.starterCode[selectedLanguage]}
                        onChange={(e) => setFormData({
                          ...formData,
                          starterCode: { ...formData.starterCode, [selectedLanguage]: e.target.value }
                        })}
                        rows={18}
                        placeholder={`Define the initial structure for ${selectedLanguage}...`}
                        className="w-full px-6 py-6 bg-transparent rounded-2xl text-white focus:outline-none font-mono text-xs leading-relaxed custom-scrollbar placeholder:text-neutral-800"
                      />
                  </div>
                </div>

                {/* UNIVERSAL EXPECTED OUTPUT */}
                <div className="lg:col-span-2 space-y-4">
                   <div className="flex items-center justify-between pl-1">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-3">
                      <SendIcon className="size-4 text-blue-500" />
                      Universal Output
                    </h3>
                    <span className="text-[10px] font-mono text-blue-500/70 border border-blue-500/20 bg-blue-500/5 px-2 py-0.5 rounded uppercase tracking-widest">
                      Single Match
                    </span>
                  </div>

                  <div className="card bg-[#1a1a1a] border border-white/5 rounded-3xl p-6 space-y-4 shadow-2xl h-full flex flex-col">
                    <p className="text-[11px] text-neutral-500 leading-relaxed italic">
                      Author the exact string output required to pass the test case. This value is shared across all environments.
                    </p>
                    
                    <textarea
                        value={formData.expectedOutput.javascript || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({
                            ...formData,
                            expectedOutput: { 
                              javascript: val,
                              python: val,
                              java: val
                            }
                          });
                        }}
                        rows={12}
                        placeholder={`Paste the expected output here...`}
                        className="w-full flex-1 px-5 py-5 bg-black/60 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-blue-500/30 font-mono text-xs leading-relaxed custom-scrollbar placeholder:text-neutral-800"
                    />

                    <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl flex items-center gap-3">
                      <div className="size-2 rounded-full bg-blue-500 animate-pulse"></div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-blue-400">Sync Active Across Runtimes</p>
                    </div>
                  </div>
                </div>
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
