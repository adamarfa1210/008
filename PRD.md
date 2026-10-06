# Product Requirement Document (PRD)

## Project Title
**IoT Environmental Telemetry & Actuator Command Dashboard**  
Standard SKKNI Unit: `J.61IOT01.008.1` (Membuat Program Visual Antarmuka pada Perangkat Berbasis Web yang Terintegrasi dengan Mikrokontroler)

---

## 1. Executive Summary & Objective
The objective of this web application is to provide an industrial-grade, real-time, responsive single-page dashboard built with **Vue 3** that interacts bidirectionally with an **ESP32** microcontroller carrying a **DHT22** temperature/humidity sensor and controlling its on-board LED (GPIO 2). Communication occurs asynchronously over **MQTT via Secure WebSocket (WSS)** using HiveMQ Cloud.

The solution enables remote, cable-free monitoring and hardware control from any desktop or mobile browser.

---

## 2. Target Users & Use Cases
- **Field Engineer / Evaluator:** Inspects live telemetry metrics, evaluates sensor stability, and sends remote actuator commands during certification testing.
- **End User:** Monitors temperature and humidity values continuously across mobile and desktop devices without browser page refreshes.

---

## 3. System Architecture & Information Flow
```
┌────────────────────────┐                   ┌────────────────────────┐
│     ESP32 + DHT22      │                   │     Vue 3 Frontend     │
│  (MQTTS - TLS Port 8883)│                   │   (WSS - TLS Port 8884)│
└───────────┬────────────┘                   └───────────▲────────────┘
            │                                            │
            │ Publish Telemetry & LWT                    │ Subscribe Telemetry
            │ Subscribe Command                          │ Publish Command
            ▼                                            │
    ┌────────────────────────────────────────────────────────┐
    │              HiveMQ Cloud Broker Cluster               │
    │         (Domain: <cluster-id>.s1.eu.hivemq.cloud)      │
    └────────────────────────────────────────────────────────┘
```

---

## 4. Functional Requirements

### 4.1 Telemetry Display (Inbound Data)
- **FR-01:** Connect to HiveMQ Cloud via MQTT over WebSocket (`wss://<cluster-id>.s1.eu.hivemq.cloud:8884/mqtt`).
- **FR-02:** Subscribe to `iot/esp32/dht22/telemetry`.
- **FR-03:** Extract `temperature` and `humidity` from incoming JSON payloads and update numerical metric cards with zero noticeable delay.
- **FR-04:** Maintain a rolling time-series chart showing the last 20 data points for both temperature (°C) and humidity (%).
- **FR-05:** Present a live tabular feed of the last 10 transmission events with timestamps.

### 4.2 Actuator Control & State Synchronization (Outbound Data)
- **FR-06:** Provide a prominent, accessible toggle switch for the **Built-in LED (GPIO 2)**.
- **FR-07:** When toggled, publish an instruction to `iot/esp32/led/set` with payload `{"target":"builtin_led","state":1}` or `{"target":"builtin_led","state":0}`.
- **FR-08:** Subscribe to `iot/esp32/led/status`. When the ESP32 confirms execution, synchronize the toggle switch UI state without causing optimistic lock desynchronization.

### 4.3 Connection Lifecycle & Telemetry Node Health
- **FR-09:** Subscribe to `iot/esp32/node/status` to handle the Last Will and Testament (LWT) message (`online` / `offline`).
- **FR-10:** Display clear status badges:
  - **Cloud Broker Status:** `Connecting`, `Connected`, or `Disconnected / Reconnecting`.
  - **ESP32 Node Status:** `Online` or `Offline`.
- **FR-11:** Automatic reconnection handling with exponential backoff on network dropouts.

---

## 5. Non-Functional Requirements
- **NFR-01 Performance:** Real-time UI rendering latency $< 150\text{ ms}$ upon receiving an MQTT message.
- **NFR-02 Responsiveness:** Fully responsive interface supporting viewport sizes from $360\text{ px}$ (mobile phones) to $4\text{K}$ monitors.
- **NFR-03 Security:** Pure TLS/SSL end-to-end. HTTPS hosting (e.g. Vercel/Netlify) connecting only to Secure WebSockets (`wss://`).
- **NFR-04 Code Quality:** Clean, modular Single File Components (SFC) in Vue 3 (Composition API, `<script setup>`).

---

## 6. MQTT Topics & Message Contracts

| Topic | Publisher | Subscriber | QoS | Retain | Payload Example |
|---|---|---|---|---|---|
| `iot/esp32/dht22/telemetry` | ESP32 | Web App | 0 | False | `{"device_id":"esp32-node-01","temperature":27.8,"humidity":64.2,"timestamp":1728205500}` |
| `iot/esp32/led/set` | Web App | ESP32 | 1 | False | `{"target":"builtin_led","state":1}` |
| `iot/esp32/led/status` | ESP32 | Web App | 1 | True | `{"device_id":"esp32-node-01","target":"builtin_led","state":1,"status_text":"ON"}` |
| `iot/esp32/node/status` | ESP32 (LWT) | Web App | 1 | True | `{"device_id":"esp32-node-01","status":"online"}` |