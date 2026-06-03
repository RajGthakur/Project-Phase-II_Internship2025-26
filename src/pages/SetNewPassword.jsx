import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationModal from '../components/NotificationModal';

const SetNewPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const { login: authLogin } = useAuth();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showNotifyModal, setShowNotifyModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'info' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (password !== confirmPassword) {
            setModalConfig({ title: 'Mismatch', message: 'Passwords do not match', type: 'error' });
            setShowNotifyModal(true);
            setIsLoading(false);
            return;
        }

        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8}$/;
        if (password.length !== 8 || !passwordRegex.test(password)) {
            setModalConfig({
                title: 'Weak Password',
                message: 'Password must be exactly 8 characters containing at least one number and one special character',
                type: 'error'
            });
            setShowNotifyModal(true);
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
                setModalConfig({
                    title: 'Welcome Aboard!',
                    message: 'Your permanent password has been set. Redirecting you to your dashboard...',
                    type: 'success'
                });
                setShowNotifyModal(true);

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
                const text = await response.text();
                setModalConfig({ title: 'Error', message: text || 'Failed to update password.', type: 'error' });
                setShowNotifyModal(true);
            }
        } catch (err) {
            setModalConfig({ title: 'Network Error', message: 'An error occurred. Please try again later.', type: 'error' });
            setShowNotifyModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Access Denied</h2>
                    <p style={{ color: '#64748b', marginBottom: '2rem' }}>This page can only be accessed during your first login.</p>
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
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            padding: '2rem'
        }}>
            <div className="card animate-fade-in" style={{
                width: '100%',
                maxWidth: '500px',
                padding: '4rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{
                        width: '72px',
                        height: '72px',
                        backgroundColor: '#3b82f6',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        color: 'white',
                        transform: 'rotate(-5deg)',
                        boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.4)'
                    }}>
                        <ShieldCheck size={40} />
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', marginBottom: '1rem' }}>
                        Welcome to Smart Ride Sharing!
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: '1.6' }}>
                        To keep your account secure, please replace your temporary password with a permanent one.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: '#475569' }}>Set Your Permanent Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="input-field"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Exactly 8 characters"
                                required
                                maxLength={8}
                                style={{ padding: '0.875rem 3rem 0.875rem 1rem', marginBottom: '0' }}
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

                    <div style={{ marginBottom: '2.5rem' }}>
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
                                style={{ padding: '0.875rem 3rem 0.875rem 1rem', marginBottom: '0' }}
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

                    <button
                        type="submit"
                        className="button"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '1.125rem',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '10px',
                            backgroundColor: '#3b82f6',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {isLoading ? 'Updating Account...' : (
                            <>
                                Complete Setup <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
                        Password must be exactly 8 characters with at least one number and one special character.
                    </p>
                </div>
            </div>

            <NotificationModal
                isOpen={showNotifyModal}
                onClose={() => setShowNotifyModal(false)}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
            />
        </div>
    );
};

export default SetNewPassword;
