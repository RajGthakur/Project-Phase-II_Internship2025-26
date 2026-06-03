import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VehicleList from '../components/VehicleList';
import { NotificationList, ReviewSummary } from '../components/DashboardComponents';
import Sidebar from '../components/Sidebar';
import { LayoutDashboard, Car, Search, Ticket, Bell, Star, PlusCircle, CheckCircle, Clock } from 'lucide-react';
import CreateRide from './CreateRide';
import RideSearch from './RideSearch';
import MyBookings from './MyBookings';
import MyRides from './MyRides';
import RideHistory from './RideHistory';
import AcceptDeclineBookings from '../components/AcceptDeclineBookings';
import ThemeToggle from '../components/ThemeToggle';
import { useLocation } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend, XAxis, YAxis, BarChart, Bar } from 'recharts';

const STATUS_COLORS = {
    'CONFIRMED': '#10b981', // Emerald/Green
    'PENDING': '#f59e0b',   // Amber/Orange
    'ACCEPTED': '#6366f1',  // Indigo/Blue
    'CANCELLED': '#ef4444', // Red
    'AVAILABLE': '#3b82f6', // Bright Blue
    'BOOKED': '#8b5cf6',    // Purple
    'COMPLETED': '#10b981', // Emerald
    'DECLINED': '#94a3b8'   // Slate
};

