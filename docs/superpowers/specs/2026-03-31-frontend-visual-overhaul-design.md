# TradeCraft Frontend Visual Overhaul — Design Specification

**Date:** 2026-03-31
**Status:** Draft
**Scope:** Full UI redesign with focus on polish, data visualization, and modern trends

---

## Overview

TradeCraft needs a comprehensive visual overhaul to feel like a premium SaaS product. This redesign addresses four key pain points:

1. **Landing Page** — Generic, weak first impression
2. **Data Cards/Tables** — Flat numbers, hard to scan
3. **Navigation/Sidebar** — Clunky, unintuitive
4. **Overall Cohesion** — Pages feel disconnected

**Approach:** Hybrid — Build design system foundation, redesign Navigation/Layout first (unifies immediately), then Landing Page (high impact), then data displays.

---

## Section 1: Design System Foundation

### Color Palette

**Theme Name:** "Carbon & Emerald" — Finance-grade dark theme with emerald accents.

```
Background Hierarchy:
┌─────────────────────────────────────────────────────┐
│ Canvas (base):        #09090B (near-black)          │
│ Surface (cards):      #121214 (elevated)            │
│ Surface Raised:       #1A1A1D (interactive)         │
│ Surface Overlay:      #222226 (modals/dropdowns)    │
└─────────────────────────────────────────────────────┘

Text Hierarchy:
┌─────────────────────────────────────────────────────┐
│ Primary:              #FAFAFA (white)               │
│ Secondary:            #A1A1AA (muted)              │
│ Tertiary:             #52525B (subtle)             │
│ Disabled:             #3F3F46                       │
└─────────────────────────────────────────────────────┘

Accent Colors:
┌─────────────────────────────────────────────────────┐
│ Emerald (primary):    #10B981 → #34D399 (gradients) │
│ Emerald Glow:         rgba(16, 185, 129, 0.15)     │
│ Blue (secondary):     #3B82F6 (info, links)        │
│ Purple (tertiary):    #A855F7 (QuantGen, AI)       │
│ Amber (warning):      #F59E0B                       │
│ Red (negative):       #EF4444                       │
└─────────────────────────────────────────────────────┘

Data Visualization:
┌─────────────────────────────────────────────────────┐
│ Positive:             #10B981 (green)              │
│ Negative:             #EF4444 (red)               │
│ Neutral:              #71717A (gray)               │
│ Charts:               Gradient palette             │
└─────────────────────────────────────────────────────┘
```

### Typography Scale

```
Font Family:
- Display:          Inter (headings, body)
- Data/Code:        JetBrains Mono (numbers, code)

Display Scale:
┌─────────────────────────────────────────────────────┐
│ Hero Title:        72px / 1.0  / -0.04em tracking  │
│ Section Title:     48px / 1.1  / -0.02em           │
│ Page Title:        32px / 1.2 / -0.02em            │
└─────────────────────────────────────────────────────┘

Body Scale:
┌─────────────────────────────────────────────────────┐
│ Large:             18px / 1.6  (descriptions)      │
│ Regular:           16px / 1.6  (body text)         │
│ Small:             14px / 1.5  (secondary)         │
│ Micro:             12px / 1.4  (labels, captions)  │
└─────────────────────────────────────────────────────┘

Data Scale:
┌─────────────────────────────────────────────────────┐
│ Metric Large:      48px / 1.0 / tabular-nums       │
│ Metric:           24px / 1.1 / tabular-nums        │
│ Metric Small:     16px / 1.2 / tabular-nums         │
└─────────────────────────────────────────────────────┘
```

### Spacing System

```
Base unit: 4px

┌─────────────────────────────────────────────────────┐
│ xs:     4px   (tight gaps)                          │
│ sm:     8px   (element spacing)                    │
│ md:    16px   (default gaps)                       │
│ lg:    24px   (section spacing)                    │
│ xl:    32px   (major sections)                     │
│ 2xl:   48px   (page sections)                      │
│ 3xl:   64px   (hero spacing)                       │
└─────────────────────────────────────────────────────┘
```

### Border Radius

```
┌─────────────────────────────────────────────────────┐
│ sm:     6px   (badges, tags)                       │
│ md:    10px   (buttons, inputs)                    │
│ lg:    16px   (cards)                              │
│ xl:    24px   (large cards, modals)                │
│ full:  9999px   (pills, avatars)                    │
└─────────────────────────────────────────────────────┘
```

### Shadow System

```
┌─────────────────────────────────────────────────────┐
│ Glow:          0 0 20px rgba(16, 185, 129, 0.2)     │
│ Card:          0 4px 24px rgba(0, 0, 0, 0.4)        │
│ Elevated:      0 8px 32px rgba(0, 0, 0, 0.5)        │
│ Inset:         inset 0 2px 4px rgba(0, 0, 0, 0.3)  │
└─────────────────────────────────────────────────────┘
```

