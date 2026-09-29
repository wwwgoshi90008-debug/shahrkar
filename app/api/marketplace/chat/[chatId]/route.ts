import { NextResponse } from "next/server";
import { marketplaceAdminDb } from "@/lib/marketplace-firebase-admin";
import {
  verifyMarketplaceSessionValue,
  COOKIE_NAME,
} from "@/lib/auth/marketplace-session";

function getSessionUid(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";

  const cookies = Object.fromEntries(
    cookieHeader
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const index = item.indexOf("=");

        return [
          item.slice(0, index),
          decodeURIComponent(item.slice(index + 1)),
        ];
      })
  );

  const sessionValue = cookies[COOKIE_NAME];

  if (!sessionValue) {
    return null;
  }

  try {
    const session = verifyMarketplaceSessionValue(sessionValue);
    return session?.uid || null;
  } catch {
    return null;
  }
}

function getChatId(
  params: Promise<{ chatId?: string }>
) {
  return Promise.resolve(params).then((value) =>
    typeof value?.chatId === "string" ? value.chatId.trim() : ""
  );
}

function isParticipant(
  chatData: FirebaseFirestore.DocumentData | undefined,
  uid: string
) {
  return (
    chatData?.buyerUid === uid ||
    chatData?.sellerUid === uid
  );
}

