const encoder = new TextEncoder();
const decoder = new TextDecoder();

function getEncryptionKey(envVar = "CALDAV_ENCRYPTION_KEY"): string {
  const key = Deno.env.get(envVar);
  if (!key) throw new Error(`${envVar} not set`);
  if (key.length < 32) throw new Error(`${envVar} must be at least 32 characters`);
  return key;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 600000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encrypt(plaintext: string, keyEnvVar = "CALDAV_ENCRYPTION_KEY"): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(getEncryptionKey(keyEnvVar), salt);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(plaintext)
  );

  const combined = new Uint8Array(salt.length + iv.length + new Uint8Array(ciphertext).length);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

  return btoa(String.fromCharCode(...combined));
}

export async function decrypt(encrypted: string, keyEnvVar = "CALDAV_ENCRYPTION_KEY"): Promise<string> {
  const combined = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));

  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const ciphertext = combined.slice(28);

  const key = await deriveKey(getEncryptionKey(keyEnvVar), salt);

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );

  return decoder.decode(plaintext);
}

/** Encrypt multiple fields using the same derived key for performance. */
export async function encryptFields(
  fields: Record<string, string | null>,
  keyEnvVar = "PII_ENCRYPTION_KEY"
): Promise<Record<string, string | null>> {
  const result: Record<string, string | null> = {};
  const password = getEncryptionKey(keyEnvVar);
  for (const [name, value] of Object.entries(fields)) {
    if (!value) { result[name] = null; continue; }
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv }, key, encoder.encode(value)
    );
    const combined = new Uint8Array(salt.length + iv.length + new Uint8Array(ciphertext).length);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(ciphertext), salt.length + iv.length);
    result[name] = btoa(String.fromCharCode(...combined));
  }
  return result;
}

/** Decrypt multiple fields. Falls back to plaintext if decryption fails (migration support). */
export async function decryptFields(
  fields: Record<string, string | null>,
  keyEnvVar = "PII_ENCRYPTION_KEY"
): Promise<Record<string, string | null>> {
  const result: Record<string, string | null> = {};
  const password = getEncryptionKey(keyEnvVar);
  for (const [name, value] of Object.entries(fields)) {
    if (!value) { result[name] = null; continue; }
    try {
      const combined = Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
      const salt = combined.slice(0, 16);
      const iv = combined.slice(16, 28);
      const ciphertext = combined.slice(28);
      const key = await deriveKey(password, salt);
      const plaintext = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv }, key, ciphertext
      );
      result[name] = decoder.decode(plaintext);
    } catch {
      console.warn(`[crypto] Failed to decrypt field "${name}" — value may be corrupt`);
      result[name] = null;
    }
  }
  return result;
}
