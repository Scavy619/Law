import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const SECRET_KEY = process.env.ENCRYPTION_SECRET; // 32 bytes hex string

// encrypt karta hai plaintext ko
export const encrypt = (plaintext) => {
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const key = Buffer.from(SECRET_KEY, "hex");
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag().toString("hex");
  
  // format: iv:authTag:encryptedData
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
};

// decrypt karta hai encrypted string ko
export const decrypt = (encryptedString) => {
  const [ivHex, authTagHex, encrypted] = encryptedString.split(":");
  const key = Buffer.from(SECRET_KEY, "hex");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};