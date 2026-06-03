import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MapPin, Calendar, Clock, Users, XCircle, AlertCircle, CheckCircle, Printer } from 'lucide-react';
import NotificationModal from '../components/NotificationModal';
import PaymentModal from '../components/PaymentModal';
import { useTheme } from '../context/ThemeContext';

const MyBookings = () => {
    const { token } = useAuth();
    const { isDarkMode } = useTheme();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showNotify, setShowNotify] = useState(false);
    const [notifyConfig, setNotifyConfig] = useState({ title: '', message: '', type: 'success' });
    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        bookingId: null,
        title: '',
        message: ''
    });

    const [paymentModal, setPaymentModal] = useState({
        isOpen: false,
        bookingId: null,
        amount: 0
    });

    const fetchBookings = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/bookings/my-bookings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(response.data);
        } catch (err) {
            setError('Failed to fetch bookings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [token]);

    const handleCancelClick = (bookingId) => {
        setConfirmConfig({
            isOpen: true,
            bookingId,
            title: 'Confirm Cancellation',
            message: 'Are you sure you want to cancel this booking request?'
        });
    };

    const confirmCancellation = async () => {
        const bookingId = confirmConfig.bookingId;
        try {
            await axios.delete(`http://localhost:8080/api/bookings/${bookingId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotifyConfig({
                title: 'Cancelled',
                message: 'Your booking has been cancelled successfully.',
                type: 'success'
            });
            setShowNotify(true);
            fetchBookings();
        } catch (err) {
            setNotifyConfig({
                title: 'Error',
                message: err.response?.data || 'Failed to cancel booking.',
                type: 'error'
            });
            setShowNotify(true);
        } finally {
            setConfirmConfig({ isOpen: false, bookingId: null, title: '', message: '' });
        }
    };

    const handlePaymentSuccess = async (method) => {
        try {
            await axios.put(`http://localhost:8080/api/bookings/${paymentModal.bookingId}/confirm`, { paymentMethod: method }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifyConfig({
                title: 'Payment Successful',
                message: 'Your booking has been confirmed! Enjoy your ride.',
                type: 'success'
            });
            setShowNotify(true);
            fetchBookings();
        } catch (err) {
            setNotifyConfig({
                title: 'Payment Failed',
                message: err.response?.data || 'Something went wrong during confirmation.',
                type: 'error'
            });
            setShowNotify(true);
        } finally {
            setPaymentModal({ isOpen: false, bookingId: null, amount: 0 });
        }
    };

    const handlePrintReceipt = (booking) => {
        const rideDate = new Date(booking.ride.dateTime).toLocaleDateString();
        const rideTime = new Date(booking.ride.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const totalPaid = booking.ride.price * booking.seats;

        const receiptHTML = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Booking Receipt - Smart Ride Sharing</title>
                    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">
                    <style>
                        body { font-family: 'Outfit', sans-serif; color: #1e293b; line-height: 1.5; padding: 40px; background: #f1f5f9; }
                        .receipt-card { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); padding: 40px; overflow: hidden; position: relative; }
                        .top-bar { position: absolute; top: 0; left: 0; width: 100%; height: 8px; background: linear-gradient(90deg, #2563eb, #3b82f6); }
                        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
                        .brand { font-size: 24px; font-weight: 800; color: #2563eb; }
                        .receipt-title { font-size: 14px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
                        .booking-id { font-size: 14px; color: #64748b; margin-top: 5px; }
                        .route-section { background: #f8fafc; border-radius: 16px; padding: 25px; margin-bottom: 30px; border: 1px solid #e2e8f0; }
                        .route-label { font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; }
                        .location { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 5px; }
                        .arrow { color: #2563eb; margin: 0 10px; }
                        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 30px; }
                        .info-item .label { font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 800; margin-bottom: 4px; }
                        .info-item .value { font-size: 15px; font-weight: 600; color: #1e293b; }
                        .total-section { border-top: 2px dashed #e2e8f0; padding-top: 30px; display: flex; justify-content: space-between; align-items: center; margin-top: 40px; }
                        .total-label { font-size: 18px; font-weight: 800; color: #0f172a; }
                        .total-amount { font-size: 28px; font-weight: 800; color: #2563eb; }
                        .footer { text-align: center; margin-top: 50px; color: #94a3b8; font-size: 13px; }
                        @media print {
                            body { background: white; padding: 0; }
                            .receipt-card { box-shadow: none; border: 1px solid #eee; }
                        }
                    </style>
                </head>
                <body>
                    <div class="receipt-card">
                        <div class="top-bar"></div>
                        <div class="header">
                            <div>
                                <div class="brand">Smart Ride Sharing</div>
                                <div class="booking-id">#RS-${booking.id}</div>
                            </div>
                            <div class="receipt-title">Payment Receipt</div>
                        </div>

                        <div class="route-section">
                            <div class="route-label">Travel Route</div>
                            <div class="location">${booking.ride.source} <span class="arrow">&rarr;</span> ${booking.ride.destination}</div>
                            <div style="margin-top: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div>
                                    <div class="route-label" style="font-size: 10px;">Pickup</div>
                                    <div style="font-size: 13px; color: #475569;">${booking.pickupLocation}</div>
                                </div>
                                <div>
                                    <div class="route-label" style="font-size: 10px;">Drop-off</div>
                                    <div style="font-size: 13px; color: #475569;">${booking.dropLocation}</div>
                                </div>
                            </div>
                        </div>

                        <div class="info-grid">
                            <div class="info-item">
                                <div class="label">Passenger</div>
                                <div class="value">${booking.passenger.name}</div>
                            </div>
                            <div class="info-item">
                                <div class="label">Driver</div>
                                <div class="value">${booking.ride.driver.name}</div>
                            </div>
                            <div class="info-item">
                                <div class="label">Date & Time</div>
                                <div class="value">${rideDate} at ${rideTime}</div>
                            </div>
                            <div class="info-item">
                                <div class="label">Seats Reserved</div>
                                <div class="value">${booking.seats} Seat(s)</div>
                            </div>
                        </div>

                        <div class="total-section">
                            <div class="total-label">Total Amount Paid</div>
                            <div class="total-amount">₹${totalPaid}</div>
                        </div>

                        <div class="footer">
                            <p>Thank you for choosing Smart Ride Sharing!</p>
                            <p style="font-size: 11px; margin-top: 5px;">This is a computer-generated receipt and requires no signature.</p>
                        </div>
                    </div>
                </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(receiptHTML);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    const [bookingFilter, setBookingFilter] = useState('upcoming'); // 'upcoming' or 'past'

    const now = new Date();
    const upcomingBookings = bookings.filter(booking => new Date(booking.ride.dateTime) >= now);
    const pastBookings = bookings.filter(booking => new Date(booking.ride.dateTime) < now);
    const filteredBookings = bookingFilter === 'upcoming' ? upcomingBookings : pastBookings;

    if (loading) return <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>Loading bookings...</div>;

    return (
        <div style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ backgroundColor: 'var(--primary-color)', padding: '12px', borderRadius: '14px', color: 'white' }}>
                        <Calendar size={26} />
                    </div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--primary-color)' }}>My Bookings ({filteredBookings.length})</h2>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--input-bg)', padding: '0.4rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <button
                        onClick={() => setBookingFilter('upcoming')}
                        style={{
                            padding: '0.6rem 1.2rem',
                            borderRadius: '10px',
                            border: 'none',
                            backgroundColor: bookingFilter === 'upcoming' ? 'var(--card-bg)' : 'transparent',
                            color: bookingFilter === 'upcoming' ? 'var(--primary-color)' : 'var(--text-muted)',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: bookingFilter === 'upcoming' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                        }}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setBookingFilter('past')}
                        style={{
                            padding: '0.6rem 1.2rem',
                            borderRadius: '10px',
                            border: 'none',
                            backgroundColor: bookingFilter === 'past' ? 'var(--card-bg)' : 'transparent',
                            color: bookingFilter === 'past' ? 'var(--primary-color)' : 'var(--text-muted)',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: bookingFilter === 'past' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                        }}
                    >
                        Past Bookings
                    </button>
                </div>
            </div>

            {error && (
                <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#ef4444', borderRadius: '12px', marginBottom: '2rem', textAlign: 'center', fontWeight: 'bold' }}>
                    {error}
                </div>
            )}

            {filteredBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '16px', color: 'var(--text-muted)', border: '1px solid var(--glass-border)' }}>
                    <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>{bookingFilter === 'upcoming' ? "You haven't booked any upcoming rides yet." : "You don't have any past bookings recorded."}</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {filteredBookings.map(booking => (
                        <div key={booking.id} style={{
                            backgroundColor: 'var(--card-bg)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                            border: '1px solid var(--glass-border)',
                            position: 'relative',
                            opacity: bookingFilter === 'past' ? 0.8 : 1,
                            backdropFilter: 'blur(10px)'
                        }}>
                            {/* Header Section */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{
                                        backgroundColor: bookingFilter === 'upcoming' ? 'var(--primary-color)' : 'var(--text-muted)',
                                        padding: '10px',
                                        borderRadius: '10px',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>
                                            {booking.ride.source} <span style={{ color: 'var(--text-muted)', fontWeight: 'normal', margin: '0 0.5rem' }}>&rarr;</span> {booking.ride.destination}
                                        </h3>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Route Details</div>
                                    </div>
                                </div>
                                <div style={{
                                    backgroundColor: booking.status === 'CONFIRMED' ? '#10b981' : (booking.status === 'ACCEPTED' ? '#0ea5e9' : (booking.status === 'CANCELLED' ? '#ef4444' : '#f59e0b')),
                                    color: 'white',
                                    padding: '6px 16px',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    {booking.status}
                                </div>
                            </div>

                            {/* Details Row */}
                            <div style={{ marginLeft: '60px', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                                    <MapPin size={14} color="var(--primary-color)" />
                                    <strong style={{ color: 'var(--text-muted)', marginRight: '4px' }}>Pickup:</strong> {booking.pickupLocation}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                                    <span style={{ width: '14px', textAlign: 'center', color: 'var(--text-muted)' }}>&rarr;</span>
                                    <strong style={{ color: 'var(--text-muted)', marginRight: '4px' }}>Drop:</strong> {booking.dropLocation}
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ backgroundColor: 'rgba(0,0,0,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Date</div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Calendar size={14} color="var(--primary-color)" />
                                        {new Date(booking.ride.dateTime).toLocaleDateString()}
                                    </div>
                                </div>
                                <div style={{ backgroundColor: 'rgba(14, 165, 233, 0.05)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(14, 165, 233, 0.1)' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#0ea5e9', marginBottom: '4px' }}>Time</div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Clock size={14} color="#0ea5e9" />
                                        {new Date(booking.ride.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#10b981', marginBottom: '4px' }}>Fare</div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-main)' }}>
                                        ₹{booking.ride.price * booking.seats}
                                    </div>
                                </div>
                                <div style={{ backgroundColor: 'rgba(249, 115, 22, 0.05)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(249, 115, 22, 0.1)' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#f97316', marginBottom: '4px' }}>Seats</div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Users size={16} color="#f97316" />
                                        {booking.seats}
                                    </div>
                                </div>
                            </div>

                            {/* Booking Date and Message */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderTop: '1px dashed var(--glass-border)', marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Clock size={14} />
                                    Booked on: {new Date(booking.bookingTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: booking.status === 'ACCEPTED' ? '#10b981' : (booking.status === 'PENDING' ? '#f59e0b' : 'var(--text-main)'), fontWeight: '600' }}>
                                    {booking.status === 'PENDING' && 'Waiting for driver approval...'}
                                    {booking.status === 'ACCEPTED' && '✓ Driver has approved your request!'}
                                    {booking.status === 'CONFIRMED' && '✓ Ride Confirmed'}
                                    {booking.status === 'CANCELLED' && '✕ Booking Cancelled'}
                                </div>
                            </div>

                            {/* Footer Area / Actions */}
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                                {bookingFilter === 'upcoming' && booking.status === 'ACCEPTED' && (
                                    <button
                                        onClick={() => setPaymentModal({
                                            isOpen: true,
                                            bookingId: booking.id,
                                            amount: booking.ride.price * booking.seats
                                        })}
                                        style={{
                                            backgroundColor: '#10b981',
                                            color: 'white',
                                            border: 'none',
                                            padding: '12px 24px',
                                            borderRadius: '10px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)'
                                        }}
                                    >
                                        <CheckCircle size={18} /> Proceed to Payment
                                    </button>
                                )}

                                {booking.status === 'CONFIRMED' && (
                                    <button
                                        onClick={() => handlePrintReceipt(booking)}
                                        style={{
                                            backgroundColor: 'var(--primary-color)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '12px 24px',
                                            borderRadius: '10px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)'
                                        }}
                                    >
                                        <Printer size={18} /> Print Receipt
                                    </button>
                                )}

                                {bookingFilter === 'upcoming' && (booking.status === 'ACCEPTED' || booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                                    <button
                                        onClick={() => handleCancelClick(booking.id)}
                                        style={{
                                            backgroundColor: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            padding: '12px 24px',
                                            borderRadius: '10px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3)'
                                        }}
                                    >
                                        <XCircle size={18} /> {booking.status === 'PENDING' ? 'Cancel Request' : 'Cancel Booking'}
                                    </button>
                                )}

                                {bookingFilter === 'past' && (
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <CheckCircle size={14} /> Journey Completed
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Confirmation Modal */}
            <NotificationModal
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
                onConfirm={confirmCancellation}
                title={confirmConfig.title}
                message={confirmConfig.message}
                type="confirm"
            />

            {/* Success/Error Notification */}
            <NotificationModal
                isOpen={showNotify}
                onClose={() => setShowNotify(false)}
                title={notifyConfig.title}
                message={notifyConfig.message}
                type={notifyConfig.type}
            />
            {/* Payment Modal */}
            {paymentModal.isOpen && (
                <PaymentModal
                    bookingId={paymentModal.bookingId}
                    amount={paymentModal.amount}
                    onClose={() => setPaymentModal({ ...paymentModal, isOpen: false })}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
};

export default MyBookings;
