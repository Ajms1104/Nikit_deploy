import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { ChevronLeft, Calculator, Check, Copy, User } from 'lucide-react';

export default function SettlementPage() {
  const { partyId } = useParams();
  const navigate = useNavigate();
  const currentUserId = Number(localStorage.getItem('userId'));
  const isHost = localStorage.getItem('isHost') === 'true'; // 호스트 여부 체크

  const [items, setItems] = useState([]);
  const [result, setResult] = useState(null); // 정산 결과 데이터
  const [loading, setLoading] = useState(true);

  // 1. 초기 데이터 로딩 (아이템 목록)
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      // 구매 확정된 아이템만 불러옵니다 (confirmed=true 인 것만 필터링은 백엔드 혹은 여기서)
      const res = await api.get(`/parties/${partyId}/items`);
      if (res.data.success) {
        // 확정된(confirmed) 아이템만 추려서 초기 상태 설정
        const confirmedItems = res.data.data.filter(item => item.confirmed);
        setItems(confirmedItems);
      }
    } catch (error) {
      console.error("아이템 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. 가격 수정 핸들러 (호스트가 실제 가격 입력)
  const handlePriceChange = (itemId, newPrice) => {
    setItems(prev => prev.map(item => 
      item.itemId === itemId ? { ...item, price: Number(newPrice) } : item
    ));
  };

  // 3. 정산 요청 (백엔드로 데이터 전송)
  const handleCalculate = async () => {
    try {
      // 백엔드 DTO 형식에 맞춰 데이터 변환
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
      console.error("정산 실패:", error);
      alert("정산 처리 중 오류가 발생했습니다.");
    }
  };

  // 4. 송금 링크 (카카오페이 딥링크 예시)
  const handleSendMoney = () => {
    // 실제로는 호스트의 계좌번호나 카카오페이 송금 링크를 넣어야 합니다.
    // 해커톤용 가짜 링크
    window.location.href = "https://qr.kakaopay.com/Ej7k16273"; 
  };

  if (loading) return <div className="p-10 text-center">데이터 불러오는 중...</div>;

  // --- [View 1] 정산 결과 화면 (계산 완료 후) ---
  if (result) {
    // 내 정산 내역 찾기
    const myBill = result.find(r => r.userId === currentUserId);
    const totalSum = result.reduce((acc, cur) => acc + cur.totalAmount, 0);

    return (
      <div className="bg-gray-50 min-h-screen pb-20">
        <header className="bg-white p-4 flex items-center border-b sticky top-0">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2"><ChevronLeft /></button>
          <h1 className="font-bold text-lg ml-2">정산 결과</h1>
        </header>

        <div className="p-5">
          {/* 나의 청구서 */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-orange-100 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs px-3 py-1 rounded-bl-lg font-bold">MY BILL</div>
            <h2 className="text-gray-500 text-sm mb-1">내가 낼 금액</h2>
            <div className="text-3xl font-bold text-gray-900 mb-6">
              {myBill ? myBill.totalAmount.toLocaleString() : 0}원
            </div>

            <div className="space-y-3 border-t border-dashed pt-4">
              {myBill?.details.map((detail, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-600">{detail.itemName}</span>
                  <span className="font-medium">{detail.amount.toLocaleString()}원</span>
                </div>
              ))}
            </div>
          </div>

          {/* 전체 멤버 현황 */}
          <h3 className="font-bold text-gray-700 mb-3 px-1">전체 정산 현황</h3>
          <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
            {result.map((user) => (
              <div key={user.userId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <User size={16} className="text-gray-500"/>
                  </div>
                  <div>
                    <p className="font-bold text-sm">{user.nickname}</p>
                    <p className="text-xs text-gray-400">
                      {user.userId === currentUserId ? "(나)" : "멤버"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-orange-600">{user.totalAmount.toLocaleString()}원</p>
                  <p className="text-xs text-gray-400">입금대기</p>
                </div>
              </div>
            ))}
            <div className="pt-4 mt-2 border-t flex justify-between font-bold">
              <span>총 결제금액</span>
              <span>{totalSum.toLocaleString()}원</span>
            </div>
          </div>
        </div>

        {/* 하단 송금 버튼 (호스트가 아니면 보임) */}
        {!isHost && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-center">
            <div className="w-full max-w-[430px]">
              <button 
                onClick={handleSendMoney}
                className="w-full bg-[#FAE100] text-[#371D1E] font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-400 transition"
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/KakaoTalk_logo_small.png" alt="kakaopay" className="w-5 h-5"/>
                호스트에게 송금하기
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- [View 2] 입력 모드 (아직 정산 안함) ---
  return (
    <div className="bg-white min-h-screen pb-20">
      <header className="bg-white p-4 flex items-center border-b sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2"><ChevronLeft /></button>
        <h1 className="font-bold text-lg ml-2">최종 금액 입력</h1>
      </header>

      <div className="p-5">
        <div className="bg-orange-50 p-4 rounded-xl mb-6 flex gap-3 items-start">
          <Calculator className="text-orange-500 shrink-0 mt-1" size={20}/>
          <div className="text-sm text-gray-700">
            <p className="font-bold mb-1">영수증을 확인해주세요!</p>
            <p>실제 결제된 금액을 입력하면, <br/>참여하지 않은 멤버(반대)를 제외하고 <br/>자동으로 N/1 계산됩니다.</p>
          </div>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.itemId} className="flex items-center justify-between p-2 border-b">
              <span className="font-medium text-lg">{item.name}</span>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  className="w-32 p-2 text-right border border-gray-300 rounded-lg font-bold focus:border-orange-500 outline-none"
                  value={item.price}
                  onChange={(e) => handlePriceChange(item.itemId, e.target.value)}
                />
                <span className="text-gray-500">원</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-center">
        <div className="w-full max-w-[430px]">
          <button 
            onClick={handleCalculate}
            className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition flex items-center justify-center gap-2"
          >
            <Check size={20} />
            정산 결과 보기
          </button>
        </div>
      </div>
    </div>
  );
}