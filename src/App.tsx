import React, { useState, useEffect } from 'react';

// ==========================================
// 1. 符合 ER 圖規格的初始 mock 數據
// ==========================================

const INITIAL_STORES = {
  id: 'STORE-001',
  name: '綠潔智慧乾洗 - 台北忠孝旗艦店',
  phone: '02-2771-0000',
  line_channel_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  point_rate: 10, // 每10元累積1點
  deposit_required: true, // 啟用押金
  created_at: '2025-01-01 10:00:00'
};

const INITIAL_MEMBERS = [
  { id: 'MEM-0001', line_uid: 'U1234567890abcdef', name: '陳美玲', phone: '0912-345-678', total_points: 125, belong_store_id: 'STORE-001', created_at: '2025-03-15 14:22:10', balance: 1500, totalSpent: 12450, habits: '每週二固定來店送洗上班襯衫、西裝' },
  { id: 'MEM-0002', line_uid: 'U2345678901abcdef', name: '林志明', phone: '0928-111-222', total_points: 42, belong_store_id: 'STORE-001', created_at: '2025-04-20 11:05:33', balance: 350, totalSpent: 6780, habits: '換季時固定會送洗被子、羽絨衣' },
  { id: 'MEM-0003', line_uid: 'U3456789012abcdef', name: '張雅婷', phone: '0935-777-888', total_points: 310, belong_store_id: 'STORE-001', created_at: '2025-02-10 16:45:12', balance: 4200, totalSpent: 18900, habits: '注重高溫除蟎，偏好使用生物溶劑，不加人工香精' },
  { id: 'MEM-0004', line_uid: 'U4567890123abcdef', name: '王大同', phone: '0988-555-444', total_points: 8, belong_store_id: 'STORE-001', created_at: '2026-01-25 09:12:00', balance: 0, totalSpent: 3250, habits: '通常週六上午送洗，要求西裝領口加壓領線' },
  { id: 'MEM-0005', line_uid: 'U5678901234abcdef', name: '李若薇', phone: '0919-666-333', level: '銀卡', total_points: 35, belong_store_id: 'STORE-001', created_at: '2025-06-01 18:30:15', balance: 800, totalSpent: 4500, habits: '高單價洋裝送洗愛好者，每次均自備衣袋' },
];

const INITIAL_BAGS = [
  { id: 'BAG-8821', current_store_id: 'STORE-001', current_member_id: 'MEM-0001', usage_count: 42, status: '正常', last_scanned_at: '2026-06-15 12:00:00' }, 
  { id: 'BAG-1024', current_store_id: 'STORE-001', current_member_id: 'MEM-0003', usage_count: 15, status: '正常', last_scanned_at: '2026-06-27 15:30:00' },
  { id: 'BAG-2045', current_store_id: 'STORE-001', current_member_id: 'MEM-0003', usage_count: 39, status: '正常', last_scanned_at: '2026-06-20 11:20:00' },
  { id: 'BAG-9901', current_store_id: 'STORE-001', current_member_id: '', usage_count: 5, status: '正常', last_scanned_at: '2026-06-25 17:10:00' },
  { id: 'BAG-7744', current_store_id: 'STORE-001', current_member_id: '', usage_count: 40, status: '損壞', last_scanned_at: '2026-06-26 14:00:00' }
];

const INITIAL_ORDERS = [
  { id: 'ORD-2026-0001', store_id: 'STORE-001', member_id: 'MEM-0001', customerName: '陳美玲', customerPhone: '0912-345-678', items: [{ type: '西裝外套', count: 1, price: 250, color: '黑色', material: '純棉', treatment: '標準清洗', remarks: '' }, { type: '襯衫/T恤', count: 2, price: 100, color: '白色', material: '純棉', treatment: '標準清洗', remarks: '' }], amount: 450, points_earned: 45, order_status: '清洗中', bag_id: '', updated_at: '2026-06-27 10:30:00', lineSent: false, paymentMethod: '儲值金' },
  { id: 'ORD-2026-0002', store_id: 'STORE-001', member_id: 'MEM-0003', customerName: '張雅婷', customerPhone: '0935-777-888', items: [{ type: '高級禮服', count: 1, price: 600, color: '紅色', material: '純棉', treatment: '標準清洗', remarks: '' }], amount: 600, points_earned: 60, order_status: '待取貨', bag_id: 'BAG-1024', updated_at: '2026-06-27 16:00:00', lineSent: true, paymentMethod: '儲值金' },
  { id: 'ORD-2026-0003', store_id: 'STORE-001', member_id: 'MEM-0002', customerName: '林志明', customerPhone: '0928-111-222', items: [{ type: '長褲/裙子', count: 2, price: 120, color: '藍色', material: '純棉', treatment: '標準清洗', remarks: '' }], amount: 240, points_earned: 24, order_status: '清洗中', bag_id: '', updated_at: '2026-06-26 09:15:00', lineSent: false, paymentMethod: '現金' },
  { id: 'ORD-2026-0004', store_id: 'STORE-001', member_id: 'MEM-0004', customerName: '王大同', customerPhone: '0988-555-444', items: [{ type: '羽絨大衣', count: 1, price: 450, color: '灰色', material: '純棉', treatment: '標準清洗', remarks: '' }], amount: 450, points_earned: 45, order_status: '已取貨', bag_id: 'BAG-9901', updated_at: '2026-06-25 18:22:00', lineSent: true, paymentMethod: '信用卡' },
];

