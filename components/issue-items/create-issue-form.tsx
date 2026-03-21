"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IssueReceipt } from "./issue-receipt"
import { SerialSelectionModal } from "./serial-selection-modal"
import { ChevronDown } from "lucide-react"

interface Customer {
  id: string
  name: string
  phone?: string
  address?: string
}

interface InventoryItem {
  id: string
  name: string
  category: string
  quantity_available: number
  rental_rate_per_day?: number
}

interface SelectedItem {
  id: string
  quantity: number
  condition: string
  price: number
  serialNumbers: string[]
}

interface ItemWithSerials {
  id: string
  name: string
  category: string
  quantity_available: number
  rental_rate_per_day?: number
  serial_numbers?: Array<{ id: string; serial_code: string; status: string }>
}

export function CreateIssueForm() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState("")
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
  const [numberOfDays, setNumberOfDays] = useState(1)
  const [paymentStatus, setPaymentStatus] = useState<"unpaid" | "paid">("unpaid")
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptData, setReceiptData] = useState<any>(null)
  const [selectedItemForSerials, setSelectedItemForSerials] = useState<{ id: string; name: string; availableSerials: any[] } | null>(null)
  const [showSerialModal, setShowSerialModal] = useState(false)
  const [pendingItemToAdd, setPendingItemToAdd] = useState<string | null>(null)

  function calculateReturnDate(issDate: string, days: number) {
    const date = new Date(issDate)
    date.setDate(date.getDate() + days)
    return date.toISOString().split('T')[0]
  }

  function getTotalAmount() {
    return selectedItems.reduce((sum, item) => sum + (item.price * item.quantity * numberOfDays), 0)
  }

  useEffect(() => {
    loadData()
  }, [])

  function loadData() {
    try {
      const customersData = JSON.parse(localStorage.getItem("customers") || "[]")
      const inventoryData = JSON.parse(localStorage.getItem("rms_inventory") || "[]")
      setCustomers(customersData)
      setInventory(inventoryData)
    } catch (error) {
      console.error("Failed to load data:", error)
    }
  }

  function handleAddItem(itemId: string) {
    const item = inventory.find((i) => i.id === itemId) as ItemWithSerials
    if (!item) return

    const existing = selectedItems.find((si) => si.id === itemId)
    if (existing) {
      if (existing.quantity < item.quantity_available) {
        setSelectedItems(
          selectedItems.map((si) => (si.id === itemId ? { ...si, quantity: si.quantity + 1 } : si))
        )
      }
    } else {
      const availableSerials = item.serial_numbers?.filter(s => s.status === "Available").map(s => s.serial_code) || []
      setSelectedItems([...selectedItems, { 
        id: itemId, 
        quantity: 1, 
        condition: "Good",
        price: item.rental_rate_per_day || 0,
        serialNumbers: availableSerials.slice(0, 1)
      }])
    }
  }

  function handleRemoveItem(itemId: string) {
    setSelectedItems(selectedItems.filter((si) => si.id !== itemId))
  }

  function handleQuantityChange(itemId: string, quantity: number) {
    if (quantity <= 0) {
      handleRemoveItem(itemId)
    } else {
      setSelectedItems(selectedItems.map((si) => (si.id === itemId ? { ...si, quantity } : si)))
    }
  }

  function handleConditionChange(itemId: string, condition: string) {
    setSelectedItems(selectedItems.map((si) => (si.id === itemId ? { ...si, condition } : si)))
  }

  function handlePriceChange(itemId: string, price: number) {
    setSelectedItems(selectedItems.map((si) => (si.id === itemId ? { ...si, price } : si)))
  }

  function handleSerialChange(itemId: string, serialNumbers: string[]) {
    setSelectedItems(selectedItems.map((si) => (si.id === itemId ? { ...si, serialNumbers } : si)))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!selectedCustomerId || selectedItems.length === 0) {
      alert("Please select a customer and items")
      return
    }

    const customer = customers.find((c) => c.id === selectedCustomerId)
    const itemsData = selectedItems.map((si) => {
      const item = inventory.find((i) => i.id === si.id)
      return {
        id: item?.id,
        name: item?.name,
        quantity: si.quantity,
        condition: si.condition,
        price: si.price,
        serialNumbers: si.serialNumbers,
      }
    })

    const returnDate = calculateReturnDate(issueDate, numberOfDays)
    const totalAmount = getTotalAmount()

    const data = {
      id: `ISSUE-${Date.now()}`,
      customer,
      items: itemsData,
      issueDate,
      numberOfDays,
      returnDate,
      totalAmount,
      paymentStatus,
      issuedDate: new Date().toISOString(),
      issueNumber: `${Date.now().toString().slice(-4)}`,
    }

    setReceiptData(data)
    setShowReceipt(true)

    // Save to localStorage
    const issues = JSON.parse(localStorage.getItem("issues") || "[]")
    issues.push(data)
    localStorage.setItem("issues", JSON.stringify(issues))
  }

  if (showReceipt && receiptData) {
    return (
      <div>
        <Button 
          onClick={() => setShowReceipt(false)} 
          variant="outline"
          className="mb-4"
        >
          Back to Form
        </Button>
        <IssueReceipt data={receiptData} onBack={() => setShowReceipt(false)} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Information */}
        <Card className="p-6 bg-blue-50 border-blue-100">
          <h3 className="font-semibold text-primary mb-4">Issue Details</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issue-date" className="text-primary">Issue Date *</Label>
              <Input
                id="issue-date"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="border-blue-200 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="days" className="text-primary">Number of Days *</Label>
              <Input
                id="days"
                type="number"
                min="1"
                value={numberOfDays}
                onChange={(e) => setNumberOfDays(Math.max(1, parseInt(e.target.value) || 1))}
                className="border-blue-200 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-primary">Return Date (Auto)</Label>
              <Input
                type="date"
                value={calculateReturnDate(issueDate, numberOfDays)}
                disabled
                className="bg-gray-100 border-blue-200"
              />
            </div>
          </div>
        </Card>

        {/* Customer Selection */}
        <Card className="p-6 bg-blue-50 border-blue-100">
          <h3 className="font-semibold text-primary mb-4">Select Customer</h3>
          <div className="space-y-2">
            <Label htmlFor="customer" className="text-primary">Customer *</Label>
            <select
              id="customer"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Items Selection */}
        <Card className="p-6 bg-blue-50 border-blue-100">
          <h3 className="font-semibold text-primary mb-4">Select Items</h3>
          {selectedCustomerId && (
            <div className="mb-6">
              <Label className="text-primary mb-3 block">Available Items *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto">
                {inventory.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleAddItem(item.id as string)}
                    disabled={!selectedCustomerId}
                    className="text-left p-3 border border-blue-200 rounded hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="font-medium text-primary">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.category}</div>
                    <div className="text-xs text-blue-600">Available: {item.quantity_available}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Items Table */}
          {selectedItems.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-primary mb-3">Selected Items</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-primary">
                      <th className="text-left py-2 px-3 font-semibold text-primary">Item Name</th>
                      <th className="text-center py-2 px-3 font-semibold text-primary">Qty</th>
                      <th className="text-center py-2 px-3 font-semibold text-primary">Days</th>
                      <th className="text-right py-2 px-3 font-semibold text-primary">Price</th>
                      <th className="text-right py-2 px-3 font-semibold text-primary">Total</th>
                      <th className="text-left py-2 px-3 font-semibold text-primary">Serial #</th>
                      <th className="text-left py-2 px-3 font-semibold text-primary">Condition</th>
                      <th className="text-center py-2 px-3 font-semibold text-primary">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItems.map((si) => {
                      const item = inventory.find((i) => i.id === si.id) as ItemWithSerials
                      const itemTotal = si.price * si.quantity * numberOfDays
                      const availableSerials = item?.serial_numbers?.filter(s => s.status === "Available").map(s => s.serial_code) || []
                      return (
                        <tr key={si.id} className="border-b border-blue-100 hover:bg-blue-100">
                          <td className="py-3 px-3">{item?.name}</td>
                          <td className="py-3 px-3 text-center">
                            <Input
                              type="number"
                              min="1"
                              value={si.quantity}
                              onChange={(e) =>
                                handleQuantityChange(si.id, Number.parseInt(e.target.value))
                              }
                              className="w-16 h-8"
                            />
                          </td>
                          <td className="py-3 px-3 text-center font-semibold text-primary">
                            {numberOfDays}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={si.price}
                              onChange={(e) =>
                                handlePriceChange(si.id, Number.parseFloat(e.target.value) || 0)
                              }
                              className="w-20 h-8 text-right"
                              placeholder="0.00"
                            />
                          </td>
                          <td className="py-3 px-3 text-right font-semibold text-primary">
                            ${itemTotal.toFixed(2)}
                          </td>
                          <td className="py-3 px-3">
                            {availableSerials.length > 0 ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedItemForSerials(si)
                                  setShowSerialModal(true)
                                }}
                                className="text-xs h-8"
                              >
                                {si.serialNumbers.length > 0 ? (
                                  <span className="text-primary font-semibold">{si.serialNumbers.length} Selected</span>
                                ) : (
                                  <span>Select Serials</span>
                                )}
                              </Button>
                            ) : (
                              <span className="text-red-600 text-xs font-semibold">No serials</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <select
                              value={si.condition}
                              onChange={(e) => handleConditionChange(si.id, e.target.value)}
                              className="border border-blue-200 rounded px-2 py-1 text-xs"
                            >
                              <option value="Good">Good</option>
                              <option value="Fair">Fair</option>
                              <option value="Poor">Poor</option>
                            </select>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveItem(si.id)}
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>

        {/* Total Amount */}
        {selectedItems.length > 0 && (
          <Card className="p-6 bg-green-50 border-green-100">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-primary text-lg">Total Amount:</span>
              <span className="text-2xl font-bold text-green-600">${getTotalAmount().toFixed(2)}</span>
            </div>
          </Card>
        )}

        {/* Payment Status */}
        <Card className="p-6 bg-blue-50 border-blue-100">
          <h3 className="font-semibold text-primary mb-4">Payment Status</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                value="unpaid"
                checked={paymentStatus === "unpaid"}
                onChange={(e) => setPaymentStatus(e.target.value as "unpaid" | "paid")}
                className="w-4 h-4"
              />
              <span className="text-primary">Unpaid / On Account</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                value="paid"
                checked={paymentStatus === "paid"}
                onChange={(e) => setPaymentStatus(e.target.value as "unpaid" | "paid")}
                className="w-4 h-4"
              />
              <span className="text-primary">Paid</span>
            </label>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button 
            type="submit" 
            className="bg-primary hover:bg-primary/90 text-white"
            disabled={!selectedCustomerId || selectedItems.length === 0}
          >
            Generate Issue Receipt
          </Button>
        </div>
      </form>

      {/* Serial Selection Modal */}
      {selectedItemForSerials && (
        <SerialSelectionModal
          isOpen={showSerialModal}
          itemName={inventory.find((i) => i.id === selectedItemForSerials.id)?.name || "Item"}
          availableSerials={
            (inventory.find((i) => i.id === selectedItemForSerials.id) as ItemWithSerials)?.serial_numbers?.filter(
              (s) => s.status === "Available"
            ) || []
          }
          selectedSerials={selectedItemForSerials.serialNumbers}
          quantity={selectedItemForSerials.quantity}
          onConfirm={(serials) => {
            handleSerialChange(selectedItemForSerials.id, serials)
            setShowSerialModal(false)
            setSelectedItemForSerials(null)
          }}
          onCancel={() => {
            setShowSerialModal(false)
            setSelectedItemForSerials(null)
          }}
        />
      )}
    </div>
  )
}
