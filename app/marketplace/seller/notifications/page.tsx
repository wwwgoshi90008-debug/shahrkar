"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type NotificationItem = {
  id: string;
  type?: string;
  title?: string;
  text?: string;
  date?: string;
  createdAt?: string | number;
  seen?: boolean;
  bellRead?: boolean;
  chatId?: string;
  requestId?: string;
  listingTitle?: string;
};

function formatDate(value?: string | number) {
  if (!value) return "تاریخ نامشخص";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getNotificationText(notification: NotificationItem) {
  if (notification.text) return notification.text;

  if (notification.type === "purchase_request") {
    return notification.listingTitle
      ? `برای آگهی «${notification.listingTitle}» درخواست خرید جدید ثبت شد.`
      : "برای یکی از آگهی‌های شما درخواست خرید جدید ثبت شد.";
  }

  return "";
}

export default function MarketplaceNotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const autoReadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoReadStartedRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function loadNotifications() {
    try {
      const response = await fetch("/api/marketplace/notifications", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "NOTIFICATIONS_FETCH_FAILED");
      }

      setNotifications(
        Array.isArray(data?.notifications) ? data.notifications : []
      );
      setMessage("");
    } catch {
      setMessage("دریافت اعلان‌ها انجام نشد. دوباره تلاش کن.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();

    const timer = window.setInterval(() => {
      loadNotifications();
    }, 10000);

    return () => window.clearInterval(timer);
  }, []);

  
  // AUTO_READ_AFTER_OPEN:
  // اعلان‌های جدید بعد از باز شدن پنل، ۲ ثانیه چشمک می‌زنند
  // و سپس خودکار خوانده‌شده می‌شوند.
  useEffect(() => {
    if (loading || autoReadStartedRef.current) return;

    const unreadExists = notifications.some(
      (item) => !item.seen || !item.bellRead
    );

    if (!unreadExists) return;

    autoReadStartedRef.current = true;

    autoReadTimerRef.current = setTimeout(async () => {
      try {
        const response = await fetch("/api/marketplace/notifications", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "read-all",
          }),
        });

        if (!response.ok) {
          autoReadStartedRef.current = false;
          return;
        }

        setNotifications((items) =>
          items.map((item) => ({
            ...item,
            seen: true,
            bellRead: true,
          }))
        );

        window.dispatchEvent(
          new Event("marketplace-notifications-updated")
        );
      } catch {
        autoReadStartedRef.current = false;
      }
    }, 1000);

    return () => {
      if (autoReadTimerRef.current) {
        clearTimeout(autoReadTimerRef.current);
        autoReadTimerRef.current = null;
      }
    };
  }, [loading]);

