/**
 * Cryptographic utility for password hashing in prototype/demo authentication.
 * Uses standard Web Crypto API SHA-256.
 * Note: In a production environment, password verification must strictly occur on a secure backend
 * using salted algorithms such as bcrypt or argon2.
 */
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
