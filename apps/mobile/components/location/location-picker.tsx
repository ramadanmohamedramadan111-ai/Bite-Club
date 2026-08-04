import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import type { SavedLocation } from '@/stores/location';

type Props = {
  visible: boolean;
  initial?: SavedLocation | null;
  onConfirm: (location: SavedLocation) => void;
  onReset: () => void;
  onClose: () => void;
};

const DEFAULT_LOCATION = { lat: 30.0444, lng: 31.2357 };

type Picked = { lat: number; lng: number; area: string; address: string };

function buildHtml(initialLat: number, initialLng: number): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; }
  .leaflet-container { background: #ecece9; font-family: system-ui, sans-serif; }
  .leaflet-control-attribution { font-size: 8px; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map', { zoomControl: true, attributionControl: true }).setView([${initialLat}, ${initialLng}], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  var marker = null;
  var current = { lat: ${initialLat}, lng: ${initialLng}, area: '', address: '' };

  function reverseGeocode(lat, lng) {
    fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' + lat + '&lon=' + lng)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var parts = [];
        if (data.address) {
          parts.push(data.address.road || data.address.pedestrian || '');
          parts.push(data.address.neighbourhood || data.address.suburb || '');
          parts.push(data.address.city || data.address.town || data.address.village || '');
        }
        var address = (data.display_name || '').split(',').slice(0, 4).join(',');
        var area = parts.filter(Boolean).slice(0, 2).join(', ') || address.split(',')[0];
        current.area = area;
        current.address = address;
        send();
      })
      .catch(function () {
        current.area = 'Lat: ' + lat.toFixed(5);
        current.address = 'Lng: ' + lng.toFixed(5);
        send();
      });
  }

  function place(lat, lng) {
    current.lat = lat;
    current.lng = lng;
    if (!marker) {
      marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      marker.on('dragend', function (e) {
        var p = marker.getLatLng();
        place(p.lat, p.lng);
      });
    } else {
      marker.setLatLng([lat, lng]);
    }
    reverseGeocode(lat, lng);
  }

  function send() {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(current));
    }
  }

  map.on('click', function (e) {
    place(e.latlng.lat, e.latlng.lng);
  });

  function onMessage(e) {
    var d = e.data;
    if (d === 'get-location') {
      send();
    } else if (d.indexOf('set-location:') === 0) {
      var parts = d.slice('set-location:'.length).split(',');
      var slat = parseFloat(parts[0]);
      var slng = parseFloat(parts[1]);
      map.setView([slat, slng], 16);
      place(slat, slng);
    }
  }
  document.addEventListener('message', onMessage);
  window.addEventListener('message', onMessage);

  place(${initialLat}, ${initialLng});
