import React, { useState, useEffect, useMemo, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInAnonymously,
  signInWithCustomToken,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import {
  Plus,
  List,
  PieChart,
  CreditCard,
  Calendar,
  Trash2,
  X,
  Check,
  Utensils,
  Shirt,
  Home,
  Car,
  BookOpen,
  Gamepad2,
  MoreHorizontal,
  AlertCircle,
  Settings,
  Edit2,
  Gift,
  TrendingUp,
  Save,
  ShoppingCart,
  Coffee,
  Heart,
  Briefcase,
  Plane,
  Landmark,
  Wallet,
  Banknote,
  PiggyBank,
  Monitor,
  Smartphone,
  Bus,
  Train,
  Scissors,
  Camera,
  Music,
  Ticket,
  Umbrella,
  ShoppingBag,
  Package,
  Globe,
  Map,
  Zap,
  Award,
  Star,
  Palette,
  Upload,
  Download,
  FileText,
  LogOut,
  User,
  Wand2,
  Loader2,
} from "lucide-react";

// ==========================================
// 1. 系統最新預設值 (支出分類與信用卡設定)
// ==========================================
const DEFAULT_BANK_CARDS = {
  現金: [
    {
      name: "現金",
      billing: "無",
      limit: null,
      rewardCycle: "calendar",
      rewards: [],
      iconName: "Banknote",
      color: "bg-green-100 text-green-600",
    },
  ],
  聯邦: [
    {
      name: "賴點卡",
      billing: "每月9日",
      limit: null,
      rewardCycle: "calendar",
      rewards: [
        { id: "r1", name: "國內", type: "cashback", rate: 1, limit: null },
        { id: "r2", name: "國外", type: "cashback", rate: 3, limit: null },
        {
          id: "r3",
          name: "ＬＰ偶數加碼",
          type: "cashback",
          rate: 8.8,
          limit: 3000,
        },
      ],
      iconName: "CreditCard",
      color: "bg-emerald-100 text-emerald-600",
    },
  ],
  星展: [
    {
      name: "傳說卡",
      billing: "每月9日",
      limit: null,
      rewardCycle: "calendar",
      rewards: [
        { id: "r1", name: "國內", type: "cashback", rate: 1.2, limit: null },
        { id: "r2", name: "國外", type: "cashback", rate: 2.5, limit: null },
        { id: "r3", name: "加碼", type: "cashback", rate: 5, limit: 11363 },
      ],
      iconName: "Star",
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      name: "饗樂卡",
      billing: "每月9日",
      limit: null,
      rewardCycle: "billing",
      rewards: [
        {
          id: "r1",
          name: "基本回饋",
          type: "points",
          spend: 30,
          earn: 1,
          unit: "活利積分",
          limit: null,
        },
        {
          id: "r2",
          name: "指定品牌加碼",
          type: "points",
          spend: 30,
          earn: 2,
          unit: "活利積分",
          limit: null,
        },
      ],
      iconName: "Gamepad2",
      color: "bg-red-100 text-red-600",
    },
    {
      name: "永續卡",
      billing: "每月9日",
      limit: null,
      rewardCycle: "calendar",
      rewards: [
        { id: "r1", name: "國內外", type: "cashback", rate: 1, limit: null },
        {
          id: "r2",
          name: "日韓泰新美歐",
          type: "cashback",
          rate: 4,
          limit: 15000,
        },
      ],
      iconName: "Globe",
      color: "bg-teal-100 text-teal-600",
    },
  ],
  元大: [
    {
      name: "鑽金卡",
      billing: "每月10日",
      limit: null,
      rewardCycle: "calendar",
      rewards: [
        { id: "r1", name: "國內", type: "cashback", rate: 1.2, limit: null },
        { id: "r2", name: "國外", type: "cashback", rate: 2.2, limit: null },
      ],
      iconName: "Award",
      color: "bg-amber-100 text-amber-600",
    },
  ],
  富邦: [
    {
      name: "好市多",
      billing: "每月12日",
      limit: null,
      rewardCycle: "calendar",
      rewards: [
        { id: "r1", name: "店內", type: "cashback", rate: 2, limit: null },
        { id: "r2", name: "店外", type: "cashback", rate: 1, limit: null },
        { id: "r3", name: "網購加油", type: "cashback", rate: 3, limit: null },
      ],
      iconName: "ShoppingCart",
      color: "bg-blue-100 text-blue-600",
    },
    {
      name: "數位卡",
      billing: "每月12日",
      limit: null,
      rewardCycle: "calendar",
      rewards: [
        {
          id: "r1",
          name: "一般、保費",
          type: "cashback",
          rate: 0.5,
          limit: null,
        },
        { id: "r2", name: "數位", type: "cashback", rate: 1.5, limit: 20000 },
      ],
      iconName: "Monitor",
      color: "bg-blue-100 text-blue-600",
    },
    {
      name: "J卡",
      billing: "每月12日",
      limit: null,
      rewardCycle: "calendar",
      rewards: [
        { id: "r1", name: "國內外", type: "cashback", rate: 1, limit: null },
        { id: "r2", name: "日韓泰", type: "cashback", rate: 3, limit: null },
      ],
      iconName: "Plane",
      color: "bg-blue-100 text-blue-600",
    },
  ],
  新光: [
    {
      name: "OU卡",
      billing: "每月12日",
      limit: null,
      rewardCycle: "calendar",
      rewards: [],
      iconName: "CreditCard",
      color: "bg-rose-100 text-rose-600",
    },
  ],
  永豐: [
    {
      name: "運動卡",
      billing: "每月14日",
      limit: null,
      rewardCycle: "calendar",
      rewards: [
        { id: "r1", name: "一般", type: "cashback", rate: 1, limit: null },
        { id: "r2", name: "運動", type: "cashback", rate: 1, limit: 5000 },
        { id: "r3", name: "ＡＰ加碼", type: "cashback", rate: 3, limit: 10000 },
      ],
      iconName: "Heart",
      color: "bg-rose-100 text-rose-600",
    },
    {
      name: "大戶卡",
      billing: "每月14日",
      limit: null,
      rewardCycle: "billing",
      rewards: [
        { id: "r1", name: "國內", type: "cashback", rate: 1, limit: null },
        { id: "r2", name: "國外", type: "cashback", rate: 2, limit: null },
        {
          id: "r3",
          name: "大戶ＰＳ加碼",
          type: "cashback",
          rate: 4,
          limit: 25000,
        },
      ],
      iconName: "Landmark",
      color: "bg-gray-100 text-gray-800",
    },
    {
      name: "大威卡",
      billing: "每月14日",
      limit: null,
      rewardCycle: "billing",
      rewards: [
        { id: "r1", name: "國內", type: "cashback", rate: 0.5, limit: null },
        { id: "r2", name: "國外", type: "cashback", rate: 2.5, limit: null },
        {
          id: "r3",
          name: "ＬＰ加碼",
          type: "cashback",
          rate: 1.5,
          limit: 20000,
        },
      ],
      iconName: "CreditCard",
      color: "bg-slate-100 text-slate-600",
    },
    {
      name: "幣倍卡",
      billing: "每月14日",
      limit: null,
      rewardCycle: "calendar",
      rewards: [
        { id: "r1", name: "國內", type: "cashback", rate: 1, limit: null },
        { id: "r2", name: "國外", type: "cashback", rate: 2, limit: null },
        { id: "r3", name: "指定", type: "cashback", rate: 4, limit: 20000 },
      ],
      iconName: "Coins",
      color: "bg-yellow-100 text-yellow-600",
    },
  ],
  玉山: [
    {
      name: "UBEAR卡",
      billing: "每月21日",
      limit: null,
      rewardCycle: "billing",
      rewards: [
        {
          id: "r1",
          name: "國內外基本",
          type: "cashback",
          rate: 1,
          limit: null,
        },
        {
          id: "r2",
          name: "網購/行動支付",
          type: "cashback",
          rate: 2,
          limit: 7500,
        },
      ],
      iconName: "Smartphone",
      color: "bg-green-100 text-green-600",
    },
    {
      name: "UNI卡",
      billing: "每月21日",
      limit: null,
      rewardCycle: "billing",
      rewards: [
        { id: "r1", name: "一般", type: "cashback", rate: 1, limit: null },
        { id: "r2", name: "簡單選", type: "cashback", rate: 2, limit: 50000 },
        { id: "r3", name: "任意選", type: "cashback", rate: 2.5, limit: 40000 },
        {
          id: "r4",
          name: "ＵＰ選",
          type: "cashback",
          rate: 3.5,
          limit: 142857,
        },
      ],
      iconName: "CreditCard",
      color: "bg-teal-100 text-teal-600",
    },
    {
      name: "PI卡",
      billing: "每月21日",
      limit: null,
      rewardCycle: "calendar",
      rewards: [
        { id: "r1", name: "國內外", type: "cashback", rate: 1, limit: null },
        { id: "r2", name: "保費", type: "cashback", rate: 1.2, limit: null },
        { id: "r3", name: "ＰＩ全家", type: "cashback", rate: 5, limit: 2000 },
      ],
      iconName: "Zap",
      color: "bg-blue-100 text-blue-600",
    },
  ],
  中信: [
    {
      name: "LP卡",
      billing: "每月25日",
      limit: null,
      rewardCycle: "calendar",
      rewards: [
        { id: "r1", name: "國內外", type: "cashback", rate: 1, limit: null },
        {
          id: "r2",
          name: "國外實體",
          type: "cashback",
          rate: 2.8,
          limit: null,
        },
      ],
      iconName: "CreditCard",
      color: "bg-lime-100 text-lime-600",
    },
  ],
  國泰: [
    {
      name: "CUBE卡",
      billing: "每月27日",
      limit: null,
      rewardCycle: "calendar",
      rewards: [],
      iconName: "Package",
      color: "bg-green-100 text-green-600",
    },
  ],
  台新: [
    {
      name: "理查卡",
      billing: "每月27日",
      limit: null,
      rewardCycle: "calendar",
      rewards: [],
      iconName: "CreditCard",
      color: "bg-red-100 text-red-600",
    },
  ],
};

const DEFAULT_CATEGORIES = [
  {
    id: "cat-1",
    name: "餐飲",
    iconName: "Utensils",
    color: "bg-orange-100 text-orange-600",
  },
  {
    id: "cat-2",
    name: "購物",
    iconName: "Shirt",
    color: "bg-pink-100 text-pink-600",
  },
  {
    id: "cat-3",
    name: "居家",
    iconName: "Home",
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: "cat-4",
    name: "行",
    iconName: "Car",
    color: "bg-teal-100 text-teal-600",
  },
  {
    id: "cat-5",
    name: "保健品",
    iconName: "BookOpen",
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    id: "cat-6",
    name: "娛樂",
    iconName: "Gamepad2",
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: "cat-7",
    name: "其他",
    iconName: "MoreHorizontal",
    color: "bg-gray-100 text-gray-600",
  },
];

const COLOR_OPTIONS = [
  "bg-red-100 text-red-600",
  "bg-orange-100 text-orange-600",
  "bg-amber-100 text-amber-600",
  "bg-yellow-100 text-yellow-600",
  "bg-lime-100 text-lime-600",
  "bg-green-100 text-green-600",
  "bg-emerald-100 text-emerald-600",
  "bg-teal-100 text-teal-600",
  "bg-cyan-100 text-cyan-600",
  "bg-sky-100 text-sky-600",
  "bg-blue-100 text-blue-600",
  "bg-indigo-100 text-indigo-600",
  "bg-violet-100 text-violet-600",
  "bg-purple-100 text-purple-600",
  "bg-fuchsia-100 text-fuchsia-600",
  "bg-pink-100 text-pink-600",
  "bg-rose-100 text-rose-600",
  "bg-slate-100 text-slate-600",
  "bg-gray-100 text-gray-600",
  "bg-zinc-100 text-zinc-600",
];

const ICON_MAP = {
  Utensils,
  Shirt,
  Home,
  Car,
  BookOpen,
  Gamepad2,
  MoreHorizontal,
  CreditCard,
  Calendar,
  PieChart,
  List,
  Settings,
  Gift,
  TrendingUp,
  ShoppingCart,
  Coffee,
  Heart,
  Briefcase,
  Plane,
  Landmark,
  Wallet,
  Banknote,
  PiggyBank,
  Monitor,
  Smartphone,
  Bus,
  Train,
  Scissors,
  Camera,
  Music,
  Ticket,
  Umbrella,
  ShoppingBag,
  Package,
  Globe,
  Map,
  Zap,
  Award,
  Star,
  User,
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
    measurementId: "G-JZCD87N6BB",
  };
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  appId = firebaseConfig.projectId;
} catch (error) {
  console.error("Firebase init failed:", error);
}

