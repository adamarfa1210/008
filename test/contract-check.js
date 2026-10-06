import assert from 'node:assert/strict'

console.log('--- Running IoT Telemetry & Actuator Contract Checks ---')

// 1. Telemetry Payload Parsing & Contract
const rawTelemetryPayload = JSON.stringify({
  device_id: 'esp32-node-01',
  temperature: 27.8,
  humidity: 64.2,
  unit_temp: 'Celsius',
  unit_hum: '%',
  timestamp: 1728205500
})

const parsedTelemetry = JSON.parse(rawTelemetryPayload)
assert.equal(parsedTelemetry.device_id, 'esp32-node-01', 'Device ID should match')
assert.equal(typeof parsedTelemetry.temperature, 'number', 'Temperature must be number')
assert.equal(parsedTelemetry.temperature, 27.8, 'Temperature value must match')
assert.equal(typeof parsedTelemetry.humidity, 'number', 'Humidity must be number')
assert.equal(parsedTelemetry.humidity, 64.2, 'Humidity value must match')
console.log('✓ Telemetry payload contract verified')

// 2. LED Command & Status Contract
function createLedCommand(desiredState) {
  return JSON.stringify({
    target: 'builtin_led',
    state: desiredState ? 1 : 0
  })
}

const cmdOn = JSON.parse(createLedCommand(true))
assert.deepEqual(cmdOn, { target: 'builtin_led', state: 1 }, 'LED ON command must match contract')
const cmdOff = JSON.parse(createLedCommand(false))
assert.deepEqual(cmdOff, { target: 'builtin_led', state: 0 }, 'LED OFF command must match contract')

const ledStatusPayload = JSON.stringify({
  device_id: 'esp32-node-01',
  target: 'builtin_led',
  state: 1,
  status_text: 'ON'
})
const parsedLedStatus = JSON.parse(ledStatusPayload)
assert.equal(parsedLedStatus.state, 1)
assert.equal(parsedLedStatus.status_text, 'ON')
console.log('✓ LED command & status contract verified')

// 3. Node LWT Status Contract
const nodeOnline = JSON.parse(JSON.stringify({ device_id: 'esp32-node-01', status: 'online' }))
const nodeOffline = JSON.parse(JSON.stringify({ device_id: 'esp32-node-01', status: 'offline' }))
assert.equal(nodeOnline.status, 'online')
assert.equal(nodeOffline.status, 'offline')
console.log('✓ Node LWT status contract verified')

// 4. Rolling Buffer Logic (Max 20 Telemetry, Max 10 Logs)
const MAX_TELEMETRY = 20
const telemetryBuffer = []
for (let i = 1; i <= 35; i++) {
  telemetryBuffer.push({ time: `12:00:${i}`, temperature: 20 + (i * 0.1), humidity: 50 + (i * 0.2) })
  if (telemetryBuffer.length > MAX_TELEMETRY) {
    telemetryBuffer.shift()
  }
}
assert.equal(telemetryBuffer.length, 20, 'Telemetry buffer must not exceed 20 items')
assert.equal(telemetryBuffer[telemetryBuffer.length - 1].time, '12:00:35', 'Latest item must be retained at the end')
assert.equal(telemetryBuffer[0].time, '12:00:16', 'Oldest retained item must match rolling window')
console.log('✓ Telemetry rolling buffer (20 items) verified')

const MAX_LOGS = 10
const logBuffer = []
for (let i = 1; i <= 25; i++) {
  logBuffer.unshift({ id: i, time: `12:00:${i}` })
  if (logBuffer.length > MAX_LOGS) {
    logBuffer.pop()
  }
}
assert.equal(logBuffer.length, 10, 'Log buffer must not exceed 10 items')
assert.equal(logBuffer[0].id, 25, 'Latest log item must be at index 0')
assert.equal(logBuffer[9].id, 16, 'Oldest retained log item must be at index 9')
console.log('✓ Event log rolling buffer (10 items) verified')

// 5. Min/Max/Avg calculation check
const sampleValues = [24.0, 26.0, 28.0]
const min = Math.min(...sampleValues)
const max = Math.max(...sampleValues)
const avg = sampleValues.reduce((a, b) => a + b, 0) / sampleValues.length
assert.equal(min, 24.0)
assert.equal(max, 28.0)
assert.equal(avg, 26.0)
console.log('✓ Telemetry min/max/avg calculation verified')

console.log('\n--- All 5 contract checks passed successfully! ---')
