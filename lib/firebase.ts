import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

type FirebaseBundle = {
  app: ReturnType<typeof initializeApp>;
  auth: ReturnType<typeof getAuth>;
  db: ReturnType<typeof getFirestore>;
  storage: ReturnType<typeof getStorage>;
};

function getConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

function configOk(config: ReturnType<typeof getConfig>) {
  return Object.values(config).every((v) => typeof v === "string" && v.trim().length > 0);
}

let cached: FirebaseBundle | null = null;

export function getFirebase(): FirebaseBundle | null {
  const config = getConfig();
  if (!configOk(config)) return null;

  if (cached) return cached;
  if (!getApps().length) {
    const app = initializeApp(config);
    cached = {
      app,
      auth: getAuth(app),
      db: getFirestore(app),
      storage: getStorage(app),
    };
  } else {
    const app = getApps()[0]!;
    cached = {
      app,
      auth: getAuth(app),
      db: getFirestore(app),
      storage: getStorage(app),
    };
  }

  return cached;
}

