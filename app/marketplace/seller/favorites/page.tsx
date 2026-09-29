"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

type Favorite = {
  id: string
  listingId: string
  listingTitle?: string
  listingCategory?: string
  listingDescription?: string
  listingPrice?: number | null
  listingPriceType?: string
  listingCity?: string
  listingImageUrls?: string[]
  sellerUid?: string
  boothId?: string
  boothName?: string
}

export default function SellerFavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    let cancelled = false

    async function loadFavorites() {
      try {
        setLoading(true)
        setError(false)

        const response = await fetch("/api/marketplace/favorites", {
          method: "GET",
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("FAVORITES_API_ERROR")
        }

        const data = await response.json()

        if (!cancelled) {
          setFavorites(Array.isArray(data) ? data : [])
        }
      } catch {
        if (!cancelled) {
          setFavorites([])
          setError(true)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadFavorites()

    return () => {
      cancelled = true
    }
  }, [])

  const removeFavorite = async (listingId: string) => {
    if (removingId) return

    try {
      setRemovingId(listingId)
      setMessage("")

      const response = await fetch("/api/marketplace/favorites", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listingId }),
      })

      if (!response.ok) {
        throw new Error("REMOVE_FAVORITE_ERROR")
      }

      setFavorites((current) =>
        current.filter((favorite) => favorite.listingId !== listingId)
      )

      setMessage("آگهی از پوشه ❤ حذف شد")
    } catch {
      setMessage("حذف آگهی از علاقه‌مندی‌ها انجام نشد. دوباره تلاش کن.")
    } finally {
      setRemovingId(null)
    }
  }

  const formatPrice = (favorite: Favorite) => {
    if (favorite.listingPriceType === "free") {
      return "رایگان"
    }

    if (typeof favorite.listingPrice !== "number") {
      return "قیمت توافقی"
    }

    return `${new Intl.NumberFormat("fa-IR").format(favorite.listingPrice)} تومان`
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-black px-4 py-6 text-white"
    >
      <div className="mx-auto w-full max-w-[520px]">
        <div className="relative overflow-hidden rounded-3xl border-2 border-red-500/40 bg-black px-5 py-5">
          <div className="text-center">
            <div className="text-lg font-black text-red-400">
              ❤️ علاقه‌مندی‌ها
            </div>

            <div className="mx-auto mt-3 h-px w-12 bg-red-500/30" />

            <p className="mt-4 text-xs font-bold text-gray-400">
              آگهی‌هایی که دوست داشتی اینجا قرار می‌گیرند.
            </p>
          </div>

          <div className="mt-6">
            {loading ? (
              <div className="rounded-2xl border border-gray-500/30 bg-gray-950/60 px-4 py-5 text-center">
                <p className="text-sm font-bold text-gray-400">
                  در حال دریافت علاقه‌مندی‌ها...
                </p>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-500/30 bg-red-950/20 px-4 py-5 text-center">
                <p className="text-sm font-bold text-red-300">
                  دریافت علاقه‌مندی‌ها با مشکل مواجه شد.
                </p>

                <p className="mt-2 text-xs font-bold leading-6 text-gray-400">
                  لطفاً چند لحظه بعد دوباره تلاش کن.
                </p>
              </div>
            ) : favorites.length === 0 ? (
              <div className="rounded-2xl border border-gray-500/30 bg-gray-950/60 px-4 py-6 text-center">
                <div className="text-3xl">❤️</div>

                <p className="mt-3 text-sm font-bold text-gray-300">
                  هنوز آگهی‌ای در علاقه‌مندی‌ها نیست.
                </p>

                <Link
                  href="/marketplace/seller/marketplace"
                  className="mt-4 inline-flex rounded-xl border border-red-500/40 bg-red-950/60 px-5 py-2 text-xs font-bold text-red-300 transition-all hover:bg-red-900/70"
                >
                  رفتن به بازارچه
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {favorites.map((favorite) => {
                  const image =
                    Array.isArray(favorite.listingImageUrls) &&
                    favorite.listingImageUrls.length > 0
                      ? favorite.listingImageUrls[0]
                      : null

                  return (
                    <div
                      key={favorite.id}
                      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-xl shadow-black/30"
                    >
                      <Link
                        href={`/marketplace/buyer/listing/${encodeURIComponent(favorite.listingId)}`}
                        className="block"
                      >
                        <div className="flex gap-3 p-3">
                          <div className="relative h-[110px] w-[132px] shrink-0 overflow-hidden rounded-2xl bg-gray-900/90">
                            {image ? (
                              <img
                                src={image}
                                alt={favorite.listingTitle || "آگهی"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-4xl">
                                📦
                              </div>
                            )}

                            <button
                              type="button"
                              aria-label="حذف از علاقه‌مندی‌ها"
                              disabled={removingId === favorite.listingId}
                              onClick={(event) => {
                                event.preventDefault()
                                event.stopPropagation()
                                removeFavorite(favorite.listingId)
                              }}
                              className="absolute right-0 top-0 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-red-500/70 bg-black/75 text-xl leading-none text-red-500 shadow-lg shadow-red-500/30 backdrop-blur-sm transition hover:scale-110"
                            >
                              ❤️
                            </button>
                          </div>

                          <div className="min-w-0 flex-1 py-1">
                            <h2 className="line-clamp-1 text-sm font-black text-yellow-300">
                              {favorite.listingTitle || "بدون عنوان"}
                            </h2>

                            {favorite.boothName && (
                              <p className="mt-1 line-clamp-1 text-[10px] font-bold text-yellow-300">
                                🏪 {favorite.boothName}
                              </p>
                            )}

                            {favorite.listingDescription && (
                              <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-gray-400">
                                {favorite.listingDescription}
                              </p>
                            )}

                            <div className="mt-3 flex items-center justify-between gap-2">
                              <span className="line-clamp-1 text-xs font-black text-green-300">
                                {formatPrice(favorite)}
                              </span>

                              {favorite.listingCity && (
                                <span className="line-clamp-1 text-[9px] font-bold text-gray-500">
                                  📍 {favorite.listingCity}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {message && (
            <div className="mt-4 text-center text-xs font-bold text-green-300">
              {message}
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <Link
              href="/marketplace/seller"
              className="rounded-xl border border-yellow-500/40 bg-yellow-950/50 px-5 py-2 text-xs font-bold text-yellow-300 transition-all hover:bg-yellow-900/70"
            >
              برگشت به پنل فروشنده
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
