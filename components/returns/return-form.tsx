"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, RotateCcw, User, Calendar, ClipboardCheck, AlertCircle, ShieldAlert } from "lucide-react"
import { returnApi } from "@/lib/api"
import { toast } from "sonner"

interface ReturnFormProps {
  returnId: string | number
  onSuccess?: () => void
  onCancel?: () => void
}

export function ReturnForm({ returnId, onSuccess, onCancel }: ReturnFormProps) {
  const [returnData, setReturnData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [condition, setCondition] = useState<string>("Good")
  const [damageNotes, setDamageNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchReturnData()
  }, [returnId])

  async function fetchReturnData() {
    try {
      setLoading(true)
      const response = await returnApi.getById(returnId)
      if (response.data.success) {
        setReturnData(response.data.data)
      }
    } catch (error: any) {
      console.error("Failed to fetch return data:", error)
      toast.error("Failed to load return details")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      setSubmitting(true)

      const payload = {
          booking_id: returnData.booking_id,
          delivery_id: returnData.delivery_id,
          item_condition: condition,
          damage_notes: damageNotes,
          returned_by: 1, // Fallback to 1 for now, in real app use logged in user id
      }

      const response = await returnApi.process(payload)
      
      if (response.data.success) {
        toast.success("Return processed and inventory adjusted!")
        onSuccess?.()
      }
    } catch (error: any) {
      console.error("Failed to process return:", error)
      toast.error(error.response?.data?.message || "Failed to process intake")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
        <Card className="p-10 flex flex-col items-center justify-center gap-4 bg-slate-50 border-2 border-dashed">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500 opacity-40" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Accessing records...</p>
        </Card>
    )
  }

  if (!returnData) {
    return (
        <div className="text-center py-10">
            <AlertCircle className="w-10 h-10 text-rose-300 mx-auto mb-3" />
            <p className="font-bold text-slate-500">Intake record not found</p>
            <Button variant="ghost" onClick={onCancel} className="mt-4">Go Back</Button>
        </div>
    )
  }

  return (
    <Card className="max-w-3xl mx-auto overflow-hidden border-2 border-slate-100 rounded-3xl shadow-xl bg-white animate-in zoom-in-95 duration-300">
      <div className="bg-rose-950 p-8 text-white">
          <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] mb-1">Process Intake</p>
          <h2 className="text-3xl font-black tracking-tighter flex items-center gap-2">
              <RotateCcw className="w-8 h-8 text-rose-500" />
              {returnData.booking_number}
          </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="grid grid-cols-2 gap-8 p-6 bg-slate-50 rounded-2xl border border-slate-100/50">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                  <User className="w-3 h-3" /> Consignee
              </p>
              <p className="font-bold text-slate-700">{returnData.customer_name}</p>
            </div>
          </div>
          <div className="space-y-4 text-right">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1 justify-end">
                  <Calendar className="w-3 h-3" /> Scheduled Return
              </p>
              <p className="font-bold text-slate-700">
                {returnData.return_date ? new Date(returnData.return_date).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-rose-50 pb-2">
              <ClipboardCheck className="w-4 h-4 text-rose-600" />
              <h3 className="font-black text-rose-950 uppercase text-xs tracking-wider">Condition Assessment</h3>
          </div>
          
          <RadioGroup value={condition} onValueChange={setCondition} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${condition === 'Good' ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Good" id="good" className="border-emerald-500 text-emerald-600 shadow-none focus:ring-emerald-500" />
                    <Label htmlFor="good" className="font-black text-xs uppercase tracking-tight text-slate-700 cursor-pointer">Pristine</Label>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">Fully functional & clean</p>
              </div>

              <div className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${condition === 'Minor Damage' ? 'bg-amber-50 border-amber-500' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Minor Damage" id="minor" className="border-amber-500 text-amber-600 shadow-none focus:ring-amber-500" />
                    <Label htmlFor="minor" className="font-black text-xs uppercase tracking-tight text-slate-700 cursor-pointer">Minor Wear</Label>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">Scratches or small dents</p>
              </div>

              <div className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${condition === 'Major Damage' ? 'bg-rose-50 border-rose-500' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Major Damage" id="major" className="border-rose-500 text-rose-600 shadow-none focus:ring-rose-500" />
                    <Label htmlFor="major" className="font-black text-xs uppercase tracking-tight text-slate-700 cursor-pointer">Major Issue</Label>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">Structural or functional</p>
              </div>
          </RadioGroup>

          {(condition === "Minor Damage" || condition === "Major Damage") && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <Label htmlFor="damage_notes" className="text-[10px] font-black text-rose-600 uppercase">Incident Documentation</Label>
              </div>
              <textarea
                id="damage_notes"
                value={damageNotes}
                onChange={(e) => setDamageNotes(e.target.value)}
                placeholder="Describe specific damage points for repair records..."
                className="w-full min-h-[120px] p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-medium text-slate-700 text-sm"
                required
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
          <Button type="button" variant="ghost" onClick={onCancel} className="h-12 rounded-2xl font-bold text-slate-400">
            Discard
          </Button>
          <Button 
            type="submit" 
            disabled={submitting} 
            className="h-12 px-8 bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-[0.1em] rounded-2xl shadow-xl shadow-rose-100 transition-all hover:-translate-y-0.5"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : "Process intake"}
          </Button>
        </div>
      </form>
    </Card>
  )
}

