import React, { useRef, useState, useEffect } from 'react';
import { UserProfile, Language, AppConfigSettings } from '../types';
import { t } from '../i18n';
import { Disc, Sparkles, Award, RotateCw } from 'lucide-react';
import { triggerHapticFeedback } from '../telegram';
import { playTickSound, playWinSound } from '../audio';
import confetti from 'canvas-confetti';

interface SpinWheelViewProps {
  user: UserProfile;
  config: AppConfigSettings;
  lang: Language;
  spinsToday: number;
  onSpinResult: (rewardAmount: number, isFree: boolean) => Promise<void>;
}

export const SpinWheelView: React.FC<SpinWheelViewProps> = ({
  user,
  config,
  lang,
  spinsToday,
  onSpinResult,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResultModal, setSpinResultModal] = useState<number | null>(null);

  const rewards = config.spinRewards || [0.5, 1, 2, 5, 0, 10, 1.5, 2.5];
  const totalSectors = rewards.length;
  const freeSpinsAllowed = (config.freeSpinsPerDay || 1) + (user.plan === 'Pro' ? 2 : user.plan === 'VIP' ? 4 : user.plan === 'Max' ? 6 : 0);
  const freeSpinsLeft = Math.max(0, freeSpinsAllowed - spinsToday);
  const maxSpinsReached = spinsToday >= (config.maxSpinsPerDay || 5);

  const colors = [
    '#FF9800', '#FFC107', '#FF5722', '#4CAF50',
    '#9C27B0', '#2196F3', '#E91E63', '#00BCD4',
  ];

  // Draw wheel on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 10;
    const arc = (2 * Math.PI) / totalSectors;

    ctx.clearRect(0, 0, width, height);

    // Draw sectors
    for (let i = 0; i < totalSectors; i++) {
      const angle = i * arc;
      ctx.beginPath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + arc);
      ctx.lineTo(centerX, centerY);
      ctx.fill();

      // Sector border
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Text label
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px "Outfit", sans-serif';
      const label = rewards[i] === 0 ? 'Try Again' : `৳${rewards[i]}`;
      ctx.fillText(label, radius - 15, 5);
      ctx.restore();
    }

    // Draw center pin
    ctx.beginPath();
    ctx.fillStyle = '#1A1A1A';
    ctx.arc(centerX, centerY, 22, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#FFC107';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🥭', centerX, centerY + 5);
  }, [rewards]);

  // Spin animation function
  const handleStartSpin = async () => {
    if (isSpinning || maxSpinsReached) return;

    const isFree = freeSpinsLeft > 0;
    if (!isFree && user.balance < config.spinCost) {
      alert(`স্পিন করতে মিনিমাম ৳${config.spinCost} ব্যালেন্স প্রয়োজন!`);
      return;
    }

    triggerHapticFeedback('heavy');
    setIsSpinning(true);

    // Pick random winning sector index
    const winningIndex = Math.floor(Math.random() * totalSectors);
    const winAmount = rewards[winningIndex];

    const canvas = canvasRef.current;
    if (!canvas) return;

    let startAngle = 0;
    const sectorAngle = (360 / totalSectors);
    // Target angle calculation so pointer (top) stops at sector
    const targetSectorAngle = 360 - (winningIndex * sectorAngle) - (sectorAngle / 2);
    const totalRotation = 360 * 5 + targetSectorAngle; // 5 full spins + target

    let currentAngle = 0;
    let speed = 25; // initial degrees per frame
    let lastTickSector = -1;

    const animate = async () => {
      currentAngle += speed;
      speed *= 0.982; // decelerate

      // Audio tick calculation
      const currentSector = Math.floor((currentAngle % 360) / sectorAngle);
      if (currentSector !== lastTickSector) {
        playTickSound();
        lastTickSector = currentSector;
      }

      if (canvas) {
        canvas.style.transform = `rotate(${currentAngle}deg)`;
      }

      if (speed > 0.3) {
        requestAnimationFrame(animate);
      } else {
        // Stop animation exactly on target
        if (canvas) {
          canvas.style.transform = `rotate(${totalRotation}deg)`;
        }
        setIsSpinning(false);
        triggerHapticFeedback('success');

        if (winAmount > 0) {
          playWinSound();
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        }

        // Save result in Firestore
        await onSpinResult(winAmount, isFree);
        setSpinResultModal(winAmount);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white p-5 rounded-3xl shadow-lg text-center space-y-1">
        <h2 className="text-xl font-black font-['Outfit',sans-serif] flex items-center justify-center gap-2">
          <Disc className="w-6 h-6 animate-spin-slow" />
          {t('spin_title', lang)}
        </h2>
        <p className="text-xs text-amber-100">
          {freeSpinsLeft > 0
            ? t('free_spins_left', lang, { count: freeSpinsLeft })
            : t('spin_cost', lang, { cost: config.spinCost })}
        </p>
      </div>

      {/* Graphical Wheel Canvas Container */}
      <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-3xl border border-amber-200/70 dark:border-amber-900/40 shadow-sm flex flex-col items-center justify-center space-y-6 relative">
        {/* Top Fixed Pointer Arrow */}
        <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-red-600 dark:border-t-red-500 z-20 drop-shadow-md -mb-4" />

        {/* Canvas Wheel */}
        <div className="relative p-2 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-full shadow-2xl">
          <canvas
            ref={canvasRef}
            width={280}
            height={280}
            className="rounded-full transition-transform duration-75"
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleStartSpin}
          disabled={isSpinning || maxSpinsReached}
          className={`w-full max-w-xs py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
            isSpinning || maxSpinsReached
              ? 'bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white hover:brightness-105'
          }`}
        >
          <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>
            {isSpinning
              ? 'ঘুরছে...'
              : maxSpinsReached
              ? t('no_spins_left', lang)
              : freeSpinsLeft > 0
              ? 'ফ্রি স্পিন করুন!'
              : `স্পিন (৳${config.spinCost})`}
          </span>
        </button>

        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          আজকের মোট স্পিন: {spinsToday} / {config.maxSpinsPerDay || 5}টি
        </p>
      </div>

      {/* Result Celebration Modal */}
      {spinResultModal !== null && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 text-center">
          <div className="bg-white dark:bg-[#1E1E1E] border border-amber-400 p-6 rounded-3xl max-w-xs w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="text-5xl animate-bounce">
              {spinResultModal > 0 ? '🎉' : '😅'}
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-gray-800 dark:text-gray-100">
                {spinResultModal > 0 ? 'অভিনন্দন!' : 'কপাল খারাপ!'}
              </h3>
              <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-1">
                {spinResultModal > 0
                  ? t('spin_won', lang, { amount: spinResultModal })
                  : 'পরের বার আবার চেষ্টা করুন!'}
              </p>
            </div>
            <button
              onClick={() => setSpinResultModal(null)}
              className="w-full py-2.5 bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md hover:bg-amber-600 transition-colors"
            >
              ঠিক আছে
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
