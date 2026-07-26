import { useState, useEffect } from 'react'
import { useLocale } from '../contexts/LocaleContext'
import { PageHeader } from '../components/PageHeader'
import { AlertBanner } from '../components/AlertBanner'
import { LoadingState } from '../components/LoadingState'
import api from '../lib/api'

export function AdminProfilePage() {
  const { t } = useLocale()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [generalError, setGeneralError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isFetching, setIsFetching] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let active = true
    const fetchProfile = async () => {
      try {
        setIsFetching(true)
        const response = await api.get('/admin/me')
        const adminData = response.data.data
        if (active) {
          setName(adminData.name || '')
          setEmail(adminData.email || '')
        }
      } catch (err: any) {
        if (active) {
          setGeneralError(err.response?.data?.message || 'Failed to fetch profile details.')
        }
      } finally {
        if (active) {
          setIsFetching(false)
        }
      }
    }
    fetchProfile()
    return () => {
      active = false
    }
  }, [])

  const validateForm = () => {
    let isValid = true
    if (!name.trim()) {
      setNameError((t('common.name') || 'Name') + ' is required')
      isValid = false
    } else {
      setNameError('')
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim()) {
      setEmailError((t('common.email') || 'Email') + ' is required')
      isValid = false
    } else if (!emailRegex.test(email)) {
      setEmailError(t('login.errorInvalid') || 'Invalid email format')
      isValid = false
    } else {
      setEmailError('')
    }

    return isValid
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError('')
    setSuccessMessage('')
    if (!validateForm()) return

    setIsSaving(true)
    try {
      const response = await api.patch('/admin/profile', {
        name: name.trim(),
        email: email.trim(),
      })
      const updatedAdmin = response.data.data
      setName(updatedAdmin.name || '')
      setEmail(updatedAdmin.email || '')
      setSuccessMessage(t('profile.success') || 'Profile updated successfully!')
    } catch (err: any) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const validationErrors = err.response.data.errors
        if (validationErrors.name) {
          setNameError(validationErrors.name.join(' '))
        }
        if (validationErrors.email) {
          setEmailError(validationErrors.email.join(' '))
        }
      } else {
        setGeneralError(err.response?.data?.message || 'Failed to update profile.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="page-content">
      <PageHeader title={t('profile.title')} subtitle={t('profile.subtitle')} />

      {generalError && <AlertBanner variant="danger" message={generalError} onClose={() => setGeneralError('')} />}
      {successMessage && <AlertBanner variant="success" message={successMessage} onClose={() => setSuccessMessage('')} />}

      <div className="card" style={{ maxWidth: '480px' }}>
        <div className="card-header">
          <span className="card-title">{t('profile.sections.personalInfo')}</span>
        </div>
        
        {isFetching ? (
          <LoadingState message={t('common.loading') || 'Loading...'} />
        ) : (
          <form onSubmit={handleSave} className="settings-form" style={{ padding: '20px' }}>
            <div className="form-group">
              <label className="form-label">{t('common.name')}</label>
              <input
                type="text"
                className={`form-input ${nameError ? 'input-error' : ''}`}
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (nameError) setNameError('')
                }}
                disabled={isSaving}
                required
              />
              {nameError && (
                <span className="field-error" style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  {nameError}
                </span>
              )}
            </div>

            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">{t('common.email')}</label>
              <input
                type="email"
                className={`form-input ${emailError ? 'input-error' : ''}`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (emailError) setEmailError('')
                }}
                disabled={isSaving}
                required
              />
              {emailError && (
                <span className="field-error" style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  {emailError}
                </span>
              )}
            </div>

            <div className="modal-actions" style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '20px', paddingTop: '20px' }}>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? (t('common.loading') || 'Saving...') : t('profile.saveProfile')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
