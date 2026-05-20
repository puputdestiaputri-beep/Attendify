/*
 * ═══════════════════════════════════════════════════════════════════════════
 * STOP KONTAK OTOMATIS — ESP32 DevKit V1 Firmware
 * ═══════════════════════════════════════════════════════════════════════════
 * Board  : ESP32 DevKit V1 / DOIT ESP32 DevKit
 * IDE    : Arduino IDE (≥ 2.x)
 * 
 * Libraries yang dibutuhkan (install via Library Manager):
 *   - ArduinoJson    (byjernoe-Michel Beacco, v6.x)
 *   - NTPClient      (by Fabrice Weinberg)
 *
 * Wiring:
 *   ESP32 GPIO 26  →  IN  Relay Module
 *   ESP32 3.3V     →  VCC Relay Module (atau 5V tergantung modul)
 *   ESP32 GND      →  GND Relay Module
 *   GPIO 2         →  LED Hijau (ON saat relay aktif)
 *   GPIO 4         →  LED Merah (ON saat relay mati)
 * ═══════════════════════════════════════════════════════════════════════════
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

// ══════════════════════════════════════════════════════════════════
//  KONFIGURASI — SESUAIKAN BAGIAN INI
// ══════════════════════════════════════════════════════════════════
const char* WIFI_SSID      = "Employees";       // SSID WiFi
const char* WIFI_PASSWORD  = "###HorizonU"  ;   // Password WiFi

// URL server XAMPP (gunakan IP lokal, bukan localhost!)
// Contoh: "http://192.168.1.10/stopgo"
const char* API_BASE_URL   = "http://10.61.4.248/stopgo";

// Device key yang didapat dari dashboard web
const char* DEVICE_KEY     = "ESP32-DAPUR-003";

// Pin GPIO
const int RELAY_PIN        = 26;    // Pin relay (Active LOW atau Active HIGH)
const int LED_GREEN_PIN    = 2;
const int LED_RED_PIN      = 4;
const bool RELAY_ACTIVE_LOW = true; // true = relay aktif saat LOW (umum untuk modul relay)
const bool RELAY_BOOT_TEST  = true;
const int  RELAY_BOOT_TEST_MS = 250;

// Interval
const int HEARTBEAT_INTERVAL = 5000;   // ms — interval polling ke server
const int WIFI_TIMEOUT       = 15000;  // ms — timeout koneksi WiFi
// ══════════════════════════════════════════════════════════════════

// NTP (sinkronisasi waktu)
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 7 * 3600, 60000); // UTC+7 WIB

// State
bool  relayState      = false;
bool  wifiConnected   = false;
unsigned long lastHeartbeat = 0;
int   failCount       = 0;

// Build full API URL
String apiUrl(const String& path) {
  return String(API_BASE_URL) + path;
}

void setStatusLeds(bool relayOn) {
  digitalWrite(LED_GREEN_PIN, relayOn ? HIGH : LOW);
  digitalWrite(LED_RED_PIN, relayOn ? LOW : HIGH);
}

// ─────────────────────────────────────────────────────────────────
// SETUP
// ─────────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println("\n╔══════════════════════════════════════╗");
  Serial.println("║  Stop Kontak Otomatis — ESP32 v1.0  ║");
  Serial.println("╚══════════════════════════════════════╝");

  // Init GPIO
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(LED_GREEN_PIN, OUTPUT);
  pinMode(LED_RED_PIN, OUTPUT);
  setRelay(false); // mulai OFF
  if (RELAY_BOOT_TEST) {
    Serial.println("[RELAY] Self-test");
    setRelay(true);
    delay(RELAY_BOOT_TEST_MS);
    setRelay(false);
    delay(RELAY_BOOT_TEST_MS);
  }

  // Connect WiFi
  connectWiFi();

  // Start NTP
  if (wifiConnected) {
    timeClient.begin();
    timeClient.update();
    Serial.println("[NTP] Waktu: " + timeClient.getFormattedTime());
  }
}

// ─────────────────────────────────────────────────────────────────
// LOOP
// ─────────────────────────────────────────────────────────────────
void loop() {
  // Reconnect WiFi jika terputus
  if (WiFi.status() != WL_CONNECTED) {
    wifiConnected = false;
    blinkLedFast(); // indikasi masalah
    connectWiFi();
    return;
  }

  // Update NTP setiap 60 detik (dilakukan oleh library otomatis)
  timeClient.update();

  // Kirim heartbeat sesuai interval
  if (millis() - lastHeartbeat >= HEARTBEAT_INTERVAL) {
    lastHeartbeat = millis();
    sendHeartbeat();
  }

  delay(100);
}

// ─────────────────────────────────────────────────────────────────
// FUNGSI: Kirim Heartbeat ke Server
// ─────────────────────────────────────────────────────────────────
void sendHeartbeat() {
  HTTPClient http;
  String url = apiUrl("/api/esp32/heartbeat");

  // Buat JSON body
  StaticJsonDocument<256> doc;
  doc["device_key"]    = DEVICE_KEY;
  doc["relay_status"]  = relayState ? 1 : 0;
  doc["uptime_sec"]    = millis() / 1000;
  doc["ntp_time"]      = timeClient.getFormattedTime();
  doc["rssi"]          = WiFi.RSSI();

  String body;
  serializeJson(doc, body);

  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(4000);

  int httpCode = http.POST(body);

  if (httpCode == HTTP_CODE_OK) {
    String payload = http.getString();
    failCount = 0;

    // Parse response
    StaticJsonDocument<512> resp;
    DeserializationError err = deserializeJson(resp, payload);

    if (!err) {
      int newRelayCommand = resp["data"]["relay_command"] | (relayState ? 1 : 0);
      bool newState = (newRelayCommand == 1);

      if (newState != relayState) {
        Serial.printf("[HEARTBEAT] Perintah relay: %s\n", newState ? "ON" : "OFF");
        setRelay(newState);
      } else {
        Serial.printf("[HEARTBEAT] ✓ OK — Relay: %s — Waktu server: %s\n",
          relayState ? "ON" : "OFF",
          resp["data"]["server_time"].as<const char*>());
      }
    }
  } else {
    failCount++;
    Serial.printf("[HEARTBEAT] ✗ Gagal HTTP %d (coba ke-%d)\n", httpCode, failCount);

    // Setelah 5 gagal berturut, coba reconnect WiFi
    if (failCount >= 5) {
      Serial.println("[WIFI] Terlalu banyak gagal, reconnect...");
      WiFi.disconnect();
      delay(1000);
      connectWiFi();
      failCount = 0;
    }
  }

  http.end();
}

// ─────────────────────────────────────────────────────────────────
// FUNGSI: Set Relay
// ─────────────────────────────────────────────────────────────────
void setRelay(bool state) {
  relayState = state;

  if (RELAY_ACTIVE_LOW) {
    // Relay aktif LOW: ON = output LOW, OFF = output HIGH
    digitalWrite(RELAY_PIN, state ? LOW : HIGH);
  } else {
    // Relay aktif HIGH: ON = output HIGH, OFF = output LOW
    digitalWrite(RELAY_PIN, state ? HIGH : LOW);
  }

  setStatusLeds(state);

  Serial.printf("[RELAY] → %s (GPIO%d = %s)\n",
    state ? "ON" : "OFF",
    RELAY_PIN,
    (RELAY_ACTIVE_LOW ? !state : state) ? "HIGH" : "LOW");
}

// ─────────────────────────────────────────────────────────────────
// FUNGSI: Koneksi WiFi
// ─────────────────────────────────────────────────────────────────
void connectWiFi() {
  Serial.printf("[WiFi] Menghubungkan ke '%s'", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long start = millis();
  int dots = 0;

  while (WiFi.status() != WL_CONNECTED) {
    if (millis() - start > WIFI_TIMEOUT) {
      Serial.println("\n[WiFi] ✗ Timeout! Coba lagi dalam 10 detik...");
      delay(10000);
      return;
    }
    delay(500);
    Serial.print(".");
    if (++dots % 20 == 0) Serial.println();
    blinkLedFast();
  }

  wifiConnected = true;
  Serial.println("\n[WiFi] ✓ Terhubung!");
  Serial.printf("[WiFi] IP Address : %s\n", WiFi.localIP().toString().c_str());
  Serial.printf("[WiFi] RSSI       : %d dBm\n", WiFi.RSSI());
  Serial.printf("[WiFi] MAC        : %s\n", WiFi.macAddress().c_str());

  bool greenBefore = digitalRead(LED_GREEN_PIN);
  bool redBefore = digitalRead(LED_RED_PIN);
  digitalWrite(LED_GREEN_PIN, HIGH);
  digitalWrite(LED_RED_PIN, LOW);
  delay(200);
  digitalWrite(LED_GREEN_PIN, greenBefore ? HIGH : LOW);
  digitalWrite(LED_RED_PIN, redBefore ? HIGH : LOW);
}

// ─────────────────────────────────────────────────────────────────
// FUNGSI: Kedip LED Cepat (indikasi masalah)
// ─────────────────────────────────────────────────────────────────
void blinkLedFast() {
  bool greenBefore = digitalRead(LED_GREEN_PIN);
  bool redBefore = digitalRead(LED_RED_PIN);
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_RED_PIN, HIGH); delay(80);
    digitalWrite(LED_RED_PIN, LOW);  delay(80);
  }
  digitalWrite(LED_GREEN_PIN, greenBefore ? HIGH : LOW);
  digitalWrite(LED_RED_PIN, redBefore ? HIGH : LOW);
}
