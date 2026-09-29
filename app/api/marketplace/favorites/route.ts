import { NextResponse } from "next/server";
import { marketplaceAdminDb } from "@/lib/marketplace-firebase-admin";
import {
  verifyMarketplaceSessionValue,
  COOKIE_NAME,
} from "@/lib/auth/marketplace-session";

function getSessionUid(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";

  const cookies = Object.fromEntries(
    cookieHeader
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const index = item.indexOf("=");
        return [
          item.slice(0, index),
          decodeURIComponent(item.slice(index + 1)),
        ];
      })
  );

  const sessionValue = cookies[COOKIE_NAME];

  if (!sessionValue) {
    return null;
  }

  const session = verifyMarketplaceSessionValue(sessionValue);
  return session?.uid || null;
}

export async function GET(request: Request) {
  try {
    const uid = getSessionUid(request);

    if (!uid) {
      return NextResponse.json(
        { error: "ابتدا وارد حساب بازارچه شوید." },
        { status: 401 }
      );
    }

    const snapshot = await marketplaceAdminDb
      .collection("marketplaceFavorites")
      .where("uid", "==", uid)
      .get();

    const favorites = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(favorites);
  } catch (error: any) {
    console.log("MARKETPLACE FAVORITES GET ERROR:", error);

    return NextResponse.json(
      { error: error?.message || "خطا در دریافت علاقه‌مندی‌ها" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const uid = getSessionUid(request);

    if (!uid) {
      return NextResponse.json(
        { error: "ابتدا وارد حساب بازارچه شوید." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const listingId =
      typeof body.listingId === "string" ? body.listingId.trim() : "";

    if (!listingId) {
      return NextResponse.json(
        { error: "شناسه آگهی الزامی است." },
        { status: 400 }
      );
    }

    const listingRef = marketplaceAdminDb
      .collection("marketplaceListings")
      .doc(listingId);

    const listingSnap = await listingRef.get();

    if (!listingSnap.exists || listingSnap.data()?.isPublished !== true) {
      return NextResponse.json(
        { error: "آگهی پیدا نشد." },
        { status: 404 }
      );
    }

    const listing = listingSnap.data();

    const favoriteRef = marketplaceAdminDb
      .collection("marketplaceFavorites")
      .doc(`${uid}_${listingId}`);

    const favoriteSnap = await favoriteRef.get();

    if (favoriteSnap.exists) {
      return NextResponse.json({
        success: true,
        alreadyExists: true,
        favorite: {
          id: favoriteRef.id,
          ...favoriteSnap.data(),
        },
      });
    }

    const now = new Date().toISOString();

    const favoriteData = {
      uid,
      listingId,
      listingTitle: listing?.title || "",
      listingCategory: listing?.category || "",
      listingDescription: listing?.description || "",
      listingPrice: listing?.price ?? null,
      listingPriceType: listing?.priceType || "",
      listingCity: listing?.city || "",
      listingImageUrls: Array.isArray(listing?.imageUrls)
        ? listing.imageUrls
        : [],
      sellerUid: listing?.sellerUid || "",
      boothId: listing?.boothId || "",
      boothName: listing?.boothName || "",
      createdAt: now,
      updatedAt: now,
    };

    await favoriteRef.set(favoriteData);

    return NextResponse.json(
      {
        success: true,
        alreadyExists: false,
        favorite: {
          id: favoriteRef.id,
          ...favoriteData,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.log("MARKETPLACE FAVORITES POST ERROR:", error);

    return NextResponse.json(
      { error: error?.message || "خطا در ذخیره علاقه‌مندی" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const uid = getSessionUid(request);

    if (!uid) {
      return NextResponse.json(
        { error: "ابتدا وارد حساب بازارچه شوید." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const listingId =
      typeof body.listingId === "string" ? body.listingId.trim() : "";

    if (!listingId) {
      return NextResponse.json(
        { error: "شناسه آگهی الزامی است." },
        { status: 400 }
      );
    }

    const favoriteRef = marketplaceAdminDb
      .collection("marketplaceFavorites")
      .doc(`${uid}_${listingId}`);

    const favoriteSnap = await favoriteRef.get();

    if (!favoriteSnap.exists) {
      return NextResponse.json({
        success: true,
        alreadyRemoved: true,
      });
    }

    await favoriteRef.delete();

    return NextResponse.json({
      success: true,
      alreadyRemoved: false,
      listingId,
    });
  } catch (error: any) {
    console.log("MARKETPLACE FAVORITES DELETE ERROR:", error);

    return NextResponse.json(
      { error: error?.message || "خطا در حذف علاقه‌مندی" },
      { status: 500 }
    );
  }
}
