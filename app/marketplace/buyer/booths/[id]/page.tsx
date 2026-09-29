"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Booth = {
  id: string;
  boothName: string;
  description: string;
  category: string;
  city: string;
  neighborhood: string;
  logoUrl: string;
};

type Listing = {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number | null;
  priceType: "fixed" | "negotiable" | "free";
  city: string;
  imageUrls: string[];
};

export default function BuyerBoothPage() {
  const params = useParams();
  const router = useRouter();

  const [booth, setBooth] = useState<Booth | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBooth() {
      try {
        const response = await fetch(
          `/api/marketplace/booths/${params.id}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.message || "غرفه پیدا نشد.");
          return;
        }

        setBooth(data.booth);
          setListings(Array.isArray(data.listings) ? data.listings : []);
      } catch {
        setError("ارتباط با سرور برقرار نشد.");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadBooth();
    }
  }, [params.id]);

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-black px-3 py-5 text-white"
      >
        <div className="mx-auto max-w-2xl rounded-2xl border border-yellow-500/20 bg-white/[0.04] p-6 text-center backdrop-blur-md">
          <p className="font-bold text-gray-500">
            در حال دریافت غرفه...
          </p>
        </div>
      </main>
    );
  }

  if (error || !booth) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-black px-3 py-5 text-white"
      >
        <div className="mx-auto max-w-2xl rounded-2xl border border-yellow-500/20 bg-white/[0.04] p-6 text-center">
          <p className="font-bold text-yellow-300">
            {error || "غرفه پیدا نشد."}
          </p>

          <button
            type="button"
            onClick={() => router.push("/marketplace/buyer/booths")}
            className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-2.5 text-sm font-bold text-yellow-300 transition-all hover:bg-green-500/25"
          >
            ← بازگشت به غرفه‌ها
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-black px-3 py-5 text-white"
    >
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-2xl border border-yellow-500/20 bg-white/[0.04] p-4 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-yellow-500/30 bg-black/30 shadow-lg shadow-yellow-500/10">
              {booth.logoUrl ? (
                <img
                  src={booth.logoUrl}
                  alt={booth.boothName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl">🏪</span>
              )}
            </div>

            <h1 className="mt-4 text-xl font-black text-yellow-300">
              {booth.boothName}
            </h1>

            <p className="mt-2 text-sm font-bold text-yellow-300/80">
              🏷️ {booth.category}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              📍 {booth.city}
              {booth.neighborhood
                ? ` — ${booth.neighborhood}`
                : ""}
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-yellow-500/15 bg-black/30 p-4">
            <h2 className="mb-2 text-base font-black text-yellow-300">
              معرفی غرفه
            </h2>

            <p className="whitespace-pre-line text-sm leading-6 text-gray-400">
              {booth.description}
            </p>
          </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-sm font-black text-yellow-300">
                    📦 آگهی‌های غرفه
                  </h2>
                  <span className="text-[10px] text-gray-500">
                    {listings.length} آگهی
                  </span>
                </div>

                {listings.length === 0 ? (
                  <div className="rounded-xl border border-yellow-500/15 bg-white/[0.02] px-3 py-4 text-center">
                    <p className="text-xs font-bold text-gray-500">
                      این غرفه در حال حاضر آگهی فعالی ندارد.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {listings.map((listing) => (
                      <button
                        key={listing.id}
                        type="button"
                        onClick={() =>
                          router.push(
                            `/marketplace/buyer/listing/${listing.id}`
                          )
                        }
                        className="w-full rounded-2xl border border-yellow-500/20 bg-black/40 p-3 text-right shadow-lg shadow-yellow-500/5 transition-all hover:scale-[1.01] hover:border-yellow-500/40"
                      >
                        <div className="flex gap-3">
                          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-yellow-500/20 bg-black/50">
                            {listing.imageUrls?.[0] ? (
                              <img
                                src={listing.imageUrls[0]}
                                alt={listing.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-2xl">
                                📦
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-sm font-black text-yellow-300">
                              {listing.title}
                            </h3>
                            <p className="mt-1 text-xs font-bold text-gray-400">
                              🏷️ {listing.category}
                            </p>
                            <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
                              {listing.description}
                            </p>
                            <p className="mt-2 text-xs font-black text-green-300">
                              {listing.priceType === "free"
                                ? "رایگان"
                                : listing.priceType === "negotiable"
                                  ? "توافقی"
                                  : listing.price !== null
                                    ? `${new Intl.NumberFormat("fa-IR").format(listing.price)} تومان`
                                    : "قیمت اعلام نشده"}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => router.push("/marketplace/buyer/booths")}
              className="rounded-2xl border border-red-500/30 bg-red-950/50 px-7 py-3 font-bold text-yellow-300 transition-all hover:scale-105 hover:bg-yellow-500/20"
            >
              ← بازگشت به غرفه‌ها
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
