<template>
  <div class="rounded-2xl bg-gray-900/90 border border-gray-800 p-5 shadow-xl backdrop-blur-sm">
    <!-- Header with actions -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center text-slate-300">
          <List class="w-4 h-4" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">
              TRANSMISSION EVENT FEED
            </span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-slate-300 border border-gray-700">
              Last {{ logs.length }}/10 Events
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">
            Real-time ingress & egress MQTT message audit log
          </p>
        </div>
      </div>

      <!-- Actions: Copy & Clear -->
      <div class="flex items-center gap-2">
        <button
          v-if="logs.length > 0"
          @click="copyAllLogs"
          title="Copy log JSON to clipboard"
          class="flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded-lg border border-gray-800 bg-gray-900 hover:bg-gray-800 text-slate-300 hover:text-white transition-colors"
        >
          <component :is="copied ? Check : Copy" class="w-3.5 h-3.5" :class="{ 'text-emerald-400': copied }" />
          <span>{{ copied ? 'Copied' : 'Export' }}</span>
        </button>

        <button
          v-if="logs.length > 0"
          @click="$emit('clear')"
          title="Clear logs"
          class="flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded-lg border border-gray-800 bg-gray-900 hover:bg-red-950/40 text-slate-400 hover:text-red-400 hover:border-red-800/40 transition-colors"
        >
          <Trash2 class="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>
    </div>

    <!-- Table Container -->
    <div class="max-h-60 overflow-y-auto rounded-xl border border-gray-800/80 bg-gray-950/50">
      <table class="w-full text-left border-collapse text-xs">
        <thead class="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
          <tr>
            <th class="py-2.5 px-3 w-24">Timestamp</th>
            <th class="py-2.5 px-3 w-20">Direction</th>
            <th class="py-2.5 px-3 w-48 hidden sm:table-cell">Topic</th>
            <th class="py-2.5 px-3">Payload Details</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800/60 font-mono">
          <tr
            v-for="log in logs"
            :key="log.id"
            class="hover:bg-gray-800/40 transition-colors cursor-pointer group"
            @click="toggleExpand(log.id)"
          >
            <!-- Time -->
            <td class="py-2.5 px-3 text-slate-400 font-medium whitespace-nowrap">
              {{ log.time }}
            </td>

            <!-- Direction Badge -->
            <td class="py-2.5 px-3 whitespace-nowrap">
              <span
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase border"
                :class="[
                  log.direction === 'in'
                    ? 'bg-sky-950/60 text-sky-400 border-sky-800/50'
                    : 'bg-indigo-950/60 text-indigo-300 border-indigo-800/50'
                ]"
              >
                <span>{{ log.direction === 'in' ? 'Rx' : 'Tx' }}</span>
              </span>
            </td>

            <!-- Topic -->
            <td class="py-2.5 px-3 text-slate-300 truncate max-w-[180px] hidden sm:table-cell" :title="log.topic">
              {{ log.topic }}
            </td>

            <!-- Payload summary -->
            <td class="py-2.5 px-3 text-slate-300">
              <div class="flex items-center justify-between gap-2">
                <span class="truncate max-w-xs sm:max-w-md text-slate-300">
                  {{ formatPayload(log.payload) }}
                </span>
                <span class="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {{ expandedId === log.id ? 'Collapse ▲' : 'Inspect ▼' }}
                </span>
              </div>

              <!-- Expanded payload inspector -->
              <div
                v-if="expandedId === log.id"
                class="mt-2 p-2.5 bg-gray-900 border border-gray-800 rounded-lg text-[11px] text-slate-200 overflow-x-auto whitespace-pre font-mono"
              >
                {{ JSON.stringify(log.payload, null, 2) }}
              </div>
            </td>
          </tr>

          <tr v-if="logs.length === 0">
            <td colspan="4" class="py-8 text-center text-slate-500 font-mono text-xs">
              No transmission events recorded yet. Connect to broker to monitor live packets.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { List, Trash2, Copy, Check } from 'lucide-vue-next'

const props = defineProps({
  logs: {
    type: Array,
    default: () => []
  }
})

defineEmits(['clear'])

const expandedId = ref(null)
const copied = ref(false)

function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id
}

function formatPayload(payload) {
  if (typeof payload === 'string') return payload
  try {
    return JSON.stringify(payload)
  } catch {
    return String(payload)
  }
}

async function copyAllLogs() {
  try {
    const data = JSON.stringify(props.logs, null, 2)
    await navigator.clipboard.writeText(data)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy logs', err)
  }
}
</script>
