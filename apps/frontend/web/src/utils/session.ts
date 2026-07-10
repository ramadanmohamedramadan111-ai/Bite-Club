export function getGuestSessionId() {
  const key = 'biteclub_guest_session';

  let sessionId = localStorage.getItem(key);

  if (!sessionId) {
    sessionId = crypto.randomUUID();

    localStorage.setItem(key, sessionId);
  }

  return sessionId;
}
