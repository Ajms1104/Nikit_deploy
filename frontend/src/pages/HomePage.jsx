import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { MapPin, ShoppingBag, Calendar, Users, Plus, ChevronDown, List, Map as MapIcon } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myLocation, setMyLocation] = useState(null); // 내 위치 {lat, lng}
  const [locationName, setLocationName] = useState("위치 찾는 중...");
  
  // ★ 추가: 뷰 모드 상태 (list / map)
  const [viewMode, setViewMode] = useState('list'); 
  const mapRef = useRef(null); // 지도를 담을 DOM

  // 1. 내 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMyLocation({ lat: latitude, lng: longitude });
          setLocationName("내 주변 (10km)"); // 위치 찾음
        },
        (error) => {
          console.error("위치 가져오기 실패:", error);
          setLocationName("부산 전체"); // 실패 시 기본값
          // 위치 권한 거부 시에도 리스트는 보여줘야 함
          fetchParties(null, null);
        }
      );
    } else {
      setLocationName("위치 기능 불가");
      fetchParties(null, null);
    }
  }, []);

  // 2. 파티 목록 불러오기 (위치가 있으면 좌표 포함해서 요청)
  useEffect(() => {
    if (myLocation) {
      fetchParties(myLocation.lat, myLocation.lng);
    }
  }, [myLocation]);

  const fetchParties = async (lat, lng) => {
    setLoading(true);
    try {
      // 쿼리 파라미터 생성
      let url = '/parties';
      if (lat && lng) {
        url += `?lat=${lat}&lng=${lng}`;
      }
      
      const res = await api.get(url);
      if (res.data.success) {
        setParties(res.data.data);
      }
    } catch (error) {
      console.error("파티 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // ★ 추가: 지도 그리기 (viewMode가 'map'일 때 실행)
  useEffect(() => {
    // window.kakao가 로드되었는지 확인 (index.html에서 SDK 로드)
    if (viewMode === 'map' && myLocation && window.kakao && window.kakao.maps) {
      const container = mapRef.current;
      const options = {
        center: new window.kakao.maps.LatLng(myLocation.lat, myLocation.lng),
        level: 7 // 지도의 확대 레벨 (숫자가 작을수록 확대)
      };
      const map = new window.kakao.maps.Map(container, options);

      // 1. 내 위치 마커 (커스텀 이미지 없이 기본 마커 사용 시)
      const myMarker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(myLocation.lat, myLocation.lng),
        map: map,
        title: "내 위치" // 마우스 오버 시 표시될 타이틀
      });

      // 2. 파티 장소 마커들 (마트 위치)
      // 백엔드 PartyListResponse에 lat, lng가 있다면 그걸 쓰고, 없다면 임시 매핑
      parties.forEach(party => {
        // 임시 좌표 매핑 (백엔드 Store 좌표와 동일하게 하드코딩 - 해커톤용)
        let lat = 35.1742, lng = 129.1118; // 기본: 코스트코 부산
        if(party.martName.includes("서면")) { lat=35.1645; lng=129.0505; }
        else if(party.martName.includes("명지")) { lat=35.0935; lng=128.9042; }
        else if(party.martName.includes("김해")) { lat=35.2268; lng=128.8475; }

        const marker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(lat, lng),
          map: map,
          title: party.martName
        });

        // 인포윈도우 (마커 위에 파티 제목 표시)
        const infowindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px;font-size:12px;color:black;">${party.title}</div>`
        });
        infowindow.open(map, marker);

        // 마커 클릭 시 파티 상세로 이동
        window.kakao.maps.event.addListener(marker, 'click', function() {
          navigate(`/room/${party.partyId}`);
        });
      });
    }
  }, [viewMode, myLocation, parties]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#FFF7F0] text-zinc-900 font-sans pb-20">
      {/* 배경 장식 (Blob) */}
      <div className="absolute top-20 -left-20 w-64 h-64 bg-[#FF6F00]/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute bottom-0 -right-24 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* 헤더 */}
      <header className="bg-white/70 sticky top-0 z-20 backdrop-blur-lg border-b border-zinc-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* 로고 */}
            <div className="flex items-center space-x-3">
              <div className="bg-[#FF6F00] w-11 h-11 rounded-xl flex items-center justify-center shadow-sm">
                <ShoppingBag className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-black text-[#FF6F00]">NiKit</span>
            </div>
            
            {/* ★ 뷰 모드 토글 버튼 (위치 표시 대신 넣음) */}
            <div className="flex bg-white rounded-full p-1 border border-zinc-200 shadow-sm">
              <button 
                onClick={() => setViewMode('list')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-[#FF6F00] text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-100'}`}
              >
                <List className="w-4 h-4" />
                <span>리스트</span>
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-bold transition-all ${viewMode === 'map' ? 'bg-[#FF6F00] text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-100'}`}
              >
                <MapIcon className="w-4 h-4" />
                <span>지도</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 z-10 relative">
        
        {/* 리스트 뷰일 때만 필터 표시 */}
        {viewMode === 'list' && (
          <div className="flex items-center justify-center space-x-4 mb-8">
            <button className="px-5 py-2.5 rounded-full text-base font-bold transition-all duration-300 bg-[#FF6F00] text-white shadow-lg shadow-orange-200">전체</button>
            <button className="px-5 py-2.5 rounded-full text-base font-bold transition-all duration-300 bg-white text-zinc-600 hover:bg-zinc-100">코스트코</button>
            <button className="px-5 py-2.5 rounded-full text-base font-bold transition-all duration-300 bg-white text-zinc-600 hover:bg-zinc-100">트레이더스</button>
          </div>
        )}

        {/* 1. 리스트 뷰 (기존 코드) */}
        {viewMode === 'list' && (
          <div className="grid grid-cols-1 gap-6">
            {loading ? (
              <div className="text-center py-20 text-gray-400">열심히 불러오는 중... 🏃‍♂️</div>
            ) : parties.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p>내 주변에 파티가 없어요 😢</p>
                <p className="text-sm mt-2">직접 파티를 만들어보세요!</p>
              </div>
            ) : (
              parties.map((party) => (
                <div 
                  key={party.partyId}
                  onClick={() => navigate(`/room/${party.partyId}`)}
                  className="bg-white rounded-2xl shadow-lg shadow-orange-100 overflow-hidden border border-zinc-100 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                >
                  <div className="p-5 flex-grow">
                    {/* 상단: 마트명 & 인원 */}
                    <div className="flex justify-between items-center mb-3">
                      <span className={`text-sm font-bold ${party.martName.includes('코스트코') ? 'text-[#E53935]' : 'text-[#43A047]'}`}>
                        {party.martName}
                      </span>
                      <div className="flex items-center space-x-1 text-[#FF6F00] font-bold">
                        <Users className="w-5 h-5" />
                        <span>{party.currentMembers}/{party.maxMembers}명</span>
                      </div>
                    </div>

                    {/* 제목 */}
                    <h3 className="text-xl font-bold text-zinc-800 mb-2">{party.title}</h3>

                    {/* 시간 & 거리 */}
                    <div className="flex items-center text-sm text-zinc-500 mb-4 space-x-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(party.meetTime).toLocaleString()}</span>
                      </div>
                      {/* 거리 표시 */}
                      {party.distance !== undefined && (
                        <div className="flex items-center space-x-1 text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded">
                          <MapPin className="w-3 h-3" />
                          <span>{party.distance}km</span>
                        </div>
                      )}
                    </div>

                    {/* 태그 */}
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-3 py-1 text-sm font-medium bg-orange-50 text-orange-800 rounded-full">#함께해요</span>
                      <span className="px-3 py-1 text-sm font-medium bg-orange-50 text-orange-800 rounded-full">#소분팟</span>
                    </div>
                  </div>

                  {/* 하단 진행률 바 */}
                  <div className="bg-zinc-50 p-4 border-t border-zinc-100">
                    <div className="w-full h-2.5 bg-zinc-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${party.martName.includes('코스트코') ? 'bg-[#E53935]' : 'bg-[#43A047]'}`}
                        style={{ width: `${(party.currentMembers / party.maxMembers) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 2. 지도 뷰 (New) */}
        <div className={`${viewMode === 'map' ? 'block' : 'hidden'} w-full h-[calc(100vh-180px)] rounded-2xl overflow-hidden shadow-lg border border-orange-200 relative`}>
            <div ref={mapRef} className="w-full h-full bg-gray-100"></div>
            
            {/* 안내 문구 */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 px-4 py-2 rounded-full text-xs font-bold text-[#FF6F00] shadow-md z-10 whitespace-nowrap">
              마커를 클릭하면 파티로 이동합니다 🏃‍♂️
            </div>
        </div>

      </main>

      {/* FAB (글쓰기 버튼) */}
      <button 
        onClick={() => navigate('/create')}
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#FF6F00] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-500/30 hover:bg-orange-600 transition-all transform hover:scale-110 active:scale-95 z-50"
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
}