import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1c2338',
            color: '#e2e8f4',
            border: '1px solid #26304a',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '13px',
            fontWeight: 500,
          },
          success: { iconTheme: { primary: '#3ecf8e', secondary: '#0d1117' } },
          error:   { iconTheme: { primary: '#f87171', secondary: '#0d1117' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
