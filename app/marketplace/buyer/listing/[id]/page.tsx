"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Listing = {
  id: string;
  boothName?: string;
  title?: string;
  category?: string;
  description?: string;
  price?: number | null;
  priceType?: string;
  city?: string;
  imageUrls?: string[];
  isOwnListing?: boolean;
};

export default function BuyerListingPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : "";

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState("");

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadListing() {
      try {
        setLoading(true);
        setError(false);
        setBlocked(false);

        const response = await fetch(
          `/api/marketplace/listings?id=${encodeURIComponent(id)}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          if (response.status === 403) {
            const blockedData = await response.json().catch(() => null);

            if (blockedData?.error === "LISTING_RELATION_BLOCKED") {
              if (!cancelled) {
                setListing(null);
                setBlocked(true);
                setError(false);
              }
              return;
            }
          }

          throw new Error("LISTING_NOT_FOUND");
        }

        const data = await response.json();

        if (!cancelled) {
          setListing(data);
        }
      } catch {
        if (!cancelled) {
          setListing(null);
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadListing();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return "رایگان";
    return `${new Intl.NumberFormat("fa-IR").format(price)} تومان`;
  };

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#080808] px-3 py-4 text-white"
      >
        <div className="mx-auto max-w-xl text-center text-sm text-white/60">
          در حال دریافت آگهی...
        </div>
      </main>
    );
  }

  if (blocked) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#080808] px-3 py-4 text-white"
      >
        <div className="mx-auto max-w-xl rounded-2xl border border-red-500/60 bg-red-950/30 p-6 text-center shadow-xl shadow-red-950/30">
          <div className="text-3xl">🔴</div>

          <h1 className="mt-3 text-xl font-black text-red-300">
            ارتباط مسدود شد
          </h1>

          <p className="mt-2 text-xs font-bold leading-6 text-red-200/70">
            این آگهی برای شما قابل باز شدن نیست و امکان ثبت درخواست خرید برای آن وجود ندارد.
          </p>

          <button
            type="button"
            onClick={() => router.back()}
            className="mt-5 w-full rounded-xl border border-yellow-500/40 bg-yellow-950/70 px-5 py-2.5 font-bold text-sm text-yellow-300 shadow-md shadow-yellow-500/20 transition-all hover:scale-105 hover:bg-yellow-900/80"
          >
            بازگشت به صفحه قبل
          </button>
        </div>
      </main>
    );
  }

  if (error || !listing) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#080808] px-3 py-4 text-white"
      >
        <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
          <h1 className="mb-4 text-lg font-black text-yellow-300">
            آگهی پیدا نشد
          </h1>

          <button
            type="button"
            onClick={() => router.back()}
            className="w-full rounded-xl border border-yellow-500/40 bg-yellow-950/70 px-5 py-2.5 font-bold text-yellow-300 transition hover:bg-yellow-900/80"
          >
            بازگشت به صفحه قبل
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#080808] px-3 py-4 text-white"
    >
      <div className="mx-auto w-full max-w-xl">
        <article className="overflow-hidden rounded-xl border border-yellow-500/20 bg-white/[0.025] shadow-xl shadow-black/40">

          {listing.imageUrls?.length ? (
            <div className="mx-auto w-[92%]">
              <div className="overflow-x-auto rounded-lg bg-black snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex">
                  {listing.imageUrls.slice(0, 2).map((url, index) => (
                    <div
                      key={`${url}-${index}`}
                      className="h-64 min-w-full shrink-0 snap-center"
                    >
                      <img
                        src={url}
                        alt={`${listing.title || "تصویر آگهی"} - تصویر ${index + 1}`}
                        className="h-full w-full object-contain object-center"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {listing.imageUrls.length > 1 && (
                <>
                  <div className="mt-2 flex items-center justify-center gap-1.5">
                    {listing.imageUrls.slice(0, 2).map((_, index) => (
                      <span
                        key={index}
                        className="h-1.5 w-5 rounded-full bg-yellow-400/50"
                      />
                    ))}
                  </div>

                  <p className="mt-1 text-center text-[10px] text-white/35">
                    برای دیدن تصویر دوم، آگهی را به چپ یا راست بکشید
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="mx-auto flex h-56 w-[92%] items-center justify-center rounded-lg bg-black text-xs text-white/30">
              بدون تصویر
            </div>
          )}

          <div className="px-3 py-3">

            <h1 className="text-lg font-black leading-6 text-yellow-300">
              {listing.title || "بدون عنوان"}
            </h1>

            <div className="mt-3 rounded-xl border border-blue-500/40 bg-blue-950/70 px-3 py-2 font-bold text-blue-300 shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] hover:bg-blue-900/80">
              <div className="text-[10px] text-blue-300/70">
                قیمت
              </div>

              <div className="mt-1 text-xs font-bold text-blue-300">
                {listing.priceType === "free"
                  ? "رایگان"
                  : formatPrice(listing.price)}
              </div>
            </div>

            <section className="mt-4 border-t border-white/10 pt-3">
              <h2 className="text-sm font-black text-yellow-300">
                توضیحات
              </h2>

              <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-white/70">
                {listing.description || "توضیحاتی برای این آگهی ثبت نشده است."}
              </p>
            </section>

            <div className="mt-4 border-t border-white/10 pt-3">
              <div className="text-[10px] text-white/40">
                شهر
              </div>

              <div className="mt-1 text-sm font-bold text-white/80">
                {listing.city || "ثبت نشده"}
              </div>
            </div>
              {!blocked && !listing.isOwnListing && (
              <button
                type="button"
                disabled={purchaseLoading}
                onClick={async () => {
                  try {
                    setPurchaseLoading(true);
                    setPurchaseMessage("");

                    const response = await fetch("/api/marketplace/purchase-request", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        listingId: id,
                      }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                      throw new Error(data?.error || "PURCHASE_REQUEST_FAILED");
                    }

                    setPurchaseMessage(
                      data?.alreadyExists
                        ? "درخواست خرید شما قبلاً ثبت شده است."
                        : "درخواست خرید با موفقیت ثبت شد."
                    );
                  } catch {
                    setPurchaseMessage("ثبت درخواست خرید انجام نشد.");
                  } finally {
                    setPurchaseLoading(false);
                  }
                }}
                className="mt-4 w-full rounded-xl border border-green-500/40 bg-green-950/70 px-4 py-2.5 font-black text-green-300 transition hover:bg-green-900/80"
              >
                {purchaseLoading ? "در حال ثبت..." : "درخواست خرید"}
              </button>
              )}

              {purchaseMessage && (
                <p className="mt-2 text-center text-xs font-bold text-green-300">
                  {purchaseMessage}
                </p>
              )}

            <button
              type="button"
              onClick={() => router.back()}
              className="mt-2 w-full rounded-xl border border-yellow-500/40 bg-yellow-950/70 px-5 py-2 font-bold text-sm text-yellow-300 shadow-md shadow-yellow-500/20 transition-all hover:scale-105 hover:bg-yellow-900/80"
            >
              بازگشت به صفحه قبل
            </button>

          </div>
        </article>
      </div>
    </main>
  );
}
