# GMRIT CodeSphere — v2 Product Design Plan & Checkpoint Tracker

This document serves as the master checklist and technical record for the `v2` product updates made to the GMRIT CodeSphere platform, covering the Admin System Finalization, Profile Tracking, and Notification capabilities.

## 1. Administrative Management & Routing
- [x] **Role-Based Access Control Extensions:**
  - Integrated rigorous user promotion flow ensuring `interviewer` mapping is recorded in MongoDB and synced actively via `clerkClient.users.updateUserMetadata`.
  - Removed "Demote to Candidate" UI from standard Admin screens completely to prevent accidental execution and enforce secure un-privileged boundaries.
- [x] **UI/UX Re-designs for Admins:**
  - Transformed the Admin Candidates dashboard from massive vertical cards into a sleek, wide UI format to display 2-3 candidate details neatly across the layout.

## 2. Advanced User Profiles
- [x] **Schema Optimization:**
  - Expanded `User.js` MongoDB schema to feature professional properties: `username`, `bio`, `title`, `skills`, `githubUrl`, `leetcodeUrl`, `linkedinUrl`, `resumeUrl`, and `hasCompletedProfile`.
- [x] **Profile Dashboard:**
  - Engineered a fully stateful React `ProfilePage.jsx` component.
  - Developed an explicit "Read-Only" mode that automatically displays "Not provided" for empty properties without showing form artifact placeholders.
  - Transformed UI aesthetic from heavy card-wrappers to a fully borderless, flat tech minimalistic alignment. Actions strictly placed in the profile header rather than the footer.
- [x] **Onboarding Interceptor Logic (Dashboard Routing):**
  - Integrated `useQuery` fetch to `/api/users/me` on `DashboardPage.jsx`.
  - Added aggressive `<Navigate to="/profile" replace />` handling to immediately capture new user signups and force them to formally `Save Changes` on their developer profile before unlocking application tools.
- [x] **Legacy User Sync Backend Script:**
  - Altered the Clerk Webhook route (`webhookRoutes.js`) to parse emails into default unique usernames on account creation.
  - Fired backend sync scripts patching legacy Candidate documents correctly.

## 3. Communication & In-App Notification Engine
- [x] **Email Infrastructure (`React Email` + `Resend`):**
  - Created standardized email templates tracking:
    - User/Interviewer Promotion Notices.
    - Interview Scheduling Invitations (mapping custom `session/:id?token=` access links).
    - Session Cancellation Alerts.
- [x] **Real-Time Notification System:**
  - **Database schema:** Designed a structured `Notification.js` schema (`userId`, `type`, `title`, `message`, `isRead`).
  - **API Endpoints:** Deployed `GET /api/notifications` and `PUT /api/notifications/:id/read`.
  - **Auto-Injection Interceptors:** Configured `adminController` and `sessionController` to dynamically generate notification objects concurrently with any major platform events (Promotions, Session Scheduling, Session Cancellations).
  - **Notification Dropdown Bell:** Developed the `NotificationBell.jsx` UI and injected it cleanly into the active Navbar layout. It supports short-polling (30 seconds), real-time unread dot badging, "Mark All as Read", and instant redirect deep linking into Context resources.

---
**Status:** **v2 Feature Updates ✅ COMPLETE & PRODUCTION REDIRECTED.**
