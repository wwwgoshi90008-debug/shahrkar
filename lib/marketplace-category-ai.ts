export const MARKETPLACE_CATEGORIES = [
  "handmade",
  "beauty",
  "digital",
  "used",
  "home",
  "car",
  "fashion",
  "furniture",
  "kids",
  "garden",
  "books",
  "repairs",
  "home_services",
  "music",
  "sports",
  "other",
  "jewelry",
  "gaming",
] as const;

export type MarketplaceCategory =
  (typeof MARKETPLACE_CATEGORIES)[number];

export type MarketplaceCategoryResult = {
  category: MarketplaceCategory;
  confidence: number;
};

export type MarketplaceCategoryCandidate = {
  category: MarketplaceCategory;
  score: number;
  confidence: number;
};

export type CategoryRule = {
  category: MarketplaceCategory;
  keywords: string[];
  phrases?: string[];
  related?: string[];
  negative?: string[];
};

export const MARKETPLACE_CATEGORY_LABELS: Record<
  MarketplaceCategory,
  string
> = {
  handmade: "🎨 صنایع دستی",
  beauty: "💄 زیبایی و بهداشت",
  digital: "💻 خدمات دیجیتال",
  used: "♻️ کالای دسته دوم",
  home: "🏠 خانه و ملک",
  car: "🚗 ماشین",
  fashion: "👕 پوشاک و مد",
  furniture: "🪑 لوازم خانه",
  kids: "🧸 نرم‌افزار و اسباب‌بازی",
  garden: "🌱 کشاورزی و باغبانی",
  books: "📚 کتاب و آموزش",
  repairs: "🔧 تعمیرات و خدمات فنی",
  home_services: "🧹 خدمات منزل",
  music: "🎵 موسیقی و ساز",
  sports: "⚽ ورزش و سرگرمی",
  other: "📦 سایر",
  jewelry: "💎 زیور آلات تزئینی",
  gaming: "🎮 گیمینگ",
};

const RULES: CategoryRule[] = [
  {
    category: "handmade",
    keywords: [
      "صنایع دستی",
      "دست ساز",
      "دست‌ساز",
      "دستباف",
      "دست باف",
      "دست‌باف",
      "دستدوز",
      "دست دوز",
      "دست‌دوز",
      "هنری",
      "سفال",
      "سفالگری",
      "سرامیک",
      "معرق",
      "منبت",
      "مشبک",
      "مکرومه",
      "بافتنی",
      "بافندگی",
      "حصیری",
      "حصیربافی",
      "گلیم",
      "گبه",
      "جاجیم",
      "ترمه",
      "خاتم",
      "قلمکاری",
      "میناکاری",
      "فیروزه کوبی",
      "نمدمالی",
      "چرم دست ساز",
      "زیورآلات دست ساز",
      "اثر هنری",
      "کار هنری",
      "کار دست",
      "دکوری دست ساز",
    ],
    phrases: [
      "دیوارکوب",
      "دیوار کوب",
      "تابلو دیواری",
      "آویز دیواری",
      "قلاب دیواری",
      "دکوری دیواری",
      "تزئینات دیواری",
      "صنایع چوبی",
      "کار چوبی",
      "محصول چوبی هنری",
      "مجسمه دست ساز",
      "عروسک دست ساز",
      "هدیه دست ساز",
    ],
    related: [
      "دکور",
      "دکوری",
      "تزئینی",
      "آویز",
      "قلاب",
      "تابلو",
      "مجسمه",
      "عروسک",
      "چوبی",
      "بافت",
      "هنرمند",
    ],
  },

  {
    category: "beauty",
    keywords: [
      "آرایشی",
      "آرایش",
      "بهداشتی",
      "کرم",
      "شامپو",
      "عطر",
      "ادکلن",
      "لوازم آرایش",
      "مراقبت پوست",
      "مراقبت مو",
      "ماسک صورت",
      "ضدآفتاب",
      "سرم پوست",
      "تونر",
      "شوینده صورت",
      "رژلب",
      "ریمل",
      "پنکیک",
      "اسکراب",
      "صابون",
      "محصول بهداشتی",
    ],
    related: [
      "زیبایی",
      "آرایشگر",
      "مراقبت",
      "پوستی",
      "بهداشت",
    ],
  },

  {
    category: "digital",
    keywords: [
      "نرم افزار",
      "نرم‌افزار",
      "اپلیکیشن",
      "اپ",
      "سایت",
      "وب سایت",
      "وب‌سایت",
      "طراحی سایت",
      "برنامه نویسی",
      "برنامه‌نویسی",
      "کدنویسی",
      "کامپیوتر",
      "لپ تاپ",
      "لپ‌تاپ",
      "موبایل",
      "گوشی",
      "خدمات دیجیتال",
      "گرافیک",
      "فتوشاپ",
      "تولید محتوا",
      "سئو",
      "شبکه",
      "سرور",
      "دیتا",
      "داده",
      "هوش مصنوعی",
      "فناوری",
      "تکنولوژی",
      "طراحی گرافیک",
      "طراحی لوگو",
      "لوگو",
      "فروشگاه اینترنتی",
      "اپلیکیشن موبایل",
      "خدمات کامپیوتری",
      "خدمات اینترنتی",
    ],
    related: [
      "دیجیتال",
      "آنلاین",
      "اینترنت",
      "کامپیوتری",
      "فناوری",
      "سیستم",
      "وب",
    ],
  },

  {
    category: "used",
    keywords: [
      "دست دوم",
      "دست‌دوم",
      "دست دو",
      "کارکرده",
      "کارکرد",
      "استوک",
      "استفاده شده",
      "استفاده‌شده",
      "قبلا استفاده شده",
      "قبلاً استفاده شده",
      "در حد نو",
      "درحد نو",
      "مثل نو",
      "کم کارکرد",
      "کم‌کارکرد",
    ],
    related: [
      "کارکرد",
      "استفاده",
      "تمیز",
      "سالم",
      "فروش مجدد",
    ],
  },
];

