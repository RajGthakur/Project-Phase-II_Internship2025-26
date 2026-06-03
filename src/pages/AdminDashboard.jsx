import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Car, Clock, CheckCircle, XCircle, Search, Bell, LayoutDashboard, Settings, FileText, DollarSign, Briefcase, TrendingUp, Star, MessageSquare } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Sidebar from '../components/Sidebar';
import VehicleDetailsModal from '../components/VehicleDetailsModal';
import NotificationModal from '../components/NotificationModal';
import CarLoader from '../components/CarLoader';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [pendingVehicles, setPendingVehicles] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeRides: 0,
        pendingApprovals: 0,
        totalRevenue: 0
    });
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
    const [activeSection, setActiveSection] = useState(sessionStorage.getItem('adminActiveSection') || 'dashboard');
    const [businessData, setBusinessData] = useState({
        driverStats: [],
        passengerStats: [],
        chartData: []
    });
    const [businessTab, setBusinessTab] = useState('drivers');

    // Notification Modal State
    const [notification, setNotification] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'success'
    });

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });

    const { token, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        // Basic role check - detailed check on backend
        if (user && user.role !== 'ADMIN') {
            setError("Access Denied: You are not an Admin.");
            setLoading(false);
            return;
        }
        fetchData();
    }, [token, user, navigate]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const headers = { 'Authorization': `Bearer ${token}` };

            const [usersRes, statsRes, transRes, businessRes] = await Promise.all([
                fetch('http://localhost:8080/api/admin/users', { headers }),
                fetch('http://localhost:8080/api/admin/stats', { headers }),
                fetch('http://localhost:8080/api/admin/transactions', { headers }),
                fetch('http://localhost:8080/api/admin/business-overview', { headers })
            ]);

            if (!usersRes.ok) throw new Error(`Users API failed: ${usersRes.status}`);
            if (!statsRes.ok) throw new Error(`Stats API failed: ${statsRes.status}`);
            if (!transRes.ok) throw new Error(`Transactions API failed: ${transRes.status}`);
            if (!businessRes.ok) throw new Error(`Business API failed: ${businessRes.status}`);

            const allUsers = await usersRes.json();
            setUsers(allUsers);
            setPendingUsers(allUsers.filter(u => u.status === 'PENDING'));
            setTransactions(await transRes.json());
            setStats(await statsRes.json());
            setBusinessData(await businessRes.json());

        } catch (error) {
            console.error("Error fetching admin data", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUserAction = (userId, action) => {
        setConfirmModal({
            isOpen: true,
            title: action === 'approve' ? 'Confirm Approval' : 'Confirm Deactivation',
            message: `Are you sure you want to ${action === 'approve' ? 'approve' : 'deactivate'} this user? ${action === 'deactivate' ? 'They will no longer be able to log in.' : ''}`,
            onConfirm: () => performUserAction(userId, action)
        });
    };

    const [actionLoading, setActionLoading] = useState(false);

    const performUserAction = async (userId, action) => {
        setConfirmModal(p => ({ ...p, isOpen: false }));
        setActionLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/api/admin/${action}/${userId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setNotification({
                    isOpen: true,
                    title: 'Action Successful',
                    message: `User ${action === 'approve' ? 'approved' : 'deactivated'} successfully.`,
                    type: 'success'
                });
                fetchData();
            } else {
                setNotification({
                    isOpen: true,
                    title: 'Action Failed',
                    message: 'The requested action could not be completed. Please try again.',
                    type: 'error'
                });
            }
        } catch (error) {
            console.error(error);
            setNotification({
                isOpen: true,
                title: 'Error',
                message: 'A network error occurred. Please try again.',
                type: 'error'
            });
        } finally {
            setActionLoading(false);
        }
    };


    if (loading && !stats.totalUsers) return (
        <CarLoader text="Loading Admin Dashboard" subtext="Preparing your statistics and data" />
    );
    if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>;

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'users', label: 'Manage Users', icon: <Users size={20} /> },
        { id: 'approvals', label: 'Pending User Approvals', icon: <CheckCircle size={20} /> },
        { id: 'queries', label: 'Support Queries', icon: <MessageSquare size={20} />, path: '/admin-queries' },
        { id: 'business', label: 'Business Overview', icon: <Briefcase size={20} /> },
        { id: 'reports', label: 'Reports', icon: <FileText size={20} /> },
    ];

    const handleSidebarClick = (section) => {
        setActiveSection(section);
        sessionStorage.setItem('adminActiveSection', section);
        setSidebarMobileOpen(false);
    };

    const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
        <div className="card tooltip-container" style={{ display: 'flex', flexDirection: 'column', height: '160px', justifyContent: 'space-between', borderLeft: `4px solid ${color}` }}>
            <span className="tooltip-text">{title}: {value}</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</h3>
                    <p style={{ 
                        fontSize: value && value.toString().length > 10 ? '1.5rem' : '2rem', 
                        fontWeight: 'bold', 
                        color: 'var(--text-main)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>{value}</p>
                </div>
                <div style={{ padding: '0.75rem', borderRadius: '0.75rem', backgroundColor: `${color}20`, color: color, flexShrink: 0 }}>
                    <Icon size={24} />
                </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: subtext.includes('Action') ? 'var(--accent-error)' : 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {subtext}
            </p>
        </div>
    );


    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar
                menuItems={menuItems}
                activeSection={activeSection}
                onMenuClick={handleSidebarClick}
                isCollapsed={sidebarCollapsed}
                toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                mobileOpen={sidebarMobileOpen}
            />

            {/* Global background loader - only show on mount if no data, or when explicitly performing an action */}
            {loading && !stats.totalUsers && (
                <CarLoader 
                    text="Initializing Admin Panel" 
                    subtext="Connecting to Smart Ride Sharing backend..." 
                />
            )}

            {/* Processing Action Loader - only show when performing a specific action that modifies state */}
            {actionLoading && (
                <CarLoader 
                    text="Processing Action" 
                    subtext="Updating database and notifying users..." 
                />
            )}


            {/* Mobile Sidebar Overlay */}
            {sidebarMobileOpen && (
                <div 
                    className="mobile-only"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 999
                    }}
                    onClick={() => setSidebarMobileOpen(false)}
                />
            )}

            <div className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`} style={{ flex: 1, marginLeft: sidebarCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)' }}>
                {/* Header */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button 
                            className="mobile-only"
                            onClick={() => setSidebarMobileOpen(true)}
                            style={{
                                background: 'white',
                                border: '1.5px solid var(--glass-border)',
                                borderRadius: '8px',
                                padding: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <LayoutDashboard size={20} color="var(--primary-color)" />
                        </button>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                                Admin Console
                            </h1>
                            <p style={{ color: 'var(--text-muted)' }}>Overview and management.</p>
                        </div>
                    </div>
                </div>

                {/* Dashboard View */}
                {activeSection === 'dashboard' && (
                    <>
                        <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                            <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="#3b82f6" subtext="Total registered accounts" />
                            <StatCard title="Active Rides" value={stats.activeRides} icon={Car} color="#06b6d4" subtext="Upcoming only" />
                            <StatCard title="Pending Approvals" value={stats.pendingApprovals} icon={Clock} color="#f59e0b" subtext={stats.pendingApprovals > 0 ? `${stats.pendingApprovals} Action(s) Needed` : "All Clear"} />
                            <StatCard title="Total Revenue" value={`₹${Number(stats.totalRevenue).toFixed(2)}`} icon={DollarSign} color="#10b981" subtext="Total Driver Earnings" />
                        </div>

                        {/* Graphs Section 1: Business Overview */}
                        <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
                            {/* Revenue Overview (Area Chart) */}
                            <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <TrendingUp size={18} color="#10b981" /> Revenue Overview
                                    </h3>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Last 7 Days</span>
                                </div>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={businessData.chartData}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--glass-border)" />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-main)', borderRadius: '12px', border: '1px solid var(--glass-border)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                                itemStyle={{ fontWeight: '600' }}
                                                formatter={(value) => [`₹${value}`, "Revenue"]}
                                            />
                                            <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* User Growth & Rides (Bar Chart) */}
                            <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Car size={18} color="#6366f1" /> User Growth & Rides
                                    </h3>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Activity Statistics</span>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={businessData.chartData}>
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                                contentStyle={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-main)', borderRadius: '12px', border: '1px solid var(--glass-border)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                            />
                                            <Bar dataKey="rides" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={25} />
                                            <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={25} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Graphs Section 2: Distribution */}
                        <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>

                            {/* User Distribution Chart */}
                            <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-main)' }}>User Distribution</h3>
                                <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Passengers', value: users.filter(u => u.role === 'PASSENGER').length },
                                                    { name: 'Drivers', value: users.filter(u => u.role === 'DRIVER').length },
                                                    { name: 'Admins', value: users.filter(u => u.role === 'ADMIN').length }
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                <Cell key="cell-0" fill="#3b82f6" />
                                                <Cell key="cell-1" fill="#8b5cf6" />
                                                <Cell key="cell-2" fill="#10b981" />
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-main)', borderRadius: '8px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* User Status Chart */}
                            <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-main)' }}>Account Status Overview</h3>
                                <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={[
                                                { name: 'Approved', value: users.filter(u => u.status === 'APPROVED').length, fill: '#10b981' },
                                                { name: 'Pending', value: users.filter(u => u.status === 'PENDING').length, fill: '#f59e0b' },
                                                { name: 'Deactivated', value: users.filter(u => u.status === 'DEACTIVATED').length, fill: '#ef4444' }
                                            ]}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-main)', borderRadius: '8px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                                            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Pending User Approvals View */}
                {activeSection === 'approvals' && (
                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                            <CheckCircle size={20} color="var(--accent-warning)" /> Pending User Approvals
                        </h3>
                        {pendingUsers.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No pending user approvals.</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Role</th>
                                        <th>Email</th>
                                        <th>Contact</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingUsers.map(u => (
                                        <tr key={u.id}>
                                            <td data-label="Name" style={{ fontWeight: '500' }}>{u.name}</td>
                                            <td data-label="Role">
                                                <span style={{
                                                    padding: '0.25rem 0.6rem',
                                                    borderRadius: '1rem',
                                                    backgroundColor: u.role === 'DRIVER' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                                    color: u.role === 'DRIVER' ? '#818cf8' : '#f59e0b',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td data-label="Email" style={{ color: 'var(--text-muted)' }}>{u.username}</td>
                                            <td data-label="Contact" style={{ color: 'var(--text-muted)' }}>{u.contactNumber || 'N/A'}</td>
                                            <td data-label="Actions">
                                                <button
                                                    onClick={() => handleUserAction(u.id, 'approve')}
                                                    className="button button-success"
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', border: 'none' }}
                                                >
                                                    Approve
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* Users View */}
                {activeSection === 'users' && (
                    <div className="card">
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                            <Users size={20} color="var(--primary-color)" /> User Management
                        </h3>
                        {users.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No users found.</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id}>
                                            <td data-label="Name" style={{ fontWeight: '500' }}>{u.name}</td>
                                            <td data-label="Role">
                                                <span style={{
                                                    padding: '0.25rem 0.6rem',
                                                    borderRadius: '1rem',
                                                    backgroundColor: u.role === 'ADMIN' ? 'rgba(59, 130, 246, 0.2)' : u.role === 'DRIVER' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                                    color: u.role === 'ADMIN' ? '#60a5fa' : u.role === 'DRIVER' ? '#818cf8' : '#f59e0b',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td data-label="Status">
                                                <span style={{
                                                    color: u.status === 'APPROVED' ? 'var(--accent-success)' : u.status === 'PENDING' ? 'var(--accent-warning)' : 'var(--accent-error)',
                                                    fontWeight: '600', fontSize: '0.9rem'
                                                }}>
                                                    {u.status}
                                                </span>
                                            </td>
                                            <td data-label="Actions">
                                                {u.status !== 'DEACTIVATED' && u.role !== 'ADMIN' && (
                                                    <button
                                                        onClick={() => handleUserAction(u.id, 'deactivate')}
                                                        className="button button-danger"
                                                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                                                    >
                                                        Deactivate
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {activeSection === 'reports' && (
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                                <FileText size={20} color="var(--primary-color)" /> Financial Transactions
                            </h3>
                            <div style={{ padding: '0.6rem 1.2rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Total Driver Earnings: </span>
                                <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>₹{Number(stats.totalRevenue).toFixed(2)}</strong>
                            </div>
                        </div>

                        {transactions.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                                <DollarSign size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                <p>No transactions recorded yet.</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
                                            <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>ID</th>
                                            <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>BOOKING ID</th>
                                            <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>AMOUNT</th>
                                            <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>PAYMENT METHOD</th>
                                            <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>TRANSACTION TIME</th>
                                            <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...transactions].reverse().map(t => (
                                            <tr key={t.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                                <td data-label="ID" style={{ padding: '1rem', fontSize: '0.9rem' }}>{t.id}</td>
                                                <td data-label="BOOKING ID" style={{ padding: '1rem', fontSize: '0.9rem', color: '#6366f1', fontWeight: 'bold' }}>#{t.bookingId}</td>
                                                <td data-label="AMOUNT" style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: '800', color: '#16a34a' }}>₹{t.amount}</td>
                                                <td data-label="PAYMENT METHOD" style={{ padding: '1rem', fontSize: '0.9rem' }}>{t.paymentMethod}</td>
                                                <td data-label="TIME" style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                                                    {new Date(t.transactionTime).toLocaleString()}
                                                </td>
                                                <td data-label="STATUS" style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        padding: '0.3rem 0.8rem',
                                                        borderRadius: '20px',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 'bold',
                                                        backgroundColor: t.status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                        color: t.status === 'SUCCESS' ? '#10b981' : '#ef4444'
                                                    }}>
                                                        {t.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Business Overview View */}
                {activeSection === 'business' && (
                    <div className="card" style={{ padding: '0' }}>
                        <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Briefcase size={24} color="var(--primary-color)" /> Platform Business Overview
                            </h3>
                            <div style={{ display: 'flex', background: 'var(--bg-main)', padding: '0.4rem', borderRadius: '1rem', border: '1px solid var(--glass-border)' }}>
                                <button
                                    onClick={() => setBusinessTab('drivers')}
                                    style={{
                                        padding: '0.6rem 1.5rem',
                                        borderRadius: '0.8rem',
                                        border: 'none',
                                        background: businessTab === 'drivers' ? 'var(--primary-gradient)' : 'transparent',
                                        color: businessTab === 'drivers' ? 'white' : 'var(--text-muted)',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Drivers Analytics
                                </button>
                                <button
                                    onClick={() => setBusinessTab('passengers')}
                                    style={{
                                        padding: '0.6rem 1.5rem',
                                        borderRadius: '0.8rem',
                                        border: 'none',
                                        background: businessTab === 'passengers' ? 'var(--primary-gradient)' : 'transparent',
                                        color: businessTab === 'passengers' ? 'white' : 'var(--text-muted)',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Passengers Statistics
                                </button>
                            </div>
                        </div>

                        <div style={{ padding: '2.5rem' }}>
                            {businessTab === 'drivers' ? (
                                <div className="animate-fade-in">
                                    <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                                        <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                                            <p style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem' }}>Total Active Drivers</p>
                                            <p style={{ fontSize: '2.5rem', fontWeight: '900', color: '#3b82f6' }}>{businessData.driverStats.length}</p>
                                        </div>
                                        <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                            <p style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem' }}>Top Driver Earnings</p>
                                            <p style={{ fontSize: '2.5rem', fontWeight: '900', color: '#10b981' }}>
                                                ₹{businessData.driverStats.length > 0 ? Math.max(...businessData.driverStats.map(d => d.earnings)) : 0}
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ borderSpacing: '0 1rem', borderCollapse: 'separate' }}>
                                            <thead>
                                                <tr style={{ color: 'var(--text-muted)', textAlign: 'left', fontSize: '0.85rem' }}>
                                                    <th style={{ padding: '1rem', fontWeight: '800' }}>DRIVER NAME</th>
                                                    <th style={{ padding: '1rem', fontWeight: '800' }}>TOTAL RIDES</th>
                                                    <th style={{ padding: '1rem', fontWeight: '800' }}>ACCEPTED</th>
                                                    <th style={{ padding: '1rem', fontWeight: '800' }}>EARNINGS</th>
                                                    <th style={{ padding: '1rem', fontWeight: '800' }}>VEHICLES</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {businessData.driverStats.map(d => (
                                                    <tr key={d.id} className="table-row-hover" style={{ backgroundColor: 'var(--bg-main)', transition: 'all 0.2s' }}>
                                                        <td data-label="Driver" style={{ padding: '1.25rem', borderRadius: '1.25rem 0 0 1.25rem' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                                <div style={{ width: '40px', height: '40px', background: 'var(--primary-gradient)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                                                                    {d.name[0].toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontWeight: '800', color: 'var(--text-main)' }}>{d.name}</div>
                                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td data-label="Total Rides" style={{ padding: '1.25rem' }}>
                                                            <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{d.totalRides}</span>
                                                        </td>
                                                        <td data-label="Accepted" style={{ padding: '1.25rem' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: '700' }}>
                                                                <CheckCircle size={14} /> {d.acceptedRides}
                                                            </div>
                                                        </td>
                                                        <td data-label="Earnings" style={{ padding: '1.25rem' }}>
                                                            <span style={{ fontWeight: '900', color: '#10b981', fontSize: '1.1rem' }}>₹{Number(d.earnings).toFixed(2)}</span>
                                                        </td>
                                                        <td data-label="Vehicles" style={{ padding: '1.25rem', borderRadius: '0 1.25rem 1.25rem 0' }}>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                                                {d.vehicles && d.vehicles.length > 0 ? d.vehicles.map(v => (
                                                                    <span key={v.id} style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem', background: 'var(--glass-border)', borderRadius: '6px', fontWeight: '600' }}>
                                                                        {v.model} ({v.vehicleNumber})
                                                                    </span>
                                                                )) : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No Vehicle</span>}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="animate-fade-in">
                                    <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                                        <div style={{ background: 'rgba(139, 92, 246, 0.05)', padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
                                            <p style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem' }}>Total Passengers</p>
                                            <p style={{ fontSize: '2.5rem', fontWeight: '900', color: '#8b5cf6' }}>{businessData.passengerStats.length}</p>
                                        </div>
                                        <div style={{ background: 'rgba(236, 72, 153, 0.05)', padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid rgba(236, 72, 153, 0.1)' }}>
                                            <p style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem' }}>Avg. Booking Value</p>
                                            <p style={{ fontSize: '2.5rem', fontWeight: '900', color: '#ec4899' }}>
                                                ₹{businessData.passengerStats.length > 0 ? (businessData.passengerStats.reduce((acc, p) => acc + p.totalPayments, 0) / businessData.passengerStats.length).toFixed(0) : 0}
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ borderSpacing: '0 1rem', borderCollapse: 'separate' }}>
                                            <thead>
                                                <tr style={{ color: 'var(--text-muted)', textAlign: 'left', fontSize: '0.85rem' }}>
                                                    <th style={{ padding: '1rem', fontWeight: '800' }}>PASSENGER NAME</th>
                                                    <th style={{ padding: '1rem', fontWeight: '800' }}>BOOKED RIDES</th>
                                                    <th style={{ padding: '1rem', fontWeight: '800' }}>PAYMENTS</th>
                                                    <th style={{ padding: '1rem', fontWeight: '800' }}>REVIEWS GIVEN</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {businessData.passengerStats.map(p => (
                                                    <tr key={p.id} className="table-row-hover" style={{ backgroundColor: 'var(--bg-main)', transition: 'all 0.2s' }}>
                                                        <td data-label="Passenger" style={{ padding: '1.25rem', borderRadius: '1.25rem 0 0 1.25rem' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                                <div style={{ width: '40px', height: '40px', background: 'var(--secondary-color)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                                                                    {p.name[0].toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontWeight: '800', color: 'var(--text-main)' }}>{p.name}</div>
                                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td data-label="Bookings" style={{ padding: '1.25rem' }}>
                                                            <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{p.bookedRides}</span>
                                                        </td>
                                                        <td data-label="Payments" style={{ padding: '1.25rem' }}>
                                                            <span style={{ fontWeight: '900', color: '#3b82f6', fontSize: '1.1rem' }}>₹{Number(p.totalPayments).toFixed(2)}</span>
                                                        </td>
                                                        <td data-label="Reviews" style={{ padding: '1.25rem', borderRadius: '0 1.25rem 1.25rem 0' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontWeight: '700' }}>
                                                                <Users size={14} fill="#f59e0b" /> {p.reviewsCount} Reviews
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {/* Notification Modal */}
            <NotificationModal
                isOpen={notification.isOpen}
                onClose={() => setNotification(p => ({ ...p, isOpen: false }))}
                title={notification.title}
                message={notification.message}
                type={notification.type}
            />

            {/* Confirmation Modal */}
            <NotificationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(p => ({ ...p, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type="confirm"
            />
        </div>
    );
};

export default AdminDashboard;
