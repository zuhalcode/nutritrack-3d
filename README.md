# NutriTrack — Immersive 3D Nutrition Experience

> **Production-Quality Greenfield MVP** combining real-time 3D cinematic animation orchestration with verified nutrition data lookups from **USDA FoodData Central** and the **Indonesian Food Composition Tables (TKPI)**.

---

## 🌟 Highlights

- **Kinetic 3D Energy Core**: Real-time sculptural WebGL visualization built with Three.js & React Three Fiber.
- **Dynamic Metabolic Feedback**: Orbital rings, crystalline core, and procedural vortex particles respond dynamically to real nutritional state (caloric percentage, macro ratios, save shockwaves, and milestone bursts).
- **Automated Nutrition Calculations**: Users specify **only** food name and consumed weight in grams. Calories, protein, carbohydrates, fat, fiber, sugars, sodium, cholesterol, and caffeine are calculated automatically with strictly preserved missing-data semantics.
- **Provider Adapter**: Seamlessly integrates official **USDA FoodData Central API** with automatic fallback to verified Indonesian and international food composition records.
- **Versioned Local Persistence**: Client-side storage via Zustand `persist` with stable nutrient snapshots per food log entry.
- **Gamification Mechanics**: Experience Points (XP), dynamic levels, logging streaks, and non-duplicated milestone achievement notifications.
- **Accessibility & Fallbacks**: Fully compliant with `prefers-reduced-motion` and incorporates a high-fidelity 2D kinetic radial fallback when WebGL is unavailable.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js App Router (16.4.0) with Turbopack |
| **Language** | Strict TypeScript (5.x) |
| **Styling** | Tailwind CSS (4.x) with custom dark-first futuristic tokens |
| **3D Rendering** | Three.js (0.186.x), `@react-three/fiber` (9.8.x), `@react-three/drei` (10.7.x) |
| **UI Motion** | Motion for React (14.x) |
| **State & Persistence** | Zustand (5.x) with `persist` middleware (version 1) |
| **Validation** | Zod (4.x) |
| **Testing** | Vitest (5.x), Testing Library, JSDOM |
| **Icons** | Lucide React |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v20.x` or `v22.x` (tested on Node `v22.23.2`)
- **npm**: `10.x+`

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your USDA FoodData Central API key:
```env
# Server-only. Get key at: https://fdc.nal.usda.gov/api-key-signup.html
# If empty, the app runs in verified dataset mode with authentic USDA/TKPI staples.
USDA_FDC_API_KEY=your_usda_api_key_here
```

### 3. Installation & Run
```bash
# Install dependencies
npm install

# Run unit and integration tests
npm test

# Type-check
npx tsc --noEmit

# Lint
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

---

## 🧮 Automatic Calculation Formula

All canonical nutrients per reference basis (typically 100g) are calculated with pure, deterministic functions:

$$\text{CalculatedValue} = \frac{\text{ValuePerReference} \times \text{ConsumedGrams}}{\text{ReferenceBasisGrams}}$$

- **Missing Data Handling**: Unknown or unavailable nutrients are strictly kept as `null` with `isAvailable: false`. They are never converted into fabricated zeroes.
- **Precision**: Calculations maintain full IEEE-754 double precision internally and are rounded only at the presentation boundary (calories to integer, macros to 1 decimal place).

---

## 🧪 Test Suites

15 comprehensive unit & integration tests covering:
1. `src/tests/calculations.test.ts`: Formula calculations, zero/negative weight rejections, missing nutrient preservation, aggregations.
2. `src/tests/usda-adapter.test.ts`: USDA raw nutrient mappings, unit conversions (kJ/kcal, g/mg), search result filtering.
3. `src/tests/food-log-store.test.ts`: Immutable entry snapshots, daily total derivation, non-duplicated milestone awards, streak calculations.
4. `src/tests/animation-orchestrator.test.ts`: State machine transitions, energy pulses, celebration triggers, reduced motion toggles.
