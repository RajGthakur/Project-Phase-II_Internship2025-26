import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NotificationModal from '../components/NotificationModal';
import { MapPin, Calendar, Clock, Users, ArrowRight, ArrowLeft, CheckCircle, Map as MapIcon, Plus } from 'lucide-react';
import LocationInput from '../components/LocationInput';
import MapPreview from '../components/MapPreview';

const CreateRide = ({ setActiveSection }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        driverName: JSON.parse(localStorage.getItem('user'))?.name || '',
        source: '',
        destination: '',
        sourceCoords: null,
        destinationCoords: null,
        pickupLocations: ['', '', '', ''],
        dropLocations: ['', '', '', ''],
        price: '',
        distance: '',
        baseValue: '',
        perKmRate: '',
        availableSeats: '',
        dateTime: '',
        date: '',
        time: '',
        vehicleId: ''
    });
    const [vehicles, setVehicles] = useState([]);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' });
    const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

    const showErrorModal = (msg) => {
        setModalConfig({
            title: 'Action Required',
            message: msg,
            type: 'error',
            onConfirm: undefined
        });
        setShowModal(true);
    };

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchVehicles();
    }, [token, navigate]);

    useEffect(() => {
        if (step === 3 && formData.sourceCoords && formData.destinationCoords && !formData.distance) {
            const calculateDistance = async () => {
                setIsCalculatingDistance(true);
                try {
                    // Using routing.openstreetmap.de API for much faster and reliable distance calculation
                    const osrmUrl = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${formData.sourceCoords.lon},${formData.sourceCoords.lat};${formData.destinationCoords.lon},${formData.destinationCoords.lat}?overview=false`;
                    const response = await fetch(osrmUrl);
                    const data = await response.json();

                    if (data.code === 'Ok' && data.routes.length > 0) {
                        const distanceInMeters = data.routes[0].distance;
                        const distanceInKm = (distanceInMeters / 1000).toFixed(1);

                        setFormData(prev => {
                            const dist = parseFloat(distanceInKm);
                            const base = parseFloat(prev.baseValue);
                            const rate = parseFloat(prev.perKmRate);
                            let newPrice = '';
                            if (!isNaN(base) && !isNaN(rate)) {
                                newPrice = (base + (dist * rate)).toFixed(2);
                            }
                            return {
                                ...prev,
                                distance: distanceInKm,
                                price: newPrice
                            };
                        });
                    } else {
                        throw new Error('Could not calculate route');
                    }
                } catch (err) {
                    console.error("Error calculating distance with OSRM:", err);
                    showErrorModal("Failed to auto-calculate distance. Please enter it manually.");
                } finally {
                    setIsCalculatingDistance(false);
                }
            };
            calculateDistance();
        }
    }, [step, formData.sourceCoords, formData.destinationCoords, formData.distance]);

    const fetchVehicles = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/vehicles/my-vehicles', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVehicles(response.data);
            if (response.data.length > 0) {
                setFormData(prev => ({ ...prev, vehicleId: response.data[0].id, availableSeats: response.data[0].capacity }));
            }
        } catch (err) {
            console.error("Error fetching vehicles", err);
            showErrorModal("Could not fetch vehicles. Please add a vehicle first.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'driverName') {
            if (value !== '' && !/^[a-zA-Z\s]+$/.test(value)) {
                return;
            }
        }

        setFormData(prev => {
            const updated = { ...prev, [name]: value };

            if (name === 'distance' || name === 'baseValue' || name === 'perKmRate') {
                const dist = parseFloat(updated.distance);
                const base = parseFloat(updated.baseValue);
                const rate = parseFloat(updated.perKmRate);
                if (!isNaN(dist) && !isNaN(base) && !isNaN(rate)) {
                    updated.price = (base + (dist * rate)).toFixed(2);
                } else {
                    updated.price = '';
                }
            }

            if (name === 'vehicleId') {
                const vehicle = vehicles.find(v => v.id.toString() === value);
                if (vehicle) updated.availableSeats = vehicle.capacity;
            }

            return updated;
        });
    };

    const handleLocationChange = (type, index, value) => {
        setFormData(prev => {
            const locations = [...prev[type]];
            locations[index] = value;
            return { ...prev, [type]: locations };
        });
    };

    const handleNext = () => {
        if (step === 1) {
            if (!formData.driverName?.trim()) {
                showErrorModal("Please enter Driver Name.");
                return;
            }
            if (!formData.source || !formData.destination) {
                showErrorModal("Please select both From and To cities using the suggestions.");
                return;
            }
            if (formData.source.trim().toLowerCase() === formData.destination.trim().toLowerCase()) {
                showErrorModal("please select different locations");
                return;
            }
            if (!formData.sourceCoords || !formData.destinationCoords) {
                showErrorModal("Please make sure to select the city from the dropdown suggestions.");
                return;
            }
            if (!formData.vehicleId) {
                showErrorModal("Please select a vehicle.");
                return;
            }
        }
        if (step === 2) {
            const hasEmptyPickup = formData.pickupLocations.some(l => !l || !l.toString().trim());
            const hasEmptyDrop = formData.dropLocations.some(l => !l || !l.toString().trim());
            if (hasEmptyPickup || hasEmptyDrop) {
                showErrorModal("Please fill in all 4 pickup and 4 drop locations.");
                return;
            }
        }
        setError('');
        setStep(prev => prev + 1);
    };

    const handleBack = () => setStep(prev => prev - 1);

    const handleCancel = () => {
        setModalConfig({
            title: 'Cancel Ride Posting?',
            message: 'Are you sure you want to cancel the current process? You will be taken back to the first step to start over.',
            type: 'confirm',
            onConfirm: () => {
                setStep(1);
                setFormData({
                    driverName: JSON.parse(localStorage.getItem('user'))?.name || '',
                    source: '',
                    destination: '',
                    sourceCoords: null,
                    destinationCoords: null,
                    pickupLocations: ['', '', '', ''],
                    dropLocations: ['', '', '', ''],
                    price: '',
                    distance: '',
                    baseValue: '',
                    perKmRate: '',
                    availableSeats: vehicles.length > 0 ? vehicles[0].capacity : '',
                    dateTime: '',
                    date: '',
                    time: '',
                    vehicleId: vehicles.length > 0 ? vehicles[0].id : ''
                });
                setError('');
                setShowModal(false);
            }
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.baseValue || !formData.perKmRate || !formData.distance || !formData.date || !formData.time || !formData.availableSeats) {
            showErrorModal("Please fill in all mandatory fields (Date, Time, Seats, Distance, Base Value, Per KM Rate).");
            return;
        }

        const selectedDate = new Date(formData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today

        if (selectedDate <= today) {
            showErrorModal("Ride date must be at least tomorrow. Same day or past date rides are not allowed.");
            return;
        }

        setModalConfig({
            title: 'Confirm Ride Details',
            message: 'Are you sure you want to post this ride?',
            type: 'confirm',
            onConfirm: () => {
                setShowModal(false);
                setTimeout(executePostRide, 300);
            }
        });
        setShowModal(true);
    };

    const executePostRide = async () => {
        try {
            const combinedDateTime = `${formData.date}T${formData.time}`;
            const payload = {
                source: formData.source,
                destination: formData.destination,
                pickupLocations: formData.pickupLocations.filter(l => l),
                dropLocations: formData.dropLocations.filter(l => l),
                price: formData.price,
                distance: formData.distance,
                availableSeats: formData.availableSeats,
                dateTime: combinedDateTime,
                vehicle: { id: formData.vehicleId }
            };

            await axios.post('http://localhost:8080/api/rides', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setModalConfig({
                title: 'Ride Posted!',
                message: 'Your ride has been posted successfully.',
                type: 'success',
                onConfirm: undefined
            });
            setShowModal(true);
        } catch (err) {
            showErrorModal(err.response?.data || 'Failed to create ride. Please try again.');
        }
    };

    const ProgressHeader = () => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
            {[1, 2, 3].map(i => (
                <React.Fragment key={i}>
                    <div style={{
                        width: '35px', height: '35px', borderRadius: '50%',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        backgroundColor: step >= i ? '#a855f7' : '#e2e8f0',
                        color: step >= i ? 'white' : '#64748b',
                        fontWeight: 'bold', border: step === i ? '2px solid #a855f7' : 'none'
                    }}>
                        {i}
                    </div>
                    {i < 3 && <div style={{ width: '40px', height: '2px', backgroundColor: step > i ? '#a855f7' : '#e2e8f0' }} />}
                </React.Fragment>
            ))}
        </div>
    );

    const inputStyle = {
        padding: '12px',
        width: '100%',
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        fontSize: '0.95rem'
    };

    // Calculate tomorrow's date for 'min' attribute restriction
    const getTomorrowDateString = () => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const year = tomorrow.getFullYear();
        const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const day = String(tomorrow.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    return (
        <div style={{ padding: '1rem' }}>
            {/* Header */}
            <div className="card" style={{ marginBottom: '1rem', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ backgroundColor: '#a855f7', padding: '10px', borderRadius: '12px', color: 'white' }}>
                        <MapIcon size={24} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#a855f7' }}>Driver Dashboard</h2>
                        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Welcome, {JSON.parse(localStorage.getItem('user'))?.name}. Manage your rides and vehicles.</p>
                    </div>
                </div>
            </div>

            {/* Main Wizard Card */}
            <div className="card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                    <Plus size={20} color="#a855f7" />
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#a855f7' }}>Post a New Ride</h2>
                </div>

                <ProgressHeader />

                {step === 1 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Driver Name *</label>
                            <input
                                type="text"
                                name="driverName"
                                value={formData.driverName}
                                onChange={handleChange}
                                placeholder="Enter Driver Name"
                                required
                                style={inputStyle}
                            />
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Select Vehicle Available *</label>
                            <select name="vehicleId" value={formData.vehicleId} onChange={handleChange} style={inputStyle}>
                                <option value="">Select a vehicle</option>
                                {vehicles.map(v => (
                                    <option key={v.id} value={v.id}>{v.company} - {v.model} - {v.vehicleNumber} (Seats: {v.capacity})</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>From City *</label>
                            <LocationInput
                                value={formData.source}
                                onChange={(val) => setFormData(p => ({ ...p, source: val }))}
                                onSelectCoords={(coords) => setFormData(p => ({ ...p, sourceCoords: coords }))}
                                placeholder="Type a city (e.g., Mumbai)"
                                style={inputStyle}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>To City *</label>
                            <LocationInput
                                value={formData.destination}
                                onChange={(val) => setFormData(p => ({ ...p, destination: val }))}
                                onSelectCoords={(coords) => setFormData(p => ({ ...p, destinationCoords: coords }))}
                                placeholder="Type a city (e.g., Pune)"
                                style={inputStyle}
                            />
                        </div>
                        <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                            <MapPreview sourceCoords={formData.sourceCoords} destinationCoords={formData.destinationCoords} />
                        </div>
                        <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <button onClick={handleNext} className="button" style={{ backgroundColor: '#a855f7', padding: '10px 40px', color: 'white', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Next</button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <div style={{ backgroundColor: '#f0fdf4', padding: '15px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #22c55e' }}>
                            <p style={{ fontWeight: 'bold', color: '#166534' }}>Review Your Route</p>
                            <div style={{ display: 'flex', gap: '40px', marginTop: '5px', color: '#166534' }}>
                                <span><strong>From City</strong>: {formData.source}</span>
                                <span><strong>To City</strong>: {formData.destination}</span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '10px' }}>Select 4 Pickup Locations in {formData.source} *</h3>
                                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '15px' }}>Choose 4 areas where passengers can be picked up. All 4 are mandatory.</p>
                                {formData.pickupLocations.map((loc, idx) => (
                                    <div key={idx} className="form-group" style={{ marginBottom: '15px' }}>
                                        <label style={{ fontSize: '0.8rem', marginBottom: '5px', display: 'block' }}>Pickup Location {idx + 1} *</label>
                                        <LocationInput
                                            value={loc}
                                            onChange={(val) => handleLocationChange('pickupLocations', idx, val)}
                                            placeholder={`Search a place in ${formData.source}`}
                                            restrictedCity={formData.source}
                                            style={{ ...inputStyle, padding: '10px', fontSize: '0.85rem' }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '10px' }}>Select 4 Drop Locations in {formData.destination} *</h3>
                                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '15px' }}>Choose 4 areas where passengers can be dropped off. All 4 are mandatory.</p>
                                {formData.dropLocations.map((loc, idx) => (
                                    <div key={idx} className="form-group" style={{ marginBottom: '15px' }}>
                                        <label style={{ fontSize: '0.8rem', marginBottom: '5px', display: 'block' }}>Drop Location {idx + 1} *</label>
                                        <LocationInput
                                            value={loc}
                                            onChange={(val) => handleLocationChange('dropLocations', idx, val)}
                                            placeholder={`Search a place in ${formData.destination}`}
                                            restrictedCity={formData.destination}
                                            style={{ ...inputStyle, padding: '10px', fontSize: '0.85rem' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: '20px' }}>
                            <MapPreview sourceCoords={formData.sourceCoords} destinationCoords={formData.destinationCoords} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                            <button onClick={handleBack} className="button-secondary">Back</button>
                            <button onClick={handleNext} className="button" style={{ backgroundColor: '#22c55e', padding: '10px 40px', color: 'white', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Next</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <div style={{ backgroundColor: '#f0f9ff', padding: '15px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #3b82f6' }}>
                            <p style={{ fontWeight: 'bold', color: '#1e40af' }}>Review Your Route</p>
                            <div style={{ display: 'flex', gap: '40px', marginTop: '5px', color: '#1e40af' }}>
                                <span><strong>From</strong>: {formData.source}</span>
                                <span><strong>To</strong>: {formData.destination}</span>
                            </div>
                        </div>

                        <div style={{ backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', color: '#166534' }}>
                            <strong>Note:</strong> Your saved vehicle details will be automatically used for this ride.
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <MapPreview sourceCoords={formData.sourceCoords} destinationCoords={formData.destinationCoords} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                            <div className="form-group">
                                <label style={{ fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '5px', display: 'block' }}>Date *</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    min={getTomorrowDateString()}
                                    required
                                    style={{ padding: '8px', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '5px', display: 'block' }}>Time *</label>
                                <input type="time" name="time" value={formData.time} onChange={handleChange} required style={{ padding: '8px', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }} />
                            </div>
                            <div className="form-group">
                                <label style={{ fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '5px', display: 'block' }}>Available Seats *</label>
                                <input type="number" name="availableSeats" value={formData.availableSeats} onChange={handleChange} required min="1" max="10" style={{ padding: '8px', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }} />
                            </div>
                            <div className="form-group">
                                <label style={{ fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '5px', display: 'block' }}>Base Value (₹) *</label>
                                <input type="number" name="baseValue" value={formData.baseValue} onChange={handleChange} required step="0.01" placeholder="e.g. 1000.00" style={{ padding: '8px', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }} />
                            </div>
                            <div className="form-group">
                                <label style={{ fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '5px', display: 'block' }}>Per KM Rate (₹) *</label>
                                <input type="number" name="perKmRate" value={formData.perKmRate} onChange={handleChange} required step="0.01" placeholder="e.g. 10.50" style={{ padding: '8px', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }} />
                            </div>
                            <div className="form-group">
                                <label style={{ fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '5px', display: 'block' }}>
                                    Distance (KM) * {isCalculatingDistance && <span style={{ fontSize: '0.7rem', color: '#a855f7' }}>(Calculating...)</span>}
                                </label>
                                <input type="number" name="distance" value={formData.distance} onChange={handleChange} required step="0.01" placeholder="e.g. 500.5" style={{ padding: '8px', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button onClick={handleBack} className="button-secondary">Back</button>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={handleCancel} className="button-secondary">Cancel</button>
                                <button onClick={handleSubmit} className="button" style={{ backgroundColor: '#a855f7', padding: '10px 30px', color: 'white', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Post Ride</button>
                            </div>
                        </div>

                        <div style={{ textAlign: 'right', marginTop: '20px' }}>
                            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#64748b' }}>
                                Estimated Fare Per Seat: ₹{formData.price || '0.00'}
                            </div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#a855f7' }}>
                                Total Estimated Earnings: ₹{((parseFloat(formData.price) || 0) * (parseInt(formData.availableSeats) || 0)).toFixed(2)}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <NotificationModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    if (modalConfig.type === 'success') {
                        setActiveSection('my-rides');
                    }
                }}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
            />
        </div>
    );
};

export default CreateRide;
