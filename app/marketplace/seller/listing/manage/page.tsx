"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Listing = {
  id: string;
  title?: string;
  category?: string;
  description?: string;
  price?: number | null;
  priceType?: "fixed" | "negotiable" | "free" | string;
  city?: string;
  imageUrls?: string[];
  isPublished?: boolean;
  createdAt?: string;
};

export default function ManageSellerListingsPage() {
  const router = useRouter();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadListings() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/marketplace/listings?mine=1",
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "خطا در دریافت آگهی‌ها.");
        }

        if (!cancelled) {
          setListings(Array.isArray(data) ? data : []);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "خطا در دریافت آگهی‌ها.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadListings();

    return () => {
      cancelled = true;
    };
  }, []);

  function formatPrice(listing: Listing) {
    if (listing.priceType === "free") {
      return "رایگان";
    }

    if (
      listing.price === null ||
      listing.price === undefined
    ) {
      return "بدون قیمت";
    }

    const price = new Intl.NumberFormat("fa-IR").format(
      listing.price
    );

    if (listing.priceType === "negotiable") {
      return `${price} تومان — توافقی`;
    }

    return `${price} تومان`;
  }

  async function handleDelete(listingId: string) {
    const confirmed = window.confirm(
      "آیا از حذف این آگهی مطمئن هستید؟"
    );

    if (!confirmed) return;

    try {
      setDeletingId(listingId);
      setError("");

      const response = await fetch("/api/marketplace/listings", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: listingId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطا در حذف آگهی.");
      }

      setListings((current) =>
        current.filter((listing) => listing.id !== listingId)
      );
    } catch (err: any) {
      setError(err?.message || "خطا در حذف آگهی.");
    } finally {
      setDeletingId("");
    }
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#080808] px-4 py-8 text-white"
      >
        <div className="mx-auto max-w-2xl text-center text-sm text-white/60">
          در حال دریافت آگهی‌های شما...
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#080808] px-4 py-6 text-white"
    >
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-5 rounded-3xl border border-yellow-500/20 bg-white/[0.03] p-5 shadow-2xl shadow-black/40">
          <div className="text-center">
            <div className="mb-2 text-4xl">📦</div>

            <h1 className="text-2xl font-black text-yellow-300">
              مدیریت آگهی‌های من
            </h1>

            <p className="mt-2 text-xs text-white/50">
              آگهی‌های ثبت‌شده در غرفه شما
            </p>
          </div>

          <div className="mt-5 text-center">
            <span className="inline-block rounded-2xl border border-blue-500/40 bg-blue-950/70 px-5 py-2.5 text-sm font-bold text-blue-300 shadow-lg shadow-blue-500/20">
              {listings.length} آگهی
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm font-bold text-red-300">
            {error}
          </div>
        )}

        {listings.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center shadow-xl shadow-black/30">
            <div className="text-4xl">📭</div>

            <h2 className="mt-3 text-lg font-black text-yellow-300">
              هنوز آگهی‌ای ثبت نکرده‌اید
            </h2>

            <p className="mt-2 text-xs leading-6 text-white/50">
              اولین آگهی خود را در بازارچه شهرکار ثبت کنید.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push("/marketplace/seller/listing")
              }
              className="mt-5 w-full rounded-2xl border border-green-500/40 bg-green-950/70 px-8 py-3 font-bold text-green-300 shadow-lg shadow-green-500/20 transition-all hover:scale-105 hover:bg-green-900/80"
            >
              ➕ ثبت آگهی جدید
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((listing) => {
              const image = listing.imageUrls?.[0];

              return (
                <article
                  key={listing.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-xl shadow-black/30"
                >
                  <div className="flex gap-3 p-3">
                    {image ? (
                      <img
                        src={image}
                        alt={listing.title || "آگهی"}
                        className="h-24 w-24 shrink-0 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-black text-2xl">
                        🖼️
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-sm font-black text-yellow-300">
                        {listing.title || "بدون عنوان"}
                      </h2>

                      <p className="mt-1 text-[10px] text-white/45">
                        {listing.city || "بدون شهر"}
                      </p>

                      <p className="mt-2 text-xs font-bold text-blue-300">
                        {formatPrice(listing)}
                      </p>

                      <div className="mt-2">
                        <span
                          className={`rounded-xl px-2.5 py-1 text-[9px] font-bold ${
                            listing.isPublished
                              ? "border border-green-500/30 bg-green-950/50 text-green-300"
                              : "border border-red-500/30 bg-red-950/50 text-red-300"
                          }`}
                        >
                          {listing.isPublished
                            ? "🟢 منتشر شده"
                            : "🔴 منتشر نشده"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t border-white/10 p-3">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/marketplace/seller/listing/${encodeURIComponent(
                            listing.id
                          )}`
                        )
                      }
                      className="rounded-2xl border border-blue-500/40 bg-blue-950/70 px-3 py-2.5 text-xs font-bold text-blue-300 shadow-lg shadow-blue-500/20 transition-all hover:scale-105 hover:bg-blue-900/80"
                    >
                        مشاهده / ویرایش
                    </button>

                    <button
                      type="button"
                      disabled={deletingId === listing.id}
                      onClick={() => handleDelete(listing.id)}
                      className="rounded-2xl border border-red-500/40 bg-red-950/70 px-3 py-2.5 text-xs font-bold text-red-300 shadow-lg shadow-red-500/20 transition-all hover:scale-105 hover:bg-red-900/80 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === listing.id
                        ? "در حال حذف..."
                        : "🗑️ حذف"}
                    </button>
                  </div>
                </article>
              );
            })}

          </div>
        )}

        <button
          type="button"
          onClick={() => router.push("/marketplace/seller")}
          className="mt-5 w-full rounded-2xl border border-yellow-500/40 bg-yellow-950/70 px-8 py-3 font-bold text-yellow-300 shadow-lg shadow-yellow-500/20 transition-all hover:scale-105 hover:bg-yellow-900/80"
        >
          ← بازگشت به پنل فروشنده
        </button>
      </div>
    </main>
  );
}
