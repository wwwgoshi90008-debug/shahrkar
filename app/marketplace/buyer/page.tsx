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
    blockedForCurrentBuyer?: boolean
}

export default function BuyerPage() {
  const [showMoreAds, setShowMoreAds] = useState(false)
  const [showMoreCategories, setShowMoreCategories] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [listings, setListings] = useState<Listing[]>([])
  const [loadingListings, setLoadingListings] = useState(true)
  const [listingsError, setListingsError] = useState(false)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [favoriteLoadingId, setFavoriteLoadingId] = useState("")
  const [favoriteMessage, setFavoriteMessage] = useState("")
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  useEffect(() => {
    let active = true

    const loadUnreadNotifications = async () => {
      try {
        const res = await fetch("/api/marketplace/notifications", {
          cache: "no-store",
        })
        if (!res.ok) return

        const data = await res.json()
        if (!active) return

        const count = Array.isArray(data?.notifications)
          ? data.notifications.filter((item: any) => !item?.bellRead).length
          : 0

        setUnreadNotifications(count)
      } catch {
        // اعلان‌ها نباید باعث اختلال در پنل خریدار شوند.
      }
    }

    loadUnreadNotifications()
    const timer = window.setInterval(loadUnreadNotifications, 10000)

    const handleNotificationsUpdated = () => {
      if (active) {
        setUnreadNotifications(0)
      }
    }

    window.addEventListener(
      "marketplace-notifications-updated",
      handleNotificationsUpdated
    )

    return () => {
      active = false
      window.clearInterval(timer)
      window.removeEventListener(
        "marketplace-notifications-updated",
        handleNotificationsUpdated
      )
    }
  }, [])


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

  useEffect(() => {
    let cancelled = false

    async function loadFavorites() {
      try {
        const response = await fetch("/api/marketplace/favorites", {
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
        // خطای علاقه‌مندی نباید نمایش آگهی‌ها را مختل کند
      }
    }

    loadFavorites()

    return () => {
      cancelled = true
    }
  }, [])

  async function toggleFavorite(listingId: string) {
    if (favoriteLoadingId === listingId) return

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

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || "FAVORITE_TOGGLE_FAILED")
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

      window.setTimeout(() => {
        setFavoriteMessage("")
      }, 2200)
    } catch {
      setFavoriteMessage("تغییر علاقه‌مندی آگهی انجام نشد.")

      window.setTimeout(() => {
        setFavoriteMessage("")
      }, 2200)
    } finally {
      setFavoriteLoadingId("")
    }
  }

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
            className={`!absolute !right-2 !left-auto !top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border bg-black/75 text-xl leading-none backdrop-blur-sm transition ${
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
  }

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-[#050505] px-4 py-6 text-white"
    >
              {/* پس‌زمینه هماهنگ با صفحه اصلی */}
        <div className="pointer-events-none fixed -right-32 -top-32 z-0 h-80 w-80 rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="pointer-events-none fixed -bottom-32 -left-32 z-0 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

        <style>{`
          @keyframes buyerNotificationFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          .buyer-notification-float {
            animation: buyerNotificationFloat 4s ease-in-out infinite;
          }
        `}</style>
<Link
        href="/marketplace/buyer/notifications"
        aria-label="اعلان‌ها"
        className="fixed left-5 top-8 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-red-500/40 bg-red-950/70 font-bold text-red-300 text-xl shadow-lg shadow-red-500/20 backdrop-blur-md transition-all hover:scale-105 hover:bg-red-900/80 buyer-notification-float"
      >
        🔔
        {unreadNotifications > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border border-black bg-red-600 px-1 text-[9px] font-black text-white">
            {unreadNotifications > 99 ? "99+" : unreadNotifications}
          </span>
        )}
      </Link>
      {favoriteMessage && (
        <div className="fixed inset-x-3 top-4 z-50 mx-auto w-fit max-w-[90%] rounded-xl border border-red-500/30 bg-black/90 px-4 py-2.5 text-center text-xs font-bold text-red-300 shadow-lg shadow-red-950/30 backdrop-blur-md">
          {favoriteMessage}
        </div>
      )}
      <div className="relative z-10 mx-auto w-full max-w-[520px]">
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
            <div className="text-xl font-black tracking-[0.12em] text-yellow-300">
              <span className="mr-2 inline-block text-yellow-300">💰</span>
              <span className="animate-buyer-blink text-yellow-300">خریدارم</span>
            </div>

            <div className="mx-auto mt-2 h-px w-14 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />

            <p className="mt-2 text-xs text-white/45">
              جستجو و انتخاب از بازار شهرکار
            </p>
          </div>

          {/* مسیر فروشندگی */}

            <div className="relative mt-4 flex justify-center">
            <a
              href="/marketplace/register"
              className="animate-buyer-blink rounded-2xl border border-yellow-500/35 bg-yellow-500/[0.08] px-4 py-2 text-[11px] font-bold text-yellow-300 shadow-lg shadow-yellow-500/10 transition-all hover:scale-105 hover:bg-yellow-900/40"
            >
              ✨ می‌خواهم فروشنده بشم
            </a>
          </div>

          {/* معرفی */}
          <div className="relative mt-7 text-center">
            <h1 className="text-lg font-black text-white">
              دنبال چی می‌گردی؟
            </h1>

            <p className="mx-auto mt-2 max-w-[300px] text-xs font-bold leading-6 text-gray-300">
              آگهی‌ها، کالاها و خدمات مورد نیازت را پیدا کن.
            </p>
          </div>

          {/* جستجو */}
          <div className="relative mt-5 mb-4">
            <div
              className="
                flex items-center
                rounded-2xl
                border border-gray-500/40
                bg-gray-950/70
                px-4 py-2.5
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

          <div className="mb-5 grid grid-cols-2 gap-2.5">
              <a
                href="/marketplace/buyer/profile"
                className="rounded-2xl border border-yellow-500/40 bg-yellow-950/70 px-2 py-2.5 text-center text-[10px] font-bold text-yellow-300 shadow-lg shadow-yellow-500/20 transition-all hover:scale-105 hover:bg-yellow-900/80"
              >
                <div className="text-3xl mb-2 leading-none [text-shadow:0_3px_2px_rgba(255,255,255,0.18),0_7px_12px_rgba(0,0,0,0.85)] [filter:drop-shadow(0_3px_3px_rgba(255,255,255,0.12))]">👤</div>
                پروفایل
              </a>
            <a
              href="/marketplace/buyer/booths"
              className="rounded-2xl border border-gray-500/40 bg-gray-950/70 px-2 py-2.5 text-center text-[10px] font-bold text-gray-200 shadow-lg shadow-white/20 transition-all hover:scale-105 hover:bg-gray-900/80"
            >
              <div className="text-3xl mb-2 leading-none [text-shadow:0_3px_2px_rgba(255,255,255,0.18),0_7px_12px_rgba(0,0,0,0.85)] [filter:drop-shadow(0_3px_3px_rgba(255,255,255,0.12))]">🏪</div>
              غرفه‌ها
            </a>

            <a
              href="/marketplace/buyer/purchase-requests"
              className="rounded-2xl border border-gray-400/30 bg-white/[0.06] px-2 py-2.5 text-center text-[10px] font-bold text-gray-200 shadow-lg shadow-white/20 transition-all hover:scale-105 hover:bg-white/[0.10]"
            >
              <div className="text-3xl mb-2 leading-none [text-shadow:0_3px_2px_rgba(255,255,255,0.18),0_7px_12px_rgba(0,0,0,0.85)] [filter:drop-shadow(0_3px_3px_rgba(255,255,255,0.12))]">🛒</div>
              درخواست‌های خرید
            </a>

            <a
              href="/marketplace/buyer/favorites"
              className="rounded-2xl border border-gray-400/30 bg-white/[0.06] px-2 py-2.5 text-center text-[10px] font-bold text-white shadow-lg shadow-white/10 transition-all hover:scale-105 hover:bg-white/[0.10]"
            >
              <div className="text-3xl mb-2 leading-none [text-shadow:0_3px_2px_rgba(255,255,255,0.18),0_7px_12px_rgba(0,0,0,0.85)] [filter:drop-shadow(0_3px_3px_rgba(255,255,255,0.12))]">❤️</div>
              علاقه‌مندی‌ها
            </a>
          </div>

          {/* دسته‌بندی */}
          <div className="relative mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-black text-yellow-300">
                دسته‌بندی‌ها
              </h2>

              <span className="text-[10px] text-gray-500">
              </span>
            </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  ["🎨 صنایع دستی", "handmade"],
                  ["💄 زیبایی و بهداشت", "beauty"],
                  ["💎 زیور آلات تزئینی", "jewelry"],
                  ["💻 خدمات دیجیتال", "digital"],
                  ["♻️ کالای دسته دوم", "used"],
                  ["🏠 خانه و ملک", "home"],
                  ["🚗 ماشین", "car"],
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
                  ["🎮 گیمینگ", "gaming"],
                ].slice(0, showMoreCategories ? undefined : 9).map(([label, value]) => (
                  <button
                    key={value}
                    onClick={() => {
                      window.location.href = `/marketplace/buyer/category/${value}`;
                    }}
                    className={
                      selectedCategory === value
                        ? "scale-105 rounded-2xl border border-white/40 bg-gray-800/70 px-2 py-2.5 text-center text-[10px] font-bold text-white shadow-lg shadow-white/10 transition-all hover:bg-gray-700/80"
                        : "rounded-2xl border border-gray-400/30 bg-white/[0.06] px-2 py-2.5 text-center text-[10px] font-bold text-white shadow-lg shadow-white/10 transition-all hover:scale-105 hover:bg-white/[0.10]"
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowMoreCategories(!showMoreCategories)}
                  className={
                    showMoreCategories
                      ? "rounded-xl border border-amber-500/40 bg-amber-950/70 px-4 py-2 text-xs font-bold text-amber-300 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 hover:bg-amber-900/80"
                      : "rounded-xl border border-yellow-500/40 bg-yellow-950/70 px-4 py-2 text-xs font-bold text-yellow-300 shadow-lg shadow-yellow-500/20 transition-all hover:scale-105 hover:bg-yellow-900/80"
                  }
                >
                  {showMoreCategories ? "کمتر" : "بیشتر"}
                </button>
              </div>

            
          </div>

          {/* آگهی‌های جدید */}
          <div className="relative mt-6">
            <div className="mb-3 flex items-center justify-between">
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
          </div>

        </div>
      </div>
    </main>
  )
}
