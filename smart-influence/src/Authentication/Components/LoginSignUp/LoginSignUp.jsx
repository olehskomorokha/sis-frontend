import './LoginSignUp.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import user_icon from '../Assets/person.png';
import email_icon from '../Assets/email.png';
import password_icon from '../Assets/password.png';

const ACTION_LOGIN = 'login';
const ACTION_SIGN_UP = 'sign-up';

const LoginSingUp = () => {
    const navigate = useNavigate();
    const [action, setAction] = useState(ACTION_LOGIN);
    const [errors, setErrors] = useState({});
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
        const email = getFieldValue('emailInput');
        const password = getFieldValue('passwordInput');

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

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const changeAction = (nextAction) => {
        setAction(nextAction);
        setErrors({});
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
            let response = await fetch('https://localhost:7237/api/Client', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user) 
            });

            if (response.ok) {
                alert('Користувача успішно зареєстровано');
                navigate("/");
            } else {
                alert("Користувач із такою електронною поштою уже існує");
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Помилка реєстрації користувача');
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
            let response = await fetch('https://localhost:7237/api/Client/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            });

            if (response.ok) {
                let token = await response.text();
                alert('Вхід виконано успішно');
                
                localStorage.setItem('token', token);
                setToken(token);
                navigate("/profile");
            } else {
                let errorMessage = await response.text();
                alert(errorMessage || 'Не вдалося увійти');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Помилка входу');
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
                        <input type="password" placeholder='пароль' id="passwordInput"></input>
                    </div>
                    {errors.password && <div className="error-message">{errors.password}</div>}
                </div>
            </div>
            {action === ACTION_SIGN_UP ? <div></div> :
                <div className="forgot-password">Забули пароль? <span>Натисніть тут</span></div>
            }
            <div className='submit-container'>
                <div className={action === ACTION_LOGIN ? "submit gray" : "submit"} onClick={() => { changeAction(ACTION_SIGN_UP) }}>Реєстрація</div>
                <div className={action === ACTION_SIGN_UP ? "submit gray" : "submit"} onClick={() => { changeAction(ACTION_LOGIN) }}>Вхід</div>
                <button id="submitBtn" type="submit" onClick={action === ACTION_LOGIN ? login : submit}>Підтвердити</button>
            </div>
        </div>
    )
}

export default LoginSingUp;
