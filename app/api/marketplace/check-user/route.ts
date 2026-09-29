import { NextResponse } from "next/server";
import { marketplaceAdminDb } from "@/lib/marketplace-firebase-admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const phone = String(body?.phone || "").trim();

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          error: "شماره موبایل ارسال نشده است.",
        },
        { status: 400 }
      );
    }

    const snapshot = await marketplaceAdminDb
      .collection("marketplaceUsers")
      .where("phone", "==", phone)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({
        success: true,
        registered: false,
        marketplaceRole: null,
      });
    }

    const data = snapshot.docs[0].data();

    return NextResponse.json({
      success: true,
      registered: true,
      marketplaceRole: data?.marketplaceRole || null,
    });
  } catch (error: unknown) {
    console.error(
      "MARKETPLACE CHECK USER ERROR:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      {
        success: false,
        error: "بررسی ثبت‌نام بازارچه انجام نشد.",
      },
      { status: 500 }
    );
  }
}