RULES.push(
  {
    category: "home",
    keywords: [
      "خانه",
      "ملک",
      "آپارتمان",
      "خانه مسکونی",
      "زمین",
      "ویلا",
      "اجاره",
      "فروش ملک",
      "رهن",
      "رهن و اجاره",
      "املاک",
      "واحد مسکونی",
      "دفتر",
      "مغازه",
      "سوله",
      "زمین کشاورزی",
    ],
    phrases: [
      "فروش خانه",
      "فروش آپارتمان",
      "اجاره خانه",
      "اجاره آپارتمان",
      "رهن کامل",
      "رهن و اجاره",
      "ملک مسکونی",
      "املاک و مستغلات",
    ],
    related: [
      "مسکونی",
      "ساختمان",
      "ساختمانی",
      "واحد",
      "ملکی",
      "اجاره‌ای",
      "اجاره ای",
    ],
  },

  {
    category: "car",
    keywords: [
      "ماشین",
      "خودرو",
      "اتومبیل",
      "سواری",
      "موتورسیکلت",
      "موتور سیکلت",
      "قطعات خودرو",
      "لوازم یدکی",
      "لاستیک",
      "رینگ",
      "باتری خودرو",
      "قطعه خودرو",
      "خودروی",
      "خودروهای",
      "ماشین سواری",
    ],
    phrases: [
      "خودروی دست دوم",
      "ماشین دست دوم",
      "فروش خودرو",
      "فروش ماشین",
      "خرید خودرو",
      "لوازم یدکی خودرو",
      "قطعات ماشین",
    ],
    related: [
      "رانندگی",
      "وسیله نقلیه",
      "نقلیه",
      "خودرویی",
      "موتوری",
      "یدکی",
    ],
  },

  {
    category: "fashion",
    keywords: [
      "پوشاک",
      "لباس",
      "پیراهن",
      "شلوار",
      "مانتو",
      "کت",
      "کفش",
      "کیف",
      "مد",
      "بوت",
      "کتانی",
      "لباس زنانه",
      "لباس مردانه",
      "لباس بچگانه",
      "روسری",
      "شال",
      "چادر",
      "جوراب",
      "پالتو",
      "کاپشن",
      "دامن",
      "لباس مجلسی",
      "لباس رسمی",
      "اکسسوری",
      "زیورآلات",
    ],
    phrases: [
      "کت و شلوار",
      "لباس مجلسی",
      "لباس رسمی",
      "لباس زنانه",
      "لباس مردانه",
      "لباس بچگانه",
      "کفش ورزشی",
      "کیف زنانه",
    ],
    related: [
      "پوشیدنی",
      "استایل",
      "فشن",
      "زنانه",
      "مردانه",
      "مجلسی",
      "سایز",
    ],
  },

  {
    category: "jewelry",
    keywords: [
      "زیور آلات تزئینی",
      "زیورآلات تزئینی",
      "زیور آلات",
      "زیورآلات",
      "بدلیجات",
      "بدلی",
      "بدلیجات زنانه",
      "بدلیجات مردانه",
      "بدلیجات دخترانه",
      "بدلیجات پسرانه",
      "اکسسوری",
      "اکسسوری زنانه",
      "اکسسوری مردانه",
      "اکسسوری دخترانه",
      "اکسسوری پسرانه",
      "گردنبند",
      "گردن بند",
      "گردن‌بند",
      "دستبند",
      "دست بند",
      "دست‌بند",
      "انگشتر",
      "گوشواره",
      "گوش واره",
      "گوش‌واره",
      "پابند",
      "خلخال",
      "سنجاق سینه",
      "گیره مو",
      "تل مو",
      "دستبند بافت",
      "گردنبند دست ساز",
      "گردنبند دست‌ساز",
      "زیورآلات دست ساز",
      "زیورآلات دست‌ساز",
      "مهره",
      "مروارید",
      "سنگ تزئینی",
      "سنگ‌های تزئینی",
      "نیم ست",
      "نیم‌ست",
      "ست زیورآلات",
      "ست بدلیجات",
      "زنجیر",
      "زنجیر تزئینی",
      "آویز",
      "آویز گردنبند",
      "آویز کیف",
      "آویز موبایل",
      "جواهرات تزئینی",
      "زیور تزئینی",
    ],
    phrases: [
      "زیور آلات تزئینی",
      "زیورآلات تزئینی",
      "بدلیجات زنانه",
      "بدلیجات مردانه",
      "ست زیورآلات",
      "ست بدلیجات",
      "گردنبند دست ساز",
      "زیورآلات دست ساز",
    ],
    related: [
      "اکسسوری",
      "تزئینی",
      "زینتی",
      "آویز",
      "بدلی",
    ],
  },
  {
    category: "gaming",
    keywords: [
      "گیمینگ",
      "گیم",
      "بازی",
      "بازی ویدیویی",
      "بازی ویدئویی",
      "بازی های ویدیویی",
      "بازی‌های ویدیویی",
      "بازی کامپیوتری",
      "بازی رایانه ای",
      "بازی رایانه‌ای",
      "ویدیو گیم",
      "ویدئو گیم",
      "کنسول",
      "کنسول بازی",
      "کنسول گیم",
      "پلی استیشن",
      "پلی‌استیشن",
      "PS",
      "PS2",
      "PS3",
      "PS4",
      "PS5",
      "ایکس باکس",
      "Xbox",
      "Xbox One",
      "Xbox Series S",
      "Xbox Series X",
      "نینتندو",
      "Nintendo",
      "Switch",
      "نینتندو سوییچ",
      "نینتندو سوئیچ",
      "Steam Deck",
      "استیم دک",
      "کنسول دستی",
      "دسته بازی",
      "گیم پد",
      "گیم‌پد",
      "جوی استیک",
      "جوی‌استیک",
      "کنترلر",
      "دسته PS5",
      "دسته PS4",
      "دسته Xbox",
      "هدست گیمینگ",
      "هدفون گیمینگ",
      "کیبورد گیمینگ",
      "ماوس گیمینگ",
      "موس گیمینگ",
      "مانیتور گیمینگ",
      "صندلی گیمینگ",
      "میز گیمینگ",
      "لوازم گیمینگ",
      "تجهیزات گیمینگ",
      "لوازم جانبی کنسول",
      "بازی PS5",
      "بازی PS4",
      "بازی Xbox",
      "بازی کامپیوتری",
      "سی دی بازی",
      "سی‌دی بازی",
      "دیسک بازی",
      "DVD بازی",
      "کارتریج بازی",
      "گیفت کارت بازی",
      "گیفت کارت پلی استیشن",
      "گیفت کارت Xbox",
      "اکانت بازی",
      "اکانت PS",
      "اکانت Xbox",
    ],
    phrases: [
      "کنسول بازی",
      "پلی استیشن",
      "پلی‌استیشن",
      "Xbox Series S",
      "Xbox Series X",
      "نینتندو سوییچ",
      "نینتندو سوئیچ",
      "هدست گیمینگ",
      "کیبورد گیمینگ",
      "ماوس گیمینگ",
      "مانیتور گیمینگ",
      "صندلی گیمینگ",
      "لوازم جانبی کنسول",
      "بازی PS5",
      "بازی PS4",
      "بازی Xbox",
    ],
    related: [
      "کنسول",
      "بازی",
      "گیمر",
      "گیمرها",
      "گیم",
      "گیمینگ",
    ],
  },
  {
    category: "furniture",
    keywords: [
      "مبل",
      "مبلمان",
      "صندلی",
      "میز",
      "کمد",
      "تخت",
      "تشک",
      "دکوراسیون",
      "لوازم خانه",
      "وسایل خانه",
      "کتابخانه",
      "میز ناهارخوری",
      "میز تحریر",
      "میز کامپیوتر",
      "میز تلویزیون",
      "کمد دیواری",
      "ویترین",
      "بوفه",
      "جاکفشی",
      "جالباسی",
      "تخت خواب",
      "سرویس خواب",
      "صندلی اداری",
      "مبلمان اداری",
      "لوازم منزل",
      "وسایل منزل",
      "دکور خانه",
      "دکور منزل",
    ],
    phrases: [
      "مبل راحتی",
      "مبل استیل",
      "سرویس خواب",
      "میز ناهارخوری",
      "میز تلویزیون",
      "کمد دیواری",
      "دکوراسیون منزل",
      "دکوراسیون خانه",
    ],
    related: [
      "خانه",
      "منزل",
      "اتاق",
      "دکور",
      "دکوری",
      "چوبی",
      "اثاث",
    ],
  },

  {
    category: "kids",
    keywords: [
      "کودک",
      "بچه",
      "نوزاد",
      "اسباب بازی",
      "اسباب‌بازی",
      "بازی کودک",
      "لباس کودک",
      "لوازم کودک",
      "کالسکه",
      "تخت کودک",
      "عروسک",
      "ماشین اسباب بازی",
      "بازی فکری",
      "پازل",
      "لگو",
      "بازی آموزشی کودک",
      "اسباب بازی کودک",
    ],
    phrases: [
      "اسباب بازی کودک",
      "بازی فکری کودک",
      "لوازم نوزاد",
      "لباس نوزاد",
      "ماشین اسباب بازی",
    ],
    related: [
      "بچگانه",
      "کودکان",
      "نوزادی",
      "بازی",
      "هدیه کودک",
    ],
  },

  {
    category: "garden",
    keywords: [
      "کشاورزی",
      "باغبانی",
      "باغ",
      "گل",
      "گیاه",
      "نهال",
      "بذر",
      "کود",
      "ابزار باغبانی",
      "گلخانه",
      "گلدان",
      "خاک",
      "سمپاش",
      "آبیاری",
      "شیلنگ",
      "قیچی باغبانی",
      "بیل",
      "کلنگ",
      "گیاه آپارتمانی",
      "درخت",
      "درختچه",
      "کاکتوس",
      "ساکولنت",
      "گل و گیاه",
    ],
    phrases: [
      "ابزار باغبانی",
      "گل و گیاه",
      "گیاه آپارتمانی",
      "گلخانه",
      "لوازم باغبانی",
      "بذر گیاه",
    ],
    related: [
      "سبز",
      "طبیعت",
      "گیاهان",
      "گل‌ها",
      "باغچه",
      "کشاورز",
      "کاشت",
      "پرورش",
    ],
  },

  {
    category: "books",
    keywords: [
      "کتاب",
      "جزوه",
      "آموزش",
      "دوره آموزشی",
      "دوره",
      "درس",
      "دانشگاه",
      "مدرسه",
      "کنکور",
      "زبان",
      "آموزشی",
      "رمان",
      "داستان",
      "کتاب درسی",
      "کتاب دانشگاهی",
      "کتاب زبان",
      "کتاب کودک",
      "کتاب کمک آموزشی",
      "کمک آموزشی",
      "مجله",
      "دایره المعارف",
      "دایرة المعارف",
    ],
    phrases: [
      "کتاب آموزشی",
      "کتاب دانشگاهی",
      "کتاب درسی",
      "کتاب زبان",
      "کتاب کودک",
      "کتاب کمک آموزشی",
      "دوره آموزشی",
    ],
    related: [
      "مطالعه",
      "مطالعات",
      "یادگیری",
      "دانش",
      "تحصیل",
      "دانش آموز",
      "دانشجو",
      "نویسنده",
      "خواندن",
    ],
  }
);

