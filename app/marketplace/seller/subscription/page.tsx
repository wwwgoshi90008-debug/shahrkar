"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const plans = [
  {
    icon: "✦",
    title: "رایگان",
    subtitle: "شروع فروش در بازارچه",
    capacity: "۳ آگهی",
    duration: "۵ روز",
    price: "رایگان",
    current: true,
    featured: false,
  },
    {
      icon: "●",
      title: "پایه",
      subtitle: "برای فروشنده‌های تازه‌کار",
      capacity: "۷ آگهی",
      duration: "۲۰ روز",
      price: "۲۹۹٬۰۰۰ تومان",
      current: false,
      featured: false,
    },
  {
    icon: "◆",
    title: "حرفه‌ای",
    subtitle: "برای فروشنده‌های فعال",
    capacity: "۱۴ آگهی",
    duration: "۳۰ روز",
    price: "۴۹۹٬۰۰۰ تومان",
    current: false,
    featured: true,
  },
  {
    icon: "♛",
    title: "ویژه",
    subtitle: "برای فروشگاه‌های بزرگ",
    capacity: "۲۰ آگهی",
    duration: "۴۰ روز",
    price: "۶۹۹٬۰۰۰ تومان",
    current: false,
    featured: false,
  },
];

type SubscriptionStatus = {
  planId: string;
  title: string;
  capacity: number;
  effectiveCapacity: number;
  durationDays: number;
  price: number;
  startedAt: string | null;
  expiresAt: string | null;
  expired: boolean;
  status: "active" | "expired" | "none";
  activeListings: number;
  remainingListings: number;
};

