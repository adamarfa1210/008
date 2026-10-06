<template>
  <div class="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
    <!-- Top Application Bar -->
    <HeaderBar
      :broker-status="brokerStatus"
      :node-status="nodeStatus"
      :device-id="config.deviceId"
      @open-settings="isSettingsOpen = true"
      @reconnect="handleReconnect"
    />

    <!-- Main Container -->
    <main class="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
      <!-- Reconnect / Connection Error Notice if any -->
      <div
        v-if="brokerStatus === 'error' || (brokerStatus === 'disconnected' && isManualDisconnect)"
        class="rounded-xl border border-red-800/60 bg-red-950/30 p-4 text-xs font-mono text-red-300 flex items-center justify-between gap-3"
      >
        <div class="flex items-center gap-2.5">
          <AlertCircle class="w-4 h-4 text-red-400 shrink-0" />
          <span>
            Broker Connection Notice: {{ brokerErrorMessage || 'Client disconnected from HiveMQ Cloud.' }}
          </span>
        </div>
        <button
          @click="handleReconnect"
          class="px-3 py-1 bg-red-900/60 hover:bg-red-800 text-red-200 rounded border border-red-700/60 transition-colors"
        >
          Retry Connection
        </button>
      </div>

      <!-- Quick Control Bar / Simulator Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-2.5 rounded-xl bg-gray-900/70 border border-gray-800 text-xs">
        <div class="flex items-center gap-2 text-slate-400 font-mono">
          <span class="inline-block w-2 h-2 rounded-full" :class="brokerStatus === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'"></span>
          <span>HiveMQ Cloud WSS: <strong class="text-slate-200">{{ config.host }}:{{ config.port }}</strong></span>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <span class="text-slate-400 font-mono">Hardware Simulator:</span>
            <button
              @click="toggleSimulator"
              class="px-2.5 py-1 rounded text-xs font-mono font-medium border transition-all"
              :class="[
                isSimulating
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-glow-sky'
                  : 'bg-gray-800 text-slate-400 border-gray-700 hover:text-slate-200'
              ]"
            >
              {{ isSimulating ? 'Active (Simulating ESP32)' : 'Off (Physical Node)' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Upper Grid: Metric Cards (Temp & Humidity) & Actuator Switch -->
      <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Metric Card: Temperature -->
        <MetricCard
          title="TEMPERATURE"
          :value="currentTelemetry.temperature"
          unit="°C"
          accent="temp"
          :min="tempStats.min"
          :max="tempStats.max"
          :avg="tempStats.avg"
          :timestamp="currentTelemetry.timestamp"
          status-tag="DHT22 Sensor / AM2302"
        >
          <template #icon>
            <Thermometer class="w-4 h-4 text-amber-400" />
          </template>
        </MetricCard>

        <!-- Metric Card: Humidity -->
        <MetricCard
          title="RELATIVE HUMIDITY"
          :value="currentTelemetry.humidity"
          unit="%"
          accent="humidity"
          :min="humStats.min"
          :max="humStats.max"
          :avg="humStats.avg"
          :timestamp="currentTelemetry.timestamp"
          status-tag="Ambient Humidity Range"
        >
          <template #icon>
            <Droplets class="w-4 h-4 text-cyan-400" />
          </template>
        </MetricCard>

        <!-- Actuator Control Card: Built-in LED -->
        <ActuatorControl
          :led-state="ledState"
          :is-pending="isLedPending"
          :can-control="brokerStatus === 'connected' || isSimulating"
          @toggle="handleLedToggle"
        />
      </section>

      <!-- Mid Section: Dynamic Multi-Axis Time Series Chart -->
      <section>
        <TelemetryChart :history="telemetryHistory" />
      </section>

      <!-- Bottom Section: Real-Time Event Audit Log Feed Table -->
      <section>
        <LogFeedTable :logs="eventLogs" @clear="clearLogs" />
      </section>
    </main>

    <!-- Footer -->
    <footer class="border-t border-gray-900 bg-[#0B0F19] px-4 py-4 text-center text-xs text-slate-500 font-mono">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          IoT Environmental Telemetry & Actuator Command Dashboard • Unit SKKNI: J.61IOT01.008.1
        </div>
        <div class="text-slate-400">
          ESP32 DevKit V1 • HiveMQ Cloud WSS • Vue 3 + Tailwind CSS
        </div>
      </div>
    </footer>

    <!-- Broker Settings Modal -->
    <BrokerSettingsModal
      :is-open="isSettingsOpen"
      :current-config="config"
      @close="isSettingsOpen = false"
      @save="handleSaveConfig"
      @reset="handleResetConfig"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { Thermometer, Droplets, AlertCircle } from 'lucide-vue-next'

import HeaderBar from './components/HeaderBar.vue'
import MetricCard from './components/MetricCard.vue'
import ActuatorControl from './components/ActuatorControl.vue'
import TelemetryChart from './components/TelemetryChart.vue'
import LogFeedTable from './components/LogFeedTable.vue'
import BrokerSettingsModal from './components/BrokerSettingsModal.vue'

import { getMqttConfig, saveMqttConfig, resetMqttConfig } from './config/mqtt'
import {
  brokerStatus,
  brokerErrorMessage,
  nodeStatus,
  currentTelemetry,
  telemetryHistory,
  ledState,
  isLedPending,
  eventLogs,
  initMqttClient,
  publishLedCommand,
  clearLogs
} from './services/mqttService'

const config = reactive(getMqttConfig())
const isSettingsOpen = ref(false)
const isManualDisconnect = ref(false)

// Hardware Simulator for offline evaluation & testing
const isSimulating = ref(false)
let simulationInterval = null

// Computed Statistics for Temperature (Last 20 readings)
const tempStats = computed(() => {
  if (telemetryHistory.value.length === 0) return { min: null, max: null, avg: null }
  const values = telemetryHistory.value.map(d => d.temperature)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  return { min, max, avg }
})

// Computed Statistics for Humidity (Last 20 readings)
const humStats = computed(() => {
  if (telemetryHistory.value.length === 0) return { min: null, max: null, avg: null }
  const values = telemetryHistory.value.map(d => d.humidity)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  return { min, max, avg }
})

function handleReconnect() {
  initMqttClient(config)
}

function handleSaveConfig(newConfig) {
  Object.assign(config, newConfig)
  saveMqttConfig(newConfig)
  initMqttClient(config)
}

function handleResetConfig() {
  const defaultConf = resetMqttConfig()
  Object.assign(config, defaultConf)
  initMqttClient(config)
}

function handleLedToggle(targetState) {
  if (isSimulating.value && brokerStatus.value !== 'connected') {
    // Simulator local handling if broker is not connected
    isLedPending.value = true
    setTimeout(() => {
      ledState.value = targetState
      isLedPending.value = false
      eventLogs.value.unshift({
        id: `${Date.now()}-sim-status`,
        time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
        topic: config.topics.ledStatus,
        direction: 'in',
        payload: {
          device_id: config.deviceId,
          target: 'builtin_led',
          state: targetState ? 1 : 0,
          status_text: targetState ? 'ON' : 'OFF'
        }
      })
      if (eventLogs.value.length > 10) eventLogs.value.pop()
    }, 250)
    return
  }

  publishLedCommand(targetState)
}

function toggleSimulator() {
  isSimulating.value = !isSimulating.value
  if (isSimulating.value) {
    nodeStatus.value = 'online'
    startSimulation()
  } else {
    stopSimulation()
  }
}

function startSimulation() {
  stopSimulation()
  // Immediate initial reading
  sendSimulatedTelemetry()
  // Every 5 seconds matching IoT.cc TELEMETRY_INTERVAL
  simulationInterval = setInterval(() => {
    sendSimulatedTelemetry()
  }, 5000)
}

function stopSimulation() {
  if (simulationInterval) {
    clearInterval(simulationInterval)
    simulationInterval = null
  }
}

function sendSimulatedTelemetry() {
  // Base realistic sensor data around 27.5 °C and 64.0 % with small sensor jitter
  const t = Number((26.5 + Math.random() * 2.5).toFixed(1))
  const h = Number((60.0 + Math.random() * 8.0).toFixed(1))
  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-GB', { hour12: false })

  currentTelemetry.temperature = t
  currentTelemetry.humidity = h
  currentTelemetry.deviceId = config.deviceId
  currentTelemetry.timestamp = timeStr
  currentTelemetry.rawTimestamp = Math.floor(now.getTime() / 1000)
  nodeStatus.value = 'online'

  telemetryHistory.value.push({
    time: timeStr,
    temperature: t,
    humidity: h
  })
  if (telemetryHistory.value.length > 20) {
    telemetryHistory.value.shift()
  }

  eventLogs.value.unshift({
    id: `${Date.now()}-sim-telemetry`,
    time: timeStr,
    topic: config.topics.telemetry,
    direction: 'in',
    payload: {
      device_id: config.deviceId,
      temperature: t,
      humidity: h,
      unit_temp: 'Celsius',
      unit_hum: '%',
      timestamp: Math.floor(now.getTime() / 1000)
    }
  })
  if (eventLogs.value.length > 10) eventLogs.value.pop()
}

onMounted(() => {
  // Initialize MQTT connection with HiveMQ Cloud
  initMqttClient(config)
})

onBeforeUnmount(() => {
  stopSimulation()
})
</script>
