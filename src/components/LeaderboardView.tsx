import React, { useState } from 'react';
import { UserProfile, Language } from '../types';
import { t } from '../i18n';
import { Trophy, Award, Crown, User, TrendingUp } from 'lucide-react';
import { triggerHapticFeedback } from '../telegram';

interface LeaderboardViewProps {
  user: UserProfile;
  leaderboardUsers: UserProfile[];
  lang: Language;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  user,
  leaderboardUsers,
  lang,
}) => {
  const [filter, setFilter] = useState<'all' | 'monthly' | 'weekly'>('all');

  // Find user's rank in sorted array
  const sortedUsers = [...leaderboardUsers].sort((a, b) => b.totalEarned - a.totalEarned);
  const userRankIndex = sortedUsers.findIndex((u) => u.id === user.id);
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : '100+';

  return (
    <div className="space-y-4 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white p-5 rounded-3xl shadow-lg space-y-2 text-center">
        <Trophy className="w-10 h-10 mx-auto text-yellow-200 animate-bounce" />
        <h2 className="text-xl font-black font-['Outfit',sans-serif]">{t('leaderboard_title', lang)}</h2>
        <p className="text-xs text-amber-100">সর্বোচ্চ উপার্জনকারী বিশ্বস্ত ব্যবহারকারীদের তালিকা</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-white dark:bg-[#1E1E1E] p-1.5 rounded-2xl border border-amber-200/70 dark:border-amber-900/40 shadow-sm text-xs font-bold">
        <button
          onClick={() => {
            triggerHapticFeedback('light');
            setFilter('all');
          }}
          className={`flex-1 py-2 rounded-xl transition-all ${
            filter === 'all'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          সর্বকালীন
        </button>
        <button
          onClick={() => {
            triggerHapticFeedback('light');
            setFilter('monthly');
          }}
          className={`flex-1 py-2 rounded-xl transition-all ${
            filter === 'monthly'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          মাসিক
        </button>
        <button
          onClick={() => {
            triggerHapticFeedback('light');
            setFilter('weekly');
          }}
          className={`flex-1 py-2 rounded-xl transition-all ${
            filter === 'weekly'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          সাপ্তাহিক
        </button>
      </div>

      {/* Leaderboard Table List */}
      <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-3xl border border-amber-200/70 dark:border-amber-900/40 shadow-sm space-y-2.5">
        {sortedUsers.slice(0, 20).map((u, idx) => {
          const rank = idx + 1;
          const isMe = u.id === user.id;

          return (
            <div
              key={u.id}
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                isMe
                  ? 'bg-amber-100/80 dark:bg-amber-950/80 border-amber-400 font-bold ring-2 ring-amber-400/50'
                  : rank === 1
                  ? 'bg-yellow-50 dark:bg-yellow-950/40 border-yellow-300'
                  : rank === 2
                  ? 'bg-gray-50 dark:bg-gray-800/60 border-gray-300'
                  : rank === 3
                  ? 'bg-amber-50/50 dark:bg-orange-950/30 border-amber-200'
                  : 'bg-white dark:bg-[#1E1E1E] border-gray-100 dark:border-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Rank Trophy Badge */}
                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0">
                  {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                </div>

                <div>
                  <h4 className="font-bold text-xs text-gray-800 dark:text-gray-100 flex items-center gap-1">
                    {u.name}
                    {isMe && <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.2 rounded-md">আপনি</span>}
                  </h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    লেভেল {u.level || 1} • {u.tasksCompleted || 0}টি টাস্ক
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-extrabold text-sm text-amber-600 dark:text-amber-400">
                  ৳{(u.totalEarned || 0).toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* User's Fixed Rank Bar at Bottom */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3.5 rounded-2xl shadow-lg flex items-center justify-between text-xs font-bold">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-200" />
          <span>আপনার বর্তমান অবস্থান (Rank):</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base font-black">#{userRank}</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[11px]">
            ৳{(user.totalEarned || 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
