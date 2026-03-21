"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Package, AlertCircle, Clock, Zap, Loader2, ArrowUpRight, TrendingUp } from "lucide-react"
import { dashboardApi, deliveryApi, returnApi } from "@/lib/api"
import { toast } from "sonner"

interface AdminDashboardProps {
  organizationId: number
}

export function AdminDashboard({ organizationId }: AdminDashboardProps) {
  const [stats, setStats] = useState<any>(null)
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [returns, setReturns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [organizationId])

  async function loadDashboardData() {
    try {
      setLoading(true)
      const [statsRes, deliveriesRes, returnsRes] = await Promise.all([
        dashboardApi.getStats(),
        deliveryApi.getAll({ status: 'Pending', limit: 5 }),
        returnApi.getAll({ status: 'Pending', limit: 5 })
      ])

      if (statsRes.data.success) setStats(statsRes.data.data)
      if (deliveriesRes.data.success) setDeliveries(deliveriesRes.data.data)
      if (returnsRes.data.success) setReturns(returnsRes.data.data)

    } catch (error: any) {
      console.error("Failed to load dashboard data:", error)
      toast.error("Failed to refresh dashboard statistics")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary opacity-40" />
        <p className="text-muted-foreground font-medium animate-pulse">Analyzing rental metrics...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-20 bg-blue-50/30 rounded-3xl border-2 border-dashed border-blue-100">
        <p className="text-muted-foreground">No analytical data available at this time.</p>
      </div>
    )
  }

  const inventoryData = [
    { name: "Available", value: Number(stats.available_items || 0), fill: "#10b981" },
    { name: "Reserved", value: Number(stats.reserved_items || 0), fill: "#3b82f6" },
    { name: "Delivered", value: Number(stats.delivered_items || 0), fill: "#8b5cf6" },
    { name: "Damaged", value: Number(stats.damaged_items || 0), fill: "#ef4444" },
  ]

  return (
    <div className="space-y-8 pb-10">
      {/* Header with quick action/refresh */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-blue-900 tracking-tight">System Overview</h2>
          <p className="text-muted-foreground mt-1">Real-time performance metrics and operational status.</p>
        </div>
        <Badge variant="outline" className="h-8 px-3 border-blue-200 text-blue-700 bg-blue-50">
          <span className="w-2 h-2 rounded-full bg-green-50 animate-pulse mr-2 bg-green-500"></span>
          Live Sync
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Inventory" 
          value={stats.total_inventory} 
          icon={<Package className="w-6 h-6 text-blue-600" />} 
          footer="Units in circulation"
          color="bg-blue-500"
        />
        <MetricCard 
          title="Today's Deliveries" 
          value={stats.today_deliveries} 
          icon={<Zap className="w-6 h-6 text-amber-600" />} 
          footer="Action required today"
          color="bg-amber-500"
        />
        <MetricCard 
          title="Pending Returns" 
          value={stats.pending_returns} 
          icon={<Clock className="w-6 h-6 text-purple-600" />} 
          footer="Expecting arrival"
          color="bg-purple-500"
        />
        <MetricCard 
          title="Overdue Items" 
          value={stats.overdue_returns || 0} 
          icon={<AlertCircle className="w-6 h-6 text-rose-600" />} 
          footer="Critical attention"
          color="bg-rose-500"
          valueColor="text-rose-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8 border-blue-100 shadow-sm rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-primary">Inventory Composition</h3>
            <div className="p-2 bg-blue-50 rounded-lg"><TrendingUp className="w-5 h-5 text-blue-600" /></div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {inventoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="white" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-8 border-blue-100 shadow-sm rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-primary">Volume Trends</h3>
            <div className="p-2 bg-green-50 rounded-lg"><ArrowUpRight className="w-5 h-5 text-green-600" /></div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "Mon", Deliveries: 8, Returns: 4 },
                  { name: "Tue", Deliveries: 12, Returns: 6 },
                  { name: "Wed", Deliveries: 10, Returns: 3 },
                  { name: "Thu", Deliveries: 15, Returns: 8 },
                  { name: "Fri", Deliveries: 18, Returns: 5 },
                  { name: "Sat", Deliveries: 6, Returns: 2 },
                  { name: "Sun", Deliveries: 4, Returns: 1 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="Deliveries" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="Returns" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Dynamic Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ActivityFeed 
          title="Upcoming Deliveries" 
          icon={<Zap className="w-5 h-5 text-amber-500" />}
          items={deliveries}
          emptyMsg="No deliveries scheduled for today."
          type="delivery"
        />
        <ActivityFeed 
          title="Returns Expected" 
          icon={<Clock className="w-5 h-5 text-purple-500" />}
          items={returns}
          emptyMsg="No items scheduled for return."
          type="return"
        />
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon, footer, color, valueColor = "text-foreground" }: any) {
  return (
    <Card className="p-6 border-blue-100 shadow-sm group hover:shadow-md transition-all relative overflow-hidden rounded-2xl">
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 group-hover:opacity-10 transition-opacity ${color}`} />
      <div className="flex justify-between items-start relative">
        <div className="space-y-1">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className={`text-4xl font-black ${valueColor} tracking-tight`}>{value}</p>
        </div>
        <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-50">{icon}</div>
      </div>
      <p className="text-[10px] text-muted-foreground mt-4 font-medium flex items-center gap-1 opacity-70">
        <ArrowUpRight className="w-3 h-3" /> {footer}
      </p>
    </Card>
  )
}

function ActivityFeed({ title, icon, items, emptyMsg, type }: any) {
  return (
    <Card className="p-8 border-blue-100 shadow-sm rounded-2xl h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-50">{icon}</div>
        <h3 className="font-bold text-lg text-primary">{title}</h3>
      </div>
      <div className="space-y-4">
        {items.length > 0 ? (
          items.map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center p-4 bg-slate-50/50 hover:bg-white border hover:border-blue-100 rounded-xl transition-all cursor-default">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-800 text-sm">{item.booking_number || `BK-${item.id}`}</p>
                <p className="text-xs text-muted-foreground font-medium">
                  {type === 'delivery' ? `Prepared by: ${item.prepared_by_name || 'Staff'}` : `Due: ${new Date(item.return_date || item.created_at).toLocaleDateString()}`}
                </p>
              </div>
              <Badge 
                variant={type === 'return' && new Date(item.return_date) < new Date() ? "destructive" : "outline"}
                className="font-bold text-[10px] px-2 py-0 border-blue-200"
              >
                {item.status || 'Active'}
              </Badge>
            </div>
          ))
        ) : (
          <div className="py-12 flex flex-col items-center justify-center opacity-40">
            <Package className="w-10 h-10 mb-2 grayscale" />
            <p className="text-sm font-medium">{emptyMsg}</p>
          </div>
        )}
      </div>
    </Card>
  )
}

