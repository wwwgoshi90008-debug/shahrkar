import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { marketplaceAdminDb } from "@/lib/marketplace-firebase-admin";
import {
  verifyMarketplaceSessionValue,
  COOKIE_NAME,
} from "@/lib/auth/marketplace-session";

const PLANS = {
  free: {
    id: "free",
    title: "رایگان",
    capacity: 3,
    durationDays: 5,
    price: 0,
  },
  base: {
    id: "base",
    title: "پایه",
    capacity: 7,
    durationDays: 20,
    price: 299000,
  },
  professional: {
    id: "professional",
    title: "حرفه‌ای",
    capacity: 10,
    durationDays: 20,
    price: 499000,
  },
  special: {
    id: "special",
    title: "ویژه",
    capacity: 30,
    durationDays: 30,
    price: 699000,
  },
} as const;

type PlanId = keyof typeof PLANS;

function getSessionUid(req: Request) {
  const session = req.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`))
    ?.split("=")
    .slice(1)
    .join("=");

  if (!session) return null;

  return verifyMarketplaceSessionValue(session)?.uid ?? null;
}

function toDate(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function getPlan(planId: unknown) {
  if (typeof planId !== "string") {
    return PLANS.free;
  }

  return PLANS[planId as PlanId] ?? PLANS.free;
}


export async function POST(req: Request) {
  try {
    const uid = getSessionUid(req);

    if (!uid) {
      return NextResponse.json(
        {
          success: false,
          error: "احراز هویت بازارچه انجام نشده است.",
        },
        { status: 401 }
      );
    }

    const userSnap = await marketplaceAdminDb
      .collection("marketplaceUsers")
      .doc(uid)
      .get();

    if (!userSnap.exists) {
      return NextResponse.json(
        {
          success: false,
          error: "کاربر بازارچه پیدا نشد.",
        },
        { status: 404 }
      );
    }

    const userData = userSnap.data();

    if (userData?.marketplaceRole !== "seller") {
      return NextResponse.json(
        {
          success: false,
          error: "این حساب فروشنده بازارچه نیست.",
        },
        { status: 403 }
      );
    }

    const subscriptionRef = marketplaceAdminDb
      .collection("marketplaceSubscriptions")
      .doc(uid);

    const existingSnap = await subscriptionRef.get();

    if (existingSnap.exists) {
      const existing = existingSnap.data();
      const existingPlanId = existing?.planId;

      const existingExpiresAt =
        toDate(existing?.expiresAt) ?? toDate(existing?.endDate);

      const existingActive =
        typeof existingPlanId === "string" &&
        existingPlanId in PLANS &&
        existingExpiresAt !== null &&
        new Date().getTime() < existingExpiresAt.getTime();

      if (existingActive) {
        return NextResponse.json(
          {
            success: false,
            error: "شما در حال حاضر یک اشتراک فعال دارید.",
          },
          { status: 409 }
        );
      }
    }

    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + PLANS.free.durationDays * 24 * 60 * 60 * 1000
    );

    await subscriptionRef.set({
      planId: PLANS.free.id,
      title: PLANS.free.title,
      capacity: PLANS.free.capacity,
      durationDays: PLANS.free.durationDays,
      price: PLANS.free.price,
      startedAt: Timestamp.fromDate(now),
      expiresAt: Timestamp.fromDate(expiresAt),
      status: "active",
      updatedAt: Timestamp.fromDate(now),
    });

    return NextResponse.json({
      success: true,
      message: "پلن رایگان با موفقیت فعال شد.",
      subscription: {
        planId: PLANS.free.id,
        title: PLANS.free.title,
        capacity: PLANS.free.capacity,
        durationDays: PLANS.free.durationDays,
        price: PLANS.free.price,
        startedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        expired: false,
        status: "active",
      },
    });
  } catch (error: unknown) {
    console.error(
      "MARKETPLACE SUBSCRIPTION FREE POST ERROR:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      {
        success: false,
        error: "خطا در فعال‌سازی پلن رایگان بازارچه.",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const uid = getSessionUid(req);

    if (!uid) {
      return NextResponse.json(
        {
          success: false,
          error: "احراز هویت بازارچه انجام نشده است.",
        },
        { status: 401 }
      );
    }

    const userSnap = await marketplaceAdminDb
      .collection("marketplaceUsers")
      .doc(uid)
      .get();

    if (!userSnap.exists) {
      return NextResponse.json(
        {
          success: false,
          error: "کاربر بازارچه پیدا نشد.",
        },
        { status: 404 }
      );
    }

    const userData = userSnap.data();

    if (userData?.marketplaceRole !== "seller") {
      return NextResponse.json(
        {
          success: false,
          error: "این حساب فروشنده بازارچه نیست.",
        },
        { status: 403 }
      );
    }

    const subscriptionSnap = await marketplaceAdminDb
      .collection("marketplaceSubscriptions")
      .doc(uid)
      .get();

    const subscriptionData = subscriptionSnap.exists
      ? subscriptionSnap.data()
      : null;

      let planId: PlanId | null = null;
      let startedAt: Date | null = null;
      let expiresAt: Date | null = null;

      if (subscriptionData) {
        const candidatePlan = subscriptionData.planId;

        if (
          typeof candidatePlan === "string" &&
          candidatePlan in PLANS
        ) {
          planId = candidatePlan as PlanId;
        }

        startedAt =
          toDate(subscriptionData.startedAt) ??
          toDate(subscriptionData.startDate);

        expiresAt =
          toDate(subscriptionData.expiresAt) ??
          toDate(subscriptionData.endDate);
      }

      const plan = planId ? getPlan(planId) : null;
    const now = new Date();

    const expired =
      expiresAt !== null && now.getTime() >= expiresAt.getTime();

    const activeListingsSnap = await marketplaceAdminDb
      .collection("marketplaceListings")
      .where("sellerUid", "==", uid)
      .get();

    let activeListings = 0;

    activeListingsSnap.forEach((doc) => {
      const data = doc.data();

      if (data.isPublished === true) {
        activeListings += 1;
      }
    });

      const effectiveCapacity =
        !plan || expired ? 0 : plan.capacity;

      const remainingListings = Math.max(
        0,
        effectiveCapacity - activeListings
      );

      return NextResponse.json({
        success: true,
        subscription: {
          planId: plan?.id ?? null,
          title: plan?.title ?? null,
          capacity: plan?.capacity ?? 0,
          effectiveCapacity,
          durationDays: plan?.durationDays ?? 0,
          price: plan?.price ?? 0,
          startedAt: startedAt?.toISOString() ?? null,
          expiresAt: expiresAt?.toISOString() ?? null,
          expired: plan ? expired : false,
          status: !plan ? "none" : expired ? "expired" : "active",
          activeListings,
          remainingListings,
        },
      });
  } catch (error: unknown) {
    console.error(
      "MARKETPLACE SUBSCRIPTION GET ERROR:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      {
        success: false,
        error: "خطا در دریافت وضعیت اشتراک بازارچه.",
      },
      { status: 500 }
    );
  }
}
