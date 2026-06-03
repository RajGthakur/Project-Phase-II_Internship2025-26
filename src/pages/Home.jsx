import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Clock, DollarSign, MapPin, Car, Navigation, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import NotificationModal from '../components/NotificationModal';

const Home = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [notification, setNotification] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'success'
    });

    const images = [
        "/assets/hero.png",
        "/assets/mockup.png",
        "/assets/travelers.png"
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000); // Change image every 5 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section style={{
                position: 'relative',
                textAlign: 'center',
                padding: '6rem 1rem', // Increased padding
                color: 'white',
                overflow: 'hidden',
                borderRadius: '0 0 3rem 3rem', // More pronounced radius
                marginBottom: '0',
                minHeight: '75vh', // Increased from 60vh
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
            }}>
                {/* Sliding Background Images */}
                {images.map((img, index) => (
                    <div key={index} style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.8)), url(${img})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: currentImageIndex === index ? 1 : 0,
                        zIndex: -1,
                        transform: currentImageIndex === index ? 'scale(1.05)' : 'scale(1)',
                        transition: 'all 2s ease-in-out'
                    }} />
                ))}

                {/* Floating Background Elements */}
                <div className="floating" style={{ position: 'absolute', top: '15%', left: '10%', opacity: 0.3 }}>
                    <Car size={140} color="#3b82f6" />
                </div>
                <div className="floating floating-delay-1" style={{ position: 'absolute', top: '25%', right: '12%', opacity: 0.3 }}>
                    <MapPin size={110} color="#ef4444" />
                </div>
                <div className="floating floating-delay-2" style={{ position: 'absolute', bottom: '25%', left: '15%', opacity: 0.3 }}>
                    <Navigation size={90} color="#10b981" />
                </div>

                <div style={{ position: 'relative', zIndex: 10, maxWidth: '900px' }}>
                    <div style={{
                        display: 'inline-block',
                        padding: '0.5rem 1.5rem',
                        background: 'rgba(59, 130, 246, 0.2)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '2rem',
                        border: '1px solid rgba(255,255,255,0.2)',
                        marginBottom: '2rem',
                        animation: 'slideIn 1s ease-out'
                    }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '700', letterSpacing: '2px', color: '#93c5fd' }}>SMART RIDE SHARING</span>
                    </div>
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 8vw, 5rem)', // Responsive font size
                        marginBottom: '1.5rem',
                        fontWeight: '900',
                        lineHeight: '1.1',
                        textShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        background: 'linear-gradient(to right, #ffffff, #93c5fd, #c4b5fd)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        animation: 'fadeIn 1s ease-out'
                    }}>
                        Your Ride, Your Choice
                    </h1>
                    <p style={{
                        fontSize: 'clamp(1rem, 3vw, 1.4rem)',
                        color: '#cbd5e1',
                        maxWidth: '750px',
                        margin: '0 auto 3rem',
                        lineHeight: '1.6',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        animation: 'fadeIn 1.5s ease-out'
                    }}>
                        Join thousands of travelers who trust Smart Ride Sharing for their daily commute.
                        Safe, efficient, and interactive platform designed for you.
                    </p>

                    <button
                        onClick={() => navigate(user ? (user.role === 'ADMIN' ? '/admin-dashboard' : '/dashboard') : '/login')}
                        className="button"
                        style={{
                            padding: '1rem 2rem', // Smaller padding for mobile
                            fontSize: '1.1rem',
                            fontWeight: '800',
                            borderRadius: '4rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '1rem',
                            animation: 'pulse-glow 2s infinite'
                        }}
                    >
                        {user ? 'Open Dashboard' : 'Get Started Now'}
                        <Navigation size={20} style={{ transform: 'rotate(45deg)' }} />
                    </button>
                </div>
            </section>

            {/* Marquee Section */}
            <div className="marquee-container">
                <div className="marquee-content">
                    <span><Car size={30} /> Smart Ride Sharing 2026</span>
                    <span><Shield size={30} /> Secure & Verified Platform</span>
                    <span><DollarSign size={30} /> Best Price Guaranteed</span>
                    <span><MapPin size={30} /> Real-time Tracking</span>
                    <span><Clock size={30} /> 24/7 Premium Support</span>
                    <span><Car size={30} /> Join The Future of Mobility</span>
                    <span><Navigation size={30} /> Interactive User Dashboard</span>
                </div>
            </div>

            {/* Features Section */}
            <section className="container" style={{ padding: '4rem 2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '800', color: 'var(--text-main)' }}>Why Choose Us?</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Experience features that make every ride unforgettable.</p>
                </div>
                <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
                    <div className="card interactive-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                            <Shield size={40} color="#3b82f6" />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>Zero Compromise Safety</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>AI-driven driver verification and end-to-end encryption for every trip data.</p>
                    </div>
                    <div className="card interactive-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'rgba(244, 114, 182, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                            <Clock size={40} color="#f472b6" />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>Smart Scheduling</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>Post or find rides in seconds. Our interactive map shows you the best matches in real-time.</p>
                    </div>
                    <div className="card interactive-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                            <DollarSign size={40} color="#10b981" />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>Dynamic Fare System</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>Fair pricing for both drivers and passengers. Transparent transactions with no hidden fees.</p>
                    </div>
                </div>
            </section>

            {/* Interactive Image Showcase */}
            <section className="container" style={{ padding: '4rem 1rem' }}>
                <div className="card interactive-card grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '2rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>Experience the Innovation</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
                            Our interactive platform isn't just about moving from A to B. It's about a seamless digital experience that brings people together.
                            From detailed driver statistics for admins to beautiful activity charts for users, we've thought of everything.
                        </p>
                        <ul style={{ listStyle: 'none', padding: '0' }}>
                            {['Real-time Ride Tracking', 'Interactive Admin Analytics', 'Advanced Rating System', 'Instant Payment Confirmation'].map((item, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', fontWeight: '600' }}>
                                    <CheckCircle size={20} color="#10b981" /> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div style={{ position: 'relative', minHeight: '400px' }}>
                        <img
                            src="/assets/mockup.png"
                            alt="Interface Mockup"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                filter: 'brightness(0.9)'
                            }}
                        />
                        <div style={{ position: 'absolute', bottom: '2rem', right: '2rem', background: 'var(--card-bg)', backdropFilter: 'blur(10px)', padding: '1.5rem', borderRadius: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', maxWidth: '250px', border: '1px solid var(--glass-border)' }}>
                            <p style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: '800', marginBottom: '0.5rem' }}>ACTIVE RIDE PROTECTED</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Secure payment processing with Stripe active.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Query Section */}
            <section className="container" style={{ paddingBottom: '4rem' }}>
                <div className="card about-card interactive-card" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', padding: '2rem' }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '1rem', fontWeight: '800', background: 'linear-gradient(to right, var(--primary-color), var(--accent-success))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Questions? Reach Out!
                    </h2>
                    <p style={{ marginBottom: '2rem', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        Our team is available 24/7 to ensure your experience on Smart Ride Sharing is perfect.
                    </p>

                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <Link to="/contact" className="button" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '1rem',
                            fontSize: '1.25rem',
                            padding: '1.25rem 3rem',
                            borderRadius: '1.5rem',
                            textDecoration: 'none'
                        }}>
                            <Navigation size={24} style={{ transform: 'rotate(90deg)' }} /> Contact Support Team
                        </Link>
                        <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '1rem' }}>
                            Our team is available 24/7 to ensure your experience on Smart Ride Sharing is perfect.
                        </p>
                    </div>
                </div>
            </section>

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

export default Home;
