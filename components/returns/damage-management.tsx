'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreVertical, Wrench, Trash2 } from 'lucide-react'

export function DamageManagement() {
  const [damagedItems, setDamagedItems] = useState<any[]>([])

  useEffect(() => {
    loadDamagedItems()
  }, [])

  function loadDamagedItems() {
    try {
      const returns = JSON.parse(localStorage.getItem('returns') || '[]')
      const damaged = returns.filter((r: any) => r.condition !== 'Good' && r.status.includes('Returned'))
      setDamagedItems(damaged)
    } catch (error) {
      console.error('Failed to load damaged items:', error)
    }
  }

  function updateRepairStatus(returnId: string, newStatus: string) {
    try {
      const returns = JSON.parse(localStorage.getItem('returns') || '[]')
      const updated = returns.map((r: any) =>
        r.id === returnId ? { ...r, repairStatus: newStatus } : r
      )
      localStorage.setItem('returns', JSON.stringify(updated))
      loadDamagedItems()
    } catch (error) {
      console.error('Failed to update repair status:', error)
    }
  }

  function deleteDamagedItem(returnId: string) {
    if (confirm('Are you sure you want to remove this item from damage tracking?')) {
      try {
        const returns = JSON.parse(localStorage.getItem('returns') || '[]')
        const updated = returns.filter((r: any) => r.id !== returnId)
        localStorage.setItem('returns', JSON.stringify(updated))
        loadDamagedItems()
      } catch (error) {
        console.error('Failed to delete damaged item:', error)
      }
    }
  }

  const groupedByStatus = {
    pending: damagedItems.filter((item) => item.repairStatus === 'Pending'),
    inRepair: damagedItems.filter((item) => item.repairStatus === 'In Repair'),
    repaired: damagedItems.filter((item) => item.repairStatus === 'Repaired'),
    scrapped: damagedItems.filter((item) => item.repairStatus === 'Scrapped'),
  }

  const renderStatusCards = (items: any[]) => (
    <div className='grid gap-4'>
      {items.length === 0 ? (
        <div className='text-center py-8 text-muted-foreground'>No items in this category</div>
      ) : (
        items.map((item) => (
          <Card key={item.id} className='p-4 border-blue-100 hover:shadow-md transition-shadow'>
            <div className='flex justify-between items-start mb-3'>
              <div className='flex-1'>
                <h3 className='font-semibold text-lg text-primary'>{item.itemName}</h3>
                <p className='text-sm text-muted-foreground'>{item.customerName}</p>
              </div>
              <div className='flex gap-2'>
                <Badge variant='outline'>{item.condition}</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='sm'>
                      <MoreVertical className='w-4 h-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    {item.repairStatus === 'Pending' && (
                      <DropdownMenuItem onClick={() => updateRepairStatus(item.id, 'In Repair')}>
                        <Wrench className='w-4 h-4 mr-2' />
                        Start Repair
                      </DropdownMenuItem>
                    )}
                    {item.repairStatus === 'In Repair' && (
                      <>
                        <DropdownMenuItem onClick={() => updateRepairStatus(item.id, 'Repaired')}>
                          <Wrench className='w-4 h-4 mr-2' />
                          Mark as Repaired
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateRepairStatus(item.id, 'Scrapped')} className='text-red-600'>
                          <Trash2 className='w-4 h-4 mr-2' />
                          Mark as Scrapped
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem onClick={() => deleteDamagedItem(item.id)} className='text-red-600'>
                      <Trash2 className='w-4 h-4 mr-2' />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className='grid grid-cols-3 gap-3 text-sm border-t pt-3'>
              <div>
                <p className='text-muted-foreground'>Booking ID</p>
                <p className='font-semibold'>{item.bookingId}</p>
              </div>
              <div>
                <p className='text-muted-foreground'>Return Date</p>
                <p className='font-semibold'>{new Date(item.returnDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className='text-muted-foreground'>Repair Status</p>
                <p className='font-semibold text-primary'>{item.repairStatus}</p>
              </div>
            </div>

            {item.notes && (
              <div className='mt-3 p-2 bg-yellow-50 rounded text-xs border border-yellow-200'>
                <p className='text-yellow-800 font-medium'>Damage Notes:</p>
                <p className='text-yellow-700'>{item.notes}</p>
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  )

  return (
    <div className='space-y-4'>
      <Tabs defaultValue='pending' className='w-full'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='pending'>Pending ({groupedByStatus.pending.length})</TabsTrigger>
          <TabsTrigger value='inRepair'>In Repair ({groupedByStatus.inRepair.length})</TabsTrigger>
          <TabsTrigger value='repaired'>Repaired ({groupedByStatus.repaired.length})</TabsTrigger>
          <TabsTrigger value='scrapped'>Scrapped ({groupedByStatus.scrapped.length})</TabsTrigger>
        </TabsList>

        <TabsContent value='pending' className='mt-4'>
          {renderStatusCards(groupedByStatus.pending)}
        </TabsContent>

        <TabsContent value='inRepair' className='mt-4'>
          {renderStatusCards(groupedByStatus.inRepair)}
        </TabsContent>

        <TabsContent value='repaired' className='mt-4'>
          {renderStatusCards(groupedByStatus.repaired)}
        </TabsContent>

        <TabsContent value='scrapped' className='mt-4'>
          {renderStatusCards(groupedByStatus.scrapped)}
        </TabsContent>
      </Tabs>
    </div>
  )
}
