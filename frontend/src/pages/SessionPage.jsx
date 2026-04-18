// Production Build Heartbeat: 2026-04-18
import { useUser } from "@clerk/clerk-react";

import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { io } from "socket.io-client";
import { useEndSession, useJoinSession, useSessionById } from "../hooks/useSessions";
import { PROBLEMS } from "../data/problems";
import { executeCode } from "../lib/piston";
import Navbar from "../components/Navbar";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { getDifficultyBadgeClass } from "../lib/utils";
import { Loader2Icon, LogOutIcon, PhoneOffIcon, BookTextIcon, FileTextIcon, Code2Icon, GripVerticalIcon, GripHorizontalIcon, UsersIcon, CopyIcon, CheckIcon } from "lucide-react";
import CodeEditorPanel from "../components/CodeEditorPanel";
import OutputPanel from "../components/OutputPanel";

import useStreamClient from "../hooks/useStreamClient";
import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import VideoCallUI from "../components/VideoCallUI";
import { useMobile } from "../hooks/useMobile";
import toast from "react-hot-toast";
import SessionLobby from "../components/SessionLobby";
import SessionTimer from "../components/SessionTimer";

function SessionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const isMobile = useMobile();

  const { data: sessionData, isLoading: loadingSession, isError: isSessionError, error: sessionError, refetch } = useSessionById(id);
  const joinSessionMutation = useJoinSession();
  const endSessionMutation = useEndSession();

  const session = sessionData?.session;
  const isInterviewer = session?.interviewer?.clerkId === user?.id;
  const isCandidate = session?.candidate?.clerkId === user?.id;

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");

  // Guard to prevent duplicate join calls (React StrictMode mounts effects twice in dev)
  const hasJoinedRef = useRef(false);
  const socketRef = useRef(null);

  // Note: we let streamClient hook know the roles as well
  const { call, channel, chatClient, isInitializingCall, streamClient } = useStreamClient(
    session,
    loadingSession,
    isInterviewer,
    isCandidate
  );

  // find the problem data based on session problem ID (from backend problem population)
  const problemData = session?.problem
    ? Object.values(PROBLEMS).find((p) => p.title === session.problem.title)
    : null;

  useEffect(() => {
    if (problemData?.starterCode?.[selectedLanguage] && !code) {
      setCode(problemData.starterCode[selectedLanguage]);
    }
  }, [problemData, selectedLanguage]);

  // auto-join session based on token
  useEffect(() => {
    if (!session || !user || loadingSession) return;
    if (hasJoinedRef.current) return; // idempotency guard

    // Both parties can join by identity or by token
    if (isInterviewer || isCandidate || token) {
      hasJoinedRef.current = true;
      joinSessionMutation.mutate({ id, token }, { onSuccess: refetch });
    }
  }, [session, user, loadingSession, id, token, isInterviewer, isCandidate, joinSessionMutation, refetch]);

  // redirect the "candidate" when session ends
  useEffect(() => {
    if (!session || loadingSession) return;

    if (session.status === "completed") {
      if (isCandidate) navigate(`/session/${id}/feedback/candidate`);
      else navigate("/dashboard");
    }
  }, [session, loadingSession, navigate, isCandidate, id]);

  // Security: Monitoring (Fullscreen & Tab Switch)
  useEffect(() => {
    if (!session || !isCandidate || session.status !== "active") return;

    const recordSecurityViolation = async (type, message) => {
      try {
        const { violationCount } = await import("../api/sessions").then(m => m.sessionApi.recordViolation({ id, type, message }));
        
        if (violationCount >= 3) {
          await import("../api/sessions").then(m => m.sessionApi.terminateByViolation({ 
            id, 
            reason: "Automatic Termination: Security Policy Breach (More than 3 critical violations detected)." 
          }));
          toast.error("INTERVIEW TERMINATED: Multiple security violations detected.", { duration: 10000 });
          refetch();
        } else {
          toast.error(`SECURITY ALERT: ${message}. Warning ${violationCount}/3`, { 
            duration: 5000,
            position: "top-center",
            style: { background: '#ef4444', color: '#fff', fontWeight: 'bold' }
          });
        }

        if (socketRef.current) {
          socketRef.current.emit("security_event", { sessionId: id, type, message, violationCount });
        }
      } catch (err) {
        console.error("Failed to record violation:", err);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) recordSecurityViolation("Tab Switch", "Candidate switched tabs or minimized window");
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        recordSecurityViolation("Fullscreen Exit", "Candidate exited fullscreen mode");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [session, isCandidate, id, refetch]);

  // sync incoming code changes via Socket.io
  useEffect(() => {
    if (!session || !user || loadingSession) return;
    
    const backendUrl = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";
    socketRef.current = io(backendUrl);
    socketRef.current.emit("join_session", id);

    socketRef.current.on("code_sync", (data) => {
      if (data.code !== undefined) setCode(data.code);
      if (data.language !== undefined) setSelectedLanguage(data.language);
    });

    socketRef.current.on("execution_start", () => {
      setIsRunning(true);
      setOutput(null);
    });

    socketRef.current.on("execution_result", ({ output }) => {
      setOutput(output);
      setIsRunning(false);
    });
    
    socketRef.current.on("session_ended", () => {
       toast.success("Session concluded by interviewer.");
       refetch();
    });

    socketRef.current.on("session_terminated", ({ reason }) => {
       toast.error(`TERMINATED: ${reason}`);
       refetch();
    });

    socketRef.current.on("session_started", () => {
       toast.success("Interview session is now LIVE!");
       refetch();
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [session, user, loadingSession, id, refetch]);

  if (loadingSession) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center space-y-4">
        <Loader2Icon className="size-10 text-emerald-500 animate-spin" />
        <p className="text-neutral-500 font-medium animate-pulse uppercase tracking-[0.2em] text-xs">Establishing Secure Link...</p>
      </div>
    );
  }

  if (isSessionError || !session) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-8">
           <div className="size-24 bg-red-600/10 border border-red-600/30 rounded-3xl flex items-center justify-center mx-auto mb-4 scale-110 shadow-[0_0_50px_rgba(220,38,38,0.1)]">
              <PhoneOffIcon className="size-12 text-red-500" />
           </div>
           <div className="space-y-2">
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Session Not Found</h1>
              <div className="badge badge-error gap-2 font-bold px-4 py-3">Database Lookup Failure</div>
           </div>
           <p className="text-neutral-400 text-sm bg-red-950/20 p-5 rounded-2xl border border-red-900/20">
              {sessionError?.response?.data?.message || "The interview session you are looking for does not exist or has been removed."}
           </p>
           <div className="pt-6">
              <button 
                onClick={() => navigate("/dashboard")} 
                className="btn btn-outline btn-error px-10 rounded-full"
              >
                Return to Dashboard
              </button>
           </div>
        </div>
      </div>
    );
  }

  if (session?.terminationReason) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-8 animate-in fade-in zoom-in duration-700">
           <div className="size-24 bg-red-600/10 border border-red-600/30 rounded-3xl flex items-center justify-center mx-auto mb-4 rotate-12 shadow-[0_0_50px_rgba(220,38,38,0.2)]">
              <PhoneOffIcon className="size-12 text-red-500 -rotate-12" />
           </div>
           <div className="space-y-2">
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Session Inaccessible</h1>
              <div className="badge badge-error gap-2 font-bold px-4 py-3">Security Policy Block</div>
           </div>
           <p className="text-neutral-400 text-sm bg-red-950/20 p-5 rounded-2xl border border-red-900/20 italic">
              "{session.terminationReason}"
           </p>
           <div className="text-[10px] text-neutral-500 uppercase tracking-[4px] font-bold">Session ID: {id}</div>
           <div className="pt-6">
              <button 
                onClick={() => navigate("/dashboard")} 
                className="btn btn-outline btn-error px-10 rounded-full hover:scale-105 active:scale-95 transition-transform"
              >
                Return to Dashboard
              </button>
           </div>
        </div>
      </div>
    );
  }

  // Handle Join Errors (Unauthorized, Cancelled, Completed)
  if (joinSessionMutation.isError) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-8">
           <div className="size-24 bg-amber-600/10 border border-amber-600/30 rounded-3xl flex items-center justify-center mx-auto mb-4 scale-110 shadow-[0_0_50px_rgba(217,119,6,0.1)]">
              <LogOutIcon className="size-12 text-amber-500" />
           </div>
           <div className="space-y-2">
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Access Denied</h1>
              <div className="badge badge-warning gap-2 font-bold px-4 py-3">Authorization Error</div>
           </div>
           <p className="text-neutral-400 text-sm bg-amber-950/20 p-5 rounded-2xl border border-amber-900/20">
              {joinSessionMutation.error?.response?.data?.message || "You are not authorized to join this interview session."}
           </p>
           <div className="pt-6">
              <button 
                onClick={() => navigate("/dashboard")} 
                className="btn btn-outline btn-warning px-10 rounded-full"
              >
                Return to Dashboard
              </button>
           </div>
        </div>
      </div>
    );
  }


  // Security: Restricted Devices Check (Block Mobiles & Tablets)
  const isRestrictedDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Security: Monitoring (Fullscreen & Tab Switch)

  // Security: Auto-Fullscreen Logic
  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn("Fullscreen request failed:", err);
      });
    }
  };


  const handleCodeChange = (value) => {
    setCode(value);
    
    if (socketRef.current) {
      socketRef.current.emit("code_sync", {
        sessionId: id,
        code: value,
        language: selectedLanguage
      });
    }
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    // use problem-specific starter code
    const starterCode = problemData?.starterCode?.[newLang] || "";
    setCode(starterCode);
    setOutput(null);

    if (socketRef.current) {
      socketRef.current.emit("code_sync", {
        sessionId: id,
        code: starterCode,
        language: newLang
      });
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);

    if (socketRef.current) {
      socketRef.current.emit("execution_start", { sessionId: id });
    }

    const result = await executeCode(selectedLanguage, code);
    setOutput(result);
    setIsRunning(false);

    if (socketRef.current) {
      socketRef.current.emit("execution_result", { sessionId: id, output: result });
    }
  };

  const handleEndSession = () => {
    toast((t) => (
      <div className="space-y-3">
        <p className="text-sm font-medium text-white">End this session? All participants will be notified.</p>
        <div className="flex justify-end gap-2 text-xs">
          <button 
            className="btn btn-xs btn-ghost text-neutral-400"
            onClick={() => toast.dismiss(t.id)}
          >
            Keep Coding
          </button>
          <button 
            className="btn btn-xs btn-error"
            onClick={() => {
              endSessionMutation.mutate(
                { id, finalCode: code, finalLanguage: selectedLanguage },
                { onSuccess: () => navigate(`/session/${id}/feedback`) }
              );
              toast.dismiss(t.id);
            }}
          >
            End Session
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: "top-center",
      style: {
        background: "#1e1e1e",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "16px",
        borderRadius: "12px",
        minWidth: "320px"
      }
    });
  };

  if (isRestrictedDevice && isCandidate) {
    return (
      <div className="h-screen bg-black flex items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-6">
          <div className="size-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2Icon className="size-10 text-red-500 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-tighter">Restriction: Desktop Only</h1>
          <p className="text-neutral-400 text-sm">To ensure the integrity and accessibility of the coding editor, interviews cannot be conducted on mobile or tablet devices.</p>
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-xs text-neutral-500">
            Please switch to a desktop or laptop to join this session.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#000000] flex flex-col font-sans relative overflow-hidden">
      {session?.status === "scheduled" && (
        <SessionLobby 
          session={session} 
          onSuccess={() => {
            enterFullscreen();
            refetch();
          }} 
        />
      )}
      
      <Navbar>
        {session?.status === "active" && (
          <SessionTimer 
            scheduledAt={session.scheduledAt} 
            duration={session.duration} 
            onTimeUp={() => {
              if (isInterviewer) handleEndSession();
            }}
          />
        )}
      </Navbar>

      <div className={`flex-1 p-4 pb-6 ${isMobile ? 'overflow-y-auto h-auto min-h-[1500px]' : 'overflow-hidden min-h-0'}`}>
        <PanelGroup direction={isMobile ? "vertical" : "horizontal"}>
          {/* LEFT PANEL - PROBLEM DETAILS */}
          <Panel defaultSize={isMobile ? 33 : 35} minSize={20}>
            <div className="h-full overflow-y-auto bg-[#1e1e1e] flex flex-col rounded-xl border border-white/10 custom-scrollbar">
              {/* HEADER TABS & SELECTOR */}

              <div className="flex items-center justify-between px-4 h-12 bg-[#2d2d2d] border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-md border border-white/5">
                  <BookTextIcon className="size-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-neutral-300">Session Problem</span>
                </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                      }}
                      className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded flex items-center gap-1.5 border border-white/10 transition-colors text-[10px] uppercase font-semibold tracking-wider text-neutral-300"
                    >
                      {isCopied ? <CheckIcon className="size-3 text-emerald-400" /> : <CopyIcon className="size-3" />}
                      Link
                    </button>

                    <div className="px-2 py-1 bg-white/5 rounded flex items-center gap-2 border border-white/10">
                      <UsersIcon className="size-3 text-neutral-400" />
                      <span className="text-[10px] font-medium text-neutral-300 uppercase tracking-wider">
                        2/2
                      </span>
                    </div>

                    {isInterviewer && session?.status === "active" && (
                      <button
                        onClick={handleEndSession}
                        disabled={endSessionMutation.isPending}
                        className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded flex items-center gap-1.5 transition-colors disabled:opacity-50 text-[10px] uppercase font-semibold tracking-wider"
                      >
                        {endSessionMutation.isPending ? (
                          <Loader2Icon className="size-3 animate-spin" />
                        ) : (
                          <LogOutIcon className="size-3" />
                        )}
                        End
                      </button>
                    )}
                  </div>
              </div>

              <div className="p-6 space-y-8 pb-10">
                {/* TITLE & META */}
                <div>
                  <h1 className="text-2xl font-semibold text-white tracking-tight mb-4">
                    {session?.problem?.title || "Loading..."}
                  </h1>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${getDifficultyBadgeClass(session?.problem?.difficulty)}`}>
                      {session?.problem?.difficulty ? session.problem.difficulty.slice(0, 1).toUpperCase() + session.problem.difficulty.slice(1) : "Easy"}
                    </span>
                    {problemData?.category && (
                      <span className="text-xs text-neutral-500 font-medium px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                        {problemData.category}
                      </span>
                    )}
                    {session?.status === "completed" && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-400">
                        Completed
                      </span>
                    )}
                  </div>
                </div>

                {/* PROBLEM DESC */}
                {problemData?.description && (
                  <div className="space-y-4 text-[14px] leading-relaxed text-neutral-300">
                    <p>{problemData.description.text}</p>
                    {problemData.description.notes?.map((note, idx) => (
                      <p key={idx}>{note}</p>
                    ))}
                  </div>
                )}

                {/* EXAMPLES SECTION */}
                {problemData?.examples && problemData.examples.length > 0 && (
                  <div className="space-y-6 pt-4">
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                      <FileTextIcon className="size-4 text-emerald-400" />
                      Examples
                    </h2>

                    <div className="space-y-6">
                      {problemData.examples.map((example, idx) => (
                        <div key={idx} className="space-y-3">
                          <p className="font-medium text-[13px] text-neutral-400">Example {idx + 1}:</p>
                          <div className="bg-[#2d2d2d] border border-white/10 rounded-lg p-4 font-mono text-[13px] space-y-2 relative overflow-hidden group">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/30 group-hover:bg-emerald-500/50 transition-colors" />

                            <div className="flex items-start gap-4">
                              <span className="text-neutral-500 font-semibold w-16 shrink-0">Input:</span>
                              <span className="text-neutral-300">{example.input}</span>
                            </div>
                            <div className="flex items-start gap-4">
                              <span className="text-neutral-500 font-semibold w-16 shrink-0">Output:</span>
                              <span className="text-emerald-400">{example.output}</span>
                            </div>

                            {example.explanation && (
                              <div className="pt-3 mt-3 border-t border-white/5">
                                <div className="flex items-start gap-4">
                                  <span className="text-neutral-500 font-semibold w-16 shrink-0">Explain:</span>
                                  <span className="text-neutral-400 font-sans tracking-wide leading-relaxed">{example.explanation}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CONSTRAINTS */}
                {problemData?.constraints && problemData.constraints.length > 0 && (
                  <div className="space-y-4 pt-4">
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Code2Icon className="size-4 text-emerald-400" />
                      Constraints
                    </h2>
                    <ul className="space-y-2">
                      {problemData.constraints.map((constraint, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-[13px]">
                          <div className="size-1.5 rounded-full bg-neutral-600" />
                          <code className="text-emerald-400/90 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{constraint}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className={`${isMobile ? 'h-4' : 'w-4'} flex items-center justify-center group cursor-${isMobile ? 'row' : 'col'}-resize`}>
            <div className={`${isMobile ? 'h-1.5 w-12' : 'w-1.5 h-12'} bg-white/10 group-hover:bg-emerald-500/50 rounded-full transition-colors flex items-center justify-center`}>
              {isMobile ? (
                <GripHorizontalIcon className="size-3 text-white/20 group-hover:text-emerald-400" />
              ) : (
                <GripVerticalIcon className="size-3 text-white/20 group-hover:text-emerald-400" />
              )}
            </div>
          </PanelResizeHandle>

          {/* MIDDLE PANEL - CODE EDITOR & OUTPUT */}
          <Panel defaultSize={isMobile ? 40 : 40} minSize={25}>
            <PanelGroup direction="vertical">
              <Panel defaultSize={65} minSize={30}>
                <CodeEditorPanel
                  selectedLanguage={selectedLanguage}
                  code={code}
                  isRunning={isRunning}
                  onLanguageChange={handleLanguageChange}
                  onCodeChange={handleCodeChange}
                  onRunCode={handleRunCode}
                />
              </Panel>

              <PanelResizeHandle className="h-4 flex items-center justify-center group cursor-row-resize">
                <div className="h-1.5 w-12 bg-white/10 group-hover:bg-emerald-500/50 rounded-full transition-colors flex items-center justify-center">
                  <GripHorizontalIcon className="size-3 text-white/20 group-hover:text-emerald-400" />
                </div>
              </PanelResizeHandle>

              <Panel defaultSize={35} minSize={15}>
                <OutputPanel output={output} />
              </Panel>
            </PanelGroup>
          </Panel>

          <PanelResizeHandle className={`${isMobile ? 'h-4' : 'w-4'} flex items-center justify-center group cursor-${isMobile ? 'row' : 'col'}-resize`}>
            <div className={`${isMobile ? 'h-1.5 w-12' : 'w-1.5 h-12'} bg-white/10 group-hover:bg-emerald-500/50 rounded-full transition-colors flex items-center justify-center`}>
              {isMobile ? (
                <GripHorizontalIcon className="size-3 text-white/20 group-hover:text-emerald-400" />
              ) : (
                <GripVerticalIcon className="size-3 text-white/20 group-hover:text-emerald-400" />
              )}
            </div>
          </PanelResizeHandle>

          {/* RIGHT PANEL - VIDEO CALLS & CHAT */}
          <Panel defaultSize={isMobile ? 27 : 25} minSize={20}>
            <div className="h-full bg-[#1e1e1e] flex flex-col rounded-xl overflow-hidden border border-white/10 overflow-auto">
              {isInitializingCall ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2Icon className="size-8 mx-auto animate-spin text-emerald-400 mb-4" />
                    <p className="text-neutral-400 text-sm font-medium">Connecting to channel...</p>
                  </div>
                </div>
              ) : !isInterviewer && !isCandidate ? (
                <div className="h-full flex items-center justify-center p-4">
                  <div className="bg-black/40 rounded-xl p-6 border border-yellow-500/20 max-w-sm w-full text-center">
                    <div className="size-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <PhoneOffIcon className="size-8 text-yellow-500" />
                    </div>
                    <h2 className="text-lg font-semibold text-white mb-2">Spectator Restricted</h2>
                    <p className="text-neutral-400 text-sm">Admins are not permitted to silently spectate active interviews! Please login as the scheduled Interviewer or Candidate.</p>
                  </div>
                </div>
              ) : !streamClient || !call ? (
                <div className="h-full flex items-center justify-center p-4">
                  <div className="bg-black/40 rounded-xl p-6 border border-red-500/20 max-w-sm w-full text-center">
                    <div className="size-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <PhoneOffIcon className="size-8 text-red-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-white mb-2">Connection Failed</h2>
                    <p className="text-neutral-400 text-sm">Unable to connect to the video channel.</p>
                  </div>
                </div>
              ) : (
                <div className="h-full bg-[#111111] overflow-hidden rounded-xl">
                  <StreamVideo client={streamClient}>
                    <StreamCall call={call}>
                      <VideoCallUI chatClient={chatClient} channel={channel} />
                    </StreamCall>
                  </StreamVideo>
                </div>
              )}
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default SessionPage;
