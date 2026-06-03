import React, { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

const LocationInput = ({ value, onChange, placeholder, style, className, onSelectCoords, restrictedCity }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [inputValue, setInputValue] = useState(value || '');
    const debounceTimeout = useRef(null);
    const wrapperRef = useRef(null);
    const cache = useRef({}); // Cache for location API responses

    useEffect(() => {
        setInputValue(value || '');
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchSuggestions = async (query) => {
        if (!query.trim() || query.length < 3) {
            setSuggestions([]);
            return;
        }

        const finalQuery = restrictedCity ? `${query}, ${restrictedCity}` : query;

        if (cache.current[finalQuery]) {
            setSuggestions(cache.current[finalQuery]);
            setShowSuggestions(true);
            return;
        }

        try {
            // Using Nominatim for highly accurate India-restricted suggestions
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(finalQuery)}&countrycodes=in&limit=8&addressdetails=1`);
            const data = await res.json();

            const formattedSuggestions = data.map(item => {
                // Mapping logic tailored for Indian addresses
                const addr = item.address;
                const parts = [];
                
                // Primary label: Prefer building name, amenity, or road
                const primary = addr.building || addr.amenity || addr.shop || addr.office || addr.tourism || addr.railway || addr.road || addr.suburb;
                if (primary) parts.push(primary);
                
                // Area/City:
                const area = addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city;
                if (area && !parts.includes(area)) parts.push(area);
                
                // District/State:
                const higher = addr.city || addr.state_district || addr.state;
                if (higher && !parts.includes(higher)) parts.push(higher);

                // Country is always India due to API filter
                parts.push("India");

                const uniqueParts = [...new Set(parts)];

                return {
                    display_name: uniqueParts.join(', '),
                    lat: parseFloat(item.lat),
                    lon: parseFloat(item.lon)
                };
            }).filter(s => s.display_name);

            cache.current[finalQuery] = formattedSuggestions;
            setSuggestions(formattedSuggestions);
            setShowSuggestions(true);
        } catch (err) {
            console.error("Error fetching locations:", err);
        }
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setInputValue(val);
        onChange(val);

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => fetchSuggestions(val), 400);
    };

    const handleSelectSuggestion = (suggestion) => {
        const displayName = suggestion.display_name;
        setInputValue(displayName);
        onChange(displayName);
        setShowSuggestions(false);
        if (onSelectCoords) {
            onSelectCoords({ lat: suggestion.lat, lon: suggestion.lon });
        }
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
            <MapPin
                size={18}
                style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--primary-color)',
                    zIndex: 2,
                    pointerEvents: 'none'
                }}
            />
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                placeholder={placeholder}
                className={className || "input-field"}
                style={{
                    ...style,
                    paddingLeft: '2.75rem',
                    paddingRight: '2rem',
                    marginBottom: 0,
                    width: '100%',
                    borderRadius: '12px',
                    height: '48px'
                }}
            />
            {showSuggestions && suggestions.length > 0 && (
                <ul style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    marginTop: '8px',
                    padding: '8px',
                    listStyle: 'none',
                    backdropFilter: 'blur(10px)'
                }}>
                    {suggestions.map((s, idx) => (
                        <li
                            key={idx}
                            onClick={() => handleSelectSuggestion(s)}
                            style={{
                                padding: '12px 15px',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                color: 'var(--text-main)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--primary-color)';
                                e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = 'var(--text-main)';
                            }}
                        >
                            <MapPin size={16} />
                            <span>{s.display_name}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default LocationInput;
