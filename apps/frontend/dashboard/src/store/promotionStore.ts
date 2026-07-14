import { create } from 'zustand'
import { z } from 'zod'

// Zod schema for promotion validation
export const promotionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  desc: z.string().min(1, 'Description is required'),
  status: z.enum(['ACTIVE', 'SCHEDULED', 'EXPIRED']),
  type: z.enum(['Coupon Code', 'Campaign', 'Flash Sale']),
  schedule: z.string().min(1, 'Schedule is required'),
  usage: z.number().default(0),
  maxUsage: z.number().positive('Max usage must be positive'),
})

export type Promotion = z.infer<typeof promotionSchema>

interface PromotionStore {
  promotions: Promotion[]
  addPromotion: (promotion: Omit<Promotion, 'id'>) => void
  updatePromotion: (id: string, promotion: Partial<Promotion>) => void
  deletePromotion: (id: string) => void
  toggleStatus: (id: string) => void
  setPromotions: (promotions: Promotion[]) => void
}

const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: '1',
    name: 'FIRSTBITE25',
    desc: '25% off for new users',
    status: 'ACTIVE',
    type: 'Coupon Code',
    schedule: 'No Expiry',
    usage: 1204,
    maxUsage: 2000,
  },
  {
    id: '2',
    name: 'FREE APPL TUESDAYS',
    desc: 'Free Appetizer > 250 EGP',
    status: 'ACTIVE',
    type: 'Campaign',
    schedule: 'Recurring (Tue)',
    usage: 842,
    maxUsage: 1000,
  },
  {
    id: '3',
    name: 'HOLIDAY FLASH 50',
    desc: '50% off select menu items',
    status: 'SCHEDULED',
    type: 'Flash Sale',
    schedule: 'Dec 24 - Dec 26',
    usage: 0,
    maxUsage: 500,
  },
]

export const usePromotionStore = create<PromotionStore>((set) => ({
  promotions: INITIAL_PROMOTIONS,
  
  addPromotion: (promotion) => set((state) => ({
    promotions: [...state.promotions, { ...promotion, id: String(state.promotions.length + 1) }]
  })),
  
  updatePromotion: (id, updatedPromotion) => set((state) => ({
    promotions: state.promotions.map((promotion) => 
      promotion.id === id ? { ...promotion, ...updatedPromotion } : promotion
    )
  })),
  
  deletePromotion: (id) => set((state) => ({
    promotions: state.promotions.filter((promotion) => promotion.id !== id)
  })),
  
  toggleStatus: (id) => set((state) => ({
    promotions: state.promotions.map((promotion) => 
      promotion.id === id 
        ? { ...promotion, status: promotion.status === 'ACTIVE' ? 'SCHEDULED' : 'ACTIVE' } 
        : promotion
    )
  })),
  
  setPromotions: (promotions) => set({ promotions }),
}))
