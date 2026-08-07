import { useTranslation } from 'react-i18next'
import { AlertCircle, Trash2 } from 'lucide-react'

interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  itemName: string
  description?: string
  error?: string | null
}

export function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  description,
  error
}: DeleteModalProps) {
  const { t } = useTranslation()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <Trash2 size={28} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {title || t('deleteItem', 'Delete Item')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {description || t('deleteItemConfirm', 'Are you sure you want to delete')} "{itemName}"?
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 mb-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p className="whitespace-pre-line">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {t('cancel', 'Cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition"
          >
            {t('delete', 'Delete')}
          </button>
        </div>
      </div>
    </div>
  )
}
