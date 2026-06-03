import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Eye, EyeOff, ShieldCheck, Mail, Lock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import BackgroundVideo from '../components/BackgroundVideo';

const Login = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const isUsernameError = error.toLowerCase().includes('username') || error.toLowerCase().includes('email');
    const { login: authLogin } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', formData);

            if (response.data.requirePasswordChange) {
                navigate(`/set-password?token=${response.data.resetToken}&firstLogin=true`);
                return;
            }

            authLogin(response.data.user, response.data.token);

            if (response.data.user.role === 'ADMIN') {
                navigate('/admin-dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Login error:', err);
            const errorMessage = typeof err.response?.data === 'string' 
                ? err.response.data 
                : (err.response?.data?.message || 'Invalid credentials');
            setError(errorMessage);
        }
    };

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            background: 'transparent',
            overflow: 'hidden',
            position: 'relative'
        }}>
            <BackgroundVideo />


            {/* Centered Login Form Container */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                zIndex: 2,
                width: '100%',
                minHeight: '100vh'
            }}>
                <div className="card animate-fade-in" style={{
                    maxWidth: '420px',
                    width: '100%',
                    padding: '2.5rem 2rem',
                    boxShadow: isDarkMode ? '0 25px 60px -12px rgba(0,0,0,0.5)' : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                    borderRadius: '2rem',
                    backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.3)' : 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(15px)',
                    WebkitBackdropFilter: 'blur(15px)'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '64px',
                            height: '64px',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderRadius: '16px',
                            marginBottom: '1rem'
                        }}>
                            <ShieldCheck size={32} color="var(--primary-color)" />
                        </div>
                        <h2 style={{ fontSize: '2.25rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
                            Welcome <span style={{ color: 'var(--primary-color)' }}>Back</span>
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Please enter your details to sign in</p>
                    </div>

                    {/* Generic error message box removed as requested to show below fields */}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Username / Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    placeholder="yourname@example.com"
                                    className="input-field"
                                    value={formData.username}
                                    onChange={(e) => {
                                        setFormData({ ...formData, username: e.target.value });
                                        if (error.toLowerCase().includes('username') || error.toLowerCase().includes('email')) setError('');
                                    }}
                                    required
                                    style={{ 
                                        marginBottom: '0', 
                                        padding: '0.9rem 1rem 0.9rem 3rem', 
                                        borderRadius: '10px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        border: `1px solid ${(error.toLowerCase().includes('username') || error.toLowerCase().includes('email')) ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
                                        color: isDarkMode ? 'white' : '#1e293b',
                                        backdropFilter: 'none'
                                    }}
                                />
                            </div>
                            {(error.toLowerCase().includes('username') || error.toLowerCase().includes('email')) && (
                                <p className="animate-fade-in" style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ display: 'inline-block', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
                                    {error}
                                </p>
                            )}
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="input-field"
                                    value={formData.password}
                                    onChange={(e) => {
                                        const val = e.target.value.slice(0, 8);
                                        setFormData({ ...formData, password: val });
                                        if (error.toLowerCase().includes('password') || (!isUsernameError && error)) setError('');
                                    }}
                                    required
                                    maxLength={8}
                                    style={{ 
                                        marginBottom: '0', 
                                        padding: '0.9rem 3rem 0.9rem 3rem', 
                                        borderRadius: '10px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        border: `1px solid ${(error.toLowerCase().includes('password') || (!isUsernameError && error)) ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
                                        color: isDarkMode ? 'white' : '#1e293b',
                                        backdropFilter: 'none'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '16px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--text-muted)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        transition: 'color 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
                                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {(error.toLowerCase().includes('password') || (!isUsernameError && error)) && (
                                <p className="animate-fade-in" style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ display: 'inline-block', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
                                    {error}
                                </p>
                            )}
                        </div>

                        <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
                            <Link to="/forgot-password" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '700' }}>
                                Forgot Password?
                            </Link>
                        </div>

                        <button type="submit" className="button" style={{
                            width: '100%',
                            padding: '1.1rem',
                            fontSize: '1.1rem',
                            fontWeight: '800',
                            borderRadius: '12px',
                            boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.4)'
                        }}>
                            Sign In
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: `1px solid ${isDarkMode ? 'var(--glass-border)' : '#f1f5f9'}`, paddingTop: '1.5rem' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                            Don't have an account? <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: '800' }}>Register Now</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
