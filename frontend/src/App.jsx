// src/App.jsx
import React from 'react';
// ★중요: BrowserRouter가 꼭 있어야 합니다!
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import MobileLayout from './components/MobileLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import CreatePage from './pages/CreatePage';
import ChatPage from './pages/ChatPage';
import SettlementPage from './pages/SettlementPage';

function App() {
  return (
    <BrowserRouter>
      <MobileLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/room/:partyId" element={<ChatPage />} />
          <Route path="/room/:partyId/settlement" element={<SettlementPage />} />
        </Routes>
      </MobileLayout>
    </BrowserRouter>
  );
}

export default App;