"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Message = {
  id: string;
  senderUid: string;
  text: string;
  createdAt?: unknown;
};

type Chat = {
  id: string;
  purchaseRequestId: string;
  buyerUid: string;
  sellerUid: string;
  status: string;
};

export default function BuyerMarketplaceChatPage() {
  const params = useParams<{ chatId: string }>();
  const router = useRouter();

  const chatId = params?.chatId;

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [deletingChat, setDeletingChat] = useState(false);
    const [keyboardOpen, setKeyboardOpen] = useState(false);

  async function loadChat() {
    if (!chatId) return;

    try {
      setError("");

      const response = await fetch(
        `/api/marketplace/chat/${encodeURIComponent(chatId)}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (response.status === 401) {
        router.push("/marketplace/login?mode=buyer");
        return;
      }

      if (response.status === 403) {
        const data = await response.json().catch(() => null);

        if (data?.error === "CHAT_DELETED") {
          throw new Error("CHAT_DELETED");
        }

        throw new Error("ACCESS_DENIED");
      }

      if (response.status === 404) {
        throw new Error("CHAT_NOT_FOUND");
      }

      if (!response.ok) {
        throw new Error("CHAT_FETCH_FAILED");
      }

      const data = await response.json();

      setChat(data.chat ?? null);
      setMessages(Array.isArray(data.messages) ? data.messages : []);
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === "CHAT_DELETED"
      ) {
        setError("گفت‌وگو پاک شده");
      } else if (err instanceof Error && err.message === "ACCESS_DENIED") {
        setError("دسترسی به این گفت‌وگو برای شما مجاز نیست.");
      } else if (
        err instanceof Error &&
        err.message === "CHAT_NOT_FOUND"
      ) {
        setError("گفت‌وگوی این درخواست پیدا نشد.");
      } else {
        setError("دریافت گفت‌وگو با خطا مواجه شد.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadChat();
  }, [chatId]);
    useEffect(() => {
      const viewport = window.visualViewport;

      if (!viewport) return;

      const updateKeyboardState = () => {
        setKeyboardOpen(window.innerHeight - viewport.height > 180);
      };

      updateKeyboardState();
      viewport.addEventListener("resize", updateKeyboardState);

      return () => {
        viewport.removeEventListener("resize", updateKeyboardState);
      };
    }, []);


  async function sendMessage() {
    const cleanText = text.trim();

    if (!cleanText || !chatId || sending) return;

    try {
      setSending(true);
      setError("");

      const response = await fetch(
        `/api/marketplace/chat/${encodeURIComponent(chatId)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: cleanText,
          }),
        }
      );

      if (response.status === 401) {
        router.push("/marketplace/login?mode=buyer");
        return;
      }

      if (response.status === 403) {
        throw new Error("ACCESS_DENIED");
      }

      if (response.status === 409) {
        throw new Error("CHAT_INACTIVE");
      }

      if (!response.ok) {
        throw new Error("MESSAGE_SEND_FAILED");
      }

      const data = await response.json();

      if (data?.message) {
        setMessages((current) => [...current, data.message]);
      }

      setText("");
    } catch (err) {
      if (err instanceof Error && err.message === "ACCESS_DENIED") {
        setError("دسترسی به این گفت‌وگو برای شما مجاز نیست.");
      } else if (
        err instanceof Error &&
        err.message === "CHAT_INACTIVE"
      ) {
        setError("این گفت‌وگو فعال نیست.");
      } else {
        setError("ارسال پیام با خطا مواجه شد.");
      }
    } finally {
      setSending(false);
    }
  }


  async function deleteMessage(messageId: string) {
    if (!chatId) return;

    try {
      setError("");

      const response = await fetch(
        `/api/marketplace/chat/${encodeURIComponent(chatId)}?messageId=${encodeURIComponent(messageId)}`,
        {
          method: "DELETE",
        }
      );

      if (response.status === 401) {
        router.push("/marketplace/login?mode=buyer");
        return;
      }

      if (response.status === 403) {
        setError("فقط پیام‌های خودتان را می‌توانید حذف کنید.");
        return;
      }

      if (!response.ok) {
        throw new Error("MESSAGE_DELETE_FAILED");
      }

      setMessages((current) =>
        current.filter((message) => message.id !== messageId)
      );
    } catch {
      setError("حذف پیام انجام نشد.");
    }
  }

  async function deleteChat() {
    if (!chatId || deletingChat) return;

    try {
      setDeletingChat(true);

      const response = await fetch(
        `/api/marketplace/chat/${encodeURIComponent(chatId)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("CHAT_DELETE_FAILED");
      }

      router.push("/marketplace/buyer/purchase-requests");
    } catch {
      setError("حذف چت انجام نشد.");
    } finally {
      setDeletingChat(false);
    }
  }

  function formatMessageTime(value: unknown) {
    if (!value) return "";

    try {
      if (
        typeof value === "object" &&
        value !== null &&
        "seconds" in value
      ) {
        const seconds = Number(
          (value as { seconds?: unknown }).seconds
        );

        if (Number.isFinite(seconds)) {
          return new Intl.DateTimeFormat("fa-IR", {
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(seconds * 1000));
        }
      }

      const date = new Date(String(value));

      if (Number.isNaN(date.getTime())) return "";

      return new Intl.DateTimeFormat("fa-IR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return "";
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-black px-4 py-5 text-white"
    >
      <div className="mx-auto flex min-h-[calc(100vh-40px)] w-full max-w-[520px] flex-col overflow-hidden rounded-3xl border-2 border-yellow-500/40 bg-black shadow-none">
        <header className="border-b border-yellow-500/20 px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/marketplace/buyer/purchase-requests")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-lg text-white/80 transition hover:bg-white/[0.08]"
              aria-label="بازگشت"
            >
              →
            </button>

            <div className="min-w-0 flex-1 text-center">
              <div className="text-base font-black text-yellow-300">
                💬 گفت‌وگوی خرید
              </div>

              {chat && (
                <div className="mt-1 text-[9px] font-bold text-white/35">
                  گفت‌وگوی اختصاصی درخواست خرید
                </div>
              )}
            </div>

              <div className="flex h-9 shrink-0 items-center gap-1.5">
                <div
                  className={`rounded-xl border px-2 py-1 text-[9px] font-black ${
                    chat?.status === "active"
                      ? "border-green-500/25 bg-green-950/30 text-green-300"
                      : "border-red-500/25 bg-red-950/30 text-red-300"
                  }`}
                >
                  {chat?.status === "active"
                    ? "🔓 چت باز است"
                    : "🔒 چت بسته است"}
                </div>

                <button
                  type="button"
                  disabled={deletingChat}
                  onClick={deleteChat}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-red-500/30 bg-red-950/40 text-sm text-red-300 disabled:opacity-40"
                  title="حذف چت"
                >
                  🗑
                </button>
              </div>
          </div>
        </header>

        {loading && (
          <div className="flex flex-1 items-center justify-center px-4">
            <div className="rounded-2xl border border-yellow-500/20 bg-yellow-950/20 px-5 py-4 text-center">
              <p className="text-sm font-bold text-yellow-200/80">
                🧠 در حال دریافت گفت‌وگو...
              </p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-1 items-center justify-center px-4">
            <div className="w-full rounded-2xl border border-red-500/20 bg-red-950/20 px-4 py-5 text-center">
              <p className="text-sm font-bold leading-6 text-red-300">
                {error}
              </p>

              <button
                type="button"
                onClick={() => router.push("/marketplace/buyer/purchase-requests")}
                className="mt-4 rounded-xl border border-yellow-500/40 bg-yellow-950/70 px-4 py-2 text-xs font-bold text-yellow-300"
              >
                ← درخواست‌های خرید
              </button>
            </div>
          </div>
        )}

        {!loading && !error && chat && (
          <>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4">
              {messages.length === 0 ? (
                <div className="flex min-h-[300px] items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl">💬</div>
                    <p className="mt-3 text-sm font-black text-white/60">
                      هنوز پیامی ارسال نشده است.
                    </p>
                    <p className="mt-2 text-[10px] font-bold text-white/30">
                      اولین پیام را برای فروشنده بفرست.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderUid === chat.buyerUid
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl border px-3 py-2 ${
                        message.senderUid === chat.buyerUid
                          ? "border-white/20 bg-[#eee6d8]/10"
                          : "border-gray-500/20 bg-gray-900/70"
                      }`}
                    >
                      <div className="flex items-end gap-2">
                        <p className="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm font-medium leading-6 text-white">
                          {message.text}
                        </p>

                        {message.senderUid === chat.buyerUid && (
                          <button
                            type="button"
                            onClick={() => deleteMessage(message.id)}
                            className="shrink-0 text-[11px] leading-none text-red-400/80 hover:text-red-300"
                            title="حذف پیام"
                            aria-label="حذف پیام"
                          >
                            🗑
                          </button>
                        )}
                      </div>

                      {formatMessageTime(message.createdAt) && (
                        <div className="mt-1 text-left text-[8px] font-bold text-white/30">
                          {formatMessageTime(message.createdAt)}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {error && (
              <div className="border-t border-red-500/10 bg-red-950/20 px-3 py-2">
                <p className="text-center text-[10px] font-bold text-red-300">
                  {error}
                </p>
              </div>
            )}

            <div
          className={`border-t border-white/10 bg-black ${
            keyboardOpen ? "px-2 py-1.5" : "px-2 py-2"
          }`}
        >
          <div className="flex items-end gap-1.5">
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              disabled={chat.status !== "active"}
              maxLength={2000}
              rows={keyboardOpen ? 1 : 2}
              placeholder={
                chat.status === "active"
                  ? "پیامت را بنویس..."
                  : "🔒 چت بسته است"
              }
              className="min-h-[42px] flex-1 resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-white outline-none placeholder:text-white/25 focus:border-yellow-500/40 disabled:cursor-not-allowed disabled:opacity-50"
            />

            <button
              type="button"
              onClick={sendMessage}
              disabled={
                !text.trim() ||
                sending ||
                chat.status !== "active"
              }
              className="h-10 shrink-0 rounded-2xl border border-green-500/40 bg-green-950/70 px-3 text-xs font-black text-green-300 transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              {sending ? "..." : "ارسال"}
            </button>
          </div>

          <p
            className={`${
              keyboardOpen ? "mt-1" : "mt-2"
            } text-center text-[8px] font-bold text-white/20`}
          >
            Enter برای ارسال • Shift + Enter برای خط جدید
          </p>
        </div>

          </>
        )}
      </div>
    </main>
  );
}
