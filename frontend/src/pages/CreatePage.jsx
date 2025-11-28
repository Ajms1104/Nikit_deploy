// src/pages/CreatePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Calendar, MapPin, Users } from 'lucide-react';

// 백엔드 DB에 넣어둔 마트 이름과 똑같이 맞춰야 합니다!
const MART_LIST = [
  "코스트코 부산점",
  "코스트코 김해점",
  "이마트 트레이더스 서면점",
  "이마트 트레이더스 연산점",
  "이마트 트레이더스 명지점"
];

export default function CreatePage() {
  const navigate = useNavigate();
  
  // 입력 상태 관리
  const [martName, setMartName] = useState(MART_LIST[0]);
  const [title, setTitle] = useState('');
  const [meetDate, setMeetDate] = useState('');
  const [meetTime, setMeetTime] = useState('');
  const [meetPlace, setMeetPlace] = useState('');
  const [maxMembers, setMaxMembers] = useState(4);
  const [loading, setLoading] = useState(false);

  // 로그인 여부 체크
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert("로그인이 필요합니다!");
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = async () => {
    if (!title || !meetDate || !meetTime || !meetPlace) {
      alert("모든 정보를 입력해주세요!");
      return;
    }

    setLoading(true);
    const hostId = localStorage.getItem('userId');

    // 날짜와 시간을 합쳐서 ISO 형식(2024-11-30T14:00:00)으로 만듦
    const combinedDateTime = `${meetDate}T${meetTime}:00`;

    try {
      const response = await axios.post('http://localhost:8080/api/v1/parties', {
        hostId: hostId,
        martName: martName,
        title: title,
        meetTime: combinedDateTime,
        meetPlace: meetPlace,
        maxMembers: parseInt(maxMembers)
      });

      if (response.data.success) {
        alert("파티가 생성되었습니다! 🎉");
        navigate('/'); // 성공하면 홈으로 이동 (리스트에서 확인 가능)
      }
    } catch (error) {
      console.error("파티 생성 실패:", error);
      alert("파티 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* 헤더 */}
      <header className="flex items-center p-4 border-b sticky top-0 bg-white z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold ml-2">파티 만들기</h1>
      </header>

      {/* 폼 영역 */}
      <div className="p-5 space-y-6">
        
        {/* 1. 마트 선택 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">어디로 갈까요?</label>
          <select 
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-medium"
            value={martName}
            onChange={(e) => setMartName(e.target.value)}
          >
            {MART_LIST.map((mart) => (
              <option key={mart} value={mart}>{mart}</option>
            ))}
          </select>
        </div>

        {/* 2. 제목 입력 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">모집 제목</label>
          <input 
            type="text" 
            placeholder="예: 베이글이랑 생수 나누실 분!" 
            className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* 3. 일시 선택 */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">날짜</label>
            <div className="relative">
              <input 
                type="date" 
                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 pl-10"
                value={meetDate}
                onChange={(e) => setMeetDate(e.target.value)}
              />
              <Calendar size={20} className="absolute left-3 top-4 text-gray-400" />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">시간</label>
            <input 
              type="time" 
              className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
              value={meetTime}
              onChange={(e) => setMeetTime(e.target.value)}
            />
          </div>
        </div>

        {/* 4. 장소 입력 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">만남 장소</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="예: 1층 입구 카트 보관소 앞" 
              className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 pl-10"
              value={meetPlace}
              onChange={(e) => setMeetPlace(e.target.value)}
            />
            <MapPin size={20} className="absolute left-3 top-4 text-gray-400" />
          </div>
        </div>

        {/* 5. 인원 설정 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">모집 인원 (본인 포함)</label>
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <Users size={24} className="text-gray-400" />
            <input 
              type="range" 
              min="2" max="4" step="1" 
              className="flex-1 accent-orange-500"
              value={maxMembers}
              onChange={(e) => setMaxMembers(e.target.value)}
            />
            <span className="font-bold text-lg w-8 text-center">{maxMembers}명</span>
          </div>
        </div>

      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-center">
        <div className="w-full max-w-[430px]">
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition disabled:bg-gray-300"
          >
            {loading ? '생성 중...' : '파티 만들기'}
          </button>
        </div>
      </div>
    </div>
  );
}