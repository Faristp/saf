"use client";

import { useState, useEffect } from "react";
import { InvoiceList } from "@/components/InvoiceList";
import { InvoiceListItem } from "@/lib/api";

const ITEMS_PER_PAGE = 25;

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  useEffect(() => {
    async function fetchInvoices() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/invoices?skip=${skip}&take=${ITEMS_PER_PAGE}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch invoices");
        }

        const data = await response.json();
        setInvoices(data.data);
        setTotalCount(data.totalCount);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    }

    fetchInvoices();
  }, [skip]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sales Invoices</h1>
          <p className="text-gray-600 mt-2">
            Total Invoices: {totalCount.toLocaleString()}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            Error: {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading invoices...</p>
          </div>
        ) : invoices.length > 0 ? (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <InvoiceList invoices={invoices} />
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} | Showing{" "}
                {skip + 1}-{Math.min(skip + ITEMS_PER_PAGE, totalCount)} of{" "}
                {totalCount} invoices
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const pageNum =
                    currentPage <= 3
                      ? i + 1
                      : currentPage > totalPages - 3
                        ? totalPages - 4 + i
                        : currentPage - 2 + i;

                  if (pageNum < 1 || pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-4 py-2 rounded ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No invoices found</p>
          </div>
        )}
      </div>
    </div>
  );
}
