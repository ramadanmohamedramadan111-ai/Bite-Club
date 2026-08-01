import { useState, useEffect, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, Moon, SunMedium, Phone, MapPin, Utensils, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { authService } from '../../lib/authService'
import type { Category } from '../../types/auth'
import Logo from '../../assets/images/logo.svg'

interface RegisterPageProps {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  language: 'en' | 'ar'
  toggleLanguage: () => void
  onBackToLogin: () => void
}

export function RegisterPage({ theme, toggleTheme, language, toggleLanguage, onBackToLogin }: RegisterPageProps) {
  const { t, i18n } = useTranslation()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone_number: '',
    address: '',
    category_id: '',
    description: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await authService.getCategories()
        if (response.success) {
          setCategories(response.data.items)
        }
      } catch (error) {
        toast.error(t('errorLoadingCategories'))
      } finally {
        setIsLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [t])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // Basic validation
    const newErrors: Record<string, string> = {}

    if (!formData.name) newErrors.name = t('nameRequired')
    if (!formData.email) newErrors.email = t('emailRequired')
    if (!formData.password) newErrors.password = t('passwordRequired')
    if (!formData.password_confirmation) newErrors.password_confirmation = t('confirmPasswordRequired')
    if (formData.password !== formData.password_confirmation) newErrors.password_confirmation = t('passwordsNotMatch')
    if (!formData.phone_number) newErrors.phone_number = t('phoneRequired')
    if (!formData.address) newErrors.address = t('addressRequired')
    if (!formData.category_id) newErrors.category_id = t('categoryRequired')
    if (!formData.description) newErrors.description = t('descriptionRequired')

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        phone_number: formData.phone_number,
        address: formData.address,
        category_id: parseInt(formData.category_id),
        description: formData.description,
      })

      if (response.success) {
        toast.success(t('registrationSuccess'))
        onBackToLogin()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t('registrationError')
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 px-4 py-10 transition-colors duration-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="mx-auto flex max-w-2xl flex-col gap-4">

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
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{t('registerTitle')}</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{t('registerSubtitle')}</p>
            </div>
          </div>

          <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
            {/* Row 1: Restaurant Name + Email */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">{t('restaurantName')}</label>
                <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 dark:border-slate-700 dark:bg-slate-800">
                  <Utensils size={18} className="shrink-0 text-slate-400" />
                  <input
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('restaurantNamePlaceholder')}
                    required
                  />
                </div>
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">{t('email')}</label>
                <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 dark:border-slate-700 dark:bg-slate-800">
                  <Mail size={18} className="shrink-0 text-slate-400" />
                  <input
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="manager@biteclub.com"
                    autoComplete="email"
                    required
                  />
                </div>
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
            </div>

            {/* Row 2: Phone Number + Address */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">{t('registerPhoneNumber')}</label>
                <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 dark:border-slate-700 dark:bg-slate-800">
                  <Phone size={18} className="shrink-0 text-slate-400" />
                  <input
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="01076000600"
                    required
                  />
                </div>
                {errors.phone_number && <p className="text-sm text-red-500">{errors.phone_number}</p>}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">{t('registerAddress')}</label>
                <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 dark:border-slate-700 dark:bg-slate-800">
                  <MapPin size={18} className="shrink-0 text-slate-400" />
                  <input
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Test Street"
                    required
                  />
                </div>
                {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
              </div>
            </div>

            {/* Row 3: Category + Description */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">{t('registerCategory')}</label>
                <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 dark:border-slate-700 dark:bg-slate-800">
                  <Utensils size={18} className="shrink-0 text-slate-400" />
                  <select
                    className="w-full bg-transparent text-sm text-slate-900 outline-none dark:text-slate-100"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    required
                    disabled={isLoadingCategories}
                  >
                    <option value="">{t('registerSelectCategory')}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.category_id && <p className="text-sm text-red-500">{errors.category_id}</p>}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">{t('registerDescription')}</label>
                <div className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 dark:border-slate-700 dark:bg-slate-800">
                  <FileText size={18} className="shrink-0 text-slate-400 mt-0.5" />
                  <textarea
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 resize-none"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder={t('descriptionPlaceholder')}
                    rows={1}
                    required
                  />
                </div>
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>
            </div>

            {/* Row 4: Password + Confirm Password */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">{t('password')}</label>
                <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 dark:border-slate-700 dark:bg-slate-800">
                  <Lock size={18} className="shrink-0 text-slate-400" />
                  <input
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
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

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">{t('confirmPassword')}</label>
                <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 dark:border-slate-700 dark:bg-slate-800">
                  <Lock size={18} className="shrink-0 text-slate-400" />
                  <input
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="text-slate-400 transition hover:text-slate-600"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password_confirmation && <p className="text-sm text-red-500">{errors.password_confirmation}</p>}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || isLoadingCategories}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:shadow-orange-500/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  {t('register')}
                  {language === 'ar' ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                </>
              )}
            </button>
          </form>

          <button
            type="button"
            onClick={onBackToLogin}
            className="mt-8 w-full text-center text-sm font-medium text-slate-500 hover:text-orange-600 dark:text-slate-400"
          >
            {t('backToLogin')}
          </button>

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