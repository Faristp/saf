import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // Clear all auth-related cookies
    // Adjust cookie names based on your backend
    const authCookieNames = ["auth", "session", "token", "authorization"];
    
    authCookieNames.forEach((name) => {
      cookieStore.delete(name);
    });

    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear cookies on the response
    authCookieNames.forEach((name) => {
      response.cookies.delete(name);
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}
