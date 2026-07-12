import { useState } from 'react'
import { useLocale } from '../contexts/LocaleContext'
import { PageHeader } from '../components/PageHeader'
import { Tabs } from '../components/Tabs'

export function SystemSettingsPage() {
  const { t } = useLocale()
  const [activeSection, setActiveSection] = useState('general')

  return (
    <div className="page-content">
      <PageHeader title={t('systemSettings.title')} subtitle={t('systemSettings.subtitle')} />

      <Tabs
        tabs={[
          { id: 'general', label: t('systemSettings.sections.general') },
          { id: 'appearance', label: t('systemSettings.sections.appearance') },
          { id: 'notifications', label: t('systemSettings.sections.notifications') },
          { id: 'security', label: t('systemSettings.sections.security') },
          { id: 'features', label: t('systemSettings.sections.features') },
          { id: 'email', label: t('systemSettings.sections.email') },
          { id: 'payment', label: t('systemSettings.sections.payment') },
        ]}
        activeTab={activeSection}
        onChange={setActiveSection}
      />

      <div className="card">
        <div className="card-header">
          <span className="card-title">{t('systemSettings.sections.general')}</span>
        </div>
        <div className="settings-form">
          {activeSection === 'general' && (
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
          )}

          {activeSection === 'security' && (
            <div className="form-grid two-col">
              <div className="form-group">
                <div className="toggle-field">
                  <span>{t('systemSettings.fields.maintenanceMode')}</span>
                  <label className="toggle">
                    <input type="checkbox" />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>
              <div className="form-group">
                <div className="toggle-field">
                  <span>{t('systemSettings.fields.registrationEnabled')}</span>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>
              <div className="form-group">
                <div className="toggle-field">
                  <span>{t('systemSettings.fields.emailVerification')}</span>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{t('systemSettings.fields.maxFileSize')}</label>
                <input className="form-input" type="number" defaultValue="10" />
              </div>
            </div>
          )}

          {(activeSection === 'appearance' || activeSection === 'notifications' || activeSection === 'features' || activeSection === 'email' || activeSection === 'payment') && (
            <div className="form-grid two-col">
              <p style={{ gridColumn: '1 / -1', color: 'var(--text-secondary)' }}>
                {t('systemSettings.sections.' + activeSection)} — {t('settings.subtitle') || 'Configure settings'}
              </p>
              <div className="form-group">
                <label className="form-label">{activeSection === 'email' ? 'SMTP Host' : activeSection === 'payment' ? 'Stripe API Key' : 'Setting 1'}</label>
                <input className="form-input" placeholder="Enter value" />
              </div>
              <div className="form-group">
                <label className="form-label">{activeSection === 'email' ? 'SMTP Port' : activeSection === 'payment' ? 'PayPal Client ID' : 'Setting 2'}</label>
                <input className="form-input" placeholder="Enter value" />
              </div>
            </div>
          )}

          <div className="modal-actions" style={{ padding: '20px', borderTop: '1px solid var(--border-subtle)', marginTop: '20px' }}>
            <button className="btn btn-primary" onClick={() => {}}>{t('systemSettings.saveSettings')}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
