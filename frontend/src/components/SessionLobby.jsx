import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { 
  ShieldCheckIcon, 
  MailIcon, 
  LockIcon, 
  ArrowRightIcon, 
  Loader2Icon, 
  CheckCircle2Icon,
  VideoIcon,
  MicIcon,
  Settings2Icon,
  CameraIcon,
  UserCheckIcon,
  AlertCircleIcon,
  ClipboardCheckIcon,
  ClockIcon
} from "lucide-react";
import { sessionApi } from "../api/sessions";
import toast from "react-hot-toast";

export default function SessionLobby({ session, onSuccess }) {
  const { user } = useUser();
  const isInterviewer = session.interviewer?.clerkId === user?.id;
  const isCandidate = session.candidate?.clerkId === user?.id;

  const isVerified = isInterviewer ? session.isInterviewerVerified : session.isVerified;
  const hasAcceptedGuidelines = isInterviewer ? session.interviewerAcceptedGuidelines : session.candidateAcceptedGuidelines;
  const hasCheckedIn = isInterviewer ? session.interviewerCheckedIn : session.candidateCheckedIn;

  // Step state
  const getCurrentStep = () => {
    if (!isVerified) return "verification";
    if (!hasAcceptedGuidelines) return "guidelines";
    if (!hasCheckedIn) return "techCheck";
    return "waiting";
  };

  const [step, setStep] = useState(getCurrentStep());
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  
  // Tech Check State
  const [stream, setStream] = useState(null);
  const [techReady, setTechReady] = useState({ video: false, audio: false });
  const videoRef = useRef(null);

  // Time Sync
  const [timeLeftToStart, setTimeLeftToStart] = useState("");
  const isTimeReached = new Date() >= new Date(session.scheduledAt);

  useEffect(() => {
    if (step === "techCheck") {
      startCamera();
    } else {
      stopCamera();
    }
  }, [step]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const start = new Date(session.scheduledAt);
      const diff = start - now;
      
      if (diff <= 0) {
        setTimeLeftToStart("00:00:00");
        if (step === "waiting") {
           // Auto-trigger success if in waiting step
           onSuccess();
        }
      } else {
        const hh = Math.floor(diff / 3600000);
        const mm = Math.floor((diff % 3600000) / 60000);
        const ss = Math.floor((diff % 60000) / 1000);
        setTimeLeftToStart(`${hh.toString().padStart(2,"0")}:${mm.toString().padStart(2,"0")}:${ss.toString().padStart(2,"0")}`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [session.scheduledAt, step, onSuccess]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setTechReady({ video: true, audio: true });
    } catch (err) {
      toast.error("Hardware access denied. Please enable camera and microphone.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleSendOtp = async () => {
    setIsSendingOtp(true);
    try {
      await sessionApi.sendOtp(session._id);
      setOtpSent(true);
      toast.success("Security code sent!");
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP Error");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      await sessionApi.verifyOtp({ id: session._id, otp });
      toast.success("Identity Verified");
      setStep("guidelines");
    } catch (error) {
      toast.error("Invalid Code");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAcceptGuidelines = async () => {
    setIsAccepting(true);
    try {
      await sessionApi.acceptGuidelines(session._id);
      toast.success("Policies Accepted");
      setStep("techCheck");
    } catch (error) {
      toast.error("Action Failed");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    try {
      await sessionApi.checkIn(session._id);
      toast.success("Check-in successful");
      setStep("waiting");
    } catch (error) {
      toast.error("Check-in failed");
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#09090b] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-in fade-in zoom-in duration-500">
        
        {/* LEFT COLUMN: GUIDELINES & PEER STATUS */}
        <div className="hidden lg:flex flex-col gap-6">
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <ShieldCheckIcon className="size-6 text-emerald-500" />
              Secure Gateway
            </h2>
            
            <div className="space-y-4">
               {[
                 { label: "Identity Verified", val: isVerified },
                 { label: "Guidelines Accepted", val: hasAcceptedGuidelines },
                 { label: "Hardware Verified", val: techReady.video },
                 { label: "Check-in Status", val: hasCheckedIn },
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                   <span className="text-sm text-neutral-400">{item.label}</span>
                   {item.val ? <CheckCircle2Icon className="size-4 text-emerald-500" /> : <div className="size-2 rounded-full bg-neutral-700" />}
                 </div>
               ))}
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-3">
              <AlertCircleIcon className="size-5 text-amber-500 shrink-0" />
              <p className="text-[11px] text-amber-500/80 leading-relaxed">
                Interviews are recorded and monitored for quality and integrity. Attempting to bypass security layers will result in immediate termination.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE STEPS */}
        <div className="w-full">
          <div className="p-8 rounded-3xl border border-white/10 bg-[#18181b] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" />
            
            {step === "verification" && (
              <div className="animate-in slide-in-from-right-8 duration-300">
                <div className="text-center mb-8">
                  <div className="size-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 mx-auto rotate-3">
                    <LockIcon className="size-7 text-emerald-500" />
                  </div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">Access Verification</h1>
                  <p className="text-neutral-500 text-sm mt-1">Confirm identity for: <span className="text-emerald-500">{user?.fullName}</span></p>
                </div>

                {!otpSent ? (
                  <button onClick={handleSendOtp} disabled={isSendingOtp} className="btn btn-primary w-full bg-emerald-600 border-none shadow-xl">
                    {isSendingOtp ? <Loader2Icon className="size-5 animate-spin" /> : "Send Verification Code"}
                  </button>
                ) : (
                  <form onSubmit={handleVerify} className="space-y-6">
                    <input 
                      type="text" 
                      placeholder="Enter 6-digit Code"
                      maxLength={6}
                      className="input input-bordered w-full bg-black/40 border-white/10 text-center tracking-[10px] text-xl font-mono focus:border-emerald-500"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    />
                    <button type="submit" disabled={otp.length !== 6 || isVerifying} className="btn btn-primary w-full bg-emerald-600 border-none">
                      {isVerifying ? <Loader2Icon className="size-5 animate-spin" /> : "Verify Identity"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {step === "guidelines" && (
              <div className="animate-in slide-in-from-right-8 duration-300">
                 <div className="text-center mb-8">
                  <div className="size-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 mx-auto -rotate-3">
                    <ClipboardCheckIcon className="size-7 text-blue-500" />
                  </div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">Interview Guidelines</h1>
                </div>

                <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar mb-8">
                   {[
                     "Maintain active camera visibility at all times.",
                     "No external browsers or AI assistants allowed.",
                     "Do not switch tabs or minimize the window.",
                     "Audio must remain active for monitoring.",
                     "Interviewers have the final authority to terminate."
                   ].map((g, i) => (
                     <div key={i} className="flex gap-3 text-sm text-neutral-400 bg-white/5 p-3 rounded-xl border border-white/5">
                        <CheckCircle2Icon className="size-4 text-emerald-500 shrink-0" />
                        {g}
                     </div>
                   ))}
                </div>

                <button onClick={handleAcceptGuidelines} disabled={isAccepting} className="btn btn-primary w-full bg-blue-600 border-none">
                  {isAccepting ? <Loader2Icon className="size-5 animate-spin" /> : "I Accept the Guidelines"}
                </button>
              </div>
            )}

            {step === "techCheck" && (
              <div className="animate-in slide-in-from-right-8 duration-300">
                <div className="text-center mb-8">
                  <div className="size-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 mx-auto rotate-12">
                    <VideoIcon className="size-7 text-purple-500" />
                  </div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">Hardware Setup</h1>
                </div>

                <div className="relative aspect-video rounded-3xl bg-black border border-white/10 overflow-hidden ring-1 ring-white/20 mb-6">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />
                  {(!techReady.video) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-neutral-600">
                      <Loader2Icon className="size-8 animate-spin" />
                    </div>
                  )}
                </div>

                <button onClick={handleCheckIn} disabled={isCheckingIn || !techReady.video} className="btn btn-primary w-full bg-purple-600 border-none">
                  {isCheckingIn ? <Loader2Icon className="size-5 animate-spin" /> : "Check-in as Ready"}
                </button>
              </div>
            )}

            {step === "waiting" && (
               <div className="animate-in zoom-in duration-300 text-center">
                  <div className="size-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8 mx-auto relative">
                     <ClockIcon className="size-10 text-neutral-400" />
                     <div className="absolute inset-0 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Check-in Complete!</h2>
                  <p className="text-neutral-500 text-sm mb-8">The interview workspace will open automatically when the timer hits zero.</p>
                  
                  <div className="p-6 rounded-3xl bg-black/60 border border-white/5 inline-flex flex-col items-center">
                     <span className="text-[10px] font-black uppercase tracking-[4px] text-emerald-500 mb-2">Time Until Start</span>
                     <span className="text-4xl font-mono font-black text-white">{timeLeftToStart}</span>
                  </div>

                  <div className="mt-8 flex gap-3 justify-center">
                     <div className={`px-4 py-2 rounded-2xl text-[10px] font-bold border transition-colors ${session.interviewerCheckedIn ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-neutral-500'}`}>
                        INT. READY
                     </div>
                     <div className={`px-4 py-2 rounded-2xl text-[10px] font-bold border transition-colors ${session.candidateCheckedIn ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-neutral-500'}`}>
                        CAND. READY
                     </div>
                  </div>
               </div>
            )}
            
            <div className="mt-8 text-center text-[10px] text-neutral-600 font-bold uppercase tracking-[3px]">
               GMRIT CodeSphere Secure Gateway v2.2
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
