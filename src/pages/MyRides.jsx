import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, MapPin, Users, Edit, Trash2, Car, Clock, X } from 'lucide-react';
import NotificationModal from '../components/NotificationModal';

const MyRides = () => {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNotify, setShowNotify] = useState(false);
    const [notifyConfig, setNotifyConfig] = useState({ title: '', message: '', type: 'success' });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRide, setEditingRide] = useState(null);
    const [editFormData, setEditFormData] = useState({
        dateTime: '',
        price: '',
        availableSeats: ''
    });

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    useEffect(() => {
        const fetchMyRides = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/rides/driver/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRides(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching rides:", error);
                setLoading(false);
            }
        };

        fetchMyRides();
    }, [user.id, token]);

    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    const handleReschedule = (ride) => {
        setEditingRide(ride);

        // Format datetime for local datetime input
        let formattedDateTime = '';
        if (ride.dateTime) {
            const dt = new Date(ride.dateTime);
            dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
            formattedDateTime = dt.toISOString().slice(0, 16);
        }

        setEditFormData({
            dateTime: formattedDateTime,
            price: ride.price || '',
            availableSeats: ride.availableSeats || ''
        });
        setIsEditModalOpen(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const performReschedule = async () => {
        try {
            const { driver, ...rideDataWithoutDriver } = editingRide;
            const response = await axios.put(`http://localhost:8080/api/rides/${editingRide.id}`, {
                ...rideDataWithoutDriver,
                dateTime: editFormData.dateTime,
                price: parseFloat(editFormData.price),
                availableSeats: parseInt(editFormData.availableSeats)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update the local state with the new ride data
            setRides(prevRides => prevRides.map(r => r.id === editingRide.id ? response.data : r));

            setIsEditModalOpen(false);
            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
            setNotifyConfig({
                title: 'Reschedule Successful',
                message: 'Your ride has been successfully updated.',
                type: 'success'
            });
            setShowNotify(true);
        } catch (err) {
            console.error(err);
            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
            setNotifyConfig({
                title: 'Error',
                message: err.response?.data || 'Failed to reschedule ride.',
                type: 'error'
            });
            setShowNotify(true);
        }
    };

    const handleConfirmReschedule = (e) => {
        if (e) e.preventDefault();
        setConfirmConfig({
            isOpen: true,
            title: 'Confirm Reschedule',
            message: 'Are you sure you want to reschedule this ride with the new details?',
            onConfirm: performReschedule
        });
    };

    const performCancel = async (rideId) => {
        try {
            await axios.delete(`http://localhost:8080/api/rides/${rideId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remove the ride from local state perfectly
            setRides(rides.filter(r => r.id !== rideId));
            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
            setNotifyConfig({
                title: 'Ride Cancelled',
                message: 'Your ride has been successfully cancelled and deleted.',
                type: 'success'
            });
            setShowNotify(true);
        } catch (err) {
            console.error(err);
            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
            setNotifyConfig({
                title: 'Error',
                message: err.response?.data || 'Failed to cancel ride.',
                type: 'error'
            });
            setShowNotify(true);
        }
    };

    const handleCancel = (rideId) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Confirm Cancellation',
            message: 'Are you sure you want to cancel and delete this ride? This action cannot be undone.',
            onConfirm: () => performCancel(rideId)
        });
    };

    const performCompleteRide = async (rideId) => {
        try {
            await axios.put(`http://localhost:8080/api/rides/${rideId}/complete`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRides(prev => prev.map(r => r.id === rideId ? { ...r, status: 'COMPLETED' } : r));
            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
            setNotifyConfig({
                title: 'Ride Completed',
                message: 'You have successfully completed the ride.',
                type: 'success'
            });
            setShowNotify(true);
        } catch (err) {
            console.error(err);
            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
            setNotifyConfig({
                title: 'Error',
                message: err.response?.data || 'Failed to complete ride.',
                type: 'error'
            });
            setShowNotify(true);
        }
    };

    const handleCompleteRide = (ride) => {
        const rideDate = new Date(ride.dateTime);
        const now = new Date();
        
        if (rideDate > now) {
            setNotifyConfig({
                title: 'Too Early',
                message: 'You can only mark a ride as completed after its scheduled date and time.',
                type: 'error'
            });
            setShowNotify(true);
            return;
        }

        setConfirmConfig({
            isOpen: true,
            title: 'Complete Ride',
            message: 'Are you sure this ride is complete? This will also mark all confirmed bookings as completed.',
            onConfirm: () => performCompleteRide(ride.id)
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        let hours = d.getHours();
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${hours}:${minutes} ${ampm}`;
    };

    const [rideFilter, setRideFilter] = useState('upcoming'); // 'upcoming' or 'past'

    const now = new Date();
    const upcomingRides = rides
        .filter(ride => new Date(ride.dateTime) >= now && ride.status !== 'CANCELLED')
        .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
    const pastRides = rides
        .filter(ride => new Date(ride.dateTime) < now || ride.status === 'CANCELLED')
        .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
    const filteredRides = rideFilter === 'upcoming' ? upcomingRides : pastRides;

    if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading your rides...</div>;

    return (
        <div style={{ padding: '1rem' }}>
            <div style={{
                backgroundColor: 'var(--card-bg)',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                border: '1px solid var(--glass-border)',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ backgroundColor: '#10b981', padding: '12px', borderRadius: '14px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Car size={26} />
                        </div>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#10b981' }}>My Rides ({filteredRides.length})</h2>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--bg-main)', padding: '0.4rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                        <button
                            onClick={() => setRideFilter('upcoming')}
                            style={{
                                padding: '0.6rem 1.2rem',
                                borderRadius: '10px',
                                backgroundColor: rideFilter === 'upcoming' ? 'var(--card-bg)' : 'transparent',
                                color: rideFilter === 'upcoming' ? 'var(--primary-color)' : 'var(--text-muted)',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: rideFilter === 'upcoming' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                border: rideFilter === 'upcoming' ? '1px solid var(--glass-border)' : 'none'
                            }}
                        >
                            Upcoming
                        </button>
                        <button
                            onClick={() => setRideFilter('past')}
                            style={{
                                padding: '0.6rem 1.2rem',
                                borderRadius: '10px',
                                backgroundColor: rideFilter === 'past' ? 'var(--card-bg)' : 'transparent',
                                color: rideFilter === 'past' ? 'var(--primary-color)' : 'var(--text-muted)',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: rideFilter === 'past' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                border: rideFilter === 'past' ? '1px solid var(--glass-border)' : 'none'
                            }}
                        >
                            Past Rides
                        </button>
                    </div>
                </div>

                {filteredRides.length === 0 ? (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: '16px',
                        marginTop: '1rem',
                        minHeight: '200px'
                    }}>
                        <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: '500' }}>
                            {rideFilter === 'upcoming' ? "You don't have any upcoming rides." : "You don't have any past rides recorded."}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        {filteredRides.map(ride => (
                            <div key={ride.id} style={{
                                padding: '1.5rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: rideFilter === 'upcoming' ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-main)',
                                border: rideFilter === 'upcoming' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--glass-border)',
                                borderRadius: '16px',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                                opacity: rideFilter === 'past' ? 0.85 : 1
                            }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                                        <div style={{ backgroundColor: rideFilter === 'upcoming' ? '#dcfce7' : '#f1f5f9', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <MapPin size={18} color={rideFilter === 'upcoming' ? "#10b981" : "#64748b"} />
                                        </div>
                                        <span style={{ fontWeight: '800', fontSize: '1.15rem', color: 'var(--text-main)' }}>{ride.source} &rarr; {ride.destination}</span>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '0.7rem',
                                            backgroundColor: ride.status === 'CANCELLED' ? '#fee2e2' : (rideFilter === 'upcoming' ? '#dcfce7' : '#e2e8f0'),
                                            color: ride.status === 'CANCELLED' ? '#991b1b' : (rideFilter === 'upcoming' ? '#166534' : '#475569'),
                                            fontWeight: '800',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {ride.status === 'CANCELLED' ? 'CANCELLED' : 
                                             ride.status === 'COMPLETED' ? 'COMPLETED' : 
                                             (rideFilter === 'past' ? 'NOT AVAILABLE' : 
                                              (ride.availableSeats === 0 ? 'FULLY BOOKED' : ride.status))}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '25px', color: '#6b7280', fontSize: '0.85rem', fontWeight: '500', marginLeft: '45px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Calendar size={15} /> {formatDate(ride.dateTime)}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Clock size={15} /> {formatTime(ride.dateTime)}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Users size={15} /> {ride.availableSeats} seats
                                        </span>
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estimated Fare</div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: '800', color: rideFilter === 'upcoming' ? '#10b981' : '#475569' }}>₹{ride.price}</div>
                                    </div>

                                    {ride.status !== 'CANCELLED' && ride.status !== 'COMPLETED' && (
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button
                                                onClick={() => handleCompleteRide(ride)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '6px',
                                                    padding: '8px 18px', borderRadius: '8px', border: 'none',
                                                    backgroundColor: '#10b981', color: 'white', cursor: 'pointer',
                                                    fontWeight: '600', fontSize: '0.85rem',
                                                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
                                                }}
                                            >
                                                Complete Ride
                                            </button>
                                            
                                            {rideFilter === 'upcoming' && (
                                                <>
                                                    <button
                                                        onClick={() => handleReschedule(ride)}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: '6px',
                                                            padding: '8px 18px', borderRadius: '8px', border: 'none',
                                                            backgroundColor: '#3b82f6', color: 'white', cursor: 'pointer',
                                                            fontWeight: '600', fontSize: '0.85rem',
                                                            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                                                        }}
                                                    >
                                                        <Edit size={14} /> Reschedule
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancel(ride.id)}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: '6px',
                                                            padding: '8px 18px', borderRadius: '8px', border: 'none',
                                                            backgroundColor: '#ef4444', color: 'white', cursor: 'pointer',
                                                            fontWeight: '600', fontSize: '0.85rem',
                                                            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {(ride.status === 'COMPLETED' || ride.status === 'CANCELLED') && (
                                        <div style={{ fontSize: '0.8rem', color: ride.status === 'COMPLETED' ? '#10b981' : '#ef4444', fontStyle: 'italic', fontWeight: '600' }}>
                                            {ride.status === 'COMPLETED' ? 'Completed / Past Ride' : 
                                             ride.status === 'CANCELLED' ? 'Past Ride (Cancelled)' : ''}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <NotificationModal
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmConfig.onConfirm}
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

            {/* Edit/Reschedule Modal */}
            {isEditModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        backgroundColor: 'var(--card-bg)', borderRadius: '16px', padding: '2rem',
                        width: '90%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                        border: '1px solid var(--glass-border)',
                        animation: 'fadeIn 0.2s ease-out'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--text-main)' }}>Reschedule Ride</h3>
                            <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleConfirmReschedule} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Date & Time</label>
                                <input
                                    type="datetime-local"
                                    name="dateTime"
                                    value={editFormData.dateTime}
                                    onChange={handleEditChange}
                                    required
                                    min={(() => {
                                        const tomorrow = new Date();
                                        tomorrow.setDate(tomorrow.getDate() + 1);
                                        tomorrow.setHours(0, 0, 0, 0);
                                        const offset = tomorrow.getTimezoneOffset() * 60000;
                                        const localTomorrow = new Date(tomorrow.getTime() - offset);
                                        return localTomorrow.toISOString().slice(0, 16);
                                    })()}
                                    style={{
                                        width: '100%', padding: '0.75rem', borderRadius: '8px',
                                        border: '1px solid #cbd5e1', fontSize: '1rem',
                                        transition: 'border-color 0.2s, box-shadow 0.2s'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Estimated Fare (₹)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={editFormData.price}
                                        onChange={handleEditChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        style={{
                                            width: '100%', padding: '0.75rem', borderRadius: '8px',
                                            border: '1px solid #cbd5e1', fontSize: '1rem'
                                        }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Available Seats</label>
                                    <input
                                        type="number"
                                        name="availableSeats"
                                        value={editFormData.availableSeats}
                                        onChange={handleEditChange}
                                        required
                                        min="0"
                                        style={{
                                            width: '100%', padding: '0.75rem', borderRadius: '8px',
                                            border: '1px solid #cbd5e1', fontSize: '1rem'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    style={{
                                        padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1',
                                        backgroundColor: 'white', color: '#475569', fontWeight: '600',
                                        cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none',
                                        backgroundColor: '#10b981', color: 'white', fontWeight: '600',
                                        cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.4)',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyRides;
