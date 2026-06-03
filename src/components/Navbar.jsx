import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import NotificationModal from './NotificationModal';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogoutConfirm = () => {
        logout();
        setIsLogoutModalOpen(false);
        navigate('/login', { replace: true });
    };

    return (
        <>
            <nav style={{
                backgroundColor: 'var(--card-bg)',
                backdropFilter: 'blur(10px)',
                padding: '1rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '2px solid var(--glass-border)',
                transition: 'all 0.3s ease',
                position: 'relative',
                zIndex: 1000
            }}>
                <div 
                    className="navbar-brand"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '2.25rem', fontWeight: '800', color: 'var(--primary-color)', letterSpacing: '-0.5px' }}
                >
                    <Car size={40} />
                    <span className="desktop-only">Smart Ride Sharing</span>
                    <span className="mobile-only">SRS</span>
                </div>

                {/* Desktop Links */}
                <div className="navbar-desktop-links" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    {!user && (
                        <>
                            <Link to="/" style={{ color: 'var(--text-main)' }}>Home</Link>
                            <Link to="/about" style={{ color: 'var(--text-main)' }}>About Us</Link>
                            <Link to="/contact" style={{ color: 'var(--text-main)' }}>Contact</Link>
                            <Link to="/faqs" style={{ color: 'var(--text-main)' }}>FAQ's</Link>
                        </>
                    )}
                    <ThemeToggle />
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                <User size={18} />
                                {user.name} ({user.role})
                            </span>
                            <button onClick={() => setIsLogoutModalOpen(true)} className="button" style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <LogOut size={16} style={{ marginRight: '0.25rem' }} /> Logout
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <Link to="/login" style={{
                                color: 'var(--text-main)',
                                fontWeight: '500',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                transition: 'background 0.2s'
                            }} className="hover-bg">
                                Login
                            </Link>
                            <Link to="/register" className="button" style={{
                                padding: '0.5rem 1.5rem',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                Register
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="mobile-only" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <ThemeToggle />
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}
                    >
                        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Mobile Menu Content */}
                <div className={`navbar-mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                    {!user ? (
                        <>
                            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
                            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
                            <Link to="/faqs" onClick={() => setIsMobileMenuOpen(false)}>FAQ's</Link>
                            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} style={{ fontWeight: '600' }}>Login</Link>
                            <Link to="/register" className="button" onClick={() => setIsMobileMenuOpen(false)} style={{ textAlign: 'center' }}>Register</Link>
                        </>
                    ) : (
                        <>
                            <div style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--glass-border)', marginBottom: '0.5rem' }}>
                                <div style={{ fontWeight: '700', color: 'var(--primary-color)' }}>{user.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.role}</div>
                            </div>
                            <button onClick={() => { setIsLogoutModalOpen(true); setIsMobileMenuOpen(false); }} className="button" style={{ width: '100%' }}>
                                <LogOut size={16} style={{ marginRight: '0.5rem' }} /> Logout
                            </button>
                        </>
                    )}
                </div>
            </nav>

            <NotificationModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogoutConfirm}
                title="Confirm Logout"
                message="Are you sure you want to log out of your account?"
                type="confirm"
            />
        </>
    );
};

export default Navbar;
