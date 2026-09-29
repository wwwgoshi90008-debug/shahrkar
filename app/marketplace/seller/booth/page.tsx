"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SellerBoothPage() {
  const router = useRouter();

  const [boothName, setBoothName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [hasBooth, setHasBooth] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

    useEffect(() => {
      async function loadBooth() {
        try {
          const response = await fetch("/api/marketplace/seller/booth", {
            method: "GET",
            credentials: "include",
          });

          const data = await response.json();

          if (response.ok && data.booth) {
            setHasBooth(true);
            setBoothName(data.booth.boothName || "");
            setDescription(data.booth.description || "");
            setCategory(data.booth.category || "");
            setCity(data.booth.city || "");
            setNeighborhood(data.booth.neighborhood || "");
            setAddress(data.booth.address || "");
            setPhone(data.booth.phone || "");
            setLogoUrl(data.booth.logoUrl || "");
            setLogoPreview(data.booth.logoUrl || "");
            setIsVisible(
              typeof data.booth.isVisible === "boolean"
                ? data.booth.isVisible
                : true
            );
          } else {
            setHasBooth(false);
          }
        } catch (err) {
          console.error("MARKETPLACE BOOTH GET ERROR:", err);
          setError("خطا در دریافت اطلاعات غرفه.");
        } finally {
          setLoading(false);
        }
      }

      loadBooth();
    }, []);

    async function handleLogoChange(file: File) {
      setError("");
      setMessage("");
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));

      try {
        setUploadingLogo(true);

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
          "/api/marketplace/seller/booth/logo",
          {
            method: "POST",
            credentials: "include",
            body: formData,
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success || !data.logoUrl) {
          setError(data.error || "آپلود تصویر غرفه انجام نشد.");
          return;
        }

        setLogoUrl(data.logoUrl);
        setLogoPreview(data.logoUrl);
      } catch (err) {
        console.error("MARKETPLACE BOOTH LOGO UPLOAD ERROR:", err);
        setError("خطا در آپلود تصویر غرفه. دوباره تلاش کن.");
      } finally {
        setUploadingLogo(false);
      }
    }

  async function handleSave() {
    if (saving || loading) return;

    setMessage("");
    setError("");

    if (!boothName.trim() || !description.trim() || !category || !city.trim()) {
      setError("لطفاً همه فیلدهای ضروری را کامل کن.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/marketplace/seller/booth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          boothName,
          description,
          category,
          city,
          neighborhood,
          address,
          phone,
            logoUrl,
          isVisible,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "ذخیره غرفه انجام نشد.");
        return;
      }

      setMessage(data.message || "غرفه با موفقیت ذخیره شد.");
    } catch (err) {
      console.error("MARKETPLACE BOOTH SAVE ERROR:", err);
      setError("خطا در ارتباط با سرور. دوباره تلاش کن.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-black px-4 py-6 text-white"
    >
      <div className="mx-auto max-w-[520px]">
        <div className="mb-6">

          <div className="rounded-3xl border-2 border-yellow-500/50 bg-zinc-950 p-5 shadow-lg">
            <div className="mb-6 text-center">
              <div className="mb-3 flex justify-center">
  <span className="relative inline-flex h-20 w-20 items-center justify-center [perspective:700px] [transform-style:preserve-3d]">
    <span
      aria-hidden="true"
      className="pointer-events-none absolute bottom-1 left-1/2 h-3 w-14 -translate-x-1/2 rounded-full bg-black/80 blur-md"
    />
    <span
      className="
        relative z-10 inline-block text-5xl
        [transform:perspective(700px)_rotateX(10deg)_rotateY(-6deg)_translateY(-3px)_translateZ(16px)]
        [transform-style:preserve-3d]
        [text-shadow:0_1px_0_rgba(255,255,255,0.4),1px_2px_0_rgba(0,0,0,0.98),2px_4px_0_rgba(0,0,0,0.9),3px_6px_0_rgba(0,0,0,0.72),4px_8px_0_rgba(0,0,0,0.5),0_12px_14px_rgba(0,0,0,0.6),0_0_12px_rgba(250,204,21,0.38)]
        transition-all duration-300
        hover:-translate-y-1 hover:scale-110
        hover:[transform:perspective(700px)_rotateX(5deg)_rotateY(-3deg)_translateY(-5px)_translateZ(24px)]
      "
    >
      🏪
    </span>
  </span>
</div>

              <h1 className="text-2xl font-bold text-yellow-400">
                ساخت غرفه
              </h1>

              <p className="mt-2 text-sm leading-6 text-gray-400">
                غرفه خودت را در بازارچه شهرکار بساز و کسب‌وکارت را معرفی کن.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  🏪 نام غرفه <span className="text-red-400">*</span>
                </label>

                <input
                  type="text"
                  value={boothName}
                  onChange={(e) => setBoothName(e.target.value)}
                  placeholder="مثلاً فروشگاه علی"
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  📝 معرفی کوتاه <span className="text-red-400">*</span>
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="کسب‌وکارت را کوتاه معرفی کن..."
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  🏷️ دسته فعالیت <span className="text-red-400">*</span>
                </label>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-yellow-500"
                >
                  <option value="">انتخاب دسته فعالیت</option>
                  <option value="products">فروش محصولات</option>
                  <option value="services">خدمات</option>
                  <option value="crafts">صنایع دستی</option>
                  <option value="food">غذا و خوراکی</option>
                  <option value="other">سایر</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  📍 شهر <span className="text-red-400">*</span>
                </label>

                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="مثلاً تهران"
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  📍 محدوده / محله <span className="text-blue-400">(اختیاری)</span>
                </label>

                <input
                  type="text"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="مثلاً صادقیه"
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  📍 آدرس <span className="text-blue-400">(اختیاری)</span>
                </label>

                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="آدرس غرفه یا محل فعالیت..."
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  📞 شماره تماس <span className="text-blue-400">(اختیاری)</span>
                </label>

                <input
                  type="tel"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09xxxxxxxxx"
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-left text-white outline-none transition focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  🖼️ تصویر / لوگوی غرفه <span className="text-blue-400">(اختیاری)</span>
                </label>

                    <div className="relative rounded-2xl border border-dashed border-zinc-700 bg-zinc-900 p-5">
                      <input
                        id="booth-logo"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];

                          if (!file) return;

                          void handleLogoChange(file);
                          event.target.value = "";
                        }}
                      />

                      <div className="relative flex flex-col items-center justify-center rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-5">
                        {logoPreview ? (
                          <>
                            <img
                              src={logoPreview}
                              alt="پیش‌نمایش لوگوی غرفه"
                              className="h-28 w-28 rounded-2xl object-cover"
                            />

                            <button
                              type="button"
                              onClick={() => {
                                setLogoUrl("");
                                setLogoFile(null);
                                setLogoPreview("");

                                const input = document.getElementById(
                                  "booth-logo"
                                ) as HTMLInputElement | null;

                                if (input) input.value = "";
                              }}
                              className="mt-4 flex h-11 min-w-11 items-center justify-center rounded-2xl border border-red-500/40 bg-red-950/70 px-8 py-3 font-bold text-red-300 shadow-lg shadow-red-500/20 transition-all hover:scale-105 hover:bg-red-900/80"
                              aria-label="حذف تصویر"
                              title="حذف تصویر"
                            >
                              🗑️
                            </button>
                          </>
                        ) : (
                          <label
                            htmlFor="booth-logo"
                            className="cursor-pointer text-4xl"
                            aria-label="انتخاب تصویر غرفه"
                            title="انتخاب تصویر غرفه"
                          >
                            📤
                          </label>
                        )}

                        <label
                          htmlFor="booth-logo"
                          className="mt-3 cursor-pointer font-medium text-green-400"
                        >
                          {logoPreview ? "🔄 تغییر تصویر" : "انتخاب تصویر"}
                        </label>

                        <span className="mt-1 text-xs text-gray-500">
                          PNG، JPG یا WEBP — حداکثر ۵ مگابایت
                        </span>
                      </div>
                    </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                <div>
                  <p className="font-medium">👁️ نمایش غرفه در بازارچه</p>

                  <p className="mt-1 text-xs text-gray-500">
                    این گزینه فقط روی خود غرفه اثر دارد، نه آگهی‌ها
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsVisible(!isVisible)}
                  aria-pressed={isVisible}
                  className={`relative h-7 w-12 rounded-full transition ${
                    isVisible ? "bg-green-500" : "bg-zinc-700"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                      isVisible ? "right-1" : "right-6"
                    }`}
                  />
                </button>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              {message && (
                <div className="rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                  {message}
                </div>
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className={`w-full rounded-2xl border px-8 py-3 font-bold shadow-lg transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 ${
  hasBooth
    ? "border-green-500/40 bg-green-950/70 text-green-300 shadow-green-500/20 hover:bg-green-900/80"
    : "border-green-500/40 bg-green-950/70 text-green-300 shadow-green-500/20 hover:bg-green-900/80"
}`}
              >
                {saving
  ? "⏳ در حال ذخیره..."
  : hasBooth
    ? "✏️ ویرایش اطلاعات"
    : "💾 ساخت غرفه"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/marketplace/seller")}
                className="mt-4 w-full rounded-2xl border border-yellow-500/40 bg-yellow-950/70 px-8 py-3 font-bold text-yellow-300 shadow-lg shadow-yellow-500/20 transition-all hover:scale-105 hover:bg-yellow-900/80"
              >
                ← بازگشت به پنل
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