---

## Section 2: Core Components

### Button Variants

```tsx
// Primary Button
background: emerald-500
text: white
hover: emerald-400
active: emerald-600
shadow: subtle glow on hover

// Secondary Button
background: zinc-800
text: zinc-200
hover: zinc-700
border: zinc-700

// Ghost Button
background: transparent
text: zinc-400
hover: zinc-800 background
use: subtle actions, navigation

// Destructive Button
background: red-500
text: white
use: delete, remove actions
```

### Card System

```tsx
// Base Card
background: surface (#121214)
border: 1px zinc-800/60
radius: xl (24px)
shadow: card shadow
hover: subtle border brighten

// Data Card (stocks, metrics)
background: surface
border: zinc-800/60
accent-bar: left border in context color
use: stock tickers, metrics

// Stat Card
background: surface
border: zinc-800/60
layout: Label → Value → Change
glow: optional accent glow for highlights

// Feature Card (Landing)
background: gradient (tool-specific tint)
border: accent/30
hover: scale(1.02) + border brighten
glow: accent glow
```

### Data Display Components

```tsx
// Metric Display
value: metric-lg font, tabular-nums
label: text-sm text-zinc-400
change: color-coded (emerald/red) with arrow

// Badge/Tag
background: accent/15
text: accent-300
border: accent/30
radius: full
use: status, categories

// Progress Bar
track: zinc-800
fill: gradient (emerald-600 → emerald-400)
radius: full
glow: subtle on active

// Data Table Row
background: transparent
hover: zinc-800/40
border: bottom zinc-800/60
use: stock lists, results
```

### Input Components

```tsx
// Text Input
background: zinc-900
border: zinc-700
focus: emerald-500 border
placeholder: zinc-600
radius: md (10px)

// Select/Dropdown
background: surface-overlay (#222226)
border: zinc-700
hover: zinc-700
active: emerald-500 border

// Toggle
off: zinc-700 track, zinc-400 thumb
on: emerald-500 track, white thumb
transition: smooth (150ms)
```

---

## Section 3: Layout & Navigation System

### Sidebar Navigation

```
Structure:
┌────────────────────────────────────┐
│ Width:          260px (collapsed: 72px)
│ Position:      Fixed left, full height
│ Background:    Canvas with subtle right border
│ Sections:      Logo → Dashboard → Tools → Status
└────────────────────────────────────┘

Logo Section:
- Height:          72px
- Logo:            Emerald icon + "TradeCraft" wordmark
- Accent:          Subtle glow effect

Navigation Items:
- Height:          48px per item
- Padding:         16px horizontal
- Icon:            22px, zinc-500
- Text:            15px, zinc-400
- Active:          Background emerald/10, white text, emerald icon
- Hover:           Background zinc-800/60, zinc-200 text

Section Dividers:
- Label:           "DASHBOARD" / "TOOLS" (10px, uppercase, zinc-600)
- Spacing:         32px between sections

Collapsed State:
- Width:           72px
- Icons only, centered
- Tooltips on hover with delay
```

### Top Bar

```
Structure:
┌────────────────────────────────────┐
│ Height:          64px              │
│ Position:        Fixed top, left-offset by sidebar
│ Background:      Canvas with bottom border
│ Content:        [Toggle] ← Title → [Actions]
└────────────────────────────────────┘

Left:
- Menu toggle:     Ghost button

Center:
- Page title:      18px, white, font-semibold
- Breadcrumb:      Optional, for deep pages

Right:
- Quick actions:   Refresh, Settings (ghost buttons)
- Status:         Database connection indicator
```

### Content Area

```
Layout:
- Background:      Surface (#121214)
- Padding:         32px (desktop), 24px (tablet), 16px (mobile)
- Max-width:       1440px (centered)
- Overflow:        Scroll independently

Grid System:
- Columns:         12-column
- Gap:             24px (desktop), 16px (mobile)
- Card spans:      Full / 2/3 / 1/2 / 1/3 / 1/4

Responsive:
- Sidebar:         Hidden on mobile, overlay when open
- Cards:           Stack on mobile, grid on desktop
```

### Visual Hierarchy

```
Page Structure:
1. Page Header
   - Title + Description
   - Primary actions (right-aligned)
   - Status/metadata (secondary row)

2. Primary Content
   - Main data visualization or cards
   - Takes 2/3 or full width

3. Secondary Content
   - Details, related data
   - Sidebar or 1/3 width

4. Actions Footer
   - Optional, for multi-step flows
```

---

## Section 4: Landing Page Redesign

### Hero Section

