/** Lightweight input validation helpers. */

const MAX_TITLE = 500;
const MAX_DESC = 5000;
const MAX_TEXT = 2000;
const MAX_NAME = 200;
const MAX_AMOUNT = 999_999_999;

export function sanitizeText(str, maxLen = MAX_TEXT) {
  if (typeof str !== "string") return "";
  return str.slice(0, maxLen).trim();
}

export function validateTitle(title) {
  const clean = sanitizeText(title, MAX_TITLE);
  if (!clean) return { valid: false, error: "Title is required." };
  return { valid: true, value: clean };
}

export function validateName(name) {
  const clean = sanitizeText(name, MAX_NAME);
  if (!clean) return { valid: false, error: "Name is required." };
  return { valid: true, value: clean };
}

export function validateDescription(desc) {
  return { valid: true, value: sanitizeText(desc, MAX_DESC) };
}

export function validateAmount(raw) {
  const n = parseFloat(raw);
  if (isNaN(n) || n <= 0) return { valid: false, error: "Amount must be a positive number." };
  if (n > MAX_AMOUNT) return { valid: false, error: "Amount is too large." };
  return { valid: true, value: Math.round(n * 100) / 100 };
}

export function validateEmail(email) {
  if (!email) return { valid: true, value: "" };
  const clean = sanitizeText(email, MAX_NAME);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return { valid: false, error: "Invalid email address." };
  return { valid: true, value: clean };
}

export function validatePhone(phone) {
  if (!phone) return { valid: true, value: "" };
  const clean = sanitizeText(phone, 30);
  if (!/^[+\d\s()./-]{0,30}$/.test(clean)) return { valid: false, error: "Invalid phone number." };
  return { valid: true, value: clean };
}

export { MAX_TITLE, MAX_DESC, MAX_TEXT, MAX_NAME };
