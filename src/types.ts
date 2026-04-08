import { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'user';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  isVip?: boolean;
  vipExpiry?: string;
  displayName?: string;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed';
export type CryptoType = 'BTC' | 'ETH' | 'LTC' | 'USDT';

export interface PaymentRecord {
  id?: string;
  uid: string;
  amount: number;
  plan: '1_DAY' | '30_DAY';
  status: PaymentStatus;
  cryptoType: CryptoType;
  address: string;
  createdAt: string;
}

export interface Message {
  id?: string;
  senderUid: string;
  receiverUid: string;
  content: string;
  createdAt: string;
  read?: boolean;
}

export interface GlobalSettings {
  btcAddress: string;
  ethAddress: string;
  ltcAddress: string;
  usdtAddress: string;
  vip1DayPrice: number;
  vip30DayPrice: number;
}