export default function SubscriptionPage() {
  const router = useRouter();

  const [subscription, setSubscription] =
    useState<SubscriptionStatus | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [activatingFree, setActivatingFree] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSubscription() {
      try {
        const response = await fetch(
          "/api/marketplace/seller/subscription",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!cancelled && response.ok && data?.success) {
          setSubscription(data.subscription);
        }
      } catch {
        // وضعیت خطا بدون نمایش اطلاعات حساس مدیریت می‌شود.
      } finally {
        if (!cancelled) {
          setLoadingSubscription(false);
        }
      }
    }

    loadSubscription();

    return () => {
      cancelled = true;
    };
  }, []);

  const total = subscription?.capacity ?? 0;
  const effectiveCapacity = subscription?.effectiveCapacity ?? 0;
  const used = subscription?.activeListings ?? 0;
  const remaining = subscription?.remainingListings ?? 0;

  const currentTitle = loadingSubscription
    ? "در حال دریافت..."
    : subscription?.title ?? "نامشخص";

    const remainingDays =
      subscription?.expiresAt
        ? Math.max(
            0,
            Math.ceil(
              (new Date(subscription.expiresAt).getTime() - Date.now()) /
                (24 * 60 * 60 * 1000)
            )
          )
        : subscription?.durationDays ?? 0;

    const currentDuration =
      loadingSubscription
        ? "در حال دریافت..."
        : subscription?.expiresAt
          ? `${remainingDays} روز`
          : subscription?.durationDays
            ? `${subscription.durationDays} روز`
            : "نامشخص";

  const currentStatus =
    loadingSubscription
      ? "در حال بررسی"
      : subscription?.status === "none"
        ? "بدون اشتراک"
        : subscription?.expired
          ? "منقضی‌شده"
          : "فعال";

  async function activateFreePlan() {
    if (activatingFree) return;

    setActivatingFree(true);

    try {
      const response = await fetch(
        "/api/marketplace/seller/subscription",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.success) {
        alert(data?.error ?? "فعال‌سازی پلن رایگان انجام نشد.");
        return;
      }

      const refreshResponse = await fetch(
        "/api/marketplace/seller/subscription",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const refreshData = await refreshResponse.json();

      if (refreshResponse.ok && refreshData?.success) {
        setSubscription(refreshData.subscription);
      }
    } catch {
      alert("خطا در فعال‌سازی پلن رایگان بازارچه.");
    } finally {
      setActivatingFree(false);
    }
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#090909] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute right-[-180px] top-[-180px] h-[420px] w-[420px] rounded-full bg-amber-500/[0.035] blur-[110px]" />
        <div className="absolute bottom-[-180px] left-[-180px] h-[420px] w-[420px] rounded-full bg-white/[0.025] blur-[110px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-5 flex items-center justify-between border-b border-white/[0.08] pb-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-lg text-white/70 transition hover:border-amber-300/30 hover:bg-white/[0.07] hover:text-white active:scale-95"
            >
              ←
            </button>

            <div>
              <p className="text-[10px] tracking-wide text-white/30">
                بازارچه شهرکار
              </p>
              <h1 className="mt-1 text-lg font-black">
                مدیریت اشتراک
              </h1>
            </div>
          </div>

          <div className="hidden rounded-full border border-amber-300/15 bg-amber-300/[0.06] px-4 py-2 text-[11px] font-bold text-amber-200/80 sm:block">
            پلن رایگان
          </div>
        </header>

        <section className="relative mb-5 overflow-hidden rounded-[30px] border border-amber-200/[0.12] bg-[#111111] shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />

          <div className="grid lg:grid-cols-[1fr_360px]">
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] text-xl text-amber-200">
                ✦
              </div>

              <p className="text-xs font-bold text-amber-200/60">
                اشتراک فعلی شما
              </p>

              <h2 className="mt-2 text-3xl font-black sm:text-5xl">
                {currentTitle}
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-white/35">
                  {loadingSubscription
                    ? "در حال دریافت وضعیت اشتراک شما..."
                    : subscription?.status === "none"
                    ? "در حال حاضر اشتراک فعالی ندارید؛ برای شروع فروش، پلن رایگان را فعال کنید."
                    : subscription?.expired
                    ? "مدت اشتراک این پلن به پایان رسیده است. آگهی‌های قبلی حذف نمی‌شوند و داخل غرفه و «آگهی‌های من» باقی می‌مانند؛ فقط امکان انتشار آگهی جدید محدود می‌شود."
                    : `با پلن ${currentTitle} می‌توانید تا ${subscription?.capacity ?? 0} آگهی فعال در بازارچه شهرکار داشته باشید. مدت این پلن ${subscription?.durationDays ?? 0} روز است.`}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <InfoBox title="ظرفیت" value={loadingSubscription ? "..." : `${effectiveCapacity} آگهی`} />
                <InfoBox title="مدت" value={loadingSubscription ? "..." : currentDuration} />
                <InfoBox title="وضعیت" value={currentStatus} active={!subscription?.expired} />
              </div>
            </div>

            <div className="border-t border-white/[0.07] bg-[#0d0d0d] p-6 lg:border-r lg:border-t-0 sm:p-8">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/30">
                  ظرفیت آگهی
                </span>

                <span className="text-xs font-bold text-white/50">
                  {used} / {effectiveCapacity}
                </span>
              </div>

              <div className="mt-5 flex items-end gap-2">
                <span className="text-6xl font-black tracking-tight">
                  {remaining}
                </span>
                <span className="mb-2 text-xs text-white/25">
                  باقی‌مانده
                </span>
              </div>

              <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-amber-300 to-amber-500"
                  style={{ width: `${effectiveCapacity > 0 ? Math.min(100, (used / effectiveCapacity) * 100) : 0}%` }}
                />
              </div>

              <div className="mt-3 flex justify-between text-[10px] text-white/20">
                <span>استفاده‌شده: {used}</span>
                <span>کل: {effectiveCapacity}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat title="ظرفیت کل" value={loadingSubscription ? "..." : String(effectiveCapacity)} />
          <Stat title="آگهی فعال" value={loadingSubscription ? "..." : String(used)} />
          <Stat title="باقی‌مانده" value={loadingSubscription ? "..." : String(remaining)} />
          <Stat title="انقضا" value={loadingSubscription ? "..." : (subscription?.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString("fa-IR") : "—")} />
        </section>

        <section className="mb-8">
          <div className="mb-5">
            <p className="text-[10px] font-bold tracking-wider text-amber-200/45">
              SUBSCRIPTION
            </p>

            <h3 className="mt-1 text-2xl font-black">
              پلن مناسب خودت را انتخاب کن
            </h3>

            <p className="mt-2 text-xs text-white/25">
              پلن‌های حرفه‌ای برای افزایش ظرفیت فروشگاه در حال آماده‌سازی هستند.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard
              key={plan.title}
              plan={plan}
              subscription={subscription}
              loadingSubscription={loadingSubscription}
              onActivateFree={activateFreePlan}
              activatingFree={activatingFree}
            />
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/[0.08] bg-[#111111] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black">
                سابقه خرید
              </h3>

              <p className="mt-1 text-[11px] text-white/25">
                تاریخچه اشتراک و پرداخت‌های شما
              </p>
            </div>

            <span className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[10px] text-white/25">
              ۰ خرید
            </span>
          </div>

          <div className="mt-5 flex min-h-32 flex-col items-center justify-center border-t border-white/[0.06] text-center">
            <div className="text-2xl text-white/20">
              ◇
            </div>

            <p className="mt-3 text-sm font-bold text-white/35">
              هنوز سابقه‌ای وجود ندارد
            </p>

            <p className="mt-1 text-[10px] text-white/20">
              خریدهای آینده اینجا نمایش داده می‌شوند.
            </p>
          </div>
        </section>

        <div className="py-6 text-center text-[9px] text-white/15">
          بازارچه شهرکار
        </div>
      </div>
    </main>
  );
}

