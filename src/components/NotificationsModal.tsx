import React from 'react';
import { AppGlobalConfig, Language } from '../types';
import { t } from '../i18n';
import { Bell, X, Sparkles, CheckCircle2 } from 'lucide-react';

interface NotificationsModalProps {
  config: AppGlobalConfig;
  lang: Language;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ config, lang, onClose }) => {
  const notifs = config.adminNotifications || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 text-left">
      <div className="bg-white dark:bg-[#1E1E1E] border border-amber-400 p-5 rounded-3xl max-w-sm w-full shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between border-b pb-2 dark:border-gray-700 shrink-0">
          <h3 className="font-extrabold text-sm text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-amber-500" />
            {t('notifications_title', lang)}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-3 pr-1 grow">
          {notifs.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-6">
              {t('no_notifications', lang)}
            </p>
          ) : (
            notifs.map((n) => (
              <div
                key={n.id}
                className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between font-bold text-gray-900 dark:text-gray-100">
                  <span>{n.title}</span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {new Date(n.createdAt).toLocaleDateString('bn-BD')}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {n.message}
                </p>
              </div>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-amber-500 text-white font-bold text-xs rounded-2xl shadow-md hover:bg-amber-600 transition-colors shrink-0"
        >
          বন্ধ করুন
        </button>
      </div>
    </div>
  );
};
