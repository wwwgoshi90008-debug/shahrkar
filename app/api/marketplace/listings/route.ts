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
    const url = new URL(request.url);
    const id = url.searchParams.get("id")?.trim();
      const mine = url.searchParams.get("mine") === "1";

      if (mine) {
        const uid = getSessionUid(request);

        if (!uid) {
          return NextResponse.json(
            { error: "ابتدا وارد حساب فروشنده شوید." },
            { status: 401 }
          );
        }

        const userSnap = await marketplaceAdminDb
          .collection("marketplaceUsers")
          .doc(uid)
          .get();

        if (!userSnap.exists || userSnap.data()?.marketplaceRole !== "seller") {
          return NextResponse.json(
            { error: "فقط فروشنده می‌تواند آگهی‌های خود را ببیند." },
            { status: 403 }
          );
        }

        const snapshot = await marketplaceAdminDb
          .collection("marketplaceListings")
          .where("sellerUid", "==", uid)
          .get();

        const listings = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        return NextResponse.json(listings);
      }


    if (id) {
      const doc = await marketplaceAdminDb
        .collection("marketplaceListings")
        .doc(id)
        .get();

      if (!doc.exists || doc.data()?.isPublished !== true) {
        return NextResponse.json(
          { error: "آگهی پیدا نشد." },
          { status: 404 }
        );
      }

      const buyerUid = getSessionUid(request);

      if (buyerUid) {
        const blockId = `${id}__${buyerUid}`;

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
      }

      const listingData = doc.data() || {};

      return NextResponse.json({
        id: doc.id,
        ...listingData,
        isOwnListing:
          typeof listingData.sellerUid === "string" &&
          listingData.sellerUid === buyerUid,
      });
    }

    const snapshot = await marketplaceAdminDb
      .collection("marketplaceListings")
      .where("isPublished", "==", true)
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();

    const buyerUid = getSessionUid(request);

    let blockedListingIds = new Set<string>();

    if (buyerUid) {
      const blockedSnapshot = await marketplaceAdminDb
        .collection("marketplaceListingBlocks")
        .where("buyerUid", "==", buyerUid)
        .get();

      blockedListingIds = new Set(
        blockedSnapshot.docs
          .map((doc) => {
            const data = doc.data() || {};
            return typeof data.listingId === "string"
              ? data.listingId
              : "";
          })
          .filter(Boolean)
      );
    }

    const listings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      blockedForCurrentBuyer: blockedListingIds.has(doc.id),
    }));

    return NextResponse.json(listings);
  } catch (error: any) {
    console.log("MARKETPLACE LISTINGS GET ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "خطا در دریافت آگهی‌ها" },
      { status: 500 }
    );
  }
}


const MARKETPLACE_SUBSCRIPTION_PLANS = {
  free: { capacity: 2, durationDays: 5 },
  base: { capacity: 7, durationDays: 15 },
  professional: { capacity: 10, durationDays: 20 },
  special: { capacity: 30, durationDays: 30 },
} as const;

