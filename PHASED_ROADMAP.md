# Phased Product Plan — CEO Capacity Planning Feature Request

## Framing

The CEO email is a **feature request**, not a committed roadmap item. It points at a real customer behavior (exports → Excel for surge planning) and proposes a solution (in-platform projection + alerts, leveraging MySQL + Beacon AI).

As Pod PM, we **pressure-test where value actually lies**—which pain we can solve, for whom, and whether each increment moves **retention** or **growth**—before spending scarce eng on the full AI service.

This plan is **multi-phase**, with **explicit success and kill metrics** at each gate. Later phases only unlock if earlier phases prove we are moving in the right direction.

---

## Value hypotheses we are testing (not assuming)

| ID | Hypothesis | If true, value looks like… |
|---|---|---|
| H1 | Pain is mostly **getting data out** of RB | Reporting/templates retire most Excel work |
| H2 | Pain is **not knowing load early enough** | Projection + alerts change staffing/room decisions |
| H3 | Pain is **placing constrained resources** (esp. accommodations) | Allocation workspace retires Excel; forecast alone does not |
| H4 | Pain is **day-of breakdown** or **budget justification** | Different products (ops board / costed scenarios)—not Capacity AI |
| H5 | Solving the right pain **retains** high-volume sites and/or **attaches** Essentials / paid module | Commercial path clears portfolio bar |

CEO request maps most directly to **H2**. The spreadsheet artifact also strongly suggests **H3**. Phase 0–1 exist to stop us from over-building H2 if H1 or H3 (or H4) is the real lever.

---

## Phase 0 — Problem & commercial validation *(gate, not a ship)*

**Intent:** Confirm we should spend product eng at all; disambiguate H1–H5 with named accounts.

**Work:**
- Internal: export/report usage around finals; CS ticket themes; at-risk / Excel-heavy sites; Essentials/RB+ status
- Discovery: Director card-sort (forecast / allocation / exports / day-of / budget); GM save/expand check
- One-page go/no-go scored against GDR/retention and NDR levers (RB+, Essentials, campus Resource)

**Success (proceed):**
- ≥1 clear winning problem letter (or segment split) with **named accounts**
- Evidence of **retention risk** and/or **expansion lever** (not “Excel is annoying” alone)
- Agreement with GM on what “good” means commercially

**Kill / redirect:**
- No commercial path → backlog + CEO readout; eng stays on thesis-aligned work
- Winning problem is day-of or budget-only → spin separate thin bet; do **not** start Capacity AI

**Exit artifact:** Winning hypothesis (H1/H2/H3…), target segment, kill criteria for Phase 1.

---

## Phase 1 — “Finals Pack” (cheap wedge — mostly H1)

**Intent:** Ship the smallest enhancement that reduces surge-planning friction **and** teaches us whether value is reporting vs deeper workflow.

**Feature enhancements:**
- Scheduled / one-click **finals surge export** (bookings, rooms, accommodation tags, historical peak slices)
- Saved **surge views** in reporting
- Opinionated **Excel/Google template** pre-structured for stagger + accommodation columns
- Optional one-page **capacity snapshot** directors can send to a dean (supports H4/E lightly without a full product)

**Not in Phase 1:** ML, in-app planning board, autonomous recommendations.

**Success metrics (run across 1 surge cycle with design partners):**

| Metric | Target direction | Suggests… |
|---|---|---|
| Time to assemble finals plan pack | ↓ ≥30% vs prior term (partner self-report + optional diary) | Real operational value |
| CS tickets: “can’t get data / export for planning” | ↓ in partner cohort | H1 partially true |
| % partners whose *primary* plan still requires heavy custom Excel beyond the template | Track | If drops to near-zero → **H1 may be enough** (stop or slow Phase 2) |
| Qualitative: “Would you pay / upgrade for deeper in-app planning?” | Segment signal | Fuel for H2/H3 |

**Kill / pivot:**
- Partners satisfied with pack alone **and** no retention/expand story for deeper build → **stop** at Phase 1; treat CEO AI ask as deferred
- Partners still rebuild full constraint boards in Excel → **H1 insufficient**; proceed Phase 2/3 with eyes on H2 vs H3

**Counter-metrics:** Support load from new exports; template abandonment.

---

## Phase 2 — Explainable projection + alerts (H2 — CEO-shaped, trust-first)

**Intent:** Test whether **earlier, trusted visibility** of over/under capacity changes decisions—without boiling the ocean on allocation UI or ML.

**Feature enhancements:**
- Configure surge **inventory** (seats/rooms/hours/specialized capacity)
- **Projection overlay** from history + current bookings (rules/seasonality first—not “train a model”)
- **Alerts** when projected demand exceeds or falls short of inventory (incl. accommodation-capable capacity)
- **Why** panel (drivers); dismiss reasons logged for CS/PM
- Human **confirm** before any plan mutation; no auto-notify staff

