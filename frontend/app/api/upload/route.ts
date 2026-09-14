import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/upload
 * Upload image - routes to appropriate backend endpoint
 * For avatars: sends to /api/upload/avatar
 * For products: sends to /api/upload
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, filename, isAvatar = false, userId } = body;

    if (!image) {
      return NextResponse.json(
        { success: false, error: "No image provided" },
        { status: 400 }
      );
    }

    // Determine endpoint and payload based on image type
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    let endpoint = `${backendUrl}/api/upload`;
    let payload: any = { image };

    if (isAvatar) {
      endpoint = `${backendUrl}/api/upload/avatar`;
      payload = { image, userId };
    } else {
      payload = { image, filename };
    }

    console.log(`Uploading to backend: ${endpoint}`, { isAvatar, userId, filename });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Backend upload error:", data);
      return NextResponse.json(
        {
          success: false,
          error: data.error || data.message || "Upload failed",
        },
        { status: response.status }
      );
    }

    console.log("Upload successful", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}
