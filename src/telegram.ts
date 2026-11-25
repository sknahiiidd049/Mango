// Telegram WebApp API Helper

declare global {
  interface Window {
    Telegram?: any;
  }
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export function setupTelegramPolyfills() {
  if (typeof window === 'undefined') return;

  if (!window.Telegram) {
    window.Telegram = {};
  }
  if (!window.Telegram.WebApp) {
    window.Telegram.WebApp = {};
  }

  const tg = window.Telegram.WebApp;

  // Override version check safely
  try {
    tg.version = '9.9';
  } catch (e) {}
  try {
    tg.isVersionAtLeast = () => true;
  } catch (e) {}

  const localStorageCloudStorage: Record<string, any> = {
    setItem: (key: string, value: string, callback?: (err: any, success?: boolean) => void) => {
      try {
        localStorage.setItem('tg_cs_' + key, value);
        if (typeof callback === 'function') callback(null, true);
      } catch (err) {
        if (typeof callback === 'function') callback(err, false);
      }
    },
    getItem: (key: string, callback?: (err: any, value?: string | null) => void) => {
      try {
        const val = localStorage.getItem('tg_cs_' + key);
        if (typeof callback === 'function') callback(null, val);
      } catch (err) {
        if (typeof callback === 'function') callback(err, null);
      }
    },
    getItems: (keys: string[], callback?: (err: any, values?: Record<string, string | null>) => void) => {
      try {
        const res: Record<string, string | null> = {};
        if (Array.isArray(keys)) {
          keys.forEach((k) => {
            res[k] = localStorage.getItem('tg_cs_' + k);
          });
        }
        if (typeof callback === 'function') callback(null, res);
      } catch (err) {
        if (typeof callback === 'function') callback(err, {});
      }
    },
    removeItem: (key: string, callback?: (err: any, success?: boolean) => void) => {
      try {
        localStorage.removeItem('tg_cs_' + key);
        if (typeof callback === 'function') callback(null, true);
      } catch (err) {
        if (typeof callback === 'function') callback(err, false);
      }
    },
    removeItems: (keys: string[], callback?: (err: any, success?: boolean) => void) => {
      try {
        if (Array.isArray(keys)) {
          keys.forEach((k) => localStorage.removeItem('tg_cs_' + k));
        }
        if (typeof callback === 'function') callback(null, true);
      } catch (err) {
        if (typeof callback === 'function') callback(err, false);
      }
    },
    getKeys: (callback?: (err: any, keys?: string[]) => void) => {
      try {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('tg_cs_')) {
            keys.push(k.substring(6));
          }
        }
        if (typeof callback === 'function') callback(null, keys);
      } catch (err) {
        if (typeof callback === 'function') callback(err, []);
      }
    }
  };

  if (tg.CloudStorage && typeof tg.CloudStorage === 'object') {
    for (const m in localStorageCloudStorage) {
      try {
        tg.CloudStorage[m] = localStorageCloudStorage[m];
      } catch (e) {
        try {
          Object.defineProperty(tg.CloudStorage, m, {
            value: localStorageCloudStorage[m],
            writable: true,
            configurable: true,
            enumerable: true
          });
        } catch (e2) {}
      }
    }
  } else {
    try {
      tg.CloudStorage = localStorageCloudStorage;
    } catch (e) {
      try {
        Object.defineProperty(tg, 'CloudStorage', {
          get: () => localStorageCloudStorage,
          configurable: true,
          enumerable: true
        });
      } catch (e2) {}
    }
  }
}

// Run immediately upon import
setupTelegramPolyfills();

export function getTelegramWebApp() {
  setupTelegramPolyfills();
  if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
}

export function initTelegramApp() {
  setupTelegramPolyfills();
  const tg = getTelegramWebApp();
  if (tg) {
    try {
      if (typeof tg.ready === 'function') tg.ready();
      if (typeof tg.expand === 'function') tg.expand();
    } catch (e) {
      console.error('Error initializing Telegram WebApp:', e);
    }
  }
}

export function getTelegramUser(): TelegramUser {
  const tg = getTelegramWebApp();
  if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    return tg.initDataUnsafe.user;
  }

  // Fallback for non-telegram browser testing
  let savedDemoUser = localStorage.getItem('mango_demo_user');
  if (savedDemoUser) {
    try {
      return JSON.parse(savedDemoUser);
    } catch (e) {
      // ignore
    }
  }

  const demoUser: TelegramUser = {
    id: 987654321,
    first_name: 'আম ব্যবহারকারী',
    username: 'mangouser',
  };
  localStorage.setItem('mango_demo_user', JSON.stringify(demoUser));
  return demoUser;
}

export function setDemoUser(id: number, name: string, username?: string) {
  const demoUser: TelegramUser = { id, first_name: name, username };
  localStorage.setItem('mango_demo_user', JSON.stringify(demoUser));
  window.location.reload();
}

export function getStartParam(): string | null {
  const tg = getTelegramWebApp();
  if (tg && tg.initDataUnsafe && tg.initDataUnsafe.start_param) {
    return tg.initDataUnsafe.start_param;
  }
  // Also check URL query params e.g. ?start=ref_12345
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('start') || urlParams.get('ref') || null;
}

export function triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') {
  const tg = getTelegramWebApp();
  if (tg && tg.HapticFeedback) {
    try {
      if (['success', 'warning', 'error'].includes(type)) {
        tg.HapticFeedback.notificationOccurred(type as 'success' | 'warning' | 'error');
      } else {
        tg.HapticFeedback.impactOccurred(type as 'light' | 'medium' | 'heavy');
      }
    } catch (e) {
      // ignore
    }
  }
}
