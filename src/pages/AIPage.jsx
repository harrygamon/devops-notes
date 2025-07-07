import Chatbot from '../components/Chatbot';
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
      <Chatbot />
    </div>
  );
};

export default AIPage; 