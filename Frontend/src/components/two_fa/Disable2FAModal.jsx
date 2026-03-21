import { useState } from "react";

const Disable2FAModal = ({ onDisable, onClose, isGoogleUser = false }) => {
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleDisable = async () => {
    if ((!isGoogleUser && !password) || code.length !== 6) {
      return;
    }
    setLoading(true);
    try {
      await onDisable(
        isGoogleUser
          ? { twoFactorCode: code }
          : { password, twoFactorCode: code },
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && password && code.length === 6) {
      handleDisable();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 p-6 rounded-t-2xl">
          <h3 className="text-2xl font-bold text-white">
            Disable Two-Factor Authentication
          </h3>
          <p className="text-white/90 text-sm mt-2">
            {isGoogleUser
              ? "Confirm with your authenticator app code"
              : "Remove the extra security layer from your account"}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm font-semibold text-red-800">
                  Warning: This will reduce your account security
                </p>
                <p className="text-sm text-red-700 mt-1">
                  Disabling 2FA makes your account more vulnerable to
                  unauthorized access.
                </p>
              </div>
            </div>
          </div>

          {/* Password Input */}
          {!isGoogleUser && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Confirm Your Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 2FA Code Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Current 2FA Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="000000"
              value={code}
              onChange={handleCodeChange}
              onKeyPress={handleKeyPress}
              maxLength={6}
              className="w-full text-center text-2xl font-mono tracking-widest border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all"
            />
            <p className="text-xs text-gray-500 text-center">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleDisable}
            disabled={
              (!isGoogleUser && !password) || code.length !== 6 || loading
            }
            className="flex-1 px-6 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow-lg shadow-red-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Disabling...
              </span>
            ) : (
              "Disable 2FA"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Disable2FAModal;
