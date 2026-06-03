import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const VehicleDetailsModal = ({ vehicle, onClose }) => {
    const [activeTab, setActiveTab] = useState('details');
    const { isDarkMode } = useTheme();

    const tabStyle = (tabName) => ({
        padding: '10px 20px',
        cursor: 'pointer',
        borderBottom: activeTab === tabName ? '3px solid var(--primary-color)' : 'none',
        fontWeight: activeTab === tabName ? '700' : '500',
        color: activeTab === tabName ? 'var(--primary-color)' : 'var(--text-muted)',
        transition: 'all 0.3s ease'
    });

    const getImageUrl = (filename) => {
        return filename ? `http://localhost:8080/uploads/${filename}` : 'https://via.placeholder.com/300';
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-main)',
                padding: '30px',
                borderRadius: '1.5rem',
                width: '650px',
                maxHeight: '90vh',
                overflowY: 'auto',
                border: '1px solid var(--glass-border)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(20px)',
                position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.025em' }}>
                        Vehicle Info: <span style={{ color: 'var(--primary-color)' }}>{vehicle.company} {vehicle.model}</span>
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            cursor: 'pointer',
                            border: 'none',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-main)',
                            fontSize: '1.25rem',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    >
                        &times;
                    </button>
                </div>

                <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', marginBottom: '25px' }}>
                    <div onClick={() => setActiveTab('details')} style={tabStyle('details')}>Details</div>
                    <div onClick={() => setActiveTab('images')} style={tabStyle('images')}>Images</div>
                    <div onClick={() => setActiveTab('documents')} style={tabStyle('documents')}>Documents</div>
                </div>

                <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                    {activeTab === 'details' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 30px' }}>
                            {[
                                { label: 'Company', value: vehicle.company },
                                { label: 'Model', value: vehicle.model },
                                { label: 'Number', value: vehicle.vehicleNumber },
                                { label: 'Color', value: vehicle.color },
                                { label: 'Year', value: vehicle.manufacturingYear },
                                { label: 'Driven', value: `${vehicle.kmDriven} KM` },
                                { label: 'RC Number', value: vehicle.rcNumber },
                                { label: 'Insurance', value: vehicle.insuranceDetails },
                                { label: 'AC', value: vehicle.hasAc ? 'Yes' : 'No' },
                                { label: 'Audio', value: vehicle.hasAudioSystem ? 'Yes' : 'No' },
                                { label: 'Capacity', value: vehicle.capacity },
                            ].map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</span>
                                    <span style={{ fontSize: '1.05rem', fontWeight: '500' }}>{item.value || 'N/A'}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'images' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {vehicle.carImageUrls && vehicle.carImageUrls.length > 0 ? (
                                vehicle.carImageUrls.map((url, index) => (
                                    <div key={index} style={{
                                        borderRadius: '1rem',
                                        overflow: 'hidden',
                                        border: '1px solid var(--glass-border)',
                                        background: 'rgba(0,0,0,0.05)'
                                    }}>
                                        <img
                                            src={getImageUrl(url)}
                                            alt={`Vehicle ${index + 1}`}
                                            style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                                        />
                                        <p style={{ padding: '10px', fontSize: '0.85rem', textAlign: 'center', color: 'var(--text-muted)' }}>Image {index + 1}</p>
                                    </div>
                                ))
                            ) : (
                                <div style={{
                                    gridColumn: 'span 2',
                                    textAlign: 'center',
                                    padding: '60px 20px',
                                    color: 'var(--text-muted)',
                                    background: 'rgba(0,0,0,0.02)',
                                    borderRadius: '1rem'
                                }}>
                                    <p style={{ fontSize: '1.1rem' }}>No images available.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            <div style={{ background: 'rgba(0,0,0,0.02)', padding: '20px', borderRadius: '1rem', border: '1px solid var(--glass-border)' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', fontWeight: '700' }}>RC Document</h3>
                                <img src={getImageUrl(vehicle.rcImageUrl)} alt="RC" style={{ width: '100%', borderRadius: '0.75rem', border: '1px solid var(--glass-border)' }} />
                            </div>
                            <div style={{ background: 'rgba(0,0,0,0.02)', padding: '20px', borderRadius: '1rem', border: '1px solid var(--glass-border)' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', fontWeight: '700' }}>Insurance Document</h3>
                                <img src={getImageUrl(vehicle.insuranceImageUrl)} alt="Insurance" style={{ width: '100%', borderRadius: '0.75rem', border: '1px solid var(--glass-border)' }} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VehicleDetailsModal;
