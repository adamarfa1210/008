# Design System Specification

## Visual Direction
**Modern Industrial Cyber-Clean:** A dark-mode first, data-dense interface designed for clarity, rapid visual parsing, and tactile responsiveness during operational monitoring.

---

## 1. Color Palette

### 1.1 Base & Surfaces (Dark Mode Priority)
- **Background Root:** `#0B0F19` (Tailwind `slate-950`)
- **Card / Surface Default:** `#111827` (Tailwind `gray-900`)
- **Card Hover / Accent Surface:** `#1F2937` (Tailwind `gray-800`)
- **Border Subtle:** `#374151` (Tailwind `gray-700`)
- **Border Highlight:** `#4B5563` (Tailwind `gray-600`)

### 1.2 Brand & Accents
- **Primary / Cyber Blue:** `#0EA5E9` (Tailwind `sky-500`)
- **Primary Glow:** `rgba(14, 165, 233, 0.25)`
- **Secondary / Indigo:** `#6366F1` (Tailwind `indigo-500`)

### 1.3 Telemetry Semantic Accents
- **Temperature / Amber-Orange:**
  - Base: `#F59E0B` (Tailwind `amber-500`)
  - Glow: `rgba(245, 158, 11, 0.2)`
- **Humidity / Cyan-Teal:**
  - Base: `#06B6D4` (Tailwind `cyan-500`)
  - Glow: `rgba(6, 182, 212, 0.2)`
- **Online / Active Green:** `#10B981` (Tailwind `emerald-500`)
- **Offline / Alert Red:** `#EF4444` (Tailwind `red-500`)

---

## 2. Typography
- **Primary Font Family:** Inter, system-ui, -apple-system, sans-serif
- **Monospace (Numbers & Logs):** JetBrains Mono, Fira Code, monospace
- **Scale:**
  - `Display / Metric Numbers`: `text-4xl` or `text-5xl font-extrabold tracking-tight font-mono`
  - `Card Titles`: `text-sm font-medium uppercase tracking-wider text-slate-400`
  - `Body / Descriptions`: `text-sm text-slate-300 font-normal`
  - `Status Badges`: `text-xs font-semibold uppercase tracking-wider`

---

## 3. Component Specifications

### 3.1 Status Indicator Badge
- Pill shape (`rounded-full px-3 py-1 text-xs flex items-center gap-2`).
- Animated pulsing dot:
  - Green pulse when connected/online.
  - Red static dot when disconnected/offline.

### 3.2 Telemetry Metric Card
- Container: Rounded-2xl (`rounded-2xl bg-gray-900/90 border border-gray-800 p-5 shadow-xl backdrop-blur-sm`).
- Top Bar: Label (e.g., `TEMPERATURE`) and a discreet SVG icon.
- Main Value: Big typography with colored gradient accent.
- Sub-bar: Delta/Trend indicator or min/max values.

### 3.3 Dynamic Chart Container
- Real-time line chart with smoothed curves (`tension: 0.4`), gradient fills under the lines, dual Y-axes (Left: Temperature °C, Right: Humidity %).
- Legend on top-right with custom styling matching semantic colors.

### 3.4 Hardware Actuator Toggle Card
- Tactile switch toggle:
  - Container changes border highlight when active (`border-sky-500/50` when LED is ON).
  - Prominent toggle switch with glow effect in active state.
  - Status feedback badge: `ON (HIGH)` in bright cyan vs `OFF (LOW)` in muted gray.

### 3.5 Real-Time Log Feed Table
- Fixed height container with vertical scroll (`max-h-60 overflow-y-auto`).
- Alternating row background (`hover:bg-gray-800/40 transition-colors`).
- Monospace timestamp column with formatted local time `HH:mm:ss`.

---

## 4. Iconography
Use clean, minimal line SVGs (Lucide icons or Heroicons):
- **Temperature:** `Thermometer`
- **Humidity:** `Droplets`
- **LED / Actuator:** `Lightbulb` / `Zap`
- **Connection:** `Radio` / `Wifi`
- **Activity:** `Activity` / `List`