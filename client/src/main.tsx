import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Editor from './pages/Editor.tsx'
import './main.css'
import Draw from './pages/Draw.tsx'


ReactDOM.createRoot(document.getElementById('root')!).render(
  
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/editor/:roomId" element={<Editor />} />
        <Route path="/draw/:roomId" element={<Draw />} />
      </Routes>
    </BrowserRouter>
  
)
