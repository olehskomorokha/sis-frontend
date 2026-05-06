import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../../components/Footer';
import Header from '../../../components/Header';
import './ClientProfile.css';

const ClientProfile = () => {
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
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
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const token = localStorage.getItem('token');

    useEffect(() => {
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
                <div className="profile-panel">
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
                </div>
            </main>
            <Footer />
        </div>
    )
};

export default ClientProfile;
