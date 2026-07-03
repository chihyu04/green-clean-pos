import React, { useEffect, useMemo, useState } from 'react';

type TabId = 'dashboard' | 'orders' | 'members' | 'checkout' | 'inventory' | 'reports' | 'settings';
type OrderStatus = '清洗中' | '整燙中' | '包裝中' | '待取件' | '已取件';
type BagUsageStatus = '待取件' | '借出中' | '已歸還' | '使用中';

type Customer = {
  id: string;
  name: string;
  phone: string;
  level: string;
  esgPoints: number;
  co2Saved: number;
  borrowedBags: string[];
  lastVisit: string;
  totalOrders: number;
  balance: number;
  totalSpent: number;
  habits: string;
};

type ItemCategory = {
  id: string;
  name: string;
  icon: string;
  price: number;
  esgPoints: number;
};

type OrderItem = {
  id?: string;
  type?: string;
  name: string;
  count: number;
  price: number;
  color: string;
  garmentId: string;
  material?: string;
  treatment?: string;
  remarks?: string;
  esgPoints?: number;
};

type Order = {
  id: string;
  memberId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  bagId: string;
  date: string;
  lineSent: boolean;
  paymentMethod: string;
  remark?: string;
};

type InventoryItem = {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  unit: string;
};

type Campaign = {
  id: string;
  name: string;
  segment: string;
  date: string;
  count: number;
  content: string;
  status: string;
};

type BagUsageStat = {
  bagId: string;
  useCount: number;
  firstUsedDate: string;
  lastUsedDate: string;
  lastReturnedDate?: string;
  status: BagUsageStatus;
  currentCustomer: string;
  relatedOrderId: string;
};

type Settings = {
  storeName: string;
  phone: string;
  address: string;
  lineNotificationTemplate: string;
  isAutoPrintLabel: boolean;
};

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'MEM-0001',
    name: '陳美玲',
    phone: '0912-345-678',
    level: '金卡',
    esgPoints: 1250,
    co2Saved: 35.8,
    borrowedBags: ['BAG-8821'],
    lastVisit: '2026-06-15',
    totalOrders: 28,
    balance: 1500,
    totalSpent: 12450,
    habits: '每週二固定來店送洗上班襯衫、西裝',
  },
  {
    id: 'MEM-0002',
    name: '林志明',
    phone: '0928-111-222',
    level: '銀卡',
    esgPoints: 420,
    co2Saved: 12.4,
    borrowedBags: [],
    lastVisit: '2026-06-20',
    totalOrders: 12,
    balance: 350,
    totalSpent: 6780,
    habits: '換季時固定會送洗被子、羽絨衣',
  },
  {
    id: 'MEM-0003',
    name: '張雅婷',
    phone: '0935-777-888',
    level: '金卡',
    esgPoints: 3100,
    co2Saved: 92.5,
    borrowedBags: ['BAG-1024', 'BAG-2045'],
    lastVisit: '2026-05-10',
    totalOrders: 54,
    balance: 4200,
    totalSpent: 18900,
    habits: '注重高溫除蟎，偏好使用生物溶劑，不加人工香精',
  },
  {
    id: 'MEM-0004',
    name: '王大同',
    phone: '0988-555-444',
    level: '銅卡',
    esgPoints: 80,
    co2Saved: 2.1,
    borrowedBags: [],
    lastVisit: '2026-06-25',
    totalOrders: 2,
    balance: 0,
    totalSpent: 3250,
    habits: '通常週六上午送洗，要求西裝領口加壓領線',
  },
  {
    id: 'MEM-0005',
    name: '李若薇',
    phone: '0919-666-333',
    level: '銀卡',
    esgPoints: 350,
    co2Saved: 9.8,
    borrowedBags: [],
    lastVisit: '2026-04-01',
    totalOrders: 8,
    balance: 800,
    totalSpent: 4500,
    habits: '高單價洋裝送洗愛好者，每次均自備衣袋',
  },
];

const ITEM_CATEGORIES: ItemCategory[] = [
  { id: 'cat1', name: '襯衫/T恤', icon: '👕', price: 100, esgPoints: 10 },
  { id: 'cat2', name: '西裝外套', icon: '🧥', price: 250, esgPoints: 20 },
  { id: 'cat3', name: '羽絨大衣', icon: '❄️', price: 450, esgPoints: 35 },
  { id: 'cat4', name: '長褲/裙子', icon: '👖', price: 120, esgPoints: 12 },
  { id: 'cat5', name: '高級禮服', icon: '👗', price: 600, esgPoints: 50 },
  { id: 'cat6', name: '床被/寢具', icon: '🛏️', price: 500, esgPoints: 40 },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-2026-0001',
    memberId: 'MEM-0001',
    customerName: '陳美玲',
    customerPhone: '0912-345-678',
    items: [
      { id: 'item-1', name: '西裝外套', type: '西裝外套', count: 1, price: 250, color: '黑色', garmentId: 'C-1001' },
      { id: 'item-2', name: '襯衫/T恤', type: '襯衫/T恤', count: 1, price: 100, color: '白色', garmentId: 'C-1002' },
      { id: 'item-3', name: '襯衫/T恤', type: '襯衫/T恤', count: 1, price: 100, color: '白色', garmentId: 'C-1003' },
    ],
    total: 450,
    status: '包裝中',
    bagId: '',
    date: '2026-06-27',
    lineSent: false,
    paymentMethod: '儲值金',
  },
  {
    id: 'ORD-2026-0002',
    memberId: 'MEM-0003',
    customerName: '張雅婷',
    customerPhone: '0935-777-888',
    items: [{ id: 'item-4', name: '高級禮服', type: '高級禮服', count: 1, price: 600, color: '紅色', garmentId: 'C-1004' }],
    total: 600,
    status: '待取件',
    bagId: 'BAG-1024',
    date: '2026-06-27',
    lineSent: true,
    paymentMethod: '儲值金',
  },
  {
    id: 'ORD-2026-0003',
    memberId: 'MEM-0002',
    customerName: '林志明',
    customerPhone: '0928-111-222',
    items: [
      { id: 'item-5', name: '長褲/裙子', type: '長褲/裙子', count: 1, price: 120, color: '藍色', garmentId: 'C-1005' },
      { id: 'item-6', name: '長褲/裙子', type: '長褲/裙子', count: 1, price: 120, color: '藍色', garmentId: 'C-1006' },
    ],
    total: 240,
    status: '清洗中',
    bagId: '',
    date: '2026-06-26',
    lineSent: false,
    paymentMethod: '現金',
  },
  {
    id: 'ORD-2026-0004',
    memberId: 'MEM-0004',
    customerName: '王大同',
    customerPhone: '0988-555-444',
    items: [{ id: 'item-7', name: '羽絨大衣', type: '羽絨大衣', count: 1, price: 450, color: '灰色', garmentId: 'C-1007' }],
    total: 450,
    status: '已取件',
    bagId: 'BAG-9901',
    date: '2026-06-25',
    lineSent: true,
    paymentMethod: '信用卡',
  },
];

const INITIAL_BAG_USAGE_STATS: BagUsageStat[] = [
  {
    bagId: 'BAG-1024',
    useCount: 8,
    firstUsedDate: '2026-03-03',
    lastUsedDate: '2026-06-27',
    status: '待取件',
    currentCustomer: '張雅婷',
    relatedOrderId: 'ORD-2026-0002',
  },
  {
    bagId: 'BAG-2045',
    useCount: 4,
    firstUsedDate: '2026-04-10',
    lastUsedDate: '2026-06-18',
    status: '借出中',
    currentCustomer: '張雅婷',
    relatedOrderId: 'ORD-2026-0011',
  },
  {
    bagId: 'BAG-8821',
    useCount: 5,
    firstUsedDate: '2026-04-02',
    lastUsedDate: '2026-06-15',
    status: '借出中',
    currentCustomer: '陳美玲',
    relatedOrderId: 'ORD-2026-0008',
  },
  {
    bagId: 'BAG-9901',
    useCount: 14,
    firstUsedDate: '2026-01-08',
    lastUsedDate: '2026-06-25',
    lastReturnedDate: '2026-06-25',
    status: '已歸還',
    currentCustomer: '-',
    relatedOrderId: 'ORD-2026-0004',
  },
  {
    bagId: 'BAG-3308',
    useCount: 11,
    firstUsedDate: '2026-02-01',
    lastUsedDate: '2026-06-12',
    lastReturnedDate: '2026-06-13',
    status: '已歸還',
    currentCustomer: '-',
    relatedOrderId: 'ORD-2026-0020',
  },
  {
    bagId: 'BAG-7712',
    useCount: 7,
    firstUsedDate: '2026-03-15',
    lastUsedDate: '2026-06-08',
    lastReturnedDate: '2026-06-09',
    status: '已歸還',
    currentCustomer: '-',
    relatedOrderId: 'ORD-2026-0017',
  },
];

