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

export async function POST(request: Request) {
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

    if (!requestId) {
      return NextResponse.json(
        { error: "REQUEST_ID_REQUIRED" },
        { status: 400 }
      );
    }

    const requestRef = marketplaceAdminDb
      .collection("marketplacePurchaseRequests")
      .doc(requestId);

    const chatRef = marketplaceAdminDb
      .collection("marketplaceChats")
      .doc(requestId);

    const result = await marketplaceAdminDb.runTransaction(
      async (transaction) => {
        const requestSnap = await transaction.get(requestRef);

        if (!requestSnap.exists) {
          throw new Error("REQUEST_NOT_FOUND");
        }

        const data = requestSnap.data();

        if (data?.sellerUid !== sellerUid) {
          throw new Error("FORBIDDEN");
        }

        const buyerUid =
          typeof data?.buyerUid === "string"
            ? data.buyerUid
            : "";

        if (!buyerUid) {
          throw new Error("BUYER_NOT_FOUND");
        }

        const requestStatus = data?.status;

        const chatSnap = await transaction.get(chatRef);

        if (requestStatus === "approved") {
          if (!chatSnap.exists) {
            const now = new Date().toISOString();

            transaction.set(chatRef, {
              purchaseRequestId: requestId,
              buyerUid,
              sellerUid,
              status: "active",
              createdAt: now,
              updatedAt: now,
            });
          }

          return {
            alreadyApproved: true,
            chatCreated: !chatSnap.exists,
          };
        }

        if (requestStatus !== "pending") {
          throw new Error("REQUEST_NOT_PENDING");
        }

        const now = new Date().toISOString();

        transaction.update(requestRef, {
          status: "approved",
          updatedAt: now,
        });

        if (!chatSnap.exists) {
          transaction.set(chatRef, {
            purchaseRequestId: requestId,
            buyerUid,
            sellerUid,
            status: "active",
            createdAt: now,
            updatedAt: now,
          });
        }

        const notificationRef = marketplaceAdminDb
          .collection("marketplaceNotifications")
          .doc();

        transaction.set(notificationRef, {
          uid: buyerUid,
          type: "purchase_approved",
          title: "✅ درخواست خرید شما تأیید شد",
          text: "فروشنده درخواست خرید شما را تأیید کرد.",
          chatId: requestId,
          requestId,
          senderUid: sellerUid,
          createdAt: now,
          seen: false,
          bellRead: false,
        });

        return {
          alreadyApproved: false,
          chatCreated: !chatSnap.exists,
        };
      }
    );

    return NextResponse.json({
      success: true,
      requestId,
      status: "approved",
      alreadyApproved: result.alreadyApproved,
      chatCreated: result.chatCreated,
      chatId: requestId,
    });
  } catch (error) {
    const errorCode =
      error instanceof Error ? error.message : "";

    if (errorCode === "REQUEST_NOT_FOUND") {
      return NextResponse.json(
        { error: "REQUEST_NOT_FOUND" },
        { status: 404 }
      );
    }

    if (errorCode === "FORBIDDEN") {
      return NextResponse.json(
        { error: "FORBIDDEN" },
        { status: 403 }
      );
    }

    if (errorCode === "REQUEST_NOT_PENDING") {
      return NextResponse.json(
        { error: "REQUEST_NOT_PENDING" },
        { status: 400 }
      );
    }

    if (errorCode === "BUYER_NOT_FOUND") {
      return NextResponse.json(
        { error: "BUYER_NOT_FOUND" },
        { status: 400 }
      );
    }

    console.error(
      "MARKETPLACE_APPROVE_PURCHASE_REQUEST_ERROR",
      error
    );

    return NextResponse.json(
      { error: "PURCHASE_REQUEST_APPROVAL_FAILED" },
      { status: 500 }
    );
  }
}
