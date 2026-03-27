# PR Reporter Agents - Multi-Agent PR Pipeline

A Claude Code plugin that transforms a company brief into 10 tailored article briefs, each written for a specific Israeli journalist's voice, beat, and outlet.

Built as a multi-agent system: a PR Router orchestrates 10 Reporter sub-agents, with a Brand Guardian enforcing anti-AI patterns and client tone of voice.

## The Problem

PR agencies write generic press releases and blast them to every journalist on their list. Journalists ignore 95% of these because they're:
- Not relevant to their beat
- Written in corporate-speak, not their language
- Obviously AI-generated
- Missing the data or angle they care about

## The Solution

This system studies how each journalist actually thinks and writes, then produces a brief that speaks their language. Not a generic press release. A tailored pitch that makes the reporter want to write the story.

## How It Works

```
┌─────────────────────────────────────┐
│         Company Brief               │
│  (product launch, funding round,    │
│   partnership, milestone, etc.)     │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│          PR Router                  │
│  - Reads and analyzes the brief     │
│  - Extracts data points, quotes     │
│  - Identifies news hooks            │
│  - Maps story to reporter beats     │
│  - Assigns unique angle per reporter│
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│       Brand Guardian                │
│  - Loads client brand rules         │
│  - Enforces anti-AI patterns        │
│  - Banned words check               │
│  - Tone of voice alignment          │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│     10 Reporter Agents (parallel)   │
│                                     │
│  Each reporter agent:               │
│  1. Reads the journalist's profile  │
│  2. Understands their beat & outlet │
│  3. Researches current context      │
│  4. Writes a brief in THEIR voice   │
│  5. Includes angle THEY would care  │
│     about                           │
│                                     │
│  ┌────────┐ ┌────────┐ ┌────────┐  │
│  │Gad Lior│ │Rep. #2 │ │Rep. #3 │  │
│  │Economy │ │Tech    │ │Politics│  │
│  │Yedioth │ │Calcalis│ │Haaretz │  │
│  └────────┘ └────────┘ └────────┘  │
│  ┌────────┐ ┌────────┐ ┌────────┐  │
│  │Rep. #4 │ │Rep. #5 │ │Rep. #6 │  │
│  └────────┘ └────────┘ └────────┘  │
│  ┌────────┐ ┌────────┐ ┌────────┐  │
│  │Rep. #7 │ │Rep. #8 │ │Rep. #9 │  │
│  └────────┘ └────────┘ └────────┘  │
│  ┌────────┐                         │
│  │Rep. #10│                         │
│  └────────┘                         │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│    Brand Guardian Review            │
│  - Scores each brief (10-point)     │
│  - Auto-rewrites if score < 9       │
│  - Instant reject on AI patterns    │
│  - Delivers approved briefs         │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│   10 Tailored Article Briefs        │
│   Ready to pitch to journalists     │
└─────────────────────────────────────┘
```

## What Makes Each Reporter Agent Special

Each reporter agent is built from deep analysis of the journalist's actual work. Not generic "write in their style" instructions, but a detailed profile based on reading 8-10 of their real columns:

| Component | What It Captures | Example (Gad Lior) |
|-----------|-----------------|---------------------|
| **Signature format** | Their recurring column structure | "3 הערות על..." (3 remarks on...) |
| **Opening pattern** | How they start articles | Sets up official narrative, then dismantles it |
| **Thinking framework** | How they analyze a story | Promise vs Reality, Lobbyist Test, Numbers as Weapons |
| **Voice rules** | What makes them sound like THEM | "אנחנו" not "הם", direct quotes, short sentences |
| **Data usage** | How they use numbers | Specific (42 מיליארד, not "billions"). Numbers ARE the argument |
| **Closing style** | How they end | Sharp moral conclusion, never passive |
| **What they'd never do** | Red lines for authenticity | No balanced "on the other hand" pieces |

## Reporters

| # | Name | Beat | Outlet | Signature | Status |
|---|------|------|--------|-----------|--------|
| 1 | גד ליאור (Gad Lior) | Economy, Budget, Policy | Yedioth Ahronoth / ynet | "X הערות על Y" | **Active** |
| 2 | TBD | | | | Planned |
| 3 | TBD | | | | Planned |
| 4 | TBD | | | | Planned |
| 5 | TBD | | | | Planned |
| 6 | TBD | | | | Planned |
| 7 | TBD | | | | Planned |
| 8 | TBD | | | | Planned |
| 9 | TBD | | | | Planned |
| 10 | TBD | | | | Planned |

### Reporter Coverage Goals

To maximize PR reach, reporters should cover different:

