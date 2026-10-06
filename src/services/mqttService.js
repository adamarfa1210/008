import mqtt from 'mqtt'
import { ref, reactive, computed } from 'vue'
import { getMqttConfig } from '../config/mqtt'

// Reactive State
export const brokerStatus = ref('disconnected') // 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'
export const brokerErrorMessage = ref('')
export const nodeStatus = ref('unknown') // 'online' | 'offline' | 'unknown'
export const lastNodeSeen = ref(null)

export const currentTelemetry = reactive({
  temperature: null,
  humidity: null,
  deviceId: 'esp32-node-01',
  timestamp: null,
  rawTimestamp: null
})

export const telemetryHistory = ref([]) // Max 20 points
export const MAX_TELEMETRY_POINTS = 20

export const ledState = ref(false)
export const isLedPending = ref(false)
let ledPendingTimeout = null

export const eventLogs = ref([]) // Max 10 items
export const MAX_EVENT_LOGS = 10

let mqttClient = null
let currentConfig = null
let reconnectAttempts = 0
const BASE_RECONNECT_MS = 2000
const MAX_RECONNECT_MS = 30000

function formatTime(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleTimeString('en-GB', { hour12: false })
}

function addEventLog(direction, topic, payloadRaw) {
  let parsed = payloadRaw
  if (typeof payloadRaw === 'string') {
    try {
      parsed = JSON.parse(payloadRaw)
    } catch {
      parsed = payloadRaw
    }
  }

  const logEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    time: formatTime(),
    topic,
    direction, // 'in' or 'out'
    payload: parsed
  }

  eventLogs.value.unshift(logEntry)
  if (eventLogs.value.length > MAX_EVENT_LOGS) {
    eventLogs.value.pop()
  }
}

export function initMqttClient(customConfig = null) {
  if (mqttClient) {
    try {
      mqttClient.end(true)
    } catch (e) {
      console.warn('Error closing existing client:', e)
    }
  }

  currentConfig = customConfig || getMqttConfig()
  reconnectAttempts = 0
  brokerStatus.value = 'connecting'
  brokerErrorMessage.value = ''

  const brokerUrl = `${currentConfig.protocol}://${currentConfig.host}:${currentConfig.port}${currentConfig.path}`
  const clientId = `${currentConfig.clientIdPrefix}${Math.random().toString(16).substring(2, 10)}`

  try {
    mqttClient = mqtt.connect(brokerUrl, {
      clientId,
      username: currentConfig.username,
      password: currentConfig.password,
      clean: true,
      reconnectPeriod: BASE_RECONNECT_MS,
      connectTimeout: 10000
    })

    mqttClient.on('connect', () => {
      brokerStatus.value = 'connected'
      brokerErrorMessage.value = ''
      reconnectAttempts = 0
      mqttClient.options.reconnectPeriod = BASE_RECONNECT_MS

      // Subscribe to all required topics
      const topics = [
        currentConfig.topics.telemetry,
        currentConfig.topics.ledStatus,
        currentConfig.topics.nodeStatus
      ]

      mqttClient.subscribe(topics, { qos: 1 }, (err) => {
        if (err) {
          console.error('[MQTT] Subscription error:', err)
          brokerErrorMessage.value = `Sub error: ${err.message}`
        }
      })
    })

    mqttClient.on('reconnect', () => {
      reconnectAttempts++
      brokerStatus.value = 'reconnecting'
      // Exponential backoff
      const nextDelay = Math.min(BASE_RECONNECT_MS * Math.pow(1.5, reconnectAttempts), MAX_RECONNECT_MS)
      mqttClient.options.reconnectPeriod = nextDelay
    })

    mqttClient.on('close', () => {
      if (brokerStatus.value !== 'reconnecting') {
        brokerStatus.value = 'disconnected'
      }
    })

    mqttClient.on('offline', () => {
      brokerStatus.value = 'reconnecting'
    })

    mqttClient.on('error', (err) => {
      console.error('[MQTT] Client error:', err)
      brokerStatus.value = 'error'
      brokerErrorMessage.value = err.message || 'Connection error'
    })

    mqttClient.on('message', (topic, message) => {
      handleIncomingMessage(topic, message.toString())
    })
  } catch (err) {
    brokerStatus.value = 'error'
    brokerErrorMessage.value = err.message || 'Failed to initialize MQTT'
  }
}

function handleIncomingMessage(topic, payloadString) {
  addEventLog('in', topic, payloadString)

  let data
  try {
    data = JSON.parse(payloadString)
  } catch (err) {
    console.warn(`[MQTT] Invalid JSON on topic ${topic}:`, payloadString)
    return
  }

  // Handle Telemetry
  if (topic === currentConfig.topics.telemetry) {
    const temp = Number(data.temperature)
    const hum = Number(data.humidity)
    const nowTime = formatTime()

    if (!isNaN(temp) && !isNaN(hum)) {
      currentTelemetry.temperature = temp
      currentTelemetry.humidity = hum
      currentTelemetry.deviceId = data.device_id || currentConfig.deviceId
      currentTelemetry.timestamp = nowTime
      currentTelemetry.rawTimestamp = data.timestamp || Date.now()

      // ESP32 is actively communicating
      nodeStatus.value = 'online'
      lastNodeSeen.value = new Date()

      // Maintain rolling history of last 20 data points
      telemetryHistory.value.push({
        time: nowTime,
        temperature: temp,
        humidity: hum
      })

      if (telemetryHistory.value.length > MAX_TELEMETRY_POINTS) {
        telemetryHistory.value.shift()
      }
    }
  }

  // Handle LED Status Confirmation
  else if (topic === currentConfig.topics.ledStatus) {
    if (data.state !== undefined) {
      ledState.value = data.state === 1
      isLedPending.value = false
      if (ledPendingTimeout) {
        clearTimeout(ledPendingTimeout)
        ledPendingTimeout = null
      }
    }
  }

  // Handle Node Status (LWT and Online Announcement)
  else if (topic === currentConfig.topics.nodeStatus) {
    if (data.status === 'online') {
      nodeStatus.value = 'online'
      lastNodeSeen.value = new Date()
    } else if (data.status === 'offline') {
      nodeStatus.value = 'offline'
    }
  }
}

export function publishLedCommand(desiredState) {
  if (!mqttClient || brokerStatus.value !== 'connected') {
    console.warn('[MQTT] Cannot publish: Broker not connected')
    return false
  }

  const payload = {
    target: 'builtin_led',
    state: desiredState ? 1 : 0
  }

  isLedPending.value = true

  // Optimistic lock timeout: if no confirmation in 6 seconds, reset pending
  if (ledPendingTimeout) clearTimeout(ledPendingTimeout)
  ledPendingTimeout = setTimeout(() => {
    if (isLedPending.value) {
      console.warn('[MQTT] Actuator command confirmation timeout')
      isLedPending.value = false
    }
  }, 6000)

  const payloadString = JSON.stringify(payload)
  addEventLog('out', currentConfig.topics.ledSet, payload)

  mqttClient.publish(currentConfig.topics.ledSet, payloadString, { qos: 1 }, (err) => {
    if (err) {
      console.error('[MQTT] Failed to publish LED command:', err)
      isLedPending.value = false
    }
  })

  return true
}

export function disconnectMqtt() {
  if (mqttClient) {
    try {
      mqttClient.end(true)
    } catch (e) {
      console.warn('Error ending client:', e)
    }
    brokerStatus.value = 'disconnected'
  }
}

export function clearLogs() {
  eventLogs.value = []
}
