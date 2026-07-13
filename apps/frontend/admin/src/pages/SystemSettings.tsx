import { useLocale } from '../contexts/LocaleContext'
import { PageHeader } from '../components/PageHeader'

export function SystemSettingsPage() {
  const { t } = useLocale()

  return (
    <div className="page-content">
      <PageHeader title={t('systemSettings.title')} subtitle={t('systemSettings.subtitle')} />

      <div className="card">
        <div className="card-header">
          <span className="card-title">{t('systemSettings.sections.general')}</span>
        </div>
        <div className="settings-form">
          <div className="form-grid two-col">
            <div className="form-group">
              <label className="form-label">{t('systemSettings.fields.siteName')}</label>
              <input className="form-input" defaultValue="Bite-Club" />
            </div>
            <div className="form-group">
              <label className="form-label">{t('systemSettings.fields.supportEmail')}</label>
              <input className="form-input" defaultValue="support@biteclub.com" />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">{t('systemSettings.fields.siteDescription')}</label>
              <textarea className="form-input form-textarea" defaultValue="Food delivery platform" rows={3} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('systemSettings.fields.supportPhone')}</label>
              <input className="form-input" defaultValue="+201234567890" />
            </div>
            <div className="form-group">
              <label className="form-label">{t('systemSettings.fields.language')}</label>
              <select className="form-input" defaultValue="en">
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('systemSettings.fields.timezone')}</label>
              <select className="form-input" defaultValue="Africa/Cairo">
                <option value="Africa/Cairo">Africa/Cairo (UTC+2)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New York</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('systemSettings.fields.currency')}</label>
              <select className="form-input" defaultValue="USD">
                <option value="USD">USD ($)</option>
                <option value="EGP">EGP (E£)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          <div className="modal-actions" style={{ padding: '20px', borderTop: '1px solid var(--border-subtle)', marginTop: '20px' }}>
            <button className="btn btn-primary" onClick={() => {}}>{t('systemSettings.saveSettings')}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
