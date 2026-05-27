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
          <h2>Видалення даних користувача</h2>

          <p>
            Якщо ви хочете видалити дані, повʼязані з нашим застосунком,
            виконайте такі кроки:
          </p>

          <ul>
            <li>
              Надішліть запит на адресу:{' '}
              <a href="mailto:oleg.skomoroha1@gmail.com">
                oleg.skomoroha1@gmail.com
              </a>
            </li>
            <li>Додайте Facebook User ID або електронну пошту, використану для входу</li>
            <li>Ми опрацюємо ваш запит протягом 3-5 робочих днів</li>
          </ul>

          <p>
            Також ви можете видалити наш застосунок у налаштуваннях вашого
            Facebook-акаунта. Це відкличе всі дозволи та зупинить збір даних.
          </p>

          <p>
            З будь-яких питань звертайтеся на:{' '}
            <a href="mailto:oleg.skomoroha1@gmail.com">
              oleg.skomoroha1@gmail.com
            </a>
          </p>

          <button className="primary-button" type="button" onClick={() => navigate('/')}>
            На головну
          </button>
        </section>
      </main>

      <Footer showDataDeletionButton={false} />
    </div>
  );
}

export default DataDeletion;
