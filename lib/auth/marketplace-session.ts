import crypto from "crypto";

const COOKIE_NAME = "marketplace_session";

function getSecret() {
  const secret = process.env.MARKETPLACE_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("MARKETPLACE_SESSION_SECRET تنظیم نشده یا خیلی کوتاه است");
  }

  return secret;
}

function sign(value: string) {
  return crypto
    .createHmac("sha256", getSecret())
    .update(value)
    .digest("base64url");
}

export function createMarketplaceSessionValue(uid: string) {
  const payload = Buffer.from(
    JSON.stringify({
      uid,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
    })
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function verifyMarketplaceSessionValue(value: string) {
  try {
    const [payload, signature] = value.split(".");

    if (!payload || !signature) {
      return null;
    }

    const expected = sign(payload);

    if (
      signature.length !== expected.length ||
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expected)
      )
    ) {
      return null;
    }

    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    if (!data.uid || !data.exp || Date.now() > data.exp) {
      return null;
    }

    return {
      uid: data.uid as string,
    };
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
