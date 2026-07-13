import { useState } from 'react'
import { useLocale } from '../contexts/LocaleContext'
import { PageHeader } from '../components/PageHeader'

export function ChangePasswordPage() {
  const { t } = useLocale()
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSave = () => {
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="page-content">
      <PageHeader title={t('changePassword.title')} subtitle={t('changePassword.subtitle')} />

      {showSuccess && (
        <div className="alert alert-success">
          <span>✅</span>
          <span>{t('changePassword.passwordChanged')}</span>
        </div>
      )}

      <div className="card" style={{ maxWidth: '500px' }}>
        <div className="card-header">
          <span className="card-title">{t('changePassword.title')}</span>
        </div>
        <div className="settings-form">
          <div className="form-group">
            <label className="form-label">{t('changePassword.fields.currentPassword')}</label>
            <input className="form-input" type="password" placeholder="Enter current password" />
          </div>
          <div className="form-group">
            <label className="form-label">{t('changePassword.fields.newPassword')}</label>
            <input className="form-input" type="password" placeholder="Enter new password" />
          </div>
          <div className="form-group">
            <label className="form-label">{t('changePassword.fields.confirmPassword')}</label>
            <input className="form-input" type="password" placeholder="Confirm new password" />
          </div>

          <div className="password-requirements">
            <p className="requirements-title">Password requirements:</p>
            <ul>
              <li>{t('changePassword.requirements.minLength')}</li>
              <li>{t('changePassword.requirements.uppercase')}</li>
              <li>{t('changePassword.requirements.lowercase')}</li>
              <li>{t('changePassword.requirements.number')}</li>
              <li>{t('changePassword.requirements.special')}</li>
            </ul>
          </div>

          <div className="modal-actions" style={{ padding: '16px 0 0' }}>
            <button className="btn btn-primary" onClick={handleSave}>{t('changePassword.savePassword')}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
