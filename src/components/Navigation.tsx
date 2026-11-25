import React from 'react';
import { Language } from '../types';
import { t } from '../i18n';
import { Home, CheckSquare, Disc, Users, Wallet, Trophy, Star, Settings } from 'lucide-react';
import { triggerHapticFeedback } from '../telegram';

export type NavTab = 'home' | 'tasks' | 'spin' | 'referral' | 'withdraw' | 'leaderboard' | 'plans' | 'settings';

interface NavigationProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  lang: Language;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange, lang }) => {
  const tabs: { id: NavTab; labelKey: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', labelKey: 'tab_home', icon: Home },
    { id: 'tasks', labelKey: 'tab_tasks', icon: CheckSquare },
    { id: 'spin', labelKey: 'tab_spin', icon: Disc },
    { id: 'referral', labelKey: 'tab_referral', icon: Users },
    { id: 'withdraw', labelKey: 'tab_withdraw', icon: Wallet },
    { id: 'leaderboard', labelKey: 'tab_leaderboard', icon: Trophy },
    { id: 'plans', labelKey: 'tab_plans', icon: Star },
    { id: 'settings', labelKey: 'tab_settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#181818]/95 backdrop-blur-md border-t border-[#FFE0B2] dark:border-amber-900/30 px-2 py-1.5 shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-8 gap-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHapticFeedback('light');
                onTabChange(tab.id);
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-[#FF9800] dark:text-amber-400 bg-[#FFF8E1] dark:bg-amber-950/50 font-black scale-105'
                  : 'text-gray-500 dark:text-gray-400 hover:text-[#FF9800] dark:hover:text-amber-300'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[9px] leading-tight truncate max-w-full">
                {t(tab.labelKey, lang)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
