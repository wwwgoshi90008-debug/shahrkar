import { NextResponse } from "next/server";
import {
  marketplaceAdminAuth,
  marketplaceAdminDb,
} from "@/lib/marketplace-firebase-admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

      const name = String(body?.name || "").trim();
      const email = String(body?.email || "").trim().toLowerCase();
      const phone = String(body?.phone || "").trim();
      const password = String(body?.password || "");
      const role =
        body?.role === "buyer" || body?.role === "seller"
          ? body.role
          : "";
      const sellerGender =
        body?.sellerGender === "male" ? "male" : "female";

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

      if (!role) {
        return NextResponse.json(
          {
            success: false,
            error: "نوع حساب را انتخاب کنید.",
          },
          { status: 400 }
        );
      }

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          error: "رمز عبور را وارد کنید.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "رمز عبور باید حداقل ۸ کاراکتر باشد.",
        },
        { status: 400 }
      );
    }

      const existingUsersSnapshot = await marketplaceAdminDb
        .collection("marketplaceUsers")
        .where("phone", "==", phone)
        .limit(1)
        .get();

      if (!existingUsersSnapshot.empty) {
        const existingDoc = existingUsersSnapshot.docs[0];
        const existingData = existingDoc.data();
        const existingRole = existingData?.marketplaceRole;

        if (existingRole === "seller" && role === "buyer") {
          return NextResponse.json(
            {
              success: false,
              error:
                "این شماره قبلاً برای حساب فروشنده ثبت شده است و نمی‌تواند به خریدار تبدیل شود.",
            },
            { status: 400 }
          );
        }

        if (existingRole === "buyer" && role === "seller") {
          await existingDoc.ref.set(
            {
              marketplaceRole: "seller",
              sellerGender,
            },
            { merge: true }
          );

          return NextResponse.json({
            success: true,
            uid: existingDoc.id,
            upgradedFromBuyer: true,
          });
        }

        if (existingRole === role) {
          return NextResponse.json(
            {
              success: false,
              error:
                role === "seller"
                  ? "این شماره قبلاً به عنوان فروشنده ثبت‌نام کرده است."
                  : "این شماره قبلاً به عنوان خریدار ثبت‌نام کرده است.",
            },
            { status: 400 }
          );
        }
      }

      const userRecord = await marketplaceAdminAuth.createUser({
        email,
        password,
        displayName: name,
        phoneNumber:
          phone.startsWith("09") && phone.length === 11
            ? `+98${phone.slice(1)}`
            : phone,
      });

      await marketplaceAdminDb
        .collection("marketplaceUsers")
        .doc(userRecord.uid)
        .set({
          uid: userRecord.uid,
          name,
          email,
          phone,
          marketplaceRole: role,
          ...(role === "seller" ? { sellerGender } : {}),
          createdAt: new Date().toISOString(),
        });

      return NextResponse.json({
        success: true,
        uid: userRecord.uid,
      });

      return NextResponse.json({
        success: true,
        uid: userRecord.uid,
      });
  } catch (error: unknown) {
    console.error(
      "MARKETPLACE REGISTER ERROR:",
      error instanceof Error ? error.message : "Unknown error"
    );
      if (
        error instanceof Error &&
        error.message.includes("phone number already exists")
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "این شماره موبایل قبلاً در بازارچه ثبت‌نام کرده است.",
          },
          { status: 400 }
        );
      }
    return NextResponse.json(
      {
        success: false,
        error: "ثبت‌نام در بازارچه انجام نشد.",
      },
      { status: 500 }
    );
  }
}
