import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Upload } from 'lucide-react';
import NotificationModal from '../components/NotificationModal';
import { useTheme } from '../context/ThemeContext';
import BackgroundVideo from '../components/BackgroundVideo';
import ThemeToggle from '../components/ThemeToggle';
import CarLoader from '../components/CarLoader';

// InputField Component extracted to prevent re-renders losing focus
const InputField = ({ label, name, type = "text", placeholder, required = true, value, onChange, onBlur, error, maxLength }) => (
    <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{label} {required && '*'}</label>
        <input
            className={`input-field ${error ? 'input-error' : ''}`}
            type={type}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            maxLength={maxLength}
            style={{ 
                borderColor: error ? '#ef4444' : 'rgba(255, 255, 255, 0.15)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'inherit',
                borderRadius: '12px',
                backdropFilter: 'none'
            }}
        />
        {error && <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>{error}</span>}
    </div>
);

const MultiStepRegister = () => {
    const { role } = useParams();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // Step 1: Personal
        name: '',
        username: '', // email/username
        contactNumber: '',
        gender: '',
        dateOfBirth: '',

        // Step 2: Address
        plotNo: '',
        street: '', // Area/Street
        landmark: '',
        pincode: '',
        city: '',
        state: '',
        country: '',

        // Step 3: Education
        school10: '',
        passingYear10: '',
        tenthPercentage: '',

        school12: '',
        passingYear12: '',
        twelfthPercentage: '',

        graduationCollege: '',
        graduationYear: '',
        graduationPercentage: '',

        // Step 4: Documents
        documentType: 'aadhar', // 'aadhar' or 'pan'
        documentFile: null,
        aadharCardId: '',
        panCardId: '',


    });

    const [errors, setErrors] = useState({});
    const [isEmailTaken, setIsEmailTaken] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showNotifyModal, setShowNotifyModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'info' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Prevent numbers in 'name' (Full Name) field
        if (name === 'name') {
            const regex = /^[A-Za-z\s]*$/;
            if (!regex.test(value)) {
                return; // Don't update state if non-letters are entered
            }
        }

        // Prevent non-digits in 'contactNumber', 'pincode', and year fields
        if (['contactNumber', 'pincode', 'passingYear10', 'passingYear12', 'graduationYear'].includes(name)) {
            const regex = /^[0-9]*$/;
            if (!regex.test(value)) {
                return; // Only allow digits
            }
        }

        // Handle percentage fields specifically to allow only digits and ONE decimal point
        if (['tenthPercentage', 'twelfthPercentage', 'graduationPercentage'].includes(name)) {
            const regex = /^[0-9]*\.?[0-9]*$/;
            if (!regex.test(value)) {
                return; // Only allow digits and decimal points
            }
        }

        setFormData({ ...formData, [name]: value });

        // Clear errors and reset email taken status when user types
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
        if (name === 'username') {
            setIsEmailTaken(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            const fileName = file.name;
            setFormData({
                ...formData,
                documentFile: file,
                [formData.documentType === 'aadhar' ? 'aadharCardId' : 'panCardId']: fileName
            });
            // Clear error when file is uploaded
            setErrors({ ...errors, documentFile: '' });
        }
    };

    const validateStep = (currentStep) => {
        let newErrors = {};
        let isValid = true;

        if (currentStep === 1) {
            if (!formData.name) {
                newErrors.name = 'Full Name is required';
            } else if (!/^[A-Za-z\s]+$/.test(formData.name)) {
                newErrors.name = 'Full Name must contain only letters';
            }
            if (!formData.username) newErrors.username = 'Username/Email is required';
            if (!formData.contactNumber) {
                newErrors.contactNumber = 'Contact Number is required';
            } else if (!/^\d{10}$/.test(formData.contactNumber)) {
                newErrors.contactNumber = 'Contact Number must be exactly 10 digits';
            }

            if (!formData.gender) newErrors.gender = 'Gender is required';
            if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of Birth is required';


        }
        else if (currentStep === 2) {
            if (!formData.plotNo) {
                newErrors.plotNo = 'Plot/House No is required';
            } else if (!/^[A-Za-z0-9\s/,-]+$/.test(formData.plotNo)) {
                newErrors.plotNo = 'Plot/House No can contain letters, numbers, and separators (/, -)';
            }
            if (!formData.street) newErrors.street = 'Area/Street is required';
            if (!formData.pincode) {
                newErrors.pincode = 'Pincode is required';
            } else if (!/^\d+$/.test(formData.pincode)) {
                newErrors.pincode = 'Pincode must be numbers only';
            }
            if (!formData.city) newErrors.city = 'City is required';
            if (!formData.state) newErrors.state = 'State is required';
            if (!formData.country) newErrors.country = 'Country is required';
        }
        else if (currentStep === 3) {
            if (!formData.school10) newErrors.school10 = '10th School Name is required';
            if (!formData.passingYear10) newErrors.passingYear10 = '10th Passing Year is required';
            if (!formData.tenthPercentage) newErrors.tenthPercentage = '10th Percentage is required';

            if (!formData.school12) newErrors.school12 = '12th School/College Name is required';
            if (!formData.passingYear12) newErrors.passingYear12 = '12th Passing Year is required';
            if (!formData.twelfthPercentage) newErrors.twelfthPercentage = '12th Percentage is required';

            if (!formData.graduationCollege) newErrors.graduationCollege = 'Graduation College Name is required';
            if (!formData.graduationYear) newErrors.graduationYear = 'Graduation Passing Year is required';
            if (!formData.graduationPercentage) newErrors.graduationPercentage = 'Graduation Percentage is required';
        }
        else if (currentStep === 4) {
            if (!formData.documentFile) newErrors.documentFile = 'Please upload a document';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            isValid = false;
        }

        return isValid;
    };

    const handleNext = async () => {
        // If on step 1, perform a final check for email existence
        if (step === 1) {
            if (!validateStep(1)) {
                setModalConfig({
                    title: 'Required Fields',
                    message: 'Please fill all required fields correctly. Check for red error messages.',
                    type: 'info'
                });
                setShowNotifyModal(true);
                return;
            }

            // Final check against backend for email
            try {
                const response = await fetch(`http://localhost:8080/api/auth/check-email?email=${encodeURIComponent(formData.username)}`);
                const exists = await response.json();
                if (exists) {
                    setIsEmailTaken(true);
                    setErrors({ ...errors, username: 'This email is already registered' });
                    setModalConfig({
                        title: 'Email Already in Use',
                        message: `The email ${formData.username} is already registered. Please use a different email.`,
                        type: 'error'
                    });
                    setShowNotifyModal(true);
                    return;
                }
            } catch (error) {
                console.error('Error checking email:', error);
            }
        }

        if (validateStep(step)) {
            setStep(step + 1);
        } else {
            setModalConfig({
                title: 'Required Fields',
                message: 'Please fill all required fields correctly.',
                type: 'info'
            });
            setShowNotifyModal(true);
        }
    };

    const handleEmailBlur = async (e) => {
        const email = e.target.value;
        if (!email || !email.includes('@')) return;

        try {
            const response = await fetch(`http://localhost:8080/api/auth/check-email?email=${encodeURIComponent(email)}`);
            const exists = await response.json();

            if (exists) {
                setIsEmailTaken(true);
                setErrors({ ...errors, username: 'This email is already registered' });
                setModalConfig({
                    title: 'Email Already in Use',
                    message: `The email ${email} is already registered. Please use a different email or login.`,
                    type: 'error'
                });
                setShowNotifyModal(true);
            } else {
                setIsEmailTaken(false);
            }
        } catch (error) {
            console.error('Error checking email:', error);
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(4)) {
            setModalConfig({
                title: 'No Document Uploaded',
                message: 'Please upload a document (Aadhar Card or PAN Card) before submitting.',
                type: 'error'
            });
            setShowNotifyModal(true);
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                role: role,
                aadharCardId: formData.documentType === 'aadhar' ? formData.aadharCardId : null,
                panCardId: formData.documentType === 'pan' ? formData.panCardId : null
            };

            delete payload.documentType;
            delete payload.documentFile;

            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setShowSuccessModal(true);
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            } else {
                const text = await response.text();
                setModalConfig({
                    title: 'Registration Failed',
                    message: text,
                    type: 'error'
                });
                setShowNotifyModal(true);
            }
        } catch (error) {
            console.error(error);
            setModalConfig({
                title: 'Error',
                message: 'An error occurred during registration.',
                type: 'error'
            });
            setShowNotifyModal(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'transparent',
            position: 'relative',
            overflow: 'hidden',
            padding: '2rem 0'
        }}>
            <BackgroundVideo />

            {isSubmitting && (
                <CarLoader 
                    text="Creating Your Account" 
                    subtext="Please wait while we set up your profile" 
                />
            )}

            <div className="container" style={{ maxWidth: '800px', margin: '3rem auto', paddingBottom: '3rem', position: 'relative', zIndex: 1 }}>
            <div className="card animate-fade-in" style={{
                backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.3)' : 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(15px)',
                WebkitBackdropFilter: 'blur(15px)',
                borderRadius: '2.5rem',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: isDarkMode ? '0 25px 60px -12px rgba(0,0,0,0.5)' : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                zIndex: 4, // Higher z-index to stay above background elements
                position: 'relative'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    {role === 'ADMIN' ? 'Admin' : role === 'DRIVER' ? 'Driver' : 'Passenger'} Registration
                </h2>

                {/* Progress Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '0', width: '100%', height: '2px', backgroundColor: '#e2e8f0', zIndex: 0, transform: 'translateY(-50%)' }} />
                    <div style={{ position: 'absolute', top: '50%', left: '0', width: `${((step - 1) / 3) * 100}%`, height: '2px', backgroundColor: 'var(--primary-color)', zIndex: 0, transform: 'translateY(-50%)', transition: 'width 0.3s ease' }} />

                    {['Personal', 'Address', 'Education', 'Documents'].map((label, index) => {
                        const num = index + 1;
                        return (
                            <div key={num} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    backgroundColor: step >= num ? 'var(--primary-color)' : 'var(--bg-main)',
                                    color: step >= num ? 'white' : 'var(--text-muted)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    fontWeight: 'bold',
                                    marginBottom: '0.5rem',
                                    transition: 'all 0.3s ease'
                                }}>
                                    {step > num ? <CheckCircle size={20} /> : num}
                                </div>
                                <span style={{ fontSize: '0.8rem', color: step >= num ? 'var(--text-main)' : 'var(--text-muted)' }}>{label}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Step 1: Personal Details */}
                {step === 1 && (
                    <div className="animate-fade-in">
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--secondary-color)' }}>Personal Details</h3>
                <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <InputField label="Full Name" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} error={errors.name} />
                    <InputField
                        label="Username/Email"
                        name="username"
                        placeholder="john@example.com"
                        value={formData.username}
                        onChange={handleChange}
                        onBlur={handleEmailBlur}
                        error={errors.username}
                    />
                    <InputField label="Contact Number" name="contactNumber" placeholder="9876543210" value={formData.contactNumber} onChange={handleChange} error={errors.contactNumber} maxLength={10} />
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Gender *</label>
                        <select className="input-field" name="gender" onChange={handleChange} value={formData.gender} style={{ borderColor: errors.gender ? '#ef4444' : '', height: '48px' }}>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors.gender && <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>{errors.gender}</span>}
                    </div>
                    <InputField label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} error={errors.dateOfBirth} />
                </div>
            </div>
        )}

        {/* Step 2: Address */}
        {step === 2 && (
            <div className="animate-fade-in">
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--secondary-color)' }}>Address Details</h3>
                <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <InputField label="Plot No / House No" name="plotNo" placeholder="Flat 101" value={formData.plotNo} onChange={handleChange} error={errors.plotNo} />
                    <InputField label="Area / Street" name="street" placeholder="Main Street" value={formData.street} onChange={handleChange} error={errors.street} />
                    <InputField label="Landmark (Optional)" name="landmark" placeholder="Near Park" required={false} value={formData.landmark} onChange={handleChange} error={errors.landmark} />
                    <InputField label="City" name="city" placeholder="Mumbai" value={formData.city} onChange={handleChange} error={errors.city} />
                    <InputField label="Pincode" name="pincode" placeholder="400001" value={formData.pincode} onChange={handleChange} error={errors.pincode} />
                    <InputField label="State" name="state" placeholder="Maharashtra" value={formData.state} onChange={handleChange} error={errors.state} />
                    <InputField label="Country" name="country" placeholder="India" value={formData.country} onChange={handleChange} error={errors.country} />
                </div>
            </div>
        )}

        {/* Step 3: Education */}
        {step === 3 && (
            <div className="animate-fade-in">
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--secondary-color)' }}>Educational Details</h3>
                <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div style={{ gridColumn: '1 / -1', fontWeight: 'bold', marginTop: '1rem', color: 'var(--primary-color)' }}>10th Standard</div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <InputField label="School Name" name="school10" placeholder="St. Mary's School" value={formData.school10} onChange={handleChange} error={errors.school10} />
                    </div>
                    <InputField label="Passing Year" name="passingYear10" type="text" placeholder="2019" value={formData.passingYear10} onChange={handleChange} error={errors.passingYear10} />
                    <InputField label="Percentage" name="tenthPercentage" type="text" placeholder="85.5" value={formData.tenthPercentage} onChange={handleChange} error={errors.tenthPercentage} />

                    <div style={{ gridColumn: '1 / -1', fontWeight: 'bold', marginTop: '1rem', color: 'var(--primary-color)' }}>12th Standard</div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <InputField label="School/College Name" name="school12" placeholder="Junior College" value={formData.school12} onChange={handleChange} error={errors.school12} />
                    </div>
                    <InputField label="Passing Year" name="passingYear12" type="text" placeholder="2021" value={formData.passingYear12} onChange={handleChange} error={errors.passingYear12} />
                    <InputField label="Percentage" name="twelfthPercentage" type="text" placeholder="88.0" value={formData.twelfthPercentage} onChange={handleChange} error={errors.twelfthPercentage} />

                    <div style={{ gridColumn: '1 / -1', fontWeight: 'bold', marginTop: '1rem', color: 'var(--primary-color)' }}>Graduation</div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <InputField label="College Name" name="graduationCollege" placeholder="IIT Bombay" value={formData.graduationCollege} onChange={handleChange} error={errors.graduationCollege} />
                    </div>
                    <InputField label="Passing Year" name="graduationYear" type="text" placeholder="2025" value={formData.graduationYear} onChange={handleChange} error={errors.graduationYear} />
                    <InputField label="Percentage (CGPA/%)" name="graduationPercentage" type="text" placeholder="8.5" value={formData.graduationPercentage} onChange={handleChange} error={errors.graduationPercentage} />
                </div>
            </div>
        )}

                {/* Step 4: Documents */}
                {step === 4 && (
                    <div className="animate-fade-in">
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--secondary-color)' }}>Document Upload</h3>
                        <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Please upload either your Aadhar Card or PAN Card for verification.</p>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ marginRight: '2rem', cursor: 'pointer', fontSize: '1.1rem' }}>
                                <input
                                    type="radio"
                                    name="documentType"
                                    value="aadhar"
                                    checked={formData.documentType === 'aadhar'}
                                    onChange={handleChange}
                                    style={{ marginRight: '0.5rem' }}
                                />
                                Aadhar Card
                            </label>
                            <label style={{ cursor: 'pointer', fontSize: '1.1rem' }}>
                                <input
                                    type="radio"
                                    name="documentType"
                                    value="pan"
                                    checked={formData.documentType === 'pan'}
                                    onChange={handleChange}
                                    style={{ marginRight: '0.5rem' }}
                                />
                                PAN Card
                            </label>
                        </div>

                        <div style={{
                            border: '2px dashed var(--glass-border)',
                            padding: '3rem',
                            textAlign: 'center',
                            borderRadius: '1rem',
                            backgroundColor: 'var(--bg-main)',
                            cursor: 'pointer'
                        }}>
                            <Upload size={48} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
                            <p>Upload {formData.documentType === 'aadhar' ? 'Aadhar Card' : 'PAN Card'}</p>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                style={{ marginTop: '1rem' }}
                            />
                            {formData.documentFile && (
                                <p style={{ marginTop: '1rem', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <CheckCircle size={16} /> Selected: {formData.documentFile.name}
                                </p>
                            )}
                            {errors.documentFile && <p style={{ color: '#ef4444', marginTop: '1rem' }}>{errors.documentFile}</p>}
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem' }}>
                    <button
                        className="button"
                        onClick={() => setStep(step - 1)}
                        disabled={step === 1}
                        style={{
                            opacity: step === 1 ? 0 : 1,
                            pointerEvents: step === 1 ? 'none' : 'auto',
                            background: '#64748b', // Solid visible background
                            color: 'white',
                            border: 'none',
                            fontWeight: 'bold'
                        }}
                    >
                        Back
                    </button>

                    {step < 4 ? (
                        <button className="button" onClick={handleNext}>Next</button>
                    ) : (
                        <button className="button" onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit Registration'}
                        </button>
                    )}
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'var(--card-bg)',
                        padding: '3rem',
                        borderRadius: '1rem',
                        textAlign: 'center',
                        color: 'var(--text-main)',
                        maxWidth: '400px',
                        border: '1px solid var(--glass-border)'
                    }}>
                        <CheckCircle size={64} color="#10b981" style={{ marginBottom: '1rem' }} />
                        <h2 style={{ marginBottom: '1rem', color: '#10b981' }}>Successfully Submitted!</h2>
                        <p>Your registration is Successfully Submitted. You will be redirected to login shortly.</p>
                    </div>
                </div>
            )}

            <NotificationModal
                isOpen={showNotifyModal}
                onClose={() => setShowNotifyModal(false)}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
            />
        </div>
        </div>
    );
};

export default MultiStepRegister;
