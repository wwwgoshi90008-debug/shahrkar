"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { marketplaceAuth } from "@/lib/marketplace-firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

function LoginContent() {
  const router = useRouter();

    const loginMode =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("mode")
        : null;

    const isBuyerLogin = loginMode === "buyer";
    const isSellerLogin = loginMode === "seller";

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const sendCode = async () => {
    try {
      setLoading(true);

      if (!phone) {
        alert("شماره موبایل را وارد کنید");
        return;
      }

      const normalizedPhone = phone.trim().replace(/\s+/g, "");

      const firebasePhone = normalizedPhone.startsWith("09")
        ? "+98" + normalizedPhone.slice(1)
        : normalizedPhone;

      const checkResponse = await fetch("/api/marketplace/check-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: normalizedPhone,
        }),
      });

      const checkData = await checkResponse.json();

      if (!checkResponse.ok || !checkData?.success) {
        throw new Error(
          checkData?.error || "بررسی ثبت‌نام بازارچه انجام نشد."
        );
      }

      if (!checkData.registered) {
        alert("این شماره هنوز در بازارچه ثبت‌نام نکرده است. ابتدا ثبت‌نام کنید.");
        router.push("/marketplace/register");
        return;
      }

      const marketplaceRole = checkData.marketplaceRole || null;

      if (!isBuyerLogin && !isSellerLogin) {
        alert("نوع ورود مشخص نیست. لطفاً از دکمه ورود خریدار یا فروشنده وارد شوید.");
        return;
      }

      if (isBuyerLogin && marketplaceRole !== "buyer") {
        alert("این شماره حساب فروشنده است. برای ورود به پنل فروشنده وارد شوید.");
        return;
      }

      if (isSellerLogin && marketplaceRole !== "seller") {
        alert("این شماره حساب خریدار است. ابتدا از بخش ثبت‌نام، حساب را به فروشنده ارتقا دهید.");
        router.push("/marketplace/register");
        return;
      }

      const recaptcha = new RecaptchaVerifier(
        marketplaceAuth,
        "marketplace-recaptcha",
        {
          size: "invisible",
        },
      );

      const confirmation = await signInWithPhoneNumber(
        marketplaceAuth,
        firebasePhone,
        recaptcha,
      );

      setConfirmationResult(confirmation);
      setStep(2);

      alert("کد ارسال شد");
    } catch (error) {
      console.error("MARKETPLACE SEND OTP ERROR:", error);
      alert(error instanceof Error ? error.message : "خطا در ارسال کد");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    try {
      setLoading(true);

      if (!confirmationResult) {
        alert("ابتدا کد را درخواست کنید");
        return;
      }

      const result = await confirmationResult.confirm(code);
      const user = result.user;

      const idToken = await user.getIdToken();

      const sessionResponse = await fetch("/api/marketplace/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      const sessionData = await sessionResponse.json();

      if (!sessionResponse.ok || !sessionData.success) {
        throw new Error(
          sessionData.error || "ایجاد نشست بازارچه ناموفق بود.",
        );
      }

      localStorage.setItem(
        "marketplaceUser",
        JSON.stringify({
          uid: user.uid,
          phone: user.phoneNumber,
        }),
      );

      console.log("MARKETPLACE FIREBASE USER:", user.uid);
      console.log("MARKETPLACE SESSION CREATED");

          const roleResponse = await fetch("/api/marketplace/seller", {
            method: "GET",
            cache: "no-store",
          });

          const roleData = await roleResponse.json();
          const marketplaceRole = roleData?.marketplaceRole || null;

          if (!isBuyerLogin && !isSellerLogin) {
            alert("نوع ورود مشخص نیست. لطفاً از دکمه ورود خریدار یا فروشنده وارد شوید.");
            return;
          }

          if (isBuyerLogin && marketplaceRole !== "buyer") {
            alert("این شماره حساب خریدار نیست. لطفاً از بخش فروشنده وارد شوید.");
            return;
          }

          if (isSellerLogin && marketplaceRole !== "seller") {
            alert("این شماره حساب فروشنده نیست. لطفاً ابتدا به عنوان فروشنده ثبت‌نام کنید.");
            return;
          }

          alert("ورود موفق بود");

          router.push(
            isBuyerLogin ? "/marketplace/buyer" : "/marketplace/seller"
          );
    } catch (error) {
      console.error("MARKETPLACE VERIFY OTP ERROR:", error);

      alert(error instanceof Error ? error.message : "کد تایید اشتباه است");
    } finally {
      setLoading(false);
    }
  };

    return (
      <main
        className="relative min-h-screen w-full overflow-hidden bg-[#050505] px-4 py-8 text-white"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% -10%, rgba(234,179,8,.14), transparent 32%), radial-gradient(circle at 100% 45%, rgba(234,179,8,.08), transparent 25%), radial-gradient(circle at 0% 80%, rgba(156,163,175,.06), transparent 25%), repeating-radial-gradient(ellipse at 50% -30%, transparent 0 58px, rgba(234,179,8,.06) 59px 60px, transparent 61px 118px)",
        }}
      >
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
          <header className="mb-6 w-full text-center">
            <div className="mb-5 flex items-center justify-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-yellow-500/30" />
              <div className="flex size-14 items-center justify-center rounded-2xl border border-yellow-500/30 bg-white/[0.035] text-3xl shadow-lg shadow-yellow-500/10">
                🛍️
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-yellow-500/30" />
            </div>

            <h1 className="text-2xl font-black text-yellow-300 drop-shadow-[0_0_25px_rgba(234,179,8,.18)] sm:text-3xl">
              ورود به بازارچه شهرکار
            </h1>

            <p className="mt-3 text-sm font-bold text-yellow-300">
              «خرید و فروش، ساده و مطمئن»
            </p>
          </header>

          <section className="w-full rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:p-6">
            <div className="mb-6 text-center">
              <div className="inline-flex rounded-2xl border border-yellow-500/30 bg-yellow-950/40 px-5 py-2 text-sm font-bold text-yellow-300 shadow-lg shadow-yellow-500/10">
                {isBuyerLogin ? "ورود خریدار" : isSellerLogin ? "ورود فروشنده" : "ورود به حساب"}
              </div>
            </div>

            {step === 1 ? (
              <div className="space-y-5">
                <div id="marketplace-recaptcha" />

                <label className="block text-right text-sm font-bold text-white/70">
                  شماره موبایل
                </label>

                <input
                  type="tel"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912xxxxxxx"
                  className="latin-font w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition-all placeholder:text-white/25 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20"
                />

                <button
                  onClick={sendCode}
                  disabled={loading}
                  className="h-12 w-full rounded-2xl border border-green-500/40 bg-green-950/70 px-8 py-3 font-bold text-green-300 shadow-lg shadow-green-500/20 transition-all hover:scale-105 hover:bg-green-900/80 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "در حال ارسال..." : "ارسال کد"}
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <label className="block text-right text-sm font-bold text-white/70">
                  کد تایید
                </label>

                <input
                  type="tel"
                  dir="ltr"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  className="w-full rounded-2xl border border-[#59492d] bg-[#080806]/90 px-4 py-3 text-center font-bold tracking-[0.35em] text-[#f7edcf] outline-none transition-all placeholder:text-white/25 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20"
                />

                <button
                  onClick={verifyCode}
                  disabled={loading}
                  className="h-12 w-full rounded-2xl border border-green-500/40 bg-green-950/70 px-8 py-3 font-bold text-green-300 shadow-lg shadow-green-500/20 transition-all hover:scale-105 hover:bg-green-900/80 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "در حال بررسی..." : "ورود"}
                </button>
              </div>
            )}

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => router.push("/marketplace/register")}
                className="rounded-2xl border border-yellow-500/40 bg-yellow-950/70 px-8 py-3 font-bold text-yellow-300 shadow-lg shadow-yellow-500/20 transition-all hover:scale-105 hover:bg-yellow-900/80"
              >
                📝 ثبت‌نام در بازارچه
              </button>
            </div>

            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => router.push("/marketplace")}
                className="font-bold text-[#a9a18e] transition-colors hover:text-yellow-300"
              >
                ↩️ بازگشت به بازارچه
              </button>
            </div>
          </section>
        </div>
      </main>
    )
}

export default function LoginPage() {
  return <LoginContent />;
}
