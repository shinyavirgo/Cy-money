import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { 
  Plus, List, PieChart, CreditCard, Calendar, Trash2, X, Check, Utensils, Shirt, Home, Car, BookOpen, Gamepad2, 
  MoreHorizontal, AlertCircle, Settings, Edit2, Gift, TrendingUp, Save, ShoppingCart, Coffee, Heart, Briefcase, 
  Plane, Landmark, Wallet, Banknote, PiggyBank, Monitor, Smartphone, Bus, Train, Scissors, Camera, Music, Ticket, 
  Umbrella, ShoppingBag, Package, Globe, Map, Zap, Award, Star, Palette, Upload, Download, FileText, LogOut,
  UserCircle, Loader2
} from 'lucide-react';

// ==========================================
// 1. 系統最新預設值 (支出分類與信用卡設定)
// ==========================================
const DEFAULT_BANK_CARDS = {
  '現金': [{ name: '現金', billing: '無', limit: null, rewardCycle: 'calendar', rewards: [], iconName: 'Banknote', color: 'bg-green-100 text-green-600' }],
  '聯邦': [{ name: '賴點卡', billing: '每月9日', limit: null, rewardCycle: 'calendar', rewards: [
    { id: 'r1', name: '國內', type: 'cashback', rate: 1, limit: null },
    { id: 'r2', name: '國外', type: 'cashback', rate: 3, limit: null },
{ id: 'r3', name: 'ＬＰ偶數加碼', type: 'cashback', rate: 8.8, limit: 3000 }
  ], iconName: 'CreditCard', color: 'bg-emerald-100 text-emerald-600' }], 
  '星展': [
    { name: '傳說卡', billing: '每月9日', limit: null, rewardCycle: 'calendar', rewards: [
{ id: 'r1', name: '國內', type: 'cashback', rate: 1.2, limit: null },
    { id: 'r2', name: '國外', type: 'cashback', rate: 2.5, limit: null },
{ id: 'r3', name: '加碼', type: 'cashback', rate: 5, limit: 11363 }
], iconName: 'Star', color: 'bg-yellow-100 text-yellow-600' },
    { name: '饗樂卡', billing: '每月9日', limit: null, rewardCycle: 'billing', rewards: [
      { id: 'r1', name: '基本回饋', type: 'points', spend: 30, earn: 1, unit: '活利積分', limit: null },
      { id: 'r2', name: '指定品牌加碼', type: 'points', spend: 30, earn: 2, unit: '活利積分', limit: null }
    ], iconName: 'Gamepad2', color: 'bg-red-100 text-red-600' },
    { name: '永續卡', billing: '每月9日', limit: null, rewardCycle: 'calendar', rewards: [
{ id: 'r1', name: '國內外', type: 'cashback', rate: 1, limit: null },
    { id: 'r2', name: '日韓泰新美歐', type: 'cashback', rate: 4, limit: 15000 }], iconName: 'Globe', color: 'bg-teal-100 text-teal-600' }
  ],
  '元大': [{ name: '鑽金卡', billing: '每月10日', limit: null, rewardCycle: 'calendar', rewards: [
 { id: 'r1', name: '國內', type: 'cashback', rate: 1.2, limit: null },
    { id: 'r2', name: '國外', type: 'cashback', rate: 2.2, limit: null },], iconName: 'Award', color: 'bg-amber-100 text-amber-600' }],
  '富邦': [
    { name: '好市多', billing: '每月12日', limit: null, rewardCycle: 'calendar', rewards: [
      { id: 'r1', name: '店內', type: 'cashback', rate: 2, limit: null },
    { id: 'r2', name: '店外', type: 'cashback', rate: 1, limit: null },
{ id: 'r3', name: '網購加油', type: 'cashback', rate: 3, limit: null }
    ], iconName: 'ShoppingCart', color: 'bg-blue-100 text-blue-600' },
    { name: '數位卡', billing: '每月12日', limit: null, rewardCycle: 'calendar', rewards: [
{ id: 'r1', name: '一般、保費', type: 'cashback', rate: 0.5, limit: null },
    { id: 'r2', name: '數位', type: 'cashback', rate: 1.5, limit: 20000 },], iconName: 'Monitor', color: 'bg-blue-100 text-blue-600' },
    { name: 'J卡', billing: '每月12日', limit: null, rewardCycle: 'calendar', rewards: [
      { id: 'r1', name: '國內外', type: 'cashback', rate: 1, limit: null },
      { id: 'r2', name: '日韓泰', type: 'cashback', rate: 3, limit: null }
    ], iconName: 'Plane', color: 'bg-blue-100 text-blue-600' }
  ],
  '新光': [{ name: 'OU卡', billing: '每月12日', limit: null, rewardCycle: 'calendar', rewards: [], iconName: 'CreditCard', color: 'bg-rose-100 text-rose-600' }],
  '永豐': [
    { name: '運動卡', billing: '每月14日', limit: null, rewardCycle: 'calendar', rewards: [
{ id: 'r1', name: '一般', type: 'cashback', rate: 1, limit: null },
      { id: 'r2', name: '運動', type: 'cashback', rate: 1, limit: 5000 },
{ id: 'r3', name: 'ＡＰ加碼', type: 'cashback', rate: 3, limit: 10000 }
], iconName: 'Heart', color: 'bg-rose-100 text-rose-600' },
    { name: '大戶卡', billing: '每月14日', limit: null, rewardCycle: 'billing', rewards: [
      { id: 'r1', name: '國內', type: 'cashback', rate: 1, limit: null },
      { id: 'r2', name: '國外', type: 'cashback', rate: 2, limit: null },
      { id: 'r3', name: '大戶ＰＳ加碼', type: 'cashback', rate: 4, limit: 25000 }
    ], iconName: 'Landmark', color: 'bg-gray-100 text-gray-800' },
    { name: '大威卡', billing: '每月14日', limit: null, rewardCycle: 'billing', rewards: [
{ id: 'r1', name: '國內', type: 'cashback', rate: 0.5, limit: null },
      { id: 'r2', name: '國外', type: 'cashback', rate: 2.5, limit: null },
      { id: 'r3', name: 'ＬＰ加碼', type: 'cashback', rate: 1.5, limit: 20000 }
], iconName: 'CreditCard', color: 'bg-slate-100 text-slate-600' },
    { name: '幣倍卡', billing: '每月14日', limit: null, rewardCycle: 'calendar', rewards: [
{ id: 'r1', name: '國內', type: 'cashback', rate: 1, limit: null },
      { id: 'r2', name: '國外', type: 'cashback', rate: 2, limit: null },
      { id: 'r3', name: '指定', type: 'cashback', rate: 4, limit: 20000 }
], iconName: 'Coins', color: 'bg-yellow-100 text-yellow-600' }
  ],
  '玉山': [
    { name: 'UBEAR卡', billing: '每月21日', limit: null, rewardCycle: 'billing', rewards: [
      { id: 'r1', name: '國內外基本', type: 'cashback', rate: 1, limit: null },
      { id: 'r2', name: '網購/行動支付', type: 'cashback', rate: 2, limit: 7500 }
    ], iconName: 'Smartphone', color: 'bg-green-100 text-green-600' },
    { name: 'UNI卡', billing: '每月21日', limit: null, rewardCycle: 'billing', rewards: [
      { id: 'r1', name: '一般', type: 'cashback', rate: 1, limit: null },
      { id: 'r2', name: '簡單選', type: 'cashback', rate: 2, limit: 50000 },
{ id: 'r3', name: '任意選', type: 'cashback', rate: 2.5, limit: 40000 },
      { id: 'r4', name: 'ＵＰ選', type: 'cashback', rate: 3.5, limit: 142857 }
    ], iconName: 'CreditCard', color: 'bg-teal-100 text-teal-600' },
    { name: 'PI卡', billing: '每月21日', limit: null, rewardCycle: 'calendar', rewards: [
{ id: 'r1', name: '國內外', type: 'cashback', rate: 1, limit: null },
      { id: 'r2', name: '保費', type: 'cashback', rate: 1.2, limit: null },
{ id: 'r3', name: 'ＰＩ全家', type: 'cashback', rate: 5, limit: 2000 }], iconName: 'Zap', color: 'bg-blue-100 text-blue-600' }
  ],
  '中信': [{ name: 'LP卡', billing: '每月25日', limit: null, rewardCycle: 'calendar', rewards: [
{ id: 'r1', name: '國內外', type: 'cashback', rate: 1, limit: null },
      { id: 'r2', name: '國外實體', type: 'cashback', rate: 2.8, limit: null }
], iconName: 'CreditCard', color: 'bg-lime-100 text-lime-600' }],
  '國泰': [
    { name: 'CUBE卡', billing: '每月27日', limit: null, rewardCycle: 'calendar', rewards: [], iconName: 'Package', color: 'bg-green-100 text-green-600' }
  ],
  '台新': [{ name: '理查卡', billing: '每月27日', limit: null, rewardCycle: 'calendar', rewards: [], iconName: 'CreditCard', color: 'bg-red-100 text-red-600' }]
};

const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: '餐飲', iconName: 'Utensils', color: 'bg-orange-100 text-orange-600' },
  { id: 'cat-2', name: '購物', iconName: 'Shirt', color: 'bg-pink-100 text-pink-600' },
  { id: 'cat-3', name: '居家', iconName: 'Home', color: 'bg-blue-100 text-blue-600' },
  { id: 'cat-4', name: '行', iconName: 'Car', color: 'bg-teal-100 text-teal-600' },
  { id: 'cat-5', name: '保健品', iconName: 'BookOpen', color: 'bg-indigo-100 text-indigo-600' },
  { id: 'cat-6', name: '娛樂', iconName: 'Gamepad2', color: 'bg-purple-100 text-purple-600' },
  { id: 'cat-7', name: '其他', iconName: 'MoreHorizontal', color: 'bg-gray-100 text-gray-600' }
];

const COLOR_OPTIONS = [
  'bg-red-100 text-red-600', 'bg-orange-100 text-orange-600', 'bg-amber-100 text-amber-600',
  'bg-yellow-100 text-yellow-600', 'bg-lime-100 text-lime-600', 'bg-green-100 text-green-600',
  'bg-emerald-100 text-emerald-600', 'bg-teal-100 text-teal-600', 'bg-cyan-100 text-cyan-600',
  'bg-sky-100 text-sky-600', 'bg-blue-100 text-blue-600', 'bg-indigo-100 text-indigo-600',
  'bg-violet-100 text-violet-600', 'bg-purple-100 text-purple-600', 'bg-fuchsia-100 text-fuchsia-600',
  'bg-pink-100 text-pink-600', 'bg-rose-100 text-rose-600', 'bg-slate-100 text-slate-600',
  'bg-gray-100 text-gray-600', 'bg-zinc-100 text-zinc-600'
];

