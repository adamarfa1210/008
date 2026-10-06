# Technology Stack Specification

## 1. Frontend Web Layer (Vue 3 Single Page Application)

| Category | Technology | Version | Rationale |
|---|---|---|---|
| **Framework** | **Vue.js 3** | `^3.4.x` | Modern reactive framework, optimal for real-time state manipulation via Composition API (`<script setup>`). |
| **Build Tool** | **Vite** | `^5.x` | Ultra-fast Hot Module Replacement (HMR) and lightning-fast deployment builds. |
| **CSS & Styling** | **Tailwind CSS** | `^3.4.x` | Utility-first styling for rapid prototyping, dark mode theming, and layout responsiveness. |
| **Icons** | **Lucide Vue Next** | `^0.350.x` | Lightweight, scalable vector icons matching modern UI guidelines. |
| **MQTT Protocol Client** | **MQTT.js** | `^5.5.x` | Reliable, battle-tested MQTT client supporting WebSocket Secure (`wss://`) in browser runtimes. |
| **Data Visualization** | **Chart.js + vue-chartjs** | `^4.x` / `^5.x` | High-performance HTML5 canvas charting capable of fluid 60fps real-time data streaming. |
| **Hosting Platform** | **Vercel / Netlify / Cloudflare Pages** | - | Instant edge deployment with automated CI/CD and default HTTPS SSL certificates. |

---

## 2. Broker Layer (Managed Cloud Message Broker)

| Category | Specification | Details |
|---|---|---|
| **Broker Provider** | **HiveMQ Cloud** | Free Tier Cluster (Up to 100 concurrent devices). |
| **Protocol (ESP32)** | **MQTT over TLS/MQTTS** | Port `8883` (Native TCP with SSL certificate validation). |
| **Protocol (Web)** | **MQTT over WSS (WebSocket Secure)** | Port `8884`, Path `/mqtt`. |
| **Authentication** | Username & Password | Required credentials created in HiveMQ Access Management. |

---

## 3. Hardware & Firmware Layer (IoT Edge Node)

| Component | Specification |
|---|---|
| **Controller** | **DOIT ESP32 DEVKIT V1** (Dual-Core Tensilica Xtensa 32-bit LX6). |
| **Sensor** | **DHT22 / AM2302** on GPIO `4`. |
| **Actuator** | On-board SMD LED on GPIO `2`. |
| **Development Environment** | Arduino IDE `2.x` or PlatformIO (VS Code). |
| **Core Libraries** | - `WiFi.h` & `WiFiClientSecure.h` (ESP32 Core)<br>- `PubSubClient` by Nick O'Leary (MQTT client)<br>- `DHT sensor library` by Adafruit (Sensor driver)<br>- `ArduinoJson` v6 or v7 by Benoît Blanchon (JSON serialization) |