# IoT Environmental Telemetry & Actuator Command Dashboard

Standar Kompetensi Kerja Nasional Indonesia (SKKNI) Unit: **`J.61IOT01.008.1`**  
*(Membuat Program Visual Antarmuka pada Perangkat Berbasis Web yang Terintegrasi dengan Mikrokontroler)*

Dashboard web modern, responsif, dan berbasis *real-time* untuk memantau telemetri lingkungan (**Suhu & Kelembapan** via sensor DHT22) dan mengontrol aktuator (**Built-in LED GPIO 2**) pada mikrokontroler **ESP32 DevKit V1** secara asinkron menggunakan protokol **MQTT over Secure WebSocket (WSS)** melalui broker **HiveMQ Cloud**.

---

## 🚀 Fitur Utama

1. **Real-time Telemetry Cards (DHT22):**
   - Kartu metrik Suhu (°C) dengan aksen Amber-Orange (`#F59E0B`) dan Kelembapan Relatif (%) dengan aksen Cyan-Teal (`#06B6D4`).
   - Menyajikan nilai presisi 1 desimal, statistik dinamis (*Min*, *Avg*, *Max*), serta waktu pembaruan terakhir.
2. **Dynamic Multi-Axis Rolling Chart (Chart.js):**
   - Grafik garis *real-time* dengan kurva halus (*tension: 0.4*) dan *gradient fill*.
   - Sumbu ganda (*Dual Y-Axes*): Suhu (°C) di sisi kiri dan Kelembapan (%) di sisi kanan.
   - Buffer geser dinamis mempertahankan **20 titik data terakhir**.
3. **Hardware Actuator Control (Built-in LED GPIO 2):**
   - Tombol sakelar taktil interaktif dengan efek *glow* saat aktif.
   - Status sinkronisasi dua arah (`ON / HIGH` vs `OFF / LOW`) berbasis topik konfirmasi `iot/esp32/led/status`.
   - Proteksi *optimistic lock* dengan indikator status *syncing/pending* untuk mencegah desinkronisasi UI saat latensi jaringan.
4. **Node Health & Connection Badges:**
   - Status koneksi Broker Cloud: `Connecting`, `Connected`, `Reconnecting`, `Disconnected`.
   - Status Node ESP32: `Online` / `Offline` menggunakan mekanisme *Last Will and Testament (LWT)*.
   - *Automatic reconnection* dengan *exponential backoff*.
5. **Real-Time Transmission Audit Feed Table:**
   - Tabel audit 10 paket transmisi terakhir (*Ingress/Rx* & *Egress/Tx*) lengkap dengan timestamp presisi `HH:mm:ss`.
   - Fitur inspeksi detail payload JSON dan ekspor/salin log.
6. **Hardware Simulator Mode:**
   - Tombol simulator bawaan untuk demonstrasi dan evaluasi instan tanpa memerlukan perangkat keras fisik ESP32 yang sedang menyala.

---

## 🛠️ Tech Stack & Standar Desain

- **Framework:** Vue.js 3 (Composition API `<script setup>`)
- **Build Tool:** Vite 5
- **CSS & Styling:** Tailwind CSS v3.4 (Tema *Modern Industrial Cyber-Clean Dark Mode*)
- **Icons:** Lucide Icons (`lucide-vue-next`)
- **MQTT Client:** `mqtt` v5.5 (WSS Secure WebSocket)
- **Data Visualization:** Chart.js 4.4 + Canvas Gradients
- **Broker:** HiveMQ Cloud (TLS WSS Port `8884`, Path `/mqtt`)

---

## 📡 Kontrak Topik & Pesan MQTT

| Topik | Arah | QoS | Retain | Contoh Payload |
|---|---|---|---|---|
| `iot/esp32/dht22/telemetry` | ESP32 ➔ Web | 0 | False | `{"device_id":"esp32-node-01","temperature":27.8,"humidity":64.2,"unit_temp":"Celsius","unit_hum":"%","timestamp":1728205500}` |
| `iot/esp32/led/set` | Web ➔ ESP32 | 1 | False | `{"target":"builtin_led","state":1}` |
| `iot/esp32/led/status` | ESP32 ➔ Web | 1 | True | `{"device_id":"esp32-node-01","target":"builtin_led","state":1,"status_text":"ON"}` |
| `iot/esp32/node/status` | ESP32 (LWT) ➔ Web | 1 | True | `{"device_id":"esp32-node-01","status":"online"}` |

---

## 💻 Panduan Menjalankan

### 1. Menjalankan Server Pengembangan (Dev)
```bash
npm run dev
```
Buka browser pada alamat yang tertera (biasanya `http://localhost:5173/`).

### 2. Menjalankan Pengujian Kontrak (Self-Check Test)
```bash
npm test
```
Menjalankan pengujian assert bebas dependensi pihak ketiga (`test/contract-check.js`) untuk memvalidasi kontrak payload JSON dan buffer geser data.

### 3. Build untuk Produksi
```bash
npm run build
```
File hasil kompilasi siap didistribusikan ke Vercel, Netlify, atau Cloudflare Pages di direktori `dist/`.
