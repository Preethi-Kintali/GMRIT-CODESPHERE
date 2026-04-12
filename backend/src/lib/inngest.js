import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { upsertStreamUser, deleteStreamUser } from "./stream.js";
import { 
  sendInterviewInvite, 
  sendCancellationNotice, 
  sendSecurityTerminationNotice, 
  sendEmailOtp, 
  sendRoleNotice 
} from "./email.js";
import { ENV } from "./env.js";

export const inngest = new Inngest({ 
  id: "GMRIT-CodeSphere"
});

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
    console.log("Inngest: Handling session/scheduled event...");
    await connectDB();
    const { params, notifications } = event.data;
    
    // Send Emails
    await sendInterviewInvite(params);
    console.log("Inngest: Invitation emails sent.");
    
    // Create Notifications
    await Notification.insertMany(notifications);
  }
);

const handleSessionCancelled = inngest.createFunction(
  { id: "handle-session-cancelled" },
  { event: "session/cancelled" },
  async ({ event }) => {
    console.log("Inngest: Handling session/cancelled event...");
    await connectDB();
    const { params, notifications } = event.data;
    
    await sendCancellationNotice(params);
    console.log("Inngest: Cancellation emails sent.");
    await Notification.insertMany(notifications);
  }
);

const handleSessionTerminated = inngest.createFunction(
  { id: "handle-session-terminated" },
  { event: "session/terminated" },
  async ({ event }) => {
    console.log("Inngest: Handling session/terminated event...");
    await connectDB();
    const { params, notifications } = event.data;
    
    await sendSecurityTerminationNotice(params);
    console.log("Inngest: Termination emails sent.");
    await Notification.insertMany(notifications);
  }
);

const handleSessionOtp = inngest.createFunction(
  { id: "handle-session-otp" },
  { event: "session/otp" },
  async ({ event }) => {
    console.log("Inngest: Handling session/otp event...");
    await connectDB();
    const { emailParams, notificationParams } = event.data;
    
    await sendEmailOtp(emailParams);
    console.log("Inngest: OTP email sent.");
    await Notification.create(notificationParams);
  }
);

const handleRoleChange = inngest.createFunction(
  { id: "handle-role-change" },
  { event: "user/role-changed" },
  async ({ event }) => {
    console.log("Inngest: Handling user/role-changed event...");
    await connectDB();
    const { emailParams, notificationParams } = event.data;
    
    await sendRoleNotice(emailParams);
    console.log("Inngest: Role change email sent.");
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