console.log("STEP_2_RULES_ADDED");

RULES.push(
  {
    category: "repairs",
    keywords: [
      "تعمیر",
      "تعمیرات",
      "تعمیرکار",
      "تعمیرکاری",
      "سرویس",
      "سرویسکار",
      "فنی",
      "فنی کار",
      "فنی‌کار",
      "نصب",
      "نصاب",
      "عیب یابی",
      "عیب‌یابی",
      "تعمیر لوازم خانگی",
      "تعمیر یخچال",
      "تعمیر لباسشویی",
      "تعمیر ظرفشویی",
      "تعمیر کولر",
      "تعمیر تلویزیون",
      "تعمیر موبایل",
      "تعمیر لپ تاپ",
      "تعمیر کامپیوتر",
      "تعمیر برق",
      "برقکاری",
      "برق‌کاری",
      "لوله کشی",
      "لوله‌کشی",
      "تاسیسات",
      "تأسیسات",
      "جوشکاری",
      "نجاری",
      "درب و پنجره",
      "تعمیر خودرو",
      "مکانیکی",
    ],
    phrases: [
      "تعمیر لوازم خانگی",
      "تعمیر یخچال",
      "تعمیر فریزر",
      "تعمیر لباسشویی",
      "تعمیر ظرفشویی",
      "تعمیر کولر گازی",
      "تعمیر آبگرمکن",
      "تعمیر پکیج",
      "تعمیر تلویزیون",
      "تعمیر موبایل",
      "تعمیر لپ تاپ",
      "تعمیر کامپیوتر",
      "خدمات برق ساختمان",
      "خدمات تاسیسات",
      "خدمات فنی",
      "تعمیر خودرو",
      "تعمیر موتور",
    ],
    related: [
      "خرابی",
      "عیب",
      "قطعه",
      "سرویس",
      "نصب",
      "تعویض",
      "تعمیرکار",
    ],
  },

  {
    category: "home_services",
    keywords: [
      "خدمات منزل",
      "خدمات خانه",
      "نظافت",
      "نظافت منزل",
      "نظافت خانه",
      "نظافتچی",
      "نظافتکار",
      "تمیزکاری",
      "خانه تکانی",
      "خانه‌تکانی",
      "قالیشویی",
      "مبل شویی",
      "مبل‌شویی",
      "شستشوی مبل",
      "شستشوی فرش",
      "اسباب کشی",
      "اسباب‌کشی",
      "باربری",
      "کارگر اسباب کشی",
      "بسته بندی",
      "بسته‌بندی",
      "باغبان منزل",
      "خدمات ساختمانی",
      "خدمات نظافتی",
    ],
    phrases: [
      "نظافت منزل",
      "نظافت خانه",
      "نظافتچی منزل",
      "خدمات نظافت",
      "قالیشویی در منزل",
      "مبل شویی",
      "شستشوی مبل",
      "شستشوی فرش",
      "اسباب کشی منزل",
      "اسباب‌کشی منزل",
      "باربری منزل",
      "خدمات منزل",
    ],
    related: [
      "تمیزی",
      "شستشو",
      "نظافت",
      "خانه",
      "منزل",
      "کارگر",
      "خدمات",
    ],
  },

  {
    category: "music",
    keywords: [
      "موسیقی",
      "ساز",
      "ساز موسیقی",
      "گیتار",
      "پیانو",
      "کیبورد",
      "ارگ",
      "ویولن",
      "ویلن",
      "ویولا",
      "چلو",
      "دف",
      "تنبک",
      "تار",
      "سه تار",
      "سه‌تار",
      "سنتور",
      "عود",
      "کمانچه",
      "نی",
      "هنگ درام",
      "درام",
      "درامز",
      "بیس",
      "ساکسیفون",
      "ترومپت",
      "فلوت",
      "میکروفون",
      "میدی",
      "آمپلی فایر",
      "آمپلی‌فایر",
      "اسپیکر موسیقی",
      "لوازم موسیقی",
      "استودیو موسیقی",
    ],
    phrases: [
      "ساز موسیقی",
      "آلات موسیقی",
      "لوازم موسیقی",
      "گیتار کلاسیک",
      "گیتار الکتریک",
      "گیتار آکوستیک",
      "پیانو دیجیتال",
      "سه تار",
      "سه‌تار",
      "دف و تنبک",
      "استودیو موسیقی",
    ],
    related: [
      "نوازنده",
      "نوازندگی",
      "آهنگ",
      "خواننده",
      "تمرین",
      "ملودی",
      "آوا",
    ],
  },

  {
    category: "sports",
    keywords: [
      "ورزش",
      "ورزشی",
      "فوتبال",
      "فوتسال",
      "والیبال",
      "بسکتبال",
      "تنیس",
      "پینگ پنگ",
      "پینگ‌پنگ",
      "بدنسازی",
      "بدنسازی",
      "دوچرخه",
      "دوچرخه سواری",
      "دوچرخه‌سواری",
      "کوهنوردی",
      "کوه",
      "کمپینگ",
      "شنا",
      "استخر",
      "رزمی",
      "بوکس",
      "کاراته",
      "تکواندو",
      "کشتی",
      "یوگا",
      "پیلاتس",
      "توپ",
      "راکت",
      "دمبل",
      "تردمیل",
      "دستگاه بدنسازی",
      "لوازم ورزشی",
      "لباس ورزشی",
      "کفش ورزشی",
      "اسکوتر",
      "اسکیت",
      "اسکیت برد",
      "اسکیت‌برد",
    ],
    phrases: [
      "لوازم ورزشی",
      "تجهیزات ورزشی",
      "لباس ورزشی",
      "کفش ورزشی",
      "دستگاه بدنسازی",
      "دوچرخه سواری",
      "کفش فوتبال",
      "توپ فوتبال",
      "راکت تنیس",
      "وسایل کمپینگ",
    ],
    related: [
      "بازیکن",
      "مسابقه",
      "تمرین",
      "تیم",
      "مربی",
      "قهرمانی",
      "سلامتی",
    ],
  }
);

