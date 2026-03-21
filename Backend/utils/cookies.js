export const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// since i am doing sameSite=none becoz frontend will be on vercel, backend on render i cannot do lax, strict islie mujhe refresh token ko csrf
// se bachane k liye, request kaha se aa rahi hai ie which origin ye validate krna pdega varna they can do csrf
// so see validate origin thang in utils
