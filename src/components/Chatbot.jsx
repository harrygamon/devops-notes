import { useState } from 'react';
import apiService from '../services/api';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="chatbot">
      <div className="chat-header">
        <h2>🤖 AI DevOps Assistant</h2>
        <p>Ask me anything about DevOps, Docker, Kubernetes, CI/CD, and more!</p>
      </div>
      
      <div className="chat-window">
        {messages.length === 0 && (
          <div className="welcome-message">
            <p>👋 Hello! I'm your DevOps AI assistant. I can help you with:</p>
            <ul>
              <li>🚀 CI/CD pipeline questions</li>
              <li>🐳 Docker and containerization</li>
              <li>☸️ Kubernetes and orchestration</li>
              <li>🏗️ Infrastructure as Code (Terraform, CloudFormation)</li>
              <li>🔒 Security best practices</li>
              <li>📊 Monitoring and observability</li>
            </ul>
            <p>Just ask me anything!</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-content">
              {message.content}
            </div>
            {message.provider && (
              <div className="message-meta">
                <span className={`provider ${message.fallback ? 'fallback' : 'primary'}`}>
                  {message.fallback ? '🔄 Fallback' : '🤖 AI'}
                </span>
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="message assistant">
            <div className="loading-indicator">
              <span>🤔 Thinking...</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="input-area">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a DevOps question..."
          rows="2"
          disabled={loading}
        />
        <button 
          onClick={sendMessage} 
          disabled={loading || !inputMessage.trim()}
          className={loading ? 'loading' : ''}
        >
          {loading ? '⏳' : '📤'}
        </button>
      </div>
    </div>
  );
};

export default Chatbot; 