import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Clock } from 'lucide-react';

export default function ZoneGrid() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const isDev = import.meta.env.DEV;
        const apiUrl = import.meta.env.VITE_API_URL || (isDev ? 'http://localhost:8080' : '');
        const response = await axios.get(`${apiUrl}/api/zones`);
        setZones(response.data);
      } catch (error) {
        console.error("Failed to fetch zones:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchZones();
    // Poll every 10s for updates
    const interval = setInterval(fetchZones, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div style={styles.container}><div style={styles.loading}>Loading map data...</div></div>;
  }

  const getCrowdColor = (level) => {
    if (level < 30) return '#10b981'; // Green
    if (level < 70) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Live Zone Map</h2>
      <div style={styles.grid}>
        {zones.map(zone => (
          <div key={zone.id} style={{...styles.card, borderTopColor: getCrowdColor(zone.crowdLevel)}}>
            <h3 style={styles.zoneName}>{zone.name}</h3>
            <span style={styles.category}>{zone.category}</span>
            <div style={styles.stats}>
              <div style={styles.statItem}>
                <Users size={16} color={getCrowdColor(zone.crowdLevel)} />
                <span style={{ color: getCrowdColor(zone.crowdLevel), fontWeight: '600', fontSize: '0.9rem' }}>
                  {zone.crowdLevel}% Crowd
                </span>
              </div>
              <div style={styles.statItem}>
                <Clock size={16} color="var(--text-secondary)" />
                <span style={styles.statText}>{zone.waitTime}m wait</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    height: '100%',
    padding: '24px',
    backgroundColor: 'var(--bg-panel)',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  header: {
    margin: '0 0 20px 0',
    color: 'var(--text-primary)',
    fontSize: '1.25rem',
  },
  loading: {
    color: 'var(--text-secondary)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
    width: '100%',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-color)',
    borderTopWidth: '4px',
    borderTopStyle: 'solid',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'transform 0.2s, background 0.2s',
  },
  zoneName: {
    margin: 0,
    fontSize: '1.1rem',
    color: 'var(--text-primary)',
  },
  category: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  stats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: 'auto',
    paddingTop: '12px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statText: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  }
};
