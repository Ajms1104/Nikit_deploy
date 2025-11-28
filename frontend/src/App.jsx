import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MobileLayout from './components/MobileLayout';

// 페이지들
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import CreatePage from './pages/CreatePage';
import ChatPage from './pages/ChatPage';
import SettlementPage from './pages/SettlementPage';

// ★ [핵심] 로그인 여부를 검사하는 수문장 컴포넌트
const ProtectedRoute = ({ children }) => {
  const userId = localStorage.getItem('userId'); // 로컬 스토리지 확인

  if (!userId) {
    // ID가 없으면 로그인 페이지로 강제 이동 (replace: 뒤로가기 방지)
    return <Navigate to="/login" replace />;
  }

  // ID가 있으면 원래 가려던 페이지 보여줌
  return children;
};

// ★ [편의] 이미 로그인했는데 또 로그인 페이지로 오면 -> 홈으로 보냄
const PublicRoute = ({ children }) => {
  const userId = localStorage.getItem('userId');
  
  if (userId) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <MobileLayout>
        <Routes>
          {/* 1. 로그인 페이지 (이미 로그인했으면 홈으로 튕김) */}
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />

          {/* 2. 보호된 페이지들 (로그인 안 했으면 로그인 페이지로 튕김) */}
          <Route path="/" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          
          <Route path="/create" element={
            <ProtectedRoute>
              <CreatePage />
            </ProtectedRoute>
          } />
          
          <Route path="/room/:partyId" element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } />
          
          <Route path="/room/:partyId/settlement" element={
            <ProtectedRoute>
              <SettlementPage />
            </ProtectedRoute>
          } />

        </Routes>
      </MobileLayout>
    </BrowserRouter>
  );
}

export default App;