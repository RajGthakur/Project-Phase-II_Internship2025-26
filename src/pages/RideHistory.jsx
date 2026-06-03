import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MapPin, Calendar, Clock, Users, Star, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import NotificationModal from '../components/NotificationModal';
import { useTheme } from '../context/ThemeContext';

const RideHistory = () => {
    const { user, token } = useAuth();
    const { isDarkMode } = useTheme();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNotify, setShowNotify] = useState(false);
    const [notifyConfig, setNotifyConfig] = useState({ title: '', message: '', type: 'success' });

    const [reviewModal, setReviewModal] = useState({
        isOpen: false,
        booking: null,
        rating: 5,
        comment: ''
    });

    const fetchHistory = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/bookings/history', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(response.data);
        } catch (err) {
            console.error("Failed to fetch history:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchHistory();
    }, [token]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/reviews', {
                reviewerId: user.id,
                revieweeId: reviewModal.booking.ride.driver.id,
                rideId: reviewModal.booking.ride.id,
                rating: reviewModal.rating,
                comment: reviewModal.comment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotifyConfig({
                title: 'Review Submitted',
                message: 'Thank you for your feedback!',
                type: 'success'
            });
            setShowNotify(true);
            
            // Update history state to immediately reflect that this ride has been reviewed
            setHistory(history.map(item => 
                item.id === reviewModal.booking.id ? { ...item, reviewed: true } : item
            ));
            
            setReviewModal({ isOpen: false, booking: null, rating: 5, comment: '' });
        } catch (err) {
            setNotifyConfig({
                title: 'Error',
                message: 'Failed to submit review.',
                type: 'error'
            });
            setShowNotify(true);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-main)' }}>Loading history...</div>;

    return (
        <div style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem' }}>
                <div style={{ backgroundColor: '#10b981', padding: '12px', borderRadius: '14px', color: 'white' }}>
                    <Clock size={26} />
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#10b981' }}>Ride History</h2>
            </div>

            {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '16px', color: 'var(--text-muted)', border: '1px solid var(--glass-border)' }}>
                    <p>No past rides found in your history.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {history.map(item => (
                        <div key={item.id} style={{
                            backgroundColor: 'var(--card-bg)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                            border: '1px solid var(--glass-border)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ backgroundColor: 'rgba(0,0,0,0.05)', padding: '8px', borderRadius: '10px' }}>
                                        <MapPin size={20} color="var(--primary-color)" />
                                    </div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                                        {item.ride.source} &rarr; {item.ride.destination}
                                    </h3>
                                </div>
                                <div style={{
                                    backgroundColor: (item.status === 'COMPLETED' || item.ride.status === 'COMPLETED') ? '#dcfce7' : '#fee2e2',
                                    color: (item.status === 'COMPLETED' || item.ride.status === 'COMPLETED') ? '#166534' : '#991b1b',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase'
                                }}>
                                    {item.ride.status === 'COMPLETED' ? 'COMPLETED' : item.status}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                <div><strong style={{ color: 'var(--text-main)' }}>Date:</strong> {new Date(item.ride.dateTime).toLocaleDateString()}</div>
                                {user.role === 'DRIVER' ? (
                                    <div><strong style={{ color: 'var(--text-main)' }}>Passenger:</strong> {item.passenger ? item.passenger.name : 'No Bookings'}</div>
                                ) : (
                                    <div><strong style={{ color: 'var(--text-main)' }}>Driver:</strong> {item.ride.driver.name}</div>
                                )}
                                <div><strong style={{ color: 'var(--text-main)' }}>Fare:</strong> ₹{item.ride.price * (item.seats || 0)}</div>
                                <div><strong style={{ color: 'var(--text-main)' }}>Seats:</strong> {item.seats || 0}</div>
                            </div>

                            {item.status === 'COMPLETED' && user.role === 'PASSENGER' && (
                                item.reviewed ? (
                                    <button
                                        disabled
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '8px',
                                            padding: '8px 16px', borderRadius: '8px', border: '1px solid #10b981',
                                            backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 'bold',
                                            cursor: 'not-allowed', fontSize: '0.85rem', opacity: 0.8
                                        }}
                                    >
                                        <CheckCircle size={16} /> Reviews and Ratings completed
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setReviewModal({ isOpen: true, booking: item, rating: 5, comment: '' })}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '8px',
                                            padding: '8px 16px', borderRadius: '8px', border: '1px solid #f59e0b',
                                            backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontWeight: 'bold',
                                            cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s'
                                        }}
                                        className="give-ratings-btn"
                                        onMouseOver={(e) => { 
                                            e.currentTarget.style.backgroundColor = '#f59e0b'; 
                                            e.currentTarget.style.color = 'white'; 
                                        }}
                                        onMouseOut={(e) => { 
                                            e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.1)'; 
                                            e.currentTarget.style.color = '#f59e0b'; 
                                        }}
                                    >
                                        <Star size={16} fill="currentColor" /> Give ratings
                                    </button>
                                )
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Review Modal */}
            {reviewModal.isOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 2000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(8px)'
                }}>
                    <div style={{
                        backgroundColor: 'var(--card-bg)',
                        borderRadius: '24px',
                        padding: '2.5rem',
                        width: '95%',
                        maxWidth: '500px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        border: '1px solid var(--glass-border)',
                        animation: 'modalSlideUp 0.3s ease-out'
                    }}>
                        <style>{`
                            @keyframes modalSlideUp {
                                from { transform: translateY(20px); opacity: 0; }
                                to { transform: translateY(0); opacity: 1; }
                            }
                            .star-button:hover { transform: scale(1.15); }
                            .emoji-item:hover { background: var(--glass-border); transform: scale(1.2); }
                        `}</style>

                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{
                                width: '64px', height: '64px', backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                borderRadius: '20px', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', margin: '0 auto 1.5rem', color: '#f59e0b'
                            }}>
                                <Star size={32} fill="#f59e0b" />
                            </div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '0.5rem', color: 'var(--text-main)', letterSpacing: '-0.025em' }}>Give Reviews</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>How was your ride with <strong style={{ color: 'var(--text-main)' }}>{reviewModal.booking.ride.driver.name}</strong>?</p>
                        </div>

                        <form onSubmit={handleReviewSubmit}>
                            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                                <p style={{ marginBottom: '1rem', fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Rating</p>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <div
                                            key={star}
                                            className="star-button"
                                            style={{ cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                                            onClick={() => setReviewModal({ ...reviewModal, rating: star })}
                                        >
                                            <Star
                                                size={42}
                                                fill={star <= reviewModal.rating ? "#f59e0b" : "none"}
                                                color={star <= reviewModal.rating ? "#f59e0b" : "var(--glass-border)"}
                                                strokeWidth={star <= reviewModal.rating ? 2 : 1.5}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <label style={{ fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Message (Optional)</label>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {['😊', '🚗', '✨', '👍', '💯'].map(emoji => (
                                            <span
                                                key={emoji}
                                                className="emoji-item"
                                                onClick={() => setReviewModal({ ...reviewModal, comment: reviewModal.comment + emoji })}
                                                style={{
                                                    cursor: 'pointer', fontSize: '1.2rem', padding: '2px 6px',
                                                    borderRadius: '6px', transition: 'all 0.2s', display: 'inline-block'
                                                }}
                                            >
                                                {emoji}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <textarea
                                    style={{
                                        width: '100%', padding: '1rem', borderRadius: '14px',
                                        border: '1px solid var(--glass-border)', minHeight: '120px', fontSize: '1rem',
                                        backgroundColor: 'var(--input-bg)', color: 'var(--text-main)', transition: 'all 0.2s', outline: 'none',
                                        fontFamily: 'inherit', resize: 'none'
                                    }}
                                    placeholder="Tell us about your experience..."
                                    value={reviewModal.comment}
                                    onChange={(e) => setReviewModal({ ...reviewModal, comment: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setReviewModal({ isOpen: false, booking: null, rating: 5, comment: '' })}
                                    style={{
                                        flex: 1, padding: '1rem', borderRadius: '14px', border: '1px solid var(--glass-border)',
                                        backgroundColor: 'rgba(0,0,0,0.05)', color: 'var(--text-muted)', fontWeight: '700',
                                        cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1.5, padding: '1rem', borderRadius: '14px', border: 'none',
                                        backgroundColor: '#10b981', color: 'white', fontWeight: '800',
                                        cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)',
                                        transition: 'all 0.2s', fontSize: '1rem'
                                    }}
                                >
                                    Submit Review
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <NotificationModal
                isOpen={showNotify}
                onClose={() => setShowNotify(false)}
                title={notifyConfig.title}
                message={notifyConfig.message}
                type={notifyConfig.type}
            />
        </div>
    );
};

export default RideHistory;
