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

  try {
    const session = verifyMarketplaceSessionValue(sessionValue);
    return session?.uid || null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const sellerUid = getSessionUid(request);

    if (!sellerUid) {
      return NextResponse.json(
        { error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const snapshot = await marketplaceAdminDb
      .collection("marketplacePurchaseRequests")
      .where("sellerUid", "==", sellerUid)
      .get();

    const requests = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((request: any) => request.status !== "blocked");

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("MARKETPLACE_GET_PURCHASE_REQUESTS_ERROR", error);

    return NextResponse.json(
      { error: "PURCHASE_REQUESTS_FETCH_FAILED" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const sellerUid = getSessionUid(request);

    if (!sellerUid) {
      return NextResponse.json(
        { error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const requestId =
      typeof body?.requestId === "string"
        ? body.requestId.trim()
        : "";

    const action =
      typeof body?.action === "string"
        ? body.action.trim()
        : "";

    if (!requestId) {
      return NextResponse.json(
        { error: "REQUEST_ID_REQUIRED" },
        { status: 400 }
      );
    }

    if (action !== "block") {
      return NextResponse.json(
        { error: "SELLER_BLOCK_ACTION_REQUIRED" },
        { status: 400 }
      );
    }

    const requestRef = marketplaceAdminDb
      .collection("marketplacePurchaseRequests")
      .doc(requestId);

    const requestSnap = await requestRef.get();

    if (!requestSnap.exists) {
      return NextResponse.json(
        { error: "PURCHASE_REQUEST_NOT_FOUND" },
        { status: 404 }
      );
    }

    const purchaseRequest = requestSnap.data() || {};

    if (purchaseRequest.sellerUid !== sellerUid) {
      return NextResponse.json(
        { error: "FORBIDDEN" },
        { status: 403 }
      );
    }

    const listingId =
      typeof purchaseRequest.listingId === "string"
        ? purchaseRequest.listingId.trim()
        : "";

    const buyerUid =
      typeof purchaseRequest.buyerUid === "string"
        ? purchaseRequest.buyerUid.trim()
        : "";

    if (!listingId || !buyerUid) {
      return NextResponse.json(
        { error: "INVALID_PURCHASE_REQUEST_RELATION" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const blockId = `${listingId}__${buyerUid}`;

    const blockRef = marketplaceAdminDb
      .collection("marketplaceListingBlocks")
      .doc(blockId);

    const chatRef = marketplaceAdminDb
      .collection("marketplaceChats")
      .doc(requestId);

    const notificationRef = marketplaceAdminDb
      .collection("marketplaceNotifications")
      .doc();

    const batch = marketplaceAdminDb.batch();

    batch.set(
      blockRef,
      {
        listingId,
        buyerUid,
        sellerUid,
        blockedBy: "seller",
        reason: "seller_blocked_relationship",
        blockedAt: now,
        updatedAt: now,
      },
      { merge: true }
    );

    batch.update(requestRef, {
      status: "blocked",
      updatedAt: now,
      blockedAt: now,
      blockReason: "seller_blocked_relationship",
    });

    const chatSnap = await chatRef.get();

    if (chatSnap.exists) {
      batch.update(chatRef, {
        status: "deleted",
        updatedAt: now,
        deletedAt: now,
        deleteReason: "seller_blocked_relationship",
      });
    }

    batch.set(notificationRef, {
      uid: buyerUid,
      type: "listing_blocked",
      title: "🔴 ارتباط مسدود شد",
      text: "فروشنده ارتباط این آگهی را با شما مسدود کرد.",
      listingId,
      requestId,
      chatId: requestId,
      senderUid: sellerUid,
      createdAt: now,
      seen: false,
      bellRead: false,
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      blocked: true,
      listingId,
      requestId,
    });
  } catch (error) {
    console.error(
      "MARKETPLACE_SELLER_PURCHASE_REQUEST_BLOCK_ERROR",
      error
    );

    return NextResponse.json(
      { error: "PURCHASE_REQUEST_BLOCK_FAILED" },
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
  try {
    const buyerUid = getSessionUid(request);

    if (!buyerUid) {
      return NextResponse.json(
        { error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const listingId =
      typeof body?.listingId === "string"
        ? body.listingId.trim()
        : "";

    if (!listingId) {
      return NextResponse.json(
        { error: "LISTING_ID_REQUIRED" },
        { status: 400 }
      );
    }

    const listingRef = marketplaceAdminDb
      .collection("marketplaceListings")
      .doc(listingId);

    const listingSnap = await listingRef.get();

    if (!listingSnap.exists) {
      return NextResponse.json(
        { error: "LISTING_NOT_FOUND" },
        { status: 404 }
      );
    }

    const listing = listingSnap.data();

    if (!listing?.isPublished) {
      return NextResponse.json(
        { error: "LISTING_NOT_AVAILABLE" },
        { status: 400 }
      );
    }

    const sellerUid =
      typeof listing?.sellerUid === "string"
        ? listing.sellerUid
        : "";

    if (!sellerUid) {
      return NextResponse.json(
        { error: "SELLER_NOT_FOUND" },
        { status: 400 }
      );
    }

    if (sellerUid === buyerUid) {
      return NextResponse.json(
        { error: "CANNOT_REQUEST_OWN_LISTING" },
        { status: 400 }
      );
    }

    const blockId = `${listingId}__${buyerUid}`;

    const blockSnap = await marketplaceAdminDb
      .collection("marketplaceListingBlocks")
      .doc(blockId)
      .get();

    if (blockSnap.exists) {
      return NextResponse.json(
        {
          error: "LISTING_RELATION_BLOCKED",
          blocked: true,
          message: "🔴 ارتباط مسدود شد",
        },
        { status: 403 }
      );
    }

    const existingSnapshot = await marketplaceAdminDb
      .collection("marketplacePurchaseRequests")
      .where("listingId", "==", listingId)
      .where("buyerUid", "==", buyerUid)
      .where("status", "in", ["pending", "approved"])
      .limit(1)
      .get();

    if (!existingSnapshot.empty) {
      const existing = existingSnapshot.docs[0];

      return NextResponse.json(
        {
          success: true,
          alreadyExists: true,
          requestId: existing.id,
          status: existing.data()?.status || "pending",
        },
        { status: 200 }
      );
    }

    const now = new Date().toISOString();

    const requestRef = await marketplaceAdminDb
      .collection("marketplacePurchaseRequests")
      .add({
        listingId,
        buyerUid,
        sellerUid,
        status: "pending",
        listingTitle: listing?.title || "",
        listingDescription: listing?.description || "",
        listingPrice:
          typeof listing?.price === "number"
            ? listing.price
            : null,
        listingPriceType: listing?.priceType || "",
        listingCity: listing?.city || "",
        listingImageUrl:
          Array.isArray(listing?.imageUrls) &&
          listing.imageUrls.length > 0
            ? listing.imageUrls[0]
            : "",
        createdAt: now,
        updatedAt: now,
      });

    await marketplaceAdminDb
      .collection("marketplaceNotifications")
      .add({
        uid: sellerUid,
        type: "purchase_request",
        title: "🛒 درخواست خرید جدید",
        text: listing?.title
          ? `برای آگهی «${listing.title}» درخواست خرید جدید ثبت شد.`
          : "برای یکی از آگهی‌های شما درخواست خرید جدید ثبت شد.",
        listingTitle: listing?.title || "",
        listingId,
        requestId: requestRef.id,
        senderUid: buyerUid,
        createdAt: now,
        seen: false,
        bellRead: false,
      });

    return NextResponse.json({
      success: true,
      alreadyExists: false,
      requestId: requestRef.id,
      status: "pending",
    });
  } catch (error) {
    console.error("MARKETPLACE_PURCHASE_REQUEST_ERROR", error);

    return NextResponse.json(
      { error: "PURCHASE_REQUEST_FAILED" },
      { status: 500 }
    );
  }
}
