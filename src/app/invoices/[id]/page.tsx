"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { InvoiceChecker } from "@/components/InvoiceChecker";
import { InvoiceDetails } from "@/components/InvoiceDetails";
import { InvoiceLineItem } from "@/lib/api";

export default function InvoiceDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const invoiceId = params.id as string;
  const txnId = searchParams.get("txnId") || "";

  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvoiceDetails() {
      setLoading(true);
      setError(null);

      try {
        // Fetch line items
        const lineItemsResponse = await fetch(
          `/api/invoices/${invoiceId}?txnId=${txnId}`
        );

        if (!lineItemsResponse.ok) {
          throw new Error("Failed to fetch invoice details");
        }

        const lineItemsData = await lineItemsResponse.json();
        setLineItems(lineItemsData.data);

        // Optionally fetch invoice header info
        // You might want to add this to the API if needed
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    if (invoiceId && txnId) {
      fetchInvoiceDetails();
    }
  }, [invoiceId, txnId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link
            href="/invoices"
            className="text-blue-600 hover:text-blue-800 mb-6 inline-block"
          >
            ← Back to Invoices
          </Link>

          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link
          href="/invoices"
          className="text-blue-600 hover:text-blue-800 mb-6 inline-block font-medium"
        >
          ← Back to Invoices
        </Link>

        {lineItems.length > 0 ? (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <InvoiceDetails
                lineItems={lineItems}
                invoiceNumber={lineItems[0]?.TxnInstanceDetail || invoiceId}
                currency="KWD"
              />
            </div>
            <InvoiceChecker lineItems={lineItems} />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No line items found for this invoice</p>
          </div>
        )}
      </div>
    </div>
  );
}
