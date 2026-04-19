import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, User, Loader2 } from 'lucide-react';

export default function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi there! I'm Aura. I can help you find food, restrooms, gates, or exits. Where would you like to go?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState('normal');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // STRICT URL RESOLUTION
      const rawApiUrl = import.meta.env.VITE_API_URL || '';
      const cleanApiUrl = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;
      const finalUrl = cleanApiUrl || (import.meta.env.DEV ? 'http://localhost:8080' : '');

      const requestUrl = `${finalUrl}/api/chat`;
      console.log("🚀 [DEBUG] Sending request to:", requestUrl);
      console.log("📦 [DEBUG] Payload:", { message: userMessage.text, userType });

      const response = await axios.post(requestUrl, {
        message: userMessage.text,
        userType: userType
      });

      console.log("✅ [DEBUG] Response received:", response.data);

      const botMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        sender: 'bot',
        recommendation: response.data.recommendation
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("❌ [DEBUG] Chat Request Failed:", error);
      if (error.response) {
        console.error("❌ [DEBUG] Server responded with:", error.response.status, error.response.data);
      } else if (error.request) {
        console.error("❌ [DEBUG] No response received. CORS or Network error.");
      }

      const errorMessage = {
        id: Date.now() + 1,
        text: `Connection Error: ${error.message}. (See console for details)`,
        sender: 'bot',
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          <Bot size={20} color="var(--accent-primary)" />
          <h2>Aura Assistant</h2>
        </div>
      </div>

      <div style={styles.messagesContainer}>
        {messages.map((msg) => (
          <div key={msg.id} style={msg.sender === 'user' ? styles.messageWrapperUser : styles.messageWrapperBot}>
            <div style={msg.sender === 'user' ? styles.avatarUser : styles.avatarBot}>
              {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div style={msg.sender === 'user' ? styles.messageUser : styles.messageBot}>
              <p style={styles.messageText}>{msg.text}</p>

              {msg.recommendation && (
                <div style={styles.recommendationCard}>
                  <h4 style={styles.recTitle}>{msg.recommendation.name}</h4>
                  <div style={styles.recStats}>
                    <div style={styles.stat}>
                      <span style={styles.statLabel}>Distance</span>
                      <span style={styles.statValue}>{msg.recommendation.distance}m</span>
                    </div>
                    <div style={styles.stat}>
                      <span style={styles.statLabel}>Wait</span>
                      <span style={styles.statValue}>{msg.recommendation.waitTime}m</span>
                    </div>
                    <div style={styles.stat}>
                      <span style={styles.statLabel}>Crowd</span>
                      <span style={styles.statValue}>
                        <div style={styles.crowdBar}>
                          <div style={{
                            ...styles.crowdFill,
                            width: `${msg.recommendation.crowdLevel}%`,
                            background: msg.recommendation.crowdLevel > 70 ? '#ef4444' :
                              msg.recommendation.crowdLevel > 40 ? '#f59e0b' : '#10b981'
                          }}></div>
                        </div>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={styles.messageWrapperBot}>
            <div style={styles.avatarBot}>
              <Bot size={16} />
            </div>
            <div style={styles.loadingBubble}>
              <Loader2 size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
              <span>Aura is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} style={styles.inputForm} aria-label="Chat input form">
        <label htmlFor="userTypeSelect" style={{ display: 'none' }}>Recommendation Preference</label>
        <select
          id="userTypeSelect"
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          style={styles.select}
          title="Recommendation Preference"
          aria-label="Select recommendation preference"
        >
          <option value="normal">Normal</option>
          <option value="fast">Fast (Wait Time)</option>
          <option value="lazy">Lazy (Distance)</option>
          <option value="urgent">Urgent (Immediate)</option>
        </select>
        <label htmlFor="chatInput" style={{ display: 'none' }}>Message Aura</label>
        <input
          id="chatInput"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Aura something..."
          style={styles.input}
          aria-label="Message input"
        />
        <button 
          type="submit" 
          disabled={!input.trim() || loading} 
          style={styles.sendButton}
          aria-label="Send message"
        >
          <Send size={18} aria-hidden="true" />
        </button>
      </form>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'var(--bg-panel)',
  },
  header: {
    padding: '20px',
    borderBottom: '1px solid var(--border-color)',
    background: 'rgba(255,255,255,0.02)',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  messageWrapperUser: {
    display: 'flex',
    gap: '12px',
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
    maxWidth: '85%',
  },
  messageWrapperBot: {
    display: 'flex',
    gap: '12px',
    alignSelf: 'flex-start',
    maxWidth: '85%',
  },
  avatarUser: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarBot: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    color: 'var(--accent-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  messageUser: {
    background: 'var(--accent-primary)',
    padding: '12px 16px',
    borderRadius: '16px',
    borderTopRightRadius: '4px',
  },
  messageBot: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-color)',
    padding: '12px 16px',
    borderRadius: '16px',
    borderTopLeftRadius: '4px',
  },
  messageText: {
    lineHeight: '1.5',
    fontSize: '0.95rem',
  },
  loadingBubble: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-color)',
    padding: '12px 16px',
    borderRadius: '16px',
    borderTopLeftRadius: '4px',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
  },
  recommendationCard: {
    marginTop: '12px',
    padding: '12px',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  recTitle: {
    margin: '0 0 10px 0',
    color: 'var(--text-primary)',
    fontSize: '1rem',
  },
  recStats: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  crowdBar: {
    width: '60px',
    height: '6px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '3px',
    marginTop: '4px',
    overflow: 'hidden',
  },
  crowdFill: {
    height: '100%',
    borderRadius: '3px',
  },
  inputForm: {
    padding: '20px',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    gap: '12px',
    background: 'rgba(0,0,0,0.1)',
  },
  select: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-color)',
    borderRadius: '24px',
    padding: '0 15px',
    color: 'var(--text-primary)',
    outline: 'none',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  input: {
    flex: 1,
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-color)',
    borderRadius: '24px',
    padding: '12px 20px',
    color: 'var(--text-primary)',
    outline: 'none',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  },
  sendButton: {
    background: 'var(--accent-primary)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s, background-color 0.2s',
  }
};
