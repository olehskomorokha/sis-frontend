import { useNavigate } from 'react-router-dom';

function Footer({
  onPrivacyClick,
  onDataDeletionClick,
  showPrivacyButton = true,
  showDataDeletionButton = true,
}) {
  const navigate = useNavigate();
  const openPrivacyPolicy = onPrivacyClick || (() => navigate('/privacy-policy'));
  const openDataDeletion = onDataDeletionClick || (() => navigate('/data-deletion'));

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
      {showDataDeletionButton && (
        <button
          className="footer-link-button"
          type="button"
          onClick={openDataDeletion}
        >
          Data Deletion
        </button>
      )}
    </footer>
  );
}

export default Footer;
