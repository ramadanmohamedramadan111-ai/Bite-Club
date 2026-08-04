// Polyfill: crypto.randomUUID is only available in secure contexts (HTTPS)
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export function getGuestSessionId() {
  const key = 'biteclub_guest_session';

  let sessionId = localStorage.getItem(key);

  if (!sessionId) {
    sessionId = generateUUID();

    localStorage.setItem(key, sessionId);
  }

  return sessionId;
}
