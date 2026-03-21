"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download } from "lucide-react"

interface ReportsPageProps {
  organizationId: number
}

export function ReportsPage({ organizationId }: ReportsPageProps) {
  const [activeReport, setActiveReport] = useState<string>("inventory")
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadReport(activeReport)
  }, [activeReport])

  function loadReport(reportType: string) {
    try {
      setLoading(false)
      let data: any = []
      let summary: any = {}

      const inventory = JSON.parse(localStorage.getItem("rms_inventory") || "[]")
      const bookings = JSON.parse(localStorage.getItem("bookings") || "[]")
      const deliveries = JSON.parse(localStorage.getItem("deliveries") || "[]")
      const returns = JSON.parse(localStorage.getItem("returns") || "[]")

      switch (reportType) {
        case "inventory":
          data = inventory.map((item: any) => ({
            Name: item.name,
            SKU: item.sku,
            Status: item.status,
            Available: item.quantity_available,
            Rented: item.quantity_rented || 0,
            Damaged: item.quantity_damaged || 0,
            "Rental Rate": `$${item.rental_rate_per_day}/day`,
          }))
          summary = {
            total_items: inventory.length,
            available: inventory.filter((i: any) => i.status === "Available").length,
            rented: inventory.filter((i: any) => i.status === "Rented").length,
            damaged: inventory.filter((i: any) => i.status === "Damaged").length,
          }
          break

        case "rental-history":
          data = bookings.map((booking: any) => ({
            "Booking ID": booking.id,
            Customer: booking.customerName,
            Items: booking.items.length,
            "Delivery Date": booking.deliveryDate,
            "Return Date": booking.returnDate,
            Status: booking.status,
            Amount: `$${booking.estimatedTotal || 0}`,
          }))
          summary = {
            total_bookings: bookings.length,
            completed: bookings.filter((b: any) => b.status === "Returned").length,
            pending: bookings.filter((b: any) => b.status !== "Returned").length,
          }
          break

        case "delivery-schedule":
          data = deliveries
            .filter((d: any) => d.status !== "Returned")
            .map((delivery: any) => ({
              "Booking ID": delivery.bookingId,
              Customer: delivery.customerName,
              "Delivery Date": delivery.deliveryDate,
              Status: delivery.status,
              Items: delivery.items?.length || 0,
            }))
          summary = {
            pending_deliveries: deliveries.filter((d: any) => d.status === "Pending").length,
            delivered: deliveries.filter((d: any) => d.status === "Delivered").length,
          }
          break

        case "pending-returns":
          data = returns
            .filter((r: any) => r.status === "Pending")
            .map((ret: any) => ({
              "Booking ID": ret.bookingId,
              Item: ret.itemName,
              "Return Date": ret.returnDate,
              Status: ret.status,
              Condition: ret.condition,
            }))
          summary = {
            pending_returns: returns.filter((r: any) => r.status === "Pending").length,
            overdue: returns.filter((r: any) => new Date(r.returnDate) < new Date()).length,
          }
          break
      }

      setReportData({ data, summary })
    } catch (error) {
      console.error("Failed to load report:", error)
      setReportData({ data: [], summary: {} })
    }
  }

  const exportToCSV = () => {
    if (!reportData?.data) return

    const headers = Object.keys(reportData.data[0])
    const csvContent = [
      headers.join(","),
      ...reportData.data.map((row: any) => headers.map((h) => JSON.stringify(row[h])).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${activeReport}-report.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Report Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { id: "inventory", label: "Inventory Status" },
          { id: "rental-history", label: "Rental History" },
          { id: "delivery-schedule", label: "Delivery Schedule" },
          { id: "pending-returns", label: "Pending Returns" },
        ].map((report) => (
          <Button
            key={report.id}
            onClick={() => setActiveReport(report.id)}
            variant={activeReport === report.id ? "default" : "outline"}
            className="w-full"
          >
            {report.label}
          </Button>
        ))}
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="text-center py-12">Loading report...</div>
      ) : reportData ? (
        <>
          {/* Summary */}
          {reportData.summary && (
            <Card className="p-6 bg-muted">
              <h3 className="font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(reportData.summary).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-sm text-muted-foreground capitalize">{key.replace(/_/g, " ")}</p>
                    <p className="text-2xl font-bold">{value}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Data Table */}
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Report Details</h3>
                <Button onClick={exportToCSV} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {reportData.data.length > 0 &&
                        Object.keys(reportData.data[0]).map((key) => (
                          <TableHead key={key} className="capitalize">
                            {key.replace(/_/g, " ")}
                          </TableHead>
                        ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.data.map((row: any, idx: number) => (
                      <TableRow key={idx}>
                        {Object.values(row).map((value: any, cellIdx: number) => (
                          <TableCell key={cellIdx}>{value === null ? "-" : String(value)}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {reportData.data.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">No data available for this report</div>
              )}
            </div>
          </Card>
        </>
      ) : (
        <div className="text-center py-12">No data available</div>
      )}
    </div>
  )
}
