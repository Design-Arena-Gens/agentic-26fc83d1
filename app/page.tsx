'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface AgentConfig {
  name: string;
  personality: string;
  expertise: string;
  temperature: number;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<AgentConfig>({
    name: 'Assistant IA',
    personality: 'professionnel et amical',
    expertise: 'assistance générale',
    temperature: 0.7,
  });
  const [showConfig, setShowConfig] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          config,
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'system',
        content: 'Erreur de connexion. Veuillez réessayer.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🤖 {config.name}</h1>
        <button
          onClick={() => setShowConfig(!showConfig)}
          style={styles.configButton}
        >
          ⚙️ Configuration
        </button>
      </div>

      {showConfig && (
        <div style={styles.configPanel}>
          <div style={styles.configGrid}>
            <div style={styles.configItem}>
              <label style={styles.label}>Nom de l'agent:</label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                style={styles.input}
              />
            </div>
            <div style={styles.configItem}>
              <label style={styles.label}>Personnalité:</label>
              <input
                type="text"
                value={config.personality}
                onChange={(e) => setConfig({ ...config, personality: e.target.value })}
                style={styles.input}
                placeholder="ex: amical, formel, humoristique"
              />
            </div>
            <div style={styles.configItem}>
              <label style={styles.label}>Expertise:</label>
              <input
                type="text"
                value={config.expertise}
                onChange={(e) => setConfig({ ...config, expertise: e.target.value })}
                style={styles.input}
                placeholder="ex: programmation, marketing, cuisine"
              />
            </div>
            <div style={styles.configItem}>
              <label style={styles.label}>Créativité: {config.temperature.toFixed(1)}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.temperature}
                onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                style={styles.slider}
              />
            </div>
          </div>
        </div>
      )}

      <div style={styles.chatContainer}>
        <div style={styles.messagesArea}>
          {messages.length === 0 && (
            <div style={styles.welcomeMessage}>
              <h2 style={styles.welcomeTitle}>Bienvenue! 👋</h2>
              <p style={styles.welcomeText}>
                Je suis {config.name}, votre agent IA personnalisé.
              </p>
              <p style={styles.welcomeText}>
                Spécialisé en: <strong>{config.expertise}</strong>
              </p>
              <p style={styles.welcomeText}>
                Posez-moi n'importe quelle question pour commencer!
              </p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                ...styles.message,
                ...(msg.role === 'user' ? styles.userMessage :
                    msg.role === 'system' ? styles.systemMessage :
                    styles.assistantMessage),
              }}
            >
              <div style={styles.messageHeader}>
                <strong>
                  {msg.role === 'user' ? '👤 Vous' :
                   msg.role === 'system' ? '⚠️ Système' :
                   `🤖 ${config.name}`}
                </strong>
                <span style={styles.timestamp}>
                  {msg.timestamp.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div style={styles.messageContent}>{msg.content}</div>
            </div>
          ))}
          {isLoading && (
            <div style={{ ...styles.message, ...styles.assistantMessage }}>
              <div style={styles.messageHeader}>
                <strong>🤖 {config.name}</strong>
              </div>
              <div style={styles.loadingDots}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={styles.inputContainer}>
          {messages.length > 0 && (
            <button onClick={clearChat} style={styles.clearButton}>
              🗑️ Effacer
            </button>
          )}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Écrivez votre message... (Entrée pour envoyer)"
            style={styles.textarea}
            disabled={isLoading}
            rows={3}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            style={{
              ...styles.sendButton,
              ...((!input.trim() || isLoading) && styles.sendButtonDisabled),
            }}
          >
            {isLoading ? '⏳' : '📤'} Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  title: {
    color: 'white',
    margin: 0,
    fontSize: '2rem',
    fontWeight: 'bold',
    textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
  },
  configButton: {
    padding: '10px 20px',
    background: 'rgba(255,255,255,0.2)',
    border: '2px solid white',
    borderRadius: '25px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'all 0.3s',
    backdropFilter: 'blur(10px)',
  },
  configPanel: {
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '15px',
    padding: '25px',
    marginBottom: '20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  },
  configGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  configItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#333',
    fontSize: '0.9rem',
  },
  input: {
    padding: '10px',
    borderRadius: '8px',
    border: '2px solid #e0e0e0',
    fontSize: '1rem',
    transition: 'border-color 0.3s',
  },
  slider: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
  },
  chatContainer: {
    background: 'rgba(255,255,255,0.98)',
    borderRadius: '20px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    height: 'calc(100vh - 180px)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  messagesArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  welcomeMessage: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666',
  },
  welcomeTitle: {
    fontSize: '2rem',
    marginBottom: '20px',
    color: '#667eea',
  },
  welcomeText: {
    fontSize: '1.1rem',
    marginBottom: '10px',
    lineHeight: '1.6',
  },
  message: {
    padding: '15px 20px',
    borderRadius: '15px',
    maxWidth: '80%',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    animation: 'slideIn 0.3s ease',
  },
  userMessage: {
    alignSelf: 'flex-end',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    marginLeft: 'auto',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    background: '#f5f5f5',
    color: '#333',
  },
  systemMessage: {
    alignSelf: 'center',
    background: '#fff3cd',
    color: '#856404',
    fontSize: '0.9rem',
    maxWidth: '60%',
  },
  messageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    fontSize: '0.9rem',
  },
  timestamp: {
    opacity: 0.7,
    fontSize: '0.8rem',
  },
  messageContent: {
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  loadingDots: {
    display: 'flex',
    gap: '5px',
    padding: '10px 0',
  },
  inputContainer: {
    padding: '20px',
    borderTop: '2px solid #e0e0e0',
    display: 'flex',
    gap: '10px',
    background: 'white',
    flexWrap: 'wrap',
  },
  clearButton: {
    padding: '10px 20px',
    background: '#ff6b6b',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    transition: 'all 0.3s',
  },
  textarea: {
    flex: 1,
    padding: '15px',
    borderRadius: '12px',
    border: '2px solid #e0e0e0',
    fontSize: '1rem',
    resize: 'none',
    fontFamily: 'inherit',
    minWidth: '250px',
  },
  sendButton: {
    padding: '15px 30px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'all 0.3s',
    whiteSpace: 'nowrap',
  },
  sendButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};