```
Layout:
- Full viewport height (100vh)
- Background:
  - Radial gradient from top-center (emerald/5 → transparent)
  - Mesh overlay (subtle grid pattern)
  - Floating orbs (emerald/10, blur, animated)

Hero Content:
- Badge:          "PostgreSQL Powered" pill (emerald glow)
- Title:          "TradeCraft" (72px, font-bold, tight tracking)
- Subtitle:       Tagline with gradient text effect
- Description:    18px, zinc-400, max-width 600px

CTA Section:
- Primary:        "Launch Scanner" (emerald, prominent)
- Secondary:      "View Documentation" (ghost)

Stats Row:
- 4 columns (2 on mobile)
- Large numbers (48px)
- Labels below (14px, zinc-500)
- Subtle card backgrounds (surface)
- Hover:          Subtle lift + glow
```

### Feature Cards

```
Layout:
- 3 columns (stack on mobile)
- Gap:            32px
- Height:         Equal, content-aligned

Card Structure:
- Icon:           48px icon in accent-colored container (top)
- Title:          20px, white, font-semibold
- Description:    15px, zinc-400, 2 lines max
- Features:       Bullet list with accent dots
- CTA:           "Open Tool →" link

Visual Treatment:
- Background:     Surface with gradient tint (tool-specific)
  - Sector:       emerald/5 gradient
  - Screener:     blue/5 gradient
  - QuantGen:     purple/5 gradient
- Border:         zinc-800/60, accent/30 on hover
- Hover:          scale(1.02), accent border, glow
- Transition:     300ms ease

Card Assignments:
┌─────────────────────────────────────────────────────┐
│ Sector Rotation:                                    │
│ - Accent: emerald                                  │
│ - Icon: Activity                                   │
│ - Features: acceleration scan, momentum leaders    │
│            bollinger squeeze                        │
├─────────────────────────────────────────────────────┤
│ AI Screener:                                       │
│ - Accent: blue                                     │
│ - Icon: Search/Brain                               │
│ - Features: dormant giant, quant strategy, AI       │
├─────────────────────────────────────────────────────┤
│ QuantGen:                                          │
│ - Accent: purple                                   │
│ - Icon: Terminal/Code                              │
│ - Features: AI generation, VectorBT, optimization   │
└─────────────────────────────────────────────────────┘
```

### Motion & Interactions

```
Entrance Animation:
- Badge:          Fade up, 0.1s delay
- Title:          Fade up, 0.2s delay
- Subtitle:       Fade up, 0.3s delay
- Stats:          Staggered fade up, 0.4s start
- Cards:          Staggered fade up, 0.6s start

Hover Interactions:
- Stats:          Scale 1.02, border glow
- Feature Cards:  Scale 1.02, accent border, shadow lift
- CTAs:           Scale 1.05, glow intensify

Background Animation:
- Floating orbs:  Subtle float (keyframe, 20s cycle)
- Grid pattern:   Static, subtle opacity
```

### Footer Section

```
Content:
- Minimal, clean
- "Powered by PostgreSQL • React • FastAPI"
- Version number (small, zinc-600)

Position:
- Bottom of page
- Padding:        32px
- Text center
```

---

## Section 5: Data Displays Redesign

### Sector Rotation Page

```
Page Header:
- Icon + Title (32px, white)
- Description (16px, zinc-500)
- Actions: Refresh, Database status, Last updated

Sector Acceleration Chart:
- Height:          400px
- Background:     surface with subtle border
- Bar Chart:
  - Positive:     emerald gradient (emerald-600 → emerald-400)
  - Negative:     zinc-600
  - Selected:     emerald-400 glow
  - Hover:        Tooltip with sector details
- Grid:           zinc-800, dashed
- Animation:      Bars grow on load (staggered)

Selected Sector Panel (Right):
- Background:     surface with emerald/5 tint
- Border:        emerald/20
- Ranking Badge: "1st on Leaderboard" (emerald/15 bg)
- Ticker:        48px, white, bold
- Name:          18px, zinc-400
- Metrics:       3M/6M performance (tabular)
- Acceleration:  Large accent number with arrow
- Status Badge: "Momentum Strong" (emerald glow)

Stock Cards Grid:
- 3 columns, gap 24px
- Card Structure:
  - Ticker (24px) + Name (14px, zinc-500)
  - Price (right-aligned, 20px)
  - Performance bar (visual indicator)
  - Status badges: Price Breakout, Volume Spike, Bands Expanding
  - "Analyze Setup" button
- Triggered State:
  - emerald border glow
  - "TRIGGERED" badge (top-right, emerald bg)
  - Pulsing animation
```

### Stock Screener Page

