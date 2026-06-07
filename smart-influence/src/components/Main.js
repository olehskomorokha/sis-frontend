import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import '../App.css';

function Main() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <Header />

      <main className="main-content home-content">
        <section className="product-hero">
          <div className="hero-copy">
            <p className="eyebrow">Smart Influence</p>
            <h2>Система для пошуку релевантних інфлюенсерів</h2>
            <p>
              Smart Influence допомагає брендам швидше знаходити авторів для рекламних кампаній,
              порівнювати їх за ключовими показниками та формувати короткий список кандидатів
              для співпраці.
            </p>
            <button
              className="primary-button hero-action"
              type="button"
              onClick={() => navigate('/influencer-selection')}
            >
              Перейти до підбору інфлюенсерів
            </button>
          </div>

          <div className="hero-visual" aria-label="Приклад аналітичної панелі Smart Influence">
            <div className="visual-topline">
              <span />
              <span />
              <span />
            </div>
            <div className="visual-profile">
              <div className="visual-avatar">SI</div>
              <div>
                <strong>Бʼюті-автор</strong>
                <p>Україна · Facebook</p>
              </div>
            </div>
            <div className="visual-bars">
              <span className="bar-wide" />
              <span className="bar-medium" />
              <span className="bar-short" />
            </div>
            <div className="visual-score">
              <strong>87%</strong>
              <span>збіг</span>
            </div>
          </div>
        </section>

        <section className="info-grid" aria-label="Як працювати з продуктом">
          <article className="info-card">
            <span className="step-number">1</span>
            <h3>Опишіть потребу кампанії</h3>
            <p>
              Вкажіть нішу, країну, бажаний розмір аудиторії та середню кількість переглядів
              для майбутньої співпраці.
            </p>
          </article>
          <article className="info-card">
            <span className="step-number">2</span>
            <h3>Уточніть критерії пошуку</h3>
            <p>
              Додайте фільтри за географією, тегами та показниками профілю, щоб прибрати
              нерелевантних кандидатів.
            </p>
          </article>
          <article className="info-card">
            <span className="step-number">3</span>
            <h3>Порівняйте результати</h3>
            <p>
              Перегляньте список інфлюенсерів, їхню аудиторію, активність і потенційну
              відповідність вашому бренду.
            </p>
          </article>
          <article className="info-card">
            <span className="step-number">4</span>
            <h3>Оберіть партнера</h3>
            <p>
              Оберіть, з ким будете співпрацювати. Якщо не впевнені, AI допоможе з оглядом.
            </p>
          </article>
        </section>

        <section className="product-note">
          <h3>Як взаємодіяти із системою</h3>
          <p>
            Почніть із короткого опису кампанії, поступово звужуйте параметри пошуку та
            використовуйте профіль користувача для перегляду доступних інфлюенсерів.
            Кнопка нижче відкриває робочу сторінку підбору.
          </p>
          <button
            className="secondary-button"
            type="button"
            onClick={() => navigate('/influencer-selection')}
          >
            Відкрити сторінку підбору
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Main;
