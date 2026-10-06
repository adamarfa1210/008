<template>
  <div
    class="rounded-2xl bg-gray-900/90 border p-5 shadow-xl backdrop-blur-sm transition-all duration-300 relative overflow-hidden"
    :class="[
      accent === 'temp'
        ? 'border-amber-900/40 hover:border-amber-500/50 hover:shadow-glow-amber'
        : 'border-cyan-900/40 hover:border-cyan-500/50 hover:shadow-glow-cyan'
    ]"
  >
    <!-- Background Ambient Glow -->
    <div
      class="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-20"
      :class="accent === 'temp' ? 'bg-amber-500' : 'bg-cyan-500'"
    ></div>

    <!-- Top Bar: Title & Icon -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {{ title }}
        </span>
        <span
          class="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium"
          :class="accent === 'temp' ? 'bg-amber-500/10 text-amber-400' : 'bg-cyan-500/10 text-cyan-400'"
        >
          DHT22
        </span>
      </div>
      <div
        class="w-8 h-8 rounded-lg flex items-center justify-center border"
        :class="[
          accent === 'temp'
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
        ]"
      >
        <slot name="icon"></slot>
      </div>
    </div>

    <!-- Main Metric Value Display -->
    <div class="flex items-baseline gap-2 mb-4">
      <span
        v-if="value !== null && value !== undefined"
        class="text-4xl md:text-5xl font-extrabold tracking-tight font-mono transition-all duration-200"
        :class="[
          accent === 'temp'
            ? 'text-amber-400 drop-shadow-[0_2px_10px_rgba(245,158,11,0.3)]'
            : 'text-cyan-400 drop-shadow-[0_2px_10px_rgba(6,182,212,0.3)]'
        ]"
      >
        {{ formattedValue }}
      </span>
      <span
        v-else
        class="text-4xl md:text-5xl font-extrabold tracking-tight font-mono text-slate-600 animate-pulse"
      >
        --.-
      </span>
      <span class="text-lg font-mono font-semibold text-slate-400">
        {{ unit }}
      </span>
    </div>

    <!-- Sub-bar: Min / Max / Average & Status -->
    <div class="pt-3 border-t border-gray-800/80 grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-400">
      <div>
        <span class="text-slate-500 block text-[10px] uppercase">Min</span>
        <span class="font-medium text-slate-300">{{ min !== null ? min.toFixed(1) : '--' }} {{ unit }}</span>
      </div>
      <div>
        <span class="text-slate-500 block text-[10px] uppercase">Avg</span>
        <span class="font-medium text-slate-300">{{ avg !== null ? avg.toFixed(1) : '--' }} {{ unit }}</span>
      </div>
      <div>
        <span class="text-slate-500 block text-[10px] uppercase">Max</span>
        <span class="font-medium text-slate-300">{{ max !== null ? max.toFixed(1) : '--' }} {{ unit }}</span>
      </div>
    </div>

    <!-- Footer timestamp note -->
    <div class="mt-2.5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
      <span>{{ statusTag }}</span>
      <span v-if="timestamp">Updated: {{ timestamp }}</span>
      <span v-else>Awaiting packet</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    default: null
  },
  unit: {
    type: String,
    default: ''
  },
  accent: {
    type: String,
    default: 'temp', // 'temp' | 'humidity'
    validator: (v) => ['temp', 'humidity'].includes(v)
  },
  min: {
    type: Number,
    default: null
  },
  max: {
    type: Number,
    default: null
  },
  avg: {
    type: Number,
    default: null
  },
  timestamp: {
    type: String,
    default: ''
  },
  statusTag: {
    type: String,
    default: ''
  }
})

const formattedValue = computed(() => {
  if (props.value === null || props.value === undefined) return '--.-'
  return props.value.toFixed(1)
})
</script>
