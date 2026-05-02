# 🚀 GMRIT CodeSphere

**GMRIT CodeSphere** is a professional-grade technical interview platform designed to streamline the recruitment process through real-time collaborative coding, secure video conferencing, and automated workflow management.

[![Tech Stack](https://img.shields.io/badge/Stack-MERN-blue)](https://mongodb.com)

---

## ✨ Key Features

### 💻 Real-time Collaborative Coding
- **Monaco Editor**: A VS Code-like experience with syntax highlighting for multiple languages.
- **Socket.io Sync**: Ultra-low latency code synchronization between interviewer and candidate.
- **Remote Execution**: Securely run code in the cloud via the **Judge0 API**.

### 🎥 High-Quality Communication
- **Video & Audio**: Seamless video calls powered by **Stream.io**.
- **Real-time Chat**: Dedicated chat channels for every interview session.

### 🛡️ Security & Integrity
- **Identity Verification**: Secure OTP-based verification for both participants before session entry.
- **Anti-Cheating System**: Real-time tracking of tab-switching and fullscreen exits with automated violation reporting.
- **Session Lifecycles**: Hard expiration of sessions to prevent unauthorized reuse.

### 📅 Smart Scheduling
- **Timezone Aware**: Automatic timezone conversions for seamless global scheduling.
- **Operational Guards**: Built-in rules to prevent Sunday scheduling and overlap with lunch breaks.
- **Email Automation**: Automatic interview invites and reminders via **Nodemailer/Gmail**.

### 📊 Admin Dashboard
- Comprehensive management of users, interview problems, and scheduled sessions.
- Detailed logs of interview violations and completion statuses.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, DaisyUI, TanStack Query |
| **Backend** | Node.js, Express, Socket.io, Inngest |
| **Database** | MongoDB (Mongoose ODM) |
| **Auth** | Clerk (Identity-as-a-Service) |
| **Real-time** | GetStream.io (Video/Chat), Judge0 (Code Execution) |

---

## 📐 Architecture Overview

The platform follows a modern, event-driven architecture designed for scalability and reliability.

### System Flow
1. **Scheduling**: Admins create sessions; logic validates against operational bounds.
2. **Notification**: **Inngest** or direct services trigger automated emails.
3. **Live Interaction**: 
   - **Socket.io** manages code sync.
   - **Stream.io** handles media streams.
   - **Clerk** ensures all participants are authenticated.
4. **Execution**: The backend proxies code execution requests to **Judge0** sandboxes.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Clerk account (Auth)
- Stream.io account (Video/Chat)
- Inngest account (Background jobs)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Preethi-Kintali/GMRIT-CODESPHERE.git
   cd GMRIT-CODESPHERE
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   cp .env.example .env
   # Fill in your environment variables
   npm install
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   cp .env.example .env
   # Fill in your environment variables
   npm install
   ```

### Running Locally

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

---

## 📄 License

This project is licensed under the ISC License.

---

Built with ❤️ by the GMRIT Team.
