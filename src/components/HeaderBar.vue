<template>
  <header class="border-b border-gray-800 bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5 transition-colors">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <!-- Title & Branding -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-glow-sky">
          <Cpu class="w-5 h-5" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
              IoT Telemetry & Control Dashboard
            </h1>
            <span class="hidden sm:inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-800/60">
              SKKNI J.61IOT01.008.1
            </span>
          </div>
          <p class="text-xs text-slate-400 flex items-center gap-2 font-mono">
            <span>Node: <span class="text-slate-200">{{ deviceId }}</span></span>
            <span class="text-slate-600">•</span>
            <span>ESP32 + DHT22 (GPIO 4) + LED (GPIO 2)</span>
          </p>
        </div>
      </div>

      <!-- Live Status Badges & Controls -->
      <div class="flex flex-wrap items-center gap-2 sm:gap-3">
        <!-- Cloud Broker Status Pill -->
        <div
          class="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border transition-all duration-300"
          :class="brokerBadgeClass"
        >
          <span class="relative flex h-2 w-2">
            <span
              v-if="brokerStatus === 'connected' || brokerStatus === 'connecting' || brokerStatus === 'reconnecting'"
              class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              :class="brokerDotColor"
            ></span>
            <span class="relative inline-flex rounded-full h-2 w-2" :class="brokerDotColor"></span>
          </span>
          <span class="font-mono">Broker: {{ brokerLabel }}</span>
        </div>

        <!-- ESP32 Node Status Pill -->
        <div
          class="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border transition-all duration-300"
          :class="nodeBadgeClass"
        >
          <span class="relative flex h-2 w-2">
            <span
              v-if="nodeStatus === 'online'"
              class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400"
            ></span>
            <span class="relative inline-flex rounded-full h-2 w-2" :class="nodeDotColor"></span>
          </span>
          <span class="font-mono">ESP32: {{ nodeLabel }}</span>
        </div>

        <!-- Settings / Configuration Button -->
        <button
          @click="$emit('open-settings')"
          title="Configure MQTT Broker"
          class="p-1.5 rounded-lg border border-gray-800 bg-gray-900/90 hover:bg-gray-800 text-slate-300 hover:text-white transition-colors"
        >
          <Settings class="w-4 h-4" />
        </button>

        <!-- Quick Reconnect Button -->
        <button
          @click="$emit('reconnect')"
          :disabled="brokerStatus === 'connecting'"
          title="Reconnect to Broker"
          class="p-1.5 rounded-lg border border-gray-800 bg-gray-900/90 hover:bg-gray-800 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': brokerStatus === 'connecting' || brokerStatus === 'reconnecting' }" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { Cpu, Settings, RefreshCw } from 'lucide-vue-next'

const props = defineProps({
  brokerStatus: {
    type: String,
    required: true
  },
  nodeStatus: {
    type: String,
    required: true
  },
  deviceId: {
    type: String,
    default: 'esp32-node-01'
  }
})

defineEmits(['open-settings', 'reconnect'])

const brokerLabel = computed(() => {
  switch (props.brokerStatus) {
    case 'connected':
      return 'Connected'
    case 'connecting':
      return 'Connecting...'
    case 'reconnecting':
      return 'Reconnecting'
    case 'error':
      return 'Error'
    default:
      return 'Disconnected'
  }
})

const brokerBadgeClass = computed(() => {
  switch (props.brokerStatus) {
    case 'connected':
      return 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 shadow-glow-emerald'
    case 'connecting':
    case 'reconnecting':
      return 'bg-amber-950/40 text-amber-300 border-amber-800/60'
    case 'error':
    default:
      return 'bg-red-950/40 text-red-300 border-red-800/60'
  }
})

const brokerDotColor = computed(() => {
  switch (props.brokerStatus) {
    case 'connected':
      return 'bg-emerald-400'
    case 'connecting':
    case 'reconnecting':
      return 'bg-amber-400'
    default:
      return 'bg-red-400'
  }
})

const nodeLabel = computed(() => {
  switch (props.nodeStatus) {
    case 'online':
      return 'Online'
    case 'offline':
      return 'Offline'
    default:
      return 'Waiting...'
  }
})

const nodeBadgeClass = computed(() => {
  switch (props.nodeStatus) {
    case 'online':
      return 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
    case 'offline':
      return 'bg-red-950/40 text-red-300 border-red-800/60'
    default:
      return 'bg-gray-800/60 text-slate-400 border-gray-700/60'
  }
})

const nodeDotColor = computed(() => {
  switch (props.nodeStatus) {
    case 'online':
      return 'bg-emerald-400'
    case 'offline':
      return 'bg-red-500'
    default:
      return 'bg-slate-500'
  }
})
</script>