export async function GET(
  request: Request,
  context: {
    params: Promise<{ chatId?: string }>;
  }
) {
  try {
    const uid = getSessionUid(request);

    if (!uid) {
      return NextResponse.json(
        { error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const chatId = await getChatId(context.params);

    if (!chatId) {
      return NextResponse.json(
        { error: "CHAT_ID_REQUIRED" },
        { status: 400 }
      );
    }

    const chatRef = marketplaceAdminDb
      .collection("marketplaceChats")
      .doc(chatId);

    const chatSnap = await chatRef.get();

    if (!chatSnap.exists) {
      return NextResponse.json(
        { error: "CHAT_NOT_FOUND" },
        { status: 404 }
      );
    }

    const chatData = chatSnap.data();

    if (!isParticipant(chatData, uid)) {
      return NextResponse.json(
        { error: "FORBIDDEN" },
        { status: 403 }
      );
    }

    if (chatData?.status === "deleted") {
      return NextResponse.json(
        { error: "CHAT_DELETED" },
        { status: 403 }
      );
    }

    const messagesSnap = await chatRef
      .collection("messages")
      .orderBy("createdAt", "asc")
      .limit(200)
      .get();

    const messages = messagesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      chat: {
        id: chatSnap.id,
        ...chatData,
      },
      messages,
    });
  } catch (error) {
    console.error(
      "MARKETPLACE_CHAT_GET_ERROR",
      error
    );

    return NextResponse.json(
      { error: "MARKETPLACE_CHAT_FETCH_FAILED" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: {
    params: Promise<{ chatId?: string }>;
  }
) {
  try {
    const uid = getSessionUid(request);

    if (!uid) {
      return NextResponse.json(
        { error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const chatId = await getChatId(context.params);

    if (!chatId) {
      return NextResponse.json(
        { error: "CHAT_ID_REQUIRED" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const text =
      typeof body?.text === "string"
        ? body.text.trim()
        : "";

    if (!text) {
      return NextResponse.json(
        { error: "MESSAGE_REQUIRED" },
        { status: 400 }
      );
    }

    if (text.length > 2000) {
      return NextResponse.json(
        { error: "MESSAGE_TOO_LONG" },
        { status: 400 }
      );
    }

    const chatRef = marketplaceAdminDb
      .collection("marketplaceChats")
      .doc(chatId);

    const messageRef = chatRef
      .collection("messages")
      .doc();

    const now = new Date().toISOString();

    const result = await marketplaceAdminDb.runTransaction(
      async (transaction) => {
        const chatSnap = await transaction.get(chatRef);

        if (!chatSnap.exists) {
          throw new Error("CHAT_NOT_FOUND");
        }

        const chatData = chatSnap.data();

        if (!isParticipant(chatData, uid)) {
          throw new Error("FORBIDDEN");
        }

        if (chatData?.status !== "active") {
          throw new Error("CHAT_NOT_ACTIVE");
        }

        transaction.set(messageRef, {
          senderUid: uid,
          text,
          createdAt: now,
        });

        if (uid === chatData?.sellerUid && chatData?.buyerUid) {
          const notificationRef = marketplaceAdminDb
            .collection("marketplaceNotifications")
            .doc();

          transaction.set(notificationRef, {
            uid: chatData.buyerUid,
            type: "chat_message",
            title: "💬 پیام جدید دارید",
            text: "از فروشنده یک پیام جدید دریافت کردید.",
            chatId,
            requestId: chatId,
            senderUid: uid,
            createdAt: now,
            seen: false,
            bellRead: false,
          });
        }

        if (uid === chatData?.buyerUid && chatData?.sellerUid) {
          const notificationRef = marketplaceAdminDb
            .collection("marketplaceNotifications")
            .doc();

          transaction.set(notificationRef, {
            uid: chatData.sellerUid,
            type: "chat_message",
            title: "💬 پیام جدید دارید",
            text: "از خریدار یک پیام جدید دریافت کردید.",
            chatId,
            requestId: chatId,
            senderUid: uid,
            createdAt: now,
            seen: false,
            bellRead: false,
          });
        }

        transaction.update(chatRef, {
          updatedAt: now,
          lastMessageAt: now,
        });

        return {
          messageId: messageRef.id,
        };
      }
    );

    return NextResponse.json({
      success: true,
      chatId,
      message: {
        id: result.messageId,
        senderUid: uid,
        text,
        createdAt: now,
      },
    });
  } catch (error) {
    const errorCode =
      error instanceof Error ? error.message : "";

    if (errorCode === "CHAT_NOT_FOUND") {
      return NextResponse.json(
        { error: "CHAT_NOT_FOUND" },
        { status: 404 }
      );
    }

    if (errorCode === "FORBIDDEN") {
      return NextResponse.json(
        { error: "FORBIDDEN" },
        { status: 403 }
      );
    }

    if (errorCode === "CHAT_NOT_ACTIVE") {
      return NextResponse.json(
        { error: "CHAT_NOT_ACTIVE" },
        { status: 403 }
      );
    }

    console.error(
      "MARKETPLACE_CHAT_POST_ERROR",
      error
    );

    return NextResponse.json(
      { error: "MARKETPLACE_MESSAGE_SEND_FAILED" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ chatId?: string }>;
  }
) {
  try {
    const uid = getSessionUid(request);

    if (!uid) {
      return NextResponse.json(
        { error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const chatId = await getChatId(context.params);

    if (!chatId) {
      return NextResponse.json(
        { error: "CHAT_ID_REQUIRED" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const action =
      typeof body?.action === "string"
        ? body.action
        : "";

    const chatRef = marketplaceAdminDb
      .collection("marketplaceChats")
      .doc(chatId);

    const chatSnap = await chatRef.get();

    if (!chatSnap.exists) {
      return NextResponse.json(
        { error: "CHAT_NOT_FOUND" },
        { status: 404 }
      );
    }

    const chatData = chatSnap.data();

    if (chatData?.sellerUid !== uid) {
      return NextResponse.json(
        { error: "FORBIDDEN" },
        { status: 403 }
      );
    }

    if (action === "close") {
      await chatRef.update({
        status: "closed",
        updatedAt: new Date().toISOString(),
      });
    }

    if (action === "open") {
      await chatRef.update({
        status: "active",
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
    });
  } catch {
    return NextResponse.json(
      { error: "CHAT_UPDATE_FAILED" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{ chatId?: string }>;
  }
) {
  try {
    const uid = getSessionUid(request);

    if (!uid) {
      return NextResponse.json(
        { error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const chatId = await getChatId(context.params);

    if (!chatId) {
      return NextResponse.json(
        { error: "CHAT_ID_REQUIRED" },
        { status: 400 }
      );
    }

    const chatRef = marketplaceAdminDb
      .collection("marketplaceChats")
      .doc(chatId);

    const chatSnap = await chatRef.get();

    if (!chatSnap.exists) {
      return NextResponse.json(
        { error: "CHAT_NOT_FOUND" },
        { status: 404 }
      );
    }

    const chatData = chatSnap.data();

    if (!isParticipant(chatData, uid)) {
      return NextResponse.json(
        { error: "FORBIDDEN" },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const messageId = url.searchParams.get("messageId");

    if (messageId) {
      const messageRef = chatRef
        .collection("messages")
        .doc(messageId);

      const messageSnap = await messageRef.get();

      if (!messageSnap.exists) {
        return NextResponse.json(
          { error: "MESSAGE_NOT_FOUND" },
          { status: 404 }
        );
      }

      const messageData = messageSnap.data();

      if (messageData?.senderUid !== uid) {
        return NextResponse.json(
          { error: "FORBIDDEN_MESSAGE_DELETE" },
          { status: 403 }
        );
      }

      await messageRef.delete();

      await chatRef.update({
        updatedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        deletedMessageId: messageId,
      });
    }

    const messagesSnap = await chatRef
      .collection("messages")
      .get();

    const docs = messagesSnap.docs;

    for (let i = 0; i < docs.length; i += 400) {
      const batch = marketplaceAdminDb.batch();
      const chunk = docs.slice(i, i + 400);

      for (const message of chunk) {
        batch.delete(message.ref);
      }

      await batch.commit();
    }

    await chatRef.delete();

    return NextResponse.json({
      success: true,
      deletedChatId: chatId,
      deletedMessages: docs.length,
    });
  } catch {
    return NextResponse.json(
      { error: "CHAT_DELETE_FAILED" },
      { status: 500 }
    );
  }
}
