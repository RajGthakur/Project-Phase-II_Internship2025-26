import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const isForced = searchParams.get('forced') === 'true';
    const navigate = useNavigate();
    const { login: authLogin } = useAuth();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8}$/;
        if (password.length !== 8 || !passwordRegex.test(password)) {
            setError('Password must be exactly 8 characters containing at least one number and one special character');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password })
            });

            if (response.ok) {
                const data = await response.json();

                if (isForced) {
                    setMessage('Password updated successfully! Welcome to Smart Ride Sharing. Redirecting to your dashboard...');
                    // Auto login
                    authLogin(data.user, data.token);

                    setTimeout(() => {
                        if (data.user.role === 'ADMIN') {
                            navigate('/admin-dashboard');
                        } else {
                            navigate('/dashboard');
                        }
                    }, 2000);
                } else {
                    setMessage('Password reset successfully! Redirecting to login...');
                    setTimeout(() => navigate('/login'), 3000);
                }
            } else {
                const text = await response.text();
                setError(text || 'Failed to update password. Link may be expired.');
            }
        } catch (err) {
            setError('An error occurred. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '80vh'
            }}>
                <div className="card animate-fade-in" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Invalid or Expired Link</h2>
                    <p style={{ color: '#64748b', marginBottom: '2rem' }}>This password reset link is no longer valid.</p>
                    <button className="button" onClick={() => navigate('/login')}>Back to Login</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 'calc(100vh - 80px)',
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            padding: '2rem'
        }}>
            <div className="card animate-fade-in" style={{
                width: '100%',
                maxWidth: '450px',
                padding: '4rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        backgroundColor: 'var(--primary-color)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        color: 'white',
                        boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.5)'
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e293b' }}>
                        {isForced ? 'Secure Your Account' : 'Reset Password'}
                    </h2>
                    {isForced && (
                        <p style={{ marginTop: '0.75rem', color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5' }}>
                            Welcome to Smart Ride Sharing! For your security, please set a new permanent password for your account.
                        </p>
                    )}
                </div>

                {message ? (
                    <div className="animate-fade-in" style={{
                        textAlign: 'center',
                        backgroundColor: '#ecfdf5',
                        color: '#059669',
                        padding: '1.5rem',
                        borderRadius: '0.75rem',
                        border: '1px solid #d1fae5',
                        fontWeight: '500'
                    }}>
                        {message}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: '#475569' }}>New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="input-field"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Exactly 8 characters"
                                    required
                                    maxLength={8}
                                    style={{ paddingRight: '3rem', marginBottom: '0' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
                                        display: 'flex', alignItems: 'center'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: '#475569' }}>Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    className="input-field"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repeat your password"
                                    required
                                    maxLength={8}
                                    style={{ paddingRight: '3rem', marginBottom: '0' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{
                                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
                                        display: 'flex', alignItems: 'center'
                                    }}
                                >
                                    {showConfirmPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div style={{
                                backgroundColor: '#fef2f2',
                                color: '#ef4444',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                marginBottom: '1.5rem',
                                fontSize: '0.85rem',
                                border: '1px solid #fee2e2'
                            }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="button"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                fontSize: '1rem',
                                fontWeight: '600',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {isLoading ? 'Updating...' : isForced ? 'Complete Setup' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
