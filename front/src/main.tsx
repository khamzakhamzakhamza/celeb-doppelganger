import './main.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ArcfaceModelProvider } from './providers/ArcfaceModelProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ArcfaceModelProvider>
      <App />
    </ArcfaceModelProvider>
  </StrictMode>,
)
