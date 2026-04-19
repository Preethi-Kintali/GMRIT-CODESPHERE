import "./lib/setup.js";
import "./cron/reminders.js";
import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import cors from "cors";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";


import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";
import { protectRoute } from "./middleware/protectRoute.js";
import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import executeRoutes from "./routes/executeRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import problemRoutes from "./routes/problemRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import Session from "./models/Session.js";


const PORT = ENV.PORT;
const app = express();
app.set("trust proxy", 1); // Specific number required by express-rate-limit instead of 'true'


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ENV.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  }
});


io.on("connection", (socket) => {
  console.log("User connected to socket:", socket.id);

  socket.on("join_session", (sessionId) => {
    socket.join(sessionId);
  });

  socket.on("code_sync", async ({ sessionId, code, language }) => {
    socket.to(sessionId).emit("code_sync", { code, language });
    
    // Persist to DB for crash/refresh recovery
    try {
      await Session.findByIdAndUpdate(sessionId, { 
        liveCode: code, 
        liveLanguage: language 
      });
    } catch (err) {
      console.error("Socket persistence error:", err);
    }
  });

  socket.on("execution_start", ({ sessionId }) => {
    socket.to(sessionId).emit("execution_start");
  });

  socket.on("execution_result", ({ sessionId, output }) => {
    socket.to(sessionId).emit("execution_result", { output });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const __dirname = path.resolve();

app.set("io", io);

// webhooks must be parsed as raw body

app.use("/api/webhooks", webhookRoutes);

// middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Turn off CSP if it interferes with Clerk/Stream, but usually good to keep on and configure
}));
app.use(express.json());

// rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 1000, // Accommodate legitimate real-time polling (e.g. useSessionById 5s polling, active 10s polling)
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." }
});
app.use("/api", limiter);

// credentials: true meaning?? => server allows a browser to include cookies on request
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(clerkMiddleware()); // this add auth field to requesr object: req.auth()


app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/execute", executeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/problems", protectRoute, problemRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ message: "api is up and running" });
});

// make our app ready for deployment
if (ENV.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(distPath));

  app.get(/(.*)/, (req, res) => {
    // If the request is for a file (has an extension) but reached here, it means the file wasn't found in static
    // We should NOT send index.html for missed assets as it causes MIME type errors
    if (req.path.includes(".") && !req.path.endsWith(".html")) {
      return res.status(404).end();
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Catch-all error handler (Must be last)
app.use(errorMiddleware);

const startServer = async () => {

  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
      
      // Production Email Diagnostics
      if (ENV.GMAIL_USER && ENV.GMAIL_APP_PASSWORD) {
        console.log(`✅ Production Email System: READY (User: ${ENV.GMAIL_USER})`);
      } else {
        console.warn('⚠️ Production Email System: CREDENTIALS MISSING! Check Render Environment Variables.');
      }
    });
  } catch (error) {
    console.error("❌ CRITICAL: Error starting the server:", error);
    process.exit(1);
  }
};


startServer();
