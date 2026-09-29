'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { UserRound, Building2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AuthShell } from '@/components/auth-shell'
import { Field } from '@/components/field'
import { cn } from '@/lib/utils'

import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { marketplaceAuth, marketplaceDb } from '@/lib/marketplace-firebase'


type Role = 'buyer' | 'seller'


export default function RegisterPage() {

  const router = useRouter()


  const [role, setRole] = useState<Role>('buyer')
  const [sellerGender, setSellerGender] = useState<'female' | 'male'>('female')


  const [form, setForm] = useState({

    name: '',
    email: '',
    phone: '',
    password: '',

  })
  const [agreed, setAgreed] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    setForm({

      ...form,

      [e.target.id]: e.target.value,

    })

  }



  const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>
) => {

  e.preventDefault()

  try {

    if (!form.name.trim()) {
      alert(role === "seller"
        ? "نام و نام خانوادگی فروشنده را وارد کنید."
        : "نام و نام خانوادگی خریدار را وارد کنید."
      )
      return
    }

    if (form.name.trim().length < 2) {
      alert("نام واردشده صحیح نیست.")
      return
    }

    if (!form.email.trim()) {
      alert("ایمیل را وارد کنید.")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(form.email.trim())) {
      alert("فرمت ایمیل صحیح نیست.")
      return
    }

    const phoneRegex = /^09\d{9}$/

    if (!phoneRegex.test(form.phone.trim())) {
    alert("خطا در فرمت شماره موبایل")
      return
    }

    if (!form.password) {
      alert("رمز عبور را وارد کنید.")
      return
    }

    if (form.password.length < 8) {
      alert("رمز عبور باید حداقل ۸ کاراکتر باشد.")
      return
    }

    if (!/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      alert("رمز عبور باید حداقل یک حرف انگلیسی و یک عدد داشته باشد.")
      return
    }

    if (!agreed) {
      alert("لطفاً قوانین و مقررات شهرکار را تأیید کنید.")
      return
    }
    const res = await fetch("/api/marketplace/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        role,
        agreed,
        sellerGender,
      }),
    })


    const text = await res.text()

let data

