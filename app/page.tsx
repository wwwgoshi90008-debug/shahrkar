import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'شهرکار',
}

export default function HomePage() {
  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-[#050505] text-white font-[var(--font-vazir)]"
    >
      {/* نورهای پس‌زمینه */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-yellow-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-gray-400/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-md items-center px-5 py-8">
        <div className="w-full">

          {/* هدر */}
          <header className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-yellow-400/30 bg-yellow-400/5 text-3xl shadow-[0_0_35px_rgba(234,179,8,0.12)]">
              ✦
            </div>

            <h1 className="text-3xl font-black tracking-tight text-yellow-300">
              شهرکار
            </h1>

            <div className="mx-auto mt-3 h-px w-16 bg-gradient-to-r from-transparent via-yellow-400/70 to-transparent" />

            <p className="mt-3 text-xs font-medium tracking-wide text-white/45">
              کار، مهارت و کسب‌وکار در یک شهر
            </p>
          </header>

          {/* پیام خوش‌آمد */}
          <section className="mb-7 rounded-[2rem] border border-white/10 bg-white/[0.035] px-5 py-6 text-center shadow-2xl shadow-black/50 backdrop-blur-sm">
            <p className="mb-4 text-sm font-bold text-yellow-300/90">
              به شهرکار خوش آمدید
            </p>

            <div className="space-y-1 text-[15px] font-bold leading-7 text-green-300">
              <div>چو بشناخت آهنگری پیشه کرد</div>
              <div>ز آهنگری ارّه و تیشه کرد</div>
            </div>

            <div className="mx-auto my-4 h-px w-12 bg-green-400/20" />

            <p className="text-[11px] font-medium leading-5 text-green-200/65">
              «هر مهارت، آغاز یک راه است.»
            </p>

            <p className="mt-2 text-[10px] leading-5 text-white/35">
              یعنی هر انسان با یادگیری یک مهارت،
              می‌تواند راه و آینده‌ای برای خود بسازد.
            </p>

            <div className="mt-3 text-[8px] tracking-[0.3em] latin-font text-green-300/35">
              فردوسی
            </div>
          </section>

          {/* انتخاب مسیر */}
          <section className="space-y-4">

            {/* شهرکار */}
            <a
              href="/home"
              className="group relative block overflow-hidden rounded-[1.5rem] border border-yellow-500/30 bg-gradient-to-br from-yellow-500/[0.12] via-yellow-950/20 to-transparent p-4 shadow-[0_10px_40px_rgba(234,179,8,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-yellow-400/60 hover:shadow-[0_15px_45px_rgba(234,179,8,0.16)]"
            >
              <div className="pointer-events-none absolute -left-10 -top-10 h-24 w-24 rounded-full bg-yellow-400/10 blur-2xl transition-all duration-500 group-hover:bg-yellow-400/20" />

              <div className="relative flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-yellow-400/30 bg-yellow-400/10 text-xl shadow-lg shadow-yellow-500/10">
                  💼
                </div>

                <div className="min-w-0 flex-1 text-right">
                  <h2 className="text-lg font-black text-yellow-300">
                    شهرکار
                  </h2>
                  <p className="mt-1 text-[11px] font-medium text-yellow-100/45">
                    کارفرما / کارجو
                  </p>
                </div>

                <div className="text-lg text-yellow-400/40 transition-transform duration-300 group-hover:-translate-x-1">
                  ←
                </div>
              </div>

              <div className="relative mt-4 h-px w-full bg-gradient-to-l from-yellow-400/20 via-yellow-400/5 to-transparent" />

              <p className="relative mt-3 text-[9px] font-medium text-white/30">
                فرصت‌های شغلی و مسیر حرفه‌ای شما
              </p>
            </a>

            {/* بازارچه */}
            <a
              href="/marketplace/register"
              className="group relative block overflow-hidden rounded-[1.5rem] border border-white/15 bg-gradient-to-br from-white/[0.08] via-gray-900/50 to-transparent p-4 shadow-[0_10px_40px_rgba(255,255,255,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/[0.09]"
            >
              <div className="pointer-events-none absolute -left-10 -top-10 h-24 w-24 rounded-full bg-white/5 blur-2xl transition-all duration-500 group-hover:bg-white/10" />

              <div className="relative flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] text-xl shadow-lg shadow-black/30">
                  🏪
                </div>

                <div className="min-w-0 flex-1 text-right">
                  <h2 className="text-lg font-black text-gray-200">
                    بازارچه شهرکار
                  </h2>
                  <p className="mt-1 text-[11px] font-medium text-gray-100/45">
                    فروشنده / خریدار
                  </p>
                </div>

                <div className="text-lg text-gray-400/40 transition-transform duration-300 group-hover:-translate-x-1">
                  ←
                </div>
              </div>

              <div className="relative mt-4 h-px w-full bg-gradient-to-l from-white/15 via-white/5 to-transparent" />

              <p className="relative mt-3 text-[9px] font-medium text-white/30">
                خرید، فروش و معرفی کسب‌وکارها
              </p>
            </a>

          </section>

          {/* پایین */}
          <footer className="mt-7 text-center">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-yellow-400/25" />
            <p className="text-[8px] tracking-[0.25em] text-white/20">
              <span className="latin-font">SHAHRKAR</span>
            </p>
          </footer>

        </div>
      </div>
    </main>
  )
}
