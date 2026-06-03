import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [resetLink, setResetLink] = useState('');
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Reset Password</h2>

                <form onSubmit={async (e) => {
                    e.preventDefault();
                    setMessage('Sending...');
                    setResetLink('');
                    try {
                        const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email })
                        });
                        const data = await response.json();

                        if (response.ok) {
                            setMessage('If an account exists for ' + email + ', a reset link has been sent to your email address!');
                        } else {
                            setMessage(data.message || 'Failed to send link');
                        }
                    } catch (err) {
                        console.error(err);
                        setMessage('Error connecting to server');
                    }
                }}>
                    <p style={{ marginBottom: '1.5rem', color: '#666', fontSize: '0.9rem' }}>
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="input-field"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    {message && (
                        <div style={{
                            marginTop: '1rem',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            backgroundColor: message.includes('sent') ? '#f0fdf4' : '#fef2f2',
                            color: message.includes('sent') ? '#166534' : '#991b1b',
                            fontSize: '0.85rem',
                            textAlign: 'center',
                            border: `1px solid ${message.includes('sent') ? '#bbf7d0' : '#fecaca'}`
                        }}>
                            {message}
                        </div>
                    )}
                    <button type="submit" className="button" style={{ width: '100%', marginTop: '1rem' }}>Send Reset Link</button>
                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <Link to="/login" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
