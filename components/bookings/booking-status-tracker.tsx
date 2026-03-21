'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, CheckCircle, Clock, Loader2, RefreshCcw, Package, Truck, RotateCcw } from 'lucide-react'
import { bookingApi } from '@/lib/api'
import { toast } from 'sonner'

export function BookingStatusTracker() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadBookings()
  }, [])

  async function loadBookings() {
    try {
      setLoading(true)
      const response = await bookingApi.getAll()
      if (response.data.success) {
        setBookings(response.data.data)
      }
    } catch (error: any) {
      console.error('Failed to load bookings:', error)
      toast.error('Failed to sync booking statuses')
    } finally {
      setLoading(false)
    }
  }

  const pendingBookings = bookings.filter(b => ['Reserved', 'Ready for Pickup'].includes(b.status))
  const activeBookings = bookings.filter(b => b.status === 'Delivered')
  const completedBookings = bookings.filter(b => ['Returned', 'Cancelled'].includes(b.status))

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Reserved': return <Clock className="w-4 h-4 text-blue-500" />
      case 'Ready for Pickup': return <Package className="w-4 h-4 text-yellow-600" />
      case 'Delivered': return <Truck className="w-4 h-4 text-purple-600" />
      case 'Returned': return <RotateCcw className="w-4 h-4 text-green-600" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const BookingCard = ({ booking }: { booking: any }) => (
    <Card className='p-6 border-blue-50 hover:border-blue-200 transition-all shadow-sm hover:shadow-lg rounded-2xl bg-white'>
      <div className='flex justify-between items-start mb-4'>
        <div className='flex-1'>
          <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{booking.booking_number}</span>
              <Badge variant="outline" className="text-[9px] h-5 border-blue-100 bg-blue-50 font-bold flex items-center gap-1">
                  {getStatusIcon(booking.status)}
                  {booking.status}
              </Badge>
          </div>
          <h3 className='font-bold text-slate-800 text-lg'>{booking.customer_name}</h3>
        </div>
        <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase">Balance Due</p>
            <p className="text-xl font-black text-blue-700">${Number(booking.balance_amount || 0).toFixed(2)}</p>
        </div>
      </div>
      
      <div className='grid grid-cols-2 gap-6 text-sm mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100/50'>
        <div>
          <p className='text-[10px] font-black text-slate-400 uppercase mb-1'>Rental Period</p>
          <p className='font-bold text-slate-700'>
              {new Date(booking.delivery_date).toLocaleDateString()} — {new Date(booking.return_date).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <p className='text-[10px] font-black text-slate-400 uppercase mb-1'>Items Allocated</p>
          <p className='font-bold text-slate-700'>{booking.items?.length || 0} Line Items</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 rounded-xl border-blue-100 text-primary font-bold text-xs h-10 hover:bg-blue-50">
            View Contract
        </Button>
        {booking.status === 'Reserved' && (
            <Button className="flex-1 bg-primary hover:bg-blue-700 rounded-xl font-bold text-xs h-10 text-white shadow-lg shadow-blue-100">
                Mark Ready
            </Button>
        )}
      </div>
    </Card>
  )

  if (loading && bookings.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary opacity-40" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Checking states...</p>
        </div>
    )
  }

  return (
    <div className='w-full space-y-6'>
      <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={loadBookings} disabled={loading} className="text-slate-400">
              <RefreshCcw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Update States
          </Button>
      </div>

      <Tabs defaultValue='pending' className='w-full'>
        <TabsList className='grid w-full grid-cols-3 mb-8 h-14 bg-slate-100/50 p-1.5 rounded-2xl'>
          <TabsTrigger value='pending' className='flex items-center gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-slate-500'>
            Pending
            <Badge variant='outline' className="ml-1 bg-blue-50 text-blue-600 border-blue-100">{pendingBookings.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value='active' className='flex items-center gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-slate-500'>
            Active
            <Badge variant='outline' className="ml-1 bg-purple-50 text-purple-600 border-purple-100">{activeBookings.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value='completed' className='flex items-center gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-slate-500'>
            History
            <Badge variant='outline' className="ml-1 bg-slate-100 text-slate-600 border-slate-200">{completedBookings.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value='pending' className='mt-0 transition-all'>
          {pendingBookings.length === 0 ? (
            <EmptyState message="No pending reservations found." />
          ) : (
            <div className='grid gap-6 md:grid-cols-2'>
              {pendingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value='active' className='mt-0 transition-all'>
          {activeBookings.length === 0 ? (
            <EmptyState message="No items currently with customers." />
          ) : (
            <div className='grid gap-6 md:grid-cols-2'>
              {activeBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value='completed' className='mt-0 transition-all'>
          {completedBookings.length === 0 ? (
            <EmptyState message="No previous records found." />
          ) : (
            <div className='grid gap-6 md:grid-cols-2'>
              {completedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className='text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100 border-spacing-4'>
            <Package className="w-10 h-10 text-slate-200 mx-auto mb-4" />
            <p className='text-sm font-bold text-slate-400'>{message}</p>
        </div>
    )
}