const ICON_MAP = { 
  Utensils, Shirt, Home, Car, BookOpen, Gamepad2, MoreHorizontal, CreditCard, Calendar, PieChart, List, Settings, 
  Gift, TrendingUp, ShoppingCart, Coffee, Heart, Briefcase, Plane, Landmark, Wallet, Banknote, PiggyBank, Monitor, 
  Smartphone, Bus, Train, Scissors, Camera, Music, Ticket, Umbrella, ShoppingBag, Package, Globe, Map, Zap, Award, Star, Palette, Upload, Download, FileText, LogOut,
  UserCircle
};
const AVAILABLE_ICONS = Object.keys(ICON_MAP);

// ==========================================
// 2. Firebase 初始化
// ==========================================
let app, auth, db, appId;
try {
  const firebaseConfig = {
    apiKey: "AIzaSyC0CfbVpu_cKde-Pb4w1-43KT5KVcJsOWc",
    authDomain: "cy-card.firebaseapp.com",
    projectId: "cy-card",
    storageBucket: "cy-card.firebasestorage.app",
    messagingSenderId: "905231888204",
    appId: "1:905231888204:web:3f75518b7155e0433ba9e9",
    measurementId: "G-JZCD87N6BB"
  };
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  appId = firebaseConfig.projectId;
} catch (error) {
  console.error("Firebase init failed:", error);
}

// ==========================================
// 輔助函式與全域防呆樣式
// ==========================================
const extractBillingDay = (billingStr) => {
  if (!billingStr || billingStr === '無') return 999;
  const match = billingStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : 999;
};

const getBillingCycleDates = (viewYear, viewMonthNum, billingDayStr) => {
  const match = billingDayStr.match(/\d+/);
  if (!match) return null;
  const day = parseInt(match[0], 10);
  const endDate = new Date(viewYear, viewMonthNum - 1, day);
  const startDate = new Date(viewYear, viewMonthNum - 2, day + 1);
  const formatDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { startStr: formatDate(startDate), endStr: formatDate(endDate), cycleLabel: `${startDate.getMonth()+1}/${startDate.getDate()} ~ ${endDate.getMonth()+1}/${endDate.getDate()}` };
};

// 強制解除 iOS PWA 輸入框封印與防左右滾動
const GlobalStyles = () => (
  <style dangerouslySetInnerHTML={{__html: `
    body, html, #root {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background-color: #e5e7eb;
      -webkit-tap-highlight-color: transparent;
      -webkit-overflow-scrolling: touch;
      overflow-x: hidden; /* 全域強制防止左右滑動 */
    }
    input, textarea, select {
      font-size: 16px !important; /* 防自動放大 */
      -webkit-appearance: none;
      -webkit-user-select: text !important;
      user-select: text !important;
      pointer-events: auto !important;
      touch-action: manipulation !important;
    }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
  `}} />
);

