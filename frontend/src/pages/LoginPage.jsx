import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { ShoppingBag } from 'lucide-react'; // 로고 아이콘

export default function LoginPage() {
  const navigate = useNavigate();
  
  // 입력값 상태 관리
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // (해커톤용 가짜 비번)
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. 백엔드로 로그인 요청 (비번은 해커톤이라 무시됨)
      const response = await api.post('/users/login', {
        email: email,
        nickname: email.split('@')[0] // 이메일 앞부분을 닉네임으로 임시 사용
      });

      if (response.data.success) {
        const userData = response.data.data;
        
        // ★ 핵심: 로그인 성공 시 userId를 브라우저에 저장!
        // 나중에 파티 만들 때 이 ID를 꺼내 쓸 겁니다.
        localStorage.setItem('userId', userData.userId);
        localStorage.setItem('nickname', userData.nickname);
        localStorage.setItem('isHost', userData.host); // boolean -> string 저장됨

        alert(`반갑습니다, ${userData.nickname}님!`);
        navigate('/'); // 메인 화면으로 이동
      }
    } catch (error) {
      console.error('로그인 실패:', error);
      alert('로그인에 실패했습니다. 백엔드가 켜져있는지 확인해주세요!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-white">
      {/* 로고 영역 */}
      <div className="mb-10 text-center">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag size={40} className="text-orange-500" />
        </div>
        <h1 className="text-3xl font-bold text-orange-500 mb-2">NiKit</h1>
        <p className="text-gray-500">나누면 가벼워지는 쇼핑</p>
      </div>

      {/* 로그인 폼 */}
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <div>
          <input
            type="email"
            placeholder="이메일"
            className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="비밀번호"
            className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition disabled:bg-gray-300"
        >
          {loading ? '로그인 중...' : '시작하기'}
        </button>
      </form>

        {/* 하단 링크 */}
      {/*<div className="mt-6 text-sm text-gray-400">
        아직 계정이 없으신가요? <span className="text-orange-500 underline cursor-pointer">회원가입</span>
      </div>*/}
    </div>
  );
}