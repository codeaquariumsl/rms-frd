"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRef } from "react"
import html2pdf from "html2pdf.js"

interface IssueReceiptProps {
  data: {
    id: string
    issueNumber: string
    customer: { id: string; name: string; phone?: string; address?: string }
    items: Array<{
      id: string
      name: string
      quantity: number
      condition: string
      price: number
      serialNumbers?: string[]
    }>
    issueDate: string
    numberOfDays: number
    returnDate: string
    totalAmount: number
    paymentStatus: "unpaid" | "paid"
    issuedDate: string
  }
  onBack?: () => void
}

export function IssueReceipt({ data, onBack }: IssueReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  function handlePrint() {
    window.print()
  }

  function handleDownload() {
    if (!receiptRef.current) return

    const element = receiptRef.current
    const opt = {
      margin: 10,
      filename: `issue-${data.issueNumber}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    }

    html2pdf().set(opt).from(element).save()
  }

  const issuedDate = new Date(data.issuedDate)

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={handlePrint} variant="outline">
          Print
        </Button>
        <Button onClick={handleDownload} variant="outline">
          Download PDF
        </Button>
        {onBack && (
          <Button onClick={onBack} variant="outline">
            Back
          </Button>
        )}
      </div>

      <Card className="p-8 bg-white border-gray-300" ref={receiptRef}>
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">ITEM ISSUANCE RECEIPT</h1>
          <p className="text-sm text-gray-600">EQUIPMENT RENTAL MANAGEMENT SYSTEM</p>
        </div>

        {/* Receipt Number and Date */}
        <div className="flex justify-between mb-6 text-sm">
          <div>
            <p className="text-gray-600">Receipt No:</p>
            <p className="font-bold text-lg text-primary">{data.issueNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600">Date:</p>
            <p className="font-semibold">{issuedDate.toLocaleDateString()}</p>
          </div>
        </div>

        {/* Customer & Date Details */}
        <div className="border-t-2 border-b-2 border-gray-800 py-4 mb-6">
          <div className="grid grid-cols-2 gap-6 text-sm mb-4">
            <div>
              <p className="text-gray-600 font-semibold">Customer Name:</p>
              <p className="border-b border-dotted border-gray-400 min-h-6 pt-1 font-semibold">
                {data.customer.name}
              </p>
            </div>
            <div>
              <p className="text-gray-600 font-semibold">Contact Number:</p>
              <p className="border-b border-dotted border-gray-400 min-h-6 pt-1">
                {data.customer.phone || "___________________"}
              </p>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-gray-600 font-semibold text-sm">Address:</p>
            <p className="border-b border-dotted border-gray-400 min-h-6 pt-1 text-sm">
              {data.customer.address || "___________________"}
            </p>
          </div>
          <div className="border-t border-gray-400 pt-3">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600 font-semibold">Issue Date:</p>
                <p className="font-semibold">{new Date(data.issueDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">No. of Days:</p>
                <p className="font-semibold">{data.numberOfDays}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Return Date:</p>
                <p className="font-semibold">{new Date(data.returnDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <table className="w-full border border-gray-800 text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-100">
                <th className="border-r border-gray-800 p-2 text-left font-bold">Item</th>
                <th className="border-r border-gray-800 p-2 text-center font-bold w-12">Qty</th>
                <th className="border-r border-gray-800 p-2 text-center font-bold w-16">Price</th>
                <th className="border-r border-gray-800 p-2 text-center font-bold w-16">Total</th>
                <th className="border-r border-gray-800 p-2 text-left font-bold">Serial #</th>
                <th className="border-r border-gray-800 p-2 text-left font-bold">Condition</th>
                <th className="border-r border-gray-800 p-2 text-center font-bold w-16">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-400">
                  <td className="border-r border-gray-400 p-2">{item.name}</td>
                  <td className="border-r border-gray-400 p-2 text-center font-semibold">{item.quantity}</td>
                  <td className="border-r border-gray-400 p-2 text-right font-semibold">${item.price.toFixed(2)}</td>
                  <td className="border-r border-gray-400 p-2 text-right font-semibold">${(item.price * item.quantity).toFixed(2)}</td>
                  <td className="border-r border-gray-400 p-2 text-sm">
                    {item.serialNumbers && item.serialNumbers.length > 0 ? (
                      item.serialNumbers.map((sn) => (
                        <div key={sn} className="font-mono text-xs bg-gray-50 px-1 py-0.5 rounded">
                          {sn}
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="border-r border-gray-400 p-2 text-center text-sm">{item.condition}</td>
                  <td className="border-r border-gray-400 p-2 min-h-12">
                    <div className="border-b border-dotted border-gray-400 h-10"></div>
                  </td>
                </tr>
              ))}
              {[...Array(Math.max(0, 3 - data.items.length))].map((_, idx) => (
                <tr key={`empty-${idx}`} className="border-b border-gray-400">
                  <td className="border-r border-gray-400 p-2"></td>
                  <td className="border-r border-gray-400 p-2"></td>
                  <td className="border-r border-gray-400 p-2"></td>
                  <td className="border-r border-gray-400 p-2"></td>
                  <td className="border-r border-gray-400 p-2"></td>
                  <td className="border-r border-gray-400 p-2"></td>
                  <td className="border-r border-gray-400 p-2 min-h-12">
                    <div className="border-b border-dotted border-gray-400 h-10"></div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-800 font-bold">
                <td colSpan={3} className="border-r border-gray-800 p-2 text-right">TOTAL AMOUNT:</td>
                <td className="border-r border-gray-800 p-2 text-right text-lg">${data.totalAmount.toFixed(2)}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Payment Status */}
        <div className="mb-8">
          <div className="flex gap-6 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.paymentStatus === "unpaid"}
                readOnly
                className="w-4 h-4"
              />
              <span>Not Paid / On Account</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.paymentStatus === "paid"}
                readOnly
                className="w-4 h-4"
              />
              <span>Paid</span>
            </label>
          </div>
        </div>

        {/* Signature Section */}
        <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-400">
          <div className="text-center text-sm">
            <div className="border-t-2 border-gray-800 h-16 mb-2"></div>
            <p className="font-semibold text-gray-800">Issued By</p>
            <p className="text-xs text-gray-600 mt-1">(Authorized Person)</p>
          </div>
          <div className="text-center text-sm">
            <div className="border-t-2 border-gray-800 h-16 mb-2"></div>
            <p className="font-semibold text-gray-800">Received By</p>
            <p className="text-xs text-gray-600 mt-1">(Customer Signature)</p>
          </div>
          <div className="text-center text-sm">
            <div className="border-t-2 border-gray-800 h-16 mb-2"></div>
            <p className="font-semibold text-gray-800">Supervisor</p>
            <p className="text-xs text-gray-600 mt-1">(Authorized)</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-600 mt-8 pt-4 border-t border-gray-300">
          <p>This is an official receipt. Please keep it for your records.</p>
          <p>Receipt ID: {data.id}</p>
        </div>
      </Card>
    </div>
  )
}