// ==========================================
// 3. 主應用程式組件
// ==========================================
export default function App() {
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isLoading, setIsLoading] = useState(true);

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [bankCards, setBankCards] = useState(DEFAULT_BANK_CARDS);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [pickerConfig, setPickerConfig] = useState(null); 

  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: '餐飲', amount: '', description: '', bank: '現金', card: '現金', billingDate: '無',
    appliedRewards: [] 
  });

  const [editingBank, setEditingBank] = useState(null);
  const [newBankName, setNewBankName] = useState('');
  
  const [editingCardKey, setEditingCardKey] = useState(null); 
  const [cardForm, setCardForm] = useState({ name: '', billing: '', limit: '', rewardCycle: 'calendar', rewards: [], iconName: 'CreditCard', color: 'bg-gray-100 text-gray-600' });

  // 帳號登入狀態
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // 新增：Webhook 狀態與測試發送中提示
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  // 匯出匯入狀態
  const [importStatus, setImportStatus] = useState('');
  const fileInputRef = useRef(null);

  // 刪除防呆狀態
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [showUnusedCards, setShowUnusedCards] = useState(false);

  // 銀行排序 (現金最前，其餘依結帳日排序)
  const sortedBankNames = useMemo(() => {
    return Object.keys(bankCards).sort((a, b) => {
      if (a === '現金') return -1;
      if (b === '現金') return 1;
      const getMinDay = (bName) => {
        const cards = bankCards[bName] || [];
        if (cards.length === 0) return 999;
        return Math.min(...cards.map(c => extractBillingDay(c.billing)));
      };
      const dayA = getMinDay(a);
      const dayB = getMinDay(b);
      if (dayA !== dayB) return dayA - dayB;
      return a.localeCompare(b);
    });
  }, [bankCards]);

  // 初始化權限驗證
  useEffect(() => {
    if (!auth) return;
    
    let initAttempted = false;

    const initAuth = async () => {
      initAttempted = true;
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          try {
            await signInWithCustomToken(auth, __initial_auth_token);
          } catch (tokenErr) {
            console.warn("自訂 Token 不符，嘗試退回匿名登入。");
            await signInAnonymously(auth);
          }
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { 
        console.warn("自動登入失敗 (可能是使用自訂 Firebase 金鑰且未啟用匿名登入)，請登入專屬帳號:", err.message);
      } finally {
        setIsLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsLoading(false);
      } else {
        setUser(null);
        if (!initAttempted) {
          initAuth();
        } else {
          setIsLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAuthSubmit = async (e, isRegistering) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return;
    setAuthError('');
    setIsLoading(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        alert('註冊成功！系統已切換至您的專屬帳號。');
      } else {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
        alert('登入成功！');
      }
      setAuthEmail('');
      setAuthPassword('');
    } catch (error) {
      console.error("Auth error:", error);
      setAuthError(error.message.includes('invalid-credential') ? '帳號或密碼錯誤' : 
                   error.message.includes('email-already-in-use') ? '此信箱已被註冊' : '發生錯誤，請確認您的 Firebase 後台已啟用 Email 登入。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('確定要登出系統嗎？將會切換回訪客模式。')) {
      try {
        await signOut(auth);
        setExpenses([]);
        setCategories(DEFAULT_CATEGORIES);
        setBankCards(DEFAULT_BANK_CARDS);
        setWebhookUrl('');
        setActiveTab('list');
      } catch (error) {
        console.error("Logout error:", error);
        alert("登出失敗，請稍後再試。");
      }
    }
  };

  useEffect(() => {
    if (!user || !db) return;
    const loadSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'userConfig'));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.categories) setCategories(data.categories);
          if (data.webhookUrl) setWebhookUrl(data.webhookUrl); // 讀取 Webhook
          
          if (data.bankCards) {
             const migratedBanks = {};
             
             Object.keys(data.bankCards).forEach(bankName => {
               migratedBanks[bankName] = data.bankCards[bankName].map(card => {
                 const defaultCard = (DEFAULT_BANK_CARDS[bankName] || []).find(c => c.name === card.name);
                 let newRewards = card.rewards;
                 if (!newRewards || (Array.isArray(newRewards) && newRewards.length === 0 && card.rewardType && card.rewardType !== 'none')) {
                   newRewards = [];
                   if (card.rewardType === 'cashback') {
                     if (card.domesticRate) newRewards.push({ id: `r1_${Date.now()}`, name: '國內基本', type: 'cashback', rate: card.domesticRate, limit: card.domesticMax || null });
                     if (card.overseasRate) newRewards.push({ id: `r2_${Date.now()}`, name: '國外消費', type: 'cashback', rate: card.overseasRate, limit: card.overseasMax || null });
                     if (card.bonusRate) newRewards.push({ id: `r3_${Date.now()}`, name: '加碼', type: 'cashback', rate: card.bonusRate, limit: card.bonusMax || null });
                   } else if (card.rewardType === 'points') {
                     if (card.pointEarn) newRewards.push({ id: `p1_${Date.now()}`, name: '基本點數', type: 'points', spend: card.pointSpend || 1, earn: card.pointEarn, unit: card.pointName || '點', limit: card.pointMax || null });
                     if (card.pointBonusEarn) newRewards.push({ id: `p2_${Date.now()}`, name: '加碼點數', type: 'points', spend: card.pointSpend || 1, earn: card.pointBonusEarn, unit: card.pointName || '點', limit: card.pointBonusMax || null });
                   }

                   if (newRewards.length === 0 && defaultCard && defaultCard.rewards) {
                     newRewards = defaultCard.rewards;
                   }
                 }

                 return {
                   ...card,
                   rewards: newRewards,
                   iconName: card.iconName || defaultCard?.iconName || 'CreditCard',
                   color: card.color || defaultCard?.color || 'bg-gray-100 text-gray-600',
                   rewardCycle: card.rewardCycle || defaultCard?.rewardCycle || 'calendar',
                   limit: card.limit !== undefined ? card.limit : (defaultCard?.limit || null)
                 };
               });
             });

             Object.keys(DEFAULT_BANK_CARDS).forEach(defaultBank => {
               if (!migratedBanks[defaultBank]) {
                 migratedBanks[defaultBank] = DEFAULT_BANK_CARDS[defaultBank];
               } else {
                 DEFAULT_BANK_CARDS[defaultBank].forEach(defCard => {
                   if (!migratedBanks[defaultBank].find(c => c.name === defCard.name)) {
                     migratedBanks[defaultBank].push(defCard);
                   }
                 });
               }
             });

             setBankCards(migratedBanks);
          }
        }
        setSettingsLoaded(true);
      } catch (error) { console.error(error); setSettingsLoaded(true); }
    };
    loadSettings();

    const unsubscribe = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'expenses'), (snapshot) => {
      const data = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      
      data.sort((a, b) => {
        const dateDiff = new Date(b.date) - new Date(a.date);
        if (dateDiff !== 0) return dateDiff;
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      
      setExpenses(data);
    });
    return () => unsubscribe();
  }, [user]);

  const saveSettingsToCloud = async (newCategories, newBankCards) => {
    if (!user || !db) return;
    await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'userConfig'), 
      { categories: newCategories, bankCards: newBankCards, updatedAt: new Date().toISOString() }, { merge: true });
  };

  const { filteredExpenses, totalMonth, bankTotals, cardTotals, estimatedCashback, estimatedPoints, rewardLimitTracking, bankRewards } = useMemo(() => {
    // 1. 本月明細列表 (單純月曆月，供明細 Tab 使用)
    const filtered = expenses.filter(exp => exp.date.startsWith(currentMonth));
    let total = 0;
    filtered.forEach(exp => {
      total += parseFloat(exp.amount) || 0;
    });

    const [viewYear, viewMonth] = currentMonth.split('-').map(Number);
    
    const bnkTotals = {};
    const crdTotals = {};
    const tracking = [];
    let finalCashback = 0;
    const finalPoints = {};
    const bRewards = {};

    // 初始化各銀行的回饋統計
    Object.keys(bankCards).forEach(b => {
      bRewards[b] = { cashback: 0, points: {} };
    });

    // 2. 計算各卡片的「對帳單週期」與「預估回饋」
    Object.entries(bankCards).forEach(([bankName, cards]) => {
      cards.forEach(cardInfo => {
        
        // --- A. 對帳單週期計算 ---
        let billStartStr, billEndStr;
        if (cardInfo.billing !== '無') {
          const cycleInfo = getBillingCycleDates(viewYear, viewMonth, cardInfo.billing);
          if (cycleInfo) {
            billStartStr = cycleInfo.startStr;
            billEndStr = cycleInfo.endStr;
          } else {
            billStartStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-01`; 
            const lastDay = new Date(viewYear, viewMonth, 0).getDate();
            billEndStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${lastDay}`; 
          }
        } else {
          billStartStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-01`; 
          const lastDay = new Date(viewYear, viewMonth, 0).getDate();
          billEndStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${lastDay}`; 
        }

        // 結算該週期內的消費至對帳單
        expenses.forEach(exp => {
          if (exp.bank === bankName && exp.card === cardInfo.name && exp.date >= billStartStr && exp.date <= billEndStr) {
            const amt = parseFloat(exp.amount) || 0;
            bnkTotals[bankName] = (bnkTotals[bankName] || 0) + amt;
            crdTotals[cardInfo.name] = (crdTotals[cardInfo.name] || 0) + amt;
          }
        });

        // --- B. 回饋週期計算 ---
        if (!cardInfo.rewards || cardInfo.rewards.length === 0) return;

        let rewardStartStr, rewardEndStr, label;
        if (cardInfo.rewardCycle === 'billing' && cardInfo.billing !== '無') {
          const cycleInfo = getBillingCycleDates(viewYear, viewMonth, cardInfo.billing);
          if (cycleInfo) { 
            rewardStartStr = cycleInfo.startStr; 
            rewardEndStr = cycleInfo.endStr; 
            label = `結帳週期 (${cycleInfo.cycleLabel})`; 
          } else { 
            rewardStartStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-01`; 
            const lastDay = new Date(viewYear, viewMonth, 0).getDate();
            rewardEndStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${lastDay}`; 
            label = '月曆月'; 
          }
        } else {
          rewardStartStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-01`; 
          const lastDay = new Date(viewYear, viewMonth, 0).getDate();
          rewardEndStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${lastDay}`; 
          label = '月曆月';
        }

        // 依據規則統計回饋
        cardInfo.rewards.forEach(rule => {
          let cycleSpent = 0;
          expenses.forEach(exp => {
            if (exp.bank === bankName && exp.card === cardInfo.name && exp.date >= rewardStartStr && exp.date <= rewardEndStr) {
              if (exp.appliedRewards && exp.appliedRewards.includes(rule.id)) {
                cycleSpent += (parseFloat(exp.amount) || 0);
              }
            }
          });

          if (rule.limit) {
            tracking.push({ cardName: cardInfo.name, ruleName: rule.name, spent: cycleSpent, limit: rule.limit, cycleLabel: label });
          }

          let cappedSpent = rule.limit ? Math.min(cycleSpent, rule.limit) : cycleSpent;

          if (cappedSpent > 0) {
            if (rule.type === 'cashback') {
              const earnCash = cappedSpent * ((parseFloat(rule.rate) || 0) / 100);
              finalCashback += earnCash;
              bRewards[bankName].cashback += earnCash;
            } else if (rule.type === 'points') {
              let spendReq = parseFloat(rule.spend) || 1;
              let earnAmt = parseFloat(rule.earn) || 0;
              let earned = Math.floor(cappedSpent / spendReq) * earnAmt; // 確保單筆與週期加總的邏輯正確
              let unit = rule.unit || '點';
              finalPoints[unit] = (finalPoints[unit] || 0) + earned;
              
              if (!bRewards[bankName].points[unit]) bRewards[bankName].points[unit] = 0;
              bRewards[bankName].points[unit] += earned;
            }
          }
        });
      });
    });

    // 處理已被刪除或沒設定的卡片 (防呆：以月曆月加總)
    filtered.forEach(exp => {
      const cardInfo = (bankCards[exp.bank] || []).find(c => c.name === exp.card);
      if (!cardInfo) {
        const amt = parseFloat(exp.amount) || 0;
        bnkTotals[exp.bank] = (bnkTotals[exp.bank] || 0) + amt;
        crdTotals[exp.card] = (crdTotals[exp.card] || 0) + amt;
      }
    });

    return { 
      filteredExpenses: filtered, totalMonth: total, 
      bankTotals: Object.entries(bnkTotals).sort((a, b) => {
        if (a[0] === '現金') return -1;
        if (b[0] === '現金') return 1;
        const dayA = extractBillingDay(bankCards[a[0]]?.[0]?.billing);
        const dayB = extractBillingDay(bankCards[b[0]]?.[0]?.billing);
        if (dayA !== dayB) return dayA - dayB;
        return b[1] - a[1];
      }).filter(entry => entry[1] > 0 || (bankCards[entry[0]] && bankCards[entry[0]].length > 0)), 
      cardTotals: crdTotals,
      estimatedCashback: Math.round(finalCashback), estimatedPoints: Object.entries(finalPoints).map(([u, p]) => [u, Math.round(p)]),
      rewardLimitTracking: tracking.sort((a, b) => (b.spent / b.limit) - (a.spent / a.limit)),
      bankRewards: bRewards
    };
  }, [expenses, currentMonth, bankCards]);

  const handleAddCategory = () => {
    const newCat = { id: `cat-${Date.now()}`, name: '新分類', iconName: 'MoreHorizontal', color: COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)] };
    const updatedCategories = [...categories, newCat];
    setCategories(updatedCategories); saveSettingsToCloud(updatedCategories, bankCards); setEditingCategory(newCat.id);
  };
  const handleUpdateCategory = (id, field, value) => {
    const updatedCategories = categories.map(c => c.id === id ? { ...c, [field]: value } : c);
    setCategories(updatedCategories); saveSettingsToCloud(updatedCategories, bankCards);
  };
  const handleDeleteCategory = (id) => {
    if (categories.length <= 1) return;
    const updatedCategories = categories.filter(c => c.id !== id);
    setCategories(updatedCategories); saveSettingsToCloud(updatedCategories, bankCards);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };
    
    if (name === 'bank' && bankCards[value]) {
      const firstCard = bankCards[value][0];
      newFormData.card = firstCard?.name || ''; newFormData.billingDate = firstCard?.billing || '無';
      newFormData.appliedRewards = (firstCard?.rewards?.length > 0) ? [firstCard.rewards[0].id] : [];
    }
    if (name === 'card') {
      const cardInfo = bankCards[formData.bank]?.find(c => c.name === value);
      if (cardInfo) {
        newFormData.billingDate = cardInfo.billing;
        newFormData.appliedRewards = (cardInfo.rewards?.length > 0) ? [cardInfo.rewards[0].id] : [];
      }
    }
    setFormData(newFormData);
  };

  const toggleRewardRule = (ruleId) => {
    setFormData(prev => {
      const current = prev.appliedRewards || [];
      return {
        ...prev,
        appliedRewards: current.includes(ruleId) 
          ? current.filter(id => id !== ruleId) 
          : [...current, ruleId]
      };
    });
  };

  const openExpenseModal = (expenseToEdit = null) => {
    if (expenseToEdit) {
      setEditingExpenseId(expenseToEdit.id);
      setFormData({
        date: expenseToEdit.date || new Date().toISOString().slice(0, 10),
        category: expenseToEdit.category || '餐飲',
        amount: expenseToEdit.amount || '',
        description: expenseToEdit.description || '',
        bank: expenseToEdit.bank || '現金',
        card: expenseToEdit.card || '現金',
        billingDate: expenseToEdit.billingDate || '無',
        appliedRewards: expenseToEdit.appliedRewards || []
      });
    } else {
      setEditingExpenseId(null);
      setFormData(prev => ({
        ...prev,
        date: new Date().toISOString().slice(0, 10),
        amount: '',
        description: '',
      }));
    }
    setIsModalOpen(true);
  };

  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!user || !formData.amount || !formData.description) return;
    
    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        updatedAt: new Date().toISOString()
      };

      if (editingExpenseId) {
        const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'expenses', editingExpenseId);
        await updateDoc(docRef, expenseData);
      } else {
        expenseData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'expenses'), expenseData);
        
        // 🚀 新增：觸發自動化 Webhook 備份至 Google Sheets (背景發送，不阻擋畫面)
        if (webhookUrl && webhookUrl.trim().startsWith('http')) {
          try {
            // 將內部 ID 轉換為中文回饋名稱，讓 Google Sheets 顯示人類看得懂的文字
            const cardInfo = (bankCards[expenseData.bank] || []).find(c => c.name === expenseData.card);
            let rewardTexts = [];
            if (cardInfo && cardInfo.rewards && expenseData.appliedRewards) {
              cardInfo.rewards.forEach(r => {
                if (expenseData.appliedRewards.includes(r.id)) {
                  if (r.type === 'cashback') rewardTexts.push(`${r.name} ${r.rate}%`);
                  if (r.type === 'points') rewardTexts.push(`${r.name} ${r.earn}${r.unit}`);
                }
              });
            }

            // 【修改這裡】嚴格限制只送出乾淨的文字欄位，避免 Make.com 抓到系統內部 ID
            const payload = {
              date: expenseData.date,
              category: expenseData.category,
              description: expenseData.description,
              amount: expenseData.amount,
              bank: expenseData.bank,
              card: expenseData.card,
              billingDate: expenseData.billingDate,
              rewardDetails: rewardTexts.length > 0 ? rewardTexts.join('、') : '無'
            };

            fetch(webhookUrl.trim(), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            }).then(res => {
              if(!res.ok) console.warn("Webhook 回應狀態碼異常:", res.status);
            }).catch(err => {
              console.error('Webhook 網路錯誤 (可能為 CORS 或無網路):', err);
            });
          } catch (err) {
            console.error('Webhook 發送例外錯誤:', err);
          }
        }
      }
      
      setIsModalOpen(false);
      setEditingExpenseId(null);
    } catch (error) {
      console.error("Error saving expense: ", error);
    }
  };

  const executeDelete = async (id) => { 
    if (!user) return; 
    try {
        const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'expenses', id);
        await deleteDoc(docRef); 
        setExpenseToDelete(null); 
    } catch (error) {
        console.error("Error deleting document: ", error);
    }
  };

  const getCategoryStyle = (catName) => {
    const cat = categories.find(c => c.name === catName) || categories[categories.length - 1] || DEFAULT_CATEGORIES[6];
    return { Icon: ICON_MAP[cat.iconName] || MoreHorizontal, color: cat.color };
  };

  const openCardForm = (bankName, cardData, index) => {
    setEditingCardKey(index === -1 ? `new-${bankName}` : `${bankName}-${index}`);
    setCardForm({
      name: cardData?.name || '', billing: cardData?.billing || '無', limit: cardData?.limit || '',
      rewardCycle: cardData?.rewardCycle || 'calendar',
      rewards: cardData?.rewards || [],
      iconName: cardData?.iconName || 'CreditCard',
      color: cardData?.color || 'bg-gray-100 text-gray-600'
    });
  };

  const addRewardRuleToForm = (type) => {
    const newRule = type === 'cashback' 
      ? { id: `rule-${Date.now()}`, name: '', type: 'cashback', rate: '', limit: '' }
      : { id: `rule-${Date.now()}`, name: '', type: 'points', spend: '', earn: '', unit: '點', limit: '' };
    setCardForm(prev => ({ ...prev, rewards: [...prev.rewards, newRule] }));
  };

  const updateRewardRuleInForm = (idx, field, value) => {
    const newRewards = [...cardForm.rewards];
    newRewards[idx][field] = value;
    setCardForm(prev => ({ ...prev, rewards: newRewards }));
  };

  const removeRewardRuleFromForm = (idx) => {
    const newRewards = [...cardForm.rewards];
    newRewards.splice(idx, 1);
    setCardForm(prev => ({ ...prev, rewards: newRewards }));
  };

  const saveCardForm = (bankName, index) => {
    if (!cardForm.name.trim()) return;
    const valOrNull = (val) => val ? parseFloat(val) : null;
    
    const cleanRewards = cardForm.rewards.map(r => ({
      id: r.id, name: r.name.trim() || '未命名', type: r.type, limit: valOrNull(r.limit),
      ...(r.type === 'cashback' ? { rate: valOrNull(r.rate) || 0 } : { spend: valOrNull(r.spend) || 1, earn: valOrNull(r.earn) || 0, unit: (r.unit || '').trim() || '點' })
    }));

    const cardData = { 
      name: cardForm.name.trim(), billing: (cardForm.billing || '').trim() || '無', 
      limit: valOrNull(cardForm.limit), rewardCycle: cardForm.rewardCycle, rewards: cleanRewards,
      iconName: cardForm.iconName || 'CreditCard', color: cardForm.color || 'bg-gray-100 text-gray-600'
    };

    const updated = { ...bankCards };
    if (!updated[bankName]) updated[bankName] = [];
    if (index === -1) updated[bankName].push(cardData); else updated[bankName][index] = cardData;
    setBankCards(updated); saveSettingsToCloud(categories, updated); setEditingCardKey(null);
  };

  const handleJumpToCurrentMonth = () => {
    const today = new Date();
    setCurrentMonth(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);
  };

  const handlePickerSave = (selectedIcon, selectedColor) => {
    if (pickerConfig.type === 'category') {
      const newCats = categories.map(c => c.id === pickerConfig.id ? { ...c, iconName: selectedIcon, color: selectedColor } : c);
      setCategories(newCats);
      saveSettingsToCloud(newCats, bankCards);
    } else if (pickerConfig.type === 'cardForm') {
      setCardForm({ ...cardForm, iconName: selectedIcon, color: selectedColor });
    }
    setPickerConfig(null);
  };

  const handleExportCSV = () => {
    const headers = ['日期', '分類', '項目說明', '金額', '銀行', '卡別', '結帳日', '回饋項目'];
    const csvContent = [
      headers.join(','),
      ...expenses.map(e => {
        let rTexts = [];
        const cInfo = (bankCards[e.bank] || []).find(c => c.name === e.card);
        if (cInfo && cInfo.rewards && e.appliedRewards) {
          cInfo.rewards.forEach(r => {
            if (e.appliedRewards.includes(r.id)) {
              rTexts.push(r.type === 'cashback' ? `${r.name} ${r.rate}%` : `${r.name} ${r.earn}${r.unit}`);
            }
          });
        }
        return [
          e.date,
          e.category,
          `"${(e.description || '').replace(/"/g, '""')}"`,
          e.amount,
          e.bank,
          e.card,
          e.billingDate,
          `"${rTexts.join('、')}"`
        ].join(',')
      })
    ].join('\n');

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' }); 
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `記帳資料_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = async (event) => {
    const file = event.target.files[0];
    if (!file || !user) return;
    setImportStatus('匯入中...');

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const rows = text.split('\n').filter(row => row.trim() !== '');
      
      if (rows.length <= 1) {
        setImportStatus('檔案中沒有資料行！');
        return;
      }

      let successCount = 0;
      let errorCount = 0;
      let skippedCount = 0; // 新增：重複略過計數

      // 建立現有資料的「特徵指紋」，防止重複匯入相同的紀錄
      const existingSignatures = new Set(
        expenses.map(exp => `${exp.date}-${exp.category}-${exp.description}-${exp.amount}-${exp.bank}-${exp.card}`)
      );

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.replace(/^"|"$/g, '').trim());

        if (cols.length >= 4) {
          const dateStr = cols[0];
          const amount = parseFloat(cols[3]);
          
          let parsedDate = new Date();
          if (dateStr.includes('/')) {
             const parts = dateStr.split('/');
             if(parts[0].length === 4) parsedDate = new Date(parts[0], parts[1]-1, parts[2]);
             else if (parts.length === 2) parsedDate = new Date(new Date().getFullYear(), parts[0]-1, parts[1]);
          } else if (dateStr.includes('-')) {
             parsedDate = new Date(dateStr);
          }

          if (!isNaN(amount) && amount > 0) {
            const dateFmt = parsedDate.toISOString().slice(0, 10);
            const categoryFmt = cols[1] || '其他';
            const descFmt = cols[2] || '未命名項目';
            const bankFmt = cols[4] || '現金';
            const cardFmt = cols[5] || '現金';
            
            const signature = `${dateFmt}-${categoryFmt}-${descFmt}-${amount}-${bankFmt}-${cardFmt}`;

            if (existingSignatures.has(signature)) {
              skippedCount++;
              continue; // 發現特徵完全相同的紀錄，略過不匯入
            }

            try {
              const expenseData = {
                date: dateFmt,
                category: categoryFmt,
                description: descFmt,
                amount: amount,
                bank: bankFmt,
                card: cardFmt,
                billingDate: cols[6] || '無',
                appliedRewards: [], 
                createdAt: new Date().toISOString()
              };
              await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'expenses'), expenseData);
              existingSignatures.add(signature); // 把剛新增的指紋也加入，防止 CSV 內部自己就有重複
              successCount++;
            } catch (err) {
              console.error('Error importing row:', row, err);
              errorCount++;
            }
          } else {
             errorCount++;
          }
        } else {
           errorCount++;
        }
      }
      setImportStatus(`匯入完成！新增：${successCount}，重複略過：${skippedCount}，失敗：${errorCount}。`);
      if(fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  if (isLoading && !user) {
    return (
      <div className="w-full min-h-[100dvh] flex items-center justify-center bg-gray-50 text-emerald-600 relative">
        <GlobalStyles />
        <Loader2 className="animate-spin mr-2" size={20} /> 載入中...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full min-h-[100dvh] bg-gray-200 flex justify-center items-center font-sans p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
        <GlobalStyles />
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">雲端記帳小幫手</h1>
            <p className="text-sm text-gray-500 mt-2">Create by Cy</p>
          </div>

          {authError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center border border-red-200">
              {authError}
            </div>
          )}

          <form onSubmit={(e) => handleAuthSubmit(e, false)} className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">電子郵件 Email</label>
              <input 
                type="email" 
                value={authEmail} 
                onChange={(e) => setAuthEmail(e.target.value)} 
                required 
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">密碼 Password</label>
              <input 
                type="password" 
                value={authPassword} 
                onChange={(e) => setAuthPassword(e.target.value)} 
                required 
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition"
                placeholder="請輸入至少6位數密碼"
              />
            </div>
            
            <div className="flex gap-2 pt-2">
               <button type="button" onClick={(e) => handleAuthSubmit(e, false)} disabled={!authEmail || !authPassword} className="flex-1 bg-indigo-100 text-indigo-700 py-3 rounded-xl text-sm font-bold hover:bg-indigo-200 transition disabled:opacity-50">登入帳號</button>
               <button type="button" onClick={(e) => handleAuthSubmit(e, true)} disabled={!authEmail || !authPassword} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-50">註冊並綁定</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (isLoading || !settingsLoaded) {
    return (
      <div className="w-full h-[100dvh] flex items-center justify-center bg-gray-50 text-emerald-600 relative overflow-x-hidden">
        <GlobalStyles />
        <Loader2 className="animate-spin mr-2" size={20} /> 讀取資料中...
      </div>
    );
  }

  return (
    <div className="w-full h-[100dvh] bg-gray-200 flex justify-center font-sans overflow-hidden">
      <GlobalStyles />
      <div className="w-full max-w-md bg-gray-50 relative flex flex-col h-full shadow-2xl overflow-hidden">
        
        {/* Header */}
        {activeTab !== 'settings' && (
          <header className="bg-emerald-600 text-white pt-[max(1.5rem,env(safe-area-inset-top))] pb-4 px-6 rounded-b-3xl shadow-md z-10 shrink-0">
            <div className="flex items-center justify-between bg-emerald-700/50 rounded-2xl p-1 mb-6 mt-2">
              <button onClick={() => { const [y, m] = currentMonth.split('-').map(Number); setCurrentMonth(`${new Date(y, m - 2, 1).getFullYear()}-${String(new Date(y, m - 2, 1).getMonth() + 1).padStart(2, '0')}`); }} className="p-2 hover:bg-emerald-800 rounded-xl transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
              <div 
                className="font-semibold text-lg flex items-center gap-2 cursor-pointer hover:text-emerald-200 transition"
                onClick={handleJumpToCurrentMonth}
                title="回到本月"
              >
                <Calendar size={18} />{currentMonth.replace('-', '年')}月
              </div>
              <button onClick={() => { const [y, m] = currentMonth.split('-').map(Number); setCurrentMonth(`${new Date(y, m, 1).getFullYear()}-${String(new Date(y, m, 1).getMonth() + 1).padStart(2, '0')}`); }} className="p-2 hover:bg-emerald-800 rounded-xl transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
            </div>
            <div className="text-center">
              <p className="text-emerald-100 text-sm mb-1">本月總支出</p>
              <p className="text-4xl font-bold font-mono"><span className="text-xl mr-1">$</span>{totalMonth.toLocaleString()}</p>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-y-auto overflow-x-hidden w-full p-4 custom-scrollbar pb-[calc(6rem+env(safe-area-inset-bottom))]">
          
          {/* == 明細頁 == */}
          {activeTab === 'list' && (
            <div className="space-y-3">
              {filteredExpenses.length === 0 ? (
                <div className="text-center text-gray-400 mt-20 flex flex-col items-center">
                  <List size={48} className="mb-4 opacity-50" />
                  <p>這個月還沒有任何紀錄喔！</p>
                </div>
              ) : (
                filteredExpenses.map(expense => {
                  const { Icon, color } = getCategoryStyle(expense.category);
                  const cardInfo = (bankCards[expense.bank] || []).find(c => c.name === expense.card);
                  
                  const appliedBadges = [];
                  if (cardInfo && cardInfo.rewards && expense.appliedRewards) {
                     cardInfo.rewards.forEach(r => {
                        if ((expense.appliedRewards || []).includes(r.id)) {
                           if (r.type === 'cashback') appliedBadges.push(`${r.name} ${r.rate}%`);
                           if (r.type === 'points') appliedBadges.push(`${r.name} ${r.earn}${r.unit}`);
                        }
                     });
                  }

                  const CardIcon = ICON_MAP[cardInfo?.iconName] || CreditCard;
                  const cardTextColor = cardInfo?.color?.split(' ').find(c => c.startsWith('text-')) || 'text-gray-500';

                  return (
                    <div 
                      key={expense.id} 
                      className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 group transition hover:border-emerald-300 relative"
                    >
                      <div className="flex flex-col items-center justify-center shrink-0 w-12 bg-gray-50 h-12 rounded-xl">
                        <span className="text-gray-400 text-[10px] uppercase font-bold leading-none">{expense.date.substring(5, 7)}月</span>
                        <span className="text-emerald-700 text-xl font-black leading-tight mt-0.5">{expense.date.substring(8, 10)}</span>
                      </div>

                      <div className="w-[1px] h-10 bg-gray-100 shrink-0"></div>

                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${color}`}><Icon size={20} /></div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="font-bold text-gray-800 truncate leading-snug">{expense.description}</p>
                        <div className="flex flex-col gap-1 mt-0.5">
                          <span className="text-[11px] font-medium text-gray-600 flex items-center gap-1">
                            <CardIcon size={12} className={cardTextColor} />
                            <span className="truncate max-w-[120px]">{expense.bank}({expense.card})</span>
                          </span>
                          
                          {appliedBadges.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {appliedBadges.map((badge, idx) => (
                                 <span key={idx} className="bg-orange-100 text-orange-700 px-1.5 py-[1px] rounded text-[9px] whitespace-nowrap font-semibold">
                                   {badge}
                                 </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1 shrink-0 ml-1">
                        <span className="font-bold text-lg text-gray-800 font-mono">-${expense.amount}</span>
                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition absolute right-3 bottom-2 md:relative md:right-auto md:bottom-auto md:mt-2">
                           <button type="button" onPointerDown={() => openExpenseModal(expense)} className="text-gray-400 hover:text-emerald-600 p-1 bg-white border border-gray-200 rounded-full shadow-sm z-10 cursor-pointer"><Edit2 size={12} /></button>
                           <button type="button" onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setExpenseToDelete(expense); }} className="text-red-400 hover:text-red-600 p-1 bg-white border border-gray-200 rounded-full shadow-sm z-10 cursor-pointer"><Trash2 size={12} /></button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* == 報表頁 == */}
          {activeTab === 'report' && (
            <div className="space-y-6">

              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-gray-500 font-semibold mb-4 flex items-center gap-2"><AlertCircle size={18} />各卡額度與回饋狀態</h3>
                <div className="space-y-5">
                  {(() => {
                    const cardsToTrack = Object.values(bankCards).flat().filter(card => {
                      const hasCreditLimit = card.limit !== null;
                      const hasRewardLimit = rewardLimitTracking.some(t => t.cardName === card.name);
                      return hasCreditLimit || hasRewardLimit;
                    }).sort((a, b) => extractBillingDay(a.billing) - extractBillingDay(b.billing));

                    if (cardsToTrack.length === 0) {
                      return <p className="text-sm text-gray-400 text-center py-2">尚無需要追蹤的額度或回饋</p>;
                    }

                    const usedCards = [];
                    const unusedCards = [];

                    cardsToTrack.forEach(card => {
                      const cardTracking = rewardLimitTracking.filter(t => t.cardName === card.name);
                      const usedAmount = cardTotals[card.name] || 0;
                      const hasTrackingSpent = cardTracking.some(t => t.spent > 0);
                      
                      if (usedAmount > 0 || hasTrackingSpent) {
                        usedCards.push(card);
                      } else {
                        unusedCards.push(card);
                      }
                    });

                    const renderCard = (card) => {
                      const cardTracking = rewardLimitTracking.filter(t => t.cardName === card.name);
                      const hasCreditLimit = card.limit !== null;
                      const usedAmount = cardTotals[card.name] || 0;
                      const CardIcon = ICON_MAP[card.iconName] || CreditCard;
                      const cColor = card.color || 'bg-gray-100 text-gray-600';

                      return (
                        <div key={card.name} className="flex flex-col gap-3 border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${cColor}`}><CardIcon size={14}/></div>
                            <div className="flex-1 space-y-2">
                              <span className="font-bold text-gray-800 text-sm block">
                                {card.name}
                                {card.billing && card.billing !== '無' && <span className="text-[10px] text-gray-400 ml-2 font-normal">結帳日: {card.billing}</span>}
                              </span>
                              
                              {hasCreditLimit && (
                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                  <div className="flex justify-between items-end mb-1.5">
                                    <span className="text-[11px] font-bold text-gray-600 flex items-center gap-1">💳 總信用額度</span>
                                    <span className={`font-mono text-xs ${card.limit - usedAmount < 0 ? 'text-red-500' : 'text-emerald-600 font-bold'}`}>
                                      剩餘 ${(card.limit - usedAmount).toLocaleString()} <span className="text-gray-400 font-normal text-[10px]">/ {card.limit.toLocaleString()}</span>
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                    <div className={`h-1.5 rounded-full transition-all ${card.limit - usedAmount < 0 ? 'bg-red-500' : ((usedAmount/card.limit) > 0.8 ? 'bg-orange-400' : 'bg-emerald-400')}`} style={{ width: `${Math.min(100, (usedAmount / card.limit) * 100)}%` }}></div>
                                  </div>
                                </div>
                              )}

                              {cardTracking.length > 0 && (
                                <div className="space-y-2">
                                  {cardTracking.map((track, idx) => {
                                    const remaining = Math.max(0, track.limit - track.spent);
                                    const percentage = Math.min(100, Math.round((track.spent / track.limit) * 100)) || 0;
                                    const isMaxedOut = track.spent >= track.limit;
                                    return (
                                      <div key={idx} className="bg-orange-50/60 rounded-xl p-3 border border-orange-100/50">
                                        <div className="flex justify-between items-end mb-1.5">
                                          <div>
                                            <span className="font-bold text-orange-800 block text-[11px]">🎁 {track.ruleName}</span>
                                            <span className="text-[9px] text-orange-500/80">{track.cycleLabel}</span>
                                          </div>
                                          <span className={`font-mono text-xs ${isMaxedOut ? 'text-red-500 font-bold' : 'text-orange-600 font-bold'}`}>
                                            可刷剩餘 ${remaining.toLocaleString()} <span className="text-orange-400/70 font-normal text-[10px]">/ {track.limit.toLocaleString()}</span>
                                          </span>
                                        </div>
                                        <div className="w-full bg-orange-200/50 rounded-full h-1.5 relative overflow-hidden">
                                          <div className={`h-1.5 rounded-full absolute top-0 left-0 transition-all ${isMaxedOut ? 'bg-red-400' : 'bg-orange-400'}`} style={{ width: `${percentage}%` }}></div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    };

                    return (
                      <>
                        {usedCards.length === 0 && <p className="text-sm text-gray-400 text-center py-2">本月尚無刷卡紀錄</p>}
                        {usedCards.map(renderCard)}
                        
                        {unusedCards.length > 0 && (
                          <div className="mt-2 pt-2">
                            <button 
                              onClick={() => setShowUnusedCards(!showUnusedCards)}
                              className="w-full text-center text-gray-400 text-xs py-2 hover:bg-gray-50 rounded-xl transition flex items-center justify-center gap-1 border border-dashed border-gray-200"
                            >
                              {showUnusedCards ? '▲ 隱藏未刷卡片' : `▼ 展開未刷卡片 (${unusedCards.length})`}
                            </button>
                            {showUnusedCards && (
                              <div className="mt-4 space-y-5 opacity-75 transition-all">
                                {unusedCards.map(renderCard)}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-gray-500 font-semibold mb-4 flex items-center gap-2"><CreditCard size={18} />各家銀行卡費總計 (對帳單)</h3>
                <div className="space-y-3">
                  {bankTotals.length === 0 && <p className="text-sm text-gray-400 text-center">尚無資料</p>}
                  {bankTotals.map(([bankName, amount]) => {
                    const firstCard = bankCards[bankName]?.[0];
                    const BankIcon = ICON_MAP[firstCard?.iconName] || CreditCard;
                    const bColor = firstCard?.color || 'bg-gray-100 text-gray-600';
                    const rewards = bankRewards[bankName]; // 抓取該銀行產生的回饋
                    
                    return (
                      <div key={bankName} className="flex flex-col p-3 bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 transition">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bColor}`}><BankIcon size={14} /></div>
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-700">{bankName}</span>
                              {firstCard?.billing && firstCard.billing !== '無' && (
                                <span className="text-[10px] text-gray-400">結帳日: {firstCard.billing}</span>
                              )}
                            </div>
                          </div>
                          <span className="font-mono font-bold text-gray-800 text-lg">${amount.toLocaleString()}</span>
                        </div>
                        
                        {/* 若該銀行有產生回饋，顯示在對帳金額下方 */}
                        {rewards && (rewards.cashback > 0 || Object.keys(rewards.points).length > 0) && (
                          <div className="flex flex-wrap items-center gap-2 pt-2 mt-2 border-t border-gray-200/60">
                            <span className="text-[11px] font-bold text-yellow-600 flex items-center gap-1"><Gift size={12} />本期預估賺取:</span>
                            {rewards.cashback > 0 && (
                              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100/50 px-1.5 py-0.5 rounded shadow-sm">
                                ${Math.round(rewards.cashback)} 現金回饋
                              </span>
                            )}
                            {Object.entries(rewards.points).map(([unit, pts]) => (
                              <span key={unit} className="text-[11px] font-bold text-indigo-600 bg-indigo-100/50 px-1.5 py-0.5 rounded shadow-sm">
                                {pts} {unit}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>
          )}

          {/* == 設定頁 == */}
          {activeTab === 'settings' && (
            <div className="space-y-6 pt-[max(2rem,calc(1rem+env(safe-area-inset-top)))] px-2">
              <div className="flex justify-between items-center px-2">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Settings size={28} className="text-emerald-600" /> 系統設定</h2>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2.5 py-1 rounded-full shadow-sm border border-emerald-200 tracking-wider">v1.0.8 (防跑版)</span>
              </div>

              {/* === 帳號與雲端同步區塊 === */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-gray-700 font-bold flex items-center gap-2 mb-4"><UserCircle size={18} className="text-indigo-500" />帳號與雲端同步</h3>
                
                {user && !user.isAnonymous ? (
                   <div className="flex flex-col gap-3">
                     <div className="bg-indigo-50 text-indigo-800 p-3 rounded-xl text-sm border border-indigo-100">
                        目前登入帳號：<br/><span className="font-bold text-base">{user.email}</span>
                     </div>
                     
                     <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs mt-1">
                       <p className="text-gray-700 font-bold mb-1 flex items-center gap-1"><Zap size={14} className="text-yellow-500" /> 自動化備份至 Google Sheets (Webhook)</p>
                       <p className="text-[10px] text-gray-500 mb-2 leading-relaxed">請將 Make.com 或 Zapier 的 Webhook 網址貼在下方，新增支出時將會自動拋送資料給系統。</p>
                       <p className="text-[10px] text-emerald-600 mb-2 font-bold">💡 測試前，請先在 Make.com 點擊左下角的「Run once (執行一次)」進入監聽狀態。</p>
                       <div className="flex gap-2">
                         <input 
                           type="url" 
                           placeholder="https://hook.us1.make.com/..." 
                           value={webhookUrl}
                           onChange={(e) => {
                             setWebhookUrl(e.target.value);
                             setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'userConfig'), { webhookUrl: e.target.value }, { merge: true });
                           }}
                           className="w-full border border-gray-300 rounded px-2 py-2 text-sm outline-none focus:border-emerald-500 focus:bg-white transition bg-gray-50"
                         />
                         <button 
                           disabled={isTestingWebhook}
                           onClick={async () => {
                             if (!webhookUrl || !webhookUrl.trim().startsWith('http')) return alert("請先輸入有效的 Webhook 網址 (需包含 https://)");
                             setIsTestingWebhook(true);
                             try {
                               const res = await fetch(webhookUrl.trim(), { 
                                 method: 'POST', 
                                 headers: {'Content-Type': 'application/json'}, 
                                 body: JSON.stringify({ 
                                   date: new Date().toISOString().slice(0, 10), 
                                   amount: 100, 
                                   description: "Webhook 測試成功！", 
                                   category: "測試", 
                                   bank: "測試銀行", 
                                   card: "測試卡片",
                                   rewardDetails: "國內基本 1%、滿額送 10點" // 測試用回饋字串
                                 }) 
                               });
                               if (res.ok) alert("🚀 測試發送成功！請回 Make.com 查看是否有收到資料。");
                               else alert("發送失敗，狀態碼: " + res.status + "\n請確認網址正確，且 Make.com 正在「監聽」中。");
                             } catch (e) { alert("網路發送錯誤！請確認網址是否正確。\n錯誤訊息: " + e.message); }
                             finally { setIsTestingWebhook(false); }
                           }} 
                           className="bg-emerald-100 text-emerald-700 px-3 rounded text-xs font-bold hover:bg-emerald-200 whitespace-nowrap transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                           {isTestingWebhook ? '發送中...' : '測試發送'}
                         </button>
                       </div>
                     </div>

                     <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 px-3 py-3 rounded-xl text-sm font-bold transition border border-red-200 mt-2">
                       <LogOut size={18} /> 登出並切換至訪客模式
                     </button>
                   </div>
                ) : (
                   <div className="space-y-3">
                     <p className="text-xs text-gray-500 mb-2 leading-relaxed">您目前使用的是<strong className="text-gray-700">「免登入訪客模式」</strong>。<br/>若想在其他手機或電腦同步這些資料，請登入您的專屬帳號。</p>
                     
                     {authError && <div className="text-red-600 text-xs bg-red-50 p-2 rounded-lg border border-red-100">{authError}</div>}
                     
                     <div className="space-y-2">
                       <input type="email" placeholder="輸入 Email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500 transition"/>
                       <input type="password" placeholder="輸入密碼 (至少6位數)" value={authPassword} onChange={e=>setAuthPassword(e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500 transition"/>
                     </div>
                     
                     <div className="flex gap-2 pt-1">
                        <button onClick={(e) => handleAuthSubmit(e, false)} disabled={!authEmail || !authPassword} className="flex-1 bg-indigo-100 text-indigo-700 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-200 transition disabled:opacity-50">登入帳號</button>
                        <button onClick={(e) => handleAuthSubmit(e, true)} disabled={!authEmail || !authPassword} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-50">註冊並綁定</button>
                     </div>
                   </div>
                )}
              </div>

              {/* === 資料匯入匯出區塊 === */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                 <h3 className="text-gray-700 font-bold flex items-center gap-2 mb-4"><List size={18} className="text-blue-500" />資料匯入與備份</h3>
                 
                 <div className="grid grid-cols-2 gap-3 mb-3">
                    <button 
                       onClick={handleExportCSV} 
                       className="flex flex-col items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition border border-blue-200"
                    >
                       <Download size={20} />
                       <span className="font-bold text-sm">匯出 CSV 備份</span>
                    </button>
                    
                    <label className="flex flex-col items-center justify-center gap-2 p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition border border-emerald-200 cursor-pointer">
                       <Upload size={20} />
                       <span className="font-bold text-sm">從 CSV 匯入</span>
                       <input 
                         type="file" 
                         accept=".csv" 
                         ref={fileInputRef}
                         onChange={handleImportCSV} 
                         className="hidden" 
                       />
                    </label>
                 </div>
                 {importStatus && (
                    <div className={`mt-3 p-3 rounded-lg text-sm text-center font-bold shadow-inner ${importStatus.includes('成功') ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-orange-100 text-orange-800'}`}>
                       {importStatus}
                    </div>
                 )}
                 <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
                   💡 匯入提示：CSV 檔案標題列需包含：日期、分類、項目說明、金額、銀行、卡別、結帳日。您可以先「匯出備份」來查看正確的格式範例。
                 </p>
              </div>

              {/* 支出分類設定 */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-gray-700 font-bold flex items-center gap-2"><PieChart size={18} className="text-emerald-500" />支出分類管理</h3>
                  <button onClick={handleAddCategory} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded-full"><Plus size={20}/></button>
                </div>
                <div className="space-y-3">
                  {categories.map((cat) => {
                    const IconComponent = ICON_MAP[cat.iconName] || MoreHorizontal;
                    const isEditing = editingCategory === cat.id;
                    return (
                      <div key={cat.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-transparent hover:border-gray-200">
                        {isEditing ? (
                          <button type="button" onClick={() => setPickerConfig({ type: 'category', id: cat.id, iconName: cat.iconName, color: cat.color })} className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-dashed border-gray-400 hover:scale-105 transition ${cat.color}`} title="點擊更換圖示與顏色">
                             <IconComponent size={20} />
                          </button>
                        ) : (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${cat.color}`}><IconComponent size={20} /></div>
                        )}
                        
                        {isEditing ? (
                          <div className="flex-1 flex gap-2 items-center">
                            <input type="text" value={cat.name ?? ''} onChange={(e) => handleUpdateCategory(cat.id, 'name', e.target.value)} className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500 font-bold"/>
                            <button onClick={() => setEditingCategory(null)} className="text-emerald-600 p-1 bg-emerald-50 rounded-lg"><Check size={18}/></button>
                          </div>
                        ) : (<div className="flex-1 font-bold text-gray-700">{cat.name}</div>)}
                        
                        {!isEditing && (
                          <div className="flex gap-1">
                            <button onClick={() => setEditingCategory(cat.id)} className="text-gray-400 hover:text-emerald-600 p-1"><Edit2 size={16}/></button>
                            <button onClick={() => handleDeleteCategory(cat.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 信用卡與動態回饋管理 */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                <div className="mb-4">
                  <h3 className="text-gray-700 font-bold flex items-center gap-2 mb-2"><CreditCard size={18} className="text-emerald-500" />銀行與回饋管理</h3>
                  <div className="flex gap-2 mb-4">
                    <input type="text" placeholder="新增銀行 (例: 渣打)" value={newBankName ?? ''} onChange={(e) => setNewBankName(e.target.value)} className="flex-1 min-w-0 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"/>
                    <button onClick={() => {if(newBankName.trim() && !bankCards[newBankName.trim()]){ setBankCards({...bankCards, [newBankName.trim()]: []}); setNewBankName(''); }}} className="bg-emerald-100 text-emerald-700 px-3 rounded-xl hover:bg-emerald-200 font-medium shrink-0">新增</button>
                    {/* 加入一鍵還原預設的終極按鈕 */}
                    <button onClick={() => {if(window.confirm('確定要還原為系統最新預設的銀行與回饋嗎？(這會覆蓋掉您目前自訂的卡片)')){ setBankCards(DEFAULT_BANK_CARDS); saveSettingsToCloud(categories, DEFAULT_BANK_CARDS); }}} className="bg-red-50 text-red-600 px-3 rounded-xl hover:bg-red-100 font-medium whitespace-nowrap shrink-0" title="如果您的卡片設定跑掉，可以點此重置">還原預設</button>
                  </div>
                </div>

                <div className="space-y-4">
                  {sortedBankNames.map(bankName => {
                    const cards = bankCards[bankName];
                    return (
                    <div key={bankName} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                      <div className="bg-gray-50 p-3 flex justify-between items-center border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition" onClick={() => setEditingBank(editingBank === bankName ? null : bankName)}>
                        <span className="font-bold text-gray-700 flex items-center gap-2">
                           <div className={`w-6 h-6 rounded-full flex items-center justify-center ${cards[0]?.color || 'bg-gray-200 text-gray-600'}`}>{React.createElement(ICON_MAP[cards[0]?.iconName] || Landmark, { size: 12 })}</div>
                           {bankName}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{cards.length} 張卡</span>
                          <button onClick={(e) => { e.stopPropagation(); if(window.confirm('確定刪除此銀行？')){const nb = {...bankCards}; delete nb[bankName]; setBankCards(nb); saveSettingsToCloud(categories, nb);}}} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                        </div>
                      </div>
                      
                      {editingBank === bankName && (
                        <div className="p-3 bg-white space-y-3">
                          {cards.map((card, idx) => {
                            const CardIcon = ICON_MAP[card.iconName] || CreditCard;
                            return (
                            <div key={idx}>
                              {editingCardKey === `${bankName}-${idx}` ? (
                                <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3 relative">
                                  <button onClick={() => setEditingCardKey(null)} className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"><X size={18}/></button>
                                  <p className="text-xs font-bold text-emerald-700 mb-2 flex items-center gap-1"><Edit2 size={14}/> 編輯卡片設定</p>
                                  
                                  <div className="flex items-center gap-2 mb-2">
                                     <button type="button" onClick={() => setPickerConfig({ type: 'cardForm', iconName: cardForm.iconName, color: cardForm.color })} className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-dashed border-gray-400 hover:scale-105 transition ${cardForm.color || 'bg-gray-100 text-gray-600'}`} title="點擊更換卡片圖示">
                                        {React.createElement(ICON_MAP[cardForm.iconName] || CreditCard, { size: 24 })}
                                     </button>
                                     <input type="text" placeholder="卡片名稱 (必填)" value={cardForm.name ?? ''} onChange={(e) => setCardForm({...cardForm, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[16px] font-bold flex-1"/>
                                  </div>

                                  <div className="flex gap-2">
                                    <input type="text" placeholder="結帳日 (例: 每月12日)" value={cardForm.billing ?? ''} onChange={(e) => setCardForm({...cardForm, billing: e.target.value})} className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-[16px]"/>
                                    <input type="number" placeholder="信用額度" value={cardForm.limit ?? ''} onChange={(e) => setCardForm({...cardForm, limit: e.target.value})} className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-[16px]"/>
                                  </div>
                                  
                                  <hr className="border-emerald-200 my-2" />
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-bold text-emerald-700 flex items-center gap-1"><Gift size={14}/> 回饋清單 (支援多筆疊加)</p>
                                    <select value={cardForm.rewardCycle ?? 'calendar'} onChange={(e) => setCardForm({...cardForm, rewardCycle: e.target.value})} className="border border-emerald-300 bg-white rounded text-xs px-2 py-1 outline-none text-emerald-800">
                                      <option value="calendar">依月曆月結算</option><option value="billing">依結帳週期結算</option>
                                    </select>
                                  </div>

                                  <div className="space-y-2">
                                    {cardForm.rewards.map((rule, rIdx) => (
                                      <div key={rIdx} className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                          <input type="text" placeholder="回饋名稱 (例: 國內一般 / 網購加碼)" value={rule.name ?? ''} onChange={(e) => updateRewardRuleInForm(rIdx, 'name', e.target.value)} className="font-bold text-sm text-gray-800 border-b border-gray-200 outline-none w-2/3 pb-1"/>
                                          <button onClick={() => removeRewardRuleFromForm(rIdx)} className="text-red-400 hover:text-red-600"><X size={16}/></button>
                                        </div>
                                        
                                        {rule.type === 'cashback' ? (
                                          <div className="flex gap-2">
                                            <div className="flex items-center border border-gray-200 rounded px-2 w-1/2">
                                              <span className="text-xs text-gray-500 mr-1">回饋</span>
                                              <input type="number" step="0.01" placeholder="比例" value={rule.rate ?? ''} onChange={(e) => updateRewardRuleInForm(rIdx, 'rate', e.target.value)} className="w-full text-right text-sm py-1 outline-none font-mono"/>
                                              <span className="text-gray-500 text-xs ml-1">%</span>
                                            </div>
                                            <div className="flex items-center border border-gray-200 rounded px-2 w-1/2">
                                              <span className="text-xs text-gray-500 mr-1">上限$</span>
                                              <input type="number" placeholder="無上限" value={rule.limit ?? ''} onChange={(e) => updateRewardRuleInForm(rIdx, 'limit', e.target.value)} className="w-full text-right text-sm py-1 outline-none font-mono"/>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                              每滿$ <input type="number" value={rule.spend ?? ''} onChange={(e) => updateRewardRuleInForm(rIdx, 'spend', e.target.value)} className="w-12 border-b border-gray-300 text-center outline-none font-bold text-indigo-600"/>
                                              送 <input type="number" value={rule.earn ?? ''} onChange={(e) => updateRewardRuleInForm(rIdx, 'earn', e.target.value)} className="w-12 border-b border-gray-300 text-center outline-none font-bold text-indigo-600"/>
                                              <input type="text" placeholder="點數單位" value={rule.unit ?? ''} onChange={(e) => updateRewardRuleInForm(rIdx, 'unit', e.target.value)} className="flex-1 border-b border-gray-300 px-1 outline-none"/>
                                            </div>
                                            <div className="flex items-center border border-gray-200 rounded px-2 w-full">
                                              <span className="text-xs text-gray-500 mr-1">可刷上限$</span>
                                              <input type="number" placeholder="無上限" value={rule.limit ?? ''} onChange={(e) => updateRewardRuleInForm(rIdx, 'limit', e.target.value)} className="w-full text-right text-sm py-1 outline-none font-mono"/>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>

                                  <div className="flex gap-2 mt-2">
                                    <button onClick={() => addRewardRuleToForm('cashback')} className="flex-1 border border-dashed border-emerald-400 text-emerald-700 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-100">+ 現金回饋</button>
                                    <button onClick={() => addRewardRuleToForm('points')} className="flex-1 border border-dashed border-indigo-400 text-indigo-700 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-100">+ 紅利點數</button>
                                  </div>

                                  <button onClick={() => saveCardForm(bankName, idx)} className="w-full bg-emerald-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition mt-3 flex justify-center items-center gap-2"><Save size={16}/> 儲存卡片設定</button>
                                </div>
                              ) : (
                                <div className="flex justify-between items-start bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:border-emerald-200 transition group mb-2">
                                  <div className="space-y-1.5 flex-1">
                                    <div className="font-bold text-gray-800 text-base flex items-center gap-2">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${card.color || 'bg-gray-100 text-gray-600'}`}><CardIcon size={12}/></div>
                                      {card.name}
                                      {card.rewards?.length > 0 && card.rewardCycle === 'billing' && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-normal">依結帳週期</span>}
                                    </div>
                                    <div className="flex flex-col gap-1 mt-1 pl-8">
                                      {card.rewards?.map((r, i) => (
                                        <span key={i} className={`text-[10px] font-medium px-1.5 py-0.5 rounded self-start ${r.type === 'cashback' ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' : 'text-indigo-700 bg-indigo-50 border border-indigo-100'}`}>
                                          【{r.name}】 {r.type==='cashback' ? `${r.rate}%` : `滿${r.spend}送${r.earn}${r.unit}`} {r.limit ? `(上限刷$${r.limit})`:''}
                                        </span>
                                      ))}
                                      {(!card.rewards || card.rewards.length === 0) && <span className="text-[10px] text-gray-400">無特殊回饋設定</span>}
                                    </div>
                                  </div>
                                  <div className="flex gap-1 shrink-0"><button onClick={() => openCardForm(bankName, card, idx)} className="text-gray-400 hover:text-emerald-600 p-1 bg-gray-50 rounded"><Edit2 size={16}/></button></div>
                                </div>
                              )}
                            </div>
                            )
                          })}
                          
                          {editingCardKey === `new-${bankName}` ? (
                            <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3 relative mt-2">
                               <button onClick={() => setEditingCardKey(null)} className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"><X size={18}/></button>
                               <p className="text-xs font-bold text-emerald-700 mb-2 flex items-center gap-1"><Plus size={14}/> 新增卡片</p>
                               
                               <div className="flex items-center gap-2 mb-2">
                                  <button type="button" onClick={() => setPickerConfig({ type: 'cardForm', iconName: cardForm.iconName, color: cardForm.color })} className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-dashed border-gray-400 hover:scale-105 transition ${cardForm.color || 'bg-gray-100 text-gray-600'}`} title="點擊更換卡片圖示">
                                     {React.createElement(ICON_MAP[cardForm.iconName] || CreditCard, { size: 24 })}
                                  </button>
                                  <input type="text" placeholder="卡片名稱 (必填)" value={cardForm.name ?? ''} onChange={(e) => setCardForm({...cardForm, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[16px] font-bold flex-1"/>
                               </div>

                               <div className="flex gap-2">
                                 <input type="text" placeholder="結帳日" value={cardForm.billing ?? ''} onChange={(e) => setCardForm({...cardForm, billing: e.target.value})} className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-[16px]"/>
                                 <input type="number" placeholder="信用額度" value={cardForm.limit ?? ''} onChange={(e) => setCardForm({...cardForm, limit: e.target.value})} className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-[16px]"/>
                               </div>
                               <button onClick={() => saveCardForm(bankName, -1)} className="w-full bg-emerald-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition mt-2">先建立卡片，再編輯回饋規則</button>
                            </div>
                          ) : (
                            <button onClick={() => openCardForm(bankName, null, -1)} className="w-full bg-gray-50 text-emerald-600 py-2 rounded-xl text-sm font-medium hover:bg-gray-100 border border-dashed border-gray-300 mt-2">+ 新增卡片</button>
                          )}
                        </div>
                      )}
                    </div>
                  )})}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ========================================== */}
        {/* 外觀選擇器 Modal (圖示與顏色) */}
        {/* ========================================== */}
        {pickerConfig && (
          <div className="fixed inset-0 bg-black/70 z-[60] flex justify-center items-end md:items-center backdrop-blur-sm p-0 md:p-4 transition-opacity">
            <div className="bg-white w-full max-w-md md:rounded-3xl rounded-t-3xl p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Palette size={20} className="text-emerald-600"/> 自訂外觀</h3>
                <button onClick={() => setPickerConfig(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded-full"><X size={20}/></button>
              </div>

              {/* 即時預覽區 */}
              <div className="flex justify-center mb-6">
                 <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md ${pickerConfig.color}`}>
                    {React.createElement(ICON_MAP[pickerConfig.iconName] || MoreHorizontal, { size: 32 })}
                 </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold text-gray-600 mb-2">1. 選擇顏色</p>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map(c => (
                       <button key={c} onClick={() => setPickerConfig({...pickerConfig, color: c})} className={`w-8 h-8 rounded-full shadow-sm border-2 ${pickerConfig.color === c ? 'border-gray-800 scale-110' : 'border-transparent'} ${c.split(' ')[0].replace('100', '400')}`}></button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-600 mb-2">2. 選擇圖示</p>
                  <div className="grid grid-cols-6 gap-3 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200">
                    {AVAILABLE_ICONS.map(iconKey => {
                       const IconComp = ICON_MAP[iconKey];
                       const isSelected = pickerConfig.iconName === iconKey;
                       return (
                         <button key={iconKey} onClick={() => setPickerConfig({...pickerConfig, iconName: iconKey})} className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${isSelected ? 'bg-emerald-600 text-white shadow-md scale-110' : 'bg-white text-gray-600 hover:bg-gray-200 shadow-sm border border-gray-200'}`}>
                           <IconComp size={20} />
                         </button>
                       )
                    })}
                  </div>
                </div>
              </div>

              <button onClick={() => handlePickerSave(pickerConfig.iconName, pickerConfig.color)} className="w-full bg-gray-800 text-white font-bold py-3 rounded-xl mt-6 hover:bg-black transition active:scale-95">
                確認選擇
              </button>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* 懸浮新增按鈕 (FAB) - 右側獨立區塊 */}
        {/* ========================================== */}
        <button
          onClick={() => openExpenseModal()}
          className="absolute bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-6 w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-400 hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all z-30"
        >
          <Plus size={30} />
        </button>

        {/* ========================================== */}
        {/* 底部導覽列 - 完美貼齊 Home 指示條並壓縮白邊 */}
        {/* ========================================== */}
        <div className="mt-auto w-full bg-white border-t border-gray-200 px-6 pt-2 pb-[max(0.25rem,env(safe-area-inset-bottom))] grid grid-cols-3 place-items-center z-20 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <button onClick={() => setActiveTab('list')} className={`flex flex-col items-center gap-1 transition ${activeTab === 'list' ? 'text-emerald-600' : 'text-gray-400'}`}>
            <List size={24} /><span className="text-xs font-bold">明細</span>
          </button>
          <button onClick={() => setActiveTab('report')} className={`flex flex-col items-center gap-1 transition ${activeTab === 'report' ? 'text-emerald-600' : 'text-gray-400'}`}>
            <PieChart size={24} /><span className="text-xs font-bold">報表</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center gap-1 transition ${activeTab === 'settings' ? 'text-emerald-600' : 'text-gray-400'}`}>
            <Settings size={24} /><span className="text-xs font-bold">設定</span>
          </button>
        </div>

        {/* 新增/編輯支出 Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-end md:items-center backdrop-blur-sm p-0 md:p-4 transition-opacity pointer-events-auto">
            <div className="bg-white w-full max-w-md md:rounded-3xl rounded-t-3xl p-6 pb-[calc(24px+env(safe-area-inset-bottom))] md:pb-6 shadow-2xl overflow-y-auto max-h-[90dvh]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{editingExpenseId ? '編輯明細' : '新增支出'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"><X size={20} /></button>
              </div>

              <form onSubmit={handleSaveExpense} className="space-y-4">
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 min-w-0">
                  <label className="text-emerald-700 text-sm font-semibold mb-1 block">金額 (NT$)</label>
                  <input type="number" name="amount" value={formData.amount ?? ''} onChange={handleFormChange} placeholder="0" required className="w-full bg-transparent text-4xl font-bold text-emerald-800 placeholder-emerald-300 outline-none font-mono min-w-0"/>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="min-w-0">
                    <label className="text-gray-600 text-sm font-medium mb-1 block truncate">日期</label>
                    <input type="date" name="date" value={formData.date ?? ''} onChange={handleFormChange} required className="w-full border border-gray-300 rounded-xl p-3 text-[16px] outline-none focus:border-emerald-500 min-w-0"/>
                  </div>
                  <div className="min-w-0">
                    <label className="text-gray-600 text-sm font-medium mb-1 block truncate">分類</label>
                    <select name="category" value={formData.category ?? ''} onChange={handleFormChange} className="w-full border border-gray-300 rounded-xl p-3 text-[16px] outline-none focus:border-emerald-500 bg-white min-w-0">
                      {categories.map(cat => <option key={cat.id} value={cat.name} className="truncate">{cat.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="min-w-0">
                  <label className="text-gray-600 text-sm font-medium mb-1 block truncate">項目說明</label>
                  <input type="text" name="description" value={formData.description ?? ''} onChange={handleFormChange} placeholder="例如：午餐、搭捷運" required className="w-full border border-gray-300 rounded-xl p-3 text-[16px] outline-none focus:border-emerald-500 min-w-0"/>
                </div>

                <hr className="border-gray-200" />

                <div className="grid grid-cols-2 gap-3">
                  <div className="min-w-0">
                    <label className="text-gray-600 text-sm font-medium mb-1 block truncate">銀行/支付</label>
                    <select name="bank" value={formData.bank ?? ''} onChange={handleFormChange} className="w-full border border-gray-300 rounded-xl p-3 text-[16px] outline-none focus:border-emerald-500 bg-white min-w-0">
                      {sortedBankNames.map(bank => <option key={bank} value={bank} className="truncate">{bank}</option>)}
                    </select>
                  </div>
                  <div className="min-w-0">
                    <label className="text-gray-600 text-sm font-medium mb-1 block truncate">卡別</label>
                    <select name="card" value={formData.card ?? ''} onChange={handleFormChange} className="w-full border border-gray-300 rounded-xl p-3 text-[16px] outline-none focus:border-emerald-500 bg-white min-w-0">
                      {bankCards[formData.bank]?.map(card => <option key={card.name} value={card.name} className="truncate">{card.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* 動態渲染該卡片專屬的「回饋標籤」供點選 */}
                {bankCards[formData.bank]?.find(c => c.name === formData.card)?.rewards?.length > 0 && (
                  <div>
                    <label className="text-gray-600 text-sm font-medium mb-2 block flex items-center gap-1"><Gift size={16}/> 套用回饋項目 (可複選疊加)</label>
                    <div className="flex flex-wrap gap-2">
                      {bankCards[formData.bank].find(c => c.name === formData.card).rewards.map(rule => {
                        const isSelected = formData.appliedRewards.includes(rule.id);
                        return (
                          <div 
                            key={rule.id} 
                            onClick={() => toggleRewardRule(rule.id)}
                            className={`cursor-pointer px-3 py-1.5 rounded-full border text-xs font-bold transition select-none ${isSelected ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                          >
                            {rule.name} {rule.type === 'cashback' ? `${rule.rate}%` : `(送${rule.unit})`}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <button type="submit" className="w-full bg-emerald-600 text-white font-bold text-lg py-4 rounded-2xl mt-2 hover:bg-emerald-700 transition active:scale-95 flex items-center justify-center gap-2">
                  <Check size={24} />{editingExpenseId ? '更新紀錄' : '儲存紀錄'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* 刪除防呆確認 Modal */}
        {/* ========================================== */}
        {expenseToDelete && (
          <div className="fixed inset-0 bg-black/60 z-[70] flex justify-center items-center backdrop-blur-sm p-4 transition-opacity pointer-events-auto">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">確定要刪除這筆紀錄嗎？</h3>
              <p className="text-sm text-gray-500 mb-6">此動作無法復原，請確認您要刪除的內容：</p>
              
              <div className="text-left bg-gray-50 p-4 rounded-2xl w-full border border-gray-200 flex flex-col gap-1 mb-6">
                <span className="text-xs text-gray-400">{expenseToDelete.date} • {expenseToDelete.category}</span>
                <span className="font-bold text-gray-800 text-lg leading-snug">{expenseToDelete.description}</span>
                <span className="font-mono text-xl text-red-600 font-bold mt-1">NT$ {expenseToDelete.amount.toLocaleString()}</span>
              </div>

              <div className="flex gap-3 w-full">
                <button onClick={() => setExpenseToDelete(null)} className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-200 transition active:scale-95">取消</button>
                <button onClick={() => executeDelete(expenseToDelete.id)} className="flex-1 bg-red-500 text-white py-3.5 rounded-xl font-bold hover:bg-red-600 transition active:scale-95 shadow-md shadow-red-200">確定刪除</button>
              </div>
            </div>
          </div>
        )}

        <style dangerouslySetInnerHTML={{__html: `
          html, body, #root {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            height: 100dvh;
            overflow: hidden; /* 防止背景彈跳與捲動 */
            background-color: #e5e7eb;
            -webkit-tap-highlight-color: transparent;
            overscroll-behavior-y: none;
          }
          input, textarea, select {
            font-size: 16px !important;
          }
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
        `}} />
      </div>
    </div>
  );
}
