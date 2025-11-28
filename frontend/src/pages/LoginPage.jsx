import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { ShoppingBag, ChevronRight } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/users/login', {
        email: email,
        nickname: email.split('@')[0]
      });

      if (response.data.success) {
        const userData = response.data.data;
        localStorage.setItem('userId', userData.userId);
        localStorage.setItem('nickname', userData.nickname);
        localStorage.setItem('isHost', userData.host);
        navigate('/');
      }
    } catch (error) {
      alert('로그인 실패! 백엔드 연결을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F2F4F6] p-6 pb-20">
      {/* 로고 영역 */}
      <div className="flex flex-col items-center mb-12 animate-fade-in-up">
        <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-6">
          <ShoppingBag size={48} className="text-[#FF6F0F]" />
        </div>
        <h1 className="text-3xl font-extrabold text-[#333D4B] mb-2 tracking-tight">NiKit</h1>
        <p className="text-[#6B7684] text-lg font-medium">나누면 가벼워지는 쇼핑</p>
      </div>

      {/* 로그인 폼 */}
      <form onSubmit={handleLogin} className="w-full max-w-[350px] space-y-4">
        <div className="space-y-2">
          <input
            type="email"
            placeholder="이메일 입력"
            className="w-full p-4 bg-white border-0 ring-1 ring-gray-200 rounded-[16px] text-lg focus:outline-none focus:ring-2 focus:ring-[#FF6F0F] transition-all placeholder:text-gray-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            className="w-full p-4 bg-white border-0 ring-1 ring-gray-200 rounded-[16px] text-lg focus:outline-none focus:ring-2 focus:ring-[#FF6F0F] transition-all placeholder:text-gray-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#FF6F0F] text-white font-bold text-lg py-4 rounded-[16px] hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-orange-500/20 disabled:bg-gray-300 flex items-center justify-center gap-2"
        >
          {loading ? '로그인 중...' : (
            <>
              시작하기 <ChevronRight size={20} />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-sm text-[#8B95A1]">
        아직 계정이 없으신가요? <span className="text-[#FF6F0F] font-bold cursor-pointer hover:underline">회원가입</span>
      </div>
    </div>
  );
}