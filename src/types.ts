export type Language = 'bn' | 'en';
export type ThemeMode = 'dark' | 'light' | 'auto';

export interface UserProfile {
  id: string; // Telegram user id
  name: string;
  username?: string;
  balance: number; // In BDT
  savingsBalance: number; // Savings wallet balance
  referralCode: string;
  referredBy?: string;
  dailyBonusStreak: number;
  lastDailyClaim?: string; // YYYY-MM-DD
  plan: string; // "Basic", "Pro", "VIP", "Max"
  planExpiry?: string; // ISO date string
  totalEarned: number;
  tasksCompleted: number;
  xp: number;
  level: number;
  badges: string[];
  dailyTasksDone: number;
  lastTaskTimestamp?: number;
  referralTierCounts: {
    level1: number;
    level2: number;
    level3: number;
  };
  isBanned: boolean;
  createdAt: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  link: string;
  reward: number; // BDT amount
  type: 'timer' | 'visit' | 'video' | 'daily_mission';
  duration: number; // seconds
  active: boolean;
  maxPerDay?: number | null;
  cooldownMinutes?: number;
  levelRequired: number; // default 1
  bonusMultiplier?: number; // default 1
  createdAt?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  method: 'bKash' | 'Nagad' | 'USDT';
  accountNumber: string;
  amountBDT: number;
  amountUSDT: number;
  status: 'pending' | 'approved' | 'rejected';
  note?: string;
  fromSavings?: boolean;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number; // BDT
  validityDays: number;
  extraRewardMultiplier: number; // e.g. 1.2
  freeSpinsExtra: number;
  referralCommissionBoost: number; // percentage
  levelBoost: number;
  active: boolean;
  benefitsList?: string[];
}

export interface TransactionRecord {
  id: string;
  userId: string;
  userName: string;
  planId: string;
  planName: string;
  amount: number;
  trxId: string;
  senderNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface AppConfigSettings {
  referCommission: number; // Level 1 %
  referCommissionLevel2: number; // Level 2 %
  referCommissionLevel3: number; // Level 3 %
  dailyBonusBase: number;
  dailyBonusIncrement: number;
  videoAdReward: number;
  adCountdownDuration: number; // seconds
  currency: string;
  language: Language;
  maxTasksPerDay: number;
  maxVideoAdsPerDay: number;
  maxSpinsPerDay: number;
  xpPerTask: number;
  xpLevelScale: number[]; // e.g. [0, 100, 250, 500, 1000, 2000, 5000]
  usdtRate: number; // 1 USDT = X BDT
  spinCost: number;
  freeSpinsPerDay: number;
  spinRewards: number[]; // Rewards array for spin wheel
}

export interface AppGlobalConfig {
  appSettings: AppConfigSettings;
  monetagZoneId: string;
  bKashNumber: string;
  customAdScript?: string;
  adminNotifications: Array<{
    id: string;
    title: string;
    message: string;
    createdAt: string;
  }>;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface DailyMission {
  id: string;
  date: string; // YYYY-MM-DD
  taskIds: string[];
  bonusReward: number;
  active: boolean;
}

export interface UserTaskHistory {
  [taskId: string]: {
    lastCompletedAt: number; // timestamp
    countToday: number;
    lastResetDate: string; // YYYY-MM-DD
  };
}
