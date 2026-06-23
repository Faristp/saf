import React from "react";
import { InvoiceLineItem } from "@/lib/api";

interface InvoiceDetailsProps {
  lineItems: InvoiceLineItem[];
  invoiceNumber: string;
  currency: string;
}

export function InvoiceDetails({
  lineItems,
  invoiceNumber,
  currency,
}: InvoiceDetailsProps) {
  const totalGross = lineItems.reduce((sum, item) => sum + item.GrossValue, 0);
  const totalDiscount = lineItems.reduce(
    (sum, item) => sum + (item.DiscountValue || 0),
    0
  );
  const totalTax = lineItems.reduce((sum, item) => sum + item.TaxAmount, 0);
  const totalNet = lineItems.reduce((sum, item) => sum + item.NetValueLC, 0);

  return (
    <div className="space-y-4 text-black">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <h2 className="text-lg font-semibold">Invoice #{invoiceNumber}</h2>
      </div>

      <div className="overflow-x-auto text-black">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="px-4 py-2 text-left font-semibold">Item Code</th>
              <th className="px-4 py-2 text-left font-semibold">Description</th>
              <th className="px-4 py-2 text-left font-semibold">Category</th>
              <th className="px-4 py-2 text-right font-semibold">Qty</th>
              <th className="px-4 py-2 text-left font-semibold">Unit</th>
              <th className="px-4 py-2 text-right font-semibold">Unit Price</th>
              <th className="px-4 py-2 text-right font-semibold">Discount %</th>
              <th className="px-4 py-2 text-right font-semibold">Tax</th>
              <th className="px-4 py-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{item.Item.Code}</td>
                <td className="px-4 py-2">{item.ItemDescription}</td>
                <td className="px-4 py-2">{item.Item.Level1ItemGroupName}</td>
                <td className="px-4 py-2 text-right">
                  {item.Qty.toFixed(2)}
                </td>
                <td className="px-4 py-2">{item.UnitOfMeasure.Code}</td>
                <td className="px-4 py-2 text-right">
                  {item.UnitPrice.toFixed(3)}
                </td>
                <td className="px-4 py-2 text-right">
                  {item.DiscountInPercent.toFixed(2)}%
                </td>
                <td className="px-4 py-2 text-right">
                  {item.TaxAmount.toFixed(3)}
                </td>
                <td className="px-4 py-2 text-right font-semibold">
                  {item.GrossValue.toFixed(3)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-6">
        <div className="w-80 space-y-2 bg-gray-50 p-4 rounded border">
          <div className="flex justify-between">
            <span>Gross Value:</span>
            <span className="font-semibold">{totalGross.toFixed(3)}</span>
          </div>
          {totalDiscount > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Discount:</span>
              <span>-{totalDiscount.toFixed(3)}</span>
            </div>
          )}
          {totalTax > 0 && (
            <div className="flex justify-between">
              <span>Tax:</span>
              <span className="font-semibold">{totalTax.toFixed(3)}</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>
              {totalNet.toFixed(3)} {currency}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
