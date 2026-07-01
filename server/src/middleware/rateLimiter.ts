import rateLimit from 'express-rate-limit';

// Global rate limiter for all API routes (e.g., 100 requests per 15 minutes)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// Stricter rate limiter for authentication routes (e.g., 10 requests per 15 minutes)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10,
  message: {
    status: 429,
    message: 'Too many login/register attempts from this IP, please try again after 15 minutes',
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});
