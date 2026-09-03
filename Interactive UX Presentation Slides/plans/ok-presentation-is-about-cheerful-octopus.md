# UX Assessment & Enhancement Plan
## "The Art of Knowing Your User" — Interactive Presentation

---

## Context

This is a presentation *about* UX research, so its own UX is high-stakes meta-commentary. The visual design and token system are excellent. The interaction layer has several specific gaps that undermine the experience — particularly on touch devices and for keyboard users. This plan identifies every real problem found and proposes targeted fixes with no unnecessary changes to the design system.

---

## Assessment: What Works Well

- Dark theme, fluid type scale, and glow/animation system are polished
- `useEnter` gating prevents content from animating during transitions
- Directional slide transitions give spatial orientation (← → keyframes)
- Touch swipe and keyboard arrow/number navigation are implemented
- Side-dot hover labels and chip tooltips are thoughtful affordances
- S3 auto-phase reveal, S5 pipeline sequencing, and S9 progress bar are all engaging

---

## Assessment: Real UX Problems (Ranked by Severity)

### 🔴 Critical

**1. S1 (UX Iceberg) — hover-only interaction; touch users see zero descriptions**
Cards have `onMouseEnter / onMouseLeave` but NO `onClick`. On any touch screen (phone, tablet, iPad presentation mode) users can see the card labels but cannot access the sub-description text at all. For a slide about the "hidden" depths of UX, the content is literally hidden from half the audience.
- Fix: add `onClick` toggle (click = persistent hover) alongside existing hover. A `clicked` set in state, tap sets it, second tap clears it.

**2. S8 (Maturity Model) — "click to lock" affordance is completely undiscoverable**
Hovering a bar shows detail. Clicking locks it. But nothing tells users clicking is possible — no cursor hint, no tooltip, no label. Users who don't accidentally click will never discover the locked state.
- Fix: on first hover, show a small "click to pin ↓" micro-label inside the bar or below it. Once any bar is locked, replace hint with "click to unpin."

**3. Slide transition latency — ~380ms dead time before content appears**
`goTo()` sets `transitioning = true` for 320ms. `active={!transitioning}` props flow down. `useEnter(active, delay=60)` adds another 60ms. Content only starts entering at ~380ms post-click. This is perceptibly slow for a presentation tool. The audience sees a blank slide for nearly 400ms.
- Fix: Reduce transitioning window to 180ms (the CSS animation is .34s but overlap is fine — the new slide can start entering before the old one fully exits). Reduce `useEnter` default delay from 60ms to 20ms.

### 🟠 High Priority

**4. No exit animation — old slide pops out abruptly**
The slide canvas uses `key={cur}` so the old slide is immediately unmounted (React behavior). Only the entering slide has `slideEnterRight/Left` animations. The old content just vanishes, which reads as a visual glitch, especially when navigating backwards.
- Fix: Maintain both the outgoing and incoming slides simultaneously during the 180ms window. The outgoing slide gets a complementary exit animation (`slideExitLeft` when going forward, `slideExitRight` backward). After the window, the old slide is removed.
  - Implementation: hold `prev` in a ref, render both slides during `transitioning`, apply exit animation to the `prev` slide.

**5. S3 (Double Diamond) — phase cards look decorative, clickability is not obvious**
The SVG polygons and phase cards below auto-advance nicely. But clicking is the only way to jump back to a previous phase, and nothing indicates the cards are interactive. No hover state, no cursor: pointer visible on the SVG elements, no "click to explore" affordance.
- Fix: Add explicit `cursor: pointer` on SVG group elements and add a hover color shift to phase card borders. Add a one-time "tap to explore" hint label that fades after 3s once the auto-advance completes.

