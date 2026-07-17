import { useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, Moon, SunMedium } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { loginSchema, type LoginFormValues } from '../../lib/validation'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../lib/authService'
import Logo from '../../assets/images/logo.svg'

interface LoginPageProps {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  language: 'en' | 'ar'
  toggleLanguage: () => void
  onForgotPassword: () => void
}

export function LoginPage({ theme, toggleTheme, language, toggleLanguage, onForgotPassword }: LoginPageProps) {
  const { t, i18n } = useTranslation()
  const login = useAuthStore((state) => state.login)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormValues, string>>>({})

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      setErrors({
        email: fieldErrors.email?.[0] ? t(fieldErrors.email[0]) : undefined,
        password: fieldErrors.password?.[0] ? t(fieldErrors.password[0]) : undefined,
      })
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      const response = await authService.login(email, password)
      login(response.data.access_token, response.data.restaurant)
      toast.success(t('success'))
    } catch (error) {
      const message = error instanceof Error ? error.message : t('loginError')
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
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{t('brandTitle')}</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{t('brandSubtitle')}</p>
            </div>
          </div>

          <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">{t('emailOrMobile')}</label>
              <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 dark:border-slate-700 dark:bg-slate-800">
                <Mail size={18} className="shrink-0 text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@biteclub.com"
                  autoComplete="email"
                  required
                />
              </div>
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('password')}</label>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-sm font-medium text-orange-600 hover:text-orange-700"
                >
                  {t('forgot')}
                </button>
              </div>
              <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 dark:border-slate-700 dark:bg-slate-800">
                <Lock size={18} className="shrink-0 text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
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

            {/* Remember me */}
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 accent-orange-500" />
                {t('remember')}
              </label>
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
                  {t('submit')}
                  {language === 'ar' ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm leading-6 text-slate-500 dark:text-slate-400">{t('loginNote')}</p>

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
