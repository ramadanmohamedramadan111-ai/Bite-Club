import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';

type Props = {
  lat?: number;
  lng?: number;
  name?: string;
};

function buildHtml(lat: number, lng: number, name: string): string {
  const safeName = name.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, ' ');
  const marker = `L.marker([${lat}, ${lng}]).addTo(map).bindPopup('${safeName}').openPopup();`;
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; }
  .leaflet-container { background: #ecece9; }
  .leaflet-control-attribution { font-size: 8px; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map', { zoomControl: true, attributionControl: true }).setView([${lat}, ${lng}], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  ${marker}
</script>
</body>
</html>`;
}

export function RestaurantLocationMap({ lat, lng, name = '' }: Props) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();

  if (lat == null || lng == null || Number.isNaN(Number(lat)) || Number.isNaN(Number(lng))) {
    return (
      <View style={[styles.fallback, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Text style={{ color: colors.text }}>{t('map.unavailable')}</Text>
        <Text style={{ color: colors.textSecondary }}>{t('map.unavailableDesc', { lat: lat ?? '-', lng: lng ?? '-' })}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.map, { borderColor: colors.border }]}>
      <WebView
        originWhitelist={['*']}
        source={{ html: buildHtml(Number(lat), Number(lng), name) }}
        style={styles.webView}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    height: 240,
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  fallback: {
    height: 200,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
  },
});