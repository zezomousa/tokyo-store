import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  // --- VALORANT ---
  {
    id: 'val-mena',
    name: 'Valorant Points (MENA Region)',
    nameAr: 'نقاط فالورانت (منطقة الشرق الأوسط)',
    description: 'Official Riot Games VP for Middle East & North Africa accounts.',
    descriptionAr: 'نقاط فالورانت الرسمية لحسابات الشرق الأوسط وشمال أفريقيا.',
    basePrice: 115,
    currency: 'EGP',
    category: 'Valorant',
    image: 'https://images.unsplash.com/photo-1624523956320-c636f4c5144f?auto=format&fit=crop&q=80&w=400',
    options: [
      { id: 'vm-1', label: '115 VP', price: 115 },
      { id: 'vm-2', label: '485 VP', price: 475 },
      { id: 'vm-3', label: '1100 VP', price: 1050 },
      { id: 'vm-4', label: '3400 VP', price: 3100 },
    ]
  },
  {
    id: 'val-tr',
    name: 'Valorant Points (Turkey Region)',
    nameAr: 'نقاط فالورانت (المنطقة التركية)',
    description: 'Turkey Region Only. Great value for TR accounts.',
    descriptionAr: 'للمنطقة التركية فقط. قيمة ممتازة للحسابات التركية.',
    basePrice: 90,
    currency: 'EGP',
    category: 'Valorant',
    image: 'https://images.unsplash.com/photo-1632266806558-479eb17e7dfc?auto=format&fit=crop&q=80&w=400',
    options: [
      { id: 'vt-1', label: '115 VP (TR)', price: 90 },
      { id: 'vt-2', label: '925 VP (TR)', price: 650 },
      { id: 'vt-3', label: '1850 VP (TR)', price: 1200 },
    ]
  },
  {
    id: 'val-us',
    name: 'Valorant Points (USA Region)',
    nameAr: 'نقاط فالورانت (المنطقة الأمريكية)',
    description: 'United States Region Only (NA).',
    descriptionAr: 'للمنطقة الأمريكية فقط (شمال أمريكا).',
    basePrice: 500,
    currency: 'EGP',
    category: 'Valorant',
    image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80&w=400',
    options: [
      { id: 'vu-1', label: '$10 Card (approx 950 VP)', price: 550 },
      { id: 'vu-2', label: '$25 Card', price: 1350 },
    ]
  },

  // --- FORTNITE ---
  {
    id: 'fn-vbucks',
    name: 'Fortnite V-Bucks Global',
    nameAr: 'فورتنايت في-باكس عالمي',
    description: 'V-Bucks for all platforms (PC/Xbox/PS).',
    descriptionAr: 'عملة في-باكس لجميع المنصات (كمبيوتر/إكس بوكس/بلايستيشن).',
    basePrice: 450,
    currency: 'EGP',
    category: 'Fortnite',
    image: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&q=80&w=400',
    options: [
      { id: 'fn-1', label: '1,000 V-Bucks', price: 450 },
      { id: 'fn-2', label: '2,800 V-Bucks', price: 1200 },
      { id: 'fn-3', label: '5,000 V-Bucks', price: 2100 },
      { id: 'fn-4', label: '13,500 V-Bucks', price: 5200 },
    ]
  },
  {
    id: 'fn-bundle-midas',
    name: 'Fortnite: The Last Laugh Bundle',
    nameAr: 'فورتنايت: حزمة الضحكة الأخيرة',
    description: 'Includes Joker, Poison Ivy, Midas Rex skins + 1000 V-Bucks.',
    descriptionAr: 'تتضمن سكنات الجوكر وبويزن آيفي وميداس ريكس + 1000 في-باكس.',
    basePrice: 1500,
    currency: 'EGP',
    category: 'Fortnite',
    image: 'https://images.unsplash.com/photo-1627806536966-24376c9c644d?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'fn-bundle-transformers',
    name: 'Fortnite: Transformers Pack',
    nameAr: 'فورتنايت: حزمة المتحولون',
    description: 'Bumblebee, Megatron, BattleBus skins.',
    descriptionAr: 'تتضمن سكنات بامبلبي وميجاترون وحافلة المعركة.',
    basePrice: 1200,
    currency: 'EGP',
    category: 'Fortnite',
    image: 'https://images.unsplash.com/photo-1596727147705-5d3539e55722?auto=format&fit=crop&q=80&w=400'
  },

  // --- OTHERS ---
  {
    id: 'sub-prime',
    name: 'Amazon Prime (Egypt)',
    nameAr: 'أمازون برايم (مصر)',
    description: '1 Month Subscription. Fast delivery and streaming.',
    descriptionAr: 'اشتراك لمدة شهر واحد. توصيل سريع وبث فيديو.',
    basePrice: 29.00,
    currency: 'EGP',
    category: 'Subscription',
    image: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'card-ps-us',
    name: 'PlayStation Store Gift Card',
    nameAr: 'بطاقة هدايا متجر بلايستيشن',
    description: 'US Region Wallet Top-up.',
    descriptionAr: 'شحن محفظة المنطقة الأمريكية.',
    basePrice: 550,
    currency: 'EGP',
    category: 'Gift Card',
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=400',
    options: [
      { id: 'ps-1', label: '$10 Card', price: 550 },
      { id: 'ps-2', label: '$20 Card', price: 1100 },
      { id: 'ps-3', label: '$50 Card', price: 2700 },
    ]
  }
];

export const MOCK_ADMIN_USER = {
  id: 'admin-1',
  email: '123@123.com',
  name: 'Mousa Zeyad',
  password: '123',
  role: 'admin' as const
};
