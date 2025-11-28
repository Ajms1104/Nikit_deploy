import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { ChevronLeft, User, Wallet, CheckCircle } from 'lucide-react';

export default function SettlementPage() {
  const { partyId } = useParams();
  const navigate = useNavigate();
  const currentUserId = Number(localStorage.getItem('userId'));
  const isHost = localStorage.getItem('isHost') === 'true'; 
  const [items, setItems] = useState([]);
  const [result, setResult] = useState(null);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await api.get(`/parties/${partyId}/items`);
      if (res.data.success) setItems(res.data.data.filter(i => i.confirmed));
    };
    fetchData();
  }, []);

  const handlePriceChange = (id, val) => setItems(p => p.map(i => i.itemId === id ? {...i, price: Number(val)} : i));
  
  const handleCalculate = async () => {
    const res = await api.post(`/parties/${partyId}/settlement`, { items: items.map(i => ({ itemId: i.itemId, realPrice: i.price })) });
    if (res.data.success) setResult(res.data.data);
  };

  const handleSendMoney = async () => {
    window.open("https://qr.kakaopay.com/Ej7k16273", "_blank");
    await api.post(`/parties/${partyId}/settlement/complete`, { userId: currentUserId });
    setIsPaid(true);
  };

  // 1. 결과 화면 (영수증 스타일)
  if (result) {
    const myBill = result.find(r => r.userId === currentUserId);
    const total = result.reduce((a, c) => a + c.totalAmount, 0);

    return (
      <div className="min-h-screen bg-[#F2F4F6] p-5 pb-24 font-sans">
        <header className="flex items-center mb-6"><button onClick={() => navigate(-1)}><ChevronLeft /></button><span className="ml-2 font-bold text-lg">정산 결과</span></header>
        
        {/* 내 청구서 */}
        <div className="bg-white p-6 rounded-[24px] shadow-sm mb-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-[#FF6F0F]"></div>
          <p className="text-gray-500 text-sm font-medium mb-1">내가 낼 금액</p>
          <h2 className="text-4xl font-extrabold text-[#333D4B] mb-6">{myBill?.totalAmount.toLocaleString()}원</h2>
          <div className="space-y-3 border-t border-gray-100 pt-4">
            {myBill?.details.map((d, i) => (
              <div key={i} className="flex justify-between text-sm text-gray-600">
                <span>{d.itemName}</span>
                <span className="font-bold">{d.amount.toLocaleString()}원</span>
              </div>
            ))}
          </div>
        </div>

        {/* 전체 현황 */}
        <div className="bg-white p-5 rounded-[24px] shadow-sm space-y-4">
          <div className="flex justify-between font-bold text-gray-800 border-b border-gray-100 pb-2">
            <span>총 금액</span>
            <span>{total.toLocaleString()}원</span>
          </div>
          {result.map(u => (
            <div key={u.userId} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><User size={14}/></div>
                <span className={u.userId === currentUserId ? "font-bold" : "text-gray-600"}>{u.nickname}</span>
              </div>
              <span className="font-medium text-gray-500">{u.totalAmount.toLocaleString()}원</span>
            </div>
          ))}
        </div>

        {/* 송금 버튼 */}
        {!isHost && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-center max-w-[430px] mx-auto">
            {isPaid ? (
              <div className="w-full bg-green-100 text-green-700 py-4 rounded-2xl font-bold flex justify-center gap-2 items-center">
                <CheckCircle size={20} /> 송금 완료
              </div>
            ) : (
              <button onClick={handleSendMoney} className="w-full bg-[#FFEB00] text-[#3A1D1D] py-4 rounded-2xl font-bold shadow-lg flex justify-center gap-2 items-center active:scale-95 transition">
                <Wallet size={20} /> 카카오페이 송금
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // 2. 입력 화면 (호스트)
  return (
    <div className="min-h-screen bg-[#F2F4F6] p-5 pb-24 font-sans">
      <header className="flex items-center mb-6"><button onClick={() => navigate(-1)}><ChevronLeft /></button><span className="ml-2 font-bold text-lg">금액 확정</span></header>
      
      <div className="bg-white p-6 rounded-[24px] shadow-sm mb-6">
        <h3 className="font-bold text-lg mb-4 text-gray-800">영수증 금액 입력</h3>
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.itemId} className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">{item.name}</span>
              <div className="flex items-center gap-1">
                <input 
                  type="number" 
                  className="w-24 text-right p-2 bg-gray-50 rounded-lg font-bold focus:ring-2 focus:ring-[#FF6F0F] outline-none"
                  value={item.price} 
                  onChange={e => handlePriceChange(item.itemId, e.target.value)} 
                />
                <span className="text-gray-400 text-sm">원</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-center max-w-[430px] mx-auto">
        <button onClick={handleCalculate} className="w-full bg-[#333D4B] text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition">
          정산 결과 보기
        </button>
      </div>
    </div>
  );
}