'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { customerApi } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface Customer {
  id: string
  nic: string
  name: string
  email: string
  phone: string
  address: string
  createdAt: string
}

interface CustomerFormProps {
  initialData?: Customer
  onSuccess?: () => void
  onCancel?: () => void
}

export function CustomerForm({ initialData, onSuccess, onCancel }: CustomerFormProps) {
  const [formData, setFormData] = useState({
    nic: '',
    name: '',
    email: '',
    phone: '',
    address: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({
        nic: initialData.nic,
        name: initialData.name,
        email: initialData.email || '',
        phone: initialData.phone,
        address: initialData.address,
      })
    }
  }, [initialData])

  function validateNIC(nic: string): boolean {
    return nic.length >= 9
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!validateNIC(formData.nic)) {
      setError('NIC must be at least 9 characters')
      return
    }

    setLoading(true)

    try {
      if (initialData) {
        const response = await customerApi.update(initialData.id, formData)
        if (response.data.success) {
          toast.success('Customer updated successfully')
          onSuccess?.()
        }
      } else {
        const response = await customerApi.create(formData)
        if (response.data.success) {
          toast.success('Customer registered successfully')
          setFormData({ nic: '', name: '', email: '', phone: '', address: '' })
          onSuccess?.()
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save customer'
      setError(msg)
      toast.error(msg)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className='p-6 border border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-sm'>
      <h2 className='text-2xl font-bold text-primary mb-6'>
        {initialData ? 'Edit Customer' : 'Register New Customer'}
      </h2>

      {error && (
        <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm animate-in fade-in slide-in-from-top-1'>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='nic' className='text-primary font-semibold'>NIC (National ID) *</Label>
            <Input
              id='nic'
              value={formData.nic}
              onChange={(e) => setFormData({ ...formData, nic: e.target.value.toUpperCase() })}
              placeholder='Enter NIC number'
              required
              disabled={!!initialData}
              className='border-blue-200 focus:ring-primary h-11'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='name' className='text-primary font-semibold'>Full Name *</Label>
            <Input
              id='name'
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder='Enter full name'
              required
              className='border-blue-200 focus:ring-primary h-11'
            />
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='email' className='text-primary font-semibold'>Email (Optional)</Label>
            <Input
              id='email'
              type='email'
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder='customer@example.com'
              className='border-blue-200 focus:ring-primary h-11'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='phone' className='text-primary font-semibold'>Phone Number *</Label>
            <Input
              id='phone'
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder='07x xxx xxxx'
              required
              className='border-blue-200 focus:ring-primary h-11'
            />
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='address' className='text-primary font-semibold'>Current Address *</Label>
          <Input
            id='address'
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder='Enter home or business address'
            required
            className='border-blue-200 focus:ring-primary h-11'
          />
        </div>

        <div className='flex justify-end gap-3 pt-6 border-t border-blue-100 mt-4'>
          <Button type='button' variant='outline' onClick={onCancel} className='h-11 px-6'>
            Cancel
          </Button>
          <Button type='submit' disabled={loading} className='bg-primary hover:bg-blue-700 h-11 px-8 min-w-[140px]'>
            {loading ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                Saving...
              </>
            ) : initialData ? 'Update Details' : 'Register Customer'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

