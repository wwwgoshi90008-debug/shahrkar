"use client";

import { useEffect, useState } from "react";

type Booth = {
  id: string;
  boothName: string;
  description: string;
  category: string;
  city: string;
  neighborhood: string;
  logoUrl: string;
};

export default function BuyerBoothsPage() {
  const [booths, setBooths] = useState<Booth[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();

        if (query.trim()) {
          params.set("q", query.trim());
        }

        if (city) {
          params.set("city", city);
        }

        const queryString = params.toString();
        const url = queryString
          ? `/api/marketplace/booths?${queryString}`
          : "/api/marketplace/booths";

        const response = await fetch(url, {
          cache: "no-store",
        });

        const data = await response.json();

        if (data.success) {
          setBooths(data.booths || []);
          setCities(data.cities || []);
        } else {
          setBooths([]);
        }
      } catch (error) {
        console.error("Load booths error:", error);
        setBooths([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, city]);


    const filteredBooths = booths;
  return (
    <main className="min-h-screen bg-black px-3 py-5 text-white">
        <div className="mx-auto max-w-4xl rounded-3xl border border-yellow-500/30 bg-white/[0.03] p-4 backdrop-blur-md shadow-lg shadow-yellow-500/10">
        <div className="mb-5 text-center">
          <h1 className="text-2xl font-black text-yellow-300">
            🏪 غرفه‌ها
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            غرفه موردنظرت را پیدا کن
          </p>
        </div>

        <div className="mb-5 space-y-3">
          <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-yellow-300">
                🔎
              </span>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجوی غرفه یا فعالیت..."
              className="w-full rounded-xl border border-yellow-500/30 bg-white/[0.04] py-3 pr-11 pl-4 text-sm text-white outline-none backdrop-blur-md placeholder:text-gray-500 focus:border-yellow-400/70"
            />
          </div>

          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-xl border border-yellow-500/30 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none backdrop-blur-md focus:border-yellow-400/70"
          >
            <option value="" className="bg-black">
              همه شهرها
            </option>

            {cities.map((item) => (
              <option key={item} value={item} className="bg-black">
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-yellow-300">🏪 غرفه‌ها</h2>
            <span className="rounded-2xl border border-yellow-500/40 bg-yellow-950/40 px-3 py-1 text-[11px] font-bold text-yellow-300 shadow-lg shadow-yellow-500/10 transition-all hover:scale-105 hover:bg-yellow-900/40">
            {filteredBooths.length} غرفه
          </span>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-yellow-500/20 bg-white/[0.03] p-10 text-center text-gray-400">
            در حال دریافت غرفه‌ها...
          </div>
        ) : filteredBooths.length === 0 ? (
          <div className="rounded-3xl border border-yellow-500/20 bg-white/[0.03] p-10 text-center text-gray-400">
            غرفه‌ای پیدا نشد.
          </div>
        ) : (
          <div className="mx-auto grid w-full max-w-2xl gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBooths.map((booth) => (
                <a
                  key={booth.id}
                  href={`/marketplace/buyer/booths/${booth.id}`}
                  className="group flex overflow-hidden rounded-xl border border-yellow-500/30 bg-white/[0.04] backdrop-blur-md transition-all hover:-translate-y-1 hover:border-yellow-400/60 hover:bg-white/10"
                >
                  <div className="h-28 w-2/5 shrink-0 overflow-hidden bg-black/40">
                    {booth.logoUrl ? (
                      <img
                        src={booth.logoUrl}
                        alt={booth.boothName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-4xl">🏪</span>
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
                    <div>
                      <h3 className="truncate text-sm font-black text-yellow-300">{booth.boothName}</h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-4 text-gray-400">{booth.description}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-gray-300">📍 {booth.city}</p>
                      <div className="shrink-0 rounded-xl border border-green-500/40 bg-green-950/70 px-3 py-1 text-[11px] font-bold text-green-300">باز کردن ←</div>
                    </div>
                  </div>
                </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
