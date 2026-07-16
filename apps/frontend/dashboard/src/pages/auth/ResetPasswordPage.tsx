import { useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, Lock, Moon, SunMedium } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { resetPasswordSchema } from '../../lib/validation'
import { authService } from '../../lib/authService'
import Logo from '../../assets/images/logo.svg'

interface ResetPasswordPageProps {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  language: 'en' | 'ar'
  toggleLanguage: () => void
  email: string
  onBack: () => void
  onSuccess: () => void
}

export function ResetPasswordPage({
  theme,
  toggleTheme,
  language,
  toggleLanguage,
  email,
  onBack,
  onSuccess,
}: ResetPasswordPageProps) {
  const { t, i18n } = useTranslation()

  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const result = resetPasswordSchema.safeParse({
      email,
      token,
      password,
      password_confirmation: passwordConfirmation,
    })

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      setErrors({
        token: fieldErrors.token?.[0] ? t(fieldErrors.token[0]) : undefined,
        password: fieldErrors.password?.[0] ? t(fieldErrors.password[0]) : undefined,
        password_confirmation: fieldErrors.password_confirmation?.[0]
          ? t(fieldErrors.password_confirmation[0])
          : undefined,
      })
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      await authService.resetPassword(email, token, password, passwordConfirmation)
      toast.success(t('resetSuccess'))
      onSuccess()
    } catch (error) {
      const message = error instanceof Error ? error.message : t('resetError')
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 px-4 py-10 transition-colors duration-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="mx-auto flex max-w-md flex-col gap-4">

        {/* Top controls */}
        <div className="flex justify-end gap-2">
          <button
            onClick={toggleLanguage}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-500 hover:text-orange-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            {language === 'en' ? 'AR' : 'EN'}
          </button>
          <button
            onClick={toggleTheme}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-500 hover:text-orange-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            {theme === 'dark' ? <SunMedium size={16} /> : <Moon size={16} />}
          </button>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white px-8 py-10 shadow-panel dark:border-slate-700 dark:bg-slate-900">
          {/* Header */}
          <div className="grid gap-5 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-200/40">
              <img src={Logo} alt="logo" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{t('resetPassword')}</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{t('resetPasswordSubtitle')}</p>
            </div>
          </div>

          <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
            {/* Reset token */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">{t('resetToken')}</label>
              <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 dark:border-slate-700 dark:bg-slate-800">
                <KeyRound size={18} className="shrink-0 text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder={t('resetTokenPlaceholder')}
                  required
                />
              </div>
              {errors.token && <p className="text-sm text-red-500">{errors.token}</p>}
            </div>

            {/* New password */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">{t('newPassword')}</label>
              <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 dark:border-slate-700 dark:bg-slate-800">
                <Lock size={18} className="shrink-0 text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="text-slate-400 transition hover:text-slate-600"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">{t('confirmPassword')}</label>
              <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 dark:border-slate-700 dark:bg-slate-800">
                <Lock size={18} className="shrink-0 text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                  type={showConfirm ? 'text' : 'password'}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="text-slate-400 transition hover:text-slate-600"
                  onClick={() => setShowConfirm((v) => !v)}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="text-sm text-red-500">{errors.password_confirmation}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:shadow-orange-500/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  {t('resetPassword')}
                  {language === 'ar' ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                </>
              )}
            </button>

            {/* Back */}
            <button
              type="button"
              onClick={onBack}
              className="flex w-full items-center justify-center gap-2 text-sm font-medium text-slate-500 transition hover:text-orange-600 dark:text-slate-400"
            >
              {language === 'ar' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              {t('backToLogin')}
            </button>
          </form>

          <div className="mt-8 flex flex-wrap justify-center gap-4 text-center text-xs uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
            <span>© 2026 BITECLUB</span>
            <span>{t('support')}</span>
            <span>{t('privacy')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
