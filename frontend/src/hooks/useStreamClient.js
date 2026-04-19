import { useState, useEffect } from "react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { initializeStreamClient, disconnectStreamClient } from "../lib/stream";
import { sessionApi } from "../api/sessions";

function useStreamClient(session, loadingSession, isInterviewer, isCandidate) {
  const [streamClient, setStreamClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);

  useEffect(() => {
    let videoCall = null;
    let chatClientInstance = null;

    const initCall = async () => {
      if (!isInterviewer && !isCandidate) {
        setIsInitializingCall(false);
        return;
      }
      if (session.status !== "active") {
        setIsInitializingCall(false);
        return;
      }

      try {
        const { token, userId, userName, userImage } = await sessionApi.getStreamToken();

        const client = await initializeStreamClient(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );

        setStreamClient(client);

        videoCall = client.call("default", session.callId);
        await videoCall.join({ create: true });
        setCall(videoCall);

        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        chatClientInstance = StreamChat.getInstance(apiKey);

        await chatClientInstance.connectUser(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );
        setChatClient(chatClientInstance);

        const chatChannel = chatClientInstance.channel("messaging", session.callId);
        await chatChannel.watch();
        setChannel(chatChannel);
      } catch (error) {
        toast.error("Failed to join video call");
        console.error("Error init call", error);
      } finally {
        setIsInitializingCall(false);
      }
    };

    if (session && !loadingSession) initCall();

    // cleanup - performance reasons
    return () => {
      // iife
      (async () => {
        try {
          // We intentionally ONLY leave the call video channel.
          // We DO NOT disconnect the global chatClient or streamClient here.
          // Doing so causes a fatal race condition in React StrictMode/re-renders
          // where the cleanup of the first render rips the socket out from under the second render.
          if (videoCall) await videoCall.leave().catch(() => {});
        } catch (error) {
          console.error("Cleanup error:", error);
        }
      })();
    };
  }, [session?._id, session?.callId, session?.status, loadingSession, isInterviewer, isCandidate]);

  return {
    streamClient,
    call,
    chatClient,
    channel,
    isInitializingCall,
  };
}

export default useStreamClient;
