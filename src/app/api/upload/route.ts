import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { getStorage } from "firebase-admin/storage";

/**
 * Pavan's Backend Task: Required Addition - Upload API
 * This API receives a file from the frontend, saves it to the 'speeches/'
 * folder in Firebase Storage, which then triggers the AI analysis.
 */

// Initialize Admin SDK with Service Account for Storage access
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Handle newline characters in the private key string
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
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to Buffer for Firebase Admin
    const buffer = Buffer.from(await file.arrayBuffer());

    const bucket = getStorage().bucket();
    
    // Crucial: Use the 'speeches/' prefix to trigger your Cloud Function
    const fileName = `speeches/${Date.now()}-${file.name}`;
    const fileUpload = bucket.file(fileName);

    // Save the file to the bucket
    await fileUpload.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    return NextResponse.json({ 
      success: true, 
      path: fileName,
      message: "File uploaded. AI processing started." 
    });

  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error during upload" }, 
      { status: 500 }
    );
  }
}