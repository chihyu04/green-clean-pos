import React, { useState, useEffect } from 'react';

const INITIAL_CUSTOMERS = [
  { id: 'MEM-0001', name: '陳美玲', phone: '0912-345-678', level: '金卡', esgPoints: 1250, co2Saved: 35.8, borrowedBags: ['BAG-8821'], lastVisit: '2026-06-15', totalOrders: 28, balance: 1500, totalSpent: 12450, habits: '每週二固定來店送洗上班襯衫、西裝' },
  { id: 'MEM-0002', name: '林志明', phone: '0928-111-222', level: '銀卡', esgPoints: 420, co2Saved: 12.4, borrowedBags: [], lastVisit: '2026-06-20', totalOrders: 12, balance: 350, totalSpent: 6780, habits: '換季時固定會送洗被子、羽絨衣' },
  { id: 'MEM-0003', name: '張雅婷', phone: '0935-777-888', level: '金卡', esgPoints: 3100, co2Saved: 92.5, borrowedBags: ['BAG-1024', 'BAG-2045'], lastVisit: '2026-05-10', totalOrders: 54, balance: 4200, totalSpent: 18900, habits: '注重高溫除蟎，偏好使用生物溶劑，不加人工香精' },
  { id: 'MEM-0004', name: '王大同', phone: '0988-555-444', level: '銅卡', esgPoints: 80, co2Saved: 2.1, borrowedBags: [], lastVisit: '2026-06-25', totalOrders: 2, balance: 0, totalSpent: 3250, habits: '通常週六上午送洗，要求西裝領口加壓領線' },
  { id: 'MEM-0005', name: '李若薇', phone: '0919-666-333', level: '銀卡', esgPoints: 350, co2Saved: 9.8, borrowedBags: [], lastVisit: '2026-04-01', totalOrders: 8, balance: 800, totalSpent: 4500, habits: '高單價洋裝送洗愛好者，每次均自備衣袋' },
];

const ITEM_CATEGORIES = [
  { id: 'cat1', name: '襯衫/T恤', icon: '👕', price: 100, esgPoints: 10 },
  { id: 'cat2', name: '西裝外套', icon: '🧥', price: 250, esgPoints: 20 },
  { id: 'cat3', name: '羽絨大衣', icon: '❄️', price: 450, esgPoints: 35 },
  { id: 'cat4', name: '長褲/裙子', icon: '👖', price: 120, esgPoints: 12 },
  { id: 'cat5', name: '高級禮服', icon: '👗', price: 600, esgPoints: 50 },
  { id: 'cat6', name: '床被/寢具', icon: '🛏️', price: 500, esgPoints: 40 },
];

