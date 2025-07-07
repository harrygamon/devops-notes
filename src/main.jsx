import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log('main.jsx: Starting app...');

try {
  const rootElement = document.getElementById('root');
  console.log('main.jsx: Root element found:', rootElement);
  
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  const root = createRoot(rootElement);
  console.log('main.jsx: React root created');
  
  root.render(<App />);
  console.log('main.jsx: App rendered');
} catch (error) {
  console.error('main.jsx: Error rendering app:', error);
  document.body.innerHTML = `
    <div style="
      padding: 20px; 
      color: white; 
      backgroundColor: #1a1a1a;
      minHeight: 100vh;
      display: flex;
      flexDirection: column;
      alignItems: center;
      justifyContent: center;
      fontFamily: Arial, sans-serif;
    ">
      <h1>Failed to load app</h1>
      <p>Error: ${error.message}</p>
      <button onclick="window.location.reload()">Reload Page</button>
    </div>
  `;
}
