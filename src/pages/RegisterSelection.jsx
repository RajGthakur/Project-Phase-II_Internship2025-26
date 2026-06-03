import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import BackgroundVideo from '../components/BackgroundVideo';
import ThemeToggle from '../components/ThemeToggle';

const RegisterSelection = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();

    const roles = [
        {
            id: 'PASSENGER',
            title: 'Passenger',
            description: 'Book rides and travel with ease.',
            icon: '🚗',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            id: 'DRIVER',
            title: 'Driver',
            description: 'Offer rides and earn money.',
            icon: '🚘',
            color: 'from-emerald-500 to-teal-500'
        }
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: 'transparent',
            position: 'relative',
            overflow: 'hidden',
        }}>
            <BackgroundVideo />

            <div className="container" style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                position: 'relative',
                zIndex: 1
            }}>
            <h1 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>Join Smart Ride Sharing</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', width: '100%' }}>
                {roles.map((role) => (
                    <div
                        key={role.id}
                        className="card animate-fade-in"
                        style={{ 
                            cursor: 'pointer', 
                            textAlign: 'center', 
                            transition: 'all 0.3s ease',
                            backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.3)' : 'rgba(255, 255, 255, 0.15)',
                            backdropFilter: 'blur(15px)',
                            WebkitBackdropFilter: 'blur(15px)',
                            borderRadius: '2.5rem',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            boxShadow: isDarkMode ? '0 15px 35px rgba(0,0,0,0.4)' : '0 15px 35px rgba(0,0,0,0.1)'
                        }}
                        onClick={() => navigate(`/register/${role.id}`)}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{role.icon}</div>
                        <h2 style={{ marginBottom: '0.5rem' }}>{role.title}</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{role.description}</p>
                        <button className="button" style={{ width: '100%' }}>Register as {role.title}</button>
                    </div>
                ))}
            </div>
            </div>
        </div>
    );
};

export default RegisterSelection;
