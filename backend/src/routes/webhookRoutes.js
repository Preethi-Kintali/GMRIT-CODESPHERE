import express from "express";
import { Webhook } from "svix";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

const router = express.Router();

router.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const WEBHOOK_SECRET = ENV.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      return res.status(500).json({ error: "Please add CLERK_WEBHOOK_SECRET to .env" });
    }

    const payload = req.body;
    const headers = req.headers;

    const svix_id = headers["svix-id"];
    const svix_timestamp = headers["svix-timestamp"];
    const svix_signature = headers["svix-signature"];

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).json({ error: "Missing Svix headers" });
    }

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt;

    try {
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.error("Error verifying webhook:", err.message);
      return res.status(400).json({ error: "Webhook verification failed" });
    }

    const eventType = evt.type;
    const { id } = evt.data;

    try {
      if (eventType === "user.created" || eventType === "user.updated") {
        const email = evt.data.email_addresses?.[0]?.email_address || "";
        const firstName = evt.data.first_name || "";
        const lastName = evt.data.last_name || "";
        const name = `${firstName} ${lastName}`.trim() || "User";
        const profileImage = evt.data.image_url || "";
        const role = evt.data.public_metadata?.role || "candidate";

        await User.findOneAndUpdate(
          { clerkId: id },
          {
            email,
            name,
            profileImage,
            role,
          },
          { upsert: true, new: true }
        );

        console.log(`Webhook handled: User ${id} updated/created`);
      }
      res.status(200).json({ success: true, message: "Webhook processed" });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default router;
