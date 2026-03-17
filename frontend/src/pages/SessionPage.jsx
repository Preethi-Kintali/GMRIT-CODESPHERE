import { useUser } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useEndSession, useJoinSession, useSessionById } from "../hooks/useSessions";
import { PROBLEMS } from "../data/problems";
import { executeCode } from "../lib/piston";
import Navbar from "../components/Navbar";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { getDifficultyBadgeClass } from "../lib/utils";
import { Loader2Icon, LogOutIcon, PhoneOffIcon, BookTextIcon, FileTextIcon, Code2Icon, GripVerticalIcon, GripHorizontalIcon, UsersIcon } from "lucide-react";
import CodeEditorPanel from "../components/CodeEditorPanel";
import OutputPanel from "../components/OutputPanel";

import useStreamClient from "../hooks/useStreamClient";
import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import VideoCallUI from "../components/VideoCallUI";

function SessionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const { data: sessionData, isLoading: loadingSession, refetch } = useSessionById(id);

  const joinSessionMutation = useJoinSession();
  const endSessionMutation = useEndSession();

  const session = sessionData?.session;
  const isHost = session?.host?.clerkId === user?.id;
  const isParticipant = session?.participant?.clerkId === user?.id;

  // Guard to prevent duplicate join calls (React StrictMode mounts effects twice in dev)
  const hasJoinedRef = useRef(false);

  const { call, channel, chatClient, isInitializingCall, streamClient } = useStreamClient(
    session,
    loadingSession,
    isHost,
    isParticipant
  );

  // find the problem data based on session problem title
  const problemData = session?.problem
    ? Object.values(PROBLEMS).find((p) => p.title === session.problem)
    : null;

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(problemData?.starterCode?.[selectedLanguage] || "");

  // auto-join session if user is not already a participant and not the host
  useEffect(() => {
    if (!session || !user || loadingSession) return;
    if (isHost || isParticipant) return;
    if (hasJoinedRef.current) return; // idempotency guard

    hasJoinedRef.current = true;
    joinSessionMutation.mutate(id, { onSuccess: refetch });

    // remove the joinSessionMutation, refetch from dependencies to avoid infinite loop
  }, [session, user, loadingSession, isHost, isParticipant, id]);

  // redirect the "participant" when session ends
  useEffect(() => {
    if (!session || loadingSession) return;

    if (session.status === "completed") navigate("/dashboard");
  }, [session, loadingSession, navigate]);

  // update code when problem loads or changes
  useEffect(() => {
    if (problemData?.starterCode?.[selectedLanguage]) {
      setCode(problemData.starterCode[selectedLanguage]);
    }
  }, [problemData, selectedLanguage]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    // use problem-specific starter code
    const starterCode = problemData?.starterCode?.[newLang] || "";
    setCode(starterCode);
    setOutput(null);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);

    const result = await executeCode(selectedLanguage, code);
    setOutput(result);
    setIsRunning(false);
  };

  const handleEndSession = () => {
    if (confirm("Are you sure you want to end this session? All participants will be notified.")) {
      // this will navigate the HOST to dashboard
      endSessionMutation.mutate(id, { onSuccess: () => navigate("/dashboard") });
    }
  };

  return (
    <div className="h-screen bg-[#000000] flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 p-4 pb-6 overflow-hidden min-h-0">
        <PanelGroup direction="horizontal">
          {/* LEFT PANEL - PROBLEM DETAILS */}
          <Panel defaultSize={35} minSize={25}>
            <div className="h-full overflow-y-auto bg-[#1e1e1e] flex flex-col rounded-xl border border-white/10 custom-scrollbar">
              {/* HEADER TABS & SELECTOR */}
              <div className="flex items-center justify-between px-4 h-12 bg-[#2d2d2d] border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-md border border-white/5">
                  <BookTextIcon className="size-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-neutral-300">Session Problem</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-2 py-1 bg-white/5 rounded flex items-center gap-2 border border-white/10">
                    <UsersIcon className="size-3 text-neutral-400" />
                    <span className="text-[10px] font-medium text-neutral-300 uppercase tracking-wider">
                      {session?.participant ? 2 : 1}/2
                    </span>
                  </div>

                  {isHost && session?.status === "active" && (
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
                    {session?.problem || "Loading..."}
                  </h1>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${getDifficultyBadgeClass(session?.difficulty)}`}>
                      {session?.difficulty.slice(0, 1).toUpperCase() + session?.difficulty.slice(1) || "Easy"}
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

          <PanelResizeHandle className="w-4 flex items-center justify-center group cursor-col-resize">
            <div className="w-1.5 h-12 bg-white/10 group-hover:bg-emerald-500/50 rounded-full transition-colors flex items-center justify-center">
              <GripVerticalIcon className="size-3 text-white/20 group-hover:text-emerald-400" />
            </div>
          </PanelResizeHandle>

          {/* MIDDLE PANEL - CODE EDITOR & OUTPUT */}
          <Panel defaultSize={40} minSize={25}>
            <PanelGroup direction="vertical">
              <Panel defaultSize={65} minSize={30}>
                <CodeEditorPanel
                  selectedLanguage={selectedLanguage}
                  code={code}
                  isRunning={isRunning}
                  onLanguageChange={handleLanguageChange}
                  onCodeChange={(value) => setCode(value)}
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

          <PanelResizeHandle className="w-4 flex items-center justify-center group cursor-col-resize">
            <div className="w-1.5 h-12 bg-white/10 group-hover:bg-emerald-500/50 rounded-full transition-colors flex items-center justify-center">
              <GripVerticalIcon className="size-3 text-white/20 group-hover:text-emerald-400" />
            </div>
          </PanelResizeHandle>

          {/* RIGHT PANEL - VIDEO CALLS & CHAT */}
          <Panel defaultSize={25} minSize={20}>
            <div className="h-full bg-[#1e1e1e] flex flex-col rounded-xl overflow-hidden border border-white/10 overflow-auto">
              {isInitializingCall ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2Icon className="size-8 mx-auto animate-spin text-emerald-400 mb-4" />
                    <p className="text-neutral-400 text-sm font-medium">Connecting to channel...</p>
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
