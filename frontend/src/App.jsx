import React from 'react';
import Chat from './components/Chat';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-container">
          <div className="logo-glow"></div>
          <h1>Aura</h1>
        </div>
        <p className="subtitle">Intelligent Navigation</p>
      </header>

      <main className="app-main">
        {/* LEFT PANEL (REPLACED MAP) */}
        <div className="panel map-panel">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              opacity: 0.7,
              color: "#fff",
              textAlign: "center",
              padding: "20px"
            }}
          >
            <div>
              <h2>🤖 Aura Assistant</h2>
              <p>Ask me anything about food, restrooms, gates, or exits.</p>
              <p style={{ fontSize: "14px", opacity: 0.7 }}>
                I analyze real-time crowd, wait time, and distance.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL (CHAT) */}
        <div className="panel chat-panel">
          <Chat />
        </div>
      </main>
    </div>
  );
}

export default App;
