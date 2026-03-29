import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import axiosInstance from "../lib/axios";
import Navbar from "../components/Navbar";
import { 
  UserCircleIcon, 
  GithubIcon, 
  LinkedinIcon, 
  Code2Icon, 
  FileTextIcon, 
  LoaderIcon, 
  SaveIcon,
  BriefcaseIcon,
  AtSignIcon,
  PencilIcon,
  XIcon
} from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user: clerkUser } = useUser();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    title: "",
    skills: "", // Will split/join by comma
    githubUrl: "",
    leetcodeUrl: "",
    linkedinUrl: "",
    resumeUrl: ""
  });

  const { data, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const res = await axiosInstance.get("/users/me");
      return res.data;
    },
  });

  useEffect(() => {
    if (data?.user) {
      setFormData({
        username: data.user.username || "",
        bio: data.user.bio || "",
        title: data.user.title || "",
        skills: data.user.skills?.join(", ") || "",
        githubUrl: data.user.githubUrl || "",
        leetcodeUrl: data.user.leetcodeUrl || "",
        linkedinUrl: data.user.linkedinUrl || "",
        resumeUrl: data.user.resumeUrl || ""
      });

      if (!data.user.hasCompletedProfile) {
        setIsEditing(true);
      }
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: async (updatedData) => {
      // transform skills back to array
      const payload = {
        ...updatedData,
        skills: updatedData.skills.split(",").map((s) => s.trim()).filter(Boolean)
      };
      const res = await axiosInstance.put("/users/me", payload);
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      setIsEditing(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update profile");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCancel = () => {
    if (data?.user) {
      setFormData({
        username: data.user.username || "",
        bio: data.user.bio || "",
        title: data.user.title || "",
        skills: data.user.skills?.join(", ") || "",
        githubUrl: data.user.githubUrl || "",
        leetcodeUrl: data.user.leetcodeUrl || "",
        linkedinUrl: data.user.linkedinUrl || "",
        resumeUrl: data.user.resumeUrl || ""
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <LoaderIcon className="size-10 animate-spin text-neutral-500" />
      </div>
    );
  }

  const dbUser = data?.user;

  const inputClass = isEditing 
    ? "w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all font-medium text-sm"
    : "w-full px-3 py-2.5 bg-transparent border border-transparent text-white/90 focus:outline-none font-medium text-sm cursor-default";

  const textAreaClass = isEditing
    ? "w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all font-medium text-sm resize-none"
    : "w-full px-3 py-2.5 bg-transparent border border-transparent text-white/90 focus:outline-none font-medium text-sm resize-none cursor-default";

  return (
    <div className="min-h-screen bg-[#000000] text-neutral-300 font-sans pb-20">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
         <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-8 mb-12 border-b border-white/5 pb-10">
              <div className="relative inline-block shrink-0">
                <img 
                  src={dbUser?.profileImage || clerkUser?.imageUrl} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover shadow-sm bg-black border border-white/10"
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-semibold text-white tracking-tight">{dbUser?.name}</h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
                   <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-white/5 text-neutral-300 border border-white/5 uppercase tracking-wider">
                     {dbUser?.role || "Candidate"}
                   </span>
                   <span className="text-xs text-neutral-500 font-medium">
                     Member since {new Date(dbUser?.createdAt).toLocaleDateString()}
                   </span>
                </div>
              </div>
              
              {/* Top Actions */}
              <div className="flex items-center gap-3 mt-4 sm:mt-0">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setIsEditing(true); }}
                    className="flex items-center gap-2 bg-white/10 text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-white/20 transition-all shadow-sm"
                  >
                    <PencilIcon className="size-4" />
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); handleCancel(); }}
                      className="flex items-center gap-2 bg-transparent border border-white/10 text-neutral-400 px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-white/5 hover:text-white transition-all"
                    >
                      <XIcon className="size-4" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-neutral-200 transition-all disabled:opacity-50"
                    >
                      {updateMutation.isPending ? (
                        <LoaderIcon className="size-4 animate-spin" />
                      ) : (
                        <SaveIcon className="size-4" />
                      )}
                      Save
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* General Section */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                  <UserCircleIcon className="size-5 text-blue-400" />
                  General Profile
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <AtSignIcon className="size-3.5" /> Username
                    </label>
                    <input
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder={isEditing ? "johndoe123" : "Not provided"}
                      className={inputClass}
                      readOnly={!isEditing}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <BriefcaseIcon className="size-3.5" /> Job Title / Target Role
                    </label>
                    <input
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder={isEditing ? "e.g. Frontend Engineer, Student" : "Not provided"}
                      className={inputClass}
                      readOnly={!isEditing}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                      Bio / About Me
                    </label>
                    <textarea
                      name="bio"
                      rows="3"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder={isEditing ? "Write a brief introduction about yourself..." : "Not provided"}
                      className={textAreaClass}
                      readOnly={!isEditing}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                      Technical Skills (Comma separated)
                    </label>
                    <input
                      name="skills"
                      type="text"
                      value={formData.skills}
                      onChange={handleChange}
                      placeholder={isEditing ? "React, Node.js, Python, System Design..." : "Not provided"}
                      className={inputClass}
                      readOnly={!isEditing}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              {/* Social Links Section */}
              <div className="space-y-6 pt-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                  <Code2Icon className="size-5 text-emerald-400" />
                  Links & Portfolio
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <GithubIcon className="size-3.5" /> GitHub Profile
                    </label>
                    <input
                      name="githubUrl"
                      type="url"
                      value={formData.githubUrl}
                      onChange={handleChange}
                      placeholder={isEditing ? "https://github.com/..." : "Not provided"}
                      className={inputClass}
                      readOnly={!isEditing}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Code2Icon className="size-3.5" /> LeetCode Profile
                    </label>
                    <input
                      name="leetcodeUrl"
                      type="url"
                      value={formData.leetcodeUrl}
                      onChange={handleChange}
                      placeholder={isEditing ? "https://leetcode.com/u/..." : "Not provided"}
                      className={inputClass}
                      readOnly={!isEditing}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <LinkedinIcon className="size-3.5" /> LinkedIn Profile
                    </label>
                    <input
                      name="linkedinUrl"
                      type="url"
                      value={formData.linkedinUrl}
                      onChange={handleChange}
                      placeholder={isEditing ? "https://linkedin.com/in/..." : "Not provided"}
                      className={inputClass}
                      readOnly={!isEditing}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FileTextIcon className="size-3.5" /> Resume Link (PDF/Drive)
                    </label>
                    <input
                      name="resumeUrl"
                      type="url"
                      value={formData.resumeUrl}
                      onChange={handleChange}
                      placeholder={isEditing ? "https://drive.google.com/..." : "Not provided"}
                      className={inputClass}
                      readOnly={!isEditing}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

            </form>
      </div>
    </div>
  );
}
