# PR Reporter Agents Plugin

> Takes a company brief, produces tailored article briefs for specific Israeli journalists.

## How Workflows Execute

The `pr-router` skill is the entry point. When it loads, it:

1. Reads the company brief > loads client brand rules > analyzes the story
2. Maps story to reporter beats > checks fit > assigns angles per reporter
3. Runs reporter sub-agents in parallel (each produces a tailored article brief)
4. Each brief goes through a **3-layer quality chain** before delivery

## Architecture

```
pr-router (ENTRY POINT)
  │
  ├── FULL_PIPELINE > all active reporters in parallel > quality chain
  ├── SINGLE_REPORTER > one specific reporter > quality chain
  ├── CUSTOM_SELECTION > selected reporters > quality chain
  └── ANALYZE_ONLY > analyze brief, suggest reporters and angles (no writing)
```

## Quality Chain (Three Layers)

Every brief passes through three quality layers in sequence. A brief that fails at any layer gets rewritten (max 2 attempts) or flagged.

```
Company Brief (input)
  ↓
pr-router (reads brief, loads brand rules, maps to reporters, assigns angles)
  ↓
┌──────────────────────────────────────────────┐
│ Reporter Sub-Agents (parallel)               │
│ Each reads: shared-instructions + reporter   │
│ skill + client brand rules                   │
│                                              │
│ Output: brief + "why this works" side note   │
│                                              │
│ gad-lior     │ reporter-2  │ reporter-3 ... │
│ (economy)    │ (tech)      │ (politics)     │
└──────────────┬───────────────────────────────┘
               ↓
┌──────────────────────────────────────────────┐
│ Layer 1: Reporter Guardian (per reporter)    │
│ "Would THIS journalist pick up this story?"  │
│ 10-point checklist specific to each reporter │
│ Auto-rewrite if < 9/10. Flag if < 7/10.     │
│ File: agents/{reporter}-guardian.md          │
└──────────────┬───────────────────────────────┘
               ↓
┌──────────────────────────────────────────────┐
│ Layer 2: Brand Guardian (per client)         │
│ Client tone of voice, banned words,          │
│ competitor names, key messages               │
│ File: agents/brand-guardian.md               │
│ Skipped if no client brand selected          │
└──────────────┬───────────────────────────────┘
               ↓
┌──────────────────────────────────────────────┐
│ Anti-AI (embedded in all layers)             │
│ Loaded via shared-instructions skill         │
│ Em dashes, AI vocabulary, rule-of-three,     │
│ contrast framing, synonym cycling            │
│ Not a separate layer — baked into every step │
└──────────────┬───────────────────────────────┘
               ↓
Approved Article Briefs + Strategy Side Notes (output)
```

## Output Convention

All output goes to `output/{client}/{reporter-name}-*.md`:
- `{reporter}-brief.md` — initial brief from reporter agent
- `{reporter}-brief-final.md` — after reporter guardian approval
- `{reporter}-guardian-review.md` — reporter guardian scorecard
- `{reporter}-brand-review.md` — brand guardian scorecard

## Agents

| Agent | Model | Purpose |
|-------|-------|---------|
| `gad-lior-guardian` | Sonnet | Reporter guardian: does this brief match Gad Lior's instincts? |
| `brand-guardian` | Sonnet | Client guardian: tone, banned words, key messages |

## Skills

| Skill | Purpose |
|-------|---------|
| `pr-router` | Entry point. Reads brief, assigns reporters, orchestrates pipeline |
| `shared-instructions` | Anti-AI patterns, voice rules, banned words (loaded by all agents) |
| `gad-lior-hearot` | Reporter: Gad Lior, economy/budget, Yedioth Ahronoth |

## Reporters

| # | Skill | Guardian | Name | Beat | Outlet | Status |
|---|-------|----------|------|------|--------|--------|
| 1 | `gad-lior-hearot` | `gad-lior-guardian` | Gad Lior | Economy, Budget | Yedioth/ynet | Active |
| 2 | TBD | TBD | | Tech, Startups | | Planned |
| 3 | TBD | TBD | | Politics, Policy | | Planned |
| 4 | TBD | TBD | | Social, Labor | | Planned |
| 5 | TBD | TBD | | Legal, Regulation | | Planned |
| 6 | TBD | TBD | | Security, Defense | | Planned |
| 7 | TBD | TBD | | Consumer, Lifestyle | | Planned |
| 8 | TBD | TBD | | Investigative | | Planned |
| 9 | TBD | TBD | | Local, Municipal | | Planned |
| 10 | TBD | TBD | | International | | Planned |

## Brands

Each client gets a folder in `brands/` with their specific:
- `RULES.md` — Company info, key messages, spokespeople, competitors
- `banned-words.md` — Client-specific words to avoid
- `tone-of-voice.md` — Voice character, we-say/don't-say

Active brands: `rise-up`

## Architecture Principle: Reporter-Centric, Not Company-Centric

The core IP of this system is **deep reporter intelligence**. The reporters, their guardians, and the anti-AI rules are constant and deeply researched. They are the product.

Client/company configuration is an **input layer** — filled during onboarding and pluggable:
- Company brief, key messages, spokespeople
- CEO tone of voice, banned words, competitors
- These change per client. The reporter intelligence doesn't.

The system should work with ANY company brief and produce journalist-specific output. The quality comes from understanding the reporter, not the company.

## Future: Smart Reporter Matching

The router currently uses a manual beat-to-reporter map. The goal is for it to understand each reporter's **mental model** — not just their beat, but how they think about stories — and automatically match briefs to the reporters whose worldview makes the story most compelling. A fintech story isn't just "economy beat" — for Gad Lior it's "banks vs citizens", for a consumer reporter it's "your money", for a tech reporter it's "product". The router should reason about which mental model best serves the story, based on the nature of the item and the reporter's analytical framework.

## Usage

```
Write article briefs for all reporters about [company brief]
```
```
Write a Gad Lior style brief about our Series A
```
```
Analyze this brief and suggest which reporters fit best
```