**6. Number key navigation is 0-indexed, which is counterintuitive**
Pressing `1` on the keyboard goes to slide at index 1 (UX Iceberg, displayed as "2/10"). Users expect `1` = first slide. `0` does go to the first slide, but pressing `0` for "first" is unusual.
- Fix: Remap so `1`–`9` go to slides 0–8 (i.e., `goTo(parseInt(e.key) - 1)`), and `0` goes to slide 9 (last). Or simpler: `1`–`9` map to `parseInt - 1`, `0` = no-op (avoids the confusion without changing "0" behavior).

### 🟡 Medium Priority

**7. S6 (Business Impact) — AnimNum counters reset on revisit**
`AnimNum` resets to 0 whenever `active` flips false. Revisiting slide 6 replays the count-up animation from zero. If a presenter navigates away briefly and back, the audience sees 9900% count up again, breaking flow.
- Fix: Accept a `once` prop; after the first complete run, lock the displayed value at the final number and skip the animation on subsequent `active=true` triggers.

**8. S9 (Action CTA) — checklist has no first-interaction prompt**
The checklist items on the CTA slide look like a static list on first render. Nothing invites the user to interact. The progress card only appears after the first check, so the interactive affordance is only revealed after the user has already discovered interaction.
- Fix: Add a subtle pulsing border or a "Check off what you'll try →" micro-label above the list that fades once the first item is checked.

**9. Mobile scroll + swipe conflict on stacked layout (≤1023px)**
At tablet/mobile, `slide-split` becomes `flex-direction: column` with `overflow-y: auto`. Swiping down to scroll through slide content and swiping left/right to navigate slides share the same gesture space. The touch handler fires on `touchend` regardless of vertical movement, creating accidental slide navigation when the user meant to scroll.
- Fix: In `onTouchEnd`, compare `dy` (vertical delta) against `dx`. Only trigger navigation when `Math.abs(dx) > Math.abs(dy)` (predominantly horizontal swipe). Current code only checks `Math.abs(dx) < 48`.

### 🟢 Low Priority / Polish

**10. `aria-live` for slide navigation — screen reader users get no announcement**
When a slide changes, no accessible announcement is made. A visually-hidden `role="status" aria-live="polite"` element that announces the slide title on change would cover this.

**11. S4 tab navigation — TEDW acronym is unexplained**
The tab is labeled "TEDW Framework" but the acronym is never spelled out. Each row has a colored letter but the connection to T-E-D-W isn't made explicit.
- Fix: Add a one-line `<p className="t-small">` inside the tab panel header that reads e.g. "Tell · Elaborate · Describe · Why" in mono style.

---

## Implementation Plan

### Files to modify
- `src/App.tsx` — all interactive logic changes
- `src/index.css` — new keyframes for exit animations, accessibility rules

### Change 1: Reduce transition latency (App.tsx)
In `goTo`, reduce the `setTimeout` from `320` → `180`.
In `useEnter` default `delay` param: change `60` → `20`.

{% raw %}
### Change 2: Exit animation (App.tsx + index.css)
Add `prevSlide` ref to App. During transition, render both:
```tsx
const prevRef = useRef<number>(0);
// in goTo, before setTransitioning: prevRef.current = cur;

// In render:
{transitioning && (
  <div key={`exit-${prevRef.current}`} style={{
    position: "absolute", inset: 0,
    animation: `slideExit${dir > 0 ? "Left" : "Right"} .18s ease both`,
    pointerEvents: "none",
  }}>
    <PrevC active={false} />
  </div>
)}
<div key={cur} style={{ position: "absolute", inset: 0,
  animation: `slideEnter${dir > 0 ? "Right" : "Left"} .34s cubic-bezier(.22,1,.36,1) both`,
}}>
  <C active={!transitioning} />
</div>
```
Add to index.css:
```css
@keyframes slideExitLeft  { to { opacity: 0; transform: translateX(-32px); } }
@keyframes slideExitRight { to { opacity: 0; transform: translateX(32px); } }
```
Note: `PrevC` = `SLIDES[prevRef.current].C`.

