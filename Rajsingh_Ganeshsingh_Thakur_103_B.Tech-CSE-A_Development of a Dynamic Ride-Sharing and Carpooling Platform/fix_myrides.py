import re

with open('/Users/rajthakur/Desktop/InfoProject 2/frontend/src/pages/MyRides.jsx', 'r') as f:
    content = f.read()

new_return_block = """    return (
        <div style={{ padding: '1rem' }}>
            <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '16px', 
                padding: '2rem', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                border: '1px solid #f1f5f9'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem' }}>
                    <div style={{ backgroundColor: '#10b981', padding: '12px', borderRadius: '14px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Car size={26} />
                    </div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#10b981' }}>My Rides ({rides.length})</h2>
                </div>

                {rides.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                        <p style={{ color: '#9ca3af', fontSize: '1.1rem' }}>You haven't posted any rides yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        {rides.map(ride => (
                            <div key={ride.id} style={{
                                padding: '1.5rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: '#f0fdf4',
                                border: '1px solid #dcfce7',
                                borderRadius: '16px',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)'
                            }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                                        <div style={{ backgroundColor: '#dcfce7', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <MapPin size={18} color="#10b981" />
                                        </div>
                                        <span style={{ fontWeight: '800', fontSize: '1.15rem', color: '#1f2937' }}>{ride.source} &rarr; {ride.destination}</span>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '0.7rem',
                                            backgroundColor: '#dcfce7',
                                            color: '#166534',
                                            fontWeight: '800',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>{ride.status}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '25px', color: '#6b7280', fontSize: '0.85rem', fontWeight: '500', marginLeft: '45px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Calendar size={15} /> {formatDate(ride.dateTime)}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Clock size={15} /> {formatTime(ride.dateTime)}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Users size={15} /> {ride.availableSeats} seats
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estimated Fare</div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#10b981' }}>₹{ride.price}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            onClick={() => handleReschedule(ride)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                padding: '8px 18px', borderRadius: '8px', border: 'none',
                                                backgroundColor: '#3b82f6', color: 'white', cursor: 'pointer',
                                                fontWeight: '600', fontSize: '0.85rem',
                                                boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                                            }}
                                        >
                                            <Edit size={14} /> Reschedule
                                        </button>
                                        <button
                                            onClick={() => handleCancel(ride.id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                padding: '8px 18px', borderRadius: '8px', border: 'none',
                                                backgroundColor: '#ef4444', color: 'white', cursor: 'pointer',
                                                fontWeight: '600', fontSize: '0.85rem',
                                                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                                            }}
                                        >
                                            <Trash2 size={14} /> Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <NotificationModal
                isOpen={showNotify}
                onClose={() => setShowNotify(false)}
                title={notifyConfig.title}
                message={notifyConfig.message}
                type={notifyConfig.type}
            />
        </div>
    );"""

updated_content = re.sub(r'    return \(\n        <div style=\{\{ padding: \'1rem\' \}\}.*?    \);', new_return_block, content, flags=re.DOTALL)

with open('/Users/rajthakur/Desktop/InfoProject 2/frontend/src/pages/MyRides.jsx', 'w') as f:
    f.write(updated_content)

print("success")
