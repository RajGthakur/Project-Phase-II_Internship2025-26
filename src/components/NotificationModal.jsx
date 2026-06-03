import React from 'react';
import { CheckCircle, AlertCircle, XCircle, HelpCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const NotificationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'success' }) => {
    const { isDarkMode } = useTheme();
    if (!isOpen) return null;

    const config = {
        success: {
            icon: <CheckCircle size={48} color="#10b981" />,
            color: '#10b981',
            btnBg: 'linear-gradient(135deg, #10b981, #059669)'
        },
        error: {
            icon: <XCircle size={48} color="#ef4444" />,
            color: '#ef4444',
            btnBg: 'linear-gradient(135deg, #ef4444, #dc2626)'
        },
        info: {
            icon: <AlertCircle size={48} color="#2563eb" />,
            color: '#2563eb',
            btnBg: 'linear-gradient(135deg, #2563eb, #1d4ed8)'
        },
        confirm: {
            icon: <HelpCircle size={48} color="#a855f7" />,
            color: '#a855f7',
            btnBg: 'linear-gradient(135deg, #a855f7, #9333ea)'
        }
    };

    const style = config[type] || config.info;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
        }}>
            <div className="animate-fade-in" style={{
                backgroundColor: 'var(--card-bg)',
                padding: '2.5rem',
                borderRadius: '24px',
                textAlign: 'center',
                maxWidth: '420px',
                width: '90%',
                boxShadow: isDarkMode ? '0 25px 50px -12px rgba(0, 0, 0, 0.6)' : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                border: '1px solid var(--glass-border)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                    {style.icon}
                </div>
                <h2 style={{
                    marginBottom: '1rem',
                    color: 'var(--text-main)',
                    fontSize: '1.75rem',
                    fontWeight: '800',
                    letterSpacing: '-0.025em'
                }}>
                    {title}
                </h2>
                <p style={{
                    color: 'var(--text-muted)',
                    marginBottom: '2.5rem',
                    fontSize: '1.05rem',
                    lineHeight: '1.6'
                }}>
                    {message}
                </p>
                {type === 'confirm' ? (
                    <div style={{ display: 'flex', gap: '1.25rem', width: '100%' }}>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'var(--input-bg)',
                                color: 'var(--text-muted)',
                                padding: '1rem',
                                borderRadius: '14px',
                                border: '1px solid var(--glass-border)',
                                fontWeight: '700',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                width: '100%',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.background = 'rgba(0,0,0,0.05)';
                                e.target.style.transform = 'translateY(-2px)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.background = 'var(--input-bg)';
                                e.target.style.transform = 'translateY(0)';
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            style={{
                                background: style.btnBg,
                                color: 'white',
                                padding: '1rem',
                                borderRadius: '14px',
                                border: 'none',
                                fontWeight: '700',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                width: '100%',
                                transition: 'all 0.2s ease',
                                boxShadow: `0 8px 15px -3px ${style.color}40`
                            }}
                            onMouseOver={(e) => {
                                e.target.style.filter = 'brightness(1.1)';
                                e.target.style.transform = 'translateY(-2px)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.filter = 'brightness(1)';
                                e.target.style.transform = 'translateY(0)';
                            }}
                        >
                            Confirm
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={onClose}
                        style={{
                            background: style.btnBg,
                            color: 'white',
                            padding: '1rem 2rem',
                            borderRadius: '14px',
                            border: 'none',
                            fontWeight: '700',
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            width: '100%',
                            transition: 'all 0.2s ease',
                            boxShadow: `0 8px 15px -3px ${style.color}40`
                        }}
                        onMouseOver={(e) => {
                            e.target.style.filter = 'brightness(1.1)';
                            e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.filter = 'brightness(1)';
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        OK
                    </button>
                )}
            </div>
        </div>
    );
};

export default NotificationModal;
