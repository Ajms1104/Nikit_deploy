import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { MapPin, ShoppingBag, Calendar, Users, Plus, List, Map as MapIcon, Home, MessageCircle, User } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myLocation, setMyLocation] = useState(null);
  const [locationName, setLocationName] = useState("위치 찾는 중...");
  const [viewMode, setViewMode] = useState('list'); 
  const mapRef = useRef(null);

  // 1. 내 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMyLocation({ lat: latitude, lng: longitude });
          setLocationName("부산 대연동"); // (해커톤용 고정 텍스트로 예쁘게)
        },
        (error) => {
          console.error("위치 에러:", error);
          setLocationName("부산 전체");
          fetchParties(null, null);
        }
      );
    } else {
      fetchParties(null, null);
    }
  }, []);

  // 2. 파티 목록 불러오기
  useEffect(() => {
    if (myLocation) {
      fetchParties(myLocation.lat, myLocation.lng);
    }
  }, [myLocation]);

  const fetchParties = async (lat, lng) => {
    setLoading(true);
    try {
      let url = '/parties';
      if (lat && lng) url += `?lat=${lat}&lng=${lng}`;
      const res = await api.get(url);
      if (res.data.success) {
        setParties(res.data.data);
      }
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  // 지도 그리기 (useEffect) - 기존 코드 유지 (생략하지 말고 그대로 두세요!)
  useEffect(() => {
    if (viewMode === 'map' && window.kakao && window.kakao.maps) {
        const container = mapRef.current;
        const centerLat = myLocation ? myLocation.lat : 35.1742;
        const centerLng = myLocation ? myLocation.lng : 129.1118;
  
        const options = { center: new window.kakao.maps.LatLng(centerLat, centerLng), level: 7 };
        const map = new window.kakao.maps.Map(container, options);
  
        if (myLocation) {
          new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(myLocation.lat, myLocation.lng),
            map: map, title: "나"
          });
        }
  
        parties.forEach(party => {
          let lat = 35.1742, lng = 129.1118; 
          if(party.martName.includes("서면")) { lat=35.1645; lng=129.0505; }
          else if(party.martName.includes("명지")) { lat=35.0935; lng=128.9042; }
          else if(party.martName.includes("김해")) { lat=35.2268; lng=128.8475; }
  
          const marker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(lat, lng),
            map: map, title: party.martName
          });
          
          const infowindow = new window.kakao.maps.InfoWindow({
              content: `<div style="padding:5px;font-size:12px;color:black;font-weight:bold;">${party.title}</div>`
          });
          infowindow.open(map, marker);
  
          window.kakao.maps.event.addListener(marker, 'click', function() {
            navigate(`/room/${party.partyId}`);
          });
        });
      }
  }, [viewMode, myLocation, parties]);


  return (
    <div className="min-h-screen bg-[#F2F4F6] text-[#333D4B] font-sans pb-24 page-transition relative">
      
      {/* 1. 상단 헤더 (토스 스타일) */}
      <header className="bg-white sticky top-0 z-20 px-5 h-16 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2" onClick={() => window.location.reload()}>
            <ShoppingBag className="text-[#FF6F0F] w-6 h-6" fill="#FF6F0F" />
            <span className="text-xl font-extrabold text-[#333D4B] tracking-tight">NiKit</span>
        </div>
        
        {/* 리스트/지도 토글 */}
        <div className="flex bg-[#F2F4F6] rounded-full p-1">
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${viewMode === 'list' ? 'bg-white text-[#FF6F0F] shadow-sm' : 'text-gray-400'}`}
            >
              <List size={14} /> 리스트
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${viewMode === 'map' ? 'bg-white text-[#FF6F0F] shadow-sm' : 'text-gray-400'}`}
            >
              <MapIcon size={14} /> 지도
            </button>
        </div>
      </header>

      {/* 2. 메인 컨텐츠 */}
      <main className="px-5 pt-6">
        
        {/* 위치 정보 바 */}
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-1 text-lg font-bold text-[#191F28]">
                <span>📍 {locationName}</span>
                <ChevronDown className="w-5 h-5 text-gray-400" />
            </div>
            {/* 필터 (간소화) */}
            <span className="text-xs font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-100">
                10km 이내
            </span>
        </div>

        {/* 리스트 뷰 */}
        {viewMode === 'list' && (
          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="py-20 text-center text-gray-400 text-sm">로딩중...</div>
            ) : parties.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-gray-800 font-bold mb-1">내 주변에 파티가 없어요 😢</p>
                <p className="text-gray-500 text-sm">직접 파티를 만들어보세요!</p>
              </div>
            ) : (
              parties.map((party) => (
                <div 
                  key={party.partyId}
                  onClick={() => navigate(`/room/${party.partyId}`)}
                  className="bg-white p-5 rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-transform cursor-pointer border border-transparent hover:border-orange-100"
                >
                  {/* 카드 상단 */}
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${party.martName.includes('코스트코') ? 'bg-red-50 text-[#E53935]' : 'bg-green-50 text-[#43A047]'}`}>
                      {party.martName}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{party.distance ? `${party.distance}km` : '2.5km'}</span>
                  </div>

                  {/* 제목 */}
                  <h3 className="text-[17px] font-bold text-[#333D4B] mb-1 leading-snug line-clamp-2">
                    {party.title}
                  </h3>
                  <p className="text-sm text-[#8B95A1] mb-4 flex items-center gap-1">
                    <Calendar size={14} /> {new Date(party.meetTime).toLocaleDateString()} {new Date(party.meetTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>

                  {/* 카드 하단 (인원 & 태그) */}
                  <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                    <div className="flex -space-x-2 overflow-hidden">
                        {/* 참여자 아바타 (가짜 UI) */}
                        {[...Array(Math.min(party.currentMembers, 3))].map((_, i) => (
                            <div key={i} className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                {String.fromCharCode(65+i)}
                            </div>
                        ))}
                        {party.currentMembers < party.maxMembers && (
                            <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-[#FF6F0F] flex items-center justify-center text-[10px] font-bold text-white">
                                +{party.maxMembers - party.currentMembers}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center text-[#FF6F0F] text-sm font-bold bg-orange-50 px-3 py-1 rounded-full">
                        <Users size={14} className="mr-1" />
                        {party.currentMembers}/{party.maxMembers}명
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 지도 뷰 */}
        <div className={`${viewMode === 'map' ? 'block' : 'hidden'} w-full h-[70vh] rounded-[24px] overflow-hidden shadow-lg border border-gray-200 relative`}>
            <div ref={mapRef} className="w-full h-full bg-gray-100"></div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold text-[#FF6F0F] shadow-lg z-10 whitespace-nowrap">
              마커를 클릭하면 파티로 이동합니다 🏃‍♂️
            </div>
        </div>
      </main>

      {/* 3. 하단 내비게이션 바 (Bottom Navigation) - 앱 느낌의 핵심! */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 h-[80px] pb-4 flex justify-around items-center z-30 max-w-[430px] mx-auto">
        <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 w-16 text-[#FF6F0F]">
            <Home size={24} fill="#FF6F0F" />
            <span className="text-[10px] font-bold">홈</span>
        </button>
        
        {/* 중앙 플로팅 버튼 (파티 만들기) */}
        <button 
            onClick={() => navigate('/create')}
            className="mb-8 w-14 h-14 bg-[#FF6F0F] rounded-full flex items-center justify-center text-white shadow-[0_8px_16px_rgba(255,111,15,0.3)] active:scale-95 transition-transform"
        >
            <Plus size={28} strokeWidth={3} />
        </button>

        <button onClick={() => alert("준비중입니다!")} className="flex flex-col items-center gap-1 w-16 text-gray-300">
            <User size={24} />
            <span className="text-[10px] font-medium">마이</span>
        </button>
      </nav>
    </div>
  );
}