const Setup2FAModal = ({ qrCode, manualKey, onNext, onClose }) => {
  return (
    <div className="modal">
      <h3>Set up Two-Factor Authentication</h3>

      <img src={qrCode} alt="2FA QR" />

      <p>Manual key: {manualKey}</p>

      <button onClick={onNext}>Continue</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default Setup2FAModal;
