// import rateLimit from "express-rate-limit";

// export const loginRateLimit = rateLimit({
//   windowMs: 10 * 60 * 1000, // 10 דקות
//   max: 5, // עד 5 ניסיונות
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: {
//     message: "Too many login attempts. Please try again later.",
//   },
// });

import rateLimit from "express-rate-limit";

export const loginRateLimit = rateLimit({
  windowMs: 60 * 1000, // דקה אחת
  max: 20,            // עד 20 ניסיונות
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "יותר מדי ניסיונות התחברות. נסי שוב בעוד דקה.",
  },
});
