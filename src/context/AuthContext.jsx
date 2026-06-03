import React, { createContext, useContext, useState, useEffect } from 'react';
import NotificationModal from '../components/NotificationModal';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    useEffect(() => {
        const checkToken = () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                try {
                    const payload = JSON.parse(atob(storedToken.split('.')[1]));
                    const exp = payload.exp * 1000;
                    if (Date.now() >= exp) {
                        logout();
                        setNotification({
                            isOpen: true,
                            title: 'Session Expired',
                            message: 'Your session has expired for security reasons. Please log in again to continue.',
                            type: 'info'
                        });
                    } else {
                        // Set user if not already set (reloading page)
                        const storedUser = localStorage.getItem('user');
                        if (storedUser && (!user || JSON.stringify(user) !== storedUser)) {
                            setUser(JSON.parse(storedUser));
                        }
                        if (token !== storedToken) {
                            setToken(storedToken);
                        }
                    }
                } catch (e) {
                    logout();
                }
            }

            setLoading(false);
        };

        checkToken();
        // Check every minute
        const interval = setInterval(checkToken, 60000);
        return () => clearInterval(interval);
    }, []);

    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
            <NotificationModal
                isOpen={notification.isOpen}
                onClose={() => setNotification(p => ({ ...p, isOpen: false }))}
                title={notification.title}
                message={notification.message}
                type={notification.type}
            />
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
