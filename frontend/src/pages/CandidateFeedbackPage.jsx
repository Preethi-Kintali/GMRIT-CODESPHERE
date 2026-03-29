import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { StarIcon, SendIcon, Loader2Icon, CheckCircle2Icon, ThumbsUpIcon } from "lucide-react";
import { sessionApi } from "../api/sessions";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";

export default function CandidateFeedbackPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please provide a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      await sessionApi.submitCandidateFeedback({ id, rating, notes });
      setIsSubmitted(true);
      toast.success("Feedback submitted! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="size-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2Icon className="size-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Thank you!</h1>
          <p className="text-neutral-400">Your feedback helps us improve the interview process for everyone.</p>
          <div className="pt-4">
            <button onClick={() => navigate("/dashboard")} className="btn btn-primary px-8">Return to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-xl w-full">
          <div className="p-8 rounded-3xl border border-white/10 bg-[#1e1e1e] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-emerald-400" />
            
            <div className="text-center mb-10">
              <div className="size-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                 <ThumbsUpIcon className="size-7 text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight mb-2">How was your interview experience?</h1>
              <p className="text-neutral-400 text-sm">We value your honest feedback to build a better platform.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block text-center">Platform & Interview Interface</label>
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setRating(star)}
                      className="transition-all duration-200 hover:scale-125 focus:outline-none"
                    >
                      <StarIcon 
                        className={`size-10 ${
                          star <= (hoveredRating || rating) 
                            ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.3)]" 
                            : "text-neutral-600"
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                <div className="text-center h-4">
                   <span className="text-xs font-medium text-neutral-500 italic">
                      {rating === 1 && "Extremely Poor"}
                      {rating === 2 && "Could be better"}
                      {rating === 3 && "Satisfactory"}
                      {rating === 4 && "Great Experience"}
                      {rating === 5 && "Outstanding!"}
                   </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Any specific comments? (Optional)</label>
                <textarea 
                  className="textarea textarea-bordered w-full bg-black/40 border-white/10 text-neutral-200 min-h-[120px] focus:border-emerald-500/50 transition-all custom-scrollbar"
                  placeholder="Tell us what you liked or what we can improve..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || rating === 0}
                className="btn btn-primary w-full shadow-lg group"
              >
                {isSubmitting ? <Loader2Icon className="size-5 animate-spin" /> : (
                  <>
                    Submit Feedback
                    <SendIcon className="size-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
