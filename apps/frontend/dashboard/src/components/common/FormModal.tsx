import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  onSave: () => void
  saveDisabled?: boolean
  children: ReactNode
}

export function FormModal({ 
  isOpen, 
  onClose, 
  title, 
  onSave, 
  saveDisabled = false,
  children 
}: FormModalProps) {
  const { t } = useTranslation()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <button 
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="flex flex-col gap-4">
          {children}
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {t('cancel', 'Cancel')}
          </button>
          <button
            onClick={onSave}
            disabled={saveDisabled}
            className="flex-1 rounded-xl bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('save', 'Save')}
          </button>
        </div>
      </div>
    </div>
  )
}
