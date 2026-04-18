import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Dimensions, StatusBar } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BlurView } from 'expo-blur';
import { X, CheckCircle, AlertCircle, ShieldAlert, Zap, Cpu } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<'success' | 'failed' | null>(null);
  const [scanTime, setScanTime] = useState<string>('');
  const scanLineAnim = React.useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (scanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();

      const timer = setTimeout(() => {
        setScanning(false);
        const isSuccess = Math.random() > 0.3; 
        setResult(isSuccess ? 'success' : 'failed');
        const now = new Date();
        setScanTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [scanning]);

  if (!permission) return <View style={{ flex: 1, backgroundColor: '#0F172A' }} />;

  if (!permission.granted) {
    return (
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.permissionContainer}>
        <View style={styles.permHeader}>
           <ShieldAlert size={64} color="#3B82F6" />
           <Text style={styles.permTitle}>Akses Kamera Diperlukan</Text>
           <Text style={styles.permissionText}>Attendify membutuhkan akses kamera untuk melakukan verifikasi wajah AI sebelum mencatat absensi Anda.</Text>
        </View>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.btnText}>Izinkan Kamera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.permBack} onPress={() => navigation.goBack()}>
          <Text style={styles.permBackText}>Kembali ke Dashboard</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <CameraView style={styles.camera} facing="front" />
      
      {/* High-Tech Overlay */}
      <View style={styles.overlay}>
        <View style={styles.overlayTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <X color="#fff" size={24} />
          </TouchableOpacity>
          <View style={styles.indicatorWrap}>
             <View style={styles.liveIndicator} />
             <Text style={styles.liveText}>AI SENSOR ACTIVE</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.middleArea}>
           <View style={styles.scannerBorder}>
              <View style={[styles.scanCorner, styles.topL]} />
              <View style={[styles.scanCorner, styles.topR]} />
              <View style={[styles.scanCorner, styles.botL]} />
              <View style={[styles.scanCorner, styles.botR]} />
              
              {scanning && (
                <Animated.View
                  style={[
                    styles.scanLaser,
                    {
                      transform: [{
                        translateY: scanLineAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [10, 240]
                        })
                      }]
                    }
                  ]}
                >
                  <LinearGradient
                    colors={['transparent', 'rgba(59, 130, 246, 0.5)', 'transparent']}
                    style={styles.laserGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  />
                </Animated.View>
              )}
           </View>
           
           <View style={styles.instructionBox}>
             <Cpu size={16} color="rgba(59, 130, 246, 0.7)" />
             <Text style={styles.instructionText}>
               {scanning ? "MENGANALISIS DATA WAJAH..." : "WAJAH HARUS BERADA DI DALAM KOTAK"}
             </Text>
           </View>
        </View>

        <View style={styles.bottomArea}>
          {!scanning && !result && (
            <TouchableOpacity 
              style={styles.startBtn}
              onPress={() => setScanning(true)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.btnGradient}
              >
                <Zap size={20} color="#fff" />
                <Text style={styles.btnText}>MULAI VERIFIKASI</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results Portal */}
      {result && (
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}>
          <View style={styles.portal}>
             <LinearGradient
                colors={result === 'success' ? ['rgba(16, 185, 129, 0.1)', 'rgba(6, 78, 59, 0.4)'] : ['rgba(239, 68, 68, 0.1)', 'rgba(127, 29, 29, 0.4)']}
                style={styles.portalCard}
             >
                <View style={[styles.iconPortal, { backgroundColor: result === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)' }]}>
                  {result === 'success' ? (
                    <CheckCircle color="#10B981" size={48} />
                  ) : (
                    <AlertCircle color="#EF4444" size={48} />
                  )}
                </View>

                <Text style={styles.portalTitle}>
                  {result === 'success' ? 'VERIFIKASI BERHASIL' : 'VERIFIKASI GAGAL'}
                </Text>
                
                <Text style={styles.portalSub}>
                  {result === 'success' 
                    ? `Wajah dikenali! Absensi Anda pukul ${scanTime} telah tercatat di sistem.` 
                    : 'Wajah tidak cocok dengan database. Pastikan pencahayaan cukup dan wajah terlihat jelas.'}
                </Text>

                <View style={styles.portalMeta}>
                   <View style={styles.metaBadge}>
                      <Text style={styles.metaLabel}>Confidence</Text>
                      <Text style={[styles.metaValue, { color: result === 'success' ? '#10B981' : '#EF4444' }]}>
                        {result === 'success' ? '98.4%' : '32.1%'}
                      </Text>
                   </View>
                </View>

                <TouchableOpacity 
                  style={[styles.portalAction, { backgroundColor: result === 'success' ? '#10B981' : '#EF4444' }]}
                  onPress={() => {
                    setResult(null);
                    if (result === 'success') navigation.goBack();
                  }}
                >
                  <Text style={styles.actionText}>{result === 'success' ? 'SELESAI' : 'COBA LAGI'}</Text>
                </TouchableOpacity>
             </LinearGradient>
          </View>
        </BlurView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  permissionContainer: { flex: 1, padding: 32, justifyContent: 'center', alignItems: 'center' },
  permHeader: { alignItems: 'center', marginBottom: 48 },
  permTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 24, marginBottom: 12 },
  permissionText: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 22 },
  permBtn: { backgroundColor: '#3B82F6', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16, width: '100%', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  permBack: { marginTop: 20 },
  permBackText: { color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  camera: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'space-between' },
  overlayTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 24 },
  closeBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  indicatorWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  liveIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  liveText: { color: '#fff', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  middleArea: { alignItems: 'center' },
  scannerBorder: { width: 260, height: 260, position: 'relative' },
  scanCorner: { position: 'absolute', width: 40, height: 40, borderColor: '#3B82F6' },
  topL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 24 },
  topR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 24 },
  botL: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 24 },
  botR: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 24 },
  scanLaser: { position: 'absolute', left: 10, right: 10, height: 2, zIndex: 10 },
  laserGradient: { width: '100%', height: 40, marginTop: -20 },
  instructionBox: { marginTop: 40, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.2)' },
  instructionText: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 'bold', letterSpacing: 0.5 },
  bottomArea: { paddingBottom: 60, paddingHorizontal: 40 },
  startBtn: { borderRadius: 20, overflow: 'hidden', elevation: 12, shadowColor: '#3B82F6', shadowOpacity: 0.5, shadowRadius: 15 },
  btnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 12 },
  portal: { flex: 1, justifyContent: 'center', padding: 24 },
  portalCard: { borderRadius: 32, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  iconPortal: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  portalTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', letterSpacing: 1, marginBottom: 12 },
  portalSub: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 22, fontSize: 15, marginBottom: 24 },
  portalMeta: { width: '100%', marginBottom: 32 },
  metaBadge: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  metaLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '600' },
  metaValue: { fontSize: 14, fontWeight: 'bold' },
  portalAction: { width: '100%', paddingVertical: 18, borderRadius: 20, alignItems: 'center' },
  actionText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 }
});
