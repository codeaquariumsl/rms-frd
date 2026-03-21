"use client"

import type { InventoryItem } from "@/lib/types"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MoreVertical, Plus, Search, Trash2, Edit, Barcode, Loader2 } from "lucide-react"
import { SerialManagementModal } from "./serial-management-modal"
import { inventoryApi } from "@/lib/api"
import { toast } from "sonner"

interface InventoryListProps {
  organizationId: number
  onAddItem?: () => void
  onEditItem?: (item: InventoryItem) => void
  onDeleteItem?: (id: number) => void
}

export function InventoryList({ organizationId, onAddItem, onEditItem, onDeleteItem }: InventoryListProps) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [selectedItemForSerials, setSelectedItemForSerials] = useState<InventoryItem | null>(null)
  const [showSerialModal, setShowSerialModal] = useState(false)

  useEffect(() => {
    fetchInventory()
  }, [organizationId, searchTerm, statusFilter])

  async function fetchInventory() {
    try {
      setLoading(true)
      const params: any = { search: searchTerm }
      if (statusFilter) params.status = statusFilter
      
      const response = await inventoryApi.getAll(params)
      if (response.data.success) {
        setItems(response.data.data)
      }
    } catch (error: any) {
      console.error("Failed to fetch inventory:", error)
      toast.error(error.response?.data?.message || "Failed to load inventory")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800 border-green-200"
      case "Reserved":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Delivered":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "Damaged":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  async function handleDelete(id: number) {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        const response = await inventoryApi.delete(id)
        if (response.data.success) {
          toast.success("Item deleted successfully")
          fetchInventory()
          onDeleteItem?.(id)
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to delete item")
      }
    }
  }

  async function handleSaveSerials(serials: any[]) {
    // Current backend saves serials differently or you might need a specific endpoint
    // For now, this is a placeholder to show successful UI update
    // In a real app, you'd call an API to update serials for this itemId
    toast.info("Serial number management is handled via the item update screen.")
    setShowSerialModal(false)
    setSelectedItemForSerials(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, SKU, or barcode..."
            className="pl-10 h-10 border-blue-100 focus:ring-primary bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={onAddItem} variant="default" className="w-full md:w-auto px-6">
          <Plus className="w-4 h-4 mr-2" />
          Add New Item
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap pb-2 border-b border-blue-50">
        <Button 
          variant={statusFilter === null ? "default" : "ghost"} 
          size="sm" 
          onClick={() => setStatusFilter(null)}
          className={statusFilter === null ? "" : "text-muted-foreground hover:text-primary"}
        >
          All Items
        </Button>
        {["Available", "Reserved", "Delivered", "Damaged"].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter(status)}
            className={statusFilter === status ? "" : "text-muted-foreground hover:text-primary"}
          >
            {status}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
          <p className="text-sm text-muted-foreground animate-pulse">Fetching inventory items...</p>
        </div>
      ) : items.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="p-0 overflow-hidden border border-blue-100 hover:shadow-lg transition-all group">
              <div className="p-5 border-b border-blue-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-primary group-hover:text-blue-700 transition-colors">{item.name}</h3>
                    <p className="text-xs font-mono text-muted-foreground mt-1 uppercase tracking-wider">{item.sku}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditItem?.(item)} className="cursor-pointer">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedItemForSerials(item)
                          setShowSerialModal(true)
                        }}
                        className="cursor-pointer"
                      >
                        <Barcode className="w-4 h-4 mr-2" />
                        Manage Serials
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-destructive cursor-pointer">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Item
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Badge variant="outline" className={`${getStatusColor(item.status)} font-semibold px-2 py-0 border`}>
                  {item.status}
                </Badge>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-2 rounded-lg bg-blue-50/50 border border-blue-100/50">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Stock</p>
                    <p className="font-bold text-blue-900">{item.quantity_available} / {item.quantity_total}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-green-50/50 border border-green-100/50">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Rate</p>
                    <p className="font-bold text-green-900">${item.rental_rate_per_day}<span className="text-[10px] font-normal ml-0.5">/day</span></p>
                  </div>
                </div>

                {item.serial_numbers && item.serial_numbers.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Serial Numbers</p>
                    <div className="flex flex-wrap gap-1">
                      {item.serial_numbers.slice(0, 2).map((sn) => (
                        <Badge key={sn.id} variant="secondary" className="text-[10px] font-mono px-1.5 py-0 bg-white border border-blue-100">
                          {sn.serial_code}
                        </Badge>
                      ))}
                      {item.serial_numbers.length > 2 && (
                        <Badge variant="outline" className="text-[10px] px-0 h-4 border-none">
                          +{item.serial_numbers.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {item.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 italic italic border-t border-blue-50/50 pt-2">
                    {item.description}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border-2 border-dashed border-blue-100 rounded-2xl bg-blue-50/20">
          <p className="text-muted-foreground font-medium">
            {searchTerm ? "No matching items found." : "Your inventory is currently empty."}
          </p>
          {!searchTerm && <Button onClick={onAddItem} variant="link" className="mt-2 text-primary">Add your first item</Button>}
        </div>
      )}

      {selectedItemForSerials && (
        <SerialManagementModal
          isOpen={showSerialModal}
          itemName={selectedItemForSerials.name}
          itemId={selectedItemForSerials.id}
          currentSerials={selectedItemForSerials.serial_numbers || []}
          onSave={handleSaveSerials}
          onCancel={() => {
            setShowSerialModal(false)
            setSelectedItemForSerials(null)
          }}
        />
      )}
    </div>
  )
}

