import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/upload
 * Upload image to Cloudinary
 * This is a client-side proxy to handle image uploads securely
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, folder = "rufa_elan", public_id } = body;

    if (!image) {
      return NextResponse.json(
        { success: false, error: "No image provided" },
        { status: 400 }
      );
    }

    // Call the backend upload endpoint
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    const response = await fetch(`${backendUrl}/api/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image,
        folder,
        public_id,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        {
          success: false,
          error: error.message || "Upload failed",
        },
        { status: response.status }
      );
    }

    const data = await response.json();
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
