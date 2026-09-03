import { useState, useEffect, useCallback, useRef } from "react";

// ─── Primitives ───────────────────────────────────────────────────────────────

function useEnter(active: boolean, delay = 60) {
  const [go, setGo] = useState(false);
  useEffect(() => {
    if (!active) { setGo(false); return; }
    const t = setTimeout(() => setGo(true), delay);
    return () => clearTimeout(t);
  }, [active, delay]);
  return go;
}

function Glow({ x, y, r = 360, color }: { x: string; y: string; r?: number; color: string }) {
  return (
    <div className="absolute pointer-events-none" style={{
      left: x, top: y,
      width: r * 2, height: r * 2,
      background: color, borderRadius: "50%",
      filter: `blur(${Math.round(r * .58)}px)`,
      transform: "translate(-50%,-50%)",
      animation: "glowPulse 7s ease-in-out infinite",
    }} />
  );
}

/* Slide-number badge + topic label */
function SlideTag({ num, label, color = "var(--violet)" }: {
  num: string; label: string; color?: string;
}) {
  return (
    <div className="a-in d1 flex items-center gap-3">
      <span className="t-label" style={{ color, border: `1px solid ${color}50`,
        borderRadius: "var(--tag-radius)", padding: "3px 9px" }}>
        {num}
      </span>
      <span className="t-label" style={{ color: "var(--t3)" }}>{label}</span>
    </div>
  );
}

/* Slim horizontal divider */
function Rule({ color = "var(--hairline)" }: { color?: string }) {
  return <div style={{ height: 1, background: color, borderRadius: 1 }} />;
}

/* Animated stat counter */
function AnimNum({ to, suffix = "", duration = 1300, delay = 0, active }: {
  to: number; suffix?: string; duration?: number; delay?: number; active: boolean;
}) {
  const [v, setV] = useState(0);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (!active) { setV(0); setStarted(false); return; }
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [active, delay]);
  useEffect(() => {
    if (!started) return;
    const t0 = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      setV(Math.round((1 - Math.pow(1 - p, 4)) * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, to, duration]);
  return <>{v}{suffix}</>;
}

/* Bottom progress bar */
function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="progress-track">
      <div style={{
        height: "100%", borderRadius: 2,
        background: "linear-gradient(90deg, var(--violet), var(--pink), var(--teal))",
        width: `${pct}%`,
        transition: "width .45s cubic-bezier(.22,1,.36,1)",
      }} />
    </div>
  );
}

