// Default configuration loaded from IoT.cc
export const DEFAULT_MQTT_CONFIG = {
  host: '9c3815f453e74eb8bed11ff4ff0a0d7a.s1.eu.hivemq.cloud',
  port: 8884,
  path: '/mqtt',
  protocol: 'wss',
  username: '008',
  password: 'tel0rmataSapi',
  clientIdPrefix: 'web-client-',
  deviceId: 'esp32-node-01',
  topics: {
    telemetry: 'iot/esp32/dht22/telemetry',
    ledSet: 'iot/esp32/led/set',
    ledStatus: 'iot/esp32/led/status',
    nodeStatus: 'iot/esp32/node/status',
  }
}

const STORAGE_KEY = 'iot_mqtt_config_v1'

export function getMqttConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return { ...DEFAULT_MQTT_CONFIG, ...JSON.parse(saved) }
    }
  } catch (e) {
    console.warn('Failed to load MQTT config from localStorage, using defaults', e)
  }
  return { ...DEFAULT_MQTT_CONFIG }
}

export function saveMqttConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch (e) {
    console.error('Failed to save MQTT config to localStorage', e)
  }
}

export function resetMqttConfig() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.error('Failed to reset MQTT config', e)
  }
  return { ...DEFAULT_MQTT_CONFIG }
}
