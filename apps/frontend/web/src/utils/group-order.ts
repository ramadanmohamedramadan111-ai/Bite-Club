export function generateGroupOrderCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';

  for (let index = 0; index < 6; index += 1) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
}

export function getGroupInviteUrl(inviteToken: string): string {
  if (typeof window === 'undefined') {
    return `/groups/invite/${inviteToken}`;
  }

  const locale = window.location.pathname.split('/')[1] ?? 'en';

  return `${window.location.origin}/${locale}/groups/invite/${inviteToken}`;
}

export function isGroupSessionOwner(
  sessionId: string,
  guestSessionId: string | null,
  ownerSessionId?: string,
): boolean {
  if (!ownerSessionId || !guestSessionId) {
    return false;
  }

  return ownerSessionId === guestSessionId;
}