const INITIAL_ORDERS = [
  { id: 'ORD-2026-0001', memberId: 'MEM-0001', customerName: '陳美玲', customerPhone: '0912-345-678', items: [{ type: '西裝外套', count: 1, price: 250, color: '黑色' }, { type: '襯衫/T恤', count: 2, price: 100, color: '白色' }], total: 450, status: '包裝中', bagId: '', date: '2026-06-27', lineSent: false, paymentMethod: '儲值金' },
  { id: 'ORD-2026-0002', memberId: 'MEM-0003', customerName: '張雅婷', customerPhone: '0935-777-888', items: [{ type: '高級禮服', count: 1, price: 600, color: '紅色' }], total: 600, status: '待取件', bagId: 'BAG-1024', date: '2026-06-27', lineSent: true, paymentMethod: '儲值金' },
  { id: 'ORD-2026-0003', memberId: 'MEM-0002', customerName: '林志明', customerPhone: '0928-111-222', items: [{ type: '長褲/裙子', count: 2, price: 120, color: '藍色' }], total: 240, status: '清洗中', bagId: '', date: '2026-06-26', lineSent: false, paymentMethod: '現金' },
  { id: 'ORD-2026-0004', memberId: 'MEM-0004', customerName: '王大同', customerPhone: '0988-555-444', items: [{ type: '羽絨大衣', count: 1, price: 450, color: '灰色' }], total: 450, status: '已取件', bagId: 'BAG-9901', date: '2026-06-25', lineSent: true, paymentMethod: '信用卡' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('checkout');
  
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [bagCirculationCount, setBagCirculationCount] = useState(584);
  const [chartView, setChartView] = useState('月'); 
  const [dashboardChartView, setDashboardChartView] = useState('月'); 
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 收銀台 (衣物管理分頁) 狀態
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [searchPhone, setSearchPhone] = useState('');
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [useEcoSolvent, setEcoSolvent] = useState(true);
  const [orderRemark, setOrderRemark] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('現金');

  // 各種控制彈窗
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

  // 顧客備註快速修改狀態
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [tempHabitText, setTempHabitText] = useState('');

  const [inventoryList, setInventoryList] = useState([
    { id: 'INV-01', name: '智慧循環衣袋', stock: 120, minStock: 20, unit: '個' },
    { id: 'INV-02', name: '環保回收衣架', stock: 350, minStock: 50, unit: '支' },
    { id: 'INV-03', name: '整袋送洗之洗衣籃', stock: 15, minStock: 3, unit: '個' },
    { id: 'INV-04', name: '環保無毒生物溶劑', stock: 45, minStock: 10, unit: '公升' }
  ]);

  // 營運設定狀態
  const [settings, setSettings] = useState({
    storeName: '綠潔智慧乾洗 - 台北忠孝旗艦店',
    phone: '02-2771-0000',
    address: '台北市大安區忠孝東路四段 100 號',
    lineNotificationTemplate: '【綠潔智慧乾洗】親愛的 {會員姓名} 您好，您送洗的衣物已經清洗完成囉！本次我們使用智慧循環衣袋「{衣袋編號}」為您包裝，歡迎您隨時前來店內取件並順便歸還空袋。一同守護地球綠色環境！',
    isAutoPrintLabel: true
  });

  // 再行銷/客群推播
  const [marketingSegment, setMarketingSegment] = useState('eco_fans');
  const [customSmsContent, setCustomSmsContent] = useState('');
  const [campaignHistory, setCampaignHistory] = useState([
    { id: 'CAM-01', name: '環保減碳回饋祭', segment: '環保急先鋒', date: '2026-06-10', count: 3, content: '親愛的綠色會員您好！帶回您手上的「智慧循環衣袋」至店內回收或取件歸還，可直接獲得 50 點  配客點，共同守護地球。', status: '已發送' },
    { id: 'CAM-02', name: '梅雨季烘乾貼心提醒', segment: '全體會員', date: '2026-06-18', count: 5, content: '最近連日大雨，家裡衣服曬不乾嗎？綠潔為您提供100%環保烘乾與抗過敏除蟎清洗服務！', status: '已發送' }
  ]);

  // 洗衣狀態篩選與多選
  const [orderStatusFilter, setOrderStatusFilter] = useState('全部');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // 會員篩選
  const [memberSearch, setMemberSearch] = useState('');

  // 定義被篩選後的訂單資料
  const filteredOrders = orderStatusFilter === '全部'
    ? orders
    : orders.filter(o => o.status === orderStatusFilter);

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  useEffect(() => {
    if (marketingSegment === 'eco_fans') {
      setCustomSmsContent('【綠潔乾洗】親愛的綠色環保先鋒 {會員姓名} 您好！您目前已為地球減少了 {減碳量}kg 碳排放。本週末來店洗衣服並歸還您手邊借用之綠色衣袋，即享綠色極致清洗 85 折與點數回饋！');
    } else if (marketingSegment === 'inactive') {
      setCustomSmsContent('【綠潔乾洗】您好，我們好久沒見面了！為了感謝您的支持，我們為您準備了專屬回娘家優惠券：輸入/出示代碼【MISSYOU】即可折抵乾洗費 100 元，期待為您服務！');
    } else if (marketingSegment === 'big_spenders') {
      setCustomSmsContent('【綠潔乾洗】尊榮會員 {會員姓名} 您好！感謝您對高品質衣物護理的信任。本月我們推出「儲值金限時加碼回饋」，儲值滿3000送500！詳情請洽門市。');
    }
  }, [marketingSegment]);

  const handleCustomerSearch = () => {
    const found = customers.find(c => c.phone.includes(searchPhone) || c.name.includes(searchPhone) || c.id.includes(searchPhone));
    if (found) {
      setSelectedCustomer(found);
      showToast(`已連結會員：${found.name} (${found.id})`);
    } else {
      showToast('找不到該會員，請確認電話或新增會員');
    }
  };

  // 快速新增自訂衣物
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName || !customItemPrice) {
      showToast('請填寫完整衣服項目與價格！');
      return;
    }
    const priceNum = parseFloat(customItemPrice);
    if (isNaN(priceNum)) {
      showToast('價格必須為數字');
      return;
    }

    const newCustomItem = {
      id: `custom_${Date.now()}`,
      name: customItemName,
      price: priceNum,
      count: 1,
      esgPoints: 15,
      material: '其他',
      treatment: '標準清洗',
      color: '白色',
      remarks: ''
    };

    setOrderItems([...orderItems, newCustomItem]);
    setCustomItemName('');
    setCustomItemPrice('');
    setIsCustomItemOpen(false);
    showToast(`已成功新增自訂衣服項目「${customItemName}」`);
  };

  // 購物車變更與收銀
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

  const calculateSubtotal = () => {
    return orderItems.reduce((acc, curr) => acc + (curr.price * curr.count), 0);
  };

  const handleCheckout = () => {
    if (orderItems.length === 0) {
      showToast('❌ 請先加入衣物至購物車！');
      return;
    }

    const subtotal = calculateSubtotal();

    if (selectedCustomer && paymentMethod === '儲值金') {
      if (selectedCustomer.balance < subtotal) {
        showToast(`❌ 結帳失敗！會員儲值金餘額不足 (剩餘 $${selectedCustomer.balance}，尚缺 $${subtotal - selectedCustomer.balance})`);
        return;
      }
    }

    const orderId = `ORD-2026-${String(orders.length + 1).padStart(4, '0')}`;
    const newOrder = {
      id: orderId,
      memberId: selectedCustomer ? selectedCustomer.id : 'GUEST',
      customerName: selectedCustomer ? selectedCustomer.name : '散客/非會員',
      customerPhone: selectedCustomer ? selectedCustomer.phone : '-',
      items: orderItems.map(item => ({ type: item.name, count: item.count, price: item.price, color: item.color })),
      total: subtotal,
      status: '清洗中',
      bagId: '',
      date: '2026-06-28',
      lineSent: false,
      paymentMethod: paymentMethod
    };

    if (selectedCustomer) {
      const updatedCust = customers.map(c => {
        if (c.id === selectedCustomer.id) {
          const deductAmount = paymentMethod === '儲值金' ? subtotal : 0;
          return {
            ...c,
            balance: c.balance - deductAmount,
            esgPoints: c.esgPoints + orderItems.length * 10,
            lastVisit: '今日',
            totalOrders: c.totalOrders + 1,
            totalSpent: c.totalSpent + subtotal
          };
        }
        return c;
      });
      setCustomers(updatedCust);
      
      if (paymentMethod === '儲值金') {
        setSelectedCustomer((prev: any) => ({ ...prev, balance: prev.balance - subtotal }));
      }
    }

    setOrders([newOrder, ...orders]);
    setOrderItems([]);
    setOrderRemark('');
    setSelectedCustomer(null);
    setSearchPhone('');
    showToast(`🎉 訂單 ${orderId} 建立完成！`);
  };

  const handleSingleStatusChange = (orderId: string, targetStatus: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (targetStatus === '待取件' && !order.bagId && order.memberId !== 'GUEST') {
      openBagBindingModal(orderId);
      return;
    }

    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: targetStatus };
      }
      return o;
    });
    setOrders(updated);
    showToast(`訂單 ${orderId} 已變更為「${targetStatus}」`);
  };

  const handleBatchStatusChange = (targetStatus: string) => {
    if (selectedOrderIds.length === 0) return;

    const unbondedMemberOrders = orders.filter(o => selectedOrderIds.includes(o.id) && o.memberId !== 'GUEST' && !o.bagId);
    if (targetStatus === '待取件' && unbondedMemberOrders.length > 0) {
      showToast(`⚠️ 批次失敗！部分勾選訂單尚未掃描包裝綁定衣袋。`);
      return;
    }

    const updated = orders.map(o => {
      if (selectedOrderIds.includes(o.id)) {
        return { ...o, status: targetStatus };
      }
      return o;
    });
    setOrders(updated);
    setSelectedOrderIds([]);
    showToast(`成功批次變更狀態為「${targetStatus}」`);
  };

  const openBagBindingModal = (orderId: string) => {
    setBindingOrderId(orderId);
    setTempBagId('');
    setIsBagBindingModalOpen(true);
  };

  const handleBindBagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempBagId.trim()) return;

    const bagIdUpper = tempBagId.trim().toUpperCase();
    const order = orders.find(o => o.id === bindingOrderId);
    if (!order) return;

    const updatedOrders = orders.map(o => {
      if (o.id === bindingOrderId) {
        return { ...o, bagId: bagIdUpper, status: '待取件' };
      }
      return o;
    });
    setOrders(updatedOrders);

    if (order.memberId && order.memberId !== 'GUEST') {
      const updatedCustomers = customers.map(c => {
        if (c.id === order.memberId) {
          const updatedBags = c.borrowedBags.includes(bagIdUpper) ? c.borrowedBags : [...c.borrowedBags, bagIdUpper];
          return { ...c, borrowedBags: updatedBags };
        }
        return c;
      });
      setCustomers(updatedCustomers);
    }

    setBagCirculationCount(prev => prev + 1);
    setIsBagBindingModalOpen(false);
    setTempBagId('');
    showToast(`📦 訂單 ${order.id} 已完成包裝並綁定衣袋 ${bagIdUpper}！`);
  };

  const handleCustomerPickup = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: '已取件' };
      }
      return o;
    });
    setOrders(updatedOrders);

    if (order.memberId && order.memberId !== 'GUEST' && order.bagId) {
      const updatedCustomers = customers.map(c => {
        if (c.id === order.memberId) {
          const updatedBags = c.borrowedBags.filter(b => b !== order.bagId);
          return { 
            ...c, 
            borrowedBags: updatedBags,
            esgPoints: c.esgPoints + 50,
            co2Saved: Number((c.co2Saved + 0.15).toFixed(2))
          };
        }
        return c;
      });
      setCustomers(updatedCustomers);
      showToast(`✅ 歸還衣袋 ${order.bagId} 成功！${order.customerName} 取件完成！`);
    } else {
      showToast(`✅ 散客訂單 ${orderId} 取件成功！`);
    }
  };

  const handleQuickReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickReturnBagId.trim()) return;

    const targetBag = quickReturnBagId.trim().toUpperCase();
    let foundMember: any = null;

    const updatedCustomers = customers.map(c => {
      if (c.borrowedBags.includes(targetBag)) {
        foundMember = c;
        const updatedBags = c.borrowedBags.filter(b => b !== targetBag);
        return {
          ...c,
          borrowedBags: updatedBags,
          esgPoints: c.esgPoints + 50,
          co2Saved: Number((c.co2Saved + 0.15).toFixed(2))
        };
      }
      return c;
    });

    if (foundMember) {
      setCustomers(updatedCustomers);
      const updatedOrders = orders.map(o => {
        if (o.bagId === targetBag && o.status === '待取件') {
          return { ...o, status: '已取件' };
        }
        return o;
      });
      setOrders(updatedOrders);
      setBagCirculationCount(prev => prev + 1);
      
      if (selectedCustomer && selectedCustomer.id === foundMember.id) {
        setSelectedCustomer((prev: any) => ({
          ...prev,
          borrowedBags: prev.borrowedBags.filter((b: string) => b !== targetBag),
          esgPoints: prev.esgPoints + 50
        }));
      }

      showToast(`♻️ 衣袋 ${targetBag} 快速歸還成功！歸還會員：${foundMember.name} (+50 配客點)`);
    } else {
      showToast(`⚠️ 找不到此衣袋借用記錄，或此衣袋已被歸還。`);
    }

    setQuickReturnBagId('');
    setIsQuickReturnOpen(false);
  };

  // 會員加值
  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(topUpAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast('請輸入正確的儲值金額');
      return;
    }

    const updatedCust = customers.map(c => {
      if (c.id === topUpCustomer.id) {
        return { ...c, balance: c.balance + amt };
      }
      return c;
    });
    setCustomers(updatedCust);

    if (selectedCustomer && selectedCustomer.id === topUpCustomer.id) {
      setSelectedCustomer((prev: any) => ({
        ...prev,
        balance: prev.balance + amt
      }));
    }

    setIsTopUpOpen(false);
    setTopUpAmount('');
    showToast(`儲值成功！${topUpCustomer.name} 已成功儲值 $${amt} 元。`);
  };

  // 新增會員
  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberPhone) return;

    const newId = `MEM-${String(customers.length + 1).padStart(4, '0')}`;
    const newCust = {
      id: newId,
      name: newMemberName,
      phone: newMemberPhone,
      level: '新芽會員',
      esgPoints: 100,
      co2Saved: 0.0,
      borrowedBags: [],
      lastVisit: '今日',
      totalOrders: 0,
      balance: 0,
      totalSpent: 0,
      habits: '新註冊會員，無備註'
    };
    setCustomers([newCust, ...customers]);
    setSelectedCustomer(newCust);
    setNewMemberName('');
    setNewMemberPhone('');
    setIsAddMemberOpen(false);
    showToast(`新會員 ${newCust.name} 創建成功！`);
  };

  // 保存客戶專屬備註 / 習性
  const handleSaveHabit = (id: string) => {
    const updated = customers.map(c => {
      if (c.id === id) {
        return { ...c, habits: tempHabitText };
      }
      return c;
    });
    setCustomers(updated);
    setEditingHabitId(null);
    showToast('📝 顧客習性備註已成功儲存！');
  };

  // 衣袋循環折線圖數據 (報表分析頁面)
  const getChartData = () => {
    if (chartView === '月') {
      return [
        { label: '1月', val: 120, x: 50, y: 160 },
        { label: '2月', val: 180, x: 130, y: 140 },
        { label: '3月', val: 260, x: 210, y: 120 },
        { label: '4月', val: 380, x: 290, y: 90 },
        { label: '5月', val: 490, x: 370, y: 60 },
        { label: '6月', val: bagCirculationCount, x: 450, y: 30 },
      ];
    } else if (chartView === '季') {
      return [
        { label: '第一季', val: 300, x: 80, y: 140 },
        { label: '第二季', val: 640, x: 200, y: 100 },
        { label: '第三季', val: 1074, x: 320, y: 50 },
        { label: '第四季', val: 1250, x: 440, y: 25 },
      ];
    } else {
      return [
        { label: '2024年', val: 1850, x: 100, y: 150 },
        { label: '2025年', val: 3200, x: 250, y: 90 },
        { label: '2026年', val: 5800, x: 400, y: 30 },
      ];
    }
  };

  const chartPoints = getChartData();
  const polylinePointsString = chartPoints.map(p => `${p.x},${p.y}`).join(' ');

  // 實時動態計算：首頁「營收趨勢」圖表數據點
  const getDashboardChartData = () => {
    if (dashboardChartView === '月') {
      return [
        { label: '05/01', val: '$32K', x: 50, y: 110 },
        { label: '05/08', val: '$45K', x: 130, y: 85 },
        { label: '05/15', val: '$38K', x: 210, y: 95 },
        { label: '05/22', val: '$52K', x: 290, y: 70 },
        { label: '05/29', val: '$68K', x: 370, y: 40 },
        { label: '06/05', val: '$58K', x: 450, y: 60 },
      ];
    } else if (dashboardChartView === '季') {
      return [
        { label: '第一季', val: '$112K', x: 80, y: 120 },
        { label: '第二季', val: '$165K', x: 200, y: 85 },
        { label: '第三季', val: '$208K', x: 320, y: 55 },
        { label: '第四季', val: '$254K', x: 440, y: 35 },
      ];
    } else {
      return [
        { label: '2024年', val: '$380K', x: 100, y: 120 },
        { label: '2025年', val: '$490K', x: 250, y: 75 },
        { label: '2026年', val: '$620K', x: 400, y: 35 },
      ];
    }
  };

  const dbPoints = getDashboardChartData();
  const dbPolylinePoints = dbPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="flex h-screen bg-[#f4f7f6] font-sans text-slate-800 overflow-hidden">
      
      {/* ==========================================
          左側主選單 (風格完全看齊 image_9ac926.jpg)
          ========================================== */}
      <aside className="w-64 bg-[#3f8f61] text-white flex flex-col justify-between shadow-xl shrink-0 z-10">
        <div>
          {/* Logo 標題 */}
          <div className="p-6 bg-[#327750] flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-xl text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-wider">營運管理系統</h1>
              <span className="text-[10px] text-emerald-100 opacity-80 font-semibold tracking-widest block">GREEN CLEAN POS</span>
            </div>
          </div>

          {/* 備援快速按鈕 */}
          <div className="px-4 py-3 space-y-2 border-b border-white/10 bg-[#378156]">
            <button
              type="button"
              onClick={() => {
                setQuickReturnBagId('');
                setIsQuickReturnOpen(true);
              }}
              className="w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs py-2 rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 shadow-sm"
            >
              ♻️ 快速歸還衣袋
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('checkout');
                showToast('已轉到送洗收銀台');
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs py-2 rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 shadow-sm"
            >
              🧺 登記送洗
            </button>
          </div>

          {/* 導航功能清單 (7 大分頁) */}
          <nav className="px-3 py-4 space-y-1">
            {[
              { id: 'dashboard', name: '首頁', icon: '🏠' },
              { id: 'orders', name: '訂單管理', icon: '📋' },
              { id: 'members', name: '客戶管理', icon: '👤' },
              { id: 'checkout', name: '衣物管理', icon: '👕' },
              { id: 'inventory', name: '庫存管理', icon: '📦' },
              { id: 'reports', name: '報表分析', icon: '📊' },
              { id: 'settings', name: '系統設定', icon: '⚙️' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSelectedOrderIds([]);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm font-semibold text-left ${
                  activeTab === item.id 
                    ? 'bg-[#ffffff] text-[#3f8f61] shadow-lg' 
                    : 'text-emerald-50 hover:bg-[#378156]'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 bg-[#327750] text-xs">
          <div className="font-semibold text-emerald-100">綠潔台北忠孝旗艦店</div>
          <div className="text-emerald-300 mt-0.5">操作員：陳店長</div>
        </div>
      </aside>

      {/* ==========================================
          右側工作區域
          ========================================== */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
        
        {/* 頂部輕量級 Header */}
        <header className="bg-white border-b border-slate-200 py-4 px-8 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800">
              {activeTab === 'dashboard' && '首頁'}
              {activeTab === 'orders' && '訂單管理'}
              {activeTab === 'members' && '客戶管理'}
              {activeTab === 'checkout' && '衣物管理 / 收銀登記'}
              {activeTab === 'inventory' && '庫存管理'}
              {activeTab === 'reports' && '報表分析'}
              {activeTab === 'settings' && '系統設定'}
            </h2>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
            <span>營運在線</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>
        </header>

        {/* 核心內容渲染 */}
        <div className="p-8 flex-1 min-h-0">
          
          {/* 1. 首頁 */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* 4 大指標卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 space-y-1">
                  <div className="text-slate-400 text-xs font-semibold">今日訂單</div>
                  <div className="text-3xl font-bold text-slate-800">128 <span className="text-xs text-slate-500">筆</span></div>
                  <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-0.5">↑ 12% <span className="text-slate-400 font-normal">相較昨日</span></div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 space-y-1">
                  <div className="text-slate-400 text-xs font-semibold">待處理訂單</div>
                  <div className="text-3xl font-bold text-slate-800">45 <span className="text-xs text-slate-500">筆</span></div>
                  <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-0.5">↑ 8% <span className="text-slate-400 font-normal">相較上週</span></div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 space-y-1">
                  <div className="text-slate-400 text-xs font-semibold">今日營收</div>
                  <div className="text-3xl font-bold text-slate-800">$48,650</div>
                  <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-0.5">↑ 15% <span className="text-slate-400 font-normal">相較昨日</span></div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 space-y-1">
                  <div className="text-slate-400 text-xs font-semibold">會員總數</div>
                  <div className="text-3xl font-bold text-slate-800">1,256 <span className="text-xs text-slate-500">人</span></div>
                  <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-0.5">↑ 7% <span className="text-slate-400 font-normal">本月新增</span></div>
                </div>
              </div>

              {/* 折線圖與比例圓環圖 */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                
                {/* 營收趨勢 */}
                <div className="xl:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-700">營收趨勢</h3>
                    <div className="bg-slate-100 rounded-lg p-0.5 flex gap-1">
                      {['年', '季', '月'].map(view => (
                        <button
                          key={view}
                          type="button"
                          onClick={() => setDashboardChartView(view)}
                          className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                            dashboardChartView === view 
                              ? 'bg-[#3f8f61] text-white shadow-sm' 
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {view}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="relative bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <svg className="w-full h-48 overflow-visible" viewBox="0 0 500 150">
                      <line x1="40" y1="30" x2="470" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="70" x2="470" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="110" x2="470" y2="110" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="130" x2="470" y2="130" stroke="#cbd5e1" strokeWidth="1" />
                      <line x1="40" y1="15" x2="40" y2="130" stroke="#cbd5e1" strokeWidth="1" />

                      <defs>
                        <linearGradient id="dbAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3f8f61" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#3f8f61" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <polygon 
                        points={`${dbPoints[0].x},130 ` + dbPolylinePoints + ` ${dbPoints[dbPoints.length - 1].x},130`}
                        fill="url(#dbAreaGrad)"
                      />

                      <polyline
                        fill="none"
                        stroke="#3f8f61"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={dbPolylinePoints}
                      />
                      
                      {dbPoints.map((p, idx) => (
                        <g key={idx}>
                          <circle cx={p.x} cy={p.y} r="5.5" fill="#ffffff" stroke="#3f8f61" strokeWidth="2.5" />
                          <circle cx={p.x} cy={p.y} r="2" fill="#3f8f61" />
                          
                          <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">
                            {p.val}
                          </text>
                          <text x={p.x} y="145" textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="semibold">
                            {p.label}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>

                {/* 訂單狀態比例 (圓環圖) */}
                <div className="xl:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
                  <h3 className="text-sm font-bold text-slate-700">訂單狀態比例</h3>
                  <div className="flex items-center justify-between">
                    <div className="relative w-32 h-32 shrink-0">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="text-[#3f8f61]" strokeDasharray="60, 100" strokeWidth="4.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="text-amber-500" strokeDasharray="25, 100" strokeWidth="4.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" strokeDashoffset="-60" />
                        <path className="text-blue-500" strokeDasharray="15, 100" strokeWidth="4.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" strokeDashoffset="-85" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold text-slate-800">128</span>
                        <span className="text-[10px] text-slate-400">總筆數</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs font-semibold text-slate-600">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#3f8f61]"></span>
                        <span>已完成 (60%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                        <span>待處理 (25%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                        <span>處理中 (15%)</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* 客戶資料 */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-sm font-bold text-slate-700 mb-4">客戶資料摘要</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 pb-2.5 font-bold">
                        <th className="pb-2">會員編號</th>
                        <th className="pb-2">姓名</th>
                        <th className="pb-2">聯絡電話</th>
                        <th className="pb-2">消費次數</th>
                        <th className="pb-2">累積消費金額</th>
                        <th className="pb-2">會員等級</th>
                        <th className="pb-2">最後消費日期</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-slate-600">
                      {customers.map((c, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-3 font-mono font-bold text-emerald-800">{c.id}</td>
                          <td className="py-3 font-semibold text-slate-800">{c.name}</td>
                          <td className="py-3 font-mono">{c.phone}</td>
                          <td className="py-3 font-bold">{c.totalOrders}</td>
                          <td className="py-3 font-mono font-extrabold text-slate-700">${c.totalSpent.toLocaleString()}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.level === '金卡' ? 'bg-amber-100 text-amber-800' :
                              c.level === '銀卡' ? 'bg-slate-200 text-slate-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                              {c.level}
                            </span>
                          </td>
                          <td className="py-3 font-mono">{c.lastVisit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==========================================
              2. 訂單管理
              ========================================== */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
              <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center border-b border-slate-100 pb-3">
                <div className="flex flex-wrap gap-1.5">
                  {['全部', '清洗中', '整燙中', '包裝中', '待取件', '已取件'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setOrderStatusFilter(status);
                        setSelectedOrderIds([]);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                        orderStatusFilter === status ? 'bg-[#3f8f61] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {status}
                      <span className="text-[10px] opacity-75">
                        ({status === '全部' ? orders.length : orders.filter(o => o.status === status).length})
                      </span>
                    </button>
                  ))}
                </div>

                {selectedOrderIds.length > 0 && (
                  <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 text-xs">
                    <span className="font-bold text-[#3f8f61]">已選 {selectedOrderIds.length} 筆：</span>
                    {['清洗中', '整燙中', '包裝中', '已取件'].map(state => (
                      <button
                        key={state}
                        onClick={() => handleBatchStatusChange(state)}
                        className="bg-white text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded text-xs hover:bg-emerald-600 hover:text-white"
                      >
                        批次-{state}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 pb-2">
                      <th className="pb-2 pl-2 w-8">
                        <input
                          type="checkbox"
                          checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                          onChange={() => {
                            if (selectedOrderIds.length === filteredOrders.length) {
                              setSelectedOrderIds([]);
                            } else {
                              setSelectedOrderIds(filteredOrders.map(o => o.id));
                            }
                          }}
                        />
                      </th>
                      <th className="pb-2">訂單編號</th>
                      <th className="pb-2">會員資訊</th>
                      <th className="pb-2">衣物項目 & 顏色</th>
                      <th className="pb-2">當前狀態 ｜ 包裝袋</th>
                      <th className="pb-2">費用</th>
                      <th className="pb-2 text-center">狀態調整(自由切換)</th>
                      <th className="pb-2 text-center">流程操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50">
                        <td className="py-3 pl-2">
                          <input
                            type="checkbox"
                            checked={selectedOrderIds.includes(order.id)}
                            onChange={() => {
                              if (selectedOrderIds.includes(order.id)) {
                                setSelectedOrderIds(selectedOrderIds.filter(id => id !== order.id));
                              } else {
                                setSelectedOrderIds([...selectedOrderIds, order.id]);
                              }
                            }}
                          />
                        </td>
                        <td className="py-3 font-mono font-bold text-slate-800">{order.id}</td>
                        <td className="py-3">
                          <div className="font-bold">{order.customerName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{order.memberId}</div>
                        </td>
                        <td className="py-3 text-slate-600">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="text-[11px]">
                              {it.type} ({it.color}) × {it.count}
                            </div>
                          ))}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            order.status === '待取件' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {order.status}
                          </span>
                          <div className="text-[10px] mt-1 font-mono text-emerald-700">
                            {order.bagId ? `🏷️袋: ${order.bagId}` : order.memberId === 'GUEST' ? '紙袋' : '未綁定'}
                          </div>
                        </td>
                        <td className="py-3 font-mono font-bold text-slate-700">${order.total}</td>
                        <td className="py-3 text-center">
                          <select
                            value={order.status}
                            onChange={(e) => handleSingleStatusChange(order.id, e.target.value)}
                            className="bg-white border rounded p-1 text-[11px] focus:outline-none"
                          >
                            <option value="清洗中">清洗中</option>
                            <option value="整燙中">整燙中</option>
                            <option value="包裝中">包裝中</option>
                            <option value="待取件">待取件</option>
                            <option value="已取件">已取件</option>
                          </select>
                        </td>
                        <td className="py-3 text-center">
                          {order.status === '包裝中' && order.memberId !== 'GUEST' && (
                            <button
                              type="button"
                              onClick={() => openBagBindingModal(order.id)}
                              className="bg-emerald-600 text-white font-bold px-2.5 py-1 rounded hover:bg-emerald-750 transition active:scale-95 text-[11px]"
                            >
                              包裝綁定衣袋
                            </button>
                          )}
                          {order.status === '待取件' && (
                            <div className="flex justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = orders.map(o => o.id === order.id ? { ...o, lineSent: true } : o);
                                  setOrders(updated);
                                  showToast(`💬 Line取件通知已傳送：用袋【${order.bagId}】還件`);
                                }}
                                className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                                  order.lineSent ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                }`}
                              >
                                {order.lineSent ? '已傳通知' : '傳Line通知'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCustomerPickup(order.id)}
                                className="bg-indigo-600 text-white font-bold px-2 py-1 rounded text-[11px]"
                              >
                                歸還取件
                              </button>
                            </div>
                          )}
                          {order.status === '已取件' && <span className="text-slate-400">已結案</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==========================================
              3. 客戶管理
              ========================================== */}
          {activeTab === 'members' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-slate-800">數位會員名冊與習性記錄</h3>
                <div className="relative w-64">
                  <input 
                    type="text" 
                    placeholder="搜尋會員編號、手機或名字..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-3 pr-8 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 pb-2">
                      <th className="pb-2">會員編號</th>
                      <th className="pb-2">姓名 ｜ 電話</th>
                      <th className="pb-2">儲值金餘額</th>
                      <th className="pb-2">未歸還之衣袋編碼</th>
                      <th className="pb-2">專屬習性 ｜ 備註</th>
                      <th className="pb-2 text-center">借袋個數</th>
                      <th className="pb-2 text-right">配客點 ｜ 累計碳減量</th>
                      <th className="pb-2 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customers
                      .filter(c => c.name.includes(memberSearch) || c.phone.includes(memberSearch) || c.id.includes(memberSearch))
                      .map(c => (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <td className="py-3 font-mono font-bold text-slate-700">{c.id}</td>
                          <td className="py-3">
                            <div className="font-bold text-slate-800">{c.name}</div>
                            <div className="text-[10px] text-slate-500">{c.phone}</div>
                          </td>
                          <td className="py-3 font-mono font-bold text-[#3f8f61]">${c.balance}</td>
                          <td className="py-3">
                            {c.borrowedBags.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {c.borrowedBags.map(bag => (
                                  <span key={bag} className="font-mono text-[10px] bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded font-bold">
                                    🏷️ {bag}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[#3f8f61] font-semibold text-[10px]">✅ 無借袋</span>
                            )}
                          </td>
                          <td className="py-3 max-w-[200px]">
                            {editingHabitId === c.id ? (
                              <div className="flex gap-1.5 items-center">
                                <input 
                                  type="text"
                                  value={tempHabitText}
                                  onChange={(e) => setTempHabitText(e.target.value)}
                                  className="border rounded p-1 text-[11px] w-full focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 font-semibold"
                                />
                                <button 
                                  onClick={() => handleSaveHabit(c.id)}
                                  className="bg-emerald-600 text-white rounded px-2 py-1 text-[10px] font-black"
                                >
                                  存
                                </button>
                                <button 
                                  onClick={() => setEditingHabitId(null)}
                                  className="bg-slate-200 text-slate-700 rounded px-2 py-1 text-[10px]"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-between items-center gap-1 group">
                                <span className="text-slate-600 line-clamp-2">{c.habits || '無備註'}</span>
                                <button 
                                  onClick={() => {
                                    setEditingHabitId(c.id);
                                    setTempHabitText(c.habits || '');
                                  }}
                                  className="text-[#3f8f61] hover:underline font-bold opacity-0 group-hover:opacity-100 transition shrink-0 ml-1 text-[10px]"
                                >
                                  ✍️ 編輯
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="py-3 text-center font-bold">{c.borrowedBags.length}</td>
                          <td className="py-3 text-right">
                            <div className="font-bold">{c.esgPoints} P</div>
                            <div className="text-[10px] text-emerald-600">-{c.co2Saved} kg</div>
                          </td>
                          <td className="py-3 text-center space-x-1 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                setTopUpCustomer(c);
                                setTopUpAmount('');
                                setIsTopUpOpen(true);
                              }}
                              className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded text-[11px] font-bold hover:bg-[#3f8f61] hover:text-white transition"
                            >
                              加值
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==========================================
              4. 衣物管理
              ========================================== */}
          {activeTab === 'checkout' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full">
              
              {/* 左側資訊填寫欄位 */}
              <div className="xl:col-span-7 flex flex-col gap-6">
                
                {/* 步驟一：連結數位會員 */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-slate-700">👤 第一步：會員資料檢索</h3>
                    <button 
                      type="button"
                      onClick={() => setIsAddMemberOpen(true)}
                      className="text-xs text-emerald-600 bg-emerald-50 hover:bg-emerald-100 font-bold px-3 py-1 rounded-lg"
                    >
                      + 快速註冊數位會員
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="請輸入會員編號 / 電話 / 姓名..." 
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-[#3f8f61]"
                      onKeyDown={(e) => e.key === 'Enter' && handleCustomerSearch()}
                    />
                    <button 
                      type="button"
                      onClick={handleCustomerSearch}
                      className="bg-[#3f8f61] hover:bg-[#327750] text-white text-sm font-bold px-5 rounded-xl transition"
                    >
                      帶入
                    </button>
                  </div>

                  {selectedCustomer && (
                    <div className="mt-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex justify-between items-center text-xs">
                      <div className="space-y-1">
                        <div>
                          <span className="font-extrabold text-slate-900 text-sm">{selectedCustomer.name}</span>
                          <span className="text-xs text-slate-500 ml-2 font-mono">({selectedCustomer.id})</span>
                        </div>
                        <div className="text-xs text-emerald-800 font-bold">
                          儲值金餘額：<span className="text-emerald-700 font-extrabold text-sm">${selectedCustomer.balance} 元</span>
                          <span className="text-slate-300 mx-2">|</span>
                          配客點：{selectedCustomer.esgPoints} P
                        </div>
                        <div className="text-[11px] text-emerald-900 font-medium">
                          👤 顧客備註：<span className="font-semibold text-slate-700">{selectedCustomer.habits || '無備註'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setTopUpCustomer(selectedCustomer);
                            setTopUpAmount('');
                            setIsTopUpOpen(true);
                          }}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black px-3 py-2 rounded-xl"
                        >
                          💰 快速儲值
                        </button>
                        <button type="button" onClick={() => setSelectedCustomer(null)} className="text-xs text-slate-400 font-bold">清除</button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-700 mb-3">👕 第二步：登記衣服種類</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {ITEM_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          const existingIndex = orderItems.findIndex(item => item.name === cat.name);
                          if (existingIndex > -1) {
                            const updated = [...orderItems];
                            updated[existingIndex].count += 1;
                            setOrderItems(updated);
                          } else {
                            setOrderItems([...orderItems, { 
                              id: cat.id, 
                              name: cat.name, 
                              price: cat.price, 
                              count: 1, 
                              material: '純棉',
                              treatment: '標準清洗',
                              color: '白色', 
                              remarks: ''
                            }]);
                          }
                        }}
                        className="bg-slate-50 hover:bg-emerald-50 border border-slate-100 rounded-xl p-3 text-left transition text-xs"
                      >
                        <span className="text-xl block mb-1">{cat.icon}</span>
                        <div className="font-bold text-slate-800">{cat.name}</div>
                        <div className="text-slate-400 mt-0.5">${cat.price}</div>
                      </button>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => setIsCustomItemOpen(true)}
                      className="bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-xl p-3 text-left transition text-xs flex flex-col justify-center items-center"
                    >
                      <span className="text-xl text-emerald-600 block mb-1 font-bold">➕</span>
                      <div className="font-bold text-emerald-800">其他衣服</div>
                      <div className="text-slate-400 mt-0.5">自訂輸入</div>
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex-1 flex flex-col min-h-[300px]">
                  <h3 className="text-sm font-bold text-slate-700 mb-3">🧺 第三步：洗衣購物籃細節</h3>
                  {orderItems.length === 0 ? (
                    <div className="flex-1 flex flex-col justify-center items-center text-slate-400">
                      <p className="text-xs">請點選上方的衣服種類登錄</p>
                    </div>
                  ) : (
                    <div className="space-y-3 overflow-y-auto max-h-[350px] pr-2">
                      {orderItems.map((item, index) => (
                        <div key={index} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-800">{item.name}</span>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center border border-slate-200 rounded bg-white">
                                <button type="button" onClick={() => updateCartItem(index, 'count', Math.max(1, item.count - 1))} className="px-1.5 py-0.5 text-slate-400 font-bold hover:bg-slate-100">-</button>
                                <span className="px-2 font-mono font-bold">{item.count}</span>
                                <button type="button" onClick={() => updateCartItem(index, 'count', item.count + 1)} className="px-1.5 py-0.5 text-slate-400 font-bold hover:bg-slate-100">+</button>
                              </div>
                              <span className="font-black font-mono w-12 text-right">${item.price * item.count}</span>
                              <button type="button" onClick={() => removeCartItem(index)} className="text-slate-400 hover:text-red-500 font-bold">✕</button>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-2 pt-1.5 border-t border-slate-200/40 text-[11px]">
                            <div>
                              <label className="block text-slate-400 mb-0.5">顏色</label>
                              <select 
                                value={item.color} 
                                onChange={(e) => updateCartItem(index, 'color', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded p-1 focus:outline-none"
                              >
                                <option value="白色">白色</option>
                                <option value="黑色">黑色</option>
                                <option value="藍色">藍色</option>
                                <option value="紅色">紅色</option>
                                <option value="黃色">黃色</option>
                                <option value="綠色">綠色</option>
                                <option value="灰色">灰色</option>
                                <option value="其他">其他</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-slate-400 mb-0.5">材質</label>
                              <select 
                                value={item.material} 
                                onChange={(e) => updateCartItem(index, 'material', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded p-1 focus:outline-none"
                              >
                                <option value="純棉">純棉</option>
                                <option value="羊毛">羊毛</option>
                                <option value="蠶絲">蠶絲</option>
                                <option value="羽絨">羽絨</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-slate-400 mb-0.5">洗程</label>
                              <select 
                                value={item.treatment} 
                                onChange={(e) => updateCartItem(index, 'treatment', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded p-1 focus:outline-none"
                              >
                                <option value="標準清洗">標準清洗</option>
                                <option value="精緻水洗">精緻水洗</option>
                                <option value="低溫乾洗">低溫乾洗</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-slate-400 mb-0.5">個別備註</label>
                              <input 
                                type="text"
                                placeholder="例：有漬"
                                value={item.remarks}
                                onChange={(e) => updateCartItem(index, 'remarks', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded p-1 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* 右側結帳欄 */}
              <div className="xl:col-span-5 flex flex-col gap-6">
                
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-700 mb-3">🌿 生物溶劑與店鋪備註</h3>
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-700 block">無毒生物分解溶劑</span>
                        <span className="text-slate-400 text-[10px]">保護環境且溫和保護衣料</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={useEcoSolvent}
                        onChange={(e) => setEcoSolvent(e.target.checked)}
                        className="w-10 h-5 bg-slate-200 rounded-full appearance-none cursor-pointer relative checked:bg-emerald-500 before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-5 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">整單補充備註</label>
                      <textarea 
                        rows={2} 
                        placeholder="例：7/1中午前取..."
                        value={orderRemark}
                        onChange={(e) => setOrderRemark(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-900 rounded-2xl p-6 text-white shadow-xl">
                  <div className="mb-4">
                    <label className="block text-xs text-emerald-300 font-bold mb-2">💳 選擇付款方式</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['現金', '儲值金', '信用卡', '行動支付'].map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`py-2 rounded-lg text-xs font-bold transition ${
                            paymentMethod === method 
                              ? 'bg-teal-400 text-emerald-950 font-black' 
                              : 'bg-emerald-800 text-emerald-100'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm border-t border-emerald-800 pt-4 pb-4 mb-4">
                    <div className="flex justify-between">
                      <span className="text-emerald-300">洗滌費小計</span>
                      <span className="font-mono font-bold">${calculateSubtotal()}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-baseline mb-6">
                    <span className="text-emerald-300 text-xs font-semibold">應收總金額</span>
                    <span className="text-4xl font-black font-mono text-teal-200">${calculateSubtotal()}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-300 hover:to-emerald-400 text-emerald-950 font-extrabold text-sm py-4 rounded-xl transition shadow-md"
                  >
                    ⚡ 建立清洗單
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* ==========================================
              5. 庫存管理
              ========================================== */}
          {activeTab === 'inventory' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-700">智慧物資與耗材庫存</h3>
                <span className="text-xs text-slate-400">店鋪物資臨界預警</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inventoryList.map((inv, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center transition hover:shadow-sm">
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{inv.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        安全庫存水位下限: {inv.minStock} {inv.unit}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-extrabold ${inv.stock <= inv.minStock ? 'text-red-500' : 'text-emerald-700'}`}>
                        {inv.stock} <span className="text-xs font-normal text-slate-500">{inv.unit}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...inventoryList];
                          updated[idx].stock += 50;
                          setInventoryList(updated);
                          showToast(`已成功為 ${inv.name} 補貨 50 單位`);
                        }}
                        className="text-[10px] mt-1.5 px-2 py-0.5 bg-white border border-slate-200 hover:border-[#3f8f61] rounded text-slate-600 transition font-bold"
                      >
                        補貨登記
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==========================================
              6. 報表分析
              ========================================== */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">📈 智慧環保衣袋 累計循環次數走勢 (折線圖)</h3>
                    <p className="text-xs text-slate-400">永續綠色包材轉換率與循環次數趨勢走勢圖</p>
                  </div>
                  <div className="bg-slate-100 rounded-lg p-1 flex gap-1">
                    {['年', '季', '月'].map(view => (
                      <button
                        key={view}
                        type="button"
                        onClick={() => setChartView(view)}
                        className={`px-3 py-1 text-xs font-bold rounded ${
                          chartView === view ? 'bg-[#3f8f61] text-white' : 'text-slate-600'
                        }`}
                      >
                        {view}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="relative w-full max-w-2xl">
                    <svg className="w-full h-64 overflow-visible" viewBox="0 0 500 200">
                      <line x1="40" y1="30" x2="470" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="90" x2="470" y2="90" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="150" x2="470" y2="150" stroke="#f1f5f9" strokeWidth="1" />
                      
                      <line x1="40" y1="15" x2="40" y2="175" stroke="#cbd5e1" strokeWidth="1" />
                      <line x1="40" y1="175" x2="470" y2="175" stroke="#cbd5e1" strokeWidth="1" />

                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path 
                        d={`M ${chartPoints[0].x} 175 L ${polylinePointsString} L ${chartPoints[chartPoints.length - 1].x} 175 Z`} 
                        fill="url(#areaGrad)" 
                      />

                      <polyline
                        fill="none"
                        stroke="#3f8f61"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={polylinePointsString}
                      />

                      {chartPoints.map((p, idx) => (
                        <g key={idx}>
                          <circle cx={p.x} cy={p.y} r="6" fill="#ffffff" stroke="#3f8f61" strokeWidth="2.5" />
                          <circle cx={p.x} cy={p.y} r="2.5" fill="#3f8f61" />
                          
                          <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#0f172a">
                            {p.val}次
                          </text>
                          <text x={p.x} y="192" textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="semibold">
                            {p.label}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>
              </div>

              {/* 智慧客群再行銷 */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
                  <h3 className="text-sm font-bold text-slate-800">🎯 AI 會員智慧客群再行銷</h3>
                  <div className="flex gap-2">
                    {['eco_fans', 'inactive', 'big_spenders'].map(seg => (
                      <button
                        key={seg}
                        type="button"
                        onClick={() => setMarketingSegment(seg)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          marketingSegment === seg ? 'bg-[#3f8f61] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {seg === 'eco_fans' ? '🌲 環保急先鋒' : seg === 'inactive' ? '⏰ 久未到店客' : '💎 高價值愛好者'}
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={4}
                    value={customSmsContent}
                    onChange={(e) => setCustomSmsContent(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs leading-relaxed focus:outline-none"
                  ></textarea>
                  <button
                    type="button"
                    onClick={handleSendCampaign}
                    className="w-full bg-[#3f8f61] hover:bg-[#327750] text-white font-bold py-2.5 rounded-xl text-xs"
                  >
                    發送 Line 精準推播
                  </button>
                </div>

                <div className="xl:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-3">
                  <h3 className="text-sm font-bold text-slate-800">📜 歷史推播紀錄</h3>
                  <div className="space-y-3">
                    {campaignHistory.map(cam => (
                      <div key={cam.id} className="p-3 bg-slate-50 rounded-xl border text-[11px] leading-relaxed">
                        <div className="flex justify-between font-bold">
                          <span>{cam.name}</span>
                          <span className="text-[#3f8f61]">{cam.status}</span>
                        </div>
                        <p className="text-slate-500 mt-1 line-clamp-2">「{cam.content}」</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ==========================================
              7. 系統設定
              ========================================== */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
              <h3 className="text-sm font-bold text-slate-700 pb-2 border-b border-slate-100">店鋪與系統常規設定</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-500">店鋪名稱</label>
                  <input 
                    type="text" 
                    value={settings.storeName}
                    onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-500">聯絡電話</label>
                  <input 
                    type="text" 
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500">店鋪地址</label>
                  <input 
                    type="text" 
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500">LINE 自動通知範本</label>
                  <textarea 
                    rows={3}
                    value={settings.lineNotificationTemplate}
                    onChange={(e) => setSettings({ ...settings, lineNotificationTemplate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none leading-relaxed"
                  />
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 md:col-span-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-700 block">建立訂單後自動列印衣物洗滌熱感洗標標籤</span>
                    <span className="text-slate-400 text-[10px]">免去手動列印流程</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={settings.isAutoPrintLabel}
                    onChange={(e) => setSettings({ ...settings, isAutoPrintLabel: e.target.checked })}
                    className="w-10 h-5 bg-slate-200 rounded-full appearance-none cursor-pointer relative checked:bg-emerald-500 before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:translate-x-5 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => showToast('⚙️ 系統設定已成功儲存至 POS 本地端')}
                  className="bg-[#3f8f61] hover:bg-[#327750] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-md"
                >
                  儲存設定
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ==========================================
          MODALS & OVERLAYS
          ========================================== */}

      {/* 1. 快速歸還衣袋銷帳之 Modal 彈窗 */}
      {isQuickReturnOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-100 relative">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <span>♻️ 現場衣袋歸還 ｜ 條碼快速掃描</span>
              </h3>
              <button type="button" onClick={() => setIsQuickReturnOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleQuickReturnSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">請掃描或輸入歸還衣袋編號 *</label>
                <input 
                  type="text" 
                  required
                  placeholder="請掃描衣袋上的條碼，如: BAG-8821"
                  value={quickReturnBagId}
                  onChange={(e) => setQuickReturnBagId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              <div className="text-[11px] text-slate-500 leading-relaxed">
                ※ 歸還成功後，系統會自動在顧客借用名冊中銷帳，相關的洗衣訂單會標記為「已取件」，並為會員帳戶增發 **+50 配客點**！
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsQuickReturnOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold py-2.5 rounded-xl transition"
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2.5 rounded-xl transition shadow-md"
                >
                  確認快速歸還
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. 包裝時掃描綁定衣袋的 Modal 彈窗 */}
      {isBagBindingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-100 relative">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800">📦 洗畢包裝 ｜ 智慧環保衣袋綁定</h3>
              <button type="button" onClick={() => setIsBagBindingModalOpen(false)} className="text-slate-400 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleBindBagSubmit} className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 text-slate-600 border border-slate-100 font-medium">
                <div>進行包裝單號：<span className="font-mono text-emerald-800 font-bold">{bindingOrderId}</span></div>
                <div>顧客名字：<span>{orders.find(o => o.id === bindingOrderId)?.customerName}</span></div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">掃描包裝袋條碼 *</label>
                <input 
                  type="text" 
                  required
                  placeholder="請輸入或掃描，如: BAG-1024"
                  value={tempBagId}
                  onChange={(e) => setTempBagId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsBagBindingModalOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-600 text-sm font-bold py-2 rounded-xl"
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-emerald-600 text-white text-sm font-bold py-2 rounded-xl"
                >
                  確認綁定包裝
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. 快速註冊新會員的 Modal 彈窗 */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-100 relative">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800">👤 快速註冊數位會員</h3>
              <button type="button" onClick={() => setIsAddMemberOpen(false)} className="text-slate-400 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">顧客姓名 *</label>
                <input 
                  type="text" 
                  required
                  placeholder="例如: 蔡依林"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">手機號碼 *</label>
                <input 
                  type="tel" 
                  required
                  placeholder="例如: 0912-345-678"
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsAddMemberOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-600 text-sm font-bold py-2.5 rounded-xl"
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-emerald-600 text-white text-sm font-bold py-2.5 rounded-xl"
                >
                  建立並帶入
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. 自訂衣物項目 Modal 彈窗 */}
      {isCustomItemOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-slate-100 relative">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800">➕ 新增自訂衣服項目</h3>
              <button type="button" onClick={() => setIsCustomItemOpen(false)} className="text-slate-400 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleAddCustomItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">洗滌品項名稱 *</label>
                <input 
                  type="text" 
                  required
                  placeholder="例：蕾絲長裙、泰迪熊玩偶"
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">洗滌價格 *</label>
                <input 
                  type="number" 
                  required
                  placeholder="例：350"
                  value={customItemPrice}
                  onChange={(e) => setCustomItemPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsCustomItemOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-600 text-sm font-bold py-2 rounded-xl"
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-emerald-600 text-white text-sm font-bold py-2 rounded-xl"
                >
                  新增至洗籃
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. 會員儲值加值金額 Modal 彈窗 */}
      {isTopUpOpen && topUpCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-slate-100 relative">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800">💳 會員儲值加值中心</h3>
              <button type="button" onClick={() => setIsTopUpOpen(false)} className="text-slate-400 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleTopUpSubmit} className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
                <div>會員編號：<span className="font-mono font-bold">{topUpCustomer.id}</span></div>
                <div>姓名：<strong>{topUpCustomer.name}</strong></div>
                <div>目前餘額：<strong className="text-emerald-700">${topUpCustomer.balance} 元</strong></div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">請輸入加值金額 ($) *</label>
                <input 
                  type="number" 
                  required
                  placeholder="例：1000、3000"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsTopUpOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-600 text-sm font-bold py-2 rounded-xl"
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-[#3f8f61] text-white text-sm font-bold py-2 rounded-xl"
                >
                  確認加值
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 吐司訊息提示樣式 */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-emerald-600 text-white rounded-xl py-3 px-5 shadow-2xl z-50 flex items-center gap-2 font-semibold text-xs">
          <span>✨</span>
          {toastMessage}
        </div>
      )}

    </div>
  );
}