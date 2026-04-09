import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { CheckCircle2, XCircle } from "lucide-react";
import { verifyUserEmail, resendVerification } from "../api/user.api";
import Loader from "../components/common/Loader";

const Verify = () => {
  const { token } = useParams();

  const [status, setStatus] = useState("loading");
  // loading | success | error
  const [message, setMessage] = useState("");

  // resend email state
  const [resendStatus, setResendStatus] = useState("idle");
  // idle | sending | sent

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const { data } = await verifyUserEmail(token);

        setStatus("success");
        setMessage(data.message || "Email verified successfully");
      } catch (err) {
        setStatus("error");
        setMessage(
          err?.response?.data?.message ||
            "Verification link is invalid or expired",
        );
      }
    };

    if (token) verifyEmail();
  }, [token]);

  // RESEND VERIFICATION
  const handleResend = async () => {
    try {
      setResendStatus("sending");

      const { data } = await resendVerification(token);

      toast.success(data.message || "Verification email sent");
      setResendStatus("sent");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not resend email");
      setResendStatus("idle");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10 text-center relative overflow-hidden">
        {status === "loading" && <Loader minHeight="min-h-[200px]" />}

        {status === "success" && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 border-4 border-green-100">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              Email Verified!
            </h2>
            <p className="text-gray-500 mb-8 max-w-xs">{message}</p>

            <Link
              to="/login"
              className="w-full inline-block rounded-xl bg-primary px-8 py-3.5 text-white font-semibold hover:bg-primary/90 transition-all hover:shadow-lg active:scale-[0.98]"
            >
              Continue to Login
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 border-4 border-red-100">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              Verification Failed
            </h2>
            <p className="text-gray-500 mb-8 max-w-xs">{message}</p>

            <div className="w-full flex flex-col gap-3">
              <button
                onClick={handleResend}
                disabled={resendStatus !== "idle"}
                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-8 py-3.5 text-gray-700 font-semibold hover:bg-gray-100 hover:text-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendStatus === "sending"
                  ? "Sending email..."
                  : resendStatus === "sent"
                    ? "Email Sent Successfully"
                    : "Resend Verification Email"}
              </button>

              <Link
                to="/login"
                className="w-full inline-block rounded-xl bg-primary px-8 py-3.5 text-white font-semibold hover:bg-primary/90 transition-all hover:shadow-lg active:scale-[0.98]"
              >
                Go to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Verify;