function toMarketplaceDate(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function getMarketplaceSubscriptionPlan(planId: unknown) {
  if (
    typeof planId === "string" &&
    planId in MARKETPLACE_SUBSCRIPTION_PLANS
  ) {
    return MARKETPLACE_SUBSCRIPTION_PLANS[
      planId as keyof typeof MARKETPLACE_SUBSCRIPTION_PLANS
    ];
  }

  return MARKETPLACE_SUBSCRIPTION_PLANS.free;
}

export async function POST(request: Request) {
  try {
    const uid = getSessionUid(request);

    if (!uid) {
      return NextResponse.json(
        { error: "ابتدا وارد حساب فروشنده شوید." },
        { status: 401 }
      );
    }

    const userSnap = await marketplaceAdminDb
      .collection("marketplaceUsers")
      .doc(uid)
      .get();

    if (!userSnap.exists || userSnap.data()?.marketplaceRole !== "seller") {
      return NextResponse.json(
        { error: "فقط فروشنده می‌تواند آگهی ثبت کند." },
        { status: 403 }
      );
    }

    const boothRef = marketplaceAdminDb
      .collection("marketplaceBooths")
      .doc(uid);

    const boothSnap = await boothRef.get();

    if (!boothSnap.exists) {
      return NextResponse.json(
        {
          error: "ابتدا غرفه خود را بسازید.",
          code: "BOOTH_REQUIRED",
        },
        { status: 400 }
      );
    }

    const booth = boothSnap.data();

    const body = await request.json();

    const title =
      typeof body.title === "string" ? body.title.trim() : "";

    const category =
      typeof body.category === "string" ? body.category.trim() : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const city =
      typeof body.city === "string" ? body.city.trim() : "";

    const priceType = body.priceType;

    const price =
      body.price === null ||
      body.price === undefined ||
      body.price === ""
        ? null
        : Number(body.price);

    const imageUrls = Array.isArray(body.imageUrls)
      ? body.imageUrls
          .filter(
            (url: unknown): url is string =>
              typeof url === "string" && url.trim().length > 0
          )
          .slice(0, 2)
      : [];

    const isPublished =
      typeof body.isPublished === "boolean"
        ? body.isPublished
        : true;

    if (!title || !category || !description || !city) {
      return NextResponse.json(
        {
          error:
            "عنوان، دسته‌بندی، توضیحات و شهر الزامی هستند.",
        },
        { status: 400 }
      );
    }

    if (
      priceType !== "fixed" &&
      priceType !== "negotiable" &&
      priceType !== "free"
    ) {
      return NextResponse.json(
        { error: "نوع قیمت نامعتبر است." },
        { status: 400 }
      );
    }

    if (
      priceType !== "free" &&
      (price === null ||
        !Number.isFinite(price) ||
        price < 0)
    ) {
      return NextResponse.json(
        { error: "برای این نوع قیمت، مبلغ معتبر وارد کنید." },
        { status: 400 }
      );
    }

    if (isPublished) {
      const subscriptionSnap = await marketplaceAdminDb
        .collection("marketplaceSubscriptions")
        .doc(uid)
        .get();

      const subscriptionData = subscriptionSnap.exists
        ? subscriptionSnap.data()
        : null;

      let planId: keyof typeof MARKETPLACE_SUBSCRIPTION_PLANS = "free";
      let expiresAt: Date | null = null;

      if (subscriptionData) {
        if (
          typeof subscriptionData.planId === "string" &&
          subscriptionData.planId in MARKETPLACE_SUBSCRIPTION_PLANS
        ) {
          planId =
            subscriptionData.planId as keyof typeof MARKETPLACE_SUBSCRIPTION_PLANS;
        }

        expiresAt =
          toMarketplaceDate(subscriptionData.expiresAt) ??
          toMarketplaceDate(subscriptionData.endDate);
      } else {
        const userData = userSnap.data();

        const startedAt =
          toMarketplaceDate(userData?.createdAt) ??
          toMarketplaceDate(userData?.registeredAt);

        if (startedAt) {
          expiresAt = new Date(
            startedAt.getTime() +
              MARKETPLACE_SUBSCRIPTION_PLANS.free.durationDays *
                24 *
                60 *
                60 *
                1000
          );
        }
      }

      const plan = getMarketplaceSubscriptionPlan(planId);
      const nowForSubscription = new Date();

      const expired =
        expiresAt !== null &&
        nowForSubscription.getTime() >= expiresAt.getTime();

      const activeListingsSnap = await marketplaceAdminDb
        .collection("marketplaceListings")
        .where("sellerUid", "==", uid)
        .get();

      let activeListings = 0;

      activeListingsSnap.forEach((doc) => {
        if (doc.data().isPublished === true) {
          activeListings += 1;
        }
      });

      const effectiveCapacity = expired ? 0 : plan.capacity;

      if (expired) {
        return NextResponse.json(
          {
            error:
              "اشتراک شما به پایان رسیده است. برای انتشار آگهی جدید، ابتدا اشتراک خود را تمدید کنید.",
            code: "SUBSCRIPTION_EXPIRED",
          },
          { status: 403 }
        );
      }

      if (activeListings >= effectiveCapacity) {
        return NextResponse.json(
          {
            error: `ظرفیت پلن شما تکمیل شده است. حداکثر ${effectiveCapacity} آگهی فعال می‌توانید داشته باشید.`,
            code: "LISTING_CAPACITY_REACHED",
            capacity: effectiveCapacity,
            activeListings,
            remainingListings: 0,
          },
          { status: 403 }
        );
      }
    }

    const now = new Date().toISOString();

    const listingRef = marketplaceAdminDb
      .collection("marketplaceListings")
      .doc();

    const listingData = {
      sellerUid: uid,
      boothId: uid,
      boothName: booth?.boothName || "",

      title,
      category,
      description,

      price: priceType === "free" ? null : price,
      priceType,

      city,
      imageUrls,

      isPublished,

      createdAt: now,
      updatedAt: now,
    };

    await listingRef.set(listingData);

    return NextResponse.json(
      {
        success: true,
        listing: {
          id: listingRef.id,
          ...listingData,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.log("MARKETPLACE LISTINGS POST ERROR:", error);

    return NextResponse.json(
      { error: error?.message || "خطا در ثبت آگهی" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const uid = getSessionUid(request);

    if (!uid) {
      return NextResponse.json(
        { error: "ابتدا وارد حساب فروشنده شوید." },
        { status: 401 }
      );
    }

    const userSnap = await marketplaceAdminDb
      .collection("marketplaceUsers")
      .doc(uid)
      .get();

    if (!userSnap.exists || userSnap.data()?.marketplaceRole !== "seller") {
      return NextResponse.json(
        { error: "فقط فروشنده می‌تواند آگهی ویرایش کند." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const listingId = typeof body.id === "string" ? body.id.trim() : "";

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

    if (!listingSnap.exists) {
      return NextResponse.json(
        { error: "آگهی پیدا نشد." },
        { status: 404 }
      );
    }

    const listing = listingSnap.data();

    if (listing?.sellerUid !== uid) {
      return NextResponse.json(
        { error: "شما مالک این آگهی نیستید." },
        { status: 403 }
      );
    }

      if (typeof body.isPublished === "boolean" && Object.keys(body).length === 2) {
        await listingRef.update({ isPublished: body.isPublished, updatedAt: new Date().toISOString() });
        return NextResponse.json({ success: true, listing: { id: listingId, ...listing, isPublished: body.isPublished } });
      }

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const category = typeof body.category === "string" ? body.category.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const city = typeof body.city === "string" ? body.city.trim() : "";
    const priceType = body.priceType;
    const price = body.price === null || body.price === undefined || body.price === "" ? null : Number(body.price);
    const imageUrls = Array.isArray(body.imageUrls)
      ? body.imageUrls
          .filter(
            (url: unknown): url is string =>
              typeof url === "string" && url.trim().length > 0
          )
          .slice(0, 2)
      : [];
    const isPublished = typeof body.isPublished === "boolean" ? body.isPublished : listing?.isPublished === true;

    if (!title || !category || !description || !city) {
      return NextResponse.json(
        { error: "عنوان، دسته‌بندی، توضیحات و شهر الزامی هستند." },
        { status: 400 }
      );
    }

    if (priceType !== "fixed" && priceType !== "negotiable" && priceType !== "free") {
      return NextResponse.json(
        { error: "نوع قیمت نامعتبر است." },
        { status: 400 }
      );
    }

    if (priceType !== "free" && (price === null || !Number.isFinite(price) || price < 0)) {
      return NextResponse.json(
        { error: "برای این نوع قیمت، مبلغ معتبر وارد کنید." },
        { status: 400 }
      );
    }

    const updatedData = {
      title,
      category,
      description,
      price: priceType === "free" ? null : price,
      priceType,
      city,
      imageUrls,
      isPublished,
      updatedAt: new Date().toISOString(),
    };

    await listingRef.update(updatedData);

    return NextResponse.json({
      success: true,
      listing: {
        id: listingId,
        ...listing,
        ...updatedData,
      },
    });
  } catch (error: any) {
    console.log("MARKETPLACE LISTINGS PUT ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "خطا در ویرایش آگهی" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const uid = getSessionUid(request);

    if (!uid) {
      return NextResponse.json(
        { error: "ابتدا وارد حساب فروشنده شوید." },
        { status: 401 }
      );
    }

    const userSnap = await marketplaceAdminDb
      .collection("marketplaceUsers")
      .doc(uid)
      .get();

    if (!userSnap.exists || userSnap.data()?.marketplaceRole !== "seller") {
      return NextResponse.json(
        { error: "فقط فروشنده می‌تواند آگهی حذف کند." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const listingId =
      typeof body.id === "string" ? body.id.trim() : "";

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

    if (!listingSnap.exists) {
      return NextResponse.json(
        { error: "آگهی پیدا نشد." },
        { status: 404 }
      );
    }

    const listing = listingSnap.data();

    if (listing?.sellerUid !== uid) {
      return NextResponse.json(
        { error: "شما مالک این آگهی نیستید." },
        { status: 403 }
      );
    }

    const purchaseRequestsSnap = await marketplaceAdminDb
      .collection("marketplacePurchaseRequests")
      .where("listingId", "==", listingId)
      .get();

    const now = new Date().toISOString();
    const batch = marketplaceAdminDb.batch();

    for (const requestDoc of purchaseRequestsSnap.docs) {
      const purchaseRequest = requestDoc.data() || {};

      const buyerUid =
        typeof purchaseRequest.buyerUid === "string"
          ? purchaseRequest.buyerUid
          : "";

      const chatRef = marketplaceAdminDb
        .collection("marketplaceChats")
        .doc(requestDoc.id);

      const chatSnap = await chatRef.get();

      if (chatSnap.exists) {
        batch.update(chatRef, {
          status: "deleted",
          updatedAt: now,
          deletedAt: now,
          deleteReason: "listing_deleted",
        });
      }

      if (buyerUid) {
        const notificationRef = marketplaceAdminDb
          .collection("marketplaceNotifications")
          .doc();

        batch.set(notificationRef, {
          uid: buyerUid,
          type: "listing_deleted",
          title: "⚠️ این آگهی موجود نیست.",
          text: "آگهی موردنظر توسط فروشنده حذف شده است.",
          listingId,
          requestId: requestDoc.id,
          chatId: requestDoc.id,
          senderUid: uid,
          createdAt: now,
          seen: false,
          bellRead: false,
        });
      }
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      id: listingId,
      blockedRequests: purchaseRequestsSnap.size,
      listingDeleted: false,
    });
  } catch (error: any) {
    console.log("MARKETPLACE LISTINGS DELETE ERROR:", error);

    return NextResponse.json(
      { error: error?.message || "خطا در حذف آگهی" },
      { status: 500 }
    );
  }
}
