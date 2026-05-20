import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const COLORS = {
  bg: '#0a0608',
  bg2: '#110a0d',
  card: '#160b0f',
  maroon: '#800020',
  maroon2: '#a0002a',
  gold: '#d4a843',
  text: '#f0e8ea',
  muted: '#9a7e84',
  border: 'rgba(128,0,32,0.35)',
  success: '#22c55e',
  danger: '#ef4444',
  info: '#60a5fa',
};

const DEFAULT_API_BASE_URL = 'http://10.61.4.248/stopgo';

function pad2(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '00';
  return v < 10 ? `0${v}` : `${v}`;
}

function formatDateTime(value) {
  if (!value) return '—';
  const s = String(value).replace(' ', 'T');
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return String(value);
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function buildUrl(base, path) {
  const b = String(base || '').replace(/\/+$/, '');
  const p = String(path || '').replace(/^\/+/, '');
  return `${b}/${p}`;
}

async function fetchJson(url, { method = 'GET', body, timeoutMs = 7000 } = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const text = await res.text();
    const json = text ? JSON.parse(text) : null;
    return { ok: res.ok, status: res.status, data: json };
  } catch (e) {
    return { ok: false, status: 0, data: null, error: e?.message || String(e) };
  } finally {
    clearTimeout(t);
  }
}

function Pill({ label, tone }) {
  const stylesByTone = {
    success: { borderColor: 'rgba(34,197,94,0.55)', backgroundColor: 'rgba(34,197,94,0.12)', color: COLORS.success },
    danger: { borderColor: 'rgba(239,68,68,0.55)', backgroundColor: 'rgba(239,68,68,0.12)', color: COLORS.danger },
    info: { borderColor: 'rgba(96,165,250,0.55)', backgroundColor: 'rgba(96,165,250,0.12)', color: COLORS.info },
    muted: { borderColor: 'rgba(154,126,132,0.55)', backgroundColor: 'rgba(154,126,132,0.12)', color: COLORS.muted },
  };
  const s = stylesByTone[tone] || stylesByTone.muted;
  return (
    <View style={[ui.pill, { borderColor: s.borderColor, backgroundColor: s.backgroundColor }]}>
      <Text style={[ui.pillText, { color: s.color }]}>{label}</Text>
    </View>
  );
}

function IconDot({ tone }) {
  const c = tone === 'success' ? COLORS.success : tone === 'danger' ? COLORS.danger : COLORS.muted;
  return <View style={[ui.dot, { backgroundColor: c }]} />;
}

