function Footer({ onPrivacyClick, showPrivacyButton = true }) {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} Smart Influence. All rights reserved.</p>
      {showPrivacyButton && (
        <button
          className="footer-link-button"
          type="button"
          onClick={onPrivacyClick}
        >
          Privacy Policy
        </button>
      )}
    </footer>
  );
}

export default Footer;