- **Beats:** Economy, Tech, Politics, Social/Labor, Legal, Security, Consumer, Lifestyle, Local, International
- **Outlets:** Yedioth, Haaretz, Globes, Calcalist, Channel 12, Channel 13, Kan, TheMarker, Walla, Israel Hayom
- **Styles:** Data-driven, Investigative, Commentary, News, Feature, Opinion

## Brand Guardian

The Brand Guardian is the quality gate. It runs a 10-point checklist on every brief:

### Anti-AI Detection (3 checks)
1. No AI vocabulary (leverage, utilize, groundbreaking, seamless, etc.)
2. No AI structure patterns (rule-of-three, contrast framing, em dashes, etc.)
3. Natural sentence rhythm (varied length, no advertising melody)

### Reporter Authenticity (3 checks)
4. Voice matches the specific reporter (not generic journalism)
5. Correct column format (e.g., "הערות" for Gad Lior)
6. Real data (specific numbers, not vague claims)

### Client Alignment (2 checks)
7. Key messages present naturally
8. No competitor names in briefs

### Quality (2 checks)
9. Newsworthy angle (not just a product description)
10. Appropriate length (300-500 words)

**Instant Rejects:** Em dashes, 3+ AI vocabulary words, fabricated data, wrong reporter voice.

## Client Brands

Each client gets a folder in `brands/` with their specific rules:

```
brands/
  rise-up/          # First client
    RULES.md         # Company info, key messages, spokespeople
    banned-words.md  # Words to avoid, competitor names
    tone-of-voice.md # Voice character, we-say/don't-say
  _template/         # Copy this for new clients
```

## Project Structure

```
PR---Reportes-Agents-/
│
├── .claude-plugin/
│   └── plugin.json              # Plugin metadata
│
├── CLAUDE.md                    # Plugin architecture and workflow chains
│
├── agents/
│   └── brand-guardian.md        # Quality gate agent
│
├── skills/
│   ├── pr-router/
│   │   └── SKILL.md             # Orchestrator - entry point
│   ├── shared-instructions/
│   │   └── SKILL.md             # Anti-AI patterns, voice rules (loaded by all)
│   └── gad-lior-hearot/
│       └── SKILL.md             # Reporter #1: Gad Lior
│
├── reporters/
│   ├── _template/
│   │   └── profile.md           # Research template for new reporters
│   └── gad-lior/
│       ├── profile.md           # Deep analysis of Gad Lior's writing
│       └── research/            # Source articles analyzed
│
├── brands/
│   └── _template/
│       ├── RULES.md             # Client rules template
│       ├── banned-words.md      # Client-specific banned words
│       └── tone-of-voice.md     # Client voice guide
│
├── docs/
│
├── ADDING_A_REPORTER.md         # Step-by-step guide for new reporters
│
└── README.md                    # This file
```

## Usage

### Full Pipeline
```
Write article briefs for all reporters about [paste company brief]
```

### Single Reporter
```
Write a Gad Lior style brief about [topic]
```

### Analyze Only
```
Analyze this brief and suggest which reporters would cover it
```

### Adding a New Reporter

See [ADDING_A_REPORTER.md](ADDING_A_REPORTER.md) for the full process. Summary:

1. **Research** (1-2 hours): Read 8-10 of their columns, identify patterns
2. **Profile**: Fill in `reporters/_template/profile.md`
3. **Skill**: Generate a SKILL.md from the profile
4. **Test**: Run 3 test prompts, compare with/without skill
5. **Register**: Add to the router's reporter registry

## How Reporter Agents Are Built

The process for building each reporter agent:

```
1. RESEARCH
   Read 8-10 real columns by the journalist
   Identify: format, opening patterns, argument structure,
   data usage, voice markers, closing style

2. PROFILE
   Document findings in reporters/{name}/profile.md
   Include: source articles, key quotes, patterns found

3. SKILL
   Convert profile into a SKILL.md with:
   - Structural template (how to organize the piece)
   - Voice rules (what makes them sound like THEM)
   - Thinking patterns (how they analyze a story)
   - Anti-patterns (what they'd never do)

4. TEST
   Run with-skill vs without-skill comparisons
   Check: Does it sound like this reporter?
   Check: Would an editor at their outlet publish this?

5. ITERATE
   Read the outputs, compare to real columns
   Tighten rules, add examples, fix voice drift
```

## Technical Details

- **Plugin format:** Claude Code plugin (`.claude-plugin/plugin.json`)
- **Agent orchestration:** PR Router spawns reporter sub-agents in parallel
- **Quality gate:** Brand Guardian agent runs on every output
- **Shared rules:** Anti-AI patterns loaded via shared-instructions skill
- **Client isolation:** Each client's brand rules are in a separate folder

## Based On

Architecture inspired by the [Base44 Marketing Agent](https://github.com/blutrich/base44-marketing-agent) plugin pattern: router, specialist agents, brand guardian, shared instructions.
