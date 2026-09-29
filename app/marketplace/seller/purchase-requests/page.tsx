"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type PurchaseRequest = {
  id: string;
  listingId?: string;
  buyerUid?: string;
  sellerUid?: string;
  status?: string;
  listingTitle?: string;
  listingDescription?: string;
  listingPrice?: number | null;
  listingPriceType?: string;
  listingCity?: string;
  listingImageUrl?: string;
  createdAt?: string;
};

export default function SellerPurchaseRequestsPage() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [sellerListingCount, setSellerListingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending" | "closed">("all");

  const approvedRequests = requests.filter(
    (request) => request.status === "approved"
  );

  const closedRequests = requests.filter(
    (request) =>
      request.status === "blocked" ||
      request.status === "closed" ||
      request.status === "deleted"
  );

  const pendingRequests = requests.filter(
    (request) =>
      request.status !== "approved" &&
      request.status !== "blocked" &&
      request.status !== "closed" &&
      request.status !== "deleted"
  );

  const listingCount = sellerListingCount;

  const filteredRequests =
    statusFilter === "all"
      ? requests
      : statusFilter === "approved"
        ? approvedRequests
        : statusFilter === "pending"
          ? pendingRequests
          : closedRequests;
  async function deleteListing(listingId: string, requestId: string) {
    try {
      setDeletingId(requestId);
      setDeleteMessage("");
      setMessage("");

      const response = await fetch("/api/marketplace/purchase-request", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          action: "block",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "PURCHASE_REQUEST_BLOCK_FAILED"
        );
      }

      setRequests((current) =>
        current.filter((request) => request.id !== requestId)
      );

      setDeleteMessage(
        " ارتباط این خریدار با آگهی مسدود شد."
      );
    } catch {
      setDeleteMessage(
        "مسدود کردن ارتباط انجام نشد. دوباره تلاش کن."
      );
    } finally {
      setDeletingId(null);
    }
  }



  async function approveRequest(requestId: string) {
    try {
      setApprovingId(requestId);
      setMessage("");

      const response = await fetch(
        "/api/marketplace/purchase-request/approve",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "PURCHASE_REQUEST_APPROVAL_FAILED"
        );
      }

      setRequests((current) =>
        current.map((request) =>
          request.id === requestId
            ? {
                ...request,
                status: "approved",
              }
            : request
        )
      );
    } catch {
      setMessage("تأیید درخواست خرید انجام نشد.");
    } finally {
      setApprovingId(null);
    }
  }

  useEffect(() => {
    async function loadRequests() {
      try {
        setLoading(true);
        setMessage("");

        const response = await fetch("/api/marketplace/purchase-request", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "REQUESTS_FETCH_FAILED");
        }

        setRequests(Array.isArray(data?.requests) ? data.requests : []);
      } catch {
        setMessage("دریافت درخواست‌های خرید انجام نشد.");
      } finally {
        setLoading(false);
      }
    }

    loadRequests();
  }, []);

  useEffect(() => {
    async function loadSellerListingCount() {
      try {
        const response = await fetch("/api/marketplace/listings", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (Array.isArray(data)) {
          setSellerListingCount(data.length);
        }
      } catch {
        // در صورت خطای شبکه، مقدار قبلی حفظ می‌شود.
      }
    }

    loadSellerListingCount();
  }, []);

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-xl">
        <div className="text-center">
          <div className="text-4xl">🛒</div>

          <h1 className="mt-4 text-2xl font-black text-yellow-300">
            درخواست‌های خرید
          </h1>

          <p className="mt-2 text-sm font-bold text-gray-400">
            درخواست‌های خرید مربوط به آگهی‌های شما
          </p>
        </div>

        <div className="mx-auto mt-5 grid w-full max-w-sm grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded-2xl border border-blue-500/40 bg-gray-950/90 px-8 py-3 font-bold text-blue-300 shadow-lg shadow-blue-500/20 transition-all hover:scale-105 hover:bg-gray-800/90 ${
              statusFilter === "all" ? "ring-2 ring-blue-300/50" : ""
            }`}
          >
            <div className="text-lg"></div>
            <div className="mt-1 text-xs">تعداد آگهی</div>
            <div className="mt-1 text-lg">{listingCount}</div>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("approved")}
            className={`rounded-2xl border border-green-500/40 bg-gray-950/90 px-8 py-3 font-bold text-green-300 shadow-lg shadow-green-500/20 transition-all hover:scale-105 hover:bg-gray-800/90 ${
              statusFilter === "approved" ? "ring-2 ring-green-300/50" : ""
            }`}
          >
            <div className="text-lg"></div>
            <div className="mt-1 text-xs">تأیید شده</div>
            <div className="mt-1 text-lg">{approvedRequests.length}</div>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={`rounded-2xl border border-yellow-500/40 bg-gray-950/90 px-8 py-3 font-bold text-yellow-300 shadow-lg shadow-yellow-500/20 transition-all hover:scale-105 hover:bg-gray-800/90 ${
              statusFilter === "pending" ? "ring-2 ring-yellow-300/50" : ""
            }`}
          >
            <div className="text-lg"></div>
            <div className="mt-1 text-xs">در انتظار بررسی</div>
            <div className="mt-1 text-lg">{pendingRequests.length}</div>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("closed")}
            className={`rounded-2xl border border-red-500/40 bg-gray-950/90 px-8 py-3 font-bold text-red-300 shadow-lg shadow-red-500/20 transition-all hover:scale-105 hover:bg-gray-800/90 ${
              statusFilter === "closed" ? "ring-2 ring-red-300/50" : ""
            }`}
          >
            <div className="text-lg"></div>
            <div className="mt-1 text-xs">بسته‌شده</div>
            <div className="mt-1 text-lg">{closedRequests.length}</div>
          </button>
        </div>

        {loading ? (
          <div className="mt-8 rounded-2xl border border-yellow-500/20 bg-white/[0.04] px-4 py-8 text-center">
            <p className="text-sm font-bold text-yellow-300">
              در حال دریافت درخواست‌ها...
            </p>
          </div>
        ) : message ? (
          <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-950/30 px-4 py-8 text-center">
            <p className="text-sm font-bold text-red-300">{message}</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-yellow-500/20 bg-white/[0.04] px-4 py-8 text-center">
            <p className="text-sm font-bold text-gray-500">
              فعلاً درخواست خریدی ثبت نشده است.
            </p>
          </div>
        ) : (
          <div className="mx-auto mt-8 grid w-full max-w-2xl gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="group flex min-h-[108px] overflow-hidden rounded-xl border border-yellow-500/30 bg-white/[0.04] backdrop-blur-md transition-all hover:-translate-y-1 hover:border-yellow-400/60 hover:bg-white/10"
              >
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-black/40">
                  {request.listingImageUrl ? (
                    <img
                      src={request.listingImageUrl}
                      alt={request.listingTitle || "آگهی"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-3xl">🛍️</span>
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-between p-2">
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="min-w-0 flex-1 truncate text-sm font-black text-yellow-300">
                        {request.listingTitle || "بدون عنوان"}
                      </h2>

                      <span
                        className={
                          request.status === "approved"
                            ? "shrink-0 rounded-lg border border-green-500/40 bg-gray-950/90 px-1.5 py-0.5 text-[8px] font-bold text-green-300"
                            : "shrink-0 rounded-lg border border-yellow-500/40 bg-gray-950/90 px-1.5 py-0.5 text-[8px] font-bold text-yellow-300"
                        }
                      >
                        {request.status === "approved"
                          ? "تأیید شده"
                          : "در انتظار"}
                      </span>
                    </div>

                    {request.listingDescription && (
                      <p className="mt-0.5 line-clamp-2 text-[10px] leading-3.5 text-gray-400">
                        {request.listingDescription}
                      </p>
                    )}

                    <div className="mt-1 flex min-w-0 items-center gap-3">
                      {request.listingPrice != null && (
                        <p className="truncate text-[10px] font-bold text-green-300">
                          💰 {request.listingPrice.toLocaleString("fa-IR")}
                        </p>
                      )}

                      {request.listingCity && (
                        <p className="truncate text-[10px] font-bold text-gray-300">
                          📍 {request.listingCity}
                        </p>
                      )}
                    </div>

                    <p className="mt-0.5 truncate text-[7px] font-bold text-gray-600">
                      درخواست: {request.id}
                    </p>
                  </div>

                  <div className="mt-1 flex gap-1">
                    {request.status === "pending" ? (
                      <button
                        type="button"
                        disabled={approvingId === request.id}
                        onClick={() => approveRequest(request.id)}
                        className="flex-1 rounded-lg border border-green-500/40 bg-gray-950/90 px-1.5 py-1 text-[9px] font-black text-green-300 transition-all hover:bg-gray-800/90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {approvingId === request.id
                          ? "در حال تأیید..."
                          : "✅ تأیید درخواست"}
                      </button>
                    ) : request.status === "approved" ? (
                      <Link
                        href={`/marketplace/seller/chat/${encodeURIComponent(request.id)}`}
                        className="flex-1 flex items-center justify-center rounded-lg border border-blue-500/40 bg-blue-950/50 px-1.5 py-1 text-[9px] font-black text-blue-300 shadow-lg shadow-blue-500/10 transition-all hover:bg-blue-900/60"
                      >
                        💬 ورود به چت
                      </Link>
                    ) : null}

                    <button
                      type="button"
                      disabled={
                        deletingId === request.listingId ||
                        !request.listingId
                      }
                      onClick={() => {
                        if (request.listingId) {
                          deleteListing(request.listingId, request.id);
                        }
                      }}
                      className="flex-1 rounded-lg border border-red-500/40 bg-red-950/60 px-1.5 py-1 text-[9px] font-black text-red-300 transition-all hover:bg-red-900/70 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === request.listingId
                        ? "در حال حذف..."
                        : "🗑️ حذف ارتباط"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
