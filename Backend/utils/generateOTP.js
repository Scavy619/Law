import crypto from "crypto"


// crypto.randomInt(min, max) generates numbers in range -> min ≤ number < max
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};


