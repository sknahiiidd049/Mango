import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import defaultConfig from '../firebase-applet-config.json';

// Get current active config (either customized by admin in localStorage or default)
export function getFirebaseConfig() {
  try {
    const saved = localStorage.getItem('mango_firebase_custom_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading custom firebase config:', e);
  }
  return defaultConfig;
}

const activeConfig = getFirebaseConfig();

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(activeConfig);
} else {
  app = getApp();
}

// Initialize Firestore with specific database ID if provided
const databaseId = activeConfig.firestoreDatabaseId || 'ai-studio-ffd8487b-256e-45c2-886d-cf95ea0da73f';
export const db: Firestore = getFirestore(app, databaseId);

export function resetFirebaseApp(newConfig: typeof defaultConfig) {
  try {
    localStorage.setItem('mango_firebase_custom_config', JSON.stringify(newConfig));
    window.location.reload();
  } catch (e) {
    console.error('Error saving new firebase config:', e);
  }
}
