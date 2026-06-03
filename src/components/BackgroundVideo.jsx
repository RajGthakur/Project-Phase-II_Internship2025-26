import React from 'react';
import { useTheme } from '../context/ThemeContext';

const BackgroundVideo = () => {
    const { isDarkMode } = useTheme();

    // High-quality video source (Reliable public link)
    const videoSrc = "/assets/videos/background.mp4";
    //const posterSrc = "/assets/images/video_poster.png";

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: -1,
            overflow: 'hidden',
            backgroundColor: isDarkMode ? '#0f172a' : '#f0f9ff'
        }}>
            <video
                autoPlay
                loop
                muted
                playsInline
                //poster={posterSrc}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: isDarkMode ? 0.7 : 0.85,
                    filter: `brightness(${isDarkMode ? '0.6' : '1.0'}) contrast(1.15)`,
                    transition: 'opacity 0.5s ease',
                    position: 'absolute',
                    top: 0,
                    left: 0
                }}
            >
                <source src={videoSrc} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Subtle Overlay to ensure readability while keeping video clear */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: isDarkMode
                    ? 'rgba(15, 23, 42, 0.4)'
                    : 'rgba(255, 255, 255, 0.1)',
                zIndex: 1
            }}></div>
        </div>
    );
};

export default BackgroundVideo;
