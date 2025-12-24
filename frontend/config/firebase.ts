// Firebase Configuration from environment variables
// Add your Firebase credentials to .env.local file

export const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// How to set up:
// 1. Go to https://console.firebase.google.com/
// 2. Select your project > Project Settings > General
// 3. Scroll to "Your apps" and copy the config values
// 4. Add them to frontend/.env.local file with VITE_ prefix

