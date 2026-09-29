"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type PurchaseRequest = {
  id: string;
  listingId?: string;
  buyerUid?: string;
  sellerUid?: string;
  status?: "pending" | "approved" | string;
  listingTitle?: string;
  listingDescription?: string;
  listingPrice?: number | null;
  listingPriceType?: string;
  listingCity?: string;
  listingImageUrl?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

function formatPrice(request: PurchaseRequest) {
  if (request.listingPriceType === "free") {
    return "رایگان";
  }

  if (typeof request.listingPrice !== "number") {
    return "قیمت توافقی";
  }

  return `${new Intl.NumberFormat("fa-IR").format(request.listingPrice)} تومان`;
}

export default function BuyerPurchaseRequestsPage() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState("");

  async function deletePurchaseRequest(requestId: string) {
    try {
      setDeletingId(requestId);
      setDeleteMessage("");
      setError("");

      const response = await fetch(
        "/api/marketplace/purchase-request/mine",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ requestId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "PURCHASE_REQUEST_DELETE_FAILED"
        );
      }

      setRequests((current) =>
        current.filter((request) => request.id !== requestId)
      );

      setDeleteMessage("درخواست خرید حذف شد.");
    } catch {
      setDeleteMessage(
        "حذف درخواست خرید انجام نشد. دوباره تلاش کن."
      );
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadRequests() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/marketplace/purchase-request/mine",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (response.status === 401) {
          throw new Error("UNAUTHORIZED");
        }

        if (!response.ok) {
          throw new Error("REQUESTS_FETCH_FAILED");
        }

        const data = await response.json();

        if (!Array.isArray(data?.requests)) {
          throw new Error("REQUESTS_RESPONSE_INVALID");
        }

        if (!cancelled) {
          setRequests(data.requests);
        }
      } catch (err) {
        if (!cancelled) {
          setRequests([]);

          if (
            err instanceof Error &&
            err.message === "UNAUTHORIZED"
          ) {
            setError("برای مشاهده درخواست‌های خرید باید وارد بازارچه شوی.");
          } else {
            setError("دریافت درخواست‌های خرید با خطا مواجه شد.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRequests();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-black px-4 py-8 text-white"
    >
      <div className="mx-auto w-full max-w-xl">
        <div className="text-center">
          <div className="text-4xl">🛒</div>

          <h1 className="mt-4 text-2xl font-black text-yellow-300">
            درخواست‌های خرید
          </h1>

            <div className="mt-3 space-y-1 text-center">
              <p className="text-sm font-bold text-gray-400">
                درخواست‌های خریدی که برای آگهی‌ها فرستاده‌ای
              </p>
              <p className="text-xs font-black text-green-400">
                بعد از تأیید فروشنده، امکان چت رو اگهی فعال میشود
              </p>
            </div>

          {deleteMessage && (
            <p className="mt-3 rounded-xl border border-green-500/30 bg-green-950/30 px-3 py-2 text-center text-xs font-black text-green-300">
              {deleteMessage}
            </p>
          )}
        </div>

        {loading ? (
          <div className="mt-8 rounded-2xl border border-yellow-500/20 bg-white/[0.04] px-4 py-8 text-center">
            <p className="text-sm font-bold text-yellow-300">
              در حال دریافت درخواست‌ها...
            </p>
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-950/30 px-4 py-8 text-center">
            <p className="text-sm font-bold text-red-300">
              {error}
            </p>

            <Link
              href="/marketplace/login?mode=buyer"
              className="mt-4 inline-flex rounded-xl border border-green-500/40 bg-green-950/70 px-4 py-2 text-xs font-bold text-green-300 shadow-lg shadow-green-500/20 transition-all hover:scale-105 hover:bg-green-900/80"
            >
              🔐 ورود خریدار
            </Link>
          </div>
        ) : requests.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-yellow-500/20 bg-white/[0.04] px-4 py-8 text-center">
            <p className="text-sm font-bold text-gray-500">
              هنوز درخواست خریدی نداری.
            </p>

            <p className="mt-2 text-xs font-bold leading-5 text-gray-500">
              وقتی برای یک آگهی درخواست خرید بفرستی، وضعیت آن اینجا نمایش داده می‌شود.
            </p>

            <Link
              href="/marketplace/buyer"
              className="mt-4 inline-flex rounded-xl border border-yellow-500/40 bg-yellow-950/70 px-4 py-2 text-xs font-bold text-yellow-300 shadow-lg shadow-yellow-500/20 transition-all hover:scale-105 hover:bg-yellow-900/80"
            >
              🛍️ رفتن به بازارچه
            </Link>
          </div>
        ) : (
          <div className="mx-auto mt-8 grid w-full max-w-xl gap-3 sm:grid-cols-2">
            {requests.map((request) => (
              <div
                key={request.id}
                className="group flex min-h-[108px] overflow-hidden rounded-xl border border-yellow-500/30 bg-white/[0.04] backdrop-blur-md transition-all hover:-translate-y-1 hover:border-yellow-400/60 hover:bg-white/10"
              >
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-black/40">
                  {request.listingImageUrl ? (
                    <img
                      src={request.listingImageUrl}
                      alt={request.listingTitle || "آگهی"}
                      className="block h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-4xl">🛍️</span>
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-between p-2">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="min-w-0 truncate text-sm font-black text-yellow-300">
                        {request.listingTitle || "بدون عنوان"}
                      </h2>

                      <span
                          className={
                            request.status === "blocked"
                              ? "shrink-0 rounded-xl border border-red-500/50 bg-red-950/80 px-2 py-1 text-[9px] font-black text-red-300"
                              : request.status === "approved"
                                ? "shrink-0 rounded-xl border border-green-500/40 bg-green-950/70 px-2 py-1 text-[9px] font-bold text-green-300"
                                : "shrink-0 rounded-xl border border-yellow-500/40 bg-yellow-950/70 px-2 py-1 text-[9px] font-bold text-yellow-300"
                          }
                        >
                          {request.status === "blocked"
                            ? "🔴 ارتباط مسدود شد"
                            : request.status === "approved"
                              ? "تأیید شده"
                              : "در انتظار"}
                        </span>
                    </div>

                    {request.listingDescription && (
                      <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-gray-400">
                        {request.listingDescription}
                      </p>
                    )}
                  </div>

                  <div className="mt-1 space-y-0.5">
                    <p className="truncate text-xs font-bold text-green-300">
                      💰 {formatPrice(request)}
                    </p>

                    {request.listingCity && (
                      <p className="truncate text-xs font-bold text-gray-300">
                        📍 {request.listingCity}
                      </p>
                    )}

                    <p className="truncate text-[8px] font-bold text-gray-600">
                      درخواست: {request.id}
                    </p>

                    {request.status === "blocked" ? (
                        <div className="mt-1 rounded-lg border border-red-500/40 bg-red-950/50 px-2 py-1.5 text-center">
                          <div className="text-[10px] font-black text-red-300">
                            🔴 ارتباط مسدود شد
                          </div>
                          <div className="mt-0.5 text-[8px] leading-3 font-bold text-red-400">
                            این آگهی برای شما قابل باز شدن و درخواست مجدد نیست.
                          </div>
                        </div>
                      ) : request.status === "approved" ? (
                        <Link
                          href={`/marketplace/buyer/chat/${encodeURIComponent(request.id)}`}
                          className="mt-1 flex w-full items-center justify-center rounded-lg border border-blue-500/40 bg-blue-950/50 px-2 py-1.5 text-[10px] font-black text-blue-300 shadow-lg shadow-blue-500/10 transition-all hover:bg-blue-900/60"
                        >
                          💬 ورود به چت
                        </Link>
                      ) : (
                        <p className="mt-1 text-center text-[8px] leading-3 font-bold text-green-300">
                          
                        </p>
                      )}

                    <button
                      type="button"
                      disabled={deletingId === request.id}
                      onClick={() => deletePurchaseRequest(request.id)}
                      className="mt-1 w-full rounded-lg border border-red-500/40 bg-red-950/60 px-2 py-1.5 text-[10px] font-black text-red-300 transition-all hover:bg-red-900/70 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === request.id
                        ? "در حال حذف..."
                        : "🗑️ حذف درخواست"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Link
            href="/marketplace/buyer"
            className="rounded-xl border border-yellow-500/40 bg-yellow-950/70 px-4 py-2 text-xs font-bold text-yellow-300 shadow-lg shadow-yellow-500/20 transition-all hover:scale-105 hover:bg-yellow-900/80"
          >
            ← بازارچه
          </Link>
        </div>
      </div>
    </main>
  );
}
