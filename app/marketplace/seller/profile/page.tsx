"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Profile = {
  uid: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  marketplaceRole: string | null;
  sellerGender: "female" | "male" | null;
};

export default function MarketplaceSellerProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/marketplace/profile");
        const data = await response.json();

        if (!response.ok) {
          setMessage(data.error || "خطا در دریافت پروفایل.");
          return;
        }

        setProfile(data.user);
      } catch {
        setMessage("ارتباط با سرور برقرار نشد.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function saveProfile() {
    if (!profile) return;

    try {
      setSaving(true);
      setMessage("");

      const response = await fetch("/api/marketplace/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          city: profile.city,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "به‌روزرسانی پروفایل انجام نشد.");
        return;
      }

      setProfile(data.user);
      setMessage(data.message || "پروفایل با موفقیت به‌روزرسانی شد.");
    } catch {
      setMessage("ارتباط با سرور برقرار نشد.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-black px-4 py-6 text-white"
      >
        <div className="mx-auto w-full max-w-[520px] text-center">
          <p className="font-bold text-gray-300">در حال دریافت پروفایل...</p>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-black px-4 py-6 text-white"
      >
        <div className="mx-auto w-full max-w-[520px]">
          <div className="rounded-3xl border-2 border-yellow-500/50 bg-black p-6 text-center">
            <h1 className="text-xl font-black text-yellow-300">
              👤 پروفایل
            </h1>

            <p className="mt-5 font-bold text-red-300">
              {message || "پروفایل قابل دریافت نیست."}
            </p>

            <button
              type="button"
              onClick={() => router.back()}
              className="mt-6 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 font-bold text-yellow-200/80"
            >
              بازگشت
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-black px-4 py-6 text-white"
    >
      <div className="mx-auto w-full max-w-[520px]">
        <div className="rounded-3xl border-2 border-yellow-500/50 bg-black px-5 py-6 shadow-lg">
                <div className="text-4xl">{profile.sellerGender === "female" ? "👩" : profile.sellerGender === "male" ? "👨" : "👤"}</div>

            <h1 className="mt-3 text-xl font-black text-yellow-300">
              پروفایل من
            </h1>

            <p className="mt-2 text-sm font-bold text-gray-400">
              اطلاعات حساب بازارچه خود را مدیریت کنید.
            </p>
       

          <div className="mt-7 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-gray-300">
                نام و نام خانوادگی
              </span>
              <input
                value={profile.name}
                onChange={(event) =>
                  setProfile({ ...profile, name: event.target.value })
                }
                className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-right font-bold text-white outline-none focus:border-yellow-500/50"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-gray-300">
                ایمیل
              </span>
              <input
                type="email"
                dir="ltr"
                value={profile.email}
                onChange={(event) =>
                  setProfile({ ...profile, email: event.target.value })
                }
                className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-left font-bold text-white outline-none focus:border-yellow-500/50"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-gray-300">
                شماره موبایل
              </span>
                <div className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-left font-bold text-white" dir="ltr">{profile.phone}</div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-gray-300">
                شهر
              </span>
              <input
                value={profile.city}
                onChange={(event) =>
                  setProfile({ ...profile, city: event.target.value })
                }
                className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-right font-bold text-white outline-none focus:border-yellow-500/50"
              />
            </label>

            <div>
              <span className="mb-2 block text-sm font-bold text-gray-300">
                نقش حساب
              </span>

              <div className="rounded-2xl border border-blue-500/40 bg-blue-950/70 px-8 py-3 font-bold text-blue-300 shadow-lg shadow-blue-500/20">
                {profile.marketplaceRole === "seller"
                  ? "فروشنده"
                  : profile.marketplaceRole === "buyer"
                    ? "خریدار"
                    : "نامشخص"}
              </div>

              <p className="mt-2 text-xs font-bold text-gray-500">
                نقش حساب توسط سیستم مدیریت می‌شود و قابل ویرایش نیست.
              </p>
            </div>
          </div>

          {message && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-sm font-bold text-green-300">
              {message}
            </div>
          )}

          <button
            type="button"
            onClick={saveProfile}
            disabled={saving}
            className="mt-6 w-full rounded-2xl border border-green-500/40 bg-green-950/70 px-4 py-3 font-black text-green-300 transition-all hover:bg-green-900/70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="mt-3 w-full rounded-2xl border border-yellow-500/40 bg-yellow-950/70 px-8 py-3 font-bold text-yellow-300 shadow-lg shadow-yellow-500/20 transition-all hover:scale-105 hover:bg-yellow-900/80"
          >
            بازگشت
          </button>

            <button
              type="button"
              onClick={async () => {
                const confirmed = window.confirm(
                  "مطمئن هستید می‌خواهید از حساب کاربری خارج شوید؟"
                );

                if (!confirmed) return;

                try {
                  const response = await fetch("/api/marketplace/logout", {
                    method: "POST",
                  });

                  if (!response.ok) {
                    throw new Error("LOGOUT_FAILED");
                  }

                  localStorage.removeItem("marketplaceUser");
                  router.push("/marketplace/register");
                } catch {
                  alert("خروج از حساب انجام نشد. دوباره تلاش کنید.");
                }
              }}
              className="mt-10 w-full rounded-2xl border border-red-500/40 bg-red-950/70 px-8 py-3 font-bold text-red-300 shadow-lg shadow-red-500/20 transition-all"
            >
              خروج از حساب کاربری
            </button>
              <button
                type="button"
                onClick={() => alert("حذف حساب کاربری")}
                className="mt-3 w-full rounded-2xl border border-red-500 bg-red-700 px-8 py-3 font-bold text-white shadow-lg shadow-red-500/40 transition-all hover:scale-105 hover:bg-red-800"
              >
                🗑️ حذف حساب کاربری
              </button>
        </div>
          </div>
    </main>
  );
}
