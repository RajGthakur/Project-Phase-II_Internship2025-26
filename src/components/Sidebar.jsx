import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationModal from './NotificationModal';

const Sidebar = ({ menuItems, activeSection, onMenuClick, isCollapsed, toggleSidebar, mobileOpen }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleLogoutConfirm = () => {
        logout();
        setIsLogoutModalOpen(false);
        navigate('/login', { replace: true });
    };

    return (
        <>
            <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
                {/* Toggle Button */}
                <button className="sidebar-toggle" onClick={toggleSidebar}>
                    {isCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
                </button>

                {/* Header / Logo */}
                <div className="sidebar-header">
                    {!isCollapsed && <h2 className="brand-title">Smart Ride Sharing</h2>}
                    {isCollapsed && <h2 className="brand-title-small">SRS</h2>}
                </div>

                <div className="sidebar-content">
                    {/* User Profile */}
                    <div className="sidebar-user">
                        <div className="user-avatar">
                            <User size={20} />
                        </div>
                        {!isCollapsed && (
                            <div className="user-info">
                                <p className="user-name">{user?.name || 'User'}</p>
                                <p className="user-role">{user?.role || 'Guest'}</p>
                            </div>
                        )}
                    </div>

                    {/* Navigation Menu */}
                    <nav className="sidebar-nav">
                        {menuItems.map((item) => (
                            <div
                                key={item.id}
                                className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                                onClick={() => {
                                    if (item.id === 'logout') {
                                        setIsLogoutModalOpen(true);
                                    } else if (item.path) {
                                        navigate(item.path);
                                    } else {
                                        onMenuClick(item.id);
                                    }
                                }}
                                title={isCollapsed ? item.label : ''}
                            >
                                <div className="nav-icon">{item.icon}</div>
                                {!isCollapsed && <span className="nav-label">{item.label}</span>}
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Logout */}
                <div className="sidebar-footer">
                    <div className="nav-item logout" onClick={() => setIsLogoutModalOpen(true)}>
                        <div className="nav-icon"><LogOut size={20} /></div>
                        {!isCollapsed && <span className="nav-label">Logout</span>}
                    </div>
                </div>
            </div>

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

export default Sidebar;
