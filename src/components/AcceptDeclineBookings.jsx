import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, Clock, MapPin, User, Calendar } from 'lucide-react';
import NotificationModal from './NotificationModal';
import { useTheme } from '../context/ThemeContext';

const AcceptDeclineBookings = () => {
    const { token } = useAuth();
    const { isDarkMode } = useTheme();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNotify, setShowNotify] = useState(false);
    const [notifyConfig, setNotifyConfig] = useState({ title: '', message: '', type: 'success' });
    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        bookingId: null,
        action: null,
        title: '',
        message: ''
    });

    const fetchBookings = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/bookings/driver', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [token]);

    const triggerAction = (id, action) => {
        const booking = bookings.find(b => b.id === id);
        if (booking && new Date(booking.ride.dateTime) < new Date()) {
            setNotifyConfig({
                title: 'Action Disabled',
                message: 'This ride has already expired and cannot be processed.',
                type: 'error'
            });
            setShowNotify(true);
            return;
        }

        setConfirmConfig({
            isOpen: true,
            bookingId: id,
            action: action,
            title: action === 'accept' ? 'Confirm Acceptance' : 'Confirm Decline',
            message: action === 'accept' 
                ? 'Are you sure you want to accept this passenger request?' 
                : 'Are you sure you want to decline this passenger request? This action cannot be undone.'
        });
    };

    const confirmAction = async () => {
        const { bookingId, action } = confirmConfig;
        
        try {
            await axios.put(`http://localhost:8080/api/bookings/${bookingId}/${action}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifyConfig({
                title: 'Success',
                message: `Booking ${action === 'accept' ? 'accepted' : 'declined'} successfully.`,
                type: 'success'
            });
            setShowNotify(true);
            fetchBookings();
        } catch (err) {
            setNotifyConfig({
                title: 'Action Failed',
                message: err.response?.data || 'Something went wrong.',
                type: 'error'
            });
            setShowNotify(true);
        } finally {
            setConfirmConfig({ isOpen: false, bookingId: null, action: null, title: '', message: '' });
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading Bookings...</div>;

    const filteredBookings = bookings.filter(b => b.status === 'PENDING' || b.status === 'ACCEPTED');

    return (
        <div style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
                <CheckCircle size={28} color="var(--primary-color)" />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>Manage Booking Requests</h2>
            </div>

            {filteredBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'var(--input-bg)', borderRadius: '1rem', color: 'var(--text-muted)', border: '1px solid var(--glass-border)' }}>
                    <Clock size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>No active booking requests found.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
                    {filteredBookings.map(booking => (
                        <div key={booking.id} className="card animate-fade-in" style={{ padding: '1.5rem', border: '1px solid var(--glass-border)', backgroundColor: 'var(--card-bg)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <User size={18} color="var(--primary-color)" />
                                    <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{booking.passenger.name}</span>
                                </div>
                                <div style={{
                                    backgroundColor: booking.status === 'ACCEPTED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                    color: booking.status === 'ACCEPTED' ? '#10b981' : '#f59e0b',
                                    padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold',
                                    border: `1px solid ${booking.status === 'ACCEPTED' ? '#10b981' : '#f59e0b'}`
                                }}>
                                    {booking.status}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                                    <MapPin size={16} color="var(--text-muted)" />
                                    <span><strong style={{ color: 'var(--text-muted)' }}>From:</strong> {booking.pickupLocation}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', marginLeft: '21px', color: 'var(--text-main)' }}>
                                    <span><strong style={{ color: 'var(--text-muted)' }}>To:</strong> {booking.dropLocation}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                                    <Calendar size={16} color="var(--text-muted)" />
                                    <span><strong style={{ color: 'var(--text-muted)' }}>Ride:</strong> {booking.ride.source} → {booking.ride.destination}</span>
                                </div>

                                {booking.bookingTime && (
                                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                                        <Clock size={16} color="var(--text-muted)" />
                                        <span><strong style={{ color: 'var(--text-muted)' }}>Booked on:</strong> {new Date(booking.bookingTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '0.5rem', padding: '12px', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                    <span>Seats: <strong style={{ color: 'var(--primary-color)' }}>{booking.seats}</strong></span>
                                    <span>Fare: <strong style={{ color: '#10b981' }}>₹{booking.ride.price * booking.seats}</strong></span>
                                </div>
                            </div>

                            {(() => {
                                const isExpired = new Date(booking.ride.dateTime) < new Date();
                                
                                if (booking.status === 'PENDING') {
                                    if (isExpired) {
                                        return (
                                            <div style={{ 
                                                textAlign: 'center', 
                                                padding: '12px', 
                                                backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                                                borderRadius: '10px', 
                                                color: '#ef4444', 
                                                fontWeight: 'bold', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                gap: '6px', 
                                                border: '1px solid #ef4444' 
                                            }}>
                                                <Clock size={18} /> Ride Expired - Action Disabled
                                            </div>
                                        );
                                    }
                                    return (
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button
                                                onClick={() => triggerAction(booking.id, 'accept')}
                                                style={{
                                                    flex: 1, backgroundColor: '#10b981', color: 'white', border: 'none',
                                                    padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                                    boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)'
                                                }}
                                            >
                                                <CheckCircle size={18} /> Accept
                                            </button>
                                            <button
                                                onClick={() => triggerAction(booking.id, 'decline')}
                                                style={{
                                                    flex: 1, backgroundColor: '#ef4444', color: 'white', border: 'none',
                                                    padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                                    boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)'
                                                }}
                                            >
                                                <XCircle size={18} /> Decline
                                            </button>
                                        </div>
                                    );
                                }
                                return (
                                    <div style={{ textAlign: 'center', padding: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1px solid #10b981' }}>
                                        <CheckCircle size={18} /> Booking Accepted
                                    </div>
                                );
                            })()}
                        </div>
                    ))}
                </div>
            )}

            <NotificationModal
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
                onConfirm={confirmAction}
                title={confirmConfig.title}
                message={confirmConfig.message}
                type="confirm"
            />
            
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

export default AcceptDeclineBookings;
