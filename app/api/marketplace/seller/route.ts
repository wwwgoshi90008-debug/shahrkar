import { NextResponse } from "next/server";
import { marketplaceAdminDb } from "@/lib/marketplace-firebase-admin";
import {
  verifyMarketplaceSessionValue,
  COOKIE_NAME,
} from "@/lib/auth/marketplace-session";

export async function GET(req: Request) {
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

    return NextResponse.json({
      success: true,
      seller: userData?.marketplaceRole === "seller",
      marketplaceRole: userData?.marketplaceRole || null,
      user: {
        uid,
        name: userData?.name || "",
        phone: userData?.phone || "",
        city: userData?.city || "",
      },
    });
  } catch (error: unknown) {
    console.error(
      "MARKETPLACE SELLER GET ERROR:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      {
        success: false,
        error: "خطا در دریافت اطلاعات فروشنده.",
      },
      { status: 500 }
    );
  }
}
