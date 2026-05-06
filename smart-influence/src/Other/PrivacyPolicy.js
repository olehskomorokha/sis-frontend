import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="page" id="privacy-policy">
      <Header />

      <main className="main-content">
        <section className="card privacy-policy-card">
          <h2>Privacy Policy</h2>

          <p>
            This Privacy Policy describes how the application Smart Influence
            collects, uses, stores, and protects data obtained through Facebook
            API.
          </p>

          <p>
            Please note that Smart Influence is currently application version
            0.1, a demo and early-stage product created for testing,
            demonstration, and academic purposes. Some functionality, data
            processing flows, and security measures may be improved or changed
            before a final production release.
          </p>

          <h3>1. Data We Collect</h3>
          <p>
            Our application may collect and process publicly available Facebook
            data and data provided through authorized Facebook API permissions,
            including:
          </p>
          <ul>
            <li>page or profile name;</li>
            <li>public profile or page link;</li>
            <li>number of followers or page likes;</li>
            <li>public page information;</li>
            <li>public posts;</li>
            <li>reactions, comments, and shares count;</li>
            <li>content category or topic;</li>
            <li>engagement-related statistics.</li>
          </ul>
          <p>
            The application does not collect Facebook passwords or any sensitive
            personal data that is not required for the system functionality.
          </p>

          <h3>2. How We Use Data</h3>
          <p>The collected data is used only for the following purposes:</p>
          <ul>
            <li>analyzing influencer activity;</li>
            <li>calculating engagement rate;</li>
            <li>creating influencer ratings;</li>
            <li>recommending relevant influencers for advertising campaigns;</li>
            <li>comparing influencers by key indicators;</li>
            <li>displaying analytical statistics to the user.</li>
          </ul>

          <h3>3. Data Storage</h3>
          <p>
            Collected data may be stored in a local database for analytical and
            recommendation purposes. The data is stored only as long as necessary
            for the operation of the application or until a deletion request is
            received.
          </p>

          <h3>4. Data Sharing</h3>
          <p>
            We do not sell, rent, or transfer collected Facebook data to third
            parties. Data is used only within the application for analysis and
            recommendation functionality.
          </p>

          <h3>5. Data Security</h3>
          <p>
            We use reasonable technical and organizational measures to protect
            collected data from unauthorized access, loss, misuse, or disclosure.
            Access to the database is restricted to authorized users only.
          </p>

          <h3>6. User Data Deletion</h3>
          <p>Users may request deletion of their data at any time.</p>
          <p>To request data deletion, please contact us at:</p>
          <p>
            <strong>Email:</strong> oleg.skomoroha1@gmail.com
          </p>
          <p>
            Please include your name, Facebook profile/page link, and a request
            to delete your data.
          </p>
          <p>
            After receiving the request, we will delete or anonymize the related
            data from our database within 30 days, unless retention is required
            by law.
          </p>
          <p>
            If the application is connected to Facebook Login or Meta App Review
            requirements, users may also remove the application from their
            Facebook account settings:
          </p>
          <p>
            Facebook Settings -&gt; Apps and Websites -&gt; select the application
            -&gt; Remove.
          </p>

          <h3>7. Contact Information</h3>
          <p>
            If you have any questions about this Privacy Policy or data
            processing, please contact us:
          </p>
          <p>
            <strong>Developer:</strong> Smart Influence Team
            <br />
            <strong>Email:</strong> oleg.skomoroha1@gmail.com
            <br />
            <strong>Country:</strong> Ukraine
          </p>

          <h3>8. Changes to This Privacy Policy</h3>
          <p>
            We may update this Privacy Policy from time to time. Any changes
            will be published on this page.
          </p>
          <p>
            <strong>Last updated:</strong> May 6, 2026
          </p>

          <button className="primary-button" type="button" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </section>
      </main>

      <Footer showPrivacyButton={false} />
    </div>
  );
}

export default PrivacyPolicy;
