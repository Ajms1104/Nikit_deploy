// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client'; 
import './index.css';
import App from './App';

// React 18 버전의 올바른 실행 방식입니다.
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);