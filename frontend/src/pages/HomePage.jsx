// src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import api from '../api';
import { MapPin, ShoppingCart, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();
  const [parties, setParties] = useState([]); // 타입 없이 그냥 빈 배열 []
  const [loading, setLoading] = useState(true);

  // 백엔드에서 파티 목록 가져오기
  useEffect(() => {
    api.get('/parties')
      .then((response) => {
        if(response.data.success) {
            setParties(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("파티 불러오기 실패:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="pb-20">
      {/* 헤더 */}
      <header className="bg-orange-500 p-4 text-white flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold">NiKit</h1>
        <div className="flex items-center text-sm bg-orange-600 px-3 py-1 rounded-full">
          <MapPin size={14} className="mr-1" />
          <span>부산 대연동</span>
        </div>
      </header>

      {/* 필터 탭 */}
      <div className="flex gap-2 p-4 border-b bg-white">
        <button className="px-4 py-2 bg-gray-800 text-white rounded-full text-sm font-medium">전체</button>
        <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">코스트코</button>
        <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">트레이더스</button>
      </div>

      {/* 리스트 */}
      <div className="p-4 space-y-4">
        {loading ? (
           <div className="text-center py-10 text-gray-500">로딩중...</div>
        ) : parties.length === 0 ? (
           <div className="text-center py-10 text-gray-500">아직 파티가 없어요!</div>
        ) : (
          parties.map((party) => (
            <div key={party.partyId} className="border rounded-xl p-4 shadow-sm hover:shadow-md transition bg-white"
                 onClick={() => navigate(`/room/${party.partyId}`)}>
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-bold px-2 py-1 rounded ${party.martName.includes('코스트코') ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {party.martName}
                </span>
                <span className="text-xs text-gray-500">{new Date(party.meetTime).toLocaleString()}</span>
              </div>
              <h3 className="font-bold text-lg mb-2">{party.title}</h3>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div className="flex items-center">
                    <ShoppingCart size={16} className="mr-1"/>
                    <span>함께 장보기</span>
                </div>
                <span className="font-bold text-orange-500">
                  {party.currentMembers} / {party.maxMembers}명
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 플로팅 버튼 */}
      <button 
        onClick={() => navigate('/create')}
        className="fixed bottom-6 right-[calc(50%-200px)] mr-4 w-14 h-14 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-orange-600 transition">
        <Plus size={28} />
      </button>
    </div>
  );
}