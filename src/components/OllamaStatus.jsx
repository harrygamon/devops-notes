import { useState, useEffect } from 'react';
import apiService from '../services/api';
import './OllamaStatus.css';

const OllamaStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pulling, setPulling] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const ollamaStatus = await apiService.getOllamaStatus();
      setStatus(ollamaStatus);
    } catch (error) {
      console.error('Error checking Ollama status:', error);
      setStatus({ available: false, models: [], currentModel: null });
    } finally {
      setLoading(false);
    }
  };

  const pullModel = async () => {
    setPulling(true);
    try {
      const success = await apiService.pullQwenModel();
      if (success) {
        await checkStatus(); // Refresh status
      }
    } catch (error) {
      console.error('Error pulling model:', error);
    } finally {
      setPulling(false);
    }
  };

  if (loading) {
    return (
      <div className="ollama-status">
        <div className="status-loading">🔍 Checking Ollama status...</div>
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
        {status.available ? (
          <div className="status-available">
            <div className="status-indicator available">
              ✅ Ollama is running
            </div>
            
            <div className="models-list">
              <h4>Available Models:</h4>
              {status.models.length > 0 ? (
                <ul>
                  {status.models.map((model, index) => (
                    <li key={index} className={model.name.includes('qwen') ? 'current-model' : ''}>
                      {model.name} ({model.size ? `${(model.size / 1024 / 1024 / 1024).toFixed(1)}GB` : 'Unknown size'})
                      {model.name.includes('qwen') && ' (Current)'}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No models found</p>
              )}
            </div>
            
            {!status.models.some(m => m.name.includes('qwen')) && (
              <div className="model-actions">
                <p>Qwen3 model not found. Pull it to enable AI features:</p>
                <button 
                  onClick={pullModel} 
                  className="pull-btn"
                  disabled={pulling}
                >
                  {pulling ? '📥 Pulling Qwen3...' : '📥 Pull Qwen3 Model'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="status-unavailable">
            <div className="status-indicator unavailable">
              ❌ Ollama not available
            </div>
            
            <div className="setup-instructions">
              <h4>Setup Instructions:</h4>
              <ol>
                <li>
                  <strong>Install Ollama:</strong>
                  <a href="https://ollama.ai/download" target="_blank" rel="noopener noreferrer">
                    Download from ollama.ai
                  </a>
                </li>
                <li>
                  <strong>Start Ollama:</strong>
                  <code>ollama serve</code>
                </li>
                <li>
                  <strong>Pull Qwen3 model:</strong>
                  <code>ollama pull qwen2.5:3b</code>
                </li>
                <li>
                  <strong>Refresh this page</strong>
                </li>
              </ol>
              
              <div className="terminal-commands">
                <h5>Quick Setup Commands:</h5>
                <pre>
{`# Install Ollama (Linux/macOS)
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama
ollama serve

# Pull Qwen3 model
ollama pull qwen2.5:3b`}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="status-footer">
        <p>
          <strong>Note:</strong> The app will use fallback responses when Ollama is not available.
        </p>
      </div>
    </div>
  );
};

export default OllamaStatus; 