**Success metrics (1–2 surge cycles):**

| Metric | Target | Kill if… |
|---|---|---|
| Alert **action rate** (accept/edit vs dismiss) | Clears agreed floor (set with partners; e.g. ≥40% actioned) | Chronically ignored |
| Forecast error vs actual (baseline rules) | Tracked and improving or explainable | Persistently wrong + trust collapse |
| Director planning hours / surge | ↓ vs Phase 1 baseline | No change in behavior |
| Over/under staffing incidents (or proxies) | ↓ | Flat/up while alerts fire |
| Feature disable / “turn off alerts” requests | Low | Spike → trust failure |

**Counter-metrics:** Support tickets blaming alerts; dismiss reason mix (“Don’t trust” dominant).

**Gate to Phase 3:**
- Action rate + some planning-time or incident improvement **and**
- Partners still say Excel is required for **placement** (H3) → unlock allocation
- If alerts alone retire Excel for the segment → **skip or shrink Phase 3**; package Phase 2 as Essentials win

---

## Phase 3 — Constraint-aware allocation workspace (H3)

**Intent:** Bring the load-bearing spreadsheet job in-product: place rooms/time/accommodations/staff pools; use Phase 2 projection as **input**.

**Feature enhancements:**
- Surge **plan board** (rooms × time; accommodation flags; spillover)
- Infeasibility alerts on the *plan* (not only raw demand)
- Suggested remedies (open spillover, extend hours, add reader-capable seats) with confirm
- Export escape hatch retained until Excel retirement metrics clear
- CS/PM instrumentation: dismissals, export frequency, partner health

**Success metrics:**

| Metric | Target | Kill if… |
|---|---|---|
| Primary plan lives in RB by end of surge (design partners) | Majority of cohort | Excel still canonical |
| Constraint-feasible plan before week-of (no known accommodation shortfall) | ↑ | Plans still break the same way |
| Accommodation / specialized shortfall incidents | ↓ | Flat/up |
| Export frequency for *planning* (not day-of) | ↓ | Unchanged |
| Essentials attach / upgrade conversations influenced (GM) | Qualitative → countable | No commercial narrative |

**Counter-metrics:** ADA-related trust incidents; time-to-first-plan too high (setup friction).

**Gate to Phase 4:** Transparent baseline trusted; clear leftover error that ML could beat; packaging appetite for paid tier.

---

## Phase 4 — Optimization & packaging (“Capacity Pro”) *(only if lift is real)*

**Intent:** Invest in heavier forecasting/optimization and monetization **only** after Phase 2–3 earn trust and show residual value ML can capture.

**Feature enhancements:**
- Model/ensemble that must **beat Phase 2 baseline** on holdout surge weeks
- Multi-site / advanced accommodation forecasting
- Deeper staffing-mix optimization with override UX
- Paid **Capacity Pro** (or equivalent) ladder; MVP remains Essentials differentiator where that won

**Success metrics:**
- Statistically meaningful lift vs Phase 2 baseline on forecast and/or recommendation accept quality
- Paid attach rate and contribution to NDR narrative (evidence, not claim)
- No regression on trust counters (dismiss, disables, ADA escalations)

**Kill:** No lift over rules baseline → stay on Phase 2–3; do not burn eng on showcase ML for the acquisition narrative alone.

---

## Cross-phase portfolio scorecard

Every phase must also be readable on:

| Portfolio lens | Leading indicators |
|---|---|
| **Retention** | Named-account risk-down; ops-failure proxies; “can’t rip out” depth |
| **Growth** | Essentials attach; Capacity Pro attach; system-of-record expansion (lagging) |
| **Efficiency** | CS ticket mix; support cost of the feature itself |
| **CEO stakeholder** | Credible AI-adjacent story **only when** tethered to phases that cleared gates—not Phase 0 theater |

---

## Sequencing summary

```
Phase 0  validate problem + commercials
    ↓ kill?
Phase 1  Finals Pack (exports/templates)     ← cheapest learning
    ↓ still need deeper?
Phase 2  Projection + explainable alerts     ← CEO-shaped, trust-first
    ↓ still need placement?
Phase 3  Allocation workspace                ← spreadsheet job
    ↓ baseline beaten + WTP?
Phase 4  ML optimization + Capacity Pro
```

**Default stance for the take-home prototype:** UI demonstrates **Phase 2–3** interaction (alert → why → confirm → board) while the **written plan** commits to Phase 0–1 gates first—so we show shipping instinct without pretending the CEO feature is auto-prioritized.

---

## What “moving in the right direction” means

We are on track if each phase **changes operator behavior** and **clears its metric gate** before we add surface area. We are off track if we accumulate UI/ML while Excel remains the system of record, alerts are ignored, or GM still cannot place the bet in keep/expand motions.
