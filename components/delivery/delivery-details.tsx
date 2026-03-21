"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Truck, User, Calendar, Info, Package, Loader2, ArrowLeft } from "lucide-react"
import { deliveryApi } from "@/lib/api"
import { toast } from "sonner"

interface DeliveryDetailsProps {
  deliveryId: string | number
  onClose?: () => void
  onSuccess?: () => void
}

export function DeliveryDetails({ deliveryId, onClose, onSuccess }: DeliveryDetailsProps) {
  const [delivery, setDelivery] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchDeliveryDetails()
  }, [deliveryId])

  async function fetchDeliveryDetails() {
    try {
      setLoading(true)
      const response = await deliveryApi.getById(deliveryId)
      if (response.data.success) {
        setDelivery(response.data.data)
      }
    } catch (error: any) {
      console.error("Failed to fetch delivery:", error)
      toast.error("Failed to load delivery record details")
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirmDelivery() {
    try {
      setConfirming(true)
      const response = await deliveryApi.deliver(deliveryId)
      
      if (response.data.success) {
        setSuccess(true)
        toast.success("Shipment confirmed and delivered!")
        onSuccess?.()
        setTimeout(() => {
            onClose?.()
        }, 2000)
      }
    } catch (error: any) {
      console.error("Failed to confirm delivery:", error)
      toast.error(error.response?.data?.message || "Failed to confirm delivery")
    } finally {
      setConfirming(false)
    }
  }

  if (loading) {
    return (
        <Card className="p-12 flex flex-col items-center justify-center gap-4 border-dash">
            <Loader2 className="w-10 h-10 animate-spin text-primary opacity-40" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Manifest...</p>
        </Card>
    )
  }

  if (!delivery) {
    return (
        <div className="text-center py-12">
            <Info className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-500">Delivery manifest not found</p>
            <Button variant="ghost" onClick={onClose} className="mt-4">Go Back</Button>
        </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {success && (
        <Alert className="bg-emerald-50 border-emerald-200 shadow-lg shadow-emerald-50 rounded-2xl border-2">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          <AlertDescription className="text-emerald-900 font-bold ml-2">
            Logistics cycle updated. Item state moved to 'Delivered'.
          </AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden border-2 border-blue-50 rounded-3xl shadow-xl bg-white shadow-blue-50/50">
        <div className="bg-blue-950 p-8 text-white flex justify-between items-center">
            <div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Manifest Document</p>
                <h2 className="text-3xl font-black tracking-tighter flex items-center gap-2">
                    <Truck className="w-8 h-8 text-blue-500" />
                    {delivery.booking_number}
                </h2>
            </div>
            <Badge className="h-8 px-4 bg-blue-800 text-blue-100 hover:bg-blue-800 border-none font-black uppercase text-xs rounded-full">
                {delivery.status}
            </Badge>
        </div>

        <div className="p-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-blue-50 pb-2">
                        <User className="w-4 h-4 text-primary" />
                        <h3 className="font-black text-blue-900 uppercase text-xs tracking-wider">Consignee</h3>
                    </div>
                    <div className="space-y-1">
                        <p className="text-lg font-black text-slate-800">{delivery.customer_name}</p>
                        <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                            {delivery.customer_phone || "Contact info unavailable"}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-blue-50 pb-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <h3 className="font-black text-blue-900 uppercase text-xs tracking-wider">Schedule</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">Commencement</p>
                            <p className="font-bold text-slate-700">{new Date(delivery.delivery_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">Termination</p>
                            <p className="font-bold text-slate-700">{new Date(delivery.return_date).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-blue-50 pb-2">
                    <Package className="w-4 h-4 text-primary" />
                    <h3 className="font-black text-blue-900 uppercase text-xs tracking-wider">Inventory Manifest</h3>
                </div>
                <div className="grid gap-3">
                    {delivery.items?.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100/50 rounded-2xl hover:bg-slate-100 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-blue-600 shadow-sm border border-slate-100">
                                    {item.quantity}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">{item.item_name || item.name}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase">S/N: {item.serial_number || 'TRACKING-01'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase">Line Rate</p>
                                <p className="font-bold text-slate-700">${Number(item.rental_rate || 0).toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-6 border-t border-blue-50">
                {delivery.status !== "Delivered" ? (
                    <Button 
                        onClick={handleConfirmDelivery} 
                        disabled={confirming}
                        className="w-full h-14 bg-primary hover:bg-blue-700 text-white font-black uppercase tracking-[0.1em] rounded-2xl shadow-xl shadow-blue-100 transition-all hover:-translate-y-0.5"
                    >
                        {confirming ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Processing Shipment...
                            </>
                        ) : (
                            <>
                                <Truck className="w-5 h-5 mr-2" />
                                Confirm Dispatch & Delivery
                            </>
                        )}
                    </Button>
                ) : (
                    <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 border-dashed flex items-center justify-center gap-4">
                        <CheckCircle className="h-6 w-6 text-emerald-500" />
                        <div className="text-sm font-bold text-slate-600">
                            Delivery cycle finalized on {delivery.delivered_at && new Date(delivery.delivered_at).toLocaleString()}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </Card>

      {onClose && (
        <Button onClick={onClose} variant="ghost" className="w-full h-12 text-slate-400 hover:text-slate-600 font-bold hover:bg-slate-50 rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Logistics Dashboard
        </Button>
      )}
    </div>
  )
}

