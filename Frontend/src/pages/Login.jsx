import React, { useState } from "react";
import useApp from "../context/useApp.jsx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  resendVerification,
  signupUser,
  loginUser,
  forgotPassword,
} from "../api/user.api.js";
import { setAccessToken } from "../context/auth.tokens.js";

const Login = () => {
  const [state, setState] = useState("Sign Up");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const [requires2FA, setRequires2FA] = useState(false);
  const [pendingLogin, setPendingLogin] = useState(null);

  const [showResend, setShowResend] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const navigate = useNavigate();
  const { setUserData } = useApp();

  // ===================== PASSWORD VALIDATION ==========================
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasLength = password.length >= 8;

  const passwordValid = hasUpper && hasLower && hasSpecial && hasLength;

  // ===================== SUBMIT HANDLER =====================
  const onSubmitHandler = async (event) => {
    event.preventDefault();

    setLoading(true);
    setShowResend(false);
    setShowForgot(false);

    // ---------- SIGN UP ----------
    if (state === "Sign Up") {
      if (!passwordValid) {
        toast.error("Password does not meet requirements");
        setLoading(false);
        return;
      }

      try {
        const { data } = await signupUser(name, email, password);

        if (data.success) {
          toast.success("Signup successful! Please verify your email.");
          navigate("/verify-email");
        }
      } catch (error) {
        const msg =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Registration failed";

        if (error.response?.status === 409) {
          toast.error("Account already exists. Please login.");
          setState("Login");
        } else {
          toast.error(msg);
        }
      } finally {
        setLoading(false);
      }

      return;
    }

    // ---------- LOGIN ----------
    try {
      // first login attempt (email + password)
      const payload = requires2FA
        ? {
            ...pendingLogin,
            twoFactorCode,
          }
        : { email, password };

      const { data } = await loginUser(payload);

      // 2FA required
      if (data.requires2FA) {
        setRequires2FA(true);
        setPendingLogin({ email, password });
        setLoading(false);
        return;
      }

      // login success
      if (data.success) {
        setAccessToken(data.accessToken);
        setUserData(data.user);
        toast.success("Login successful!");
        navigate("/");
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.message;

      if (status === 403 && msg?.toLowerCase().includes("verify")) {
        toast.error(msg);
        setShowResend(true);
      } else {
        toast.error(
          msg || "Login failed - " + (error.message || "Unknown error"),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // RESEND VERIFICATION
  // =====================
  const handleResendVerification = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      const { data } = await resendVerification(email);

      if (data.success) {
        toast.success("Verification email sent again!");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not resend verification email",
      );
    }
  };

  // =====================
  // FORGOT PASSWORD
  // =====================
  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email first");
      return;
    }

    setForgotLoading(true);

    try {
      const { data } = await forgotPassword(email);

      toast.success(data.message || "Password reset email sent!");
      setShowForgot(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not send reset email",
      );
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg">
        <p className="text-2xl font-semibold">
          {state === "Sign Up"
            ? "Create Account"
            : requires2FA
              ? "Two-Factor Authentication"
              : "Login"}
        </p>

        <p>
          {requires2FA
            ? "Enter the 6-digit code from your authenticator app"
            : `Please ${state === "Sign Up" ? "sign up" : "log in"} to book appointment`}
        </p>

        {/* SIGN UP NAME */}
        {state === "Sign Up" && !requires2FA && (
          <div className="w-full">
            <p>Full Name</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-[#DADADA] rounded w-full p-2 mt-1"
              type="text"
              required
            />
          </div>
        )}

        {/* EMAIL */}
        {!requires2FA && (
          <div className="w-full">
            <p>Email</p>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-[#DADADA] rounded w-full p-2 mt-1"
              type="email"
              required
            />
          </div>
        )}

        {/* PASSWORD */}
        {!requires2FA && (
          <div className="w-full">
            <p>Password</p>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-[#DADADA] rounded w-full p-2 mt-1"
              type="password"
              required
            />
          </div>
        )}

        {/* PASSWORD RULES */}
        {state === "Sign Up" && !requires2FA && (
          <ul className="mt-2 text-xs">
            <li className={hasLength ? "text-green-600" : "text-red-500"}>
              {hasLength ? "✔" : "✖"} At least 8 characters
            </li>
            <li className={hasUpper ? "text-green-600" : "text-red-500"}>
              {hasUpper ? "✔" : "✖"} One uppercase letter
            </li>
            <li className={hasLower ? "text-green-600" : "text-red-500"}>
              {hasLower ? "✔" : "✖"} One lowercase letter
            </li>
            <li className={hasSpecial ? "text-green-600" : "text-red-500"}>
              {hasSpecial ? "✔" : "✖"} One special character
            </li>
          </ul>
        )}

        {/* 2FA OTP INPUT */}
        {requires2FA && (
          <div className="w-full">
            <p>2FA Code</p>
            <input
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              className="border border-[#DADADA] rounded w-full p-2 mt-1"
              type="text"
              placeholder="Enter 6-digit code"
              required
            />
          </div>
        )}

        <button
          disabled={
            loading ||
            (state === "Sign Up" && !passwordValid) ||
            (requires2FA && !twoFactorCode)
          }
          className="bg-primary text-white w-full py-2 my-2 rounded-md text-base disabled:opacity-60"
        >
          {loading
            ? "Please wait..."
            : requires2FA
              ? "Verify & Login"
              : state === "Sign Up"
                ? "Create account"
                : "Login"}
        </button>

        {/* FORGOT PASSWORD */}
        {state === "Login" && !requires2FA && (
          <p
            onClick={() => setShowForgot(!showForgot)}
            className="text-sm text-primary underline cursor-pointer"
          >
            Forgot password?
          </p>
        )}

        {state === "Login" && showForgot && !requires2FA && (
          <div className="w-full text-sm">
            <p className="text-red-500">
              We'll send a password reset link to your email.
            </p>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={forgotLoading}
              className="mt-2 bg-primary text-white px-4 py-1 rounded-md disabled:opacity-60"
            >
              {forgotLoading ? "Sending..." : "Send reset email"}
            </button>
          </div>
        )}

        {/* RESEND VERIFICATION */}
        {state === "Login" && showResend && !requires2FA && (
          <p className="text-sm text-red-500">
            Email not verified.&nbsp;
            <span
              onClick={handleResendVerification}
              className="text-primary underline cursor-pointer"
            >
              Resend verification email
            </span>
          </p>
        )}

        {/* SWITCH MODE */}
        {!requires2FA && (
          <>
            {state === "Sign Up" ? (
              <p>
                Already have an account?{" "}
                <span
                  onClick={() => setState("Login")}
                  className="text-primary underline cursor-pointer"
                >
                  Login here
                </span>
              </p>
            ) : (
              <p>
                Create a new account?{" "}
                <span
                  onClick={() => setState("Sign Up")}
                  className="text-primary underline cursor-pointer"
                >
                  Click here
                </span>
              </p>
            )}
          </>
        )}
      </div>
    </form>
  );
};

export default Login;
