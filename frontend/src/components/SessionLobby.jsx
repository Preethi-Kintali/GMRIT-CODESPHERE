import { useState } from "react";
import { ShieldCheckIcon, MailIcon, LockIcon, ArrowRightIcon, Loader2Icon, CheckCircle2Icon } from "lucide-react";
import { sessionApi } from "../api/sessions";
import toast from "react-hot-toast";

export default function SessionLobby({ session, onVerified }) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

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
      toast.success("Verification successful!");
      onVerified();
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired code");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#000000] flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-300">
        <div className="p-8 rounded-3xl border border-white/10 bg-[#1e1e1e] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" />
          
          <div className="flex flex-col items-center text-center mb-8">
            <div className="size-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-xl">
              <ShieldCheckIcon className="size-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Secure Interview Join</h1>
            <p className="text-neutral-400 text-sm">To ensure the integrity of the interview, please verify your identity.</p>
          </div>

          {!otpSent ? (
            <div className="space-y-6">
              <div className="bg-black/40 rounded-2xl p-5 border border-white/5">
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Terms & Conditions</h3>
                <ul className="space-y-3 text-[13px] text-neutral-300">
                  <li className="flex gap-2">
                    <CheckCircle2Icon className="size-4 text-emerald-500 shrink-0" />
                    I am the authorized candidate for this session.
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2Icon className="size-4 text-emerald-500 shrink-0" />
                    I will not use any external AI or unauthorized help.
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2Icon className="size-4 text-emerald-500 shrink-0" />
                    I understand that my screen activity may be monitored.
                  </li>
                </ul>
              </div>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="checkbox checkbox-primary border-white/20" 
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />
                <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">I agree to the Rules and Conditions</span>
              </label>

              <button 
                onClick={handleSendOtp}
                disabled={!acceptedTerms || isSendingOtp}
                className="btn btn-primary w-full shadow-lg"
              >
                {isSendingOtp ? (
                  <Loader2Icon className="size-5 animate-spin" />
                ) : (
                  <>
                    Send Verification Code
                    <MailIcon className="size-4" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-1">6-Digit Verification Code</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="000000"
                    maxLength={6}
                    className="input input-bordered w-full bg-black/40 border-white/10 text-center tracking-[12px] text-xl font-mono focus:border-blue-500/50"
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
                  Change email or go back
                </button>
              </div>

              <button 
                type="submit"
                disabled={otp.length !== 6 || isVerifying}
                className="btn btn-primary w-full shadow-lg group"
              >
                {isVerifying ? (
                  <Loader2Icon className="size-5 animate-spin" />
                ) : (
                  <>
                    Verify & Join Session
                    <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-white/5 text-center text-[10px] text-neutral-500 uppercase tracking-widest">
            GMRIT CodeSphere Secure Gateway
          </div>
        </div>
      </div>
    </div>
  );
}
