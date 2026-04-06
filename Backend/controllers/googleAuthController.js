import axios from "axios";
import userModel from "../models/userModel.js";
import { verifyGoogleIdToken } from "../utils/googleVerify.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { hashToken } from "../utils/hash.js";
import { refreshCookieOptions } from "../utils/cookies.js";
import crypto from "crypto";
import redis from "../config/redis.js";

export const startGoogleAuth = async (req, res) => {
  try {
    // Generate random state for CSRF protection
    const state = crypto.randomBytes(32).toString("hex");

    // Generate PKCE code verifier and challenge
    const codeVerifier = crypto.randomBytes(32).toString("base64url");
    const codeChallenge = crypto
      .createHash("sha256")
      .update(codeVerifier)
      .digest("base64url");

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 10 * 60 * 1000, // 10 minutes
    };

    // Store state and verifier in secure cookies
    res.cookie("oauth_state", state, cookieOptions);
    res.cookie("oauth_pkce_verifier", codeVerifier, cookieOptions);

    // Build Google OAuth URL with PKCE
    const authUrl =
      "https://accounts.google.com/o/oauth2/v2/auth?" +
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        response_type: "code",
        scope: "openid email profile",
        state: state,
        access_type: "offline",
        prompt: "consent",
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
      }).toString();

    // Redirect user to Google
    return res.redirect(authUrl);
  } catch (error) {
    console.error("Error starting Google OAuth:", error);
    return res.status(500).send("Failed to initiate Google authentication");
  }
};

export const googleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    // Check if authorization code is present
    if (!code) {
      return res.status(400).send("Authorization code missing");
    }

    // Validate state to prevent CSRF
    const storedState = req.cookies.oauth_state;
    const codeVerifier = req.cookies.oauth_pkce_verifier;

    if (!state || state !== storedState) {
      return res.status(400).send("Invalid or expired OAuth state");
    }

    if (!codeVerifier) {
      return res.status(400).send("PKCE verifier missing or expired");
    }

    // Clear OAuth security cookies
    const cookieClearOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };
    res.clearCookie("oauth_state", cookieClearOptions);
    res.clearCookie("oauth_pkce_verifier", cookieClearOptions);

    // Exchange authorization code for tokens using PKCE verifier
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
      code_verifier: codeVerifier,
    });

    const { id_token } = tokenRes.data;

    // Verify ID token using Google library
    const googleUser = await verifyGoogleIdToken(id_token);

    // Ensure email is verified by Google
    if (!googleUser.emailVerified) {
      return res.status(403).send("Google email not verified");
    }

    // Find user by email
    let user = await userModel.findOne({ email: googleUser.email });

    // If an account already exists with this email using local auth, block Google sign-in.
    // We do NOT silently merge accounts — the user must log in the way they registered.
    if (user && user.authProvider === "local") {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=local_account_exists`,
      );
    }

    // Create new user if not found
    if (!user) {
      user = await userModel.create({
        name: googleUser.name,
        email: googleUser.email,
        image: googleUser.picture,
        googleId: googleUser.googleId,
        authProvider: "google",
        emailVerified: true,
      });
    }

    // --- ONE-TIME CODE EXCHANGE FLOW ---
    // Why use a one-time code? To avoid sending sensitive tokens in URLs
    // or relying on third-party cookies which are often blocked (e.g., in Brave/Safari).

    // 1. Generate a secure, random one-time code
    const oneTimeCode = crypto.randomBytes(32).toString("hex");

    // 2. Store the code temporarily (short-lived, 60 seconds expiry)
    await redis.set(
      oneTimeCode,
      JSON.stringify({ userId: user._id.toString() }),
      "EX",
      60,
    );

    // 3. Redirect to frontend with the one-time code in the URL
    // The frontend will exchange this code for actual tokens via a POST request.
    return res.redirect(
      `${process.env.FRONTEND_URL}/oauth/callback?code=${oneTimeCode}`,
    );
  } catch (error) {
    console.error("Google OAuth Error:", error);
    return res.status(500).send("Google authentication failed");
  }
};

export const exchangeOneTimeCode = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "One-time code is required" });
    }

    // 1. Check if the code exists in our temporary store
    // Also enforce single-use by deleting it immediately upon read
    const storeDataRaw = await redis.get(code);
    if (storeDataRaw) {
      await redis.del(code);
    }

    if (!storeDataRaw) {
      return res
        .status(400)
        .json({ message: "Invalid or already used one-time code" });
    }

    const storeData = JSON.parse(storeDataRaw);

    // 4. Find the user associated with this code
    const user = await userModel.findById(storeData.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 5. Generate actual access and refresh tokens now that we are in a secure POST request
    const accessToken = generateAccessToken({
      id: user._id,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user._id,
    });

    // 6. Store hashed refresh token in the database
    user.refreshToken = hashToken(refreshToken);
    await user.save({ validateBeforeSave: false });

    // 7. Store refresh token in secure HttpOnly cookie
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    // 8. Return access token securely in the JSON response
    // The frontend can now store these tokens in memory or secure storage.
    return res.status(200).json({
      success: true,
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      },
    });
  } catch (error) {
    console.error("Error exchanging one-time code:", error);
    return res
      .status(500)
      .json({ message: "Failed to exchange one-time code" });
  }
};
