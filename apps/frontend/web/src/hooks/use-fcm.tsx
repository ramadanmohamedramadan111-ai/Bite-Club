'use client';

import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { getFirebaseMessaging } from '@/lib/firebase-messaging';
import { setStoredFCMToken } from '@/lib/firebase-storage';

export function useFCM() {
  useEffect(() => {
    async function init() {
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        return;
      }

      const messaging = await getFirebaseMessaging();

      if (!messaging) {
        return;
      }

      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      if (!token) {
        return;
      }

      setStoredFCMToken(token);

      console.log('FCM Token:', token);

      // TODO:
      // POST token to Laravel

      onMessage(messaging, (payload) => {
        console.log(payload);

        new Notification(payload.notification?.title ?? '', {
          body: payload.notification?.body,
          icon: '/logo.png',
        });
      });
    }

    init();
  }, []);
}

