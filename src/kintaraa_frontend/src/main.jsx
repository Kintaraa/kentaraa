import { Buffer } from 'buffer';
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Polyfills
window.global = window;
window.Buffer = Buffer;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)