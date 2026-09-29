import { NextResponse } from "next/server";
import { marketplaceAdminDb } from "@/lib/marketplace-firebase-admin";
import {
  verifyMarketplaceSessionValue,
  COOKIE_NAME,
} from "@/lib/auth/marketplace-session";

export async function POST(req: Request) {
  try {
    const session = req.headers
      .get("cookie")
      ?.split(";")
      .map((c: string) => c.trim())
      .find((c: string) => c.startsWith(`${COOKIE_NAME}=`))
      ?.split("=")
      .slice(1)
      .join("=");

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "احراز هویت بازارچه انجام نشده است.",
        },
        { status: 401 }
      );
    }

    const sessionData = verifyMarketplaceSessionValue(session);

    if (!sessionData) {
      return NextResponse.json(
        {
          success: false,
          error: "نشست بازارچه نامعتبر یا منقضی شده است.",
        },
        { status: 401 }
      );
    }

    const uid = sessionData.uid;

    const userRef = marketplaceAdminDb
      .collection("marketplaceUsers")
      .doc(uid);

    const userSnap = await userRef.get();

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

    if (userData?.marketplaceRole === "seller") {
      return NextResponse.json({
        success: true,
        marketplaceRole: "seller",
        message: "شما قبلاً فروشنده هستید.",
      });
    }

    await userRef.set(
      {
        marketplaceRole: "seller",
        marketplaceSellerAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      marketplaceRole: "seller",
      message: "حساب فروشنده با موفقیت فعال شد.",
    });
  } catch (error: unknown) {
    console.error(
      "MARKETPLACE BECOME SELLER ERROR:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      {
        success: false,
        error: "خطا در فعال‌سازی حساب فروشنده.",
      },
      { status: 500 }
    );
  }
}
