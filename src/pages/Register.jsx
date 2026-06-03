import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';
import { User, Shield, Briefcase, UserPlus, Mail, Lock, Car, Hash, Users as UsersIcon } from 'lucide-react';
import NotificationModal from '../components/NotificationModal';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import BackgroundVideo from '../components/BackgroundVideo';

const Register = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        role: 'PASSENGER'
    });

    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'name') {
            const regex = /^[A-Za-z\s]*$/;
            if (!regex.test(value)) return;
        }
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.name && !/^[A-Za-z\s]+$/.test(formData.name)) {
            setError('Full Name must contain only letters and spaces');
            return;
        }

        try {
            await register(formData);
            setModalConfig({
                title: 'Success!',
                message: 'Registration successful! Please login to continue.',
                type: 'success'
            });
            setShowModal(true);
        } catch (err) {
            setError('Registration failed. Username may be taken.');
        }
    };

    const roles = [
        { value: 'PASSENGER', label: 'Passenger', icon: <User size={20} /> },
        { value: 'DRIVER', label: 'Driver', icon: <Shield size={20} /> },
        { value: 'ADMIN', label: 'Admin', icon: <Briefcase size={20} /> }
    ];

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            background: 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <BackgroundVideo />


            <div className="card animate-fade-in" style={{
                width: '100%',
                maxWidth: '540px',
                padding: '3rem',
                borderRadius: '2.5rem',
                backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.3)' : 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(15px)',
                WebkitBackdropFilter: 'blur(15px)',
                boxShadow: isDarkMode ? '0 25px 60px -12px rgba(0,0,0,0.5)' : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                zIndex: 1
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '56px',
                        height: '56px',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderRadius: '14px',
                        marginBottom: '1rem'
                    }}>
                        <UserPlus size={28} color="var(--primary-color)" />
                    </div>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.025em' }}>Create <span style={{ color: 'var(--primary-color)' }}>Account</span></h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Join the Ride-Go community today</p>
                </div>

                {error && (
                    <div className="card animate-fade-in" style={{
                        backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.3)' : 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(15px)',
                        WebkitBackdropFilter: 'blur(15px)',
                        borderRadius: '12px', // Kept original borderRadius for error message
                        border: `1px solid ${isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2'}`, // Kept original error border
                        boxShadow: isDarkMode ? '0 10px 20px -5px rgba(0,0,0,0.2)' : '0 10px 20px -5px rgba(0, 0, 0, 0.05)', // Adjusted shadow for error
                        zIndex: 1,
                        color: '#ef4444', // Kept original error color
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        textAlign: 'center',
                        fontSize: '0.95rem',
                        fontWeight: '600'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-muted)' }}>I am a...</label>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            {roles.map((role) => (
                                <button
                                    key={role.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: role.value })}
                                    style={{
                                        flex: 1,
                                        padding: '1rem',
                                        borderRadius: '14px',
                                        background: formData.role === role.value ? 'var(--primary-color)' : 'var(--input-bg)',
                                        border: `1px solid ${formData.role === role.value ? 'var(--primary-color)' : 'var(--glass-border)'}`,
                                        color: formData.role === role.value ? 'white' : 'var(--text-main)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        transition: 'all 0.2s ease',
                                        boxShadow: formData.role === role.value ? '0 10px 15px -3px rgba(59, 130, 246, 0.3)' : 'none'
                                    }}
                                >
                                    {role.icon}
                                    <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{role.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                name="name"
                                placeholder="Full Name"
                                className="input-field"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                style={{ 
                                    marginBottom: '0', 
                                    padding: '1rem 1rem 1rem 3rem', 
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    color: isDarkMode ? 'white' : '#1e293b',
                                    backdropFilter: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                className="input-field"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                style={{ 
                                    marginBottom: '0', 
                                    padding: '1rem 1rem 1rem 3rem', 
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    color: isDarkMode ? 'white' : '#1e293b',
                                    backdropFilter: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                className="input-field"
                                value={formData.password}
                                onChange={(e) => {
                                    const val = e.target.value.slice(0, 8);
                                    setFormData({ ...formData, password: val });
                                }}
                                required
                                maxLength={8}
                                style={{ 
                                    marginBottom: '0', 
                                    padding: '1rem 1rem 1rem 3rem', 
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    color: isDarkMode ? 'white' : '#1e293b',
                                    backdropFilter: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {formData.role === 'DRIVER' && (
                        <div className="animate-fade-in" style={{ backgroundColor: 'rgba(59, 130, 246, 0.03)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)', marginBottom: '1.5rem' }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vehicle Details</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ position: 'relative' }}>
                                    <Car size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="text"
                                        name="vehicleModel"
                                        placeholder="Vehicle Model (e.g. Swift Dzire)"
                                        className="input-field"
                                        value={formData.vehicleModel || ''}
                                        onChange={handleChange}
                                        required
                                        style={{ marginBottom: '0', padding: '0.85rem 0.85rem 0.85rem 3rem', borderRadius: '10px', fontSize: '0.95rem' }}
                                    />
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <Hash size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="text"
                                        name="vehicleNumber"
                                        placeholder="Vehicle Number (e.g. TN-01-AB-1234)"
                                        className="input-field"
                                        value={formData.vehicleNumber || ''}
                                        onChange={handleChange}
                                        required
                                        style={{ marginBottom: '0', padding: '0.85rem 0.85rem 0.85rem 3rem', borderRadius: '10px', fontSize: '0.95rem' }}
                                    />
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <UsersIcon size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="number"
                                        name="vehicleCapacity"
                                        placeholder="Vehicle Capacity"
                                        className="input-field"
                                        value={formData.vehicleCapacity || ''}
                                        onChange={handleChange}
                                        required
                                        style={{ marginBottom: '0', padding: '0.85rem 0.85rem 0.85rem 3rem', borderRadius: '10px', fontSize: '0.95rem' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <button type="submit" className="button" style={{
                        width: '100%',
                        padding: '1.25rem',
                        fontSize: '1.1rem',
                        fontWeight: '800',
                        borderRadius: '12px',
                        boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.4)',
                        marginTop: '1rem'
                    }}>
                        Create Account
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                            Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: '800' }}>Sign In</Link>
                        </p>
                    </div>
                </form>
            </div>
            <NotificationModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    navigate('/login');
                }}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
            />
        </div>
    );
};

export default Register;
