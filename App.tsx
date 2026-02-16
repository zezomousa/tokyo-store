
import React, { useState, useEffect, useContext, createContext, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
  ShoppingCart, LogOut, Shield, CreditCard, 
  Heart, Search, Trash2, Edit, X, Check, ArrowRight, 
  Mail, Phone, Gamepad2, Globe, Sparkles, Clock, 
  CheckCircle2, XCircle, Flame, Layers, ClipboardList, Eye, Banknote, Activity, Package, Ticket, ChevronRight, Loader2, ReceiptText, TrendingUp,
  Share2, Lock, UserCheck, UserPlus, Users, Box, CalendarDays, PlusCircle, Info, Settings, UserCog, History, ShoppingBag, Upload, ImageIcon,
  Facebook, MessageCircle, DollarSign, User, EyeOff
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Product, User as UserType, CartItem, Order, PaymentMethod, ProductOption, StoreConfig, Category, Coupon } from './types';
import { INITIAL_PRODUCTS, MOCK_ADMIN_USER } from './constants';
import { translations } from './translations';
import GeminiAssistant from './components/GeminiAssistant';

// --- Helper for Persistence ---
const getStorage = (key: string, defaultValue: any) => {
  const saved = localStorage.getItem(key);
  try {
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// --- Contexts ---
type Language = 'en' | 'ar';
interface LanguageContextType { language: Language; setLanguage: (lang: Language) => void; t: any; dir: 'ltr' | 'rtl'; }
interface AuthContextType { user: UserType | null; login: (userData: UserType) => void; logout: () => void; }
interface CartContextType { cart: CartItem[]; addToCart: (product: Product, option?: ProductOption, quantity?: number) => void; removeFromCart: (itemId: string, optionId?: string) => void; clearCart: () => void; total: number; }
interface WishlistContextType { wishlist: Product[]; toggleWishlist: (product: Product) => void; isInWishlist: (productId: string) => boolean; }
interface ProductContextType { products: Product[]; addProduct: (product: Product) => void; updateProduct: (product: Product) => void; deleteProduct: (id: string) => void; }
interface StoreContextType { config: StoreConfig; updateConfig: (config: StoreConfig) => void; users: UserType[]; setUsers: React.Dispatch<React.SetStateAction<UserType[]>>; orders: Order[]; addOrder: (order: Order) => void; deleteOrder: (id: string) => void; updateOrderStatus: (orderId: string, status: Order['status']) => void; categories: Category[]; setCategories: React.Dispatch<React.SetStateAction<Category[]>>; coupons: Coupon[]; setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>; incrementCouponUsage: (id: string) => void; }

export const LanguageContext = createContext<LanguageContextType>({} as LanguageContextType);
const AuthContext = createContext<AuthContextType>({} as AuthContextType);
const CartContext = createContext<CartContextType>({} as CartContextType);
const WishlistContext = createContext<WishlistContextType>({} as WishlistContextType);
const ProductContext = createContext<ProductContextType>({} as ProductContextType);
const StoreContext = createContext<StoreContextType>({} as StoreContextType);

// --- Shared Components ---

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error' | 'info', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in-up border backdrop-blur-md ${
      type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' : 
      type === 'error' ? 'bg-rose-500/90 border-rose-400 text-white' : 
      'bg-indigo-500/90 border-indigo-400 text-white'
    }`}>
      {type === 'success' ? <CheckCircle2 size={20} /> : type === 'error' ? <XCircle size={20} /> : <Info size={20} />}
      <span className="font-black text-sm uppercase tracking-widest">{message}</span>
    </div>
  );
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const { wishlist } = useContext(WishlistContext);
  const { t, language, setLanguage, dir } = useContext(LanguageContext);
  const { config } = useContext(StoreContext);
  const navigate = useNavigate();

  const isAdmin = useMemo(() => user?.role === 'admin', [user]);

  return (
    <nav className="glass-panel sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className={`flex items-center cursor-pointer group shrink-0 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`} onClick={() => navigate('/')}>
            <div className={`bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 w-10 h-10 flex items-center justify-center overflow-hidden`}>
              {config.iconUrl ? (
                <img src={config.iconUrl} className="w-full h-full object-cover" alt="Store Icon" />
              ) : (
                <Gamepad2 className="text-white h-6 w-6" />
              )}
            </div>
            <div className={`flex flex-col ${dir === 'rtl' ? 'mr-3 text-right' : 'ml-3 text-left'}`}>
              <span className="block text-xl font-black text-white uppercase tracking-tight leading-none">{config.name}</span>
              <span className="text-[10px] font-bold text-indigo-400 uppercase opacity-70 mt-1">Digital Market EG</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-8 rtl:space-x-reverse mx-4">
            <Link to="/" className="text-slate-400 hover:text-white font-bold text-sm transition-all">{t.nav_store}</Link>
            {user && <Link to="/orders" className="text-slate-400 hover:text-white font-bold text-sm transition-all flex items-center gap-2"><History size={16}/> {t.nav_orders}</Link>}
            {isAdmin && (
              <Link to="/admin" className="text-indigo-400 hover:text-indigo-300 font-black text-sm flex items-center gap-2 bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/30">
                <Shield size={16} /> {t.nav_dashboard}
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')} className="p-2 text-slate-400 hover:text-white transition-colors font-black text-xs">
              {language === 'en' ? 'AR' : 'EN'}
            </button>
            <Link to="/wishlist" className="relative p-2 text-slate-400 hover:text-pink-500 transition-all">
              <Heart size={20} />
              {wishlist.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-black flex items-center justify-center text-white bg-pink-600 rounded-full">{wishlist.length}</span>}
            </Link>
            <Link to="/checkout" className="relative p-2 text-slate-400 hover:text-indigo-500 transition-all">
              <ShoppingCart size={20} />
              {cart.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-black flex items-center justify-center text-white bg-indigo-600 rounded-full">{cart.length}</span>}
            </Link>
            {user ? (
              <div className={`flex items-center gap-3 bg-slate-800/50 py-1.5 px-3 rounded-full border border-slate-700/50 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <span className="hidden sm:inline text-xs font-black text-white">{user.name.split(' ')[0]}</span>
                <button onClick={() => { logout(); navigate('/'); }} className="p-1 text-slate-500 hover:text-red-500 transition-colors"><LogOut size={16} /></button>
              </div>
            ) : (
              <Link to="/login" className="px-4 py-2 text-sm font-black text-white bg-indigo-600 rounded-full shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">{t.nav_login}</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const ProductCard: React.FC<{ product: Product; index: number; isHot?: boolean; onNotify: (m: string, t: 'success' | 'info') => void }> = ({ product, index, isHot, onNotify }) => {
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const { t, dir, language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/#/product/${product.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      onNotify(t.toast_copied, 'info');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isWishlisted = isInWishlist(product.id);
  const displayName = language === 'ar' && product.nameAr ? product.nameAr : product.name;
  const displayDesc = language === 'ar' && product.descriptionAr ? product.descriptionAr : product.description;

  return (
    <div 
      className="bg-slate-800/40 backdrop-blur-md rounded-2xl overflow-hidden border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-500 group relative flex flex-col h-full hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 animate-fade-in-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="relative h-56 overflow-hidden shrink-0 cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
        <img src={product.image} alt={displayName} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
        
        {isHot && (
          <div className={`absolute top-4 ${dir === 'rtl' ? 'right-4' : 'left-4'} animate-bounce`}>
            <span className="flex items-center gap-1 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
              <Flame size={12} fill="white" /> {language === 'ar' ? 'مميز' : 'HOT'}
            </span>
          </div>
        )}

        <div className={`absolute top-4 ${dir === 'rtl' ? 'left-4' : 'right-4'} flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-2 group-hover:translate-x-0`}>
          <button onClick={(e) => { e.stopPropagation(); toggleWishlist(product); onNotify(isWishlisted ? t.toast_removed_wishlist : t.toast_added_wishlist, 'success'); }} className={`p-2.5 rounded-xl backdrop-blur-md border transition-all duration-300 ${isWishlisted ? 'bg-pink-600 border-pink-500 text-white shadow-lg shadow-pink-600/20' : 'bg-black/40 border-white/10 text-slate-300 hover:text-white hover:bg-black/60'}`}>
            <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
          <button onClick={handleShare} className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-slate-300 hover:text-white hover:bg-black/60 backdrop-blur-md transition-all">
            <Share2 size={16} />
          </button>
        </div>
      </div>
      <div className={`p-5 flex flex-col flex-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
        <h3 className="text-lg font-black text-white mb-2 leading-tight cursor-pointer hover:text-indigo-400 transition-colors" onClick={() => navigate(`/product/${product.id}`)}>
          {displayName}
        </h3>
        <p className="text-slate-500 text-xs mb-6 line-clamp-2 flex-1 font-medium">{displayDesc}</p>
        <div className={`flex items-center justify-between mt-auto pt-4 border-t border-slate-700/50 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{t.prod_starts_from}</span>
            <span className={`text-xl font-black text-white ${dir === 'rtl' ? 'flex flex-row-reverse gap-1 justify-end' : ''}`}>
              {product.basePrice.toLocaleString()} <span className="text-[10px] text-indigo-500">{t.currency}</span>
            </span>
          </div>
          <button onClick={() => navigate(`/product/${product.id}`)} className="bg-white hover:bg-indigo-500 text-black hover:text-white px-4 py-2.5 rounded-xl text-[10px] font-black transition-all shadow-lg active:scale-95 flex items-center gap-2">
            {t.prod_view}
          </button>
        </div>
      </div>
    </div>
  );
};

/* --- Page Components --- */

const HomePage = ({ onNotify }: { onNotify: (m: string, t: 'success' | 'info') => void }) => {
  const { products } = useContext(ProductContext);
  const { t, language, dir } = useContext(LanguageContext);
  const { categories } = useContext(StoreContext);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');

  const filtered = products.filter(p => {
    const pName = (language === 'ar' && p.nameAr ? p.nameAr : p.name).toLowerCase();
    const pDesc = (language === 'ar' && p.descriptionAr ? p.descriptionAr : p.description).toLowerCase();
    const sTerm = search.toLowerCase();
    const matchesSearch = pName.includes(sTerm) || pDesc.includes(sTerm);
    const matchesCat = selectedCat === 'All' || p.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="pb-32">
      <div className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-slate-950/60 z-10" />
          <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover" alt="Hero Background" />
        </div>
        
        <div className="relative z-20 text-center max-w-4xl px-4 animate-fade-in-up">
          <span className="text-indigo-500 font-black uppercase tracking-[0.5em] text-sm mb-4 block">{t.hero_welcome}</span>
          <h1 className="text-7xl md:text-9xl font-black text-white uppercase tracking-tighter leading-none mb-6">
            {t.hero_title_1} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">{t.hero_title_2}</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-bold max-w-2xl mx-auto mb-12 opacity-80">{t.hero_subtitle}</p>
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-6 ${dir === 'rtl' ? 'sm:flex-row-reverse' : ''}`}>
             <button className="w-full sm:w-auto bg-white text-black px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-2xl shadow-white/10 active:scale-95">{t.explore_drops}</button>
             <button className="w-full sm:w-auto bg-slate-900/50 backdrop-blur-md border border-slate-700 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all">{t.support_center}</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-30">
        <div className={`bg-slate-900/80 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-slate-700/50 shadow-2xl flex flex-col md:flex-row gap-6 ${dir === 'rtl' ? 'md:flex-row-reverse' : ''}`}>
          <div className="flex-1 relative group">
            <Search className={`absolute ${dir === 'rtl' ? 'right-6' : 'left-6'} top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors`} size={20} />
            <input 
              className={`w-full bg-slate-950/50 border border-slate-700/50 rounded-2xl p-5 ${dir === 'rtl' ? 'pr-16 pl-6 text-right' : 'pl-16 pr-6 text-left'} text-white font-bold focus:border-indigo-600 outline-none transition-all placeholder:text-slate-600 shadow-inner`} 
              placeholder={t.search_placeholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className={`flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
             <button 
              onClick={() => setSelectedCat('All')} 
              className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCat === 'All' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'bg-slate-800/50 text-slate-500 hover:text-white border border-slate-700/50'}`}
             >
               {t.cat_all}
             </button>
             {categories.map(cat => (
               <button 
                key={cat.id} 
                onClick={() => setSelectedCat(cat.name)}
                className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCat === cat.name ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'bg-slate-800/50 text-slate-500 hover:text-white border border-slate-700/50'}`}
               >
                 {language === 'ar' && cat.nameAr ? cat.nameAr : cat.name}
               </button>
             ))}
          </div>
        </div>

        <div className="mt-20">
          <div className={`flex items-center justify-between mb-12 ${dir === 'rtl' ? 'flex-row-reverse text-right' : 'text-left'}`}>
            <h2 className={`text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <Layers className="text-indigo-500" /> {selectedCat === 'All' ? t.home_trending : (categories.find(c => c.name === selectedCat)?.nameAr || selectedCat)}
            </h2>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{filtered.length} {t.items_available}</div>
          </div>
          
          {filtered.length === 0 ? (
            <div className="text-center py-32 bg-slate-800/20 rounded-[3rem] border border-slate-700/50">
               <Search size={64} className="text-slate-700 mx-auto mb-6" />
               <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mb-8">{t.no_results}</p>
               <button onClick={() => { setSearch(''); setSelectedCat('All'); }} className="bg-indigo-600 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-white shadow-xl shadow-indigo-600/20">{t.clear_filters}</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filtered.map((p, idx) => <ProductCard key={p.id} product={p} index={idx} isHot={idx < 2} onNotify={onNotify} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductDetailPage = ({ onNotify }: { onNotify: (m: string, t: 'success' | 'info') => void }) => {
  const { id } = useParams();
  const { products } = useContext(ProductContext);
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const { t, language, dir } = useContext(LanguageContext);
  const navigate = useNavigate();
  const product = products.find(p => p.id === id);

  const [selectedOption, setSelectedOption] = useState<ProductOption | undefined>(product?.options?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (product && product.options && !selectedOption) {
      setSelectedOption(product.options[0]);
    }
  }, [product, selectedOption]);

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center pt-24">
      <div className="text-center">
        <h2 className="text-3xl font-black text-white mb-4 uppercase">{t.prod_not_found}</h2>
        <Link to="/" className="text-indigo-500 font-bold uppercase tracking-widest">{t.back_to_store}</Link>
      </div>
    </div>
  );

  const handleAddToCart = () => {
    setAdding(true);
    setTimeout(() => {
      addToCart(product, selectedOption, quantity);
      setAdding(false);
      onNotify(t.toast_added_cart, 'success');
    }, 600);
  };

  const isWishlisted = isInWishlist(product.id);
  const displayName = language === 'ar' && product.nameAr ? product.nameAr : product.name;
  const displayDesc = language === 'ar' && product.descriptionAr ? product.descriptionAr : product.description;

  return (
    <div className="min-h-screen pt-32 pb-32 px-4">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => navigate(-1)} className={`mb-12 flex items-center gap-2 text-slate-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest group ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
          <ArrowRight className={`${dir === 'rtl' ? 'rotate-0' : 'rotate-180'} group-hover:${dir === 'rtl' ? 'translate-x-1' : '-translate-x-1'} transition-transform`} /> {t.back}
        </button>

        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-16 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
          <div className="lg:col-span-7">
            <div className="relative group rounded-[3rem] overflow-hidden border border-slate-700/50 shadow-2xl">
              <img src={product.image} className="w-full aspect-[4/3] object-cover group-hover:scale-110 transition-transform duration-1000" alt={displayName} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
              <button 
                onClick={() => { toggleWishlist(product); onNotify(isWishlisted ? t.toast_removed_wishlist : t.toast_added_wishlist, 'success'); }} 
                className={`absolute top-8 ${dir === 'rtl' ? 'left-8' : 'right-8'} p-4 rounded-2xl backdrop-blur-md border transition-all ${isWishlisted ? 'bg-pink-600 border-pink-500 text-white' : 'bg-black/40 border-white/10 text-white hover:bg-black/60'}`}
              >
                <Heart size={24} fill={isWishlisted ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="mb-8">
               <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-4 block">{product.category}</span>
               <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-6 leading-none">{displayName}</h1>
               <p className="text-slate-400 font-bold text-lg leading-relaxed">{displayDesc}</p>
            </div>

            {product.options && (
              <div className="mb-10 space-y-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.prod_select_pkg}</h3>
                <div className="grid grid-cols-2 gap-4">
                  {product.options.map(opt => (
                    <button 
                      key={opt.id} 
                      onClick={() => setSelectedOption(opt)}
                      className={`p-6 rounded-2xl border-2 transition-all flex flex-col gap-1 ${dir === 'rtl' ? 'text-right' : 'text-left'} ${selectedOption?.id === opt.id ? 'border-indigo-600 bg-indigo-600/10' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'}`}
                    >
                      <span className={`font-black uppercase text-[10px] ${selectedOption?.id === opt.id ? 'text-indigo-400' : 'text-slate-500'}`}>{opt.label}</span>
                      <span className="text-lg font-black text-white">{opt.price} {t.currency}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={`flex items-center gap-8 mb-12 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
               <div className="flex flex-col gap-2">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.prod_qty}</span>
                 <div className={`flex items-center bg-slate-900 border border-slate-700 rounded-2xl p-1 shadow-inner ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                   <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-white hover:bg-slate-800 rounded-xl transition-all"><Trash2 size={16}/></button>
                   <span className="w-12 text-center font-black text-white">{quantity}</span>
                   <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 flex items-center justify-center text-white hover:bg-slate-800 rounded-xl transition-all"><PlusCircle size={16}/></button>
                 </div>
               </div>
               <div className={`flex-1 ${dir === 'rtl' ? 'text-left' : 'text-right'}`}>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{t.total}</span>
                 <div className="text-4xl font-black text-white">{(selectedOption?.price || product.basePrice) * quantity} <span className="text-sm text-indigo-500">{t.currency}</span></div>
               </div>
            </div>

            <button 
              onClick={handleAddToCart}
              disabled={adding}
              className={`w-full bg-indigo-600 hover:bg-indigo-500 py-6 rounded-[1.5rem] text-white font-black text-lg shadow-2xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em] ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}
            >
              {adding ? <Loader2 className="animate-spin" /> : <><ShoppingCart size={24} /> {t.prod_add}</>}
            </button>

            <div className={`mt-12 p-8 bg-slate-900/50 rounded-3xl border border-slate-700/50 flex items-center justify-between group ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-4 ${dir === 'rtl' ? 'flex-row-reverse text-right' : ''}`}>
                <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-indigo-600/20">
                  <Clock size={24} className="text-indigo-500" />
                </div>
                <div>
                  <h4 className="text-white font-black uppercase text-xs">{t.instant_delivery}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">{t.codes_email_note}</p>
                </div>
              </div>
              <ChevronRight size={20} className={`text-slate-700 group-hover:text-indigo-500 transition-colors ${dir === 'rtl' ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrdersHistoryPage = () => {
  const { orders } = useContext(StoreContext);
  const { user } = useContext(AuthContext);
  const { t, dir } = useContext(LanguageContext);
  
  const myOrders = useMemo(() => orders.filter(o => o.userId === user?.id), [orders, user]);

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto pb-32 pt-24 animate-fade-in-up">
      <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-16">{t.orders_history_title}</h1>
      {myOrders.length === 0 ? (
        <div className="text-center py-32 bg-slate-800/20 rounded-[3rem] border border-slate-700/50">
           <ShoppingBag size={64} className="text-slate-700 mx-auto mb-6" />
           <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mb-8">{t.orders_history_empty}</p>
           <Link to="/" className="inline-block bg-indigo-600 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-white shadow-xl shadow-indigo-600/20">{t.browse_store}</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {myOrders.map(order => (
            <div key={order.id} className={`bg-slate-800/40 p-8 rounded-3xl border border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:bg-slate-800/60 transition-all ${dir === 'rtl' ? 'md:flex-row-reverse text-right' : 'text-left'}`}>
              <div>
                <div className={`flex items-center gap-3 mb-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">#{order.id.slice(-8)}</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    order.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : 
                    order.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {order.status === 'Completed' ? t.order_status_completed : 
                     order.status === 'Pending' ? t.order_status_pending : t.order_status_cancelled}
                  </span>
                </div>
                <h4 className="text-white font-black uppercase text-sm mb-1">{order.items.map(i => i.name).join(', ')}</h4>
                <div className="text-slate-500 text-xs font-bold">{new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              <div className={`flex items-center gap-8 w-full md:w-auto justify-between md:${dir === 'rtl' ? 'justify-start' : 'justify-end'}`}>
                <div className={`${dir === 'rtl' ? 'text-left' : 'text-right'}`}>
                  <div className="text-2xl font-black text-white">{order.total} <span className="text-xs text-indigo-500 uppercase">{t.currency}</span></div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{order.paymentMethod}</div>
                </div>
                <div className={`p-3 bg-slate-900 rounded-2xl border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <ArrowRight size={20} className={`text-indigo-500 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CheckoutPage = ({ onNotify }: { onNotify: (m: string, t: 'success' | 'error' | 'info') => void }) => {
  const { cart, total, clearCart, removeFromCart } = useContext(CartContext);
  const { coupons, incrementCouponUsage, addOrder, config } = useContext(StoreContext);
  const { user } = useContext(AuthContext);
  const { t, dir } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [step, setStep] = useState<'cart' | 'payment' | 'success'>('cart');
  const [method, setMethod] = useState<PaymentMethod>('Vodafone Cash');
  const [processing, setProcessing] = useState(false);
  const [senderNumber, setSenderNumber] = useState('');
  const [lastOrderId, setLastOrderId] = useState('');
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'fixed') return appliedCoupon.value;
    return (total * (appliedCoupon.value / 100));
  }, [appliedCoupon, total]);

  const finalTotal = Math.max(0, total - discountAmount);

  const handleApplyCoupon = () => {
    const found = coupons.find(c => c.code.toLowerCase() === couponCode.toLowerCase() && c.isActive);
    if (!found) {
      setCouponError(t.coupon_invalid);
      onNotify(t.coupon_invalid, 'error');
      setAppliedCoupon(null);
    } else if (found.usageCount >= found.usageLimit) {
      setCouponError(t.coupon_expired);
      onNotify(t.coupon_expired, 'error');
      setAppliedCoupon(null);
    } else {
      setAppliedCoupon(found);
      setCouponError('');
      onNotify(t.coupon_valid, 'success');
    }
  };

  const handleCheckout = () => {
    if ((method === 'Vodafone Cash' || method === 'InstaPay') && !senderNumber.trim()) {
      onNotify(t.sender_info_label, 'error');
      return;
    }

    setProcessing(true);
    const newOrderId = `ORD-${Date.now()}`;
    setTimeout(() => {
      addOrder({ 
        id: newOrderId, 
        userId: user?.id || 'guest', 
        customerName: user?.name || 'Guest',
        customerEmail: user?.email || '',
        customerPhone: user?.phone || '',
        senderPaymentNumber: senderNumber,
        items: [...cart], 
        total: finalTotal, 
        discount: discountAmount,
        status: 'Pending', 
        date: new Date().toISOString(), 
        paymentMethod: method 
      });
      if (appliedCoupon) incrementCouponUsage(appliedCoupon.id);
      clearCart();
      setLastOrderId(newOrderId);
      setStep('success');
      onNotify(t.toast_order_success, 'success');
    }, 2000);
  };

  if (step === 'success') return (
    <div className="min-h-screen flex items-center justify-center p-6 animate-fade-in-up">
      <div className="bg-slate-800/40 backdrop-blur-2xl p-12 sm:p-16 rounded-[3rem] border border-emerald-500/20 text-center max-w-2xl shadow-2xl">
        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
          <CheckCircle2 size={48} className="text-emerald-500" />
        </div>
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">{t.order_placed_title}</h2>
        <p className="text-slate-500 font-bold mb-10 text-lg">{t.order_placed_subtitle}</p>
        
        <div className={`bg-slate-900/50 p-6 rounded-3xl border border-slate-700 mb-10 space-y-4 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
           <div className={`flex justify-between items-center border-b border-slate-800 pb-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.order_id}</span>
             <span className="text-sm font-black text-indigo-400 uppercase">#{lastOrderId.slice(-8)}</span>
           </div>
           <div className={`flex justify-between items-center border-b border-slate-800 pb-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.amount_due}</span>
             <span className="text-lg font-black text-white">{finalTotal} {t.currency}</span>
           </div>
           <div className={`flex justify-between items-center ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.payment_target}</span>
             <span className={`text-sm font-black text-white`}>{config.paymentPhoneNumber} ({method})</span>
           </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/orders" className="flex-1 bg-white text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">{t.view_order_status}</Link>
          <Link to="/" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20">{t.continue_shopping}</Link>
        </div>
      </div>
    </div>
  );

  if (cart.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white px-4 animate-fade-in-up">
      <div className="p-8 bg-slate-800/30 border border-slate-700/50 rounded-[3rem] text-center max-w-sm">
        <ShoppingCart size={64} className="text-slate-600 mx-auto mb-6" />
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">{t.cart_empty}</h2>
        <p className="text-slate-500 font-bold mb-8">{t.cart_empty_sub}</p>
        <Link to="/" className="inline-block bg-indigo-600 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em]">{t.start_shopping}</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto pb-32 pt-24 animate-fade-in-up">
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
        <div className="lg:col-span-8 space-y-10">
          {step === 'cart' && (
            <div className="space-y-6">
              <h2 className={`text-4xl font-black text-white flex items-center gap-4 uppercase tracking-tighter ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <ShoppingCart className="text-indigo-500" /> {t.review_cart}
              </h2>
              <div className="space-y-4">
                {cart.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className={`bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 flex items-center justify-between group hover:bg-slate-800/60 transition-all ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-6 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                      <img src={item.image} className="w-16 h-16 object-cover rounded-xl group-hover:scale-105 transition-transform shadow-lg" alt="" />
                      <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                        <h4 className="font-black text-white uppercase">{dir === 'rtl' && item.nameAr ? item.nameAr : item.name}</h4>
                        <div className="text-xs text-slate-500 uppercase font-black">{item.selectedOption?.label || t.prod_price}: <span className="text-indigo-400">{item.selectedOption?.price || item.basePrice} {t.currency}</span> x {item.quantity}</div>
                      </div>
                    </div>
                    <button onClick={() => { removeFromCart(item.id, item.selectedOption?.id); onNotify(t.toast_removed_cart, 'info'); }} className="text-slate-600 hover:text-red-500 p-2.5 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={20} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="bg-slate-800/40 p-8 sm:p-10 rounded-[2.5rem] border border-slate-700/50 space-y-8 animate-fade-in-up">
              <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 ${dir === 'rtl' ? 'sm:flex-row-reverse' : ''}`}>
                <h2 className={`text-3xl font-black text-white flex items-center gap-4 uppercase tracking-tighter ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>{t.payment_method}</h2>
                <div className={`text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-full flex items-center gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <UserCheck size={14}/> {t.logged_in_as} {user?.name.split(' ')[0]}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {['Vodafone Cash', 'InstaPay', 'Fawry', 'Credit Card'].map((pm) => (
                  <button key={pm} onClick={() => setMethod(pm as PaymentMethod)} className={`p-8 rounded-3xl border-2 transition-all relative overflow-hidden group flex flex-col items-center justify-center gap-4 ${method === pm ? 'border-indigo-600 bg-indigo-600/10 text-white shadow-lg shadow-indigo-600/10' : 'border-slate-800 bg-slate-900/50 text-slate-500 hover:border-slate-700'}`}>
                    {pm === 'Vodafone Cash' && <Phone size={32} className={method === pm ? 'text-indigo-400' : ''} />}
                    {pm === 'InstaPay' && <Globe size={32} className={method === pm ? 'text-indigo-400' : ''} />}
                    {pm === 'Fawry' && <ReceiptText size={32} className={method === pm ? 'text-indigo-400' : ''} />}
                    {pm === 'Credit Card' && <CreditCard size={32} className={method === pm ? 'text-indigo-400' : ''} />}
                    <span className="font-black uppercase tracking-widest text-xs">{pm}</span>
                    {method === pm && <div className={`absolute top-3 ${dir === 'rtl' ? 'left-3' : 'right-3'}`}><CheckCircle2 size={16} className="text-indigo-500" /></div>}
                  </button>
                ))}
              </div>
              
              {(method === 'Vodafone Cash' || method === 'InstaPay') && (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="p-6 bg-slate-900/80 rounded-2xl border border-indigo-500/30 flex flex-col items-center text-center gap-3">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">{t.transfer_to}</span>
                    <div className="text-3xl font-black text-white tracking-widest bg-indigo-500/10 px-6 py-3 rounded-xl border border-indigo-500/20">{config.paymentPhoneNumber || "Not Set"}</div>
                    <span className="text-xs font-bold text-slate-500 uppercase">{method} {t.wallet_account}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.sender_info_label} <span className="text-rose-500">*</span></label>
                    <input 
                      required
                      className={`w-full bg-slate-900 border border-slate-700 rounded-2xl p-5 text-white font-bold outline-none focus:border-indigo-500 transition-all shadow-inner placeholder:text-slate-600 ${dir === 'rtl' ? 'text-right' : 'text-left'}`} 
                      placeholder={dir === 'rtl' ? 'مثال: 010xxxxxxxx أو معرف التحويل' : "e.g. 010xxxxxxxx or handle@instapay"} 
                      value={senderNumber} 
                      onChange={e => setSenderNumber(e.target.value)} 
                    />
                    <p className={`text-[10px] text-slate-500 font-bold uppercase mt-1 italic opacity-70 block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.sender_info_desc}</p>
                  </div>
                </div>
              )}

              <div className={`p-6 bg-slate-900/50 rounded-2xl border border-indigo-500/20 text-indigo-400 text-xs font-bold leading-relaxed ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                <span className="text-emerald-500 font-black uppercase text-[10px] block mb-2 tracking-widest">{t.payment_instructions}:</span>
                <div className={`flex items-start gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <Info size={14} className="shrink-0 mt-0.5" />
                  <span>
                    {method === 'Vodafone Cash' && (dir === 'rtl' ? `أرسل المبلغ المطلوب تماماً إلى ${config.paymentPhoneNumber || "المسؤول"} وقم بتزويدنا ببيانات التحويل.` : `Send exact amount to ${config.paymentPhoneNumber || "admin"} and provide transaction ID.`)}
                    {method === 'InstaPay' && (dir === 'rtl' ? `حول المبلغ إلى ${config.paymentPhoneNumber || "المسؤول"} عبر تطبيق إنستا باي.` : `Transfer to ${config.paymentPhoneNumber || "admin"} on InstaPay app.`)}
                    {method === 'Fawry' && (dir === 'rtl' ? "توجه لأي منفذ فوري واستخدم الكود: 789123." : "Visit any Fawry outlet and use code: 789123.")}
                    {method === 'Credit Card' && (dir === 'rtl' ? "سيتم توجيهك بأمان لبوابة الدفع." : "Secure redirect to payment gateway.")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4">
          <div className="bg-slate-800/90 backdrop-blur-2xl p-8 rounded-[2rem] border border-slate-700 h-fit sticky top-24 shadow-2xl border-indigo-500/10">
            <h3 className="text-2xl font-black text-white mb-8 uppercase tracking-tighter">{t.summary}</h3>
            
            <div className="mb-8 p-4 bg-slate-900/50 rounded-2xl border border-slate-700 shadow-inner">
               <label className={`text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.coupon_label}</label>
               <div className={`flex gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                 <input 
                  className={`flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all font-bold ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  placeholder="TOKYO2025"
                 />
                 <button onClick={handleApplyCoupon} className="bg-indigo-600 px-6 py-2.5 rounded-xl text-[10px] font-black text-white hover:bg-indigo-500 transition-all uppercase">{t.coupon_apply}</button>
               </div>
               {appliedCoupon && (
                 <p className={`text-emerald-500 text-[10px] font-black mt-2 uppercase tracking-widest animate-pulse ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                   {t.coupon_valid} ({appliedCoupon.type === 'fixed' ? `-${appliedCoupon.value} ${t.currency}` : `-${appliedCoupon.value}%`})
                 </p>
               )}
               {couponError && <p className={`text-rose-500 text-[10px] font-black mt-2 uppercase tracking-widest ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{couponError}</p>}
            </div>

            <div className="space-y-4 mb-8">
              <div className={`flex justify-between text-slate-500 font-bold uppercase tracking-widest text-xs ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <span>{t.subtotal}</span>
                <span className={dir === 'rtl' ? 'flex flex-row-reverse gap-1' : ''}>{total.toLocaleString()} {t.currency}</span>
              </div>
              {appliedCoupon && (
                <div className={`flex justify-between text-emerald-500 font-bold uppercase tracking-widest text-xs ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <span>{t.discount}</span>
                  <span className={dir === 'rtl' ? 'flex flex-row-reverse gap-1' : ''}>-{discountAmount.toLocaleString()} {t.currency}</span>
                </div>
              )}
              <div className={`pt-6 border-t border-slate-700/50 flex justify-between items-end ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <span className="text-slate-400 font-black uppercase text-sm tracking-widest">{t.total}</span>
                <div className={`${dir === 'rtl' ? 'text-left' : 'text-right'} leading-none`}>
                   <div className="text-4xl font-black text-white">{finalTotal.toLocaleString()}</div>
                   <div className="text-xs text-indigo-500 font-black mt-1 uppercase">{t.currency}</div>
                </div>
              </div>
            </div>

            {step === 'payment' ? (
              <button onClick={handleCheckout} disabled={processing} className="w-full bg-emerald-600 hover:bg-emerald-500 py-5 rounded-2xl text-white font-black text-lg shadow-xl transition-all shadow-emerald-600/20 active:scale-95 disabled:opacity-50">
                {processing ? <Loader2 className="animate-spin mx-auto" /> : <div className={`flex items-center justify-center gap-2 uppercase tracking-widest ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}><Check /> {t.pay_now}</div>}
              </button>
            ) : (
              <button 
                onClick={() => {
                  if (!user) {
                    onNotify(t.toast_login_required, 'info');
                    navigate(`/login?redirect=/checkout`);
                    return;
                  }
                  if (step === 'cart') setStep('payment');
                }} 
                className={`w-full bg-indigo-600 hover:bg-indigo-500 py-5 rounded-2xl text-white font-black text-lg shadow-xl flex items-center justify-center gap-3 transition-all shadow-indigo-600/20 active:scale-95 uppercase tracking-widest ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}
              >
                {t.checkout} <ArrowRight className={dir === 'rtl' ? 'rotate-180' : ''} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = ({ onNotify }: { onNotify: (m: string, t: 'success' | 'info') => void }) => {
  const { t, dir, language } = useContext(LanguageContext);
  const { products, addProduct, updateProduct, deleteProduct } = useContext(ProductContext);
  const { users, setUsers, categories, setCategories, coupons, setCoupons, orders, updateOrderStatus, deleteOrder, config, updateConfig } = useContext(StoreContext);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'coupons' | 'orders' | 'customers' | 'settings'>('overview');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [modalType, setModalType] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredMetrics = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const rangeOrders = orders.filter(o => {
      if (timeRange === 'all') return true;
      const orderDate = new Date(o.date);
      if (timeRange === 'today') return orderDate >= startOfToday;
      if (timeRange === 'week') return orderDate >= startOfWeek;
      if (timeRange === 'month') return orderDate >= startOfMonth;
      return true;
    });
    
    const completedRevenue = rangeOrders.filter(o => o.status === 'Completed').reduce((s, o) => s + o.total, 0);
    const pendingRevenue = rangeOrders.filter(o => o.status === 'Pending').reduce((s, o) => s + o.total, 0);
    const counts = { 
      pending: rangeOrders.filter(o => o.status === 'Pending').length, 
      completed: rangeOrders.filter(o => o.status === 'Completed').length, 
      cancelled: rangeOrders.filter(o => o.status === 'Cancelled').length 
    };
    const avgOrder = counts.completed > 0 ? (completedRevenue / counts.completed) : 0;

    return { completedRevenue, pendingRevenue, counts, avgOrder };
  }, [orders, timeRange]);

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  const chartData = useMemo(() => {
    const days = 7;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString(undefined, { weekday: 'short' });
      const dailyOrders = orders.filter(o => new Date(o.date).toDateString() === d.toDateString() && o.status === 'Completed');
      data.push({ name: label, sales: dailyOrders.reduce((acc, curr) => acc + curr.total, 0) });
    }
    return data;
  }, [orders]);

  const toggleStock = (p: Product) => {
    updateProduct({ ...p, inStock: !p.inStock });
    onNotify(t.toast_settings_updated, 'success');
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateConfig({ ...config, iconUrl: reader.result as string });
        onNotify(t.toast_settings_updated, 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProduct = (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const productData: Product = {
      id: editData?.id || `prod-${Date.now()}`,
      name: formData.get('name') as string,
      nameAr: formData.get('nameAr') as string,
      description: formData.get('description') as string,
      descriptionAr: formData.get('descriptionAr') as string,
      basePrice: Number(formData.get('price')),
      category: formData.get('category') as string,
      image: formData.get('image') as string || 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80&w=400',
      currency: 'EGP',
      inStock: editData?.inStock ?? true
    };
    if (editData) updateProduct(productData);
    else addProduct(productData);
    setModalType(null);
    setEditData(null);
    onNotify(t.toast_settings_updated, 'success');
  };

  return (
    <div className={`min-h-screen p-6 max-w-7xl mx-auto pt-24 pb-32 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
      <div className={`flex flex-col md:flex-row justify-between mb-16 gap-6 ${dir === 'rtl' ? 'md:flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-2">{t.admin_title}</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">{t.admin_sys_engine}</p>
        </div>
        <div className={`flex flex-wrap gap-2 bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700/50 backdrop-blur-xl h-fit ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
          {['overview', 'products', 'categories', 'coupons', 'orders', 'customers', 'settings'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-black shadow-xl shadow-white/10' : 'text-slate-500 hover:text-white'}`}>
              {tab === 'overview' ? t.admin_overview : 
               tab === 'products' ? t.admin_products : 
               tab === 'categories' ? t.admin_categories : 
               tab === 'coupons' ? t.admin_coupons : 
               tab === 'orders' ? t.admin_orders : 
               tab === 'customers' ? t.admin_users : t.settings}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-12 animate-fade-in-up">
           <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 ${dir === 'rtl' ? 'sm:flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-3 text-white font-black uppercase text-[10px] tracking-widest ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                 <CalendarDays className="text-indigo-500" size={16} /> {t.admin_specify_period}
              </div>
              <div className={`flex bg-slate-800 p-1 rounded-xl border border-slate-700 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                 {['today', 'week', 'month', 'all'].map(range => (
                    <button key={range} onClick={() => setTimeRange(range as any)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === range ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
                      {range === 'all' ? t.admin_period_all : 
                       range === 'today' ? t.admin_period_today : 
                       range === 'week' ? t.admin_period_week : t.admin_period_month}
                    </button>
                 ))}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50">
                <div className={`text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}><Activity size={14}/> {t.admin_metrics_completed}</div>
                <div className={`text-2xl font-black text-white ${dir === 'rtl' ? 'flex flex-row-reverse gap-1 justify-end' : ''}`}>
                  {filteredMetrics.completedRevenue.toLocaleString()} <span className="text-xs text-emerald-500">{t.currency}</span>
                </div>
              </div>
              <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50">
                <div className={`text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}><Clock size={14}/> {t.admin_metrics_pending}</div>
                <div className={`text-2xl font-black text-white ${dir === 'rtl' ? 'flex flex-row-reverse gap-1 justify-end' : ''}`}>
                  {filteredMetrics.pendingRevenue.toLocaleString()} <span className="text-xs text-amber-500">{t.currency}</span>
                </div>
              </div>
              <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50">
                <div className={`text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 flex items-center gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}><TrendingUp size={14}/> {t.admin_avg_order}</div>
                <div className={`text-2xl font-black text-white ${dir === 'rtl' ? 'flex flex-row-reverse gap-1 justify-end' : ''}`}>
                  {Math.round(filteredMetrics.avgOrder).toLocaleString()} <span className="text-xs text-indigo-500">{t.currency}</span>
                </div>
              </div>
              <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50">
                <div className={`text-[10px] font-black text-purple-500 uppercase tracking-widest mb-2 flex items-center gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}><Users size={14}/> {t.admin_active_users}</div>
                <div className="text-2xl font-black text-white">{users.length}</div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 bg-slate-800/20 p-8 rounded-[2.5rem] border border-slate-700/30 h-[400px] shadow-inner">
                <h3 className={`text-white font-black uppercase text-[10px] mb-8 tracking-[0.2em] flex items-center gap-2 text-slate-500 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}><TrendingUp size={14}/> {t.admin_sales_trend}</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#475569" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} dy={10} />
                    <YAxis orientation={dir === 'rtl' ? 'right' : 'left'} stroke="#475569" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} dx={dir === 'rtl' ? 10 : -10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', color: '#fff' }} />
                    <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="lg:col-span-4 bg-slate-800/40 p-8 rounded-[2.5rem] border border-slate-700/50 flex flex-col">
                <h3 className={`text-white font-black uppercase text-[10px] mb-8 tracking-[0.2em] flex items-center gap-2 text-slate-400 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}><History size={14}/> {t.admin_recent_activity}</h3>
                <div className="space-y-4 flex-1">
                  {recentOrders.map(o => (
                    <div key={o.id} className={`flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all cursor-pointer group ${dir === 'rtl' ? 'flex-row-reverse' : ''}`} onClick={() => setSelectedOrder(o)}>
                      <div className={`flex items-center gap-3 ${dir === 'rtl' ? 'flex-row-reverse text-right' : ''}`}>
                         <div className={`w-2 h-2 rounded-full ${o.status === 'Completed' ? 'bg-emerald-500' : o.status === 'Pending' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'}`} />
                         <div>
                            <div className="text-white font-black text-xs uppercase">{o.customerName.split(' ')[0]}</div>
                            <div className="text-[9px] text-slate-500 font-bold uppercase">{o.items.length} {language === 'ar' ? 'منتج' : 'Items'}</div>
                         </div>
                      </div>
                      <div className={`text-indigo-400 font-black text-xs ${dir === 'rtl' ? 'text-left' : 'text-right'}`}>{o.total} {t.currency}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setActiveTab('orders')} className="mt-6 text-[10px] font-black text-slate-500 uppercase hover:text-white transition-colors">{t.view_all} →</button>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-6 animate-fade-in-up">
           <div className={`flex justify-between items-center ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
             <button onClick={() => { setModalType('product'); setEditData(null); }} className={`bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}><PlusCircle size={18}/> {t.add_item}</button>
           </div>
           <div className="bg-slate-800/20 rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl">
             <table className="w-full text-left">
               <thead className="bg-slate-900/60 text-[10px] font-black uppercase text-slate-500">
                 <tr>
                   <th className={`px-8 py-6 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>Product</th>
                   <th className={`px-8 py-6 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>Category</th>
                   <th className={`px-8 py-6 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>Price</th>
                   <th className={`px-8 py-6 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.admin_stock_status}</th>
                   <th className={`px-8 py-6 ${dir === 'rtl' ? 'text-left' : 'text-right'}`}>Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-800">
                 {products.map(p => (
                   <tr key={p.id} className="hover:bg-slate-800/40 transition-colors group">
                     <td className={`px-8 py-6 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                       <div className={`flex items-center gap-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                         <img src={p.image} className="w-10 h-10 rounded-lg object-cover shadow-lg" />
                         <span className="text-white font-black uppercase text-sm">{language === 'ar' && p.nameAr ? p.nameAr : p.name}</span>
                       </div>
                     </td>
                     <td className={`px-8 py-6 text-slate-500 text-xs font-black uppercase tracking-widest ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{p.category}</td>
                     <td className={`px-8 py-6 text-indigo-400 font-black ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{p.basePrice} {t.currency}</td>
                     <td className={`px-8 py-6 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                        <button onClick={() => toggleStock(p)} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${p.inStock ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'}`}>
                          {p.inStock ? t.admin_in_stock : t.admin_out_of_stock}
                        </button>
                     </td>
                     <td className={`px-8 py-6 ${dir === 'rtl' ? 'text-left' : 'text-right'} space-x-2`}>
                       <button onClick={() => { setEditData(p); setModalType('product'); }} className="p-2.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded-xl transition-all"><Edit size={16}/></button>
                       <button onClick={() => { deleteProduct(p.id); onNotify(t.toast_removed_cart, 'info'); }} className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 size={16}/></button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-6 animate-fade-in-up">
           <div className="bg-slate-800/20 rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl">
             <table className="w-full text-left">
               <thead className="bg-slate-900/60 text-[10px] font-black uppercase text-slate-500">
                 <tr>
                   <th className={`px-8 py-6 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.admin_order_id}</th>
                   <th className={`px-8 py-6 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.customer}</th>
                   <th className={`px-8 py-6 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.admin_payment_proof}</th>
                   <th className={`px-8 py-6 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.total}</th>
                   <th className={`px-8 py-6 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.admin_status}</th>
                   <th className={`px-8 py-6 ${dir === 'rtl' ? 'text-left' : 'text-right'}`}>{t.actions}</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-800">
                 {orders.map(o => (
                   <tr key={o.id} className="hover:bg-slate-800/40 transition-colors group cursor-pointer" onClick={() => setSelectedOrder(o)}>
                     <td className={`px-8 py-6 text-white font-black uppercase text-xs ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>#{o.id.slice(-6)}</td>
                     <td className={`px-8 py-6 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}><div className="text-white font-bold text-xs">{o.customerName}</div><div className="text-[10px] text-slate-500 font-black tracking-widest">{o.customerEmail}</div></td>
                     <td className={`px-8 py-6 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                        <div className="text-[10px] font-black uppercase text-indigo-400">{o.paymentMethod}</div>
                        <div className="text-white font-bold text-xs">{o.senderPaymentNumber || "N/A"}</div>
                     </td>
                     <td className={`px-8 py-6 text-indigo-400 font-black ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{o.total} {t.currency}</td>
                     <td className={`px-8 py-6 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase ${o.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : o.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 animate-pulse' : 'bg-rose-500/10 text-rose-500'}`}>
                          {o.status === 'Completed' ? t.order_status_completed : 
                           o.status === 'Pending' ? t.order_status_pending : t.order_status_cancelled}
                        </span>
                     </td>
                     <td className={`px-8 py-6 ${dir === 'rtl' ? 'text-left' : 'text-right'} space-x-1`} onClick={e => e.stopPropagation()}>
                        {o.status === 'Pending' && <button onClick={() => { updateOrderStatus(o.id, 'Completed'); onNotify(t.order_status_completed, 'success'); }} className="p-2.5 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"><Check size={16}/></button>}
                        <button onClick={() => { deleteOrder(o.id); onNotify(t.toast_removed_cart, 'info'); }} className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 size={16}/></button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="space-y-6 animate-fade-in-up">
           <div className="bg-slate-800/20 rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl">
             <table className="w-full text-left">
               <thead className="bg-slate-900/60 text-[10px] font-black uppercase text-slate-500">
                 <tr>
                   <th className={`px-8 py-6 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.admin_customer_name}</th>
                   <th className={`px-8 py-6 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.admin_contact_info}</th>
                   <th className={`px-8 py-6 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.admin_role}</th>
                   <th className={`px-8 py-6 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}</th>
                   <th className={`px-8 py-6 ${dir === 'rtl' ? 'text-left' : 'text-right'}`}>{t.actions}</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-800">
                 {users.map(u => {
                   const userOrders = orders.filter(o => o.userId === u.id);
                   const totalSpent = userOrders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + o.total, 0);
                   return (
                     <tr key={u.id} className="hover:bg-slate-800/40 transition-colors group">
                       <td className={`px-8 py-6 text-white font-black uppercase text-sm ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{u.name}</td>
                       <td className={`px-8 py-6 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                          <div className="text-indigo-400 font-bold text-xs">{u.email}</div>
                          <div className="text-[10px] text-slate-500 font-black tracking-widest">{u.phone || "No Phone"}</div>
                       </td>
                       <td className={`px-8 py-6 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                          <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-slate-700/20 text-slate-400'}`}>
                            {u.role}
                          </span>
                       </td>
                       <td className={`px-8 py-6 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                          <div className="text-white font-black text-xs">{userOrders.length} {language === 'ar' ? 'طلب' : 'Orders'}</div>
                          <div className="text-indigo-400 font-black text-[10px]">{totalSpent} {t.currency}</div>
                       </td>
                       <td className={`px-8 py-6 ${dir === 'rtl' ? 'text-left' : 'text-right'} space-x-2`}>
                          <button onClick={() => { setEditData(u); setModalType('customer'); }} className="p-2.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded-xl transition-all"><Edit size={16}/></button>
                          <button onClick={() => { setUsers(prev => prev.filter(item => item.id !== u.id)); onNotify(t.delete_item, 'info'); }} className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 size={16}/></button>
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {/* --- Settings Tab --- */}
      {activeTab === 'settings' && (
        <div className="space-y-8 animate-fade-in-up max-w-2xl">
          <div className="bg-slate-800/40 p-8 rounded-[2rem] border border-slate-700/50 space-y-8">
            <h3 className={`text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}><Settings size={20} className="text-indigo-500" /> {t.settings}</h3>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <label className={`text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.store_icon_label}</label>
                <div className={`flex items-center gap-6 p-6 bg-slate-900/50 rounded-3xl border border-slate-700 border-dashed ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <div className="relative w-24 h-24 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner group">
                    {config.iconUrl ? (
                      <img src={config.iconUrl} className="w-full h-full object-cover" alt="Store Icon Preview" />
                    ) : (
                      <ImageIcon className="text-slate-800" size={40} />
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <Upload className="text-white" size={20} />
                    </div>
                  </div>
                  <div className={`flex flex-col gap-2 ${dir === 'rtl' ? 'items-end' : 'items-start'}`}>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleIconUpload}
                      className="hidden" 
                      id="icon-upload"
                    />
                    <label htmlFor="icon-upload" className="cursor-pointer bg-white text-black px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 hover:bg-slate-200 transition-all shadow-xl shadow-white/5 active:scale-95">
                      <PlusCircle size={14}/> {t.store_icon_change}
                    </label>
                    {config.iconUrl && (
                      <button onClick={() => updateConfig({...config, iconUrl: undefined})} className="text-rose-500 text-[10px] font-black uppercase tracking-widest hover:text-rose-400 transition-colors">{t.store_icon_remove}</button>
                    )}
                    <p className={`text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed mt-2 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.store_icon_rec}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.store_name}</label>
                <input 
                  className={`w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white font-bold outline-none focus:border-indigo-500 shadow-inner ${dir === 'rtl' ? 'text-right' : 'text-left'}`} 
                  value={config.name} 
                  onChange={e => updateConfig({...config, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2 block ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}><Facebook size={12}/> {t.facebook_link}</label>
                  <input 
                    className={`w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white font-bold outline-none focus:border-indigo-500 shadow-inner ${dir === 'rtl' ? 'text-right' : 'text-left'}`} 
                    value={config.facebookUrl || ''} 
                    onChange={e => updateConfig({...config, facebookUrl: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2 block ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}><MessageCircle size={12}/> {t.whatsapp_number}</label>
                  <input 
                    className={`w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white font-bold outline-none focus:border-indigo-500 shadow-inner ${dir === 'rtl' ? 'text-right' : 'text-left'}`} 
                    value={config.whatsappNumber || ''} 
                    onChange={e => updateConfig({...config, whatsappNumber: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] px-1 font-black block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.receiving_number}</label>
                <div className="relative group">
                  <Phone className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors`} size={18} />
                  <input 
                    className={`w-full bg-indigo-500/5 border border-indigo-500/30 rounded-xl p-4 ${dir === 'rtl' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'} text-white font-black tracking-widest outline-none focus:border-indigo-500 focus:bg-indigo-500/10 transition-all shadow-lg shadow-indigo-500/5`} 
                    placeholder="e.g. 01012345678" 
                    value={config.paymentPhoneNumber || ''} 
                    onChange={e => updateConfig({...config, paymentPhoneNumber: e.target.value})}
                  />
                </div>
                <p className={`text-[10px] text-slate-500 font-bold uppercase mt-2 italic px-1 block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.receiving_number_desc}</p>
              </div>

              <button onClick={() => onNotify(t.toast_settings_updated, 'success')} className="w-full bg-indigo-600 py-4 rounded-xl text-white font-black uppercase text-[10px] tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95">{t.update_store_settings}</button>
            </div>
          </div>
        </div>
      )}

      {/* --- Order Details Modal --- */}
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={t.order_details}>
         {selectedOrder && (
           <div className="space-y-8">
              <div className={`flex justify-between items-start ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                 <div>
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Order ID</span>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">#{selectedOrder.id.slice(-12)}</h2>
                 </div>
                 <div className={`text-right ${dir === 'rtl' ? 'text-left' : ''}`}>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</span>
                    <div className="text-white font-bold">{new Date(selectedOrder.date).toLocaleString()}</div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">{t.customer}</span>
                    <div className="text-white font-black uppercase text-sm mb-1">{selectedOrder.customerName}</div>
                    <div className="text-indigo-400 font-bold text-xs truncate">{selectedOrder.customerEmail}</div>
                 </div>
                 <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">{t.payment_method}</span>
                    <div className="text-white font-black uppercase text-sm mb-1">{selectedOrder.paymentMethod}</div>
                    <div className="text-indigo-400 font-bold text-xs truncate">{selectedOrder.senderPaymentNumber || 'N/A'}</div>
                 </div>
              </div>

              <div className="space-y-4">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.order_items}</span>
                 {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                       <div className={`flex items-center gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                          <img src={item.image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                          <div>
                             <div className="text-white font-black text-xs uppercase">{item.name}</div>
                             <div className="text-[9px] text-slate-500 font-bold uppercase">{item.selectedOption?.label} x {item.quantity}</div>
                          </div>
                       </div>
                       <div className="text-white font-black text-xs">{(item.selectedOption?.price || item.basePrice) * item.quantity} {t.currency}</div>
                    </div>
                 ))}
              </div>

              <div className="pt-6 border-t border-slate-800 space-y-2">
                 <div className={`flex justify-between text-slate-500 font-black text-xs uppercase ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <span>{t.subtotal}</span>
                    <span>{selectedOrder.total + (selectedOrder.discount || 0)} {t.currency}</span>
                 </div>
                 {selectedOrder.discount && (
                    <div className={`flex justify-between text-emerald-500 font-black text-xs uppercase ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                       <span>{t.discount}</span>
                       <span>-{selectedOrder.discount} {t.currency}</span>
                    </div>
                 )}
                 <div className={`flex justify-between items-end pt-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <span className="text-white font-black uppercase tracking-widest">{t.total}</span>
                    <div className="text-right">
                       <span className="text-3xl font-black text-indigo-500">{selectedOrder.total}</span>
                       <span className="text-xs text-indigo-400 font-black ml-1 uppercase">{t.currency}</span>
                    </div>
                 </div>
              </div>

              <div className="flex gap-4">
                 {selectedOrder.status === 'Pending' && (
                   <button onClick={() => { updateOrderStatus(selectedOrder.id, 'Completed'); setSelectedOrder(null); onNotify(t.order_status_completed, 'success'); }} className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-4 rounded-xl text-white font-black uppercase text-xs transition-all shadow-xl shadow-emerald-600/20">{t.mark_done}</button>
                 )}
                 <button onClick={() => { deleteOrder(selectedOrder.id); setSelectedOrder(null); onNotify(t.delete_item, 'info'); }} className="flex-1 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white py-4 rounded-xl font-black uppercase text-xs transition-all border border-rose-600/30">{t.delete_item}</button>
              </div>
           </div>
         )}
      </Modal>

      {/* --- Other Dashboard Modals --- */}
      <Modal isOpen={modalType === 'product'} onClose={() => { setModalType(null); setEditData(null); }} title={editData ? t.edit_item : t.add_item}>
         <form onSubmit={handleSubmitProduct} className="space-y-6">
            <div className="space-y-2">
               <label className={`text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>Product Name (EN)</label>
               <input name="name" defaultValue={editData?.name} required className={`w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white font-bold ${dir === 'rtl' ? 'text-right' : 'text-left'}`} />
            </div>
            <div className="space-y-2">
               <label className={`text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>Product Name (AR)</label>
               <input name="nameAr" defaultValue={editData?.nameAr} className={`w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white font-bold ${dir === 'rtl' ? 'text-right' : 'text-left'}`} />
            </div>
            <div className="space-y-2">
               <label className={`text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>Description (EN)</label>
               <textarea name="description" defaultValue={editData?.description} required className={`w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white font-bold h-24 ${dir === 'rtl' ? 'text-right' : 'text-left'}`} />
            </div>
            <div className="space-y-2">
               <label className={`text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>Description (AR)</label>
               <textarea name="descriptionAr" defaultValue={editData?.descriptionAr} className={`w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white font-bold h-24 ${dir === 'rtl' ? 'text-right' : 'text-left'}`} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.prod_price}</label>
                <input name="price" type="number" defaultValue={editData?.basePrice} required className={`w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white font-bold ${dir === 'rtl' ? 'text-right' : 'text-left'}`} />
              </div>
              <div className="space-y-2">
                <label className={`text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>Category</label>
                <select name="category" defaultValue={editData?.category} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white font-bold">
                  {categories.map(c => <option key={c.id} value={c.name}>{language === 'ar' && c.nameAr ? c.nameAr : c.name}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 py-4 rounded-xl text-white font-black uppercase text-sm shadow-xl shadow-indigo-600/20">{t.save}</button>
         </form>
      </Modal>
    </div>
  );
};

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const { users } = useContext(StoreContext);
  const { t, dir } = useContext(LanguageContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check Admin First
    if (email.toLowerCase() === MOCK_ADMIN_USER.email.toLowerCase() && password === MOCK_ADMIN_USER.password) {
      login(MOCK_ADMIN_USER);
      navigate(redirect);
      return;
    }

    // Check Registered Users
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (existingUser) { 
      login(existingUser); 
      navigate(redirect); 
    } else { 
      setError(dir === 'rtl' ? 'بيانات الدخول غير صحيحة.' : 'Invalid email or password.'); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 animate-fade-in-up">
      <div className="bg-slate-800/40 backdrop-blur-xl p-10 sm:p-12 rounded-[2.5rem] border border-slate-700/50 w-full max-w-md space-y-10 shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-600/20 group hover:rotate-6 transition-transform">
            <Lock size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">{t.login_title}</h1>
          <p className="text-slate-500 font-bold text-sm tracking-widest uppercase text-[10px]">Secure Marketplace Access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <Mail className={`absolute ${dir === 'rtl' ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors`} size={20} />
              <input 
                type="email" 
                required 
                value={email} 
                onChange={e => { setEmail(e.target.value); setError(''); }} 
                className={`w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 ${dir === 'rtl' ? 'pr-14 pl-5 text-right' : 'pl-14 pr-5 text-left'} text-white font-bold focus:border-indigo-600 outline-none transition-all placeholder:text-slate-600 shadow-inner`} 
                placeholder={t.email} 
              />
            </div>
            <div className="relative group">
              <Lock className={`absolute ${dir === 'rtl' ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors`} size={20} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                required 
                value={password} 
                onChange={e => { setPassword(e.target.value); setError(''); }} 
                className={`w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 ${dir === 'rtl' ? 'pr-14 pl-14 text-right' : 'pl-14 pr-14 text-left'} text-white font-bold focus:border-indigo-600 outline-none transition-all placeholder:text-slate-600 shadow-inner`} 
                placeholder={t.password} 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute ${dir === 'rtl' ? 'left-5' : 'right-5'} top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors`}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest text-center animate-pulse">{error}</p>}
          
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 py-5 rounded-2xl text-white font-black text-lg shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] uppercase tracking-widest">
            {t.login_btn}
          </button>
        </form>
        
        <div className="text-center">
          <Link to="/register" className="text-indigo-400 font-black text-xs uppercase tracking-widest hover:underline transition-all">
            {t.no_account_link}
          </Link>
        </div>
      </div>
    </div>
  );
};

const RegisterPage = () => {
  const { login } = useContext(AuthContext);
  const { users, setUsers } = useContext(StoreContext);
  const { t, dir } = useContext(LanguageContext);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      setError(dir === 'rtl' ? 'البريد الإلكتروني مسجل مسبقاً.' : 'Email already registered.');
      return;
    }
    if (password !== confirmPassword) {
      setError(dir === 'rtl' ? 'كلمات المرور غير متطابقة.' : 'Passwords do not match.');
      return;
    }
    const newUser: UserType = { 
      id: `u-${Date.now()}`, 
      email: email.toLowerCase(), 
      name, 
      phone, 
      password,
      role: 'user' 
    };
    setUsers(prev => [...prev, newUser]);
    login(newUser);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 animate-fade-in-up">
      <div className="bg-slate-800/40 backdrop-blur-xl p-10 sm:p-12 rounded-[2.5rem] border border-slate-700/50 w-full max-w-md space-y-10 shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-600/20 group hover:scale-110 transition-transform">
            <UserPlus size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">{t.register_title}</h1>
          <p className="text-slate-500 font-bold text-sm tracking-widest uppercase text-[10px]">Join Tokyo Digital Market</p>
        </div>
        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <UserCheck className={`absolute ${dir === 'rtl' ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors`} size={20} />
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className={`w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 ${dir === 'rtl' ? 'pr-14 pl-5 text-right' : 'pl-14 pr-5 text-left'} text-white font-bold focus:border-indigo-600 outline-none transition-all placeholder:text-slate-600 shadow-inner`} placeholder={t.full_name} />
            </div>
            <div className="relative group">
              <Mail className={`absolute ${dir === 'rtl' ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors`} size={20} />
              <input type="email" required value={email} onChange={e => { setEmail(e.target.value); setError(''); }} className={`w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 ${dir === 'rtl' ? 'pr-14 pl-5 text-right' : 'pl-14 pr-5 text-left'} text-white font-bold focus:border-indigo-600 outline-none transition-all placeholder:text-slate-600 shadow-inner`} placeholder={t.email} />
            </div>
            <div className="relative group">
              <Phone className={`absolute ${dir === 'rtl' ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors`} size={20} />
              <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className={`w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 ${dir === 'rtl' ? 'pr-14 pl-5 text-right' : 'pl-14 pr-5 text-left'} text-white font-bold focus:border-indigo-600 outline-none transition-all placeholder:text-slate-600 shadow-inner`} placeholder={t.phone} />
            </div>
            <div className="relative group">
              <Lock className={`absolute ${dir === 'rtl' ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors`} size={20} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className={`w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 ${dir === 'rtl' ? 'pr-14 pl-14 text-right' : 'pl-14 pr-14 text-left'} text-white font-bold focus:border-indigo-600 outline-none transition-all placeholder:text-slate-600 shadow-inner`} 
                placeholder={t.password} 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute ${dir === 'rtl' ? 'left-5' : 'right-5'} top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors`}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="relative group">
              <CheckCircle2 className={`absolute ${dir === 'rtl' ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors`} size={20} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                required 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                className={`w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 ${dir === 'rtl' ? 'pr-14 pl-5 text-right' : 'pl-14 pr-5 text-left'} text-white font-bold focus:border-indigo-600 outline-none transition-all placeholder:text-slate-600 shadow-inner`} 
                placeholder={t.confirm_password} 
              />
            </div>
          </div>
          {error && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest text-center animate-pulse">{error}</p>}
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 py-5 rounded-2xl text-white font-black text-lg shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] uppercase tracking-widest">
            {t.register_btn}
          </button>
        </form>
        <div className="text-center">
          <Link to="/login" className="text-indigo-400 font-black text-xs uppercase tracking-widest hover:underline transition-all">
            {t.have_account_link}
          </Link>
        </div>
      </div>
    </div>
  );
};

const WishlistPage = ({ onNotify }: { onNotify: (m: string, t: 'success' | 'error' | 'info') => void }) => {
  const { wishlist } = useContext(WishlistContext);
  const { t, dir } = useContext(LanguageContext);
  return (
    <div className={`max-w-7xl mx-auto px-4 py-32 animate-fade-in-up ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
      <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-4">{t.wishlist_title}</h1>
      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-16">{t.wishlist_desc}</p>
      {wishlist.length === 0 ? (
        <div className="text-center py-20">
           <Heart size={64} className="text-slate-800 mx-auto mb-6" />
           <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mb-8">{t.wishlist_empty}</p>
           <Link to="/" className="inline-block bg-indigo-600 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">{t.browse_store}</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {wishlist.map((p, idx) => <ProductCard key={p.id} product={p} index={idx} onNotify={onNotify} />)}
        </div>
      )}
    </div>
  );
}

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  const { dir } = useContext(LanguageContext);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in-up">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        <div className={`p-6 border-b border-slate-800 flex justify-between items-center ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">{title}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-all"><X size={20} /></button>
        </div>
        <div className={`p-8 max-h-[70vh] overflow-y-auto custom-scrollbar ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{children}</div>
      </div>
    </div>
  );
};

// --- Main App ---

const App = () => {
  const [language, setLanguage] = useState<Language>(() => getStorage('lang', 'en'));
  const [user, setUser] = useState<UserType | null>(() => getStorage('user', null));
  const [cart, setCart] = useState<CartItem[]>(() => getStorage('cart', []));
  const [wishlist, setWishlist] = useState<Product[]>(() => getStorage('wishlist', []));
  const [products, setProducts] = useState<Product[]>(() => getStorage('products', INITIAL_PRODUCTS));
  const [orders, setOrders] = useState<Order[]>(() => getStorage('orders', []));
  const [users, setUsers] = useState<UserType[]>(() => getStorage('users', [MOCK_ADMIN_USER]));
  const [categories, setCategories] = useState<Category[]>(() => getStorage('categories', [
    { id: '1', name: 'Valorant', nameAr: 'فالورانت' }, 
    { id: '2', name: 'Fortnite', nameAr: 'فورتنايت' }, 
    { id: '3', name: 'Subscription', nameAr: 'اشتراكات' }, 
    { id: '4', name: 'Gift Card', nameAr: 'بطاقات هدايا' }
  ]));
  const [coupons, setCoupons] = useState<Coupon[]>(() => getStorage('coupons', [
    { id: 'c1', code: 'TOKYO2025', type: 'percentage', value: 10, usageLimit: 100, usageCount: 0, isActive: true }
  ]));
  const [config, setConfig] = useState<StoreConfig>(() => getStorage('store_config', { name: 'Tokyo Store', paymentPhoneNumber: '01012345678' }));
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  const onNotify = (message: string, type: 'success' | 'error' | 'info') => setToast({ message, type });

  // Persistence Sync
  useEffect(() => { localStorage.setItem('products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('coupons', JSON.stringify(coupons)); }, [coupons]);
  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('store_config', JSON.stringify(config)); }, [config]);
  useEffect(() => { localStorage.setItem('lang', JSON.stringify(language)); }, [language]);

  const t = translations[language];
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    document.body.className = language === 'ar' ? 'font-arabic' : '';
  }, [dir, language]);

  const authValue = { user, login: (u: UserType) => setUser(u), logout: () => setUser(null) };
  const cartValue = {
    cart,
    addToCart: (product: Product, option?: ProductOption, quantity: number = 1) => {
      setCart(prev => {
        const existing = prev.find(item => item.id === product.id && item.selectedOption?.id === option?.id);
        if (existing) return prev.map(item => item === existing ? { ...item, quantity: item.quantity + quantity } : item);
        return [...prev, { ...product, quantity, selectedOption: option }];
      });
    },
    removeFromCart: (id: string, optId?: string) => setCart(prev => prev.filter(i => !(i.id === id && i.selectedOption?.id === optId))),
    clearCart: () => setCart([]),
    total: cart.reduce((sum, item) => sum + (item.selectedOption?.price || item.basePrice) * item.quantity, 0)
  };

  const wishlistValue = {
    wishlist,
    toggleWishlist: (p: Product) => setWishlist(prev => prev.find(i => i.id === p.id) ? prev.filter(i => i.id !== p.id) : [...prev, p]),
    isInWishlist: (id: string) => !!wishlist.find(p => p.id === id)
  };

  const storeValue = { config, updateConfig: setConfig, users, setUsers, orders, addOrder: (o: Order) => setOrders([o, ...orders]), deleteOrder: (id: string) => setOrders(orders.filter(o => o.id !== id)), updateOrderStatus: (id: string, status: Order['status']) => setOrders(orders.map(o => o.id === id ? { ...o, status } : o)), categories, setCategories, coupons, setCoupons, incrementCouponUsage: (id: string) => setCoupons(coupons.map(c => c.id === id ? { ...c, usageCount: c.usageCount + 1 } : c)) };

  const productValue = { products, addProduct: (p: Product) => setProducts([...products, p]), updateProduct: (p: Product) => setProducts(products.map(i => i.id === p.id ? p : i)), deleteProduct: (id: string) => setProducts(products.filter(i => i.id !== id)) };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      <AuthContext.Provider value={authValue}>
        <StoreContext.Provider value={storeValue}>
          <ProductContext.Provider value={productValue}>
            <WishlistContext.Provider value={wishlistValue}>
              <CartContext.Provider value={cartValue}>
                <HashRouter>
                  <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30 selection:text-white">
                    <Navbar />
                    <Routes>
                      <Route path="/" element={<HomePage onNotify={onNotify} />} />
                      <Route path="/product/:id" element={<ProductDetailPage onNotify={onNotify} />} />
                      <Route path="/checkout" element={<CheckoutPage onNotify={onNotify} />} />
                      <Route path="/orders" element={user ? <OrdersHistoryPage /> : <Navigate to="/login" />} />
                      <Route path="/wishlist" element={<WishlistPage onNotify={onNotify} />} />
                      <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard onNotify={onNotify} /> : <Navigate to="/login" />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                    </Routes>
                    <footer className="py-20 border-t border-slate-900 bg-slate-950 px-4">
                      <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
                        <div className={`flex items-center gap-6 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                          {config.facebookUrl && (
                            <a href={config.facebookUrl} target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-indigo-500 hover:border-indigo-500/50 transition-all shadow-xl active:scale-95 group">
                              <Facebook size={24} className="group-hover:rotate-6 transition-transform" />
                            </a>
                          )}
                          {config.whatsappNumber && (
                            <a href={`https://wa.me/${config.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-500 hover:border-emerald-500/50 transition-all shadow-xl active:scale-95 group">
                              <MessageCircle size={24} className="group-hover:rotate-6 transition-transform" />
                            </a>
                          )}
                        </div>
                        <div className="text-center">
                          <p className="text-slate-700 font-black uppercase text-[10px] tracking-[0.5em]">© 2025 {config.name} | EGYPT DIGITAL MARKET</p>
                          <p className="text-slate-800 text-[8px] font-bold uppercase mt-4 tracking-widest">{language === 'ar' ? 'مصمم لتوصيل ألعاب عالي الأداء' : 'Designed for high-performance gaming deliveries'}</p>
                        </div>
                      </div>
                    </footer>
                    <GeminiAssistant />
                    {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
                  </div>
                </HashRouter>
              </CartContext.Provider>
            </WishlistContext.Provider>
          </ProductContext.Provider>
        </StoreContext.Provider>
      </AuthContext.Provider>
    </LanguageContext.Provider>
  );
};

export default App;
