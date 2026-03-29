import {
  CallControls,
  CallingState,
  SpeakerLayout,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { Loader2Icon, MessageSquareIcon, UsersIcon, XIcon, VideoIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Channel, Chat, MessageInput, MessageList, Thread, Window } from "stream-chat-react";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import "stream-chat-react/dist/css/v2/index.css";

function VideoCallUI({ chatClient, channel }) {
  const navigate = useNavigate();
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  const [isChatOpen, setIsChatOpen] = useState(false);

  if (callingState === CallingState.JOINING) {
    return (
      <div className="h-full flex items-center justify-center p-4 bg-[#111111]">
        <div className="text-center">
          <Loader2Icon className="size-8 mx-auto animate-spin text-emerald-400 mb-4" />
          <p className="text-neutral-400 text-sm font-medium">Joining channel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex relative str-video bg-[#1e1e1e] overflow-hidden">
      <div className="flex-1 flex flex-col">
        {/* Participants count badge and Chat Toggle */}
        <div className="flex items-center justify-between px-4 h-12 bg-[#2d2d2d] border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-md border border-white/5">
            <VideoIcon className="size-4 text-emerald-400" />
            <span className="text-xs font-semibold text-neutral-300">Video Channel</span>

            <div className="w-px h-3 bg-white/10 mx-1" />

            <UsersIcon className="size-3 text-neutral-400" />
            <span className="text-[10px] font-medium text-neutral-300 uppercase tracking-wider">
              {participantCount} {participantCount === 1 ? "User" : "Users"}
            </span>
          </div>

          {chatClient && channel && (
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-xs font-medium transition-colors border ${isChatOpen
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                  : "bg-white/5 text-neutral-400 hover:text-white border-white/10 hover:bg-white/10"
                }`}
            >
              <MessageSquareIcon className="size-3.5" />
              Chat
            </button>
          )}
        </div>

        <div className="flex-1 overflow-hidden relative bg-[#000000]">
          <SpeakerLayout />
        </div>

        <div className="flex items-center justify-center h-16 bg-[#2d2d2d] border-t border-white/10 shrink-0">
          <CallControls onLeave={() => navigate("/dashboard")} />
        </div>
      </div>

      {/* CHAT SECTION */}
      {chatClient && channel && (
        <div
          className={`flex flex-col border-l border-white/10 bg-[#1e1e1e] transition-all duration-300 ease-in-out ${isChatOpen ? "absolute md:relative right-0 top-0 bottom-0 z-50 w-full md:w-80 opacity-100" : "w-0 opacity-0 overflow-hidden"
            }`}
        >
          {isChatOpen && (
            <>
              <div className="flex items-center justify-between px-4 h-12 bg-[#2d2d2d] border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  <MessageSquareIcon className="size-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-neutral-300">Session Chat</span>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                >
                  <XIcon className="size-3.5" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden stream-chat-dark custom-scrollbar">
                <Chat client={chatClient} theme="str-chat__theme-dark">
                  <Channel channel={channel}>
                    <Window>
                      <MessageList />
                      <MessageInput />
                    </Window>
                    <Thread />
                  </Channel>
                </Chat>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
export default VideoCallUI;
