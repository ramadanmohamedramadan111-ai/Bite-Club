import { create } from 'zustand'
import { z } from 'zod'

// Zod schema for category validation
export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  nameAr: z.string().min(1, 'Arabic name is required'),
  description: z.string().min(1, 'Description is required'),
  icon: z.string().min(1, 'Icon is required'),
  itemsCount: z.number().default(0),
  visible: z.boolean().default(true),
})

export type Category = z.infer<typeof categorySchema>

interface CategoryStore {
  categories: Category[]
  addCategory: (category: Omit<Category, 'id'>) => void
  updateCategory: (id: string, category: Partial<Category>) => void
  deleteCategory: (id: string) => void
  toggleVisibility: (id: string) => void
  setCategories: (categories: Category[]) => void
}

const INITIAL_CATEGORIES: Category[] = [
  { 
    id: '1', 
    name: 'Signature Burgers', 
    nameAr: 'برجر المميزة',
    description: 'Premium hand-crafted burgers with unique toppings',
    icon: '🍔', 
    itemsCount: 8, 
    visible: true 
  },
  { 
    id: '2', 
    name: 'Appetizers', 
    nameAr: 'المقبلات',
    description: 'Start your meal with our delicious appetizers',
    icon: '🍟', 
    itemsCount: 12, 
    visible: true 
  },
  { 
    id: '3', 
    name: 'Desserts', 
    nameAr: 'الحلويات',
    description: 'Sweet treats to end your meal perfectly',
    icon: '🍰', 
    itemsCount: 5, 
    visible: true 
  },
  { 
    id: '4', 
    name: 'Refreshments', 
    nameAr: 'المشروبات',
    description: 'Cold and hot beverages for every taste',
    icon: '🥤', 
    itemsCount: 15, 
    visible: true 
  },
]

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: INITIAL_CATEGORIES,
  
  addCategory: (category) => set((state) => ({
    categories: [...state.categories, { ...category, id: String(state.categories.length + 1) }]
  })),
  
  updateCategory: (id, updatedCategory) => set((state) => ({
    categories: state.categories.map((category) => 
      category.id === id ? { ...category, ...updatedCategory } : category
    )
  })),
  
  deleteCategory: (id) => set((state) => ({
    categories: state.categories.filter((category) => category.id !== id)
  })),
  
  toggleVisibility: (id) => set((state) => ({
    categories: state.categories.map((category) => 
      category.id === id ? { ...category, visible: !category.visible } : category
    )
  })),
  
  setCategories: (categories) => set({ categories }),
}))
