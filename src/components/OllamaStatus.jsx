import { useState, useEffect } from 'react';
import apiService from '../services/api';
import './OllamaStatus.css';

const DistilGPT2Status = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setLoading(true);
    try {
      console.log('Checking DistilGPT2 status...');
      const distilGPT2Status = await apiService.getDistilGPT2Status();
      console.log('DistilGPT2 status result:', distilGPT2Status);
      setStatus(distilGPT2Status);
    } catch (error) {
      console.error('Error checking DistilGPT2 status:', error);
      setStatus({ 
        available: false, 
        loading: false,
        model: 'distilgpt2',
        provider: 'transformers.js',
        error: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ollama-status">
        <div className="status-loading">🔍 Checking DistilGPT2 status...</div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <div className="ollama-status">
      <div className="status-header">
        <h3>🤖 AI Model Status</h3>
        <button onClick={checkStatus} className="refresh-btn" disabled={loading}>
          🔄
        </button>
      </div>
      
      <div className="status-content">
        {status.loading ? (
          <div className="status-loading">
            <div className="status-indicator loading">
              📦 Loading DistilGPT2 model...
            </div>
            <p>This may take a few moments on first load. The model is ~80MB.</p>
          </div>
        ) : status.available ? (
          <div className="status-available">
            <div className="status-indicator available">
              ✅ DistilGPT2 is ready
            </div>
            
            <div className="model-info">
              <h4>Model Information:</h4>
              <ul>
                <li><strong>Model:</strong> {status.model}</li>
                <li><strong>Provider:</strong> {status.provider}</li>
                <li><strong>Type:</strong> In-browser AI (no server required)</li>
                <li><strong>Size:</strong> ~80MB (cached after first load)</li>
              </ul>
            </div>
            
            <div className="model-status">
              <p>✅ DistilGPT2 model loaded and ready to use!</p>
              <p><strong>Features:</strong> Chat responses, code review, and more</p>
            </div>
          </div>
        ) : (
          <div className="status-unavailable">
            <div className="status-indicator unavailable">
              ❌ DistilGPT2 not available
            </div>
            
            {status.error && (
              <div className="error-info">
                <p><strong>Error:</strong> {status.error}</p>
              </div>
            )}
            
            <div className="setup-instructions">
              <h4>About DistilGPT2:</h4>
              <ul>
                <li>✅ <strong>Works on GitHub Pages</strong> - No backend required</li>
                <li>✅ <strong>Privacy-focused</strong> - All processing happens in your browser</li>
                <li>✅ <strong>Offline capable</strong> - Works without internet after first load</li>
                <li>⚠️ <strong>Limited knowledge</strong> - Generic responses, not DevOps-specialized</li>
                <li>⚠️ <strong>Model size</strong> - ~80MB download on first use</li>
              </ul>
              
              <div className="troubleshooting">
                <h5>Troubleshooting:</h5>
                <ul>
                  <li>Make sure JavaScript is enabled in your browser</li>
                  <li>Check your internet connection for the initial model download</li>
                  <li>Try refreshing the page if the model fails to load</li>
                  <li>Check browser console for detailed error messages</li>
                  <li>Ensure you have sufficient memory available (~200MB free)</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="status-footer">
        <p>
          <strong>Note:</strong> DistilGPT2 is a general-purpose language model. For specialized DevOps knowledge, consider using a local AI model like Ollama with Qwen.
        </p>
        <p>
          <strong>Performance:</strong> Responses may take 2-5 seconds to generate, depending on your device.
        </p>
      </div>
    </div>
  );
};

export default DistilGPT2Status; 