import React, { useState, useEffect } from 'react';
import { UserProfile, TaskItem, Language, AppConfigSettings, UserTaskHistory } from '../types';
import { t } from '../i18n';
import { CheckCircle2, Lock, Clock, Play, Sparkles, AlertTriangle, Eye, ShieldAlert, ArrowLeft } from 'lucide-react';
import { triggerHapticFeedback } from '../telegram';
import { playWinSound, playLevelUpSound } from '../audio';
import confetti from 'canvas-confetti';

interface TasksViewProps {
  user: UserProfile;
  tasks: TaskItem[];
  config: AppConfigSettings;
  lang: Language;
  taskHistory: UserTaskHistory;
  onCompleteTask: (task: TaskItem) => Promise<void>;
  onWatchVideoAd: () => Promise<void>;
}

export const TasksView: React.FC<TasksViewProps> = ({
  user,
  tasks,
  config,
  lang,
  taskHistory,
  onCompleteTask,
  onWatchVideoAd,
}) => {
  const [activeCategory, setActiveCategory] = useState<'general' | 'missions' | 'video'>('general');
  const [activeTaskOverlay, setActiveTaskOverlay] = useState<TaskItem | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTaskReadyToClaim, setIsTaskReadyToClaim] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter tasks based on category
  const filteredTasks = tasks.filter((task) => {
    if (activeCategory === 'missions') return task.type === 'daily_mission';
    if (activeCategory === 'video') return task.type === 'video';
    return task.type === 'timer' || task.type === 'visit';
  });

  // Anti-Cheat Timer & Visibility Listener
  useEffect(() => {
    if (!activeTaskOverlay || isTaskReadyToClaim) return;

    // Visibility change listener
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (isPaused) return prev; // Do not decrement if user left tab!
        if (prev <= 1) {
          clearInterval(interval);
          setIsTaskReadyToClaim(true);
          triggerHapticFeedback('success');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeTaskOverlay, isPaused, isTaskReadyToClaim]);

  // Start task handler
  const handleStartTask = (task: TaskItem) => {
    triggerHapticFeedback('medium');
    
    // Check level
    if (user.level < task.levelRequired) {
      alert(`এই টাস্কটি আনলক করতে লেভেল ${task.levelRequired} প্রয়োজন!`);
      return;
    }

    // Check cooldown
    const history = taskHistory[task.id];
    if (history && task.cooldownMinutes && task.cooldownMinutes > 0) {
      const elapsedMins = (Date.now() - history.lastCompletedAt) / (1000 * 60);
      if (elapsedMins < task.cooldownMinutes) {
        const remaining = Math.ceil(task.cooldownMinutes - elapsedMins);
        alert(`আবার করতে অপেক্ষা করুন: ${remaining} মিনিট`);
        return;
      }
    }

    // Trigger Monetag SDK if available or open link in background tab
    if (typeof window !== 'undefined' && (window as any).show_11470108) {
      try {
        (window as any).show_11470108().then(() => {
          console.log('Monetag ad displayed');
        }).catch((err: any) => console.log('Monetag error:', err));
      } catch (e) {
        // ignore
      }
    }

    if (task.link) {
      window.open(task.link, '_blank');
    }

    setActiveTaskOverlay(task);
    setTimeLeft(task.duration || 15);
    setIsPaused(false);
    setIsTaskReadyToClaim(false);
  };

  // Claim Task Handler
  const handleClaimReward = async () => {
    if (!activeTaskOverlay || isSubmitting) return;
    setIsSubmitting(true);
    triggerHapticFeedback('success');
    playWinSound();
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });

    try {
      await onCompleteTask(activeTaskOverlay);
      setActiveTaskOverlay(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Category Tabs */}
      <div className="flex bg-white dark:bg-[#1E1E1E] p-1.5 rounded-2xl border border-[#FFE0B2] dark:border-amber-900/40 shadow-sm">
        <button
          onClick={() => {
            triggerHapticFeedback('light');
            setActiveCategory('general');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeCategory === 'general'
              ? 'bg-gradient-to-r from-[#FF9800] to-[#FFC107] text-white shadow-sm font-extrabold'
              : 'text-gray-600 dark:text-gray-400 hover:text-[#FF9800]'
          }`}
        >
          {t('cat_general', lang)}
        </button>
        <button
          onClick={() => {
            triggerHapticFeedback('light');
            setActiveCategory('missions');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeCategory === 'missions'
              ? 'bg-gradient-to-r from-[#FF9800] to-[#FFC107] text-white shadow-sm font-extrabold'
              : 'text-gray-600 dark:text-gray-400 hover:text-[#FF9800]'
          }`}
        >
          {t('cat_missions', lang)}
        </button>
        <button
          onClick={() => {
            triggerHapticFeedback('light');
            setActiveCategory('video');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeCategory === 'video'
              ? 'bg-gradient-to-r from-[#FF9800] to-[#FFC107] text-white shadow-sm font-extrabold'
              : 'text-gray-600 dark:text-gray-400 hover:text-[#FF9800]'
          }`}
        >
          {t('cat_video_ads', lang)}
        </button>
      </div>

      {/* Video Ad Direct Watcher Box (if category is video) */}
      {activeCategory === 'video' && (
        <div className="bg-gradient-to-br from-[#FF9800] to-[#FFC107] text-white p-5 rounded-3xl shadow-lg space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl">
              🎬
            </div>
            <div>
              <h3 className="font-extrabold text-base">{t('video_ad_btn', lang)}</h3>
              <p className="text-xs text-amber-100">{t('video_ad_desc', lang)}</p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHapticFeedback('heavy');
              onWatchVideoAd();
            }}
            className="w-full py-3 bg-white text-[#FF9800] font-black text-sm rounded-2xl shadow-md hover:bg-amber-50 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-[#FF9800]" />
            <span>অ্যাড দেখুন (+৳{config.videoAdReward.toFixed(2)} BDT)</span>
          </button>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-[#1E1E1E] rounded-3xl border border-[#FFE0B2] dark:border-amber-900/40 p-6">
            <p className="text-3xl">📋</p>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mt-2">
              এই ক্যাটাগরিতে বর্তমানে কোনো টাস্ক উপলব্ধ নেই
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isLevelLocked = user.level < task.levelRequired;
            const history = taskHistory[task.id];
            
            // Check cooldown
            let isCooldown = false;
            let cooldownRemainingMins = 0;
            if (history && task.cooldownMinutes && task.cooldownMinutes > 0) {
              const elapsedMins = (Date.now() - history.lastCompletedAt) / (1000 * 60);
              if (elapsedMins < task.cooldownMinutes) {
                isCooldown = true;
                cooldownRemainingMins = Math.ceil(task.cooldownMinutes - elapsedMins);
              }
            }

            // Check max daily
            let isMaxReached = false;
            if (task.maxPerDay && history && history.countToday >= task.maxPerDay) {
              isMaxReached = true;
            }

            return (
              <div
                key={task.id}
                className="bg-white dark:bg-[#1E1E1E] p-4 rounded-3xl border border-[#FFE0B2] dark:border-amber-900/40 shadow-sm space-y-3 transition-all hover:border-[#FF9800]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FFF8E1] dark:bg-amber-950/60 text-[#FF9800] dark:text-amber-400 flex items-center justify-center text-xl shrink-0 border border-[#FFE0B2]">
                      {task.type === 'video' ? '🎬' : task.type === 'daily_mission' ? '⭐' : '⚡'}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#3E2723] dark:text-gray-100">
                        {task.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {task.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-[#FF9800] dark:text-amber-400 bg-[#FFF8E1] dark:bg-amber-950/50 px-2.5 py-1 rounded-full border border-[#FFE0B2] dark:border-amber-800">
                      +৳{(task.reward * (task.bonusMultiplier || 1)).toFixed(2)}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {task.duration}s
                    </span>
                  </div>

                  {/* Action Button */}
                  {isLevelLocked ? (
                    <span className="flex items-center gap-1 text-red-500 font-bold bg-red-50 dark:bg-red-950/40 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/50 text-[11px]">
                      <Lock className="w-3.5 h-3.5" /> Lv.{task.levelRequired} Req
                    </span>
                  ) : isMaxReached ? (
                    <span className="text-gray-400 font-bold bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-xl text-[11px]">
                      আজকের লিমিট শেষ
                    </span>
                  ) : isCooldown ? (
                    <span className="text-orange-500 font-bold bg-orange-50 dark:bg-orange-950/40 px-3 py-1.5 rounded-xl border border-orange-200 dark:border-orange-900/50 text-[11px] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {cooldownRemainingMins} মি. অপেক্ষা
                    </span>
                  ) : (
                    <button
                      onClick={() => handleStartTask(task)}
                      className="bg-[#FF9800] hover:bg-[#F57C00] text-white px-4 py-1.5 rounded-xl font-bold text-xs shadow-sm active:scale-95 transition-all flex items-center gap-1"
                    >
                      <span>{t('start_task', lang)}</span>
                      <Play className="w-3.5 h-3.5 fill-white" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Fullscreen Anti-Cheat Task Timer Overlay */}
      {activeTaskOverlay && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center">
          <div className="max-w-md w-full bg-[#1E1E1E] border border-amber-500/40 p-6 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden">
            {/* Header info */}
            <div className="space-y-1">
              <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                Anti-Cheat Verified Task
              </span>
              <h3 className="text-lg font-bold text-white">{activeTaskOverlay.title}</h3>
            </div>

            {/* Circular Timer Visual */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <div
                className={`w-full h-full rounded-full border-8 border-amber-500/20 flex items-center justify-center ${
                  isPaused ? 'border-red-500/50 animate-pulse' : 'border-t-amber-500 animate-spin-slow'
                }`}
              />
              <div className="absolute text-center">
                {isTaskReadyToClaim ? (
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                ) : (
                  <>
                    <span className="text-4xl font-black font-['Outfit',sans-serif]">{timeLeft}</span>
                    <span className="block text-[10px] text-gray-400 uppercase">Seconds</span>
                  </>
                )}
              </div>
            </div>

            {/* Anti-Cheat Pause Warning Banner */}
            {isPaused ? (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-2xl text-xs font-bold flex items-center gap-2 justify-center animate-bounce">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <span>⚠️ অ্যান্টি-চিট সক্রিয়! অ্যাপে ফিরে আসুন, টাইমার পজ করা হয়েছে।</span>
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 p-3 rounded-2xl text-xs flex items-center gap-2 justify-center">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{t('anticheat_warning', lang)}</span>
              </div>
            )}

            {/* Action Buttons */}
            {isTaskReadyToClaim ? (
              <button
                onClick={handleClaimReward}
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>
                  {isSubmitting
                    ? 'সংগ্রহ করা হচ্ছে...'
                    : `ক্লেইম করুন (+৳${(activeTaskOverlay.reward * (activeTaskOverlay.bonusMultiplier || 1)).toFixed(2)})`}
                </span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTaskOverlay(null)}
                className="text-xs text-gray-400 hover:text-white underline pt-2"
              >
                টাস্ক বাতিল করুন
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
