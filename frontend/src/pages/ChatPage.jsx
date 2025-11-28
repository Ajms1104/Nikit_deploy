import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { ChevronLeft, Plus, ThumbsUp, CheckCircle, Wallet } from 'lucide-react';

export default function ChatPage() {
  const { partyId } = useParams();
  const navigate = useNavigate();
  const currentUserId = Number(localStorage.getItem('userId'));

  // 상태 관리
  const [party, setParty] = useState(null);
  const [items, setItems] = useState([]);
  const [isMember, setIsMember] = useState(false); // 내가 이 파티 멤버인가?
  const [loading, setLoading] = useState(true);

  // 물건 추가 모달 상태
  const [showModal, setShowModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  // 1. 데이터 불러오기 (파티 정보 + 아이템 리스트)
  const fetchData = async () => {
    try {
      // 파티 정보 조회
      const partyRes = await api.get(`/parties/${partyId}`);
      if (partyRes.data.success) {
        setParty(partyRes.data.data);
        
        // 내가 멤버인지 확인
        const members = partyRes.data.data.members;
        const memberCheck = members.find(m => m.userId === currentUserId);
        setIsMember(!!memberCheck);
      }

      // 아이템 리스트 조회
      const itemsRes =await api.get(`/parties/${partyId}/items`);
      if (itemsRes.data.success) {
        setItems(itemsRes.data.data);
      }
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [partyId]);

  // 2. 파티 참여하기
  const handleJoin = async () => {
    try {
      const res = await api.post(`/parties/${partyId}/join`, {
        userId: currentUserId
      });
      if (res.data.success) {
        alert("파티에 참여했습니다!");
        fetchData(); // 데이터 새로고침
      }
    } catch (error) {
      alert(error.response?.data?.error || "참여 실패");
    }
  };

  // 3. 물건 추가하기
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
      fetchData(); // 리스트 갱신
    } catch (error) {
      console.error("아이템 추가 실패:", error);
    }
  };

  // 4. 투표하기 (찬성)
  const handleVote = async (itemId) => {
    try {
      await api.post(`/parties/${partyId}/items/${itemId}/vote`, {
        userId: currentUserId,
        agree: true
      });
      fetchData(); // 투표 수 갱신
    } catch (error) {
      console.error("투표 실패:", error);
    }
  };

  if (loading) return <div className="p-10 text-center">로딩중...</div>;
  if (!party) return <div className="p-10 text-center">파티 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-24 relative">
      {/* 헤더 */}
      <header className="bg-white p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="font-bold text-lg">{party.martName}</h1>
            <p className="text-xs text-gray-500">{new Date(party.meetTime).toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">
          {party.members.length}명 참여중
        </div>
      </header>

      {/* 참여하지 않은 경우: 참여 버튼 표시 */}
      {!isMember ? (
        <div className="flex flex-col items-center justify-center h-[60vh] p-6 text-center">
          <h2 className="text-xl font-bold mb-2">아직 멤버가 아니네요!</h2>
          <p className="text-gray-500 mb-6">함께 장을 보려면 참여하기를 눌러주세요.</p>
          <button 
            onClick={handleJoin}
            className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-orange-600 transition"
          >
            파티 참여하기
          </button>
        </div>
      ) : (
        /* 멤버인 경우: 쇼핑 리스트 표시 */
        <div className="p-4 space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg text-blue-700 text-sm mb-4">
            💡 <strong>3명 이상 찬성</strong>하면 구매 확정 리스트에 올라갑니다!
          </div>

          {items.map((item) => (
            <div key={item.itemId} className={`bg-white p-4 rounded-xl shadow-sm border-2 transition ${item.confirmed ? 'border-green-400 bg-green-50' : 'border-transparent'}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-gray-500 text-sm">{item.price.toLocaleString()}원</p>
                </div>
                {item.confirmed && (
                  <span className="flex items-center text-green-600 text-xs font-bold bg-white px-2 py-1 rounded-full shadow-sm">
                    <CheckCircle size={12} className="mr-1" /> 구매확정
                  </span>
                )}
              </div>
              
              {/* 투표 영역 */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-bold mr-1">{item.agreeCount}명</span> 찬성중
                </div>
                <button 
                  onClick={() => handleVote(item.itemId)}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-bold transition ${item.confirmed ? 'bg-gray-200 text-gray-400 cursor-default' : 'bg-orange-100 text-orange-600 hover:bg-orange-200'}`}
                  disabled={item.confirmed}
                >
                  <ThumbsUp size={16} className="mr-1" />
                  {item.confirmed ? '완료됨' : '찬성!'}
                </button>
              </div>
            </div>
          ))}
          
          {/* 아이템 없을 때 */}
          {items.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              아직 살 물건이 없어요.<br/>+ 버튼을 눌러 추가해보세요!
            </div>
          )}
        </div>
      )}

      {/* 멤버일 때만 보이는 버튼들 */}
      {isMember && (
        <>
          {/* 물건 추가 FAB */}
          <button 
            onClick={() => setShowModal(true)}
            className="fixed bottom-24 right-[calc(50%-200px)] mr-4 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition z-20"
          >
            <Plus size={28} />
          </button>

          {/* 정산하기 버튼 (하단 고정) - 호스트만 보이게 할 수도 있음 */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-center z-10">
            <div className="w-full max-w-[430px]">
              <button 
                onClick={() => navigate(`/room/${partyId}/settlement`)}
                className="w-full bg-green-500 text-white font-bold py-3 rounded-xl flex items-center justify-center hover:bg-green-600 transition"
              >
                <Wallet size={20} className="mr-2" />
                쇼핑 완료 & 정산하기
              </button>
            </div>
          </div>
        </>
      )}

      {/* 물건 추가 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-[350px] rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold mb-4">어떤 물건을 살까요?</h3>
            <input 
              type="text" 
              placeholder="물건 이름 (예: 연어, 베이글)" 
              className="w-full p-3 border rounded-lg mb-3"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
            />
            <input 
              type="number" 
              placeholder="예상 가격 (원)" 
              className="w-full p-3 border rounded-lg mb-6"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-200 rounded-xl font-bold">취소</button>
              <button onClick={handleAddItem} className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold">추가하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}