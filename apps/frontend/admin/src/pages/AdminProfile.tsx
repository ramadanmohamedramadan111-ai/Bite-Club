import { useLocale } from '../contexts/LocaleContext'
import { PageHeader } from '../components/PageHeader'

export function AdminProfilePage() {
  const { t } = useLocale()

  return (
    <div className="page-content">
      <PageHeader title={t('profile.title')} subtitle={t('profile.subtitle')} />

      <div className="card" style={{ maxWidth: '480px' }}>
        <div className="card-header">
          <span className="card-title">{t('profile.sections.personalInfo')}</span>
        </div>
        <div className="settings-form">
          <div className="form-group">
            <label className="form-label">{t('profile.fields.firstName')}</label>
            <input className="form-input" defaultValue="Admin" />
          </div>
          <div className="form-group">
            <label className="form-label">{t('profile.fields.lastName')}</label>
            <input className="form-input" defaultValue="User" />
          </div>
          <div className="form-group">
            <label className="form-label">{t('profile.fields.email')}</label>
            <input className="form-input" defaultValue="admin@biteclub.com" />
          </div>
          <div className="modal-actions" style={{ paddingTop: '20px' }}>
            <button className="btn btn-primary" onClick={() => {}}>{t('profile.saveProfile')}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
