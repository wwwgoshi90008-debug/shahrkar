import { NextResponse } from "next/server";
import { marketplaceAdminDb } from "@/lib/marketplace-firebase-admin";

function normalize(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\u200c/g, " ")
    .replace(/\s+/g, " ");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = normalize(searchParams.get("q") || "");
    const city = normalize(searchParams.get("city") || "");

    const snapshot = await marketplaceAdminDb
      .collection("marketplaceBooths")
      .where("isVisible", "==", true)
      .get();

    const booths = snapshot.docs
      .map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          boothName: data.boothName || "",
          description: data.description || "",
          category: data.category || "",
          city: data.city || "",
          neighborhood: data.neighborhood || "",
          logoUrl: data.logoUrl || "",
        };
      })
      .filter((booth) => {
        if (city && normalize(booth.city) !== city) {
          return false;
        }

        if (!q) {
          return true;
        }

        const name = normalize(booth.boothName);
        const category = normalize(booth.category);
        const description = normalize(booth.description);

        return (
          name.includes(q) ||
          category.includes(q) ||
          description.includes(q)
        );
      })
      .sort((a, b) => {
        if (!q) return 0;

        const aName = normalize(a.boothName);
        const bName = normalize(b.boothName);

        const aScore = aName === q ? 0 : aName.startsWith(q) ? 1 : 2;
        const bScore = bName === q ? 0 : bName.startsWith(q) ? 1 : 2;

        return aScore - bScore;
      });

    const cities = Array.from(
      new Set(
        snapshot.docs
          .map((doc) => doc.data().city)
          .filter(Boolean)
          .map((value) => String(value))
      )
    ).sort((a, b) => a.localeCompare(b, "fa"));

    return NextResponse.json({
      success: true,
      booths,
      cities,
      total: booths.length,
    });
  } catch (error) {
    console.error("Marketplace booths GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "خطا در دریافت غرفه‌ها",
      },
      { status: 500 }
    );
  }
}
