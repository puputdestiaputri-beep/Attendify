# IoT Integration Testing Checklist

## Pre-Requisites ✓
- [ ] ESP32-CAM accessible at `http://10.61.4.131/capture`
- [ ] Backend server running on `http://localhost:5000`
- [ ] MySQL database `db_absensi` ready
- [ ] React Native app ready to test

---

## Database Setup

### ✓ 1. Create IoT Logs Table
```bash
# Run migration
mysql -u root -p db_absensi < backend/migrations/002_create_iot_logs.sql

# Verify table created
mysql -u root -p db_absensi -e "SHOW TABLES LIKE 'iot_logs';"
```

### ✓ 2. Verify Tables Exist
```bash
# Check required tables
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'db_absensi' 
AND TABLE_NAME IN ('pengguna', 'jadwal_kuliah', 'absensi', 'notifikasi', 'iot_logs');
```

### ✓ 3. Insert Test Data (if needed)
```sql
-- Check if active schedule exists now
SELECT * FROM jadwal_kuliah 
WHERE CURRENT_TIME() BETWEEN jam_mulai AND jam_selesai;

-- Check if test user exists
SELECT * FROM pengguna LIMIT 5;
```

---

## Backend Testing

### ✓ 1. Start Backend Server
```bash
cd backend
npm start

# Expected output:
# Server is gracefully running on port 5000.
# Endpoints available under: http://localhost:5000/api/
```

### ✓ 2. Test Health Check Endpoint
```bash
# Terminal / Postman / curl
curl -X POST http://localhost:5000/api/iot/health \
  -H "Content-Type: application/json" \
  -d '{"device_id":"esp32-kelas-a"}'

# Expected response:
# {
#   "status": "ok",
#   "device_id": "esp32-kelas-a",
#   "server_time": "2026-04-29T...",
#   "active_schedule": true,
#   "api_version": "1.0"
# }
```

### ✓ 3. Check Console Logs
- [ ] Server started successfully
- [ ] No connection errors
- [ ] Middleware loaded (cors, json, etc.)

### ✓ 4. Verify Routes Registered
```bash
# Check server logs for route info
# Should see API endpoints loaded
```

---

## Frontend Testing

### ✓ 1. Start React Native App
```bash
# Terminal
npm start  # or expo start

# Select iOS/Android device or emulator
```

### ✓ 2. Navigate to ESP32CameraScreen
- [ ] Screen loads without errors
- [ ] Title displays "Live ESP32 Camera - Face Recognition"
- [ ] Camera feed appears (if ESP32 is accessible)

### ✓ 3. Monitor Console Logs
```javascript
// React Native Debugger / Metro
// Look for [IoT] prefixed logs:

// [IoT] Sending image from http://10.61.4.131/capture?XXX to backend...
// [IoT] Backend response: {status: "matched", ...}
// [IoT] Face matched: John Doe (ID: 5)
```

### ✓ 4. Check Status Display
- [ ] Status text appears on screen
- [ ] Shows "✅ Recognized: Name" or similar
- [ ] Auto-clears after 3 seconds
- [ ] Updates with each recognition

### ✓ 5. Test Rate Limiting
- [ ] Images sent every 2 seconds (display)
- [ ] Backend calls happen every 5 seconds (rate limited)
- [ ] Verify in console: `lastSentTime` tracking

---

## API Testing (with actual images)

### ✓ 1. Get Sample Image from ESP32
```bash
# Download image from ESP32
curl http://10.61.4.131/capture --output test.jpg

# Verify image downloaded
ls -lah test.jpg
```

### ✓ 2. Convert Image to Base64
```bash
# Mac/Linux
base64 -i test.jpg > test.b64

# Windows (PowerShell)
[Convert]::ToBase64String([IO.File]::ReadAllBytes('test.jpg')) | Out-File test.b64
```

### ✓ 3. Send to Backend
```bash
# Read base64 content
BASE64_IMAGE=$(cat test.b64)

# Send to /api/iot/recognize
curl -X POST http://localhost:5000/api/iot/recognize \
  -H "Content-Type: application/json" \
  -d "{
    \"image\": \"$BASE64_IMAGE\",
    \"device_id\": \"esp32-kelas-a\",
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\"
  }" | jq .

# Expected response: {status: "matched"|"unknown"|"duplicate"}
```

---

## Database Verification

### ✓ 1. Check IoT Logs
```sql
SELECT * FROM iot_logs ORDER BY timestamp DESC LIMIT 10;

-- Should see recent activity entries
```

### ✓ 2. Check Attendance Records
```sql
SELECT u.nama, a.status, a.tanggal 
FROM absensi a
JOIN pengguna u ON a.user_id = u.id_user
WHERE a.tanggal >= CURDATE()
ORDER BY a.tanggal DESC LIMIT 20;

-- Should see new records if face matched and recorded
```

### ✓ 3. Check Notifications
```sql
SELECT u.nama, n.judul, n.pesan, n.jenis_notif 
FROM notifikasi n
JOIN pengguna u ON n.user_id = u.id_user
WHERE n.jenis_notif = 'absensi_iot'
ORDER BY n.tanggal DESC LIMIT 10;

-- Should see IoT-related notifications
```

---

## Error Scenarios Testing

### ✓ Test 1: Missing device_id
```bash
curl -X POST http://localhost:5000/api/iot/recognize \
  -H "Content-Type: application/json" \
  -d '{"image":"base64data"}'

# Expected: 400 error
```

### ✓ Test 2: Missing image
```bash
curl -X POST http://localhost:5000/api/iot/recognize \
  -H "Content-Type: application/json" \
  -d '{"device_id":"esp32-kelas-a"}'

# Expected: 400 error
```

