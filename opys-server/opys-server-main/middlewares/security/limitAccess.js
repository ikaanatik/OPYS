import rateLimit from "express-rate-limit";

export const limitAccess = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message,
  });
};
