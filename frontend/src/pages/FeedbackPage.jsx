import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useSubmitFeedback, useSessionById } from "../hooks/useSessions";
import { MessageSquareIcon, StarIcon, CheckCircle2Icon, XCircleIcon, HelpCircleIcon, Loader2Icon } from "lucide-react";
import Navbar from "../components/Navbar";

function FeedbackPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: sessionData, isLoading } = useSessionById(id);
  const session = sessionData?.session;

  const submitFeedbackMutation = useSubmitFeedback();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [recommendation, setRecommendation] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating) return;
    if (!recommendation) return;

    submitFeedbackMutation.mutate(
      { id, data: { rating, notes, recommendation } },
      { onSuccess: () => navigate("/dashboard") }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center font-sans">
        <Loader2Icon className="size-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  // Already submitted feedback
  if (session?.feedback?.rating) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center space-y-4">
            <CheckCircle2Icon className="size-16 text-emerald-400 mx-auto" />
            <h2 className="text-2xl font-semibold text-white">Feedback Submitted</h2>
            <p className="text-neutral-400">You have already submitted feedback for this session.</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-4 px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/10 font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 overflow-auto p-4 py-12 flex justify-center">
        <div className="max-w-2xl w-full">
          <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <MessageSquareIcon className="size-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Interview Feedback</h1>
                <p className="text-neutral-400 mt-1">
                  Evaluate {session?.candidate?.name || "the candidate"} for the {session?.problem?.title || "coding task"}.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Rating */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-neutral-300">
                  Technical Rating <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <StarIcon
                        className={`size-8 \${
                          (hoverRating || rating) >= star
                            ? "fill-amber-400 text-amber-400"
                            : "text-neutral-600"
                        } transition-colors duration-200`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-neutral-300">
                  Final Recommendation <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label
                    className={`flex cursor-pointer items-center p-4 border rounded-xl transition-all \${
                      recommendation === "Hire"
                        ? "bg-emerald-500/10 border-emerald-500/50"
                        : "bg-black/20 border-white/5 hover:border-white/10"
                    }`}
                  >
                    <input
                      type="radio"
                      name="recommendation"
                      value="Hire"
                      className="hidden"
                      checked={recommendation === "Hire"}
                      onChange={(e) => setRecommendation(e.target.value)}
                    />
                    <div className="flex items-center gap-3">
                      <CheckCircle2Icon
                        className={`size-5 \${
                          recommendation === "Hire" ? "text-emerald-400" : "text-neutral-500"
                        }`}
                      />
                      <span
                        className={`font-medium \${
                          recommendation === "Hire" ? "text-emerald-400" : "text-neutral-300"
                        }`}
                      >
                        Strong Hire
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex cursor-pointer items-center p-4 border rounded-xl transition-all \${
                      recommendation === "Consider"
                        ? "bg-amber-500/10 border-amber-500/50"
                        : "bg-black/20 border-white/5 hover:border-white/10"
                    }`}
                  >
                    <input
                      type="radio"
                      name="recommendation"
                      value="Consider"
                      className="hidden"
                      checked={recommendation === "Consider"}
                      onChange={(e) => setRecommendation(e.target.value)}
                    />
                    <div className="flex items-center gap-3">
                      <HelpCircleIcon
                        className={`size-5 \${
                          recommendation === "Consider" ? "text-amber-400" : "text-neutral-500"
                        }`}
                      />
                      <span
                        className={`font-medium \${
                          recommendation === "Consider" ? "text-amber-400" : "text-neutral-300"
                        }`}
                      >
                        Consider
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex cursor-pointer items-center p-4 border rounded-xl transition-all \${
                      recommendation === "Reject"
                        ? "bg-red-500/10 border-red-500/50"
                        : "bg-black/20 border-white/5 hover:border-white/10"
                    }`}
                  >
                    <input
                      type="radio"
                      name="recommendation"
                      value="Reject"
                      className="hidden"
                      checked={recommendation === "Reject"}
                      onChange={(e) => setRecommendation(e.target.value)}
                    />
                    <div className="flex items-center gap-3">
                      <XCircleIcon
                        className={`size-5 \${
                          recommendation === "Reject" ? "text-red-400" : "text-neutral-500"
                        }`}
                      />
                      <span
                        className={`font-medium \${
                          recommendation === "Reject" ? "text-red-400" : "text-neutral-300"
                        }`}
                      >
                        Pass
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-neutral-300">
                  Evaluation Notes
                </label>
                <textarea
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How did the candidate perform? Strengths, weaknesses, communication style..."
                  className="w-full h-40 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none"
                />
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="px-6 py-2.5 text-neutral-400 hover:text-white font-medium transition-colors"
                >
                  Skip for Now
                </button>
                <button
                  type="submit"
                  disabled={submitFeedbackMutation.isPending || !rating || !recommendation}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitFeedbackMutation.isPending && <Loader2Icon className="size-4 animate-spin" />}
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeedbackPage;
