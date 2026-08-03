import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { getEcho } from '../lib/echo'
import { useAuthStore } from '../store/authStore'
import { useNotificationStore } from '../store/notificationStore'
import type { ApiNotification } from '../types/notifications'

type BroadcastNotification = ApiNotification['data'] & { id: string }

export function useNotificationSocket() {
  const restaurant = useAuthStore((state) => state.restaurant)
  const token = useAuthStore((state) => state.token)
  const receiveNotification = useNotificationStore((state) => state.receiveNotification)

  useEffect(() => {
    if (!restaurant || !token) return

    const echo = getEcho(token)
    const channelName = `App.Models.Restaurant.${restaurant.id}`
    const channel = echo.private(channelName)

    channel.notification((notification: BroadcastNotification) => {
      receiveNotification({
        id: notification.id,
        data: notification,
        read_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      toast(notification.body || notification.title, { icon: '🔔' })
    })

    return () => {
      echo.leave(channelName)
    }
  }, [restaurant, token, receiveNotification])
}
