import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { ChevronLeft, Plus, LogOut, ShoppingBag, CheckCircle, ThumbsUp, Wallet } from 'lucide-react';

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

  // 1. 데이터 불러오기 함수
  const fetchData = async () => {
    try {
      const partyRes = await api.get(`/parties/${partyId}`);
      if (partyRes.data.success) {
        setParty(partyRes.data.data);
        
        // ★ 내가 멤버인지 확실하게 체크
        const members = partyRes.data.data.members || [];
        const amIMember = members.some(m => m.userId === currentUserId);
        setIsMember(amIMember);
      }

      const itemsRes = await api.get(`/parties/${partyId}/items`);
      if (itemsRes.data.success) {
        setItems(itemsRes.data.data);
      }
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 초기 로딩
  useEffect(() => {
    fetchData();
  }, [partyId]);

  // 2. 파티 참여 (버그 수정됨)
  const handleJoin = async () => {
    try {
      setLoading(true); // 로딩 표시
      // ★ await 로 확실하게 기다림
      const res = await api.post(`/parties/${partyId}/join`, { userId: currentUserId });
      
      if (res.data.success) {
        // 참여 성공 후 데이터 다시 불러오기
        await fetchData(); 
        alert("파티에 참여했습니다! 🎉");
      }
    } catch (error) {
      // 이미 참여한 경우 등 에러 처리
      if (error.response && error.response.data) {
         // 이미 참여했다면 그냥 새로고침 효과
         if(error.response.data.error === "ALREADY_JOINED") {
             await fetchData();
         } else {
             alert("참여 실패: " + error.response.data.message);
         }
      }
    } finally {
      setLoading(false);
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

  if (loading) return <div className="min-h-screen bg-[#F2F4F6] flex items-center justify-center text-[#FF6F0F]">로딩중...</div>;
  
  // 파티 정보가 없으면 에러 화면
  if (!party) return (
      <div className="min-h-screen bg-[#F2F4F6] flex flex-col items-center justify-center p-6 text-center">
          <p className="text-gray-500 mb-4">파티 정보를 찾을 수 없습니다.</p>
          <button onClick={() => navigate('/')} className="text-[#FF6F0F] font-bold">홈으로 돌아가기</button>
      </div>
  );

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
          {party.members ? party.members.length : 0}명 참여중
        </div>
      </header>

      {/* 상단 고정: 확정 리스트 */}
      {isMember && confirmedItems.length > 0 && (
        <div className="bg-white px-4 py-3 border-b border-gray-100 shrink-0 z-10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-gray-700 flex items-center gap-1">
              <CheckCircle size={14} className="text-green-500"/> 구매 확정
            </span>
            <span className="text-xs text-gray-400">{confirmedItems.length}개</span>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {confirmedItems.map(item => (
              <span key={item.itemId} className="shrink-0 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full border border-green-100">
                {item.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 채팅 영역 */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {!isMember ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-3xl">👋</div>
            <h3 className="font-bold text-xl mb-2">함께 장을 볼까요?</h3>
            <p className="text-gray-500 text-sm mb-6">파티에 참여하면 대화를 볼 수 있어요.</p>
            <button onClick={handleJoin} className="w-full bg-[#FF6F0F] text-white py-4 rounded-2xl font-bold shadow-lg shadow-orange-500/20 active:scale-95 transition-all">
              참여하기
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-center my-4">
              <span className="bg-gray-200 text-gray-600 text-[10px] px-3 py-1 rounded-full">
                📢 호스트 1명이 포함되어야 출발 가능합니다.
              </span>
            </div>

            {/* 투표 카드 */}
            {votingItems.map(item => (
              <div key={item.itemId} className="flex flex-col gap-1 max-w-[85%] animate-fade-in-up">
                <span className="text-[10px] text-gray-400 ml-2">투표 진행중</span>
                <div className="bg-white p-4 rounded-[20px] rounded-tl-sm shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-lg">{item.name}</span>
                    <span className="text-sm text-gray-500">{item.price.toLocaleString()}원</span>
                  </div>
                  <button 
                    onClick={() => handleVote(item.itemId)}
                    className="w-full mt-2 bg-orange-50 text-[#FF6F0F] py-2.5 rounded-xl text-sm font-bold hover:bg-orange-100 transition flex items-center justify-center gap-2"
                  >
                    <ThumbsUp size={16} /> 찬성하기 ({item.agreeCount}/3)
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
      </main>

      {/* 하단 바 (멤버일 때만) */}
      {isMember && (
        <footer className="bg-white p-3 pb-safe border-t border-gray-100 flex items-center gap-3">
          <button onClick={() => setShowModal(true)} className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 active:scale-90 transition">
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
            <h3 className="font-bold text-xl mb-4 text-center">물건 추가</h3>
            <input className="w-full p-3 bg-gray-50 rounded-xl mb-2 text-sm" placeholder="품목명 (예: 연어)" value={newItemName} onChange={e => setNewItemName(e.target.value)} />
            <input className="w-full p-3 bg-gray-50 rounded-xl mb-4 text-sm" type="number" placeholder="예상 가격" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} />
            <div className="flex gap-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-500">취소</button>
              <button onClick={handleAddItem} className="flex-1 py-3 bg-[#FF6F0F] text-white rounded-xl font-bold">등록</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}