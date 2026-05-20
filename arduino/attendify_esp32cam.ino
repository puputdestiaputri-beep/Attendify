/*
====================================================
ESP32-CAM + PIR SENSOR
SMART ATTENDIFY DETECTION
FIX ERROR -1 VERSION
====================================================

FITUR:
✔ PIR mendeteksi gerakan
✔ ESP32-CAM ambil foto
✔ Kirim foto ke backend Attendify
✔ Debug lengkap
✔ FIX HTTP ERROR -1

BOARD:
AI THINKER ESP32-CAM
====================================================
*/

#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include "mbedtls/base64.h"

// ========================================
// WIFI
// ========================================
const char* ssid = "Employees";
const char* password = "###HorizonU";

// ========================================
// BACKEND URL
// ========================================
const char* serverUrl =
  "http://10.61.4.23:5000/api/iot/recognize";

// ========================================
// DEVICE ID
// ========================================
String deviceId = "ESP32CAM_01";

// ========================================
// PIR PIN
// ========================================
#define PIR_PIN 13

// ========================================
// CAMERA PIN AI THINKER
// ========================================
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27

#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

// ========================================
// CAMERA SETUP
// ========================================
void startCamera() {

  camera_config_t config;

  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer   = LEDC_TIMER_0;

  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;

  config.pin_xclk  = XCLK_GPIO_NUM;
  config.pin_pclk  = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href  = HREF_GPIO_NUM;

  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;

  config.pin_pwdn  = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;

  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  // Force QVGA agar payload tidak terlalu besar
  if (psramFound()) {
    config.frame_size   = FRAMESIZE_QVGA;
    config.jpeg_quality = 10;
    config.fb_count     = 2;
  } else {
    config.frame_size   = FRAMESIZE_QVGA;
    config.jpeg_quality = 12;
    config.fb_count     = 1;
  }

  esp_err_t err = esp_camera_init(&config);

  if (err != ESP_OK) {
    Serial.print("Camera init failed: ");
    Serial.println(err);
    return;
  }

  Serial.println("Camera OK");
}

// ========================================
// BASE64 ENCODE
// ========================================
String base64Encode(uint8_t* data, size_t len) {

  size_t outputLen;

  // Alokasi buffer cukup besar: base64 ~= 4/3 * len + padding
  size_t bufSize = ((len + 2) / 3) * 4 + 1;
  unsigned char* output = (unsigned char*)malloc(bufSize);

  if (!output) {
    Serial.println("[B64] malloc gagal!");
    return "";
  }

  mbedtls_base64_encode(
    output,
    bufSize,
    &outputLen,
    data,
    len
  );

  output[outputLen] = '\0';

  String result = String((char*)output);
  free(output);

  return result;
}

// ========================================
// SEND PHOTO
// ========================================
void sendPhoto() {

  Serial.println("Capturing image...");

  camera_fb_t* fb = esp_camera_fb_get();

  if (!fb) {
    Serial.println("Camera capture failed");
    return;
  }

  Serial.print("Image captured: ");
  Serial.print(fb->len);
  Serial.println(" bytes");

  String imageBase64 = base64Encode(fb->buf, fb->len);
  esp_camera_fb_return(fb); // Bebaskan buffer segera

  if (imageBase64 == "") {
    Serial.println("Base64 failed");
    return;
  }

  Serial.print("Base64 length: ");
  Serial.println(imageBase64.length());

  WiFiClient client;
  HTTPClient http;

  Serial.println("Connecting to server...");
  Serial.println(serverUrl);

  // ====================================
  // FIX ERROR -1: gunakan WiFiClient
  // ====================================
  http.begin(client, serverUrl);
  http.setTimeout(20000); // 20 detik

  http.addHeader(
    "Content-Type",
    "application/json"
  );

  // ====================================
  // JSON PAYLOAD
  // sesuai backend: { device_id, image }
  // ====================================
  String payload = "{";
  payload += "\"device_id\":\"" + deviceId + "\",";
  payload += "\"image\":\"" + imageBase64 + "\"";
  payload += "}";

  Serial.println("Sending POST request...");

  int httpResponseCode = http.POST(payload);

  Serial.print("HTTP Response Code: ");
  Serial.println(httpResponseCode);

  // ====================================
  // RESPONSE HANDLING
  // ====================================
  if (httpResponseCode > 0) {

    String response = http.getString();
    Serial.println("Server Response:");
    Serial.println(response);

    // Parse status dari backend
    if (response.indexOf("\"matched\"") >= 0) {
      Serial.println(">> Absensi BERHASIL");
    } else if (response.indexOf("\"duplicate\"") >= 0) {
      Serial.println(">> Sudah absen hari ini");
    } else if (response.indexOf("\"unknown\"") >= 0) {
      Serial.println(">> Wajah tidak dikenal");
    } else if (response.indexOf("\"no_schedule\"") >= 0) {
      Serial.println(">> Tidak ada jadwal aktif");
    } else if (response.indexOf("\"rate_limited\"") >= 0) {
      Serial.println(">> Rate limited, tunggu sebentar");
    }

  } else {

    Serial.println("POST Failed");

    switch (httpResponseCode) {

      case -1:
        Serial.println("ERROR -1: Connection failed");
        Serial.println("Cek: IP backend 10.61.4.23 benar?");
        Serial.println("Cek: backend npm start sudah jalan?");
        Serial.println("Cek: Firewall Windows port 5000?");
        Serial.println("Cek: ESP32 & laptop 1 WiFi?");
        break;

      case -11:
        Serial.println("ERROR -11: Timeout");
        Serial.println("Payload terlalu besar atau server lambat");
        break;

      default:
        Serial.print("Unknown Error: ");
        Serial.println(httpResponseCode);
        break;
    }
  }

  http.end();
}

// ========================================
// SETUP
// ========================================
void setup() {

  Serial.begin(115200);

  Serial.println("");
  Serial.println("ESP32 CAM START");

  pinMode(PIR_PIN, INPUT);

  // ====================================
  // WIFI CONNECT
  // ====================================
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false); // Stabilkan koneksi
  WiFi.begin(ssid, password);

  Serial.print("Connecting WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi Connected");

  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());

  Serial.print("Backend  : ");
  Serial.println(serverUrl);

  // ====================================
  // CAMERA INIT
  // ====================================
  startCamera();

  Serial.println("System Ready");
}

// ========================================
// LOOP
// ========================================
void loop() {

  // Reconnect jika WiFi putus
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi lost, reconnecting...");
    WiFi.begin(ssid, password);
    delay(3000);
    return;
  }

  int motion = digitalRead(PIR_PIN);

  if (motion == HIGH) {

    Serial.println("");
    Serial.println("Motion Detected!");

    sendPhoto();

    // Anti spam: tunggu 5 detik sebelum scan berikutnya
    delay(5000);

  } else {

    Serial.println("No Motion");
  }

  delay(1000);
}
