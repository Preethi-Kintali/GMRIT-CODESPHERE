import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";
import { deleteStreamUser, upsertStreamUser } from "./stream.js";
import { sendInterviewInvite, sendCancellationNotice, sendEmailOtp, sendSecurityTerminationNotice, sendRoleNotice } from "./email.js";
import Notification from "../models/Notification.js";

export const inngest = new Inngest({ id: "GMRIT-CodeSphere" });

const syncUser = inngest.createFunction(
  { id: "sync-user" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    await connectDB();

    const { id, email_addresses, first_name, last_name, image_url } =
      event.data;
    const newUser = {
      clerkId: id,
      email: email_addresses[0]?.email_address,
      name: `${first_name || ""} ${last_name || ""}`,
      profileImage: image_url,
    };

    await User.create(newUser);

    await upsertStreamUser({
      id: newUser.clerkId.toString(),
      name: newUser.name,
      image: newUser.profileImage,
    });
  },
);

const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await connectDB();

    const { id } = event.data;
    await User.deleteOne({ clerkId: id });

    await deleteStreamUser(id.toString());
  },
);

const handleSessionScheduled = inngest.createFunction(
  { id: "handle-session-scheduled" },
  { event: "session/scheduled" },
  async ({ event }) => {
    await connectDB();
    const { params, notifications } = event.data;
    
    // Send Emails
    await sendInterviewInvite(params);
    
    // Create Notifications
    await Notification.insertMany(notifications);
  }
);

const handleSessionCancelled = inngest.createFunction(
  { id: "handle-session-cancelled" },
  { event: "session/cancelled" },
  async ({ event }) => {
    await connectDB();
    const { params, notifications } = event.data;
    
    await sendCancellationNotice(params);
    await Notification.insertMany(notifications);
  }
);

const handleSessionTerminated = inngest.createFunction(
  { id: "handle-session-terminated" },
  { event: "session/terminated" },
  async ({ event }) => {
    await connectDB();
    const { params, notifications } = event.data;
    
    await sendSecurityTerminationNotice(params);
    await Notification.insertMany(notifications);
  }
);

const handleSessionOtp = inngest.createFunction(
  { id: "handle-session-otp" },
  { event: "session/otp" },
  async ({ event }) => {
    await connectDB();
    const { emailParams, notificationParams } = event.data;
    
    await sendEmailOtp(emailParams);
    await Notification.create(notificationParams);
  }
);

const handleRoleChange = inngest.createFunction(
  { id: "handle-role-change" },
  { event: "user/role-changed" },
  async ({ event }) => {
    await connectDB();
    const { emailParams, notificationParams } = event.data;
    
    await sendRoleNotice(emailParams);
    if (notificationParams) {
      await Notification.create(notificationParams);
    }
  }
);

export const functions = [
  syncUser, 
  deleteUserFromDB, 
  handleSessionScheduled, 
  handleSessionCancelled, 
  handleSessionTerminated,
  handleSessionOtp,
  handleRoleChange
];
