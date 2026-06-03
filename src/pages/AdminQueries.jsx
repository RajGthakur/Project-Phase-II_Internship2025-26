import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Car, Clock, CheckCircle, XCircle, Search, Bell, LayoutDashboard, Settings, FileText, DollarSign, Briefcase, TrendingUp, Star, MessageSquare, Mail, Phone, Send, Paperclip, User, Info } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import NotificationModal from '../components/NotificationModal';

const AdminQueries = () => {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedQuery, setSelectedQuery] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [notification, setNotification] = useState({ isOpen: false, title: '', message: '', type: 'success' });

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin-dashboard' },
        { id: 'users', label: 'Manage Users', icon: <Users size={20} />, path: '/admin-dashboard' },
        { id: 'approvals', label: 'Pending User Approvals', icon: <CheckCircle size={20} />, path: '/admin-dashboard' },
        { id: 'queries', label: 'Support Queries', icon: <MessageSquare size={20} />, path: '/admin-queries' },
        { id: 'business', label: 'Business Overview', icon: <Briefcase size={20} />, path: '/admin-dashboard' },
        { id: 'reports', label: 'Reports', icon: <FileText size={20} />, path: '/admin-dashboard' },
    ];

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchQueries();
    }, [token]);

    const fetchQueries = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/queries', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setQueries(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            }
        } catch (error) {
            console.error('Error fetching queries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        setSendingReply(true);
        try {
            const response = await fetch(`http://localhost:8080/api/queries/${selectedQuery.id}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ response: replyText })
            });

            if (response.ok) {
                const updatedQuery = await response.json();
                setQueries(queries.map(q => q.id === updatedQuery.id ? updatedQuery : q));
                setSelectedQuery(updatedQuery);
                setReplyText('');
                setNotification({
                    isOpen: true,
                    title: 'Reply Sent!',
                    message: 'The user has been notified via email.',
                    type: 'success'
                });
            }
        } catch (error) {
            setNotification({
                isOpen: true,
                title: 'Error',
                message: 'Failed to send reply.',
                type: 'error'
            });
        } finally {
            setSendingReply(false);
        }
    };

    const filteredQueries = queries.filter(q => {
        const matchesSearch = q.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.subject.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'ALL' || q.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return '#f59e0b';
            case 'RESOLVED': return '#10b981';
            case 'CLOSED': return '#ef4444';
            default: return 'var(--text-muted)';
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--page-special-bg)' }}>
            <Sidebar
                menuItems={menuItems}
                activeSection="queries"
                onMenuClick={() => { }}
                isCollapsed={sidebarCollapsed}
                toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            <main className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`} style={{ flex: 1, padding: '2rem', marginLeft: sidebarCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <MessageSquare size={32} color="var(--primary-color)" /> Support Queries
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage and respond to user queries from the platform.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '1.5rem', height: '80vh', minHeight: '700px' }}>

                    {/* Left Panel: Query List */}
                    <div className="card" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%', background: 'var(--card-bg)', borderRadius: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--glass-border)', background: 'var(--page-special-bg)' }}>
                            <div className="search-container" style={{ position: 'relative', marginBottom: '1rem' }}>
                                <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="input-field"
                                    style={{ margin: 0, paddingLeft: '2.5rem', width: '100%', background: 'var(--input-bg)', height: '40px', fontSize: '0.9rem' }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                {['ALL', 'PENDING', 'RESOLVED'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        style={{
                                            padding: '0.4rem 0.5rem',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            background: filterStatus === status ? 'var(--primary-color)' : 'var(--card-bg)',
                                            color: filterStatus === status ? 'white' : 'var(--text-muted)',
                                            border: filterStatus === status ? 'none' : '1px solid var(--glass-border)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            flex: 1
                                        }}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ overflowY: 'auto', flex: 1, padding: '0.5rem' }}>
                            {loading ? (
                                <div style={{ padding: '2rem', textAlign: 'center' }}>
                                    <div className="upload-spinner" style={{ width: '24px', height: '24px', border: '2px solid rgba(59, 130, 246, 0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem' }}></div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Loading...</p>
                                </div>
                            ) : filteredQueries.length === 0 ? (
                                <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                                    <MessageSquare size={32} style={{ opacity: 0.1, marginBottom: '0.5rem' }} />
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No results.</p>
                                </div>
                            ) : (
                                filteredQueries.map(query => (
                                    <div
                                        key={query.id}
                                        onClick={() => setSelectedQuery(query)}
                                        style={{
                                            padding: '1rem',
                                            borderRadius: '0.75rem',
                                            cursor: 'pointer',
                                            background: selectedQuery?.id === query.id ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                                            marginBottom: '0.25rem',
                                            transition: 'all 0.2s',
                                            border: selectedQuery?.id === query.id ? '1px solid rgba(59, 130, 246, 0.1)' : '1px solid transparent'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', alignItems: 'center' }}>
                                            <span style={{
                                                fontSize: '0.65rem',
                                                padding: '0.15rem 0.5rem',
                                                borderRadius: '0.5rem',
                                                fontWeight: '800',
                                                background: getStatusColor(query.status) + '15',
                                                color: getStatusColor(query.status)
                                            }}>{query.status}</span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(query.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.2rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{query.subject}</h4>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{query.fullName}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Query Details & Reply */}
                    <div className="card" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%', background: 'var(--card-bg)', borderRadius: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid var(--glass-border)' }}>
                        {selectedQuery ? (
                            <>
                                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--glass-border)', background: 'var(--card-bg)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>{selectedQuery.subject}</h2>
                                        <div style={{
                                            padding: '0.4rem 1rem',
                                            borderRadius: '0.75rem',
                                            background: getStatusColor(selectedQuery.status) + '15',
                                            color: getStatusColor(selectedQuery.status),
                                            fontWeight: '800',
                                            fontSize: '0.75rem'
                                        }}>
                                            {selectedQuery.status}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                            <User size={14} /> <span style={{ fontWeight: '600' }}>{selectedQuery.fullName}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                            <Mail size={14} /> <span style={{ fontWeight: '600' }}>{selectedQuery.email}</span>
                                        </div>
                                        {selectedQuery.rideId && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary-color)', fontSize: '0.8rem' }}>
                                                <Car size={14} /> <span style={{ fontWeight: '700' }}>Ride: #{selectedQuery.rideId}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: 'var(--page-special-bg)' }}>
                                    <div style={{ background: 'var(--card-bg)', padding: '1.25rem', borderRadius: '1rem', border: '1px solid var(--glass-border)', marginBottom: '1.5rem' }}>
                                        <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--primary-color)', marginBottom: '0.75rem', letterSpacing: '0.5px' }}>MESSAGE CONTENT</div>
                                        <p style={{ lineHeight: '1.6', color: 'var(--text-main)', fontSize: '1rem', whiteSpace: 'pre-wrap' }}>{selectedQuery.message}</p>
                                    </div>

                                    {selectedQuery.attachmentUrl && (
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--primary-color)', marginBottom: '0.75rem', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Paperclip size={14} /> SCREENSHOT ATTACHMENT
                                            </div>
                                            <div style={{
                                                background: 'var(--card-bg)',
                                                padding: '0.75rem',
                                                borderRadius: '1rem',
                                                border: '1px solid var(--glass-border)',
                                                maxWidth: '450px'
                                            }}>
                                                <a href={selectedQuery.attachmentUrl} target="_blank" rel="noreferrer" style={{ display: 'block', borderRadius: '0.5rem', overflow: 'hidden', position: 'relative' }}>
                                                    <img
                                                        src={selectedQuery.attachmentUrl}
                                                        alt="Attachment"
                                                        style={{ width: '100%', height: 'auto', maxHeight: '300px', objectFit: 'contain', display: 'block' }}
                                                    />
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: 0, left: 0, right: 0,
                                                        background: 'rgba(0,0,0,0.6)',
                                                        color: 'white',
                                                        padding: '0.5rem',
                                                        textAlign: 'center',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600'
                                                    }}>
                                                        View Full Resolution
                                                    </div>
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {selectedQuery.adminResponse && (
                                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1.25rem', borderRadius: '1rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                            <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--accent-success)', marginBottom: '0.75rem', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <CheckCircle size={14} /> ADMIN RESOLUTION
                                            </div>
                                            <p style={{ lineHeight: '1.6', color: 'var(--text-main)', fontSize: '1rem', whiteSpace: 'pre-wrap' }}>{selectedQuery.adminResponse}</p>
                                        </div>
                                    )}
                                </div>

                                {selectedQuery.status === 'PENDING' && (
                                    <div style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)', background: 'var(--card-bg)' }}>
                                        <form onSubmit={handleReply}>
                                            <div style={{ marginBottom: '1rem' }}>
                                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Reply to User</label>
                                                <textarea
                                                    placeholder="Enter response..."
                                                    className="input-field"
                                                    style={{ margin: 0, padding: '1rem', resize: 'none', minHeight: '100px', border: '2px solid var(--glass-border)', fontSize: '0.95rem' }}
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    required
                                                ></textarea>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={sendingReply}
                                                className="button"
                                                style={{
                                                    width: '100%',
                                                    height: '50px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.75rem',
                                                    fontSize: '1rem',
                                                    fontWeight: '700',
                                                    background: 'var(--primary-color)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '0.75rem',
                                                    cursor: sendingReply ? 'wait' : 'pointer'
                                                }}
                                            >
                                                {sendingReply ? (
                                                    <>
                                                        <div className="upload-spinner" style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        Resolve Query & Send Email
                                                        <Send size={18} />
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>
                                <MessageSquare size={48} color="var(--primary-color)" style={{ opacity: 0.1, marginBottom: '1rem' }} />
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)' }}>Select a query</h3>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Notification Modal */}
            {notification.isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        background: 'var(--card-bg)',
                        padding: '2.5rem',
                        borderRadius: '2rem',
                        width: '90%',
                        maxWidth: '450px',
                        textAlign: 'center',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: notification.type === 'success' ? '#ecfdf5' : '#fef2f2',
                            color: notification.type === 'success' ? '#10b981' : '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem'
                        }}>
                            {notification.type === 'success' ? <CheckCircle size={40} /> : <MessageSquare size={40} />}
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem' }}>{notification.title}</h2>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>{notification.message}</p>
                        <button
                            onClick={() => setNotification({ ...notification, isOpen: false })}
                            className="button"
                            style={{ width: '100%', padding: '1rem' }}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminQueries;
