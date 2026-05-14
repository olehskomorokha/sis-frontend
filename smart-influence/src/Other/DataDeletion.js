import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

function DataDeletion() {
  const navigate = useNavigate();

  return (
    <div className="page" id="data-deletion">
      <Header />

      <main className="main-content">
        <section className="card privacy-policy-card">
          <h2>User Data Deletion</h2>

          <p>
            If you want to delete your data associated with our application,
            please follow these steps:
          </p>

          <ul>
            <li>
              Send a request to:{' '}
              <a href="mailto:oleg.skomoroha1@gmail.com">
                oleg.skomoroha1@gmail.com
              </a>
            </li>
            <li>Include your Facebook User ID or email used for login</li>
            <li>We will process your request within 3-5 business days</li>
          </ul>

          <p>
            Alternatively, you can remove our app from your Facebook account
            settings, which will revoke all permissions and stop data
            collection.
          </p>

          <p>
            For any questions, contact us at:{' '}
            <a href="mailto:oleg.skomoroha1@gmail.com">
              oleg.skomoroha1@gmail.com
            </a>
          </p>

          <button className="primary-button" type="button" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </section>
      </main>

      <Footer showDataDeletionButton={false} />
    </div>
  );
}

export default DataDeletion;
