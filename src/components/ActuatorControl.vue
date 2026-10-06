<template>
  <div
    class="rounded-2xl bg-gray-900/90 border p-5 shadow-xl backdrop-blur-sm transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
    :class="[
      ledState
        ? 'border-sky-500/50 shadow-glow-sky'
        : 'border-gray-800 hover:border-gray-700'
    ]"
  >
    <!-- Background Ambient Glow when LED is ON -->
    <div
      v-if="ledState"
      class="absolute -top-10 -right-10 w-40 h-40 bg-sky-500 rounded-full blur-3xl pointer-events-none opacity-20 transition-opacity duration-500"
    ></div>

    <div>
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">
            HARDWARE ACTUATOR
          </span>
          <span class="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-sky-500/10 text-sky-400">
            GPIO 2
          </span>
        </div>
        <div
          class="w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-300"
          :class="[
            ledState
              ? 'bg-sky-500/20 border-sky-400/50 text-sky-300 shadow-glow-sky'
              : 'bg-gray-800/60 border-gray-700/60 text-slate-400'
          ]"
        >
          <Lightbulb class="w-4 h-4 transition-transform duration-300" :class="{ 'scale-110 text-sky-300': ledState }" />
        </div>
      </div>

      <!-- Actuator Target Description -->
      <div class="mb-5">
        <h3 class="text-base font-bold text-slate-100 flex items-center gap-2">
          <span>On-Board SMD LED</span>
          <span
            class="text-[10px] font-mono px-2 py-0.5 rounded-full border transition-colors duration-300"
            :class="[
              ledState
                ? 'bg-sky-950/80 text-sky-300 border-sky-500/40'
                : 'bg-gray-800 text-slate-400 border-gray-700'
            ]"
          >
            {{ ledState ? 'ON (HIGH)' : 'OFF (LOW)' }}
          </span>
        </h3>
        <p class="text-xs text-slate-400 mt-1">
          Controls on-board Blue LED on ESP32 DevKit V1 via <span class="font-mono text-slate-300">iot/esp32/led/set</span>
        </p>
      </div>
    </div>

    <!-- Interactive Switch & Controls -->
    <div class="pt-4 border-t border-gray-800/80 flex items-center justify-between gap-4">
      <!-- State Indicator & Confirmation status -->
      <div class="flex items-center gap-2">
        <div
          class="w-3 h-3 rounded-full transition-all duration-300"
          :class="[
            isPending
              ? 'bg-amber-400 animate-ping'
              : ledState
              ? 'bg-sky-400 shadow-glow-sky'
              : 'bg-gray-600'
          ]"
        ></div>
        <span class="text-xs font-mono text-slate-300">
          <template v-if="isPending">
            <span class="text-amber-300 flex items-center gap-1.5">
              <Loader2 class="w-3 h-3 animate-spin" />
              Syncing...
            </span>
          </template>
          <template v-else>
            {{ ledState ? 'State: Active' : 'State: Standby' }}
          </template>
        </span>
      </div>

      <!-- Prominent Tactile Switch -->
      <div class="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          :aria-checked="ledState"
          :disabled="isPending || !canControl"
          @click="toggle"
          class="relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          :class="[
            ledState
              ? 'bg-sky-500 border-sky-400 shadow-glow-sky'
              : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
          ]"
        >
          <span class="sr-only">Toggle Built-in LED</span>
          <span
            aria-hidden="true"
            class="pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out -translate-y-[1px]"
            :class="[
              ledState ? 'translate-x-8 bg-white' : 'translate-x-0 bg-slate-300'
            ]"
          >
            <span class="flex h-full w-full items-center justify-center">
              <Zap v-if="ledState" class="h-3.5 w-3.5 text-sky-600 fill-sky-600" />
              <Power v-else class="h-3.5 w-3.5 text-gray-600" />
            </span>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Lightbulb, Zap, Power, Loader2 } from 'lucide-vue-next'

const props = defineProps({
  ledState: {
    type: Boolean,
    default: false
  },
  isPending: {
    type: Boolean,
    default: false
  },
  canControl: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['toggle'])

function toggle() {
  if (props.isPending || !props.canControl) return
  emit('toggle', !props.ledState)
}
</script>