### ✓ Test 3: Image too large
```bash
# Send base64 > 5MB
curl -X POST http://localhost:5000/api/iot/recognize \
  -H "Content-Type: application/json" \
  -d '{"image":"verylongbase64string...", "device_id":"esp32"}'

# Expected: 400 error (image too large)
```

### ✓ Test 4: Rate limiting
```bash
# Send multiple requests quickly (< 5 seconds)
for i in {1..3}; do
  curl -X POST http://localhost:5000/api/iot/recognize ...
  sleep 1
done

# Expected: First succeeds, next 2 get 429 (rate limited)
```

---

## Integration Testing

### ✓ 1. End-to-End Flow
- [ ] ESP32 captures image
- [ ] React Native fetches and converts to base64
- [ ] Sends to backend
- [ ] Backend recognizes face
- [ ] Attendance record created
- [ ] Notification sent
- [ ] Status displays on screen

### ✓ 2. Multiple Scans
- [ ] First scan: Records attendance ✓
- [ ] Second scan (same user, same day): Shows "Already scanned"
- [ ] Third scan: Still shows "Already scanned"

### ✓ 3. Different Time of Day
- [ ] Morning (before 00:15 after jam_mulai): Status "hadir" ✓
- [ ] Late (after 00:15 from jam_mulai): Status "terlambat" ✓

### ✓ 4. Outside Class Hours
- [ ] Outside active schedule: Shows "No active schedule"
- [ ] Between classes: Shows "No active schedule"

---

## Performance Testing

### ✓ 1. Response Time
```bash
# Measure endpoint response time
time curl -X POST http://localhost:5000/api/iot/recognize ...

# Should be < 1 second (typically 300-600ms)
```

### ✓ 2. Image Size Impact
- [ ] Test with 100KB image: Should complete quickly
- [ ] Test with 1MB image: May take longer
- [ ] Test with 5MB image: Should still work but slower

### ✓ 3. Concurrent Requests
```bash
# Simulate multiple devices
for i in {1..5}; do
  curl -X POST http://localhost:5000/api/iot/recognize ... &
done
wait

# Should handle without crashing
```

---

## Security Testing

### ✓ 1. Authentication (Optional)
- [ ] Token validation (if auth token provided)
- [ ] Request works without token (public endpoint)

### ✓ 2. Input Sanitization
- [ ] Special characters in device_id: Handled gracefully
- [ ] Null values: Proper error response
- [ ] SQL injection attempts: Protected by parameterized queries

### ✓ 3. Image Validation
- [ ] Invalid base64: Returns error
- [ ] Corrupted image: Handles gracefully
- [ ] Non-image data: Returns error

---

## Monitoring & Logging

### ✓ 1. Server Logs
```bash
# Terminal running backend
# Should show [IoT] prefixed messages

# Example:
# [IoT] 2026-04-29T10:30:45.123Z | Device: esp32-kelas-a | Image size: 45.67KB
# [IoT] Image saved: esp32-kelas-a-1704038445123.jpg
# [IoT] Face matched: John Doe (ID: 5)
```

### ✓ 2. Frontend Logs
```javascript
// React Native console
// Should show [IoT] messages

// Example:
// [IoT] Sending image from http://10.61.4.131/capture?XXX to backend...
// [IoT] Backend response: {status: "matched", name: "John Doe", ...}
```

### ✓ 3. Database Logs
```sql
-- Query iot_logs table
SELECT * FROM iot_logs WHERE timestamp >= NOW() - INTERVAL 1 HOUR;

-- Should show all recent activity with timestamp
```

---

## Troubleshooting Checklist

### Problem: Images not being sent
- [ ] Check ESP32 camera is accessible: `ping 10.61.4.131`
- [ ] Check backend is running: `curl http://localhost:5000`
- [ ] Check console logs for errors
- [ ] Check network connectivity between app and backend
- [ ] Verify device IP is correct

### Problem: "Face not recognized"
- [ ] Check database has user face data: `SELECT * FROM pengguna WHERE id_wajah IS NOT NULL;`
- [ ] Check user status is 'Y': `SELECT * FROM pengguna WHERE status = 'Y';`
- [ ] Implement actual face recognition library (currently placeholder)

### Problem: "No active schedule"
- [ ] Check jadwal_kuliah has entries: `SELECT * FROM jadwal_kuliah;`
- [ ] Check current time matches jam_mulai/jam_selesai
- [ ] Verify database server timezone

### Problem: Rate limited errors
- [ ] Wait 5+ seconds before trying again
- [ ] Check SEND_INTERVAL in ESP32CameraScreen.tsx (should be 5000ms)
- [ ] Check device_id is consistent

### Problem: Slow responses
- [ ] Check image size (should be < 5MB)
- [ ] Monitor database query performance
- [ ] Check server CPU/memory usage
- [ ] Check network latency (ping test)

---

## Final Verification

### ✓ All Systems Go
- [ ] Database: `iot_logs` table created
- [ ] Backend: Server running, routes loaded
- [ ] Frontend: App running, camera displaying
- [ ] Communication: Images being sent and processed
- [ ] Data: Attendance records created correctly
- [ ] Logs: Activities logged for monitoring

### ✓ Ready for Production
- [ ] All tests passed
- [ ] No console errors
- [ ] Database clean and optimized
- [ ] Server logs monitored
- [ ] Rate limiting working
- [ ] Error handling robust

---

**Testing Date:** ___________  
**Tester:** ___________  
**Result:** ✅ PASS / ❌ FAIL  
**Notes:** ___________  

