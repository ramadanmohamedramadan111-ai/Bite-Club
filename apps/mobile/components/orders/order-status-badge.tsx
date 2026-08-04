import { StyleSheet, Text, View } from 'react-native';

import { useI18n } from '@/lib/i18n';

const STATUS_COLORS: Record<string, { bg: string; fg: string; border: string }> = {
  pending: { bg: 'rgba(245,158,11,0.12)', fg: '#B45309', border: 'rgba(245,158,11,0.25)' },
  active: { bg: 'rgba(14,165,233,0.12)', fg: '#0369A1', border: 'rgba(14,165,233,0.25)' },
  preparing: { bg: 'rgba(245,158,11,0.12)', fg: '#B45309', border: 'rgba(245,158,11,0.25)' },
  ready: { bg: 'rgba(99,102,241,0.12)', fg: '#4338CA', border: 'rgba(99,102,241,0.25)' },
  out_for_delivery: { bg: 'rgba(14,165,233,0.12)', fg: '#0369A1', border: 'rgba(14,165,233,0.25)' },
  completed: { bg: 'rgba(16,185,129,0.12)', fg: '#047857', border: 'rgba(16,185,129,0.25)' },
  cancelled: { bg: 'rgba(244,63,94,0.12)', fg: '#BE123C', border: 'rgba(244,63,94,0.25)' },
};

function statusLabelKey(status: string): string {
  const map: Record<string, string> = {
    pending: 'orders.status.pending',
    active: 'orders.status.active',
    preparing: 'orders.status.preparing',
    ready: 'orders.status.ready',
    out_for_delivery: 'orders.status.outForDelivery',
    completed: 'orders.status.completed',
    cancelled: 'orders.status.cancelled',
  };
  return map[status] ?? status;
}

export function OrderStatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const palette = STATUS_COLORS[status] ?? {
    bg: 'rgba(113,113,122,0.12)',
    fg: '#52525B',
    border: 'rgba(113,113,122,0.25)',
  };

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg, borderColor: palette.border }]}>
      <Text style={[styles.label, { color: palette.fg }]}>{t(statusLabelKey(status))}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
