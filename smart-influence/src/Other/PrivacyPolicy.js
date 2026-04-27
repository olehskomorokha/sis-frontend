import Header from '../components/Header';
import Footer from '../components/Footer';

function PrivacyPolicy({ onBackToHome }) {
  return (
    <div className="page" id="privacy-policy">
      <Header />

      <main className="main-content">
        <section className="card">
          <h2>Privacy Policy</h2>
          <p>
            We collect only the data needed to provide influencer analytics,
            improve search quality, and keep your account secure.
          </p>
          <p>
            We store account data safely and never sell personal data to third
            parties. Analytics is used only to improve platform functionality.
          </p>
          <button className="primary-button" type="button" onClick={onBackToHome}>
            Back to Home
          </button>
        </section>
      </main>

      <Footer showPrivacyButton={false} />
    </div>
  );
}

export default PrivacyPolicy;
