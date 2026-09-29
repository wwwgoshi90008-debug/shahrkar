import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const marketplaceConfig = {
  apiKey: process.env.NEXT_PUBLIC_MARKETPLACE_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_MARKETPLACE_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_MARKETPLACE_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_MARKETPLACE_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId:
    process.env.NEXT_PUBLIC_MARKETPLACE_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_MARKETPLACE_FIREBASE_APP_ID!,
};

const marketplaceApp =
  getApps().some((app) => app.name === "marketplace")
    ? getApp("marketplace")
    : initializeApp(marketplaceConfig, "marketplace");

export const marketplaceAuth = getAuth(marketplaceApp);
export const marketplaceDb = getFirestore(marketplaceApp);

export default marketplaceApp;