```
Page Header:
- Icon (blue) + Title + Description
- Database status badge (right)

Mode Selection Section:
- Background:     surface
- 2-column grid (stack on mobile)
- Mode Cards:
  - Radio-style selection
  - Active:        accent border (emerald/blue)
  - Inactive:      zinc-800 border
  - Hover:         zinc-700 border
  - Content:      Title, description, agent tags

AI Toggle:
- Background:     surface
- Border:         zinc-800
- Toggle:         Large, prominent
- Description:    Dynamic text based on state
- Sparkles icon: Colored when active

Custom Prompt:
- Background:     zinc-900
- Border:         zinc-700
- Focus:          emerald border
- Placeholder:    Contextual, mode-specific

Scan Button:
- Full width, large
- Primary:        emerald when ready
- Disabled:       zinc-700 with spinner
- Icon + Text:   "Start AI Screen"

Progress Bar:
- Background:     zinc-800
- Fill:           Gradient by progress
  - 0-30%:        red
  - 30-70%:       amber
  - 70-100%:      emerald
- Animated:       Width transition + glow

Results Grid:
- 3 columns (2 on tablet, 1 on mobile)
- Card Structure:
  - Ticker + Signal badge (top)
  - Price (large, right)
  - Catalyst box (if present, emerald/10 bg)
  - Metrics grid: SMA, RSI, Volume
  - Footer: Analysis type badge
- Active Breakout: emerald glow border
- Fundamental:     purple glow border

AI Report Panel:
- Background:     purple/5 tint
- Border:         purple/20
- Collapsible:    Chevron toggle
- Content:        Prose-styled markdown
```

### QuantGen Page

```
Sub-Navigation (Left Rail):
- Width:          220px
- Background:     canvas
- Border:         Right zinc-800
- Items:          Home, Builder, Dashboard
- Active:         purple/15 bg, purple border, purple icon

Builder Page:
- Two-column layout
- Left (40%): Input section
  - Textarea:     Large, code-like placeholder
  - Tickers:      Tag-style, removable
  - Generate:     Primary (purple)
- Right (60%): Code preview
  - Header:       Language badge (Python)
  - Code area:    Syntax highlighted
  - Actions:      Run, Save buttons

Dashboard Page:
- Header:         "Dashboard" with filters
- Empty State:
  - Large icon (BarChart2)
  - Message: "No backtest results yet"
  - CTA: "Build a Strategy"
- Result Cards (when data):
  - Performance metrics grid
  - Equity curve chart
  - Trade log table
```

### Charts & Data Visualization

```
Recharts Theme:
- Background:     transparent
- Grid:           zinc-800, dashed
- Axis text:      zinc-500
- Tooltip:
  - Background:   surface-overlay (#222226)
  - Border:       zinc-700
  - Radius:       lg
  - Shadow:       elevated

Bar Chart:
- Bars:           Gradient fills
- Radius:         Top corners rounded (6px)
- Hover:          Brightness + tooltip

Line Chart:
- Lines:          2px stroke, smooth curve
- Gradient area: Below line (accent/20)
- Dots:           Visible on hover

Sparkline (inline):
- Height:         32px
- Stroke:         1.5px
- Color:          Context (emerald for positive)
```

---

## Implementation Order

1. **Design Tokens** — Update `tailwind.config.js` with new color system, typography, spacing
2. **CSS Variables** — Update `index.css` with new CSS custom properties
3. **Core Components** — Create reusable button, card, input components
4. **Layout System** — Redesign sidebar, top bar, content area
5. **Landing Page** — Complete redesign with new design system
6. **Sector Rotation** — Update charts, sector panel, stock cards
7. **Stock Screener** — Update mode selection, results grid, AI panel
8. **QuantGen** — Update sub-navigation, builder, dashboard
9. **Polish** — Micro-interactions, animations, final refinements

---

## Files to Modify

```
frontend/
├── tailwind.config.js          # Design tokens
├── src/
│   ├── styles/
│   │   └── index.css           # CSS variables, global styles
│   ├── components/
│   │   ├── layout/
│   │   │   └── Layout.tsx      # Sidebar, top bar
│   │   └── ui/                 # New: reusable components
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Badge.tsx
│   │       ├── Metric.tsx
│   │       └── Input.tsx
│   └── pages/
│       ├── Landing.tsx         # Hero, stats, feature cards
│       ├── SectorRotation.tsx  # Charts, sector panel, stock cards
│       ├── StockScreener.tsx   # Mode selection, results
│       └── QuantGen.tsx        # Builder, dashboard
```

---

## Success Criteria

1. **Cohesion** — All pages feel unified, same visual language
2. **Polish** — Subtle shadows, glows, transitions feel premium
3. **Data Clarity** — Numbers and charts are scannable, actionable
4. **Navigation** — Sidebar is intuitive, collapsed state works
5. **Landing Impact** — First impression is strong, professional
6. **Performance** — No degradation in load times