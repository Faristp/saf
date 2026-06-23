import { NextRequest, NextResponse } from "next/server";
import { getInvoicesList } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const take = parseInt(searchParams.get("take") || "25", 10);
    const cookieHeader = request.headers.get("cookie") || undefined;

    const data = await getInvoicesList(skip, take, cookieHeader);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch invoices",
      },
      { status: 500 }
    );
  }
}
