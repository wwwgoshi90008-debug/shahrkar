"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Favorite = {
  id: string;
  listingId: string;
  listingTitle?: string;
  listingCategory?: string;
  listingDescription?: string;
  listingPrice?: number | null;
  listingPriceType?: string;
  listingCity?: string;
  listingImageUrls?: string[];
  sellerUid?: string;
  boothId?: string;
  boothName?: string;
};

export default function BuyerFavoritesPage() {
  const router = useRouter();

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [removingId, setRemovingId] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadFavorites() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch("/api/marketplace/favorites", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "FAVORITES_LOAD_FAILED");
        }

        if (!cancelled) {
          setFavorites(Array.isArray(data) ? data : []);
        }
      } catch (error: any) {
        if (!cancelled) {
          setFavorites([]);
          setErrorMessage(
            error?.message || "دریافت علاقه‌مندی‌ها انجام نشد."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFavorites();

    return () => {
      cancelled = true;
    };
  }, []);

  const formatPrice = (
    price: number | null | undefined,
    priceType?: string
  ) => {
    if (priceType === "free" || price === null || price === undefined) {
      return "رایگان";
    }

    return `${new Intl.NumberFormat("fa-IR").format(price)} تومان`;
  };

  async function removeFavorite(listingId: string) {
    try {
      setRemovingId(listingId);

      const response = await fetch("/api/marketplace/favorites", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listingId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "FAVORITE_REMOVE_FAILED");
      }

      setFavorites((current) =>
        current.filter((favorite) => favorite.listingId !== listingId)
      );
    } catch {
      setErrorMessage("حذف آگهی از علاقه‌مندی‌ها انجام نشد.");
    } finally {
      setRemovingId("");
    }
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#080808] px-3 py-4 text-white"
      >
        <div className="mx-auto max-w-xl text-center text-sm text-white/60">
          در حال دریافت علاقه‌مندی‌ها...
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
        <header className="mb-5">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-4 rounded-xl border border-yellow-500/30 bg-yellow-950/50 px-4 py-2 text-xs font-bold text-yellow-300 transition hover:bg-yellow-900/70"
          >
            بازگشت
          </button>

          <div className="text-center">
            <div className="text-3xl">❤️</div>
            <h1 className="mt-1 text-2xl font-black text-yellow-300">
              علاقه‌مندی‌ها
            </h1>
            <p className="mt-1 text-xs text-white/50">
              آگهی‌های ذخیره‌شده شما
            </p>
          </div>
        </header>

        {errorMessage && (
          <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-center">
            <p className="text-xs font-bold text-red-300">{errorMessage}</p>
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-10 text-center">
            <div className="text-4xl">♡</div>
            <h2 className="mt-3 text-base font-black text-yellow-300">
              هنوز آگهی‌ای در علاقه‌مندی‌ها ندارید
            </h2>
            <p className="mt-2 text-xs leading-6 text-white/50">
              برای ذخیره یک آگهی، روی ❤️ همان آگهی بزنید.
            </p>

            <button
              type="button"
              onClick={() => router.push("/marketplace/buyer")}
              className="mt-5 rounded-xl border border-yellow-500/40 bg-yellow-950/70 px-5 py-2.5 text-xs font-black text-yellow-300 transition hover:bg-yellow-900/80"
            >
              مشاهده آگهی‌ها
            </button>
          </div>
        ) : (
            <div className="mx-auto mt-8 grid w-full max-w-2xl gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((favorite) => (
                <article
                  key={favorite.id}
                  className="group flex overflow-hidden rounded-xl border border-yellow-500/20 bg-white/[0.025] shadow-lg shadow-black/30"
                >
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/marketplace/buyer/listing/${encodeURIComponent(
                          favorite.listingId
                        )}`
                      )
                    }
                    className="relative h-32 w-2/5 shrink-0 overflow-hidden bg-black text-right"
                  >
                    {favorite.listingImageUrls?.[0] ? (
                      <>
                        <img
                          src={favorite.listingImageUrls[0]}
                          alt={favorite.listingTitle || "تصویر آگهی"}
                          className="h-full w-full object-cover object-center"
                        />
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-white/30">
                        بدون تصویر
                      </div>
                    )}
                  </button>

                  <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/marketplace/buyer/listing/${encodeURIComponent(
                            favorite.listingId
                          )}`
                        )
                      }
                      className="min-w-0 text-right"
                    >
                      <h2 className="truncate text-sm font-black text-yellow-300">
                        {favorite.listingTitle || "بدون عنوان"}
                      </h2>

                      <div className="mt-2 truncate text-[10px] text-white/40">
                        {favorite.boothName || "بدون نام غرفه"}
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-2 text-[10px]">
                        <span className="truncate text-white/50">
                          {favorite.listingCity || "شهر ثبت نشده"}
                        </span>

                        <span className="font-bold text-blue-300">
                          {formatPrice(
                            favorite.listingPrice,
                            favorite.listingPriceType
                          )}
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      disabled={removingId === favorite.listingId}
                      onClick={() => removeFavorite(favorite.listingId)}
                      className="mt-2 w-full rounded-xl border border-red-500/30 bg-red-950/40 px-2 py-1.5 text-[10px] font-bold text-red-300 transition hover:bg-red-900/60 disabled:opacity-50"
                    >
                      {removingId === favorite.listingId
                        ? "در حال حذف..."
                        : "❤️ حذف از علاقه‌مندی‌ها"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
        )}
      </div>
    </main>
  );
}
