import React from 'react';
import { Users, Globe, Award, Heart, CheckCircle } from 'lucide-react';

const About = () => {
    const images = {
        concept: "/assets/images/concept.png",
        community: "/assets/images/community.png",
        fleet: "/assets/images/fleet.png",
        experience: "/assets/images/experience.png"
    };

    return (
        <div className="container animate-fade-in" style={{ padding: '6rem 2rem' }}>
            {/* Hero Section */}
            <div style={{ textAlign: 'center', marginBottom: '8rem' }}>
                <h1 style={{ fontSize: '4.5rem', fontWeight: '800', marginBottom: '1.5rem', letterSpacing: '-2px', color: 'var(--primary-color)' }}>
                    Revolutionizing <span style={{ color: 'var(--text-main)' }}>Ride-Sharing</span>
                </h1>
                <p style={{ fontSize: '1.4rem', color: 'var(--text-muted)', maxWidth: '900px', margin: '0 auto', lineHeight: '1.6' }}>
                    Building a dynamic carpooling ecosystem that prioritizes safety, sustainability, and community trust. Connecting people, reducing emissions, and redefining urban mobility.
                </p>
            </div>

            {/* Alternating Section 1: Concept */}
            <div className="about-section" style={{ display: 'flex', alignItems: 'center', gap: '4rem', marginBottom: '10rem' }}>
                <div style={{ flex: 1 }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'rgba(37, 99, 235, 0.1)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '2rem'
                    }}>
                        <Globe size={45} color="var(--primary-color)" />
                    </div>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: '700' }}>Smart City Connectivity</h2>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '2rem' }}>
                        Our platform uses advanced route-matching algorithms to minimize wait times and maximize efficiency. Whether you're commuting to work or heading out for a weekend getaway, we ensure you find the perfect ride in seconds.
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--text-main)', fontWeight: '500' }}>
                            <CheckCircle size={28} color="var(--accent-success)" /> Real-time tracking and ETAs
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)', fontWeight: '500' }}>
                            <CheckCircle size={28} color="var(--accent-success)" /> AI-powered dynamic pricing
                        </li>
                    </ul>
                </div>
                <div style={{ flex: 1.2 }}>
                    <div className="card" style={{ padding: '0.5rem', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}>
                        <img
                            src={images.concept}
                            alt="Ride-Share Concept"
                            style={{ width: '100%', height: 'auto', borderRadius: '1.25rem', display: 'block' }}
                        />
                    </div>
                </div>
            </div>

            {/* Alternating Section 2: Fleet */}
            <div className="about-section reverse" style={{ display: 'flex', alignItems: 'center', gap: '6rem', marginBottom: '10rem' }}>
                <div style={{ flex: 1 }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'rgba(79, 70, 229, 0.1)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '2rem'
                    }}>
                        <Award size={45} color="var(--secondary-color)" />
                    </div>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: '700' }}>Premium Fleet</h2>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '2rem' }}>
                        Travel in style and comfort. Our community of drivers use modern, well-maintained vehicles to ensure every journey is a premium experience. We prioritize cleanliness, safety, and a smooth ride every time.
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--glass-border)' }}>
                            <div style={{ fontWeight: '700', color: 'var(--primary-color)' }}>Safety First</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Verified Inspections</div>
                        </div>
                        <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--glass-border)' }}>
                            <div style={{ fontWeight: '700', color: 'var(--primary-color)' }}>Pure Comfort</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Top-tier AC & Audio</div>
                        </div>
                    </div>
                </div>
                <div style={{ flex: 1.2 }}>
                    <div className="card" style={{ padding: '0.5rem', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}>
                        <img
                            src={images.fleet}
                            alt="Modern Fleet"
                            style={{ width: '100%', height: 'auto', borderRadius: '1.25rem', display: 'block' }}
                        />
                    </div>
                </div>
            </div>

            {/* Alternating Section 3: Community */}
            <div className="about-section" style={{ display: 'flex', alignItems: 'center', gap: '6rem', marginBottom: '10rem' }}>
                <div style={{ flex: 1 }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '2rem'
                    }}>
                        <Users size={45} color="var(--accent-success)" />
                    </div>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: '700' }}>Built on Trust</h2>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '2rem' }}>
                        We're more than just an app; we're a community. Every driver is thoroughly vetted, and every passenger is part of our trusted network. Share the journey, share the stories, and make new connections along the way.
                    </p>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary-color)' }}>10k+</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Active Users</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary-color)' }}>4.9/5</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Avg. Rating</div>
                        </div>
                    </div>
                </div>
                <div style={{ flex: 1.2 }}>
                    <div className="card" style={{ padding: '0.5rem', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}>
                        <img
                            src={images.community}
                            alt="Carpooling Community"
                            style={{ width: '100%', height: 'auto', borderRadius: '1.25rem', display: 'block' }}
                        />
                    </div>
                </div>
            </div>

            {/* Alternating Section 4: Experience */}
            <div className="about-section reverse" style={{ display: 'flex', alignItems: 'center', gap: '6rem', marginBottom: '10rem' }}>
                <div style={{ flex: 1 }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '2rem'
                    }}>
                        <Heart size={45} color="var(--accent-error)" />
                    </div>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: '700' }}>The Ride-Sharing Experience</h2>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '2rem' }}>
                        Forget the stress of public transport or the cost of solo driving. Experience carpooling as it should be: friendly, reliable, and cost-effective. Meet great people while reducing your carbon footprint.
                    </p>
                    <div style={{ borderLeft: '4px solid var(--primary-color)', paddingLeft: '1.5rem', fontStyle: 'italic', color: 'var(--text-main)', fontSize: '1.1rem' }}>
                        "Smart Ride Sharing has completely changed my daily commute. I've met wonderful friends and saved so much on fuel!" – Happy User
                    </div>
                </div>
                <div style={{ flex: 1.2 }}>
                    <div className="card" style={{ padding: '0.5rem', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}>
                        <img
                            src={images.experience}
                            alt="Carpooling Experience"
                            style={{ width: '100%', height: 'auto', borderRadius: '1.25rem', display: 'block' }}
                        />
                    </div>
                </div>
            </div>

            {/* Call to Action Card */}
            <div style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                borderRadius: '2.5rem',
                padding: '5rem 3rem',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.3)'
            }}>
                {/* Decorative gradients */}
                <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)' }}></div>
                <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%)' }}></div>

                <Heart size={80} color="var(--accent-error)" style={{ marginBottom: '2rem' }} />
                <h2 style={{ fontSize: '3rem', fontWeight: '800', color: 'white', marginBottom: '1.5rem', letterSpacing: '-1px' }}>
                    Join the Smart Ride Sharing Family
                </h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
                    Ready to transform how you travel? Start your carpooling journey today and be part of the future of transportation.
                </p>
            </div>
        </div>
    );
};

export default About;
