import { NextResponse } from "next/server";
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

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "تصویری انتخاب نشده است.",
        },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        {
          success: false,
          error: "فایل انتخاب‌شده باید تصویر باشد.",
        },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "فرمت تصویر باید JPG، PNG یا WebP باشد.",
        },
        { status: 400 }
      );
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: "حجم تصویر نباید بیشتر از ۲ مگابایت باشد.",
        },
        { status: 400 }
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    if (!cloudName) {
      throw new Error("CLOUDINARY_CLOUD_NAME_MISSING");
    }

    const cloudinaryForm = new FormData();

    cloudinaryForm.append("file", file);
    cloudinaryForm.append(
      "upload_preset",
      "shahrkar_marketplace"
    );
    cloudinaryForm.append(
      "context",
      `sellerUid=${uid}`
    );

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: cloudinaryForm,
      }
    );

    const data = await response.json();

    if (!response.ok || !data.secure_url) {
      console.error(
        "CLOUDINARY BOOTH LOGO UPLOAD ERROR:",
        data
      );

      return NextResponse.json(
        {
          success: false,
          error: "آپلود تصویر غرفه انجام نشد.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      logoUrl: data.secure_url,
    });
  } catch (error: unknown) {
    console.error(
      "MARKETPLACE BOOTH LOGO UPLOAD ERROR:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      {
        success: false,
        error: "خطا در آپلود تصویر غرفه. دوباره تلاش کن.",
      },
      { status: 500 }
    );
  }
}
