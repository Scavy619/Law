import { useState } from "react";

const Verify2FAModal = ({ onVerify, onClose }) => {
  const [code, setCode] = useState("");

  return (
    <div className="modal">
      <h3>Verify 2FA</h3>

      <input
        type="text"
        placeholder="Enter 6-digit code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <button onClick={() => onVerify(code)}>
        Verify & Enable
      </button>

      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default Verify2FAModal;
