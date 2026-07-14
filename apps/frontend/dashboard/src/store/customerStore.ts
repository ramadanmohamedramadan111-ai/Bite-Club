import { create } from 'zustand'
import { z } from 'zod'

// Zod schema for customer validation
export const customerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  orders: z.number().default(0),
  spend: z.number().default(0),
  lastOrder: z.string().optional(),
  segment: z.enum(['VIP', 'FREQUENT', 'NEW']),
})

export type Customer = z.infer<typeof customerSchema>

interface CustomerStore {
  customers: Customer[]
  addCustomer: (customer: Omit<Customer, 'id'>) => void
  updateCustomer: (id: string, customer: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  setCustomers: (customers: Customer[]) => void
}

const INITIAL_CUSTOMERS: Customer[] = [
  { 
    id: '1', 
    name: 'Ahmed Mansour', 
    email: 'ahmed.m@example.com', 
    phone: '+20 100 234 5678', 
    orders: 42, 
    spend: 12450, 
    lastOrder: 'Oct 24, 2023', 
    segment: 'VIP' 
  },
  { 
    id: '2', 
    name: 'Laila Hassan', 
    email: 'laila.h@outlook.com', 
    phone: '+20 112 889 4432', 
    orders: 18, 
    spend: 5120, 
    lastOrder: 'Oct 22, 2023', 
    segment: 'FREQUENT' 
  },
  { 
    id: '3', 
    name: 'Omar Zaki', 
    email: 'omar_z@webmail.com', 
    phone: '+20 155 001 9988', 
    orders: 1, 
    spend: 850, 
    lastOrder: 'Oct 25, 2023', 
    segment: 'NEW' 
  },
  { 
    id: '4', 
    name: 'Nour Adel', 
    email: 'nour.a@email.com', 
    phone: '+20 101 234 5670', 
    orders: 9, 
    spend: 2100, 
    lastOrder: 'Oct 21, 2023', 
    segment: 'FREQUENT' 
  },
  { 
    id: '5', 
    name: 'Sara Mostafa', 
    email: 'sara.m@email.com', 
    phone: '+20 102 234 5671', 
    orders: 6, 
    spend: 1450, 
    lastOrder: 'Oct 20, 2023', 
    segment: 'FREQUENT' 
  },
  { 
    id: '6', 
    name: 'Karim Fathy', 
    email: 'karim.f@email.com', 
    phone: '+20 103 234 5672', 
    orders: 4, 
    spend: 980, 
    lastOrder: 'Oct 18, 2023', 
    segment: 'NEW' 
  },
  { 
    id: '7', 
    name: 'Hana Ibrahim', 
    email: 'hana.i@email.com', 
    phone: '+20 104 234 5673', 
    orders: 15, 
    spend: 3600, 
    lastOrder: 'Oct 23, 2023', 
    segment: 'FREQUENT' 
  },
  { 
    id: '8', 
    name: 'Youssef Ali', 
    email: 'youss.a@email.com', 
    phone: '+20 105 234 5674', 
    orders: 31, 
    spend: 8200, 
    lastOrder: 'Oct 24, 2023', 
    segment: 'VIP' 
  },
]

export const useCustomerStore = create<CustomerStore>((set) => ({
  customers: INITIAL_CUSTOMERS,
  
  addCustomer: (customer) => set((state) => ({
    customers: [...state.customers, { ...customer, id: String(state.customers.length + 1) }]
  })),
  
  updateCustomer: (id, updatedCustomer) => set((state) => ({
    customers: state.customers.map((customer) => 
      customer.id === id ? { ...customer, ...updatedCustomer } : customer
    )
  })),
  
  deleteCustomer: (id) => set((state) => ({
    customers: state.customers.filter((customer) => customer.id !== id)
  })),
  
  setCustomers: (customers) => set({ customers }),
}))
