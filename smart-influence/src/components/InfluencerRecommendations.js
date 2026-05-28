import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import '../App.css';
import {
  formatNumber,
  formatPercent,
  getClientIdFromToken,
  getChannelKey,
} from '../utils/influencers';

const API_ORIGIN = 'https://localhost:7237';
const CLIENT_INFLUENCERS_API_URL = `${API_ORIGIN}/ClientInfluencer`;

const getChannelImageUrl = (channel) => {
  const imageUrl =
    channel.avatarUrl ||
    channel.AvatarUrl ||
    channel.avatar ||
    channel.Avatar ||
    channel.imageUrl ||
    channel.ImageUrl ||
    channel.photoUrl ||
    channel.PhotoUrl ||
    channel.profileImage ||
    channel.ProfileImage ||
    channel.pictureUrl ||
    channel.PictureUrl ||
    channel.thumbnailUrl ||
    channel.ThumbnailUrl;

  if (typeof imageUrl !== 'string' || !imageUrl.trim()) {
    return '';
  }

  const normalizedUrl = imageUrl.trim();

  if (normalizedUrl.startsWith('data:') || normalizedUrl.startsWith('blob:')) {
    return normalizedUrl;
  }

  if (normalizedUrl.startsWith('//')) {
    return `https:${normalizedUrl}`;
  }

  if (/^https?:\/\//i.test(normalizedUrl)) {
    return normalizedUrl.replace(/^http:\/\//i, 'https://');
  }

  return new URL(normalizedUrl, API_ORIGIN).toString();
};

const getScoreValue = (influencer, fieldName) =>
  influencer[fieldName] ?? influencer.influencerScore?.[fieldName] ?? null;

const getBrandFitScore = (influencer) => {
  if (typeof influencer.score === 'number') {
    return influencer.score;
  }

  return influencer.brandFitScore ?? null;
};

const toNumberOrNull = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const getChannelIdFromUrl = (channelUrl) => {
  if (typeof channelUrl !== 'string' || !channelUrl.trim()) {
    return '';
  }

  const channelMatch = channelUrl.match(/\/channel\/([^/?#]+)/i);
  return channelMatch?.[1] || '';
};

const getAiReviewText = (channel) => channel.aiReview || '';

const getPostCount = (channel) => channel.postCount ?? channel.influencerScore?.postCount ?? null;

const formatEngagementValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return '-';
  }

  return numberValue > 1
    ? `${numberValue.toLocaleString('uk-UA', { maximumFractionDigits: 2 })}%`
    : formatPercent(numberValue);
};

const normalizeClientInfluencer = (influencer) => ({
  id: influencer.id,
  influencerId: influencer.influencerId,
  channelName: influencer.channelName,
  channelUrl: influencer.channelUrl,
  platform: influencer.platform,
  description: influencer.description,
  country: influencer.country,
  lenguage: influencer.lenguage,
  avatarUrl: influencer.avatarUrl,
  followersCount: influencer.followersCount,
  totalScore: influencer.totalScore,
  brandFitScore: influencer.brandFitScore,
  aiReview: influencer.aiReview || '',
  status: influencer.status,
  predictedEngagement: influencer.predictedEngagement,
  influencerScore: influencer.influencerScore,
  engagementRate: influencer.influencerScore?.engagementRate ?? null,
  postCount: influencer.influencerScore?.postCount ?? null,
  avgViews: influencer.influencerScore?.avgViews ?? null,
  avgLikes: influencer.influencerScore?.avgLikes ?? null,
  avgComments: influencer.influencerScore?.avgComments ?? null,
  calculatedAt: influencer.influencerScore?.calculatedAt ?? null,
});

const normalizeRecommendationInfluencer = (influencer) => ({
  id: influencer.channelId,
  influencerId: influencer.channelId,
  channelName: influencer.channelName,
  channelUrl: influencer.channelUrl,
  platform: 'YouTube',
  description: influencer.description,
  country: influencer.countryCode,
  lenguage: influencer.language,
  avatarUrl: influencer.avatarUrl,
  followersCount: influencer.followersCount,
  totalScore: influencer.score,
  brandFitScore: influencer.score,
  aiReview: influencer.aiReview || '',
  predictedEngagement: null,
  engagementRate: influencer.engagementRate,
  postCount: influencer.videoCount,
  postPerDay: influencer.postPerDay,
  avgViews: influencer.avgView,
  avgLikes: influencer.avgLike,
  avgComments: influencer.avgComment,
});

const parseClientInfluencersResponse = (responseText) => {
  if (!responseText.trim()) {
    return [];
  }

  const parsed = JSON.parse(responseText);
  const influencers = Array.isArray(parsed)
    ? parsed
    : parsed?.$values || parsed?.items || parsed?.data || parsed?.influencers || parsed?.Influencers || [];

  return Array.isArray(influencers) ? influencers.map(normalizeClientInfluencer) : [];
};

const createInfluencerPayload = (influencer) => ({
  platform: influencer.platform || influencer.Platform || 'YouTube',
  channelName: influencer.channelName || '',
  channelId:
    influencer.influencerId ||
    getChannelIdFromUrl(influencer.channelUrl) ||
    '',
  channelUrl: influencer.channelUrl || '',
  description: influencer.description || '',
  country: influencer.country || '',
  countryCode: influencer.country || '',
  language: influencer.lenguage || '',
  avatarUrl: getChannelImageUrl(influencer),
  aiReview: getAiReviewText(influencer),
  followersCount: influencer.followersCount ?? null,
  postCount: getPostCount(influencer),
  videoCount: getPostCount(influencer),
  avgView: getScoreValue(influencer, 'avgViews'),
  avgLike: getScoreValue(influencer, 'avgLikes'),
  avgComment: getScoreValue(influencer, 'avgComments'),
  engagementRate: getScoreValue(influencer, 'engagementRate'),
  score: toNumberOrNull(getBrandFitScore(influencer)),
});

function ChannelAvatar({ channel }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = getChannelImageUrl(channel);
  const fallbackLetter = (channel.channelName || channel.name || 'I').charAt(0).toUpperCase();

  if (imageUrl && !imageFailed) {
    return (
      <img
        src={imageUrl}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return <div className="selection-influencer-fallback">{fallbackLetter}</div>;
}

function InfluencerRecommendations() {
  const location = useLocation();
  const navigate = useNavigate();
  const channelsFromState = useMemo(
    () => (Array.isArray(location.state?.channels) ? location.state.channels : []),
    [location.state]
  );
  const initialChannels = useMemo(
    () => channelsFromState.map(normalizeRecommendationInfluencer),
    [channelsFromState]
  );
  const [channels, setChannels] = useState(initialChannels);
  const [selectedInfluencerKeys, setSelectedInfluencerKeys] = useState([]);
  const [aiReviewLoadingKeys, setAiReviewLoadingKeys] = useState([]);
  const [areClientInfluencersLoading, setAreClientInfluencersLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [activeChannel, setActiveChannel] = useState(null);

  useEffect(() => {
    if (channelsFromState.length > 0) {
      setChannels(channelsFromState.map(normalizeRecommendationInfluencer));
      return undefined;
    }

    const token = localStorage.getItem('token');
    const clientId = getClientIdFromToken(token);
    const controller = new AbortController();

    if (!clientId) {
      if (channelsFromState.length === 0) {
        setSaveMessage('Не вдалося визначити ID клієнта з токена. Увійдіть у профіль ще раз.');
      }
      return undefined;
    }

    const loadClientInfluencers = async () => {
      try {
        setAreClientInfluencersLoading(true);
        setSaveMessage('');

        const response = await fetch(`${CLIENT_INFLUENCERS_API_URL}/${encodeURIComponent(clientId)}`, {
          method: 'GET',
          headers: {
            accept: 'text/plain',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
        });
        const responseText = await response.text();

        if (!response.ok) {
          throw new Error(responseText || 'Не вдалося завантажити картки інфлюенсерів.');
        }

        setChannels(parseClientInfluencersResponse(responseText));
      } catch (err) {
        if (err.name !== 'AbortError') {
          setSaveMessage(err.message || 'Помилка завантаження карток інфлюенсерів.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setAreClientInfluencersLoading(false);
        }
      }
    };

    loadClientInfluencers();

    return () => controller.abort();
  }, [channelsFromState]);

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

  const saveSelectedInfluencers = async () => {
    const selectedKeySet = new Set(selectedInfluencerKeys);
    const selectedInfluencers = channels.filter((channel) => selectedKeySet.has(getChannelKey(channel)));

    if (selectedInfluencers.length === 0) {
      setSaveMessage('Оберіть хоча б одного інфлюенсера для збереження.');
      return;
    }

    const token = localStorage.getItem('token');
    const clientId = getClientIdFromToken(token);
    const API_ADD_URL = 'https://localhost:7237/api/Influencer/add-influencer';

    if (!clientId) {
      setSaveMessage('Не вдалося визначити ID клієнта з токена. Увійдіть у профіль ще раз.');
      return;
    }

    let serverSaved = 0;
    const failedMessages = [];

    for (const influencer of selectedInfluencers) {
      try {
        const payload = createInfluencerPayload(influencer);

        const response = await fetch(`${API_ADD_URL}/${encodeURIComponent(clientId)}`, {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const responseText = await response.text();

        if (response.ok) {
          serverSaved += 1;
        } else {
          failedMessages.push(`${payload.channelName || payload.channelId || 'Інфлюенсер'}: ${responseText || response.status}`);
        }
      } catch (err) {
        failedMessages.push(`${influencer.channelName || influencer.name || 'Інфлюенсер'}: ${err.message}`);
      }
    }

    if (failedMessages.length > 0) {
      setSaveMessage(`На сервері збережено: ${serverSaved}. Не збережено: ${failedMessages.join('; ')}`);
      return;
    }

    setSaveMessage(`На сервері збережено інфлюенсерів: ${serverSaved}.`);
  };

  const handleCardKeyDown = (event, channel) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setActiveChannel(channel);
    }
  };

  const getAiReviewKey = (channel) =>
    channel.influencerId ||
    getChannelIdFromUrl(channel.channelUrl) ||
    channel.id;

  const handleAiReview = async (channel) => {
    const aiReviewKey = getAiReviewKey(channel);

    if (!aiReviewKey) {
      setSaveMessage('Не вдалося визначити інфлюенсера для AI аналізу.');
      return;
    }

    const token = localStorage.getItem('token');
    setSaveMessage('');
    setAiReviewLoadingKeys((currentKeys) => [...currentKeys, aiReviewKey]);

    try {
      const response = await fetch(`${API_ORIGIN}/api/Ai/review/${encodeURIComponent(aiReviewKey)}`, {
        method: 'GET',
        headers: {
          accept: 'text/plain',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(responseText || 'Не вдалося отримати AI аналіз.');
      }

      const aiReview = responseText.trim();
      setChannels((currentChannels) =>
        currentChannels.map((currentChannel) =>
          getAiReviewKey(currentChannel) === aiReviewKey
            ? { ...currentChannel, aiReview }
            : currentChannel
        )
      );
      setActiveChannel((currentChannel) =>
        currentChannel && getAiReviewKey(currentChannel) === aiReviewKey
          ? { ...currentChannel, aiReview }
          : currentChannel
      );
      setSelectedInfluencerKeys((currentKeys) =>
        currentKeys.includes(aiReviewKey) ? currentKeys : [...currentKeys, aiReviewKey]
      );
      setSaveMessage('AI аналіз готовий. Щоб записати його в базу даних, натисніть "Зберегти зміни".');
    } catch (err) {
      setSaveMessage(err.message || 'Помилка AI аналізу.');
    } finally {
      setAiReviewLoadingKeys((currentKeys) => currentKeys.filter((currentKey) => currentKey !== aiReviewKey));
    }
  };

  const renderChannelHeader = (channel, titleId) => (
    <div className="selection-influencer-header">
      <ChannelAvatar channel={channel} />
      <div>
        <h3 id={titleId}>{channel.channelName || channel.name || 'Без назви'}</h3>
        <p>{channel.country || 'Країну не вказано'}</p>
      </div>
    </div>
  );

  const renderChannelStats = (channel) => (
    <div className="selection-influencer-stats">
      <div>
        <span>Перегляди</span>
        <strong>{formatNumber(channel.avgViews)}</strong>
      </div>
      <div>
        <span>Лайки</span>
        <strong>{formatNumber(channel.avgLikes)}</strong>
      </div>
      <div>
        <span>Коментарі</span>
        <strong>{formatNumber(channel.avgComments)}</strong>
      </div>
      <div>
        <span>Пости</span>
        <strong>{formatNumber(channel.postCount)}</strong>
      </div>
      <div>
        <span>Залучення</span>
        <strong>{formatEngagementValue(channel.engagementRate)}</strong>
      </div>
      <div>
        <span>Підписники</span>
        <strong>{formatNumber(channel.followersCount)}</strong>
      </div>
      <div>
        <span>Brand fit</span>
        <strong>{formatNumber(channel.brandFitScore)}</strong>
      </div>
      <div>
        <span>Загальний score</span>
        <strong>{formatNumber(channel.totalScore)}</strong>
      </div>
      <div>
        <span>Прогноз залучення</span>
        <strong>{formatEngagementValue(channel.predictedEngagement)}</strong>
      </div>
    </div>
  );

  const renderChannelDetails = (channel) => (
    <>
      {channel.description && (
        <p className="selection-influencer-description">{channel.description}</p>
      )}

      {getAiReviewText(channel) && (
        <div className="selection-influencer-ai-review">
          <span>AI аналіз</span>
          <p>{getAiReviewText(channel)}</p>
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

          {areClientInfluencersLoading ? (
            <div className="card">
              <p className="form-message">Завантаження карток інфлюенсерів...</p>
            </div>
          ) : channels.length === 0 ? (
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
                  const aiReviewKey = getAiReviewKey(channel);
                  const isAiReviewLoading = aiReviewLoadingKeys.includes(aiReviewKey);
                  const hasAiReview = Boolean(getAiReviewText(channel));

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

                      <div className="selection-influencer-actions">
                        <button
                          className="secondary-button"
                          type="button"
                          disabled={isAiReviewLoading}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleAiReview(channel);
                          }}
                        >
                          {isAiReviewLoading
                            ? 'Аналіз...'
                            : hasAiReview
                              ? 'Оновити AI аналіз'
                              : 'AI аналіз'}
                        </button>
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
                      </div>
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
              <button
                className="secondary-button"
                type="button"
                disabled={aiReviewLoadingKeys.includes(getAiReviewKey(activeChannel))}
                onClick={() => handleAiReview(activeChannel)}
              >
                {aiReviewLoadingKeys.includes(getAiReviewKey(activeChannel))
                  ? 'Аналіз...'
                  : getAiReviewText(activeChannel)
                    ? 'Оновити AI аналіз'
                    : 'AI аналіз'}
              </button>
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
