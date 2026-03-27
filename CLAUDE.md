# PR Reporter Agents Plugin

> Takes a company brief, produces 10 tailored article briefs for specific Israeli journalists.

## How Workflows Execute

The `pr-router` skill is the entry point. When it loads, it:

1. Reads the company brief > loads client brand rules > detects story angles
2. Assigns angles to reporters based on beat, outlet, and style match
3. Runs reporter sub-agents in parallel (each produces a tailored article brief)
4. Finishes every brief through `agents/brand-guardian.md` (quality gate)

## Architecture

```
pr-router (ENTRY POINT)
  │
  ├── FULL_PIPELINE > all 10 reporters in parallel > brand-guardian
  ├── SINGLE_REPORTER > one specific reporter > brand-guardian
  ├── CUSTOM_SELECTION > selected reporters > brand-guardian
  └── BRIEF_ONLY > just analyze the brief, suggest angles (no writing)
```

## Workflow Chain (Three-Layer Quality)

```
Company Brief (input)
  ↓
pr-router (reads brief, loads brand rules, assigns angles)
  ↓
shared-instructions (anti-AI patterns, tone rules, banned words)
  ↓
┌──────────────────────────────────────────────┐
│ Reporter Agents (parallel)                    │
│ Each produces: brief + "why this works" note  │
│                                               │
│ gad-lior     │ reporter-2  │ reporter-3  ... │
│ (economy)    │ (tech)      │ (politics)      │
└──────────────┬───────────────────────────────┘
               ↓
┌──────────────────────────────────────────────┐
│ Layer 1: Reporter Guardian (per reporter)     │
│ "Would THIS journalist pick up this story?"   │
│ 10-point checklist specific to each reporter  │
│ Auto-rewrite if < 9/10                        │
└──────────────┬───────────────────────────────┘
               ↓
┌──────────────────────────────────────────────┐
│ Layer 2: Brand Guardian (per client)          │
│ Client tone of voice, banned words,           │
│ competitor names, key messages                │
└──────────────┬───────────────────────────────┘
               ↓
┌──────────────────────────────────────────────┐
│ Layer 3: Anti-AI (always on)                  │
│ Em dashes, AI vocabulary, rule-of-three,      │
│ contrast framing, synonym cycling             │
│ (from shared-instructions)                    │
└──────────────┬───────────────────────────────┘
               ↓
10 Article Briefs + Strategy Side Notes (output)
```

## Agents

| Agent | Model | Purpose |
|-------|-------|---------|
| `gad-lior-guardian` | Sonnet | Reporter guardian: does this brief match Gad Lior's instincts? |
| `brand-guardian` | Sonnet | Client guardian: tone, banned words, key messages |

## Skills

| Skill | Purpose |
|-------|---------|
| `pr-router` | Entry point. Reads brief, assigns reporters, orchestrates pipeline |
| `shared-instructions` | Voice rules, anti-AI patterns, banned words (loaded by all agents) |
| `gad-lior-hearot` | Reporter: Gad Lior, economy/budget, Yedioth Ahronoth |

## Reporters

| # | Skill | Name | Beat | Outlet | Status |
|---|-------|------|------|--------|--------|
| 1 | `gad-lior-hearot` | גד ליאור | Economy, Budget | Yedioth/ynet | Active |
| 2 | TBD | | | | Planned |
| 3 | TBD | | | | Planned |
| 4 | TBD | | | | Planned |
| 5 | TBD | | | | Planned |
| 6 | TBD | | | | Planned |
| 7 | TBD | | | | Planned |
| 8 | TBD | | | | Planned |
| 9 | TBD | | | | Planned |
| 10 | TBD | | | | Planned |

## Brands

Each client gets a folder in `brands/` with their specific:
- Company brief template
- Tone of voice rules
- Banned words / competitors to avoid
- Key messages and talking points

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
