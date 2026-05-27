import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../../components/Footer';
import Header from '../../../components/Header';
import { getClientIdFromToken } from '../../../utils/influencers';
import './ClientProfile.css';

const CLIENT_API_URL = 'https://localhost:7237/api/Client';
const CLIENT_INFLUENCERS_API_URL = 'https://localhost:7237/api/Influencer/client';

const parseJsonResponse = (responseText, fallbackValue) => {
    if (!responseText.trim()) {
        return fallbackValue;
    }

    return JSON.parse(responseText);
};

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
    const [error, setError] = useState("");
    const [influencersError, setInfluencersError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const token = localStorage.getItem('token');
    const clientId = getClientIdFromToken(token);

    const getInfluencerMetric = (influencer, metricName) =>
        influencer[metricName] ?? influencer.score?.[metricName] ?? influencer.Score?.[metricName];

    const getInfluencerName = (influencer) =>
        influencer.fullName ||
        influencer.userName ||
        influencer.channelName ||
        influencer.platform ||
        `Influencer #${influencer.id}`;

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

                    setInfluencers(Array.isArray(influencersList) ? influencersList : []);
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
                                <div className="profile-actions">
                                    <button className="profile-button" type="button" onClick={startEditing}>
                                        Редагувати налаштування
                                    </button>
                                    <button className="profile-button profile-button-danger" type="button" onClick={handleLogout}>
                                        Розлогінитись
                                    </button>
                                </div>
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
                                        <span>Країна</span>
                                        <strong>{formatValue(client.targetCountry)}</strong>
                                    </div>
                                    <div>
                                        <span>Створено</span>
                                        <strong>{formatDate(client.createdAt)}</strong>
                                    </div>
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
                                        <article className="influencer-card" key={influencer.id || influencer.userName}>
                                            <div className="influencer-card-header">
                                                <div className="influencer-avatar">
                                                    {(getInfluencerName(influencer) || "I").charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3>{formatValue(getInfluencerName(influencer))}</h3>
                                                    <p>{influencer.userName ? `@${influencer.userName}` : formatValue(influencer.platform)}</p>
                                                </div>
                                            </div>
                                            <div className="influencer-meta">
                                                <span>{formatValue(influencer.platform)}</span>
                                                <span>{formatValue(influencer.country)}</span>
                                                <span>{formatValue(influencer.language || influencer.lenguage)}</span>
                                            </div>
                                                {(influencer.bio || influencer.description) &&
                                                    <p className="influencer-bio">{influencer.bio || influencer.description}</p>
                                                }
                                                {influencer.aiReview && (
                                                    <div className="influencer-ai-review">
                                                        <strong>AI аналіз</strong>
                                                        <p>{influencer.aiReview}</p>
                                                    </div>
                                                )}
                                            <div className="influencer-stats">
                                                <div>
                                                    <span>Підписники</span>
                                                    <strong>{formatNumber(influencer.followersCount)}</strong>
                                                </div>
                                                <div>
                                                    <span>Сер. перегляди</span>
                                                    <strong>{formatNumber(getInfluencerMetric(influencer, 'avgViews'))}</strong>
                                                </div>
                                                <div>
                                                    <span>Сер. лайки</span>
                                                    <strong>{formatNumber(getInfluencerMetric(influencer, 'avgLikes'))}</strong>
                                                </div>
                                                <div>
                                                    <span>Коментарі</span>
                                                    <strong>{formatNumber(getInfluencerMetric(influencer, 'avgComments'))}</strong>
                                                </div>
                                                <div>
                                                    <span>Пости</span>
                                                    <strong>{formatNumber(influencer.postsCount)}</strong>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            }
                        </section>
                    }
                </div>
            </main>
            <Footer />
        </div>
    )
};

export default ClientProfile;
