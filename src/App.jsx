import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import RegisterSelection from './pages/RegisterSelection';
import MultiStepRegister from './pages/MultiStepRegister';
import AdminDashboard from './pages/AdminDashboard';
import AdminQueries from './pages/AdminQueries';
import Dashboard from './pages/Dashboard';
import CreateRide from './pages/CreateRide';
import RideSearch from './pages/RideSearch';
import MyBookings from './pages/MyBookings';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SetNewPassword from './pages/SetNewPassword';
import Contact from './pages/Contact';
import FAQs from './pages/FAQs';
import ChatBot from './components/ChatBot';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import { ArrowLeft } from 'lucide-react';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return children;
  return <Navigate to="/dashboard" replace />;
};

const UserRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin-dashboard" replace />;
  return children;
};

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname.startsWith('/register') || location.pathname === '/login';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isAuthPage && <Navbar />}
      {isAuthPage && (
        <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid var(--glass-border)', background: 'var(--card-bg)', display: 'flex', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/')}
            className="secondary-button"
            style={{
              padding: '0.6rem 1.25rem',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#9fc5e8ff',
              border: '1.5px solid #9fc5e8ff',
              borderRadius: '0.75rem',
              color: '#475569',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#9fc5e8ff';
              e.currentTarget.style.borderColor = '#9fc5e8ff';
              e.currentTarget.style.transform = 'translateX(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#9fc5e8ff';
              e.currentTarget.style.borderColor = '#9fc5e8ff';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <ArrowLeft size={18} /> Back to previous
          </button>
          <div style={{ marginLeft: 'auto' }}>
            <ThemeToggle />
          </div>
        </div>
      )}
      <div style={{ flex: 1 }}>
        {children}
      </div>
      {!isAuthPage && <Footer />}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faqs" element={<FAQs />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<RegisterSelection />} />
              <Route path="/register/:role" element={<MultiStepRegister />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/set-password" element={<SetNewPassword />} />

              <Route path="/admin-dashboard" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              <Route path="/admin-queries" element={
                <AdminRoute>
                  <AdminQueries />
                </AdminRoute>
              } />

              <Route path="/dashboard" element={
                <UserRoute>
                  <Dashboard />
                </UserRoute>
              } />
              <Route path="/create-ride" element={<Navigate to="/dashboard#post-ride" replace />} />
              <Route path="/search-rides" element={<Navigate to="/dashboard#find-ride" replace />} />
              <Route path="/my-bookings" element={<Navigate to="/dashboard#bookings" replace />} />
            </Routes>
          </Layout>
        </Router>
        <ChatBot />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
