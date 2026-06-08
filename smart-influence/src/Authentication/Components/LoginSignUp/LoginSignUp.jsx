import './LoginSignUp.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import user_icon from '../Assets/person.png';
import email_icon from '../Assets/email.png';
import password_icon from '../Assets/password.png';
import { API_BASE_URL } from '../../../config/api';

const ACTION_LOGIN = 'login';
const ACTION_SIGN_UP = 'sign-up';

const getLoginErrorMessage = (responseText) => {
    if (!responseText.trim()) {
        return 'Неправильний пароль';
    }

    try {
        const parsedError = JSON.parse(responseText);

        if (parsedError?.code === 'invalid_credentials') {
            return 'Неправильний пароль';
        }
    } catch {
        return responseText;
    }

    return 'Неправильний пароль';
};

const LoginSingUp = () => {
    const navigate = useNavigate();
    const [action, setAction] = useState(ACTION_LOGIN);
    const [errors, setErrors] = useState({});
    const [authMessage, setAuthMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            navigate('/profile');
        }
    }, [navigate, token]);

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const getFieldValue = (id) => {
        return document.getElementById(id)?.value.trim() || "";
    };

    const validateForm = () => {
        const validationErrors = {};
        setAuthMessage('');
        const email = getFieldValue('emailInput');
        const password = getFieldValue('passwordInput');
        const confirmPassword = getFieldValue('confirmPasswordInput');

        if (action === ACTION_SIGN_UP) {
            const brand = getFieldValue('brandInput');

            if (!brand) {
                validationErrors.brand = "Вкажіть бренд";
            } else if (brand.length < 2) {
                validationErrors.brand = "Назва бренду має містити щонайменше 2 символи";
            }
        }

        if (!email) {
            validationErrors.email = "Вкажіть електронну пошту";
        } else if (!validateEmail(email)) {
            validationErrors.email = "Введіть коректну електронну пошту";
        }

        if (!password) {
            validationErrors.password = "Вкажіть пароль";
        } else if (password.length < 6) {
            validationErrors.password = "Пароль має містити щонайменше 6 символів";
        }

        if (action === ACTION_SIGN_UP) {
            if (!confirmPassword) {
                validationErrors.confirmPassword = "Повторіть пароль";
            } else if (password && confirmPassword !== password) {
                validationErrors.confirmPassword = "Паролі не співпадають";
            }
        }

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const changeAction = (nextAction) => {
        setAction(nextAction);
        setErrors({});
        setAuthMessage('');
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    const submit = async () => {
        if (!validateForm()) {
            return;
        }

        let user = {
            brand: getFieldValue('brandInput'),
            email: getFieldValue('emailInput'),
            password: getFieldValue('passwordInput')
        };

        try {
            let response = await fetch(`${API_BASE_URL}/Client`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user) 
            });

            if (response.ok) {
                navigate("/");
            } else {
                setAuthMessage("Користувач із такою електронною поштою уже існує");
            }
        } catch (error) {
            console.error('Error:', error);
            setAuthMessage('Помилка реєстрації користувача');
        }
    };

    const login = async () => {
        if (!validateForm()) {
            return;
        }

        let user = {
            email: getFieldValue('emailInput'),
            password: getFieldValue('passwordInput')
        };

        try {
            let response = await fetch(`${API_BASE_URL}/Client/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            });

            if (response.ok) {
                let token = await response.text();
                
                localStorage.setItem('token', token);
                setToken(token);
                navigate("/profile");
            } else {
                let errorMessage = await response.text();
                setAuthMessage(getLoginErrorMessage(errorMessage));
            }
        } catch (error) {
            console.error('Error:', error);
            setAuthMessage('Помилка входу');
        }
    };

    if (token) {
        return null;
    }

    return(
        <div className='container'>
            <div className='auth-header'>
                <div className='text'>{action === ACTION_LOGIN ? 'Вхід' : 'Реєстрація'}</div>
                <div className='underline'></div>
            </div>
            <div className='inputs'>
                {action === ACTION_LOGIN ? <div></div> :
                    <div className="field">
                        <div className={`input ${errors.brand ? "input-error" : ""}`}>
                            <img src={user_icon} alt=""></img>
                            <input type="text" placeholder='бренд' id="brandInput"></input>
                        </div>
                        {errors.brand && <div className="error-message">{errors.brand}</div>}
                    </div>
                }
                <div className="field">
                    <div className={`input ${errors.email ? "input-error" : ""}`}>
                        <img src={email_icon} alt=""></img>
                        <input type="email" placeholder='електронна пошта' id="emailInput"></input>
                    </div>
                    {errors.email && <div className="error-message">{errors.email}</div>}
                </div>
                <div className="field">
                    <div className={`input ${errors.password ? "input-error" : ""}`}>
                        <img src={password_icon} alt=""></img>
                        <input type={showPassword ? "text" : "password"} placeholder='пароль' id="passwordInput"></input>
                        <button
                            className={`password-toggle${showPassword ? " password-toggle-visible" : ""}`}
                            type="button"
                            aria-label={showPassword ? "Приховати пароль" : "Показати пароль"}
                            onClick={() => setShowPassword((currentValue) => !currentValue)}
                        >
                            <span className="eye-icon" aria-hidden="true"></span>
                        </button>
                    </div>
                    {errors.password && <div className="error-message">{errors.password}</div>}
                </div>
                {action === ACTION_SIGN_UP &&
                    <div className="field">
                        <div className={`input ${errors.confirmPassword ? "input-error" : ""}`}>
                            <img src={password_icon} alt=""></img>
                            <input type={showConfirmPassword ? "text" : "password"} placeholder='повторіть пароль' id="confirmPasswordInput"></input>
                            <button
                                className={`password-toggle${showConfirmPassword ? " password-toggle-visible" : ""}`}
                                type="button"
                                aria-label={showConfirmPassword ? "Приховати пароль" : "Показати пароль"}
                                onClick={() => setShowConfirmPassword((currentValue) => !currentValue)}
                            >
                                <span className="eye-icon" aria-hidden="true"></span>
                            </button>
                        </div>
                        {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                    </div>
                }
            </div>
            {authMessage && <div className="auth-message">{authMessage}</div>}
            <div className='submit-container'>
                <button className="submit" type="button" onClick={action === ACTION_LOGIN ? login : submit}>
                    {action === ACTION_LOGIN ? 'Увійти' : 'Зареєструватися'}
                </button>
                <button
                    className="submit submit-secondary"
                    type="button"
                    onClick={() => changeAction(action === ACTION_LOGIN ? ACTION_SIGN_UP : ACTION_LOGIN)}
                >
                    {action === ACTION_LOGIN ? 'Реєстрація' : 'Вхід'}
                </button>
            </div>
        </div>
    )
}

export default LoginSingUp;