console.log("STEP_3_NEW_CATEGORIES_ADDED");

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/ي/g, "ی")
    .replace(/ى/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/ۀ/g, "ه")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/إ/g, "ا")
    .replace(/أ/g, "ا")
    .replace(/آ/g, "ا")
    .replace(/\u200c/g, " ")
    .replace(/ـ/g, "")
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string): string[] {
  const normalized = normalizeText(text);
  return normalized ? normalized.split(" ") : [];
}

function containsPhrase(text: string, phrase: string): boolean {
  const normalizedText = normalizeText(text);
  const normalizedPhrase = normalizeText(phrase);

  if (!normalizedText || !normalizedPhrase) return false;

  const escaped = normalizedPhrase.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  return new RegExp(
    `(^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`,
    "u"
  ).test(normalizedText);
}

function countPhrase(text: string, phrase: string): number {
  const normalizedText = normalizeText(text);
  const normalizedPhrase = normalizeText(phrase);

  if (!normalizedText || !normalizedPhrase) return 0;

  const escaped = normalizedPhrase.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  const matches = normalizedText.match(
    new RegExp(
      `(^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`,
      "gu"
    )
  );

  return matches ? matches.length : 0;
}

function tokenSet(text: string): Set<string> {
  return new Set(tokenize(text));
}

