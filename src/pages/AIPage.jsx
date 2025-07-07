import Chatbot from '../components/Chatbot';
import OllamaStatus from '../components/OllamaStatus';
import './AIPage.css';

const AIPage = ({ darkMode, setDarkMode }) => {
  return (
    <div className="ai-page">
      <div className="ai-header">
        <h1 className="ai-title">🤖 AI DevOps Assistant</h1>
        <button 
          className="theme-toggle" 
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
      
      <OllamaStatus />
      <Chatbot />
    </div>
  );
};

export default AIPage; 