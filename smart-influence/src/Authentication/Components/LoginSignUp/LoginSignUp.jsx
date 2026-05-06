import './LoginSignUp.css'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

import user_icon from '../Assets/person.png'
import email_icon from '../Assets/email.png'
import password_icon from '../Assets/password.png'

const LoginSingUp = () => {
    const navigate = useNavigate();
    const [action, setAction] = useState("Login");
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

        if (action === "Sign Up") {
            const brand = getFieldValue('brandInput');

            if (!brand) {
                validationErrors.brand = "Brand is required";
            } else if (brand.length < 2) {
                validationErrors.brand = "Brand must be at least 2 characters";
            }
        }

        if (!email) {
            validationErrors.email = "Email is required";
        } else if (!validateEmail(email)) {
            validationErrors.email = "Enter a valid email";
        }

        if (!password) {
            validationErrors.password = "Password is required";
        } else if (password.length < 6) {
            validationErrors.password = "Password must be at least 6 characters";
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
                alert('User registered successfully');
                navigate("/");
            } else {
                console.log("Email already exists");
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error registering user');
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
                alert('Login successful');
                
                localStorage.setItem('token', token);
                setToken(token);
                navigate("/profile");
            } else {
                let errorMessage = await response.text();
                alert(errorMessage);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error logging in');
        }
    };

    if (token) {
        return null;
    }

    return(
        <div className='container'>
            <div className='auth-header'>
                <div className='text'>{action}</div>
                <div className='underline'></div>
            </div>
            <div className='inputs'>
                {action === "Login" ? <div></div> :
                    <div className="field">
                        <div className={`input ${errors.brand ? "input-error" : ""}`}>
                            <img src={user_icon} alt=""></img>
                            <input type="text" placeholder='brand' id="brandInput"></input>
                        </div>
                        {errors.brand && <div className="error-message">{errors.brand}</div>}
                    </div>
                }
                <div className="field">
                    <div className={`input ${errors.email ? "input-error" : ""}`}>
                        <img src={email_icon} alt=""></img>
                        <input type="email" placeholder='email' id="emailInput"></input>
                    </div>
                    {errors.email && <div className="error-message">{errors.email}</div>}
                </div>
                <div className="field">
                    <div className={`input ${errors.password ? "input-error" : ""}`}>
                        <img src={password_icon} alt=""></img>
                        <input type="password" placeholder='password' id="passwordInput"></input>
                    </div>
                    {errors.password && <div className="error-message">{errors.password}</div>}
                </div>
            </div>
            {action === "Sign Up" ? <div></div> :
                <div className="forgot-password">Lost Password? <span>Click Here!</span></div>
            }
            <div className='submit-container'>
                <div className={action === "Login" ? "submit gray" : "submit"} onClick={() => { changeAction("Sign Up") }}>Sign Up</div>
                <div className={action === "Sign Up" ? "submit gray" : "submit"} onClick={() => { changeAction("Login") }}>Login</div>
                <button id="submitBtn" type="submit" onClick={action === "Login" ? login : submit}>Submit</button>
            </div>
        </div>
    )
}

export default LoginSingUp