const INITIAL_DAMAGES = [
  { id: 'DMG-001', bag_id: 'BAG-7744', reported_by_store: 'STORE-001', damage_type: '拉鍊', reported_at: '2026-06-26 14:00:00' }
];

const ITEM_CATEGORIES = [
  { id: 'cat1', name: '襯衫/T恤', icon: '👕', price: 100 },
  { id: 'cat2', name: '西裝外套', icon: '🧥', price: 250 },
  { id: 'cat3', name: '羽絨大衣', icon: '❄️', price: 450 },
  { id: 'cat4', name: '長褲/裙子', icon: '👖', price: 120 },
  { id: 'cat5', name: '高級禮服', icon: '👗', price: 600 },
  { id: 'cat6', name: '床被/寢具', icon: '🛏️', price: 500 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('checkout');
  
  const [storeSettings] = useState(INITIAL_STORES);
  const [customers, setCustomers] = useState(INITIAL_MEMBERS); 
  const [bags, setBags] = useState(INITIAL_BAGS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [damages, setDamages] = useState(INITIAL_DAMAGES);

  const [chartView, setChartView] = useState('月'); 
  const [dashboardChartView, setDashboardChartView] = useState('月'); 
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 收銀台狀態
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [searchPhone, setSearchPhone] = useState('');
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [useEcoSolvent, setEcoSolvent] = useState(true);
  const [orderRemark, setOrderRemark] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('現金');

  // 控制彈窗
  const [isCustomItemOpen, setIsCustomItemOpen] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [isQuickReturnOpen, setIsQuickReturnOpen] = useState(false);
  const [quickReturnBagId, setQuickReturnBagId] = useState('');
  const [isBagBindingModalOpen, setIsBagBindingModalOpen] = useState(false);
  const [bindingOrderId, setBindingOrderId] = useState('');
  const [tempBagId, setTempBagId] = useState('');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpCustomer, setTopUpCustomer] = useState<any>(null);
  const [topUpAmount, setTopUpAmount] = useState('');

  // 損毀回報彈窗狀態
  const [isDamageModalOpen, setIsDamageModalOpen] = useState(false);
  const [damageBagId, setDamageBagId] = useState('');
  const [damageType, setDamageType] = useState('拉鍊');

  // 顧客備註快速修改狀態
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [tempHabitText, setTempHabitText] = useState('');

  const [orderStatusFilter, setOrderStatusFilter] = useState('全部');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState('');

  // 再行銷/客群推播文案
  const [marketingSegment, setMarketingSegment] = useState('eco_fans');
  const [customSmsContent, setCustomSmsContent] = useState('');
  const [campaignHistory, setCampaignHistory] = useState([
    { id: 'CAM-01', name: '環保減碳回饋祭', segment: '環保急先鋒', date: '2026-06-10', count: 3, content: '親愛的綠色會員您好！帶回您手上的「智慧環保衣袋」至店內回收或取件歸還，可直接獲得 50 點 ESG 綠色點數，共同守護地球。', status: '已發送' },
    { id: 'CAM-02', name: '梅雨季烘乾貼心提醒', segment: '全體會員', date: '2026-06-18', count: 5, content: '最近連日大雨，家裡衣服曬不乾嗎？綠潔為您提供100%環保烘乾與抗過敏除蟎清洗服務！', status: '已發送' }
  ]);

  const filteredOrders = orderStatusFilter === '全部'
    ? orders
    : orders.filter((o: any) => o.order_status === orderStatusFilter);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  useEffect(() => {
    if (marketingSegment === 'eco_fans') {
      setCustomSmsContent('【綠潔乾洗】親愛的綠色環保先鋒 {會員姓名} 您好！您目前已為地球減少了包材轉換之碳排放。本週末來店洗衣服並歸還您手邊借用之綠色衣袋，即享折價與點數回饋！');
    } else if (marketingSegment === 'inactive') {
      setCustomSmsContent('【綠潔乾洗】您好，我們好久沒見面了！為了感謝您的支持，我們為您準備了專屬回娘家優惠券，期待為您服務！');
    } else if (marketingSegment === 'big_spenders') {
      setCustomSmsContent('【綠潔乾洗】尊榮會員您好！感謝您對高品質衣物護理的信任。本月我們推出「儲值金限時加碼回饋」，儲值滿3000送500！詳情請洽門市。');
    }
  }, [marketingSegment]);

  const handleSendCampaign = () => {
    if (!customSmsContent.trim()) {
      showToast('⚠️ 推播內容不可為空！');
      return;
    }
    const newCampaign = {
      id: `CAM-${String(campaignHistory.length + 1).padStart(2, '0')}`,
      name: marketingSegment === 'eco_fans' ? '精準推播 - 環保先鋒' : marketingSegment === 'inactive' ? '精準推播 - 久未到店' : '精準推播 - 尊榮會員',
      segment: marketingSegment === 'eco_fans' ? '環保急先鋒' : marketingSegment === 'inactive' ? '久未到店客' : '高價值會員',
      date: '今日',
      count: 3,
      content: customSmsContent,
      status: '已發送'
    };
    setCampaignHistory([newCampaign, ...campaignHistory]);
    showToast('✉️ 智慧再行銷推播訊息已通過 Line / SMS 發送完畢！');
  };

  const handleCustomerSearch = () => {
    const found = customers.find((c: any) => c.phone.includes(searchPhone) || c.name.includes(searchPhone) || c.id.includes(searchPhone));
    if (found) {
      setSelectedCustomer(found);
      showToast(`已連結會員：${found.name} (${found.id})`);
    } else {
      showToast('找不到該會員，請確認電話或新增會員');
    }
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName || !customItemPrice) return;
    const priceNum = parseFloat(customItemPrice);
    if (isNaN(priceNum)) return;

    setOrderItems([...orderItems, { 
      id: `custom_${Date.now()}`, name: customItemName, price: priceNum, count: 1, color: '白色', material: '其他', treatment: '標準清洗', remarks: '' 
    }]);
    setCustomItemName(''); setCustomItemPrice(''); setIsCustomItemOpen(false);
  };

  const updateCartItem = (index: number, field: string, value: any) => {
    const updated = [...orderItems];
    updated[index][field] = value;
    setOrderItems(updated);
  };

  const removeCartItem = (index: number) => {
    const updated = [...orderItems];
    updated.splice(index, 1);
    setOrderItems(updated);
  };

  const calculateSubtotal = () => orderItems.reduce((acc, curr) => acc + (curr.price * curr.count), 0);

  const handleCheckout = () => {
    if (orderItems.length === 0) {
      showToast('❌ 請先加入衣物至購物車！');
      return;
    }
    const subtotal = calculateSubtotal();
    if (selectedCustomer && paymentMethod === '儲值金' && selectedCustomer.balance < subtotal) {
      showToast('❌ 結帳失敗！會員儲值金餘額不足');
      return;
    }

    const orderId = `ORD-2026-${String(orders.length + 1).padStart(4, '0')}`;
    const pointsEarned = Math.floor(subtotal / storeSettings.point_rate);

    const newOrder = {
      id: orderId,
      store_id: storeSettings.id,
      member_id: selectedCustomer ? selectedCustomer.id : 'GUEST',
      customerName: selectedCustomer ? selectedCustomer.name : '散客/非會員',
      customerPhone: selectedCustomer ? selectedCustomer.phone : '-',
      items: orderItems.map(item => ({ type: item.name, count: item.count, price: item.price, color: item.color, material: item.material, treatment: item.treatment, remarks: item.remarks })),
      amount: subtotal,
      points_earned: pointsEarned,
      order_status: '清洗中',
      bag_id: '',
      updated_at: new Date().toLocaleString(),
      lineSent: false,
      paymentMethod: paymentMethod
    };

    if (selectedCustomer) {
      setCustomers(customers.map((c: any) => c.id === selectedCustomer.id ? {
        ...c,
        balance: c.balance - (paymentMethod === '儲值金' ? subtotal : 0),
        total_points: c.total_points + pointsEarned,
        totalSpent: c.totalSpent + subtotal,
        lastVisit: '今日'
      } : c));
    }

    setOrders([newOrder, ...orders]);
    setOrderItems([]);
    setOrderRemark('');
    setSelectedCustomer(null);
    setSearchPhone('');
    showToast(`🎉 訂單 ${orderId} 建立完成！獲得 ${pointsEarned} 點數`);
  };

  const handleSingleStatusChange = (orderId: string, targetStatus: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (targetStatus === '待取貨' && !order.bag_id && order.member_id !== 'GUEST') {
      openBagBindingModal(orderId);
      return;
    }

    setOrders(orders.map(o => o.id === orderId ? { ...o, order_status: targetStatus, updated_at: new Date().toLocaleString() } : o));
    showToast(`訂單 ${orderId} 已變更為「${targetStatus}」`);
  };

  const handleBatchStatusChange = (targetStatus: string) => {
    if (selectedOrderIds.length === 0) return;
    setOrders(orders.map(o => selectedOrderIds.includes(o.id) ? { ...o, order_status: targetStatus, updated_at: new Date().toLocaleString() } : o));
    setSelectedOrderIds([]);
    showToast(`成功批次變更狀態為「${targetStatus}」`);
  };

  const openBagBindingModal = (orderId: string) => {
    setBindingOrderId(orderId); setTempBagId(''); setIsBagBindingModalOpen(true);
  };

  const handleBindBagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempBagId.trim()) return;
    const bagIdUpper = tempBagId.trim().toUpperCase();

    setOrders(orders.map(o => o.id === bindingOrderId ? { ...o, bag_id: bagIdUpper, order_status: '待取貨', updated_at: new Date().toLocaleString() } : o));
    
    const targetOrder = orders.find(o => o.id === bindingOrderId);
    setBags(bags.map((b: any) => b.id === bagIdUpper ? { 
      ...b, 
      current_member_id: targetOrder?.member_id || '', 
      usage_count: b.usage_count + 1,
      last_scanned_at: new Date().toLocaleString()
    } : b));

    setIsBagBindingModalOpen(false);
    showToast(`📦 訂單已完成包裝並綁定衣袋 ${bagIdUpper}！`);
  };

  const handleCustomerPickup = (orderId: string) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, order_status: '已取貨', updated_at: new Date().toLocaleString() } : o));
    showToast('✅ 取件成功！');
  };

  const handleQuickReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickReturnBagId.trim()) return;
    const targetBag = quickReturnBagId.trim().toUpperCase();

    const existingBag = bags.find(b => b.id === targetBag);
    if (existingBag) {
      setBags(bags.map((b: any) => b.id === targetBag ? { ...b, current_member_id: '', last_scanned_at: new Date().toLocaleString() } : b));
      setIsQuickReturnOpen(false); setQuickReturnBagId('');
      showToast(`♻️ 衣袋 ${targetBag} 快速歸還成功！`);
    } else {
      showToast(`⚠️ 找不到此衣袋借用記錄。`);
    }
  };

  const handleReportDamage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!damageBagId.trim()) return;
    const bagIdUpper = damageBagId.trim().toUpperCase();

    const newDamage = {
      id: `DMG-${String(damages.length + 1).padStart(3, '0')}`,
      bag_id: bagIdUpper,
      reported_by_store: storeSettings.id,
      damage_type: damageType,
      reported_at: new Date().toLocaleString()
    };

    setDamages([newDamage, ...damages]);
    setBags(bags.map((b: any) => b.id === bagIdUpper ? { ...b, status: '損壞', last_scanned_at: new Date().toLocaleString() } : b));
    setIsDamageModalOpen(false); setDamageBagId('');
    showToast(`⚠️ 衣袋 ${bagIdUpper} 損毀回報成功，狀態已變更為[損壞]`);
  };

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(topUpAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast('請輸入正確的儲值金額');
      return;
    }
    setCustomers(customers.map((c: any) => c.id === topUpCustomer.id ? { ...c, balance: c.balance + amt } : c));
    setIsTopUpOpen(false); setTopUpAmount('');
    showToast('加值成功！');
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberPhone) return;
    const newId = `MEM-${String(customers.length + 1).padStart(4, '0')}`;
    const newCust = {
      id: newId, line_uid: `U_gen_${Date.now().toString().slice(-8)}`, name: newMemberName, phone: newMemberPhone, total_points: 0, belong_store_id: storeSettings.id, created_at: new Date().toLocaleString(), balance: 0, totalSpent: 0, habits: '新註冊會員'
    };
    setCustomers([newCust, ...customers]); setSelectedCustomer(newCust); setIsAddMemberOpen(false);
    setNewMemberName(''); setNewMemberPhone('');
  };

  const handleSaveHabit = (id: string) => {
    setCustomers(customers.map((c: any) => c.id === id ? { ...c, habits: tempHabitText } : c));
    setEditingHabitId(null); showToast('📝 顧客習性備註已成功儲存！');
  };

  // 圖表點位數據運算
  const totalBagsUsage = bags.reduce((acc: number, curr: any) => acc + curr.usage_count, 0);
  const chartPoints = [{ label: '1月', val: 120, x: 50, y: 160 }, { label: '2月', val: 180, x: 130, y: 140 }, { label: '3月', val: 260, x: 210, y: 120 }, { label: '4月', val: 380, x: 290, y: 90 }, { label: '5月', val: 490, x: 370, y: 60 }, { label: '6月', val: totalBagsUsage, x: 450, y: 30 }];
  const polylinePointsString = chartPoints.map(p => `${p.x},${p.y}`).join(' ');
  
  const dbPoints = [{ label: '05/01', val: '$32K', x: 50, y: 110 }, { label: '05/08', val: '$45K', x: 130, y: 85 }, { label: '05/15', val: '$38K', x: 210, y: 95 }, { label: '05/22', val: '$52K', x: 290, y: 70 }, { label: '05/29', val: '$68K', x: 370, y: 40 }, { label: '06/05', val: '$58K', x: 450, y: 60 }];
  const dbPolylinePoints = dbPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="flex h-screen bg-[#f4f7f6] font-sans text-slate-800 overflow-hidden">
      
      {/* 左側選單 */}
      <aside className="w-64 bg-[#3f8f61] text-white flex flex-col justify-between shadow-xl shrink-0 z-10">
        <div>
          <div className="p-6 bg-[#327750] flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-xl text-white">🌿</div>
            <div className="min-w-0 flex-1">
              <h1 className="font-extrabold text-xs tracking-wider truncate">{storeSettings.name}</h1>
              <span className="text-[10px] text-emerald-100 opacity-80 tracking-widest block">ID: {storeSettings.id}</span>
            </div>
          </div>

          <div className="px-4 py-3 space-y-2 border-b border-white/10 bg-[#378156]">
            <button type="button" onClick={() => setIsQuickReturnOpen(true)} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 rounded-lg transition shadow-sm">
              ♻️ 條碼快速歸還
            </button>
            <button type="button" onClick={() => setIsDamageModalOpen(true)} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2 rounded-lg transition shadow-sm">
              ⚠️ 回報衣袋損毀
            </button>
          </div>

          <nav className="px-3 py-4 space-y-1">
            {[
              { id: 'dashboard', name: '首頁看板', icon: '🏠' },
              { id: 'checkout', name: '衣物收銀台', icon: '👕' },
              { id: 'orders', name: '訂單管理(流轉)', icon: '📋' },
              { id: 'members', name: '客戶與袋子追蹤', icon: '👤' },
              { id: 'reports', name: '再行銷分析', icon: '📊' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSelectedOrderIds([]); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm font-semibold text-left ${activeTab === item.id ? 'bg-white text-[#3f8f61] shadow-lg' : 'text-emerald-50 hover:bg-[#378156]'}`}
              >
                <span>{item.icon}</span> {item.name}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 bg-[#327750] text-xs font-mono">TEL: {storeSettings.phone}</div>
      </aside>

      {/* 右側工作區 */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
        <div className="p-8 flex-1 min-h-0">
          
          {/* 1. 首頁看板 */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white p-4 rounded-xl border">
                <h3 className="text-sm font-bold text-slate-700">趨勢時間區間切換</h3>
                <div className="bg-slate-100 rounded-lg p-0.5 flex gap-1">
                  {['年', '季', '月'].map(view => (
                    <button key={view} onClick={() => setDashboardChartView(view)} className={`px-3 py-1 text-xs font-bold rounded ${dashboardChartView === view ? 'bg-[#3f8f61] text-white shadow-sm' : 'text-slate-600'}`}>{view}</button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                  <div className="text-slate-400 text-xs font-semibold">今日交易總額</div>
                  <div className="text-3xl font-bold text-slate-800">$48,650</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                  <div className="text-slate-400 text-xs font-semibold">流通中衣袋</div>
                  <div className="text-3xl font-bold text-slate-800">{bags.filter((b: any) => b.current_member_id).length} 個</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                  <div className="text-slate-400 text-xs font-semibold">累計回報損毀</div>
                  <div className="text-3xl font-bold text-red-600">{damages.length} 筆</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                  <div className="text-slate-400 text-xs font-semibold">合作點數比例</div>
                  <div className="text-xl font-bold text-slate-800">每 {storeSettings.point_rate} 元積 1 點</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-sm font-bold text-slate-700 mb-4">分店交易趨勢 ({dashboardChartView}維度)</h3>
                <div className="relative bg-slate-50 rounded-xl p-4">
                  <svg className="w-full h-48 overflow-visible" viewBox="0 0 500 150">
                    <polyline fill="none" stroke="#3f8f61" strokeWidth="3.5" points={dbPolylinePoints} />
                    {dbPoints.map((p, idx) => (
                      <circle key={idx} cx={p.x} cy={p.y} r="4" fill="#3f8f61" />
                    ))}
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* 2. 衣物收銀台 */}
          {activeTab === 'checkout' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              <div className="xl:col-span-7 space-y-6">
                <div className="bg-white rounded-2xl p-5 shadow-sm border">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-slate-700">👤 第一步：ER_MEMBERS 欄位檢索</h3>
                    <button onClick={() => setIsAddMemberOpen(true)} className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg font-bold">+ 新增儲存新會員</button>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" placeholder="輸入手機號碼或姓名..." value={searchPhone} onChange={(e) => setSearchPhone(e.target.value)} className="w-full bg-slate-50 border rounded-xl p-2 text-sm focus:outline-none" />
                    <button onClick={handleCustomerSearch} className="bg-[#3f8f61] text-white px-5 rounded-xl text-sm font-bold">檢索</button>
                  </div>

                  {selectedCustomer && (
                    <div className="mt-3 p-4 rounded-xl bg-emerald-50 border text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="font-bold text-slate-900">{selectedCustomer.name} (LINE UID: {selectedCustomer.line_uid})</div>
                        <button onClick={() => { setTopUpCustomer(selectedCustomer); setIsTopUpOpen(true); }} className="bg-amber-500 text-slate-950 font-bold px-2 py-1 rounded">💰 儲值</button>
                      </div>
                      <div className="text-emerald-800 font-medium">累積總點數 (total_points): <span className="font-bold text-sm">{selectedCustomer.total_points} P</span></div>
                      <div className="text-slate-600">儲值金餘額: <span className="font-bold text-emerald-700">${selectedCustomer.balance}</span></div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-slate-700">👕 第二步：盛裝品項點單</h3>
                    <button onClick={() => setIsCustomItemOpen(true)} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded border">➕ 自訂其他衣物</button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {ITEM_CATEGORIES.map(cat => (
                      <button key={cat.id} onClick={() => setOrderItems([...orderItems, { ...cat, count: 1, color: '白色', material: '純棉', treatment: '標準清洗', remarks: '' }])} className="bg-slate-50 border rounded-xl p-3 text-left hover:bg-emerald-50 text-xs">
                        <span className="text-lg block">{cat.icon}</span>
                        <div className="font-bold">{cat.name}</div>
                        <div className="text-slate-400">${cat.price}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border min-h-[200px] flex flex-col">
                  <h3 className="text-sm font-bold text-slate-700 mb-3">🧺 第三步：清單 details</h3>
                  <div className="flex-1 space-y-2">
                    {orderItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{item.name}</span>
                          <select value={item.color} onChange={(e) => updateCartItem(idx, 'color', e.target.value)} className="border text-[10px] rounded p-0.5 bg-white">
                            <option value="白色">白色</option><option value="黑色">黑色</option><option value="藍色">藍色</option>
                          </select>
                        </div>
                        <span className="font-mono font-bold">${item.price}</span>
                        <button onClick={() => removeCartItem(idx)} className="text-red-500 font-bold">✕</button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-2 border-t">
                    <label className="block text-xs font-bold text-slate-600 mb-1">環境分解溶劑與備註</label>
                    <div className="flex items-center gap-4 mb-2">
                      <label className="text-xs flex items-center gap-1 text-slate-500">
                        <input type="checkbox" checked={useEcoSolvent} onChange={(e) => setEcoSolvent(e.target.checked)} /> 啟用環保生物溶劑
                      </label>
                    </div>
                    <input type="text" placeholder="輸入訂單常規備註..." value={orderRemark} onChange={(e) => setOrderRemark(e.target.value)} className="w-full bg-slate-50 border rounded-xl p-2 text-xs focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* 結帳右側 */}
              <div className="xl:col-span-5">
                <div className="bg-emerald-900 rounded-2xl p-6 text-white space-y-6">
                  <div>
                    <label className="block text-xs text-emerald-300 font-bold mb-2">💳 交易付費模式</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['現金', '儲值金', '信用卡'].map(m => (
                        <button key={m} onClick={() => setPaymentMethod(m)} className={`py-2 rounded text-xs font-bold ${paymentMethod === m ? 'bg-teal-400 text-slate-900' : 'bg-emerald-800'}`}>{m}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-baseline border-t border-emerald-800 pt-4">
                    <span className="text-emerald-300 text-xs">應收總金額 (amount)</span>
                    <span className="text-4xl font-black font-mono text-teal-200">${calculateSubtotal()}</span>
                  </div>
                  <button onClick={handleCheckout} className="w-full bg-gradient-to-r from-teal-400 to-emerald-500 text-emerald-950 font-extrabold py-3 rounded-xl transition">
                    ⚡ 成立訂單 (ORDERS 寫入)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. 訂單管理 */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-base font-bold text-slate-800">ORDERS 流水訂單簿</h3>
                <div className="flex gap-2 text-xs">
                  {['全部', '清洗中', '待取貨', '已取貨'].map(status => (
                    <button key={status} onClick={() => setOrderStatusFilter(status)} className={`px-2 py-1 rounded font-bold ${orderStatusFilter === status ? 'bg-[#3f8f61] text-white' : 'bg-slate-100 text-slate-600'}`}>{status}</button>
                  ))}
                  {selectedOrderIds.length > 0 && (
                    <button onClick={() => handleBatchStatusChange('已取貨')} className="bg-indigo-600 text-white px-2 py-1 rounded font-bold">批次取貨</button>
                  )}
                </div>
              </div>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b text-slate-400 font-bold bg-slate-50">
                    <th className="p-2 w-8"><input type="checkbox" onChange={(e) => setSelectedOrderIds(e.target.checked ? filteredOrders.map((o: any) => o.id) : [])} /></th>
                    <th className="p-2">訂單流水號(id)</th>
                    <th className="p-2">會員 ID</th>
                    <th className="p-2">盛裝衣袋(bag_id)</th>
                    <th className="p-2">金額(amount)</th>
                    <th className="p-2">獲得點數</th>
                    <th className="p-2">狀態(order_status)</th>
                    <th className="p-2 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((o: any) => (
                    <tr key={o.id} className="border-b hover:bg-slate-50">
                      <td className="p-2"><input type="checkbox" checked={selectedOrderIds.includes(o.id)} onChange={(e) => setSelectedOrderIds(e.target.checked ? [...selectedOrderIds, o.id] : selectedOrderIds.filter(id => id !== o.id))} /></td>
                      <td className="p-2 font-mono font-bold text-emerald-800">{o.id}</td>
                      <td className="p-2 font-mono">{o.member_id}</td>
                      <td className="p-2">
                        {o.bag_id ? <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">{o.bag_id}</span> : 
                         o.order_status === '清洗中' ? (
                           <button onClick={() => openBagBindingModal(o.id)} className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">分配衣袋</button>
                         ) : '無'}
                      </td>
                      <td className="p-2 font-bold font-mono">${o.amount}</td>
                      <td className="p-2 text-emerald-700 font-bold">+{o.points_earned} P</td>
                      <td className="p-2">
                        <select value={o.order_status} onChange={(e) => handleSingleStatusChange(o.id, e.target.value)} className="border rounded p-0.5 bg-white text-[11px]">
                          <option value="清洗中">清洗中</option><option value="待取貨">待取貨</option><option value="已取貨">已取貨</option>
                        </select>
                      </td>
                      <td className="p-2 text-center">
                        {o.order_status === '待取貨' && (
                          <button onClick={() => handleCustomerPickup(o.id)} className="bg-indigo-600 text-white px-2 py-0.5 rounded text-[10px]">一鍵取貨結案</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. 客戶與袋子追蹤 */}
          {activeTab === 'members' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-bold text-slate-800">BAGS 衣袋實時追蹤主表</h3>
                  <input type="text" placeholder="搜尋會員 ID 或姓名..." value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} className="border rounded-xl px-3 py-1 text-xs focus:outline-none" />
                </div>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b text-slate-400 bg-slate-50 font-bold">
                      <th className="p-2">衣袋條碼 ID</th>
                      <th className="p-2">目前所在分店</th>
                      <th className="p-2">目前借用會員</th>
                      <th className="p-2">累計使用次數</th>
                      <th className="p-2">生命週期警示</th>
                      <th className="p-2">狀態(status)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bags.map((b: any) => (
                      <tr key={b.id} className="border-b hover:bg-slate-50">
                        <td className="p-2 font-mono font-bold text-slate-700">{b.id}</td>
                        <td className="p-2 font-mono text-slate-500">{b.current_store_id}</td>
                        <td className="p-2 font-mono">{b.current_member_id || <span className="text-emerald-600 font-semibold">在庫(空閒)</span>}</td>
                        <td className="p-2 font-bold font-mono text-center">{b.usage_count} 次</td>
                        <td className="p-2">
                          {b.usage_count >= 40 ? <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded">⚠️ 達 40 次臨界上限</span> : <span className="text-slate-400 text-[10px]">正常生命區間</span>}
                        </td>
                        <td className="p-2"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${b.status === '正常' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{b.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 會員名冊與習性追蹤 */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="text-base font-bold text-slate-800 mb-3">MEMBERS 會員客製標籤簿</h3>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b text-slate-400 bg-slate-50 font-bold">
                      <th className="p-2">會員編號</th>
                      <th className="p-2">會員姓名 ｜ 電話</th>
                      <th className="p-2">專屬習性標籤 ｜ 點擊快速修改</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.filter((c: any) => c.name.includes(memberSearch)).map((c: any) => (
                      <tr key={c.id} className="border-b hover:bg-slate-50">
                        <td className="p-2 font-mono font-bold text-slate-700">{c.id}</td>
                        <td className="p-2 font-semibold text-slate-800">{c.name} ({c.phone})</td>
                        <td className="p-2">
                          {editingHabitId === c.id ? (
                            <div className="flex gap-2">
                              <input type="text" value={tempHabitText} onChange={(e) => setTempHabitText(e.target.value)} className="border rounded px-2 py-0.5 text-xs focus:outline-none" />
                              <button onClick={() => handleSaveHabit(c.id)} className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px]">儲存</button>
                              <button onClick={() => setEditingHabitId(null)} className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px]">取消</button>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center group">
                              <span className="text-slate-600">{c.habits || '無備註'}</span>
                              <button onClick={() => { setEditingHabitId(c.id); setTempHabitText(c.habits || ''); }} className="text-emerald-700 font-bold text-[10px] opacity-0 group-hover:opacity-100 transition">✍️ 快速修改</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. 再行銷與推播分析 */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800">🎯 AI 會員智慧客群再行銷</h3>
                  <div className="bg-slate-100 rounded-lg p-1 flex gap-1 text-xs">
                    {['年', '季', '月'].map(view => (
                      <button key={view} onClick={() => setChartView(view)} className={`px-2 py-0.5 rounded ${chartView === view ? 'bg-[#3f8f61] text-white' : 'text-slate-600'}`}>{view}走勢</button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  {['eco_fans', 'inactive', 'big_spenders'].map(seg => (
                    <button key={seg} type="button" onClick={() => setMarketingSegment(seg)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${marketingSegment === seg ? 'bg-[#3f8f61] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      {seg === 'eco_fans' ? '🌲 環保急先鋒' : seg === 'inactive' ? '⏰ 久未到店客' : '💎 高價值愛好者'}
                    </button>
                  ))}
                </div>
                <textarea rows={4} value={customSmsContent} onChange={(e) => setCustomSmsContent(e.target.value)} className="w-full bg-slate-50 border rounded-xl p-3 text-xs leading-relaxed focus:outline-none" />
                <button type="button" onClick={handleSendCampaign} className="w-full bg-[#3f8f61] text-white font-bold py-2 rounded-xl text-xs">發送 Line 精準推播</button>
              </div>

              {/* 歷史衣袋使用走勢 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="text-xs font-bold text-slate-500 mb-2">歷史衣袋總計使用走勢圖 ({chartView})</h3>
                <svg className="w-full h-24 overflow-visible" viewBox="0 0 500 200">
                  <polyline fill="none" stroke="#10b981" strokeWidth="2.5" points={polylinePointsString} />
                </svg>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-3">
                <h3 className="text-sm font-bold text-slate-800">📜 歷史推播紀錄</h3>
                <div className="space-y-3">
                  {campaignHistory.map(cam => (
                    <div key={cam.id} className="p-3 bg-slate-50 rounded-xl border text-[11px] leading-relaxed">
                      <div className="flex justify-between font-bold"><span>{cam.name}</span><span className="text-[#3f8f61]">{cam.status}</span></div>
                      <p className="text-slate-500 mt-1">「{cam.content}」</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ==========================================
          MODALS彈窗組件
          ========================================== */}

      {/* 快速歸還 Modal */}
      {isQuickReturnOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">♻️ 實體衣袋掃描歸還</h3>
            <form onSubmit={handleQuickReturnSubmit} className="space-y-4">
              <input type="text" required placeholder="掃描或輸入衣袋條碼 ID..." value={quickReturnBagId} onChange={(e) => setQuickReturnBagId(e.target.value)} className="w-full border rounded-xl p-2 text-sm focus:outline-none" autoFocus />
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsQuickReturnOpen(false)} className="flex-1 bg-slate-100 p-2 rounded-xl text-xs font-bold">取消</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white p-2 rounded-xl text-xs font-bold">確認歸還在庫</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 回報衣袋損毀 Modal */}
      {isDamageModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">⚠️ 建立 BAG_DAMAGES 異常回報單</h3>
            <form onSubmit={handleReportDamage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">衣袋條碼 ID *</label>
                <input type="text" required placeholder="輸入損壞的衣袋 ID, 例: BAG-8821" value={damageBagId} onChange={(e) => setDamageBagId(e.target.value)} className="w-full border rounded-xl p-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">損壞類型(damage_type) *</label>
                <select value={damageType} onChange={(e) => setDamageType(e.target.value)} className="w-full border rounded-xl p-2 text-sm bg-white focus:outline-none">
                  <option value="拉鍊">拉鍊故障</option>
                  <option value="破損">布料破損</option>
                  <option value="髒污">嚴重髒污</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsDamageModalOpen(false)} className="flex-1 bg-slate-100 p-2 rounded-xl text-xs font-bold">取消</button>
                <button type="submit" className="flex-1 bg-orange-600 text-white p-2 rounded-xl text-xs font-bold">確認申報異常</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 包裝分配袋子 Modal */}
      {isBagBindingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">📦 盛裝封包 ｜ 配發衣袋條碼</h3>
            <form onSubmit={handleBindBagSubmit} className="space-y-4">
              <input type="text" required placeholder="掃描準備使用的衣袋 ID..." value={tempBagId} onChange={(e) => setTempBagId(e.target.value)} className="w-full border rounded-xl p-2 text-sm focus:outline-none" autoFocus />
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsBagBindingModalOpen(false)} className="flex-1 bg-slate-100 p-2 rounded-xl text-xs font-bold">取消</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white p-2 rounded-xl text-xs font-bold">完成綁定</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 快速註冊新會員 Modal */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">👤 新增數位會員欄位</h3>
            <form onSubmit={handleCreateMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">顧客姓名 *</label>
                <input type="text" required placeholder="會員真實姓名" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} className="w-full border rounded-xl p-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">手機號碼 (phone 唯一鍵) *</label>
                <input type="tel" required placeholder="09xx-xxx-xxx" value={newMemberPhone} onChange={(e) => setNewMemberPhone(e.target.value)} className="w-full border rounded-xl p-2 text-sm focus:outline-none" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsAddMemberOpen(false)} className="flex-1 bg-slate-100 p-2 rounded-xl text-xs font-bold">取消</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white p-2 rounded-xl text-xs font-bold">儲存建檔</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 儲值加值中心 Modal */}
      {isTopUpOpen && topUpCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">💳 會員儲值加值中心</h3>
            <form onSubmit={handleTopUpSubmit} className="space-y-4">
              <input type="number" required placeholder="請輸入加值金額 ($)..." value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} className="w-full border rounded-xl p-2 text-sm focus:outline-none" autoFocus />
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsTopUpOpen(false)} className="flex-1 bg-slate-100 p-2 rounded-xl text-xs font-bold">取消</button>
                <button type="submit" className="flex-1 bg-[#3f8f61] text-white p-2 rounded-xl text-xs font-bold">確認加值</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 自訂衣物 Modal */}
      {isCustomItemOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">➕ 新增自訂衣服品項</h3>
            <form onSubmit={handleAddCustomItem} className="space-y-4">
              <input type="text" required placeholder="衣服種類名稱..." value={customItemName} onChange={(e) => setCustomItemName(e.target.value)} className="w-full border rounded-xl p-2 text-sm mb-2 focus:outline-none" />
              <input type="number" required placeholder="洗滌價格..." value={customItemPrice} onChange={(e) => setCustomItemPrice(e.target.value)} className="w-full border rounded-xl p-2 text-sm focus:outline-none" />
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsCustomItemOpen(false)} className="flex-1 bg-slate-100 p-2 rounded-xl text-xs font-bold">取消</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white p-2 rounded-xl text-xs font-bold">確認新增</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast 訊息 */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-emerald-600 text-white rounded-xl py-3 px-5 shadow-2xl z-50 flex items-center gap-2 font-semibold text-xs">
          <span>✨</span> {toastMessage}
        </div>
      )}

    </div>
  );
}