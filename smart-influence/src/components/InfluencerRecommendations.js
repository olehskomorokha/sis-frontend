import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import '../App.css';
import {
  formatNumber,
  formatPercent,
  getChannelKey,
  readRecommendedInfluencers,
  readSavedInfluencers,
  SAVED_INFLUENCERS_STORAGE_KEY,
} from '../utils/influencers';

const getChannelImageUrl = (channel) => {
  const imageUrl = channel.AvatarUrl;

  return typeof imageUrl === 'string' ? imageUrl.replace(/^http:\/\//, 'https://') : '';
};

function ChannelAvatar({ channel }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = getChannelImageUrl(channel);
  const fallbackLetter = (channel.channelName || channel.name || 'I').charAt(0).toUpperCase();

  if (imageUrl && !imageFailed) {
    return <img src={imageUrl} alt="" onError={() => setImageFailed(true)} />;
  }

  return <div className="selection-influencer-fallback">{fallbackLetter}</div>;
}

function InfluencerRecommendations() {
  const location = useLocation();
  const navigate = useNavigate();
  const channelsFromState = Array.isArray(location.state?.channels) ? location.state.channels : [];
  const channels = channelsFromState.length > 0 ? channelsFromState : readRecommendedInfluencers();
  const savedInfluencers = useMemo(() => readSavedInfluencers(), []);
  const savedInfluencerKeys = useMemo(
    () => new Set(savedInfluencers.map(getChannelKey).filter(Boolean)),
    [savedInfluencers]
  );
  const [selectedInfluencerKeys, setSelectedInfluencerKeys] = useState(() =>
    channels
      .map(getChannelKey)
      .filter((channelKey) => channelKey && savedInfluencerKeys.has(channelKey))
  );
  const [saveMessage, setSaveMessage] = useState('');
  const [activeChannel, setActiveChannel] = useState(null);

  useEffect(() => {
    if (!activeChannel) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveChannel(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.classList.add('modal-open');

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('modal-open');
    };
  }, [activeChannel]);

  const toggleInfluencerSelection = (channel) => {
    const channelKey = getChannelKey(channel);

    if (!channelKey) {
      return;
    }

    setSaveMessage('');
    setSelectedInfluencerKeys((currentKeys) =>
      currentKeys.includes(channelKey)
        ? currentKeys.filter((currentKey) => currentKey !== channelKey)
        : [...currentKeys, channelKey]
    );
  };

  const saveSelectedInfluencers = () => {
    const selectedKeySet = new Set(selectedInfluencerKeys);
    const selectedInfluencers = channels.filter((channel) => selectedKeySet.has(getChannelKey(channel)));
    const savedKeySet = new Set(savedInfluencers.map(getChannelKey).filter(Boolean));
    const mergedInfluencers = [
      ...savedInfluencers,
      ...selectedInfluencers.filter((channel) => !savedKeySet.has(getChannelKey(channel))),
    ];

    localStorage.setItem(SAVED_INFLUENCERS_STORAGE_KEY, JSON.stringify(mergedInfluencers));
    setSaveMessage(`Збережено інфлюенсерів: ${selectedInfluencers.length}.`);
  };

  const handleCardKeyDown = (event, channel) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setActiveChannel(channel);
    }
  };

  const renderChannelHeader = (channel, titleId) => (
    <div className="selection-influencer-header">
      <ChannelAvatar channel={channel} />
      <div>
        <h3 id={titleId}>{channel.channelName || channel.name || 'Без назви'}</h3>
        <p>{channel.countryCode || channel.country || 'Країну не вказано'}</p>
      </div>
    </div>
  );

  const renderChannelStats = (channel) => (
    <div className="selection-influencer-stats">
      <div>
        <span>Перегляди</span>
        <strong>{formatNumber(channel.avgView)}</strong>
      </div>
      <div>
        <span>Лайки</span>
        <strong>{formatNumber(channel.avgLike)}</strong>
      </div>
      <div>
        <span>Коментарі</span>
        <strong>{formatNumber(channel.avgComment)}</strong>
      </div>
      <div>
        <span>Відео</span>
        <strong>{formatNumber(channel.videoCount)}</strong>
      </div>
      <div>
        <span>Постів/день</span>
        <strong>{formatNumber(channel.postPerDay)}</strong>
      </div>
      <div>
        <span>Engagement</span>
        <strong>{formatPercent(channel.engagementRate)}</strong>
      </div>
    </div>
  );

  const renderChannelDetails = (channel) => (
    <>
      {channel.description && (
        <p className="selection-influencer-description">{channel.description}</p>
      )}

      {channel.aiReview && (
        <div className="selection-influencer-ai-review">
          <span>AI аналіз</span>
          <p>{channel.aiReview}</p>
        </div>
      )}

      {renderChannelStats(channel)}
    </>
  );

  return (
    <div className="page">
      <Header />

      <main className="main-content recommendations-content">
        <section className="results-section">
          <div className="results-header">
            <div>
              <p className="eyebrow">Результати аналізу</p>
              <h2>Рекомендовані інфлюенсери</h2>
            </div>
            <button className="secondary-button" type="button" onClick={() => navigate('/influencer-selection')}>
              Назад до пошуку
            </button>
          </div>

          {channels.length === 0 ? (
            <div className="card">
              <p className="form-message">Немає результатів для показу. Запустіть аналіз ще раз.</p>
            </div>
          ) : (
            <>
              <div className="recommendations-toolbar">
                <span>{selectedInfluencerKeys.length} обрано</span>
                <button className="primary-button" type="button" onClick={saveSelectedInfluencers}>
                  Зберегти зміни
                </button>
              </div>

              {saveMessage && <p className="form-message">{saveMessage}</p>}

              <div className="selection-influencer-grid">
                {channels.map((channel) => {
                  const channelKey = getChannelKey(channel);
                  const selected = selectedInfluencerKeys.includes(channelKey);

                  return (
                    <article
                      className={`selection-influencer-card${selected ? ' selection-influencer-card-selected' : ''}`}
                      key={channelKey}
                      role="button"
                      tabIndex="0"
                      onClick={() => setActiveChannel(channel)}
                      onKeyDown={(event) => handleCardKeyDown(event, channel)}
                    >
                      {channel.channelUrl ? (
                        <a
                          className="selection-influencer-link"
                          href={channel.channelUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(event) => event.stopPropagation()}
                        >
                          {renderChannelHeader(channel)}
                        </a>
                      ) : (
                        renderChannelHeader(channel)
                      )}

                      {renderChannelDetails(channel)}

                      <button
                        className={selected ? 'secondary-button' : 'primary-button'}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleInfluencerSelection(channel);
                        }}
                      >
                        {selected ? 'Обрано' : 'Додати'}
                      </button>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </main>

      {activeChannel && (
        <div
          className="influencer-modal-overlay"
          role="presentation"
          onClick={() => setActiveChannel(null)}
        >
          <article
            className="influencer-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="influencer-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="influencer-modal-close"
              type="button"
              aria-label="Закрити"
              onClick={() => setActiveChannel(null)}
            >
              x
            </button>

            {renderChannelHeader(activeChannel, 'influencer-modal-title')}
            {renderChannelDetails(activeChannel)}

            <div className="selection-influencer-actions">
              {activeChannel.channelUrl && (
                <a
                  className="secondary-button"
                  href={activeChannel.channelUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Відкрити канал
                </a>
              )}
              <button
                className={
                  selectedInfluencerKeys.includes(getChannelKey(activeChannel))
                    ? 'secondary-button'
                    : 'primary-button'
                }
                type="button"
                onClick={() => toggleInfluencerSelection(activeChannel)}
              >
                {selectedInfluencerKeys.includes(getChannelKey(activeChannel)) ? 'Обрано' : 'Додати'}
              </button>
            </div>
          </article>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default InfluencerRecommendations;
