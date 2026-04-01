import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { getStorage } from "firebase-admin/storage";

if (!admin.apps.length) {
  admin.initializeApp({
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  const buffer = Buffer.from(await file.arrayBuffer());

  const bucket = getStorage().bucket();
  const fileName = `speeches/${Date.now()}-${file.name}`;
  const fileUpload = bucket.file(fileName);

  await fileUpload.save(buffer);

  return NextResponse.json({ success: true });
}
