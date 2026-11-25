import React from 'react';
import { UserProfile, Language, ActivityLog } from '../types';
import { t } from '../i18n';
import { Award, Shield, Sparkles, CheckCircle2, History, User } from 'lucide-react';

interface ProfileViewProps {
  user: UserProfile;
  lang: Language;
  logs: ActivityLog[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, lang, logs }) => {
  const allPossibleBadges = [
    { id: 'starter_mango', name: 'নতুন আম 🥭', desc: 'Mango অ্যাপে সাইন আপ করেছেন' },
    { id: 'task_master_10', name: 'টাস্ক মাষ্টার ⚡', desc: '১০টির বেশি টাস্ক সম্পন্ন করেছেন' },
    { id: 'referral_star_5', name: 'রেফার স্টার 👥', desc: '৫জন বন্ধুকে ইনভাইট করেছেন' },
    { id: 'savings_hero', name: 'সঞ্চয়ী 🏦', desc: 'সঞ্চয় ওয়ালেটে টাকা জমিয়েছেন' },
    { id: 'pro_member', name: 'প্রিমিয়াম মেম্বার ⭐', desc: 'প্রিমিয়াম সাবস্ক্রিপশন প্ল্যান নিয়েছেন' },
    { id: 'level_10_legend', name: 'লেভেল ১০ লেজেন্ড 🏆', desc: 'লেভেল ১০ আনলক করেছেন' },
  ];

  return (
    <div className="space-y-4 pb-20">
      {/* Profile Card */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white p-5 rounded-3xl shadow-lg space-y-4 text-center">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl shadow-inner border border-white/30">
          🥭
        </div>
        <div>
          <h2 className="text-xl font-black font-['Outfit',sans-serif]">{user.name}</h2>
          <p className="text-xs text-amber-100 font-mono">ID: {user.id}</p>
        </div>

        <div className="grid grid-cols-3 gap-2 bg-black/20 backdrop-blur-md p-3 rounded-2xl text-xs">
          <div>
            <p className="text-[10px] text-amber-200 uppercase font-bold">লেভেল</p>
            <p className="font-extrabold text-base">Lv.{user.level || 1}</p>
          </div>
          <div>
            <p className="text-[10px] text-amber-200 uppercase font-bold">অভিজ্ঞতা (XP)</p>
            <p className="font-extrabold text-base">{user.xp || 0}</p>
          </div>
          <div>
            <p className="text-[10px] text-amber-200 uppercase font-bold">প্ল্যান</p>
            <p className="font-extrabold text-base">{user.plan || 'Basic'}</p>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-3xl border border-amber-200/70 dark:border-amber-900/40 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-500" />
          {t('badges_title', lang)}
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          {allPossibleBadges.map((badge) => {
            const isUnlocked = user.badges?.includes(badge.id) || (badge.id === 'starter_mango');

            return (
              <div
                key={badge.id}
                className={`p-3 rounded-2xl border transition-all flex items-start gap-2.5 ${
                  isUnlocked
                    ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 text-gray-800 dark:text-gray-100'
                    : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 opacity-50 grayscale'
                }`}
              >
                <div className="text-xl shrink-0">{badge.name.split(' ')[2] || '🏅'}</div>
                <div>
                  <h4 className="font-bold text-xs">{badge.name}</h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{badge.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Activity Log */}
      <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-3xl border border-amber-200/70 dark:border-amber-900/40 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
          <History className="w-4 h-4 text-amber-500" />
          {t('activity_log', lang)}
        </h3>

        {logs.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
            কোন কর্মকাণ্ডের ইতিহাস পাওয়া যায়নি।
          </p>
        ) : (
          <div className="space-y-2">
            {logs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-200">{log.action}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">{log.details}</p>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString('bn-BD')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
