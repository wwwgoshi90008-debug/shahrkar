import { NextResponse } from "next/server";
import { marketplaceAdminAuth, marketplaceAdminDb } from "@/lib/marketplace-firebase-admin";
import {
  verifyMarketplaceSessionValue,
  COOKIE_NAME,
} from "@/lib/auth/marketplace-session";

function getSession(req: Request) {
  const session = req.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`))
    ?.split("=")
    .slice(1)
    .join("=");

  if (!session) return null;

  return verifyMarketplaceSessionValue(session);
}

function normalizePhone(phone: string) {
  const value = phone.trim().replace(/\s+/g, "");

  if (value.startsWith("09") && value.length === 11) {
    return `+98${value.slice(1)}`;
  }

  return value;
}

export async function GET(req: Request) {
  try {
    const session = getSession(req);

    if (!session) {
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
      .doc(session.uid)
      .get();

    if (!userSnap.exists) {
      return NextResponse.json(
        {
          success: false,
          error: "پروفایل بازارچه پیدا نشد.",
        },
        { status: 404 }
      );
    }

    const data = userSnap.data() || {};

    return NextResponse.json({
      success: true,
      user: {
        uid: session.uid,
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        city: data.city || "",
        marketplaceRole: data.marketplaceRole || null,
        sellerGender: data.sellerGender === "male" ? "male" : data.sellerGender === "female" ? "female" : null,
      },
    });
  } catch (error: unknown) {
    console.error(
      "MARKETPLACE PROFILE GET ERROR:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      {
        success: false,
        error: "خطا در دریافت پروفایل.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = getSession(req);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "احراز هویت بازارچه انجام نشده است.",
        },
        { status: 401 }
      );
    }

    const uid = session.uid;

    await marketplaceAdminDb
      .collection("marketplaceUsers")
      .doc(uid)
      .delete();

    await marketplaceAdminAuth.deleteUser(uid);

    const response = NextResponse.json({
      success: true,
      message: "حساب کاربری با موفقیت حذف شد.",
    });

    response.cookies.set(COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error: unknown) {
    console.error(
      "MARKETPLACE PROFILE DELETE ERROR:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      {
        success: false,
        error: "حذف حساب کاربری انجام نشد.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = getSession(req);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "احراز هویت بازارچه انجام نشده است.",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const phone = String(body?.phone || "").trim();
    const city = String(body?.city || "").trim();

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "نام و نام خانوادگی را وارد کنید.",
        },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "ایمیل را وارد کنید.",
        },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          error: "شماره موبایل را وارد کنید.",
        },
        { status: 400 }
      );
    }

    const firebasePhone = normalizePhone(phone);

    await marketplaceAdminAuth.updateUser(session.uid, {
      displayName: name,
      email,
      phoneNumber: firebasePhone,
    });

    await marketplaceAdminDb
      .collection("marketplaceUsers")
      .doc(session.uid)
      .set(
        {
          uid: session.uid,
          name,
          email,
          phone,
          city,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      const updatedUserSnap = await marketplaceAdminDb
        .collection("marketplaceUsers")
        .doc(session.uid)
        .get();

      const updatedUserData = updatedUserSnap.data() || {};

      return NextResponse.json({
        success: true,
        message: "پروفایل با موفقیت به‌روزرسانی شد.",
        user: {
          uid: session.uid,
          name,
          email,
          phone,
          city,
          sellerGender:
            updatedUserData.sellerGender === "male"
              ? "male"
              : updatedUserData.sellerGender === "female"
                ? "female"
                : null,
        },
      });
  } catch (error: unknown) {
    console.error(
      "MARKETPLACE PROFILE UPDATE ERROR:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      {
        success: false,
        error: "به‌روزرسانی پروفایل انجام نشد.",
      },
      { status: 500 }
    );
  }
}
