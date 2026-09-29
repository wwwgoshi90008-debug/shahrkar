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
    const uid = getSessionUid(request);

    if (!uid) {
      return NextResponse.json(
        { error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const snapshot = await marketplaceAdminDb
      .collection("marketplaceNotifications")
      .where("uid", "==", uid)
      .get();

    const docs = [...snapshot.docs].sort((a, b) => {
      const aTime = a.data()?.createdAt;
      const bTime = b.data()?.createdAt;

      const aMillis =
        typeof aTime?.toMillis === "function"
          ? aTime.toMillis()
          : typeof aTime === "number"
            ? aTime
            : typeof aTime === "string"
              ? Date.parse(aTime)
              : 0;

      const bMillis =
        typeof bTime?.toMillis === "function"
          ? bTime.toMillis()
          : typeof bTime === "number"
            ? bTime
            : typeof bTime === "string"
              ? Date.parse(bTime)
              : 0;

      return bMillis - aMillis;
    }).slice(0, 100);

    const notifications = docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error(
      "MARKETPLACE_NOTIFICATIONS_GET_ERROR",
      error
    );

    return NextResponse.json(
      { error: "MARKETPLACE_NOTIFICATIONS_FETCH_FAILED" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const uid = getSessionUid(request);

    if (!uid) {
      return NextResponse.json(
        { error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const action =
      typeof body?.action === "string"
        ? body.action
        : "";

    const notificationId =
      typeof body?.notificationId === "string"
        ? body.notificationId.trim()
        : "";

    const baseRef = marketplaceAdminDb.collection(
      "marketplaceNotifications"
    );

    if (action === "read-all") {
      const snapshot = await baseRef
        .where("uid", "==", uid)
        .get();

      const unreadDocs = snapshot.docs.filter(
        (doc) => doc.data()?.bellRead !== true
      );

      if (unreadDocs.length > 0) {
        const batch = marketplaceAdminDb.batch();

        unreadDocs.forEach((doc) => {
          batch.update(doc.ref, {
            seen: true,
            bellRead: true,
          });
        });

        await batch.commit();
      }

      return NextResponse.json({
        success: true,
        updated: unreadDocs.length,
      });
    }

    if (action === "read") {
      if (!notificationId) {
        return NextResponse.json(
          { error: "NOTIFICATION_ID_REQUIRED" },
          { status: 400 }
        );
      }

      const ref = baseRef.doc(notificationId);
      const snap = await ref.get();

      if (!snap.exists) {
        return NextResponse.json(
          { error: "NOTIFICATION_NOT_FOUND" },
          { status: 404 }
        );
      }

      const data = snap.data();

      if (data?.uid !== uid) {
        return NextResponse.json(
          { error: "FORBIDDEN" },
          { status: 403 }
        );
      }

      await ref.update({
        seen: true,
        bellRead: true,
      });

      return NextResponse.json({
        success: true,
      });
    }

    return NextResponse.json(
      { error: "INVALID_ACTION" },
      { status: 400 }
    );
  } catch (error) {
    console.error(
      "MARKETPLACE_NOTIFICATIONS_PATCH_ERROR",
      error
    );

    return NextResponse.json(
      { error: "MARKETPLACE_NOTIFICATION_UPDATE_FAILED" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const uid = getSessionUid(request);

    if (!uid) {
      return NextResponse.json(
        { error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const notificationId = url.searchParams.get("notificationId");

    const baseRef = marketplaceAdminDb.collection(
      "marketplaceNotifications"
    );

    if (notificationId) {
      const ref = baseRef.doc(notificationId);
      const snap = await ref.get();

      if (!snap.exists) {
        return NextResponse.json(
          { error: "NOTIFICATION_NOT_FOUND" },
          { status: 404 }
        );
      }

      const data = snap.data();

      if (data?.uid !== uid) {
        return NextResponse.json(
          { error: "FORBIDDEN" },
          { status: 403 }
        );
      }

      await ref.delete();

      return NextResponse.json({
        success: true,
        deletedNotificationId: notificationId,
      });
    }

    const snapshot = await baseRef
      .where("uid", "==", uid)
      .get();

    const docs = snapshot.docs;

    for (let i = 0; i < docs.length; i += 400) {
      const batch = marketplaceAdminDb.batch();
      const chunk = docs.slice(i, i + 400);

      for (const doc of chunk) {
        batch.delete(doc.ref);
      }

      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      deletedNotifications: docs.length,
    });
  } catch (error) {
    console.error(
      "MARKETPLACE_NOTIFICATIONS_DELETE_ERROR",
      error
    );

    return NextResponse.json(
      { error: "MARKETPLACE_NOTIFICATIONS_DELETE_FAILED" },
      { status: 500 }
    );
  }
}