const Dashboard = () => {
    const { user, token, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const userRole = user?.role?.toUpperCase() || '';

    // Check if initial section should be set from navigation state or URL
    const [activeSection, setActiveSection] = useState(() => {
        const path = window.location.hash.replace('#', '') || 'overview';
        return path;
    });
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

    const [stats, setStats] = useState({
        totalRides: 0,
        myVehicles: 0,
        totalBookings: 0,
        confirmedBookings: 0,
        cancelledBookings: 0,
        confirmedRides: 0, // For driver
        cancelledRides: 0,  // For driver
        unreadNotifications: 0
    });
    const [bookingData, setBookingData] = useState([]);
    const [rideStatusData, setRideStatusData] = useState([]);
    const [userStats, setUserStats] = useState({
        earningsChart: [],
        paymentsChart: [],
        ratingsChart: []
    });

    useEffect(() => {
        const fetchDashboardStats = async () => {
            if (!user || !token || loading) return;
            const headers = { Authorization: `Bearer ${token}` };

            try {
                console.log("Dashboard Stats Fetching for role:", userRole);

                // Fetch Total Rides (for Drivers)
                if (userRole === 'DRIVER') {
                    console.log("Fetching driver stats user:", user.id, "token:", token?.substring(0, 15) + "...");
                    const ridesRes = await axios.get(`http://localhost:8080/api/rides/driver/${user.id}`, { headers });
                    const rides = ridesRes.data;
                    setStats(prev => ({ ...prev, totalRides: rides.length }));

                    const vehiclesRes = await axios.get('http://localhost:8080/api/vehicles/my-vehicles', { headers });
                    setStats(prev => ({ ...prev, myVehicles: vehiclesRes.data.length }));

                    // Fetch driver's bookings to get confirmed/cancelled counts
                    const bookingsRes = await axios.get('http://localhost:8080/api/bookings/driver', { headers });
                    const driverBookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];
                    setStats(prev => ({
                        ...prev,
                        confirmedRides: driverBookings.filter(b => b.status === 'CONFIRMED').length,
                        cancelledRides: driverBookings.filter(b => b.status === 'CANCELLED').length
                    }));

                    // Prepare data for Ride Performance Overview PieChart based on bookings
                    const statuses = driverBookings.reduce((acc, curr) => {
                        acc[curr.status] = (acc[curr.status] || 0) + 1;
                        return acc;
                    }, {});

                    const chartData = Object.keys(statuses).map(status => ({
                        name: status,
                        value: statuses[status]
                    }));
                    setRideStatusData(chartData);
                }

                // Fetch Total Bookings (for Passengers)
                if (userRole === 'PASSENGER') {
                    const bookingsRes = await axios.get('http://localhost:8080/api/bookings/my-bookings', { headers });
                    const bookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];
                    setStats(prev => ({
                        ...prev,
                        totalBookings: bookings.length,
                        confirmedBookings: bookings.filter(b => b.status === 'CONFIRMED').length,
                        cancelledBookings: bookings.filter(b => b.status === 'CANCELLED').length
                    }));

                    // Prepare data for PieChart
                    const statuses = bookings.reduce((acc, curr) => {
                        acc[curr.status] = (acc[curr.status] || 0) + 1;
                        return acc;
                    }, {});

                    const chartData = Object.keys(statuses).map(status => ({
                        name: status,
                        value: statuses[status]
                    }));
                    setBookingData(chartData);
                }

                // Fetch Unread Notifications
                const notifsRes = await axios.get(`http://localhost:8080/api/notifications/user/${user.id}`, { headers });
                const unreadCount = notifsRes.data.filter(n => !n.isRead).length;
                setStats(prev => ({ ...prev, unreadNotifications: unreadCount }));

            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            }
        };
        fetchDashboardStats();
    }, [user, token]);

    useEffect(() => {
        const fetchUserStats = async () => {
            if (!user || !token || loading) return;
            const headers = { Authorization: `Bearer ${token}` };
            try {
                const res = await axios.get('http://localhost:8080/api/stats/user', { headers });
                setUserStats(res.data);
            } catch (err) {
                console.error("Error fetching user stats:", err);
            }
        };
        fetchUserStats();
    }, [user, token]);

    useEffect(() => {
        // Sync hash with active section for back button support/direct access within dashboard
        window.location.hash = activeSection;
    }, [activeSection]);

    // Define Menu Items based on Role
    const getMenuItems = () => {
        const items = [
            { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        ];

        if (userRole === 'DRIVER') {
            items.push(
                { id: 'vehicles', label: 'My Vehicles', icon: <Car size={20} /> },
                { id: 'post-ride', label: 'Post a Ride', icon: <PlusCircle size={20} /> },
                { id: 'my-rides', label: 'My Rides', icon: <LayoutDashboard size={20} /> },
                { id: 'history', label: 'History', icon: <Clock size={20} /> },
                { id: 'accept-decline', label: 'Accept/Decline', icon: <CheckCircle size={20} /> },
                { id: 'reviews', label: 'Reviews', icon: <Star size={20} /> }
            );
        } else if (userRole === 'PASSENGER') {
            items.push({
                id: 'find-ride',
                label: 'Search Ride',
                icon: <Search size={20} />
            });
            items.push({ id: 'bookings', label: 'My Bookings', icon: <Ticket size={20} /> });
            items.push({ id: 'history', label: 'History', icon: <Clock size={20} /> });
        } else {
            // Fallback for other roles if they use this dashboard
            items.push(
                { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
                { id: 'reviews', label: 'Reviews', icon: <Star size={20} /> }
            );
        }

        return items;
    };

    const handleMenuClick = (id) => {
        setActiveSection(id);
        setSidebarMobileOpen(false); // Close sidebar on mobile after clicking
    };

    const generateData = () => {
        return Array.from({ length: 7 }, (_, i) => ({
            name: `Day ${i + 1}`,
            value: Math.floor(Math.random() * 10) + 2
        }));
    };

    const StatCard = ({ title, value, color, data }) => (
        <div className="card" style={{ padding: '1.5rem', borderLeft: `4px solid ${color}`, display: 'flex', flexDirection: 'column', height: '140px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ zIndex: 1 }}>
                <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{title}</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{value}</p>
            </div>
            {data && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', opacity: 0.8 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id={`gradient-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#gradient-${title.replace(/\s+/g, '')})`} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-main)' }}>
                <div className="loader">Loading Dashboard...</div>
            </div>
        );
    }

    if (!user) {
        return null; // Or redirect to login
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar
                menuItems={getMenuItems()}
                activeSection={activeSection}
                onMenuClick={handleMenuClick}
                isCollapsed={sidebarCollapsed}
                toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                mobileOpen={sidebarMobileOpen}
            />

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

            {/* Main Content */}
            <div className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`} style={{ flex: 1, marginLeft: sidebarCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)' }}>
                <header style={{
                    marginBottom: '2rem',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    paddingBottom: '1rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
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
                            <LayoutDashboard size={20} />
                        </button>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>Welcome back, <span style={{ color: 'var(--primary-color)' }}>{user?.name}</span></h1>
                            <p style={{ color: 'var(--text-muted)' }}>Role: <span style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{user?.role}</span></p>
                        </div>
                    </div>

                    {(userRole === 'DRIVER' || userRole === 'PASSENGER') && (
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>

                            <div
                                onClick={() => handleMenuClick('notifications')}
                                className="nav-icon-top"
                                style={{
                                    position: 'relative',
                                    cursor: 'pointer',
                                    padding: '0.6rem',
                                    borderRadius: '12px',
                                    background: activeSection === 'notifications' ? 'rgba(59, 130, 246, 0.1)' : 'var(--card-bg)',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: activeSection === 'notifications' ? '1.5px solid var(--primary-color)' : '1.5px solid var(--glass-border)'
                                }}
                                title="Notifications"
                            >
                                <Bell size={22} color={activeSection === 'notifications' ? 'var(--primary-color)' : 'var(--text-main)'} />
                                {stats.unreadNotifications > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '-5px',
                                        right: '-5px',
                                        background: 'var(--accent-warning)',
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: '20px',
                                        height: '20px',
                                        fontSize: '11px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        fontWeight: 'bold',
                                        border: '2px solid white'
                                    }}>
                                        {stats.unreadNotifications}
                                    </span>
                                )}
                            </div>
                            {userRole === 'DRIVER' && (
                                <div
                                    onClick={() => handleMenuClick('reviews')}
                                    className="nav-icon-top"
                                    style={{
                                        cursor: 'pointer',
                                        padding: '0.6rem',
                                        borderRadius: '12px',
                                        background: activeSection === 'reviews' ? 'rgba(59, 130, 246, 0.1)' : 'var(--card-bg)',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: activeSection === 'reviews' ? '1.5px solid var(--primary-color)' : '1.5px solid var(--glass-border)'
                                    }}
                                    title="Reviews"
                                >
                                    <Star size={22} color={activeSection === 'reviews' ? 'var(--primary-color)' : 'var(--text-main)'} />
                                </div>
                            )}
                        </div>
                    )}
                </header>

                {activeSection === 'overview' && (
                    <>
                        <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                            {userRole === 'DRIVER' && (
                                <>
                                    <StatCard title="Total Rides Implemented" value={stats.totalRides} color="var(--primary-color)" data={generateData()} />
                                    <StatCard title="Confirmed Rides" value={stats.confirmedRides} color="#10b981" data={generateData()} />
                                    <StatCard title="Cancelled Rides" value={stats.cancelledRides} color="#ef4444" data={generateData()} />
                                    <StatCard title="My Vehicles" value={stats.myVehicles} color="var(--secondary-color)" data={generateData()} />
                                </>
                            )}
                            {userRole === 'PASSENGER' && (
                                <>
                                    <StatCard title="Total Bookings" value={stats.totalBookings} color="#6366f1" data={generateData()} />
                                    <StatCard title="Confirmed Rides" value={stats.confirmedBookings} color="#10b981" data={generateData()} />
                                    <StatCard title="Cancelled Rides" value={stats.cancelledBookings} color="#ef4444" data={generateData()} />
                                </>
                            )}
                            <StatCard title="Unread Notifications" value={stats.unreadNotifications} color="var(--accent-warning)" data={generateData()} />
                        </div>

                        {/* Visual Analytics */}
                        <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                            {user?.role?.toUpperCase() === 'PASSENGER' && bookingData.length > 0 && (
                                <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '350px' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Booking Status Distribution</h3>
                                    <div style={{ flex: 1, minHeight: 0 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={bookingData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={85}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {bookingData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#6366f1'} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-main)', borderRadius: '12px', border: '1px solid var(--glass-border)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                                    itemStyle={{ fontWeight: '600' }}
                                                />
                                                <Legend verticalAlign="bottom" height={36} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            {userRole === 'DRIVER' && rideStatusData.length > 0 && (
                                <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '350px' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Ride Performance Overview</h3>
                                    <div style={{ flex: 1, minHeight: 0 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={rideStatusData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={85}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {rideStatusData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#3b82f6'} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-main)', borderRadius: '12px', border: '1px solid var(--glass-border)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                                    itemStyle={{ fontWeight: '600' }}
                                                />
                                                <Legend verticalAlign="bottom" height={36} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Specific Statistical Graphs */}
                        <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                            {/* Financial Graph */}
                            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '350px' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
                                    {userRole === 'DRIVER' ? 'Earnings Overview (Last 7 Days)' : 'Payments Overview (Last 7 Days)'}
                                </h3>
                                <div style={{ flex: 1, minHeight: 0 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={userRole === 'DRIVER' ? userStats.earningsChart : userStats.paymentsChart}>
                                            <defs>
                                                <linearGradient id="colorFinancial" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={userRole === 'DRIVER' ? '#10b981' : '#3b82f6'} stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor={userRole === 'DRIVER' ? '#10b981' : '#3b82f6'} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-main)', borderRadius: '12px', border: '1px solid var(--glass-border)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                                formatter={(value) => [`₹${value}`, userRole === 'DRIVER' ? 'Earnings' : 'Payment']}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey={userRole === 'DRIVER' ? 'earnings' : 'payments'}
                                                stroke={userRole === 'DRIVER' ? '#10b981' : '#3b82f6'}
                                                fillOpacity={1}
                                                fill="url(#colorFinancial)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Ratings Distribution Graph */}
                            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '350px' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
                                    {userRole === 'DRIVER' ? 'Ratings Received Distribution' : 'Ratings Given Distribution'}
                                </h3>
                                <div style={{ flex: 1, minHeight: 0 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={userStats.ratingsChart}>
                                            <XAxis dataKey="rating" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                                contentStyle={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-main)', borderRadius: '12px', border: '1px solid var(--glass-border)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                            />
                                            <Bar dataKey="count" fill="var(--accent-warning)" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeSection === 'vehicles' && userRole === 'DRIVER' && (
                    <VehicleList />
                )}

                {activeSection === 'notifications' && (
                    <NotificationList />
                )}

                {activeSection === 'reviews' && (
                    <div className="card">
                        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Your Reviews</h2>
                        <ReviewSummary userId={user?.id} />
                    </div>
                )}

                {activeSection === 'post-ride' && userRole === 'DRIVER' && (
                    <CreateRide setActiveSection={setActiveSection} />
                )}

                {activeSection === 'find-ride' && (
                    <RideSearch setActiveSection={setActiveSection} />
                )}

                {activeSection === 'bookings' && userRole === 'PASSENGER' && (
                    <MyBookings />
                )}

                {activeSection === 'my-rides' && userRole === 'DRIVER' && (
                    <MyRides />
                )}

                {activeSection === 'accept-decline' && userRole === 'DRIVER' && (
                    <AcceptDeclineBookings />
                )}

                {activeSection === 'history' && (
                    <RideHistory />
                )}
            </div>
        </div>
    );
};

export default Dashboard;
