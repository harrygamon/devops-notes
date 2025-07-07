import { useState, useEffect } from 'react';
import './AdminPage.css';

const AdminPage = ({ darkMode, setDarkMode }) => {
  const [settings, setSettings] = useState({
    // AI Settings
    aiProvider: 'ollama',
    ollamaModel: 'qwen3',
    ollamaEndpoint: 'http://localhost:11434',
    enableFallback: true,
    maxTokens: 2000,
    
    // Security Settings
    sessionTimeout: 30,
    requirePasswordChange: false,
    enableAuditLog: true,
    
    // UI Settings
    autoSave: true,
    autoSaveInterval: 5,
    enableNotifications: true,
    compactMode: false,
    
    // Data Settings
    backupEnabled: true,
    backupInterval: 24,
    maxBackups: 10,
    exportFormat: 'json',
    
    // Performance Settings
    enableCaching: true,
    cacheExpiry: 60,
    enableCompression: true,
    
    // Integration Settings
    enableGitHubSync: false,
    enableSlackNotifications: false,
    enableEmailAlerts: false
  });

  const [activeTab, setActiveTab] = useState('ai');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('devops-admin-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    setIsSaving(true);
    setSaveStatus('Saving...');
    
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('devops-admin-settings', JSON.stringify(settings));
      setIsSaving(false);
      setSaveStatus('Settings saved successfully!');
      
      setTimeout(() => setSaveStatus(''), 3000);
    }, 1000);
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      aiProvider: 'ollama',
      ollamaModel: 'qwen3',
      ollamaEndpoint: 'http://localhost:11434',
      enableFallback: true,
      maxTokens: 2000,
      sessionTimeout: 30,
      requirePasswordChange: false,
      enableAuditLog: true,
      autoSave: true,
      autoSaveInterval: 5,
      enableNotifications: true,
      compactMode: false,
      backupEnabled: true,
      backupInterval: 24,
      maxBackups: 10,
      exportFormat: 'json',
      enableCaching: true,
      cacheExpiry: 60,
      enableCompression: true,
      enableGitHubSync: false,
      enableSlackNotifications: false,
      enableEmailAlerts: false
    };
    setSettings(defaultSettings);
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'devops-notes-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          setSettings(importedSettings);
          setSaveStatus('Settings imported successfully!');
          setTimeout(() => setSaveStatus(''), 3000);
        } catch (error) {
          setSaveStatus('Error importing settings. Invalid file format.');
          setTimeout(() => setSaveStatus(''), 3000);
        }
      };
      reader.readAsText(file);
    }
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.clear();
      setSaveStatus('All data cleared successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1 className="admin-title">⚙️ Admin Panel</h1>
          <div className="admin-header-actions">
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

      <div className="admin-content">
        <div className="admin-sidebar">
          <nav className="admin-nav">
            <button 
              className={`nav-tab ${activeTab === 'ai' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai')}
            >
              🤖 AI Settings
            </button>
            <button 
              className={`nav-tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              🔒 Security
            </button>
            <button 
              className={`nav-tab ${activeTab === 'ui' ? 'active' : ''}`}
              onClick={() => setActiveTab('ui')}
            >
              🎨 UI/UX
            </button>
            <button 
              className={`nav-tab ${activeTab === 'data' ? 'active' : ''}`}
              onClick={() => setActiveTab('data')}
            >
              💾 Data Management
            </button>
            <button 
              className={`nav-tab ${activeTab === 'performance' ? 'active' : ''}`}
              onClick={() => setActiveTab('performance')}
            >
              ⚡ Performance
            </button>
            <button 
              className={`nav-tab ${activeTab === 'integrations' ? 'active' : ''}`}
              onClick={() => setActiveTab('integrations')}
            >
              🔗 Integrations
            </button>
          </nav>
        </div>

        <div className="admin-main">
          <div className="settings-container">
            {/* AI Settings */}
            {activeTab === 'ai' && (
              <div className="settings-section">
                <h2>🤖 AI Configuration</h2>
                <p>Configure AI assistant behavior and model settings</p>
                
                <div className="setting-group">
                  <label className="setting-label">
                    <span>AI Provider</span>
                    <select 
                      value={settings.aiProvider}
                      onChange={(e) => handleSettingChange('aiProvider', e.target.value)}
                    >
                      <option value="ollama">Ollama (Local)</option>
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                    </select>
                  </label>
                </div>

                <div className="setting-group">
                  <label className="setting-label">
                    <span>Ollama Model</span>
                    <select 
                      value={settings.ollamaModel}
                      onChange={(e) => handleSettingChange('ollamaModel', e.target.value)}
                    >
                      <option value="qwen3">Qwen3 (Recommended)</option>
                      <option value="llama3">Llama3</option>
                      <option value="mistral">Mistral</option>
                      <option value="codellama">CodeLlama</option>
                    </select>
                  </label>
                </div>

                <div className="setting-group">
                  <label className="setting-label">
                    <span>Ollama Endpoint</span>
                    <input 
                      type="text"
                      value={settings.ollamaEndpoint}
                      onChange={(e) => handleSettingChange('ollamaEndpoint', e.target.value)}
                      placeholder="http://localhost:11434"
                    />
                  </label>
                </div>

                <div className="setting-group">
                  <label className="setting-label">
                    <span>Max Tokens</span>
                    <input 
                      type="number"
                      value={settings.maxTokens}
                      onChange={(e) => handleSettingChange('maxTokens', parseInt(e.target.value))}
                      min="100"
                      max="8000"
                    />
                  </label>
                </div>

                <div className="setting-group">
                  <label className="setting-label checkbox">
                    <input 
                      type="checkbox"
                      checked={settings.enableFallback}
                      onChange={(e) => handleSettingChange('enableFallback', e.target.checked)}
                    />
                    <span>Enable Fallback Responses</span>
                  </label>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="settings-section">
                <h2>🔒 Security Settings</h2>
                <p>Configure security and authentication settings</p>
                
                <div className="setting-group">
                  <label className="setting-label">
                    <span>Session Timeout (minutes)</span>
                    <input 
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                      min="5"
                      max="480"
                    />
                  </label>
                </div>

                <div className="setting-group">
                  <label className="setting-label checkbox">
                    <input 
                      type="checkbox"
                      checked={settings.requirePasswordChange}
                      onChange={(e) => handleSettingChange('requirePasswordChange', e.target.checked)}
                    />
                    <span>Require Password Change on Next Login</span>
                  </label>
                </div>

                <div className="setting-group">
                  <label className="setting-label checkbox">
                    <input 
                      type="checkbox"
                      checked={settings.enableAuditLog}
                      onChange={(e) => handleSettingChange('enableAuditLog', e.target.checked)}
                    />
                    <span>Enable Audit Logging</span>
                  </label>
                </div>
              </div>
            )}

            {/* UI Settings */}
            {activeTab === 'ui' && (
              <div className="settings-section">
                <h2>🎨 UI/UX Settings</h2>
                <p>Customize the user interface and experience</p>
                
                <div className="setting-group">
                  <label className="setting-label checkbox">
                    <input 
                      type="checkbox"
                      checked={settings.autoSave}
                      onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                    />
                    <span>Enable Auto-Save</span>
                  </label>
                </div>

                <div className="setting-group">
                  <label className="setting-label">
                    <span>Auto-Save Interval (seconds)</span>
                    <input 
                      type="number"
                      value={settings.autoSaveInterval}
                      onChange={(e) => handleSettingChange('autoSaveInterval', parseInt(e.target.value))}
                      min="1"
                      max="60"
                    />
                  </label>
                </div>

                <div className="setting-group">
                  <label className="setting-label checkbox">
                    <input 
                      type="checkbox"
                      checked={settings.enableNotifications}
                      onChange={(e) => handleSettingChange('enableNotifications', e.target.checked)}
                    />
                    <span>Enable Browser Notifications</span>
                  </label>
                </div>

                <div className="setting-group">
                  <label className="setting-label checkbox">
                    <input 
                      type="checkbox"
                      checked={settings.compactMode}
                      onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                    />
                    <span>Compact Mode</span>
                  </label>
                </div>
              </div>
            )}

            {/* Data Management */}
            {activeTab === 'data' && (
              <div className="settings-section">
                <h2>💾 Data Management</h2>
                <p>Manage data backup, export, and storage settings</p>
                
                <div className="setting-group">
                  <label className="setting-label checkbox">
                    <input 
                      type="checkbox"
                      checked={settings.backupEnabled}
                      onChange={(e) => handleSettingChange('backupEnabled', e.target.checked)}
                    />
                    <span>Enable Automatic Backups</span>
                  </label>
                </div>

                <div className="setting-group">
                  <label className="setting-label">
                    <span>Backup Interval (hours)</span>
                    <input 
                      type="number"
                      value={settings.backupInterval}
                      onChange={(e) => handleSettingChange('backupInterval', parseInt(e.target.value))}
                      min="1"
                      max="168"
                    />
                  </label>
                </div>

                <div className="setting-group">
                  <label className="setting-label">
                    <span>Max Backups to Keep</span>
                    <input 
                      type="number"
                      value={settings.maxBackups}
                      onChange={(e) => handleSettingChange('maxBackups', parseInt(e.target.value))}
                      min="1"
                      max="100"
                    />
                  </label>
                </div>

                <div className="setting-group">
                  <label className="setting-label">
                    <span>Export Format</span>
                    <select 
                      value={settings.exportFormat}
                      onChange={(e) => handleSettingChange('exportFormat', e.target.value)}
                    >
                      <option value="json">JSON</option>
                      <option value="csv">CSV</option>
                      <option value="markdown">Markdown</option>
                    </select>
                  </label>
                </div>

                <div className="data-actions">
                  <button onClick={exportSettings} className="btn-secondary">
                    📤 Export Settings
                  </button>
                  <label className="btn-secondary">
                    📥 Import Settings
                    <input 
                      type="file" 
                      accept=".json"
                      onChange={importSettings}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Performance Settings */}
            {activeTab === 'performance' && (
              <div className="settings-section">
                <h2>⚡ Performance Settings</h2>
                <p>Optimize application performance and caching</p>
                
                <div className="setting-group">
                  <label className="setting-label checkbox">
                    <input 
                      type="checkbox"
                      checked={settings.enableCaching}
                      onChange={(e) => handleSettingChange('enableCaching', e.target.checked)}
                    />
                    <span>Enable Response Caching</span>
                  </label>
                </div>

                <div className="setting-group">
                  <label className="setting-label">
                    <span>Cache Expiry (minutes)</span>
                    <input 
                      type="number"
                      value={settings.cacheExpiry}
                      onChange={(e) => handleSettingChange('cacheExpiry', parseInt(e.target.value))}
                      min="1"
                      max="1440"
                    />
                  </label>
                </div>

                <div className="setting-group">
                  <label className="setting-label checkbox">
                    <input 
                      type="checkbox"
                      checked={settings.enableCompression}
                      onChange={(e) => handleSettingChange('enableCompression', e.target.checked)}
                    />
                    <span>Enable Data Compression</span>
                  </label>
                </div>
              </div>
            )}

            {/* Integrations */}
            {activeTab === 'integrations' && (
              <div className="settings-section">
                <h2>🔗 Integrations</h2>
                <p>Connect with external services and platforms</p>
                
                <div className="setting-group">
                  <label className="setting-label checkbox">
                    <input 
                      type="checkbox"
                      checked={settings.enableGitHubSync}
                      onChange={(e) => handleSettingChange('enableGitHubSync', e.target.checked)}
                    />
                    <span>GitHub Sync (Coming Soon)</span>
                  </label>
                </div>

                <div className="setting-group">
                  <label className="setting-label checkbox">
                    <input 
                      type="checkbox"
                      checked={settings.enableSlackNotifications}
                      onChange={(e) => handleSettingChange('enableSlackNotifications', e.target.checked)}
                    />
                    <span>Slack Notifications (Coming Soon)</span>
                  </label>
                </div>

                <div className="setting-group">
                  <label className="setting-label checkbox">
                    <input 
                      type="checkbox"
                      checked={settings.enableEmailAlerts}
                      onChange={(e) => handleSettingChange('enableEmailAlerts', e.target.checked)}
                    />
                    <span>Email Alerts (Coming Soon)</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="admin-actions">
            <div className="action-buttons">
              <button 
                onClick={saveSettings} 
                disabled={isSaving}
                className="btn-primary"
              >
                {isSaving ? '💾 Saving...' : '💾 Save Settings'}
              </button>
              <button onClick={resetToDefaults} className="btn-secondary">
                🔄 Reset to Defaults
              </button>
              <button onClick={clearAllData} className="btn-danger">
                🗑️ Clear All Data
              </button>
            </div>
            {saveStatus && (
              <div className="save-status">
                {saveStatus}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage; 