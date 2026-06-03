import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NotificationModal from './NotificationModal';
import { useTheme } from '../context/ThemeContext';

const AddVehicleModal = ({ onClose, onVehicleAdded }) => {
    const { isDarkMode } = useTheme();
    const [formData, setFormData] = useState({
        company: '',
        model: '',
        manufacturingYear: '',
        rcNumber: '',
        insuranceDetails: '',
        hasAc: false,
        hasAudioSystem: false,
        kmDriven: '',
        color: '',
        vehicleNumber: '',
        driverName: '',
        capacity: ''
    });

    const [files, setFiles] = useState({
        carImages: [],
        rcImage: null,
        insuranceImage: null
    });
    const [previews, setPreviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showNotify, setShowNotify] = useState(false);
    const [notifyConfig, setNotifyConfig] = useState({ title: '', message: '', type: 'error' });

    // Cleanup object URLs to avoid memory leaks
    useEffect(() => {
        return () => {
            previews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previews]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'driverName' || name === 'company' || name === 'color') {
            // Only letters and spaces allowed
            if (value !== '' && !/^[a-zA-Z\s]+$/.test(value)) {
                return;
            }
        }

        if (name === 'kmDriven') {
            // Only digits allowed
            if (value !== '' && !/^\d+$/.test(value)) {
                return;
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const { name, files: selectedFiles } = e.target;
        if (name === 'carImages') {
            const newFiles = Array.from(selectedFiles);
            const totalFiles = files.carImages.length + newFiles.length;

            if (totalFiles > 5) {
                setNotifyConfig({
                    title: 'Limit Exceeded',
                    message: `You can upload a maximum of 5 images. You currently have ${files.carImages.length} and are trying to add ${newFiles.length} more.`,
                    type: 'error'
                });
                setShowNotify(true);
                return;
            }

            setFiles(prev => ({
                ...prev,
                carImages: [...prev.carImages, ...newFiles]
            }));

            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        } else {
            setFiles(prev => ({
                ...prev,
                [name]: selectedFiles[0]
            }));
        }
    };

    const removeImage = (index) => {
        URL.revokeObjectURL(previews[index]);
        setFiles(prev => ({
            ...prev,
            carImages: prev.carImages.filter((_, i) => i !== index)
        }));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const requiredFields = ['company', 'model', 'manufacturingYear', 'rcNumber', 'insuranceDetails', 'kmDriven', 'color', 'vehicleNumber', 'driverName', 'capacity'];

        for (const field of requiredFields) {
            if (!formData[field] || formData[field].toString().trim() === '') {
                setNotifyConfig({
                    title: 'Missing Information',
                    message: 'Please fill out all mandatory text fields.',
                    type: 'error'
                });
                setShowNotify(true);
                return;
            }
        }

        if (files.carImages.length === 0) {
            setNotifyConfig({
                title: 'Missing Information',
                message: 'Please select at least one car image.',
                type: 'error'
            });
            setShowNotify(true);
            return;
        }

        if (!files.rcImage || !files.insuranceImage) {
            setNotifyConfig({
                title: 'Missing Information',
                message: 'Please upload both RC and Insurance documents.',
                type: 'error'
            });
            setShowNotify(true);
            return;
        }

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'kmDriven' && formData[key]) {
                // Ensure " Km" is appended if not already present
                const value = formData[key].toString();
                const formattedValue = value.toLowerCase().endsWith('km') ? value : `${value} Km`;
                data.append(key, formattedValue);
            } else {
                data.append(key, formData[key]);
            }
        });

        files.carImages.forEach(image => {
            data.append('carImages', image);
        });

        if (files.rcImage) data.append('rcImage', files.rcImage);
        if (files.insuranceImage) data.append('insuranceImage', files.insuranceImage);

        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8080/api/vehicles', data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setNotifyConfig({
                title: 'Success!',
                message: 'Your vehicle has been added successfully.',
                type: 'success'
            });
            setShowNotify(true);

            setTimeout(() => {
                onVehicleAdded();
                onClose();
            }, 1500);
        } catch (error) {
            console.error("Error adding vehicle", error);
            const errorMessage = error.response?.data?.message || error.response?.data || error.message || "Failed to add vehicle";
            setNotifyConfig({
                title: 'Registration Failed',
                message: errorMessage,
                type: 'error'
            });
            setShowNotify(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            zIndex: 1000,
            backdropFilter: 'blur(8px)',
            padding: '20px'
        }}>
            <div className="modal-content" style={{
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-main)',
                padding: '30px',
                borderRadius: '1.5rem',
                width: '100%',
                maxWidth: '700px',
                maxHeight: '90vh',
                overflowY: 'auto',
                border: '1px solid var(--glass-border)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(20px)',
                position: 'relative'
            }}>
                <style>{`
                    .interactive-input {
                        padding: 12px 16px;
                        border: 1px solid var(--glass-border);
                        border-radius: 8px;
                        transition: all 0.3s ease;
                        outline: none;
                        background-color: var(--input-bg, rgba(255,255,255,0.05));
                        width: 100%;
                        box-sizing: border-box;
                        font-size: 0.95rem;
                        color: var(--text-main);
                    }
                    .interactive-input::placeholder {
                        color: var(--text-muted);
                        opacity: 0.6;
                    }
                    .interactive-input:focus {
                        border-color: var(--primary-color);
                        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
                        background-color: var(--card-bg);
                    }
                    .interactive-input:hover:not(:focus) {
                        border-color: var(--primary-color);
                        opacity: 0.9;
                    }
                    .interactive-checkbox {
                        width: 18px;
                        height: 18px;
                        accent-color: var(--primary-color);
                        cursor: pointer;
                        transition: transform 0.2s ease;
                    }
                    .interactive-checkbox:hover {
                        transform: scale(1.1);
                    }
                    .interactive-button {
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-weight: 600;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        border: none;
                        cursor: pointer;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: 8px;
                    }
                    .interactive-button.primary {
                        background: var(--primary-gradient);
                        color: white;
                    }
                    .interactive-button.primary:hover:not(:disabled) {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
                        filter: brightness(1.1);
                    }
                    .interactive-button.secondary {
                        background-color: var(--input-bg);
                        color: var(--text-main);
                        border: 1px solid var(--glass-border);
                    }
                    .interactive-button.secondary:hover {
                        background-color: var(--glass-border);
                    }
                    .interactive-button:active:not(:disabled) {
                        transform: translateY(0);
                    }
                    .interactive-button:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                    }
                    .file-input-wrapper {
                        position: relative;
                        padding: 24px;
                        border: 2px dashed var(--glass-border);
                        border-radius: 12px;
                        text-align: center;
                        background-color: var(--input-bg);
                        transition: all 0.3s ease;
                        cursor: pointer;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                    }
                    .file-input-wrapper:hover {
                        border-color: var(--primary-color);
                        background-color: rgba(59, 130, 246, 0.05);
                    }
                    .file-input-wrapper input[type="file"] {
                        position: absolute;
                        top: 0; left: 0; width: 100%; height: 100%;
                        opacity: 0;
                        cursor: pointer;
                    }
                    .file-input-wrapper .icon {
                        font-size: 24px;
                        color: var(--text-muted);
                        transition: color 0.3s ease;
                    }
                    .file-input-wrapper:hover .icon {
                        color: var(--primary-color);
                    }
                    .modal-content {
                        animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
                    @keyframes slideUp {
                        from { opacity: 0; transform: translateY(30px) scale(0.95); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                    }
                    .form-group {
                        display: flex;
                        flex-direction: column;
                        gap: 6px;
                    }
                    .form-label {
                        font-size: 0.85rem;
                        font-weight: 600;
                        color: var(--text-muted);
                        margin-left: 4px;
                    }
                `}</style>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--glass-border)' }}>
                    <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: '700' }}>Add New Vehicle</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#ef4444'} onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                    <div className="form-group">
                        <label className="form-label">Company</label>
                        <input name="company" className="interactive-input" placeholder="e.g. Suzuki (Letters only)" value={formData.company} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Model</label>
                        <input name="model" className="interactive-input" placeholder="e.g. Baleno" value={formData.model} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Driver Name</label>
                        <input name="driverName" className="interactive-input" placeholder="Letters only" value={formData.driverName} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Vehicle Number</label>
                        <input name="vehicleNumber" className="interactive-input" placeholder="e.g. MH31 BA4253" value={formData.vehicleNumber} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Color</label>
                        <input name="color" className="interactive-input" placeholder="Letters only" value={formData.color} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Manufacturing Year</label>
                        <input name="manufacturingYear" className="interactive-input" type="number" placeholder="e.g. 2020" value={formData.manufacturingYear} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Kilometers Driven</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                name="kmDriven"
                                className="interactive-input"
                                placeholder="e.g. 15000"
                                value={formData.kmDriven}
                                onChange={handleChange}
                                required
                                style={{ paddingRight: '45px' }}
                            />
                            <span style={{
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#94a3b8',
                                fontWeight: '700',
                                fontSize: '0.9rem',
                                pointerEvents: 'none'
                            }}>Km</span>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">RC Number</label>
                        <input name="rcNumber" className="interactive-input" placeholder="Registration Certificate Number" value={formData.rcNumber} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Insurance Details</label>
                        <input name="insuranceDetails" className="interactive-input" placeholder="Insurance Policy Details" value={formData.insuranceDetails} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Seating Capacity</label>
                        <input name="capacity" className="interactive-input" type="number" placeholder="Total seats available" value={formData.capacity} onChange={handleChange} required />
                    </div>

                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', gridColumn: 'span 2', padding: '12px 16px', backgroundColor: 'var(--input-bg)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                        <span className="form-label" style={{ margin: 0 }}>Features:</span>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500', color: 'var(--text-main)' }}>
                            <input type="checkbox" name="hasAc" className="interactive-checkbox" checked={formData.hasAc} onChange={handleChange} /> AC
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500', color: 'var(--text-main)' }}>
                            <input type="checkbox" name="hasAudioSystem" className="interactive-checkbox" checked={formData.hasAudioSystem} onChange={handleChange} /> Audio System
                        </label>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Car Image(s) (1 to 5 max)</label>
                        <div className="file-input-wrapper">
                            <span className="icon">📷</span>
                            <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>Click or drag images to upload</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Supports JPG, PNG (Max 5MB)</span>
                            <input type="file" name="carImages" onChange={handleFileChange} multiple required />
                        </div>

                        {previews.length > 0 && (
                            <div style={{
                                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                                gap: '12px', marginTop: '16px', padding: '16px',
                                background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px'
                            }}>
                                {previews.map((url, index) => (
                                    <div key={index} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                        <img src={url} alt={`Preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'} onMouseOut={(e) => e.target.style.transform = 'scale(1)'} />
                                        <button type="button" onClick={() => removeImage(index)} style={{ position: 'absolute', top: '6px', right: '6px', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.95)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'background-color 0.2s', boxShadow: '0 2px 4px rgba(0,0_0,0.2)' }} onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'} onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.95)'}>
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {files.carImages.length > 0 && (
                            <div style={{ fontSize: '0.85rem', color: '#10b981', marginTop: '8px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span>✓</span> {files.carImages.length} image(s) selected
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>RC Document Image</label>
                        <div className="file-input-wrapper" style={{ padding: '16px' }}>
                            <span className="icon" style={{ fontSize: '20px' }}>📄</span>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '500' }}>{files.rcImage ? files.rcImage.name : 'Upload RC Image'}</span>
                            <input type="file" name="rcImage" onChange={handleFileChange} required />
                        </div>
                    </div>

                    <div>
                        <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Insurance Document</label>
                        <div className="file-input-wrapper" style={{ padding: '16px' }}>
                            <span className="icon" style={{ fontSize: '20px' }}>🛡️</span>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '500' }}>{files.insuranceImage ? files.insuranceImage.name : 'Upload Insurance'}</span>
                            <input type="file" name="insuranceImage" onChange={handleFileChange} required />
                        </div>
                    </div>

                    <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
                        <button type="button" onClick={onClose} disabled={isLoading} className="interactive-button secondary">
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading} className="interactive-button primary">
                            {isLoading ? (
                                <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>↻</span> Saving Vehicle...</>
                            ) : 'Add Vehicle'}
                        </button>
                    </div>
                    <style>{`
                        @keyframes spin { 100% { transform: rotate(360deg); } }
                    `}</style>
                </form>
            </div>
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

export default AddVehicleModal;
