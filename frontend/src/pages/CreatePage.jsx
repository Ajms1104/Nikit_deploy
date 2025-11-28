import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { ChevronLeft, Calendar, MapPin, Users, ShoppingBag, Clock, Tag, X, Store } from 'lucide-react';

export default function CreatePage() {
  const navigate = useNavigate();
  
  // 상태 관리
  // ★ 수정: 초기값을 빈 배열이 아니라 기본 마트 리스트로 채워둠 (안전장치)
  const [stores, setStores] = useState([
    { name: "코스트코 부산점", distance: 0 },
    { name: "이마트 트레이더스 서면점", distance: 0 },
    { name: "코스트코 김해점", distance: 0 },
    { name: "이마트 트레이더스 명지점", distance: 0 }
  ]); 
  
  const [selectedMart, setSelectedMart] = useState('');
  const [title, setTitle] = useState('');
  const [meetDate, setMeetDate] = useState('');
  const [meetTime, setMeetTime] = useState('');
  const [meetPlace, setMeetPlace] = useState('');
  const [tags, setTags] = useState([]); 
  const [tagInput, setTagInput] = useState('');
  const [maxMembers, setMaxMembers] = useState(4);
  const [loading, setLoading] = useState(false);

  // 1. 내 위치 가져오기 & 주변 마트 조회
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchNearbyStores(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          console.error("위치 권한 없음:", err);
          // 위치 없어도 기본 리스트는 유지됨
        }
      );
    }
  }, []);

  const fetchNearbyStores = async (lat, lng) => {
    try {
      let url = '/stores/nearby';
      if (lat && lng) url += `?lat=${lat}&lng=${lng}`;
      
      const res = await api.get(url);
      if (res.data.success && res.data.data.length > 0) {
        setStores(res.data.data);
        // ★ 수정: 자동으로 첫 번째 마트 선택하지 않음 (사용자가 직접 고르게)
      }
    } catch (error) {
      console.error("매장 로딩 실패 (기본 리스트 사용):", error);
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!selectedMart) {
        alert("마트를 선택해주세요!");
        return;
    }
    const finalTitle = tags.length > 0 ? tags.join(', ') + " 같이 사요!" : title || "함께 장보실 분!";
    
    if (!meetDate || !meetTime || !meetPlace) {
      alert("정보를 모두 입력해주세요!");
      return;
    }

    setLoading(true);
    const hostId = localStorage.getItem('userId');
    try {
      const response = await api.post('/parties', {
        hostId: hostId,
        martName: selectedMart,
        title: finalTitle,
        meetTime: `${meetDate}T${meetTime}:00`,
        meetPlace: meetPlace,
        maxMembers: parseInt(maxMembers)
      });
      if (response.data.success) {
        navigate(`/room/${response.data.data.partyId}`);
      }
    } catch (error) {
      alert("생성 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F4F6] pb-28 font-sans text-[#333D4B]">
      {/* 헤더 */}
      <header className="bg-white sticky top-0 z-10 px-4 h-14 flex items-center justify-between shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600"><ChevronLeft /></button>
        <span className="font-bold text-lg">파티 만들기</span>
        <div className="w-8"></div>
      </header>

      <main className="p-5 space-y-6">
        
        {/* 1. 매장 선택 카드 */}
        <section className="bg-white p-6 rounded-[24px] shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#FF6F0F] font-bold">1</div>
            <h2 className="font-bold text-lg">어디로 갈까요?</h2>
          </div>
          <div className="relative">
            {/* ★ 수정된 Select 박스 */}
            <select 
              className="w-full p-4 pl-12 bg-white border border-gray-200 rounded-2xl text-base font-bold text-gray-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#FF6F0F] focus:border-transparent"
              style={{ backgroundImage: 'none' }} // 브라우저 기본 화살표 제거 강제
              value={selectedMart}
              onChange={(e) => setSelectedMart(e.target.value)}
            >
              <option value="" disabled>눌러서 마트 선택하기 👇</option>
              {stores.map((store, idx) => (
                <option key={idx} value={store.name} className="text-black">
                  {store.name} {store.distance > 0 ? `(${store.distance}km)` : ''}
                </option>
              ))}
            </select>
            
            {/* 아이콘들 */}
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Store className="text-gray-400 w-6 h-6" />
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
              <ChevronLeft className="text-gray-400 w-5 h-5 -rotate-90" />
            </div>
          </div>
        </section>

        {/* 2. 일정/장소 카드 */}
        <section className="bg-white p-6 rounded-[24px] shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#FF6F0F] font-bold">2</div>
            <h2 className="font-bold text-lg">언제 만날까요?</h2>
          </div>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input type="date" className="w-full p-3 bg-[#F9FAFB] border-0 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#FF6F0F]" value={meetDate} onChange={(e) => setMeetDate(e.target.value)} />
              </div>
              <div className="flex-1 relative">
                <input type="time" className="w-full p-3 bg-[#F9FAFB] border-0 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#FF6F0F]" value={meetTime} onChange={(e) => setMeetTime(e.target.value)} />
              </div>
            </div>
            <div className="relative">
              <input type="text" placeholder="만남 장소 (예: 1층 입구)" className="w-full p-3 pl-10 bg-[#F9FAFB] border-0 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#FF6F0F]" value={meetPlace} onChange={(e) => setMeetPlace(e.target.value)} />
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
        </section>

        {/* 3. 태그/인원 카드 */}
        <section className="bg-white p-6 rounded-[24px] shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#FF6F0F] font-bold">3</div>
            <h2 className="font-bold text-lg">상세 설정</h2>
          </div>
          
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-500 mb-2 block">무엇을 사실 건가요?</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-orange-50 text-[#FF6F0F] rounded-full text-sm font-bold flex items-center gap-1">
                  {tag} <X size={14} className="cursor-pointer" onClick={() => removeTag(tag)}/>
                </span>
              ))}
            </div>
            <div className="relative">
              <input type="text" placeholder="품목 입력 후 엔터 (제목이 됩니다)" className="w-full p-3 pl-10 bg-[#F9FAFB] border-0 rounded-xl text-sm focus:ring-2 focus:ring-[#FF6F0F]" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} />
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-500">모집 인원</label>
              <span className="text-[#FF6F0F] font-bold text-lg">{maxMembers}명</span>
            </div>
            <input type="range" min="2" max="4" step="1" className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#FF6F0F]" value={maxMembers} onChange={(e) => setMaxMembers(e.target.value)} />
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex justify-center max-w-[430px] mx-auto">
        <button onClick={handleSubmit} disabled={loading} className="w-full bg-[#FF6F0F] text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all disabled:bg-gray-300">
          {loading ? '생성 중...' : '파티 만들기'}
        </button>
      </div>
    </div>
  );
}