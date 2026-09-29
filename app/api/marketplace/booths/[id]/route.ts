import { NextResponse } from "next/server";
import { marketplaceAdminDb } from "@/lib/marketplace-firebase-admin";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "شناسه غرفه نامعتبر است." },
        { status: 400 }
      );
    }

    const boothDoc = await marketplaceAdminDb
      .collection("marketplaceBooths")
      .doc(id)
      .get();

    if (!boothDoc.exists) {
      return NextResponse.json(
        { success: false, message: "غرفه پیدا نشد." },
        { status: 404 }
      );
    }

    const data = boothDoc.data();

    if (data?.isVisible !== true) {
      return NextResponse.json(
        {
          success: false,
          message: "این غرفه در حال حاضر قابل نمایش نیست.",
        },
        { status: 404 }
      );
    }

    const listingsSnap = await marketplaceAdminDb
      .collection("marketplaceListings")
      .where("boothId", "==", boothDoc.id)
      .where("isPublished", "==", true)
      .get();

    const listings = listingsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      booth: {
        id: boothDoc.id,
        boothName: data?.boothName || "",
        description: data?.description || "",
        category: data?.category || "",
        city: data?.city || "",
        neighborhood: data?.neighborhood || "",
        logoUrl: data?.logoUrl || "",
      },
      listings,
    });
  } catch (error) {
    console.error("Marketplace booth GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "خطا در دریافت غرفه.",
      },
      { status: 500 }
    );
  }
}