function TabButton({ active, label, onPress }) {
  return (
    <Pressable onPress={onPress} style={[ui.tabBtn, active ? ui.tabBtnActive : null]}>
      <Text style={[ui.tabBtnText, active ? ui.tabBtnTextActive : null]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function SectionTitle({ title, subtitle, right }) {
  return (
    <View style={ui.sectionHeader}>
      <View style={{ flex: 1 }}>
        <Text style={ui.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={ui.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <View>{right}</View> : null}
    </View>
  );
}

function StatCard({ label, value, tone }) {
  const accent = tone === 'gold' ? COLORS.gold : tone === 'success' ? COLORS.success : tone === 'info' ? COLORS.info : COLORS.maroon2;
  return (
    <View style={ui.statCard}>
      <View style={[ui.statAccent, { backgroundColor: `${accent}33`, borderColor: `${accent}66` }]} />
      <Text style={ui.statValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={ui.statLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function DeviceCard({ device, onToggle, toggling }) {
  const online = !!device?.is_online;
  const relayOn = !!device?.relay_status;
  return (
    <View style={ui.card}>
      <View style={ui.cardTopRow}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={ui.cardTitle} numberOfLines={1}>
            {device?.name || 'Unnamed'}
          </Text>
          <Text style={ui.cardSub} numberOfLines={1}>
            {device?.location || '—'}
          </Text>
        </View>
        <View style={ui.cardBadges}>
          <Pill label={online ? 'Online' : 'Offline'} tone={online ? 'success' : 'danger'} />
          <Pill label={relayOn ? 'Relay ON' : 'Relay OFF'} tone={relayOn ? 'info' : 'muted'} />
        </View>
      </View>

      <View style={ui.metaRow}>
        <Text style={ui.metaKey}>Last seen</Text>
        <Text style={ui.metaVal}>{formatDateTime(device?.last_seen)}</Text>
      </View>
      <View style={ui.metaRow}>
        <Text style={ui.metaKey}>IP</Text>
        <Text style={ui.metaVal}>{device?.ip_address || '—'}</Text>
      </View>

      <View style={ui.cardActions}>
        <Pressable
          onPress={() => onToggle(device)}
          disabled={toggling}
          style={[ui.btn, relayOn ? ui.btnDanger : ui.btnPrimary, toggling ? ui.btnDisabled : null]}
        >
          <Text style={ui.btnText}>{toggling ? 'Memproses...' : relayOn ? 'Matikan' : 'Nyalakan'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function LogRow({ item }) {
  const action = String(item?.action || '').toUpperCase();
  const tone = action === 'ON' ? 'success' : action === 'OFF' ? 'danger' : 'muted';
  return (
    <View style={ui.logRow}>
      <View style={ui.logLeft}>
        <IconDot tone={tone} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={ui.logTitle} numberOfLines={1}>
            {item?.device_name || 'Unknown'} • {action || '—'}
          </Text>
          <Text style={ui.logSub} numberOfLines={1}>
            {formatDateTime(item?.created_at)} • {item?.triggered_by || '—'}
          </Text>
        </View>
      </View>
      <Text style={ui.logBadge} numberOfLines={1}>
        {item?.relay_status === 1 ? 'ON' : item?.relay_status === 0 ? 'OFF' : '—'}
      </Text>
    </View>
  );
}

export default function App() {
  const [apiBaseUrl, setApiBaseUrl] = useState(DEFAULT_API_BASE_URL);
  const [activeTab, setActiveTab] = useState('Dashboard');

  const [apiStatus, setApiStatus] = useState({ loading: false, ok: false, message: '' });
  const [devices, setDevices] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logStats, setLogStats] = useState(null);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '', tone: 'info' });

  const toastTimerRef = useRef(null);

  const api = useMemo(() => {
    return {
      status: () => fetchJson(buildUrl(apiBaseUrl, 'api/status')),
      devices: () => fetchJson(buildUrl(apiBaseUrl, 'api/devices')),
      toggle: (id) => fetchJson(buildUrl(apiBaseUrl, `api/devices/${id}/toggle`), { method: 'PUT' }),
      logs: () => fetchJson(buildUrl(apiBaseUrl, 'api/logs?limit=120')),
    };
  }, [apiBaseUrl]);

  function showToast(message, tone = 'info') {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ visible: true, message, tone });
    toastTimerRef.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2500);
  }

  async function refreshStatus() {
    setApiStatus({ loading: true, ok: false, message: '' });
    const r = await api.status();
    if (r.ok && r.data?.success) {
      setApiStatus({ loading: false, ok: true, message: r.data?.message || 'OK' });
      return true;
    }
    setApiStatus({ loading: false, ok: false, message: r.data?.message || r.error || `HTTP ${r.status}` });
    return false;
  }

  async function refreshDevices() {
    setLoadingDevices(true);
    const r = await api.devices();
    if (r.ok && r.data?.success) {
      setDevices(Array.isArray(r.data?.data) ? r.data.data : []);
    } else {
      showToast(r.data?.message || r.error || `Gagal load devices (HTTP ${r.status})`, 'danger');
    }
    setLoadingDevices(false);
  }

  async function refreshLogs() {
    setLoadingLogs(true);
    const r = await api.logs();
    if (r.ok && r.data?.success) {
      const payload = r.data?.data || {};
      setLogs(Array.isArray(payload?.logs) ? payload.logs : []);
      setLogStats(payload?.stats || null);
    } else {
      showToast(r.data?.message || r.error || `Gagal load logs (HTTP ${r.status})`, 'danger');
    }
    setLoadingLogs(false);
  }

  async function toggleRelay(device) {
    if (!device?.id) return;
    setTogglingId(device.id);
    const r = await api.toggle(device.id);
    if (r.ok && r.data?.success) {
      showToast(r.data?.message || 'Berhasil', 'success');
      await refreshDevices();
      await refreshLogs();
    } else {
      showToast(r.data?.message || r.error || `Gagal toggle (HTTP ${r.status})`, 'danger');
    }
    setTogglingId(null);
  }

  useEffect(() => {
    refreshStatus().then((ok) => {
      if (ok) {
        refreshDevices();
        refreshLogs();
      }
    });
  }, [api]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const counts = useMemo(() => {
    const total = devices.length;
    const online = devices.reduce((acc, d) => acc + (d?.is_online ? 1 : 0), 0);
    const active = devices.reduce((acc, d) => acc + (d?.relay_status ? 1 : 0), 0);
    const today = logStats?.total_logs ?? '—';
    return { total, online, active, today };
  }, [devices, logStats]);

  const HeaderRight = (
    <Pressable
      onPress={async () => {
        const ok = await refreshStatus();
        if (ok) {
          await Promise.all([refreshDevices(), refreshLogs()]);
          showToast('Refresh berhasil', 'success');
        } else {
          showToast('API tidak bisa diakses', 'danger');
        }
      }}
      style={ui.headerBtn}
    >
      <Text style={ui.headerBtnText}>{apiStatus.loading ? '...' : 'Refresh'}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={ui.safe}>
      <StatusBar style="light" />

      <View style={ui.header}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={ui.headerTitle} numberOfLines={1}>
            StopGo Mobile
          </Text>
          <View style={ui.headerSubRow}>
            <IconDot tone={apiStatus.ok ? 'success' : 'danger'} />
            <Text style={ui.headerSub} numberOfLines={1}>
              {apiStatus.loading ? 'Mengecek API...' : apiStatus.ok ? 'API Online' : apiStatus.message || 'API Offline'}
            </Text>
          </View>
        </View>
        {HeaderRight}
      </View>

      <View style={ui.tabs}>
        <TabButton active={activeTab === 'Dashboard'} label="Dashboard" onPress={() => setActiveTab('Dashboard')} />
        <TabButton active={activeTab === 'Perangkat'} label="Perangkat" onPress={() => setActiveTab('Perangkat')} />
        <TabButton active={activeTab === 'Log'} label="Log" onPress={() => setActiveTab('Log')} />
        <TabButton active={activeTab === 'Pengaturan'} label="Pengaturan" onPress={() => setActiveTab('Pengaturan')} />
      </View>

      {activeTab === 'Dashboard' ? (
        <ScrollView contentContainerStyle={ui.content} showsVerticalScrollIndicator={false}>
          <SectionTitle title="Ringkasan" subtitle="Status realtime dari server" />
          <View style={ui.statsGrid}>
            <StatCard label="Total Device" value={counts.total} tone="maroon" />
            <StatCard label="Online" value={counts.online} tone="success" />
            <StatCard label="Relay Aktif" value={counts.active} tone="gold" />
            <StatCard label="Log Hari Ini" value={counts.today} tone="info" />
          </View>

          <SectionTitle
            title="Perangkat Online"
            subtitle="Akses cepat"
            right={
              <Pressable onPress={refreshDevices} style={ui.smallBtn}>
                <Text style={ui.smallBtnText}>{loadingDevices ? '...' : 'Muat ulang'}</Text>
              </Pressable>
            }
          />

          {loadingDevices ? (
            <View style={ui.loadingBox}>
              <ActivityIndicator color={COLORS.gold} />
              <Text style={ui.loadingText}>Memuat perangkat...</Text>
            </View>
          ) : devices.length ? (
            devices
              .filter((d) => d?.is_online)
              .slice(0, 3)
              .map((d) => (
                <DeviceCard key={String(d.id)} device={d} onToggle={toggleRelay} toggling={togglingId === d.id} />
              ))
          ) : (
            <View style={ui.emptyBox}>
              <Text style={ui.emptyTitle}>Belum ada perangkat</Text>
              <Text style={ui.emptySub}>Pastikan API bisa diakses dan device sudah terdaftar.</Text>
            </View>
          )}

          <SectionTitle
            title="Log Terbaru"
            subtitle="Aktivitas terakhir"
            right={
              <Pressable onPress={refreshLogs} style={ui.smallBtn}>
                <Text style={ui.smallBtnText}>{loadingLogs ? '...' : 'Muat ulang'}</Text>
              </Pressable>
            }
          />
          {loadingLogs ? (
            <View style={ui.loadingBox}>
              <ActivityIndicator color={COLORS.gold} />
              <Text style={ui.loadingText}>Memuat log...</Text>
            </View>
          ) : logs.length ? (
            logs.slice(0, 6).map((l) => <LogRow key={String(l.id)} item={l} />)
          ) : (
            <View style={ui.emptyBox}>
              <Text style={ui.emptyTitle}>Belum ada log</Text>
              <Text style={ui.emptySub}>Coba toggle relay untuk melihat aktivitas.</Text>
            </View>
          )}
        </ScrollView>
      ) : null}

      {activeTab === 'Perangkat' ? (
        <View style={ui.contentFill}>
          <SectionTitle
            title="Perangkat"
            subtitle="Kontrol relay dari HP"
            right={
              <Pressable onPress={refreshDevices} style={ui.smallBtn}>
                <Text style={ui.smallBtnText}>{loadingDevices ? '...' : 'Refresh'}</Text>
              </Pressable>
            }
          />
          <FlatList
            data={devices}
            keyExtractor={(item) => String(item?.id)}
            contentContainerStyle={ui.listContent}
            renderItem={({ item }) => (
              <DeviceCard device={item} onToggle={toggleRelay} toggling={togglingId === item?.id} />
            )}
            refreshing={loadingDevices}
            onRefresh={refreshDevices}
            ListEmptyComponent={
              <View style={ui.emptyBox}>
                <Text style={ui.emptyTitle}>Tidak ada data</Text>
                <Text style={ui.emptySub}>Cek URL API di Pengaturan, lalu refresh.</Text>
              </View>
            }
          />
        </View>
      ) : null}

      {activeTab === 'Log' ? (
        <View style={ui.contentFill}>
          <SectionTitle
            title="Log Aktivitas"
            subtitle="Riwayat ON/OFF"
            right={
              <Pressable onPress={refreshLogs} style={ui.smallBtn}>
                <Text style={ui.smallBtnText}>{loadingLogs ? '...' : 'Refresh'}</Text>
              </Pressable>
            }
          />
          <FlatList
            data={logs}
            keyExtractor={(item) => String(item?.id)}
            contentContainerStyle={ui.listContent}
            renderItem={({ item }) => <LogRow item={item} />}
            refreshing={loadingLogs}
            onRefresh={refreshLogs}
            ListEmptyComponent={
              <View style={ui.emptyBox}>
                <Text style={ui.emptyTitle}>Belum ada log</Text>
                <Text style={ui.emptySub}>Log akan muncul setelah ada aksi relay / jadwal.</Text>
              </View>
            }
          />
        </View>
      ) : null}

      {activeTab === 'Pengaturan' ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={ui.contentFill}
        >
          <ScrollView contentContainerStyle={ui.content} keyboardShouldPersistTaps="handled">
            <SectionTitle title="Pengaturan" subtitle="Konfigurasi koneksi API" />
            <View style={ui.card}>
              <Text style={ui.inputLabel}>API Base URL</Text>
              <TextInput
                value={apiBaseUrl}
                onChangeText={setApiBaseUrl}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="http://IP/stopgo"
                placeholderTextColor={COLORS.muted}
                style={ui.input}
              />
              <View style={ui.cardActions}>
                <Pressable
                  onPress={async () => {
                    const ok = await refreshStatus();
                    if (ok) {
                      showToast('API OK', 'success');
                      await Promise.all([refreshDevices(), refreshLogs()]);
                    } else {
                      showToast(apiStatus.message || 'API gagal', 'danger');
                    }
                  }}
                  style={[ui.btn, ui.btnPrimary]}
                >
                  <Text style={ui.btnText}>Tes Koneksi</Text>
                </Pressable>
              </View>
              <Text style={ui.helpText}>
                Pastikan IP bisa diakses dari HP (satu jaringan WiFi). Contoh: http://10.61.4.248/stopgo
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : null}

      {toast.visible ? (
        <View style={ui.toastWrap} pointerEvents="none">
          <View
            style={[
              ui.toast,
              toast.tone === 'success'
                ? { borderColor: 'rgba(34,197,94,0.55)' }
                : toast.tone === 'danger'
                  ? { borderColor: 'rgba(239,68,68,0.55)' }
                  : { borderColor: 'rgba(212,168,67,0.55)' },
            ]}
          >
            <Text style={ui.toastText} numberOfLines={2}>
              {toast.message}
            </Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const ui = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bg,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  headerTitle: { color: COLORS.text, fontSize: 20, fontWeight: '900', letterSpacing: 0.2 },
  headerSubRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  headerSub: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  headerBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(212,168,67,0.55)',
    backgroundColor: 'rgba(212,168,67,0.12)',
    borderRadius: 12,
  },
  headerBtnText: { color: COLORS.gold, fontWeight: '800', fontSize: 12 },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: COLORS.bg,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(128,0,32,0.25)',
    backgroundColor: COLORS.bg2,
    alignItems: 'center',
  },
  tabBtnActive: {
    borderColor: 'rgba(212,168,67,0.55)',
    backgroundColor: 'rgba(212,168,67,0.12)',
  },
  tabBtnText: { color: COLORS.muted, fontWeight: '800', fontSize: 12 },
  tabBtnTextActive: { color: COLORS.gold },
  content: { padding: 16, paddingBottom: 28 },
  contentFill: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginBottom: 10, marginTop: 6 },
  sectionTitle: { color: COLORS.text, fontSize: 16, fontWeight: '900' },
  sectionSubtitle: { color: COLORS.muted, fontSize: 12, fontWeight: '600', marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  statCard: {
    width: '48%',
    minHeight: 86,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(128,0,32,0.25)',
    backgroundColor: COLORS.card,
    padding: 14,
    overflow: 'hidden',
  },
  statAccent: {
    position: 'absolute',
    right: -24,
    top: -24,
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
  },
  statValue: { color: COLORS.text, fontSize: 22, fontWeight: '900', marginBottom: 6 },
  statLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '700' },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(128,0,32,0.25)',
    backgroundColor: COLORS.card,
    padding: 14,
    marginBottom: 12,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  cardTitle: { color: COLORS.text, fontSize: 16, fontWeight: '900' },
  cardSub: { color: COLORS.muted, fontSize: 12, fontWeight: '600', marginTop: 4 },
  cardBadges: { alignItems: 'flex-end', gap: 8 },
  pill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  pillText: { fontSize: 11, fontWeight: '900' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  metaKey: { color: COLORS.muted, fontSize: 12, fontWeight: '700' },
  metaVal: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
  cardActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  btn: { flex: 1, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  btnPrimary: { backgroundColor: COLORS.maroon2 },
  btnDanger: { backgroundColor: COLORS.danger },
  btnDisabled: { opacity: 0.65 },
  btnText: { color: '#fff', fontSize: 13, fontWeight: '900' },
  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(154,126,132,0.35)',
    backgroundColor: 'rgba(154,126,132,0.10)',
    borderRadius: 12,
  },
  smallBtnText: { color: COLORS.muted, fontSize: 12, fontWeight: '800' },
  listContent: { paddingBottom: 22 },
  loadingBox: { paddingVertical: 18, alignItems: 'center', gap: 10 },
  loadingText: { color: COLORS.muted, fontWeight: '700' },
  emptyBox: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(128,0,32,0.25)',
    backgroundColor: COLORS.bg2,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  emptyTitle: { color: COLORS.text, fontSize: 14, fontWeight: '900' },
  emptySub: { color: COLORS.muted, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  logRow: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(128,0,32,0.25)',
    backgroundColor: COLORS.card,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  logLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 },
  logTitle: { color: COLORS.text, fontWeight: '900', fontSize: 13 },
  logSub: { color: COLORS.muted, fontWeight: '700', fontSize: 11, marginTop: 4 },
  logBadge: {
    color: COLORS.text,
    fontWeight: '900',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(154,126,132,0.35)',
    backgroundColor: 'rgba(154,126,132,0.10)',
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  inputLabel: { color: COLORS.muted, fontWeight: '800', fontSize: 12, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(154,126,132,0.35)',
    backgroundColor: COLORS.bg2,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    color: COLORS.text,
    fontWeight: '800',
  },
  helpText: { color: COLORS.muted, fontSize: 12, fontWeight: '600', marginTop: 10, lineHeight: 17 },
  toastWrap: { position: 'absolute', left: 0, right: 0, bottom: 18, alignItems: 'center' },
  toast: {
    width: '92%',
    borderWidth: 1,
    backgroundColor: 'rgba(10,6,8,0.92)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  toastText: { color: COLORS.text, fontWeight: '800', fontSize: 12, textAlign: 'center' },
});
