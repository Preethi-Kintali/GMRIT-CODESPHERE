import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { LoaderIcon, Code2Icon, ActivityIcon, TerminalSquareIcon, ArrowRightIcon } from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";

export default function AdminProblemsPage() {
  const { data: problems, isLoading } = useQuery({
    queryKey: ["admin-problems"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/problems");
      return res.data;
    },
  });

  return (
    <div className="space-y-8 p-6 lg:p-8 mx-auto max-w-7xl">
      <div className="flex md:items-center justify-between flex-col md:flex-row gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="size-8 rounded-lg border border-white/10 bg-[#1e1e1e] flex items-center justify-center shadow-lg">
              <Code2Icon className="size-4 text-white" />
            </div>
            <h1 className="text-3xl font-semibold text-white tracking-tight">
              Problems Management
            </h1>
          </div>
          <p className="text-neutral-400 text-sm ml-11">Manage standard coding challenges for interviews and practice</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/problems/new"
            className="px-4 py-2 text-sm font-medium rounded-md bg-white text-black hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 shrink-0 border border-transparent"
          >
            Add Problem
          </Link>
        </div>
      </div>

      <div className="p-6 rounded-xl border border-white/10 bg-[#1e1e1e] flex flex-col h-full mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
            <ActivityIcon className="size-4 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white tracking-tight">All Problems</h2>
        </div>

        <div className="rounded-xl border border-white/5 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center p-10">
              <LoaderIcon className="size-6 animate-spin text-neutral-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-black/40 border-b border-white/10 text-neutral-400 text-[10px] uppercase font-semibold tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Title</th>
                    <th className="px-5 py-3">Difficulty</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-black/40">
                  {problems?.map((problem) => (
                    <tr key={problem._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-medium text-white truncate max-w-[250px]">{problem.title}</div>
                        <div className="text-[10px] text-neutral-500 mt-1 uppercase tracking-wider">{problem.slug}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${getDifficultyBadgeClass(
                            problem.difficulty?.toLowerCase() || 'easy'
                          )}`}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium text-neutral-300 uppercase tracking-wider`}>
                          <div className={`size-1.5 rounded-full ${problem.isPublished ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
                          {problem.isPublished ? 'Live' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/admin/problems/${problem._id}/edit`}
                          className="px-4 py-2 text-xs font-medium rounded-md bg-white text-black hover:bg-neutral-200 transition-colors inline-flex items-center justify-center gap-2 shrink-0"
                          title="Edit Problem"
                        >
                          Edit
                          <ArrowRightIcon className="size-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {problems?.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center h-full text-center py-4">
                          <div className="size-12 mb-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                             <TerminalSquareIcon className="size-5 text-neutral-500" />
                          </div>
                          <p className="text-sm font-medium text-neutral-300 mb-1">No problems yet</p>
                          <p className="text-xs text-neutral-500">Create the first one.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
