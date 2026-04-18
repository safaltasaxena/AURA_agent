import React from 'react';
import { MapPin } from 'lucide-react';

export default function MapPlaceholder() {
  return (
    <div style={styles.container}>
      <div style={styles.mapGrid}>
        <div style={styles.pulsePoint}>
          <MapPin size={24} color="var(--accent-primary)" />
          <div style={styles.pulseRing}></div>
        </div>
      </div>
      <div style={styles.overlay}>
        <h3 style={styles.title}>Interactive Map</h3>
        <p style={styles.subtitle}>Dynamic routing will appear here</p>
      </div>

      <style>{`
        .map-pulse-ring {
          position: absolute;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid var(--accent-primary);
          animation: mapPulse 2s infinite;
        }

        @keyframes mapPulse {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
    background: 'rgba(0,0,0,0.2)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    backgroundPosition: 'center center',
    transform: 'perspective(500px) rotateX(60deg) translateY(-100px)',
    transformOrigin: 'top center',
  },
  pulsePoint: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  pulseRing: {
    position: 'absolute',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '2px solid var(--accent-primary)',
    animation: 'mapPulse 2s infinite',
  },
  overlay: {
    position: 'absolute',
    zIndex: 20,
    bottom: '40px',
    textAlign: 'center',
    background: 'rgba(30, 41, 59, 0.8)',
    backdropFilter: 'blur(8px)',
    padding: '12px 24px',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  title: {
    margin: 0,
    fontSize: '1rem',
    color: 'var(--text-primary)',
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  }
};
