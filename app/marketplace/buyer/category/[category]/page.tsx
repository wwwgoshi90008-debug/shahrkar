"use client";

import Link from "next/link";
import { MARKETPLACE_CATEGORY_LABELS } from "@/lib/marketplace-category-ai";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

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
  blockedForCurrentBuyer?: boolean;
};

export default function CategoryPage() {
  const params = useParams<{ category: string }>();
  const category = params.category;
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favoriteLoadingId, setFavoriteLoadingId] = useState("");
  const [favoriteMessage, setFavoriteMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadListings() {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch("/api/marketplace/listings", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("LISTINGS_API_ERROR");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("LISTINGS_RESPONSE_ERROR");
        }

        if (!cancelled) {
          setListings(data);
        }
      } catch {
        if (!cancelled) {
          setListings([]);
          setError(true);
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

  const filteredListings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return listings.filter((listing) => {
      if (listing.category !== category) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableText = [
        listing.title,
        listing.description,
        listing.city,
        listing.boothName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
    }, [listings, searchQuery, category]);

  useEffect(() => {
    let cancelled = false;

    async function loadFavorites() {
      try {
        const response = await fetch("/api/marketplace/favorites", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (!cancelled && Array.isArray(data)) {
          setFavoriteIds(
            new Set(
              data
                .map((item) => item?.listingId)
                .filter((id): id is string => typeof id === "string")
            )
          );
        }
      } catch {
        // علاقه‌مندی نباید باعث اختلال در نمایش آگهی‌ها شود
      }
    }

    loadFavorites();

    return () => {
      cancelled = true;
    };
  }, []);

  async function toggleFavorite(listingId: string) {
    if (favoriteLoadingId === listingId) return;

    const isFavorite = favoriteIds.has(listingId);

    try {
      setFavoriteLoadingId(listingId);
      setFavoriteMessage("");

      const response = await fetch("/api/marketplace/favorites", {
        method: isFavorite ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listingId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "FAVORITE_TOGGLE_FAILED");
      }

      setFavoriteIds((current) => {
        const next = new Set(current);

        if (isFavorite) {
          next.delete(listingId);
        } else {
          next.add(listingId);
        }

        return next;
      });

      setFavoriteMessage(
        isFavorite
          ? "آگهی از پوشه ❤ حذف شد"
          : "آگهی به علاقه‌مندی‌ها اضافه شد"
      );

      window.setTimeout(() => {
        setFavoriteMessage("");
      }, 2200);
    } catch {
      setFavoriteMessage("تغییر علاقه‌مندی آگهی انجام نشد.");

      window.setTimeout(() => {
        setFavoriteMessage("");
      }, 2200);
    } finally {
      setFavoriteLoadingId("");
    }
  }

  const visibleListings = showMore
    ? filteredListings
    : filteredListings.slice(0, 10);

  const formatPrice = (listing: Listing) => {
    if (listing.priceType === "free") {
      return "رایگان";
    }

    if (typeof listing.price !== "number") {
      return "قیمت توافقی";
    }

    return `${new Intl.NumberFormat("fa-IR").format(listing.price)} تومان`;
  };

  const renderListingCard = (listing: Listing) => {
    const image =
      Array.isArray(listing.imageUrls) && listing.imageUrls.length > 0
        ? listing.imageUrls[0]
        : null

    const isFavorite = favoriteIds.has(listing.id)
    const isBlocked = listing.blockedForCurrentBuyer === true

    const cardContent = (
      <div className="flex min-h-[132px] flex-row items-stretch">
        {/* تصویر سمت راست */}
        <div className="relative h-[132px] w-[132px] shrink-0 overflow-hidden bg-gray-900/90">
          {image ? (
            <img
              src={image}
              alt={listing.title || "آگهی"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl">
              📦
            </div>
          )}

          <button
            type="button"
            aria-label={
              isFavorite
                ? "حذف آگهی از علاقه‌مندی‌ها"
                : "افزودن آگهی به علاقه‌مندی‌ها"
            }
            disabled={favoriteLoadingId === listing.id}
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              toggleFavorite(listing.id)
            }}
              style={{ position: "absolute", right: "0px", top: "0px" }}
            className={`z-10 flex h-9 w-9 items-center justify-center rounded-full border bg-black/75 text-xl leading-none backdrop-blur-sm transition ${
              isFavorite
                ? "border-red-500/80 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.95)]"
                : "border-red-500/30 text-red-300/50"
            } ${
              favoriteLoadingId === listing.id
                ? "scale-95 opacity-60"
                : "hover:scale-110"
            }`}
          >
            ❤️
          </button>
        </div>

        {/* محتوا سمت چپ */}
        <div
          className={`min-w-0 flex-1 px-3 py-3 text-right ${
            isBlocked ? "bg-red-950/40" : "bg-white/[0.025]"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`line-clamp-2 text-sm font-black leading-5 ${
                isBlocked ? "text-red-200" : "text-white"
              }`}
            >
              {listing.title || "بدون عنوان"}
            </h3>

            {listing.category && !isBlocked && (
              <span className="shrink-0 rounded-lg border border-yellow-500/20 bg-yellow-500/[0.06] px-1.5 py-1 text-[8px] font-bold text-yellow-300">
                {listing.category}
              </span>
            )}
          </div>

          {isBlocked ? (
            <div className="mt-3 rounded-xl border border-red-500/50 bg-red-950/50 px-2 py-2 text-center">
              <p className="text-[11px] font-black text-red-300">
                🔴 ارتباط مسدود شد
              </p>
              <p className="mt-1 text-[9px] font-bold text-red-200/70">
                این آگهی برای شما قابل باز شدن نیست.
              </p>
            </div>
          ) : (
            <>
              {listing.boothName && (
                <p className="mt-1 line-clamp-1 text-[9px] font-bold text-yellow-300/80">
                  🏪 {listing.boothName}
                </p>
              )}

              {listing.description && (
                <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-gray-400">
                  {listing.description}
                </p>
              )}

              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="line-clamp-1 text-[10px] font-black text-green-300">
                  {formatPrice(listing)}
                </span>

                {listing.city && (
                  <span className="line-clamp-1 text-[8px] font-bold text-gray-500">
                    📍 {listing.city}
                  </span>
                )}
              </div>

              <div className="mt-2 text-left text-[8px] font-bold text-yellow-300/45">
                مشاهده آگهی ←
              </div>
            </>
          )}

          {isBlocked && (
            <div className="mt-2 flex items-center justify-between gap-1">
              <span className="line-clamp-1 text-[9px] font-black text-gray-400">
                {formatPrice(listing)}
              </span>

              {listing.city && (
                <span className="line-clamp-1 text-[8px] font-bold text-gray-600">
                  📍 {listing.city}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    )

    if (isBlocked) {
      return (
        <div
          key={listing.id}
          className="relative block overflow-hidden rounded-2xl border border-red-500/60 bg-red-950/20 shadow-lg shadow-red-950/20"
        >
          {cardContent}
        </div>
      )
    }

    return (
      <Link
        key={listing.id}
        href={`/marketplace/buyer/listing/${encodeURIComponent(listing.id)}`}
        onClick={(event) => {
          event.preventDefault()

          const link = `/marketplace/buyer/listing/${encodeURIComponent(
            listing.id
          )}`

          const target = event.currentTarget
          target.classList.add("scale-[1.025]", "-translate-y-1")

          window.setTimeout(() => {
            window.location.href = link
          }, 260)
        }}
        className="relative block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-yellow-500/20 hover:bg-white/[0.055]"
      >
        {cardContent}
      </Link>
    )
  };
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-black px-3 py-4 text-white"
    >
      {favoriteMessage && (
        <div className="fixed inset-x-3 top-4 z-50 mx-auto w-fit max-w-[90%] rounded-xl border border-red-500/30 bg-black/90 px-4 py-2.5 text-center text-xs font-bold text-red-300 shadow-lg shadow-red-950/30 backdrop-blur-md">
          {favoriteMessage}
        </div>
      )}

      <div className="mx-auto w-full max-w-[560px]">
        <div className="mb-3 rounded-lg border border-yellow-500/20 bg-white/[0.03] p-2">
          <div className="mt-2 text-center">
              <h1 className="mt-1 text-base font-black text-yellow-300">
                {MARKETPLACE_CATEGORY_LABELS[category as keyof typeof MARKETPLACE_CATEGORY_LABELS] || "📦 سایر"}
              </h1>

            <p className="mt-1 text-xs text-white/50">
                آگهی‌های {MARKETPLACE_CATEGORY_LABELS[category as keyof typeof MARKETPLACE_CATEGORY_LABELS]?.replace(/^[^ ]+ /, "") || "سایر"} بازارچه شهرکار
            </p>
          </div>

          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={`جستجو در ${MARKETPLACE_CATEGORY_LABELS[category as keyof typeof MARKETPLACE_CATEGORY_LABELS]?.replace(/^[^ ]+ /, "") || "سایر"}...`}
            className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white outline-none transition focus:border-yellow-500/50"
          />
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-center text-sm text-white/50">
            در حال دریافت آگهی‌ها...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-950/20 p-5 text-center text-sm font-bold text-red-300">
            دریافت آگهی‌ها با خطا مواجه شد.
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-center">
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">
                آگهی‌های صنایع دستی
              </h2>

              <span className="rounded-2xl border border-yellow-500/40 bg-yellow-950/70 px-3 py-1.5 text-[10px] font-bold text-yellow-300 shadow-lg shadow-yellow-500/20 transition-all hover:scale-105 hover:bg-yellow-900/80">
                {filteredListings.length} آگهی
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {visibleListings.map(renderListingCard)}
            </div>

            {filteredListings.length > 10 && (
              <button
                type="button"
              style={{ position: "absolute", right: "0px", top: "0px" }}
                onClick={() => setShowMore((current) => !current)}
                className="mx-auto mt-2 block rounded-md border border-yellow-500/30 bg-yellow-950/30 px-2 py-1 text-[10px] font-bold text-yellow-300 transition hover:bg-yellow-900/40"
              >
                {showMore ? "کمتر" : "بیشتر"}
              </button>
            )}
          </>
        )}
      </div>
    </main>
  );
}
