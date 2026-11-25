import React, { useState, useEffect } from 'react';
import {
  db,
} from './firebase';
import {
  doc,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  addDoc,
  getDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import {
  UserProfile,
  TaskItem,
  WithdrawalRequest,
  TransactionRecord,
  SubscriptionPlan,
  AppGlobalConfig,
  Language,
  ThemeMode,
  UserTaskHistory,
  ActivityLog,
} from './types';
import { DEFAULT_APP_CONFIG, DEFAULT_PLANS, DEFAULT_TASKS } from './defaults';
import { dictionary, t } from './i18n';
import {
  getTelegramUser,
  initTelegramApp,
  getStartParam,
  triggerHapticFeedback,
} from './telegram';
import { playLevelUpSound, playWinSound } from './audio';
import confetti from 'canvas-confetti';

import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { HomeView } from './components/HomeView';
import { TasksView } from './components/TasksView';
import { SpinWheelView } from './components/SpinWheelView';
import { ReferralView } from './components/ReferralView';
import { WithdrawView } from './components/WithdrawView';
import { LeaderboardView } from './components/LeaderboardView';
import { PlansView } from './components/PlansView';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { NotificationsModal } from './components/NotificationsModal';
import { AdminPanel } from './components/AdminPanel';
import { ShieldAlert } from 'lucide-react';

// Utility to remove undefined fields recursively so Firestore setDoc/updateDoc never fails
function sanitizeForFirestore<T extends Record<string, any>>(data: T): T {
  const clean: any = {};
  Object.keys(data).forEach((key) => {
    const val = data[key];
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        clean[key] = sanitizeForFirestore(val);
      } else {
        clean[key] = val;
      }
    }
  });
  return clean as T;
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [lang, setLang] = useState<Language>('bn');
  const [theme, setTheme] = useState<ThemeMode>('dark');

  // Firestore Real-time Collections State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [config, setConfig] = useState<AppGlobalConfig>(DEFAULT_APP_CONFIG);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>(DEFAULT_PLANS);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Modals & UI Controls
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [spinsToday, setSpinsToday] = useState(0);
  const [taskHistory, setTaskHistory] = useState<UserTaskHistory>({});

  const tgUser = getTelegramUser();
  const userIdStr = String(tgUser.id);

  // Initialize Telegram & Sync Theme
  useEffect(() => {
    initTelegramApp();

    // Dark Mode Theme Init
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Firestore Real-time Sync Setup
  useEffect(() => {
    // 1. Sync Config
    const configDocRef = doc(db, 'config', 'appConfig');
    const unsubConfig = onSnapshot(configDocRef, (snapshot) => {
      if (snapshot.exists()) {
        setConfig(snapshot.data() as AppGlobalConfig);
      } else {
        // Seed default config
        setDoc(configDocRef, DEFAULT_APP_CONFIG);
      }
    });

    // 2. Sync User Document
    const userDocRef = doc(db, 'users', userIdStr);
    const unsubUser = onSnapshot(userDocRef, async (snapshot) => {
      if (snapshot.exists()) {
        const uData = snapshot.data() as UserProfile;
        setUser(uData);
      } else {
        // First-time user creation logic
        const startParam = getStartParam();
        let referredByUserId: string | undefined = undefined;

        if (startParam && startParam.startsWith('ref_')) {
          const refCode = startParam.replace('ref_', '').trim();
          if (refCode && refCode !== userIdStr) {
            referredByUserId = refCode;
          }
        }

        const newUser: UserProfile = sanitizeForFirestore({
          id: userIdStr,
          name: tgUser.first_name || 'আম ব্যবহারকারী',
          username: tgUser.username || '',
          balance: 2.0, // Sign-up welcome bonus ৳2
          savingsBalance: 0,
          referralCode: userIdStr,
          referredBy: referredByUserId,
          dailyBonusStreak: 0,
          plan: 'Basic',
          totalEarned: 2.0,
          tasksCompleted: 0,
          xp: 10,
          level: 1,
          badges: ['starter_mango'],
          dailyTasksDone: 0,
          referralTierCounts: { level1: 0, level2: 0, level3: 0 },
          isBanned: false,
          createdAt: new Date().toISOString(),
        });

        await setDoc(userDocRef, newUser);
        setUser(newUser);

        // Update Referrer Tree counts if referredBy exists
        if (referredByUserId) {
          try {
            const refDocRef = doc(db, 'users', referredByUserId);
            const refSnap = await getDoc(refDocRef);
            if (refSnap.exists()) {
              const refData = refSnap.data() as UserProfile;
              const curL1 = refData.referralTierCounts?.level1 || 0;
              await updateDoc(refDocRef, {
                'referralTierCounts.level1': curL1 + 1,
                balance: (refData.balance || 0) + 1.0, // Referral join bonus ৳1
                totalEarned: (refData.totalEarned || 0) + 1.0,
              });

              // Secondary Level 2 Referrer update
              if (refData.referredBy) {
                const l2DocRef = doc(db, 'users', refData.referredBy);
                const l2Snap = await getDoc(l2DocRef);
                if (l2Snap.exists()) {
                  const l2Data = l2Snap.data() as UserProfile;
                  const curL2 = l2Data.referralTierCounts?.level2 || 0;
                  await updateDoc(l2DocRef, {
                    'referralTierCounts.level2': curL2 + 1,
                  });
                }
              }
            }
          } catch (e) {
            console.error('Error updating referral tree:', e);
          }
        }
      }
    });

    // 3. Sync Tasks Collection
    const tasksColRef = collection(db, 'tasks');
    const unsubTasks = onSnapshot(tasksColRef, (snapshot) => {
      if (!snapshot.empty) {
        const tasksList: TaskItem[] = [];
        snapshot.forEach((d) => tasksList.push({ id: d.id, ...d.data() } as TaskItem));
        setTasks(tasksList);
      } else {
        // Seed default tasks
        DEFAULT_TASKS.forEach((tData) => {
          addDoc(tasksColRef, tData);
        });
      }
    });

    // 4. Sync All Users (For Leaderboard & Admin)
    const usersColRef = collection(db, 'users');
    const unsubAllUsers = onSnapshot(usersColRef, (snapshot) => {
      const uList: UserProfile[] = [];
      snapshot.forEach((d) => uList.push(d.data() as UserProfile));
      setAllUsers(uList);
    });

    // 5. Sync Withdrawals
    const withdrawalsColRef = collection(db, 'withdrawals');
    const unsubWithdrawals = onSnapshot(withdrawalsColRef, (snapshot) => {
      const wList: WithdrawalRequest[] = [];
      snapshot.forEach((d) => wList.push({ id: d.id, ...d.data() } as WithdrawalRequest));
      setWithdrawals(wList.filter((w) => w.userId === userIdStr || isAdminOpen));
    });

    // 6. Sync Transactions
    const trxColRef = collection(db, 'transactions');
    const unsubTrx = onSnapshot(trxColRef, (snapshot) => {
      const tList: TransactionRecord[] = [];
      snapshot.forEach((d) => tList.push({ id: d.id, ...d.data() } as TransactionRecord));
      setTransactions(tList);
    });

    // 7. Sync Plans
    const plansColRef = collection(db, 'plans');
    const unsubPlans = onSnapshot(plansColRef, (snapshot) => {
      if (!snapshot.empty) {
        const pList: SubscriptionPlan[] = [];
        snapshot.forEach((d) => pList.push({ id: d.id, ...d.data() } as SubscriptionPlan));
        setPlans(pList);
      } else {
        DEFAULT_PLANS.forEach((pData) => {
          setDoc(doc(db, 'plans', pData.id), pData);
        });
      }
    });

    return () => {
      unsubConfig();
      unsubUser();
      unsubTasks();
      unsubAllUsers();
      unsubWithdrawals();
      unsubTrx();
      unsubPlans();
    };
  }, [userIdStr, isAdminOpen]);

  // Level Up Check Logic
  const checkAndApplyLevelUp = async (currentXp: number, currentLevel: number) => {
    const scale = config.appSettings.xpLevelScale || [0, 50, 150, 300, 600, 1000, 2000, 4000, 8000, 15000];
    let newLevel = currentLevel;

    for (let i = scale.length - 1; i >= 0; i--) {
      if (currentXp >= scale[i]) {
        newLevel = i + 1;
        break;
      }
    }

    if (newLevel > currentLevel) {
      playLevelUpSound();
      confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });
      alert(`🎉 অভিনন্দন! আপনি লেভেল ${newLevel} এ উত্তীর্ণ হয়েছেন!`);
      const userRef = doc(db, 'users', userIdStr);
      await updateDoc(userRef, { level: newLevel });
    }
  };

  // Daily Bonus Handler
  const handleClaimDailyBonus = async () => {
    if (!user) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const newStreak = (user.dailyBonusStreak || 0) + 1;
    const multiplier = 1 + newStreak * 0.1;
    const bonusVal = (config.appSettings.dailyBonusBase + newStreak * config.appSettings.dailyBonusIncrement) * multiplier;

    const newXp = (user.xp || 0) + 20;
    const userRef = doc(db, 'users', userIdStr);

    await updateDoc(userRef, {
      balance: (user.balance || 0) + bonusVal,
      totalEarned: (user.totalEarned || 0) + bonusVal,
      dailyBonusStreak: newStreak,
      lastDailyClaim: todayStr,
      xp: newXp,
    });

    await checkAndApplyLevelUp(newXp, user.level || 1);
  };

  // Task Complete Handler
  const handleCompleteTask = async (task: TaskItem) => {
    if (!user) return;

    // Get active plan multiplier
    const planObj = plans.find((p) => p.name === user.plan);
    const planMultiplier = planObj ? planObj.extraRewardMultiplier : 1.0;
    const finalReward = task.reward * (task.bonusMultiplier || 1) * planMultiplier;

    const newXp = (user.xp || 0) + (config.appSettings.xpPerTask || 15);
    const newBalance = (user.balance || 0) + finalReward;
    const newTotalEarned = (user.totalEarned || 0) + finalReward;
    const newTasksDone = (user.tasksCompleted || 0) + 1;

    // Save user state in Firestore
    const userRef = doc(db, 'users', userIdStr);
    await updateDoc(userRef, {
      balance: newBalance,
      totalEarned: newTotalEarned,
      tasksCompleted: newTasksDone,
      xp: newXp,
    });

    // Update local task history
    setTaskHistory((prev) => ({
      ...prev,
      [task.id]: {
        lastCompletedAt: Date.now(),
        countToday: (prev[task.id]?.countToday || 0) + 1,
        lastResetDate: new Date().toISOString().split('T')[0],
      },
    }));

    // Check referrer tier commission
    if (user.referredBy) {
      try {
        const refCommPercent = config.appSettings.referCommission || 10;
        const commAmt = (finalReward * refCommPercent) / 100;
        const refDocRef = doc(db, 'users', user.referredBy);
        const refSnap = await getDoc(refDocRef);
        if (refSnap.exists()) {
          const rData = refSnap.data() as UserProfile;
          await updateDoc(refDocRef, {
            balance: (rData.balance || 0) + commAmt,
            totalEarned: (rData.totalEarned || 0) + commAmt,
          });
        }
      } catch (e) {
        console.error('Error paying referral commission:', e);
      }
    }

    await checkAndApplyLevelUp(newXp, user.level || 1);
  };

  // Video Ad Handler
  const handleWatchVideoAd = async () => {
    if (!user) return;
    const rewardVal = config.appSettings.videoAdReward || 0.8;
    const newXp = (user.xp || 0) + 10;

    const userRef = doc(db, 'users', userIdStr);
    await updateDoc(userRef, {
      balance: (user.balance || 0) + rewardVal,
      totalEarned: (user.totalEarned || 0) + rewardVal,
      xp: newXp,
    });

    playWinSound();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    alert(`🎉 ভিডিও অ্যাড দেখার জন্য ৳${rewardVal.toFixed(2)} এবং 10 XP যোগ হয়েছে!`);

    await checkAndApplyLevelUp(newXp, user.level || 1);
  };

  // Spin Wheel Result Handler
  const handleSpinResult = async (rewardAmount: number, isFree: boolean) => {
    if (!user) return;

    let newBalance = user.balance || 0;
    if (!isFree) {
      newBalance -= config.appSettings.spinCost || 2;
    }
    newBalance += rewardAmount;

    const newXp = (user.xp || 0) + 5;
    const userRef = doc(db, 'users', userIdStr);

    await updateDoc(userRef, {
      balance: newBalance,
      totalEarned: (user.totalEarned || 0) + rewardAmount,
      xp: newXp,
    });

    setSpinsToday((prev) => prev + 1);
    await checkAndApplyLevelUp(newXp, user.level || 1);
  };

  // Withdrawal Submit Handler
  const handleSubmitWithdrawal = async (
    method: 'bKash' | 'Nagad' | 'USDT',
    accountNumber: string,
    amountBDT: number,
    fromSavings: boolean
  ) => {
    if (!user) return;
    const usdtRate = config.appSettings.usdtRate || 122;
    const amountUSDT = amountBDT / usdtRate;

    // Deduct user balance immediately
    const userRef = doc(db, 'users', userIdStr);
    if (fromSavings) {
      await updateDoc(userRef, { savingsBalance: (user.savingsBalance || 0) - amountBDT });
    } else {
      await updateDoc(userRef, { balance: (user.balance || 0) - amountBDT });
    }

    // Add withdrawal request document
    const wCol = collection(db, 'withdrawals');
    await addDoc(wCol, {
      userId: userIdStr,
      userName: user.name,
      method,
      accountNumber,
      amountBDT,
      amountUSDT,
      status: 'pending',
      fromSavings,
      createdAt: new Date().toISOString(),
    });
  };

  // Savings Wallet Transfer Handler
  const handleTransferSavings = async (amount: number, toSavings: boolean) => {
    if (!user) return;
    const userRef = doc(db, 'users', userIdStr);
    if (toSavings) {
      await updateDoc(userRef, {
        balance: (user.balance || 0) - amount,
        savingsBalance: (user.savingsBalance || 0) + amount,
      });
    } else {
      await updateDoc(userRef, {
        balance: (user.balance || 0) + amount,
        savingsBalance: (user.savingsBalance || 0) - amount,
      });
    }
  };

  // Plan Payment Submit Handler
  const handleSubmitPlanPayment = async (plan: SubscriptionPlan, trxId: string, senderNum: string) => {
    if (!user) return;
    const trxCol = collection(db, 'transactions');
    await addDoc(trxCol, {
      userId: userIdStr,
      userName: user.name,
      planId: plan.id,
      planName: plan.name,
      amount: plan.price,
      trxId,
      senderNumber: senderNum,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  };

  // Admin Actions
  const handleAdminUpdateConfig = async (newConfig: AppGlobalConfig) => {
    const configDocRef = doc(db, 'config', 'appConfig');
    await setDoc(configDocRef, sanitizeForFirestore(newConfig));
    setConfig(newConfig);
  };

  const handleAdminSaveTask = async (task: Partial<TaskItem>) => {
    const cleanTask = sanitizeForFirestore(task);
    if (cleanTask.id) {
      const tRef = doc(db, 'tasks', cleanTask.id);
      await updateDoc(tRef, cleanTask);
    } else {
      const tCol = collection(db, 'tasks');
      await addDoc(tCol, {
        ...cleanTask,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const handleAdminDeleteTask = async (taskId: string) => {
    const tRef = doc(db, 'tasks', taskId);
    await deleteDoc(tRef);
  };

  const handleAdminUpdateUser = async (userId: string, data: Partial<UserProfile>) => {
    const uRef = doc(db, 'users', userId);
    await updateDoc(uRef, sanitizeForFirestore(data));
  };

  const handleAdminProcessWithdrawal = async (
    withdrawalId: string,
    status: 'approved' | 'rejected',
    note?: string
  ) => {
    const wRef = doc(db, 'withdrawals', withdrawalId);
    await updateDoc(wRef, sanitizeForFirestore({ status, note }));

    // If rejected, refund user balance!
    if (status === 'rejected') {
      const wObj = withdrawals.find((w) => w.id === withdrawalId);
      if (wObj) {
        const uRef = doc(db, 'users', wObj.userId);
        const uSnap = await getDoc(uRef);
        if (uSnap.exists()) {
          const uData = uSnap.data() as UserProfile;
          if (wObj.fromSavings) {
            await updateDoc(uRef, { savingsBalance: (uData.savingsBalance || 0) + wObj.amountBDT });
          } else {
            await updateDoc(uRef, { balance: (uData.balance || 0) + wObj.amountBDT });
          }
        }
      }
    }
  };

  const handleAdminProcessTransaction = async (transactionId: string, status: 'approved' | 'rejected') => {
    const tRef = doc(db, 'transactions', transactionId);
    await updateDoc(tRef, { status });

    if (status === 'approved') {
      const trxObj = transactions.find((t) => t.id === transactionId);
      if (trxObj) {
        const uRef = doc(db, 'users', trxObj.userId);
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        await updateDoc(uRef, {
          plan: trxObj.planName,
          planExpiry: expiryDate.toISOString(),
        });
      }
    }
  };

  // Render Banned Screen if user is banned
  if (user && user.isBanned) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center p-6 text-center space-y-4 font-['Hind_Siliguri',sans-serif]">
        <ShieldAlert className="w-20 h-20 text-red-500 animate-bounce" />
        <h2 className="text-2xl font-extrabold text-red-500">একাউন্ট সাময়িকভাবে স্থগিত (Banned)</h2>
        <p className="text-sm text-gray-300 max-w-sm">
          অ্যান্টি-চিট পলিসি ভঙ্গের কারণে আপনার একাউন্ট স্থগিত করা হয়েছে। সহায়তার জন্য সাপোর্ট টিমের সাথে যোগাযোগ করুন।
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8E1] dark:bg-[#121212] text-gray-900 dark:text-gray-100 font-['Hind_Siliguri',sans-serif] transition-colors flex flex-col justify-between">
      {/* Top Header */}
      <Header
        user={user}
        lang={lang}
        onLanguageToggle={() => setLang((prev) => (prev === 'bn' ? 'en' : 'bn'))}
        theme={theme}
        onThemeToggle={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenNotifications={() => setIsNotifOpen(true)}
        unreadNotifCount={config.adminNotifications?.length || 0}
        onLogoTap={() => {}}
      />

      {/* Main Container Views */}
      <main className="max-w-md mx-auto w-full px-3.5 pt-3 flex-1">
        {user ? (
          <>
            {currentTab === 'home' && (
              <HomeView
                user={user}
                config={config.appSettings}
                lang={lang}
                tasks={tasks}
                onNavigate={(t) => setCurrentTab(t)}
                onClaimDailyBonus={handleClaimDailyBonus}
                onOpenSavingsModal={() => setCurrentTab('withdraw')}
              />
            )}

            {currentTab === 'tasks' && (
              <TasksView
                user={user}
                tasks={tasks}
                config={config.appSettings}
                lang={lang}
                taskHistory={taskHistory}
                onCompleteTask={handleCompleteTask}
                onWatchVideoAd={handleWatchVideoAd}
              />
            )}

            {currentTab === 'spin' && (
              <SpinWheelView
                user={user}
                config={config.appSettings}
                lang={lang}
                spinsToday={spinsToday}
                onSpinResult={handleSpinResult}
              />
            )}

            {currentTab === 'referral' && (
              <ReferralView user={user} config={config.appSettings} lang={lang} />
            )}

            {currentTab === 'withdraw' && (
              <WithdrawView
                user={user}
                config={config.appSettings}
                lang={lang}
                withdrawals={withdrawals}
                onSubmitWithdrawal={handleSubmitWithdrawal}
                onTransferSavings={handleTransferSavings}
              />
            )}

            {currentTab === 'leaderboard' && (
              <LeaderboardView user={user} leaderboardUsers={allUsers} lang={lang} />
            )}

            {currentTab === 'plans' && (
              <PlansView
                user={user}
                plans={plans}
                config={config}
                lang={lang}
                onSubmitPlanPayment={handleSubmitPlanPayment}
              />
            )}

            {currentTab === 'profile' && (
              <ProfileView user={user} lang={lang} logs={logs} />
            )}

            {currentTab === 'settings' && (
              <SettingsView
                user={user}
                lang={lang}
                onLanguageToggle={() => setLang((prev) => (prev === 'bn' ? 'en' : 'bn'))}
                theme={theme}
                onThemeToggle={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
                onOpenAdmin={() => setIsAdminOpen(true)}
              />
            )}
          </>
        ) : (
          /* Loading Skeleton */
          <div className="flex flex-col items-center justify-center py-20 space-y-3 text-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-500 flex items-center justify-center text-3xl animate-bounce">
              🥭
            </div>
            <p className="text-sm font-bold text-gray-600 dark:text-gray-300">
              Mango Mini App লোড হচ্ছে...
            </p>
          </div>
        )}
      </main>

      {/* Bottom Nav Bar */}
      <Navigation currentTab={currentTab} onTabChange={(tab) => setCurrentTab(tab)} lang={lang} />

      {/* Notifications Modal */}
      {isNotifOpen && (
        <NotificationsModal config={config} lang={lang} onClose={() => setIsNotifOpen(false)} />
      )}

      {/* Hidden Admin Control Panel Modal */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        users={allUsers}
        tasks={tasks}
        withdrawals={withdrawals}
        transactions={transactions}
        plans={plans}
        config={config}
        lang={lang}
        onUpdateConfig={handleAdminUpdateConfig}
        onSaveTask={handleAdminSaveTask}
        onDeleteTask={handleAdminDeleteTask}
        onUpdateUser={handleAdminUpdateUser}
        onProcessWithdrawal={handleAdminProcessWithdrawal}
        onProcessTransaction={handleAdminProcessTransaction}
      />
    </div>
  );
}
