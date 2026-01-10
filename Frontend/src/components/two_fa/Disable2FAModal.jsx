import { useState } from "react";

const Disable2FAModal = ({ onDisable, onClose }) => {
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  return (
    <div className="modal">
      <h3>Disable Two-Factor Authentication</h3>

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="text"
        placeholder="2FA Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <button
        onClick={() => onDisable({ password, twoFactorCode: code })}
      >
        Disable 2FA
      </button>

      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default Disable2FAModal;
