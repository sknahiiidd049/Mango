import React, { useState } from 'react';
import { UserProfile, Language, AppConfigSettings, WithdrawalRequest } from '../types';
import { t } from '../i18n';
import { Wallet, PiggyBank, ArrowRightLeft, Clock, CheckCircle, XCircle, DollarSign, Send } from 'lucide-react';
import { triggerHapticFeedback } from '../telegram';

interface WithdrawViewProps {
  user: UserProfile;
  config: AppConfigSettings;
  lang: Language;
  withdrawals: WithdrawalRequest[];
  onSubmitWithdrawal: (method: 'bKash' | 'Nagad' | 'USDT', accountNumber: string, amountBDT: number, fromSavings: boolean) => Promise<void>;
  onTransferSavings: (amount: number, toSavings: boolean) => Promise<void>;
}

export const WithdrawView: React.FC<WithdrawViewProps> = ({
  user,
  config,
  lang,
  withdrawals,
  onSubmitWithdrawal,
  onTransferSavings,
}) => {
  const [method, setMethod] = useState<'bKash' | 'Nagad' | 'USDT'>('bKash');
  const [accountNumber, setAccountNumber] = useState('');
  const [amountBDT, setAmountBDT] = useState('');
  const [useSavingsSource, setUseSavingsSource] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Savings Transfer Modal State
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [savingsAmount, setSavingsAmount] = useState('');
  const [transferType, setTransferType] = useState<'to_savings' | 'to_main'>('to_savings');

  const minWithdraw = 50; // BDT
  const usdtEquivalent = (Number(amountBDT) || 0) / (config.usdtRate || 122);
  const availableBalance = useSavingsSource ? user.savingsBalance || 0 : user.balance || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amountBDT);

    if (!accountNumber.trim()) {
      alert('অনুগ্রহ করে মোবাইল নাম্বার বা ওয়ালেট এড্রেস দিন!');
      return;
    }

    if (isNaN(numAmount) || numAmount < minWithdraw) {
      alert(`মিনিমাম উইথড্র পরিমাণ ৳${minWithdraw} BDT!`);
      return;
    }

    if (numAmount > availableBalance) {
      alert('আপনার পর্যাপ্ত ব্যালেন্স নেই!');
      return;
    }

    setIsSubmitting(true);
    triggerHapticFeedback('medium');

    try {
      await onSubmitWithdrawal(method, accountNumber.trim(), numAmount, useSavingsSource);
      alert('উইথড্র রিকোয়েস্ট সফলভাবে সাবমিট করা হয়েছে!');
      setAccountNumber('');
      setAmountBDT('');
    } catch (e) {
      console.error(e);
      alert('উইথড্র সাবমিট করতে সমস্যা হয়েছে!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavingsTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(savingsAmount);
    if (isNaN(amt) || amt <= 0) return;

    if (transferType === 'to_savings' && amt > user.balance) {
      alert('মূল ব্যালেন্সে পর্যাপ্ত টাকা নেই!');
      return;
    }
    if (transferType === 'to_main' && amt > user.savingsBalance) {
      alert('সঞ্চয় ওয়ালেটে পর্যাপ্ত টাকা নেই!');
      return;
    }

    triggerHapticFeedback('success');
    await onTransferSavings(amt, transferType === 'to_savings');
    setShowSavingsModal(false);
    setSavingsAmount('');
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white p-5 rounded-3xl shadow-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl">
              💰
            </div>
            <div>
              <h2 className="text-lg font-black font-['Outfit',sans-serif]">{t('withdraw_title', lang)}</h2>
              <p className="text-xs text-amber-100">{t('min_withdraw', lang, { min: minWithdraw })}</p>
            </div>
          </div>

          <button
            onClick={() => setShowSavingsModal(true)}
            className="bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-2xl flex items-center gap-1 transition-all active:scale-95"
          >
            <PiggyBank className="w-4 h-4 text-amber-200" />
            <span>সঞ্চয় ট্রান্সফার</span>
          </button>
        </div>
      </div>

      {/* Withdraw Request Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1E1E1E] p-4 rounded-3xl border border-amber-200/70 dark:border-amber-900/40 shadow-sm space-y-4">
        {/* Balance Source Toggle */}
        <div className="flex gap-2 p-1 bg-gray-50 dark:bg-gray-800 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setUseSavingsSource(false)}
            className={`flex-1 py-2 rounded-xl transition-all ${
              !useSavingsSource
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            মূল ব্যালেন্স (৳{(user.balance || 0).toFixed(2)})
          </button>
          <button
            type="button"
            onClick={() => setUseSavingsSource(true)}
            className={`flex-1 py-2 rounded-xl transition-all ${
              useSavingsSource
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            সঞ্চয় ওয়ালেট (৳{(user.savingsBalance || 0).toFixed(2)})
          </button>
        </div>

        {/* Method Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
            {t('select_method', lang)}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['bKash', 'Nagad', 'USDT'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  triggerHapticFeedback('light');
                  setMethod(m);
                }}
                className={`py-2.5 px-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  method === m
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                <span>{m === 'bKash' ? 'বিকাশ' : m === 'Nagad' ? 'নগদ' : 'USDT'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Account Number Input */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
            {method === 'USDT' ? 'USDT (TRC20/BEP20) ওয়ালেট এড্রেস:' : t('enter_account', lang)}
          </label>
          <input
            type="text"
            required
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder={method === 'USDT' ? '0x... or T...' : '017XXXXXXXX'}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-3 text-xs text-gray-800 dark:text-gray-100 outline-none focus:border-amber-500"
          />
        </div>

        {/* Amount Input */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
            {t('enter_amount', lang)}
          </label>
          <input
            type="number"
            required
            min={minWithdraw}
            max={availableBalance}
            value={amountBDT}
            onChange={(e) => setAmountBDT(e.target.value)}
            placeholder={`মিনিমাম ৳${minWithdraw}`}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-3 text-xs text-gray-800 dark:text-gray-100 outline-none focus:border-amber-500"
          />
          {method === 'USDT' && amountBDT && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold pt-0.5">
              {t('usdt_equivalent', lang, { usdt: usdtEquivalent.toFixed(2) })} (১ USDT = ৳{config.usdtRate || 122})
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-extrabold text-xs rounded-2xl shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? 'প্রসেসিং হচ্ছে...' : t('submit_withdraw', lang)}</span>
        </button>
      </form>

      {/* Withdrawal History List */}
      <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-3xl border border-amber-200/70 dark:border-amber-900/40 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-amber-500" />
          {t('withdraw_history', lang)}
        </h3>

        {withdrawals.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
            কোন অতীত উইথড্র রেকর্ড পাওয়া যায়নি।
          </p>
        ) : (
          <div className="space-y-2">
            {withdrawals.map((w) => (
              <div
                key={w.id}
                className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-gray-100">
                    <span>{w.method}</span>
                    <span className="text-gray-400">•</span>
                    <span>{w.accountNumber}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {new Date(w.createdAt).toLocaleDateString('bn-BD')}
                  </p>
                </div>

                <div className="text-right space-y-0.5">
                  <p className="font-extrabold text-sm text-gray-900 dark:text-gray-100">
                    ৳{w.amountBDT.toFixed(2)}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      w.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : w.status === 'rejected'
                        ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {w.status === 'approved' ? (
                      <>
                        <CheckCircle className="w-3 h-3" /> Approved
                      </>
                    ) : w.status === 'rejected' ? (
                      <>
                        <XCircle className="w-3 h-3" /> Rejected
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 animate-spin" /> Pending
                      </>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Savings Transfer Modal */}
      {showSavingsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 text-center">
          <form
            onSubmit={handleSavingsTransferSubmit}
            className="bg-white dark:bg-[#1E1E1E] border border-amber-400 p-6 rounded-3xl max-w-sm w-full shadow-2xl space-y-4 text-left"
          >
            <div className="flex items-center justify-between border-b pb-2 dark:border-gray-700">
              <h3 className="font-extrabold text-sm text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
                <PiggyBank className="w-4 h-4 text-amber-500" />
                {t('savings_transfer_title', lang)}
              </h3>
              <button
                type="button"
                onClick={() => setShowSavingsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('savings_desc', lang)}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setTransferType('to_savings')}
                className={`py-2 rounded-xl border transition-all ${
                  transferType === 'to_savings'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    : 'border-gray-200 dark:border-gray-700 text-gray-500'
                }`}
              >
                {t('move_to_savings', lang)}
              </button>
              <button
                type="button"
                onClick={() => setTransferType('to_main')}
                className={`py-2 rounded-xl border transition-all ${
                  transferType === 'to_main'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    : 'border-gray-200 dark:border-gray-700 text-gray-500'
                }`}
              >
                {t('move_to_main', lang)}
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                পরিমাণ (BDT):
              </label>
              <input
                type="number"
                required
                min={1}
                value={savingsAmount}
                onChange={(e) => setSavingsAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-3 text-xs text-gray-800 dark:text-gray-100 outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 text-white font-bold text-xs rounded-2xl shadow-md hover:bg-amber-600 transition-colors"
            >
              ট্রান্সফার নিশ্চিত করুন
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
