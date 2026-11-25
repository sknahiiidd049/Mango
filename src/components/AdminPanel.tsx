import React, { useState } from 'react';
import {
  UserProfile,
  TaskItem,
  WithdrawalRequest,
  TransactionRecord,
  SubscriptionPlan,
  AppGlobalConfig,
  Language,
} from '../types';
import { t } from '../i18n';
import {
  Shield,
  X,
  LayoutDashboard,
  CheckSquare,
  Users,
  Wallet,
  Star,
  Settings,
  Code,
  Database,
  BarChart3,
  Ban,
  Check,
  Plus,
  Trash2,
  Edit,
  Send,
  Download,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { triggerHapticFeedback } from '../telegram';
import { resetFirebaseApp } from '../firebase';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserProfile[];
  tasks: TaskItem[];
  withdrawals: WithdrawalRequest[];
  transactions: TransactionRecord[];
  plans: SubscriptionPlan[];
  config: AppGlobalConfig;
  lang: Language;
  onUpdateConfig: (newConfig: AppGlobalConfig) => Promise<void>;
  onSaveTask: (task: Partial<TaskItem>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onUpdateUser: (userId: string, data: Partial<UserProfile>) => Promise<void>;
  onProcessWithdrawal: (withdrawalId: string, status: 'approved' | 'rejected', note?: string) => Promise<void>;
  onProcessTransaction: (transactionId: string, status: 'approved' | 'rejected') => Promise<void>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  users,
  tasks,
  withdrawals,
  transactions,
  plans,
  config,
  lang,
  onUpdateConfig,
  onSaveTask,
  onDeleteTask,
  onUpdateUser,
  onProcessWithdrawal,
  onProcessTransaction,
}) => {
  // Login auth state
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('mango_admin_logged_in') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'tasks' | 'users' | 'withdrawals' | 'transactions' | 'config' | 'ads' | 'firebase' | 'analytics' | 'banned'
  >('overview');

  // Task Form Modal State
  const [editingTask, setEditingTask] = useState<Partial<TaskItem> | null>(null);

  // User Edit Modal State
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // App Config Local State
  const [configForm, setConfigForm] = useState<AppGlobalConfig>(config);

  // Firebase Config Password Modal
  const [fbPass, setFbPass] = useState('');
  const [fbPassUnlocked, setFbPassUnlocked] = useState(false);
  const [customFbConfigJson, setCustomFbConfigJson] = useState('');

  // Broadcast Message Form
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'mango' && password === '624433') {
      setIsLoggedIn(true);
      localStorage.setItem('mango_admin_logged_in', 'true');
      setAuthError('');
      triggerHapticFeedback('success');
    } else {
      setAuthError('ভুল ইউজারনেম বা পাসওয়ার্ড!');
      triggerHapticFeedback('error');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('mango_admin_logged_in');
  };

  // CSV Data Export Handler
  const handleExportCSV = () => {
    triggerHapticFeedback('success');
    const headers = 'ID,Name,Username,Balance,Savings,Level,XP,Plan,TotalEarned,TasksCompleted\n';
    const rows = users
      .map(
        (u) =>
          `"${u.id}","${u.name}","${u.username || ''}",${u.balance},${u.savingsBalance || 0},${u.level},${u.xp},"${u.plan}",${u.totalEarned},${u.tasksCompleted}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mango_users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Save Config Handler
  const handleSaveConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHapticFeedback('success');
    await onUpdateConfig(configForm);
    alert('কনফিগারেশন সফলভাবে আপডেট হয়েছে!');
  };

  // Send Broadcast Handler
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMsg) return;
    const newNotif = {
      id: `notif_${Date.now()}`,
      title: broadcastTitle,
      message: broadcastMsg,
      createdAt: new Date().toISOString(),
    };
    const updated = {
      ...configForm,
      adminNotifications: [newNotif, ...(configForm.adminNotifications || [])],
    };
    setConfigForm(updated);
    await onUpdateConfig(updated);
    alert('ব্রডকাস্ট নোটিফিকেশন সফলভাবে পাঠানো হয়েছে!');
    setBroadcastTitle('');
    setBroadcastMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col text-left text-gray-800 dark:text-gray-100 font-['Hind_Siliguri',sans-serif]">
      {/* Top Bar */}
      <div className="bg-[#1A1A1A] text-white p-3.5 border-b border-amber-900/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-bold">
            🛡️
          </div>
          <div>
            <h2 className="font-extrabold text-sm flex items-center gap-1.5">
              {t('admin_title', lang)}
              <span className="text-[10px] bg-red-500 text-white font-bold px-2 py-0.5 rounded-md">
                MASTER
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="text-xs bg-red-950/60 text-red-400 border border-red-800/60 px-2.5 py-1 rounded-xl font-bold hover:bg-red-900"
            >
              লগআউট
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-gray-800 text-gray-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Login Screen */}
      {!isLoggedIn ? (
        <div className="grow flex items-center justify-center p-6 bg-[#121212]">
          <form
            onSubmit={handleLoginSubmit}
            className="bg-[#1E1E1E] border border-amber-500/40 p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl"
          >
            <div className="text-center space-y-1">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-500 mx-auto flex items-center justify-center text-3xl">
                🔒
              </div>
              <h3 className="font-extrabold text-lg text-white">অ্যাডমিন প্রবেশাধিকার</h3>
              <p className="text-xs text-gray-400">গোপন ইউজারনেম ও পাসওয়ার্ড দিন</p>
            </div>

            {authError && (
              <p className="text-xs text-red-400 font-bold bg-red-950/60 p-2.5 rounded-xl border border-red-800 text-center">
                {authError}
              </p>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-300">ইউজারনেম (Username):</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="mango"
                className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-3 text-xs text-white outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-300">পাসওয়ার্ড (Password):</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
                className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-3 text-xs text-white outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-xs rounded-2xl shadow-md hover:brightness-105 transition-all"
            >
              লগইন করুন
            </button>
          </form>
        </div>
      ) : (
        /* Admin Dashboard Layout */
        <div className="grow flex flex-col md:flex-row overflow-hidden bg-gray-100 dark:bg-[#121212]">
          {/* Admin Sidebar Navigation */}
          <div className="w-full md:w-60 bg-white dark:bg-[#1A1A1A] border-b md:border-b-0 md:border-r border-amber-200/60 dark:border-amber-900/30 p-2 flex md:flex-col gap-1 overflow-x-auto shrink-0">
            {[
              { id: 'overview', label: 'ওভারভিউ', icon: LayoutDashboard },
              { id: 'tasks', label: 'টাস্কস', icon: CheckSquare },
              { id: 'users', label: 'ইউজারস', icon: Users },
              { id: 'withdrawals', label: 'উইথড্র রিকোয়েস্ট', icon: Wallet },
              { id: 'transactions', label: 'প্ল্যান পেমেন্টস', icon: Star },
              { id: 'config', label: 'কনফিগারেশন', icon: Settings },
              { id: 'ads', label: 'অ্যাড নেটওয়ার্ক', icon: Code },
              { id: 'firebase', label: 'ফায়ারবেস কনফিগ', icon: Database },
              { id: 'analytics', label: 'রিপোর্টস', icon: BarChart3 },
              { id: 'banned', label: 'ব্যানড তালিকা', icon: Ban },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    triggerHapticFeedback('light');
                    setActiveTab(tab.id as any);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-amber-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Admin Main Content Container */}
          <div className="grow overflow-y-auto p-4 space-y-4">
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-base text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5 text-amber-500" />
                  ড্যাশবোর্ড ওভারভিউ
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-3xl border border-amber-200/70 dark:border-amber-900/40 shadow-sm space-y-1">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">মোট ইউজার</p>
                    <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{users.length} জন</p>
                  </div>
                  <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-3xl border border-amber-200/70 dark:border-amber-900/40 shadow-sm space-y-1">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">পেন্ডিং উইথড্র</p>
                    <p className="text-2xl font-black text-orange-600 dark:text-orange-400">
                      {withdrawals.filter((w) => w.status === 'pending').length}টি
                    </p>
                  </div>
                  <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-3xl border border-amber-200/70 dark:border-amber-900/40 shadow-sm space-y-1">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">অ্যাক্টিভ টাস্ক</p>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {tasks.filter((t) => t.active).length}টি
                    </p>
                  </div>
                  <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-3xl border border-amber-200/70 dark:border-amber-900/40 shadow-sm space-y-1">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">পেন্ডিং পেমেন্টস</p>
                    <p className="text-2xl font-black text-yellow-600 dark:text-yellow-400">
                      {transactions.filter((t) => t.status === 'pending').length}টি
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-3xl border border-amber-200/70 dark:border-amber-900/40 shadow-sm space-y-3">
                  <h4 className="font-bold text-xs">কুইক অ্যাডমিন অ্যাকশন</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={handleExportCSV}
                      className="px-3 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-4 h-4" /> ইউজার ডেটা CSV এক্সপোর্ট
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. TASKS TAB */}
            {activeTab === 'tasks' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-base text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-amber-500" />
                    টাস্ক ম্যানেজমেন্ট ({tasks.length})
                  </h3>
                  <button
                    onClick={() =>
                      setEditingTask({
                        title: '',
                        description: '',
                        link: '',
                        reward: 2.0,
                        type: 'timer',
                        duration: 15,
                        active: true,
                        levelRequired: 1,
                        cooldownMinutes: 0,
                        maxPerDay: 5,
                      })
                    }
                    className="px-3 py-1.5 bg-amber-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> নতুন টাস্ক যোগ করুন
                  </button>
                </div>

                {/* Tasks Table */}
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white dark:bg-[#1E1E1E] p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-gray-100">{task.title}</h4>
                        <p className="text-[10px] text-gray-500">
                          রিওয়ার্ড: ৳{task.reward} • সময়: {task.duration}s • লেভেল: {task.levelRequired} • টাইপ: {task.type}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="p-1.5 bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 rounded-lg font-bold"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('টাস্কটি মুছে ফেলতে নিশ্চিত?')) {
                              await onDeleteTask(task.id);
                            }
                          }}
                          className="p-1.5 bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 rounded-lg font-bold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. USERS TAB */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-base text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-500" />
                  ইউজার ম্যানেজমেন্ট ({users.length})
                </h3>

                <div className="space-y-2">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="bg-white dark:bg-[#1E1E1E] p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                          {u.name} <span className="text-[10px] text-gray-400">({u.id})</span>
                          {u.isBanned && (
                            <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.2 rounded font-bold">
                              BANNED
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] text-gray-500">
                          ব্যালেন্স: ৳{u.balance.toFixed(2)} • সঞ্চয়: ৳{(u.savingsBalance || 0).toFixed(2)} • লেভেল: {u.level} • XP: {u.xp} • প্ল্যান: {u.plan}
                        </p>
                      </div>

                      <button
                        onClick={() => setEditingUser(u)}
                        className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-xl shadow-sm"
                      >
                        এডিট ইউজার
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. WITHDRAWALS TAB */}
            {activeTab === 'withdrawals' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-base text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-amber-500" />
                  উইথড্র রিকোয়েস্টসমূহ ({withdrawals.length})
                </h3>

                <div className="space-y-2">
                  {withdrawals.map((w) => (
                    <div
                      key={w.id}
                      className="bg-white dark:bg-[#1E1E1E] p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-gray-100">
                          {w.userName} ({w.method})
                        </h4>
                        <p className="text-[10px] text-gray-500">
                          নম্বর: {w.accountNumber} • পরিমাণ: ৳{w.amountBDT} (USDT: ${w.amountUSDT.toFixed(2)})
                        </p>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            w.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : w.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {w.status.toUpperCase()}
                        </span>
                      </div>

                      {w.status === 'pending' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onProcessWithdrawal(w.id, 'approved', 'Approved by Admin')}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded-xl font-bold text-xs"
                          >
                            অনুমোদন
                          </button>
                          <button
                            onClick={() => onProcessWithdrawal(w.id, 'rejected', 'Rejected by Admin')}
                            className="px-2.5 py-1 bg-red-600 text-white rounded-xl font-bold text-xs"
                          >
                            বাতিল
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. TRANSACTIONS TAB */}
            {activeTab === 'transactions' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-base text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  প্ল্যান সাবস্ক্রিপশন ট্রানজেকশন ({transactions.length})
                </h3>

                <div className="space-y-2">
                  {transactions.map((trx) => (
                    <div
                      key={trx.id}
                      className="bg-white dark:bg-[#1E1E1E] p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-gray-100">
                          {trx.userName} • {trx.planName} (৳{trx.amount})
                        </h4>
                        <p className="text-[10px] text-gray-500 font-mono">
                          TrxID: {trx.trxId} • প্রেরক: {trx.senderNumber}
                        </p>
                      </div>

                      {trx.status === 'pending' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onProcessTransaction(trx.id, 'approved')}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded-xl font-bold text-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onProcessTransaction(trx.id, 'rejected')}
                            className="px-2.5 py-1 bg-red-600 text-white rounded-xl font-bold text-xs"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. CONFIG TAB */}
            {activeTab === 'config' && (
              <form onSubmit={handleSaveConfigSubmit} className="space-y-4 bg-white dark:bg-[#1E1E1E] p-4 rounded-3xl border border-amber-200/70 dark:border-amber-900/40 shadow-sm text-xs">
                <h3 className="font-extrabold text-base text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-amber-500" />
                  গ্লোবাল অ্যাপ কনফিগারেশন
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold block">রেফার কমিশন L1 (%)</label>
                    <input
                      type="number"
                      value={configForm.appSettings.referCommission}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          appSettings: { ...configForm.appSettings, referCommission: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-gray-50 dark:bg-gray-800 border p-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold block">রেফার কমিশন L2 (%)</label>
                    <input
                      type="number"
                      value={configForm.appSettings.referCommissionLevel2}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          appSettings: { ...configForm.appSettings, referCommissionLevel2: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-gray-50 dark:bg-gray-800 border p-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold block">রেফার কমিশন L3 (%)</label>
                    <input
                      type="number"
                      value={configForm.appSettings.referCommissionLevel3}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          appSettings: { ...configForm.appSettings, referCommissionLevel3: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-gray-50 dark:bg-gray-800 border p-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold block">১ USDT = BDT রেট</label>
                    <input
                      type="number"
                      value={configForm.appSettings.usdtRate}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          appSettings: { ...configForm.appSettings, usdtRate: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-gray-50 dark:bg-gray-800 border p-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold block">বিকাশ সেন্ড মানি নম্বর</label>
                    <input
                      type="text"
                      value={configForm.bKashNumber}
                      onChange={(e) => setConfigForm({ ...configForm, bKashNumber: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border p-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold block">ভিডিও অ্যাড রিওয়ার্ড (BDT)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={configForm.appSettings.videoAdReward}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          appSettings: { ...configForm.appSettings, videoAdReward: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-gray-50 dark:bg-gray-800 border p-2 rounded-xl"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 text-white font-extrabold rounded-2xl shadow-md"
                >
                  কনফিগারেশন সেভ করুন
                </button>
              </form>
            )}

            {/* 7. FIREBASE CONFIG TAB */}
            {activeTab === 'firebase' && (
              <div className="space-y-4 bg-white dark:bg-[#1E1E1E] p-4 rounded-3xl border border-amber-200/70 dark:border-amber-900/40 shadow-sm text-xs">
                <h3 className="font-extrabold text-base text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <Database className="w-5 h-5 text-amber-500" />
                  ফায়ারবেস কনফিগারেশন পরিবর্তন (Protected)
                </h3>

                {!fbPassUnlocked ? (
                  <div className="space-y-2">
                    <p className="text-gray-500">ফায়ারবেস পরিবর্তন করতে পাসওয়ার্ড দিন (Mango62443):</p>
                    <input
                      type="password"
                      value={fbPass}
                      onChange={(e) => setFbPass(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-800 border p-2.5 rounded-xl"
                    />
                    <button
                      onClick={() => {
                        if (fbPass === 'Mango62443') setFbPassUnlocked(true);
                        else alert('ভুল পাসওয়ার্ড!');
                      }}
                      className="px-4 py-2 bg-amber-500 text-white font-bold rounded-xl"
                    >
                      আনলক করুন
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-gray-500">
                      নতুন Firebase JSON Config পেস্ট করুন:
                    </p>
                    <textarea
                      rows={8}
                      value={customFbConfigJson}
                      onChange={(e) => setCustomFbConfigJson(e.target.value)}
                      placeholder='{"apiKey": "...", "projectId": "..."}'
                      className="w-full bg-gray-900 text-emerald-400 font-mono p-3 rounded-2xl text-xs outline-none"
                    />
                    <button
                      onClick={() => {
                        try {
                          const parsed = JSON.parse(customFbConfigJson);
                          resetFirebaseApp(parsed);
                        } catch (e) {
                          alert('ভুল JSON ফরম্যাট!');
                        }
                      }}
                      className="px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl"
                    >
                      সেভ ও রিলোড করুন
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Task Edit Form Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 text-xs text-left">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await onSaveTask(editingTask);
              setEditingTask(null);
            }}
            className="bg-white dark:bg-[#1E1E1E] p-6 rounded-3xl max-w-sm w-full space-y-3 border border-amber-400 shadow-2xl"
          >
            <h3 className="font-extrabold text-sm text-gray-800 dark:text-gray-100">টাস্ক এডিশন / সংশোধন</h3>
            
            <input
              type="text"
              required
              placeholder="টাস্ক টাইটেল"
              value={editingTask.title || ''}
              onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-800 border p-2.5 rounded-xl outline-none"
            />
            <input
              type="text"
              placeholder="বিস্তারিত বিবরণ"
              value={editingTask.description || ''}
              onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-800 border p-2.5 rounded-xl outline-none"
            />
            <input
              type="text"
              placeholder="টাস্ক লিংক (ইউআরএল)"
              value={editingTask.link || ''}
              onChange={(e) => setEditingTask({ ...editingTask, link: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-800 border p-2.5 rounded-xl outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold">রিওয়ার্ড (BDT):</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={editingTask.reward || 0}
                  onChange={(e) => setEditingTask({ ...editingTask, reward: Number(e.target.value) })}
                  className="w-full bg-gray-50 dark:bg-gray-800 border p-2 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="font-bold">টাইমার (সেকেন্ড):</label>
                <input
                  type="number"
                  required
                  value={editingTask.duration || 15}
                  onChange={(e) => setEditingTask({ ...editingTask, duration: Number(e.target.value) })}
                  className="w-full bg-gray-50 dark:bg-gray-800 border p-2 rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-500 text-white font-bold rounded-xl"
              >
                সেভ করুন
              </button>
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="px-4 py-2.5 bg-gray-200 dark:bg-gray-800 font-bold rounded-xl"
              >
                বাতিল
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 text-xs text-left">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await onUpdateUser(editingUser.id, editingUser);
              setEditingUser(null);
            }}
            className="bg-white dark:bg-[#1E1E1E] p-6 rounded-3xl max-w-sm w-full space-y-3 border border-amber-400 shadow-2xl"
          >
            <h3 className="font-extrabold text-sm text-gray-800 dark:text-gray-100">ইউজার তথ্য সংশোধন ({editingUser.name})</h3>

            <div>
              <label className="font-bold">ব্যালেন্স (BDT):</label>
              <input
                type="number"
                step="0.01"
                value={editingUser.balance}
                onChange={(e) => setEditingUser({ ...editingUser, balance: Number(e.target.value) })}
                className="w-full bg-gray-50 dark:bg-gray-800 border p-2.5 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="font-bold">সঞ্চয় ব্যালেন্স (BDT):</label>
              <input
                type="number"
                step="0.01"
                value={editingUser.savingsBalance || 0}
                onChange={(e) => setEditingUser({ ...editingUser, savingsBalance: Number(e.target.value) })}
                className="w-full bg-gray-50 dark:bg-gray-800 border p-2.5 rounded-xl outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold">লেভেল:</label>
                <input
                  type="number"
                  value={editingUser.level}
                  onChange={(e) => setEditingUser({ ...editingUser, level: Number(e.target.value) })}
                  className="w-full bg-gray-50 dark:bg-gray-800 border p-2 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="font-bold">XP:</label>
                <input
                  type="number"
                  value={editingUser.xp}
                  onChange={(e) => setEditingUser({ ...editingUser, xp: Number(e.target.value) })}
                  className="w-full bg-gray-50 dark:bg-gray-800 border p-2 rounded-xl outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold">ব্যান স্টেটাস:</label>
              <select
                value={editingUser.isBanned ? 'true' : 'false'}
                onChange={(e) => setEditingUser({ ...editingUser, isBanned: e.target.value === 'true' })}
                className="w-full bg-gray-50 dark:bg-gray-800 border p-2.5 rounded-xl outline-none"
              >
                <option value="false">Active (স্বাভাবিক)</option>
                <option value="true">Banned (ব্যানড)</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-500 text-white font-bold rounded-xl"
              >
                সেভ করুন
              </button>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2.5 bg-gray-200 dark:bg-gray-800 font-bold rounded-xl"
              >
                বাতিল
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
