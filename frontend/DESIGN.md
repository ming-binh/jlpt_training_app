---
version: alpha
name: Postman
description: "A dark-first developer environment where Postman Orange (#FF6C37) ignites every send action against deep #1B1B1B surfaces, balancing dense request/response panes with IBM Plex Mono code and Inter UI for fast, focused API work."

colors:
  primary: "#FF6C37"
  on-primary: "#1B1B1B"
  primary-hover: "#FF7F50"
  primary-pressed: "#E25C2E"
  primary-subtle: "#3A2419"
  ink: "#F2F2F2"
  ink-muted: "#AEB3B9"
  ink-subdued: "#6B7178"
  canvas: "#1B1B1B"
  surface-1: "#262626"
  surface-2: "#2E2E2E"
  surface-3: "#383838"
  border: "#3D3D3D"
  border-strong: "#555555"
  method-get: "#6BDD9A"
  method-post: "#FFB84D"
  method-delete: "#F4756B"
  success: "#3BB273"
  warning: "#E5A93D"
  danger: "#F4493E"

typography:
  display:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.01em
  heading:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: 0em
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0em
  mono:
    fontFamily: "IBM Plex Mono, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0em

spacing:
  base: 4px
  scale: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64]

radius:
  sm: 3px
  md: 6px
  lg: 10px
  pill: 9999px

shadows:
  card: "0 1px 2px rgba(0,0,0,0.4)"
  elevated: "0 6px 16px rgba(0,0,0,0.5)"
  flyout: "0 16px 40px rgba(0,0,0,0.6)"

motion:
  duration-fast: 90ms
  duration-base: 160ms
  easing: cubic-bezier(0.2, 0, 0, 1)
---

## Rationale

**Dark is the default because developers live here** — Postman is a workbench, not a marketing surface. Engineers run it for hours beside a code editor and a terminal, so the canvas is a deep neutral #1B1B1B that reduces eye strain in dim rooms and lets syntax-highlighted payloads carry the color. Surfaces step up through #262626 and #2E2E2E to separate the request builder, response viewer, and sidebar without hard borders. The interface recedes so the data — headers, JSON bodies, status codes — stays the loudest thing on screen.

**Postman Orange means "send"** — #FF6C37 is the brand's signature and it is rationed like a scarce resource. It owns the Send button, active tabs, the selected collection, and focus rings — the moments that commit or locate work. Because orange on a dark field is genuinely vivid, a single accented control draws the eye instantly across a dense three-pane layout. Body text and chrome stay neutral grey so the orange never competes with itself, and a desaturated #3A2419 subtle tint handles selected-row backgrounds without shouting.

**Monospace is a semantic signal, not a style choice** — A URL, a header value, a JSON body, and a response are machine data, and IBM Plex Mono renders them so structure is unmistakable. Tabular alignment makes key/value editor rows scan cleanly, and a 1.6 line-height in code panes keeps deeply nested payloads legible. Inter carries the UI chrome — labels, buttons, menus — at a tight 13px because a request builder packs dozens of controls into a small space and throughput beats whitespace.

**HTTP methods are color-coded vocabulary** — GET, POST, DELETE, and friends each get a reserved hue (green, amber, red) so a method is identifiable before the word is read, in the dropdown, on saved requests, and down the collection tree. This is functional color: it encodes meaning that engineers parse at a glance while triaging a long collection, and it never bleeds into decorative use.

## 1. Visual Theme & Atmosphere
Postman feels like a focused, low-glare cockpit. The #1B1B1B canvas frames a classic three-pane workspace: a collection sidebar on the left, the request builder up top, and the response viewer below. Depth comes from subtle surface steps and thin #3D3D3D borders rather than shadow — only floating menus and modals lift off the canvas on a diffuse dark shadow. Syntax highlighting in the body and response panes provides the primary color in the interface; the chrome stays deliberately monochromatic so attention follows the payload.

