import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { marketplaceAdminDb } from "@/lib/marketplace-firebase-admin";
import {
  verifyMarketplaceSessionValue,
  COOKIE_NAME,
} from "@/lib/auth/marketplace-session";

function getSessionFromCookie(req: Request) {
  return req.headers
    .get("cookie")
    ?.split(";")
    .map((c: string) => c.trim())
    .find((c: string) => c.startsWith(`${COOKIE_NAME}=`))
    ?.split("=")
    .slice(1)
    .join("=");
}

function getAuthenticatedUid(req: Request): string | null {
  const session = getSessionFromCookie(req);

  if (!session) {
    return null;
  }

  const sessionData = verifyMarketplaceSessionValue(session);

  if (!sessionData) {
    return null;
  }

  return sessionData.uid;
}

export async function GET(req: Request) {
  try {
    const uid = getAuthenticatedUid(req);

    if (!uid) {
      return NextResponse.json(
        {
          success: false,
          error: "احراز هویت بازارچه انجام نشده است.",
        },
        { status: 401 }
      );
    }

    const boothSnap = await marketplaceAdminDb
      .collection("marketplaceBooths")
      .doc(uid)
      .get();

    if (!boothSnap.exists) {
      return NextResponse.json({
        success: true,
        exists: false,
        booth: null,
      });
    }

    return NextResponse.json({
      success: true,
      exists: true,
      booth: {
        id: boothSnap.id,
        ...boothSnap.data(),
      },
    });
  } catch (error: unknown) {
    console.error(
      "MARKETPLACE BOOTH GET ERROR:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      {
        success: false,
        error: "خطا در دریافت اطلاعات غرفه.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const uid = getAuthenticatedUid(req);

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
          error: "فقط فروشنده می‌تواند غرفه بسازد.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    const boothName =
      typeof body.boothName === "string" ? body.boothName.trim() : "";

    const description =
      typeof body.description === "string" ? body.description.trim() : "";

    const category =
      typeof body.category === "string" ? body.category.trim() : "";

    const city =
      typeof body.city === "string" ? body.city.trim() : "";

    const neighborhood =
      typeof body.neighborhood === "string"
        ? body.neighborhood.trim()
        : "";

    const address =
      typeof body.address === "string" ? body.address.trim() : "";

      const phone = typeof userData?.phone === "string" ? userData.phone.trim() : "";

    const logoUrl =
      typeof body.logoUrl === "string" ? body.logoUrl.trim() : "";

    const isVisible =
      typeof body.isVisible === "boolean" ? body.isVisible : true;

    if (!boothName || !description || !category || !city) {
      return NextResponse.json(
        {
          success: false,
          error: "نام غرفه، معرفی کوتاه، دسته فعالیت و شهر الزامی هستند.",
        },
        { status: 400 }
      );
    }

    if (boothName.length > 100) {
      return NextResponse.json(
        {
          success: false,
          error: "نام غرفه نباید بیشتر از ۱۰۰ کاراکتر باشد.",
        },
        { status: 400 }
      );
    }

    if (description.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          error: "معرفی غرفه نباید بیشتر از ۱۰۰۰ کاراکتر باشد.",
        },
        { status: 400 }
      );
    }

    const boothRef = marketplaceAdminDb
      .collection("marketplaceBooths")
      .doc(uid);

    const existingBoothSnap = await boothRef.get();

    const now = new Date().toISOString();

    const boothData = {
      sellerUid: uid,
      boothName,
      description,
      category,
      city,
      neighborhood,
      address,
      phone,
      logoUrl: logoUrl || existingBoothSnap.data()?.logoUrl || "",
      isVisible,
      updatedAt: now,
      ...(existingBoothSnap.exists ? {} : { createdAt: now }),
    };

    await boothRef.set(boothData, { merge: true });

      let freeTrialActivated = false;
      let freeTrialAlreadyUsed = false;

      if (!existingBoothSnap.exists) {
        const subscriptionRef = marketplaceAdminDb
          .collection("marketplaceSubscriptions")
          .doc(uid);

        const accountPhone =
          typeof userData?.phone === "string" ? userData.phone.trim() : "";

        const normalizedPhone = accountPhone
          .replace(/\s+/g, "")
          .replace(/^09(\d{9})$/, "+98$1");

        if (normalizedPhone) {
          const phoneKey = createHash("sha256")
            .update(normalizedPhone)
            .digest("hex");

          const historyRef = marketplaceAdminDb
            .collection("marketplaceFreeTrialHistory")
            .doc(phoneKey);

          const result = await marketplaceAdminDb.runTransaction(
            async (transaction) => {
              const historySnap = await transaction.get(historyRef);
              const subscriptionSnap = await transaction.get(subscriptionRef);

              if (historySnap.exists) {
                return {
                  activated: false,
                  alreadyUsed: true,
                };
              }

              if (subscriptionSnap.exists) {
                const existingPlanId =
                  subscriptionSnap.data()?.planId;

                if (existingPlanId === "free") {
                  transaction.set(historyRef, {
                    uid,
                    planId: "free",
                    capacity: 2,
                    durationDays: 5,
                    price: 0,
                    usedAt: now,
                    createdAt: now,
                    updatedAt: now,
                  });
                }

                return {
                  activated: false,
                  alreadyUsed: existingPlanId === "free",
                };
              }

              const expiresAt = new Date(
                Date.now() + 5 * 24 * 60 * 60 * 1000
              ).toISOString();

              transaction.set(subscriptionRef, {
                sellerUid: uid,
                planId: "free",
                capacity: 2,
                durationDays: 5,
                price: 0,
                startedAt: now,
                expiresAt,
                createdAt: now,
                updatedAt: now,
              });

              transaction.set(historyRef, {
                uid,
                planId: "free",
                capacity: 2,
                durationDays: 5,
                price: 0,
                usedAt: now,
                createdAt: now,
                updatedAt: now,
              });

              return {
                activated: true,
                alreadyUsed: false,
              };
            }
          );

          freeTrialActivated = result.activated;
          freeTrialAlreadyUsed = result.alreadyUsed;
        }
      }
    return NextResponse.json({
      success: true,
      message: existingBoothSnap.exists
        ? "اطلاعات غرفه با موفقیت به‌روزرسانی شد."
        : "غرفه با موفقیت ساخته شد.",
        freeTrialActivated,
        freeTrialAlreadyUsed,
        freeTrialMessage: freeTrialAlreadyUsed
          ? "اعتبار رایگان این شماره قبلاً استفاده شده است."
          : freeTrialActivated
            ? "اعتبار رایگان با موفقیت فعال شد."
            : null,
      booth: {
        id: uid,
        ...boothData,
      },
    });
  } catch (error: unknown) {
    console.error(
      "MARKETPLACE BOOTH POST ERROR:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      {
        success: false,
        error: "خطا در ذخیره اطلاعات غرفه.",
      },
      { status: 500 }
    );
  }
}
