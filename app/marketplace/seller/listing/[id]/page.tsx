"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MARKETPLACE_CATEGORY_LABELS,
  rankMarketplaceCategories,
  type MarketplaceCategory,
  type MarketplaceCategoryCandidate,
} from "@/lib/marketplace-category-ai";

type PriceType = "fixed" | "negotiable" | "free";

type Listing = {
  id: string;
  title?: string;
  category?: string;
  description?: string;
  price?: number | null;
  priceType?: PriceType | string;
  city?: string;
  imageUrls?: string[];
  isPublished?: boolean;
};

export default function SellerListingEditPage() {
  const params = useParams();
  const router = useRouter();

  const id = typeof params?.id === "string" ? params.id : "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [priceType, setPriceType] = useState<PriceType>("fixed");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [aiCategory, setAiCategory] = useState<MarketplaceCategory | "">("");
  const [aiConfidence, setAiConfidence] = useState(0);
  const [aiCandidates, setAiCandidates] = useState<
    MarketplaceCategoryCandidate[]
  >([]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadListing() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/marketplace/listings?mine=1`,
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "خطا در دریافت آگهی.");
        }

        const found = Array.isArray(data)
          ? data.find((item: Listing) => item.id === id)
          : null;

        if (!found) {
          throw new Error("آگهی پیدا نشد.");
        }

        if (!cancelled) {
          setTitle(found.title || "");
          setCategory(found.category || "");
          setDescription(found.description || "");
          setPriceType(
            found.priceType === "negotiable"
              ? "negotiable"
              : found.priceType === "free"
                ? "free"
                : "fixed"
          );
          setPrice(
            found.price === null || found.price === undefined
              ? ""
              : String(found.price)
          );
          setCity(found.city || "");
          setImageUrls(
            Array.isArray(found.imageUrls) ? found.imageUrls : []
          );
          setIsPublished(found.isPublished !== false);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "خطا در دریافت آگهی.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadListing();

    return () => {
      cancelled = true;
    };
  }, [id]);

  function analyzeCategoryWithAI() {
    const currentTitle = title.trim();
    const currentDescription = description.trim();

    if (!currentTitle && !currentDescription) {
      setAiCategory("");
      setAiConfidence(0);
      setAiCandidates([]);
      return;
    }

    setAiLoading(true);

    const candidates = rankMarketplaceCategories(
      currentTitle,
      currentDescription
    );

    const meaningfulCandidates = candidates
      .filter((candidate) => candidate.score > 0)
      .slice(0, 3);

    setAiCandidates(meaningfulCandidates);

    if (meaningfulCandidates.length === 0) {
      setAiCategory("other");
      setAiConfidence(0);
      setCategory("other");
      setAiLoading(false);
      return;
    }

    const top = meaningfulCandidates[0];
    const second = meaningfulCandidates[1];

    /*
     * اگر گزینه دوم واقعاً به گزینه اول نزدیک باشد،
     * انتخاب را به کاربر می‌سپاریم.
     */
    const isCloseMatch =
      !!second &&
      second.score / Math.max(top.score, 1) >= 0.65;

    if (isCloseMatch) {
      setAiCategory("");
      setAiConfidence(0);

      /*
       * اگر کاربر قبلاً یکی از همین گزینه‌ها را انتخاب کرده،
       * انتخابش حفظ می‌شود.
       */
      if (
        !meaningfulCandidates.some(
          (candidate) => candidate.category === category
        )
      ) {
        setCategory("");
      }
    } else {
      setAiCategory(top.category);
      setAiConfidence(top.confidence);
      setCategory(top.category);
    }

    setAiLoading(false);
  }
useEffect(() => {
    if (!loading) {
      analyzeCategoryWithAI();
    }
  }, [title, description, loading]);

  async function handleImageUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    setError("");
    setMessage("");
    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        if (
          !["image/jpeg", "image/png", "image/webp"].includes(
            file.type
          )
        ) {
          throw new Error(
            "فقط تصاویر JPG، PNG و WEBP مجاز هستند."
          );
        }

        if (file.size > 2 * 1024 * 1024) {
          throw new Error(
            "حجم هر تصویر نباید بیشتر از ۲ مگابایت باشد."
          );
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
          "/api/marketplace/seller/listing/images",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "خطا در آپلود تصویر."
          );
        }

        if (data.imageUrl) {
          uploadedUrls.push(data.imageUrl);
        }
      }

      setImageUrls((current) => [
        ...current,
        ...uploadedUrls,
      ]);

      setMessage("تصاویر با موفقیت آپلود شدند.");
    } catch (err: any) {
      setError(
        err?.message || "خطا در آپلود تصویر."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function removeImage(index: number) {
    setImageUrls((current) =>
      current.filter((_, i) => i !== index)
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (
      !title.trim() ||
      !category.trim() ||
      !description.trim() ||
      !city.trim()
    ) {
      setError(
        "عنوان، دسته‌بندی، توضیحات و شهر الزامی هستند."
      );
      return;
    }

    if (priceType !== "free" && !price.trim()) {
      setError("لطفاً مبلغ را وارد کنید.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "/api/marketplace/listings",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            title: title.trim(),
            category: category.trim(),
            description: description.trim(),
            priceType,
            price:
              priceType === "free"
                ? null
                : Number(price),
            city: city.trim(),
            imageUrls,
            isPublished,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "خطا در ویرایش آگهی."
        );
      }

      setMessage("آگهی با موفقیت ویرایش شد.");
    } catch (err: any) {
      setError(
        err?.message || "خطا در ویرایش آگهی."
      );
    } finally {
      setSaving(false);
    }
  }
    async function handlePublishToggle() {
      const nextValue = !isPublished;
      setIsPublished(nextValue);
      setSaving(true);
      setError("");
      setMessage("");
      try {
        const response = await fetch("/api/marketplace/listings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, isPublished: nextValue }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "خطا در تغییر وضعیت آگهی.");
        setMessage(nextValue ? "آگهی قابل مشاهده شد." : "آگهی مخفی شد.");
      } catch (err: any) {
        setIsPublished(!nextValue);
        setError(err?.message || "خطا در تغییر وضعیت آگهی.");
      } finally {
        setSaving(false);
      }
    }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#080808] px-4 py-8 text-white"
      >
        <div className="mx-auto max-w-2xl text-center text-sm text-white/60">
          در حال دریافت آگهی...
        </div>
      </main>
    );
  }

  if (error && !title && !description) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#080808] px-4 py-8 text-white"
      >
        <div className="mx-auto max-w-2xl rounded-3xl border border-red-500/20 bg-red-950/20 p-6 text-center">
          <p className="text-sm font-bold text-red-300">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/marketplace/seller/listing/manage"
              )
            }
            className="mt-5 w-full rounded-2xl border border-yellow-500/40 bg-yellow-950/70 px-5 py-3 font-bold text-yellow-300 shadow-lg shadow-yellow-500/20 transition-all hover:scale-105 hover:bg-yellow-900/80"
          >
            ← بازگشت به مدیریت آگهی‌ها
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#080808] px-4 py-8 text-white"
    >
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-yellow-500/20 bg-white/[0.03] p-5 shadow-2xl shadow-black/40 sm:p-7">

          <div className="mb-7 text-center">
            <div className="mb-2 text-4xl">✏️</div>

            <h1 className="text-2xl font-extrabold text-yellow-300">
              مشاهده / ویرایش آگهی
            </h1>

            <p className="mt-2 text-sm text-white/50">
              اطلاعات آگهی خود را مشاهده و ویرایش کنید.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm font-bold text-yellow-200">
                📝 عنوان آگهی
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-yellow-200">
                📄 توضیحات آگهی
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                rows={5}
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
              />

                <div className="mt-4 rounded-2xl border border-blue-500/20 bg-blue-950/20 p-4 shadow-lg shadow-blue-500/10">
                  <div className="flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-2 rounded-xl border border-blue-500/40 bg-blue-950/70 px-4 py-2 text-xs font-black text-blue-300 shadow-lg shadow-blue-500/20">
                      🤖 دسته‌بندی هوشمند
                    </div>

                    <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[9px] font-bold text-white/50">
                      تحلیل عنوان + توضیحات
                    </span>
                  </div>

                  {aiLoading && (
                    <div className="mt-3 rounded-xl border border-yellow-500/20 bg-yellow-950/20 px-3 py-3 text-center">
                      <p className="text-xs font-bold text-yellow-200/80">
                        🧠 در حال تحلیل آگهی...
                      </p>
                      <p className="mt-1 text-[9px] text-white/40">
                        عنوان و توضیحات با هم بررسی می‌شوند.
                      </p>
                    </div>
                  )}

                  {!aiLoading && aiCandidates.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-bold text-white/70">
                        دسته‌های مرتبط با آگهی:
                      </p>

                      <div className="mt-2 space-y-2">
                        {aiCandidates.slice(0, 3).map((candidate, index) => (
                          <button
                            key={candidate.category}
                            type="button"
                            onClick={() => {
                              setCategory(candidate.category);
                              setAiCategory(candidate.category);
                              setAiConfidence(candidate.confidence);
                            }}
                            className={`w-full rounded-xl border px-3 py-3 text-right transition-all hover:scale-[1.01] ${
                              category === candidate.category
                                ? "border-green-500/50 bg-green-950/50 text-green-300 shadow-lg shadow-green-500/10"
                                : "border-white/10 bg-white/[0.04] text-white/80 hover:border-blue-500/30 hover:bg-blue-950/20"
                            }`}
                          >
                            <span className="flex items-center justify-between gap-3">
                              <span className="flex min-w-0 items-center gap-2">
                                <span className="shrink-0 text-sm">
                                  {index === 0
                                    ? "🥇"
                                    : index === 1
                                      ? "🥈"
                                      : "🥉"}
                                </span>

                                <span className="truncate text-xs font-black">
                                  {MARKETPLACE_CATEGORY_LABELS[candidate.category]}
                                </span>
                              </span>

                              <span className="shrink-0 text-[9px] font-bold text-yellow-300">
                                {Math.round(candidate.confidence * 100)}٪
                              </span>
                            </span>

                            {category === candidate.category && (
                              <span className="mt-1 block text-[9px] font-bold text-green-300">
                                ✓ این دسته انتخاب شده
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {!aiLoading &&
                    aiCandidates.length === 0 &&
                    (title.trim() || description.trim()) && (
                      <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
                        <p className="text-xs font-bold text-white/60">
                          دسته تخصصی مطمئنی پیدا نشد.
                        </p>
                        <p className="mt-1 text-[9px] text-white/40">
                          در این حالت «سایر» به‌عنوان دسته پیش‌فرض استفاده می‌شود.
                        </p>
                      </div>
                    )}
                </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-yellow-200">
                💵 نوع قیمت
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPriceType("fixed")
                  }
                  className={`rounded-2xl border px-3 py-3 text-sm font-bold transition ${
                    priceType === "fixed"
                      ? "border-green-500/40 bg-green-950/70 text-green-300"
                      : "border-white/10 bg-white/[0.05] text-white/60"
                  }`}
                >
                  ثابت
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPriceType("negotiable")
                  }
                  className={`rounded-2xl border px-3 py-3 text-sm font-bold transition ${
                    priceType === "negotiable"
                      ? "border-green-500/40 bg-green-950/70 text-green-300"
                      : "border-white/10 bg-white/[0.05] text-white/60"
                  }`}
                >
                  توافقی
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPriceType("free")
                  }
                  className={`rounded-2xl border px-3 py-3 text-sm font-bold transition ${
                    priceType === "free"
                      ? "border-green-500/40 bg-green-950/70 text-green-300"
                      : "border-white/10 bg-white/[0.05] text-white/60"
                  }`}
                >
                  رایگان
                </button>
              </div>
            </div>

            {priceType !== "free" && (
              <div>
                <label className="mb-2 block text-sm font-bold text-yellow-200">
                  💰 قیمت
                </label>

                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(event) =>
                    setPrice(event.target.value)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-bold text-yellow-200">
                📍 شهر
              </label>

              <input
                type="text"
                value={city}
                onChange={(event) =>
                  setCity(event.target.value)
                }
                className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-yellow-200">
                🖼️ تصاویر آگهی
              </label>

              <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-yellow-500/30 bg-yellow-950/20 px-4 py-5 text-sm font-bold text-yellow-300 transition hover:bg-yellow-950/30">
                {uploading
                  ? "در حال آپلود..."
                  : "انتخاب تصاویر"}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              {imageUrls.length > 0 && (
                <div className="mt-4 space-y-2">
                  {imageUrls.map((url, index) => (
                    <div
                      key={`${url}-${index}`}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-2"
                    >
                      <img
                        src={url}
                        alt={`تصویر ${index + 1}`}
                        className="h-16 w-16 rounded-xl object-cover"
                      />

                      <span className="flex-1 truncate text-xs text-white/60">
                        تصویر {index + 1}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          removeImage(index)
                        }
                        className="rounded-xl bg-red-950/60 px-3 py-2 text-xs font-bold text-red-300"
                      >
                        حذف
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-blue-500/40 bg-blue-950/70 p-4 shadow-lg shadow-blue-500/20">
              <div className="text-sm font-bold text-blue-300">
                🏪 غرفه
              </div>

              <p className="mt-1 text-xs leading-6 text-blue-200/80">
                این آگهی به‌صورت خودکار به غرفه شما متصل است.
              </p>
            </div>

            <div>
                <button type="button" onClick={handlePublishToggle} className={`flex items-center gap-3 font-bold ${isPublished ? "text-green-300" : "text-gray-300"}`}>
                  <span>{isPublished ? "مشاهده" : "مخفی"}</span>
                  <span className={`relative h-6 w-12 rounded-full border ${isPublished ? "border-green-500/50 bg-green-950/70" : "border-gray-500/50 bg-gray-950/70"}`}>
                    <span className={`absolute top-1 h-4 w-4 rounded-full ${isPublished ? "left-1 bg-green-400" : "right-1 bg-gray-400"}`}></span>
                  </span>
                </button>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-950/30 px-4 py-3 text-sm font-bold text-red-300">
                {error}
              </div>
            )}

            {message && (
                <div className={`text-sm font-bold ${message.includes("مخفی") ? "text-red-300" : "text-green-300"}`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={saving || uploading}
              className="w-full rounded-2xl border border-green-500/40 bg-green-950/70 px-5 py-3 font-extrabold text-green-300 shadow-lg shadow-green-500/10 transition hover:scale-[1.01] hover:bg-green-900/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "در حال ذخیره..."
                : "💾 ذخیره تغییرات"}
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/marketplace/seller/listing/manage"
                )
              }
              className="w-full rounded-2xl border border-yellow-500/40 bg-yellow-950/70 px-5 py-3 font-bold text-yellow-300 shadow-lg shadow-yellow-500/20 transition-all hover:scale-105 hover:bg-yellow-900/80"
            >
              ← بازگشت به مدیریت آگهی‌ها
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
