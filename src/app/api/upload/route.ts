import { NextResponse } from "next/server";

/**
 * ATF VAKTHA - Upload API (CLEAN VERSION)
 * This API is optional — currently used only as a health check.
 * Actual uploads are handled directly from frontend Firebase SDK.
 */

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // NOTE:
    // Upload should happen via Firebase client SDK on frontend.
    // This API simply confirms request is received.

    return NextResponse.json({
      success: true,
      message: "Upload endpoint working. Use Firebase client SDK for actual upload.",
    });

  } catch (error) {
    console.error("Upload API Error:", error);

    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}