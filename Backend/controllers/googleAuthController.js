import axios from "axios";
import userModel from "../models/userModel.js";
import { verifyGoogleIdToken } from "../utils/googleVerify.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { hashToken } from "../utils/hash.js";
import { refreshCookieOptions } from "../utils/cookies.js";
import crypto from "crypto";

export const startGoogleAuth = async (req, res) => {
  try {
    // Generate random state for CSRF protection
    const state = crypto.randomBytes(32).toString("hex");

    // Store state in cookie
    res.cookie("oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 5 * 60 * 1000, // 5 minutes
    });

    // Build Google OAuth URL
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

    if (!state || state !== storedState) {
      return res.status(400).send("Invalid or expired OAuth state");
    }

    // Clear state cookie after validation
    res.clearCookie("oauth_state");

    // Exchange authorization code for tokens
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
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

    // Generate refresh token
    const refreshToken = generateRefreshToken({
      id: user._id,
    });

    // Store hashed refresh token in database
    user.refreshToken = hashToken(refreshToken);
    await user.save({ validateBeforeSave: false });

    // Set refresh token cookie
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    // Redirect to frontend OAuth handler (access token will be fetched via /refresh)
    return res.redirect(`${process.env.FRONTEND_URL}/oauth/callback`);
  } catch (error) {
    console.error("Google OAuth Error:", error);
    return res.status(500).send("Google authentication failed");
  }
};
