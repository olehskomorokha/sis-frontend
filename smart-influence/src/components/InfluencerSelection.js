import { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import '../App.css';

function InfluencerSelection() {
  const [analysisMessage, setAnalysisMessage] = useState('');

  const showUnavailableMessage = () => {
    setAnalysisMessage('Ця функціональність ще не працює. Вона буде доступна у наступній версії.');
  };

  return (
    <div className="page">
      <Header />

      <main className="main-content selection-content">
        <section className="card">
          <p className="eyebrow">Підбір інфлуенсерів</p>
          <h2>Пошук потенційних інфлуенсерів</h2>
          <p>
            Введіть нішу, бренд або ключову тему, а потім уточніть параметри аудиторії,
            щоб система могла сформувати релевантний список кандидатів.
          </p>

          <label className="full-width">
            <span className="label-with-tooltip">
              Опис продукту
              <span className="tooltip-wrapper">
                <button
                  className="info-tooltip-button"
                  type="button"
                  aria-label="Що писати в описі продукту"
                >
                  i
                </button>
                <span className="tooltip-content" role="tooltip">
                  Опишіть продукт або послугу, для якої потрібно підібрати інфлуенсерів:
                  нішу, цільову аудиторію, особливості бренду та тему рекламної кампанії.
                </span>
              </span>
            </span>
            <input
              type="text"
              placeholder="Наприклад: натуральна косметика для молодої аудиторії в Європі"
            />
          </label>

          <div className="filters">
            <h3>Налаштування та фільтри</h3>
            <label>
              Платформа
              <select defaultValue="facebook">
                <option value="facebook">Facebook</option>
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
              <span className="label-with-tooltip">
                Мін. engagement rate (%)
                <span className="tooltip-wrapper">
                  <button
                    className="info-tooltip-button"
                    type="button"
                    aria-label="Що таке engagement rate"
                  >
                    i
                  </button>
                  <span className="tooltip-content" role="tooltip">
                    Engagement rate показує, яка частка аудиторії взаємодіє з контентом:
                    ставить вподобання, коментує або поширює дописи. Вищий показник
                    означає активнішу аудиторію.
                  </span>
                </span>
              </span>
              <input type="number" step="0.1" placeholder="2.5" />
            </label>
            <button className="primary-button" type="button" onClick={showUnavailableMessage}>
              Запустити аналіз
            </button>
            {analysisMessage && <p className="form-message">{analysisMessage}</p>}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default InfluencerSelection;
