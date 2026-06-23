import { NextRequest, NextResponse } from "next/server";
import { getInvoiceDetails } from "@/lib/api";

export async function GET(request: NextRequest, context: any) {
  try {
    // `context.params` can be a Promise in Next.js; await it to be safe
    const paramsResolved = await (context?.params ?? {});
    const invoiceId = paramsResolved?.id as string | undefined;
    const searchParams = request.nextUrl.searchParams;
    const txnId = searchParams.get("txnId");

    if (!invoiceId || !txnId) {
      return NextResponse.json(
        { error: "Missing required parameters: invoiceId and txnId" },
        { status: 400 }
      );
    }

    const cookieHeader = request.headers.get("cookie") || undefined;
    const data = await getInvoiceDetails(invoiceId, txnId, cookieHeader);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching invoice details:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch invoice details",
      },
      { status: 500 }
    );
  }
}
