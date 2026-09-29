"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MarketplaceSellerPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedFeature, setSelectedFeature] = useState("");
  const [listingWarning, setListingWarning] = useState(false);
  const [warningFeature, setWarningFeature] = useState<string | null>(null);
  const router = useRouter();
  const [notifications, setNotifications] = useState<
    {
      id: string;
      title?: string;
      text?: string;
      createdAt?: string | number;
      seen?: boolean;
      bellRead?: boolean;
      type?: string;
      chatId?: string;
      requestId?: string;
    }[]
  >([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  async function loadNotifications() {
    try {
      const response = await fetch("/api/marketplace/notifications", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("NOTIFICATIONS_FETCH_FAILED");
      }

      const data = await response.json();

      setNotifications(
        Array.isArray(data?.notifications) ? data.notifications : []
      );
    } catch {
      // در صورت خطای موقت، تعداد قبلی اعلان‌ها حفظ می‌شود.
    } finally {
      setNotificationsLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();

    const timer = window.setInterval(() => {
      loadNotifications();
    }, 10000);

    const handleNotificationsUpdated = () => {
      setNotifications((items) =>
        items.map((item) => ({
          ...item,
          bellRead: true,
          seen: true,
        }))
      );
    };

    window.addEventListener(
      "marketplace-notifications-updated",
      handleNotificationsUpdated
    );

    return () => {
      window.clearInterval(timer);
      window.removeEventListener(
        "marketplace-notifications-updated",
        handleNotificationsUpdated
      );
    };
  }, []);

  async function handleFeatureClick(feature: string, action?: () => void) {
    setSelectedFeature(feature);
    setWarningFeature(null);

    if (feature === "booth") {
      window.setTimeout(() => {
        action?.();
      }, 180);
      return;
    }

    try {
      const response = await fetch("/api/marketplace/seller/booth", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data?.error || "امکان بررسی غرفه وجود ندارد.");
        return;
      }

      if (!data?.exists) {
        setSelectedFeature("");
        setWarningFeature(feature);

        window.setTimeout(() => {
          setWarningFeature((current) =>
            current === feature ? null : current
          );
        }, 4000);

        return;
      }

      window.setTimeout(() => {
        action?.();
      }, 180);
    } catch {
      setMessage("❌ ارتباط با سرور برای بررسی غرفه برقرار نشد.");
    }
  }

  async function handleListingClick() {
    setSelectedFeature("listing");
    setMessage("");
    setListingWarning(false);

    try {
      const response = await fetch("/api/marketplace/seller/booth", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data?.error || "امکان بررسی غرفه وجود ندارد.");
        return;
      }

      if (!data?.exists) {
        setListingWarning(true);

        window.setTimeout(() => {
          setListingWarning(false);
        }, 6000);

        return;
      }

      router.push("/marketplace/seller/listing");
    } catch {
      setMessage("❌ ارتباط با سرور برای بررسی غرفه برقرار نشد.");
    }
  }

  async function becomeSeller() {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch("/api/marketplace/seller/become", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "خطایی رخ داد.");
        return;
      }

      setMessage(data.message || "حساب فروشنده فعال شد.");
    } catch {
      setMessage("ارتباط با سرور برقرار نشد.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-black px-4 py-6 text-white"
    >
      <div className="mx-auto w-full max-w-[520px]">
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
              <div className="flex items-center justify-center gap-2 text-lg font-black tracking-[0.12em] text-yellow-300">
                <span className="relative inline-flex h-9 w-10 items-center justify-center [perspective:500px]">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-0 left-1/2 h-1.5 w-7 -translate-x-1/2 translate-y-1 rounded-full bg-black/80 blur-[3px]"
                  />
                  <span
                    className="
                      relative z-10 inline-block
                      [transform:perspective(500px)_rotateX(9deg)_rotateY(-5deg)_translateY(-2px)_translateZ(12px)]
                      [transform-style:preserve-3d]
                      [text-shadow:0_1px_0_rgba(255,255,255,0.35),1px_2px_0_rgba(0,0,0,0.98),2px_4px_0_rgba(0,0,0,0.88),3px_6px_0_rgba(0,0,0,0.65),0_8px_10px_rgba(0,0,0,0.65),0_0_9px_rgba(250,204,21,0.4)]
                      transition-all duration-300
                      hover:-translate-y-1 hover:scale-125
                      hover:[transform:perspective(500px)_rotateX(4deg)_rotateY(-3deg)_translateY(-4px)_translateZ(20px)]
                    "
                  >
                    🏪
                  </span>
                </span>
                <span className="animate-pulse">فروشنده‌ام</span>
              </div>

              <div className="mx-auto mt-3 h-px w-12 bg-yellow-500/30" />

              <div className="mx-auto mt-5 max-w-[390px] text-center font-bold leading-8 text-green-300">
                <p className="text-sm">
                  بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِیمِ
                </p>

                <p className="mt-2 text-sm">
                  اللَّهُمَّ ارْزُقْنِی رِزْقًا حَلَالًا وَاسِعًا،
                </p>

                <p className="mt-2 text-sm">
                  وَبَارِکْ لِی فِی کَسْبِی وَعَمَلِی،
                </p>

                <p className="mt-2 text-sm">
                  وَاجْعَلْ فِیهِ خَیْرًا وَبَرَکَةً
                </p>

                <div className="mt-5 text-[#F2E8D5]">
                  ــــــــــــــــــــــــــــــــــــــــــــــ
                </div>

                <p className="mt-3 whitespace-nowrap text-xs font-extrabold text-white">
                  «با توکل شروع کن، با تلاش بساز، با برکت ادامه بده.»
                </p>
              </div>
          </div>

          {/* معرفی */}
          <div className="relative mt-8 text-center">
            <div className="relative mx-auto h-28 w-28 [perspective:900px] [transform-style:preserve-3d]">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 bottom-1 h-4 w-24 -translate-x-1/2 rounded-full bg-black/85 blur-md"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 bottom-2 h-2 w-20 -translate-x-1/2 rounded-full bg-black/70 blur-[3px]"
                />

                <div
                  className="
                    relative z-10
                    mx-auto flex h-20 w-20
                    items-center justify-center
                    rounded-3xl
                    border border-yellow-400/60
                    bg-gradient-to-br from-yellow-300/25 via-yellow-950/80 to-black
                    text-4xl
                    shadow-[inset_0_1px_2px_rgba(255,255,255,0.45),inset_2px_2px_8px_rgba(255,255,255,0.08),inset_0_-9px_14px_rgba(0,0,0,0.8),0_4px_0_rgba(91,55,0,0.95),0_7px_0_rgba(40,24,0,0.9),0_13px_18px_rgba(0,0,0,0.75),0_0_18px_rgba(250,204,21,0.22)]
                    [transform:perspective(900px)_rotateX(9deg)_rotateY(-5deg)_translateZ(14px)]
                    [transform-style:preserve-3d]
                    transition-all duration-300
                    hover:-translate-y-2
                    hover:scale-110
                    hover:[transform:perspective(900px)_rotateX(4deg)_rotateY(-3deg)_translateZ(28px)]
                  "
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 right-3 top-2 h-3 rounded-full bg-white/15 blur-sm"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-2 left-3 h-2 w-8 rounded-full bg-yellow-300/10 blur-md"
                  />
                  <span
                    className="
                      relative z-10 inline-block
                      [transform:translateZ(22px)_rotateX(-2deg)]
                      [text-shadow:0_1px_0_rgba(255,255,255,0.35),1px_2px_0_rgba(0,0,0,0.98),2px_4px_0_rgba(0,0,0,0.9),3px_6px_0_rgba(0,0,0,0.72),4px_8px_0_rgba(0,0,0,0.5),0_11px_13px_rgba(0,0,0,0.55),0_0_11px_rgba(250,204,21,0.35)]
                    "
                  >
                    🏪
                  </span>
                </div>
              </div>

            <h1 className="mt-6 text-xl font-black text-white">
              فروشنده بازارچه شو
            </h1>

            <p className="mx-auto mt-3 max-w-[330px] text-sm font-bold leading-7 text-gray-300">
              غرفه خودت را در بازارچه شهرکار بساز،
              محصولات و خدماتت را معرفی کن
              و آگهی‌هایت را مدیریت کن.
            </p>
          </div>

              {/* اعلان‌ها */}
              <div className="relative mt-7 flex flex-col items-center">
                <button
                  type="button"
                  aria-label="اعلان‌ها"
                  onClick={() => router.push("/marketplace/seller/notifications")}
                  className="relative flex h-12 w-12 items-center justify-center rounded-full border border-yellow-500/40 bg-yellow-950/50 text-2xl shadow-lg shadow-yellow-500/20 transition-all hover:scale-105 hover:bg-yellow-900/70 animate-bounce"
                >
                  🔔
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-black bg-red-600 px-1 text-[10px] font-extrabold leading-none text-white">
                    {notifications.filter((item) => !item.bellRead).length}
                  </span>
                </button>
              </div>

              {/* امکانات */}
              <div className="relative mt-7 grid grid-cols-3 gap-2">
                <button
                  type="button"
                 onClick={() => handleFeatureClick("profile", () => router.push("/marketplace/seller/profile"))}
                  className={`relative transition-all duration-300 ${warningFeature === "profile" ? "-translate-y-10 border-red-500/70 bg-red-950/80 text-red-200 shadow-red-500/50 animate-pulse" : ""} rounded-2xl border px-2 py-3 text-center font-bold shadow-lg transition-all hover:scale-105 ${
                    selectedFeature === "profile"
                      ? "border-green-500/40 bg-green-950/70 text-green-300 shadow-green-500/20"
                      : "border-white/10 bg-white/[0.05] text-yellow-200/70 shadow-black/20 hover:bg-white/[0.08]"
                  }`}
                >
                  <div className="relative mx-auto h-10 w-12 [perspective:260px] [transform-style:preserve-3d]">
  <span className="pointer-events-none absolute left-1/2 bottom-0 h-2 w-9 -translate-x-1/2 translate-y-1 rounded-full bg-black/80 blur-[5px] transition-all duration-300" />
  <span className="pointer-events-none absolute left-1/2 bottom-0 h-1.5 w-7 -translate-x-1/2 translate-y-0.5 rounded-full bg-black/60 blur-[2px]" />
  <span className="relative z-10 inline-block text-lg
    [transform:perspective(260px)_rotateX(10deg)_rotateY(-2deg)_translateY(-3px)_translateZ(10px)]
    [transform-style:preserve-3d]
    [text-shadow:0_1px_0_rgba(255,255,255,0.3),1px_1px_0_rgba(255,255,255,0.12),1px_3px_0_rgba(0,0,0,0.95),2px_5px_0_rgba(0,0,0,0.82),3px_6px_0_rgba(0,0,0,0.65),0_8px_10px_rgba(0,0,0,0.55),0_0_9px_rgba(250,204,21,0.32)]
    transition-all duration-300
    hover:-translate-y-1 hover:scale-125
    hover:[transform:perspective(260px)_rotateX(5deg)_rotateY(-2deg)_translateY(-5px)_translateZ(18px)]
    hover:[text-shadow:0_1px_0_rgba(255,255,255,0.4),1px_3px_0_rgba(0,0,0,0.95),2px_5px_0_rgba(0,0,0,0.85),3px_7px_0_rgba(0,0,0,0.7),0_11px_14px_rgba(0,0,0,0.6),0_0_12px_rgba(250,204,21,0.4)]">👤</span>
</div>
                  <p className={`mt-1 text-[10px] font-extrabold ${
                    selectedFeature === "profile" ? "text-green-300" : "text-yellow-200/70"
                  }`}>
                    پروفایل
                  </p>
                
                    {warningFeature === "profile" && (
                      <span className="absolute bottom-full left-1/2 z-30 mb-3 w-max max-w-[220px] -translate-x-1/2 rounded-xl border border-yellow-400/50 bg-black px-4 py-2 text-center text-xs font-extrabold text-white shadow-lg shadow-yellow-500/20">
                        ⚠️ ابتدا باید غرفه خود را بسازید. 🏪
                      </span>
                    )}
                </button>

                <button
                  type="button"
                  onClick={() => handleFeatureClick("booth", () => router.push("/marketplace/seller/booth"))}
                  className={`rounded-2xl border px-2 py-3 text-center font-bold shadow-lg transition-all hover:scale-105 ${
                    selectedFeature === "booth"
                      ? "border-green-500/40 bg-green-950/70 text-green-300 shadow-green-500/20"
                      : "border-white/10 bg-white/[0.05] text-yellow-200/70 shadow-black/20 hover:bg-white/[0.08]"
                  }`}
                >
                  <div className="relative mx-auto h-10 w-12 [perspective:260px] [transform-style:preserve-3d]">
  <span className="pointer-events-none absolute left-1/2 bottom-0 h-2 w-9 -translate-x-1/2 translate-y-1 rounded-full bg-black/80 blur-[5px] transition-all duration-300" />
  <span className="pointer-events-none absolute left-1/2 bottom-0 h-1.5 w-7 -translate-x-1/2 translate-y-0.5 rounded-full bg-black/60 blur-[2px]" />
  <span className="relative z-10 inline-block text-lg
    [transform:perspective(260px)_rotateX(10deg)_rotateY(-2deg)_translateY(-3px)_translateZ(10px)]
    [transform-style:preserve-3d]
    [text-shadow:0_1px_0_rgba(255,255,255,0.3),1px_1px_0_rgba(255,255,255,0.12),1px_3px_0_rgba(0,0,0,0.95),2px_5px_0_rgba(0,0,0,0.82),3px_6px_0_rgba(0,0,0,0.65),0_8px_10px_rgba(0,0,0,0.55),0_0_9px_rgba(250,204,21,0.32)]
    transition-all duration-300
    hover:-translate-y-1 hover:scale-125
    hover:[transform:perspective(260px)_rotateX(5deg)_rotateY(-2deg)_translateY(-5px)_translateZ(18px)]
    hover:[text-shadow:0_1px_0_rgba(255,255,255,0.4),1px_3px_0_rgba(0,0,0,0.95),2px_5px_0_rgba(0,0,0,0.85),3px_7px_0_rgba(0,0,0,0.7),0_11px_14px_rgba(0,0,0,0.6),0_0_12px_rgba(250,204,21,0.4)]">🏪</span>
</div>
                  <p className={`mt-1 text-[10px] font-extrabold ${
                    selectedFeature === "booth" ? "text-green-300" : "text-yellow-200/70"
                  }`}>
                    ساخت غرفه
                  </p>
                </button>

                <div className={`relative w-full h-full transition-all duration-300 ${
                  listingWarning ? "-translate-y-10" : ""
                }`}>
                  {listingWarning && (
                    <>
                      <div className="pointer-events-none absolute -inset-3 rounded-2xl bg-red-500/30 blur-xl animate-pulse" />
                      <div className="pointer-events-none absolute inset-0 overflow-visible">
                        <span className="absolute left-1/2 bottom-0 h-5 w-12 -translate-x-1/2 translate-y-1/2 rounded-full bg-red-500/50 blur-md animate-pulse" />
                        <span className="absolute left-1/4 bottom-0 h-3 w-3 rounded-full bg-red-400/60 blur-sm animate-ping" />
                        <span className="absolute right-1/4 bottom-0 h-3 w-3 rounded-full bg-red-300/60 blur-sm animate-pulse" />
                      </div>
                      <div className="absolute bottom-full left-1/2 z-30 mb-3 w-max max-w-[220px] -translate-x-1/2 rounded-xl border border-yellow-400/50 bg-black px-4 py-2 text-center text-xs font-extrabold text-white shadow-lg shadow-yellow-500/20">
                        ❌ ابتدا باید غرفه خود را بسازید. 🏪
                      </div>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={handleListingClick}
                    className={`relative z-10 w-full h-full rounded-2xl border px-2 py-3 text-center font-bold shadow-lg transition-all hover:scale-105 ${
                    selectedFeature === "listing"
                      ? "border-green-500/40 bg-green-950/70 text-green-300 shadow-green-500/20"
                      : "border-white/10 bg-white/[0.05] text-yellow-200/70 shadow-black/20 hover:bg-white/[0.08]"
                  }`}
                >
                  <div className="relative mx-auto h-10 w-12 [perspective:260px] [transform-style:preserve-3d]">
  <span className="pointer-events-none absolute left-1/2 bottom-0 h-2 w-9 -translate-x-1/2 translate-y-1 rounded-full bg-black/80 blur-[5px] transition-all duration-300" />
  <span className="pointer-events-none absolute left-1/2 bottom-0 h-1.5 w-7 -translate-x-1/2 translate-y-0.5 rounded-full bg-black/60 blur-[2px]" />
  <span className="relative z-10 inline-block text-lg
    [transform:perspective(260px)_rotateX(10deg)_rotateY(-2deg)_translateY(-3px)_translateZ(10px)]
    [transform-style:preserve-3d]
    [text-shadow:0_1px_0_rgba(255,255,255,0.3),1px_1px_0_rgba(255,255,255,0.12),1px_3px_0_rgba(0,0,0,0.95),2px_5px_0_rgba(0,0,0,0.82),3px_6px_0_rgba(0,0,0,0.65),0_8px_10px_rgba(0,0,0,0.55),0_0_9px_rgba(250,204,21,0.32)]
    transition-all duration-300
    hover:-translate-y-1 hover:scale-125
    hover:[transform:perspective(260px)_rotateX(5deg)_rotateY(-2deg)_translateY(-5px)_translateZ(18px)]
    hover:[text-shadow:0_1px_0_rgba(255,255,255,0.4),1px_3px_0_rgba(0,0,0,0.95),2px_5px_0_rgba(0,0,0,0.85),3px_7px_0_rgba(0,0,0,0.7),0_11px_14px_rgba(0,0,0,0.6),0_0_12px_rgba(250,204,21,0.4)]">➕</span>
</div>
                  <p className={`mt-1 text-[10px] font-extrabold ${
                    selectedFeature === "listing" ? "text-green-300" : "text-yellow-200/70"
                  }`}>
                    ثبت آگهی
                  </p>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleFeatureClick("manage", () => router.push("/marketplace/seller/marketplace"))}
                  className={`relative transition-all duration-300 ${warningFeature === "manage" ? "-translate-y-10 border-red-500/70 bg-red-950/80 text-red-200 shadow-red-500/50 animate-pulse" : ""} rounded-2xl border px-2 py-3 text-center font-bold shadow-lg transition-all hover:scale-105 ${
                    selectedFeature === "manage"
                      ? "border-green-500/40 bg-green-950/70 text-green-300 shadow-green-500/20"
                      : "border-white/10 bg-white/[0.05] text-yellow-200/70 shadow-black/20 hover:bg-white/[0.08]"
                  }`}
                >
                  <div className="relative mx-auto h-10 w-12 [perspective:260px] [transform-style:preserve-3d]">
  <span className="pointer-events-none absolute left-1/2 bottom-0 h-2 w-9 -translate-x-1/2 translate-y-1 rounded-full bg-black/80 blur-[5px] transition-all duration-300" />
  <span className="pointer-events-none absolute left-1/2 bottom-0 h-1.5 w-7 -translate-x-1/2 translate-y-0.5 rounded-full bg-black/60 blur-[2px]" />
  <span className="relative z-10 inline-block text-lg
    [transform:perspective(260px)_rotateX(10deg)_rotateY(-2deg)_translateY(-3px)_translateZ(10px)]
    [transform-style:preserve-3d]
    [text-shadow:0_1px_0_rgba(255,255,255,0.3),1px_1px_0_rgba(255,255,255,0.12),1px_3px_0_rgba(0,0,0,0.95),2px_5px_0_rgba(0,0,0,0.82),3px_6px_0_rgba(0,0,0,0.65),0_8px_10px_rgba(0,0,0,0.55),0_0_9px_rgba(250,204,21,0.32)]
    transition-all duration-300
    hover:-translate-y-1 hover:scale-125
    hover:[transform:perspective(260px)_rotateX(5deg)_rotateY(-2deg)_translateY(-5px)_translateZ(18px)]
    hover:[text-shadow:0_1px_0_rgba(255,255,255,0.4),1px_3px_0_rgba(0,0,0,0.95),2px_5px_0_rgba(0,0,0,0.85),3px_7px_0_rgba(0,0,0,0.7),0_11px_14px_rgba(0,0,0,0.6),0_0_12px_rgba(250,204,21,0.4)]">🛍️</span>
</div>
                  <p className={`mt-1 text-[10px] font-extrabold ${
                    selectedFeature === "manage" ? "text-green-300" : "text-yellow-200/70"
                  }`}>
                    بازارچه
                  </p>
                
                    {warningFeature === "manage" && (
                      <span className="absolute bottom-full left-1/2 z-30 mb-3 w-max max-w-[220px] -translate-x-1/2 rounded-xl border border-yellow-400/50 bg-black px-4 py-2 text-center text-xs font-extrabold text-white shadow-lg shadow-yellow-500/20">
                        ⚠️ ابتدا باید غرفه خود را بسازید. 🏪
                      </span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => handleFeatureClick("manage-listing", () => router.push("/marketplace/seller/listing/manage"))}
                    className={`relative transition-all duration-300 ${warningFeature === "manage-listing" ? "-translate-y-10 border-red-500/70 bg-red-950/80 text-red-200 shadow-red-500/50 animate-pulse" : ""} col-start-2 rounded-2xl border border-white/10 bg-white/[0.05] px-2 py-3 text-center font-bold text-yellow-200/70 shadow-lg shadow-black/20 transition-all hover:scale-105 hover:bg-white/[0.08]`}
                  >
                    <div className="relative mx-auto h-10 w-12 [perspective:260px] [transform-style:preserve-3d]">
  <span className="pointer-events-none absolute left-1/2 bottom-0 h-2 w-9 -translate-x-1/2 translate-y-1 rounded-full bg-black/80 blur-[5px] transition-all duration-300" />
  <span className="pointer-events-none absolute left-1/2 bottom-0 h-1.5 w-7 -translate-x-1/2 translate-y-0.5 rounded-full bg-black/60 blur-[2px]" />
  <span className="relative z-10 inline-block text-lg
    [transform:perspective(260px)_rotateX(10deg)_rotateY(-2deg)_translateY(-3px)_translateZ(10px)]
    [transform-style:preserve-3d]
    [text-shadow:0_1px_0_rgba(255,255,255,0.3),1px_1px_0_rgba(255,255,255,0.12),1px_3px_0_rgba(0,0,0,0.95),2px_5px_0_rgba(0,0,0,0.82),3px_6px_0_rgba(0,0,0,0.65),0_8px_10px_rgba(0,0,0,0.55),0_0_9px_rgba(250,204,21,0.32)]
    transition-all duration-300
    hover:-translate-y-1 hover:scale-125
    hover:[transform:perspective(260px)_rotateX(5deg)_rotateY(-2deg)_translateY(-5px)_translateZ(18px)]
    hover:[text-shadow:0_1px_0_rgba(255,255,255,0.4),1px_3px_0_rgba(0,0,0,0.95),2px_5px_0_rgba(0,0,0,0.85),3px_7px_0_rgba(0,0,0,0.7),0_11px_14px_rgba(0,0,0,0.6),0_0_12px_rgba(250,204,21,0.4)]">📦</span>
</div>
                    <p className="mt-1 text-[10px] font-extrabold text-yellow-200/70">
                      مدیریت آگهی
                    </p>
                  
                    {warningFeature === "manage-listing" && (
                      <span className="absolute bottom-full left-1/2 z-30 mb-3 w-max max-w-[220px] -translate-x-1/2 rounded-xl border border-yellow-400/50 bg-black px-4 py-2 text-center text-xs font-extrabold text-white shadow-lg shadow-yellow-500/20">
                        ⚠️ ابتدا باید غرفه خود را بسازید. 🏪
                      </span>
                    )}
                </button>

                <button
                  type="button"
                  onClick={() => handleFeatureClick("notes")}
                  className={`relative transition-all duration-300 ${warningFeature === "notes" ? "-translate-y-10 border-red-500/70 bg-red-950/80 text-red-200 shadow-red-500/50 animate-pulse" : ""} rounded-2xl border px-2 py-3 text-center font-bold shadow-lg transition-all hover:scale-105 ${
                    selectedFeature === "notes"
                      ? "border-green-500/40 bg-green-950/70 text-green-300 shadow-green-500/20"
                      : "border-white/10 bg-white/[0.05] text-yellow-200/70 shadow-black/20 hover:bg-white/[0.08]"
                  }`}
                >
                  <div className="relative mx-auto h-10 w-12 [perspective:260px] [transform-style:preserve-3d]">
  <span className="pointer-events-none absolute left-1/2 bottom-0 h-2 w-9 -translate-x-1/2 translate-y-1 rounded-full bg-black/80 blur-[5px] transition-all duration-300" />
  <span className="pointer-events-none absolute left-1/2 bottom-0 h-1.5 w-7 -translate-x-1/2 translate-y-0.5 rounded-full bg-black/60 blur-[2px]" />
  <span className="relative z-10 inline-block text-lg
    [transform:perspective(260px)_rotateX(10deg)_rotateY(-2deg)_translateY(-3px)_translateZ(10px)]
    [transform-style:preserve-3d]
    [text-shadow:0_1px_0_rgba(255,255,255,0.3),1px_1px_0_rgba(255,255,255,0.12),1px_3px_0_rgba(0,0,0,0.95),2px_5px_0_rgba(0,0,0,0.82),3px_6px_0_rgba(0,0,0,0.65),0_8px_10px_rgba(0,0,0,0.55),0_0_9px_rgba(250,204,21,0.32)]
    transition-all duration-300
    hover:-translate-y-1 hover:scale-125
    hover:[transform:perspective(260px)_rotateX(5deg)_rotateY(-2deg)_translateY(-5px)_translateZ(18px)]
    hover:[text-shadow:0_1px_0_rgba(255,255,255,0.4),1px_3px_0_rgba(0,0,0,0.95),2px_5px_0_rgba(0,0,0,0.85),3px_7px_0_rgba(0,0,0,0.7),0_11px_14px_rgba(0,0,0,0.6),0_0_12px_rgba(250,204,21,0.4)]">📝</span>
</div>
                  <p className={`mt-1 text-[10px] font-extrabold ${
                    selectedFeature === "notes" ? "text-green-300" : "text-yellow-200/70"
                  }`}>
                    یادداشت‌ها
                  </p>
                
                    {warningFeature === "notes" && (
                      <span className="absolute bottom-full left-1/2 z-30 mb-3 w-max max-w-[220px] -translate-x-1/2 rounded-xl border border-yellow-400/50 bg-black px-4 py-2 text-center text-xs font-extrabold text-white shadow-lg shadow-yellow-500/20">
                        ⚠️ ابتدا باید غرفه خود را بسازید. 🏪
                      </span>
                    )}
                </button>
                  <button
                    type="button"
                    onClick={() => handleFeatureClick("purchase-requests", () => router.push("/marketplace/seller/purchase-requests"))}
                    className={`relative transition-all duration-300 ${warningFeature === "purchase-requests" ? "-translate-y-10 border-red-500/70 bg-red-950/80 text-red-200 shadow-red-500/50 animate-pulse" : ""} rounded-2xl border px-2 py-3 text-center font-bold shadow-lg transition-all hover:scale-105 ${
                      selectedFeature === "purchase-requests"
                        ? "border-green-500/40 bg-green-950/70 text-green-300 shadow-green-500/20"
                        : "border-white/10 bg-white/[0.05] text-yellow-200/70 shadow-black/20 hover:bg-white/[0.08]"
                    }`}
                  >
                    <div className="relative mx-auto h-10 w-12 [perspective:260px] [transform-style:preserve-3d]">
  <span className="pointer-events-none absolute left-1/2 bottom-0 h-2 w-9 -translate-x-1/2 translate-y-1 rounded-full bg-black/80 blur-[5px] transition-all duration-300" />
  <span className="pointer-events-none absolute left-1/2 bottom-0 h-1.5 w-7 -translate-x-1/2 translate-y-0.5 rounded-full bg-black/60 blur-[2px]" />
  <span className="relative z-10 inline-block text-lg
    [transform:perspective(260px)_rotateX(10deg)_rotateY(-2deg)_translateY(-3px)_translateZ(10px)]
    [transform-style:preserve-3d]
    [text-shadow:0_1px_0_rgba(255,255,255,0.3),1px_1px_0_rgba(255,255,255,0.12),1px_3px_0_rgba(0,0,0,0.95),2px_5px_0_rgba(0,0,0,0.82),3px_6px_0_rgba(0,0,0,0.65),0_8px_10px_rgba(0,0,0,0.55),0_0_9px_rgba(250,204,21,0.32)]
    transition-all duration-300
    hover:-translate-y-1 hover:scale-125
    hover:[transform:perspective(260px)_rotateX(5deg)_rotateY(-2deg)_translateY(-5px)_translateZ(18px)]
    hover:[text-shadow:0_1px_0_rgba(255,255,255,0.4),1px_3px_0_rgba(0,0,0,0.95),2px_5px_0_rgba(0,0,0,0.85),3px_7px_0_rgba(0,0,0,0.7),0_11px_14px_rgba(0,0,0,0.6),0_0_12px_rgba(250,204,21,0.4)]">🛒</span>
</div>
                    <p className={`mt-1 text-[10px] font-extrabold ${
                      selectedFeature === "purchase-requests" ? "text-green-300" : "text-yellow-200/70"
                    }`}>
                      درخواست‌های خرید
                    </p>
                  
                    {warningFeature === "purchase-requests" && (
                      <span className="absolute bottom-full left-1/2 z-30 mb-3 w-max max-w-[220px] -translate-x-1/2 rounded-xl border border-yellow-400/50 bg-black px-4 py-2 text-center text-xs font-extrabold text-white shadow-lg shadow-yellow-500/20">
                        ⚠️ ابتدا باید غرفه خود را بسازید. 🏪
                      </span>
                    )}
                </button>


                  <button
                  type="button"
                  onClick={() => handleFeatureClick("favorites", () => router.push("/marketplace/seller/favorites"))}
                  className={`relative transition-all duration-300 ${warningFeature === "favorites" ? "-translate-y-10 border-red-500/70 bg-red-950/80 text-red-200 shadow-red-500/50 animate-pulse" : ""} rounded-2xl border px-2 py-3 text-center font-bold shadow-lg transition-all hover:scale-105 ${
                    selectedFeature === "favorites"
                      ? "border-green-500/40 bg-green-950/70 text-green-300 shadow-green-500/20"
                      : "border-white/10 bg-white/[0.05] text-yellow-200/70 shadow-black/20 hover:bg-white/[0.08]"
                  }`}
                >
                  <div className="relative mx-auto h-10 w-12 [perspective:260px] [transform-style:preserve-3d]">
  <span className="pointer-events-none absolute left-1/2 bottom-0 h-2 w-9 -translate-x-1/2 translate-y-1 rounded-full bg-black/80 blur-[5px] transition-all duration-300" />
  <span className="pointer-events-none absolute left-1/2 bottom-0 h-1.5 w-7 -translate-x-1/2 translate-y-0.5 rounded-full bg-black/60 blur-[2px]" />
  <span className="relative z-10 inline-block text-lg
    [transform:perspective(260px)_rotateX(10deg)_rotateY(-2deg)_translateY(-3px)_translateZ(10px)]
    [transform-style:preserve-3d]
    [text-shadow:0_1px_0_rgba(255,255,255,0.3),1px_1px_0_rgba(255,255,255,0.12),1px_3px_0_rgba(0,0,0,0.95),2px_5px_0_rgba(0,0,0,0.82),3px_6px_0_rgba(0,0,0,0.65),0_8px_10px_rgba(0,0,0,0.55),0_0_9px_rgba(250,204,21,0.32)]
    transition-all duration-300
    hover:-translate-y-1 hover:scale-125
    hover:[transform:perspective(260px)_rotateX(5deg)_rotateY(-2deg)_translateY(-5px)_translateZ(18px)]
    hover:[text-shadow:0_1px_0_rgba(255,255,255,0.4),1px_3px_0_rgba(0,0,0,0.95),2px_5px_0_rgba(0,0,0,0.85),3px_7px_0_rgba(0,0,0,0.7),0_11px_14px_rgba(0,0,0,0.6),0_0_12px_rgba(250,204,21,0.4)]">❤️</span>
</div>
                  <p className={`mt-1 text-[10px] font-extrabold ${
                    selectedFeature === "favorites" ? "text-green-300" : "text-yellow-200/70"
                  }`}>
                    علاقه‌مندی‌ها
                  </p>
                
                    {warningFeature === "favorites" && (
                      <span className="absolute bottom-full left-1/2 z-30 mb-3 w-max max-w-[220px] -translate-x-1/2 rounded-xl border border-yellow-400/50 bg-black px-4 py-2 text-center text-xs font-extrabold text-white shadow-lg shadow-yellow-500/20">
                        ⚠️ ابتدا باید غرفه خود را بسازید. 🏪
                      </span>
                    )}
                </button>

                  <button
                  type="button"
                  onClick={() => handleFeatureClick("subscription", () => router.push("/marketplace/seller/subscription"))}
                  className={`relative transition-all duration-300 ${warningFeature === "subscription" ? "-translate-y-10 border-red-500/70 bg-red-950/80 text-red-200 shadow-red-500/50 animate-pulse" : ""} rounded-2xl border px-2 py-3 text-center font-bold shadow-lg transition-all hover:scale-105 ${
                    selectedFeature === "subscription"
                      ? "border-green-500/40 bg-green-950/70 text-green-300 shadow-green-500/20"
                      : "border-yellow-500/40 bg-yellow-950/70 text-yellow-300 shadow-yellow-500/20 hover:bg-yellow-900/80"
                  }`}
                >
                  <div className="relative mx-auto h-10 w-12 [perspective:260px] [transform-style:preserve-3d]">
  <span className="pointer-events-none absolute left-1/2 bottom-0 h-2 w-9 -translate-x-1/2 translate-y-1 rounded-full bg-black/80 blur-[5px] transition-all duration-300" />
  <span className="pointer-events-none absolute left-1/2 bottom-0 h-1.5 w-7 -translate-x-1/2 translate-y-0.5 rounded-full bg-black/60 blur-[2px]" />
  <span className="relative z-10 inline-block text-lg
    [transform:perspective(260px)_rotateX(10deg)_rotateY(-2deg)_translateY(-3px)_translateZ(10px)]
    [transform-style:preserve-3d]
    [text-shadow:0_1px_0_rgba(255,255,255,0.3),1px_1px_0_rgba(255,255,255,0.12),1px_3px_0_rgba(0,0,0,0.95),2px_5px_0_rgba(0,0,0,0.82),3px_6px_0_rgba(0,0,0,0.65),0_8px_10px_rgba(0,0,0,0.55),0_0_9px_rgba(250,204,21,0.32)]
    transition-all duration-300
    hover:-translate-y-1 hover:scale-125
    hover:[transform:perspective(260px)_rotateX(5deg)_rotateY(-2deg)_translateY(-5px)_translateZ(18px)]
    hover:[text-shadow:0_1px_0_rgba(255,255,255,0.4),1px_3px_0_rgba(0,0,0,0.95),2px_5px_0_rgba(0,0,0,0.85),3px_7px_0_rgba(0,0,0,0.7),0_11px_14px_rgba(0,0,0,0.6),0_0_12px_rgba(250,204,21,0.4)]">💳</span>
</div>
                  <p className={`mt-1 text-[10px] font-extrabold ${
                    selectedFeature === "subscription" ? "text-green-300" : "text-yellow-200/70"
                  }`}>
                    مدیریت<br />اشتراک
                  </p>
                
                    {warningFeature === "subscription" && (
                      <span className="absolute bottom-full left-1/2 z-30 mb-3 w-max max-w-[220px] -translate-x-1/2 rounded-xl border border-yellow-400/50 bg-black px-4 py-2 text-center text-xs font-extrabold text-white shadow-lg shadow-yellow-500/20">
                        ⚠️ ابتدا باید غرفه خود را بسازید. 🏪
                      </span>
                    )}
                </button>
              </div>


          {/* پیام */}
          {message && (
            <div className="relative mt-5 rounded-2xl border border-green-500/20 bg-green-950/20 px-4 py-3 text-center">
              <p className="text-xs font-bold text-green-300">
                {message}
              </p>
            </div>
          )}

          {/* توضیح */}
            <div className="relative mt-7 text-center">
              <p className="text-[11px] font-bold leading-6 text-green-300">
                نقش کارجو یا کارفرمای شما در شهرکار تغییر نمی‌کند
                و فروشندگی بازارچه مستقل از نقش کاریابی شماست.
              </p>
            </div>

          {/* برگشت */}
          <div className="relative mt-7 pb-2 text-center">
            <a
              href="/marketplace"
              className="
                inline-block
                rounded-2xl
                border
                border-red-500/40
                bg-red-950/70
                px-8
                py-3
                font-bold
                text-red-300
                shadow-lg
                shadow-red-500/20
                transition-all
                hover:scale-105
                hover:bg-red-900/80
              "
            >
              ← بازگشت به بازارچه
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
