import { chatClient, streamClient } from "../lib/stream.js";
import Session from "../models/Session.js";

export async function createSession(req, res) {
  try {
    const { problem, difficulty } = req.body;
    const userId = req.user._id;

    if (!problem || !difficulty) {
      return res
        .status(400)
        .json({ message: "Problem and difficulty are required" });
    }

    // generate a unique call id for stream video
    const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // create session in db
    // NOTE: We deliberately do NOT pre-create the Stream video call or chat channel here.
    // The frontend handles joining the call with videoCall.join({ create: true })
    // and watches the chat channel via chatChannel.watch() — both of which create
    // the resources on-demand. Pre-creating them server-side causes StreamClient
    // constructor timeouts that break session creation entirely.
    const session = await Session.create({
      problem,
      difficulty,
      host: userId,
      callId,
    });

    res.status(201).json({ session });
  } catch (error) {
    console.error("Error in createSession controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getActiveSessions(_, res) {
  try {
    const sessions = await Session.find({ status: "active" })
      .populate("host", "name profileImage email clerkId")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.error("Error in getActiveSessions controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyRecentSessions(req, res) {
  try {
    const userId = req.user._id;
    // get sessions where user is either host or participant
    const sessions = await Session.find({
      status: "completed",
      $or: [{ host: userId }, { participant: userId }],
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.error("Error in getMyRecentSessions controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getSessionById(req, res) {
  try {
    const { id } = req.params;
    const session = await Session.findById(id)
      .populate("host", "name email profileImage clerkId")
      .populate("participant", "name email profileImage clerkId");

    if (!session) return res.status(404).json({ message: "Session not found" });
    res.status(200).json({ session });
  } catch (error) {
    console.error("Error in getSessionById controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function joinSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    // First check if the session exists and validate its state
    const existing = await Session.findById(id);
    if (!existing) return res.status(404).json({ message: "Session not found" });

    if (existing.status !== "active") {
      return res.status(400).json({ message: "Cannot join a completed session" });
    }

    if (existing.host.toString() === userId.toString()) {
      return res.status(400).json({
        message: "Host cannot join their own session as a participant",
      });
    }

    // Atomically claim the participant slot — only succeeds if participant is still empty
    const session = await Session.findOneAndUpdate(
      { _id: id, status: "active", participant: null },
      { $set: { participant: userId } },
      { new: true }
    );

    // If no document was updated, the session was already full (race condition)
    if (!session) {
      return res.status(409).json({ message: "Session is full" });
    }

    const channel = chatClient.channel("messaging", session.callId);
    await channel.addMembers([clerkId]);

    res.status(200).json({ session });
  } catch (error) {
    console.error("Error in joinSession controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function endSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    // check if user is the host
    if (session.host.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Only the host can end the session" });
    }

    // check if session is already completed
    if (session.status === "completed") {
      return res.status(400).json({ message: "Session is already completed" });
    }

    // delete stream video call & chat channel (best-effort — don't block DB update if Stream fails)
    try {
      const call = streamClient.video.call("default", session.callId);
      await call.delete({ hard: true });
    } catch (streamErr) {
      console.error("Could not delete Stream video call:", streamErr.message);
    }
    try {
      const channel = chatClient.channel("messaging", session.callId);
      await channel.delete();
    } catch (streamErr) {
      console.error("Could not delete Stream chat channel:", streamErr.message);
    }

    session.status = "completed";
    await session.save();

    res.status(200).json({ session, message: "Session ended successfully" });
  } catch (error) {
    console.error("Error in endSession controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
