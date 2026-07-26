import { useState } from 'react'
import { useLocale } from '../contexts/LocaleContext'
import { useTheme } from '../contexts/ThemeContext'
import { I } from '../config/navigation'
import api from '../lib/api'
import { setAuthToken, setAuthUser } from '../lib/cookies'

interface LoginPageProps {
  onLogin: () => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const { t, locale, setLocale, dir } = useLocale()
  const { theme, toggleTheme } = useTheme()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [generalError, setGeneralError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    let isValid = true

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setEmailError(t('common.email') + ' is required')
      isValid = false
    } else if (!emailRegex.test(email)) {
      setEmailError(t('login.errorInvalid'))
      isValid = false
    } else {
      setEmailError('')
    }

    // Password validation
    if (!password) {
      setPasswordError(t('login.passwordLabel') + ' is required')
      isValid = false
    } else if (password.length < 8) {
      setPasswordError(t('login.errorPasswordLength'))
      isValid = false
    } else {
      setPasswordError('')
    }

    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError('')

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const response = await api.post('/admin/login', { email, password })
      const { access_token, user } = response.data.data
      setAuthToken(access_token)
      if (user) {
        setAuthUser(user)
      }
      setIsLoading(false)
      onLogin()
    } catch (error: any) {
      setIsLoading(false)
      const message = error.response?.data?.message || t('login.errorInvalidCredentials')
      setGeneralError(message)
    }
  }

  return (
    <div className={`login-page-container ${dir === 'rtl' ? 'rtl' : ''}`}>
      {/* Background image & overlay */}
      <div className="login-bg-image" />
      <div className="login-bg-overlay" />

      {/* Main card container */}
      <div className="login-content-box">
        <h1 className="login-brand-logo">BiteClub</h1>
        
        <div className="login-card">
          <div className="login-card-header">
            <h2 className="login-card-title">{t('login.title')}</h2>
            <p className="login-card-subtitle">{t('login.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form-element">
            {generalError && (
              <div className="login-error-banner">
                {generalError}
              </div>
            )}

            <div className="login-form-group">
              <label className="login-form-label" htmlFor="login-email">
                {t('login.emailLabel')}
              </label>
              <input
                id="login-email"
                type="email"
                className={`login-form-input ${emailError ? 'input-error' : ''}`}
                placeholder={t('login.emailPlaceholder')}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (emailError) setEmailError('')
                }}
                disabled={isLoading}
                autoComplete="email"
              />
              {emailError && <span className="login-field-error">{emailError}</span>}
            </div>

            <div className="login-form-group">
              <label className="login-form-label" htmlFor="login-password">
                {t('login.passwordLabel')}
              </label>
              <input
                id="login-password"
                type="password"
                className={`login-form-input ${passwordError ? 'input-error' : ''}`}
                placeholder={t('login.passwordPlaceholder')}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (passwordError) setPasswordError('')
                }}
                disabled={isLoading}
                autoComplete="current-password"
              />
              {passwordError && <span className="login-field-error">{passwordError}</span>}
            </div>

            <button type="submit" className="login-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <div className="login-btn-spinner-container">
                  <span className="login-spinner"></span>
                  <span>{t('login.loading')}</span>
                </div>
              ) : (
                t('login.button')
              )}
            </button>
          </form>
        </div>

        {/* Language and theme selectors */}
        <div className="login-selectors">
          <button className="login-selector-btn" onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')} title="Toggle language">
            {locale === 'en' ? 'AR' : 'EN'}
          </button>
          <button className="login-selector-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
            {theme === 'dark' ? I.sun : I.moon}
          </button>
        </div>
      </div>
    </div>
  )
}
