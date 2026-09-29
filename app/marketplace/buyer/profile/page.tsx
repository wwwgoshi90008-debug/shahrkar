"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Profile = {
  name: string;
  email: string;
  phone: string;
  city: string;
};

export default function BuyerProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile>({
    name: "",
    email: "",
    phone: "",
    city: "",
  });

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/marketplace/profile", {
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setMessage(data.error || "دریافت اطلاعات پروفایل انجام نشد.");
          return;
        }

        setProfile({
          name: data.user?.name || "",
          email: data.user?.email || "",
          phone: data.user?.phone || "",
          city: data.user?.city || "",
        });
      } catch {
        setMessage("خطا در دریافت اطلاعات پروفایل.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function updateField(field: keyof Profile, value: string) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveProfile() {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/marketplace/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(profile),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setMessage(data.error || "ذخیره اطلاعات انجام نشد.");
        return;
      }

      setProfile({
        name: data.user?.name || profile.name,
        email: data.user?.email || profile.email,
        phone: data.user?.phone || profile.phone,
        city: data.user?.city || profile.city,
      });

      setEditing(false);
      setMessage("ویرایش انجام شد");
    } catch {
      setMessage("خطا در ذخیره اطلاعات.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAccount() {
    const confirmed = window.confirm(
      "⚠️ آیا از حذف دائمی حساب کاربری خود مطمئن هستید؟\\n\\nاین عملیات قابل بازگشت نیست."
    );

    if (!confirmed) return;

    setMessage("");

    try {
      const res = await fetch("/api/marketplace/profile", {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setMessage(data.error || "حذف حساب کاربری انجام نشد.");
        return;
      }

      setMessage("حساب کاربری با موفقیت حذف شد.");

      setTimeout(() => {
        window.location.href = "/marketplace/register";
      }, 1200);
    } catch {
      setMessage("خطا در حذف حساب کاربری.");
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gradient-to-b from-[#080808] via-[#0b0905] to-[#080808] px-4 py-8 text-white"
    >
      <div className="mx-auto w-full max-w-md">
        <section className="rounded-3xl border border-yellow-500/30 bg-gradient-to-b from-[#15120b] via-[#0d0c09] to-[#080808] p-4 shadow-2xl shadow-yellow-500/10">
          <div className="mb-5 flex flex-col items-center">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-950/70 to-[#171109] text-4xl shadow-lg shadow-yellow-500/20">
              👤
            </div>

            <h2 className="mt-3 text-base font-bold text-yellow-200">پروفایل</h2>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm text-gray-400">
              در حال دریافت اطلاعات...
            </div>
          ) : (
            <div className="space-y-3">
              <ProfileField
                label="نام و نام خانوادگی"
                value={profile.name}
                disabled={!editing}
                onChange={(value) => updateField("name", value)}
              />

              <ProfileField
                label="ایمیل"
                value={profile.email}
                type="email"
                disabled={!editing}
                onChange={(value) => updateField("email", value)}
              />

              <ProfileField
                label="شهر"
                value={profile.city}
                disabled={!editing}
                onChange={(value) => updateField("city", value)}
              />

              <ProfileField
                label="شماره"
                value={profile.phone}
                type="tel"
                disabled={!editing}
                onChange={(value) => updateField("phone", value)}
              />

              {message && (
                <div className="rounded-xl border border-yellow-500/20 bg-yellow-950/20 px-4 py-3 text-center text-sm text-yellow-100/80">
                  {message}
                </div>
              )}

              <div className="pt-3">
                {!editing ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMessage("حالت ویرایش فعال شد");
                      setEditing(true);
                    }}
                    className="w-full rounded-2xl border border-gray-500/40 bg-gray-950/70 px-8 py-3 font-bold text-gray-300 shadow-lg shadow-gray-500/20 transition-all hover:scale-105 hover:bg-gray-900/80"
                  >
                    ✏️ ویرایش اطلاعات
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={saveProfile}
                    disabled={saving}
                    className="w-full rounded-2xl border border-green-500/40 bg-green-950/70 px-8 py-3 font-bold text-green-300 shadow-lg shadow-green-500/20 transition-all hover:scale-105 hover:bg-green-900/80 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "در حال ذخیره..." : "اطلاعات ذخیره شد"}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={deleteAccount}
                className="w-full rounded-2xl border border-red-500/40 bg-red-950/70 px-8 py-3 font-bold text-red-300 shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] hover:bg-red-900/80"
              >
                🗑️ حذف حساب کاربری
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ProfileField({
  label,
  value,
  type = "text",
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-right text-xs font-bold text-yellow-200/90">
        {label}
      </span>

      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-yellow-500/20 bg-[#090807] px-3 py-2.5 text-right text-xs text-white outline-none transition focus:border-yellow-500/60 focus:ring-1 focus:ring-yellow-500/20 disabled:cursor-default disabled:opacity-80"
      />
    </label>
  );
}
