import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { ChevronLeft, Plus, ShoppingBag, CheckCircle, ThumbsUp, Wallet, User } from 'lucide-react';

export default function ChatPage() {
  const { partyId } = useParams();
  const navigate = useNavigate();
  const currentUserId = Number(localStorage.getItem('userId'));

  const [party, setParty] = useState(null);
  const [items, setItems] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);

  // 모달 상태
  const [showModal, setShowModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  // 1. 데이터 불러오기
  const fetchData = async () => {
    try {
      const partyRes = await api.get(`/parties/${partyId}`);
      if (partyRes.data.success) {
        setParty(partyRes.data.data);
        // 내가 멤버인지 확인
        setIsMember(partyRes.data.data.members.some(m => m.userId === currentUserId));
      }
      const itemsRes = await api.get(`/parties/${partyId}/items`);
      if (itemsRes.data.success) {
        setItems(itemsRes.data.data);
      }
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [partyId]);

  // 2. 파티 참여
  const handleJoin = async () => {
    try {
      setLoading(true);
      await api.post(`/parties/${partyId}/join`, { userId: currentUserId });
      await fetchData(); 
      alert("참여 완료! 환영합니다 🎉");
    } catch (e) { alert("이미 참여했거나 오류가 발생했습니다."); } 
    finally { setLoading(false); }
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
      setShowModal(false); setNewItemName(''); setNewItemPrice(''); 
      fetchData(); // 리스트 갱신
    } catch (error) { console.error(error); }
  };

  // ★ 4. 투표 하기 (핵심 기능)
  const handleVote = async (itemId) => {
    try {
      // 찬성 투표 요청
      await api.post(`/parties/${partyId}/items/${itemId}/vote`, { 
        userId: currentUserId, 
        agree: true 
      });
      // 투표 후 데이터 갱신 (숫자 올라가는 것 확인)
      fetchData(); 
    } catch (error) {
      console.error("투표 실패:", error);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#F2F4F6] flex items-center justify-center text-[#FF6F0F]">로딩중...</div>;
  if (!party) return <div>파티 정보 없음</div>;

  const confirmedItems = items.filter(i => i.confirmed);
  const votingItems = items.filter(i => !i.confirmed);

  return (
    <div className="flex flex-col h-screen bg-[#F2F4F6] text-[#333D4B] font-sans">
      
      {/* 헤더 */}
      <header className="bg-white px-4 h-16 flex items-center justify-between shadow-sm shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')}><ChevronLeft className="text-gray-600" /></button>
          <div>
            <h1 className="font-bold text-lg leading-tight">{party.martName}</h1>
            <span className="text-xs text-gray-400">{new Date(party.meetTime).toLocaleString()}</span>
          </div>
        </div>
        <div className="bg-orange-50 text-[#FF6F0F] text-xs font-bold px-3 py-1 rounded-full">
          {party.members?.length}명 참여중
        </div>
      </header>

      {/* 상단 고정: 확정 리스트 */}
      {isMember && confirmedItems.length > 0 && (
        <div className="bg-white px-4 py-3 border-b border-gray-100 shrink-0 z-10 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-gray-700 flex items-center gap-1">
              <CheckCircle size={14} className="text-green-500"/> 구매 확정
            </span>
            <span className="text-xs text-gray-400">{confirmedItems.length}개</span>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {confirmedItems.map(item => (
              <span key={item.itemId} className="shrink-0 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full border border-green-100 animate-fade-in-up">
                {item.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 채팅(투표) 영역 */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {!isMember ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-3xl">👋</div>
            <h3 className="font-bold text-xl mb-2">함께 장을 볼까요?</h3>
            <p className="text-gray-500 text-sm mb-6">파티에 참여하면 물건을 제안하고 투표할 수 있어요.</p>
            <button onClick={handleJoin} className="bg-[#FF6F0F] text-white px-6 py-3 rounded-2xl font-bold shadow-lg active:scale-95 transition-all">
              참여하기
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-center my-4">
              <span className="bg-gray-200 text-gray-600 text-[10px] px-3 py-1 rounded-full shadow-sm">
                📢 호스트 1명이 포함되어야 출발 가능합니다.
              </span>
            </div>

            {/* ★ 투표 카드 (여기입니다!) */}
            {votingItems.map(item => (
              <div key={item.itemId} className="flex flex-col gap-1 max-w-[85%] animate-fade-in-up">
                <div className="flex items-center gap-2 ml-1">
                    <User size={12} className="text-gray-400"/>
                    <span className="text-[10px] text-gray-400">익명 제안</span>
                </div>
                
                <div className="bg-white p-4 rounded-[20px] rounded-tl-sm shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-lg text-gray-800">{item.name}</span>
                    <span className="text-sm text-gray-500">{item.price.toLocaleString()}원</span>
                  </div>
                  
                  {/* 투표 버튼 */}
                  <button 
                    onClick={() => handleVote(item.itemId)}
                    className="w-full mt-2 bg-orange-50 text-[#FF6F0F] py-3 rounded-xl text-sm font-bold hover:bg-orange-100 transition flex items-center justify-center gap-2 active:scale-95 border border-orange-100"
                  >
                    <ThumbsUp size={16} /> 
                    <span>찬성합니다!</span>
                    <span className="bg-white text-[#FF6F0F] px-1.5 rounded-md text-xs border border-orange-200">
                        {item.agreeCount} / 3
                    </span>
                  </button>
                </div>
              </div>
            ))}
            
            {/* 안내 문구 */}
            {votingItems.length === 0 && confirmedItems.length === 0 && (
                <div className="text-center text-gray-400 text-sm mt-10">
                  <p>아직 살 물건이 없어요.</p>
                  <p>👇 아래 + 버튼을 눌러 추가해보세요!</p>
                </div>
            )}
          </>
        )}
      </main>

      {/* 하단 바 (멤버일 때만) */}
      {isMember && (
        <footer className="bg-white p-3 pb-safe border-t border-gray-100 flex items-center gap-3">
          <button onClick={() => setShowModal(true)} className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 active:scale-90 transition shadow-sm">
            <Plus />
          </button>
          <button onClick={() => navigate(`/room/${partyId}/settlement`)} className="flex-1 bg-[#FF6F0F] text-white h-12 rounded-full font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition">
            <Wallet size={18} /> 정산하기
          </button>
        </footer>
      )}

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
          <div className="bg-white w-full max-w-[320px] p-6 rounded-[24px] shadow-2xl animate-fade-in-up">
            <h3 className="font-bold text-xl mb-4 text-center text-gray-800">🛍️ 물건 추가</h3>
            <input className="w-full p-3 bg-gray-50 rounded-xl mb-2 text-sm focus:ring-2 focus:ring-[#FF6F0F] outline-none" placeholder="품목명 (예: 연어)" value={newItemName} onChange={e => setNewItemName(e.target.value)} />
            <input className="w-full p-3 bg-gray-50 rounded-xl mb-4 text-sm focus:ring-2 focus:ring-[#FF6F0F] outline-none" type="number" placeholder="예상 가격" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} />
            <div className="flex gap-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-500">취소</button>
              <button onClick={handleAddItem} className="flex-1 py-3 bg-[#FF6F0F] text-white rounded-xl font-bold shadow-md">등록</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}