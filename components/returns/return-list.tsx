"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Eye, AlertTriangle, RefreshCcw, Loader2, RotateCcw, Calendar, User, ClipboardList, Info } from "lucide-react"
import { returnApi } from "@/lib/api"
import { toast } from "sonner"

interface ReturnListProps {
  organizationId: number
  overdueOnly?: boolean
  onViewReturn?: (id: string | number) => void
  onRefresh?: () => void
}

export function ReturnList({ organizationId, overdueOnly = false, onViewReturn, onRefresh }: ReturnListProps) {
  const [returns, setReturns] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchReturns()
  }, [organizationId, overdueOnly])

  async function fetchReturns() {
    try {
      setLoading(true)
      const response = await returnApi.getAll({ 
          status: 'Pending',
          overdueOnly: overdueOnly 
      })
      if (response.data.success) {
        setReturns(response.data.data)
      }
    } catch (error: any) {
      console.error("Failed to fetch returns:", error)
      toast.error("Failed to load pending return queue")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Returned":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "Returned Damaged":
        return "bg-rose-100 text-rose-800 border-rose-200"
      case "Pending":
        return "bg-amber-100 text-amber-800 border-amber-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const isOverdue = (returnDate: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const rDate = new Date(returnDate)
    rDate.setHours(0, 0, 0, 0)
    return rDate < today
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={fetchReturns} disabled={loading} className="text-slate-400">
              <RefreshCcw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Sync Return Queue
          </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {returns.map((item) => (
          <Card key={item.id} className="p-6 border-blue-50 shadow-sm hover:shadow-xl transition-all border-2 rounded-3xl bg-white relative overflow-hidden group">
            {isOverdue(item.return_date) && item.status === "Pending" && (
                <div className="absolute top-0 right-0 h-10 w-10 flex items-center justify-center bg-rose-50 rounded-bl-3xl border-l border-b border-rose-100">
                    <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
                </div>
            )}

            <div className="flex justify-between items-start mb-5 pb-4 border-b border-slate-50">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{item.booking_number}</span>
                        <Badge variant="outline" className={`text-[10px] h-5 font-bold uppercase ${getStatusColor(item.status)}`}>
                            {item.status}
                        </Badge>
                    </div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-slate-400" />
                        {item.customer_name}
                    </h3>
                </div>
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-50">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-2xl">
                        <DropdownMenuItem onClick={() => onViewReturn?.(item.id)} className="cursor-pointer font-medium">
                            <Info className="w-4 h-4 mr-2 text-rose-500" />
                            Return Specifications
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Scheduled Return
                    </p>
                    <p className={`text-sm font-bold ${isOverdue(item.return_date) ? 'text-rose-600' : 'text-slate-700'}`}>
                        {new Date(item.return_date).toLocaleDateString()}
                        {isOverdue(item.return_date) && <span className="ml-1 text-[10px] italic">(Overdue)</span>}
                    </p>
                </div>
                <div className="space-y-1 text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Current Term</p>
                    <p className="text-sm font-bold text-slate-700">Out with Customer</p>
                </div>
            </div>

            <div className="flex gap-3">
                <Button 
                    onClick={() => onViewReturn?.(item.id)}
                    className="flex-1 h-12 bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-rose-100 transition-all hover:-translate-y-0.5"
                >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Process Intake
                </Button>
                <Button variant="outline" className="h-12 w-12 rounded-2xl border-slate-200">
                    <ClipboardList className="w-4 h-4 text-slate-400" />
                </Button>
            </div>
          </Card>
        ))}
      </div>

      {returns.length === 0 && !loading && (
        <div className="text-center py-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-600">No return requests</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">All shipments are currently accounted for or returned.</p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-rose-500 opacity-50" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Checking return logs...</p>
        </div>
      )}
    </div>
  )
}

