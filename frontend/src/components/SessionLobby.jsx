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
  AlertCircleIcon
} from "lucide-react";
import { sessionApi } from "../api/sessions";
import toast from "react-hot-toast";

export default function SessionLobby({ session, onSuccess }) {
  const { user } = useUser();
  const isInterviewer = session.interviewer?.clerkId === user?.id;
  const isCandidate = session.candidate?.clerkId === user?.id;

  // Determine starting step
  const getInitialStep = () => {
    if (isCandidate && !session.isVerified) return "verification";
    return "techCheck";
  };

  const [step, setStep] = useState(getInitialStep());
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  
  // Tech Check State
  const [stream, setStream] = useState(null);
  const [techReady, setTechReady] = useState({ video: false, audio: false });
  const videoRef = useRef(null);

  useEffect(() => {
    if (step === "techCheck") {
      startCamera();
    }
    return () => stopCamera();
  }, [step]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setTechReady({ video: true, audio: true });
    } catch (err) {
      console.error("Camera access denied:", err);
      toast.error("Please allow camera and microphone access to proceed.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleSendOtp = async () => {
    if (!acceptedTerms) {
      toast.error("Please accept the terms and conditions first.");
      return;
    }
    
    setIsSendingOtp(true);
    try {
      await sessionApi.sendOtp(session._id);
      setOtpSent(true);
      toast.success("Verification code sent to your email!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }

    setIsVerifying(true);
    try {
      await sessionApi.verifyOtp({ id: session._id, otp });
      toast.success("Identity verified!");
      setStep("techCheck");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired code");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    try {
      await sessionApi.checkIn(session._id);
      toast.success("Checked in! Waiting for peer...");
      onSuccess(); // Triggers refetch and entrance in SessionPage
    } catch (error) {
      toast.error(error.response?.data?.message || "Check-in failed");
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#09090b] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-in fade-in slide-in-from-bottom-8 duration-500">
        
        {/* LEFT COLUMN: GUIDELINES & PEER STATUS */}
        <div className="hidden lg:flex flex-col gap-6">
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <ShieldCheckIcon className="size-6 text-emerald-500" />
              Pre-Session Check
            </h2>
            
            <div className="space-y-6">
              <div className="flex gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${session.isVerified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-neutral-500'}`}>
                  <UserCheckIcon className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Candidate Verification</h4>
                  <p className="text-xs text-neutral-500 mt-1">{session.isVerified ? 'Verified successfully' : 'Pending OTP verification'}</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${session.interviewerCheckedIn ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-neutral-500'}`}>
                  <Settings2Icon className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Interviewer Status</h4>
                  <p className="text-xs text-neutral-500 mt-1">{session.interviewerCheckedIn ? 'Checked in & Ready' : 'Waiting to join...'}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-3">
                <AlertCircleIcon className="size-5 text-amber-500 shrink-0" />
                <p className="text-[11px] text-amber-500/80 leading-relaxed font-medium">
                  Ensure you are in a quiet room with good lighting. Background activity or multiple people on camera may trigger security flags.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE STEPS */}
        <div className="w-full">
          <div className="p-8 rounded-3xl border border-white/10 bg-[#18181b] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" />
            
            {step === "verification" && (
              <div className="animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-8">
                  <div className="size-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 mx-auto">
                    <ShieldCheckIcon className="size-8 text-emerald-500" />
                  </div>
                  <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Identify Verification</h1>
                  <p className="text-neutral-400 text-sm">Secure access for candidate: <span className="text-emerald-400">{session.candidate.name}</span></p>
                </div>

                {!otpSent ? (
                  <div className="space-y-6">
                    <div className="bg-black/40 rounded-2xl p-5 border border-white/5">
                      <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Security Agreement</h3>
                      <ul className="space-y-3 text-[13px] text-neutral-300">
                        <li className="flex gap-2">
                          <CheckCircle2Icon className="size-4 text-emerald-500 shrink-0" />
                          I will keep my camera and mic enabled throughout.
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle2Icon className="size-4 text-emerald-500 shrink-0" />
                          Screen activity and tab-switching will be logged.
                        </li>
                      </ul>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="size-5 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-0 transition-all" 
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                      />
                      <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">I accept the secure session rules</span>
                    </label>

                    <button 
                      onClick={handleSendOtp}
                      disabled={!acceptedTerms || isSendingOtp}
                      className="btn btn-primary w-full shadow-lg bg-emerald-600 hover:bg-emerald-500 border-none"
                    >
                      {isSendingOtp ? (
                        <Loader2Icon className="size-5 animate-spin" />
                      ) : (
                        <>
                          Send OTP to Registered Email
                          <MailIcon className="size-4" />
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleVerify} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-1">6-Digit Code</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="000000"
                          maxLength={6}
                          className="input input-bordered w-full bg-black/40 border-white/10 text-center tracking-[12px] text-xl font-mono focus:border-emerald-500/50"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        />
                        <LockIcon className="size-4 text-neutral-600 absolute right-4 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-neutral-500 mb-4">
                        Code sent to <span className="text-blue-400">{session.candidate.email}</span>
                      </p>
                      <button 
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-xs text-neutral-400 hover:text-white font-medium transition-colors"
                      >
                        Resend code or edit details
                      </button>
                    </div>

                    <button 
                      type="submit"
                      disabled={otp.length !== 6 || isVerifying}
                      className="btn btn-primary w-full shadow-lg group bg-emerald-600 hover:bg-emerald-500 border-none"
                    >
                      {isVerifying ? (
                        <Loader2Icon className="size-5 animate-spin" />
                      ) : (
                        <>
                          Verify & Proceed
                          <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {step === "techCheck" && (
              <div className="animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-8">
                  <div className="size-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 mx-auto">
                    <VideoIcon className="size-8 text-blue-500" />
                  </div>
                  <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Hardware Check</h1>
                  <p className="text-neutral-400 text-sm">Preview your setup before checking in.</p>
                </div>

                <div className="space-y-6">
                  {/* VIDEO PREVIEW */}
                  <div className="relative aspect-video rounded-2xl bg-black border border-white/5 overflow-hidden group">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover mirror"
                    />
                    {!stream && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500 bg-black/80">
                        <CameraIcon className="size-10 mb-2 opacity-20" />
                        <p className="text-xs">Camera is off</p>
                      </div>
                    )}
                    
                    {/* OVERLAYS */}
                    <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
                       <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-widest">
                          <div className={`size-1.5 rounded-full ${techReady.video ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          Camera
                       </div>
                       <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-widest">
                          <div className={`size-1.5 rounded-full ${techReady.audio ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          Audio
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                      <MicIcon className="size-4 text-blue-400 mb-2" />
                      <h5 className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Microphone</h5>
                      <p className="text-xs text-white">Default Input</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                      <VideoIcon className="size-4 text-blue-400 mb-2" />
                      <h5 className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Video</h5>
                      <p className="text-xs text-white">Built-in Webcam</p>
                    </div>
                  </div>

                  <button 
                    onClick={handleCheckIn}
                    disabled={isCheckingIn || !techReady.video}
                    className="btn btn-primary w-full shadow-lg group bg-blue-600 hover:bg-blue-500 border-none"
                  >
                    {isCheckingIn ? (
                      <Loader2Icon className="size-5 animate-spin" />
                    ) : (
                      <>
                        Check-in & Join Lobby
                        <UserCheckIcon className="size-4 transition-transform group-hover:scale-110" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/5 text-[10px] text-neutral-500 uppercase tracking-[2px]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  Secure Gateway Active
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
