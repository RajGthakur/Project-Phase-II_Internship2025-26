import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';
import LocationInput from '../components/LocationInput';
import MapPreview from '../components/MapPreview';
import { MapPin, Users, Search, Calendar, Clock, Car, ChevronRight, Star, Settings } from 'lucide-react';
import NotificationModal from '../components/NotificationModal';
import { useTheme } from '../context/ThemeContext';

const RideSearch = ({ setActiveSection }) => {
    const { token } = useAuth();
    const { isDarkMode } = useTheme();
    const [searchParams, setSearchParams] = useState({
        source: '',
        destination: '',
        date: ''
    });
    const [sourceCoords, setSourceCoords] = useState(null);
    const [destinationCoords, setDestinationCoords] = useState(null);
    const [rides, setRides] = useState([]);
    const [error, setError] = useState('');
    const [searching, setSearching] = useState(false);

    // Modal State
    const [selectedRide, setSelectedRide] = useState(null);
    const [bookingDetails, setBookingDetails] = useState({
        seats: 1,
        pickupLocation: '',
        dropLocation: ''
    });
    const [showPayment, setShowPayment] = useState(false);

    // Notification Modal State
    const [notification, setNotification] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'success'
    });
    const [bookingLoading, setBookingLoading] = useState(false);

    const getTodayDateString = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setSearching(true);
        try {
            const response = await axios.get('http://localhost:8080/api/rides/search', {
                params: {
                    source: searchParams.source,
                    destination: searchParams.destination,
                    date: searchParams.date
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            // Filter out rides where both date and time have passed
            const now = new Date();
            const filteredRides = response.data.filter(ride => {
                const rideDate = new Date(ride.dateTime);
                return rideDate > now;
            });

            setRides(filteredRides);
            if (filteredRides.length === 0) setError('No upcoming rides found matching your criteria.');
            else setError('');
        } catch (err) {
            setError('Failed to fetch rides.');
        } finally {
            setSearching(false);
        }
    };

    const handleBookNowClick = (ride) => {
        setSelectedRide(ride);
        setBookingDetails({
            seats: 1,
            pickupLocation: '',
            dropLocation: ''
        });
        setShowPayment(false);
    };

    const handleConfirmBookingClick = async () => {
        if (!bookingDetails.pickupLocation || !bookingDetails.dropLocation) {
            setNotification({
                isOpen: true,
                title: 'Missing Locations',
                message: 'Please select both pickup and drop-off locations to proceed.',
                type: 'error'
            });
            return;
        }

        // Additional check for past ride before booking
        if (new Date(selectedRide.dateTime) < new Date()) {
            setNotification({
                isOpen: true,
                title: 'Ride Passed',
                message: 'This ride has already started and cannot be booked.',
                type: 'error'
            });
            return;
        }

        setBookingLoading(true);
        try {
            await axios.post('http://localhost:8080/api/bookings',
                {
                    rideId: selectedRide.id,
                    seats: bookingDetails.seats,
                    pickupLocation: bookingDetails.pickupLocation,
                    dropLocation: bookingDetails.dropLocation
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setNotification({
                isOpen: true,
                title: 'Success!',
                message: 'Ride booked successfully! Redirecting to your bookings...',
                type: 'success'
            });

            // Close the booking modal immediately
            setSelectedRide(null);

            // Redirect after a small delay so user sees the message
            setTimeout(() => {
                if (setActiveSection) {
                    setActiveSection('bookings');
                } else {
                    window.location.hash = 'bookings';
                }
            }, 1000);

        } catch (err) {
            console.error(err);
            setNotification({
                isOpen: true,
                title: 'Booking Failed',
                message: err.response?.data || 'Booking failed. Please try again.',
                type: 'error'
            });
        } finally {
            setBookingLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem 1rem' }}>
            <div style={{ padding: '1rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', color: isDarkMode ? 'var(--primary-color)' : '#0369a1' }}>
                    Find Your Next <span style={{ color: 'var(--primary-color)' }}>Ride</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>
                    Affordable and reliable rides at your fingertips.
                </p>

                <div className="card animate-fade-in" style={{
                    maxWidth: '1000px', margin: '0 auto', padding: '1.5rem',
                    background: 'var(--card-bg)', backdropFilter: 'blur(10px)',
                    border: '1px solid var(--glass-border)', borderRadius: '1.25rem',
                    boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)'
                }}>
                    <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'flex-end' }}>
                        <div style={{ textAlign: 'left' }}>
                            <label style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '8px', display: 'block', color: 'var(--text-muted)' }}>From City *</label>
                            <LocationInput
                                value={searchParams.source}
                                onChange={(val) => setSearchParams(p => ({ ...p, source: val }))}
                                onSelectCoords={(coords) => setSourceCoords(coords)}
                                placeholder="Type a city"
                            />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <label style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '8px', display: 'block', color: 'var(--text-muted)' }}>To City *</label>
                            <LocationInput
                                value={searchParams.destination}
                                onChange={(val) => setSearchParams(p => ({ ...p, destination: val }))}
                                onSelectCoords={(coords) => setDestinationCoords(coords)}
                                placeholder="Type a city"
                            />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <label style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '8px', display: 'block', color: 'var(--text-muted)' }}>Travel Date *</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-color)', zIndex: 2, pointerEvents: 'none' }} />
                                <input
                                    type="date"
                                    value={searchParams.date}
                                    onChange={(e) => setSearchParams(p => ({ ...p, date: e.target.value }))}
                                    min={getTodayDateString()}
                                    required
                                    className="input-field"
                                    style={{
                                        padding: '12px 12px 12px 2.75rem',
                                        width: '100%',
                                        borderRadius: '12px',
                                        height: '48px',
                                        marginBottom: 0,
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                        </div>
                        <button type="submit" className="button" disabled={searching} style={{ height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: '12px', width: '100%' }}>
                            {searching ? 'Searching...' : <><Search size={20} /> Search</>}
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                        <MapPreview sourceCoords={sourceCoords} destinationCoords={destinationCoords} />
                    </div>
                </div>
            </div>

            <div className="container" style={{ paddingBottom: '4rem', maxWidth: '1000px', margin: '3rem auto 0' }}>
                {error && (
                    <div className="card" style={{ textAlign: 'center', padding: '2rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <p style={{ fontWeight: 'bold' }}>{error}</p>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {rides.map(ride => (
                        <div key={ride.id} className="card ride-card" style={{
                            border: '1px solid var(--glass-border)',
                            background: 'var(--card-bg)',
                            borderRadius: '1.5rem',
                            overflow: 'hidden',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
                            transition: 'transform 0.2s',
                            cursor: 'default'
                        }}>
                            {/* Header row */}
                            <div style={{ backgroundColor: 'var(--primary-color)', padding: '1rem 2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Car size={24} />
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', letterSpacing: '0.5px' }}>AVAILABLE RIDE</h3>
                            </div>

                            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                {/* Top info: Route, Cost, Booking */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                                    <div style={{ flex: 1, minWidth: '300px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                            <div style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', padding: '0.6rem', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                                                <MapPin size={22} color="var(--primary-color)" />
                                            </div>
                                            <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.025em' }}>
                                                {ride.source} <span style={{ color: 'var(--text-muted)', margin: '0 0.75rem', fontWeight: 'normal' }}>&rarr;</span> {ride.destination}
                                            </h2>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.95rem', marginLeft: '3.5rem', flexWrap: 'wrap' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Calendar size={16} color="var(--primary-color)" /> {new Date(ride.dateTime).toLocaleDateString()}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Clock size={16} color="var(--primary-color)" /> {new Date(ride.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: ride.availableSeats < 2 ? '#ef4444' : 'inherit', fontWeight: ride.availableSeats < 2 ? '700' : 'normal' }}>
                                                <Users size={16} /> {ride.availableSeats} seats left
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1.5rem', marginLeft: '3.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-main)', fontSize: '1rem' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Settings size={16} color="var(--text-muted)" />
                                                </div>
                                                <span>Driver: <strong style={{ color: 'var(--primary-color)' }}>{ride.driver ? ride.driver.name : 'Unknown'}</strong></span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', fontSize: '1rem', fontWeight: '700' }}>
                                                <Star size={18} fill="currentColor" /> 5.0
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.5rem', backgroundColor: 'rgba(34, 197, 94, 0.05)', borderRadius: '20px', border: '1px solid rgba(34, 197, 94, 0.1)', minWidth: '180px' }}>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 0, fontWeight: '700', letterSpacing: '1px' }}>Fare per Seat</p>
                                        <p style={{ fontSize: '2rem', fontWeight: '900', color: '#22c55e', margin: 0 }}>₹{ride.price}</p>
                                        <button
                                            className="button"
                                            style={{ backgroundColor: '#22c55e', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: '800', border: 'none', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(34, 197, 94, 0.3)' }}
                                            onClick={() => handleBookNowClick(ride)}
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </div>

                                {/* Vehicle section */}
                                {ride.vehicle && (
                                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '2.5rem', flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
                                        {/* Photos */}
                                        <div style={{ flex: '1', minWidth: '250px' }}>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}>
                                                <Search size={16} /> Vehicle Preview
                                            </p>
                                            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                                {ride.vehicle.carImageUrls && ride.vehicle.carImageUrls.length > 0 ? (
                                                    ride.vehicle.carImageUrls.map((url, idx) => (
                                                        <img key={idx} src={`http://localhost:8080/uploads/${url}`} alt="vehicle" style={{ width: '100px', height: '75px', objectFit: 'cover', borderRadius: '12px', border: '2px solid var(--glass-border)', backgroundColor: 'var(--input-bg)' }} />
                                                    ))
                                                ) : (
                                                    <div style={{ width: '100px', height: '75px', borderRadius: '12px', backgroundColor: 'var(--input-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', border: '1px dashed var(--glass-border)' }}>No Photo</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div style={{ flex: '2', minWidth: '300px' }}>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}>
                                                <Settings size={16} /> Specifications
                                            </p>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                                                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Company</div>
                                                    <div style={{ fontWeight: '800', color: 'var(--text-main)' }}>{ride.vehicle.company}</div>
                                                </div>
                                                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AC Status</div>
                                                    <div style={{ fontWeight: '800', color: 'var(--text-main)' }}>{ride.vehicle.hasAc ? 'Full AC' : 'Non-AC'}</div>
                                                </div>
                                                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Model</div>
                                                    <div style={{ fontWeight: '800', color: 'var(--text-main)' }}>{ride.vehicle.model}</div>
                                                </div>
                                                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Color</div>
                                                    <div style={{ fontWeight: '800', color: 'var(--text-main)' }}>{ride.vehicle.color}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Booking Modal */}
            {selectedRide && !showPayment && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(8px)' }}>
                    <div className="card animate-fade-in" style={{ padding: '2.5rem', width: '550px', maxWidth: '95%', borderRadius: '24px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--glass-border)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', letterSpacing: '-0.025em' }}>Confirm Your Ride</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Seats to Book (Max: {selectedRide.availableSeats})</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={selectedRide.availableSeats}
                                    value={bookingDetails.seats}
                                    onChange={(e) => setBookingDetails(p => ({ ...p, seats: parseInt(e.target.value) || 1 }))}
                                    style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid var(--glass-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)', fontSize: '1rem', outline: 'none' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pickup Point in {selectedRide.source}</label>
                                <select
                                    value={bookingDetails.pickupLocation}
                                    onChange={(e) => setBookingDetails(p => ({ ...p, pickupLocation: e.target.value }))}
                                    style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid var(--glass-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)', fontSize: '1rem', outline: 'none' }}
                                >
                                    <option value="">-- Choose Pickup Location --</option>
                                    {selectedRide.pickupLocations && selectedRide.pickupLocations.map((loc, idx) => (
                                        <option key={idx} value={loc}>{loc}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Drop-off Point in {selectedRide.destination}</label>
                                <select
                                    value={bookingDetails.dropLocation}
                                    onChange={(e) => setBookingDetails(p => ({ ...p, dropLocation: e.target.value }))}
                                    style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid var(--glass-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)', fontSize: '1rem', outline: 'none' }}
                                >
                                    <option value="">-- Choose Drop Location --</option>
                                    {selectedRide.dropLocations && selectedRide.dropLocations.map((loc, idx) => (
                                        <option key={idx} value={loc}>{loc}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ backgroundColor: 'rgba(139, 92, 246, 0.05)', padding: '1.5rem', borderRadius: '18px', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                                    <span>Fare per seat:</span>
                                    <span>₹{selectedRide.price}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', color: 'var(--text-main)', fontSize: '1.4rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                                    <span>Total Payable:</span>
                                    <span style={{ color: 'var(--primary-color)' }}>₹{selectedRide.price * bookingDetails.seats}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1.25rem', marginTop: '2.5rem' }}>
                            <button
                                className="button"
                                style={{ flex: 1.5, backgroundColor: '#22c55e', color: 'white', borderRadius: '14px', padding: '1rem', fontWeight: '800', fontSize: '1.1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(34, 197, 94, 0.3)', cursor: 'pointer', opacity: bookingLoading ? 0.7 : 1 }}
                                onClick={handleConfirmBookingClick}
                                disabled={bookingLoading}
                            >
                                {bookingLoading ? 'Processing...' : 'Confirm Ride'}
                            </button>
                            <button
                                className="button-secondary"
                                style={{ flex: 1, borderRadius: '14px', padding: '1rem', fontWeight: '700', fontSize: '1rem' }}
                                onClick={() => setSelectedRide(null)}
                                disabled={bookingLoading}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {selectedRide && showPayment && (
                <PaymentModal
                    amount={selectedRide.price * bookingDetails.seats}
                    onClose={() => {
                        setShowPayment(false);
                        setSelectedRide(null);
                    }}
                    onSuccess={(method) => handlePaymentSuccess(selectedRide.id, method)}
                />
            )}
            {/* Notification Modal */}
            <NotificationModal
                isOpen={notification.isOpen}
                onClose={() => setNotification(p => ({ ...p, isOpen: false }))}
                title={notification.title}
                message={notification.message}
                type={notification.type}
            />
        </div>
    );
};

export default RideSearch;