// ==========================================
// 輔助函式
// ==========================================
const extractBillingDay = (billingStr) => {
  if (!billingStr || billingStr === "無") return 999;
  const match = billingStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : 999;
};

// 全域樣式：解決 iOS Safari PWA 輸入框無法點擊與捲動的 Bug
const GlobalStyles = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: `
    html, body, #root {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      /* 絕對不能在 body 加 overflow: hidden，否則 iOS PWA 輸入框會無法點擊 */
      background-color: #e5e7eb;
      overscroll-behavior-y: none;
      -webkit-tap-highlight-color: transparent;
    }
    input, textarea, select {
      font-size: 16px !important; /* 確保 iOS 點擊時不會自動放大破壞版面 */
      -webkit-user-select: text !important;
      user-select: text !important;
      pointer-events: auto !important;
    }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
    .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
  `,
    }}
  />
);

// ==========================================
// 3. 主應用程式組件
// ==========================================
export default function App() {
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState("list");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [isLoading, setIsLoading] = useState(true);

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [bankCards, setBankCards] = useState(DEFAULT_BANK_CARDS);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [pickerConfig, setPickerConfig] = useState(null);

  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: "餐飲",
    amount: "",
    description: "",
    bank: "現金",
    card: "現金",
    billingDate: "無",
    appliedRewards: [],
  });

  const [editingBank, setEditingBank] = useState(null);
  const [newBankName, setNewBankName] = useState("");

  const [editingCardKey, setEditingCardKey] = useState(null);
  const [cardForm, setCardForm] = useState({
    name: "",
    billing: "",
    limit: "",
    rewardCycle: "calendar",
    rewards: [],
    iconName: "CreditCard",
    color: "bg-gray-100 text-gray-600",
  });

  // 帳號登入與錯誤狀態
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // 匯出匯入狀態
  const [importStatus, setImportStatus] = useState("");
  const fileInputRef = useRef(null);

  // 未刷卡片折疊狀態
  const [showUnusedCards, setShowUnusedCards] = useState(false);

  // 銀行排序 (現金最前，其餘依結帳日排序)
  const sortedBankNames = useMemo(() => {
    return Object.keys(bankCards).sort((a, b) => {
      if (a === "現金") return -1;
      if (b === "現金") return 1;
      const getMinDay = (bName) => {
        const cards = bankCards[bName] || [];
        if (cards.length === 0) return 999;
        return Math.min(...cards.map((c) => extractBillingDay(c.billing)));
      };
      const dayA = getMinDay(a);
      const dayB = getMinDay(b);
      if (dayA !== dayB) return dayA - dayB;
      return a.localeCompare(b);
    });
  }, [bankCards]);

  // === PWA 滿版全螢幕支援 ===
  useEffect(() => {
    const setupPWA = () => {
      let viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        viewport = document.createElement("meta");
        viewport.name = "viewport";
        document.head.appendChild(viewport);
      }
      viewport.content =
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover";

      const metaTags = [
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "mobile-web-app-capable", content: "yes" },
        {
          name: "apple-mobile-web-app-status-bar-style",
          content: "black-translucent",
        },
        { name: "theme-color", content: "#059669" },
      ];

      metaTags.forEach(({ name, content }) => {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
          meta = document.createElement("meta");
          meta.name = name;
          document.head.appendChild(meta);
        }
        meta.content = content;
      });

      const manifest = {
        name: "專屬記帳系統",
        short_name: "記帳",
        display: "standalone",
        background_color: "#e5e7eb",
        theme_color: "#059669",
      };
      const blob = new Blob([JSON.stringify(manifest)], {
        type: "application/json",
      });
      const manifestURL = URL.createObjectURL(blob);
      let link = document.querySelector('link[rel="manifest"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "manifest";
        document.head.appendChild(link);
      }
      link.href = manifestURL;
    };
    setupPWA();
  }, []);

  // 初始化權限驗證
  useEffect(() => {
    if (!auth) return;

    let initAttempted = false;

    const initAuth = async () => {
      initAttempted = true;
      try {
        if (
          typeof __initial_auth_token !== "undefined" &&
          __initial_auth_token
        ) {
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
        console.warn(
          "自動登入失敗 (可能是使用自訂 Firebase 金鑰且未啟用匿名登入)，請登入專屬帳號:",
          err.message
        );
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
    setAuthError("");
    setIsLoading(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        alert("註冊成功！系統已切換至您的專屬帳號。");
      } else {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
        alert("登入成功！");
      }
      setAuthEmail("");
      setAuthPassword("");
    } catch (error) {
      console.error("Auth error:", error);
      setAuthError(
        error.message.includes("invalid-credential")
          ? "帳號或密碼錯誤"
          : error.message.includes("email-already-in-use")
          ? "此信箱已被註冊"
          : "發生錯誤，請確認您的 Firebase 後台已啟用 Email 登入。"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("確定要登出系統嗎？將會切換回訪客模式。")) {
      try {
        await signOut(auth);
        setExpenses([]);
        setCategories(DEFAULT_CATEGORIES);
        setBankCards(DEFAULT_BANK_CARDS);
        setActiveTab("list");
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
        const docSnap = await getDoc(
          doc(
            db,
            "artifacts",
            appId,
            "users",
            user.uid,
            "settings",
            "userConfig"
          )
        );
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.categories) setCategories(data.categories);

          if (data.bankCards) {
            const migratedBanks = {};

            Object.keys(data.bankCards).forEach((bankName) => {
              migratedBanks[bankName] = data.bankCards[bankName].map((card) => {
                const defaultCard = (DEFAULT_BANK_CARDS[bankName] || []).find(
                  (c) => c.name === card.name
                );
                let newRewards = card.rewards;
                if (
                  !newRewards ||
                  (Array.isArray(newRewards) &&
                    newRewards.length === 0 &&
                    card.rewardType &&
                    card.rewardType !== "none")
                ) {
                  newRewards = [];
                  if (card.rewardType === "cashback") {
                    if (card.domesticRate)
                      newRewards.push({
                        id: `r1_${Date.now()}`,
                        name: "國內基本",
                        type: "cashback",
                        rate: card.domesticRate,
                        limit: card.domesticMax || null,
                      });
                    if (card.overseasRate)
                      newRewards.push({
                        id: `r2_${Date.now()}`,
                        name: "國外消費",
                        type: "cashback",
                        rate: card.overseasRate,
                        limit: card.overseasMax || null,
                      });
                    if (card.bonusRate)
                      newRewards.push({
                        id: `r3_${Date.now()}`,
                        name: "加碼",
                        type: "cashback",
                        rate: card.bonusRate,
                        limit: card.bonusMax || null,
                      });
                  } else if (card.rewardType === "points") {
                    if (card.pointEarn)
                      newRewards.push({
                        id: `p1_${Date.now()}`,
                        name: "基本點數",
                        type: "points",
                        spend: card.pointSpend || 1,
                        earn: card.pointEarn,
                        unit: card.pointName || "點",
                        limit: card.pointMax || null,
                      });
                    if (card.pointBonusEarn)
                      newRewards.push({
                        id: `p2_${Date.now()}`,
                        name: "加碼點數",
                        type: "points",
                        spend: card.pointSpend || 1,
                        earn: card.pointBonusEarn,
                        unit: card.pointName || "點",
                        limit: card.pointBonusMax || null,
                      });
                  }

                  if (
                    newRewards.length === 0 &&
                    defaultCard &&
                    defaultCard.rewards
                  ) {
                    newRewards = defaultCard.rewards;
                  }
                }

                return {
                  ...card,
                  rewards: newRewards,
                  iconName:
                    card.iconName || defaultCard?.iconName || "CreditCard",
                  color:
                    card.color ||
                    defaultCard?.color ||
                    "bg-gray-100 text-gray-600",
                  rewardCycle:
                    card.rewardCycle || defaultCard?.rewardCycle || "calendar",
                  limit:
                    card.limit !== undefined
                      ? card.limit
                      : defaultCard?.limit || null,
                };
              });
            });

            Object.keys(DEFAULT_BANK_CARDS).forEach((defaultBank) => {
              if (!migratedBanks[defaultBank]) {
                migratedBanks[defaultBank] = DEFAULT_BANK_CARDS[defaultBank];
              } else {
                DEFAULT_BANK_CARDS[defaultBank].forEach((defCard) => {
                  if (
                    !migratedBanks[defaultBank].find(
                      (c) => c.name === defCard.name
                    )
                  ) {
                    migratedBanks[defaultBank].push(defCard);
                  }
                });
              }
            });

            setBankCards(migratedBanks);
          }
        }
        setSettingsLoaded(true);
      } catch (error) {
        console.error(error);
        setSettingsLoaded(true);
      }
    };
    loadSettings();

    const unsubscribe = onSnapshot(
      collection(db, "artifacts", appId, "users", user.uid, "expenses"),
      (snapshot) => {
        const data = [];
        snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));

        data.sort((a, b) => {
          const dateDiff = new Date(b.date) - new Date(a.date);
          if (dateDiff !== 0) return dateDiff;
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });

        setExpenses(data);
      }
    );
    return () => unsubscribe();
  }, [user]);

  const saveSettingsToCloud = async (newCategories, newBankCards) => {
    if (!user || !db) return;
    await setDoc(
      doc(db, "artifacts", appId, "users", user.uid, "settings", "userConfig"),
      {
        categories: newCategories,
        bankCards: newBankCards,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  };

  const getBillingCycleDates = (viewYear, viewMonthNum, billingDayStr) => {
    const match = billingDayStr.match(/\d+/);
    if (!match) return null;
    const day = parseInt(match[0], 10);
    const endDate = new Date(viewYear, viewMonthNum - 1, day);
    const startDate = new Date(viewYear, viewMonthNum - 2, day + 1);
    const formatDate = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
    return {
      startStr: formatDate(startDate),
      endStr: formatDate(endDate),
      cycleLabel: `${startDate.getMonth() + 1}/${startDate.getDate()} ~ ${
        endDate.getMonth() + 1
      }/${endDate.getDate()}`,
    };
  };

  const {
    filteredExpenses,
    totalMonth,
    bankTotals,
    cardTotals,
    estimatedCashback,
    estimatedPoints,
    rewardLimitTracking,
  } = useMemo(() => {
    const filtered = expenses.filter((exp) =>
      exp.date.startsWith(currentMonth)
    );
    let total = 0;
    const bnkTotals = {},
      crdTotals = {};

    filtered.forEach((exp) => {
      const amt = parseFloat(exp.amount) || 0;
      total += amt;
      bnkTotals[exp.bank] = (bnkTotals[exp.bank] || 0) + amt;
      crdTotals[exp.card] = (crdTotals[exp.card] || 0) + amt;
    });

    const [viewYear, viewMonth] = currentMonth.split("-").map(Number);
    let finalCashback = 0;
    const finalPoints = {};
    const tracking = [];

    Object.values(bankCards)
      .flat()
      .forEach((cardInfo) => {
        if (!cardInfo.rewards || cardInfo.rewards.length === 0) return;

        let startStr, endStr, label;
        if (cardInfo.rewardCycle === "billing" && cardInfo.billing !== "無") {
          const cycleInfo = getBillingCycleDates(
            viewYear,
            viewMonth,
            cardInfo.billing
          );
          if (cycleInfo) {
            startStr = cycleInfo.startStr;
            endStr = cycleInfo.endStr;
            label = `結帳週期 (${cycleInfo.cycleLabel})`;
          } else {
            startStr = `${viewYear}-${String(viewMonth).padStart(2, "0")}-01`;
            endStr = `${viewYear}-${String(viewMonth).padStart(2, "0")}-31`;
            label = "月曆月";
          }
        } else {
          startStr = `${viewYear}-${String(viewMonth).padStart(2, "0")}-01`;
          endStr = `${viewYear}-${String(viewMonth).padStart(2, "0")}-31`;
          label = "月曆月";
        }

        cardInfo.rewards.forEach((rule) => {
          let cycleSpent = 0;
          expenses.forEach((exp) => {
            if (
              exp.card === cardInfo.name &&
              exp.date >= startStr &&
              exp.date <= endStr
            ) {
              if (exp.appliedRewards && exp.appliedRewards.includes(rule.id)) {
                cycleSpent += parseFloat(exp.amount) || 0;
              }
            }
          });

          if (rule.limit) {
            tracking.push({
              cardName: cardInfo.name,
              ruleName: rule.name,
              spent: cycleSpent,
              limit: rule.limit,
              cycleLabel: label,
            });
          }

          let cappedSpent = rule.limit
            ? Math.min(cycleSpent, rule.limit)
            : cycleSpent;

          if (rule.type === "cashback") {
            finalCashback += cappedSpent * ((parseFloat(rule.rate) || 0) / 100);
          } else if (rule.type === "points") {
            let spendReq = parseFloat(rule.spend) || 1;
            let earnAmt = parseFloat(rule.earn) || 0;
            let earned = Math.floor(cappedSpent / spendReq) * earnAmt;
            let unit = rule.unit || "點";
            finalPoints[unit] = (finalPoints[unit] || 0) + earned;
          }
        });
      });

    return {
      filteredExpenses: filtered,
      totalMonth: total,
      bankTotals: Object.entries(bnkTotals).sort((a, b) => {
        if (a[0] === "現金") return -1;
        if (b[0] === "現金") return 1;
        const dayA = extractBillingDay(bankCards[a[0]]?.[0]?.billing);
        const dayB = extractBillingDay(bankCards[b[0]]?.[0]?.billing);
        if (dayA !== dayB) return dayA - dayB;
        return b[1] - a[1];
      }),
      cardTotals: crdTotals,
      estimatedCashback: Math.round(finalCashback),
      estimatedPoints: Object.entries(finalPoints).map(([u, p]) => [
        u,
        Math.round(p),
      ]),
      rewardLimitTracking: tracking.sort(
        (a, b) => b.spent / b.limit - a.spent / a.limit
      ),
    };
  }, [expenses, currentMonth, bankCards]);

  const handleAddCategory = () => {
    const newCat = {
      id: `cat-${Date.now()}`,
      name: "新分類",
      iconName: "MoreHorizontal",
      color: COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)],
    };
    const updatedCategories = [...categories, newCat];
    setCategories(updatedCategories);
    saveSettingsToCloud(updatedCategories, bankCards);
    setEditingCategory(newCat.id);
  };
  const handleUpdateCategory = (id, field, value) => {
    const updatedCategories = categories.map((c) =>
      c.id === id ? { ...c, [field]: value } : c
    );
    setCategories(updatedCategories);
    saveSettingsToCloud(updatedCategories, bankCards);
  };
  const handleDeleteCategory = (id) => {
    if (categories.length <= 1) return;
    const updatedCategories = categories.filter((c) => c.id !== id);
    setCategories(updatedCategories);
    saveSettingsToCloud(updatedCategories, bankCards);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    if (name === "bank" && bankCards[value]) {
      const firstCard = bankCards[value][0];
      newFormData.card = firstCard?.name || "";
      newFormData.billingDate = firstCard?.billing || "無";
      newFormData.appliedRewards =
        firstCard?.rewards?.length > 0 ? [firstCard.rewards[0].id] : [];
    }
    if (name === "card") {
      const cardInfo = bankCards[formData.bank]?.find((c) => c.name === value);
      if (cardInfo) {
        newFormData.billingDate = cardInfo.billing;
        newFormData.appliedRewards =
          cardInfo.rewards?.length > 0 ? [cardInfo.rewards[0].id] : [];
      }
    }
    setFormData(newFormData);
  };

  const toggleRewardRule = (ruleId) => {
    setFormData((prev) => {
      const current = prev.appliedRewards || [];
      return {
        ...prev,
        appliedRewards: current.includes(ruleId)
          ? current.filter((id) => id !== ruleId)
          : [...current, ruleId],
      };
    });
  };

  const openExpenseModal = (expenseToEdit = null) => {
    if (expenseToEdit) {
      setEditingExpenseId(expenseToEdit.id);
      setFormData({
        date: expenseToEdit.date || new Date().toISOString().slice(0, 10),
        category: expenseToEdit.category || "餐飲",
        amount: expenseToEdit.amount || "",
        description: expenseToEdit.description || "",
        bank: expenseToEdit.bank || "現金",
        card: expenseToEdit.card || "現金",
        billingDate: expenseToEdit.billingDate || "無",
        appliedRewards: expenseToEdit.appliedRewards || [],
      });
    } else {
      setEditingExpenseId(null);
      setFormData((prev) => ({
        ...prev,
        date: new Date().toISOString().slice(0, 10),
        amount: "",
        description: "",
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
        updatedAt: new Date().toISOString(),
      };

      if (editingExpenseId) {
        const docRef = doc(
          db,
          "artifacts",
          appId,
          "users",
          user.uid,
          "expenses",
          editingExpenseId
        );
        await updateDoc(docRef, expenseData);
      } else {
        expenseData.createdAt = new Date().toISOString();
        await addDoc(
          collection(db, "artifacts", appId, "users", user.uid, "expenses"),
          expenseData
        );
      }

      setIsModalOpen(false);
      setEditingExpenseId(null);
    } catch (error) {
      console.error("Error saving expense: ", error);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!user) return;
    try {
      const docRef = doc(
        db,
        "artifacts",
        appId,
        "users",
        user.uid,
        "expenses",
        id
      );
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const getCategoryStyle = (catName) => {
    const cat =
      categories.find((c) => c.name === catName) ||
      categories[categories.length - 1] ||
      DEFAULT_CATEGORIES[6];
    return { Icon: ICON_MAP[cat.iconName] || MoreHorizontal, color: cat.color };
  };

  const openCardForm = (bankName, cardData, index) => {
    setEditingCardKey(
      index === -1 ? `new-${bankName}` : `${bankName}-${index}`
    );
    setCardForm({
      name: cardData?.name || "",
      billing: cardData?.billing || "無",
      limit: cardData?.limit || "",
      rewardCycle: cardData?.rewardCycle || "calendar",
      rewards: cardData?.rewards || [],
      iconName: cardData?.iconName || "CreditCard",
      color: cardData?.color || "bg-gray-100 text-gray-600",
    });
  };

  const addRewardRuleToForm = (type) => {
    const newRule =
      type === "cashback"
        ? {
            id: `rule-${Date.now()}`,
            name: "",
            type: "cashback",
            rate: "",
            limit: "",
          }
        : {
            id: `rule-${Date.now()}`,
            name: "",
            type: "points",
            spend: "",
            earn: "",
            unit: "點",
            limit: "",
          };
    setCardForm((prev) => ({ ...prev, rewards: [...prev.rewards, newRule] }));
  };

  const updateRewardRuleInForm = (idx, field, value) => {
    const newRewards = [...cardForm.rewards];
    newRewards[idx][field] = value;
    setCardForm((prev) => ({ ...prev, rewards: newRewards }));
  };

  const removeRewardRuleFromForm = (idx) => {
    const newRewards = [...cardForm.rewards];
    newRewards.splice(idx, 1);
    setCardForm((prev) => ({ ...prev, rewards: newRewards }));
  };

  const saveCardForm = (bankName, index) => {
    if (!cardForm.name.trim()) return;
    const valOrNull = (val) => (val ? parseFloat(val) : null);

    const cleanRewards = cardForm.rewards.map((r) => ({
      id: r.id,
      name: r.name.trim() || "未命名",
      type: r.type,
      limit: valOrNull(r.limit),
      ...(r.type === "cashback"
        ? { rate: valOrNull(r.rate) || 0 }
        : {
            spend: valOrNull(r.spend) || 1,
            earn: valOrNull(r.earn) || 0,
            unit: (r.unit || "").trim() || "點",
          }),
    }));

    const cardData = {
      name: cardForm.name.trim(),
      billing: (cardForm.billing || "").trim() || "無",
      limit: valOrNull(cardForm.limit),
      rewardCycle: cardForm.rewardCycle,
      rewards: cleanRewards,
      iconName: cardForm.iconName || "CreditCard",
      color: cardForm.color || "bg-gray-100 text-gray-600",
    };

    const updated = { ...bankCards };
    if (!updated[bankName]) updated[bankName] = [];
    if (index === -1) updated[bankName].push(cardData);
    else updated[bankName][index] = cardData;
    setBankCards(updated);
    saveSettingsToCloud(categories, updated);
    setEditingCardKey(null);
  };

  const handleJumpToCurrentMonth = () => {
    const today = new Date();
    setCurrentMonth(
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
    );
  };

  const handlePickerSave = (selectedIcon, selectedColor) => {
    if (pickerConfig.type === "category") {
      const newCats = categories.map((c) =>
        c.id === pickerConfig.id
          ? { ...c, iconName: selectedIcon, color: selectedColor }
          : c
      );
      setCategories(newCats);
      saveSettingsToCloud(newCats, bankCards);
    } else if (pickerConfig.type === "cardForm") {
      setCardForm({
        ...cardForm,
        iconName: selectedIcon,
        color: selectedColor,
      });
    }
    setPickerConfig(null);
  };

  const handleExportCSV = () => {
    const headers = [
      "日期",
      "分類",
      "項目說明",
      "金額",
      "銀行",
      "卡別",
      "結帳日",
    ];
    const csvContent = [
      headers.join(","),
      ...expenses.map((e) =>
        [
          e.date,
          e.category,
          `"${(e.description || "").replace(/"/g, '""')}"`,
          e.amount,
          e.bank,
          e.card,
          e.billingDate,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `記帳資料_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = async (event) => {
    const file = event.target.files[0];
    if (!file || !user) return;
    setImportStatus("匯入中...");

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const rows = text.split("\n").filter((row) => row.trim() !== "");

      if (rows.length <= 1) {
        setImportStatus("檔案中沒有資料行！");
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const cols = row
          .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
          .map((col) => col.replace(/^"|"$/g, "").trim());

        if (cols.length >= 4) {
          const dateStr = cols[0];
          const amount = parseFloat(cols[3]);

          let parsedDate = new Date();
          if (dateStr.includes("/")) {
            const parts = dateStr.split("/");
            if (parts[0].length === 4)
              parsedDate = new Date(parts[0], parts[1] - 1, parts[2]);
            else if (parts.length === 2)
              parsedDate = new Date(
                new Date().getFullYear(),
                parts[0] - 1,
                parts[1]
              );
          } else if (dateStr.includes("-")) {
            parsedDate = new Date(dateStr);
          }

          if (!isNaN(amount) && amount > 0) {
            try {
              const expenseData = {
                date: parsedDate.toISOString().slice(0, 10),
                category: cols[1] || "其他",
                description: cols[2] || "未命名項目",
                amount: amount,
                bank: cols[4] || "現金",
                card: cols[5] || "現金",
                billingDate: cols[6] || "無",
                appliedRewards: [],
                createdAt: new Date().toISOString(),
              };
              await addDoc(
                collection(
                  db,
                  "artifacts",
                  appId,
                  "users",
                  user.uid,
                  "expenses"
                ),
                expenseData
              );
              successCount++;
            } catch (err) {
              console.error("Error importing row:", row, err);
              errorCount++;
            }
          } else {
            errorCount++;
          }
        } else {
          errorCount++;
        }
      }
      setImportStatus(
        `匯入完成！成功：${successCount} 筆，失敗/略過：${errorCount} 筆。`
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  if (isLoading && !user) {
    return (
      <div className="w-full h-[100dvh] flex items-center justify-center bg-gray-50 text-emerald-600 relative">
        <GlobalStyles />
        載入中...
      </div>
    );
  }

  // 登入畫面修改：使用 overflow-y-auto 與 flex-col，讓鍵盤彈出時系統可以順利推動畫面
  if (!user) {
    return (
      <div className="w-full h-[100dvh] bg-gray-200 overflow-y-auto -webkit-overflow-scrolling-touch relative">
        <GlobalStyles />
        <div className="flex flex-col justify-center items-center min-h-full p-4 w-full">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-6 my-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet size={32} />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">
                雲端記帳小幫手
              </h1>
              <p className="text-sm text-gray-500 mt-2">Create by Cy</p>
            </div>

            {authError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center border border-red-200">
                {authError}
              </div>
            )}

            <form
              onSubmit={(e) => handleAuthSubmit(e, false)}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">
                  電子郵件 Email
                </label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-[16px] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">
                  密碼 Password
                </label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-[16px] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition"
                  placeholder="請輸入至少6位數密碼"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={(e) => handleAuthSubmit(e, false)}
                  disabled={!authEmail || !authPassword}
                  className="flex-1 bg-indigo-100 text-indigo-700 py-3 rounded-xl text-sm font-bold hover:bg-indigo-200 transition disabled:opacity-50"
                >
                  登入帳號
                </button>
                <button
                  type="button"
                  onClick={(e) => handleAuthSubmit(e, true)}
                  disabled={!authEmail || !authPassword}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  註冊並綁定
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !settingsLoaded) {
    return (
      <div className="w-full h-[100dvh] flex items-center justify-center bg-gray-50 text-emerald-600 relative">
        <GlobalStyles />
        讀取資料中...
      </div>
    );
  }

  // 主畫面修改：移除最外層的 fixed inset-0 與 overflow-hidden，改由內部控管
  return (
    <div className="w-full h-[100dvh] bg-gray-200 flex justify-center relative overflow-hidden">
      <GlobalStyles />
      <div className="w-full max-w-md bg-gray-50 relative flex flex-col h-full shadow-2xl overflow-hidden">
        {/* Header */}
        {activeTab !== "settings" && (
          <header className="bg-emerald-600 text-white pt-6 pb-4 px-6 rounded-b-3xl shadow-md z-10 shrink-0">
            <div className="flex items-center justify-between bg-emerald-700/50 rounded-2xl p-1 mb-6 mt-4">
              <button
                onClick={() => {
                  const [y, m] = currentMonth.split("-").map(Number);
                  setCurrentMonth(
                    `${new Date(y, m - 2, 1).getFullYear()}-${String(
                      new Date(y, m - 2, 1).getMonth() + 1
                    ).padStart(2, "0")}`
                  );
                }}
                className="p-2 hover:bg-emerald-800 rounded-xl transition"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div
                className="font-semibold text-lg flex items-center gap-2 cursor-pointer hover:text-emerald-200 transition"
                onClick={handleJumpToCurrentMonth}
                title="回到本月"
              >
                <Calendar size={18} />
                {currentMonth.replace("-", "年")}月
              </div>
              <button
                onClick={() => {
                  const [y, m] = currentMonth.split("-").map(Number);
                  setCurrentMonth(
                    `${new Date(y, m, 1).getFullYear()}-${String(
                      new Date(y, m, 1).getMonth() + 1
                    ).padStart(2, "0")}`
                  );
                }}
                className="p-2 hover:bg-emerald-800 rounded-xl transition"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
            <div className="text-center">
              <p className="text-emerald-100 text-sm mb-1">本月總支出</p>
              <p className="text-4xl font-bold font-mono">
                <span className="text-xl mr-1">$</span>
                {totalMonth.toLocaleString()}
              </p>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-32">
          {/* == 明細頁 == */}
          {activeTab === "list" && (
            <div className="space-y-3">
              {filteredExpenses.length === 0 ? (
                <div className="text-center text-gray-400 mt-20 flex flex-col items-center">
                  <List size={48} className="mb-4 opacity-50" />
                  <p>這個月還沒有任何紀錄喔！</p>
                </div>
              ) : (
                filteredExpenses.map((expense) => {
                  const { Icon, color } = getCategoryStyle(expense.category);
                  const cardInfo = (bankCards[expense.bank] || []).find(
                    (c) => c.name === expense.card
                  );

                  const appliedBadges = [];
                  if (cardInfo && cardInfo.rewards && expense.appliedRewards) {
                    cardInfo.rewards.forEach((r) => {
                      if ((expense.appliedRewards || []).includes(r.id)) {
                        if (r.type === "cashback")
                          appliedBadges.push(`${r.name} ${r.rate}%`);
                        if (r.type === "points")
                          appliedBadges.push(`${r.name} ${r.earn}${r.unit}`);
                      }
                    });
                  }

                  const CardIcon = ICON_MAP[cardInfo?.iconName] || CreditCard;
                  const cardTextColor =
                    cardInfo?.color
                      ?.split(" ")
                      .find((c) => c.startsWith("text-")) || "text-gray-500";

                  return (
                    <div
                      key={expense.id}
                      className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 group transition hover:border-emerald-300 relative"
                    >
                      <div className="flex flex-col items-center justify-center shrink-0 w-12 bg-gray-50 h-12 rounded-xl">
                        <span className="text-gray-400 text-[10px] uppercase font-bold leading-none">
                          {expense.date.substring(5, 7)}月
                        </span>
                        <span className="text-emerald-700 text-xl font-black leading-tight mt-0.5">
                          {expense.date.substring(8, 10)}
                        </span>
                      </div>

                      <div className="w-[1px] h-10 bg-gray-100 shrink-0"></div>

                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${color}`}
                      >
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="font-bold text-gray-800 truncate leading-snug">
                          {expense.description}
                        </p>
                        <div className="flex flex-col gap-1 mt-0.5">
                          {/* 銀行與卡片 (加入微型專屬圖示) */}
                          <span className="text-[11px] font-medium text-gray-600 flex items-center gap-1">
                            <CardIcon size={12} className={cardTextColor} />
                            <span className="truncate max-w-[120px]">
                              {expense.bank}({expense.card})
                            </span>
                          </span>

                          {/* 回饋標籤 */}
                          {appliedBadges.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {appliedBadges.map((badge, idx) => (
                                <span
                                  key={idx}
                                  className="bg-orange-100 text-orange-700 px-1.5 py-[1px] rounded text-[9px] whitespace-nowrap font-semibold"
                                >
                                  {badge}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0 ml-1">
                        <span className="font-bold text-lg text-gray-800 font-mono">
                          -${expense.amount}
                        </span>
                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition absolute right-3 bottom-2 md:relative md:right-auto md:bottom-auto md:mt-2">
                          <button
                            type="button"
                            onPointerDown={() => openExpenseModal(expense)}
                            className="text-gray-400 hover:text-emerald-600 p-1 bg-white border border-gray-200 rounded-full shadow-sm z-10 cursor-pointer"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            type="button"
                            onPointerDown={(e) => handleDelete(expense.id, e)}
                            className="text-red-400 hover:text-red-600 p-1 bg-white border border-gray-200 rounded-full shadow-sm z-10 cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* == 報表頁 == */}
          {activeTab === "report" && (
            <div className="space-y-6">
              {/* 1. 本期預估賺取回饋 */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-5 rounded-3xl shadow-sm border border-yellow-100">
                <h3 className="text-yellow-800 font-semibold mb-4 flex items-center gap-2">
                  <Gift size={18} /> 本期預估賺取回饋
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/60 rounded-xl p-3 text-center shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">現金回饋</p>
                    <p className="font-bold text-xl text-yellow-600 font-mono">
                      +${estimatedCashback.toLocaleString()}
                    </p>
                  </div>
                  {estimatedPoints.length === 0 && (
                    <div className="bg-white/60 rounded-xl p-3 text-center flex items-center justify-center shadow-sm">
                      <p className="text-xs text-gray-400">尚無點數資料</p>
                    </div>
                  )}
                  {estimatedPoints.map(([unit, points]) => (
                    <div
                      key={unit}
                      className="bg-white/60 rounded-xl p-3 text-center shadow-sm"
                    >
                      <p className="text-xs text-gray-500 mb-1">{unit}</p>
                      <p className="font-bold text-xl text-yellow-600 font-mono">
                        +{points.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. 各卡額度與回饋狀態 (合併顯示並自動折疊未刷卡片) */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-gray-500 font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle size={18} />
                  各卡額度與回饋狀態
                </h3>
                <div className="space-y-5">
                  {(() => {
                    const cardsToTrack = Object.values(bankCards)
                      .flat()
                      .filter((card) => {
                        const hasCreditLimit = card.limit !== null;
                        const hasRewardLimit = rewardLimitTracking.some(
                          (t) => t.cardName === card.name
                        );
                        return hasCreditLimit || hasRewardLimit;
                      })
                      .sort(
                        (a, b) =>
                          extractBillingDay(a.billing) -
                          extractBillingDay(b.billing)
                      );

                    if (cardsToTrack.length === 0) {
                      return (
                        <p className="text-sm text-gray-400 text-center py-2">
                          尚無需要追蹤的額度或回饋
                        </p>
                      );
                    }

                    const usedCards = [];
                    const unusedCards = [];

                    cardsToTrack.forEach((card) => {
                      const cardTracking = rewardLimitTracking.filter(
                        (t) => t.cardName === card.name
                      );
                      const usedAmount = cardTotals[card.name] || 0;
                      const hasTrackingSpent = cardTracking.some(
                        (t) => t.spent > 0
                      );

                      if (usedAmount > 0 || hasTrackingSpent) {
                        usedCards.push(card);
                      } else {
                        unusedCards.push(card);
                      }
                    });

                    const renderCard = (card) => {
                      const cardTracking = rewardLimitTracking.filter(
                        (t) => t.cardName === card.name
                      );
                      const hasCreditLimit = card.limit !== null;
                      const usedAmount = cardTotals[card.name] || 0;
                      const CardIcon = ICON_MAP[card.iconName] || CreditCard;
                      const cColor = card.color || "bg-gray-100 text-gray-600";

                      return (
                        <div
                          key={card.name}
                          className="flex flex-col gap-3 border-b border-gray-100 pb-5 last:border-0 last:pb-0"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${cColor}`}
                            >
                              <CardIcon size={14} />
                            </div>
                            <div className="flex-1 space-y-2">
                              <span className="font-bold text-gray-800 text-sm block">
                                {card.name}
                                {card.billing && card.billing !== "無" && (
                                  <span className="text-[10px] text-gray-400 ml-2 font-normal">
                                    結帳日: {card.billing}
                                  </span>
                                )}
                              </span>

                              {/* 總信用額度 */}
                              {hasCreditLimit && (
                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                  <div className="flex justify-between items-end mb-1.5">
                                    <span className="text-[11px] font-bold text-gray-600 flex items-center gap-1">
                                      💳 總信用額度
                                    </span>
                                    <span
                                      className={`font-mono text-xs ${
                                        card.limit - usedAmount < 0
                                          ? "text-red-500"
                                          : "text-emerald-600 font-bold"
                                      }`}
                                    >
                                      剩餘 $
                                      {(
                                        card.limit - usedAmount
                                      ).toLocaleString()}{" "}
                                      <span className="text-gray-400 font-normal text-[10px]">
                                        / {card.limit.toLocaleString()}
                                      </span>
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className={`h-1.5 rounded-full transition-all ${
                                        card.limit - usedAmount < 0
                                          ? "bg-red-500"
                                          : usedAmount / card.limit > 0.8
                                          ? "bg-orange-400"
                                          : "bg-emerald-400"
                                      }`}
                                      style={{
                                        width: `${Math.min(
                                          100,
                                          (usedAmount / card.limit) * 100
                                        )}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              )}

                              {/* 回饋追蹤 */}
                              {cardTracking.length > 0 && (
                                <div className="space-y-2">
                                  {cardTracking.map((track, idx) => {
                                    const remaining = Math.max(
                                      0,
                                      track.limit - track.spent
                                    );
                                    const percentage =
                                      Math.min(
                                        100,
                                        Math.round(
                                          (track.spent / track.limit) * 100
                                        )
                                      ) || 0;
                                    const isMaxedOut =
                                      track.spent >= track.limit;
                                    return (
                                      <div
                                        key={idx}
                                        className="bg-orange-50/60 rounded-xl p-3 border border-orange-100/50"
                                      >
                                        <div className="flex justify-between items-end mb-1.5">
                                          <div>
                                            <span className="font-bold text-orange-800 block text-[11px]">
                                              🎁 {track.ruleName}
                                            </span>
                                            <span className="text-[9px] text-orange-500/80">
                                              {track.cycleLabel}
                                            </span>
                                          </div>
                                          <span
                                            className={`font-mono text-xs ${
                                              isMaxedOut
                                                ? "text-red-500 font-bold"
                                                : "text-orange-600 font-bold"
                                            }`}
                                          >
                                            可刷剩餘 $
                                            {remaining.toLocaleString()}{" "}
                                            <span className="text-orange-400/70 font-normal text-[10px]">
                                              / {track.limit.toLocaleString()}
                                            </span>
                                          </span>
                                        </div>
                                        <div className="w-full bg-orange-200/50 rounded-full h-1.5 relative overflow-hidden">
                                          <div
                                            className={`h-1.5 rounded-full absolute top-0 left-0 transition-all ${
                                              isMaxedOut
                                                ? "bg-red-400"
                                                : "bg-orange-400"
                                            }`}
                                            style={{ width: `${percentage}%` }}
                                          ></div>
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
                        {usedCards.length === 0 && (
                          <p className="text-sm text-gray-400 text-center py-2">
                            本月尚無刷卡紀錄
                          </p>
                        )}
                        {usedCards.map(renderCard)}

                        {unusedCards.length > 0 && (
                          <div className="mt-2 pt-2">
                            <button
                              onClick={() =>
                                setShowUnusedCards(!showUnusedCards)
                              }
                              className="w-full text-center text-gray-400 text-xs py-2 hover:bg-gray-50 rounded-xl transition flex items-center justify-center gap-1 border border-dashed border-gray-200"
                            >
                              {showUnusedCards
                                ? "▲ 隱藏未刷卡片"
                                : `▼ 展開未刷卡片 (${unusedCards.length})`}
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

              {/* 3. 對帳單 (移至最下方並依照結帳日排序) */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-gray-500 font-semibold mb-4 flex items-center gap-2">
                  <CreditCard size={18} />
                  各家銀行卡費總計 (對帳單)
                </h3>
                <div className="space-y-3">
                  {bankTotals.length === 0 && (
                    <p className="text-sm text-gray-400 text-center">
                      尚無資料
                    </p>
                  )}
                  {bankTotals.map(([bankName, amount]) => {
                    const firstCard = bankCards[bankName]?.[0];
                    const BankIcon =
                      ICON_MAP[firstCard?.iconName] || CreditCard;
                    const bColor =
                      firstCard?.color || "bg-gray-100 text-gray-600";
                    return (
                      <div
                        key={bankName}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-transparent hover:border-gray-200"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${bColor}`}
                          >
                            <BankIcon size={14} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-700">
                              {bankName}
                            </span>
                            {firstCard?.billing &&
                              firstCard.billing !== "無" && (
                                <span className="text-[10px] text-gray-400">
                                  結帳日: {firstCard.billing}
                                </span>
                              )}
                          </div>
                        </div>
                        <span className="font-mono font-bold text-gray-800 text-lg">
                          ${amount.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* == 設定頁 == */}
          {activeTab === "settings" && (
            <div className="space-y-6 pt-4">
              <h2 className="text-2xl font-bold text-gray-800 px-2 flex items-center gap-2">
                <Settings size={28} className="text-emerald-600" /> 系統設定
              </h2>

              {/* === 帳號與雲端同步區塊 === */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-gray-700 font-bold flex items-center gap-2 mb-4">
                  <User size={18} className="text-indigo-500" />
                  帳號與雲端同步
                </h3>

                {user && !user.isAnonymous ? (
                  <div className="flex flex-col gap-3">
                    <div className="bg-indigo-50 text-indigo-800 p-3 rounded-xl text-sm border border-indigo-100">
                      目前登入帳號：
                      <br />
                      <span className="font-bold text-base">{user.email}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 px-3 py-3 rounded-xl text-sm font-bold transition border border-red-200"
                    >
                      <LogOut size={18} /> 登出並切換至訪客模式
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 mb-2 leading-relaxed">
                      您目前使用的是
                      <strong className="text-gray-700">
                        「免登入訪客模式」
                      </strong>
                      。<br />
                      若想在其他手機或電腦同步這些資料，請登入您的專屬帳號。
                    </p>

                    {authError && (
                      <div className="text-red-600 text-xs bg-red-50 p-2 rounded-lg border border-red-100">
                        {authError}
                      </div>
                    )}

                    <div className="space-y-2">
                      <input
                        type="email"
                        placeholder="輸入 Email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-[16px] outline-none focus:border-indigo-500 transition"
                      />
                      <input
                        type="password"
                        placeholder="輸入密碼 (至少6位數)"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-[16px] outline-none focus:border-indigo-500 transition"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={(e) => handleAuthSubmit(e, false)}
                        disabled={!authEmail || !authPassword}
                        className="flex-1 bg-indigo-100 text-indigo-700 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-200 transition disabled:opacity-50"
                      >
                        登入帳號
                      </button>
                      <button
                        onClick={(e) => handleAuthSubmit(e, true)}
                        disabled={!authEmail || !authPassword}
                        className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                      >
                        註冊並綁定
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* === 資料匯入匯出區塊 === */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-gray-700 font-bold flex items-center gap-2 mb-4">
                  <List size={18} className="text-blue-500" />
                  資料匯入與備份
                </h3>

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
                  <div
                    className={`mt-3 p-3 rounded-lg text-sm text-center font-bold shadow-inner ${
                      importStatus.includes("成功")
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {importStatus}
                  </div>
                )}
                <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
                  💡 匯入提示：CSV
                  檔案標題列需包含：日期、分類、項目說明、金額、銀行、卡別、結帳日。您可以先「匯出備份」來查看正確的格式範例。
                </p>
              </div>

              {/* 支出分類設定 */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-gray-700 font-bold flex items-center gap-2">
                    <PieChart size={18} className="text-emerald-500" />
                    支出分類管理
                  </h3>
                  <button
                    onClick={handleAddCategory}
                    className="text-emerald-600 hover:bg-emerald-50 p-1 rounded-full"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="space-y-3">
                  {categories.map((cat) => {
                    const IconComponent =
                      ICON_MAP[cat.iconName] || MoreHorizontal;
                    const isEditing = editingCategory === cat.id;
                    return (
                      <div
                        key={cat.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-transparent hover:border-gray-200"
                      >
                        {/* 編輯模式下，圖示變成可點擊開啟選擇器 */}
                        {isEditing ? (
                          <button
                            type="button"
                            onClick={() =>
                              setPickerConfig({
                                type: "category",
                                id: cat.id,
                                iconName: cat.iconName,
                                color: cat.color,
                              })
                            }
                            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-dashed border-gray-400 hover:scale-105 transition ${cat.color}`}
                            title="點擊更換圖示與顏色"
                          >
                            <IconComponent size={20} />
                          </button>
                        ) : (
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${cat.color}`}
                          >
                            <IconComponent size={20} />
                          </div>
                        )}

                        {isEditing ? (
                          <div className="flex-1 flex gap-2 items-center">
                            <input
                              type="text"
                              value={cat.name ?? ""}
                              onChange={(e) =>
                                handleUpdateCategory(
                                  cat.id,
                                  "name",
                                  e.target.value
                                )
                              }
                              className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500 font-bold"
                            />
                            <button
                              onClick={() => setEditingCategory(null)}
                              className="text-emerald-600 p-1 bg-emerald-50 rounded-lg"
                            >
                              <Check size={18} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex-1 font-bold text-gray-700">
                            {cat.name}
                          </div>
                        )}

                        {!isEditing && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => setEditingCategory(cat.id)}
                              className="text-gray-400 hover:text-emerald-600 p-1"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="text-gray-400 hover:text-red-500 p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 信用卡與動態回饋管理 */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                <div className="mb-4">
                  <h3 className="text-gray-700 font-bold flex items-center gap-2 mb-2">
                    <CreditCard size={18} className="text-emerald-500" />
                    銀行與回饋管理
                  </h3>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="新增銀行 (例: 渣打)"
                      value={newBankName ?? ""}
                      onChange={(e) => setNewBankName(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => {
                        if (
                          newBankName.trim() &&
                          !bankCards[newBankName.trim()]
                        ) {
                          setBankCards({
                            ...bankCards,
                            [newBankName.trim()]: [],
                          });
                          setNewBankName("");
                        }
                      }}
                      className="bg-emerald-100 text-emerald-700 px-3 rounded-xl hover:bg-emerald-200 font-medium"
                    >
                      新增
                    </button>
                    {/* 加入一鍵還原預設的終極按鈕 */}
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "確定要還原為系統最新預設的銀行與回饋嗎？(這會覆蓋掉您目前自訂的卡片)"
                          )
                        ) {
                          setBankCards(DEFAULT_BANK_CARDS);
                          saveSettingsToCloud(categories, DEFAULT_BANK_CARDS);
                        }
                      }}
                      className="bg-red-50 text-red-600 px-3 rounded-xl hover:bg-red-100 font-medium whitespace-nowrap"
                      title="如果您的卡片設定跑掉，可以點此重置"
                    >
                      還原預設
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {sortedBankNames.map((bankName) => {
                    const cards = bankCards[bankName];
                    return (
                      <div
                        key={bankName}
                        className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
                      >
                        <div
                          className="bg-gray-50 p-3 flex justify-between items-center border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition"
                          onClick={() =>
                            setEditingBank(
                              editingBank === bankName ? null : bankName
                            )
                          }
                        >
                          <span className="font-bold text-gray-700 flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                cards[0]?.color || "bg-gray-200 text-gray-600"
                              }`}
                            >
                              {React.createElement(
                                ICON_MAP[cards[0]?.iconName] || Landmark,
                                { size: 12 }
                              )}
                            </div>
                            {bankName}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                              {cards.length} 張卡
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm("確定刪除此銀行？")) {
                                  const nb = { ...bankCards };
                                  delete nb[bankName];
                                  setBankCards(nb);
                                  saveSettingsToCloud(categories, nb);
                                }
                              }}
                              className="text-gray-400 hover:text-red-500 p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {editingBank === bankName && (
                          <div className="p-3 bg-white space-y-3">
                            {cards.map((card, idx) => {
                              const CardIcon =
                                ICON_MAP[card.iconName] || CreditCard;
                              return (
                                <div key={idx}>
                                  {editingCardKey === `${bankName}-${idx}` ? (
                                    <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3 relative">
                                      <button
                                        onClick={() => setEditingCardKey(null)}
                                        className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                                      >
                                        <X size={18} />
                                      </button>
                                      <p className="text-xs font-bold text-emerald-700 mb-2 flex items-center gap-1">
                                        <Edit2 size={14} /> 編輯卡片設定
                                      </p>

                                      <div className="flex items-center gap-2 mb-2">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setPickerConfig({
                                              type: "cardForm",
                                              iconName: cardForm.iconName,
                                              color: cardForm.color,
                                            })
                                          }
                                          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-dashed border-gray-400 hover:scale-105 transition ${
                                            cardForm.color ||
                                            "bg-gray-100 text-gray-600"
                                          }`}
                                          title="點擊更換卡片圖示"
                                        >
                                          {React.createElement(
                                            ICON_MAP[cardForm.iconName] ||
                                              CreditCard,
                                            { size: 24 }
                                          )}
                                        </button>
                                        <input
                                          type="text"
                                          placeholder="卡片名稱 (必填)"
                                          value={cardForm.name ?? ""}
                                          onChange={(e) =>
                                            setCardForm({
                                              ...cardForm,
                                              name: e.target.value,
                                            })
                                          }
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[16px] font-bold flex-1"
                                        />
                                      </div>

                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          placeholder="結帳日 (例: 每月12日)"
                                          value={cardForm.billing ?? ""}
                                          onChange={(e) =>
                                            setCardForm({
                                              ...cardForm,
                                              billing: e.target.value,
                                            })
                                          }
                                          className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-[16px]"
                                        />
                                        <input
                                          type="number"
                                          placeholder="信用額度"
                                          value={cardForm.limit ?? ""}
                                          onChange={(e) =>
                                            setCardForm({
                                              ...cardForm,
                                              limit: e.target.value,
                                            })
                                          }
                                          className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-[16px]"
                                        />
                                      </div>

                                      <hr className="border-emerald-200 my-2" />
                                      <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                                          <Gift size={14} /> 回饋清單
                                          (支援多筆疊加)
                                        </p>
                                        <select
                                          value={
                                            cardForm.rewardCycle ?? "calendar"
                                          }
                                          onChange={(e) =>
                                            setCardForm({
                                              ...cardForm,
                                              rewardCycle: e.target.value,
                                            })
                                          }
                                          className="border border-emerald-300 bg-white rounded text-xs px-2 py-1 outline-none text-emerald-800"
                                        >
                                          <option value="calendar">
                                            依月曆月結算
                                          </option>
                                          <option value="billing">
                                            依結帳週期結算
                                          </option>
                                        </select>
                                      </div>

                                      <div className="space-y-2">
                                        {cardForm.rewards.map((rule, rIdx) => (
                                          <div
                                            key={rIdx}
                                            className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm"
                                          >
                                            <div className="flex justify-between items-center mb-2">
                                              <input
                                                type="text"
                                                placeholder="回饋名稱 (例: 國內一般 / 網購加碼)"
                                                value={rule.name ?? ""}
                                                onChange={(e) =>
                                                  updateRewardRuleInForm(
                                                    rIdx,
                                                    "name",
                                                    e.target.value
                                                  )
                                                }
                                                className="font-bold text-sm text-gray-800 border-b border-gray-200 outline-none w-2/3 pb-1"
                                              />
                                              <button
                                                onClick={() =>
                                                  removeRewardRuleFromForm(rIdx)
                                                }
                                                className="text-red-400 hover:text-red-600"
                                              >
                                                <X size={16} />
                                              </button>
                                            </div>

                                            {rule.type === "cashback" ? (
                                              <div className="flex gap-2">
                                                <div className="flex items-center border border-gray-200 rounded px-2 w-1/2">
                                                  <span className="text-xs text-gray-500 mr-1">
                                                    回饋
                                                  </span>
                                                  <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="比例"
                                                    value={rule.rate ?? ""}
                                                    onChange={(e) =>
                                                      updateRewardRuleInForm(
                                                        rIdx,
                                                        "rate",
                                                        e.target.value
                                                      )
                                                    }
                                                    className="w-full text-right text-sm py-1 outline-none font-mono"
                                                  />
                                                  <span className="text-gray-500 text-xs ml-1">
                                                    %
                                                  </span>
                                                </div>
                                                <div className="flex items-center border border-gray-200 rounded px-2 w-1/2">
                                                  <span className="text-xs text-gray-500 mr-1">
                                                    上限$
                                                  </span>
                                                  <input
                                                    type="number"
                                                    placeholder="無上限"
                                                    value={rule.limit ?? ""}
                                                    onChange={(e) =>
                                                      updateRewardRuleInForm(
                                                        rIdx,
                                                        "limit",
                                                        e.target.value
                                                      )
                                                    }
                                                    className="w-full text-right text-sm py-1 outline-none font-mono"
                                                  />
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                                  每滿${" "}
                                                  <input
                                                    type="number"
                                                    value={rule.spend ?? ""}
                                                    onChange={(e) =>
                                                      updateRewardRuleInForm(
                                                        rIdx,
                                                        "spend",
                                                        e.target.value
                                                      )
                                                    }
                                                    className="w-12 border-b border-gray-300 text-center outline-none font-bold text-indigo-600"
                                                  />
                                                  送{" "}
                                                  <input
                                                    type="number"
                                                    value={rule.earn ?? ""}
                                                    onChange={(e) =>
                                                      updateRewardRuleInForm(
                                                        rIdx,
                                                        "earn",
                                                        e.target.value
                                                      )
                                                    }
                                                    className="w-12 border-b border-gray-300 text-center outline-none font-bold text-indigo-600"
                                                  />
                                                  <input
                                                    type="text"
                                                    placeholder="點數單位"
                                                    value={rule.unit ?? ""}
                                                    onChange={(e) =>
                                                      updateRewardRuleInForm(
                                                        rIdx,
                                                        "unit",
                                                        e.target.value
                                                      )
                                                    }
                                                    className="flex-1 border-b border-gray-300 px-1 outline-none"
                                                  />
                                                </div>
                                                <div className="flex items-center border border-gray-200 rounded px-2 w-full">
                                                  <span className="text-xs text-gray-500 mr-1">
                                                    可刷上限$
                                                  </span>
                                                  <input
                                                    type="number"
                                                    placeholder="無上限"
                                                    value={rule.limit ?? ""}
                                                    onChange={(e) =>
                                                      updateRewardRuleInForm(
                                                        rIdx,
                                                        "limit",
                                                        e.target.value
                                                      )
                                                    }
                                                    className="w-full text-right text-sm py-1 outline-none font-mono"
                                                  />
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>

                                      <div className="flex gap-2 mt-2">
                                        <button
                                          onClick={() =>
                                            addRewardRuleToForm("cashback")
                                          }
                                          className="flex-1 border border-dashed border-emerald-400 text-emerald-700 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-100"
                                        >
                                          + 現金回饋
                                        </button>
                                        <button
                                          onClick={() =>
                                            addRewardRuleToForm("points")
                                          }
                                          className="flex-1 border border-dashed border-indigo-400 text-indigo-700 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-100"
                                        >
                                          + 紅利點數
                                        </button>
                                      </div>

                                      <button
                                        onClick={() =>
                                          saveCardForm(bankName, idx)
                                        }
                                        className="w-full bg-emerald-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition mt-3 flex justify-center items-center gap-2"
                                      >
                                        <Save size={16} /> 儲存卡片設定
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex justify-between items-start bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:border-emerald-200 transition group mb-2">
                                      <div className="space-y-1.5 flex-1">
                                        <div className="font-bold text-gray-800 text-base flex items-center gap-2">
                                          <div
                                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                                              card.color ||
                                              "bg-gray-100 text-gray-600"
                                            }`}
                                          >
                                            <CardIcon size={12} />
                                          </div>
                                          {card.name}
                                          {card.rewards?.length > 0 &&
                                            card.rewardCycle === "billing" && (
                                              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-normal">
                                                依結帳週期
                                              </span>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1 mt-1 pl-8">
                                          {card.rewards?.map((r, i) => (
                                            <span
                                              key={i}
                                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded self-start ${
                                                r.type === "cashback"
                                                  ? "text-emerald-700 bg-emerald-50 border border-emerald-100"
                                                  : "text-indigo-700 bg-indigo-50 border border-indigo-100"
                                              }`}
                                            >
                                              【{r.name}】{" "}
                                              {r.type === "cashback"
                                                ? `${r.rate}%`
                                                : `滿${r.spend}送${r.earn}${r.unit}`}{" "}
                                              {r.limit
                                                ? `(上限刷$${r.limit})`
                                                : ""}
                                            </span>
                                          ))}
                                          {(!card.rewards ||
                                            card.rewards.length === 0) && (
                                            <span className="text-[10px] text-gray-400">
                                              無特殊回饋設定
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex gap-1 shrink-0">
                                        <button
                                          onClick={() =>
                                            openCardForm(bankName, card, idx)
                                          }
                                          className="text-gray-400 hover:text-emerald-600 p-1 bg-gray-50 rounded"
                                        >
                                          <Edit2 size={16} />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}

                            {editingCardKey === `new-${bankName}` ? (
                              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3 relative mt-2">
                                <button
                                  onClick={() => setEditingCardKey(null)}
                                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                                >
                                  <X size={18} />
                                </button>
                                <p className="text-xs font-bold text-emerald-700 mb-2 flex items-center gap-1">
                                  <Plus size={14} /> 新增卡片
                                </p>

                                <div className="flex items-center gap-2 mb-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPickerConfig({
                                        type: "cardForm",
                                        iconName: cardForm.iconName,
                                        color: cardForm.color,
                                      })
                                    }
                                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-dashed border-gray-400 hover:scale-105 transition ${
                                      cardForm.color ||
                                      "bg-gray-100 text-gray-600"
                                    }`}
                                    title="點擊更換卡片圖示"
                                  >
                                    {React.createElement(
                                      ICON_MAP[cardForm.iconName] || CreditCard,
                                      { size: 24 }
                                    )}
                                  </button>
                                  <input
                                    type="text"
                                    placeholder="卡片名稱 (必填)"
                                    value={cardForm.name ?? ""}
                                    onChange={(e) =>
                                      setCardForm({
                                        ...cardForm,
                                        name: e.target.value,
                                      })
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[16px] font-bold flex-1"
                                  />
                                </div>

                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="結帳日"
                                    value={cardForm.billing ?? ""}
                                    onChange={(e) =>
                                      setCardForm({
                                        ...cardForm,
                                        billing: e.target.value,
                                      })
                                    }
                                    className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-[16px]"
                                  />
                                  <input
                                    type="number"
                                    placeholder="信用額度"
                                    value={cardForm.limit ?? ""}
                                    onChange={(e) =>
                                      setCardForm({
                                        ...cardForm,
                                        limit: e.target.value,
                                      })
                                    }
                                    className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-[16px]"
                                  />
                                </div>
                                <button
                                  onClick={() => saveCardForm(bankName, -1)}
                                  className="w-full bg-emerald-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition mt-2"
                                >
                                  先建立卡片，再編輯回饋規則
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => openCardForm(bankName, null, -1)}
                                className="w-full bg-gray-50 text-emerald-600 py-2 rounded-xl text-sm font-medium hover:bg-gray-100 border border-dashed border-gray-300 mt-2"
                              >
                                + 新增卡片
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
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
            <div className="bg-white w-full max-w-md md:rounded-3xl rounded-t-3xl p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Palette size={20} className="text-emerald-600" /> 自訂外觀
                </h3>
                <button
                  onClick={() => setPickerConfig(null)}
                  className="p-1 text-gray-400 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              {/* 即時預覽區 */}
              <div className="flex justify-center mb-6">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md ${pickerConfig.color}`}
                >
                  {React.createElement(
                    ICON_MAP[pickerConfig.iconName] || MoreHorizontal,
                    { size: 32 }
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold text-gray-600 mb-2">
                    1. 選擇顏色
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c}
                        onClick={() =>
                          setPickerConfig({ ...pickerConfig, color: c })
                        }
                        className={`w-8 h-8 rounded-full shadow-sm border-2 ${
                          pickerConfig.color === c
                            ? "border-gray-800 scale-110"
                            : "border-transparent"
                        } ${c.split(" ")[0].replace("100", "400")}`}
                      ></button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-600 mb-2">
                    2. 選擇圖示
                  </p>
                  <div className="grid grid-cols-6 gap-3 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200">
                    {AVAILABLE_ICONS.map((iconKey) => {
                      const IconComp = ICON_MAP[iconKey];
                      const isSelected = pickerConfig.iconName === iconKey;
                      return (
                        <button
                          key={iconKey}
                          onClick={() =>
                            setPickerConfig({
                              ...pickerConfig,
                              iconName: iconKey,
                            })
                          }
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                            isSelected
                              ? "bg-emerald-600 text-white shadow-md scale-110"
                              : "bg-white text-gray-600 hover:bg-gray-200 shadow-sm border border-gray-200"
                          }`}
                        >
                          <IconComp size={20} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  handlePickerSave(pickerConfig.iconName, pickerConfig.color)
                }
                className="w-full bg-gray-800 text-white font-bold py-3 rounded-xl mt-6 hover:bg-black transition active:scale-95"
              >
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
          className="absolute bottom-20 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-400 hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all z-30"
        >
          <Plus size={30} />
        </button>

        {/* ========================================== */}
        {/* 底部導覽列 - 三顆按鈕完美平均分配 */}
        {/* ========================================== */}
        <div className="mt-auto w-full bg-white border-t border-gray-200 px-6 py-3 grid grid-cols-3 place-items-center z-20 pb-safe shrink-0">
          <button
            onClick={() => setActiveTab("list")}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === "list" ? "text-emerald-600" : "text-gray-400"
            }`}
          >
            <List size={24} />
            <span className="text-xs font-bold">明細</span>
          </button>
          <button
            onClick={() => setActiveTab("report")}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === "report" ? "text-emerald-600" : "text-gray-400"
            }`}
          >
            <PieChart size={24} />
            <span className="text-xs font-bold">報表</span>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === "settings" ? "text-emerald-600" : "text-gray-400"
            }`}
          >
            <Settings size={24} />
            <span className="text-xs font-bold">設定</span>
          </button>
        </div>

        {/* 新增/編輯支出 Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-end md:items-center backdrop-blur-sm p-0 md:p-4 transition-opacity">
            <div className="bg-white w-full max-w-md md:rounded-3xl rounded-t-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingExpenseId ? "編輯明細" : "新增支出"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveExpense} className="space-y-4">
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                  <label className="text-emerald-700 text-sm font-semibold mb-1 block">
                    金額 (NT$)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount ?? ""}
                    onChange={handleFormChange}
                    placeholder="0"
                    required
                    className="w-full bg-transparent text-4xl font-bold text-emerald-800 placeholder-emerald-300 outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-600 text-sm font-medium mb-1 block">
                      日期
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date ?? ""}
                      onChange={handleFormChange}
                      required
                      className="w-full border border-gray-300 rounded-xl p-3 text-[16px] outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 text-sm font-medium mb-1 block">
                      分類
                    </label>
                    <select
                      name="category"
                      value={formData.category ?? ""}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-xl p-3 text-[16px] outline-none focus:border-emerald-500 bg-white"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-gray-600 text-sm font-medium mb-1 block">
                    項目說明
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description ?? ""}
                    onChange={handleFormChange}
                    placeholder="例如：午餐、搭捷運"
                    required
                    className="w-full border border-gray-300 rounded-xl p-3 text-[16px] outline-none focus:border-emerald-500"
                  />
                </div>

                <hr className="border-gray-200" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-600 text-sm font-medium mb-1 block">
                      銀行/支付
                    </label>
                    <select
                      name="bank"
                      value={formData.bank ?? ""}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-xl p-3 text-[16px] outline-none focus:border-emerald-500 bg-white"
                    >
                      {sortedBankNames.map((bank) => (
                        <option key={bank} value={bank}>
                          {bank}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-600 text-sm font-medium mb-1 block">
                      卡別
                    </label>
                    <select
                      name="card"
                      value={formData.card ?? ""}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-xl p-3 text-[16px] outline-none focus:border-emerald-500 bg-white"
                    >
                      {bankCards[formData.bank]?.map((card) => (
                        <option key={card.name} value={card.name}>
                          {card.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 動態渲染該卡片專屬的「回饋標籤」供點選 */}
                {bankCards[formData.bank]?.find((c) => c.name === formData.card)
                  ?.rewards?.length > 0 && (
                  <div>
                    <label className="text-gray-600 text-sm font-medium mb-2 block flex items-center gap-1">
                      <Gift size={16} /> 套用回饋項目 (可複選疊加)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {bankCards[formData.bank]
                        .find((c) => c.name === formData.card)
                        .rewards.map((rule) => {
                          const isSelected = formData.appliedRewards.includes(
                            rule.id
                          );
                          return (
                            <div
                              key={rule.id}
                              onClick={() => toggleRewardRule(rule.id)}
                              className={`cursor-pointer px-3 py-1.5 rounded-full border text-xs font-bold transition select-none ${
                                isSelected
                                  ? "bg-emerald-100 border-emerald-400 text-emerald-800"
                                  : "bg-gray-50 border-gray-200 text-gray-500"
                              }`}
                            >
                              {rule.name}{" "}
                              {rule.type === "cashback"
                                ? `${rule.rate}%`
                                : `(送${rule.unit})`}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-emerald-600 text-white font-bold text-lg py-4 rounded-2xl mt-2 hover:bg-emerald-700 transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <Check size={24} />
                  {editingExpenseId ? "更新紀錄" : "儲存紀錄"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