The signature atmospheric beat is the Send moment: a prominent orange button anchored to the request bar, the one unmistakable call to action in a sea of neutral controls. Tabs across the top let an engineer keep many requests open at once, the active tab marked by an orange underline, reinforcing that this is a power tool built for parallel, long-session work.

## 2. Color System
**Dark foundation**:
- Canvas: #1B1B1B — app background, the base layer behind every pane
- Surface 1: #262626 — sidebar, request/response pane backgrounds
- Surface 2: #2E2E2E — input fields, key/value editor rows, hover fills
- Surface 3: #383838 — pressed states, raised toolbars
- Border: #3D3D3D — pane dividers and control outlines
- Border strong: #555555 — focused field edges, active separators

**Brand action**:
- Postman Orange: #FF6C37 — Send button, active tab underline, selection
- Hover: #FF7F50 — lighter on pointer over
- Pressed: #E25C2E — deeper, confirms commit
- Subtle: #3A2419 — selected collection/row tint on dark

**Text**:
- Ink: #F2F2F2 — primary labels, code, headings
- Muted: #AEB3B9 — secondary labels, metadata, descriptions
- Subdued: #6B7178 — disabled text, placeholders, tertiary hints

**Method & semantic**:
- GET green: #6BDD9A — safe reads
- POST amber: #FFB84D — writes/creates
- DELETE red: #F4756B — destructive
- Success: #3BB273 — 2xx status, passed tests
- Warning: #E5A93D — 3xx, pending
- Danger: #F4493E — 4xx/5xx, failed tests

Postman Orange is never used for body text or as a large fill behind content — it marks the action and the active location, nothing more.

## 3. Typography
Inter is the UI voice: a neutral, highly legible screen sans that holds up at the 13px size a dense developer tool demands. It runs 400 for body and 600 for headings, tab labels, and emphasis. Display titles (settings pages, empty states) reach 28px Semibold, section headings 18px, but most chrome lives at 13px because the request builder is a control-dense surface, not an editorial one.

IBM Plex Mono renders everything that is machine data: the URL bar, header and param values, request bodies, and the response viewer. Its even rhythm and clear zero/one disambiguation make JSON, XML, and tokens unambiguous, and a generous 1.6 line-height keeps nested payloads readable during a scroll. Monospace is the cue that says "this is data, not prose."

Numerals matter in the response meta row — status code, time in ms, and response size — which use the mono face so columns of figures stay aligned across requests.

## 4. Components & Patterns
**Request builder bar**:
- Method dropdown + URL input (mono) + orange Send button in one row
- Send is the single filled orange control; URL field uses surface-2 fill
- Save and overflow ("...") actions sit to the right, subtle until hover

**Method dropdown (GET/POST/...)**:
- Color-coded menu: GET green, POST amber, PUT/PATCH amber variants, DELETE red
- Selected method shows its hue as the dropdown label text
- Method color repeats wherever the saved request appears

**Request tabs**:
- Horizontal strip of open requests, each with method color + name + dirty dot
- Active tab marked by an orange underline; middle-click or x to close
- Supports many concurrent tabs — the core multi-request workflow

**Param / header editor**:
- Tabular key/value/description rows with enable checkboxes
- Mono values, bulk-edit toggle, auto-added blank row at the bottom
- Hover reveals delete; disabled rows dim to subdued ink

**Response viewer**:
- Status pill (color by class), time, and size in the meta row
- Body tabs: Pretty / Raw / Preview / Visualize, with syntax highlighting
- Headers, Cookies, and Test Results tabs below the body

**Collection sidebar**:
- Tree of collections > folders > requests, each request tagged by method color
- Selected item gets the #3A2419 subtle tint and an orange leading marker
- Search/filter field pinned to the top; right-click context menu per node

**Environment selector**:
- Top-right dropdown choosing the active environment (Local, Staging, Prod)
- {{variables}} resolve live; hovering a variable shows its current value
- Quick-edit opens the environment variable table in a side panel

