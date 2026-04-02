import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { getStorage } from "firebase-admin/storage";

/**
 * ATF VAKTHA - Upload API
 * Uploads audio to Firebase Storage → triggers AI processing
 */

// Initialize Firebase Admin (safe for Next.js)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    const bucket = getStorage().bucket();

    // IMPORTANT: 'speeches/' triggers Cloud Function
    const fileName = `speeches/${Date.now()}-${file.name}`;
    const fileUpload = bucket.file(fileName);

    await fileUpload.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    return NextResponse.json({
      success: true,
      path: fileName,
      message: "Upload successful. AI processing started.",
    });

  } catch (error) {
    console.error("Upload API Error:", error);

    return NextResponse.json(
      { error: "Internal Server Error during upload" },
      { status: 500 }
    );
  }
}