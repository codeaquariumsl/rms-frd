"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import type { Category } from "@/lib/types"
import { inventoryApi, categoryApi } from "@/lib/api"
import { toast } from "sonner"
import { Loader2, Plus, X } from "lucide-react"

interface AddInventoryFormProps {
  organizationId: number
  onSuccess?: () => void
  onCancel?: () => void
}

export function AddInventoryForm({ organizationId, onSuccess, onCancel }: AddInventoryFormProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    sku: "",
    rental_rate_per_day: "",
    rental_rate_per_week: "",
    rental_rate_per_month: "",
    serialNumbers: [""],
  })

  useEffect(() => {
    loadCategories()
  }, [organizationId])

  async function loadCategories() {
    try {
      const response = await categoryApi.getAll()
      if (response.data.success) {
        setCategories(response.data.data)
      }
    } catch (error) {
      console.error("Failed to load categories:", error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        name: formData.name,
        description: formData.description,
        category_id: formData.category_id ? Number.parseInt(formData.category_id) : null,
        sku: formData.sku,
        rental_rate_per_day: Number.parseFloat(formData.rental_rate_per_day),
        rental_rate_per_week: formData.rental_rate_per_week ? Number.parseFloat(formData.rental_rate_per_week) : null,
        rental_rate_per_month: formData.rental_rate_per_month ? Number.parseFloat(formData.rental_rate_per_month) : null,
        serial_numbers: formData.serialNumbers.filter(sn => sn.trim() !== "")
      }

      const response = await inventoryApi.create(data)
      
      if (response.data.success) {
        toast.success("Inventory item added successfully")
        onSuccess?.()
      }
    } catch (error: any) {
      console.error("Failed to add inventory:", error)
      toast.error(error.response?.data?.message || "Failed to add inventory item")
    } finally {
      setLoading(false)
    }
  }

  const addSerialField = () => {
    setFormData(prev => ({ ...prev, serialNumbers: [...prev.serialNumbers, ""] }))
  }

  const removeSerialField = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      serialNumbers: prev.serialNumbers.filter((_, i) => i !== index) 
    }))
  }

  const updateSerial = (index: number, value: string) => {
    const updated = [...formData.serialNumbers]
    updated[index] = value
    setFormData(prev => ({ ...prev, serialNumbers: updated }))
  }

  return (
    <Card className="p-8 border border-blue-200 bg-white shadow-lg rounded-2xl">
      <div className="flex justify-between items-center mb-8 border-b border-blue-50 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-primary">Add Inventory Item</h2>
          <p className="text-sm text-muted-foreground mt-1">Register a new product to your rental pool.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-muted-foreground hover:text-destructive">
          <X className="w-5 h-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-primary font-semibold">Item Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Party Tent 20x20"
              required
              className="h-11 border-blue-100 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku" className="text-primary font-semibold">SKU / Model Number *</Label>
            <Input
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="e.g., TENT-20X20-01"
              required
              className="h-11 border-blue-100 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_id" className="text-primary font-semibold">Category</Label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full h-11 px-3 py-2 border border-blue-100 rounded-md bg-white text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rental_rate_per_day" className="text-primary font-semibold">Daily Rate ($) *</Label>
            <Input
              id="rental_rate_per_day"
              name="rental_rate_per_day"
              type="number"
              step="0.01"
              value={formData.rental_rate_per_day}
              onChange={handleChange}
              placeholder="0.00"
              required
              className="h-11 border-blue-100 focus:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-primary font-semibold">Item Description</Label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Technical specs, material details, or special instructions..."
            className="w-full min-h-[100px] p-4 border border-blue-100 rounded-md focus:ring-2 focus:ring-primary focus:outline-none transition-all"
          />
        </div>

        {/* Serial Numbers Section */}
        <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-primary">Serial Numbers</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Required for item tracking and identification.</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-white"
              onClick={addSerialField}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Serial
            </Button>
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {formData.serialNumbers.map((serial, idx) => (
              <div key={idx} className="flex gap-2 animate-in fade-in slide-in-from-left-2">
                <Input
                  type="text"
                  value={serial}
                  onChange={(e) => updateSerial(idx, e.target.value)}
                  placeholder={`Serial Code #${idx + 1}`}
                  className="h-10 border-blue-200 bg-white"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-red-50"
                  onClick={() => removeSerialField(idx)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-blue-100">
            <p className="text-xs font-bold text-blue-900">
              Total Units to Register: {formData.serialNumbers.filter(s => s.trim()).length || 1}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-blue-50">
          <Button type="button" variant="outline" onClick={onCancel} className="h-11 px-8">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="h-11 px-10 bg-primary hover:bg-blue-700 min-w-[160px]">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : "Add to Inventory"}
          </Button>
        </div>
      </form>
    </Card>
  )
}

