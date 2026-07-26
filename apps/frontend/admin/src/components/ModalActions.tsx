interface ModalActionsProps {
  onCancel: () => void
  onSave?: () => void
  saving?: boolean
  cancelLabel?: string
  saveLabel?: string
  saveVariant?: 'primary' | 'danger' | 'success'
  saveDisabled?: boolean
}

export function ModalActions({
  onCancel,
  onSave,
  saving,
  cancelLabel = 'Cancel',
  saveLabel = 'Save',
  saveVariant = 'primary',
  saveDisabled,
}: ModalActionsProps) {
  return (
    <div className="modal-actions">
      <button type="button" className="btn btn-outline" onClick={onCancel} disabled={saving}>
        {cancelLabel}
      </button>
      {onSave && (
        <button
          type="button"
          className={`btn btn-${saveVariant}`}
          onClick={onSave}
          disabled={saving || saveDisabled}
        >
          {saving ? 'Saving...' : saveLabel}
        </button>
      )}
    </div>
  )
}