const ORDER_STATUS_OPTIONS: OrderStatus[] = ['清洗中', '整燙中', '包裝中', '待取件', '已取件'];
const BAG_ID_PATTERN = /^BAG-\d{4}$/;
const GARMENT_ID_PATTERN = /^C-\d{4}$/;

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('checkout');
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [bagUsageStats, setBagUsageStats] = useState<BagUsageStat[]>(INITIAL_BAG_USAGE_STATS);
  const [bagCirculationCount, setBagCirculationCount] = useState(584);
  const [chartView, setChartView] = useState<'年' | '季' | '月'>('月');
  const [dashboardChartView, setDashboardChartView] = useState<'年' | '季' | '月'>('月');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchPhone, setSearchPhone] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [useEcoSolvent, setEcoSolvent] = useState(true);
  const [orderRemark, setOrderRemark] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('現金');
  const [checkoutReturnBagId, setCheckoutReturnBagId] = useState('');
  const [checkoutReturnBagCondition, setCheckoutReturnBagCondition] = useState('良好');

  const [isCustomItemOpen, setIsCustomItemOpen] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [isQuickReturnOpen, setIsQuickReturnOpen] = useState(false);
  const [quickReturnBagId, setQuickReturnBagId] = useState('');
  const [quickReturnBagCondition, setQuickReturnBagCondition] = useState('良好');
  const [isBagBindingModalOpen, setIsBagBindingModalOpen] = useState(false);
  const [bindingOrderId, setBindingOrderId] = useState('');
  const [tempBagId, setTempBagId] = useState('');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpCustomer, setTopUpCustomer] = useState<Customer | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [tempHabitText, setTempHabitText] = useState('');

  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([
    { id: 'INV-01', name: '智慧循環衣袋', stock: 120, minStock: 20, unit: '個' },
    { id: 'INV-02', name: '環保回收衣架', stock: 350, minStock: 50, unit: '支' },
    { id: 'INV-03', name: '整袋送洗之洗衣籃', stock: 15, minStock: 3, unit: '個' },
    { id: 'INV-04', name: '環保無毒生物溶劑', stock: 45, minStock: 10, unit: '公升' },
  ]);

  const [settings, setSettings] = useState<Settings>({
    storeName: '綠潔智慧乾洗 - 台北忠孝旗艦店',
    phone: '02-2771-0000',
    address: '台北市大安區忠孝東路四段 100 號',
    lineNotificationTemplate:
      '〖綠潔智慧乾洗〗親愛的 {會員姓名} 您好，您送洗的衣物已經清洗完成囉！本次我們使用智慧循環衣袋「{衣袋編號}」為您包裝，衣物專屬編號為：{衣服編號清單}。歡迎您隨時前來店內取件並順便歸還空袋。一同守護地球綠色環境！',
    isAutoPrintLabel: true,
  });

  const [marketingSegment, setMarketingSegment] = useState<'eco_fans' | 'inactive' | 'big_spenders'>('eco_fans');
  const [customSmsContent, setCustomSmsContent] = useState('');
  const [campaignHistory, setCampaignHistory] = useState<Campaign[]>([
    {
      id: 'CAM-01',
      name: '環保減碳回饋祭',
      segment: '環保急先鋒',
      date: '2026-06-10',
      count: 3,
      content: '親愛的綠色會員您好！帶回您手上的「智慧循環衣袋」至店內回收或取件歸還，可直接獲得 50 點配客點，共同守護地球。',
      status: '已發送',
    },
    {
      id: 'CAM-02',
      name: '梅雨季烘乾貼心提醒',
      segment: '全體會員',
      date: '2026-06-18',
      count: 5,
      content: '最近連日大雨，家裡衣服曬不乾嗎？綠潔為您提供 100% 環保烘乾與抗過敏除蟎清洗服務！',
      status: '已發送',
    },
  ]);

  const [orderStatusFilter, setOrderStatusFilter] = useState<'全部' | OrderStatus>('全部');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(null), 3500);
  };

  const getTodayDateText = () => new Date().toISOString().slice(0, 10);
  const normalizeBagId = (bagId: string) => bagId.trim().toUpperCase();

  const getDaysBetween = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    if (Number.isNaN(start) || Number.isNaN(end)) return 0;
    return Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  };

  const getBagStatusStyle = (status: BagUsageStatus) => {
    if (status === '已歸還') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === '待取件') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (status === '借出中') return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  const registerBagUse = (bagId: string, order: Order) => {
    const targetBag = normalizeBagId(bagId);
    const today = getTodayDateText();

    setBagUsageStats(prev => {
      const exists = prev.some(bag => bag.bagId === targetBag);

      if (!exists) {
        return [
          {
            bagId: targetBag,
            useCount: 1,
            firstUsedDate: today,
            lastUsedDate: today,
            status: '待取件',
            currentCustomer: order.customerName,
            relatedOrderId: order.id,
          },
          ...prev,
        ];
      }

      return prev.map(bag => {
        if (bag.bagId !== targetBag) return bag;
        return {
          ...bag,
          useCount: bag.useCount + 1,
          lastUsedDate: today,
          status: '待取件',
          currentCustomer: order.customerName,
          relatedOrderId: order.id,
          lastReturnedDate: undefined,
        };
      });
    });
  };

  const markBagReturned = (bagId: string) => {
    const targetBag = normalizeBagId(bagId);
    const today = getTodayDateText();

    setBagUsageStats(prev =>
      prev.map(bag => {
        if (bag.bagId !== targetBag) return bag;
        return {
          ...bag,
          status: '已歸還',
          lastReturnedDate: today,
          currentCustomer: '-',
        };
      }),
    );
  };

  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === '全部') return orders;
    return orders.filter(order => order.status === orderStatusFilter);
  }, [orderStatusFilter, orders]);

  const filteredCustomers = useMemo(() => {
    const keyword = memberSearch.trim();
    if (!keyword) return customers;
    return customers.filter(customer =>
      [customer.id, customer.name, customer.phone, customer.level].some(value => value.includes(keyword)),
    );
  }, [customers, memberSearch]);

  const calculateSubtotal = () => orderItems.reduce((acc, curr) => acc + curr.price * curr.count, 0);

  const groupedOrderItems = useMemo(() => {
    return Object.values(
      orderItems.reduce<Record<string, { name: string; price: number; items: Array<OrderItem & { originalIndex: number }> }>>((acc, curr, index) => {
        if (!acc[curr.name]) acc[curr.name] = { name: curr.name, price: curr.price, items: [] };
        acc[curr.name].items.push({ ...curr, originalIndex: index });
        return acc;
      }, {}),
    );
  }, [orderItems]);

  const borrowedBagTotal = customers.reduce((sum, customer) => sum + customer.borrowedBags.length, 0);
  const availableBagStock = inventoryList.find(item => item.name === '智慧循環衣袋')?.stock ?? 0;
  const totalBagUseCount = bagUsageStats.reduce((sum, bag) => sum + bag.useCount, 0);
  const averageUsePerBag = bagUsageStats.length > 0 ? (totalBagUseCount / bagUsageStats.length).toFixed(1) : '0';

  const averageDaysPerUse = useMemo(() => {
    const validIntervals = bagUsageStats
      .filter(bag => bag.useCount > 1)
      .map(bag => getDaysBetween(bag.firstUsedDate, bag.lastUsedDate) / (bag.useCount - 1))
      .filter(day => Number.isFinite(day) && day > 0);

    if (validIntervals.length === 0) return '0';
    const totalDays = validIntervals.reduce((sum, day) => sum + day, 0);
    return (totalDays / validIntervals.length).toFixed(1);
  }, [bagUsageStats]);

  const sortedBagUsageStats = useMemo(() => {
    return [...bagUsageStats].sort((a, b) => b.useCount - a.useCount);
  }, [bagUsageStats]);

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(order => order.status !== '已取件').length;
  const totalMembers = customers.length;
  const todayOrders = orders.filter(order => order.date === getTodayDateText()).length;

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
    }

    if (chartView === '季') {
      return [
        { label: '第一季', val: 300, x: 80, y: 140 },
        { label: '第二季', val: bagCirculationCount, x: 200, y: 95 },
        { label: '第三季', val: 1074, x: 320, y: 50 },
        { label: '第四季', val: 1250, x: 440, y: 25 },
      ];
    }

    return [
      { label: '2024年', val: 1850, x: 100, y: 150 },
      { label: '2025年', val: 3200, x: 250, y: 90 },
      { label: '2026年', val: 5800, x: 400, y: 30 },
    ];
  };

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
    }

    if (dashboardChartView === '季') {
      return [
        { label: '第一季', val: '$112K', x: 80, y: 120 },
        { label: '第二季', val: '$165K', x: 200, y: 85 },
        { label: '第三季', val: '$208K', x: 320, y: 55 },
        { label: '第四季', val: '$254K', x: 440, y: 35 },
      ];
    }

    return [
      { label: '2024年', val: '$380K', x: 100, y: 120 },
      { label: '2025年', val: '$490K', x: 250, y: 75 },
      { label: '2026年', val: '$620K', x: 400, y: 35 },
    ];
  };

  const chartPoints = getChartData();
  const polylinePointsString = chartPoints.map(point => `${point.x},${point.y}`).join(' ');
  const dbPoints = getDashboardChartData();
  const dbPolylinePoints = dbPoints.map(point => `${point.x},${point.y}`).join(' ');

  useEffect(() => {
    if (marketingSegment === 'eco_fans') {
      setCustomSmsContent(
        '〖綠潔乾洗〗親愛的綠色環保先鋒 {會員姓名} 您好！您目前已為地球減少了 {減碳量}kg 碳排放。本週末來店洗衣服並歸還您手邊借用之綠色衣袋，即享綠色極致清洗 85 折與點數回饋！',
      );
    } else if (marketingSegment === 'inactive') {
      setCustomSmsContent(
        '〖綠潔乾洗〗您好，我們好久沒見面了！為了感謝您的支持，我們為您準備了專屬回娘家優惠券：輸入/出示代碼〖MISSYOU〗即可折抵乾洗費 100 元，期待為您服務！',
      );
    } else {
      setCustomSmsContent(
        '〖綠潔乾洗〗尊榮會員 {會員姓名} 您好！感謝您對高品質衣物護理的信任。本月我們推出「儲值金限時加碼回饋」，儲值滿 3000 送 500！詳情請洽門市。',
      );
    }
  }, [marketingSegment]);

  const handleCustomerSearch = () => {
    const keyword = searchPhone.trim();
    if (!keyword) {
      showToast('請輸入會員電話、姓名或會員編號');
      return;
    }

    const found = customers.find(customer => customer.phone.includes(keyword) || customer.name.includes(keyword) || customer.id.includes(keyword));
    if (found) {
      setSelectedCustomer(found);
      showToast(`已連結會員：${found.name} (${found.id})`);
    } else {
      showToast('找不到該會員，請確認電話或新增會員');
    }
  };

  const handleAddCategoryItem = (category: ItemCategory) => {
    setOrderItems(prev => [
      ...prev,
      {
        id: `${category.id}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: category.name,
        type: category.name,
        price: category.price,
        count: 1,
        material: '純棉',
        treatment: '標準清洗',
        color: '白色',
        remarks: '',
        garmentId: '',
        esgPoints: category.esgPoints,
      },
    ]);
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName.trim() || !customItemPrice.trim()) {
      showToast('請填寫完整衣服項目與價格！');
      return;
    }

    const priceNum = Number(customItemPrice);
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      showToast('價格必須為正確數字');
      return;
    }

    setOrderItems(prev => [
      ...prev,
      {
        id: `custom_${Date.now()}`,
        name: customItemName.trim(),
        type: customItemName.trim(),
        price: priceNum,
        count: 1,
        material: '其他',
        treatment: '標準清洗',
        color: '白色',
        remarks: '',
        garmentId: '',
        esgPoints: 15,
      },
    ]);

    showToast(`已新增自訂衣服項目「${customItemName.trim()}」`);
    setCustomItemName('');
    setCustomItemPrice('');
    setIsCustomItemOpen(false);
  };

  const updateCartItem = (index: number, field: keyof OrderItem, value: string | number) => {
    setOrderItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeCartItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleCheckout = () => {
    if (orderItems.length === 0) {
      showToast('❌ 請先加入衣物至購物車！');
      return;
    }

    const missingGarmentId = orderItems.some(item => !item.garmentId.trim());
    if (missingGarmentId) {
      showToast('❌ 結帳失敗！請確認每一件衣物都已輸入 C-xxxx 專屬編號。');
      return;
    }

    const invalidGarmentId = orderItems.some(item => !GARMENT_ID_PATTERN.test(item.garmentId.trim().toUpperCase()));
    if (invalidGarmentId) {
      showToast('❌ 衣物編號格式錯誤，請使用 C-0001 這種四位數格式。');
      return;
    }

    const subtotal = calculateSubtotal();
    if (selectedCustomer && paymentMethod === '儲值金' && selectedCustomer.balance < subtotal) {
      showToast(`❌ 儲值金餘額不足，目前餘額 $${selectedCustomer.balance}，本次需收 $${subtotal}`);
      return;
    }

    const orderId = `ORD-2026-${String(orders.length + 1).padStart(4, '0')}`;
    const newOrder: Order = {
      id: orderId,
      memberId: selectedCustomer ? selectedCustomer.id : 'GUEST',
      customerName: selectedCustomer ? selectedCustomer.name : '散客/非會員',
      customerPhone: selectedCustomer ? selectedCustomer.phone : '-',
      items: orderItems.map(item => ({
        ...item,
        type: item.name,
        garmentId: item.garmentId.trim().toUpperCase(),
      })),
      total: subtotal,
      status: '清洗中',
      bagId: '',
      date: getTodayDateText(),
      lineSent: false,
      paymentMethod,
      remark: orderRemark,
    };

    if (selectedCustomer) {
      const updatedCustomers = customers.map(customer => {
        if (customer.id !== selectedCustomer.id) return customer;
        const deductAmount = paymentMethod === '儲值金' ? subtotal : 0;
        return {
          ...customer,
          balance: customer.balance - deductAmount,
          esgPoints: customer.esgPoints + orderItems.length * 10,
          lastVisit: '今日',
          totalOrders: customer.totalOrders + 1,
          totalSpent: customer.totalSpent + subtotal,
        };
      });
      setCustomers(updatedCustomers);
    }

    setOrders(prev => [newOrder, ...prev]);
    setOrderItems([]);
    setOrderRemark('');
    setSelectedCustomer(null);
    setSearchPhone('');
    setCheckoutReturnBagId('');
    showToast(`✅ 訂單 ${orderId} 建立完成！`);
  };

  const openBagBindingModal = (orderId: string) => {
    setBindingOrderId(orderId);
    setTempBagId('');
    setIsBagBindingModalOpen(true);
  };

  const handleBindBagSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const bagIdUpper = normalizeBagId(tempBagId);
    if (!bagIdUpper) return;

    if (!BAG_ID_PATTERN.test(bagIdUpper)) {
      showToast('⚠️ 衣袋編號格式請使用 BAG-0001 這種四位數格式。');
      return;
    }

    const order = orders.find(item => item.id === bindingOrderId);
    if (!order) return;

    setOrders(prev => prev.map(item => (item.id === bindingOrderId ? { ...item, bagId: bagIdUpper, status: '待取件' } : item)));

    if (order.memberId && order.memberId !== 'GUEST') {
      setCustomers(prev =>
        prev.map(customer => {
          if (customer.id !== order.memberId) return customer;
          const updatedBags = customer.borrowedBags.includes(bagIdUpper) ? customer.borrowedBags : [...customer.borrowedBags, bagIdUpper];
          return { ...customer, borrowedBags: updatedBags };
        }),
      );
    }

    registerBagUse(bagIdUpper, order);
    setBagCirculationCount(prev => prev + 1);
    setIsBagBindingModalOpen(false);
    setTempBagId('');
    showToast(`✅ 訂單 ${order.id} 已完成包裝並綁定衣袋 ${bagIdUpper}！`);
  };

  const handleSingleStatusChange = (orderId: string, targetStatus: OrderStatus) => {
    const order = orders.find(item => item.id === orderId);
    if (!order) return;

    if (targetStatus === '待取件' && !order.bagId && order.memberId !== 'GUEST') {
      openBagBindingModal(orderId);
      return;
    }

    setOrders(prev => prev.map(item => (item.id === orderId ? { ...item, status: targetStatus } : item)));
    showToast(`訂單 ${orderId} 已變更為「${targetStatus}」`);
  };

  const handleBatchStatusChange = (targetStatus: OrderStatus) => {
    if (selectedOrderIds.length === 0) return;

    const unbondedMemberOrders = orders.filter(order => selectedOrderIds.includes(order.id) && order.memberId !== 'GUEST' && !order.bagId);
    if (targetStatus === '待取件' && unbondedMemberOrders.length > 0) {
      showToast('⚠️ 批次失敗！部分會員訂單尚未掃描包裝綁定衣袋。');
      return;
    }

    setOrders(prev => prev.map(order => (selectedOrderIds.includes(order.id) ? { ...order, status: targetStatus } : order)));
    setSelectedOrderIds([]);
    showToast(`成功批次變更狀態為「${targetStatus}」`);
  };

  const returnBagById = (bagId: string, condition: string) => {
    const targetBag = normalizeBagId(bagId);
    if (!targetBag) return false;

    const foundMember: Customer | undefined = customers.find(customer =>
      customer.borrowedBags.includes(targetBag),
    );

    if (!foundMember) {
      showToast(`⚠️ 找不到此衣袋借用記錄，或衣袋 ${targetBag} 已被歸還。`);
      return false;
    }

    const { id: foundMemberId, name: foundMemberName } = foundMember;

    setCustomers(prevCustomers =>
      prevCustomers.map(customer => {
        if (customer.id !== foundMemberId) return customer;

        return {
          ...customer,
          borrowedBags: customer.borrowedBags.filter(item => item !== targetBag),
          esgPoints: customer.esgPoints + 50,
          co2Saved: Number((customer.co2Saved + 0.15).toFixed(2)),
        };
      }),
    );

    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.bagId === targetBag && order.status === '待取件'
          ? { ...order, status: '已取件' }
          : order,
      ),
    );

    markBagReturned(targetBag);
    setBagCirculationCount(prev => prev + 1);

    setSelectedCustomer(prevCustomer => {
      if (!prevCustomer || prevCustomer.id !== foundMemberId) return prevCustomer;

      return {
        ...prevCustomer,
        borrowedBags: prevCustomer.borrowedBags.filter(item => item !== targetBag),
        esgPoints: prevCustomer.esgPoints + 50,
        co2Saved: Number((prevCustomer.co2Saved + 0.15).toFixed(2)),
      };
    });

    showToast(`♻️ 衣袋 ${targetBag} 歸還成功！(情況：${condition}) 歸還會員：${foundMemberName} (+50 配客點)`);
    return true;
  };

  const handleCheckoutReturnBag = () => {
    if (!selectedCustomer) {
      showToast('請先選擇會員再登記歸還衣袋。');
      return;
    }

    const targetBag = normalizeBagId(checkoutReturnBagId);
    if (!targetBag) return;

    if (!selectedCustomer.borrowedBags.includes(targetBag)) {
      showToast(`⚠️ 該會員未借用此衣袋 ${targetBag}。`);
      return;
    }

    if (returnBagById(targetBag, checkoutReturnBagCondition)) {
      setCheckoutReturnBagId('');
      setCheckoutReturnBagCondition('良好');
    }
  };

  const handleCustomerPickup = (orderId: string) => {
    const order = orders.find(item => item.id === orderId);
    if (!order) return;

    setOrders(prev => prev.map(item => (item.id === orderId ? { ...item, status: '已取件' } : item)));

    if (order.memberId && order.memberId !== 'GUEST' && order.bagId) {
      const targetBag = order.bagId;
      setCustomers(prev =>
        prev.map(customer => {
          if (customer.id !== order.memberId) return customer;
          return {
            ...customer,
            borrowedBags: customer.borrowedBags.filter(bag => bag !== targetBag),
            esgPoints: customer.esgPoints + 50,
            co2Saved: Number((customer.co2Saved + 0.15).toFixed(2)),
          };
        }),
      );
      markBagReturned(targetBag);
      showToast(`✅ 歸還衣袋 ${targetBag} 成功！${order.customerName} 取件完成！`);
    } else {
      showToast(`✅ 散客訂單 ${orderId} 取件成功！`);
    }
  };

  const handleQuickReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBag = normalizeBagId(quickReturnBagId);
    if (!targetBag) return;

    if (returnBagById(targetBag, quickReturnBagCondition)) {
      setQuickReturnBagId('');
      setQuickReturnBagCondition('良好');
      setIsQuickReturnOpen(false);
    }
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberPhone.trim()) {
      showToast('請輸入會員姓名與電話');
      return;
    }

    const newId = `MEM-${String(customers.length + 1).padStart(4, '0')}`;
    const newCustomer: Customer = {
      id: newId,
      name: newMemberName.trim(),
      phone: newMemberPhone.trim(),
      level: '新芽會員',
      esgPoints: 100,
      co2Saved: 0,
      borrowedBags: [],
      lastVisit: '今日',
      totalOrders: 0,
      balance: 0,
      totalSpent: 0,
      habits: '新註冊會員，無備註',
    };

    setCustomers(prev => [newCustomer, ...prev]);
    setSelectedCustomer(newCustomer);
    setNewMemberName('');
    setNewMemberPhone('');
    setIsAddMemberOpen(false);
    showToast(`新會員 ${newCustomer.name} 建立成功！`);
  };

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topUpCustomer) return;

    const amount = Number(topUpAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      showToast('請輸入正確的儲值金額');
      return;
    }

    setCustomers(prev => prev.map(customer => (customer.id === topUpCustomer.id ? { ...customer, balance: customer.balance + amount } : customer)));
    if (selectedCustomer && selectedCustomer.id === topUpCustomer.id) {
      setSelectedCustomer(prev => (prev ? { ...prev, balance: prev.balance + amount } : prev));
    }

    setIsTopUpOpen(false);
    setTopUpAmount('');
    showToast(`儲值成功！${topUpCustomer.name} 已成功儲值 $${amount} 元。`);
  };

  const handleSaveHabit = (id: string) => {
    setCustomers(prev => prev.map(customer => (customer.id === id ? { ...customer, habits: tempHabitText } : customer)));
    if (selectedCustomer?.id === id) {
      setSelectedCustomer(prev => (prev ? { ...prev, habits: tempHabitText } : prev));
    }
    setEditingHabitId(null);
    setTempHabitText('');
    showToast('顧客習性備註已成功儲存！');
  };

  const handleSendCampaign = () => {
    if (!customSmsContent.trim()) {
      showToast('⚠️ 推播內容不可為空！');
      return;
    }

    const newCampaign: Campaign = {
      id: `CAM-${String(campaignHistory.length + 1).padStart(2, '0')}`,
      name: marketingSegment === 'eco_fans' ? '精準推播 - 環保先鋒' : marketingSegment === 'inactive' ? '精準推播 - 久未到店' : '精準推播 - 尊榮會員',
      segment: marketingSegment === 'eco_fans' ? '環保急先鋒' : marketingSegment === 'inactive' ? '久未到店客' : '高價值會員',
      date: '今日',
      count: marketingSegment === 'eco_fans' ? customers.filter(customer => customer.co2Saved > 10).length : customers.length,
      content: customSmsContent,
      status: '已發送',
    };

    setCampaignHistory(prev => [newCampaign, ...prev]);
    showToast('✉️ 智慧再行銷推播訊息已通過 Line / SMS 發送完畢！');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-bold">
          {toastMessage}
        </div>
      )}

      <aside className="w-64 bg-[#3f8f61] text-white shrink-0 flex flex-col shadow-2xl">
        <div className="p-6 border-b border-white/10">
          <div className="text-2xl font-black tracking-tight">GREEN CLEAN</div>
          <div className="text-xs text-emerald-100 mt-1">智慧乾洗 POS 營運管理系統</div>
        </div>

        <div className="p-3 space-y-2 border-b border-white/10">
          <button
            type="button"
            onClick={() => {
              setQuickReturnBagId('');
              setQuickReturnBagCondition('良好');
              setIsQuickReturnOpen(true);
            }}
            className="w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs py-2 rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            ♻️ 快速歸還衣袋
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('checkout');
              showToast('已轉到送洗收銀台');
            }}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs py-2 rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            登記送洗
          </button>
        </div>

        <nav className="px-3 py-4 space-y-1 flex-1">
          {[
            { id: 'dashboard' as TabId, name: '首頁', icon: '🏠' },
            { id: 'orders' as TabId, name: '訂單管理', icon: '📋' },
            { id: 'members' as TabId, name: '客戶管理', icon: '👥' },
            { id: 'checkout' as TabId, name: '衣物管理', icon: '🧺' },
            { id: 'inventory' as TabId, name: '庫存管理', icon: '📦' },
            { id: 'reports' as TabId, name: '報表分析', icon: '📊' },
            { id: 'settings' as TabId, name: '系統設定', icon: '⚙️' },
          ].map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveTab(item.id);
                setSelectedOrderIds([]);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm font-semibold text-left ${
                activeTab === item.id ? 'bg-white text-[#3f8f61] shadow-lg' : 'text-emerald-50 hover:bg-[#378156]'
              }`}
            >
              <span>{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="p-4 bg-[#327750] text-xs">
          <div className="font-semibold text-emerald-100">綠潔台北忠孝旗艦店</div>
          <div className="text-emerald-300 mt-0.5">操作員：陳店長</div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 py-4 px-8 flex justify-between items-center shrink-0 sticky top-0 z-20">
          <h2 className="text-xl font-bold text-slate-800">
            {activeTab === 'dashboard' && '首頁'}
            {activeTab === 'orders' && '訂單管理'}
            {activeTab === 'members' && '客戶管理'}
            {activeTab === 'checkout' && '衣物管理 / 收銀登記'}
            {activeTab === 'inventory' && '庫存管理'}
            {activeTab === 'reports' && '報表分析'}
            {activeTab === 'settings' && '系統設定'}
          </h2>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <span>營運在線</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
        </header>

        <div className="p-8 flex-1">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard title="今日訂單" value={`${Math.max(todayOrders, 128)}`} unit="筆" hint="即時累計今日收件" />
                <MetricCard title="待處理訂單" value={`${pendingOrders}`} unit="筆" hint="未完成取件訂單" />
                <MetricCard title="累計營收" value={`$${totalRevenue.toLocaleString()}`} hint="依目前訂單加總" />
                <MetricCard title="會員總數" value={`${totalMembers}`} unit="人" hint="已建立會員資料" />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-800">營收趨勢</h3>
                      <p className="text-xs text-slate-400 mt-1">展示店鋪營運成長狀況</p>
                    </div>
                    <div className="flex bg-slate-100 rounded-xl p-1">
                      {(['年', '季', '月'] as const).map(view => (
                        <button
                          key={view}
                          type="button"
                          onClick={() => setDashboardChartView(view)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                            dashboardChartView === view ? 'bg-[#3f8f61] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {view}
                        </button>
                      ))}
                    </div>
                  </div>
                  <svg viewBox="0 0 520 180" className="w-full h-64 bg-slate-50 rounded-2xl border border-slate-100">
                    <line x1="40" y1="145" x2="500" y2="145" stroke="#cbd5e1" strokeWidth="2" />
                    <line x1="40" y1="20" x2="40" y2="145" stroke="#cbd5e1" strokeWidth="2" />
                    <polyline points={dbPolylinePoints} fill="none" stroke="#3f8f61" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    {dbPoints.map(point => (
                      <g key={point.label}>
                        <circle cx={point.x} cy={point.y} r="6" fill="#3f8f61" />
                        <text x={point.x} y={point.y - 12} textAnchor="middle" className="text-[11px] fill-slate-700 font-bold">
                          {point.val}
                        </text>
                        <text x={point.x} y="168" textAnchor="middle" className="text-[11px] fill-slate-500 font-semibold">
                          {point.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <h3 className="text-lg font-black text-slate-800 mb-4">訂單狀態比例</h3>
                  <div className="space-y-4">
                    {ORDER_STATUS_OPTIONS.map(status => {
                      const count = orders.filter(order => order.status === status).length;
                      const percent = orders.length ? Math.round((count / orders.length) * 100) : 0;
                      return (
                        <div key={status}>
                          <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                            <span>{status}</span>
                            <span>{count} 筆 / {percent}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#3f8f61] rounded-full" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <CustomerSummaryTable customers={customers.slice(0, 5)} />
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-wrap gap-2 items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {(['全部', ...ORDER_STATUS_OPTIONS] as Array<'全部' | OrderStatus>).map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        setOrderStatusFilter(status);
                        setSelectedOrderIds([]);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        orderStatusFilter === status ? 'bg-[#3f8f61] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {status} ({status === '全部' ? orders.length : orders.filter(order => order.status === status).length})
                    </button>
                  ))}
                </div>

                {selectedOrderIds.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    已選 {selectedOrderIds.length} 筆：
                    {ORDER_STATUS_OPTIONS.map(status => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleBatchStatusChange(status)}
                        className="bg-white text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded hover:bg-emerald-600 hover:text-white"
                      >
                        批次-{status}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs text-slate-400">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                            onChange={() => {
                              if (selectedOrderIds.length === filteredOrders.length) setSelectedOrderIds([]);
                              else setSelectedOrderIds(filteredOrders.map(order => order.id));
                            }}
                          />
                        </th>
                        <th className="px-4 py-3 text-left">訂單編號</th>
                        <th className="px-4 py-3 text-left">會員資訊</th>
                        <th className="px-4 py-3 text-left">衣物項目 & 編號</th>
                        <th className="px-4 py-3 text-left">狀態 / 衣袋</th>
                        <th className="px-4 py-3 text-left">費用</th>
                        <th className="px-4 py-3 text-left">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map(order => (
                        <tr key={order.id} className="border-t border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedOrderIds.includes(order.id)}
                              onChange={() => {
                                if (selectedOrderIds.includes(order.id)) setSelectedOrderIds(selectedOrderIds.filter(id => id !== order.id));
                                else setSelectedOrderIds([...selectedOrderIds, order.id]);
                              }}
                            />
                          </td>
                          <td className="px-4 py-3 font-mono font-black text-emerald-700">{order.id}</td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-700">{order.customerName}</div>
                            <div className="text-xs text-slate-400">{order.memberId}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              {order.items.map((item, index) => (
                                <div key={`${order.id}-${item.garmentId}-${index}`} className="text-xs text-slate-600">
                                  {item.name}（{item.color}）<span className="font-mono text-emerald-700 font-bold">{item.garmentId}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-black text-slate-700">{order.status}</div>
                            <div className="text-xs text-slate-400">{order.bagId ? `袋：${order.bagId}` : order.memberId === 'GUEST' ? '紙袋' : '未綁定'}</div>
                          </td>
                          <td className="px-4 py-3 font-black">${order.total}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              <select
                                value={order.status}
                                onChange={event => handleSingleStatusChange(order.id, event.target.value as OrderStatus)}
                                className="bg-white border rounded-lg px-2 py-1 text-xs focus:outline-none"
                              >
                                {ORDER_STATUS_OPTIONS.map(status => (
                                  <option key={status} value={status}>{status}</option>
                                ))}
                              </select>
                              {order.status === '包裝中' && order.memberId !== 'GUEST' && (
                                <button type="button" onClick={() => openBagBindingModal(order.id)} className="bg-emerald-600 text-white font-bold px-2.5 py-1 rounded-lg hover:bg-emerald-700 text-xs">
                                  綁定衣袋
                                </button>
                              )}
                              {order.status === '待取件' && (
                                <button type="button" onClick={() => handleCustomerPickup(order.id)} className="bg-slate-900 text-white font-bold px-2.5 py-1 rounded-lg hover:bg-slate-700 text-xs">
                                  完成取件
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col md:flex-row gap-3 justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-800">會員管理</h3>
                  <p className="text-sm text-slate-500 mt-1">管理會員資料、儲值金、配客點與未歸還衣袋。</p>
                </div>
                <div className="flex gap-2">
                  <input
                    value={memberSearch}
                    onChange={event => setMemberSearch(event.target.value)}
                    placeholder="搜尋會員姓名 / 電話 / 編號"
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                  <button type="button" onClick={() => setIsAddMemberOpen(true)} className="bg-[#3f8f61] text-white font-black px-4 py-2 rounded-xl text-sm">
                    新增會員
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredCustomers.map(customer => (
                  <div key={customer.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-black text-slate-800">{customer.name}</h4>
                          <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">{customer.level}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{customer.id} / {customer.phone}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setTopUpCustomer(customer);
                          setTopUpAmount('');
                          setIsTopUpOpen(true);
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black px-3 py-2 rounded-xl h-fit"
                      >
                        快速儲值
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <SmallStat title="儲值金" value={`$${customer.balance}`} />
                      <SmallStat title="配客點" value={`${customer.esgPoints}P`} />
                      <SmallStat title="減碳量" value={`${customer.co2Saved}kg`} />
                    </div>

                    <div className="mt-4 text-sm">
                      <div className="font-bold text-slate-500 mb-1">未歸還衣袋</div>
                      {customer.borrowedBags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {customer.borrowedBags.map(bag => (
                            <span key={bag} className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-2 py-1 text-xs font-black font-mono">{bag}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">無未歸還衣袋</span>
                      )}
                    </div>

                    <div className="mt-4">
                      <div className="font-bold text-slate-500 text-sm mb-1">顧客備註</div>
                      {editingHabitId === customer.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={tempHabitText}
                            onChange={event => setTempHabitText(event.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs focus:outline-none min-h-[70px]"
                          />
                          <div className="flex gap-2 justify-end">
                            <button type="button" onClick={() => setEditingHabitId(null)} className="text-xs font-bold text-slate-400">取消</button>
                            <button type="button" onClick={() => handleSaveHabit(customer.id)} className="text-xs font-bold bg-[#3f8f61] text-white px-3 py-1 rounded-lg">儲存</button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingHabitId(customer.id);
                            setTempHabitText(customer.habits);
                          }}
                          className="w-full text-left bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl p-3 text-xs text-slate-600"
                        >
                          {customer.habits}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'checkout' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h3 className="text-lg font-black text-slate-800 mb-4">第一步：連結會員</h3>
                  <div className="flex flex-col md:flex-row gap-3">
                    <input
                      value={searchPhone}
                      onChange={event => setSearchPhone(event.target.value)}
                      onKeyDown={event => event.key === 'Enter' && handleCustomerSearch()}
                      placeholder="輸入電話、姓名或會員編號"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#3f8f61]"
                    />
                    <button type="button" onClick={handleCustomerSearch} className="bg-[#3f8f61] text-white font-black px-5 py-3 rounded-xl text-sm">
                      查詢會員
                    </button>
                    <button type="button" onClick={() => setIsAddMemberOpen(true)} className="bg-slate-900 text-white font-black px-5 py-3 rounded-xl text-sm">
                      新增會員
                    </button>
                  </div>

                  {selectedCustomer && (
                    <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <div className="font-black text-emerald-800">{selectedCustomer.name} / {selectedCustomer.id}</div>
                          <div className="text-xs text-emerald-700 mt-1">儲值金餘額：${selectedCustomer.balance} 元 | 配客點：{selectedCustomer.esgPoints}P</div>
                          <div className="text-xs text-emerald-700 mt-1">顧客備註：{selectedCustomer.habits || '無備註'}</div>
                          <div className="text-xs text-emerald-700 mt-1">
                            未歸還衣袋：{selectedCustomer.borrowedBags.length > 0 ? selectedCustomer.borrowedBags.join(', ') : '無未歸還衣袋'}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setTopUpCustomer(selectedCustomer);
                              setTopUpAmount('');
                              setIsTopUpOpen(true);
                            }}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black px-3 py-2 rounded-xl"
                          >
                            快速儲值
                          </button>
                          <button type="button" onClick={() => setSelectedCustomer(null)} className="text-xs text-slate-400 font-bold">
                            清除
                          </button>
                        </div>
                      </div>

                      {selectedCustomer.borrowedBags.length > 0 && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                          <div className="md:col-span-2">
                            <label className="text-xs font-black text-emerald-800">同時登記歸還衣袋</label>
                            <input
                              value={checkoutReturnBagId}
                              onChange={event => setCheckoutReturnBagId(event.target.value)}
                              onKeyDown={event => event.key === 'Enter' && handleCheckoutReturnBag()}
                              placeholder="BAG-0001"
                              className="w-full bg-white border border-emerald-200 rounded-lg p-2 text-xs focus:outline-none font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-black text-emerald-800">衣袋狀況</label>
                            <select
                              value={checkoutReturnBagCondition}
                              onChange={event => setCheckoutReturnBagCondition(event.target.value)}
                              className="w-full bg-white border border-emerald-200 rounded-lg p-2 text-xs focus:outline-none"
                            >
                              <option>良好</option>
                              <option>輕微破損</option>
                              <option>嚴重破損</option>
                              <option>需清潔</option>
                            </select>
                          </div>
                          <button type="button" onClick={handleCheckoutReturnBag} className="bg-emerald-700 text-white text-xs font-black rounded-lg py-2">
                            確認歸還
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h3 className="text-lg font-black text-slate-800 mb-4">第二步：登記衣服種類</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {ITEM_CATEGORIES.map(category => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleAddCategoryItem(category)}
                        className="bg-slate-50 hover:bg-emerald-50 border border-slate-100 rounded-xl p-4 text-left transition text-xs"
                      >
                        <div className="text-2xl mb-2">{category.icon}</div>
                        <div className="font-black text-slate-700">{category.name}</div>
                        <div className="text-emerald-700 font-black mt-1">${category.price}</div>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setIsCustomItemOpen(true)}
                      className="bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-xl p-4 text-xs flex flex-col justify-center items-center"
                    >
                      <div className="text-2xl">➕</div>
                      <div className="font-black mt-2">其他衣服</div>
                      <div className="text-slate-400 mt-1">自訂輸入</div>
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h3 className="text-lg font-black text-slate-800 mb-4">第三步：洗衣購物籃細節</h3>
                  {orderItems.length === 0 ? (
                    <div className="text-sm text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                      請點選上方衣服種類登錄
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {groupedOrderItems.map(group => (
                        <div key={group.name} className="border border-slate-100 rounded-2xl overflow-hidden">
                          <div className="bg-slate-50 px-4 py-3 flex justify-between items-center">
                            <div>
                              <span className="font-black text-slate-800">{group.name}</span>
                              <span className="text-xs text-slate-400 ml-2">共 {group.items.length} 件</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setOrderItems(prev => [
                                  ...prev,
                                  {
                                    id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
                                    name: group.name,
                                    type: group.name,
                                    price: group.price,
                                    count: 1,
                                    material: '純棉',
                                    treatment: '標準清洗',
                                    color: '白色',
                                    remarks: '',
                                    garmentId: '',
                                  },
                                ]);
                              }}
                              className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100"
                            >
                              ➕ 新增一件
                            </button>
                          </div>
                          <div className="divide-y divide-slate-100">
                            {group.items.map((item, localIndex) => (
                              <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-4">
                                <div className="md:col-span-1 text-xs font-black text-slate-400">#{localIndex + 1}</div>
                                <div className="md:col-span-3">
                                  <label className="text-xs font-bold text-slate-400">衣物編號</label>
                                  <input
                                    value={item.garmentId}
                                    onChange={event => updateCartItem(item.originalIndex, 'garmentId', event.target.value.toUpperCase())}
                                    placeholder="C-0001"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-xs font-mono focus:outline-none"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="text-xs font-bold text-slate-400">顏色</label>
                                  <input
                                    value={item.color}
                                    onChange={event => updateCartItem(item.originalIndex, 'color', event.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-xs focus:outline-none"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="text-xs font-bold text-slate-400">處理方式</label>
                                  <select
                                    value={item.treatment || '標準清洗'}
                                    onChange={event => updateCartItem(item.originalIndex, 'treatment', event.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-xs focus:outline-none"
                                  >
                                    <option>標準清洗</option>
                                    <option>精緻乾洗</option>
                                    <option>高溫除蟎</option>
                                    <option>特殊去漬</option>
                                  </select>
                                </div>
                                <div className="md:col-span-2">
                                  <label className="text-xs font-bold text-slate-400">價格</label>
                                  <input
                                    type="number"
                                    value={item.price}
                                    onChange={event => updateCartItem(item.originalIndex, 'price', Number(event.target.value))}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-xs focus:outline-none"
                                  />
                                </div>
                                <div className="md:col-span-2 flex justify-end">
                                  <button type="button" onClick={() => removeCartItem(item.originalIndex)} className="text-red-500 text-xs font-black hover:text-red-700">
                                    移除
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-24">
                  <h3 className="text-lg font-black text-slate-800 mb-4">結帳摘要</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                      <div>
                        <div className="font-black text-emerald-800">生物溶劑</div>
                        <div className="text-xs text-emerald-600">保護環境且溫和護衣</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={useEcoSolvent}
                        onChange={event => setEcoSolvent(event.target.checked)}
                        className="w-5 h-5 accent-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black text-slate-400">整單補充備註</label>
                      <textarea
                        value={orderRemark}
                        onChange={event => setOrderRemark(event.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none min-h-[80px]"
                        placeholder="例如：領口加強、不要香精、急件..."
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black text-slate-400">選擇付款方式</label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {['現金', '儲值金', '信用卡', '行動支付'].map(method => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setPaymentMethod(method)}
                            className={`py-2 rounded-lg text-xs font-bold transition ${
                              paymentMethod === method ? 'bg-teal-400 text-emerald-950 font-black' : 'bg-emerald-800 text-emerald-100'
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">衣物件數</span>
                        <span className="font-black">{orderItems.length} 件</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">洗滌費小計</span>
                        <span className="font-black">${calculateSubtotal()}</span>
                      </div>
                      <div className="flex justify-between text-xl font-black text-slate-900 pt-2">
                        <span>應收總金額</span>
                        <span>${calculateSubtotal()}</span>
                      </div>
                    </div>

                    <button type="button" onClick={handleCheckout} className="w-full bg-[#3f8f61] hover:bg-[#327750] text-white font-black py-3 rounded-xl shadow-lg">
                      ⚡ 建立清洗單
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-lg font-black text-slate-800">智慧物資與耗材庫存</h3>
                <p className="text-sm text-slate-500 mt-1">店鋪物資臨界預警與補貨登記。</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {inventoryList.map((inventory, index) => {
                  const isLow = inventory.stock <= inventory.minStock;
                  return (
                    <div key={inventory.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-black text-slate-800">{inventory.name}</div>
                          <div className="text-xs text-slate-400 mt-1">安全庫存下限：{inventory.minStock} {inventory.unit}</div>
                        </div>
                        <span className={`text-[11px] font-black rounded-full border px-2 py-1 ${isLow ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                          {isLow ? '需補貨' : '正常'}
                        </span>
                      </div>
                      <div className="text-4xl font-black text-slate-900 mt-5">{inventory.stock}<span className="text-sm text-slate-400 ml-1">{inventory.unit}</span></div>
                      <button
                        type="button"
                        onClick={() => {
                          setInventoryList(prev => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, stock: item.stock + 50 } : item)));
                          showToast(`已成功為 ${inventory.name} 補貨 50 ${inventory.unit}`);
                        }}
                        className="text-xs mt-5 px-3 py-2 bg-slate-50 border border-slate-200 hover:border-[#3f8f61] rounded-lg text-slate-600 transition font-bold"
                      >
                        補貨登記 +50
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-800">智慧環保衣袋 累計循環次數走勢</h3>
                    <p className="text-sm text-slate-500 mt-1">永續綠色包材轉換率與循環次數趨勢走勢圖。</p>
                  </div>
                  <div className="flex bg-slate-100 rounded-xl p-1">
                    {(['年', '季', '月'] as const).map(view => (
                      <button
                        key={view}
                        type="button"
                        onClick={() => setChartView(view)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition ${chartView === view ? 'bg-[#3f8f61] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        {view}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <svg viewBox="0 0 520 220" className="w-full h-64">
                    <line x1="40" y1="180" x2="500" y2="180" stroke="#cbd5e1" strokeWidth="2" />
                    <line x1="40" y1="20" x2="40" y2="180" stroke="#cbd5e1" strokeWidth="2" />
                    <polyline points={polylinePointsString} fill="none" stroke="#3f8f61" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    {chartPoints.map(point => (
                      <g key={point.label}>
                        <circle cx={point.x} cy={point.y} r="6" fill="#3f8f61" />
                        <text x={point.x} y={point.y - 14} textAnchor="middle" className="text-[11px] fill-slate-700 font-bold">
                          {point.val}次
                        </text>
                        <text x={point.x} y="205" textAnchor="middle" className="text-[11px] fill-slate-500 font-semibold">
                          {point.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <ReportMetric title="衣袋總使用次數" value={totalBagUseCount} unit="次" hint="依各衣袋累計使用次數加總" />
                <ReportMetric title="平均每袋使用" value={averageUsePerBag} unit="次 / 袋" hint="總使用次數 ÷ 衣袋數量" />
                <ReportMetric title="平均多久循環一次" value={averageDaysPerUse} unit="天 / 次" hint="依首次使用到最近使用估算" />
                <ReportMetric title="目前未歸還衣袋" value={borrowedBagTotal} unit="個" hint={`庫存可用：${availableBagStock} 個`} danger={borrowedBagTotal > 0} />
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-800">循環衣袋使用明細</h3>
                    <p className="text-sm text-slate-500 mt-1">顯示每個 BAG 編號目前累計使用次數、最近使用日期與平均循環時間。</p>
                  </div>
                  <div className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                    目前追蹤衣袋：<span className="font-black text-slate-800 ml-1">{bagUsageStats.length}</span> 個
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                        <th className="py-3 px-2">衣袋編號</th>
                        <th className="py-3 px-2">目前狀態</th>
                        <th className="py-3 px-2">目前使用者</th>
                        <th className="py-3 px-2">使用次數</th>
                        <th className="py-3 px-2">平均多久一次</th>
                        <th className="py-3 px-2">首次使用</th>
                        <th className="py-3 px-2">最近使用</th>
                        <th className="py-3 px-2">最後歸還</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedBagUsageStats.map(bag => {
                        const maxUseCount = Math.max(...bagUsageStats.map(item => item.useCount), 1);
                        const usePercent = Math.min(100, (bag.useCount / maxUseCount) * 100);
                        const averageCycleDay =
                          bag.useCount > 1 ? `${(getDaysBetween(bag.firstUsedDate, bag.lastUsedDate) / (bag.useCount - 1)).toFixed(1)} 天` : '首次使用';

                        return (
                          <tr key={bag.bagId} className="border-b border-slate-50 hover:bg-slate-50 transition">
                            <td className="py-3 px-2 font-black text-emerald-700 font-mono">{bag.bagId}</td>
                            <td className="py-3 px-2">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-black ${getBagStatusStyle(bag.status)}`}>{bag.status}</span>
                            </td>
                            <td className="py-3 px-2 text-slate-600 font-bold">{bag.currentCustomer}</td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-800 w-10">{bag.useCount} 次</span>
                                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-[#3f8f61] rounded-full" style={{ width: `${usePercent}%` }} />
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-slate-600 font-bold">{averageCycleDay}</td>
                            <td className="py-3 px-2 text-slate-500">{bag.firstUsedDate}</td>
                            <td className="py-3 px-2 text-slate-500">{bag.lastUsedDate}</td>
                            <td className="py-3 px-2 text-slate-500">{bag.lastReturnedDate || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-lg font-black text-slate-800 mb-4">AI 會員智慧客群再行銷</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(['eco_fans', 'inactive', 'big_spenders'] as const).map(segment => (
                    <button
                      key={segment}
                      type="button"
                      onClick={() => setMarketingSegment(segment)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${marketingSegment === segment ? 'bg-[#3f8f61] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {segment === 'eco_fans' ? '環保急先鋒' : segment === 'inactive' ? '久未到店客' : '高價值愛好者'}
                    </button>
                  ))}
                </div>
                <textarea
                  value={customSmsContent}
                  onChange={event => setCustomSmsContent(event.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs leading-relaxed focus:outline-none min-h-[120px]"
                />
                <div className="flex justify-end mt-3">
                  <button type="button" onClick={handleSendCampaign} className="bg-[#3f8f61] hover:bg-[#327750] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md">
                    發送通知精準推播
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-lg font-black text-slate-800 mb-4">歷史推播紀錄</h3>
                <div className="space-y-3">
                  {campaignHistory.map(campaign => (
                    <div key={campaign.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-black text-slate-700 text-sm">{campaign.name}</p>
                        <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full font-black">{campaign.status}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">「{campaign.content}」</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-4xl">
              <h3 className="text-lg font-black text-slate-800 mb-4">店鋪與系統常規設定</h3>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-xs font-black text-slate-400">店鋪名稱</span>
                  <input
                    value={settings.storeName}
                    onChange={event => setSettings({ ...settings, storeName: event.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-black text-slate-400">聯絡電話</span>
                  <input
                    value={settings.phone}
                    onChange={event => setSettings({ ...settings, phone: event.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-black text-slate-400">店鋪地址</span>
                  <input
                    value={settings.address}
                    onChange={event => setSettings({ ...settings, address: event.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-black text-slate-400">LINE 通知模板</span>
                  <textarea
                    value={settings.lineNotificationTemplate}
                    onChange={event => setSettings({ ...settings, lineNotificationTemplate: event.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none min-h-[130px]"
                  />
                </label>
                <label className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-bold">
                  <input
                    type="checkbox"
                    checked={settings.isAutoPrintLabel}
                    onChange={event => setSettings({ ...settings, isAutoPrintLabel: event.target.checked })}
                    className="w-5 h-5 accent-emerald-600"
                  />
                  建立訂單後自動列印衣物標籤
                </label>
                <button type="button" onClick={() => showToast('系統設定已儲存！')} className="bg-[#3f8f61] text-white font-black px-5 py-3 rounded-xl text-sm">
                  儲存設定
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {isQuickReturnOpen && (
        <Modal title="快速歸還衣袋" onClose={() => setIsQuickReturnOpen(false)}>
          <form onSubmit={handleQuickReturnSubmit} className="space-y-4">
            <label className="block">
              <span className="text-xs font-black text-slate-400">衣袋編號</span>
              <input
                value={quickReturnBagId}
                onChange={event => setQuickReturnBagId(event.target.value)}
                placeholder="BAG-0001"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-mono focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs font-black text-slate-400">衣袋狀況</span>
              <select
                value={quickReturnBagCondition}
                onChange={event => setQuickReturnBagCondition(event.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none"
              >
                <option>良好</option>
                <option>輕微破損</option>
                <option>嚴重破損</option>
                <option>需清潔</option>
              </select>
            </label>
            <button type="submit" className="w-full bg-[#3f8f61] text-white font-black py-3 rounded-xl">
              確認歸還
            </button>
          </form>
        </Modal>
      )}

      {isBagBindingModalOpen && (
        <Modal title="包裝綁定循環衣袋" onClose={() => setIsBagBindingModalOpen(false)}>
          <form onSubmit={handleBindBagSubmit} className="space-y-4">
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl p-3 text-xs font-bold">
              訂單：{bindingOrderId}，請掃描或輸入 BAG-xxxx 衣袋編碼。
            </div>
            <label className="block">
              <span className="text-xs font-black text-slate-400">衣袋編號</span>
              <input
                value={tempBagId}
                onChange={event => setTempBagId(event.target.value.toUpperCase())}
                placeholder="BAG-0001"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-mono focus:outline-none"
              />
            </label>
            <button type="submit" className="w-full bg-[#3f8f61] text-white font-black py-3 rounded-xl">
              完成綁定並改為待取件
            </button>
          </form>
        </Modal>
      )}

      {isAddMemberOpen && (
        <Modal title="新增會員" onClose={() => setIsAddMemberOpen(false)}>
          <form onSubmit={handleCreateMember} className="space-y-4">
            <label className="block">
              <span className="text-xs font-black text-slate-400">會員姓名</span>
              <input
                value={newMemberName}
                onChange={event => setNewMemberName(event.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs font-black text-slate-400">電話</span>
              <input
                value={newMemberPhone}
                onChange={event => setNewMemberPhone(event.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none"
              />
            </label>
            <button type="submit" className="w-full bg-[#3f8f61] text-white font-black py-3 rounded-xl">
              建立會員
            </button>
          </form>
        </Modal>
      )}

      {isTopUpOpen && topUpCustomer && (
        <Modal title="會員快速儲值" onClose={() => setIsTopUpOpen(false)}>
          <form onSubmit={handleTopUpSubmit} className="space-y-4">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm">
              <div className="font-black text-slate-800">{topUpCustomer.name}</div>
              <div className="text-xs text-slate-500 mt-1">目前餘額：${topUpCustomer.balance}</div>
            </div>
            <label className="block">
              <span className="text-xs font-black text-slate-400">儲值金額</span>
              <input
                type="number"
                value={topUpAmount}
                onChange={event => setTopUpAmount(event.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none"
              />
            </label>
            <button type="submit" className="w-full bg-amber-500 text-slate-950 font-black py-3 rounded-xl">
              確認儲值
            </button>
          </form>
        </Modal>
      )}

      {isCustomItemOpen && (
        <Modal title="新增自訂衣物" onClose={() => setIsCustomItemOpen(false)}>
          <form onSubmit={handleAddCustomItem} className="space-y-4">
            <label className="block">
              <span className="text-xs font-black text-slate-400">衣物名稱</span>
              <input
                value={customItemName}
                onChange={event => setCustomItemName(event.target.value)}
                placeholder="例如：皮衣、窗簾、特殊布料"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs font-black text-slate-400">價格</span>
              <input
                type="number"
                value={customItemPrice}
                onChange={event => setCustomItemPrice(event.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none"
              />
            </label>
            <button type="submit" className="w-full bg-[#3f8f61] text-white font-black py-3 rounded-xl">
              新增到購物籃
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function MetricCard({ title, value, unit, hint }: { title: string; value: string; unit?: string; hint: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-1">
      <div className="text-slate-400 text-xs font-semibold">{title}</div>
      <div className="text-3xl font-black text-slate-800">
        {value} {unit && <span className="text-xs text-slate-500">{unit}</span>}
      </div>
      <div className="text-[11px] text-emerald-600 font-bold">{hint}</div>
    </div>
  );
}

function SmallStat({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-xl border border-slate-100 p-3">
      <div className="text-[11px] text-slate-400 font-bold">{title}</div>
      <div className="text-lg font-black text-slate-800 mt-1">{value}</div>
    </div>
  );
}

function ReportMetric({ title, value, unit, hint, danger }: { title: string; value: string | number; unit: string; hint: string; danger?: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <p className="text-xs font-bold text-slate-400">{title}</p>
      <p className="text-3xl font-black text-slate-800 mt-2">
        {value}
        <span className="text-sm ml-1 text-slate-400">{unit}</span>
      </p>
      <p className={`text-xs font-bold mt-2 ${danger ? 'text-red-500' : 'text-emerald-600'}`}>{hint}</p>
    </div>
  );
}

function CustomerSummaryTable({ customers }: { customers: Customer[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h3 className="text-lg font-black text-slate-800 mb-4">客戶資料摘要</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
              <th className="py-3 px-2">會員編號</th>
              <th className="py-3 px-2">姓名</th>
              <th className="py-3 px-2">聯絡電話</th>
              <th className="py-3 px-2">消費次數</th>
              <th className="py-3 px-2">累積消費</th>
              <th className="py-3 px-2">會員等級</th>
              <th className="py-3 px-2">最後消費</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="py-3 px-2 font-mono font-black text-emerald-700">{customer.id}</td>
                <td className="py-3 px-2 font-bold">{customer.name}</td>
                <td className="py-3 px-2 text-slate-500">{customer.phone}</td>
                <td className="py-3 px-2">{customer.totalOrders}</td>
                <td className="py-3 px-2">${customer.totalSpent.toLocaleString()}</td>
                <td className="py-3 px-2">{customer.level}</td>
                <td className="py-3 px-2 text-slate-500">{customer.lastVisit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-black text-slate-800">{title}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 font-black">
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
