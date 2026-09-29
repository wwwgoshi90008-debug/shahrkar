import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'بازارچه شهرکار',
}

export default function MarketplacePage() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-black px-4 py-6 text-white"
    >
      <div className="mx-auto w-full max-w-[520px]">

        {/* قاب اصلی */}
        <div
          className="
            relative
            overflow-hidden
            rounded-3xl
            border-2 border-yellow-500/50
            bg-black
            px-6 py-16
            shadow-none
          "
        >



          {/* عنوان */}
          <div className="relative text-center">
            <div className="text-lg font-black tracking-[0.12em] text-yellow-300">
              بازارچه شهرکار
            </div>

            <div className="mx-auto mt-3 h-px w-12 bg-yellow-500/30" />

            <p className="mt-4 text-xs text-white/45">
              خرید، فروش و معرفی کسب‌وکارها
            </p>
          </div>

          {/* معرفی */}
          <div className="relative mt-9 text-center">
            <h1 className="text-xl font-black text-white">
              بازار شهرکار
            </h1>

            <p className="mx-auto mt-3 max-w-[300px] text-sm font-bold leading-7 text-gray-300">
              پیدا کن، انتخاب کن، معامله کن؛ همه‌چیز در شهرکار.
              
            </p>
          </div>


          {/* انتخاب مسیر */}
                        {/* خریدار */}
            <div className="relative mt-9 space-y-5">
              <a
                href="/marketplace/buyer"
                className="
                  group block w-full
                  rounded-3xl
                  border border-gray-500/40
                  bg-gray-950/70
                  px-8 py-3
                  font-bold
                  text-gray-300
                  shadow-lg
                  shadow-gray-500/20
                  transition-all duration-300
                  hover:scale-105
                  hover:bg-gray-900/80
                "
              >
                <div className="flex items-center gap-5">

                  <div
                    className="
                      flex h-16 w-16 shrink-0
                      items-center justify-center
                      rounded-2xl
                      border border-gray-500/40
                      bg-gray-500/10
                      text-3xl
                      shadow-lg
                      shadow-gray-500/20
                      transition-transform duration-300
                      group-hover:scale-110
                    "
                  >
                    🛍️
                  </div>

                  <div className="text-right">
                    <h2 className="text-xl font-black text-yellow-300">
                      خریدارم
                    </h2>

                    <p className="mt-2 text-sm font-medium text-gray-100/50">
                      مشاهده آگهی‌ها و غرفه‌ها
                    </p>
                  </div>

                  <div
                    className="
                      mr-auto text-xl
                      text-gray-500/40
                      transition-transform
                      group-hover:-translate-x-1
                    "
                  >
                    ←
                  </div>

                </div>
              </a>


            {/* فروشنده */}
            <a
              href="/marketplace/register"
              className="
                group block w-full
                rounded-2xl
                border
                border-yellow-500/40
                bg-yellow-950/70
                px-8
                py-3
                font-bold
                text-yellow-300
                shadow-lg
                shadow-yellow-500/20
                transition-all
                hover:scale-105
                hover:bg-yellow-900/80
              "
            >
              <div className="flex items-center gap-5">

                <div
                  className="
                    flex h-16 w-16 shrink-0
                    items-center justify-center
                    rounded-2xl
                    border border-gray-500/40
                    bg-gray-500/10
                    text-3xl
                    shadow-lg
                    shadow-gray-500/20
                    transition-transform duration-300
                    group-hover:scale-110
                  "
                >
                  🏪
                </div>

                <div className="text-right">
                  <h2 className="text-xl font-black text-yellow-300">
                    فروشنده‌ام
                  </h2>

                  <p className="mt-2 text-sm font-medium text-gray-100/50">
                    غرفه من و مدیریت آگهی‌ها
                  </p>
                </div>

                <div
                  className="
                    mr-auto text-xl
                    text-gray-500/40
                    transition-transform
                    group-hover:-translate-x-1
                  "
                >
                  ←
                </div>

              </div>
            </a>

          </div>

          {/* توضیح پایین */}
          <div className="relative mt-8 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-center">
            <p className="text-[11px] leading-6 text-green-300">
              فروشنده‌ها می‌توانند آگهی‌های سایر غرفه‌ها را نیز
              مشاهده کنند.
            </p>
          </div>

          {/* برگشت */}
          <div className="relative mt-7 text-center">
            <a
              href="/"
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
              ← بازگشت به شهرکار
            </a>
          </div>

        </div>
      </div>
    </main>
  )
}
