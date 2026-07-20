import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState } from 'react'
import {
  Store, Briefcase, Clock, Bell, Upload, CheckCircle, MapPin, Truck, Percent,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { LocationMap } from '../../components/common/LocationMap'
import { restaurantService, type RestaurantProfile, type OpeningHour } from '../../lib/restaurantService'

// day_of_week: 0=Sunday, 1=Monday ... 6=Saturday
const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

const DEFAULT_HOURS: OpeningHour[] = DAY_KEYS.map((_, i) => ({
  day_of_week: i,
  opens_at: '09:00',
  closes_at: '22:00',
  is_closed: false,
}))


export function SettingsPage() {
  const { t } = useTranslation()

  // ── Business profile state ────────────────────────────────────────────
  const [profile, setProfile]       = useState<RestaurantProfile | null>(null)
  const [isLoading, setIsLoading]   = useState(false)
  const [isSaving, setIsSaving]     = useState(false)
  const [logoFile, setLogoFile]     = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // local editable fields
  const [name, setName]             = useState('')
  const [description, setDescription] = useState('')
  const [phone, setPhone]           = useState('')
  const [address, setAddress]       = useState('')

  useEffect(() => {
    setIsLoading(true)
    restaurantService.getProfile()
      .then((data) => {
        setProfile(data)
        setName(data.name)
        setDescription(data.description ?? '')
        setPhone(data.phone_number)
        setAddress(data.address)
      })
      .catch(() => toast.error(t('errorOccurred')))
      .finally(() => setIsLoading(false))
  }, [])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setLogoFile(file)
    if (file) setLogoPreview(URL.createObjectURL(file))
  }

  const handleDiscard = () => {
    if (!profile) return
    setName(profile.name)
    setDescription(profile.description ?? '')
    setPhone(profile.phone_number)
    setAddress(profile.address)
    setLogoFile(null)
    setLogoPreview(null)
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const updated = await restaurantService.updateProfile({
        name,
        description,
        phone_number: phone,
        address,
        logo: logoFile,
      })
      setProfile(updated)
      setLogoFile(null)
      setLogoPreview(null)
      toast.success(t('saveChanges') + ' ✓')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('errorOccurred'))
    } finally {
      setIsSaving(false)
    }
  }

  // ── Working hours state ───────────────────────────────────────────────
  const [hours, setHours]             = useState<OpeningHour[]>(DEFAULT_HOURS)
  const [hoursLoading, setHoursLoading] = useState(false)
  const [hoursSaving, setHoursSaving] = useState(false)

  useEffect(() => {
    setHoursLoading(true)
    restaurantService.getOpeningHours()
      .then((data) => {
        // API may return only the days that have been set; fill gaps with defaults
        const filled = DAY_KEYS.map((_, i) => {
          const found = data.find((h) => h.day_of_week === i)
          return found ?? { day_of_week: i, opens_at: '09:00', closes_at: '22:00', is_closed: false }
        })
        setHours(filled)
      })
      .catch(() => toast.error(t('errorOccurred')))
      .finally(() => setHoursLoading(false))
  }, [])

  const updateHour = (day: number, patch: Partial<OpeningHour>) => {
    setHours((prev) => prev.map((h) => h.day_of_week === day ? { ...h, ...patch } : h))
  }

  const handleSaveHours = async () => {
    setHoursSaving(true)
    try {
      const updated = await restaurantService.updateOpeningHours(hours)
      const filled = DAY_KEYS.map((_, i) => {
        const found = updated.find((h) => h.day_of_week === i)
        return found ?? { day_of_week: i, opens_at: '09:00', closes_at: '22:00', is_closed: false }
      })
      setHours(filled)
      toast.success(t('hoursSaved'))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('errorOccurred'))
    } finally {
      setHoursSaving(false)
    }
  }

  // ── Restaurant settings (delivery, deposit, location) ───────────────
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsSaving, setSettingsSaving]   = useState(false)

  // editable settings fields
  const [isOpen, setIsOpen]                   = useState(true)
  const [acceptOrders, setAcceptOrders]       = useState(true)
  const [deliveryEnabled, setDeliveryEnabled] = useState(true)
  const [pickupEnabled, setPickupEnabled]     = useState(true)
  const [deliveryRadius, setDeliveryRadius]   = useState('')
  const [deliveryFee, setDeliveryFee]         = useState('')
  const [depositThreshold, setDepositThreshold] = useState('')
  const [depositPercentage, setDepositPercentage] = useState('')
  const [lat, setLat]                         = useState(30.0444)
  const [lng, setLng]                         = useState(31.2357)

  useEffect(() => {
    setSettingsLoading(true)
    restaurantService.getSettings()
      .then((data) => {
        setIsOpen(data.is_open)
        setAcceptOrders(data.accept_orders)
        setDeliveryEnabled(data.delivery_enabled)
        setPickupEnabled(data.pickup_enabled)
        setDeliveryRadius(data.delivery_radius)
        setDeliveryFee(data.delivery_fee_per_km)
        setDepositThreshold(data.deposit_threshold)
        setDepositPercentage(data.deposit_percentage)
        setLat(parseFloat(data.latitude))
        setLng(parseFloat(data.longitude))
      })
      .catch(() => toast.error(t('errorOccurred')))
      .finally(() => setSettingsLoading(false))
  }, [])

  const handleSaveSettings = async () => {
    setSettingsSaving(true)
    try {
      await restaurantService.updateSettings({
        is_open: isOpen,
        accept_orders: acceptOrders,
        delivery_enabled: deliveryEnabled,
        pickup_enabled: pickupEnabled,
        delivery_radius: deliveryRadius,
        delivery_fee_per_km: deliveryFee,
        deposit_threshold: depositThreshold,
        deposit_percentage: depositPercentage,
        latitude: String(lat),
        longitude: String(lng),
      })
      toast.success(t('settingsSaved'))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('errorOccurred'))
    } finally {
      setSettingsSaving(false)
    }
  }

  // ── Notification state ────────────────────────────────────────────────
  const [notifications, setNotifications] = useState({
    email: true, desktop: true, sms: false,
  })

  const inputCls = 'rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-orange transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'

  return (
    <div className="flex flex-col gap-6 mx-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('restaurantSettings')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            {t('settingsSubtitle')}
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {/* ── Business Profile ── */}
        <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-50 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Store className="text-brand-orange h-5 w-5" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                {t('businessProfile')}
              </h2>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-start">
              <button
                onClick={handleDiscard}
                disabled={isSaving}
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 disabled:opacity-50"
              >
                {t('discard')}
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving || isLoading}
                className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-brand-orange text-sm font-semibold text-white hover:opacity-90 transition shadow-sm disabled:opacity-50"
              >
                {isSaving
                  ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  : <CheckCircle size={15} />
                }
                {t('saveChanges')}
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <span className="h-7 w-7 animate-spin rounded-full border-4 border-brand-orange border-t-transparent" />
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {/* Logo */}
              <div className="flex flex-col items-center gap-3 shrink-0">
                <div className="relative h-28 w-28 rounded-2xl bg-orange-50 dark:bg-slate-800 border-2 border-dashed border-brand-orange/30 overflow-hidden flex items-center justify-center">
                  {logoPreview || profile?.logo_url ? (
                    <img
                      src={logoPreview ?? profile?.logo_url ?? ''}
                      alt="logo"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Store size={32} className="text-brand-orange/40" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="text-xs font-bold text-brand-orange hover:underline uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Upload size={12} /> {t('changeLogo')}
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                {logoFile && (
                  <p className="text-[10px] text-gray-400 max-w-[7rem] truncate text-center">{logoFile.name}</p>
                )}
              </div>

              {/* Fields */}
              <div className="flex-1 grid gap-4 w-full">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                      {t('restaurantNameInput')}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                      {t('phoneNumber')}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                    {t('address')}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={inputCls}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                    {t('shortDescriptionInput')}
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`${inputCls} resize-none`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Deposit & Delivery ── */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-50 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Briefcase className="text-brand-orange h-5 w-5" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white">{t('depositDelivery')}</h2>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-start">
              <button
                onClick={handleSaveSettings}
                disabled={settingsSaving || settingsLoading}
                className="flex items-center gap-1.5 rounded-xl bg-brand-orange px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
              >
                {settingsSaving
                  ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  : <CheckCircle size={12} />}
                {t('save')}
              </button>
            </div>
          </div>

          {settingsLoading ? (
            <div className="flex justify-center py-6">
              <span className="h-6 w-6 animate-spin rounded-full border-4 border-brand-orange border-t-transparent" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Toggles */}
              {([
                { label: t('isOpen'),          value: isOpen,          set: setIsOpen          },
                { label: t('acceptOrders'),     value: acceptOrders,    set: setAcceptOrders    },
                { label: t('deliveryEnabled'),  value: deliveryEnabled, set: setDeliveryEnabled },
                { label: t('pickupEnabled'),    value: pickupEnabled,   set: setPickupEnabled   },
              ] as const).map(({ label, value, set }) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-gray-700 dark:text-slate-200">{label}</span>
                  <button
                    dir="ltr"
                    onClick={() => set(!value)}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${value ? 'bg-brand-orange' : 'bg-gray-200 dark:bg-slate-700'}`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}

              <div className="border-t border-gray-50 dark:border-slate-800 pt-3 grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">{t('deliveryRadius')} (km)</label>
                  <input type="number" min="0" step="0.5" value={deliveryRadius} onChange={(e) => setDeliveryRadius(e.target.value)} className={inputCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">{t('deliveryFeePerKm')} (EGP)</label>
                  <input type="number" min="0" step="0.5" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} className={inputCls} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Tax / Deposit ── */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-50 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Percent className="text-brand-orange h-5 w-5" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white">{t('taxDeposit')}</h2>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-start">
              <button
                onClick={handleSaveSettings}
                disabled={settingsSaving || settingsLoading}
                className="flex items-center gap-1.5 rounded-xl bg-brand-orange px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
              >
                {settingsSaving
                  ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  : <CheckCircle size={12} />}
                {t('save')}
              </button>
            </div>
          </div>

          {settingsLoading ? (
            <div className="flex justify-center py-6">
              <span className="h-6 w-6 animate-spin rounded-full border-4 border-brand-orange border-t-transparent" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">{t('depositThreshold')} (EGP)</label>
                  <input type="number" min="0" step="1" value={depositThreshold} onChange={(e) => setDepositThreshold(e.target.value)} className={inputCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">{t('depositPercentage')} (%)</label>
                  <input type="number" min="0" max="100" step="1" value={depositPercentage} onChange={(e) => setDepositPercentage(e.target.value)} className={inputCls} />
                </div>
              </div>
              <p className="text-xs text-gray-400 dark:text-slate-500">
                {t('taxDepositDesc')}
              </p>
            </div>
          )}
        </div>

        {/* ── Location Map ── */}
        <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col gap-5">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-50 dark:border-slate-800">
            <MapPin className="text-brand-orange h-5 w-5" />
            <h2 className="text-base font-bold text-gray-900 dark:text-white">{t('restaurantLocation')}</h2>
          </div>

          {settingsLoading ? (
            <div className="flex justify-center py-10">
              <span className="h-7 w-7 animate-spin rounded-full border-4 border-brand-orange border-t-transparent" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-gray-500 dark:text-slate-400">{t('locationHint')}</p>

              {/* Map */}
              <div className="h-64 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 z-0">
                <LocationMap lat={lat} lng={lng} onChange={(newLat, newLng) => { setLat(newLat); setLng(newLng) }} />
              </div>

              {/* Coordinate inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">{t('latitude')}</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={lat}
                    onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                    className={inputCls}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">{t('longitude')}</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={lng}
                    onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <Truck size={14} className="text-brand-orange shrink-0" />
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {t('deliveryRadiusNote', { radius: deliveryRadius })}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-start sm:ms-auto">
                  <button
                    onClick={handleSaveSettings}
                    disabled={settingsSaving}
                    className="flex items-center gap-1.5 rounded-xl bg-brand-orange px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
                  >
                    {settingsSaving
                      ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      : <CheckCircle size={12} />}
                    {t('saveLocation')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Working Hours (real API) ── */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-50 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="text-brand-orange h-5 w-5" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white">{t('workingHours')}</h2>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-start">
              <button
                onClick={handleSaveHours}
                disabled={hoursSaving || hoursLoading}
                className="flex items-center gap-1.5 rounded-xl bg-brand-orange px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
              >
                {hoursSaving
                  ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  : <CheckCircle size={12} />
                }
                {t('save')}
              </button>
            </div>
          </div>

          {hoursLoading ? (
            <div className="flex justify-center py-6">
              <span className="h-6 w-6 animate-spin rounded-full border-4 border-brand-orange border-t-transparent" />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {hours.map((hour) => (
                <div key={hour.day_of_week} className="flex items-center gap-3 py-1.5 border-b border-gray-50 dark:border-slate-800/40 last:border-0">
                  {/* Day name */}
                  <span className="text-sm font-semibold text-gray-700 dark:text-slate-200 w-24 shrink-0">
                    {t(DAY_KEYS[hour.day_of_week])}
                  </span>

                  {/* Time inputs or closed label */}
                  {hour.is_closed ? (
                    <span className="flex-1 text-xs text-gray-400">{t('closed')}</span>
                  ) : (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={hour.opens_at ?? '09:00'}
                        onChange={(e) => updateHour(hour.day_of_week, { opens_at: e.target.value })}
                        className="w-24 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:border-brand-orange focus:outline-none"
                      />
                      <span className="text-gray-400 text-xs">–</span>
                      <input
                        type="time"
                        value={hour.closes_at ?? '22:00'}
                        onChange={(e) => updateHour(hour.day_of_week, { closes_at: e.target.value })}
                        className="w-24 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:border-brand-orange focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Open/closed toggle */}
                  <button
                    dir="ltr"
                    onClick={() => updateHour(hour.day_of_week, {
                      is_closed: !hour.is_closed,
                      opens_at: !hour.is_closed ? null : '09:00',
                      closes_at: !hour.is_closed ? null : '22:00',
                    })}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${!hour.is_closed ? 'bg-brand-orange' : 'bg-gray-200 dark:bg-slate-700'}`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${!hour.is_closed ? 'translate-x-4' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      

      </div>
    </div>
  )
}
