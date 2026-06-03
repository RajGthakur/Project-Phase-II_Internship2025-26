import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldCheck, CheckCircle, Loader2, AlertCircle, CreditCard, Smartphone, Landmark } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CarLoader from './CarLoader';

const PaymentModal = ({ bookingId, amount, onClose, onSuccess }) => {
    const { user, token } = useAuth();
    const [view, setView] = useState('summary'); // summary, payment, success, error
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [stripe, setStripe] = useState(null);
    const [elements, setElements] = useState(null);
    const [paymentElement, setPaymentElement] = useState(null);
    const [clientSecret, setClientSecret] = useState('');
    const [isStripeLoading, setIsStripeLoading] = useState(true);

    const paymentElementRef = useRef(null);

    useEffect(() => {
        // Initialize Stripe
        const initializeStripe = async () => {
            console.log("Initializing Stripe SDK...");
            if (window.Stripe) {
                const stripeInstance = window.Stripe('pqr2');
                setStripe(stripeInstance);
                setIsStripeLoading(false);
            } else {
                let attempts = 0;
                const interval = setInterval(() => {
                    attempts++;
                    if (window.Stripe) {
                        const stripeInstance = window.Stripe('pqr2');
                        setStripe(stripeInstance);
                        setIsStripeLoading(false);
                        clearInterval(interval);
                    }
                    if (attempts > 50) {
                        setErrorMessage('Stripe SDK failed to load. Please check your internet.');
                        setView('error');
                        clearInterval(interval);
                    }
                }, 200);
            }
        };

        initializeStripe();
    }, []);

    useEffect(() => {
        // Check for return from redirect (e.g. UPI/Netbanking)
        // Handle both standard query params and hash-based params
        if (stripe) {
            const querySource = window.location.hash.includes('?')
                ? window.location.hash.split('?')[1]
                : window.location.search;

            const urlParams = new URLSearchParams(querySource);
            const clientSecretInUrl = urlParams.get('payment_intent_client_secret');
            const redirected = urlParams.get('redirected') === 'true';

            if (clientSecretInUrl) {
                console.log("Detected redirect return. Verifying status...");
                // Clear the URL params immediately to avoid re-triggering loader on refresh
                // We keep the hash but remove the search part
                const cleanHash = window.location.hash.split('?')[0];
                const cleanUrl = window.location.origin + window.location.pathname + cleanHash;
                window.history.replaceState({}, document.title, cleanUrl);

                checkStatus(clientSecretInUrl);
            }
        }
    }, [stripe]);

    const checkStatus = async (secret) => {
        setIsProcessing(true);
        try {
            const { paymentIntent } = await stripe.retrievePaymentIntent(secret);

            switch (paymentIntent.status) {
                case 'succeeded':
                    verifyPayment(paymentIntent.id);
                    break;
                case 'processing':
                    setErrorMessage('Your payment is processing.');
                    setView('error');
                    setIsProcessing(false);
                    break;
                case 'requires_payment_method':
                    setErrorMessage('Your payment was not successful, please try again.');
                    setView('error');
                    setIsProcessing(false);
                    break;
                default:
                    setErrorMessage('Something went wrong.');
                    setView('error');
                    setIsProcessing(false);
                    break;
            }
        } catch (err) {
            setErrorMessage('Failed to check payment status.');
            setView('error');
            setIsProcessing(false);
        }
    };

    const handleInitialPay = async () => {
        setIsProcessing(true);
        try {
            // 1. Create PaymentIntent on Backend to get Client Secret
            const orderResponse = await axios.post('http://localhost:8080/api/payment/order', {
                amount: amount,
                currency: 'INR',
                bookingId: bookingId
            }, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 10000 // 10 seconds timeout
            });

            const { clientSecret: secret } = orderResponse.data;
            setClientSecret(secret);
            setView('payment');
        } catch (err) {
            setErrorMessage(err.response?.data || 'Failed to initialize payment.');
            setView('error');
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        if (view === 'payment' && stripe && clientSecret && !paymentElement) {
            const elementsInstance = stripe.elements({
                clientSecret,
                appearance: {
                    theme: 'stripe',
                    variables: {
                        colorPrimary: '#6366f1',
                        colorBackground: '#ffffff',
                        colorText: '#1e293b',
                        colorDanger: '#ef4444',
                        fontFamily: 'Outfit, system-ui, sans-serif',
                        spacingUnit: '4px',
                        borderRadius: '8px',
                    },
                },
            });

            const paymentElementInstance = elementsInstance.create('payment', {
                layout: 'tabs', // Card, UPI, Netbanking tabs
            });

            paymentElementInstance.mount('#payment-element');
            setElements(elementsInstance);
            setPaymentElement(paymentElementInstance);
        }
    }, [view, stripe, clientSecret]);

    const handlePaymentSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);

        // Construct return URL that preserves dashboard section and adds helper params
        const baseUrl = window.location.origin + window.location.pathname + window.location.hash;
        const separator = baseUrl.includes('?') ? '&' : '?';
        const returnUrl = `${baseUrl}${separator}bookingId=${bookingId}&amount=${amount}&redirected=true`;

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    // Return to the current page to verify the status
                    return_url: returnUrl,
                    payment_method_data: {
                        billing_details: {
                            name: user?.name || 'Customer',
                            email: user?.email || '',
                        }
                    }
                },
                // For card payments and some others, we can prevent a full page redirect
                redirect: 'if_required'
            });

            // This point will only be reached if there's an immediate response or error
            if (error) {
                if (error.type === 'card_error' || error.type === 'validation_error') {
                    setErrorMessage(error.message);
                } else {
                    setErrorMessage('An unexpected error occurred during payment.');
                }
                setView('error');
                setIsProcessing(false);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                // Success (non-redirect path)
                verifyPayment(paymentIntent.id);
            } else if (paymentIntent && paymentIntent.status === 'processing') {
                setErrorMessage('Payment is processing. Please wait.');
                setView('error');
                setIsProcessing(false);
            } else {
                // If it successfully redirects, the page will reload and this isn't reached
                setIsProcessing(false);
            }
        } catch (err) {
            console.error("Payment confirmation catch block fired:", err);
            setErrorMessage('Something went wrong. Please try again.');
            setView('error');
            setIsProcessing(false);
        }
    };

    const verifyPayment = async (paymentIntentId) => {
        console.log("Starting backend verification for intent:", paymentIntentId);
        setIsProcessing(true);
        try {
            const verifyRes = await axios.post('http://localhost:8080/api/payment/verify', {
                paymentIntentId: paymentIntentId,
                bookingId: bookingId,
                amount: amount
            }, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 15000 // 15 seconds for verification
            });

            if (verifyRes.data.status === 'SUCCESS') {
                console.log("Backend verified SUCCESS");
                setView('success');
                setTimeout(() => {
                    onSuccess('STRIPE');
                }, 2000);
            } else {
                setErrorMessage(verifyRes.data.message || 'Payment verification failed.');
                setView('error');
            }
        } catch (err) {
            console.error("Verification error:", err);
            setErrorMessage(err.response?.data?.message || err.response?.data || 'Verification failed. Please check if amount was deducted.');
            setView('error');
        } finally {
            setIsProcessing(false);
        }
    };

    const ProcessingLoader = () => (
        <CarLoader text="Securely Processing Payment" subtext="Please do not refresh or close this window" />
    );

    const renderSummary = () => (
        <div style={{ background: 'white', borderRadius: '1.5rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', flexShrink: 0 }}>
                <div>
                    <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.4rem', letterSpacing: '-0.025em' }}>Complete Booking</h3>
                    <p style={{ margin: '4px 0 0 0', opacity: 0.8, fontSize: '0.85rem' }}>Secure checkout powered by Stripe</p>
                </div>
                <X size={24} onClick={onClose} style={{ cursor: 'pointer', opacity: 0.8 }} />
            </div>

            <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <p style={{ color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Payable Amount</p>
                    <h2 style={{ fontSize: '3rem', fontWeight: '900', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '1.5rem', color: '#64748b', fontWeight: '600' }}>₹</span>{amount}
                    </h2>
                </div>

                <div style={{
                    background: '#f8fafc',
                    borderRadius: '1rem',
                    padding: '1.25rem',
                    marginBottom: '2rem',
                    border: '1px solid #f1f5f9'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ background: 'white', padding: '8px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <Smartphone size={20} color="#6366f1" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold', color: '#1e293b' }}>Multiple Payment Methods</p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>UPI, Cards, Netbanking Supported</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <div style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold' }}>UPI</div>
                        <div style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold' }}>VISA</div>
                        <div style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold' }}>RUPAY</div>
                        <div style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold' }}>NET BANKING</div>
                    </div>
                </div>

                <button
                    onClick={handleInitialPay}
                    disabled={isProcessing || isStripeLoading}
                    style={{
                        width: '100%',
                        padding: '1.25rem',
                        borderRadius: '1rem',
                        border: 'none',
                        background: '#6366f1',
                        color: 'white',
                        fontWeight: '800',
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)',
                        transition: 'transform 0.2s, background 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    {isProcessing ? <Loader2 className="animate-spin" size={20} /> : 'Proceed to Checkout'}
                </button>
            </div>
        </div>
    );

    const renderPaymentForm = () => (
        <div style={{
            background: 'white',
            borderRadius: '1.5rem',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
            <div style={{ background: 'white', padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: '#e0e7ff', padding: '8px', borderRadius: '10px' }}>
                        <CreditCard size={20} color="#6366f1" />
                    </div>
                    <h3 style={{ margin: 0, fontWeight: '800', color: '#1e293b' }}>Payment Details</h3>
                </div>
                <X size={24} onClick={onClose} style={{ cursor: 'pointer', color: '#94a3b8' }} />
            </div>

            <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
                <form id="payment-form" onSubmit={handlePaymentSubmit}>
                    <div id="payment-element" style={{ marginBottom: '1.5rem' }}>
                        {/* Stripe Payment Element mounts here */}
                    </div>

                    <button
                        disabled={isProcessing || !stripe || !elements}
                        style={{
                            width: '100%',
                            padding: '1.1rem',
                            borderRadius: '1rem',
                            border: 'none',
                            background: '#059669',
                            color: 'white',
                            fontWeight: '800',
                            fontSize: '1.1rem',
                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.3)'
                        }}
                    >
                        {isProcessing ? <Loader2 className="animate-spin" size={24} /> : `Pay ₹${amount} Securely`}
                    </button>

                    <button
                        type="button"
                        onClick={() => setView('summary')}
                        style={{ width: '100%', marginTop: '1.25rem', background: 'transparent', border: 'none', color: '#64748b', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                        Go Back
                    </button>
                </form>
            </div>
        </div>
    );

    const renderSuccess = () => (
        <div style={{ background: 'white', borderRadius: '2rem', width: '100%', maxWidth: '450px', padding: '4rem 2rem', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div className="success-icon-container">
                <CheckCircle size={80} color="#10b981" />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Awesome!</h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: '500' }}>Your payment was successful.<br />Redirecting to your booking...</p>
        </div>
    );

    const renderError = () => (
        <div style={{ background: 'white', borderRadius: '2rem', width: '100%', maxWidth: '450px', padding: '3.5rem 2rem', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'inline-flex', padding: '1.5rem', borderRadius: '2rem', background: '#fee2e2', marginBottom: '1.5rem' }}>
                <AlertCircle size={60} color="#ef4444" />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e293b', marginBottom: '1rem' }}>Payment Failed</h2>
            <p style={{ color: '#64748b', marginBottom: '2.5rem', lineHeight: '1.6' }}>{errorMessage || 'We couldn\'t process your payment. Please try again with a different method.'}</p>
            <button
                onClick={() => setView('summary')}
                style={{ background: '#6366f1', color: 'white', border: 'none', padding: '1rem 2.5rem', borderRadius: '1rem', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)' }}
            >
                Retry Payment
            </button>
        </div>
    );

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(10px)' }}>
            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }
                
                .loader-ring {
                    width: 120px;
                    height: 120px;
                    border: 8px solid #f1f5f9;
                    border-top: 8px solid #6366f1;
                    border-radius: 50%;
                    animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
                }
                
                .progress-bar-container {
                    width: 250px;
                    height: 6px;
                    background: #f1f5f9;
                    border-radius: 10px;
                    margin-top: 2rem;
                    overflow: hidden;
                    position: relative;
                }
                
                .progress-bar-fill {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 100%;
                    width: 30%;
                    background: linear-gradient(to right, #6366f1, #0ea5e9);
                    border-radius: 10px;
                    animation: progressMove 2s infinite linear;
                }
                
                @keyframes progressMove {
                    0% { left: -30%; width: 30%; }
                    50% { left: 40%; width: 60%; }
                    100% { left: 100%; width: 30%; }
                }

                .success-icon-container {
                    animation: bounceIn 0.8s cubic-bezier(0.36, 0, 0.66, -0.56) forwards;
                }

                @keyframes bounceIn {
                    0% { transform: scale(0); opacity: 0; }
                    60% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>

            {/* 
                Full-screen loader only when NOT in payment form.
                Showing it in payment form hides OTP/3DS overlays. 
            */}
            {isProcessing && <ProcessingLoader />}

            {view === 'summary' && renderSummary()}
            {view === 'payment' && renderPaymentForm()}
            {view === 'success' && renderSuccess()}
            {view === 'error' && renderError()}
        </div>
    );
};

export default PaymentModal;

