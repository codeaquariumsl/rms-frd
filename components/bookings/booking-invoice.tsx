'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Download, Printer, ShieldCheck, Mail, Phone, MapPin, Hash } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface InvoiceProps {
  booking: any
}

export function BookingInvoice({ booking }: InvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null)

  const deliveryDate = new Date(booking.delivery_date)
  const returnDate = new Date(booking.return_date)
  const days = Math.ceil((returnDate.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24)) || 1

  const handlePrint = () => {
    if (invoiceRef.current) {
      const printWindow = window.open('', '', 'width=900,height=600')
      if (printWindow) {
        // Simple print styles injection
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice - ${booking.booking_number}</title>
              <style>
                body { font-family: sans-serif; padding: 40px; color: #333; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { text-align: left; padding: 12px; border-bottom: 1px solid #eee; }
                th { background: #f8fafc; color: #1e293b; font-weight: 800; }
                .header { display: flex; justify-content: space-between; border-bottom: 4px solid #1e40af; padding-bottom: 20px; }
                .totals { margin-top: 30px; margin-left: auto; width: 300px; }
                .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
                .grand-total { border-top: 2px solid #1e40af; margin-top: 10px; padding-top: 10px; font-weight: 900; font-size: 1.2em; color: #1e40af; }
              </style>
            </head>
            <body>\${invoiceRef.current.innerHTML}</body>
          </html>
        `)
        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 250)
      }
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex gap-3 justify-end'>
        <Button onClick={handlePrint} className='gap-2 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100 rounded-xl'>
          <Printer className='w-4 h-4' />
          Print Document
        </Button>
        <Button variant='outline' className='gap-2 border-blue-200 rounded-xl'>
          <Download className='w-4 h-4' />
          Export PDF
        </Button>
      </div>

      <Card ref={invoiceRef} className='p-12 bg-white border-2 border-slate-100 shadow-2xl rounded-3xl overflow-hidden relative'>
        {/* Aesthetic Watermark */}
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12 pointer-events-none">
            <ShieldCheck size={400} />
        </div>

        <div className='max-w-4xl mx-auto relative z-10'>
          {/* Header */}
          <div className='flex justify-between items-start mb-12'>
            <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <ShieldCheck className="text-white w-6 h-6" />
                    </div>
                    <h1 className='text-3xl font-black text-blue-900 tracking-tighter'>AQUA RENTALS</h1>
                </div>
                <p className='text-sm text-slate-500 max-w-xs font-medium'>
                    Premium Rental Management Systems<br/>
                    123 Digital Plaza, Tech Hub, SL
                </p>
            </div>
            <div className='text-right space-y-1'>
              <h2 className="text-4xl font-black text-slate-800 opacity-10 uppercase tracking-tighter mb-4">INVOICE</h2>
              <p className='font-black text-blue-600 flex items-center justify-end gap-2'>
                  <Hash className="w-4 h-4" /> {booking.booking_number}
              </p>
              <p className='text-xs font-bold text-slate-400 uppercase tracking-widest'>Date: {new Date().toLocaleDateString()}</p>
              <Badge variant="outline" className="mt-4 border-blue-200 text-blue-700 bg-blue-50 font-bold uppercase">{booking.status}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-16 mb-12">
            <div className="space-y-4">
              <h3 className='text-[10px] font-black text-blue-600 uppercase tracking-widest border-b border-blue-50 pb-2'>Client Information</h3>
              <div className='space-y-2'>
                <p className='text-xl font-black text-slate-800'>{booking.customer_name}</p>
                <div className="space-y-1 text-sm text-slate-600 font-medium">
                    <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 opacity-40"/> {booking.customer_address || 'N/A'}</p>
                    <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 opacity-40"/> {booking.customer_phone || 'N/A'}</p>
                    <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 opacity-40"/> {booking.customer_email || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className='text-[10px] font-black text-blue-600 uppercase tracking-widest border-b border-blue-50 pb-2'>Period & Schedule</h3>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Commences</p>
                   <p className="text-sm font-black text-slate-700">{deliveryDate.toLocaleDateString()}</p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Terminates</p>
                   <p className="text-sm font-black text-slate-700">{returnDate.toLocaleDateString()}</p>
                </div>
                <div className="col-span-2 pt-2">
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Duration</p>
                   <p className="text-sm font-black text-blue-700">{days} Rental Days</p>
                </div>
              </div>
            </div>
          </div>

          <div className='mb-12 overflow-hidden rounded-2xl border border-slate-100 shadow-sm'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='bg-slate-50 border-b border-slate-100'>
                  <th className='text-left px-6 py-4 text-blue-900 font-black uppercase text-[10px] tracking-widest'>Item Specification</th>
                  <th className='text-center px-6 py-4 text-blue-900 font-black uppercase text-[10px] tracking-widest'>Qty</th>
                  <th className='text-right px-6 py-4 text-blue-900 font-black uppercase text-[10px] tracking-widest'>Rate per Day</th>
                  <th className='text-right px-6 py-4 text-blue-900 font-black uppercase text-[10px] tracking-widest'>Total Line</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {booking.items?.map((item: any, idx: number) => {
                  const itemTotal = Number(item.rental_rate || 0) * (item.quantity || 1) * days
                  return (
                    <tr key={idx} className='hover:bg-slate-50/50 transition-colors'>
                      <td className='px-6 py-4 font-bold text-slate-700'>{item.item_name}</td>
                      <td className='px-6 py-4 text-center font-bold text-slate-600'>{item.quantity || 1}</td>
                      <td className='px-6 py-4 text-right font-medium text-slate-600'>${Number(item.rental_rate || 0).toFixed(2)}</td>
                      <td className='px-6 py-4 text-right font-black text-blue-800'>${itemTotal.toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className='flex justify-end'>
            <div className='w-80 space-y-3 bg-slate-50/50 p-6 rounded-2xl border border-slate-100'>
              <div className='flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider'>
                <span>Net Rental Amount</span>
                <span>${Number(booking.total_amount || 0).toFixed(2)}</span>
              </div>
              <div className='flex justify-between text-xs font-bold text-rose-500 uppercase tracking-wider'>
                <span>Advance Paid</span>
                <span>- ${Number(booking.paid_amount || 0).toFixed(2)}</span>
              </div>
              <div className='flex justify-between pt-4 mt-2 border-t-2 border-blue-100 items-center'>
                <span className='text-sm font-black text-blue-900 uppercase tracking-tight'>Remaining Balance</span>
                <span className='text-2xl font-black text-blue-600'>${Number(booking.balance_amount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          <div className='mt-16 pt-8 border-t border-slate-100 text-center space-y-4'>
            <p className='text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]'>
                Formal Business Document - Proprietary To Aqua Rentals
            </p>
            <div className="flex justify-center gap-8 opacity-40">
                <div className="h-[1px] w-20 bg-slate-300"></div>
                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                <div className="h-[1px] w-20 bg-slate-300"></div>
            </div>
            <p className='text-xs text-slate-500 font-medium italic italic'>
              "Rental items must be inspected upon delivery. Any damages discovered after acceptance will be billed to the customer deposit."
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

