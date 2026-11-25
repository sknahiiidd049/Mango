import React, { useState } from 'react';
import { UserProfile, Language, ThemeMode } from '../types';
import { t } from '../i18n';
import { Settings, Moon, Sun, Globe, Shield, User, Copy, Check, Users } from 'lucide-react';
import { triggerHapticFeedback, setDemoUser } from '../telegram';

interface SettingsViewProps {
  user: UserProfile;
  lang: Language;
  onLanguageToggle: () => void;
  theme: ThemeMode;
  onThemeToggle: () => void;
  onOpenAdmin: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  lang,
  onLanguageToggle,
  theme,
  onThemeToggle,
  onOpenAdmin,
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [customDemoId, setCustomDemoId] = useState('');
  const [customDemoName, setCustomDemoName] = useState('');

  const handleCopyId = () => {
    triggerHapticFeedback('success');
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSwitchDemoUser = (id: number, name: string) => {
    triggerHapticFeedback('medium');
    setDemoUser(id, name, `user_${id}`);
  };

  const handleCustomDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const idNum = Number(customDemoId);
    if (isNaN(idNum) || !idNum || !customDemoName.trim()) return;
    setDemoUser(idNum, customDemoName.trim(), `user_${idNum}`);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Settings Header */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white p-5 rounded-3xl shadow-lg space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl">
            ⚙️
          </div>
          <div>
            <h2 className="text-lg font-black font-['Outfit',sans-serif]">{t('settings_title', lang)}</h2>
            <p className="text-xs text-amber-100">অ্যাপ প্রেফারেন্স ও ইউজার সেটিংস</p>
          </div>
        </div>
      </div>

      {/* Language & Theme Controls */}
      <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-3xl border border-amber-200/70 dark:border-amber-900/40 shadow-sm space-y-3">
        {/* Language */}
        <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-amber-500" />
            <div>
              <h4 className="font-bold text-xs text-gray-800 dark:text-gray-100">{t('language_select', lang)}</h4>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">বর্তমান: {lang === 'bn' ? 'বাংলা (Bengali)' : 'English'}</p>
            </div>
          </div>
          <button
            onClick={onLanguageToggle}
            className="px-3 py-1.5 bg-amber-500 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-amber-600 transition-colors"
          >
            {lang === 'bn' ? 'EN' : 'বাংলা'}
          </button>
        </div>

        {/* Theme */}
        <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <div className="flex items-center gap-2.5">
            {theme === 'dark' ? <Moon className="w-5 h-5 text-amber-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <div>
              <h4 className="font-bold text-xs text-gray-800 dark:text-gray-100">{t('theme_select', lang)}</h4>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">বর্তমান: {theme === 'dark' ? t('dark_mode', lang) : t('light_mode', lang)}</p>
            </div>
          </div>
          <button
            onClick={onThemeToggle}
            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold text-xs rounded-xl shadow-sm hover:bg-amber-100 transition-colors"
          >
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>

      {/* User Telegram ID Info */}
      <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-3xl border border-amber-200/70 dark:border-amber-900/40 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
          <User className="w-4 h-4 text-amber-500" />
          টেলিগ্রাম একাউন্ট তথ্য
        </h3>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 text-xs">
          <div>
            <p className="text-[10px] text-gray-400">টেলিগ্রাম ইউজার আইডি:</p>
            <p className="font-mono font-bold text-gray-800 dark:text-gray-100">{user.id}</p>
          </div>
          <button
            onClick={handleCopyId}
            className="p-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-colors"
          >
            {copiedId ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Demo Multi-User Switcher (For Browser Testing) */}
      <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-3xl border border-amber-200/70 dark:border-amber-900/40 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-amber-500" />
          মাল্টি-ইউজার সুইচ (টেস্টিং মোড)
        </h3>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          ব্রাউজার প্রিভিউতে বিভিন্ন টেলিগ্রাম ইউজার আইডি দিয়ে রেফারেল ও অন্যান্য ফিচার টেস্ট করতে নিচের আইডি সুইচার ব্যবহার করুন:
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs font-bold">
          <button
            onClick={() => handleSwitchDemoUser(987654321, 'আম ব্যবহারকারী ১')}
            className="py-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300"
          >
            ইউজার ১ (#987654321)
          </button>
          <button
            onClick={() => handleSwitchDemoUser(123456789, 'আম ব্যবহারকারী ২')}
            className="py-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300"
          >
            ইউজার ২ (#123456789)
          </button>
        </div>

        {/* Custom ID Switcher */}
        <form onSubmit={handleCustomDemoSubmit} className="flex gap-2 pt-1">
          <input
            type="number"
            value={customDemoId}
            onChange={(e) => setCustomDemoId(e.target.value)}
            placeholder="কাস্টম ID"
            className="w-1/2 bg-gray-50 dark:bg-gray-800 border rounded-xl p-2 text-xs outline-none"
          />
          <input
            type="text"
            value={customDemoName}
            onChange={(e) => setCustomDemoName(e.target.value)}
            placeholder="নাম"
            className="w-1/2 bg-gray-50 dark:bg-gray-800 border rounded-xl p-2 text-xs outline-none"
          />
          <button
            type="submit"
            className="px-3 bg-amber-500 text-white font-bold text-xs rounded-xl shrink-0"
          >
            সুইচ
          </button>
        </form>
      </div>

      {/* Admin Login Trigger */}
      <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-3xl border border-amber-200/70 dark:border-amber-900/40 shadow-sm">
        <button
          onClick={onOpenAdmin}
          className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white font-extrabold text-xs rounded-2xl shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2"
        >
          <Shield className="w-4 h-4" />
          <span>{t('admin_login_btn', lang)} (লগইন)</span>
        </button>
      </div>
    </div>
  );
};
