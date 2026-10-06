<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity"
    @click.self="$emit('close')"
  >
    <div
      class="w-full max-w-lg rounded-2xl bg-gray-900 border border-gray-800 p-6 shadow-2xl relative overflow-hidden"
    >
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-gray-800">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Sliders class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-100">Broker & Connection Settings</h3>
            <p class="text-xs text-slate-400 font-mono">HiveMQ Cloud WebSocket (WSS) Configuration</p>
          </div>
        </div>
        <button
          @click="$emit('close')"
          class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleSave" class="mt-4 space-y-3.5 text-xs font-mono">
        <!-- Host -->
        <div>
          <label class="block text-slate-300 mb-1 font-sans font-medium">Broker Host / Cluster Domain</label>
          <input
            v-model="form.host"
            type="text"
            required
            class="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:border-sky-500 focus:outline-none text-slate-200"
            placeholder="example.s1.eu.hivemq.cloud"
          />
        </div>

        <!-- Port & Path -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-slate-300 mb-1 font-sans font-medium">Port (WSS TLS)</label>
            <input
              v-model.number="form.port"
              type="number"
              required
              class="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:border-sky-500 focus:outline-none text-slate-200"
              placeholder="8884"
            />
          </div>
          <div>
            <label class="block text-slate-300 mb-1 font-sans font-medium">WebSocket Path</label>
            <input
              v-model="form.path"
              type="text"
              required
              class="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:border-sky-500 focus:outline-none text-slate-200"
              placeholder="/mqtt"
            />
          </div>
        </div>

        <!-- Credentials -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-slate-300 mb-1 font-sans font-medium">MQTT Username</label>
            <input
              v-model="form.username"
              type="text"
              class="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:border-sky-500 focus:outline-none text-slate-200"
              placeholder="008"
            />
          </div>
          <div>
            <label class="block text-slate-300 mb-1 font-sans font-medium">MQTT Password</label>
            <input
              v-model="form.password"
              type="password"
              class="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:border-sky-500 focus:outline-none text-slate-200"
              placeholder="••••••••"
            />
          </div>
        </div>

        <!-- Device ID -->
        <div>
          <label class="block text-slate-300 mb-1 font-sans font-medium">Target ESP32 Device ID</label>
          <input
            v-model="form.deviceId"
            type="text"
            required
            class="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 focus:border-sky-500 focus:outline-none text-slate-200"
            placeholder="esp32-node-01"
          />
        </div>

        <!-- Topics preview -->
        <div class="pt-2 text-[11px] text-slate-400 space-y-1 bg-gray-950/60 p-3 rounded-lg border border-gray-800/80">
          <div class="font-sans font-semibold text-slate-300 mb-1">Active MQTT Topics:</div>
          <div>Telemetry: <span class="text-amber-400">{{ form.topics.telemetry }}</span></div>
          <div>LED Command: <span class="text-sky-400">{{ form.topics.ledSet }}</span></div>
          <div>LED Status: <span class="text-sky-400">{{ form.topics.ledStatus }}</span></div>
          <div>Node LWT: <span class="text-emerald-400">{{ form.topics.nodeStatus }}</span></div>
        </div>

        <!-- Action Buttons -->
        <div class="pt-3 flex items-center justify-between gap-3 border-t border-gray-800">
          <button
            type="button"
            @click="handleReset"
            class="px-3 py-2 rounded-lg border border-gray-800 bg-gray-800 hover:bg-gray-700 text-slate-300 hover:text-white transition-colors text-xs"
          >
            Reset Defaults
          </button>
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="$emit('close')"
              class="px-3 py-2 rounded-lg border border-gray-800 hover:bg-gray-800 text-slate-400 hover:text-slate-200 transition-colors text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition-all text-xs shadow-glow-sky"
            >
              Save & Reconnect
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { Sliders, X } from 'lucide-vue-next'
import { DEFAULT_MQTT_CONFIG } from '../config/mqtt'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  currentConfig: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'save', 'reset'])

const form = reactive({ ...DEFAULT_MQTT_CONFIG })

watch(
  () => props.currentConfig,
  (newVal) => {
    if (newVal) {
      Object.assign(form, JSON.parse(JSON.stringify(newVal)))
    }
  },
  { immediate: true, deep: true }
)

function handleSave() {
  emit('save', JSON.parse(JSON.stringify(form)))
  emit('close')
}

function handleReset() {
  Object.assign(form, JSON.parse(JSON.stringify(DEFAULT_MQTT_CONFIG)))
  emit('reset')
  emit('close')
}
</script>