try {
  data = JSON.parse(text)
} catch {
  console.log("SERVER RESPONSE:", text)
  alert("پاسخ سرور نامعتبر است")
  return
}


       if (!res.ok || !data?.success) {
      alert(data?.error || "ثبت نام انجام نشد")
      return
    }


    alert("ثبت نام موفق بود")
    router.push(role === "buyer" ? "/marketplace/login?mode=buyer" : "/marketplace/login")


  } catch (error:any) {

    console.log(error)

    alert(
      error.message || "خطا در ثبت نام"
    )

  }

}

  return (
    <main
      className="relative min-h-screen w-full overflow-hidden bg-[#050505] px-4 py-8 text-white"
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% -10%, rgba(234,179,8,.14), transparent 32%), radial-gradient(circle at 100% 45%, rgba(234,179,8,.08), transparent 25%), radial-gradient(circle at 0% 80%, rgba(156,163,175,.06), transparent 25%), repeating-radial-gradient(ellipse at 50% -30%, transparent 0 58px, rgba(234,179,8,.06) 59px 60px, transparent 61px 118px)",
      }}
    >
      <div className="mx-auto flex w-full max-w-md flex-col items-center">

        {/* عنوان‌های بالای صفحه */}
        <header className="w-full text-center">
          <h1 className="text-xl font-extrabold text-yellow-300 sm:text-3xl drop-shadow-[0_0_25px_rgba(234,179,8,.18)]">
            🛍️ ثبت‌نام در بازارچه شهرکار
          </h1>

          <p className="mt-2 text-sm leading-6 text-white/45">
            خرید، فروش و معرفی کسب‌وکارها؛ سریع، ساده و مطمئن
          </p>

          <p className="mt-2 text-sm font-bold text-yellow-300">
            ☆ کسب‌وکارت رو به هزاران فرصت وصل کن ☆
          </p>
        </header>

        {/* انتخاب نوع حساب */}
        <div className="mt-6 grid w-full max-w-sm grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("buyer")}
            className={cn(
              "relative flex items-center justify-center gap-2 rounded-3xl border p-5 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5",
              role === "buyer"
                ? "border-green-400 bg-green-500/10 text-yellow-300 ring-2 ring-green-400/30"
                : "border-[#3b3528] bg-[#15120d]/90 text-white/45 hover:border-[#c9a34a]/60 hover:bg-[#1d180f]"
            )}
          >
            <span className="text-3xl">🛍️</span>
            <span>خریدار</span>

            {role === "buyer" && (
              <span className="absolute right-2 top-2 text-sm">✓</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setRole("seller")}
            className={cn(
              "relative flex items-center justify-center gap-2 rounded-3xl border p-5 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5",
              role === "seller"
                ? "border-yellow-400/50 bg-gradient-to-br from-yellow-500/[0.12] via-yellow-950/20 to-transparent text-yellow-300 ring-1 ring-yellow-400/20 shadow-[0_0_35px_rgba(234,179,8,.12)]"
                : "border-[#3b3528] bg-[#15120d]/90 text-white/45 hover:border-[#c9a34a]/60 hover:bg-[#1d180f]"
            )}
          >
            <span className="text-3xl">🏪</span>
            <span>فروشنده</span>

            {role === "seller" && (
              <span className="absolute right-2 top-2 text-sm">✓</span>
            )}
          </button>
        </div>

        {role === "seller" && (
          <div className="mt-4 grid w-full max-w-sm grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSellerGender("female")}
              className={cn(
                "relative flex items-center justify-center gap-2 rounded-3xl border p-5 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5",
                sellerGender === "female"
                  ? "border-yellow-400/50 bg-gradient-to-br from-yellow-500/[0.12] via-yellow-950/20 to-transparent text-yellow-300 ring-1 ring-yellow-400/20 shadow-[0_0_35px_rgba(234,179,8,.12)]"
                  : "border-[#3b3528] bg-[#15120d]/90 text-white/45 hover:border-[#c9a34a]/60 hover:bg-[#1d180f]"
              )}
            >
              <span className="text-3xl">👩</span>
              <span>زن</span>

              {sellerGender === "female" && (
                <span className="absolute right-2 top-2 text-sm">✓</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setSellerGender("male")}
              className={cn(
                "relative flex items-center justify-center gap-2 rounded-3xl border p-5 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5",
                sellerGender === "male"
                  ? "border-yellow-400/50 bg-gradient-to-br from-yellow-500/[0.12] via-yellow-950/20 to-transparent text-yellow-300 ring-1 ring-yellow-400/20 shadow-[0_0_35px_rgba(234,179,8,.12)]"
                  : "border-[#3b3528] bg-[#15120d]/90 text-white/45 hover:border-[#c9a34a]/60 hover:bg-[#1d180f]"
              )}
            >
              <span className="text-3xl">👨</span>
              <span>مرد</span>

              {sellerGender === "male" && (
                <span className="absolute right-2 top-2 text-sm">✓</span>
              )}
            </button>
          </div>
        )}

        {/* قاب فرم ثبت‌نام */}
        <section className="mt-5 w-full max-w-md rounded-3xl border border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:p-6">
          <div className="mb-5 text-center">
            <h2 className="text-lg font-black text-yellow-300">
              فرم ثبت‌نام
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              id="name"
              label={role === "seller" ? "نام شرکت" : "نام و نام خانوادگی"}
              value={form.name}
              onChange={handleChange}
              placeholder={
                role === "seller" ? "مثلاً شرکت شهرکار" : ""
              }
            />

            <Field
              id="email"
              label="ایمیل"
              type="email"
              dir="ltr"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="latin-font text-left"
            />

            <Field
              id="phone"
              label="شماره موبایل"
              type="tel"
              dir="ltr"
              value={form.phone}
              onChange={handleChange}
              placeholder="0912xxxxxxx"
              className="latin-font text-left"
            />

            <Field
              id="password"
              label="رمز عبور"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
            />

            <label className="flex items-start gap-2 text-sm text-white/45">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 size-4 accent-[#d8b45a]"
              />

              <span>
                با{" "}
                <Link
                  href="#"
                  className="text-yellow-300 hover:underline"
                >
                  قوانین و مقررات
                </Link>{" "}
                  شهرکار و بازارچه موافقم.
              </span>
            </label>

            <Button
              type="submit"
              size="lg"
              className="h-12 w-full rounded-2xl border border-green-500/40 bg-green-950/70 px-8 py-3 font-bold text-green-300 shadow-lg shadow-green-500/20 transition-all hover:scale-105 hover:bg-green-900/80"
            >
                {"🏪 ثبت‌نام و ورود به بازارچه"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-white/45">
            قبلاً ثبت‌نام کرده‌اید؟{" "}
            <Link
            href={role === "buyer" ? "/marketplace/login?mode=buyer" : "/marketplace/login?mode=seller"}
              className="font-medium text-yellow-300 hover:underline"
            >
              وارد شوید
            </Link>
          </p>

<div className="mt-5 flex justify-center">
  <Link
    href="/marketplace"
    className="rounded-2xl border border-yellow-500/40 bg-yellow-950/70 px-8 py-3 font-bold text-yellow-300 shadow-lg shadow-yellow-500/20 transition-all hover:scale-105 hover:bg-yellow-900/80"
  >
    ↩️ بازگشت به بازارچه
  </Link>
</div>
                </section>
      </div>
    </main>
  )
}
