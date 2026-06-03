import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles, MapPin, Car, ShieldCheck, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ChatBot = () => {
    const { user } = useAuth();
    const { isDarkMode } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your Smart Ride Sharing Assistant. I specialize in helping you navigate our platform. How can I assist you today?", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const knowledgeBase = [
        {
            keywords: ['book', 'find', 'search', 'get a ride', 'passenger'],
            response: "To book a ride, ensure you're logged in as a **Passenger**. Head over to the 'Ride Search' page, enter your destination and date, then click 'Book Now' on your preferred option! You can manage your trips in 'My Bookings'."
        },
        {
            keywords: ['post', 'create', 'offer', 'drive', 'share ride'],
            response: "To share your ride, login as a **Driver** and visit 'Post Ride'. Enter your travel details like origin, destination, time, and available seats. Once posted, you can manage requests in 'My Rides'."
        },
        {
            keywords: ['smart ride sharing', 'what is', 'how it works', 'concept'],
            response: "Smart Ride Sharing is a dynamic carpooling platform that connects drivers with empty seats to commuters heading the same way. It's designed to reduce traffic, lower carbon footprints, and save you money!"
        },
        {
            keywords: ['register', 'sign up', 'join', 'account'],
            response: "Joining is easy! Click 'Register' in the top menu. You can choose to be a **Driver** (if you have a car) or a **Passenger**. Follow the multi-step form to verify your profile."
        },
        {
            keywords: ['contact', 'support', 'help', 'email', 'problem'],
            response: "Our support team is here for you! You can reach us at **support@smartridesharing.com** or visit the 'Contact' page to send a direct message to our admins."
        },
        {
            keywords: ['safety', 'secure', 'trust', 'verify', 'inspection'],
            response: "Safety is our #1 priority. Every driver undergoes a verified vehicle inspection, and we have a robust rating system to build community trust. You can view driver ratings before booking."
        },
        {
            keywords: ['price', 'cost', 'pay', 'money', 'fare'],
            response: "Ride prices are set by drivers and are often split among passengers to make travel cost-effective. We use formula-based calculations to suggest fair pricing based on distance and demand."
        },
        {
            keywords: ['admin', 'dashboard', 'monitor'],
            response: "The Admin Dashboard allows our team to monitor all rides, manage user verifications, and ensure the platform runs smoothly. If you have admin access, you'll see it in your sidebar."
        },
        {
            keywords: ['hello', 'hi', 'hey', 'greetings'],
            response: "Hi there! I'm the Smart Ride Sharing Assistant. I can help you with booking rides, posting trips, or understanding how our platform works. What's on your mind?"
        }
    ];

    const getBotResponse = (userInput) => {
        const inputLower = userInput.toLowerCase();

        // Check for off-topic queries first
        const websiteTerms = ['ride', 'share', 'car', 'pool', 'travel', 'book', 'driver', 'passenger', 'route', 'destination', 'smart', 'account', 'login', 'register', 'profile', 'price', 'help', 'support', 'admin', 'dashboard', 'hello', 'hi'];
        const isRelated = websiteTerms.some(term => inputLower.includes(term));

        if (!isRelated && inputLower.length > 10) {
            return "I apologize, but I am specifically trained to assist with **Smart Ride Sharing** platform queries only. For other topics, I recommend using a general search engine. How can I help you with your rides today?";
        }

        // Role-based context
        if (inputLower.includes('my role') || inputLower.includes('who am i') || inputLower.includes('my profile')) {
            return user ? `Currently, you are logged in as a **${user.role}** (${user.name}). You have access to ${user.role === 'DRIVER' ? 'posting rides and managing passengers' : 'searching and booking shared rides'}.` : "You are currently browsing as a guest. Please login to access personalized features like booking or posting rides!";
        }

        // Search knowledge base
        for (const entry of knowledgeBase) {
            if (entry.keywords.some(kw => inputLower.includes(kw))) {
                return entry.response;
            }
        }

        return "That's an interesting question! While I'm still learning, I can definitely help with: \n• How to **book a ride**\n• How to **post a ride**\n• Our **safety features**\n• **Contacting support**\n\nTry rephrasing or asking about one of these topics!";
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg = input.trim();
        const newUserMessage = { id: Date.now(), text: userMsg, sender: 'user' };
        setMessages([...messages, newUserMessage]);
        setInput('');
        setIsTyping(true);

        // Simulate AI thinking time
        setTimeout(() => {
            const botResponse = { id: Date.now() + 1, text: getBotResponse(userMsg), sender: 'bot' };
            setMessages(prev => [...prev, botResponse]);
            setIsTyping(false);
        }, 800 + Math.random() * 1000);
    };

    const suggestions = [
        { icon: <MapPin size={14} />, text: "How to book a ride?" },
        { icon: <Car size={14} />, text: "How to post a ride?" },
        { icon: <ShieldCheck size={14} />, text: "Is it safe?" }
    ];

    return (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 1000 }}>
            {/* Chat Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '20px',
                    backgroundColor: 'var(--primary-color)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 15px 30px -5px rgba(37, 99, 235, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    transform: isOpen ? 'rotate(90deg)' : 'none'
                }}
                className="hover-scale"
                title="Help Assistant"
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={30} />}
                {!isOpen && (
                    <div style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        width: '20px',
                        height: '20px',
                        background: 'var(--accent-error)',
                        borderRadius: '50%',
                        border: '3px solid white',
                        animation: 'pulse 2s infinite'
                    }} />
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    bottom: '85px',
                    right: 0,
                    width: '400px',
                    height: '580px',
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '2rem',
                    boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    border: '1px solid var(--glass-border)',
                    backdropFilter: 'blur(20px)',
                    animation: 'slide-up 0.4s ease-out'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '1.5rem',
                        background: 'var(--primary-gradient)',
                        color: 'white',
                        position: 'relative'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '45px',
                                height: '45px',
                                background: 'rgba(255,255,255,0.2)',
                                borderRadius: '15px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backdropFilter: 'blur(10px)'
                            }}>
                                <Bot size={26} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700' }}>Smart Ride Sharing Assistant</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
                                    <div style={{ width: '8px', height: '8px', background: '#34d399', borderRadius: '50%' }}></div>
                                    <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>Optimized for your safety</span>
                                </div>
                            </div>
                        </div>
                        <Sparkles size={20} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', opacity: 0.6 }} />
                    </div>

                    {/* Messages Area */}
                    <div style={{
                        flex: 1,
                        padding: '1.5rem',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem',
                        backgroundColor: 'var(--bg-main)',
                        backgroundImage: 'radial-gradient(circle at 50% 50%, var(--input-bg) 0%, transparent 100%)'
                    }}>
                        {messages.map(msg => (
                            <div key={msg.id} style={{
                                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '85%',
                                display: 'flex',
                                gap: '0.75rem',
                                flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
                            }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '10px',
                                    background: msg.sender === 'user' ? 'var(--secondary-color)' : 'var(--primary-color)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    flexShrink: 0,
                                    marginTop: 'auto'
                                }}>
                                    {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div style={{
                                    padding: '1rem',
                                    borderRadius: msg.sender === 'user' ? '1.25rem 1.25rem 0.2rem 1.25rem' : '1.25rem 1.25rem 1.25rem 0.2rem',
                                    backgroundColor: msg.sender === 'user' ? 'var(--primary-color)' : 'var(--card-bg)',
                                    color: msg.sender === 'user' ? 'white' : 'var(--text-main)',
                                    fontSize: '0.92rem',
                                    lineHeight: '1.5',
                                    boxShadow: msg.sender === 'user' ? '0 10px 15px -3px rgba(37, 99, 235, 0.2)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                    border: msg.sender === 'user' ? 'none' : '1px solid var(--glass-border)',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '0.75rem' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                    <Bot size={16} />
                                </div>
                                <div className="typing-indicator" style={{ display: 'flex', gap: '4px', padding: '1rem', borderRadius: '1.25rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}>
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestions */}
                    {messages.length < 3 && !isTyping && (
                        <div style={{ padding: '0 1rem 0.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', backgroundColor: 'var(--bg-main)' }}>
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInput(s.text)}
                                    style={{
                                        padding: '0.5rem 0.8rem',
                                        borderRadius: '0.8rem',
                                        border: '1px solid var(--glass-border)',
                                        backgroundColor: 'var(--card-bg)',
                                        color: 'var(--text-muted)',
                                        fontSize: '0.8rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap'
                                    }}
                                    className="hover-scale"
                                >
                                    {s.icon} {s.text}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <form onSubmit={handleSend} style={{
                        padding: '1.25rem',
                        backgroundColor: 'var(--card-bg)',
                        borderTop: '1px solid var(--glass-border)',
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'center'
                    }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <input
                                type="text"
                                placeholder="Ask about rides, safety, or support..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.9rem 1.2rem',
                                    paddingRight: '3rem',
                                    borderRadius: '1.2rem',
                                    border: '1.5px solid var(--glass-border)',
                                    backgroundColor: 'var(--input-bg)',
                                    color: 'var(--text-main)',
                                    outline: 'none',
                                    fontSize: '0.9rem',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                            />
                            <HelpCircle size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', opacity: 0.5 }} />
                        </div>
                        <button
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '15px',
                                backgroundColor: input.trim() ? 'var(--primary-color)' : 'var(--text-muted)',
                                color: 'white',
                                border: 'none',
                                cursor: input.trim() ? 'pointer' : 'default',
                                display: 'flex',
                                alignItems: 'center',
                                justifyCenter: 'center',
                                transition: 'all 0.2s',
                                boxShadow: input.trim() ? '0 8px 15px -3px rgba(37, 99, 235, 0.3)' : 'none'
                            }}
                        >
                            <Send size={20} style={{ margin: '0 auto' }} />
                        </button>
                    </form>
                </div>
            )}

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0; }
                    100% { transform: scale(1); opacity: 0; }
                }
                @keyframes slide-up {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .typing-indicator span {
                    width: 6px;
                    height: 6px;
                    background-color: var(--text-muted);
                    border-radius: 50%;
                    animation: bounce 1.4s infinite ease-in-out both;
                    opacity: 0.6;
                }
                .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
                .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }
                .hover-scale:hover { transform: scale(1.05); }
                .hover-scale:active { transform: scale(0.95); }
            `}</style>
        </div>
    );
};

export default ChatBot;

