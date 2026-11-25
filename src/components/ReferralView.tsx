import React, { useState } from 'react';
import { UserProfile, Language, AppConfigSettings } from '../types';
import { t } from '../i18n';
import { Users, Copy, Check, Share2, Network, Sparkles, ChevronRight } from 'lucide-react';
import { triggerHapticFeedback } from '../telegram';

interface ReferralViewProps {
  user: UserProfile;
  config: AppConfigSettings;
  lang: Language;
}

export const ReferralView: React.FC<ReferralViewProps> = ({ user, config, lang }) => {
  const [copied, setCopied] = useState(false);

  const refCode = user.referralCode || user.id;
  const refLink = `https://t.me/MangoBot?start=ref_${refCode}`;

  const handleCopyLink = () => {
    triggerHapticFeedback('success');
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = () => {
    triggerHapticFeedback('medium');
    const shareText = `🥭 Mango App এ জয়েন করে প্রতিদিন টাকা আয় করুন! রেফারেল কোড: ${refCode}`;
    if (navigator.share) {
      navigator.share({
        title: 'Mango Mini App',
        text: shareText,
        url: refLink,
      }).catch(() => {});
    } else {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  const l1Count = user.referralTierCounts?.level1 || 0;
  const l2Count = user.referralTierCounts?.level2 || 0;
  const l3Count = user.referralTierCounts?.level3 || 0;
  const totalRefs = l1Count + l2Count + l3Count;

  return (
    <div className="space-y-4 pb-20">
      {/* Referral Banner */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white p-5 rounded-3xl shadow-lg space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl">
            👥
          </div>
          <div>
            <h2 className="text-lg font-black font-['Outfit',sans-serif]">{t('ref_title', lang)}</h2>
            <p className="text-xs text-amber-100">{t('ref_desc', lang)}</p>
          </div>
        </div>
      </div>

      {/* Referral Link & Share Box */}
      <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-3xl border border-amber-200/70 dark:border-amber-900/40 shadow-sm space-y-3">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
          {t('ref_link_label', lang)}
        </label>
        
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-2.5 rounded-2xl border border-gray-200 dark:border-gray-700">
          <input
            type="text"
            readOnly
            value={refLink}
            className="bg-transparent text-xs text-gray-800 dark:text-gray-200 font-mono w-full outline-none"
          />
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 bg-amber-500 text-white font-bold text-xs rounded-xl hover:bg-amber-600 transition-colors flex items-center gap-1 shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'কপি হয়েছে' : 'কপি'}</span>
          </button>
        </div>

        <button
          onClick={handleShare}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs rounded-2xl shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          <span>টেলিগ্রামে বন্ধুদের শেয়ার করুন</span>
        </button>
      </div>

      {/* 3-Tier Network Tree Breakdown */}
      <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-3xl border border-amber-200/70 dark:border-amber-900/40 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
            <Network className="w-4 h-4 text-amber-500" />
            রেফারেল ট্রি (৩ লেভেল নেটওয়ার্ক)
          </h3>
          <span className="text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 rounded-full">
            মোট: {totalRefs} জন
          </span>
        </div>

        <div className="space-y-2 pt-1">
          {/* Level 1 */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-gray-800/50 border border-amber-200/60 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white font-extrabold text-xs flex items-center justify-center">
                L1
              </div>
              <div>
                <h5 className="font-bold text-xs text-gray-800 dark:text-gray-100">
                  {t('tier_level_1', lang, { count: l1Count })}
                </h5>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  কমিশন: {config.referCommission || 10}%
                </p>
              </div>
            </div>
            <span className="font-extrabold text-sm text-amber-600 dark:text-amber-400">
              {l1Count} Users
            </span>
          </div>

          {/* Level 2 */}
          <div className="p-3.5 rounded-2xl bg-orange-50/70 dark:bg-gray-800/40 border border-orange-200/60 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-orange-500 text-white font-extrabold text-xs flex items-center justify-center">
                L2
              </div>
              <div>
                <h5 className="font-bold text-xs text-gray-800 dark:text-gray-100">
                  {t('tier_level_2', lang, { count: l2Count })}
                </h5>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  কমিশন: {config.referCommissionLevel2 || 5}%
                </p>
              </div>
            </div>
            <span className="font-extrabold text-sm text-orange-600 dark:text-orange-400">
              {l2Count} Users
            </span>
          </div>

          {/* Level 3 */}
          <div className="p-3.5 rounded-2xl bg-yellow-50/70 dark:bg-gray-800/30 border border-yellow-200/60 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-yellow-500 text-white font-extrabold text-xs flex items-center justify-center">
                L3
              </div>
              <div>
                <h5 className="font-bold text-xs text-gray-800 dark:text-gray-100">
                  {t('tier_level_3', lang, { count: l3Count })}
                </h5>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  কমিশন: {config.referCommissionLevel3 || 2}%
                </p>
              </div>
            </div>
            <span className="font-extrabold text-sm text-yellow-600 dark:text-yellow-400">
              {l3Count} Users
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
