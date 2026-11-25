import React, { useState } from 'react';
import { UserProfile, Language, ThemeMode } from '../types';
import { t } from '../i18n';
import { Bell, Moon, Sun, Shield, Award, Sparkles } from 'lucide-react';
import { triggerHapticFeedback } from '../telegram';

interface HeaderProps {
  user: UserProfile | null;
  lang: Language;
  onLanguageToggle: () => void;
  theme: ThemeMode;
  onThemeToggle: () => void;
  onOpenAdmin: () => void;
  onOpenNotifications: () => void;
  unreadNotifCount: number;
  onLogoTap: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  lang,
  onLanguageToggle,
  theme,
  onThemeToggle,
  onOpenAdmin,
  onOpenNotifications,
  unreadNotifCount,
  onLogoTap,
}) => {
  const [logoTaps, setLogoTaps] = useState(0);

  const handleLogoClick = () => {
    triggerHapticFeedback('light');
    const newCount = logoTaps + 1;
    setLogoTaps(newCount);
    onLogoTap();
    if (newCount >= 5) {
      setLogoTaps(0);
      onOpenAdmin();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-[#FF9800] via-[#FFA726] to-[#FFC107] text-white px-4 py-3 shadow-md transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo & Avatar Circle */}
        <div
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          title="5-tap for admin"
        >
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/50 flex items-center justify-center text-xl shadow-inner group-active:scale-95 transition-transform shrink-0">
            🥭
          </div>
          <div>
            <h1 className="font-extrabold text-base leading-tight text-white font-['Outfit',sans-serif] drop-shadow-sm">
              {user?.name || 'Mango App'}
            </h1>
            <p className="text-[10px] text-amber-100 font-medium flex items-center gap-1">
              {user?.plan && user.plan !== 'Basic' ? (
                <span className="font-bold flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-yellow-200" /> {user.plan} Pro
                </span>
              ) : (
                `Level ${user?.level || 1} • XP ${user?.xp || 0}`
              )}
            </p>
          </div>
        </div>

        {/* User XP Progress Bar or Balance Pill */}
        {user && (
          <div className="flex items-center gap-2">
            {/* Balance Badge */}
            <div className="flex items-center gap-1 bg-white/25 backdrop-blur-md border border-white/40 text-white px-3 py-1 rounded-full text-xs font-black shadow-sm">
              <span className="text-yellow-200">৳</span>
              <span>{(user.balance || 0).toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Right Action Controls */}
        <div className="flex items-center gap-1">
          {/* Language Toggle */}
          <button
            onClick={() => {
              triggerHapticFeedback('light');
              onLanguageToggle();
            }}
            className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 transition-colors shadow-sm"
          >
            {lang === 'bn' ? 'EN' : 'বাংলা'}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => {
              triggerHapticFeedback('light');
              onThemeToggle();
            }}
            className="p-1.5 rounded-full text-white hover:bg-white/20 backdrop-blur-md transition-colors"
            title={t('theme_select', lang)}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-200" /> : <Moon className="w-4 h-4 text-white" />}
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => {
              triggerHapticFeedback('light');
              onOpenNotifications();
            }}
            className="relative p-1.5 rounded-full text-white hover:bg-white/20 backdrop-blur-md transition-colors"
          >
            <Bell className="w-4 h-4 text-white" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse border border-white">
                {unreadNotifCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
