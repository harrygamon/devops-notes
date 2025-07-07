import Chatbot from '../components/Chatbot';
import DistilGPT2Status from '../components/OllamaStatus';
import './AIPage.css';

const AIPage = ({ darkMode, setDarkMode }) => {
  return (
    <div className="ai-page">
      <div className="ai-header">
        <div className="ai-header-content">
          <h1 className="ai-title">🤖 AI DevOps Assistant</h1>
          <div className="ai-header-actions">
            <DistilGPT2Status />
            <button 
              className="theme-toggle" 
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="ai-content">
        <Chatbot />
      </div>
    </div>
  );
};

export default AIPage; 