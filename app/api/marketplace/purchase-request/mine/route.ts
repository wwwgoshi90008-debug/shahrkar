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
    const buyerUid = getSessionUid(request);

    if (!buyerUid) {
      return NextResponse.json(
        { error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const snapshot = await marketplaceAdminDb
      .collection("marketplacePurchaseRequests")
      .where("buyerUid", "==", buyerUid)
      .get();

    const requests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error(
      "MARKETPLACE_GET_BUYER_PURCHASE_REQUESTS_ERROR",
      error
    );

    return NextResponse.json(
      { error: "PURCHASE_REQUESTS_FETCH_FAILED" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const buyerUid = getSessionUid(request);

    if (!buyerUid) {
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

    if (!requestId) {
      return NextResponse.json(
        { error: "REQUEST_ID_REQUIRED" },
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

    const purchaseRequest = requestSnap.data();

    if (purchaseRequest?.buyerUid !== buyerUid) {
      return NextResponse.json(
        { error: "NOT_YOUR_PURCHASE_REQUEST" },
        { status: 403 }
      );
    }

    await requestRef.delete();

    return NextResponse.json({
      success: true,
      id: requestId,
    });
  } catch (error) {
    console.error(
      "MARKETPLACE_DELETE_BUYER_PURCHASE_REQUEST_ERROR",
      error
    );

    return NextResponse.json(
      { error: "PURCHASE_REQUEST_DELETE_FAILED" },
      { status: 500 }
    );
  }
}