function hasAnyPhrase(text: string, phrases: string[]): boolean {
  return phrases.some((phrase) => containsPhrase(text, phrase));
}

function hasAllPhrases(text: string, phrases: string[]): boolean {
  return phrases.every((phrase) => containsPhrase(text, phrase));
}

function addScore(
  scores: Map<MarketplaceCategory, number>,
  category: MarketplaceCategory,
  amount: number
): void {
  scores.set(category, (scores.get(category) ?? 0) + amount);
}

function getSafeScore(
  scores: Map<MarketplaceCategory, number>,
  category: MarketplaceCategory
): number {
  return scores.get(category) ?? 0;
}

console.log("STEP_4_TEXT_ENGINE_READY");

function calculateScores(
  title: string,
  description: string
): Map<MarketplaceCategory, number> {
  const scores = new Map<MarketplaceCategory, number>();

  const normalizedTitle = normalizeText(title);
  const normalizedDescription = normalizeText(description);
  const fullText = normalizeText(
    `${normalizedTitle} ${normalizedDescription}`
  );

  for (const rule of RULES) {
    let score = 0;
    let evidence = 0;

    let titleScore = 0;
    let descriptionScore = 0;
    let titleEvidence = 0;
    let descriptionEvidence = 0;

    for (const keyword of rule.keywords) {
      const normalizedKeyword = normalizeText(keyword);
      if (!normalizedKeyword) continue;

      const titleCount = Math.min(
        countPhrase(normalizedTitle, normalizedKeyword),
        2
      );

      const descriptionCount = Math.min(
        countPhrase(normalizedDescription, normalizedKeyword),
        2
      );

      if (titleCount > 0) {
        const base =
          normalizedKeyword.length >= 8
            ? 10
            : normalizedKeyword.length >= 5
              ? 8
              : 6;

        const value = base * titleCount;

        titleScore += value;
        score += value;

        titleEvidence += 1.5;
        evidence += 1.5;
      }

      if (descriptionCount > 0) {
        const base =
          normalizedKeyword.length >= 8
            ? 4
            : normalizedKeyword.length >= 5
              ? 3
              : 2;

        const value = base * descriptionCount;

        descriptionScore += value;
        score += value;

        descriptionEvidence += 0.5;
        evidence += 0.5;
      }

      if (titleCount > 0 && descriptionCount > 0) {
        score += 4;
        titleScore += 4;
        descriptionScore += 4;

        titleEvidence += 0.5;
        descriptionEvidence += 0.5;
        evidence += 1;
      }
    }

    for (const phrase of rule.phrases ?? []) {
      const normalizedPhrase = normalizeText(phrase);
      if (!normalizedPhrase) continue;

      if (containsPhrase(normalizedTitle, normalizedPhrase)) {
        const value = normalizedPhrase.length >= 8 ? 18 : 14;

        titleScore += value;
        score += value;

        titleEvidence += 2.5;
        evidence += 2.5;
      } else if (
        containsPhrase(normalizedDescription, normalizedPhrase)
      ) {
        const value = normalizedPhrase.length >= 8 ? 8 : 6;

        descriptionScore += value;
        score += value;

        descriptionEvidence += 1;
        evidence += 1;
      }
    }

    for (const related of rule.related ?? []) {
      const normalizedRelated = normalizeText(related);

      if (containsPhrase(normalizedTitle, normalizedRelated)) {
        titleScore += 1;
        score += 1;

        titleEvidence += 0.25;
        evidence += 0.25;
      }

      if (containsPhrase(normalizedDescription, normalizedRelated)) {
        descriptionScore += 1;
        score += 1;

        descriptionEvidence += 0.25;
        evidence += 0.25;
      }
    }

    for (const negative of rule.negative ?? []) {
      if (containsPhrase(fullText, negative)) {
        score -= 5;
      }
    }

    // تقویت شواهد مستقل عنوان
    if (titleEvidence >= 2) {
      score += 3;
      titleScore += 3;
    }

    if (titleEvidence >= 3) {
      score += 6;
      titleScore += 6;
    }

    if (titleEvidence >= 5) {
      score += 9;
      titleScore += 9;
    }

    if (titleEvidence >= 7) {
      score += 12;
      titleScore += 12;
    }

    // تقویت شواهد مستقل توضیحات
    // توضیحات عمداً وزن کمتری از عنوان دارند،
    // اما اگر خودش موضوع مشخصی بسازد، نباید نادیده گرفته شود.
    if (descriptionEvidence >= 1) {
      score += 1;
      descriptionScore += 1;
    }

    if (descriptionEvidence >= 2) {
      score += 2;
      descriptionScore += 2;
    }

    if (descriptionEvidence >= 3) {
      score += 3;
      descriptionScore += 3;
    }

    if (score > 0) {
      scores.set(rule.category, Math.max(0, score));
    }
  }

  return scores;
}

