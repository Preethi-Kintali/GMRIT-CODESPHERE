import { ENV } from "../lib/env.js";

export const errorMiddleware = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.url}:`, err);

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    message,
    ...(ENV.NODE_ENV === "development" && { stack: err.stack }),
  });
};
