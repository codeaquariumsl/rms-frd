"use client"

import type React from "react"
import type { Category } from "@/lib/types"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Plus, Trash2, Edit, Loader2, X, Check, Hash, Info, Layers } from "lucide-react"
import { categoryApi } from "@/lib/api"
import { toast } from "sonner"

interface CategoryManagerProps {
  organizationId: number
  onCategoryAdded?: () => void
}

export function CategoryManager({ organizationId, onCategoryAdded }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
    icon: "Package",
  })

  useEffect(() => {
    loadCategories()
  }, [organizationId])

  async function loadCategories() {
    try {
      setLoading(true)
      const response = await categoryApi.getAll()
      if (response.data.success) {
        setCategories(response.data.data)
      }
    } catch (error: any) {
      console.error("Failed to load categories:", error)
      toast.error("Failed to sync category manifest")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (editingId) {
        const response = await categoryApi.update(editingId, formData)
        if (response.data.success) {
          toast.success("Category updated successfully")
          loadCategories()
        }
      } else {
        const response = await categoryApi.create(formData)
        if (response.data.success) {
          toast.success("New product category registered")
          loadCategories()
          onCategoryAdded?.()
        }
      }

      handleCancel()
    } catch (error: any) {
      console.error("Failed to save category:", error)
      toast.error(error.response?.data?.message || "Failed to process category request")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    if (confirm("Are you sure? Items using this category will have it removed from their metadata.")) {
      try {
        const response = await categoryApi.delete(id)
        if (response.data.success) {
          toast.success("Category purged from registry")
          loadCategories()
        }
      } catch (error: any) {
        console.error("Failed to delete category:", error)
        toast.error(error.response?.data?.message || "Purge request failed")
      }
    }
  }

  function handleEdit(category: Category) {
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color || "#3B82F6",
      icon: category.icon || "Package",
    })
    setEditingId(category.id)
    setShowForm(true)
  }

  function handleCancel() {
    setFormData({ name: "", description: "", color: "#3B82F6", icon: "Package" })
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div>
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                Product Taxonomy
            </h3>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Manage hierarchical groupings for inventory items.</p>
        </div>
        <Button 
            onClick={() => setShowForm(true)} 
            size="sm" 
            className="h-10 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl shadow-sm text-xs font-bold"
        >
          <Plus className="w-4 h-4 mr-2 text-blue-600" />
          Add Category
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 border-2 border-blue-100 rounded-3xl animate-in fade-in slide-in-from-top-4 duration-300 shadow-xl shadow-blue-50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-black text-blue-900 uppercase text-[10px] tracking-[0.2em]">
                    {editingId ? "Modify Taxonomy Entry" : "Create New Taxonomy Entry"}
                </h4>
                <Button type="button" variant="ghost" size="sm" onClick={handleCancel} className="h-8 w-8 rounded-full">
                    <X className="w-4 h-4 text-slate-400" />
                </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="cat-name" className="text-[10px] font-black uppercase text-slate-400 ml-1">Label</Label>
                    <Input
                        id="cat-name"
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Heavy Machinery"
                        required
                        className="h-12 bg-slate-50 border-slate-100 rounded-2xl focus:ring-blue-500 font-bold"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="cat-description" className="text-[10px] font-black uppercase text-slate-400 ml-1">Meta Description</Label>
                    <Input
                        id="cat-description"
                        value={formData.description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief summary of category scope"
                        className="h-12 bg-slate-50 border-slate-100 rounded-2xl focus:ring-blue-500 font-medium"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Brand Identifier Color</Label>
                <div className="flex gap-3">
                  <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-slate-100 bg-white">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                        className="absolute -inset-2 w-16 h-16 cursor-pointer"
                      />
                  </div>
                  <div className="flex items-center px-4 bg-slate-50 border border-slate-100 rounded-2xl flex-1 text-xs font-mono font-bold text-slate-500 uppercase">
                      {formData.color}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cat-icon" className="text-[10px] font-black uppercase text-slate-400 ml-1">System Glyph</Label>
                <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        id="cat-icon"
                        value={formData.icon}
                        onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                        placeholder="Package"
                        className="h-12 pl-12 bg-slate-50 border-slate-100 rounded-2xl focus:ring-blue-500 font-bold"
                    />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
              <Button type="button" variant="ghost" onClick={handleCancel} className="h-12 rounded-2xl font-bold text-slate-400">
                Discard
              </Button>
              <Button 
                type="submit" 
                disabled={submitting} 
                className="h-12 px-10 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.1em] rounded-2xl shadow-xl shadow-blue-100 transition-all hover:-translate-y-0.5"
              >
                {submitting ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        {editingId ? <Check className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                        {editingId ? "Confirm Update" : "Registry Entry"}
                    </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
          <div className="space-y-4">
              {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 w-full bg-slate-50 rounded-2xl animate-pulse" />
              ))}
          </div>
      ) : (
        <div className="grid gap-3">
          {categories.map((category) => (
            <Card key={category.id} className="p-4 flex items-center justify-between border border-slate-100 hover:border-blue-200 transition-all rounded-2xl group hover:shadow-lg hover:shadow-slate-100">
              <div className="flex items-center gap-4">
                <div 
                    className="w-10 h-10 rounded-xl shadow-inner flex items-center justify-center font-black text-white text-[10px]" 
                    style={{ backgroundColor: category.color || "#3B82F6" }}
                >
                    {category.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-700 text-sm">{category.name}</p>
                  {category.description && <p className="text-[10px] font-medium text-slate-400 mt-0.5">{category.description}</p>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden group-hover:flex gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(category)}
                        className="h-10 w-10 p-0 text-blue-600 hover:bg-blue-50 rounded-xl"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(category.id)}
                        className="h-10 w-10 p-0 text-rose-500 hover:bg-rose-50 rounded-xl"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 hover:bg-slate-50 rounded-xl md:hidden">
                            <MoreVertical className="w-4 h-4 text-slate-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-2xl">
                        <DropdownMenuItem onClick={() => handleEdit(category)} className="cursor-pointer font-bold text-xs uppercase text-blue-600">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(category.id)} className="cursor-pointer font-bold text-xs uppercase text-rose-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Purge Record
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      )}

      {categories.length === 0 && !loading && (
        <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
            <Info className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No categories registered</p>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">Create taxonomy entries to organize your inventory effectively.</p>
        </div>
      )}
    </div>
  )
}

