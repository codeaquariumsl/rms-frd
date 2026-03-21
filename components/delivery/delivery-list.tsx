"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Eye, MapPin, Phone, Loader2, RefreshCcw, Calendar, User, Package, Truck } from "lucide-react"
import { deliveryApi } from "@/lib/api"
import { toast } from "sonner"

interface DeliveryListProps {
  organizationId: number
  dateFilter?: "today" | "tomorrow" | "upcoming" | "delivered"
  onViewDelivery?: (id: string) => void
  onRefresh?: () => void
}

export function DeliveryList({
  organizationId,
  dateFilter = "upcoming",
  onViewDelivery,
  onRefresh,
}: DeliveryListProps) {
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchDeliveries()
  }, [dateFilter])

  async function fetchDeliveries() {
    try {
      setLoading(true)
      const response = await deliveryApi.getAll({ 
          dateFilter: dateFilter === 'delivered' ? undefined : dateFilter,
          status: dateFilter === 'delivered' ? 'Delivered' : undefined
      })
      
      if (response.data.success) {
        setDeliveries(response.data.data)
      }
    } catch (error: any) {
      console.error("Failed to fetch deliveries:", error)
      toast.error("Failed to load delivery records")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-slate-100 text-slate-800 border-slate-200"
      case "Prepared":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Delivered":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={fetchDeliveries} disabled={loading} className="text-slate-400">
              <RefreshCcw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Update List
          </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {deliveries.map((delivery) => (
          <Card key={delivery.id} className="p-6 border-blue-100 shadow-sm hover:shadow-xl transition-all group rounded-2xl bg-white border-2 hover:border-blue-200">
            <div className="flex justify-between items-start mb-5 pb-4 border-b border-blue-50">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{delivery.booking_number}</span>
                    <Badge variant="outline" className={`text-[10px] h-5 font-bold uppercase ${getStatusColor(delivery.status)}`}>
                        {delivery.status}
                    </Badge>
                </div>
                <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-400" />
                  {delivery.customer_name}
                </h3>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                  <DropdownMenuItem onClick={() => onViewDelivery?.(delivery.id)} className="cursor-pointer font-medium">
                    <Eye className="w-4 h-4 mr-2 text-primary" />
                    View Manifest
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Delivery Schedule
                </p>
                <p className="text-sm font-bold text-slate-700">
                  {new Date(delivery.delivery_date).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase">Items Counts</p>
                <p className="text-sm font-bold text-slate-700 flex items-center justify-end gap-1">
                    <Package className="w-3 h-3 opacity-40" />
                    {delivery.item_count || 0} units
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-blue-50 flex items-center gap-4 text-slate-500 font-medium text-xs">
                <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 opacity-40" />
                    {delivery.customer_phone || 'N/A'}
                </div>
                <div className="flex items-center gap-1.5 flex-1 truncate">
                    <MapPin className="w-3 h-3 opacity-40" />
                    {delivery.customer_address || 'N/A'}
                </div>
            </div>
          </Card>
        ))}
      </div>

      {deliveries.length === 0 && !loading && (
        <div className="text-center py-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
          <Truck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-600">No shipments found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">No pending deliveries for the selected period.</p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Accessing logistics data...</p>
        </div>
      )}
    </div>
  )
}