**Console / log drawer**:
- Bottom drawer logging every sent request, network detail, and console.log
- Mono output, color-coded by level (info, warning, error)
- Collapsible; clears per session, essential for debugging scripts

**Test results panel**:
- Pass/fail list from pm.test assertions, green checks and red x marks
- Summary count of passed vs failed at the top
- Tied into collection runner output for batch runs

**Save / create modal**:
- Dark flyout lifted on a diffuse shadow, 10px corners
- Names the request and picks a destination collection/folder
- Primary orange confirm button, subtle cancel

## 5. Spacing & Layout
Postman uses a 4px base grid for developer-tool density. Control height sits around 32px; the request bar is a compact toolbar; editor rows run ~32px to fit many params on screen. Pane padding is 12–16px, and the three-pane split (sidebar / request / response) is user-resizable so engineers tune their own information balance.

The layout is built for parallelism: a persistent left sidebar, a tabbed request area, and a draggable horizontal split between request and response. The console docks as a bottom drawer. Modals center on a scrim at ~520px width. Everything assumes a desktop-class viewport where density is a feature, not a flaw.

## 6. Motion & Interaction
**Send feedback**: pressing Send shows an inline spinner in the response pane and a subtle progress state on the button; results stream in without a layout jump, ~160ms transitions.

**Tab switch**: the orange active-tab underline slides between tabs rather than cutting, keeping spatial continuity at 160ms.

**Drawer + panel slides**: the console and side panels slide open with `cubic-bezier(0.2, 0, 0, 1)`, a fast-out curve that feels instant rather than floaty.

**Pressed depth**: buttons darken to the pressed token on click with no scale bounce — motion stays restrained and professional for long sessions.

**Skeleton loading**: collection trees and response bodies show dark shimmer placeholders sized to final content to avoid layout shift on large payloads.

## Accessibility

### Contrast Ratios
- **#F2F2F2 ink on #1B1B1B canvas**: 15.8:1 — passes AAA
- **#F2F2F2 ink on #262626 surface-1**: 13.6:1 — passes AAA
- **#AEB3B9 muted on #1B1B1B**: 8.0:1 — passes AAA
- **#6B7178 subdued on #1B1B1B**: 3.4:1 — fails AA for normal text; disabled/decorative only
- **#FF6C37 orange text on #1B1B1B**: 5.9:1 — passes AA
- **#1B1B1B on #FF6C37 primary**: 5.9:1 — passes AA (dark text on orange)
- **#FFFFFF on #FF6C37 primary**: 2.5:1 — fails AA; never use white on orange
- **#6BDD9A GET green on #1B1B1B**: 11.2:1 — passes AAA
- **#F4493E danger on #1B1B1B**: 5.0:1 — passes AA

### Minimum Requirements
- **Touch/click target**: 32px minimum control height with hit-padding; toolbar icons get 24px+ tap area padding
- **Focus indicator**: 2px orange (#FF6C37) focus ring on every interactive element, visible against all dark surfaces
- **Method color is never alone**: every method's text label accompanies its hue so color-blind users read the word, not just the color
- **Keyboard**: full keyboard operation of the request bar, tabs, and runner; mono fields support standard text navigation

### Motion
- Respects `prefers-reduced-motion`: yes — tab underline slide, drawer slides, and skeleton shimmer reduce to instant state changes
- Send progress remains as a non-animated spinner-to-result swap; essential feedback never depends on animation alone

### Notes
- White on Postman Orange fails at 2.5:1 — the Send button and any orange fill must use dark #1B1B1B text, which is the brand-correct pairing at 5.9:1
- #FF6C37 as text on dark passes AA at 5.9:1; on light backgrounds it drops below AA, so orange text is reserved for the dark theme
- Status and method colors are tuned for the dark canvas; a light theme must re-derive every hue to hold ≥4.5:1 rather than reusing these tokens
- Syntax-highlight palettes in code panes must each clear 4.5:1 on the surface-1 background; do not ship a theme color that fails against #262626
