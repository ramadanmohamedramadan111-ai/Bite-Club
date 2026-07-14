import { create } from 'zustand'
import { z } from 'zod'

// Zod schema for menu item validation
export const menuItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  nameAr: z.string().min(1, 'Arabic name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  category: z.enum(['burgers', 'appetizers', 'beverages', 'desserts']),
  image: z.string().optional(),
  available: z.boolean().default(true),
  badge: z.enum(['bestSeller', 'soldOut']).nullable().default(null),
})

export type MenuItem = z.infer<typeof menuItemSchema>

interface MenuStore {
  items: MenuItem[]
  addItem: (item: Omit<MenuItem, 'id'>) => void
  updateItem: (id: string, item: Partial<MenuItem>) => void
  deleteItem: (id: string) => void
  toggleAvailability: (id: string) => void
  setItems: (items: MenuItem[]) => void
}

const INITIAL_ITEMS: MenuItem[] = [
  { 
    id: '1', 
    name: 'Signature Wagyu Burger', 
    nameAr: 'برجر واجيو فاخر', 
    description: 'Premium wagyu beef with special sauce', 
    price: 450, 
    category: 'burgers', 
    image: '', 
    available: true, 
    badge: 'bestSeller' 
  },
  { 
    id: '2', 
    name: 'Double Smash Burger', 
    nameAr: 'دبل سماش برجر', 
    description: 'Two smashed patties with cheese', 
    price: 320, 
    category: 'burgers', 
    image: '', 
    available: true, 
    badge: null 
  },
  { 
    id: '3', 
    name: 'Spicy Zinger Tower', 
    nameAr: 'سبيسي زنجر تاور', 
    description: 'Crispy chicken with spicy sauce', 
    price: 280, 
    category: 'burgers', 
    image: '', 
    available: false, 
    badge: 'soldOut' 
  },
  { 
    id: '4', 
    name: 'Truffle Parmesan Fries', 
    nameAr: 'بطاطس تراقل بارميزان', 
    description: 'Crispy fries with truffle oil', 
    price: 120, 
    category: 'appetizers', 
    image: '', 
    available: true, 
    badge: null 
  },
  { 
    id: '5', 
    name: 'Mozzarella Sticks', 
    nameAr: 'أصابع الموزاريلا', 
    description: 'Golden fried mozzarella sticks', 
    price: 145, 
    category: 'appetizers', 
    image: '', 
    available: true, 
    badge: null 
  },
]

export const useMenuStore = create<MenuStore>((set) => ({
  items: INITIAL_ITEMS,
  
  addItem: (item) => set((state) => ({
    items: [...state.items, { ...item, id: String(state.items.length + 1) }]
  })),
  
  updateItem: (id, updatedItem) => set((state) => ({
    items: state.items.map((item) => 
      item.id === id ? { ...item, ...updatedItem } : item
    )
  })),
  
  deleteItem: (id) => set((state) => ({
    items: state.items.filter((item) => item.id !== id)
  })),
  
  toggleAvailability: (id) => set((state) => ({
    items: state.items.map((item) => 
      item.id === id ? { ...item, available: !item.available } : item
    )
  })),
  
  setItems: (items) => set({ items }),
}))