async function markAsRead(notificationId: string) {
    try {
      setBusyId(notificationId);

      const response = await fetch("/api/marketplace/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "read",
          notificationId,
        }),
      });

      if (!response.ok) {
        throw new Error("NOTIFICATION_READ_FAILED");
      }

      setNotifications((items) =>
        items.map((item) =>
          item.id === notificationId
            ? {
                ...item,
                seen: true,
                bellRead: true,
              }
            : item
        )
      );
    } catch {
      setMessage("خواندن اعلان انجام نشد.");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteNotification(notificationId: string) {
    try {
      setBusyId(notificationId);
      setMessage("");

      const response = await fetch(
        `/api/marketplace/notifications?notificationId=${encodeURIComponent(
          notificationId
        )}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "NOTIFICATION_DELETE_FAILED");
      }

      setNotifications((items) =>
        items.filter((item) => item.id !== notificationId)
      );
    } catch {
      setMessage("حذف اعلان انجام نشد.");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteAllNotifications() {
    if (notifications.length === 0) return;

    try {
      setBusyId("all");
      setMessage("");

      const response = await fetch("/api/marketplace/notifications", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "NOTIFICATIONS_DELETE_FAILED");
      }

      setNotifications([]);
    } catch {
      setMessage("حذف همه اعلان‌ها انجام نشد.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-black px-4 py-8 text-white"
    >
      <div className="mx-auto w-full max-w-[420px]">
        <div className="text-center">
          <div className="text-4xl">🔔</div>

          <h1 className="mt-4 text-2xl font-black text-white">
            اعلان‌ها
          </h1>

          <p className="mt-2 text-sm font-bold text-gray-400">
            آخرین اعلان‌های واقعی بازارچه شهرکار
          </p>
        </div>

        <div className="mt-7 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/marketplace/seller")}
            className="rounded-2xl border border-yellow-500/40 bg-yellow-950/70 px-8 py-3 font-bold text-yellow-300 shadow-lg shadow-yellow-500/20 transition-all hover:scale-105 hover:bg-yellow-900/80"
          >
            برگشت به پنل
          </button>

          <button
            type="button"
            disabled={busyId === "all" || notifications.length === 0}
            onClick={deleteAllNotifications}
            className="rounded-2xl border border-red-500/40 bg-red-950/70 px-8 py-3 font-bold text-red-300 shadow-lg shadow-red-500/20 transition-all hover:scale-105 hover:bg-red-900/80 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busyId === "all" ? "در حال حذف..." : "حذف همه"}
          </button>
        </div>

        {message && (
          <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-center">
            <p className="text-xs font-bold text-red-300">{message}</p>
          </div>
        )}

        {loading ? (
          <div className="mt-5 rounded-2xl border border-yellow-500/20 bg-white/[0.04] px-4 py-8 text-center">
            <p className="text-sm font-bold text-yellow-300">
              در حال دریافت اعلان‌ها...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-yellow-500/20 bg-white/[0.04] px-4 py-8 text-center">
            <div className="text-4xl">🔕</div>

            <p className="mt-3 text-sm font-bold text-gray-400">
              فعلاً اعلان جدیدی ندارید.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-2">
            {notifications.map((notification) => {
              const isUnread = !notification.bellRead;
              const text = getNotificationText(notification);

              return (
                <div
                  key={notification.id}
                  onClick={() => {
                    if (busyId !== notification.id) {
                      markAsRead(notification.id);
                    }
                  }}
                  className={`relative cursor-pointer rounded-2xl border px-3 py-3 pr-10 text-right transition-all ${
                    isUnread
                      ? "animate-pulse border-yellow-400/50 bg-yellow-950/30 text-white shadow-lg shadow-yellow-500/10"
                      : "border-white/20 bg-white/[0.05] text-gray-300"
                  }`}
                >
                  <button
                    type="button"
                    aria-label="حذف اعلان"
                    disabled={busyId === notification.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    className="absolute left-2 top-3 text-sm text-red-400 transition-all hover:scale-110 hover:text-red-300 disabled:opacity-40"
                  >
                    🗑️
                  </button>

                  <div className="flex items-start gap-2">
                    <span className="text-xs">
                      {isUnread ? "🔴" : "⚪"}
                    </span>

                    <p className="text-xs font-extrabold">
                      {notification.title || "اعلان بازارچه"}
                    </p>
                  </div>

                  {text && (
                    <p className="mt-1 text-[11px] font-bold leading-5">
                      {text}
                    </p>
                  )}

                  <p className="mt-2 text-[10px] font-bold text-gray-400 opacity-80">
                    {formatDate(notification.createdAt)}
                  </p>

                  {notification.type === "purchase_request" &&
                    notification.requestId && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          markAsRead(notification.id);
                          router.push(
                            "/marketplace/seller/purchase-requests"
                          );
                        }}
                        className="mt-2 w-full rounded-xl border border-green-500/30 bg-green-950/40 px-2 py-2 text-[10px] font-black text-green-300 transition-all hover:bg-green-900/60"
                      >
                        🛒 مشاهده درخواست خرید
                      </button>
                    )}

                  {notification.type === "chat_message" &&
                    notification.chatId && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          markAsRead(notification.id);
                          router.push(
                            `/marketplace/seller/chat/${encodeURIComponent(
                              notification.chatId as string
                            )}`
                          );
                        }}
                        className="mt-2 w-full rounded-xl border border-blue-500/30 bg-blue-950/40 px-2 py-2 text-[10px] font-black text-blue-300 transition-all hover:bg-blue-900/60"
                      >
                        💬 ورود به چت
                      </button>
                    )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
