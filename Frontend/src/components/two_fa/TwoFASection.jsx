const TwoFASection = ({ user, onEnableClick, onDisableClick }) => {
  return (
    <div className="profile-section">
      <h3>Two-Factor Authentication</h3>

      <p>
        Status:{" "}
        <strong>
          {user.twoFactorEnabled ? "Enabled" : "Disabled"}
        </strong>
      </p>

      {!user.twoFactorEnabled ? (
        <button onClick={onEnableClick}>
          Enable 2FA
        </button>
      ) : (
        <button onClick={onDisableClick}>
          Disable 2FA
        </button>
      )}
    </div>
  );
};

export default TwoFASection;
