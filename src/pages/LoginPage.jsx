import React, { useState } from 'react';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate specific credentials
    if (username === 'HarryAxford' && password === 'Snowman22090@') {
      onLogin({ username });
    } else {
      alert('Invalid username or password. Please use HarryAxford / Snowman22090@');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="welcome-text">
          <h1>Welcome Harry</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username: HarryAxford"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password: Snowman22090@"
              required
            />
          </div>
          
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
        
        <div className="login-hint">
          <p>Use: <strong>HarryAxford</strong> / <strong>Snowman22090@</strong></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 