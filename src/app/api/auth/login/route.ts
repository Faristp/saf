import { NextRequest, NextResponse } from "next/server";

const LOGIN_URL = process.env.LOGIN_URL || "https://login.mycompany.com";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const Username = formData.get("Username") as string;
    const Password = formData.get("Password") as string;

    if (!Username || !Password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Call your backend login API
    const loginUrl = `${LOGIN_URL}/User/Login`;

    // Create FormData for backend
    const backendFormData = new FormData();
    backendFormData.append("Username", Username);
    backendFormData.append("Password", Password);

    const response = await fetch(loginUrl, {
      method: "POST",
      body: backendFormData,
      redirect: "manual",
    });

    const rawBody = await response.text();
    let data: any = null;
    try {
      data = JSON.parse(rawBody);
    } catch {
      data = null;
    }

    const setCookieHeader = response.headers.get("set-cookie");
    const location = response.headers.get("location");
    const isRedirect = response.status >= 300 && response.status < 400;
    const isSuccess = response.ok || isRedirect;

    if (!isSuccess) {
      return NextResponse.json(
        {
          error:
            data?.message ||
            data?.error ||
            rawBody ||
            "Login failed",
        },
        { status: response.status }
      );
    }

    const apiResponse = NextResponse.json(
      {
        success: true,
        message: "Logged in successfully",
        user: { username: Username },
        redirectTo: "/invoices",
        backend: data ?? { text: rawBody.slice(0, 1000) },
      },
      { status: 200 }
    );

    if (setCookieHeader) {
      const cookies = setCookieHeader
        .split(/,\s*(?=[^=]+=[^;]+)/)
        .map((cookieString) => cookieString.trim())
        .filter(Boolean);

      for (const cookieString of cookies) {
        const [cookiePair] = cookieString.split(";");
        const [name, value] = cookiePair.split("=");
        if (!name || value === undefined) continue;

        apiResponse.cookies.set({
          name: name.trim(),
          value: value.trim(),
          path: "/",
          httpOnly: true,
          sameSite: "lax",
        });
      }
    }

    return apiResponse;

    return apiResponse;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Login failed" },
      { status: 500 }
    );
  }
}
