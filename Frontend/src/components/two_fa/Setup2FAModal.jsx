import { useState } from "react";

const Setup2FAModal = ({ qrCode, manualKey, onNext, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(manualKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 p-6 rounded-t-2xl">
          <h3 className="text-2xl font-bold text-white">
            Set Up Two-Factor Authentication
          </h3>
          <p className="text-white/90 text-sm mt-2">
            Secure your account with an extra layer of protection
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                1
              </span>
              <h4 className="font-semibold text-gray-800">
                Download an Authenticator App
              </h4>
            </div>
            <p className="text-sm text-gray-600 ml-10">
              Install an app like{" "}
              <span className="font-medium text-primary">
                Google Authenticator
              </span>
              ,{" "}
              <span className="font-medium text-primary">
                Microsoft Authenticator
              </span>
              , or <span className="font-medium text-primary">Authy</span> on
              your phone.
            </p>
          </div>

          {/* Step 2 - QR Code */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                2
              </span>
              <h4 className="font-semibold text-gray-800">Scan QR Code</h4>
            </div>
            <div className="ml-10 bg-gray-50 rounded-xl p-6 flex justify-center border-2 border-gray-200">
              <img
                src={qrCode}
                alt="2FA QR Code"
                className="w-48 h-48 rounded-lg"
              />
            </div>
          </div>

          {/* Step 3 - Manual Key */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                3
              </span>
              <h4 className="font-semibold text-gray-800">
                Or Enter Key Manually
              </h4>
            </div>
            <div className="ml-10 space-y-2">
              <p className="text-sm text-gray-600">
                If you can't scan the QR code, enter this key manually:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-sm font-mono text-gray-800 break-all">
                  {manualKey}
                </code>
                <button
                  onClick={handleCopyKey}
                  className="px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors flex-shrink-0"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Info Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-blue-800">
                Save this key in a secure place. You'll need it if you lose
                access to your authenticator app.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onNext}
            className="flex-1 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default Setup2FAModal;
