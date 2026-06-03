import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer style={{ background: '#1e293b', color: '#f8fafc', paddingTop: '4rem', paddingBottom: '2rem', borderTop: 'none', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)' }}>
            <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>

                {/* Brand & Desc */}
                <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>Smart Ride Sharing</h3>
                    <p style={{ lineHeight: '1.6', color: '#cbd5e1' }}>
                        The smartest way to travel. Reliable, safe, and affordable rides at your fingertips. Join our community today.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 style={{ color: 'white', marginBottom: '1rem', fontWeight: '600' }}>Quick Links</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: '0.5rem' }}><Link to="/" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Home</Link></li>
                        <li style={{ marginBottom: '0.5rem' }}><Link to="/about" style={{ color: '#cbd5e1', textDecoration: 'none' }}>About Us</Link></li>
                        <li style={{ marginBottom: '0.5rem' }}><Link to="/login" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Login</Link></li>
                        <li style={{ marginBottom: '0.5rem' }}><Link to="/register" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Register</Link></li>
                        <li style={{ marginBottom: '0.5rem' }}><Link to="/contact" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Contact Us</Link></li>
                    </ul>
                </div>

                {/* Contact Info */}
                <div>
                    <h4 style={{ color: 'white', marginBottom: '1rem', fontWeight: '600' }}>Contact Us</h4>
                    <ul style={{ listStyle: 'none', padding: 0, color: '#cbd5e1' }}>
                        <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Mail size={16} color="#60a5fa" /> support@smartridesharing.com
                        </li>
                        <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Phone size={16} color="#60a5fa" /> +1 (555) 123-4567
                        </li>
                        <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapPin size={16} color="#60a5fa" /> 123 Ride Request Blvd, Tech City
                        </li>
                    </ul>
                </div>

                {/* Socials */}
                <div>
                    <h4 style={{ color: 'white', marginBottom: '1rem', fontWeight: '600' }}>Follow Us</h4>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <a href="#" style={{ color: '#cbd5e1' }}><Facebook size={20} /></a>
                        <a href="#" style={{ color: '#cbd5e1' }}><Twitter size={20} /></a>
                        <a href="#" style={{ color: '#cbd5e1' }}><Instagram size={20} /></a>
                        <a href="#" style={{ color: '#cbd5e1' }}><Linkedin size={20} /></a>
                    </div>
                </div>
            </div>

            <div style={{ borderTop: '1px solid #334155', paddingTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: '#94a3b8' }}>
                <p>&copy; {new Date().getFullYear()} Smart Ride Sharing. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
