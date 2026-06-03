import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Phone, Mail, User, Info, MessageSquare, Paperclip, CheckCircle, Car } from 'lucide-react';
import NotificationModal from '../components/NotificationModal';

const Contact = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        queryType: 'General Question',
        subject: '',
        message: '',
        attachmentUrl: ''
    });

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [notification, setNotification] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'success'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'fullName') {
            // Only allow letters and spaces
            const lettersOnly = value.replace(/[^a-zA-Z\s]/g, '');
            setFormData({ ...formData, [name]: lettersOnly });
            return;
        }

        if (name === 'phoneNumber') {
            // Only allow digits and limit to 10
            const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
            setFormData({ ...formData, [name]: digitsOnly });
            return;
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check if it's an image
        if (!file.type.startsWith('image/')) {
            setNotification({
                isOpen: true,
                title: 'Invalid File Type',
                message: 'Please upload an image file (PNG, JPG, etc.).',
                type: 'error'
            });
            return;
        }

        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        try {
            const response = await fetch('http://localhost:8080/api/queries/upload', {
                method: 'POST',
                body: formDataUpload,
            });

            if (response.ok) {
                const data = await response.json();
                setFormData({ ...formData, attachmentUrl: data.url });
                setNotification({
                    isOpen: true,
                    title: 'Upload Successful',
                    message: 'Screenshot uploaded and attached to your query.',
                    type: 'success'
                });
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setNotification({
                isOpen: true,
                title: 'Upload Failed',
                message: 'Could not upload the screenshot. Please try again.',
                type: 'error'
            });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Final validation
        if (formData.phoneNumber.length !== 10) {
            setNotification({
                isOpen: true,
                title: 'Invalid Phone Number',
                message: 'Phone number must be exactly 10 digits.',
                type: 'error'
            });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:8080/api/queries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setNotification({
                    isOpen: true,
                    title: 'Query Submitted!',
                    message: 'Your message has been received. Our team will get back to you via email shortly.',
                    type: 'success'
                });
                setFormData({
                    fullName: '',
                    email: '',
                    phoneNumber: '',
                    queryType: 'General Question',
                    subject: '',
                    message: '',
                    attachmentUrl: ''
                });
            } else {
                throw new Error('Failed to submit query');
            }
        } catch (error) {
            setNotification({
                isOpen: true,
                title: 'Submission Failed',
                message: 'Something went wrong. Please try again later.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contact-page" style={{ padding: '2rem 1rem', background: 'var(--page-special-bg)', minHeight: '100vh' }}>
            <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        padding: '0.4rem 1.2rem',
                        background: 'rgba(59, 130, 246, 0.1)',
                        borderRadius: '2rem',
                        color: 'var(--primary-color)',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                        marginBottom: '1rem',
                        letterSpacing: '1px'
                    }}>
                        SUPPORT CENTER
                    </div>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', fontWeight: '900', color: 'var(--text-main)', marginBottom: '1rem' }}>
                        Questions? Reach Out!
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        Need help with a booking or have a suggestion? We're here to help you 24/7.
                    </p>
                </div>

                <div className="card interactive-card" style={{ padding: 'clamp(1.5rem, 5vw, 3rem)', borderRadius: '2rem', position: 'relative', overflow: 'hidden' }}>
                    {/* Background decoration */}
                    <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)', zIndex: 0 }}></div>

                    <form onSubmit={handleSubmit} className="grid-responsive" style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

                        <div className="input-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                <User size={16} /> Full Name
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                placeholder="e.g. John Doe"
                                className="input-field"
                                style={{ margin: 0, padding: '1rem' }}
                            />
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                <Mail size={16} /> Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="john@example.com"
                                className="input-field"
                                style={{ margin: 0, padding: '1rem' }}
                            />
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                <Phone size={16} /> Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                required
                                placeholder="+1 (555) 000-0000"
                                className="input-field"
                                style={{ margin: 0, padding: '1rem' }}
                            />
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                <Info size={16} /> Query Type
                            </label>
                            <select
                                name="queryType"
                                value={formData.queryType}
                                onChange={handleChange}
                                className="input-field"
                                style={{ margin: 0, padding: '1rem', appearance: 'none', background: 'var(--input-bg)' }}
                            >
                                <option value="Ride Booking Issue">Ride Booking Issue</option>
                                <option value="Payment Problem">Payment Problem</option>
                                <option value="Driver Complaint">Driver Complaint</option>
                                <option value="Technical Issue">Technical Issue</option>
                                <option value="General Question">General Question</option>
                            </select>
                        </div>

                        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                <Info size={16} /> Subject
                            </label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                placeholder="Summarize your issue"
                                className="input-field"
                                style={{ margin: 0, padding: '1rem' }}
                            />
                        </div>

                        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                <MessageSquare size={16} /> Message / Description
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                placeholder="Describe your issue in detail..."
                                rows="4"
                                className="input-field"
                                style={{ margin: 0, padding: '1rem', resize: 'none' }}
                            ></textarea>
                        </div>

                        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                <Paperclip size={16} /> Attachment <span style={{ fontWeight: '400', color: 'var(--text-muted)', fontSize: '0.8rem' }}>(Upload Screenshot)</span>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="input-field"
                                    style={{
                                        margin: 0,
                                        padding: '0.6rem 1rem',
                                        opacity: uploading ? 0.5 : 1,
                                        cursor: uploading ? 'wait' : 'pointer',
                                        height: 'auto'
                                    }}
                                    disabled={uploading}
                                />
                                {uploading && (
                                    <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', fontSize: '0.8rem' }}>
                                        <div className="upload-spinner" style={{ width: '12px', height: '12px', border: '2px solid rgba(59, 130, 246, 0.3)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                        Uploading...
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                            <button
                                type="submit"
                                disabled={loading}
                                className="button"
                                style={{
                                    width: '100%',
                                    padding: '1.1rem',
                                    fontSize: '1.1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '1rem'
                                }}
                            >
                                {loading ? 'Submitting...' : 'Submit Message'}
                                <Send size={18} />
                            </button>
                        </div>
                    </form>
                </div>

                <div className="grid-responsive" style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <Mail color="var(--primary-color)" size={24} />
                        </div>
                        <h3 style={{ marginBottom: '0.4rem', fontSize: '1.1rem' }}>Email Us</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>support@rideshare.com</p>
                    </div>
                    <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <Phone color="#10b981" size={24} />
                        </div>
                        <h3 style={{ marginBottom: '0.4rem', fontSize: '1.1rem' }}>Call Us</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>+1 (888) 123-4567</p>
                    </div>
                    <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                        <div style={{ background: 'rgba(244, 114, 182, 0.1)', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <CheckCircle color="#f472b6" size={24} />
                        </div>
                        <h3 style={{ marginBottom: '0.4rem', fontSize: '1.1rem' }}>24/7 Support</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Always here for you</p>
                    </div>
                </div>
            </div>

            <NotificationModal
                isOpen={notification.isOpen}
                onClose={() => setNotification({ ...notification, isOpen: false })}
                title={notification.title}
                message={notification.message}
                type={notification.type}
            />
        </div>
    );
};

export default Contact;
