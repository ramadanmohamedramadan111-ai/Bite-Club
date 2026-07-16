import { useState, useEffect } from 'react'
import { useLocale } from '../contexts/LocaleContext'
import { PageHeader } from '../components/PageHeader'
import api from '../lib/api'

export function GeneralSettingsPage() {
  const { t } = useLocale()
  const [commissionRate, setCommissionRate] = useState<number | string>('')
  const [serviceFeeAmount, setServiceFeeAmount] = useState<number | string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Fetch settings from API
  const fetchSettings = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/admin/general-settings/1')
      const data = response.data?.data
      if (data) {
        setCommissionRate(data.commission_rate)
        setServiceFeeAmount(data.service_fee_amount)
      }
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to fetch settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  // Handle settings update
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccessMessage('')
    try {
      const response = await api.put('/admin/general-settings/1', {
        commission_rate: Number(commissionRate),
        service_fee_amount: Number(serviceFeeAmount),
      })
      const data = response.data?.data
      if (data) {
        setCommissionRate(data.commission_rate)
        setServiceFeeAmount(data.service_fee_amount)
      }
      setSuccessMessage(t('generalSettings.success') || 'Settings saved successfully')
    } catch (err: any) {
      console.error(err)
      const validationErrors = err.response?.data?.errors
      if (validationErrors) {
        const messages = Object.values(validationErrors).flat().join(', ')
        setError(messages)
      } else {
        setError(err.response?.data?.message || 'Failed to update settings')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-content">
      <PageHeader title={t('generalSettings.title')} subtitle={t('generalSettings.subtitle')} />

      {error && (
        <div
          style={{
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: '500',
            marginBottom: '16px',
          }}
        >
          {error}
        </div>
      )}

      {successMessage && (
        <div
          style={{
            background: 'var(--success-bg)',
            border: '1px solid var(--success)',
            color: 'var(--success)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: '500',
            marginBottom: '16px',
          }}
        >
          {successMessage}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <span className="card-title">{t('generalSettings.title')}</span>
        </div>
        
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading settings...
          </div>
        ) : (
          <form onSubmit={handleSave} className="settings-form" style={{ padding: '20px' }}>
            <div className="form-grid two-col">
              <div className="form-group">
                <label className="form-label">{t('generalSettings.commissionRate')}</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  disabled={saving}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('generalSettings.serviceFeeAmount')}</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={serviceFeeAmount}
                  onChange={(e) => setServiceFeeAmount(e.target.value)}
                  disabled={saving}
                  required
                />
              </div>
            </div>

            <div className="modal-actions" style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '20px', paddingTop: '20px' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : t('generalSettings.saveSettings')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
