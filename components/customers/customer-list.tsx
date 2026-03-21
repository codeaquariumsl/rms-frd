'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreVertical, Trash2, Edit, Search, Loader2 } from 'lucide-react'
import { customerApi } from '@/lib/api'
import { toast } from 'sonner'

interface Customer {
  id: string
  nic: string
  name: string
  email: string
  phone: string
  address: string
  createdAt: string
}

interface CustomerListProps {
  onEdit?: (customer: Customer) => void
  onDelete?: (id: string) => void
}

export function CustomerList({ onEdit, onDelete }: CustomerListProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCustomers()
  }, [searchTerm])

  async function loadCustomers() {
    try {
      setLoading(true)
      const response = await customerApi.getAll({ search: searchTerm })
      if (response.data.success) {
        setCustomers(response.data.data)
      }
    } catch (error: any) {
      console.error('Failed to load customers:', error)
      toast.error(error.response?.data?.message || 'Error loading customers')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        const response = await customerApi.delete(id)
        if (response.data.success) {
          toast.success('Customer deleted successfully')
          loadCustomers()
          onDelete?.(id)
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete customer')
      }
    }
  }

  return (
    <div className='space-y-4'>
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
        <input
          type='text'
          placeholder='Search customers by name, NIC, or phone...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white'
        />
      </div>

      <div className='grid gap-4'>
        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <Loader2 className='w-8 h-8 animate-spin text-primary' />
          </div>
        ) : customers.length > 0 ? (
          customers.map((customer) => (
            <Card key={customer.id} className='p-4 border border-blue-100 hover:shadow-md transition-shadow group'>
              <div className='flex justify-between items-start'>
                <div className='flex-1'>
                  <div className='font-semibold text-lg text-primary'>{customer.name}</div>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mt-2 text-sm text-muted-foreground'>
                    <p>NIC: <span className='font-medium text-foreground'>{customer.nic}</span></p>
                    <p>Phone: <span className='font-medium text-foreground'>{customer.phone}</span></p>
                    <p>Email: <span className='font-medium text-foreground'>{customer.email || 'N/A'}</span></p>
                    <p>Address: <span className='font-medium text-foreground'>{customer.address}</span></p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='sm' className='opacity-0 group-hover:opacity-100 transition-opacity'>
                      <MoreVertical className='w-4 h-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem
                      onClick={() => onEdit?.(customer)}
                      className='cursor-pointer text-blue-600'
                    >
                      <Edit className='w-4 h-4 mr-2' />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(customer.id)}
                      className='cursor-pointer text-destructive'
                    >
                      <Trash2 className='w-4 h-4 mr-2' />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className='text-xs text-muted-foreground mt-3 flex items-center gap-1'>
                <span className='w-2 h-2 rounded-full bg-green-500'></span>
                Registered: {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'Just now'}
              </p>
            </Card>
          ))
        ) : (
          <div className='text-center py-20 border-2 border-dashed border-blue-50 rounded-xl bg-blue-50/20'>
            <p className='text-muted-foreground'>
              {searchTerm ? 'No customers match your search.' : 'No customers found. Register your first customer!'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

