import { useNavigate } from 'react-router-dom';

function Footer({ onPrivacyClick, showPrivacyButton = true }) {
  const navigate = useNavigate();
  const openPrivacyPolicy = onPrivacyClick || (() => navigate('/privacy-policy'));

  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} Smart Influence. All rights reserved.</p>
      {showPrivacyButton && (
        <button
          className="footer-link-button"
          type="button"
          onClick={openPrivacyPolicy}
        >
          Privacy Policy
        </button>
      )}
    </footer>
  );
}

export default Footer;
