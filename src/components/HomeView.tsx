import React from 'react';
import { UserProfile, Language, AppConfigSettings, TaskItem } from '../types';
import { t } from '../i18n';
import { Sparkles, Gift, TrendingUp, Zap, ChevronRight, PiggyBank, Award, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { triggerHapticFeedback } from '../telegram';
import { playWinSound } from '../audio';
import confetti from 'canvas-confetti';

interface HomeViewProps {
  user: UserProfile;
  config: AppConfigSettings;
  lang: Language;
  tasks: TaskItem[];
  onNavigate: (tab: any) => void;
  onClaimDailyBonus: () => void;
  onOpenSavingsModal: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  config,
  lang,
  tasks,
  onNavigate,
  onClaimDailyBonus,
  onOpenSavingsModal,
}) => {
  // Calculate Level XP bounds
  const levelScale = config.xpLevelScale || [0, 50, 150, 300, 600, 1000, 2000, 4000, 8000, 15000];
  const currentLevelIndex = Math.min(user.level - 1, levelScale.length - 1);
  const currentLevelMinXp = levelScale[currentLevelIndex] || 0;
  const nextLevelXp = levelScale[Math.min(currentLevelIndex + 1, levelScale.length - 1)] || currentLevelMinXp + 1000;
  
  const xpInCurrentLevel = Math.max(0, user.xp - currentLevelMinXp);
  const xpNeededForNext = Math.max(1, nextLevelXp - currentLevelMinXp);
  const xpPercent = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNext) * 100));

  // Daily streak check
  const todayStr = new Date().toISOString().split('T')[0];
  const isClaimedToday = user.lastDailyClaim === todayStr;
  const currentStreak = user.dailyBonusStreak || 0;

  // Streak multiplier calculation
  const currentMultiplier = 1 + currentStreak * 0.1;
  const nextBonusAmount = (config.dailyBonusBase + currentStreak * config.dailyBonusIncrement) * currentMultiplier;

  const handleClaim = () => {
    if (isClaimedToday) return;
    triggerHapticFeedback('success');
    playWinSound();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    onClaimDailyBonus();
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Welcome & Profile Summary */}
      <div className="flex items-center justify-between bg-white dark:bg-[#1E1E1E] p-3.5 rounded-2xl border border-[#FFE0B2] dark:border-amber-900/40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF9800] to-[#FFC107] flex items-center justify-center text-2xl shadow-md border-2 border-white">
            🥭
          </div>
          <div>
            <h2 className="font-bold text-base text-[#3E2723] dark:text-gray-100 flex items-center gap-1.5">
              {user.name}
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFE0B2] dark:bg-amber-950 text-[#FF9800] dark:text-amber-300 font-extrabold">
                Lv.{user.level}
              </span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              @{user.username || 'telegram_user'} • {user.plan || 'Basic'} Plan
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('profile')}
          className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-[#FF9800] dark:text-amber-400 text-xs font-semibold flex items-center gap-1 transition-colors"
        >
          <Award className="w-4 h-4" />
          <span>{t('profile_title', lang).split(' ')[0]}</span>
        </button>
      </div>

      {/* Main Vibrant Balance Card */}
      <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-[24px] text-center vibrant-card-shadow border-2 border-[#FFC107] dark:border-amber-700/60 space-y-4">
        <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
          {t('balance', lang)} (BDT)
        </div>
        <div className="text-4xl sm:text-5xl font-black text-[#FF9800] tracking-tight font-['Outfit',sans-serif]">
          ৳ {(user.balance || 0).toFixed(2)}
        </div>

        {/* Withdraw Action Button */}
        <button
          onClick={() => onNavigate('withdraw')}
          className="w-full py-3 bg-[#FF9800] hover:bg-[#F57C00] text-white font-black text-sm rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>টাকা তুলুন (Withdraw)</span>
        </button>

        {/* Level XP Progress Bar */}
        <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex justify-between text-xs font-bold text-gray-600 dark:text-gray-300">
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-[#FF9800]" /> XP Progress
            </span>
            <span>
              {user.xp} / {nextLevelXp} XP ({xpPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#FF9800] to-[#FFC107] rounded-full transition-all duration-500"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
          <div className="flex items-center gap-2 bg-[#FFF8E1] dark:bg-gray-800/60 rounded-xl p-2.5 border border-[#FFE0B2] dark:border-gray-700/50">
            <TrendingUp className="w-4 h-4 text-[#FF9800]" />
            <div className="text-left">
              <p className="text-[10px] text-gray-500 dark:text-gray-400">{t('total_earned', lang)}</p>
              <p className="font-extrabold text-sm text-[#3E2723] dark:text-gray-100">৳{(user.totalEarned || 0).toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#FFF8E1] dark:bg-gray-800/60 rounded-xl p-2.5 border border-[#FFE0B2] dark:border-gray-700/50">
            <Sparkles className="w-4 h-4 text-[#FF9800]" />
            <div className="text-left">
              <p className="text-[10px] text-gray-500 dark:text-gray-400">{t('tasks_done', lang)}</p>
              <p className="font-extrabold text-sm text-[#3E2723] dark:text-gray-100">{user.tasksCompleted || 0}টি</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Bonus Streak Card */}
      <div className="bg-white dark:bg-[#1E1E1E] p-5 rounded-2xl border border-[#FFE0B2] dark:border-amber-900/40 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-[#FF9800] flex items-center justify-center font-bold">
              🎁
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#3E2723] dark:text-gray-100">
                {t('daily_bonus_title', lang)}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {t('streak_days', lang, { count: currentStreak })}
              </p>
            </div>
          </div>
          <span className="text-xs font-black text-[#FF9800] bg-[#FFF8E1] dark:bg-amber-950/50 px-2.5 py-1 rounded-full border border-[#FFE0B2] dark:border-amber-800">
            Day {currentStreak}
          </span>
        </div>

        {/* 7-Day Dots Grid matching Vibrant Palette */}
        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => {
            const isCompletedDay = day <= currentStreak;
            const isTodayTarget = day === currentStreak + 1;
            return (
              <div
                key={day}
                className={`flex flex-col items-center justify-center py-2.5 rounded-full text-center transition-all ${
                  isCompletedDay
                    ? 'bg-[#FF9800] text-white font-black shadow-sm'
                    : isTodayTarget
                    ? 'bg-[#FFC107] text-[#3E2723] font-black ring-2 ring-[#FF9800]'
                    : 'bg-[#F5F5F5] dark:bg-gray-800 text-gray-400 border border-[#EEEEEE] dark:border-gray-700'
                }`}
              >
                <span className="text-xs font-bold">{day}</span>
              </div>
            );
          })}
        </div>

        {/* Claim Action Button */}
        <button
          onClick={handleClaim}
          disabled={isClaimedToday}
          className={`w-full py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            isClaimedToday
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              : 'bg-[#FF9800] hover:bg-[#F57C00] text-white shadow-md'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>
            {isClaimedToday
              ? t('claimed_today', lang)
              : t('claim_daily_bonus', lang, { amount: nextBonusAmount.toFixed(2) })}
          </span>
        </button>
      </div>

      {/* Quick Feature Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div
          onClick={() => {
            triggerHapticFeedback('light');
            onNavigate('spin');
          }}
          className="bg-white dark:bg-[#1E1E1E] p-4 rounded-2xl border border-[#FFE0B2] dark:border-amber-900/40 text-center hover:border-[#FF9800] cursor-pointer transition-all active:scale-95 shadow-sm group"
        >
          <i className="text-3xl block mb-1">🎡</i>
          <span className="font-bold text-xs text-[#3E2723] dark:text-gray-100">{t('tab_spin', lang)}</span>
        </div>

        <div
          onClick={() => {
            triggerHapticFeedback('light');
            onNavigate('referral');
          }}
          className="bg-white dark:bg-[#1E1E1E] p-4 rounded-2xl border border-[#FFE0B2] dark:border-amber-900/40 text-center hover:border-[#FF9800] cursor-pointer transition-all active:scale-95 shadow-sm group"
        >
          <i className="text-3xl block mb-1">👥</i>
          <span className="font-bold text-xs text-[#3E2723] dark:text-gray-100">{t('tab_referral', lang)}</span>
        </div>

        <div
          onClick={() => {
            triggerHapticFeedback('light');
            onNavigate('plans');
          }}
          className="bg-white dark:bg-[#1E1E1E] p-4 rounded-2xl border border-[#FFE0B2] dark:border-amber-900/40 text-center hover:border-[#FF9800] cursor-pointer transition-all active:scale-95 shadow-sm group"
        >
          <i className="text-3xl block mb-1">⭐</i>
          <span className="font-bold text-xs text-[#3E2723] dark:text-gray-100">{t('tab_plans', lang)}</span>
        </div>

        <div
          onClick={() => {
            triggerHapticFeedback('light');
            onNavigate('leaderboard');
          }}
          className="bg-white dark:bg-[#1E1E1E] p-4 rounded-2xl border border-[#FFE0B2] dark:border-amber-900/40 text-center hover:border-[#FF9800] cursor-pointer transition-all active:scale-95 shadow-sm group"
        >
          <i className="text-3xl block mb-1">🏆</i>
          <span className="font-bold text-xs text-[#3E2723] dark:text-gray-100">{t('tab_leaderboard', lang)}</span>
        </div>
      </div>

      {/* Daily Missions Task Section */}
      <div className="bg-white dark:bg-[#1E1E1E] p-5 rounded-[24px] border border-[#FFE0B2] dark:border-amber-900/40 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-extrabold text-[#3E2723] dark:text-gray-100 flex items-center gap-1.5">
            ডেইলি মিশন (Daily Missions) 🥭
          </h2>
          <span className="text-xs text-gray-500 font-medium">
            {tasks.length}টি টাস্ক
          </span>
        </div>

        <div className="space-y-2.5">
          {tasks.slice(0, 4).map((task) => (
            <div
              key={task.id}
              className="flex items-center p-3.5 border border-[#F1F1F1] dark:border-gray-800 rounded-xl hover:border-[#FF9800] transition-all bg-[#FFF8E1]/40 dark:bg-gray-800/30"
            >
              <div className="w-11 h-11 bg-[#FFF8E1] dark:bg-gray-800 rounded-xl flex items-center justify-center text-xl mr-3 shrink-0 border border-[#FFE0B2] dark:border-gray-700">
                {task.type === 'video' ? '📺' : task.type === 'visit' ? '🌐' : '⚡'}
              </div>
              <div className="grow pr-2">
                <div className="font-bold text-xs text-[#3E2723] dark:text-gray-100 leading-snug">{task.title}</div>
                <div className="text-[#FF9800] text-xs font-bold mt-0.5">
                  + ৳ {task.reward.toFixed(2)} & {config.xpPerTask || 15} XP
                </div>
              </div>
              <button
                onClick={() => onNavigate('tasks')}
                className="bg-[#FF9800] hover:bg-[#F57C00] text-white px-4 py-2 rounded-xl text-xs font-bold border-none cursor-pointer shrink-0 transition-all active:scale-95 shadow-sm"
              >
                শুরু করুন
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
