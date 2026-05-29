import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../../components/Footer';
import Header from '../../../components/Header';
import { getClientIdFromToken } from '../../../utils/influencers';
import './ClientProfile.css';

const CLIENT_API_URL = 'https://localhost:7237/api/Client';
const CLIENT_INFLUENCERS_API_URL = 'https://localhost:7237/api/ClientInfluencer';
const CLIENT_INFLUENCER_API_URL = 'https://localhost:7237/api/ClientInfluencer';
const AI_REVIEW_API_URL = 'https://localhost:7237/api/Ai/review';

const parseJsonResponse = (responseText, fallbackValue) => {
    if (!responseText.trim()) {
        return fallbackValue;
    }

    return JSON.parse(responseText);
};

const getChannelIdFromUrl = (channelUrl) => {
    if (typeof channelUrl !== 'string' || !channelUrl.trim()) {
        return "";
    }

    const channelMatch = channelUrl.match(/\/channel\/([^/?#]+)/i);
    return channelMatch?.[1] || "";
};

const normalizeInfluencer = (influencer) => ({
    ...influencer,
    aiReview: influencer.aiReview ?? influencer.AiReview ?? ""
});

const ClientProfile = () => {
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [influencers, setInfluencers] = useState([]);
    const [formData, setFormData] = useState({
        brand: "",
        email: ""
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isInfluencersLoading, setIsInfluencersLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [aiReviewLoadingIds, setAiReviewLoadingIds] = useState([]);
    const [deletingInfluencerIds, setDeletingInfluencerIds] = useState([]);
    const [activeInfluencer, setActiveInfluencer] = useState(null);
    const [error, setError] = useState("");
    const [influencersError, setInfluencersError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const token = localStorage.getItem('token');
    const clientId = getClientIdFromToken(token);

    const getInfluencerMetric = (influencer, metricName) =>
        influencer.influencerScore?.[metricName] ??
        influencer.InfluencerScore?.[metricName] ??
        influencer.score?.[metricName] ??
        influencer.Score?.[metricName] ??
        influencer[metricName];

    const getInfluencerPostCount = (influencer) =>
        influencer.influencerScore?.postCount ??
        influencer.InfluencerScore?.postCount ??
        influencer.influencerScore?.PostCount ??
        influencer.InfluencerScore?.PostCount ??
        influencer.score?.postCount ??
        influencer.Score?.postCount ??
        influencer.score?.PostCount ??
        influencer.Score?.PostCount ??
        influencer.postCount ??
        influencer.PostCount ??
        influencer.postsCount ??
        influencer.PostsCount ??
        influencer.videoCount ??
        influencer.VideoCount;

    const getInfluencerName = (influencer) =>
        influencer.fullName ||
        influencer.userName ||
        influencer.channelName ||
        influencer.platform ||
        `Influencer #${influencer.id}`;

    const getInfluencerAvatarUrl = (influencer) => {
        const imageUrl =
            influencer.avatarUrl ||
            influencer.AvatarUrl ||
            influencer.avatar ||
            influencer.Avatar ||
            influencer.imageUrl ||
            influencer.ImageUrl ||
            "";

        if (typeof imageUrl !== 'string' || !imageUrl.trim()) {
            return "";
        }

        const normalizedUrl = imageUrl.trim();

        if (normalizedUrl.startsWith('//')) {
            return `https:${normalizedUrl}`;
        }

        if (/^https?:\/\//i.test(normalizedUrl)) {
            return normalizedUrl.replace(/^http:\/\//i, 'https://');
        }

        return normalizedUrl;
    };

    const getInfluencerChannelUrl = (influencer) =>
        influencer.channelUrl || influencer.ChannelUrl || "";

    const getAiReviewText = (influencer) =>
        typeof influencer.aiReview === 'string'
            ? influencer.aiReview.trim()
            : typeof influencer.AiReview === 'string'
                ? influencer.AiReview.trim()
                : "";

    const hasAiReview = (influencer) => Boolean(getAiReviewText(influencer));

    const getInfluencerUpdateId = (influencer) => {
        const influencerId =
            influencer.influenceId ??
            influencer.InfluenceId ??
            influencer.influencer?.id ??
            influencer.Influencer?.id ??
            influencer.influencer?.Id ??
            influencer.Influencer?.Id ??
            influencer.influencerDbId ??
            influencer.InfluencerDbId ??
            influencer.influencerNumericId ??
            influencer.InfluencerNumericId ??
            influencer.influencerTableId ??
            influencer.InfluencerTableId ??
            influencer.influencerId ??
            influencer.InfluencerId;

        if (Number.isInteger(influencerId)) {
            return influencerId;
        }

        if (typeof influencerId === 'string' && /^\d+$/.test(influencerId)) {
            return influencerId;
        }

        return "";
    };

    const getInfluencerChannelId = (influencer) =>
        influencer.channelId ||
        influencer.ChannelId ||
        (typeof influencer.influencerId === 'string' && !/^\d+$/.test(influencer.influencerId)
            ? influencer.influencerId
            : "") ||
        (typeof influencer.InfluencerId === 'string' && !/^\d+$/.test(influencer.InfluencerId)
            ? influencer.InfluencerId
            : "") ||
        getChannelIdFromUrl(getInfluencerChannelUrl(influencer));

    const handleInfluencerCardKeyDown = (event, influencer) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setActiveInfluencer(influencer);
        }
    };

    useEffect(() => {
        const loadInfluencers = async () => {
            setIsInfluencersLoading(true);
            setInfluencersError("");

            if (!clientId) {
                setInfluencersError("Не вдалося визначити ID клієнта з токена.");
                setIsInfluencersLoading(false);
                return;
            }

            try {
                const response = await fetch(`${CLIENT_INFLUENCERS_API_URL}/${encodeURIComponent(clientId)}`, {
                    method: 'GET',
                    headers: {
                        'accept': 'text/plain',
                        'Authorization': `Bearer ${token}`
                    }
                });

                const responseText = await response.text();

                if (response.ok) {
                    const influencersData = parseJsonResponse(responseText, []);
                    const influencersList = Array.isArray(influencersData)
                        ? influencersData
                        : influencersData?.$values || influencersData?.items || influencersData?.data || [];

                    setInfluencers(Array.isArray(influencersList) ? influencersList.map(normalizeInfluencer) : []);
                } else {
                    setInfluencersError(responseText || "Не вдалося завантажити інфлюенсерів");
                }
            } catch (error) {
                console.error('Error:', error);
                setInfluencersError(error.message || "Помилка завантаження інфлюенсерів");
            } finally {
                setIsInfluencersLoading(false);
            }
        };

        const loadClient = async () => {
            if (!token) {
                navigate('/login');
                return;
            }

            if (!clientId) {
                setError("Не вдалося визначити ID клієнта з токена.");
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${CLIENT_API_URL}/${encodeURIComponent(clientId)}`, {
                    method: 'GET',
                    headers: {
                        'accept': 'text/plain',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });

                const responseText = await response.text();

                if (response.ok) {
                    const clientData = parseJsonResponse(responseText, null);

                    if (!clientData || typeof clientData !== 'object') {
                        throw new Error("Сервер не повернув дані профілю.");
                    }

                    setClient(clientData);
                    setFormData({
                        brand: clientData.brand || "",
                        email: clientData.email || ""
                    });
                    await loadInfluencers();
                } else {
                    setError(responseText || "Не вдалося завантажити дані профілю");
                }
            } catch (error) {
                console.error('Error:', error);
                setError(error.message || "Помилка завантаження даних профілю");
            } finally {
                setIsLoading(false);
            }
        };

        loadClient();
    }, [clientId, navigate, token]);

    useEffect(() => {
        if (!activeInfluencer) {
            return undefined;
        }

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setActiveInfluencer(null);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.classList.add('modal-open');

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.classList.remove('modal-open');
        };
    }, [activeInfluencer]);

    const formatValue = (value) => {
        if (value === null || value === undefined || value === "") {
            return "Не вказано";
        }

        return value;
    };

    const formatNumber = (value) => {
        if (value === null || value === undefined || value === "") {
            return "Не вказано";
        }

        return Number(value).toLocaleString('uk-UA');
    };

    const formatDate = (date) => {
        if (!date || String(date).startsWith("0001-01-01")) {
            return "Не вказано";
        }

        return new Date(date).toLocaleDateString('uk-UA');
    };

    const renderInfluencerStats = (influencer) => (
        <div className="influencer-stats-section">
            <p className="influencer-stats-note">Статистика за останніх пів року</p>
            <div className="influencer-stats">
                <div>
                    <span>Підписники</span>
                    <strong>{formatNumber(influencer.followersCount)}</strong>
                </div>
                <div>
                    <span>Перегляди</span>
                    <strong>{formatNumber(getInfluencerMetric(influencer, 'avgViews'))}</strong>
                </div>
                <div>
                    <span>Лайки</span>
                    <strong>{formatNumber(getInfluencerMetric(influencer, 'avgLikes'))}</strong>
                </div>
                <div>
                    <span>Коментарі</span>
                    <strong>{formatNumber(getInfluencerMetric(influencer, 'avgComments'))}</strong>
                </div>
                <div>
                    <span>Прогнозовані залучення</span>
                    <strong>{formatNumber(getInfluencerMetric(influencer, 'predictedEngagement'))}</strong>
                </div>
                <div>
                    <span>Пости</span>
                    <strong>{formatNumber(getInfluencerPostCount(influencer))}</strong>
                </div>
            </div>
        </div>
    );

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((currentData) => ({
            ...currentData,
            [name]: value
        }));
    };

    const startEditing = () => {
        setSuccessMessage("");
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setFormData({
            brand: client.brand || "",
            email: client.email || ""
        });
        setSuccessMessage("");
        setIsEditing(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setClient(null);
        setInfluencers([]);
        navigate('/login');
    };

    const handleAiReview = async (influencer) => {
        const channelId = getInfluencerChannelId(influencer);
        const influencerUpdateId = getInfluencerUpdateId(influencer);

        if (!channelId) {
            setInfluencersError("Не вдалося визначити channelId інфлюенсера для AI аналізу.");
            return;
        }

        if (!influencerUpdateId) {
            setInfluencersError("Не вдалося визначити influencerId для збереження AI аналізу.");
            return;
        }

        setInfluencersError("");
        setAiReviewLoadingIds((currentIds) => [...currentIds, channelId]);

        try {
            const response = await fetch(`${AI_REVIEW_API_URL}/${encodeURIComponent(channelId)}`, {
                method: 'GET',
                headers: {
                    'accept': 'text/plain',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            const responseText = await response.text();

            if (!response.ok) {
                throw new Error(responseText || "Не вдалося отримати AI аналіз.");
            }

            const aiReview = responseText.trim();

            const updateUrl = `${CLIENT_INFLUENCER_API_URL}/update/${encodeURIComponent(influencerUpdateId)}`;
            const saveResponse = await fetch(updateUrl, {
                method: 'PUT',
                headers: {
                    'accept': '*/*',
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ aiReview })
            });

            if (!saveResponse.ok) {
                const saveErrorMessage = await saveResponse.text();
                throw new Error(
                    `AI аналіз отримано, але не вдалося зберегти його в картку. URL: ${updateUrl}. Відповідь сервера: ${saveErrorMessage || saveResponse.status}`
                );
            }

            setInfluencers((currentInfluencers) =>
                currentInfluencers.map((currentInfluencer) =>
                    getInfluencerUpdateId(currentInfluencer) === influencerUpdateId
                        ? { ...currentInfluencer, aiReview }
                        : currentInfluencer
                )
            );
            setActiveInfluencer((currentInfluencer) =>
                currentInfluencer && getInfluencerUpdateId(currentInfluencer) === influencerUpdateId
                    ? { ...currentInfluencer, aiReview }
                    : currentInfluencer
            );
        } catch (error) {
            console.error('Error:', error);
            setInfluencersError(error.message || "Помилка AI аналізу.");
        } finally {
            setAiReviewLoadingIds((currentIds) => currentIds.filter((currentId) => currentId !== channelId));
        }
    };

    const handleDeleteInfluencer = async (influencer) => {
        const influencerDeleteId = getInfluencerUpdateId(influencer);

        if (!influencerDeleteId) {
            setInfluencersError("Не вдалося визначити influencerId для видалення інфлюенсера.");
            return;
        }

        setInfluencersError("");
        setDeletingInfluencerIds((currentIds) => [...currentIds, influencerDeleteId]);

        try {
            const response = await fetch(`${CLIENT_INFLUENCER_API_URL}/delete/${encodeURIComponent(influencerDeleteId)}`, {
                method: 'DELETE',
                headers: {
                    'accept': '*/*',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(errorMessage || "Не вдалося видалити картку інфлюенсера.");
            }

            setInfluencers((currentInfluencers) =>
                currentInfluencers.filter((currentInfluencer) =>
                    getInfluencerUpdateId(currentInfluencer) !== influencerDeleteId
                )
            );
            setActiveInfluencer(null);
        } catch (error) {
            console.error('Error:', error);
            setInfluencersError(error.message || "Помилка видалення інфлюенсера.");
        } finally {
            setDeletingInfluencerIds((currentIds) =>
                currentIds.filter((currentId) => currentId !== influencerDeleteId)
            );
        }
    };

    const saveSettings = async (event) => {
        event.preventDefault();
        setIsSaving(true);
        setError("");
        setSuccessMessage("");

        const payload = {
            ...client,
            brand: formData.brand.trim(),
            email: formData.email.trim()
        };

        try {
            const response = await fetch('https://localhost:7237/api/Client', {
                method: 'PUT',
                headers: {
                    'accept': '*/*',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const updatedClient = response.headers.get('content-type')?.includes('application/json')
                    ? await response.json()
                    : payload;

                setClient(updatedClient);
                setFormData({
                    brand: updatedClient.brand || "",
                    email: updatedClient.email || ""
                });
                setIsEditing(false);
                setSuccessMessage("Налаштування успішно оновлено");
            } else {
                const errorMessage = await response.text();
                setError(errorMessage || "Не вдалося оновити налаштування");
            }
        } catch (error) {
            console.error('Error:', error);
            setError("Помилка оновлення налаштувань");
        } finally {
            setIsSaving(false);
        }
    };

    return(
        <div className="profile-shell">
            <Header />
            <main className="profile-page">
                <div className="profile-layout">
                    <section className="profile-panel profile-settings-panel">
                        <button className="back-button" type="button" onClick={() => navigate('/') }>
                            На головну
                        </button>

                        <div className="profile-header">
                            <div className="profile-avatar">
                                {(client?.brand || "U").charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1>{client?.brand || "Профіль"}</h1>
                                <p>{client?.email || "Інформація клієнта"}</p>
                            </div>
                        </div>

                        {isLoading && <div className="profile-message">Завантаження профілю...</div>}
                        {error && <div className="profile-message profile-error">{error}</div>}
                        {successMessage && <div className="profile-message profile-success">{successMessage}</div>}
                        {!isLoading && client && !isEditing &&
                            <>
                                <div className="profile-details">
                                    <div>
                                        <span>Бренд</span>
                                        <strong>{formatValue(client.brand)}</strong>
                                    </div>
                                    <div>
                                        <span>Електронна пошта</span>
                                        <strong>{formatValue(client.email)}</strong>
                                    </div>
                                    <div>
                                        <span>Створено</span>
                                        <strong>{formatDate(client.createdAt)}</strong>
                                    </div>
                                </div>
                                <div className="profile-bottom-actions">
                                    <button className="profile-button" type="button" onClick={startEditing}>
                                        Редагувати
                                    </button>
                                    <button className="profile-button profile-button-muted profile-logout-button" type="button" onClick={handleLogout}>
                                        Розлогінитись
                                    </button>
                                </div>
                            </>
                        }
                        {!isLoading && client && isEditing &&
                            <form className="profile-edit-form" onSubmit={saveSettings}>
                                <label>
                                    Бренд
                                    <input name="brand" type="text" value={formData.brand} onChange={handleInputChange} required />
                                </label>
                                <label>
                                    Електронна пошта
                                    <input name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                                </label>
                                <div className="profile-actions profile-full-field">
                                    <button className="profile-button" type="submit" disabled={isSaving}>
                                        {isSaving ? "Збереження..." : "Зберегти"}
                                    </button>
                                    <button className="profile-button profile-button-secondary" type="button" onClick={cancelEditing} disabled={isSaving}>
                                        Скасувати
                                    </button>
                                </div>
                            </form>
                        }
                    </section>
                    {!isLoading && client &&
                        <section className="profile-panel profile-influencers-panel">
                            <div className="profile-section-header">
                                <div>
                                    <span>Звʼязки</span>
                                    <h2>Доступні інфлюенсери</h2>
                                </div>
                                <strong>{influencers.length}</strong>
                            </div>

                            {isInfluencersLoading && <div className="profile-message">Завантаження інфлюенсерів...</div>}
                            {influencersError && <div className="profile-message profile-error">{influencersError}</div>}
                            {!isInfluencersLoading && !influencersError && influencers.length === 0 &&
                                <div className="profile-empty-state">Інфлюенсерів поки немає.</div>
                            }
                            {!isInfluencersLoading && influencers.length > 0 &&
                                <div className="influencer-grid">
                                    {influencers.map((influencer) => (
                                        <article
                                            className="influencer-card"
                                            key={influencer.id || influencer.userName}
                                            role="button"
                                            tabIndex="0"
                                            onClick={() => setActiveInfluencer(influencer)}
                                            onKeyDown={(event) => handleInfluencerCardKeyDown(event, influencer)}
                                        >
                                            <div className="influencer-card-header">
                                                <div className="influencer-avatar">
                                                    {getInfluencerAvatarUrl(influencer) ? (
                                                        <img
                                                            src={getInfluencerAvatarUrl(influencer)}
                                                            alt={getInfluencerName(influencer)}
                                                            referrerPolicy="no-referrer"
                                                            onError={(event) => {
                                                                event.currentTarget.parentElement.textContent =
                                                                    (getInfluencerName(influencer) || "I").charAt(0).toUpperCase();
                                                            }}
                                                        />
                                                    ) : (
                                                        (getInfluencerName(influencer) || "I").charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    {getInfluencerChannelUrl(influencer) ? (
                                                        <a
                                                            className="influencer-card-link"
                                                            href={getInfluencerChannelUrl(influencer)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            onClick={(event) => event.stopPropagation()}
                                                        >
                                                            <h3>{formatValue(getInfluencerName(influencer))}</h3>
                                                        </a>
                                                    ) : (
                                                        <h3>{formatValue(getInfluencerName(influencer))}</h3>
                                                    )}
                                                    <p>{formatValue(influencer.platform)}</p>
                                                </div>
                                            </div>
                                            <div className="influencer-meta">
                                                <span>{formatValue(influencer.platform)}</span>
                                                <span>{formatValue(influencer.country)}</span>
                                            </div>
                                                {(influencer.bio || influencer.description) &&
                                                    <p className="influencer-bio">{influencer.bio || influencer.description}</p>
                                                }
                                                {hasAiReview(influencer) && (
                                                    <div className="influencer-ai-review">
                                                        <strong>AI аналіз</strong>
                                                    <p>{getAiReviewText(influencer)}</p>
                                                </div>
                                            )}
                                            {renderInfluencerStats(influencer)}
                                            {!hasAiReview(influencer) && (
                                                <div className="influencer-card-actions">
                                                    <button
                                                        className="profile-button profile-button-secondary"
                                                        type="button"
                                                        disabled={aiReviewLoadingIds.includes(getInfluencerChannelId(influencer))}
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleAiReview(influencer);
                                                        }}
                                                    >
                                                        {aiReviewLoadingIds.includes(getInfluencerChannelId(influencer)) ? "Аналіз..." : "AI аналіз"}
                                                    </button>
                                                </div>
                                            )}
                                        </article>
                                    ))}
                                </div>
                            }
                        </section>
                    }
                </div>
            </main>
            {activeInfluencer && (
                <div
                    className="profile-influencer-modal-overlay"
                    role="presentation"
                    onClick={() => setActiveInfluencer(null)}
                >
                    <article
                        className="profile-influencer-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="profile-influencer-modal-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            className="profile-influencer-modal-close"
                            type="button"
                            aria-label="Закрити"
                            onClick={() => setActiveInfluencer(null)}
                        >
                            x
                        </button>

                        <div className="influencer-card-header">
                            <div className="influencer-avatar">
                                {getInfluencerAvatarUrl(activeInfluencer) ? (
                                    <img
                                        src={getInfluencerAvatarUrl(activeInfluencer)}
                                        alt={getInfluencerName(activeInfluencer)}
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    (getInfluencerName(activeInfluencer) || "I").charAt(0).toUpperCase()
                                )}
                            </div>
                            <div>
                                <h3 id="profile-influencer-modal-title">{formatValue(getInfluencerName(activeInfluencer))}</h3>
                                <p>{formatValue(activeInfluencer.platform)}</p>
                            </div>
                        </div>

                        <div className="influencer-meta">
                            <span>{formatValue(activeInfluencer.platform)}</span>
                            <span>{formatValue(activeInfluencer.country)}</span>
                        </div>

                        {(activeInfluencer.bio || activeInfluencer.description) && (
                            <p className="influencer-bio influencer-bio-full">
                                {activeInfluencer.bio || activeInfluencer.description}
                            </p>
                        )}

                        {hasAiReview(activeInfluencer) && (
                            <div className="influencer-ai-review influencer-ai-review-full">
                                <strong>AI аналіз</strong>
                                <p>{getAiReviewText(activeInfluencer)}</p>
                            </div>
                        )}

                        {renderInfluencerStats(activeInfluencer)}

                        <div className="influencer-card-actions">
                            {getInfluencerChannelUrl(activeInfluencer) && (
                                <a
                                    className="profile-button profile-button-secondary"
                                    href={getInfluencerChannelUrl(activeInfluencer)}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Відкрити канал
                                </a>
                            )}
                            {!hasAiReview(activeInfluencer) && (
                                <button
                                    className="profile-button"
                                    type="button"
                                    disabled={aiReviewLoadingIds.includes(getInfluencerChannelId(activeInfluencer))}
                                    onClick={() => handleAiReview(activeInfluencer)}
                                >
                                    {aiReviewLoadingIds.includes(getInfluencerChannelId(activeInfluencer)) ? "Аналіз..." : "AI аналіз"}
                                </button>
                            )}
                            <button
                                className="profile-button profile-button-muted-danger profile-modal-delete-button"
                                type="button"
                                disabled={deletingInfluencerIds.includes(getInfluencerUpdateId(activeInfluencer))}
                                onClick={() => handleDeleteInfluencer(activeInfluencer)}
                            >
                                {deletingInfluencerIds.includes(getInfluencerUpdateId(activeInfluencer)) ? "Видалення..." : "Видалити"}
                            </button>
                        </div>
                    </article>
                </div>
            )}
            <Footer />
        </div>
    )
};

export default ClientProfile;
