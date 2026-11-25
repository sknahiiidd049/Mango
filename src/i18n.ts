import { Language } from './types';

export const dictionary: Record<Language, Record<string, string>> = {
  bn: {
    // Branding & Header
    app_title: 'Mango 🥭',
    app_subtitle: 'মাস্টারপিস আর্নিং টেলিগ্রাম মিনি অ্যাপ',
    balance: 'ব্যালেন্স',
    savings: 'সঞ্চয়',
    level: 'লেভেল',
    xp: 'XP',
    admin_mode: 'অ্যাডমিন মোড',

    // Nav Tabs
    tab_home: 'হোম',
    tab_tasks: 'টাস্ক',
    tab_spin: 'স্পিন',
    tab_referral: 'রেফারেল',
    tab_withdraw: 'উইথড্র',
    tab_leaderboard: 'লিডারবোর্ড',
    tab_plans: 'প্ল্যান',
    tab_settings: 'সেটিংস',
    tab_profile: 'প্রোফাইল',

    // Home Screen
    welcome_user: 'স্বাগতম, {{name}}! 🥭',
    daily_bonus_title: 'ডেইলি বোনাস স্ট্রীক 🎁',
    daily_bonus_desc: 'প্রতিদিন লগইন করুন এবং ক্রমান্বয়ে বেশি বোনাস ক্লেইম করুন!',
    claim_daily_bonus: 'বোনাস ক্লেইম করুন (৳{{amount}})',
    claimed_today: 'আজকের বোনাস ক্লেইম করা হয়েছে!',
    streak_days: '{{count}} দিনের স্ট্রীক!',
    quick_stats: 'এক নজরে আপনার হিসাব',
    total_earned: 'সর্বমোট আয়',
    tasks_done: 'সম্পন্ন টাস্ক',
    active_plan: 'অ্যাক্টিভ প্ল্যান',
    savings_wallet: 'সঞ্চয় ওয়ালেট',
    transfer_to_savings: 'সঞ্চয়ে জমা করুন',
    quick_tasks: 'কুইক টাস্কসমূহ',

    // Tasks Screen
    cat_general: 'সাধারণ টাস্ক',
    cat_missions: 'ডেইলি মিশন',
    cat_video_ads: 'ভিডিও অ্যাডস',
    start_task: 'শুরু করুন',
    claim_reward: 'রিওয়ার্ড নিন',
    level_required: 'লেভেল {{level}} প্রয়োজন',
    cooldown_wait: 'অপেক্ষা করুন: {{mins}} মি.',
    daily_limit_reached: 'আজকের দৈনিক সীমা শেষ',
    task_timer_running: 'টাইমার চলছে...',
    anticheat_warning: '⚠️ অন্য ট্যাবে গেলে টাইমার পজ হবে!',
    task_completed_msg: 'অভিনন্দন! আপনি ৳{{reward}} এবং {{xp}} XP পেয়েছিন!',
    video_ad_btn: 'ভিডিও অ্যাড দেখুন 🎬',
    video_ad_desc: 'ভিডিও অ্যাড দেখে দৈনিক আয় ও XP বৃদ্ধি করুন!',

    // Spin Wheel
    spin_title: 'ভাগ্য পরীক্ষা স্পিন হুইল 🎡',
    spin_btn: 'স্পিন করুন!',
    free_spins_left: 'আজ ফ্রি স্পিন বাকি: {{count}} টি',
    spin_cost: 'স্পিন কস্ট: ৳{{cost}}',
    no_spins_left: 'আজকের স্পিন লিমিট শেষ!',
    spin_won: 'অভিনন্দন! আপনি জিতেছেন ৳{{amount}}! 🎉',

    // Referral
    ref_title: 'মাল্টি-টায়ার রেফারেল প্রোগ্রাম 👥',
    ref_desc: 'বন্ধুদের ইনভাইট করুন এবং ৩ লেভেল পর্যন্ত আনলিমিটেড কমিশন পান!',
    ref_link_label: 'আপনার রেফারেল লিংক:',
    copy_link: 'লিংক কপি করুন 📋',
    link_copied: 'রেফারেল লিংক কপি করা হয়েছে!',
    tier_level_1: 'লেভেল ১ (ডাইরেক্ট): {{count}} জন',
    tier_level_2: 'লেভেল ২ (সেকেন্ডারি): {{count}} জন',
    tier_level_3: 'লেভেল ৩ (টারশিয়ারি): {{count}} জন',
    commission_earned: 'মোট রেফারেল ইনকাম:',

    // Withdraw & Savings
    withdraw_title: 'টাকা উত্তোলন (Withdraw) 💰',
    min_withdraw: 'মিনিমাম উইথড্র: ৳{{min}}',
    select_method: 'পেমেন্ট মেথড সিলেক্ট করুন:',
    enter_account: 'মোবাইল নাম্বার / ওয়ালেট আইডি:',
    enter_amount: 'উইথড্র পরিমাণ (BDT):',
    usdt_equivalent: 'USDT সমপরিমাণ: ~${{usdt}}',
    submit_withdraw: 'উইথড্র রিকোয়েস্ট পাঠান',
    withdraw_history: 'উইথড্র হিস্ট্রি',
    savings_transfer_title: 'সঞ্চয় ওয়ালেট ট্রান্সফার 🏦',
    savings_desc: 'মূল ব্যালেন্স থেকে সঞ্চয়ে অথবা সঞ্চয় থেকে মূল ব্যালেন্সে টাকা সরান।',
    move_to_savings: 'মূল -> সঞ্চয়',
    move_to_main: 'সঞ্চয় -> মূল',

    // Plans
    plans_title: 'প্রিমিয়াম সাবস্ক্রিপশন প্ল্যান ⭐',
    plans_desc: 'প্ল্যান আপগ্রেড করুন এবং সব টাস্কে বাড়তি আর্নিং ও স্পিন সুবিধা উপভোগ করুন!',
    plan_benefits: 'সুবিধাসমূহ:',
    buy_plan: 'প্ল্যান কিনুন (৳{{price}})',
    plan_expiry: 'মেয়াদ শেষ: {{date}}',
    plan_payment_instruction: 'বিকাশ সেন্ড মানি করুন এই নম্বরে:',
    trx_id_placeholder: 'ট্রানজেকশন আইডি (TrxID) লিখুন',
    sender_num_placeholder: 'প্রেরক বিকাশ নম্বর',
    submit_payment: 'পেমেন্ট সাবমিট করুন',

    // Leaderboard
    leaderboard_title: 'সেরা আর্নারদের লিডারবোর্ড 🏆',
    rank: 'র‍্যাংক',
    user: 'ইউজার',
    total_earnings: 'মোট আয়',

    // Profile & Badges
    profile_title: 'ইউজার প্রোফাইল ও ব্যাজ 🏅',
    badges_title: 'আপনার অর্জিত ব্যাজসমূহ',
    no_badges: 'এখনও কোনো ব্যাজ অর্জন করেননি। টাস্ক পূরণ করে আনলক করুন!',
    activity_log: 'ইউজার অ্যাক্টিভিটি লগ',

    // Settings
    settings_title: 'অ্যাপ সেটিংস ⚙️',
    language_select: 'ভাষা পরিবর্তন (Language)',
    theme_select: 'থিম পরিবর্তন (Theme)',
    dark_mode: 'ডার্ক মোড',
    light_mode: 'লাইট মোড',
    admin_login_btn: '🔒 অ্যাডমিন প্যানেল প্রবেশ',

    // Notifications
    notifications_title: 'ঘোষণা ও নোটিফিকেশন 📢',
    no_notifications: 'কোন নতুন নোটিফিকেশন নেই।',

    // Admin Panel
    admin_title: 'অ্যাডমিন কন্ট্রোল প্যানেল 🛡️',
    admin_dashboard: 'ড্যাশবোর্ড ওভারভিউ',
    admin_task_mgmt: 'টাস্ক ম্যানেজমেন্ট',
    admin_user_mgmt: 'ইউজার ম্যানেজমেন্ট',
    admin_withdraw_mgmt: 'উইথড্র রিকোয়েস্ট',
    admin_plan_mgmt: 'প্ল্যান পেমেন্ট',
    admin_app_config: 'কনফিগারেশন',
    admin_ad_networks: 'অ্যাড নেটওয়ার্ক',
    admin_firebase: 'ফায়ারবেস কনফিগ',
    admin_analytics: 'রিপোর্ট ও অ্যানালিটিক্স',
    admin_banned: 'ব্যানড ইউজারস',
    approve: 'অনুমোদন',
    reject: 'বাতিল',
    save_changes: 'সেভ করুন',
  },
  en: {
    app_title: 'Mango 🥭',
    app_subtitle: 'Masterpiece Earning Telegram Mini App',
    balance: 'Balance',
    savings: 'Savings',
    level: 'Level',
    xp: 'XP',
    admin_mode: 'Admin Mode',

    tab_home: 'Home',
    tab_tasks: 'Tasks',
    tab_spin: 'Spin',
    tab_referral: 'Referral',
    tab_withdraw: 'Withdraw',
    tab_leaderboard: 'Leaderboard',
    tab_plans: 'Plans',
    tab_settings: 'Settings',
    tab_profile: 'Profile',

    welcome_user: 'Welcome, {{name}}! 🥭',
    daily_bonus_title: 'Daily Bonus Streak 🎁',
    daily_bonus_desc: 'Log in daily to claim escalating streak bonuses!',
    claim_daily_bonus: 'Claim Bonus (৳{{amount}})',
    claimed_today: 'Bonus Claimed Today!',
    streak_days: '{{count}} Day Streak!',
    quick_stats: 'Quick Summary',
    total_earned: 'Total Earned',
    tasks_done: 'Tasks Completed',
    active_plan: 'Active Plan',
    savings_wallet: 'Savings Wallet',
    transfer_to_savings: 'Deposit to Savings',
    quick_tasks: 'Quick Tasks',

    cat_general: 'General Tasks',
    cat_missions: 'Daily Missions',
    cat_video_ads: 'Video Ads',
    start_task: 'Start',
    claim_reward: 'Claim Reward',
    level_required: 'Level {{level}} Required',
    cooldown_wait: 'Wait: {{mins}}m',
    daily_limit_reached: 'Daily Limit Reached',
    task_timer_running: 'Timer running...',
    anticheat_warning: '⚠️ Leaving this tab will pause the timer!',
    task_completed_msg: 'Congrats! You earned ৳{{reward}} and {{xp}} XP!',
    video_ad_btn: 'Watch Video Ad 🎬',
    video_ad_desc: 'Watch short video ads to earn bonus money & XP!',

    spin_title: 'Lucky Spin Wheel 🎡',
    spin_btn: 'Spin Now!',
    free_spins_left: 'Free Spins Remaining: {{count}}',
    spin_cost: 'Spin Cost: ৳{{cost}}',
    no_spins_left: 'Daily spin limit reached!',
    spin_won: 'Congratulations! You won ৳{{amount}}! 🎉',

    ref_title: 'Multi-Tier Referral Program 👥',
    ref_desc: 'Invite friends and earn unlimited commission up to 3 tiers!',
    ref_link_label: 'Your Referral Link:',
    copy_link: 'Copy Link 📋',
    link_copied: 'Referral link copied!',
    tier_level_1: 'Level 1 (Direct): {{count}} users',
    tier_level_2: 'Level 2 (Secondary): {{count}} users',
    tier_level_3: 'Level 3 (Tertiary): {{count}} users',
    commission_earned: 'Total Referral Earnings:',

    withdraw_title: 'Withdraw Funds 💰',
    min_withdraw: 'Minimum Withdraw: ৳{{min}}',
    select_method: 'Select Payment Method:',
    enter_account: 'Mobile Number / Wallet ID:',
    enter_amount: 'Withdraw Amount (BDT):',
    usdt_equivalent: 'USDT Equivalent: ~${{usdt}}',
    submit_withdraw: 'Submit Withdrawal Request',
    withdraw_history: 'Withdrawal History',
    savings_transfer_title: 'Savings Wallet Transfer 🏦',
    savings_desc: 'Transfer money between main balance and savings wallet.',
    move_to_savings: 'Main -> Savings',
    move_to_main: 'Savings -> Main',

    plans_title: 'Premium Subscription Plans ⭐',
    plans_desc: 'Upgrade your plan to unlock higher multipliers & daily free spins!',
    plan_benefits: 'Benefits:',
    buy_plan: 'Buy Plan (৳{{price}})',
    plan_expiry: 'Expires: {{date}}',
    plan_payment_instruction: 'Send bKash money to:',
    trx_id_placeholder: 'Enter Transaction ID (TrxID)',
    sender_num_placeholder: 'Sender bKash Number',
    submit_payment: 'Submit Payment',

    leaderboard_title: 'Top Earners Leaderboard 🏆',
    rank: 'Rank',
    user: 'User',
    total_earnings: 'Total Earnings',

    profile_title: 'User Profile & Badges 🏅',
    badges_title: 'Your Earned Badges',
    no_badges: 'No badges earned yet. Complete tasks to unlock!',
    activity_log: 'Activity Logs',

    settings_title: 'App Settings ⚙️',
    language_select: 'Language',
    theme_select: 'Theme',
    dark_mode: 'Dark Mode',
    light_mode: 'Light Mode',
    admin_login_btn: '🔒 Admin Panel Access',

    notifications_title: 'Announcements & Alerts 📢',
    no_notifications: 'No new notifications.',

    admin_title: 'Admin Control Panel 🛡️',
    admin_dashboard: 'Dashboard Overview',
    admin_task_mgmt: 'Task Management',
    admin_user_mgmt: 'User Management',
    admin_withdraw_mgmt: 'Withdrawal Requests',
    admin_plan_mgmt: 'Plan Payments',
    admin_app_config: 'Configuration',
    admin_ad_networks: 'Ad Networks',
    admin_firebase: 'Firebase Config',
    admin_analytics: 'Reports & Analytics',
    admin_banned: 'Banned Users',
    approve: 'Approve',
    reject: 'Reject',
    save_changes: 'Save Changes',
  },
};

export function t(key: string, lang: Language = 'bn', params?: Record<string, string | number>): string {
  const dict = dictionary[lang] || dictionary['bn'];
  let val = dict[key] || dictionary['bn'][key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      val = val.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
    });
  }
  return val;
}