function InfoBox({
  title,
  value,
  active = false,
}: {
  title: string;
  value: string;
  active?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4 py-3">
      <div className="text-[10px] text-white/25">
        {title}
      </div>

      <div
        className={[
          "mt-1 text-sm font-black",
          active ? "text-emerald-300/80" : "text-white",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}

function Stat({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/[0.08] bg-[#111111] p-4 transition hover:border-amber-300/15">
      <div className="text-2xl font-black">
        {value}
      </div>

      <div className="mt-2 text-[10px] text-white/25">
        {title}
      </div>
    </div>
  );
}


function PlanCard({
  plan,
  subscription,
  loadingSubscription,
  onActivateFree,
  activatingFree,
}: {
  plan: (typeof plans)[number];
  subscription: SubscriptionStatus | null;
  loadingSubscription: boolean;
  onActivateFree: () => void;
  activatingFree: boolean;
}) {
  const [showInfo, setShowInfo] = useState(false);

  const isFreeExpired =
    !loadingSubscription &&
    plan.title === "رایگان" &&
    subscription?.planId === "free" &&
    subscription.expired;

  const infoText =
    plan.title === "رایگان"
      ? "این پلن ۳ آگهی فعال و ۵ روز اعتبار دارد و برای شروع فروش در بازارچه مناسب است."
      : plan.title === "پایه"
        ? "این پلن ۷ آگهی فعال و ۲۰ روز اعتبار دارد و برای فروشنده‌های تازه‌کار مناسب است."
        : plan.title === "حرفه‌ای"
          ? "این پلن ۱۰ آگهی فعال و ۲۰ روز اعتبار دارد و برای فروشنده‌های فعال طراحی شده است."
          : "این پلن ۳۰ آگهی فعال و ۳۰ روز اعتبار دارد و برای فروشگاه‌های بزرگ مناسب است.";

  const earlyRenewalText =
    "اگر ظرفیت آگهی‌های این پلن قبل از پایان مدت اعتبار کامل شود، لازم نیست تا پایان مدت صبر کنید؛ می‌توانید همان زمان اشتراک جدید را فعال کنید. اشتراک جدید از زمان تأیید و فعال‌سازی موفق شروع می‌شود و مدت کامل پلن جدید را خواهد داشت. زمان باقی‌مانده اشتراک قبلی به اشتراک جدید اضافه نمی‌شود.";

  return (
    <div
      className={[
        "relative overflow-hidden rounded-[28px] border p-5 transition duration-300 hover:-translate-y-1",
        isFreeExpired
          ? "border-red-500/40 bg-red-950/70 text-red-300 shadow-lg shadow-red-500/20"
          : plan.featured
            ? "border-amber-300/25 bg-gradient-to-b from-[#1b1811] to-[#111111] shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
            : "border-white/[0.08] bg-[#111111]",
      ].join(" ")}
    >
      <div className="flex justify-center">
        <button
          type="button"
          aria-label="توضیحات این پلن"
          onClick={() => setShowInfo((value) => !value)}
          className="mt-2 flex h-9 w-9 items-center justify-center rounded-full border border-red-500/40 bg-red-950/70 font-bold text-base text-red-300 shadow-lg shadow-red-500/20 transition-all hover:scale-105 hover:bg-red-900/80"
        >
          ⓘ
        </button>
      </div>

      {showInfo && (
        <div className="absolute right-4 top-14 z-20 w-[calc(100%-2rem)] rounded-2xl border border-red-500/40 bg-black p-4 text-[11px] leading-6 text-white shadow-lg shadow-red-500/20">
          <div className="mb-2 font-black text-white">
            توضیحات پلن {plan.title}
          </div>

          <div className="text-white">
            {infoText}
          </div>

          <div className="mt-2 border-t border-white/15 pt-2 text-white">
            {earlyRenewalText}
          </div>

          <div className="mt-2 border-t border-white/15 pt-2 text-white">
            آگهی‌های قبلی با پایان اشتراک حذف نمی‌شوند و داخل غرفه و «آگهی‌های من» باقی می‌مانند؛ فقط امکان انتشار آگهی جدید محدود می‌شود.
          </div>
        </div>
      )}

      {isFreeExpired && (
        <div className="absolute left-4 top-4 flex items-center gap-1 text-sm">
          <span>🔒</span>
          <span>⛓️</span>
        </div>
      )}

      {plan.featured && !isFreeExpired && (
        <div className="absolute left-4 top-4 rounded-full border border-amber-300/15 bg-amber-300/[0.06] px-3 py-1 text-[9px] font-black text-amber-200/70">
          پیشنهاد ویژه
        </div>
      )}

      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.035] text-xl text-amber-200/80">
        {isFreeExpired ? "🔒" : plan.icon}
      </div>

      <h4 className="mt-5 text-lg font-black">
        {plan.title}
      </h4>

      <p className="mt-1 text-[10px] text-white/25">
        {plan.subtitle}
      </p>

      <div className="mt-6 space-y-3 border-t border-white/[0.06] pt-5">
        <InfoRow title="ظرفیت" value={plan.capacity} />
        <InfoRow title="مدت" value={plan.duration} />
        <InfoRow title="قیمت" value={plan.price} />
      </div>

      <button
        type="button"
        disabled={
          !plan.current ||
          loadingSubscription ||
          activatingFree ||
          (subscription?.status === "active" && !subscription.expired)
        }
        onClick={plan.current ? onActivateFree : undefined}
        className={[
          "mt-6 w-full rounded-2xl px-4 py-3 text-xs font-black",
          plan.current
            ? "border border-emerald-400/40 bg-emerald-950/70 text-emerald-300 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 hover:bg-emerald-900/80 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            : "border border-amber-300/10 bg-amber-300/[0.025] text-white/25",
        ].join(" ")}
      >
        {plan.current
          ? activatingFree
            ? "در حال فعال‌سازی..."
            : subscription?.planId === "free" && subscription.expired
              ? "فعال‌سازی دوباره"
              : subscription?.status === "active" && !subscription.expired
                ? "پلن فعلی"
                : "فعال‌سازی پلن رایگان"
          : "به‌زودی"}
      </button>
    </div>
  );
}

function InfoRow({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-white/25">
        {title}
      </span>

      <span className="font-bold text-white/65">
        {value}
      </span>
    </div>
  );
}