// ─── Slide 0 · Title ──────────────────────────────────────────────────────────
function S0({ active }: { active: boolean }) {
  const go = useEnter(active);
  return (
    <div className="noise relative w-full h-full flex items-center overflow-hidden"
      style={{ background: "var(--bg)" }}>
      <Glow x="64%" y="36%" r={420} color="rgba(139,92,246,.2)" />
      <Glow x="24%" y="74%" r={280} color="rgba(20,184,166,.09)" />
      <Glow x="82%" y="78%" r={220} color="rgba(236,72,153,.09)" />

      {/* Decorative orbital rings */}
      <div className="absolute pointer-events-none" style={{
        right: "6%", top: "50%", transform: "translateY(-50%)",
        width: 360, height: 360,
      }}>
        {go && (
          <svg width="360" height="360" viewBox="0 0 360 360">
            <circle cx="180" cy="180" r="164" fill="none" stroke="rgba(139,92,246,.1)" strokeWidth="1" />
            <circle cx="180" cy="180" r="120" fill="none" stroke="rgba(20,184,166,.07)" strokeWidth="1" />
            <circle cx="180" cy="180" r="72"  fill="none" stroke="rgba(236,72,153,.07)" strokeWidth="1" />
            <g style={{ transformOrigin: "180px 180px", animation: "rotateSlow 24s linear infinite" }}>
              <circle cx="180" cy="16" r="5" fill="var(--violet)" opacity=".9" />
              <circle cx="344" cy="180" r="3" fill="var(--teal)" opacity=".7" />
            </g>
            <g style={{ transformOrigin: "180px 180px", animation: "rotateSlow 16s linear infinite reverse" }}>
              <circle cx="180" cy="60" r="4" fill="var(--pink)" opacity=".7" />
            </g>
            <path d="M180 16 A164 164 0 0 1 330 244" fill="none"
              stroke="rgba(139,92,246,.28)" strokeWidth="1"
              style={{ strokeDasharray: 320,
                strokeDashoffset: go ? 0 : 320,
                transition: "stroke-dashoffset 2s ease .5s" }} />
          </svg>
        )}
      </div>

      {/* Background grid */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: .035 }}>
        {Array.from({ length: 17 }).map((_, i) => (
          <line key={`v${i}`} x1={`${i * 6.25}%`} y1="0" x2={`${i * 6.25}%`} y2="100%"
            stroke="#fff" strokeWidth=".5" />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={`${i * 10}%`} x2="100%" y2={`${i * 10}%`}
            stroke="#fff" strokeWidth=".5" />
        ))}
      </svg>

      {/* Content */}
      {go && (
        <div className="relative z-10" style={{ paddingLeft: "var(--slide-px)", maxWidth: 680 }}>
          <div className="a-in d1" style={{ marginBottom: "var(--sp-6)" }}>
            <span className="t-label" style={{ color: "var(--teal)",
              border: "1px solid rgba(20,184,166,.4)", borderRadius: "var(--tag-radius)",
              padding: "4px 12px" }}>
              UX Design & Customer Research · 2026
            </span>
          </div>

          <h1 className="t-display a-up d2" style={{ marginBottom: "var(--sp-6)" }}>
            The Art of<br />
            <em className="shimmer not-italic">Knowing</em><br />
            Your User
          </h1>

          <p className="t-body a-up d3"
            style={{ maxWidth: 480, marginBottom: "var(--sp-10)" }}>
            A look at UX research, the quiet work of listening to people,
            and how good questions lead to products people actually enjoy using.
          </p>

          <div className="a-up d4 flex items-center" style={{ gap: "var(--sp-8)" }}>
            {[
              { n: "10", label: "Slides" },
              { n: "6",  label: "Frameworks" },
              { n: "12+", label: "Research methods" },
            ].map(({ n, label }) => (
              <div key={label} className="flex items-center" style={{ gap: "var(--sp-3)" }}>
                <span style={{ fontFamily: "var(--ff-display)", fontWeight: 700,
                  fontSize: "1.75rem", color: "var(--violet-lt)", lineHeight: 1 }}>
                  {n}
                </span>
                <span className="t-label">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Slide 1 · The UX Iceberg ─────────────────────────────────────────────────
function S1({ active }: { active: boolean }) {
  const go = useEnter(active);
  const [hov, setHov] = useState<string | null>(null);

  const above = [
    { k: "v0", label: "Visual Design",       sub: "Colour, typography, layout, iconography" },
    { k: "v1", label: "Interface Components", sub: "Buttons, forms, navigation, modals" },
    { k: "v2", label: "Micro-interactions",   sub: "Hover states, animations, feedback" },
  ];
  const below = [
    { k: "h0", label: "Information Architecture", sub: "How content is structured & labelled" },
    { k: "h1", label: "User Research",            sub: "Interviews, observations, diary studies" },
    { k: "h2", label: "Mental Models",            sub: "What users expect vs. how things work" },
    { k: "h3", label: "Interaction Design",       sub: "Flows, affordances, system feedback" },
    { k: "h4", label: "Accessibility",            sub: "WCAG compliance, inclusive design" },
    { k: "h5", label: "Content Strategy",         sub: "Voice, tone, microcopy, messaging" },
    { k: "h6", label: "Service Design",           sub: "End-to-end journey, backstage processes" },
  ];

  return (
    <div className="noise slide-split relative w-full h-full flex overflow-hidden"
      style={{ background: "var(--bg)" }}>
      <Glow x="28%" y="62%" r={340} color="rgba(139,92,246,.13)" />
      <Glow x="76%" y="28%" r={260} color="rgba(20,184,166,.09)" />

      {/* Left panel */}
      <div className="slide-panel">
        {go && <>
          <SlideTag num="01" label="Foundation" />
          <h2 className="t-h2 a-up d2">
            The UX<br /><span className="shimmer">Iceberg</span>
          </h2>
          <p className="t-body a-up d3">
            The polished interface is just the tip. Most of the real work happens where nobody looks —
            in the structure, the strategy, the dozens of small decisions that make something feel effortless.
          </p>
          <blockquote className="a-up d4" style={{
            paddingLeft: "var(--sp-4)",
            borderLeft: "2px solid var(--violet)",
            fontFamily: "var(--ff-display)", fontStyle: "italic",
            fontSize: "var(--ts-small)", lineHeight: "var(--lh-body)",
            fontWeight: 300, color: "var(--t2)",
          }}>
            "Design is not just what it looks like. Design is how it works."
            <span className="t-label not-italic block" style={{ marginTop: "var(--sp-2)",
              color: "var(--t3)", fontStyle: "normal" }}>Steve Jobs</span>
          </blockquote>
        </>}
      </div>

      {/* Right: full iceberg — 2-section layout, always fits */}
      <div className="slide-main relative z-10 flex-1 flex flex-col justify-center"
        style={{ padding: "var(--sp-6) var(--slide-px) var(--sp-6) var(--sp-5)", gap: "var(--sp-2)", minHeight: 0 }}>
        {go && <>

          {/* ── VISIBLE section ── */}
          <div className="a-up d2">
            <div className="flex items-center" style={{ gap: "var(--sp-3)", marginBottom: "var(--sp-2)" }}>
              <span className="t-label" style={{ color: "var(--violet-lt)" }}>↑ Visible (10%)</span>
              <div style={{ flex: 1, height: 1, background: "rgba(139,92,246,.25)" }} />
            </div>
            {/* 3 items as a horizontal row */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3" style={{ gap: "var(--sp-3)" }}>
              {above.map(({ k, label, sub }) => (
                <div key={k}
                  onMouseEnter={() => setHov(k)} onMouseLeave={() => setHov(null)}
                  style={{
                    padding: "var(--sp-3) var(--sp-4)", borderRadius: "var(--card-radius)",
                    background: hov === k ? "rgba(139,92,246,.18)" : "rgba(139,92,246,.07)",
                    border: `1px solid ${hov === k ? "rgba(139,92,246,.45)" : "rgba(139,92,246,.2)"}`,
                    cursor: "default", transition: "background .18s, border-color .18s",
                  }}>
                  <p className="t-h3" style={{ marginBottom: "var(--sp-1)" }}>{label}</p>
                  <p className="t-small" style={{ color: "var(--t3)",
                    opacity: hov === k ? 1 : 0.4, transition: "opacity .18s",
                    lineHeight: "var(--lh-tight)" }}>{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Waterline ── */}
          <div className="a-up d3 flex items-center" style={{ gap: "var(--sp-3)" }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(56,189,248,.15),rgba(56,189,248,.6))" }} />
            <span className="t-label" style={{ color: "var(--sky)", letterSpacing: "0.2em" }}>waterline</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(56,189,248,.6),rgba(56,189,248,.15))" }} />
          </div>

          {/* ── HIDDEN section ── */}
          <div className="a-up d4">
            <div className="flex items-center" style={{ gap: "var(--sp-3)", marginBottom: "var(--sp-2)" }}>
              <span className="t-label" style={{ color: "var(--teal)" }}>↓ Hidden (90%)</span>
              <div style={{ flex: 1, height: 1, background: "rgba(20,184,166,.25)" }} />
            </div>
            {/* 7 items in a 3+2+2 grid → always 3 columns */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3" style={{ gap: "var(--sp-3)" }}>
              {below.map(({ k, label, sub }, idx) => (
                <div key={k}
                  onMouseEnter={() => setHov(k)} onMouseLeave={() => setHov(null)}
                  style={{
                    padding: "var(--sp-3) var(--sp-4)", borderRadius: "var(--card-radius)",
                    background: hov === k ? "rgba(20,184,166,.14)" : "rgba(20,184,166,.05)",
                    border: `1px solid ${hov === k ? "rgba(20,184,166,.4)" : "rgba(20,184,166,.18)"}`,
                    cursor: "default", transition: "background .18s, border-color .18s",
                  }}>
                  <p style={{ fontSize: "var(--ts-small)", fontWeight: 600, color: "var(--t2)",
                    marginBottom: "var(--sp-1)" }}>{label}</p>
                  <p className="t-small" style={{ color: "var(--t3)",
                    opacity: hov === k ? 1 : 0.4, transition: "opacity .18s",
                    lineHeight: "var(--lh-tight)" }}>{sub}</p>
                </div>
              ))}
            </div>
          </div>

        </>}
      </div>
    </div>
  );
}

// ─── Slide 2 · Research Landscape 2×2 ────────────────────────────────────────
function S2({ active }: { active: boolean }) {
  const go = useEnter(active);
  const [sel, setSel] = useState<string | null>(null);
  const [hov2, setHov2] = useState<string | null>(null);

  const cells = [
    { id: "aq", color: "var(--violet)",  label: "What people say",         axis: "Attitudinal × Qualitative",
      methods: ["User interviews (1:1)", "Focus groups", "Diary studies", "Card sorting"],
      best:  "Getting at the why behind what people do and say they want",
      limit: "People often describe what they think they do, not what they actually do" },
    { id: "an", color: "var(--pink)",    label: "What people say at scale", axis: "Attitudinal × Quantitative",
      methods: ["Surveys (NPS, SUS, CSAT)", "Semantic differentials", "Max-diff studies", "Desirability studies"],
      best:  "Understanding how people feel about something across a lot of users at once",
      limit: "You get the signal, but rarely the story behind it" },
    { id: "bq", color: "var(--teal)",   label: "What people do (observed)", axis: "Behavioural × Qualitative",
      methods: ["Usability testing", "Contextual inquiry", "Ethnographic study", "Eye-tracking"],
      best:  "Watching where things actually break and how people quietly work around them",
      limit: "People behave a little differently when they know they're being watched" },
    { id: "bn", color: "var(--amber)",  label: "What people do at scale",   axis: "Behavioural × Quantitative",
      methods: ["Analytics & funnels", "A/B & multivariate tests", "Heatmaps & replays", "Log data analysis"],
      best:  "Seeing what people really do at scale, not just what they say they do",
      limit: "Great for the what, but you'll need other methods to understand the why" },
  ];

  const active_cell = cells.find(c => c.id === sel) ?? null;

  return (
    <div className="noise slide-split relative w-full h-full flex overflow-hidden"
      style={{ background: "var(--bg)" }}>
      <Glow x="50%" y="50%" r={440} color="rgba(139,92,246,.09)" />

      {/* Panel */}
      <div className="slide-panel">
        {go && <>
          <SlideTag num="02" label="Research Landscape" color="var(--pink)" />
          <h2 className="t-h2 a-up d2">The NNG<br /><span className="shimmer">2 × 2 Matrix</span></h2>
          <p className="t-body a-up d3">
            NNG's framework is a handy way to think about all the research methods out there.
            It sorts them by <strong style={{ color: "var(--t1)" }}>what</strong> you're trying to understand
            and <strong style={{ color: "var(--t1)" }}>how</strong> you're going about it.
          </p>

          {/* Detail pane on selection */}
          {active_cell ? (
            <div key={active_cell.id} className="card a-up"
              style={{ borderColor: `${active_cell.color}44`, marginTop: "var(--sp-2)" }}>
              <p className="t-label" style={{ color: active_cell.color,
                marginBottom: "var(--sp-3)" }}>Best for</p>
              <p className="t-small" style={{ color: "var(--t2)",
                lineHeight: "var(--lh-body)", marginBottom: "var(--sp-4)" }}>
                {active_cell.best}
              </p>
              <Rule />
              <p className="t-label" style={{ color: "var(--t3)",
                marginTop: "var(--sp-3)", marginBottom: "var(--sp-2)" }}>Limitation</p>
              <p className="t-small" style={{ color: "var(--t3)", lineHeight: "var(--lh-body)" }}>
                {active_cell.limit}
              </p>
            </div>
          ) : (
            <div className="card a-up d4" style={{ marginTop: "var(--sp-2)" }}>
              <p className="t-small" style={{ color: "var(--t3)", lineHeight: "var(--lh-body)" }}>
                <strong style={{ color: "var(--violet-lt)" }}>A good rule of thumb:</strong> mix
                at least one attitudinal and one behavioural method. They tell very different stories,
                and together they get you closer to the truth.
              </p>
            </div>
          )}
        </>}
      </div>

      {/* 2×2 grid */}
      <div className="slide-main relative z-10 flex-1 flex items-center justify-center"
        style={{ padding: "clamp(16px, 3.5vh, 40px) var(--slide-px)" }}>
        {go && (
          <div className="matrix-wrap a-scale d3" style={{ width: "100%", maxWidth: 680,
            height: "clamp(340px, 72vh, 560px)", display: "flex", flexDirection: "column" }}>
            {/* Column headers */}
            <div style={{ display: "grid", gridTemplateColumns: "minmax(20px, 28px) 1fr 1fr",
              marginBottom: "var(--sp-3)", flexShrink: 0 }}>
              <div />
              {["Qualitative", "Quantitative"].map(l => (
                <p key={l} className="t-label" style={{ textAlign: "center", color: "var(--t3)" }}>{l}</p>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "minmax(20px, 28px) 1fr 1fr",
              gridTemplateRows: "1fr 1fr", gap: "var(--sp-3)", flex: 1, minHeight: 0 }}>
              {/* Row label — Attitudinal */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
                gridRow: "1 / 2" }}>
                <p className="t-label" style={{ transform: "rotate(-90deg)",
                  whiteSpace: "nowrap", color: "var(--t3)" }}>Attitudinal</p>
              </div>

              {/* Row label — Behavioural */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
                gridRow: "2 / 3" }}>
                <p className="t-label" style={{ transform: "rotate(-90deg)",
                  whiteSpace: "nowrap", color: "var(--t3)" }}>Behavioural</p>
              </div>

              {/* 4 cells */}
              {cells.map(c => (
                <button key={c.id}
                  className="touch-target"
                  onClick={() => setSel(sel === c.id ? null : c.id)}
                  onMouseEnter={() => setHov2(c.id)}
                  onMouseLeave={() => setHov2(null)}
                  style={{
                    width: "100%", height: "100%",
                    background: sel === c.id ? `color-mix(in srgb, ${c.color} 12%, transparent)` : "var(--surface)",
                    border: `1px solid ${sel === c.id ? `${c.color}60` : hov2 === c.id ? `${c.color}38` : "var(--hairline)"}`,
                    borderRadius: "var(--card-radius)",
                    padding: "var(--card-p)",
                    textAlign: "left", cursor: "pointer",
                    transition: "all .25s ease",
                  }}>
                  <p className="t-label" style={{ color: c.color,
                    marginBottom: "var(--sp-3)" }}>{c.label}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
                    {c.methods.map(m => (
                      <div key={m} className="flex items-start" style={{ gap: "var(--sp-2)" }}>
                        <span style={{ color: c.color, lineHeight: 1.4,
                          fontSize: "var(--ts-small)", flexShrink: 0 }}>›</span>
                        <span className="t-small" style={{ color: "var(--t2)",
                          lineHeight: "var(--lh-tight)" }}>{m}</span>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <p className="t-label" style={{ textAlign: "center",
              marginTop: "var(--sp-4)", color: "var(--t3)" }}>
              Click any quadrant to see best-use guidance
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Slide 3 · Double Diamond ─────────────────────────────────────────────────
function S3({ active }: { active: boolean }) {
  const go = useEnter(active);
  const [phase, setPhase] = useState(-1);

  useEffect(() => {
    if (!go) { setPhase(-1); return; }
    const ts = [300, 720, 1140, 1560].map((d, i) => setTimeout(() => setPhase(i), d));
    return () => ts.forEach(clearTimeout);
  }, [go]);

  const phases = [
    { id: 0, label: "Discover", sub: "Diverge on the problem",  color: "var(--violet)",
      output: "Research insights, interviews, field notes",
      acts: ["Stakeholder interviews", "Contextual inquiry", "Secondary research", "Analytics audit"] },
    { id: 1, label: "Define",   sub: "Converge on the right problem", color: "var(--pink)",
      output: "Problem statement, HMW questions, design brief",
      acts: ["Affinity mapping", "Persona synthesis", "Journey mapping", "Problem framing"] },
    { id: 2, label: "Develop",  sub: "Diverge on solutions",    color: "var(--teal)",
      output: "Sketches, wireframes, testable prototypes",
      acts: ["Crazy 8s ideation", "Concept testing", "Co-design sessions", "Rapid prototyping"] },
    { id: 3, label: "Deliver",  sub: "Converge on the right solution", color: "var(--amber)",
      output: "Shipped product, usability findings, learnings",
      acts: ["Usability testing", "Iteration cycles", "Stakeholder sign-off", "Launch & measure"] },
  ];

  return (
    <div className="noise relative w-full h-full overflow-hidden"
      style={{ background: "var(--bg)" }}>
      <Glow x="50%" y="50%" r={400} color="rgba(139,92,246,.1)" />

      {/* Full-height flex column that compresses on short screens */}
      <div className="slide-col relative z-10">

      {/* Header */}
      {go && (
        <div className="text-center"
          style={{ marginBottom: "clamp(10px,2vh,24px)", paddingInline: "var(--slide-px)" }}>
          <div style={{ marginBottom: "var(--sp-2)" }}>
            <SlideTag num="03" label="Process" color="var(--teal)" />
          </div>
          <h2 className="t-h2 a-up d2">The Double Diamond</h2>
          <p className="t-small a-up d3" style={{ color: "var(--t3)",
            marginTop: "var(--sp-1)" }}>
            Design Council's process model. Open up, then narrow down. Twice.
          </p>
        </div>
      )}

      {/* Diamond SVG — proper connected double-rhombus */}
      {go && (
        <div className="a-up d3" style={{ marginBottom: "clamp(8px,1.5vh,20px)", paddingInline: "var(--slide-px)" }}>
          <svg viewBox="0 0 660 186"
            style={{ display: "block", width: "min(660px, 100%)", height: "auto",
              margin: "0 auto", overflow: "visible" }}>
            {/* 4 phase quadrant fills — triangular halves of each diamond */}
            {[
              { pts: "20,92 190,18 190,166",   color: "#8b5cf6" }, // Discover
              { pts: "190,18 335,92 190,166",  color: "#ec4899" }, // Define
              { pts: "335,92 480,18 480,166",  color: "#14b8a6" }, // Develop
              { pts: "480,18 640,92 480,166",  color: "#f59e0b" }, // Deliver
            ].map((q, i) => (
              <polygon key={i} points={q.pts}
                fill={phase >= i ? q.color + "22" : q.color + "07"}
                stroke={phase >= i ? q.color : "transparent"}
                strokeWidth="1.5" strokeOpacity={phase >= i ? .4 : 0}
                style={{ transition: "all .5s ease", cursor: "pointer" }}
                onClick={() => setPhase(i)} />
            ))}

            {/* Single connected double-diamond outline */}
            <polyline points="20,92 190,18 335,92 480,18 640,92 480,166 335,92 190,166 20,92"
              fill="none" stroke="rgba(255,255,255,.13)" strokeWidth="1.5" strokeLinejoin="round" />

            {/* Dashed verticals at the two widest peaks */}
            <line x1="190" y1="18" x2="190" y2="166" stroke="rgba(255,255,255,.07)" strokeWidth="1" strokeDasharray="3,5" />
            <line x1="480" y1="18" x2="480" y2="166" stroke="rgba(255,255,255,.07)" strokeWidth="1" strokeDasharray="3,5" />

            {/* Vertex dots — start, waist, end */}
            {[[20,92],[335,92],[640,92]].map(([x,y],i) => (
              <circle key={i} cx={x} cy={y} r="4.5"
                fill="#0d0d1c" stroke="rgba(255,255,255,.35)" strokeWidth="1.5" />
            ))}
            {/* Vertex dots — top/bottom peaks */}
            {[[190,18],[190,166],[480,18],[480,166]].map(([x,y],i) => (
              <circle key={i} cx={x} cy={y} r="2.5" fill="rgba(255,255,255,.2)" />
            ))}

            {/* Phase name labels — ABOVE each quadrant, outside shapes */}
            {([
              { label: "Discover", cx: 105, color: "#8b5cf6" },
              { label: "Define",   cx: 262, color: "#ec4899" },
              { label: "Develop",  cx: 408, color: "#14b8a6" },
              { label: "Deliver",  cx: 560, color: "#f59e0b" },
            ] as const).map((item, i) => (
              <text key={i} x={item.cx} y="11" textAnchor="middle"
                style={{ fontFamily: "var(--ff-body)", fontWeight: 700, fontSize: 13,
                  fill: phase >= i ? item.color : "rgba(255,255,255,.22)",
                  transition: "fill .4s ease", cursor: "pointer" }}
                onClick={() => setPhase(i)}>
                {item.label}
              </text>
            ))}

            {/* Diverge / Converge labels — BELOW each quadrant */}
            {([
              { label: "→  diverge  →", cx: 105, color: "#8b5cf6" },
              { label: "←  converge  ←", cx: 262, color: "#ec4899" },
              { label: "→  diverge  →", cx: 408, color: "#14b8a6" },
              { label: "←  converge  ←", cx: 560, color: "#f59e0b" },
            ] as const).map((item, i) => (
              <text key={i} x={item.cx} y="181" textAnchor="middle"
                style={{ fontFamily: "var(--ff-mono)", fontSize: 9,
                  letterSpacing: "0.08em",
                  fill: phase >= i ? item.color + "bb" : "rgba(255,255,255,.1)",
                  transition: "fill .4s ease" }}>
                {item.label}
              </text>
            ))}

            {/* Problem / Solution space watermarks */}
            <text x="190" y="98" textAnchor="middle"
              style={{ fontFamily: "var(--ff-mono)", fontSize: 8.5,
                fill: "rgba(255,255,255,.12)", letterSpacing: "0.18em",
                textTransform: "uppercase", pointerEvents: "none" }}>
              Problem Space
            </text>
            <text x="480" y="98" textAnchor="middle"
              style={{ fontFamily: "var(--ff-mono)", fontSize: 8.5,
                fill: "rgba(255,255,255,.12)", letterSpacing: "0.18em",
                textTransform: "uppercase", pointerEvents: "none" }}>
              Solution Space
            </text>
          </svg>
        </div>
      )}

      {/* Phase cards */}
      {go && (
        <div className="phase-cards flex justify-center"
          style={{ gap: "var(--sp-3)", paddingInline: "var(--slide-px)" }}>
          {phases.map((p, i) => {
            const clr = ["#8b5cf6","#ec4899","#14b8a6","#f59e0b"][i];
            const active = phase === i;
            return (
              <button key={p.id} onClick={() => setPhase(i)}
                className={`touch-target a-up d${i + 3} flex-1 text-left`}
                style={{
                  maxWidth: 240,
                  background: active
                    ? `linear-gradient(160deg, ${clr}14 0%, var(--bg2) 65%)`
                    : "var(--surface)",
                  borderTop: `2px solid ${active ? clr + "55" : clr + "18"}`,
                  borderRight: `1px solid ${active ? clr + "28" : "var(--hairline)"}`,
                  borderBottom: `1px solid ${active ? clr + "28" : "var(--hairline)"}`,
                  borderLeft: `1px solid ${active ? clr + "28" : "var(--hairline)"}`,
                  borderRadius: "var(--card-radius)",
                  padding: "clamp(8px,1.4vh,14px) var(--sp-4)",
                  transition: "all .3s ease", cursor: "pointer",
                }}>
                {/* Phase name + colour dot */}
                <div className="flex items-center" style={{ gap: "var(--sp-2)", marginBottom: "var(--sp-3)" }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", background: clr,
                    flexShrink: 0,
                    boxShadow: active ? `0 0 8px ${clr}80` : "none",
                    transition: "box-shadow .3s",
                  }} />
                  <p className="t-label" style={{ color: clr }}>{p.label}</p>
                </div>
                {/* Activity list */}
                <div style={{ display: "flex", flexDirection: "column",
                  gap: "var(--sp-1)", marginBottom: "var(--sp-3)" }}>
                  {p.acts.map(a => (
                    <p key={a} className="t-small" style={{ color: "var(--t2)" }}>· {a}</p>
                  ))}
                </div>
                {/* Output */}
                <div style={{ paddingTop: "var(--sp-2)", borderTop: `1px solid ${clr}20` }}>
                  <p className="t-label" style={{ color: clr, marginBottom: "var(--sp-1)", opacity: .7 }}>
                    Output
                  </p>
                  <p className="t-small" style={{ color: "var(--t3)", lineHeight: "var(--lh-tight)" }}>
                    {p.output}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      </div>{/* end slide-col */}
    </div>
  );
}

// ─── Slide 4 · Interview Mastery ─────────────────────────────────────────────
function S4({ active }: { active: boolean }) {
  const go = useEnter(active);
  const [tab, setTab] = useState(0);

  const CLR = ["#8b5cf6", "#ec4899", "#f59e0b", "#14b8a6"] as const;

  const tabs = [
    { label: "TEDW Framework", clr: CLR[0],
      intro: "These four openers each invite a different kind of story. Try to use just one at a time and let the silence after do some work.",
      rows: [
        { letter: "T", word: "Tell me about…",    eg: "Tell me about the last time you booked a flight.", note: "Invites a story" },
        { letter: "E", word: "Explain…",           eg: "Explain how you decide which product to buy.",    note: "Surfaces the how" },
        { letter: "D", word: "Describe…",          eg: "Describe your workspace at home.",                note: "Grounds in specifics" },
        { letter: "W", word: "Walk me through…",   eg: "Walk me through what happened after you clicked.", note: "Traces the journey" },
      ],
    },
    { label: "5 Whys", clr: CLR[1],
      intro: "Keep asking why and you'll usually find the first answer isn't the real one. Most surface complaints are symptoms of something deeper.",
      rows: [
        { letter: "1", word: "Surface statement", eg: '"I want a faster checkout."',             note: "The stated need" },
        { letter: "2", word: "Why #1",            eg: '"The current process takes too long."',   note: "First symptom" },
        { letter: "3", word: "Why #2",            eg: '"I re-enter my card every time."',        note: "Getting warmer" },
        { letter: "4", word: "Why #3",            eg: '"The site never remembers me."',          note: "Something real" },
        { letter: "5", word: "Root cause",        eg: '"I don\'t trust saving my info here."',   note: "Actual problem" },
      ],
    },
    { label: "Anti-patterns", clr: CLR[2],
      intro: "Easy mistakes to make, especially when you're excited about your idea. Worth watching for these in your own interview notes.",
      rows: [
        { letter: "✗", word: "Leading",          eg: '"Don\'t you find it annoying when…?"',     note: "Plants the answer" },
        { letter: "✗", word: "Double-barrelled", eg: '"Do you like the speed and design?"',      note: "Two questions in one" },
        { letter: "✗", word: "Hypothetical",     eg: '"Would you use this feature?"',            note: "Not how people work" },
        { letter: "✗", word: "Closed",           eg: '"Did that work well?"',                    note: "Closes the door" },
      ],
    },
    { label: "5-User Rule", clr: CLR[3],
      intro: "Jakob Nielsen found you don't need a huge sample. Just 5 people will surface most of what's broken, which is a lot more manageable than it sounds.",
      rows: [
        { letter: "3", word: "Minimum viable",  eg: "Catches the obvious blockers before a release.",    note: "Catch the obvious" },
        { letter: "5", word: "Sweet spot",      eg: "85% issue discovery; returns drop off sharply after.", note: "Sweet spot" },
        { letter: "8", word: "Deeper study",    eg: "98%+ coverage, worth it for really high-stakes flows.", note: "High-stakes flows" },
        { letter: "N", word: "Quant research",  eg: "Large samples only when you need statistical confidence.", note: "For the numbers" },
      ],
    },
  ];

  const t = tabs[tab];

  return (
    <div className="noise slide-split relative w-full h-full flex overflow-hidden"
      style={{ background: "var(--bg)" }}>
      <Glow x="72%" y="40%" r={360} color="rgba(139,92,246,.13)" />

      {/* Sidebar */}
      <div className="slide-panel">
        {go && <>
          <SlideTag num="04" label="Craft" />
          <h2 className="t-h2 a-up d2">Interview<br /><span className="shimmer">Mastery</span></h2>
          <nav style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
            {tabs.map((tb, i) => (
              <button key={i} onClick={() => setTab(i)}
                className={`touch-target a-left d${i + 3} text-left`}
                style={{
                  padding: "var(--sp-3) var(--sp-4)",
                  borderRadius: 10,
                  background: tab === i ? tb.clr + "18" : "transparent",
                  borderTop: `1px solid ${tab === i ? tb.clr + "55" : "var(--hairline)"}`,
                  borderRight: `1px solid ${tab === i ? tb.clr + "55" : "var(--hairline)"}`,
                  borderBottom: `1px solid ${tab === i ? tb.clr + "55" : "var(--hairline)"}`,
                  borderLeft: `3px solid ${tab === i ? tb.clr : "transparent"}`,
                  cursor: "pointer", transition: "all .2s ease",
                }}>
                <p style={{ fontSize: "var(--ts-small)", fontWeight: tab === i ? 600 : 400,
                  color: tab === i ? "var(--t1)" : "var(--t2)", transition: "color .2s" }}>
                  {tb.label}
                </p>
              </button>
            ))}
          </nav>
        </>}
      </div>

      {/* Content */}
      <div className="slide-main relative z-10 flex-1 flex flex-col justify-center overflow-hidden"
        style={{ padding: "clamp(16px,4vh,48px) var(--slide-px) clamp(16px,4vh,48px) var(--sp-6)" }}>
        {go && (
          <div key={tab} className="a-up w-full" style={{ maxWidth: 560 }}>

            {/* Tab header */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--sp-3)",
              marginBottom: "var(--sp-5)", paddingBottom: "var(--sp-4)",
              borderBottom: "1px solid var(--hairline)" }}>
              <div style={{ width: 3, minHeight: 44, borderRadius: 2,
                background: t.clr, flexShrink: 0, marginTop: 2 }} />
              <div>
                <p className="t-label" style={{ color: t.clr, marginBottom: "var(--sp-1)" }}>
                  {t.label}
                </p>
                <p className="t-body" style={{ color: "var(--t2)", lineHeight: "var(--lh-tight)" }}>
                  {t.intro}
                </p>
              </div>
            </div>

            {/* Rows — editorial list, no boxes */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {t.rows.map((row, i) => (
                <div key={`${tab}-${i}`}
                  style={{
                    display: "flex", alignItems: "flex-start",
                    gap: "var(--sp-4)",
                    paddingBlock: "var(--sp-4)",
                    borderBottom: i < t.rows.length - 1
                      ? "1px solid var(--hairline)" : "none",
                    animation: `fadeUp .42s cubic-bezier(.22,1,.36,1) ${.04 + i * .07}s both`,
                  }}>

                  {/* Large typographic letter */}
                  <div style={{
                    width: 36, flexShrink: 0, paddingTop: 1,
                    display: "flex", justifyContent: "center",
                  }}>
                    <span style={{
                      fontFamily: "var(--ff-display)", fontWeight: 900,
                      fontSize: "1.5rem", lineHeight: 1,
                      color: t.clr,
                    }}>{row.letter}</span>
                  </div>

                  {/* Thin vertical accent divider */}
                  <div style={{
                    width: 1, alignSelf: "stretch",
                    background: t.clr + "35", flexShrink: 0,
                    marginBlock: 3,
                  }} />

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline",
                      justifyContent: "space-between", gap: "var(--sp-4)",
                      marginBottom: "var(--sp-2)" }}>
                      <p style={{ fontFamily: "var(--ff-body)", fontWeight: 600,
                        fontSize: "var(--ts-body)", color: "var(--t1)", lineHeight: 1.3 }}>
                        {row.word}
                      </p>
                      <span style={{
                        fontFamily: "var(--ff-mono)", fontSize: 9,
                        letterSpacing: "0.12em", textTransform: "uppercase",
                        flexShrink: 0, color: t.clr,
                      }}>{row.note}</span>
                    </div>
                    <p style={{ fontFamily: "var(--ff-display)", fontStyle: "italic",
                      fontSize: "var(--ts-small)", color: "var(--t3)",
                      lineHeight: "var(--lh-tight)" }}>
                      {row.eg}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Slide 5 · Synthesis Pipeline ────────────────────────────────────────────
function S5({ active }: { active: boolean }) {
  const go = useEnter(active);
  const [step, setStep] = useState(-1);

  useEffect(() => {
    if (!go) { setStep(-1); return; }
    const ts = [250, 620, 990, 1360, 1730].map((d, i) => setTimeout(() => setStep(i), d));
    return () => ts.forEach(clearTimeout);
  }, [go]);

  const stages = [
    { icon: "🎙", label: "Raw Data",     color: "#6b6888",
      items: ["Interview transcripts", "Session recordings", "Survey responses", "Analytics exports"],
      desc: "It's messy in here. That's fine — the richness lives in the mess." },
    { icon: "🗂", label: "Organise",     color: "#8b5cf6",
      items: ["Affinity mapping", "Open coding", "Tagging themes", "Clustering notes"],
      desc: "Don't force categories too early. Let the patterns form on their own terms." },
    { icon: "🔗", label: "Connect",      color: "#ec4899",
      items: ["Identify tensions", "Map cause-effect", "Cross-reference clusters", "Spot outliers"],
      desc: "Start asking why things ended up next to each other. That's usually where the interesting stuff hides." },
    { icon: "💡", label: "Synthesise",   color: "#14b8a6",
      items: ["Write insight statements", "Draft HMW questions", "Build personas / JTBDs", "Prioritise by impact"],
      desc: "A pattern becomes an insight when you can say what it means for your design." },
    { icon: "📐", label: "Communicate",  color: "#f59e0b",
      items: ["Journey maps", "Research reports", "Presentations", "Design briefs"],
      desc: "Good research doesn't just inform — it moves people to act. Make it easy for them." },
  ];

  return (
    <div className="noise relative w-full h-full overflow-hidden"
      style={{ background: "var(--bg)" }}>
      <Glow x="50%" y="50%" r={440} color="rgba(20,184,166,.08)" />
      <Glow x="18%" y="22%" r={240} color="rgba(139,92,246,.09)" />

      <div className="slide-col relative z-10">

      {go && (
        <div className="text-center"
          style={{ marginBottom: "clamp(10px,2vh,24px)", paddingInline: "var(--slide-px)" }}>
          <div style={{ marginBottom: "var(--sp-2)" }}>
            <SlideTag num="05" label="Synthesis" color="var(--teal)" />
          </div>
          <h2 className="t-h2 a-up d2">
            Raw Data → <span className="shimmer">Actionable Insight</span>
          </h2>
          <p className="t-small a-up d3" style={{ color: "var(--t3)", marginTop: "var(--sp-1)" }}>
            This is where raw notes become actual ideas. Click through each stage to see what happens.
          </p>
        </div>
      )}

      {go && (
        <div className="stage-flow flex items-stretch justify-center"
          style={{ paddingInline: "var(--slide-px)" }}>
          {stages.map((s, i) => (
            <div key={i} className="flex items-stretch stage-item">
              <button onClick={() => setStep(i)}
                className={`touch-target a-up d${i + 3} text-left flex flex-col stage-card`}
                style={{
                  width: "clamp(130px, 14vw, 190px)",
                  background: step === i ? `${s.color}14` : step >= i ? `${s.color}07` : "var(--surface)",
                  border: `1px solid ${step === i ? s.color + "55" : step >= i ? s.color + "1e" : "var(--hairline)"}`,
                  borderRadius: "var(--card-radius)",
                  padding: "var(--card-p)",
                  opacity: step >= i ? 1 : .4,
                  transition: "all .38s ease",
                  cursor: "pointer",
                }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "var(--sp-3)" }}>{s.icon}</div>
                <p className="t-h3" style={{
                  color: step >= i ? s.color : "var(--t3)",
                  marginBottom: "var(--sp-3)",
                  transition: "color .35s",
                }}>{s.label}</p>
                <div style={{ display: "flex", flexDirection: "column",
                  gap: "var(--sp-1)", marginBottom: "var(--sp-3)", flex: 1 }}>
                  {s.items.map(it => (
                    <p key={it} className="t-small" style={{ color: "var(--t2)" }}>· {it}</p>
                  ))}
                </div>
                {step === i && (
                  <div className="a-in" style={{ paddingTop: "var(--sp-3)",
                    borderTop: `1px solid ${s.color}30` }}>
                    <p className="t-small" style={{ color: "var(--t2)",
                      lineHeight: "var(--lh-body)" }}>{s.desc}</p>
                  </div>
                )}
              </button>

              {/* Arrow connector between stages */}
              {i < stages.length - 1 && (
                <div className="stage-connector flex items-center shrink-0"
                  style={{ width: "var(--sp-4)", justifyContent: "center" }}>
                  <span style={{
                    fontFamily: "var(--ff-mono)", fontSize: 16,
                    color: step > i ? stages[i + 1].color : "rgba(255,255,255,.12)",
                    transition: "color .4s",
                    lineHeight: 1,
                  }}>›</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      </div>{/* end slide-col */}
    </div>
  );
}

// ─── Slide 6 · Business Impact ────────────────────────────────────────────────
function S6({ active }: { active: boolean }) {
  const go = useEnter(active);

  const big = [
    { n: 9900, sfx: "%", label: "return on every dollar invested in UX research",
      src: "Forrester", color: "#8b5cf6" },
    { n: 228,  sfx: "%", label: "how much design-led companies beat the S&P 500 over a decade",
      src: "McKinsey Design Index", color: "#ec4899" },
    { n: 85,   sfx: "%", label: "of usability issues found with just 5 people in a test session",
      src: "Nielsen Norman Group", color: "#14b8a6" },
    { n: 400,  sfx: "%", label: "potential conversion lift from thoughtful UX over average design",
      src: "Forrester", color: "#f59e0b" },
  ];

  const small = [
    { icon: "📉", text: "Bad UX costs companies an estimated $1.4 trillion a year in lost revenue, rework, and customer churn" },
    { icon: "📈", text: "UX research budgets grew 30%+ at nearly a third of companies in 2025/26" },
    { icon: "🎯", text: "94% of first impressions come down to design — people decide in seconds whether to trust what they see" },
    { icon: "⚡", text: "A 0.1s speed improvement can lift conversions by 8.4% and average order value by 9.2%" },
  ];

  return (
    <div className="noise relative w-full h-full overflow-hidden"
      style={{ background: "var(--bg)" }}>
      <Glow x="28%" y="32%" r={360} color="rgba(139,92,246,.14)" />
      <Glow x="76%" y="72%" r={320} color="rgba(236,72,153,.11)" />

      <div className="slide-col relative z-10">

        {go && (
          <div className="text-center"
            style={{ marginBottom: "clamp(10px,2vh,28px)", paddingInline: "var(--slide-px)" }}>
            <div style={{ marginBottom: "var(--sp-2)" }}>
              <SlideTag num="06" label="Business Impact" color="var(--amber)" />
            </div>
            <h2 className="t-h2 a-up d2">
              The Numbers Behind <span className="shimmer">Good Design</span>
            </h2>
          </div>
        )}

        {/* Big stats */}
        {go && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
            style={{ gap: "var(--sp-3)", paddingInline: "var(--slide-px)",
              marginBottom: "clamp(8px,1.5vh,20px)" }}>
            {big.map((s, i) => (
              <div key={i} className={`card grad-border a-up d${i + 2} text-center`}
                style={{ padding: "clamp(12px,2vh,20px)" }}>
                <p className="t-h1" style={{ color: s.color,
                  marginBottom: "var(--sp-1)", fontSize: "clamp(2rem,4vw,4rem)" }}>
                  <AnimNum to={s.n} suffix={s.sfx} active={active} delay={(i + 2) * 140} />
                </p>
                <div style={{ width: 24, height: 2, background: s.color,
                  margin: "0 auto var(--sp-2)", borderRadius: 1 }} />
                <p className="t-small" style={{ color: "var(--t2)",
                  lineHeight: "var(--lh-tight)", marginBottom: "var(--sp-1)" }}>
                  {s.label}
                </p>
                <p className="t-label" style={{ color: "var(--t3)" }}>{s.src}</p>
              </div>
            ))}
          </div>
        )}

        {/* Supporting stats */}
        {go && (
          <div className="grid grid-cols-1 lg:grid-cols-2"
            style={{ gap: "var(--sp-3)", paddingInline: "var(--slide-px)" }}>
            {small.map((s, i) => (
              <div key={i} className={`card a-left d${i + 6} flex items-start`}
                style={{ gap: "var(--sp-3)", padding: "var(--sp-3) var(--sp-4)" }}>
                <span style={{ fontSize: "1rem", flexShrink: 0 }}>{s.icon}</span>
                <p className="t-small" style={{ color: "var(--t2)",
                  lineHeight: "var(--lh-body)" }}>{s.text}</p>
              </div>
            ))}
          </div>
        )}

      </div>{/* end slide-col */}
    </div>
  );
}

// ─── Slide 7 · Nielsen's 10 Heuristics ───────────────────────────────────────
function S7({ active }: { active: boolean }) {
  const go = useEnter(active);
  const [sel, setSel] = useState(0);

  const heuristics = [
    { n: "01", t: "Visibility of system status",      c: "#8b5cf6",
      body: "People shouldn't have to wonder what your product is doing. A little feedback goes a long way.",
      eg: "Progress bars, 'Saving…' labels, toast notifications, loading skeletons, breadcrumbs." },
    { n: "02", t: "Match system to real world",        c: "#9333ea",
      body: "Write for people, not for your tech stack. If your interface sounds like a manual, something's off.",
      eg: "Trash can icon for deletion. 'Shopping cart' not 'purchase basket object.'" },
    { n: "03", t: "User control and freedom",          c: "#ec4899",
      body: "Everyone taps the wrong thing sometimes. Make it easy to back out, undo, or start over without consequences.",
      eg: "Undo / Redo. Cancel on all dialogs. Soft-delete with 30-day recovery." },
    { n: "04", t: "Consistency and standards",         c: "#f43f5e",
      body: "When similar things work differently, trust breaks quietly. Consistency is what makes an interface feel familiar.",
      eg: "Submit always bottom-right. Close always top-right. Links always underlined." },
    { n: "05", t: "Error prevention",                  c: "#f59e0b",
      body: "A good error message beats a bad one. But stopping the error from happening at all is better still.",
      eg: "Inline validation. Confirmation dialogs for destructive actions. Disabled states with tooltips." },
    { n: "06", t: "Recognition over recall",           c: "#84cc16",
      body: "Don't ask people to remember things. Show them what they can do instead of making them guess.",
      eg: "Autocomplete. Recently viewed. Keyboard shortcuts visible in menus." },
    { n: "07", t: "Flexibility and efficiency",        c: "#14b8a6",
      body: "Beginners need guardrails. Experts want shortcuts. Good design quietly serves both at the same time.",
      eg: "Keyboard shortcuts. Saved filters. Batch actions. Customisable dashboards." },
    { n: "08", t: "Aesthetic and minimalist design",   c: "#38bdf8",
      body: "More isn't better. Every word, button, and option you add is competing for attention. Be ruthless about what earns its place.",
      eg: "One primary CTA per screen. Default hide advanced settings. Remove unused nav items." },
    { n: "09", t: "Help users recognise errors",       c: "#818cf8",
      body: "When something goes wrong, be honest, be specific, and actually help. 'Something went wrong' is a non-answer.",
      eg: "'Email not found. Try signing up or reset your password.' Not: 'Error 401.'" },
    { n: "10", t: "Help and documentation",            c: "#c084fc",
      body: "In a perfect world, no one needs help. In the real world, make sure it's there and easy to find when they do.",
      eg: "Contextual tooltips. Onboarding checklists. Searchable help centre with task-based articles." },
  ];

  const h = heuristics[sel];

  return (
    <div className="noise slide-split relative w-full h-full flex overflow-hidden"
      style={{ background: "var(--bg)" }}>
      <Glow x="76%" y="50%" r={400} color="rgba(139,92,246,.13)" />

      {/* Panel — 2-col nav grid so 10 items always fit */}
      <div className="slide-panel">
        {go && <>
          <SlideTag num="07" label="Heuristics" />
          <h2 className="t-h2 a-up d2" style={{ fontSize: "clamp(1.5rem,2.4vw,2.2rem)" }}>
            Nielsen's 10<br /><span className="shimmer">Heuristics</span>
          </h2>
          {/* 2-column grid: 5 rows × 2 cols instead of 10 rows × 1 col */}
          <nav className="heuristics-nav" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-2)" }}>
            {heuristics.map((hr, i) => (
              <button key={i} onClick={() => setSel(i)}
                className="touch-target a-up text-left"
                style={{
                  animationDelay: `${0.04 + i * 0.04}s`,
                  padding: "var(--sp-2) var(--sp-3)",
                  borderRadius: 10,
                  background: sel === i ? `${hr.c}18` : "var(--surface)",
                  border: `1px solid ${sel === i ? hr.c + "55" : "var(--hairline)"}`,
                  cursor: "pointer", transition: "all .2s",
                }}>
                <p className="t-label" style={{ color: hr.c, marginBottom: "var(--sp-1)" }}>{hr.n}</p>
                <p style={{ fontSize: 11, fontWeight: sel === i ? 600 : 400, lineHeight: 1.35,
                  color: sel === i ? "var(--t1)" : "var(--t2)" }}>
                  {hr.t}
                </p>
              </button>
            ))}
          </nav>
        </>}
      </div>

      {/* Detail */}
      <div className="slide-main relative z-10 flex-1 flex items-start"
        style={{ paddingInline: "var(--sp-6) var(--slide-px)",
          paddingTop: "clamp(20px, 7vh, 72px)", minHeight: 0, overflowY: "auto" }}>
        {go && (
          <div key={sel} className="a-up" style={{ maxWidth: 480 }}>
            <div className="flex items-start" style={{ gap: "var(--sp-5)", marginBottom: "var(--sp-6)" }}>
              <span style={{ fontFamily: "var(--ff-display)", fontWeight: 900,
                fontSize: "5.5rem", color: h.c + "28", lineHeight: 1, flexShrink: 0 }}>
                {h.n}
              </span>
              <div>
                <h3 style={{ fontFamily: "var(--ff-display)", fontWeight: 700,
                  fontSize: "1.8rem", color: h.c, lineHeight: "var(--lh-heading)",
                  marginBottom: "var(--sp-4)" }}>
                  {h.t}
                </h3>
                <p className="t-body" style={{ color: "var(--t2)", lineHeight: "var(--lh-body)" }}>
                  {h.body}
                </p>
              </div>
            </div>

            <div style={{ background: `${h.c}0e`, border: `1px solid ${h.c}2e`,
              borderRadius: "var(--card-radius)", padding: "var(--card-p)" }}>
              <p className="t-label" style={{ color: h.c, marginBottom: "var(--sp-3)" }}>
                In practice
              </p>
              <p className="t-body" style={{ color: "var(--t2)", lineHeight: "var(--lh-body)" }}>
                {h.eg}
              </p>
            </div>

            {/* Dot pagination */}
            <div className="flex items-center" style={{ gap: "var(--sp-2)", marginTop: "clamp(12px,2vh,24px)" }}>
              {heuristics.map((_, i) => (
                <button key={i} onClick={() => setSel(i)}
                  style={{
                    width: i === sel ? 20 : 6, height: 6, borderRadius: 3,
                    background: i === sel ? h.c : "rgba(255,255,255,.12)",
                    border: "none", cursor: "pointer",
                    transition: "all .28s cubic-bezier(.22,1,.36,1)",
                  }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Slide 8 · Maturity Model ─────────────────────────────────────────────────
function S8({ active }: { active: boolean }) {
  const go = useEnter(active);
  const [hov, setHov] = useState<number | null>(null);
  const [locked, setLocked] = useState<number | null>(null);
  useEffect(() => {
    if (!go) {
      setHov(null);
      setLocked(null);
    }
  }, [go]);

  const levels = [
    { n: 1, name: "Absent",      c: "#ef4444", h: "18%",
      org:  "No dedicated UX. Decisions get made by whoever speaks loudest in the room.",
      res:  "Users don't get a say. Products are built entirely on assumptions." },
    { n: 2, name: "Limited",     c: "#f97316", h: "36%",
      org:  "One designer, usually stretched thin, mostly putting out fires.",
      res:  "Research happens when something breaks badly enough to force it." },
    { n: 3, name: "Emerging",    c: "#eab308", h: "54%",
      org:  "There's a real UX team now, though they often have to fight for a seat at the table.",
      res:  "Research is scheduled, not just reactive. Personas and journey maps are starting to show up." },
    { n: 4, name: "Structured",  c: "#22c55e", h: "72%",
      org:  "UX is baked into how teams work, not bolted on at the end.",
      res:  "Research is ongoing and connected to real business goals." },
    { n: 5, name: "Integrated",  c: "#14b8a6", h: "90%",
      org:  "UX influences company strategy. Research is a core capability, not a nice-to-have.",
      res:  "Almost no major decision gets made without understanding what users actually need." },
  ];
  const activeLevel = locked ?? hov;

  return (
    <div className="noise relative w-full h-full overflow-hidden"
      style={{ background: "var(--bg)" }}>
      <Glow x="50%" y="58%" r={440} color="rgba(20,184,166,.08)" />
      <Glow x="82%" y="18%" r={260} color="rgba(139,92,246,.09)" />

      <div className="slide-col relative z-10">

      {go && (
        <div className="text-center"
          style={{ marginBottom: "clamp(10px,2vh,28px)", paddingInline: "var(--slide-px)" }}>
          <div style={{ marginBottom: "var(--sp-2)" }}>
            <SlideTag num="08" label="Maturity" color="var(--teal)" />
          </div>
          <h2 className="t-h2 a-up d2">UX Maturity Model</h2>
          <p className="t-small a-up d3" style={{ color: "var(--t3)", marginTop: "var(--sp-1)" }}>
            Where does your team sit? Hover each bar to find out.
          </p>
        </div>
      )}

      {/* Bar chart — tooltips removed from inside flex-col to prevent overlap */}
      {go && (
        <div className="flex items-end justify-center"
          style={{ gap: "var(--sp-4)", paddingInline: "var(--slide-px)",
            height: "clamp(160px,28vh,240px)" }}>
          {levels.map((l, i) => (
            <div key={l.n} className={`a-up d${i + 3} flex flex-col items-center flex-1`}
              style={{ maxWidth: 170, cursor: "default" }}
              onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
              onClick={() => setLocked(prev => prev === i ? null : i)}>

              {/* Bar */}
              <div className="w-full rounded-t-2xl transition-all duration-500"
                style={{
                  height: l.h,
                  background: `linear-gradient(to top, ${l.c}30, ${l.c}10)`,
                  borderTop: `1px solid ${activeLevel === i ? l.c + "60" : l.c + "22"}`,
                  borderRight: `1px solid ${activeLevel === i ? l.c + "60" : l.c + "22"}`,
                  borderBottom: "none",
                  borderLeft: `1px solid ${activeLevel === i ? l.c + "60" : l.c + "22"}`,
                  transform: activeLevel === i ? "scaleY(1.04)" : "scaleY(1)",
                  transformOrigin: "bottom",
                }}>
                <div className="h-0.5 rounded-t-2xl"
                  style={{ background: l.c, opacity: activeLevel === i ? 1 : .45,
                    transition: "opacity .28s" }} />
              </div>

              {/* Label below bar */}
              <div className="text-center" style={{ paddingTop: "var(--sp-3)" }}>
                <p className="t-label" style={{ color: l.c, marginBottom: "var(--sp-1)" }}>
                  Level {l.n}
                </p>
                <p className="t-h3" style={{ fontSize: "var(--ts-small)", fontWeight: 600 }}>
                  {l.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail panel — lives below chart, never overlaps title */}
      {go && (
        <div style={{ minHeight: 82, marginTop: "clamp(10px,1.8vh,20px)",
          paddingInline: "var(--slide-px)", display: "flex",
          alignItems: "center", justifyContent: "center" }}>

          {activeLevel !== null ? (
            <div key={activeLevel} className="maturity-detail a-in w-full flex items-stretch"
              style={{
                gap: "var(--sp-5)",
                background: levels[activeLevel].c + "0d",
                border: `1px solid ${levels[activeLevel].c}30`,
                borderRadius: "var(--card-radius)",
                padding: "var(--sp-4) var(--sp-5)",
              }}>
              {/* Org column */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="t-label" style={{ color: levels[activeLevel].c, marginBottom: "var(--sp-2)" }}>
                  Organisation
                </p>
                <p className="t-small" style={{ color: "var(--t2)", lineHeight: "var(--lh-tight)" }}>
                  {levels[activeLevel].org}
                </p>
              </div>
              {/* Divider */}
              <div style={{ width: 1, background: levels[activeLevel].c + "25", flexShrink: 0 }} />
              {/* Research column */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="t-label" style={{ color: "var(--t3)", marginBottom: "var(--sp-2)" }}>
                  Research
                </p>
                <p className="t-small" style={{ color: "var(--t2)", lineHeight: "var(--lh-tight)" }}>
                  {levels[activeLevel].res}
                </p>
              </div>
              {/* Level badge */}
              <div style={{
                flexShrink: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                background: levels[activeLevel].c + "18",
                border: `1px solid ${levels[activeLevel].c}30`,
                borderRadius: 12,
                padding: "var(--sp-3) var(--sp-5)",
              }}>
                <p className="t-label" style={{ color: levels[activeLevel].c, marginBottom: "var(--sp-1)" }}>
                  Level {levels[activeLevel].n}
                </p>
                <p style={{ fontFamily: "var(--ff-display)", fontWeight: 700,
                  fontSize: "1.05rem", color: levels[activeLevel].c, lineHeight: 1.2 }}>
                  {levels[activeLevel].name}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center" style={{
              gap: "var(--sp-5)", padding: "var(--sp-3) var(--sp-5)",
              background: "var(--surface)", border: "1px solid var(--hairline)",
              borderRadius: 100,
            }}>
              <p className="t-label">Most companies sit at Level 2 to 3</p>
              <div style={{ width: 1, height: 14, background: "var(--hairline)" }} />
              <p className="t-label" style={{ color: "var(--teal)" }}>
                Level 4 and above tends to show up in the business results
              </p>
            </div>
          )}
        </div>
      )}

      </div>{/* end slide-col */}
    </div>
  );
}

// ─── Slide 9 · Call to Action ─────────────────────────────────────────────────
function S9({ active }: { active: boolean }) {
  const go = useEnter(active);
  const [done, setDone] = useState<Set<number>>(new Set());

  const toggle = (i: number) => setDone(p => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; });

  const items = [
    { sprint: "This week",   icon: "🎙", t: "Have 3 conversations with real users using the TEDW questions",  effort: "Low" },
    { sprint: "This week",   icon: "🗺", t: "Sketch out one customer journey from first arrival to drop-off", effort: "Med" },
    { sprint: "This sprint", icon: "🧪", t: "Watch 5 people try to use your most important flow",             effort: "Med" },
    { sprint: "This sprint", icon: "📐", t: "Go through your top 3 screens with Nielsen's 10 heuristics",    effort: "Low" },
    { sprint: "This month",  icon: "🔬", t: "Build a habit of talking to users every week, even if briefly",  effort: "High" },
    { sprint: "This month",  icon: "📊", t: "Tie at least one research finding to a metric your team tracks", effort: "High" },
  ];

  const sprintColor = (s: string) =>
    s === "This week" ? "var(--violet)" : s === "This sprint" ? "var(--teal)" : "var(--amber)";

  return (
    <div className="noise relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{ background: "var(--bg)" }}>
      <Glow x="50%" y="42%" r={480} color="rgba(139,92,246,.16)" />
      <Glow x="18%" y="78%" r={260} color="rgba(236,72,153,.09)" />
      <Glow x="86%" y="68%" r={220} color="rgba(20,184,166,.07)" />

      <div className="cta-layout relative z-10 flex items-center"
        style={{ gap: "var(--sp-10)", paddingInline: "var(--slide-px)",
          width: "100%", maxWidth: 960, maxHeight: "100%" }}>

        {/* Left: hero text */}
        <div className="cta-sidebar" style={{ width: "var(--sidebar-w)", flexShrink: 0 }}>
          {go && <>
            <div className="a-in d1" style={{ marginBottom: "var(--sp-6)" }}>
              <SlideTag num="09" label="Action" color="var(--amber)" />
            </div>
            <h2 className="t-display a-up d2"
              style={{ fontSize: "clamp(3rem,5.5vw,5rem)", marginBottom: "var(--sp-5)" }}>
              Now, Go<br />Talk to<br />
              <em className="shimmer not-italic">Users.</em>
            </h2>
            <p className="t-body a-up d3" style={{ marginBottom: "var(--sp-6)" }}>
              You don't need a lab or a big budget to start. You just need to be genuinely
              curious and willing to hear things you didn't expect.
            </p>

            {done.size > 0 && (
              <div className="a-scale card" style={{
                borderColor: "rgba(20,184,166,.35)",
                background: "rgba(20,184,166,.08)",
              }}>
                <p className="t-label" style={{ color: "var(--teal)",
                  marginBottom: "var(--sp-2)" }}>
                  {done.size === items.length ? "🎉 That's the spirit. Now go do the work." : `${done.size} of ${items.length} picked`}
                </p>
                <div style={{ height: 4, background: "rgba(255,255,255,.1)",
                  borderRadius: 2 }}>
                  <div style={{
                    height: "100%", borderRadius: 2,
                    background: "var(--teal)",
                    width: `${(done.size / items.length) * 100}%`,
                    transition: "width .4s cubic-bezier(.22,1,.36,1)",
                  }} />
                </div>
              </div>
            )}
          </>}
        </div>

        {/* Right: checklist — scrollable on short screens */}
        <div className="cta-list flex-1 flex flex-col" style={{ gap: "var(--sp-3)",
          overflowY: "auto", maxHeight: "calc(100dvh - 120px)" }}>
          {go && items.map((item, i) => {
            const checked = done.has(i);
            return (
              <button key={i} onClick={() => toggle(i)}
                className={`a-right d${i + 2} text-left flex items-center`}
                style={{
                  gap: "var(--sp-4)",
                  padding: "var(--sp-4) var(--sp-5)",
                  borderRadius: "var(--card-radius)",
                  background: checked ? "rgba(20,184,166,.08)" : "var(--surface)",
                  border: `1px solid ${checked ? "rgba(20,184,166,.3)" : "var(--hairline)"}`,
                  cursor: "pointer", transition: "all .25s",
                }}>
                {/* Checkbox */}
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  background: checked ? "var(--teal)" : "transparent",
                  border: `2px solid ${checked ? "var(--teal)" : "rgba(255,255,255,.2)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all .22s",
                }}>
                  {checked && <span style={{ fontSize: 11, color: "#fff", lineHeight: 1 }}>✓</span>}
                </div>

                <span style={{ fontSize: "1.25rem", flexShrink: 0 }}>{item.icon}</span>

                <p style={{ flex: 1, fontSize: "var(--ts-small)",
                  color: checked ? "var(--t3)" : "var(--t2)",
                  textDecoration: checked ? "line-through" : "none",
                  lineHeight: "var(--lh-tight)", transition: "all .22s" }}>
                  {item.t}
                </p>

                <div className="flex items-center shrink-0" style={{ gap: "var(--sp-2)" }}>
                  <p className="t-label" style={{ color: sprintColor(item.sprint) }}>
                    {item.sprint}
                  </p>
                  <span className="t-label" style={{
                    padding: "2px 7px", borderRadius: 4,
                    background: "var(--surface2)", color: "var(--t3)",
                  }}>{item.effort}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Registry ─────────────────────────────────────────────────────────────────
const SLIDES = [
  { id: 0, label: "Intro",           C: S0 },
  { id: 1, label: "UX Iceberg",      C: S1 },
  { id: 2, label: "Research 2×2",    C: S2 },
  { id: 3, label: "Double Diamond",  C: S3 },
  { id: 4, label: "Interviews",      C: S4 },
  { id: 5, label: "Synthesis",       C: S5 },
  { id: 6, label: "Impact",          C: S6 },
  { id: 7, label: "Heuristics",      C: S7 },
  { id: 8, label: "Maturity",        C: S8 },
  { id: 9, label: "Action",          C: S9 },
];

// ─── Side-dot with hover label ────────────────────────────────────────────────
function SideDot({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center",
      justifyContent: "flex-end" }}>
      {/* Tooltip label */}
      <span style={{
        position: "absolute", right: 18,
        fontFamily: "var(--ff-mono)", fontSize: 10,
        letterSpacing: "0.1em", textTransform: "uppercase",
        color: "var(--t2)",
        background: "rgba(7,7,15,.9)", backdropFilter: "blur(8px)",
        border: "1px solid var(--hairline)",
        padding: "3px 7px", borderRadius: 4, whiteSpace: "nowrap",
        pointerEvents: "none",
        opacity: hov ? 1 : 0,
        transform: hov ? "translateX(0)" : "translateX(6px)",
        transition: "opacity .18s, transform .18s",
      }}>{label}</span>
      <button
        onClick={onClick}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        aria-label={label}
        style={{
          width: active ? 8 : 5, height: active ? 8 : 5,
          borderRadius: "50%",
          background: active ? "var(--violet)" : "rgba(255,255,255,.18)",
          border: active ? "2px solid var(--violet-lt)" : "none",
          cursor: "pointer",
          transition: "all .28s cubic-bezier(.22,1,.36,1)",
          outline: "none",
        }} />
    </div>
  );
}

// ─── Chip with tooltip ────────────────────────────────────────────────────────
function SlideChip({ active, num, label, onClick }: {
  active: boolean; num: number; label: string; onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      {/* Tooltip */}
      <span style={{
        position: "absolute", top: "calc(100% + 6px)", left: "50%",
        transform: hov ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(-4px)",
        fontFamily: "var(--ff-mono)", fontSize: 9,
        letterSpacing: "0.1em", textTransform: "uppercase",
        color: "var(--t2)",
        background: "rgba(7,7,15,.92)", backdropFilter: "blur(8px)",
        border: "1px solid var(--hairline)",
        padding: "3px 7px", borderRadius: 4, whiteSpace: "nowrap",
        pointerEvents: "none", zIndex: 80,
        opacity: hov ? 1 : 0,
        transition: "opacity .16s, transform .16s",
      }}>{label}</span>
      <button
        onClick={onClick}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        aria-label={`Go to slide ${num + 1}: ${label}`}
        className="touch-target"
        style={{
          padding: "3px 8px", borderRadius: 5,
          background: active ? "rgba(139,92,246,.22)" : "transparent",
          border: `1px solid ${active ? "rgba(139,92,246,.45)" : "transparent"}`,
          fontFamily: "var(--ff-mono)", fontSize: 11,
          color: active ? "var(--violet-lt)" : "var(--t3)",
          cursor: "pointer", transition: "all .18s",
          outline: "none",
        }}>
        {String(num).padStart(2, "0")}
      </button>
    </div>
  );
}

// ─── App shell ────────────────────────────────────────────────────────────────
export default function App() {
  const [cur, setCur] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [transitioning, setTransitioning] = useState(false);
  const touchX = useRef<number | null>(null);

  const goTo = useCallback((i: number) => {
    if (i === cur || transitioning || i < 0 || i >= SLIDES.length) return;
    setDir(i > cur ? 1 : -1);
    setTransitioning(true);
    setTimeout(() => { setCur(i); setTransitioning(false); }, 320);
  }, [cur, transitioning]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault(); goTo(cur + 1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault(); goTo(cur - 1);
      } else if (e.key >= "0" && e.key <= "9") {
        goTo(parseInt(e.key));
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [cur, goTo]);

  const { C } = SLIDES[cur];
  const pct = ((cur + 1) / SLIDES.length) * 100;
  const isFirst = cur === 0;
  const isLast = cur === SLIDES.length - 1;

  return (
    <div
      className="app-shell"
      style={{ width: "100%", height: "100%", display: "flex",
        flexDirection: "column", background: "var(--bg)" }}
      onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) < 48) return;
        if (dx < 0) goTo(cur + 1);
        else goTo(cur - 1);
      }}
    >
      {/* Top chrome */}
      <div className="chrome" style={{ borderBottom: "1px solid var(--hairline)" }}>
        <span className="t-label" style={{ flexShrink: 0 }}>
          UX & CUSTOMER RESEARCH
        </span>

        {/* Slide chips with tooltips */}
        <div className="top-chips" style={{ display: "flex", gap: "var(--sp-1)", flex: 1,
          justifyContent: "center" }}>
          {SLIDES.map((s, i) => (
            <SlideChip key={i} active={i === cur} num={i} label={s.label}
              onClick={() => goTo(i)} />
          ))}
        </div>

        <span className="t-label" style={{ flexShrink: 0, color: "var(--violet-lt)",
          fontWeight: 600 }}>
          {SLIDES[cur].label}
        </span>
      </div>

      {/* Slide canvas */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <div
          key={cur}
          style={{
            position: "absolute", inset: 0,
            animation: `slideEnter${dir > 0 ? "Right" : "Left"} .34s cubic-bezier(.22,1,.36,1) both`,
          }}
        >
          <C active={!transitioning} />
        </div>
      </div>

      {/* Bottom chrome */}
      <div className="chrome bottom-chrome" style={{ borderTop: "1px solid var(--hairline)",
        gap: "var(--sp-4)" }}>
        <button
          onClick={() => goTo(cur - 1)}
          disabled={isFirst}
          aria-label="Previous slide"
          className="touch-target nav-btn"
          style={{
            padding: "6px 16px", borderRadius: 8,
            fontFamily: "var(--ff-body)", fontSize: "var(--ts-small)",
            background: isFirst ? "transparent" : "var(--surface2)",
            border: `1px solid ${isFirst ? "rgba(255,255,255,.06)" : "var(--hairline)"}`,
            color: isFirst ? "rgba(255,255,255,.2)" : "var(--t2)",
            cursor: isFirst ? "not-allowed" : "pointer",
            transition: "all .18s", flexShrink: 0,
          }}>
          ← Prev
        </button>

        <ProgressBar pct={pct} />

        {/* Keyboard hint */}
        <span className="t-label kbd-hint" style={{ flexShrink: 0, color: "var(--t3)" }}>
          ← → keys
        </span>

        <span className="t-label" style={{ flexShrink: 0 }}>
          {cur + 1} / {SLIDES.length}
        </span>

        <button
          onClick={() => goTo(cur + 1)}
          disabled={isLast}
          aria-label="Next slide"
          className="touch-target nav-btn"
          style={{
            padding: "6px 16px", borderRadius: 8,
            fontFamily: "var(--ff-body)", fontSize: "var(--ts-small)",
            background: isLast ? "transparent" : "var(--violet)",
            border: `1px solid ${isLast ? "rgba(255,255,255,.06)" : "var(--violet)"}`,
            color: isLast ? "rgba(255,255,255,.2)" : "#fff",
            cursor: isLast ? "not-allowed" : "pointer",
            transition: "all .18s", flexShrink: 0,
          }}>
          Next →
        </button>
      </div>

      {/* Side nav dots with hover labels */}
      <div className="side-dots" style={{
        position: "fixed", right: 14, top: "50%",
        transform: "translateY(-50%)",
        display: "flex", flexDirection: "column",
        gap: "var(--sp-2)", zIndex: 60,
      }}>
        {SLIDES.map((s, i) => (
          <SideDot key={i} active={i === cur} label={s.label} onClick={() => goTo(i)} />
        ))}
      </div>
    </div>
  );
}