function applyCrossCategorySignals(
  scores: Map<MarketplaceCategory, number>,
  title: string,
  description: string
): void {
  const text = normalizeText(`${title} ${description}`);

  const usedSignal = hasAnyPhrase(text, [
    "دسته دوم",
    "دسته‌دوم",
    "دسته دو",
    "دسته سوم",
    "دسته‌سوم",
    "دسته سه",
    "دست دوم",
    "دست‌دوم",
    "دست دو",
    "کارکرده",
    "استوک",
    "استفاده شده",
    "استفاده‌شده",
    "در حد نو",
    "مثل نو",
    "کم کارکرد",
    "کم‌کارکرد",
  ]);

  if (usedSignal) {
    addScore(scores, "used", 9);

    const domainCategories: MarketplaceCategory[] = [
      "digital",
      "furniture",
      "fashion",
      "car",
      "kids",
      "garden",
      "books",
      "music",
      "sports",
      "beauty",
      "handmade",
      "jewelry",
      "gaming",
    ];

    for (const category of domainCategories) {
      if (getSafeScore(scores, category) > 0) {
        addScore(scores, category, 4);
      }
    }
  }

  const repairAndServiceSignal = hasAnyPhrase(text, [
    "تعمیر",
    "تعمیرات",
    "تعمیرکار",
    "سرویسکار",
    "عیب یابی",
    "عیب‌یابی",
    "نصاب",
    "نصب",
    "فنی کار",
    "فنی‌کار",
  ]);

  if (repairAndServiceSignal) {
    addScore(scores, "repairs", 10);
  }

  const homeServiceSignal = hasAnyPhrase(text, [
    "نظافت منزل",
    "نظافت خانه",
    "نظافتچی",
    "نظافتکار",
    "تمیزکاری",
    "خانه تکانی",
    "خانه‌تکانی",
    "قالیشویی",
    "مبل شویی",
    "مبل‌شویی",
    "شستشوی مبل",
    "شستشوی فرش",
    "اسباب کشی",
    "اسباب‌کشی",
    "باربری منزل",
  ]);

  if (homeServiceSignal) {
    addScore(scores, "home_services", 12);
  }

  const musicSignal = hasAnyPhrase(text, [
    "گیتار",
    "پیانو",
    "کیبورد",
    "ویولن",
    "ویلن",
    "سه تار",
    "سه‌تار",
    "سنتور",
    "تار",
    "عود",
    "دف",
    "تنبک",
    "کمانچه",
    "ساکسیفون",
    "فلوت",
    "هنگ درام",
    "لوازم موسیقی",
  ]);

  if (musicSignal) {
    addScore(scores, "music", 11);
  }

  const sportsSignal = hasAnyPhrase(text, [
    "فوتبال",
    "فوتسال",
    "والیبال",
    "بسکتبال",
    "تنیس",
    "بدنسازی",
    "دوچرخه سواری",
    "دوچرخه‌سواری",
    "کوهنوردی",
    "کمپینگ",
    "شنا",
    "بوکس",
    "کاراته",
    "تکواندو",
    "کشتی",
    "یوگا",
    "پیلاتس",
    "لوازم ورزشی",
    "تجهیزات ورزشی",
  ]);

  if (sportsSignal) {
    addScore(scores, "sports", 11);
  }

  const handmadeStrongSignal = hasAnyPhrase(text, [
    "دست ساز",
    "دست‌ساز",
    "دستباف",
    "صنایع دستی",
    "سفالگری",
    "معرق",
    "منبت",
    "مکرومه",
    "حصیربافی",
    "گلیم",
    "جاجیم",
    "ترمه",
    "خاتم کاری",
    "خاتم‌کاری",
    "میناکاری",
    "فیروزه کوبی",
    "فیروزه‌کوبی",
  ]);

  if (handmadeStrongSignal) {
    addScore(scores, "handmade", 12);
  }

  const jewelryStrongSignal = hasAnyPhrase(text, [
    "زیور آلات تزئینی",
    "زیورآلات تزئینی",
    "زیورآلات",
    "بدلیجات",
    "گردنبند",
    "دستبند",
    "انگشتر",
    "گوشواره",
    "پابند",
    "خلخال",
    "نیم‌ست",
    "ست بدلیجات",
    "آویز گردنبند",
  ]);

  if (jewelryStrongSignal) {
    addScore(scores, "jewelry", 14);
  }

  const gamingStrongSignal = hasAnyPhrase(text, [
    "گیمینگ",
    "کنسول بازی",
    "پلی استیشن",
    "پلی‌استیشن",
    "PS5",
    "PS4",
    "Xbox",
    "ایکس باکس",
    "نینتندو",
    "Nintendo",
    "Switch",
    "دسته بازی",
    "هدست گیمینگ",
    "کیبورد گیمینگ",
    "ماوس گیمینگ",
    "مانیتور گیمینگ",
    "لوازم جانبی کنسول",
  ]);

  if (gamingStrongSignal) {
    addScore(scores, "gaming", 14);
  }

  const bookStrongSignal = hasAnyPhrase(text, [
    "کتاب آموزشی",
    "کتاب دانشگاهی",
    "کتاب درسی",
    "کتاب زبان",
    "کتاب کودک",
    "کتاب کمک آموزشی",
    "دوره آموزشی",
  ]);

  if (bookStrongSignal) {
    addScore(scores, "books", 9);
  }

  const carStrongSignal = hasAnyPhrase(text, [
    "فروش خودرو",
    "فروش ماشین",
    "خودروی دست دوم",
    "ماشین دست دوم",
    "لوازم یدکی خودرو",
    "قطعات خودرو",
    "تعمیر خودرو",
  ]);

  if (carStrongSignal) {
    addScore(scores, "car", 9);
  }

  const propertyStrongSignal = hasAnyPhrase(text, [
    "فروش خانه",
    "فروش آپارتمان",
    "اجاره خانه",
    "اجاره آپارتمان",
    "رهن کامل",
    "رهن و اجاره",
    "ملک مسکونی",
  ]);

  if (propertyStrongSignal) {
    addScore(scores, "home", 10);
  }
}

