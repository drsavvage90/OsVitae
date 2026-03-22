/** Dev-only logger — suppresses detailed errors in production builds. */
export const logger = {
  error: (...args) => { if (import.meta.env.DEV) console.error(...args); },
  warn: (...args) => { if (import.meta.env.DEV) console.warn(...args); },
};
