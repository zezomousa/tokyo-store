
export interface ProductOption {
  id: string;
  label: string;
  price: number;
}

export interface Category {
  id: string;
  name: string;
  nameAr?: string;
  icon?: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number; // Percentage or Fixed EGP amount
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  basePrice: number;
  currency: string;
  category: string;
  image: string;
  options?: ProductOption[];
  inStock?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string; // Added password field
  phone?: string;
  role: 'user' | 'admin';
}

export interface CartItem extends Product {
  quantity: number;
  selectedOption?: ProductOption;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  senderPaymentNumber?: string; // Added for tracking e-wallet transfers
  items: CartItem[];
  total: number;
  discount?: number;
  status: 'Pending' | 'Completed' | 'Cancelled';
  date: string;
  paymentMethod: string;
}

export type PaymentMethod = 'Vodafone Cash' | 'InstaPay' | 'Fawry' | 'Credit Card';

export interface StoreConfig {
  name: string;
  iconUrl?: string;
  paymentPhoneNumber?: string; // Added for store-wide e-wallet receiving number
  facebookUrl?: string;
  whatsappNumber?: string;
}