</script>
</body>
</html>`;
}

export function LocationPicker({ visible, initial, onConfirm, onReset, onClose }: Props) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();

  const webViewRef = useRef<WebView>(null);
  const pendingRef = useRef(false);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Picked[]>([]);
  const [searching, setSearching] = useState(false);

  const center = initial ?? DEFAULT_LOCATION;

  useEffect(() => {
    if (visible) {
      pendingRef.current = false;
      setPicked(initial ? { ...initial, area: initial.area, address: initial.address } : null);
      setLoading(false);
    }
  }, [visible, initial]);

  useEffect(() => {
    const query = search.trim();
    if (!visible) return;
    if (query.length < 3) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`,
        );
        const data = await res.json();
        const list: Picked[] = (Array.isArray(data) ? data : []).map(
          (r: { lat: string; lon: string; display_name?: string }) => ({
            lat: Number(r.lat),
            lng: Number(r.lon),
            area: (r.display_name ?? '').split(',')[0] || 'Selected area',
            address: r.display_name ?? '',
          }),
        );
        setResults(list);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [search, visible]);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finishConfirm = (loc: Picked | null) => {
    if (loc && Number.isFinite(loc.lat) && Number.isFinite(loc.lng)) {
      onConfirm({
        lat: loc.lat,
        lng: loc.lng,
        area: loc.area || t('location.selectedArea'),
        address: loc.address || t('location.selectedAddress'),
      });
    }
    setLoading(false);
    onClose();
  };

  useEffect(() => {
    if (!loading) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (pendingRef.current && picked) {
        pendingRef.current = false;
        finishConfirm(picked);
      } else {
        setLoading(false);
      }
    }, 1500);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (!visible) return null;

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as Picked;
      if (pendingRef.current) {
        pendingRef.current = false;
        finishConfirm(data);
        return;
      }
      setPicked(data);
      setLoading(false);
    } catch {
      // ignore malformed messages
    }
  };

  const handleConfirm = () => {
    pendingRef.current = true;
    webViewRef.current?.postMessage('get-location');
    setLoading(true);
  };

  const selectResult = (r: Picked) => {
    setSearch(r.area);
    setResults([]);
    setPicked(r);
    setLoading(false);
    webViewRef.current?.postMessage(`set-location:${r.lat},${r.lng}`);
  };

  const handleReset = () => {
    setPicked(null);
    setSearch('');
    setResults([]);
    setLoading(false);
    onReset();
    webViewRef.current?.postMessage(
      `set-location:${DEFAULT_LOCATION.lat},${DEFAULT_LOCATION.lng}`,
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" />
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t('location.selectLocation')}</Text>
          <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button">
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={[styles.searchWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="search" size={16} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={search}
            onChangeText={setSearch}
            placeholder={t('location.searchPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            returnKeyType="search"
            autoCorrect={false}
          />
          {searching && <ActivityIndicator color={colors.primary} size="small" />}
        </View>

        {results.length > 0 && (
          <View style={[styles.results, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {results.map((r, index) => (
              <Pressable
                key={`${r.lat}-${r.lng}-${index}`}
                onPress={() => selectResult(r)}
                accessibilityRole="button"
                style={[styles.resultItem, { borderBottomColor: colors.border }]}>
                <Ionicons name="location-outline" size={16} color={colors.primary} />
                <View style={styles.resultBody}>
                  <Text style={[styles.resultArea, { color: colors.text }]} numberOfLines={1}>
                    {r.area}
                  </Text>
                  <Text style={[styles.resultAddress, { color: colors.textSecondary }]} numberOfLines={1}>
                    {r.address}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

<View style={[styles.mapWrap, { borderColor: colors.border }]}>
            <WebView
              ref={webViewRef}
              originWhitelist={['*']}
              source={{ html: buildHtml(center.lat, center.lng) }}
              style={styles.webView}
              javaScriptEnabled
              domStorageEnabled
              onMessage={handleMessage}
              onError={() => setLoading(false)}
            />
            <View style={styles.mapHint}>
              <Ionicons name="locate-outline" size={14} color={colors.primary} />
              <Text style={[styles.mapHintText, { color: colors.textSecondary }]}>
                {t('location.clickMapInstruction')}
              </Text>
            </View>
            <Pressable
              onPress={handleReset}
              accessibilityRole="button"
              style={[styles.resetBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="refresh" size={16} color={colors.primary} />
              <Text style={[styles.resetText, { color: colors.primary }]}>{t('location.reset')}</Text>
            </Pressable>
          </View>

        <View style={styles.detail}>
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.primary} size="small" />
              <Text style={{ color: colors.textSecondary }}>{t('location.findingAddress')}</Text>
            </View>
          ) : picked ? (
            <>
              <Text style={[styles.area, { color: colors.text }]} numberOfLines={1}>
                {picked.area}
              </Text>
              <Text style={[styles.address, { color: colors.textSecondary }]} numberOfLines={2}>
                {picked.address}
              </Text>
            </>
          ) : (
            <Text style={[styles.area, { color: colors.textSecondary }]}>{t('location.clickMapInstruction')}</Text>
          )}
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            style={[styles.cancelBtn, { borderColor: colors.border }]}>
            <Text style={[styles.cancelText, { color: colors.text }]}>{t('cart.close')}</Text>
          </Pressable>
          <Pressable
            onPress={handleConfirm}
            disabled={loading}
            accessibilityRole="button"
            style={[styles.confirmBtn, { backgroundColor: colors.primary }, loading && styles.btnDisabled]}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.confirmText}>{t('location.confirmLocation')}</Text>
            )}
          </Pressable>
        </View>
      </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  mapWrap: {
    height: 320,
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  mapHint: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 999,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  mapHintText: {
    fontSize: 11,
    fontWeight: '600',
  },
  resetBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  resetText: {
    fontSize: 11,
    fontWeight: '700',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  results: {
    borderRadius: Radius.md,
    borderWidth: 1,
    maxHeight: 160,
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  resultBody: {
    flex: 1,
    gap: 1,
  },
  resultArea: {
    fontSize: 13,
    fontWeight: '700',
  },
  resultAddress: {
    fontSize: 11,
  },
  detail: {
    minHeight: 48,
    justifyContent: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  area: {
    fontSize: 14,
    fontWeight: '800',
  },
  address: {
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
  },
  confirmBtn: {
    flex: 1,
    height: 46,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
