import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Check if authentication cookie exists
    // Adjust the cookie name based on your backend
    const authCookie = cookieStore.get("auth") || 
                      cookieStore.get("session") || 
                      cookieStore.get("token");

    if (!authCookie) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          username: "User", // You might want to decode this from the cookie or store it separately
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { error: "Auth check failed" },
      { status: 500 }
    );
  }
}
