import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { ChevronLeft, Plus, LogOut, ShoppingBag, CheckCircle, ThumbsUp, Send, Wallet } from 'lucide-react'; // 아이콘 교체

export default function ChatPage() {
  const { partyId } = useParams();
  const navigate = useNavigate();
  const currentUserId = Number(localStorage.getItem('userId'));

  // 상태 관리
  const [party, setParty] = useState(null);
  const [items, setItems] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);

  // 물건 추가 모달 상태
  const [showModal, setShowModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  // 1. 데이터 불러오기
  const fetchData = async () => {
    try {
      const partyRes = await api.get(`/parties/${partyId}`);
      if (partyRes.data.success) {
        setParty(partyRes.data.data);
        const members = partyRes.data.data.members;
        setIsMember(members.some(m => m.userId === currentUserId));
      }

      const itemsRes = await api.get(`/parties/${partyId}/items`);
      if (itemsRes.data.success) {
        setItems(itemsRes.data.data);
      }
    } catch (error) {
      console.error("로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [partyId]);

  // 2. 파티 참여
  const handleJoin = async () => {
    try {
      await api.post(`/parties/${partyId}/join`, { userId: currentUserId });
      fetchData();
    } catch (error) {
      alert("참여 실패");
    }
  };

  // 3. 물건 추가
  const handleAddItem = async () => {
    if (!newItemName || !newItemPrice) return;
    try {
      await api.post(`/parties/${partyId}/items`, {
        userId: currentUserId,
        name: newItemName,
        price: parseInt(newItemPrice)
      });
      setShowModal(false);
      setNewItemName('');
      setNewItemPrice('');
      fetchData();
    } catch (error) {
      console.error("추가 실패:", error);
    }
  };

  // 4. 투표
  const handleVote = async (itemId) => {
    try {
      await api.post(`/parties/${partyId}/items/${itemId}/vote`, {
        userId: currentUserId,
        agree: true
      });
      fetchData();
    } catch (error) {
      console.error("투표 실패:", error);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#FFF7F0] flex items-center justify-center text-orange-500">로딩중...</div>;
  if (!party) return <div>파티 정보 없음</div>;

  // 확정된 아이템과 투표 중인 아이템 분리
  const confirmedItems = items.filter(i => i.confirmed);
  const votingItems = items.filter(i => !i.confirmed);

  return (
    <div className="flex flex-col h-screen max-w-[430px] mx-auto bg-[#F8F9FA] shadow-lg overflow-hidden font-sans">
      
      {/* 헤더 */}
      <header className="flex items-center justify-between p-4 border-b border-orange-100 bg-white rounded-b-2xl shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-600">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <ShoppingBag className="text-[#FF6F0F] w-6 h-6" />
              <span>{party.martName}</span>
            </h1>
            <p className="text-sm text-gray-500">{new Date(party.meetTime).toLocaleString()}</p>
          </div>
        </div>
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#FFF3E0]">
        
        {/* 상단 아코디언 (구매 리스트) */}
        {isMember && (
          <div className="shrink-0 p-3">
            <details className="group bg-white rounded-2xl shadow-sm border border-orange-100 open">
              <summary className="flex justify-between items-center cursor-pointer list-none p-3 hover:bg-orange-50 transition-colors rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FF6F0F]/10 rounded-full flex items-center justify-center">
                    <ShoppingBag className="text-[#FF6F0F] w-5 h-5" />
                  </div>
                  <span className="font-bold text-gray-800">구매 확정 리스트</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#FF6F0F] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {confirmedItems.length}개
                  </span>
                </div>
              </summary>
              
              <div className="px-4 py-3 space-y-3 border-t border-orange-50">
                {confirmedItems.length === 0 && <p className="text-xs text-gray-400 text-center">아직 확정된 물건이 없어요.</p>}
                
                {confirmedItems.map(item => (
                  <div key={item.itemId} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                    <span className="text-gray-700 font-medium">{item.name}</span>
                    <span className="flex items-center text-green-600 text-xs font-bold">
                      <CheckCircle className="w-4 h-4 mr-1" /> 확정
                    </span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}

        {/* 채팅(투표) 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* 시스템 메시지 */}
          <div className="flex justify-center">
            <div className="text-xs text-yellow-800 bg-[#FFD54F]/30 rounded-full py-1.5 px-4 flex items-center gap-2 shadow-sm">
              <span>📢 호스트 1명이 포함되어야 출발 가능합니다.</span>
            </div>
          </div>

          {!isMember ? (
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-gray-500 mb-4">함께 장을 보려면 참여해주세요!</p>
              <button onClick={handleJoin} className="bg-[#FF6F0F] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-orange-600 transition">
                파티 참여하기
              </button>
            </div>
          ) : (
            <>
              {/* 투표 카드들 (채팅처럼 표시) */}
              {votingItems.map(item => (
                <div key={item.itemId} className="flex flex-col items-start animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-white p-4 rounded-2xl rounded-tl-sm shadow-sm border border-orange-100 max-w-[85%]">
                    <p className="text-gray-800 font-bold mb-1">🙋‍♀️ {item.name} 어때요?</p>
                    <p className="text-sm text-gray-500 mb-3">예상 가격: {item.price.toLocaleString()}원</p>
                    
                    <button 
                      onClick={() => handleVote(item.itemId)}
                      className="w-full flex items-center justify-center gap-2 bg-orange-50 text-[#FF6F0F] py-2 rounded-xl text-sm font-bold hover:bg-orange-100 transition"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      찬성하기 ({item.agreeCount}/3)
                    </button>
                  </div>
                </div>
              ))}
              
              {votingItems.length === 0 && confirmedItems.length === 0 && (
                <div className="text-center text-gray-400 text-sm mt-10">
                  + 버튼을 눌러 살 물건을 제안해보세요!
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* 하단 입력바 (멤버일 때만) */}
      {isMember && (
        <footer className="p-3 bg-white border-t border-gray-100 pb-8">
          <div className="flex items-center gap-3">
            {/* 물건 추가 버튼 */}
            <button 
              onClick={() => setShowModal(true)}
              className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-full text-[#FF6F0F] hover:bg-orange-50 transition-colors shadow-sm"
            >
              <Plus className="w-6 h-6" />
            </button>

            {/* 정산 버튼 (쇼핑 완료 시) */}
            <button 
              onClick={() => navigate(`/room/${partyId}/settlement`)}
              className="flex-1 bg-[#FF6F0F] text-white font-bold py-3 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-orange-200 hover:bg-orange-600 transition"
            >
              <Wallet className="w-5 h-5" />
              <span>쇼핑 완료 & 정산</span>
            </button>
          </div>
        </footer>
      )}

      {/* 물건 추가 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
          <div className="bg-white w-full max-w-[350px] rounded-3xl p-6 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-lg font-bold mb-4 text-center">🛍️ 무엇을 살까요?</h3>
            <input 
              type="text" 
              placeholder="물건 이름 (예: 연어)" 
              className="w-full p-4 bg-gray-50 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-[#FF6F0F]"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
            />
            <input 
              type="number" 
              placeholder="예상 가격 (원)" 
              className="w-full p-4 bg-gray-50 rounded-xl mb-6 focus:outline-none focus:ring-2 focus:ring-[#FF6F0F]"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-500">취소</button>
              <button onClick={handleAddItem} className="flex-1 py-3 bg-[#FF6F0F] text-white rounded-xl font-bold shadow-md">등록</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}