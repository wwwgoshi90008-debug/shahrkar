"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type NotificationItem = {
  id: string;
  type?: string;
  title?: string;
  text?: string;
  createdAt?: string;
  chatId?: string;
  seen?: boolean;
  bellRead?: boolean;
};

function formatDate(value?: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function isOld(value?: string) {
  if (!value) return false;

  const time = new Date(value).getTime();

  if (Number.isNaN(time)) return false;

  return Date.now() - time >= 24 * 60 * 60 * 1000;
}

export default function BuyerNotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const autoReadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoReadStartedRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [readingIds, setReadingIds] = useState<string[]>([]);

  async function loadNotifications() {
    try {
      const response = await fetch("/api/marketplace/notifications", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("NOTIFICATIONS_FETCH_FAILED");
      }

      const data = await response.json();

      setNotifications(
        Array.isArray(data?.notifications)
          ? data.notifications
          : []
      );
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();

    const timer = window.setInterval(loadNotifications, 10000);

    return () => window.clearInterval(timer);
  }, []);

  
  // AUTO_READ_AFTER_OPEN:
  // وقتی پنل اعلان باز شد، اعلان‌های خوانده‌نشده ۲ ثانیه چشمک می‌زنند
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

async function handleNotificationClick(
    notification: NotificationItem
  ) {
    const unread =
      !notification.seen || !notification.bellRead;

    if (!unread || readingIds.includes(notification.id)) {
      if (
        notification.type !== "listing_deleted" &&
        notification.chatId
      ) {
        router.push(
          `/marketplace/buyer/chat/${notification.chatId}`
        );
      }
      return;
    }

    setReadingIds((ids) =>
      ids.includes(notification.id)
        ? ids
        : [...ids, notification.id]
    );

    window.setTimeout(async () => {
      try {
        await fetch("/api/marketplace/notifications", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "read",
            notificationId: notification.id,
          }),
        });
      } catch {}

      setNotifications((items) =>
        items.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                seen: true,
                bellRead: true,
              }
            : item
        )
      );

      setReadingIds((ids) =>
        ids.filter((id) => id !== notification.id)
      );

      if (
        notification.type !== "listing_deleted" &&
        notification.chatId
      ) {
        router.push(
          `/marketplace/buyer/chat/${notification.chatId}`
        );
      }
    }, 2000);
  }

  async function handleDelete(id: string) {
    try {
      const response = await fetch(
        `/api/marketplace/notifications?notificationId=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("DELETE_FAILED");
      }

      setNotifications((items) =>
        items.filter((item) => item.id !== id)
      );
    } catch {}
  }

  async function handleDeleteAll() {
    try {
      const response = await fetch(
        "/api/marketplace/notifications",
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("DELETE_ALL_FAILED");
      }

      setNotifications([]);
    } catch {}
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gradient-to-b from-[#080808] via-[#0b0905] to-[#080808] px-3 py-5 text-white"
    >
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => router.push("/marketplace/buyer")}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-gray-200 transition hover:bg-white/10"
          >
            برگشت به پنل
          </button>

          <div className="text-right">
            <div className="text-xl font-black text-yellow-300">
              🔔 اعلان‌ها
            </div>
            <div className="mt-1 text-[10px] text-gray-400">
              آخرین اعلان‌های بازارچه شهرکار
            </div>
          </div>
        </div>

        <div className="mb-3 flex justify-end">
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={handleDeleteAll}
              className="rounded-xl border border-red-500/30 bg-red-950/30 px-3 py-2 text-[10px] font-bold text-red-300 transition hover:bg-red-950/50"
            >
              🗑️ حذف همه
            </button>
          )}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center text-xs text-gray-400">
            در حال دریافت اعلان‌ها...
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
            <div className="text-3xl">🔕</div>
            <div className="mt-2 text-sm font-bold text-gray-300">
              اعلانی ندارید
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const unread =
                !notification.seen || !notification.bellRead;

              const old = isOld(notification.createdAt);

              return (
                <div
                  key={notification.id}
                  className={`relative rounded-2xl border p-4 transition-all ${
                    old
                      ? "border-white/5 bg-white/[0.02] opacity-55"
                      : unread
                        ? "animate-pulse border-yellow-500/40 bg-white/[0.07] shadow-lg shadow-yellow-500/10"
                        : "border-white/10 bg-white/5"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      handleNotificationClick(notification)
                    }
                    className="w-full text-right"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-black text-gray-100">
                            {notification.title || "اعلان جدید"}
                          </div>

                          {old && (
                            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-black text-gray-500">
                              قدیمی
                            </span>
                          )}
                        </div>

                        {notification.text && (
                          <div className="mt-1 text-xs leading-6 text-gray-400">
                            {notification.text}
                          </div>
                        )}
                      </div>

                      {unread && !old && (
                        <span className="mt-1 h-2 w-2 shrink-0 animate-pulse rounded-full bg-yellow-400" />
                      )}
                    </div>

                    <div className="mt-3 text-[10px] text-gray-500">
                      {formatDate(notification.createdAt)}
                    </div>
                  </button>

                  <button
                    type="button"
                    aria-label="حذف اعلان"
                    onClick={() =>
                      handleDelete(notification.id)
                    }
                    className="absolute left-3 top-3 rounded-lg px-2 py-1 text-sm text-gray-500 transition hover:bg-red-500/10 hover:text-red-400"
                  >
                    🗑️
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
