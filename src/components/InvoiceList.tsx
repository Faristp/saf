import React from "react";
import { InvoiceListItem } from "@/lib/api";
import Link from "next/link";

interface InvoiceListProps {
  invoices: InvoiceListItem[];
}

export function InvoiceList({ invoices }: InvoiceListProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-black">
        <thead>
          <tr className="bg-gray-100 border-b-2 border-gray-300">
            <th className="px-4 py-2 text-left font-semibold">Invoice #</th>
            <th className="px-4 py-2 text-left font-semibold">Date</th>
            <th className="px-4 py-2 text-left font-semibold">Customer</th>
            <th className="px-4 py-2 text-left font-semibold">Salesman</th>
            <th className="px-4 py-2 text-left font-semibold">Warehouse</th>
            <th className="px-4 py-2 text-right font-semibold">Amount</th>
            <th className="px-4 py-2 text-left font-semibold">Status</th>
            <th className="px-4 py-2 text-left font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.SalesInvoices_SysId} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2 font-medium">
                {invoice.SalesInvoices_TxnNum}
              </td>
              <td className="px-4 py-2">
                {new Date(invoice.SalesInvoices_TxnDate).toLocaleDateString()}
              </td>
              <td className="px-4 py-2">{invoice.Customers_Name}</td>
              <td className="px-4 py-2">{invoice.Salesmans_Name}</td>
              <td className="px-4 py-2">{invoice.Warehouses_Name}</td>
              <td className="px-4 py-2 text-right font-semibold">
                {typeof invoice.GrossValue === "number" && !isNaN(invoice.GrossValue) ? (
                  <>{invoice.GrossValue.toFixed(3)} {invoice.Currencies_Code}</>
                ) : (
                  <span className="text-gray-500">—</span>
                )}
              </td>
              <td className="px-4 py-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    invoice.PaymentStatus === "Unpaid"
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {invoice.PaymentStatus}
                </span>
              </td>
              <td className="px-4 py-2">
                <Link
                  href={`/invoices/${invoice.SalesInvoices_SysId}?txnId=${invoice.SalesInvoices_TxnInstanceId}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
