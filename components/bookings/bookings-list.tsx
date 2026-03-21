"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Eye, Trash2, FileText, Loader2, RefreshCcw, Calendar, User, DollarSign } from "lucide-react"
import { BookingInvoice } from "./booking-invoice"
import { bookingApi } from "@/lib/api"
import { toast } from "sonner"

interface BookingListProps {
  organizationId: number
  onViewBooking?: (id: number) => void
  onRefresh?: () => void
}

export function BookingsList({ organizationId, onViewBooking, onRefresh }: BookingListProps) {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  async function fetchBookings() {
    try {
      setLoading(true)
      const response = await bookingApi.getAll()
      if (response.data.success) {
        setBookings(response.data.data)
      }
    } catch (error: any) {
      console.error("Failed to fetch bookings:", error)
      toast.error("Failed to load bookings list")
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel(id: string) {
    if (confirm("Are you sure you want to cancel this booking?")) {
      try {
        const response = await bookingApi.cancel(id)
        if (response.data.success) {
          toast.success("Booking cancelled successfully")
          fetchBookings()
          onRefresh?.()
        }
      } catch (error: any) {
        console.error("Failed to cancel booking:", error)
        toast.error(error.response?.data?.message || "Failed to cancel booking")
      }
    }
  }

  if (selectedInvoice) {
    const booking = bookings.find((b) => String(b.id) === String(selectedInvoice))
    if (booking) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button onClick={() => setSelectedInvoice(null)} variant="outline" className="border-blue-200">
              ← Back to Bookings
            </Button>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 px-4 h-9 font-bold">
              Previewing: {booking.booking_number}
            </Badge>
          </div>
          <BookingInvoice booking={booking} />
        </div>
      )
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Reserved":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Ready for Pickup":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Delivered":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "Returned":
        return "bg-green-100 text-green-800 border-green-200"
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-black text-blue-900 tracking-tight">Rental Bookings</h2>
            <p className="text-sm text-muted-foreground">Manage active reservations and contracts.</p>
        </div>
        <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchBookings} 
            disabled={loading}
            className="text-primary hover:bg-blue-50"
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
            <span className="ml-2">Sync</span>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {bookings.map((booking) => (
          <Card key={booking.id} className="p-6 border-blue-100 shadow-sm hover:shadow-xl transition-all group rounded-2xl bg-white border-2 hover:border-blue-200">
            <div className="flex justify-between items-start mb-5 pb-4 border-b border-blue-50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{booking.booking_number}</span>
                    <Badge variant="outline" className={`text-[10px] h-5 font-bold uppercase ${getStatusColor(booking.status)}`}>
                        {booking.status}
                    </Badge>
                </div>
                <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-400" />
                  {booking.customer_name}
                </h3>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                  <DropdownMenuItem 
                    onClick={() => setSelectedInvoice(String(booking.id))}
                    className="cursor-pointer font-medium"
                  >
                    <FileText className="w-4 h-4 mr-2 text-primary" />
                    Generate Invoice
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onViewBooking?.(booking.id)}
                    className="cursor-pointer font-medium"
                  >
                    <Eye className="w-4 h-4 mr-2 text-blue-500" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleCancel(booking.id)} 
                    className="text-red-600 cursor-pointer font-semibold"
                    disabled={booking.status === "Cancelled" || booking.status === "Returned"}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Cancel Booking
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Delivery
                    </p>
                    <p className="text-sm font-bold text-slate-700">{new Date(booking.delivery_date).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Return
                    </p>
                    <p className="text-sm font-bold text-slate-700">{new Date(booking.return_date).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-blue-50 flex justify-between items-end">
                <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total Value</p>
                    <p className="text-xl font-black text-blue-700 flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {Number(booking.total_amount).toFixed(2)}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Items</p>
                    <p className="text-sm font-bold text-slate-600">{booking.items?.length || 0} units</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {bookings.length === 0 && !loading && (
        <div className="text-center py-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-600">No active bookings</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">Refresh or create a new booking to see it listed here.</p>
          <Button variant="outline" className="mt-6 border-blue-200 text-primary" onClick={fetchBookings}>
            Refresh Sync
          </Button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
            <p className="text-sm font-bold text-slate-500 animate-pulse uppercase tracking-widest">Syncing with server...</p>
        </div>
      )}
    </div>
  )
}

