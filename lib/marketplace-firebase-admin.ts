import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";


const serviceAccount = JSON.parse(
  Buffer.from(
    process.env.MARKETPLACE_FIREBASE_ADMIN_KEY_B64!,
    "base64"
  ).toString("utf8")
);

export const marketplaceAdminApp =
  getApps().find((app) => app.name === "marketplace-admin")
    ? getApps().find((app) => app.name === "marketplace-admin")!
    : initializeApp(
        {
          credential: cert(serviceAccount),
          projectId: serviceAccount.project_id,
        },
        "marketplace-admin"
      );

export const marketplaceAdminAuth = getAuth(marketplaceAdminApp);
export const marketplaceAdminDb = getFirestore(marketplaceAdminApp);
