import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { ChevronLeft, Calculator, Receipt, Wallet, User, CheckCircle } from 'lucide-react';

export default function SettlementPage() {
  const { partyId } = useParams();
  const navigate = useNavigate();
  const currentUserId = Number(localStorage.getItem('userId'));
  const isHost = localStorage.getItem('isHost') === 'true'; 

  const [items, setItems] = useState([]);
  const [result, setResult] = useState(null); // 정산 결과 데이터
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false); // 송금 완료 여부

  // 1. 초기 데이터 로딩 (아이템 목록 or 이미 정산된 결과)
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 혹시 이미 정산된 결과가 있는지 확인 (백엔드에 조회 API가 있다면 좋음)
      // 지금은 일단 아이템 목록부터 가져옴
      const res = await api.get(`/parties/${partyId}/items`);
      if (res.data.success) {
        const confirmedItems = res.data.data.filter(item => item.confirmed);
        setItems(confirmedItems);
      }
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. 가격 수정 핸들러 (호스트)
  const handlePriceChange = (itemId, newPrice) => {
    setItems(prev => prev.map(item => 
      item.itemId === itemId ? { ...item, price: Number(newPrice) } : item
    ));
  };

  // 3. 정산 요청 (호스트)
  const handleCalculate = async () => {
    try {
      const payload = {
        items: items.map(item => ({
          itemId: item.itemId,
          realPrice: item.price
        }))
      };
      const res = await api.post(`/parties/${partyId}/settlement`, payload);
      if (res.data.success) {
        setResult(res.data.data); // 결과 화면으로 전환
      }
    } catch (error) {
      alert("정산 처리 중 오류가 발생했습니다.");
    }
  };

  // 4. 송금 하기 (게스트) -> 카카오페이 & 백엔드 상태 변경
  const handleSendMoney = async () => {
    // 1. 카카오페이 QR/링크 열기 (새 창)
    window.open("https://qr.kakaopay.com/Ej7k16273", "_blank");

    // 2. 백엔드에 '송금 완료' 알리기
    try {
      await api.post(`/parties/${partyId}/settlement/complete`, { userId: currentUserId });
      setIsPaid(true); // 화면 상태 변경
      alert("송금 처리가 완료되었습니다! 호스트에게 알림이 갑니다.");
    } catch (error) {
      console.error("송금 처리 실패:", error);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center text-[#FF6F00]">로딩중...</div>;

  // --- [View 1] 정산 결과 화면 (결과 데이터가 있을 때) ---
  if (result) {
    const myBill = result.find(r => r.userId === currentUserId);
    const totalSum = result.reduce((acc, cur) => acc + cur.totalAmount, 0);

    return (
      <div className="min-h-screen bg-[#FFFBF5] font-sans p-6 pb-20 text-[#333333]">
        <header className="flex items-center py-4 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-200">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex-grow text-center">
            <h1 className="text-xl font-black">정산 완료</h1>
          </div>
          <div className="w-10"></div>
        </header>

        {/* MY BILL 카드 */}
        <div className="bg-[#FF6F00] rounded-2xl p-6 text-white mb-6 shadow-lg shadow-orange-200 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold">내가 낼 금액</h3>
            <span className="bg-white/30 text-white text-xs font-bold px-3 py-1 rounded-full">MY BILL</span>
          </div>
          <p className="text-5xl font-black mb-6">
            {myBill ? myBill.totalAmount.toLocaleString() : 0}원
          </p>
          
          {/* 상세 내역 */}
          <div className="space-y-3 text-base font-medium border-t border-white/20 pt-4">
            {myBill?.details.map((detail, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="opacity-80">{detail.itemName}</span>
                </div>
                <span>{detail.amount.toLocaleString()}원</span>
              </div>
            ))}
          </div>
        </div>

        {/* 전체 현황 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">전체 결제 금액</h3>
            <span className="text-xl font-black text-[#FF6F00]">{totalSum.toLocaleString()}원</span>
          </div>
          <div className="space-y-3">
            {result.map(user => (
              <div key={user.userId} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <User size={16} className="text-gray-500" />
                  </div>
                  <span className="font-bold">{user.nickname}</span>
                </div>
                <span className="text-gray-600">{user.totalAmount.toLocaleString()}원</span>
              </div>
            ))}
          </div>
        </div>

        {/* 송금 버튼 (게스트만 & 송금 전일 때만) */}
        {!isHost && !isPaid && (
          <button 
            onClick={handleSendMoney}
            className="w-full bg-[#FFEB00] text-[#3A1D1D] font-bold py-4 rounded-xl text-lg flex items-center justify-center gap-2 shadow-md hover:bg-yellow-400 transition-transform active:scale-95"
          >
            <Wallet className="w-6 h-6" />
            <span>카카오페이로 송금하기</span>
          </button>
        )}

        {/* 송금 완료 시 표시 */}
        {isPaid && (
          <div className="w-full bg-green-100 text-green-700 font-bold py-4 rounded-xl text-lg flex items-center justify-center gap-2 border border-green-200">
            <CheckCircle className="w-6 h-6" />
            <span>송금 완료! 호스트 확인 대기중</span>
          </div>
        )}
      </div>
    );
  }

  // --- [View 2] 입력 모드 (호스트 전용) ---
  return (
    <div className="min-h-screen bg-[#FFFBF5] font-sans p-6 pb-20 text-[#333333]">
      <header className="flex items-center py-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-200">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex-grow text-center">
          <h1 className="text-xl font-black">최종 금액 입력</h1>
        </div>
        <div className="w-10"></div>
      </header>

      <div className="mb-12">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calculator className="text-[#FF6F00] w-6 h-6" />
          <span>영수증을 보고 입력해주세요!</span>
        </h2>

        {/* 입력 카드 */}
        <div className="bg-[#FF6F00] rounded-2xl p-6 text-white mb-6 shadow-lg shadow-orange-200">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-lg font-bold">총 예상 금액</h3>
            <span className="bg-white/30 text-white text-xs font-bold px-3 py-1 rounded-full">TOTAL</span>
          </div>
          
          <div className="space-y-4 font-medium">
            {items.map((item) => (
              <div key={item.itemId} className="flex justify-between items-center">
                <span>{item.name}</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    className="w-24 bg-white/20 text-right rounded-lg border-2 border-white/50 focus:ring-2 focus:ring-white/50 py-1 px-2 text-white placeholder-white/70 outline-none"
                    value={item.price}
                    onChange={(e) => handlePriceChange(item.itemId, e.target.value)}
                  />
                  <span className="text-white/80">원</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={handleCalculate}
          className="w-full bg-[#FF6F00] text-white font-bold py-4 rounded-xl text-lg hover:bg-orange-600 transition-transform active:scale-95 shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
        >
          <Receipt className="w-6 h-6" />
          <span>정산 결과 보기</span>
        </button>
      </div>
    </div>
  );
}