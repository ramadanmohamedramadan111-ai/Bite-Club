const FCM_TOKEN_KEY = 'fcm-token';

export function getStoredFCMToken() {
  return localStorage.getItem(FCM_TOKEN_KEY);
}

export function setStoredFCMToken(token: string) {
  localStorage.setItem(FCM_TOKEN_KEY, token);
}

export function removeStoredFCMToken() {
  localStorage.removeItem(FCM_TOKEN_KEY);
}
