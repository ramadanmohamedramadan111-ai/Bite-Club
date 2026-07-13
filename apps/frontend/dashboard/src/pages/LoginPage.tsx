import { useState, type FormEvent } from 'react'
import { ArrowRight, Eye, EyeOff, Lock, Mail, Moon, Sparkles, SunMedium } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SignJWT } from 'jose'
import toast from 'react-hot-toast'
import { loginSchema, type LoginFormValues } from '../lib/validation'
import { useAuthStore } from '../store/authStore'

interface LoginPageProps {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  language: 'en' | 'ar'
  toggleLanguage: () => void
}

export function LoginPage({ theme, toggleTheme, language, toggleLanguage }: LoginPageProps) {
  const { t, i18n } = useTranslation()
  const login = useAuthStore((state) => state.login)
  const [email, setEmail] = useState('manager@biteclub.com')
  const [password, setPassword] = useState('welcome123')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormValues, string>>>({})

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      const emailError = fieldErrors.email?.[0] ? t(fieldErrors.email[0] as string) : undefined
      const passwordError = fieldErrors.password?.[0] ? t(fieldErrors.password[0] as string) : undefined

      setErrors({
        email: emailError,
        password: passwordError,
      })

      toast.error(emailError ?? passwordError ?? t('invalidInput'))
      return
    }

    setErrors({})

    const secret = new TextEncoder().encode('bite-club-demo-secret')
    const token = await new SignJWT({ email, role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(secret)

    login(token)
    toast.success(t('success'))
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 px-4 py-10 transition-colors duration-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="mx-auto flex max-w-md flex-col gap-4">
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
        <div className="grid gap-5 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-200/40">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{t('brandTitle')}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{t('brandSubtitle')}</p>
          </div>
        </div>

        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">{t('emailOrMobile')}</label>
            <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-600 shadow-sm focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Mail size={18} />
              <input
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="manager@biteclub.com"
              />
            </div>
            {errors.email ? <p className="text-sm text-red-600">{errors.email}</p> : null}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('password')}</label>
              <a href="#" className="text-sm font-medium text-orange-600 hover:text-orange-700">
                {t('forgot')}
              </a>
            </div>
            <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-600 shadow-sm focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100">
              <Lock size={18} />
              <input
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
              />
              <button type="button" className="text-slate-500 transition hover:text-slate-700" onClick={() => setShowPassword((value) => !value)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password ? <p className="text-sm text-red-600">{errors.password}</p> : null}
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500" />
              {t('remember')}
            </label>
          </div>

          <button className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:shadow-orange-500/30">
            {t('submit')} <ArrowRight size={18} />
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