### Change 3: S1 click-to-reveal (App.tsx)
Add `clicked: Set<string>` state. In each iceberg card:
```tsx
const [clicked, setClicked] = useState<Set<string>>(new Set());
// onClick: toggle clicked set
// isActive = hov === k || clicked.has(k)
```
Show sub-description when `isActive`, not just when `hov === k`.
Add `cursor: pointer` style to cards that don't already have it.

### Change 4: S8 lock affordance (App.tsx)
Inside the bar div, conditionally show a micro-hint:
```tsx
{activeLevel !== i && hov === i && locked === null && (
  <div style={{ /* absolute, centered, fade in */ }}>
    <span className="t-label" style={{ color: l.c }}>click to pin</span>
  </div>
)}
{locked === i && (
  <div style={{ /* same position */ }}>
    <span className="t-label" style={{ color: l.c }}>pinned · click to release</span>
  </div>
)}
```

### Change 5: Swipe direction guard (App.tsx)
In `onTouchStart`, also record `touchY.current`. In `onTouchEnd`:
```tsx
const dx = e.changedTouches[0].clientX - touchX.current;
const dy = e.changedTouches[0].clientY - touchY.current;
if (Math.abs(dx) < 48 || Math.abs(dy) > Math.abs(dx)) return;
```

### Change 6: Keyboard remap (App.tsx)
```tsx
} else if (e.key >= "1" && e.key <= "9") {
  goTo(parseInt(e.key) - 1);
}
// Remove the old "0"–"9" handler
```

### Change 7: S6 AnimNum `once` mode (App.tsx)
Add `hasCompleted` ref inside `AnimNum`. After first run sets `v = to`, set `hasCompleted.current = true`. On subsequent `active=true`, skip animation and set `v = to` immediately.

### Change 8: S9 checklist prompt (App.tsx)
Add above the items list:
```tsx
{done.size === 0 && (
  <p className="t-label a-in" style={{ color: "var(--t3)", marginBottom: "var(--sp-2)",
    animation: "glowPulse 2s ease-in-out 3" }}>
    Check off what you'll try →
  </p>
)}
```

### Change 9: S3 clickability hint (App.tsx)
Add `cursor: "pointer"` to the SVG `<g>` elements wrapping each polygon+label. Add hover border brightening on phase cards (already has `transition: all .3s` but no hover state — add `onMouseEnter/Leave` to set `hovPhase` state and apply border color shift).

### Change 10: TEDW expansion (App.tsx, S4)
Inside the active tab panel, replace the existing `t.intro` paragraph with:
```tsx
{tab === 0 && (
  <p className="t-label" style={{ color: "var(--t3)", marginBottom: "var(--sp-1)" }}>
    Tell · Elaborate · Describe · Why
  </p>
)}
```

### Change 11: aria-live (App.tsx)
Add a visually-hidden element in App:
```tsx
<div role="status" aria-live="polite" style={{ position: "absolute", width: 1, height: 1,
  overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>
  Slide {cur + 1} of {SLIDES.length}: {SLIDES[cur].label}
</div>
```

---

## Verification
1. Navigate forward/backward — old slide should animate out, new slide in (Changes 1 & 2)
2. On S1, tap/click an iceberg card on a touch-screen emulation — description should appear and persist (Change 3)
3. On S8, hover a bar — "click to pin" label should appear; click — label switches to "pinned · click to release" (Change 4)
4. On mobile viewport in browser devtools, drag horizontally — slide should change; drag vertically — should NOT change slide (Change 5)
5. Press `1` on keyboard — should go to slide 1 (UX Iceberg, displayed as "2/10") (Change 6)
6. Navigate to S6, watch counters; navigate away and back — counters should not replay (Change 7)
7. On S9, before checking any item — "Check off what you'll try →" label should be visible (Change 8)
8. Screen reader test: navigate slides with arrow keys and verify VoiceOver/NVDA announces slide title (Change 11)
{% endraw %}
