import { useState, useRef, useEffect } from 'react';
import apiService from '../services/api';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState('initializing');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check AI status on component mount
  useEffect(() => {
    const checkAiStatus = async () => {
      try {
        const status = await apiService.getDistilGPT2Status();
        if (status.available) {
          setAiStatus('available');
        } else {
          setAiStatus('fallback');
        }
      } catch (error) {
        console.error('Error checking AI status:', error);
        setAiStatus('fallback');
      }
    };
    
    checkAiStatus();
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const data = await apiService.chat([...messages, userMessage]);
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response,
        provider: data.provider,
        model: data.model,
        fallback: data.fallback
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '⚠️ Sorry, I encountered an error. Please try again.',
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getProviderIcon = (provider, fallback) => {
    if (fallback) return '🔄';
    if (provider === 'distilgpt2') return '🤖';
    if (provider === 'ollama') return '🤖';
    return '💬';
  };

  const getProviderText = (provider, model, fallback) => {
    if (fallback) return 'Fallback Response';
    if (provider === 'distilgpt2') return `DistilGPT2 (In-browser AI)`;
    if (provider === 'ollama') return `Ollama (${model || 'Qwen3'})`;
    return 'AI Response';
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="chatbot">
      <div className="chat-container">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="welcome-message">
              <div className="welcome-content">
                <h2>🤖 DevOps AI Assistant</h2>
                <div className="ai-status">
                  {aiStatus === 'initializing' && (
                    <div className="status-indicator initializing">
                      🔄 Initializing AI...
                    </div>
                  )}
                  {aiStatus === 'available' && (
                    <div className="status-indicator available">
                      ✅ AI Available (DistilGPT2)
                    </div>
                  )}
                  {aiStatus === 'fallback' && (
                    <div className="status-indicator fallback">
                      🔄 Using Intelligent Responses
                    </div>
                  )}
                </div>
                <p>Hello! I'm here to help you with all things DevOps. I can assist with:</p>
                <div className="capabilities-grid">
                  <div className="capability">
                    <span className="capability-icon">🚀</span>
                    <span>CI/CD Pipelines</span>
                  </div>
                  <div className="capability">
                    <span className="capability-icon">🐳</span>
                    <span>Docker & Containers</span>
                  </div>
                  <div className="capability">
                    <span className="capability-icon">☸️</span>
                    <span>Kubernetes</span>
                  </div>
                  <div className="capability">
                    <span className="capability-icon">🏗️</span>
                    <span>Infrastructure as Code</span>
                  </div>
                  <div className="capability">
                    <span className="capability-icon">🔒</span>
                    <span>Security Best Practices</span>
                  </div>
                  <div className="capability">
                    <span className="capability-icon">📊</span>
                    <span>Monitoring & Observability</span>
                  </div>
                </div>
                <p>Just ask me anything!</p>
              </div>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div key={index} className={`message-wrapper ${message.role}`}>
              <div className="message-container">
                <div className="message-avatar">
                  {message.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-content">
                  <div className="message-text">
                    {message.content}
                  </div>
                  {message.provider && (
                    <div className="message-meta">
                      <span className={`provider ${message.fallback ? 'fallback' : 'primary'}`}>
                        {getProviderIcon(message.provider, message.fallback)} {getProviderText(message.provider, message.model, message.fallback)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="message-wrapper assistant">
              <div className="message-container">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="loading-indicator">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <div className="input-actions">
              {messages.length > 0 && (
                <button onClick={clearChat} className="clear-chat-btn" title="Clear chat">
                  🗑️ Clear
                </button>
              )}
            </div>
            <div className="input-area">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a DevOps question..."
                rows="1"
                disabled={loading}
                className="chat-input"
              />
              <button 
                onClick={sendMessage} 
                disabled={loading || !inputMessage.trim()}
                className={`send-button ${loading ? 'loading' : ''}`}
                title="Send message"
              >
                {loading ? (
                  <div className="send-loading">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                ) : (
                  '📤'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot; 