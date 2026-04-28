import { useState } from 'react';
import PrivacyPolicy from '../Other/PrivacyPolicy';
import Header from './Header';
import Footer from './Footer';
import '../App.css';

function Main() {
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

    if (isPrivacyOpen) {
        return <PrivacyPolicy onBackToHome={() => setIsPrivacyOpen(false)} />;
    }
  return (
    <div className="page">
      <Header />

      <main className="main-content">
        <section className="card">
          <h2>Пошук потенційних інфлуенсерів</h2>
          <p>Введіть нішу, бренд або ключову тему для аналізу.</p>
          <label className="full-width">
            Запит користувача
            <input
              type="text"
              placeholder="Наприклад: eco skincare micro influencers in Europe"
            />
          </label>

          <div className="filters">
            <h3>Налаштування та фільтри</h3>
            <label>
              Платформа
              <select defaultValue="instagram">
                <option value="instagram">Facebook</option>
              </select>
            </label>
            <label>
              Країна
              <input type="text" placeholder="Україна / Poland / Germany" />
            </label>
            <label>
              Мінімум підписників
              <input type="number" placeholder="10000" />
            </label>
            <label>
              Максимум підписників
              <input type="number" placeholder="500000" />
            </label>
            <label>
              Мін. engagement rate (%)
              <input type="number" step="0.1" placeholder="2.5" />
            </label>
            <button className="primary-button" type="button">
              Запустити аналіз
            </button>
          </div>
        </section>

      </main>

      <Footer onPrivacyClick={() => setIsPrivacyOpen(true)} />
    </div>
  );
}
export default Main;