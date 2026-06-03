import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddVehicleModal from './AddVehicleModal';
import VehicleDetailsModal from './VehicleDetailsModal';

const CompanyLogo = ({ company }) => {
    const [error, setError] = useState(false);

    const logoMap = {
        'mahindra': 'https://upload.wikimedia.org/wikipedia/commons/4/43/Mahindra_logo_new.svg',
        'rolls royce': 'https://upload.wikimedia.org/wikipedia/commons/3/33/Rolls-Royce_Motor_Cars_logo.svg',
        'rolls-royce': 'https://upload.wikimedia.org/wikipedia/commons/3/33/Rolls-Royce_Motor_Cars_logo.svg',
        'suzuki': 'https://upload.wikimedia.org/wikipedia/commons/1/12/Suzuki_logo_2.svg',
        'maruti suzuki': 'https://upload.wikimedia.org/wikipedia/commons/1/12/Suzuki_logo_2.svg',
        'honda': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Honda_Logo.svg',
        'toyota': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Toyota_carlogo.svg',
        'tata': 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Tata_logo.svg',
        'hyundai': 'https://upload.wikimedia.org/wikipedia/commons/4/44/Hyundai_Motor_Company_logo.svg',
        'ford': 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Ford_Motor_Company_Logo.svg',
        'chevrolet': 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Chevrolet_logo.png',
        'bmw': 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg',
        'mercedes': 'https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg',
        'mercedes benz': 'https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg',
        'audi': 'https://upload.wikimedia.org/wikipedia/commons/9/92/Audi-Logo_2016.svg',
        'kia': 'https://upload.wikimedia.org/wikipedia/commons/4/47/KIA_logo2.svg',
        'volkswagen': 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg',
        'renault': 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Renault_2021_Logo.svg',
        'skoda': 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Skoda_Auto_logo.svg',
        'nissan': 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Nissan_logo.png',
        'mg': 'https://upload.wikimedia.org/wikipedia/commons/2/22/MG_Motor_logo.svg',
        'jeep': 'https://upload.wikimedia.org/wikipedia/commons/0/05/Jeep_logo.svg'
    };

    const normalized = company.toLowerCase().trim();
    const domain = `${normalized.replace(/\s+/g, '')}.com`;
    const logoUrl = logoMap[normalized] || `https://logo.clearbit.com/${domain}`;

    return (
        <div style={{
            width: '36px', height: '36px',
            borderRadius: '50%', backgroundColor: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0,
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0'
        }}>
            {!error ? (
                <img
                    src={logoUrl}
                    alt={company}
                    style={{ width: '80%', height: '80%', objectFit: 'contain' }}
                    onError={() => setError(true)}
                />
            ) : (
                <span style={{ color: '#64748b', fontSize: '1rem', fontWeight: 'bold' }}>
                    {company.charAt(0).toUpperCase()}
                </span>
            )}
        </div>
    );
};

const VehicleList = () => {
    const [vehicles, setVehicles] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/vehicles/my-vehicles', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("DEBUG: Fetched vehicles:", response.data);
            setVehicles(response.data);
        } catch (error) {
            console.error("Error fetching vehicles", error);
        }
    };

    return (
        <>
            <div className="animate-fade-in" style={{
                background: 'var(--card-bg)',
                padding: '2rem',
                borderRadius: '1.5rem',
                border: '1px solid var(--glass-border)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ color: 'var(--text-main)' }}>Vehicle Details</h2>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="button button-success"
                        style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
                    >
                        + Add Vehicle
                    </button>
                </div>

                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem', marginTop: '1rem' }}>
                    <thead>
                        <tr>
                            <th>Company</th>
                            <th>Model</th>
                            <th>Vehicle No.</th>
                            <th>Color</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vehicles.length > 0 ? (
                            vehicles.map(vehicle => (
                                <tr key={vehicle.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <CompanyLogo company={vehicle.company} />
                                        {vehicle.company}
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-main)' }}>{vehicle.model}</td>
                                    <td style={{ padding: '1rem', color: 'var(--text-main)' }}>{vehicle.vehicleNumber}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            backgroundColor: 'var(--input-bg)',
                                            color: 'var(--text-main)',
                                            border: '1px solid var(--glass-border)',
                                            fontSize: '0.85rem'
                                        }}>
                                            {vehicle.color}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button
                                            onClick={() => setSelectedVehicle(vehicle)}
                                            className="button-secondary"
                                            style={{ padding: '0.4rem 1.2rem', fontSize: '0.8rem' }}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                    No vehicles found. Please add a vehicle to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isAddModalOpen && (
                <AddVehicleModal
                    onClose={() => setIsAddModalOpen(false)}
                    onVehicleAdded={fetchVehicles}
                />
            )}

            {selectedVehicle && (
                <VehicleDetailsModal
                    vehicle={selectedVehicle}
                    onClose={() => setSelectedVehicle(null)}
                />
            )}
        </>
    );
};

export default VehicleList;
