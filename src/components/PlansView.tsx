import React, { useState } from 'react';
import { UserProfile, SubscriptionPlan, Language, AppGlobalConfig } from '../types';
import { t } from '../i18n';
import { Star, CheckCircle, Sparkles, Send, ShieldCheck, ArrowRight } from 'lucide-react';
import { triggerHapticFeedback } from '../telegram';

interface PlansViewProps {
  user: UserProfile;
  plans: SubscriptionPlan[];
  config: AppGlobalConfig;
  lang: Language;
  onSubmitPlanPayment: (plan: SubscriptionPlan, trxId: string, senderNum: string) => Promise<void>;
}

export const PlansView: React.FC<PlansViewProps> = ({
  user,
  plans,
  config,
  lang,
  onSubmitPlanPayment,
}) => {
  const [selectedPlanModal, setSelectedPlanModal] = useState<SubscriptionPlan | null>(null);
  const [trxId, setTrxId] = useState('');
  const [senderNum, setSenderNum] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bKashNumber = config.bKashNumber || '01909247703';

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanModal) return;

    if (!trxId.trim() || !senderNum.trim()) {
      alert('অনুগ্রহ করে Transaction ID এবং প্রেরক বিকাশ নম্বর সঠিকভাবে দিন!');
      return;
    }

    setIsSubmitting(true);
    triggerHapticFeedback('success');

    try {
      await onSubmitPlanPayment(selectedPlanModal, trxId.trim(), senderNum.trim());
      alert('পেমেন্ট রিকোয়েস্ট সফলভাবে জমা হয়েছে! অ্যাডমিন রিভিউয়ের পর আপনার প্ল্যান অ্যাক্টিভ হবে।');
      setSelectedPlanModal(null);
      setTrxId('');
      setSenderNum('');
    } catch (e) {
      console.error(e);
      alert('পেমেন্ট রিকোয়েস্ট সাবমিট করতে সমস্যা হয়েছে!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white p-5 rounded-3xl shadow-lg space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl">
            ⭐
          </div>
          <div>
            <h2 className="text-lg font-black font-['Outfit',sans-serif]">{t('plans_title', lang)}</h2>
            <p className="text-xs text-amber-100">{t('plans_desc', lang)}</p>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 gap-3.5">
        {plans.map((plan) => {
          const isCurrentPlan = user.plan === plan.name || (user.plan === 'Basic' && plan.price === 0);

          return (
            <div
              key={plan.id}
              className={`bg-white dark:bg-[#1E1E1E] p-5 rounded-3xl border transition-all space-y-3 relative overflow-hidden ${
                isCurrentPlan
                  ? 'border-amber-500 ring-2 ring-amber-400/50 shadow-md'
                  : 'border-amber-200/70 dark:border-amber-900/40 hover:border-amber-400'
              }`}
            >
              {isCurrentPlan && (
                <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-xl shadow-sm flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> অ্যাক্টিভ প্ল্যান
                </div>
              )}

              <div className="flex justify-between items-center pr-16">
                <div>
                  <h3 className="font-extrabold text-base text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    মেয়াদ: {plan.validityDays} দিন
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-['Outfit',sans-serif]">
                    ৳{plan.price}
                  </span>
                </div>
              </div>

              {/* Benefits List */}
              <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
                <p className="font-bold text-gray-700 dark:text-gray-300">{t('plan_benefits', lang)}</p>
                <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{plan.extraRewardMultiplier}x আর্নিং বোনাস</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>+{plan.freeSpinsExtra}টি স্পিন/দিন</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>+{plan.referralCommissionBoost}% রেফার বুস্ট</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{plan.levelBoost}x XP বোস্ট</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {plan.price > 0 && !isCurrentPlan && (
                <button
                  onClick={() => {
                    triggerHapticFeedback('medium');
                    setSelectedPlanModal(plan);
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-xs rounded-2xl shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t('buy_plan', lang, { price: plan.price })}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Payment bKash Modal */}
      {selectedPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
          <form
            onSubmit={handlePaymentSubmit}
            className="bg-white dark:bg-[#1E1E1E] border border-amber-400 p-6 rounded-3xl max-w-sm w-full shadow-2xl space-y-4 text-left"
          >
            <div className="flex items-center justify-between border-b pb-2 dark:border-gray-700">
              <h3 className="font-extrabold text-sm text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500" />
                {selectedPlanModal.name} প্ল্যান সাবস্ক্রিপশন
              </h3>
              <button
                type="button"
                onClick={() => setSelectedPlanModal(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/60 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800/60 space-y-1 text-xs">
              <p className="font-bold text-amber-800 dark:text-amber-300">
                {t('plan_payment_instruction', lang)}
              </p>
              <div className="text-base font-black text-amber-600 dark:text-amber-400 font-mono select-all bg-white dark:bg-gray-900 p-2 rounded-xl border border-amber-300 text-center">
                {bKashNumber}
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center pt-1">
                সেন্ড মানি পরিমাণ: <span className="font-bold text-amber-600">৳{selectedPlanModal.price} BDT</span>
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                প্রেরক বিকাশ নম্বর:
              </label>
              <input
                type="text"
                required
                value={senderNum}
                onChange={(e) => setSenderNum(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-3 text-xs text-gray-800 dark:text-gray-100 outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                বিকাশ TrxID (Transaction ID):
              </label>
              <input
                type="text"
                required
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                placeholder="9K7X8Y..."
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-3 text-xs text-gray-800 dark:text-gray-100 outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-extrabold text-xs rounded-2xl shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'জমা হচ্ছে...' : t('submit_payment', lang)}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
