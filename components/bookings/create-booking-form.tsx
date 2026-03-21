"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import type { InventoryItem, Customer } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, Plus, Trash2, Calendar, User, Info } from "lucide-react"
import { customerApi, inventoryApi, bookingApi } from "@/lib/api"
import { toast } from "sonner"

interface CreateBookingFormProps {
  organizationId: number
  onSuccess?: () => void
  onCancel?: () => void
}

export function CreateBookingForm({ organizationId, onSuccess, onCancel }: CreateBookingFormProps) {
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [selectedItems, setSelectedItems] = useState<Array<{ id: string; quantity: number; pricingType: "daily" | "weekly" | "monthly" }>>([])
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    customer_id: "",
    delivery_date: "",
    return_date: "",
    notes: "",
    advanceDeposit: 0,
    refundableDeposit: 0,
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  async function loadInitialData() {
    try {
      setDataLoading(true)
      const [custRes, invRes] = await Promise.all([
        customerApi.getAll({ limit: 100 }),
        inventoryApi.getAll({ status: 'Available', limit: 100 })
      ])
      
      if (custRes.data.success) setCustomers(custRes.data.data)
      if (invRes.data.success) setInventory(invRes.data.data)
      
    } catch (error: any) {
      console.error("Failed to load form data:", error)
      toast.error("Failed to load customers or inventory")
    } finally {
      setDataLoading(false)
    }
  }

  function calculateRentalDays() {
    if (!formData.delivery_date || !formData.return_date) return 0
    const delivery = new Date(formData.delivery_date)
    const returnDate = new Date(formData.return_date)
    const days = Math.ceil((returnDate.getTime() - delivery.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(days, 1)
  }

  function calculateItemPrice(item: InventoryItem, pricingType: "daily" | "weekly" | "monthly") {
    const days = calculateRentalDays()
    let totalPrice = 0

    if (pricingType === "daily") {
      totalPrice = (item.rental_rate_per_day || 0) * days
    } else if (pricingType === "weekly") {
      const weeks = Math.ceil(days / 7)
      totalPrice = (item.rental_rate_per_week || (item.rental_rate_per_day || 0) * 7) * weeks
    } else if (pricingType === "monthly") {
      const months = Math.ceil(days / 30)
      totalPrice = (item.rental_rate_per_month || (item.rental_rate_per_day || 0) * 30) * months
    }

    return totalPrice
  }

  const handleAddItem = (itemId: string) => {
    const existing = selectedItems.find((i) => i.id === itemId)
    const item = inventory.find(i => String(i.id) === String(itemId))
    
    if (existing) {
      if (existing.quantity >= (item?.quantity_available || 0)) {
        toast.warning(`Only ${item?.quantity_available} units available.`)
        return
      }
      setSelectedItems(selectedItems.map((i) => (i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i)))
    } else {
      setSelectedItems([...selectedItems, { id: itemId, quantity: 1, pricingType: "daily" }])
    }
    setAvailabilityError(null)
  }

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter((i) => i.id !== itemId))
  }

  const handleQuantityChange = (itemId: string, quantity: number) => {
    const item = inventory.find(i => String(i.id) === String(itemId))
    if (quantity > (item?.quantity_available || 0)) {
        toast.warning(`Over maximum availability.`)
        return
    }
    if (quantity <= 0) {
      handleRemoveItem(itemId)
    } else {
      setSelectedItems(selectedItems.map((i) => (i.id === itemId ? { ...i, quantity } : i)))
    }
  }

  const handlePricingTypeChange = (itemId: string, pricingType: "daily" | "weekly" | "monthly") => {
    setSelectedItems(selectedItems.map((i) => (i.id === itemId ? { ...i, pricingType } : i)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.customer_id || selectedItems.length === 0) {
      toast.error("Please select a customer and at least one item")
      return
    }

    try {
      setLoading(true)
      const data = {
        customer_id: formData.customer_id,
        delivery_date: formData.delivery_date,
        return_date: formData.return_date,
        notes: formData.notes,
        deposit_amount: formData.advanceDeposit,
        items: selectedItems.map(si => ({
            inventory_item_id: si.id,
            quantity: si.quantity,
            rental_rate: calculateItemPrice(inventory.find(inv => String(inv.id) === String(si.id))!, si.pricingType) / si.quantity
        }))
      }

      const response = await bookingApi.create(data)

      if (response.data.success) {
        toast.success("Booking created successfully!")
        onSuccess?.()
      }
    } catch (error: any) {
      console.error("Booking error:", error)
      const msg = error.response?.data?.message || "Failed to create booking"
      setAvailabilityError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const selectedItemsDetails = selectedItems
    .map((si) => inventory.find((i) => String(i.id) === String(si.id)))
    .filter(Boolean) as InventoryItem[]

  const totalAmount = selectedItemsDetails.reduce((sum, item) => {
    const selectedItem = selectedItems.find((si) => String(si.id) === String(item.id))
    if (!selectedItem) return sum
    const unitPrice = calculateItemPrice(item, selectedItem.pricingType)
    return sum + (unitPrice * selectedItem.quantity)
  }, 0)

  if (dataLoading) {
    return (
        <Card className="p-12 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
            <p className="text-muted-foreground font-medium">Preparing booking environment...</p>
        </Card>
    )
  }

  return (
    <Card className="p-8 border-blue-100 shadow-xl rounded-2xl bg-white max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8 border-b border-blue-50 pb-5">
        <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
            <Calendar className="w-6 h-6 text-white" />
        </div>
        <div>
            <h2 className="text-2xl font-black text-blue-900 tracking-tight">Create Rental Booking</h2>
            <p className="text-sm text-muted-foreground">Draft a new contract for your customers.</p>
        </div>
      </div>

      {availabilityError && (
        <Alert variant="destructive" className="mb-8 border-rose-100 bg-rose-50 text-rose-900 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5 text-rose-600" />
          <AlertDescription className="font-semibold">{availabilityError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="customer" className="text-primary font-bold flex items-center gap-2">
                        <User className="w-4 h-4" /> Customer Selection *
                    </Label>
                    <select
                        id="customer"
                        value={formData.customer_id}
                        onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                        className="w-full h-12 px-4 border border-blue-100 rounded-xl bg-slate-50 focus:ring-2 focus:ring-primary focus:outline-none focus:bg-white transition-all font-medium"
                        required
                    >
                        <option value="">Select a customer</option>
                        {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name} — {c.phone || "No contact info"}
                        </option>
                        ))}
                    </select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="delivery_date" className="text-primary font-bold">Delivery Date *</Label>
                        <Input
                            id="delivery_date"
                            type="date"
                            value={formData.delivery_date}
                            onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                            required
                            className="h-12 border-blue-100 rounded-xl bg-slate-50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="return_date" className="text-primary font-bold">Return Date *</Label>
                        <Input
                            id="return_date"
                            type="date"
                            value={formData.return_date}
                            onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                            required
                            className="h-12 border-blue-100 rounded-xl bg-slate-50"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-primary font-bold">Available Inventory *</Label>
                    <div className="border border-blue-50 rounded-2xl p-2 space-y-1.5 max-h-[320px] overflow-y-auto bg-slate-50/50 custom-scrollbar">
                        {inventory.length === 0 ? (
                            <div className="text-center text-muted-foreground py-10 opacity-60">No items available for rent.</div>
                        ) : (
                            inventory.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => handleAddItem(String(item.id))}
                                    className="w-full text-left p-4 border border-white hover:border-blue-200 rounded-xl hover:bg-white transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Plus className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="font-bold text-slate-800">{item.name}</div>
                                    <div className="flex justify-between mt-1">
                                        <div className="text-xs text-blue-600 font-bold">${item.rental_rate_per_day}/day</div>
                                        <div className="text-xs text-slate-500 font-medium">{item.quantity_available} in stock</div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-blue-900 rounded-2xl p-6 text-white shadow-xl shadow-blue-100">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-blue-300" /> Booking Basket
                    </h3>
                    <div className="space-y-4 max-h-[340px] overflow-y-auto pr-2 custom-scrollbar-light">
                        {selectedItems.length === 0 ? (
                            <div className="text-center py-10 text-blue-200 italic text-sm">Basket is empty. Select items to start.</div>
                        ) : (
                            selectedItemsDetails.map((item) => {
                                const si = selectedItems.find(s => String(s.id) === String(item.id))!
                                return (
                                    <div key={item.id} className="bg-blue-800/50 rounded-xl p-4 border border-blue-700/50 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <p className="font-bold text-sm tracking-wide">{item.name}</p>
                                            <Button 
                                                type="button" 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => handleRemoveItem(String(item.id))}
                                                className="h-7 w-7 p-0 text-blue-300 hover:text-white hover:bg-red-500"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 space-y-1">
                                                <Label className="text-[10px] uppercase text-blue-300 font-bold">Qty</Label>
                                                <Input 
                                                    type="number" 
                                                    value={si.quantity}
                                                    onChange={(e) => handleQuantityChange(String(item.id), parseInt(e.target.value))}
                                                    className="h-8 bg-blue-900 border-blue-700 text-xs text-white"
                                                />
                                            </div>
                                            <div className="flex-[2] space-y-1">
                                                <Label className="text-[10px] uppercase text-blue-300 font-bold">Rate</Label>
                                                <select 
                                                    value={si.pricingType}
                                                    onChange={(e) => handlePricingTypeChange(String(item.id), e.target.value as any)}
                                                    className="w-full h-8 bg-blue-900 border-blue-700 rounded text-xs px-2 text-white"
                                                >
                                                    <option value="daily">Daily</option>
                                                    {item.rental_rate_per_week && <option value="weekly">Weekly</option>}
                                                    {item.rental_rate_per_month && <option value="monthly">Monthly</option>}
                                                </select>
                                            </div>
                                            <div className="flex-1 text-right space-y-1">
                                                <Label className="text-[10px] uppercase text-blue-300 font-bold">Total</Label>
                                                <p className="text-sm font-black">${calculateItemPrice(item, si.pricingType).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-blue-800 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-blue-300 font-medium">Rental Subtotal</span>
                            <span className="font-bold">${totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xl">
                            <span className="text-white font-black">Net Total</span>
                            <span className="text-white font-black">${(totalAmount - formData.advanceDeposit).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <Label className="text-primary font-bold">Advance & Notes</Label>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            type="number"
                            placeholder="Advance Amt ($)"
                            value={formData.advanceDeposit}
                            onChange={(e) => setFormData({ ...formData, advanceDeposit: parseFloat(e.target.value) || 0 })}
                            className="h-11 border-blue-100 rounded-xl"
                        />
                        <Input
                            type="number"
                            placeholder="Refundable Deposit ($)"
                            value={formData.refundableDeposit}
                            onChange={(e) => setFormData({ ...formData, refundableDeposit: parseFloat(e.target.value) || 0 })}
                            className="h-11 border-blue-100 rounded-xl"
                        />
                    </div>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full h-24 p-4 border border-blue-100 rounded-2xl bg-slate-50 focus:ring-2 focus:ring-primary focus:outline-none transition-all text-sm"
                        placeholder="Add special instructions or delivery details..."
                    />
                </div>
            </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-blue-50">
          <Button type="button" variant="outline" onClick={onCancel} className="h-12 px-8 rounded-xl">
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading || selectedItems.length === 0} 
            className="h-12 px-10 bg-primary hover:bg-blue-700 rounded-xl min-w-[200px] shadow-lg shadow-blue-100"
          >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Finalizing...
                </>
            ) : "Confirm Booking"}
          </Button>
        </div>
      </form>
    </Card>
  )
}

