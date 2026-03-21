// Database utility functions for Neon PostgreSQL

import { neon } from "@neondatabase/serverless"

// Initialize SQL client
const sql = neon(process.env.DATABASE_URL || "")

// Helper function to run queries
export async function query<T = any>(queryString: string, values?: any[]): Promise<T[]> {
  try {
    const result = await sql(queryString, values)
    return result as T[]
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Helper function to get a single row
export async function queryOne<T = any>(queryString: string, values?: any[]): Promise<T | null> {
  const results = await query<T>(queryString, values)
  return results.length > 0 ? results[0] : null
}

// Inventory Queries
export async function getInventoryItems(orgId: number, status?: string) {
  let queryStr = "SELECT * FROM inventory_items WHERE organization_id = $1"
  const values: any[] = [orgId]

  if (status) {
    queryStr += " AND status = $2"
    values.push(status)
  }

  queryStr += " ORDER BY created_at DESC"
  return query(queryStr, values)
}

export async function getInventoryItemById(itemId: number) {
  return queryOne("SELECT * FROM inventory_items WHERE id = $1", [itemId])
}

export async function getInventoryByBarcode(barcode: string) {
  return queryOne("SELECT * FROM inventory_items WHERE barcode = $1", [barcode])
}

// Booking Queries
export async function getBookings(orgId: number, status?: string) {
  let queryStr = "SELECT * FROM bookings WHERE organization_id = $1"
  const values: any[] = [orgId]

  if (status) {
    queryStr += " AND status = $2"
    values.push(status)
  }

  queryStr += " ORDER BY delivery_date ASC"
  return query(queryStr, values)
}

export async function getBookingById(bookingId: number) {
  return queryOne("SELECT * FROM bookings WHERE id = $1", [bookingId])
}

export async function getBookingsByDeliveryDate(orgId: number, date: string) {
  return query("SELECT * FROM bookings WHERE organization_id = $1 AND delivery_date = $2 ORDER BY delivery_date ASC", [
    orgId,
    date,
  ])
}

export async function getUpcomingDeliveries(orgId: number, days = 7) {
  return query(
    `SELECT * FROM bookings 
     WHERE organization_id = $1 
     AND delivery_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '${days} days'
     AND status IN ('Reserved', 'Ready for Pickup')
     ORDER BY delivery_date ASC`,
    [orgId],
  )
}

// Return Queries
export async function getPendingReturns(orgId: number) {
  return query(
    `SELECT b.*, r.* FROM bookings b
     LEFT JOIN returns r ON b.id = r.booking_id
     WHERE b.organization_id = $1 
     AND b.status IN ('Delivered', 'Returned')
     AND (r.status = 'Pending' OR r.status IS NULL)
     ORDER BY b.return_date ASC`,
    [orgId],
  )
}

// Customer Queries
export async function getCustomers(orgId: number) {
  return query("SELECT * FROM customers WHERE organization_id = $1 ORDER BY name", [orgId])
}

export async function getCustomerById(customerId: number) {
  return queryOne("SELECT * FROM customers WHERE id = $1", [customerId])
}

// Notification Queries
export async function getPendingNotifications(orgId: number) {
  return query("SELECT * FROM notifications WHERE organization_id = $1 AND status = $2 ORDER BY created_at ASC", [
    orgId,
    "Pending",
  ])
}

export async function markNotificationAsSent(notificationId: number) {
  return query("UPDATE notifications SET status = $1, sent_at = CURRENT_TIMESTAMP WHERE id = $2", [
    "Sent",
    notificationId,
  ])
}

// Dashboard Statistics
export async function getDashboardStats(orgId: number) {
  const result = await queryOne(
    `
    SELECT
      (SELECT COUNT(*) FROM inventory_items WHERE organization_id = $1) as total_inventory,
      (SELECT COUNT(*) FROM inventory_items WHERE organization_id = $1 AND status = 'Available') as available_items,
      (SELECT COUNT(*) FROM inventory_items WHERE organization_id = $1 AND status = 'Reserved') as reserved_items,
      (SELECT COUNT(*) FROM inventory_items WHERE organization_id = $1 AND status = 'Delivered') as delivered_items,
      (SELECT COUNT(*) FROM inventory_items WHERE organization_id = $1 AND status = 'Damaged') as damaged_items,
      (SELECT COUNT(*) FROM bookings WHERE organization_id = $1 AND delivery_date = CURRENT_DATE AND status IN ('Reserved', 'Ready for Pickup')) as today_deliveries,
      (SELECT COUNT(*) FROM bookings WHERE organization_id = $1 AND delivery_date = CURRENT_DATE + INTERVAL '1 day' AND status IN ('Reserved', 'Ready for Pickup')) as tomorrow_deliveries,
      (SELECT COUNT(*) FROM returns WHERE booking_id IN (SELECT id FROM bookings WHERE organization_id = $1) AND status = 'Pending') as pending_returns,
      (SELECT COUNT(*) FROM bookings WHERE organization_id = $1 AND return_date < CURRENT_DATE AND status IN ('Delivered', 'Returned')) as overdue_returns
  `,
    [orgId],
  )

  return result
}

export { sql }
