import React, { useState } from 'react';
import { HelpCircle, PlayCircle, User, Car, ChevronDown, CheckCircle } from 'lucide-react';

const FAQs = () => {
    const [activeTab, setActiveTab] = useState('support'); // 'support' or 'walkthrough'
    const [activeWalkthrough, setActiveWalkthrough] = useState('passenger'); // 'passenger' or 'driver'
    const [expandedQuestion, setExpandedQuestion] = useState(null);

    const supportQuestions = [
        { id: 1, question: "How do I create an account?", answer: "Click the Register button in the menu and follow the step-by-step instructions for your role." },
        { id: 2, question: "Is Smart Ride Sharing safe?", answer: "Yes, we verify all driver documents and offer real-time tracking for every ride." },
        { id: 3, question: "How do I pay for a ride?", answer: "Payments are handled securely through our integrated digital payment gateway." },
        { id: 4, question: "Can I cancel a booking?", answer: "Yes, you can cancel from your dashboard, subject to our cancellation policy." },
        { id: 5, question: "What if I lose an item during a ride?", answer: "Contact our support team immediately with your ride details for assistance." },
        { id: 6, question: "How are ride prices calculated?", answer: "Prices are based on distance, estimated time, and vehicle category selected." },
        { id: 7, question: "Can I book a ride in advance?", answer: "Yes, our platform allows you to schedule rides for future dates and times." }
    ];

    const walkthroughVideos = {
        passenger: [
            { id: 1, title: "How to Register as a Passenger ?", src: "/videos/walkthrough/passenger/FinalPassengerVdo_FAQs.mp4" },
            { id: 2, title: "How to Reset Password for Passenger ?", src: "/videos/walkthrough/passenger/FinalResetPasswordVdo_FAQs.mp4" }
        ],
        driver: [
            { id: 1, title: "How to Register as a Driver ?", src: "/videos/walkthrough/driver/FinalDriverVdo_FAQs.mp4" },
            { id: 2, title: "How to Reset Password for Driver ?", src: "/videos/walkthrough/driver/FinalResetPasswordVdo_FAQs.mp4" }
        ]
    };

    const toggleQuestion = (id) => {
        setExpandedQuestion(expandedQuestion === id ? null : id);
    };

    return (
        <div style={{
            minHeight: '100vh',
            padding: '4rem 2rem',
            background: 'var(--bg-gradient)',
            color: 'var(--text-main)'
        }}>
            <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--primary-color)' }}>
                        How can we help you?
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                        Find answers to common questions or watch our platform walkthroughs.
                    </p>
                </header>

                {/* Main Tabs */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '1rem',
                    marginBottom: '3rem',
                    padding: '0.5rem',
                    background: 'var(--card-bg)',
                    borderRadius: '1rem',
                    border: '1px solid var(--glass-border)',
                    backdropFilter: 'blur(10px)',
                    width: 'fit-content',
                    margin: '0 auto 3rem auto'
                }}>
                    <button
                        onClick={() => setActiveTab('support')}
                        style={{
                            padding: '0.75rem 2rem',
                            borderRadius: '0.75rem',
                            border: 'none',
                            background: activeTab === 'support' ? 'var(--primary-gradient)' : 'transparent',
                            color: activeTab === 'support' ? 'white' : 'var(--text-main)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <HelpCircle size={20} />
                        Support Questions
                    </button>
                    <button
                        onClick={() => setActiveTab('walkthrough')}
                        style={{
                            padding: '0.75rem 2rem',
                            borderRadius: '0.75rem',
                            border: 'none',
                            background: activeTab === 'walkthrough' ? 'var(--primary-gradient)' : 'transparent',
                            color: activeTab === 'walkthrough' ? 'white' : 'var(--text-main)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <PlayCircle size={20} />
                        Platform Walkthrough
                    </button>
                </div>

                {/* Content Sections */}
                <div className="animate-fade-in" key={activeTab}>
                    {activeTab === 'support' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {supportQuestions.map((q) => (
                                <div
                                    key={q.id}
                                    style={{
                                        background: 'var(--card-bg)',
                                        borderRadius: '1rem',
                                        padding: '1.5rem',
                                        border: '1px solid var(--glass-border)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        boxShadow: expandedQuestion === q.id ? '0 10px 25px rgba(0,0,0,0.1)' : 'none'
                                    }}
                                    onClick={() => toggleQuestion(q.id)}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>{q.question}</h3>
                                        <ChevronDown
                                            size={20}
                                            style={{
                                                transform: expandedQuestion === q.id ? 'rotate(180deg)' : 'rotate(0deg)',
                                                transition: 'transform 0.3s ease',
                                                color: 'var(--primary-color)'
                                            }}
                                        />
                                    </div>
                                    {expandedQuestion === q.id && (
                                        <div style={{
                                            marginTop: '1rem',
                                            paddingTop: '1rem',
                                            borderTop: '1px solid var(--glass-border)',
                                            color: 'var(--text-muted)',
                                            lineHeight: '1.6'
                                        }}>
                                            {q.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div>
                            {/* Walkthrough Sub-tabs */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '2rem',
                                marginBottom: '3rem'
                            }}>
                                <div
                                    onClick={() => setActiveWalkthrough('passenger')}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        cursor: 'pointer',
                                        opacity: activeWalkthrough === 'passenger' ? 1 : 0.5,
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '50%',
                                        background: activeWalkthrough === 'passenger' ? 'var(--primary-gradient)' : 'var(--card-bg)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: activeWalkthrough === 'passenger' ? 'white' : 'var(--text-main)',
                                        boxShadow: activeWalkthrough === 'passenger' ? '0 8px 20px rgba(59, 130, 246, 0.3)' : 'none'
                                    }}>
                                        <User size={32} />
                                    </div>
                                    <span style={{ fontWeight: '700', fontSize: '1rem' }}>Passenger</span>
                                </div>

                                <div
                                    onClick={() => setActiveWalkthrough('driver')}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        cursor: 'pointer',
                                        opacity: activeWalkthrough === 'driver' ? 1 : 0.5,
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '50%',
                                        background: activeWalkthrough === 'driver' ? 'var(--primary-gradient)' : 'var(--card-bg)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: activeWalkthrough === 'driver' ? 'white' : 'var(--text-main)',
                                        boxShadow: activeWalkthrough === 'driver' ? '0 8px 20px rgba(59, 130, 246, 0.3)' : 'none'
                                    }}>
                                        <Car size={32} />
                                    </div>
                                    <span style={{ fontWeight: '700', fontSize: '1rem' }}>Driver</span>
                                </div>
                            </div>

                            {/* Video Grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: '2rem'
                            }}>
                                {walkthroughVideos[activeWalkthrough].map((video) => (
                                    <div
                                        key={`${activeWalkthrough}-${video.id}`}
                                        style={{
                                            background: 'var(--card-bg)',
                                            borderRadius: '1.5rem',
                                            overflow: 'hidden',
                                            border: '1px solid var(--glass-border)',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                                        }}
                                    >
                                        <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
                                            <video
                                                controls
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%'
                                                }}
                                            >
                                                <source src={video.src} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                        </div>
                                        <div style={{ padding: '1.5rem' }}>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>{video.title}</h4>
                                            <div style={{
                                                marginTop: '0.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                fontSize: '0.85rem',
                                                color: 'var(--text-muted)'
                                            }}>
                                                <CheckCircle size={14} style={{ color: 'var(--accent-success)' }} />
                                                Verified Tutorial
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Placeholder for more videos */}
                                <div style={{
                                    border: '2px dashed var(--glass-border)',
                                    borderRadius: '1.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '2rem',
                                    textAlign: 'center',
                                    minHeight: '250px',
                                    color: 'var(--text-muted)'
                                }}>
                                    <PlayCircle size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                    <p>More videos coming soon!</p>
                                    {/* <p style={{ fontSize: '0.8rem' }}>Add your .mp4 files to:<br /><code>/public/videos/walkthrough/{activeWalkthrough}/</code></p> */}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }
            `}} />
        </div>
    );
};

export default FAQs;