console.log("STEP_5_SCORING_ENGINE_READY");

function resolveCategoryConflicts(
  scores: Map<MarketplaceCategory, number>,
  title: string,
  description: string
): void {
  const text = normalizeText(`${title} ${description}`);

  const hasUsed = hasAnyPhrase(text, [
    "دسته دوم",
    "دسته‌دوم",
    "دسته دو",
    "دسته سوم",
    "دسته‌سوم",
    "دسته سه",
    "دست دوم",
    "دست‌دوم",
    "دست دو",
    "کارکرده",
    "استوک",
    "استفاده شده",
    "استفاده‌شده",
    "در حد نو",
    "مثل نو",
    "کم کارکرد",
    "کم‌کارکرد",
  ]);

  if (hasUsed) {
    // کالای دسته دوم/سوم همیشه بر دسته موضوعی اولویت قطعی دارد.
    scores.set("used", Math.max(getSafeScore(scores, "used"), 1000));

    const domainPriority: MarketplaceCategory[] = [
      "digital",
      "furniture",
      "car",
      "fashion",
      "kids",
      "garden",
      "books",
      "music",
      "sports",
      "beauty",
      "handmade",
    ];

    for (const category of domainPriority) {
      const domainScore = getSafeScore(scores, category);

      if (domainScore >= 12) {
        addScore(scores, category, 7);
        addScore(scores, "used", 2);
      }
    }
  }

  if (
    hasAnyPhrase(text, ["کفش فوتبال", "لباس ورزشی", "کفش ورزشی"]) ||
    hasAnyPhrase(text, [
      "توپ فوتبال",
      "راکت تنیس",
      "دستگاه بدنسازی",
    ])
  ) {
    addScore(scores, "sports", 14);
  }

  if (
    hasAnyPhrase(text, [
      "کتاب برنامه نویسی",
      "کتاب برنامه‌نویسی",
      "کتاب کامپیوتر",
      "کتاب زبان",
      "کتاب دانشگاهی",
      "کتاب درسی",
      "کتاب طراحی سایت",
      "کتاب شبکه",
      "کتاب هوش مصنوعی",
      "کتاب آموزش برنامه نویسی",
      "کتاب آموزش برنامه‌نویسی",
    ])
  ) {
    addScore(scores, "books", 30);
  }

  if (
    hasAnyPhrase(text, [
      "تعمیر یخچال",
      "تعمیر فریزر",
      "تعمیر لباسشویی",
      "تعمیر ظرفشویی",
      "تعمیر کولر",
      "تعمیر پکیج",
      "تعمیر آبگرمکن",
      "تعمیر تلویزیون",
      "تعمیر موبایل",
      "تعمیر لپ تاپ",
    ])
  ) {
    addScore(scores, "repairs", 16);
  }

  if (
    hasAnyPhrase(text, [
      "نظافت منزل",
      "نظافت خانه",
      "قالیشویی",
      "مبل شویی",
      "مبل‌شویی",
      "اسباب کشی",
      "اسباب‌کشی",
      "باربری منزل",
    ])
  ) {
    addScore(scores, "home_services", 16);
  }

  if (
    hasAnyPhrase(text, [
      "گیتار",
      "پیانو",
      "ویولن",
      "سه تار",
      "سه‌تار",
      "سنتور",
      "تار",
      "عود",
      "دف",
      "تنبک",
    ])
  ) {
    addScore(scores, "music", 14);
  }

  if (
    hasAnyPhrase(text, [
      "فوتبال",
      "فوتسال",
      "والیبال",
      "بسکتبال",
      "تنیس",
      "بدنسازی",
      "کوهنوردی",
      "کمپینگ",
      "یوگا",
      "پیلاتس",
    ])
  ) {
    addScore(scores, "sports", 14);
  }

  const furnitureSignal = hasAnyPhrase(text, [
    "مبل راحتی",
    "مبل استیل",
    "سرویس خواب",
    "میز ناهارخوری",
    "میز تلویزیون",
    "کمد دیواری",
  ]);

  if (furnitureSignal) {
    addScore(scores, "furniture", 13);
  }

  const fashionSignal = hasAnyPhrase(text, [
    "کت و شلوار",
    "لباس زنانه",
    "لباس مردانه",
    "لباس مجلسی",
    "مانتو",
    "شلوار",
    "پیراهن",
  ]);

  if (fashionSignal) {
    addScore(scores, "fashion", 10);
  }

  const gardenSignal = hasAnyPhrase(text, [
    "ابزار باغبانی",
    "گل و گیاه",
    "گیاه آپارتمانی",
    "بذر گیاه",
    "قیچی باغبانی",
    "سمپاش",
  ]);

  if (gardenSignal) {
    addScore(scores, "garden", 12);
  }

  const digitalSignal = hasAnyPhrase(text, [
    "لپ تاپ",
    "لپ‌تاپ",
    "کامپیوتر",
    "برنامه نویسی",
    "برنامه‌نویسی",
    "طراحی سایت",
    "اپلیکیشن",
    "خدمات کامپیوتری",
  ]);

  if (digitalSignal) {
    addScore(scores, "digital", 11);
  }

  const usedMobileSignal = hasAnyPhrase(text, [
    "موبایل دست دوم",
    "موبایل دست‌دوم",
    "گوشی دست دوم",
    "گوشی دست‌دوم",
    "گوشی کارکرده",
    "موبایل کارکرده",
  ]);

  if (usedMobileSignal) {
    addScore(scores, "digital", 28);
  }
}

