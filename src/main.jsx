import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'; // <-- PASSO 1: Importar

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* // <-- PASSO 2: Envolver App com BrowserRouter --> */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)