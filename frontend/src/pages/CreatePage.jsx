import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { ChevronLeft, Store, Calendar, Clock, MapPin, Tag, X, Plus } from 'lucide-react'; // 아이콘 교체

export default function CreatePage() {
  const navigate = useNavigate();
  
  // 상태 관리
  const [stores, setStores] = useState([]); // 백엔드에서 가져올 마트 리스트
  const [selectedMart, setSelectedMart] = useState('');
  
  const [meetDate, setMeetDate] = useState('');
  const [meetTime, setMeetTime] = useState('');
  const [meetPlace, setMeetPlace] = useState('');
  
  // 태그 입력 관리 (배열)
  const [tags, setTags] = useState([]); 
  const [tagInput, setTagInput] = useState('');

  const [loading, setLoading] = useState(false);

  // 1. 내 위치 가져오기 & 주변 마트 조회
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchNearbyStores(latitude, longitude);
        },
        (error) => {
          console.error("위치 권한 없음:", error);
          fetchNearbyStores(null, null);
        }
      );
    } else {
      fetchNearbyStores(null, null);
    }
  }, []);

  // 백엔드 API 호출: 내 주변 마트 가져오기
  const fetchNearbyStores = async (lat, lng) => {
    try {
      let url = '/stores/nearby';
      if (lat && lng) url += `?lat=${lat}&lng=${lng}`;
      
      const res = await api.get(url);
      if (res.data.success && res.data.data.length > 0) {
        setStores(res.data.data);
        setSelectedMart(res.data.data[0].name); // 가장 가까운 곳 자동 선택
      }
    } catch (error) {
      console.error("매장 로딩 실패:", error);
      // 실패 시 기본 목록 (Fallback)
      setStores([{ name: "코스트코 부산점" }, { name: "이마트 트레이더스 서면점" }]);
    }
  };

  // 태그 추가 핸들러 (Enter 키)
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault(); // 폼 제출 방지
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  // 태그 삭제 핸들러
  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // 파티 생성 요청
  const handleSubmit = async () => {
    // 제목은 태그들을 합쳐서 만듦 (예: "베이글, 생수 같이 사요")
    const title = tags.length > 0 ? tags.join(', ') + " 같이 사요!" : "함께 장보실 분 구해요!";

    if (!meetDate || !meetTime || !meetPlace) {
      alert("날짜, 시간, 장소를 모두 입력해주세요!");
      return;
    }

    setLoading(true);
    const hostId = localStorage.getItem('userId');
    const combinedDateTime = `${meetDate}T${meetTime}:00`;

    try {
      const response = await api.post('/parties', {
        hostId: hostId,
        martName: selectedMart,
        title: title, // 태그 기반 제목
        meetTime: combinedDateTime,
        meetPlace: meetPlace,
        maxMembers: 4 // 기본 4명
      });

      if (response.data.success) {
        if(window.confirm("파티가 생성되었습니다! 채팅방으로 이동할까요?")) {
            navigate(`/room/${response.data.data.partyId}`);
        } else {
            navigate('/');
        }
      }
    } catch (error) {
      console.error("파티 생성 실패:", error);
      alert("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF7F0] text-[#333333] font-sans">
      
      {/* 헤더 */}
      <header className="sticky top-0 z-10 w-full bg-white border-b border-[#E5E7EB] shadow-sm">
        <div className="max-w-4xl mx-auto p-4 flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 mr-2"
          >
            <ChevronLeft className="text-[#333333] w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">파티 만들기</h1>
        </div>
      </header>

      {/* 메인 폼 */}
      <main className="flex-grow container mx-auto max-w-4xl p-6 pb-28">
        <div className="space-y-10">
          
          {/* 섹션 1: 매장 선택 */}
          <section>
            <div className="flex items-center mb-4">
              <span className="flex items-center justify-center w-8 h-8 bg-[#FF6F00]/10 text-[#FF6F00] font-bold rounded-full mr-3 text-sm">1</span>
              <h2 className="text-xl font-bold">어느 매장으로 갈까요?</h2>
            </div>
            <div className="relative">
              <select 
                className="w-full p-4 pl-12 bg-white border border-[#E5E7EB] rounded-[1.25rem] text-base appearance-none focus:outline-none focus:border-[#FF6F00] focus:ring-2 focus:ring-[#FF6F00]/20"
                value={selectedMart}
                onChange={(e) => setSelectedMart(e.target.value)}
              >
                {stores.map((store) => (
                  <option key={store.name} value={store.name}>
                    {store.name} {store.distance ? `(${store.distance}km)` : ''}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Store className="text-gray-400 w-6 h-6" />
              </div>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                <ChevronLeft className="text-gray-400 w-5 h-5 -rotate-90" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2 ml-1">* 가까운 매장이 1순위로 표시됩니다.</p>
          </section>

          {/* 섹션 2: 시간/장소 */}
          <section>
            <div className="flex items-center mb-4">
              <span className="flex items-center justify-center w-8 h-8 bg-[#FF6F00]/10 text-[#FF6F00] font-bold rounded-full mr-3 text-sm">2</span>
              <h2 className="text-xl font-bold">언제, 어디서 만날까요?</h2>
            </div>
            <div className="space-y-4">
              {/* 날짜 */}
              <div className="relative">
                <input 
                  type="date" 
                  className="w-full p-4 pl-12 bg-white border border-[#E5E7EB] rounded-[1.25rem] text-base focus:outline-none focus:border-[#FF6F00] focus:ring-2 focus:ring-[#FF6F00]/20"
                  value={meetDate}
                  onChange={(e) => setMeetDate(e.target.value)}
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Calendar className="text-gray-400 w-5 h-5" />
                </div>
              </div>
              
              {/* 시간 */}
              <div className="relative">
                <input 
                  type="time" 
                  className="w-full p-4 pl-12 bg-white border border-[#E5E7EB] rounded-[1.25rem] text-base focus:outline-none focus:border-[#FF6F00] focus:ring-2 focus:ring-[#FF6F00]/20"
                  value={meetTime}
                  onChange={(e) => setMeetTime(e.target.value)}
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Clock className="text-gray-400 w-5 h-5" />
                </div>
              </div>

              {/* 장소 */}
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="예) 1층 카트 보관소 앞"
                  className="w-full p-4 pl-12 bg-white border border-[#E5E7EB] rounded-[1.25rem] text-base placeholder:text-gray-400 focus:outline-none focus:border-[#FF6F00] focus:ring-2 focus:ring-[#FF6F00]/20"
                  value={meetPlace}
                  onChange={(e) => setMeetPlace(e.target.value)}
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <MapPin className="text-gray-400 w-5 h-5" />
                </div>
              </div>
            </div>
          </section>

          {/* 섹션 3: 태그 입력 */}
          <section>
            <div className="flex items-center mb-4">
              <span className="flex items-center justify-center w-8 h-8 bg-[#FF6F00]/10 text-[#FF6F00] font-bold rounded-full mr-3 text-sm">3</span>
              <h2 className="text-xl font-bold">주로 무엇을 사실 건가요?</h2>
            </div>
            
            <div className="bg-white p-4 rounded-[1.25rem] border border-[#E5E7EB] shadow-sm focus-within:ring-2 focus-within:ring-[#FF6F00]/20 focus-within:border-[#FF6F00]">
              {/* 입력된 태그들 */}
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                  <div key={index} className="flex items-center bg-[#FF6F00]/10 text-[#FF6F00] text-sm font-medium px-3 py-1.5 rounded-full animate-in fade-in zoom-in duration-200">
                    <span>{tag}</span>
                    <button 
                      onClick={() => removeTag(tag)}
                      className="ml-1.5 text-[#FF6F00]/70 hover:text-[#FF6F00]"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              
              {/* 입력창 */}
              <div className="flex items-center gap-2">
                <Tag className="text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="태그 입력 후 엔터 (예: 베이글)" 
                  className="w-full bg-transparent border-0 focus:ring-0 p-2 placeholder:text-gray-400"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                />
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* 하단 고정 버튼 */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB]">
        <div className="container mx-auto max-w-4xl p-4 flex justify-center">
          <div className="w-full max-w-[430px]">
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#FF6F00] text-white text-lg font-bold py-4 rounded-[1.25rem] hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6F00] transition-colors duration-200 shadow-lg shadow-orange-200 disabled:bg-gray-300 disabled:shadow-none"
            >
              {loading ? '생성 중...' : 'NiKit 파티 만들기'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}