function calculateConfidence(
  score: number,
  secondScore: number,
  evidenceCount: number,
  independentDescription = false
): number {
  if (score <= 0) return 0;

  /*
   * دسته‌ای که فقط از توضیحات و به‌صورت مستقل پیدا شده،
   * نباید به‌خاطر فاصله زیاد از دسته اصلی Confidence بسیار پایینی بگیرد.
   */
  if (independentDescription) {
    const descriptionEvidenceBoost = Math.min(
      0.15,
      evidenceCount * 0.02
    );

    const raw =
      0.68 +
      Math.min(0.12, score / 25) +
      descriptionEvidenceBoost;

    return Math.min(0.88, Math.max(0.65, raw));
  }

  const margin =
    secondScore > 0
      ? (score - secondScore) / Math.max(score, 1)
      : 1;

  const evidenceBoost = Math.min(0.2, evidenceCount * 0.025);

  const raw =
    0.5 +
    Math.min(0.35, score / 80) +
    margin * 0.25 +
    evidenceBoost;

  return Math.min(0.99, Math.max(0.01, raw));
}

export function rankMarketplaceCategories(
  title: string,
  description: string
): MarketplaceCategoryCandidate[] {
  const normalizedTitle = normalizeText(title);
  const normalizedDescription = normalizeText(description);

  if (!normalizedTitle && !normalizedDescription) {
    return [];
  }

  const scores = calculateScores(
    normalizedTitle,
    normalizedDescription
  );

  applyCrossCategorySignals(
    scores,
    normalizedTitle,
    normalizedDescription
  );

  resolveCategoryConflicts(
    scores,
    normalizedTitle,
    normalizedDescription
  );

  const titleOnlyScores = calculateScores(
    normalizedTitle,
    ""
  );

  const descriptionOnlyScores = calculateScores(
    "",
    normalizedDescription
  );

  const sorted = [...scores.entries()]
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) {
    return [];
  }

  const topScore = sorted[0][1];

  /*
   * Smart Ranking:
   * دسته اصلی همیشه حفظ می‌شود.
   * دسته‌های دیگر فقط وقتی وارد می‌شوند که:
   * 1) امتیاز کلی مناسبی داشته باشند، یا
   * 2) توضیحات یک موضوع مستقل و واقعی ساخته باشند.
   */
  const meaningful = sorted
    .filter(([category, score], index) => {
      if (index === 0) {
        return true;
      }

      // «سایر» فقط برای پر کردن لیست نباید وارد شود.
      if (category === "other") {
        return false;
      }

      const relativeScore = score / Math.max(topScore, 1);

      const titleEvidenceScore =
        titleOnlyScores.get(category) ?? 0;

      const descriptionEvidenceScore =
        descriptionOnlyScores.get(category) ?? 0;

      /*
       * اگر دسته از خود عنوان و توضیحات امتیاز قابل‌قبولی گرفته،
       * یک تشخیص طبیعی و قوی است.
       */
      const strongOverallMatch =
        score >= 6 && relativeScore >= 0.30;

      /*
       * اگر دسته در عنوان اصلاً دیده نشده ولی توضیحات
       * به‌تنهایی برای آن شواهد ساخته‌اند، آن را موضوع مستقل
       * حساب می‌کنیم.
       *
       * مثال:
       * عنوان: «صنایع دستی»
       * توضیحات: «درخت»
       *
       * نتیجه:
       * صنایع دستی + کشاورزی و باغبانی
       */
      const independentDescriptionMatch =
        titleEvidenceScore === 0 &&
        descriptionEvidenceScore >= 2;

      return (
        strongOverallMatch ||
        independentDescriptionMatch
      );
    })
    .slice(0, 3);

  /*
   * اگر هیچ دسته تخصصی با کیفیت کافی پیدا نشد،
   * فقط بهترین تشخیص را برمی‌گردانیم.
   */
  const selected =
    meaningful.length > 0
      ? meaningful
      : sorted.slice(0, 1);

  const secondScore = selected[1]?.[1] ?? 0;

  const evidenceText = normalizeText(
    `${normalizedTitle} ${normalizedDescription}`
  );

  const evidenceCount = Math.max(
    1,
    Math.round(
      tokenize(evidenceText).filter(
        (token) => token.length >= 3
      ).length / 8
    )
  );

  return selected.map(([category, score], index) => {
    const isIndependentDescription =
      index > 0 &&
      (titleOnlyScores.get(category) ?? 0) === 0 &&
      (descriptionOnlyScores.get(category) ?? 0) >= 2;

    const confidence = calculateConfidence(
      score,
      index === 0 ? secondScore : topScore,
      evidenceCount,
      isIndependentDescription
    );

    return {
      category,
      score: Math.round(score * 100) / 100,
      confidence,
    };
  });
}
export function detectMarketplaceCategory(
  title: string,
  description: string
): MarketplaceCategoryResult {
  const candidates = rankMarketplaceCategories(
    title,
    description
  );

  if (candidates.length === 0) {
    return {
      category: "other",
      confidence: 0,
    };
  }

  const top = candidates[0];

  return {
    category: top.category,
    confidence: top.confidence,
  };
}
