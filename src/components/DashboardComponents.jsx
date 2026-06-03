import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Bell, Star, MessageSquare, CheckCircle, Inbox } from 'lucide-react';

export const NotificationList = () => {
    const { user, token } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [activeTab, setActiveTab] = useState('unread');

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/api/notifications/user/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNotifications(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        if (user) fetchNotifications();
    }, [user, token]);

    const markAsRead = async (id) => {
        try {
            await axios.put(`http://localhost:8080/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const unread = notifications.filter(n => !n.isRead);
    const read = notifications.filter(n => n.isRead);
    const displayedNotifications = activeTab === 'unread' ? unread : read;

    return (
        <div className="card animate-fade-in" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: 0, color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: '800' }}>
                    <Bell color="var(--primary-color)" size={28} /> Notifications
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--bg-main)', padding: '0.4rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <button
                        onClick={() => setActiveTab('unread')}
                        style={{
                            padding: '0.6rem 1.2rem',
                            borderRadius: '10px',
                            backgroundColor: activeTab === 'unread' ? 'var(--card-bg)' : 'transparent',
                            color: activeTab === 'unread' ? 'var(--primary-color)' : 'var(--text-muted)',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            border: activeTab === 'unread' ? '1px solid var(--glass-border)' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        Unread {unread.length > 0 && <span style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem' }}>{unread.length}</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('read')}
                        style={{
                            padding: '0.6rem 1.2rem',
                            borderRadius: '10px',
                            backgroundColor: activeTab === 'read' ? 'var(--card-bg)' : 'transparent',
                            color: activeTab === 'read' ? 'var(--primary-color)' : 'var(--text-muted)',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            border: activeTab === 'read' ? '1px solid var(--glass-border)' : 'none'
                        }}
                    >
                        Read
                    </button>
                </div>
            </div>

            {displayedNotifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.7 }}>
                    <Inbox size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '600' }}>
                        {activeTab === 'unread' ? "You're all caught up!" : "No old notifications to show."}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {displayedNotifications.map(n => (
                        <div
                            key={n.id}
                            style={{
                                padding: '1.5rem',
                                borderLeft: n.isRead ? '4px solid #cbd5e1' : '4px solid var(--primary-color)',
                                backgroundColor: n.isRead ? 'rgba(0,0,0,0.02)' : 'rgba(59, 130, 246, 0.05)',
                                borderRadius: '1rem',
                                border: '1px solid var(--glass-border)',
                                transition: 'all 0.2s',
                                position: 'relative',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: n.isRead ? '500' : '700', color: 'var(--text-main)', marginBottom: '6px', fontSize: '1.05rem', lineHeight: '1.5' }}>{n.message}</p>
                                <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Bell size={12} /> {new Date(n.createdAt).toLocaleString()}
                                </small>
                            </div>
                            
                            {!n.isRead && (
                                <button
                                    onClick={() => markAsRead(n.id)}
                                    title="Mark as read"
                                    style={{
                                        backgroundColor: 'var(--primary-color)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '10px 16px',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontWeight: '600',
                                        fontSize: '0.85rem',
                                        boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <CheckCircle size={18} /> Mark as Read
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const ReviewSummary = ({ userId }) => {
    const { token } = useAuth();
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/api/reviews/user/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Sort reviews by date descending (recent first)
                const sortedReviews = (res.data || []).sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setReviews(sortedReviews);
            } catch (err) {
                console.error(err);
            }
        };
        if (userId) fetchReviews();
    }, [userId, token]);

    return (
        <div style={{ padding: '0.5rem' }}>
            <h3 style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '2.5rem',
                color: 'var(--text-main)',
                fontSize: '1.8rem',
                fontWeight: '900'
            }}>
                <div style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    padding: '10px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Star color="#f59e0b" fill="#f59e0b" size={28} />
                </div>
                User Reviews
            </h3>

            {reviews.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem',
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    borderRadius: '24px',
                    border: '2px dashed var(--glass-border)'
                }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '600' }}>No reviews yet.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {reviews.map(r => (
                        <div
                            key={r.id}
                            style={{
                                backgroundColor: 'var(--card-bg)',
                                borderRadius: '24px',
                                padding: '2rem',
                                boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.1)',
                                border: '1px solid var(--glass-border)',
                                position: 'relative',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                cursor: 'default'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.2)';
                                e.currentTarget.style.borderColor = 'var(--primary-color)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 20px -5px rgba(0, 0, 0, 0.1)';
                                e.currentTarget.style.borderColor = 'var(--glass-border)';
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '48px', height: '48px',
                                        background: 'var(--primary-gradient)',
                                        color: 'white',
                                        borderRadius: '14px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.2rem', fontWeight: 'bold'
                                    }}>
                                        {(r.reviewer?.name || 'A')[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 style={{ color: 'var(--text-main)', fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>
                                            {r.reviewer?.name || 'Anonymous Passenger'}
                                        </h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '4px' }}>
                                            <div style={{ display: 'flex', gap: '2px' }}>
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={20}
                                                        fill={i < r.rating ? "#f59e0b" : "none"}
                                                        color={i < r.rating ? "#f59e0b" : "var(--glass-border)"}
                                                        strokeWidth={i < r.rating ? 2 : 1.5}
                                                    />
                                                ))}
                                            </div>
                                            <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#f59e0b', marginLeft: '4px' }}>
                                                {r.rating}.0
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{
                                    backgroundColor: 'rgba(0,0,0,0.05)',
                                    padding: '6px 12px',
                                    borderRadius: '10px',
                                    fontSize: '0.85rem',
                                    fontWeight: '700',
                                    color: 'var(--text-muted)'
                                }}>
                                    {new Date(r.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                            </div>

                            {r.ride && (
                                <div style={{
                                    marginBottom: '1.5rem',
                                    fontSize: '0.95rem',
                                    color: 'var(--text-muted)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    backgroundColor: 'rgba(0,0,0,0.02)',
                                    padding: '10px 16px',
                                    borderRadius: '12px',
                                    width: 'fit-content',
                                    border: '1px solid var(--glass-border)'
                                }}>
                                    <MessageSquare size={16} color="var(--primary-color)" />
                                    <span style={{ fontWeight: '600' }}>
                                        {r.ride.source} <span style={{ color: 'var(--text-muted)', margin: '0 8px', fontWeight: 'bold' }}>&rarr;</span> {r.ride.destination}
                                    </span>
                                </div>
                            )}

                            <blockquote style={{
                                margin: 0,
                                padding: '1.5rem',
                                backgroundColor: 'rgba(0,0,0,0.01)',
                                borderLeft: '4px solid var(--primary-color)',
                                borderRadius: '0 16px 16px 0',
                                position: 'relative'
                            }}>
                                <span style={{
                                    position: 'absolute',
                                    top: '-15px',
                                    left: '20px',
                                    fontSize: '3.5rem',
                                    color: 'var(--glass-border)',
                                    fontFamily: 'serif',
                                    lineHeight: '1',
                                    zIndex: 0,
                                    opacity: 0.5
                                }}>“</span>
                                <p style={{
                                    color: 'var(--text-main)',
                                    fontSize: '1.1rem',
                                    fontWeight: '500',
                                    lineHeight: '1.6',
                                    margin: 0,
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    {r.comment || 'No comment provided by the passenger.'}
                                </p>
                            </blockquote>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
