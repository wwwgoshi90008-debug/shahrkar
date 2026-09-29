import { NextResponse } from "next/server";
import { marketplaceAdminAuth } from "@/lib/marketplace-firebase-admin";
import {
  createMarketplaceSessionValue,
  COOKIE_NAME,
} from "@/lib/auth/marketplace-session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const idToken = body?.idToken;

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "توکن ورود بازارچه ارسال نشده است.",
        },
        { status: 400 }
      );
    }

    const decodedToken = await marketplaceAdminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const sessionValue = createMarketplaceSessionValue(uid);

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: sessionValue,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: unknown) {
    console.error(
      "MARKETPLACE SESSION ERROR:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      {
        success: false,
        error: "ایجاد نشست بازارچه ناموفق بود.",
      },
      { status: 401 }
    );
  }
}
