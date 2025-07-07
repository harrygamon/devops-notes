import React, { useState, useEffect } from 'react'
import './App.css'
import { HashRouter as Router, Route, Routes, Link, useNavigate, Navigate } from 'react-router-dom'
import AIPage from './pages/AIPage'
import LoginPage from './pages/LoginPage'
import AdminPage from './pages/AdminPage'
import apiService from './services/api'

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          color: 'white', 
          backgroundColor: '#1a1a1a',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h1>Something went wrong</h1>
          <p>Error: {this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  console.log('App component rendering...');
  
  // Simple test version - just render a basic page
  return (
    <ErrorBoundary>
      <div style={{
        backgroundColor: '#1a1a1a',
        color: 'white',
        minHeight: '100vh',
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1>🚀 DevOps Notes - Test Page</h1>
        <p>If you can see this, the app is working!</p>
        <p>Current time: {new Date().toLocaleString()}</p>
        <button onClick={() => alert('Button works!')}>Test Button</button>
      </div>
    </ErrorBoundary>
  );
}

export default App

