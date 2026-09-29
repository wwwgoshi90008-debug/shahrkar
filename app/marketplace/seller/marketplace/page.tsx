'use client'
import Link from "next/link";

import { useEffect, useMemo, useState } from 'react'

type Listing = {
  id: string
  sellerUid?: string
  boothId?: string
  boothName?: string
  title?: string
  category?: string
  description?: string
  price?: number | null
  priceType?: string
  city?: string
  imageUrls?: string[]
  isPublished?: boolean
  createdAt?: unknown
}

export default function BuyerPage() {
  const [showMore, setShowMore] = useState(false)
  const [showMoreAds, setShowMoreAds] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [listings, setListings] = useState<Listing[]>([])
  const [loadingListings, setLoadingListings] = useState(true)
  const [listingsError, setListingsError] = useState(false)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [favoriteLoadingId, setFavoriteLoadingId] = useState<string | null>(null)
  const [favoriteMessage, setFavoriteMessage] = useState("")

  useEffect(() => {
    let cancelled = false

    async function loadFavorites() {
      try {
        const response = await fetch("/api/marketplace/favorites", {
          method: "GET",
          cache: "no-store",
        })

        if (!response.ok) return

        const data = await response.json()

        if (!cancelled && Array.isArray(data)) {
          setFavoriteIds(
            new Set(
              data
                .map((item) => item?.listingId)
                .filter((id): id is string => typeof id === "string")
            )
          )
        }
      } catch {
        // خطای علاقه‌مندی نباید مانع نمایش آگهی‌ها شود.
      }
    }

    loadFavorites()

    return () => {
      cancelled = true
    }
  }, [])

  const toggleFavorite = async (listingId: string) => {
    if (favoriteLoadingId) return

    const isFavorite = favoriteIds.has(listingId)

    try {
      setFavoriteLoadingId(listingId)
      setFavoriteMessage("")

      const response = await fetch("/api/marketplace/favorites", {
        method: isFavorite ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listingId }),
      })

      if (!response.ok) {
        throw new Error("FAVORITE_API_ERROR")
      }

      setFavoriteIds((current) => {
        const next = new Set(current)

        if (isFavorite) {
          next.delete(listingId)
        } else {
          next.add(listingId)
        }

        return next
      })

      setFavoriteMessage(
        isFavorite
          ? "آگهی از پوشه ❤ حذف شد"
          : "آگهی به علاقه‌مندی‌ها اضافه شد"
      )
    } catch {
      setFavoriteMessage("عملیات علاقه‌مندی انجام نشد. دوباره تلاش کن.")
    } finally {
      setFavoriteLoadingId(null)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function loadListings() {
      try {
        setLoadingListings(true)
        setListingsError(false)

        const response = await fetch("/api/marketplace/listings", {
          method: "GET",
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("LISTINGS_API_ERROR")
        }

        const data = await response.json()

        if (!Array.isArray(data)) {
          throw new Error("LISTINGS_RESPONSE_ERROR")
        }

        if (!cancelled) {
          setListings(data)
        }
      } catch {
        if (!cancelled) {
          setListings([])
          setListingsError(true)
        }
      } finally {
        if (!cancelled) {
          setLoadingListings(false)
        }
      }
    }

    loadListings()

    return () => {
      cancelled = true
    }
  }, [])

  const filteredListings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return listings.filter((listing) => {
      const categoryMatch =
        !selectedCategory || listing.category === selectedCategory

      if (!categoryMatch) {
        return false
      }

      if (!query) {
        return true
      }

      const searchableText = [
        listing.title,
        listing.description,
        listing.city,
        listing.boothName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return searchableText.includes(query)
    })
  }, [listings, selectedCategory, searchQuery])

  const formatPrice = (listing: Listing) => {
    if (listing.priceType === "free") {
      return "رایگان"
    }

    if (typeof listing.price !== "number") {
      return "قیمت توافقی"
    }

    return `${new Intl.NumberFormat("fa-IR").format(listing.price)} تومان`
  }

  const renderListingCard = (listing: Listing) => {
    const image =
      Array.isArray(listing.imageUrls) && listing.imageUrls.length > 0
        ? listing.imageUrls[0]
        : null

    const isFavorite = favoriteIds.has(listing.id)

    return (
      <Link
        key={listing.id}
        href={`/marketplace/buyer/listing/${encodeURIComponent(listing.id)}`}
        className="relative block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-yellow-500/20 hover:bg-white/[0.055]"
      >
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
              style={{ position: "absolute", right: "0px", top: "0px" }}
              aria-label={
                isFavorite
                  ? "حذف از علاقه‌مندی‌ها"
                  : "افزودن به علاقه‌مندی‌ها"
              }
              disabled={favoriteLoadingId === listing.id}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                toggleFavorite(listing.id)
              }}
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
          <div className="min-w-0 flex-1 px-3 py-3 text-right">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-2 text-sm font-black leading-5 text-white">
                {listing.title || "بدون عنوان"}
              </h3>

              {listing.category && (
                <span className="shrink-0 rounded-lg border border-yellow-500/20 bg-yellow-500/[0.06] px-1.5 py-1 text-[8px] font-bold text-yellow-300">
                  {listing.category}
                </span>
              )}
            </div>

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
          </div>
        </div>
      </Link>
    )
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-black px-4 py-6 text-white"
    >
      <div className="mx-auto w-full max-w-[520px]">
        {/* قاب اصلی */}
        <div
          className="
            relative
            overflow-hidden
            rounded-3xl
            border-2 border-yellow-500/50
            bg-black
            px-6 py-3
            shadow-none
          "
        >

          {/* عنوان */}
          <div className="relative text-center">
            <div className="text-lg font-black tracking-[0.12em] text-yellow-300">
              <span className="animate-buyer-blink text-yellow-300">🛍️ بازارچه ی شهر کار</span>
            </div>

            <div className="mx-auto mt-3 h-px w-12 bg-yellow-500/30" />

            <p className="mt-4 text-xs text-white/45">
              جستجو و انتخاب از بازار شهرکار
            </p>
          </div>

          {/* معرفی */}
          <div className="relative mt-9 text-center">
            <h1 className="text-xl font-black text-white">
              دنبال چی می‌گردی؟
            </h1>

            <p className="mx-auto mt-3 max-w-[300px] text-sm font-bold leading-7 text-gray-300">
              آگهی‌ها، کالاها و خدمات مورد نیازت را پیدا کن.
            </p>
          </div>

          {/* جستجو */}
          <div className="relative mt-8">
            <div
              className="
                flex items-center
                rounded-2xl
                border border-gray-500/40
                bg-gray-950/70
                px-4 py-3
              "
            >
              <span className="ml-3 text-lg text-gray-500">
                🔎
              </span>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو در آگهی‌ها..."
                className="
                  w-full
                  bg-transparent
                  text-right
                  text-sm
                  font-medium
                  text-white
                  outline-none
                  placeholder:text-gray-600
                "
              />
            </div>
          </div>

          <div className="relative mt-6 flex justify-center">
            <a
              href="/marketplace/buyer/booths"
              className="rounded-2xl border border-green-500/40 bg-green-950/70 px-8 py-3 font-bold text-green-300 shadow-lg shadow-green-500/20 transition-all hover:scale-105 hover:bg-green-900/80"
            >
              🏪 غرفه‌ها
            </a>
          </div>

          {/* دسته‌بندی */}
          <div className="relative mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-black text-yellow-300">
                دسته‌بندی‌ها
              </h2>

              <span className="text-[10px] text-gray-500">
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ["🎨 صنایع دستی", "handmade"],
                ["💄 زیبایی و بهداشت", "beauty"],
                ["💻 خدمات دیجیتال", "digital"],
                ["♻️ کالای دسته دوم", "used"],
                ["🏠 خانه و ملک", "home"],
                ["🚗 ماشین", "car"],
              ].map(([label, value]) => (
                <button
                  key={value}
                    onClick={() => {
                      window.location.href = `/marketplace/buyer/category/${value}`;
                    }}
                  className={
                    selectedCategory === value
                      ? "scale-105 rounded-2xl border border-green-500/40 bg-green-950/70 px-4 py-4 text-sm font-bold text-green-300 shadow-lg shadow-green-500/20 transition-all hover:bg-green-900/80"
                      : "rounded-2xl border border-gray-500/40 bg-gray-950/70 px-4 py-4 text-sm font-bold text-gray-300 transition-all hover:scale-105 hover:bg-gray-900/80"
                  }
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setShowMore(!showMore)}
                className={
                  showMore
                    ? "rounded-xl border border-amber-500/40 bg-amber-950/70 px-4 py-2 text-xs font-bold text-amber-300 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 hover:bg-amber-900/80"
                    : "rounded-xl border border-yellow-500/40 bg-yellow-950/70 px-4 py-2 text-xs font-bold text-yellow-300 shadow-lg shadow-yellow-500/20 transition-all hover:scale-105 hover:bg-yellow-900/80"
                }
              >
                {showMore ? "کمتر" : "بیشتر"}
              </button>
            </div>

            {showMore && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  ["👕 پوشاک و مد", "fashion"],
                  ["🪑 لوازم خانه", "furniture"],
                  ["🧸 نرم‌افزار و اسباب‌بازی", "kids"],
                  ["🌱 کشاورزی و باغبانی", "garden"],
                  ["📚 کتاب و آموزش", "books"],
                  ["🔧 تعمیرات و خدمات فنی", "repairs"],
                  ["🧹 خدمات منزل", "home_services"],
                  ["🎵 موسیقی و ساز", "music"],
                  ["⚽ ورزش و سرگرمی", "sports"],
                  ["📦 سایر", "other"],
                ].map(([label, value]) => (
                  <button
                    key={value}
                      onClick={() => {
                        window.location.href = `/marketplace/buyer/category/${value}`;
                      }}
                      className={
                        selectedCategory === value
                          ? "scale-105 rounded-2xl border border-green-500/40 bg-green-950/70 px-4 py-4 text-sm font-bold text-green-300 shadow-lg shadow-green-500/20 transition-all hover:bg-green-900/80"
                          : "rounded-2xl border border-gray-500/40 bg-gray-950/70 px-4 py-4 text-sm font-bold text-gray-300 transition-all hover:scale-105 hover:bg-gray-900/80"
                      }
                    >
                      {label}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* آگهی‌های جدید */}
          <div className="relative mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-black text-yellow-300">
                آگهی‌های جدید
              </h2>

              <button
                  onClick={() => setShowMoreAds(!showMoreAds)}
                  className={
                    showMoreAds
                      ? "rounded-xl border border-amber-500/40 bg-amber-950/70 px-4 py-2 text-xs font-bold text-amber-300 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 hover:bg-amber-900/80"
                      : "rounded-xl border border-yellow-500/40 bg-yellow-950/70 px-4 py-2 text-xs font-bold text-yellow-300 shadow-lg shadow-yellow-500/20 transition-all hover:scale-105 hover:bg-yellow-900/80"
                  }
                >
                  {showMoreAds ? "کمتر" : "بیشتر"}
                </button>
              </div>

            <div className="grid grid-cols-1 gap-3">
              {loadingListings ? (
                <div className="rounded-2xl border border-gray-500/30 bg-gray-950/60 px-4 py-4">
                  <p className="text-sm font-bold text-gray-400">
                    در حال دریافت آگهی‌ها...
                  </p>
                </div>
              ) : listingsError ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-950/20 px-4 py-4">
                  <p className="text-sm font-bold text-red-300">
                    دریافت آگهی‌ها با مشکل مواجه شد.
                  </p>
                  <p className="mt-2 text-[13px] font-bold leading-6 text-gray-400">
                    لطفاً چند لحظه بعد دوباره تلاش کن.
                  </p>
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="rounded-2xl border border-gray-500/30 bg-gray-950/60 px-4 py-4">
                  <p className="text-sm font-bold text-gray-300">
                    {selectedCategory || searchQuery
                      ? "آگهی‌ای مطابق جستجو پیدا نشد."
                      : "هنوز آگهی‌ای برای نمایش وجود ندارد."}
                  </p>

                  <p className="mt-2 text-[13px] font-bold leading-6 text-green-300">
                    به‌محض ثبت آگهی جدید توسط فروشندگان، جدیدترین آگهی‌ها اینجا نمایش داده می‌شوند.
                  </p>
                </div>
              ) : (
                filteredListings
                  .slice(0, showMoreAds ? filteredListings.length : 3)
                  .map(renderListingCard)
              )}
            </div>

            {favoriteMessage && (
              <div className="mt-3 text-center text-xs font-bold text-green-300">
                {favoriteMessage}
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  )
}
