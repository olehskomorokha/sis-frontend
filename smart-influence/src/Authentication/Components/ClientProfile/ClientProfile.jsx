import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../../components/Footer';
import Header from '../../../components/Header';
import './ClientProfile.css';

const ClientProfile = () => {
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [influencers, setInfluencers] = useState([]);
    const [formData, setFormData] = useState({
        brand: "",
        email: "",
        budget: "",
        targetCountry: "",
        targetAudience: "",
        goals: ""
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isInfluencersLoading, setIsInfluencersLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [influencersError, setInfluencersError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const token = localStorage.getItem('token');

    useEffect(() => {
        const getClientInfluencers = (clientData) => {
            const possibleInfluencerLists = [
                clientData.influencers,
                clientData.interactedInfluencers,
                clientData.clientInfluencers
            ];

            const existingList = possibleInfluencerLists.find(Array.isArray);

            if (!existingList) {
                return [];
            }

            return existingList
                .map((item) => item.influencer || item)
                .filter(Boolean);
        };

        const loadInfluencers = async (clientData) => {
            setIsInfluencersLoading(true);
            setInfluencersError("");

            const clientInfluencers = getClientInfluencers(clientData);

            if (clientInfluencers.length > 0) {
                setInfluencers(clientInfluencers);
                setIsInfluencersLoading(false);
                return;
            }

            try {
                const response = await fetch('https://localhost:7237/api/Influencer', {
                    method: 'GET',
                    headers: {
                        'accept': 'text/plain',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const influencersData = await response.json();
                    setInfluencers(Array.isArray(influencersData) ? influencersData : []);
                } else {
                    setInfluencersError("Could not load influencers");
                }
            } catch (error) {
                console.error('Error:', error);
                setInfluencersError("Error loading influencers");
            } finally {
                setIsInfluencersLoading(false);
            }
        };

        const loadClient = async () => {
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch('https://localhost:7237/api/Client', {
                    method: 'GET',
                    headers: {
                        'accept': '*/*',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const clientData = await response.json();
                    setClient(clientData);
                    setFormData({
                        brand: clientData.brand || "",
                        email: clientData.email || "",
                        budget: clientData.budget ?? "",
                        targetCountry: clientData.targetCountry || "",
                        targetAudience: clientData.targetAudience || "",
                        goals: clientData.goals || ""
                    });
                    await loadInfluencers(clientData);
                } else {
                    setError("Could not load profile data");
                }
            } catch (error) {
                console.error('Error:', error);
                setError("Error loading profile data");
            } finally {
                setIsLoading(false);
            }
        };

        loadClient();
    }, [navigate, token]);

    const formatValue = (value) => {
        if (value === null || value === undefined || value === "") {
            return "Not specified";
        }

        return value;
    };

    const formatNumber = (value) => {
        if (value === null || value === undefined || value === "") {
            return "Not specified";
        }

        return Number(value).toLocaleString();
    };

    const formatDate = (date) => {
        if (!date || date.startsWith("0001-01-01")) {
            return "Not specified";
        }

        return new Date(date).toLocaleDateString();
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
            email: client.email || "",
            budget: client.budget ?? "",
            targetCountry: client.targetCountry || "",
            targetAudience: client.targetAudience || "",
            goals: client.goals || ""
        });
        setSuccessMessage("");
        setIsEditing(false);
    };

    const saveSettings = async (event) => {
        event.preventDefault();
        setIsSaving(true);
        setError("");
        setSuccessMessage("");

        const payload = {
            ...client,
            brand: formData.brand.trim(),
            email: formData.email.trim(),
            budget: formData.budget === "" ? null : Number(formData.budget),
            targetCountry: formData.targetCountry.trim(),
            targetAudience: formData.targetAudience.trim(),
            goals: formData.goals.trim()
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
                    email: updatedClient.email || "",
                    budget: updatedClient.budget ?? "",
                    targetCountry: updatedClient.targetCountry || "",
                    targetAudience: updatedClient.targetAudience || "",
                    goals: updatedClient.goals || ""
                });
                setIsEditing(false);
                setSuccessMessage("Settings updated successfully");
            } else {
                const errorMessage = await response.text();
                setError(errorMessage || "Could not update settings");
            }
        } catch (error) {
            console.error('Error:', error);
            setError("Error updating settings");
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
                        <button className="back-button" type="button" onClick={() => navigate('/')}>
                            Back to home
                        </button>

                        <div className="profile-header">
                            <div className="profile-avatar">
                                {(client?.brand || "U").charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1>{client?.brand || "Profile"}</h1>
                                <p>{client?.email || "Client information"}</p>
                            </div>
                        </div>

                        {isLoading && <div className="profile-message">Loading profile...</div>}
                        {error && <div className="profile-message profile-error">{error}</div>}
                        {successMessage && <div className="profile-message profile-success">{successMessage}</div>}
                        {!isLoading && client && !isEditing &&
                            <>
                                <div className="profile-actions">
                                    <button className="profile-button" type="button" onClick={startEditing}>
                                        Edit settings
                                    </button>
                                </div>
                                <div className="profile-details">
                                    <div>
                                        <span>Brand</span>
                                        <strong>{formatValue(client.brand)}</strong>
                                    </div>
                                    <div>
                                        <span>Email</span>
                                        <strong>{formatValue(client.email)}</strong>
                                    </div>
                                    <div>
                                        <span>Budget</span>
                                        <strong>{formatValue(client.budget)}</strong>
                                    </div>
                                    <div>
                                        <span>Target country</span>
                                        <strong>{formatValue(client.targetCountry)}</strong>
                                    </div>
                                    <div>
                                        <span>Target audience</span>
                                        <strong>{formatValue(client.targetAudience)}</strong>
                                    </div>
                                    <div>
                                        <span>Goals</span>
                                        <strong>{formatValue(client.goals)}</strong>
                                    </div>
                                    <div>
                                        <span>Created at</span>
                                        <strong>{formatDate(client.createdAt)}</strong>
                                    </div>
                                </div>
                            </>
                        }
                        {!isLoading && client && isEditing &&
                            <form className="profile-edit-form" onSubmit={saveSettings}>
                                <label>
                                    Brand
                                    <input name="brand" type="text" value={formData.brand} onChange={handleInputChange} required />
                                </label>
                                <label>
                                    Email
                                    <input name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                                </label>
                                <label>
                                    Budget
                                    <input name="budget" type="number" min="0" value={formData.budget} onChange={handleInputChange} />
                                </label>
                                <label>
                                    Target country
                                    <input name="targetCountry" type="text" value={formData.targetCountry} onChange={handleInputChange} />
                                </label>
                                <label>
                                    Target audience
                                    <input name="targetAudience" type="text" value={formData.targetAudience} onChange={handleInputChange} />
                                </label>
                                <label className="profile-full-field">
                                    Goals
                                    <textarea name="goals" value={formData.goals} onChange={handleInputChange} />
                                </label>
                                <div className="profile-actions profile-full-field">
                                    <button className="profile-button" type="submit" disabled={isSaving}>
                                        {isSaving ? "Saving..." : "Save"}
                                    </button>
                                    <button className="profile-button profile-button-secondary" type="button" onClick={cancelEditing} disabled={isSaving}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        }
                    </section>
                    {!isLoading && client &&
                        <section className="profile-panel profile-influencers-panel">
                            <div className="profile-section-header">
                                <div>
                                    <span>Connections</span>
                                    <h2>Available influencers</h2>
                                </div>
                                <strong>{influencers.length}</strong>
                            </div>

                            {isInfluencersLoading && <div className="profile-message">Loading influencers...</div>}
                            {influencersError && <div className="profile-message profile-error">{influencersError}</div>}
                            {!isInfluencersLoading && !influencersError && influencers.length === 0 &&
                                <div className="profile-empty-state">No influencers yet.</div>
                            }
                            {!isInfluencersLoading && influencers.length > 0 &&
                                <div className="influencer-grid">
                                    {influencers.map((influencer) => (
                                        <article className="influencer-card" key={influencer.id || influencer.userName}>
                                            <div className="influencer-card-header">
                                                <div className="influencer-avatar">
                                                    {(influencer.fullName || influencer.userName || "I").charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3>{formatValue(influencer.fullName || influencer.userName)}</h3>
                                                    <p>{influencer.userName ? `@${influencer.userName}` : formatValue(influencer.platform)}</p>
                                                </div>
                                            </div>
                                            <div className="influencer-meta">
                                                <span>{formatValue(influencer.platform)}</span>
                                                <span>{formatValue(influencer.country)}</span>
                                                <span>{formatValue(influencer.language || influencer.lenguage)}</span>
                                            </div>
                                            {influencer.bio &&
                                                <p className="influencer-bio">{influencer.bio}</p>
                                            }
                                            <div className="influencer-stats">
                                                <div>
                                                    <span>Followers</span>
                                                    <strong>{formatNumber(influencer.followersCount)}</strong>
                                                </div>
                                                <div>
                                                    <span>Avg views</span>
                                                    <strong>{formatNumber(influencer.avgViews)}</strong>
                                                </div>
                                                <div>
                                                    <span>Avg likes</span>
                                                    <strong>{formatNumber(influencer.avgLikes)}</strong>
                                                </div>
                                                <div>
                                                    <span>Comments</span>
                                                    <strong>{formatNumber(influencer.avgComments)}</strong>
                                                </div>
                                                <div>
                                                    <span>Posts</span>
                                                    <strong>{formatNumber(influencer.postsCount)}</strong>
                                                </div>
                                                <div>
                                                    <span>Following</span>
                                                    <strong>{formatNumber(influencer.followingCount)}</strong>
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
