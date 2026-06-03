import React from 'react';
import { Car } from 'lucide-react';

const CarLoader = ({ text = "Processing Your Request", subtext = "Please wait while we sync your data" }) => {
    return (
        <div className="car-loader-overlay">
            <div className="car-loader-container">
                <div className="car-track">
                    <div className="car-moving">
                        <Car size={48} color="#3b82f6" fill="#3b82f6" strokeWidth={1.5} />
                    </div>
                </div>
                <div className="car-loader-bar">
                    <div className="car-loader-progress"></div>
                </div>
                <div className="car-loader-text">{text}</div>
                <div className="car-loader-subtext">{subtext}</div>
            </div>
        </div>
    );
};

export default CarLoader;
