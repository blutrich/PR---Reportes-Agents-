# PR Agent — Complete System Architecture

---

## System Philosophy

This system replaces a traditional PR agency for one specific use case:
**a startup launching a new feature, product, or service and wanting press coverage.**

The system produces one primary output: a journalist brief that is so well-researched,
so strategically grounded, and so editorially sharp that a journalist can go from
reading it to writing a story with minimal additional work.

Three principles govern every architectural decision:

1. **Separation of concerns** — each agent does one cognitive job and one job only.
   Extraction agents never infer. Inference agents never write. Writing agents never research.

2. **Research is parallel, writing is sequential** — the three research agents run
   simultaneously. Every writing step waits for the full research picture.

3. **Company data is permanent, product data is per-launch** — the company profile
   is built once and reused. The product layer is rebuilt fresh for every launch.

---

## The Universal Prompt Law

**This rule applies to every prompt in every agent in this system
without exception.**

Every prompt must be generic and scalable.
No prompt may contain hardcoded references to any specific company,
product, feature, service, or industry.

Any information that is specific to a client or launch must be
introduced exclusively through variables — never written into
the prompt itself.

A prompt that works only for one client is a bug, not a feature.
If you find yourself writing a company name, a product name, an industry
term, or any launch-specific detail into a prompt — stop.
That detail belongs in a variable that gets injected at runtime.

**Correct:**
> "Analyze the target audience described in {{company_target_audience}}
> and identify the structural friction they experience."

**Wrong:**
> "Analyze [Client]'s users — [specific audience] — and identify their structural friction."

This law applies at every level: system prompts, agent instructions,
field-level extraction rules, output format instructions, and examples.
Examples inside prompts must use placeholder language, never real client data.

---

## The Four-Layer Data Model

Everything in this system lives in one of four layers.

### Layer A — Company Profile (stable, built once per client)
Populated by the **Company Profiler Agent**.
Persisted to memory. Reused for every future launch.

```
company_name
company_mission
company_value_proposition
company_target_audience
company_industry
company_one_liner_mission
spokesperson.name
spokesperson.speaking_style
stories_for_conversion
product_preferred_terms
search_config.geo_focus
search_config.language_bias
search_config.primary_geo
writing_guidance.global_forbidden_words
writing_guidance.global_tone_rules
```

### Layer B — Product Launch Profile (per-launch, built fresh each time)
Populated by the **Launch Compactor Agent** + **product_input.md overrides**
+ **editorial_notes.md** + **merge step**.
**Saved to the client folder immediately after assembly.**
This is the client's control panel — they can open it, edit any field manually,
and re-run all downstream agents without repeating the extraction step.

#### Naming convention
All fields describing the product being launched are prefixed `launched_product_`.
Fields describing the previous version are grouped under `previous_product`.
This distinction is intentional: downstream agents and writing agents must always
know whether they are reading about what is being launched or what came before it.

```
product_id
  ← System identifier for this launch. Used in folder paths and filenames.
  ← Passed as a command argument to /new-launch — not read from any file.
  ← Not prefixed — it is a system field, not a product description.

launched_product_name
launched_product_one_liner
launched_product_core_problem
launched_product_target_audience
launched_product_value_proposition
launched_product_differentiation_claim

launched_product_functional_breakdown
  .functional_description
    ← How the product works from the user's perspective.
    ← A walkthrough of the flow: what happens at each step.
    ← Not a marketing summary. The operational logic.
  .user_benefit
    ← What the user concretely gets out of using it.
    ← The experienced outcome, not the mechanism.

launched_product_offering_structure
  .service_tracks[]
    .track_name
    .track_price
    .track_details
  .payment_flexibility

launched_product_hard_stats[]
  ← Every specific number, percentage, timeframe, or measurable claim
    present in the source material.
  ← Extracted as a flat array. Each entry is a self-contained stat.
  ← No rounding. No approximation. Exact as written.

launched_product_limitations[]
  ← Explicit statements in the source about what the product does NOT do,
    who it is NOT for, or what it explicitly excludes.
  ← Do not infer limitations. Only extract what is stated.

launch_timing_signals[]
  ← Any temporal hooks, urgency signals, or event references in the source.
  ← Examples: "ahead of tax season", "following the new regulation".
  ← Feeds the Context Strategist. Do not infer — only extract.

previous_product
  .functional_description
    ← Description of the previous version or existing solution this replaces.
    ← Null if not mentioned.
  .switch_reason
    ← The reason stated in the source for moving to the new solution.
    ← Null if not mentioned.

top_level_issue
  ← The canonical public macro-level structural issue that contextualizes
    why this product exists. Not a marketing category. The real-world
    structural pressure the audience faces. A journalist would name this
    issue independently of this product.
  ← Derived state (default): object with .value (string) and .derived: true
    Derived by the Launch Compactor from launched_product_core_problem
    and launched_product_target_audience.
    It is the only inference the Compactor is permitted to make.
  ← Overridden state: plain string, with sibling key top_level_issue_source: "client_defined"
    The derived object wrapper is removed entirely when overridden via product_input.md.

top_level_primary_subdomain
  ← The specific slice of top_level_issue most directly relevant to
    this product's audience and core problem.
  ← Derived state (default): object with .value (string) and .derived: true
  ← Overridden state: plain string, with sibling key top_level_primary_subdomain_source: "client_defined"
    The derived object wrapper is removed entirely when overridden via product_input.md.

gaps[]
  ← Lists field names that the schema structurally requires but are
    completely absent from the source text AND from product_input.md.
  ← gaps[] cannot detect strategically important information the client
    chose not to write down — that is the job of editorial_notes.md.
  ← top_level_issue and top_level_primary_subdomain are never in gaps[].

writing_guidance
  ← Assembled by the Orchestrator in Step 3 from three sources:
    1. company_profile.writing_guidance (Layer A) — global brand rules
    2. Launch Compactor output — writing constraints in the materials
    3. editorial_notes.md — client emphasis directives

  writing_guidance.framing_rules[]
  writing_guidance.forbidden_words[]
  writing_guidance.must_include[]
  writing_guidance.to_emphasize[]
    ← Primary destination for editorial_notes.md content
```

### Layer C — Research Output (built per-launch by research agents)
Populated by the three Research Agents + Wave Validator.
**Saved to the client folder. Mandatory — never skipped.**

```
relevant_news_waves[]
  .global_wave_id
  .wave_id
  .wave_title
  .narrative
  .core_tension
  .affected_groups
  .evidence_sources[]
  .evidence_details[].url
  .evidence_details[].key_points[]
  .confidence
  .limitations
  .classification.match_score
  .classification.match_type
  .classification.reasoning_trace.semantic_bridge
  .classification.reasoning_trace.credibility_check

waves_selection_accessible.selected_waves[]
  .evidence_context_for_llm
waves_selection_accessible.selected_global_wave_ids[]
```

### Layer D — User Stories (optional, supplied by client)
```
relevant_user_stories[]
  .name
  .anonymous
  .job_title
  .story
  .key_quote
```

---

## The Four Client Input Files

The client prepares up to four files before running `/new-launch`.
All four are created automatically as commented templates in the launch folder
on the first run if they don't exist. The client fills them in and runs again.

All four files are created directly in the launch folder:
`clients/{company_id}/launches/{product_id}/`
There is no client-level staging and no file moving.

---

### launch_input.md — Sources

**Location:** `clients/{company_id}/launches/{product_id}/launch_input.md`
**Purpose:** Tells the Orchestrator where to find the launch materials.
`product_id` is passed as a command argument — it does not appear in this file.

```markdown
## Pages
https://example.com/feature-page
https://example.com/blog/launch-post

## Google Doc
https://docs.google.com/document/d/abc123xyz

## Notes
Any raw text the client wants to include directly.
Everything under this heading is used as-is.
```

Rules:
- Lines starting with `#` are comments and are ignored
- Any section can be omitted if not needed
- Multiple URLs go one per line under ## Pages
- Only one Google Doc per launch
- ## Pages uses WebFetch (public pages only)
- ## Google Doc uses Google Drive MCP (authenticated)

---

### product_input.md — Authoritative field overrides

**Location:** `clients/{company_id}/launches/{product_id}/product_input.md`
**Purpose:** Client-defined values that overwrite extracted values.
These are authoritative — not suggestions.

```
launched_product_name: Maple
launched_product_differentiation_claim: The only tool that does X without requiring Y
launched_product_value_proposition: ...
```

Override rules:
1. The Compactor runs first on `raw_launch_text` alone — it never sees this file
2. After extraction, Orchestrator reads this file
3. Every field defined here overwrites the extracted value → marked `"source": "client_defined"`
4. Every field NOT defined here is left exactly as extracted — never touched by absence
5. Lines starting with `#` are comments and are ignored
6. Client-defined values are authoritative and are never questioned downstream

---

### editorial_notes.md — Emphasis directives

**Location:** `clients/{company_id}/launches/{product_id}/editorial_notes.md`
**Purpose:** Concepts and angles the client wants emphasized in the brief
that aren't explicitly stated in the launch materials.
Every active line must be a complete, standalone directive.

```markdown
Emphasize that this is the first product in the market to do X
The financial independence angle matters more than the savings angle
Do not frame this as a budgeting tool
```

Rules:
- Each active line must be a complete standalone directive — no headers, no labels, no fragments
- Lines starting with `#` are comments and are ignored
- All active lines are injected into `writing_guidance.to_emphasize`
- If the file doesn't exist — skip silently, no prompting

---

### user_stories.md — Customer testimonials (optional)

**Location:** `clients/{company_id}/launches/{product_id}/user_stories.md`
**Purpose:** Real customer testimonials to support the brief narrative.

```markdown
---
name: Customer Name
anonymous: false
job_title: Their role, if relevant
story: The full text of what they said or wrote.
key_quote: The single most impactful sentence from their story
```

Rules:
- Each story block starts with `---` on its own line
- `story` is the only required field — blocks without it are skipped
- Lines starting with `#` are comments and are ignored
- If the file doesn't exist — skip silently, no prompting

---

## First Run — Auto-Setup Behavior

When `/new-launch {company_id} {product_id}` is run and `launch_input.md` does not exist
in the launch folder, the Orchestrator creates all four template files
with commented-out examples, then stops and tells the client to fill
them in and run again.

This means the first run is always a setup run for new launches.
The second run is the real run.

No interactive questions are ever asked during the pipeline.
Everything the Orchestrator needs comes from these four files.

---

## Execution Flow

```
INPUT: /new-launch {company_id} {product_id}
│
├── STEP 0A — Setup check + file preparation ──────────────────────────
│   Check: clients/{company_id}/launches/{product_id}/launch_input.md exists?
│   NO  → Create all four template files in launch folder → stop → tell client to fill in
│   YES → parse launch_input.md sections
│          → fetch ## Pages (WebFetch) + ## Google Doc (MCP)
│          → collect ## Notes as-is
│          → concatenate → raw_launch_text
│          → save raw_launch_text.txt to launch folder
│
├── STEP 0B — Read editorial_notes.md ──────────────────────────────────
│   Read file if exists → skip comment lines → collect as client_strategic_additions[]
│   If file doesn't exist → skip silently
│
├── STEP 0C — Read user_stories.md ─────────────────────────────────────
│   Read file if exists → parse story blocks → collect as relevant_user_stories[]
│   If file doesn't exist or has no valid blocks → skip silently
│
├── STEP 1 — Company Profile check ────────────────────────────────────
│   Does clients/{company_id}/company_profile.json exist?
│   YES → load from memory, skip Company Profiler
│   NO  → run Company Profiler Agent → save to memory
│
├── STEP 2 — Run IN PARALLEL ──────────────────────────────────────────
│   ├── Launch Compactor Agent
│   │   Input:  raw_launch_text only
│   │   Output: product_profile_raw.json
│   │
│   └── Raw Gold Agent
│       Input:  raw_launch_text
│       Output: raw_gold.json
│
│   → product_input.md Override Step
│       Read file if exists → skip comment lines
│       For each defined field → overwrite in product_profile_raw.json
│                              → mark "source: client_defined"
│       For each undefined field → leave extracted value untouched
│
│   GATE: inspect gaps[] after overrides applied
│     If gaps[] contains any of:
│       [launched_product_name | launched_product_core_problem |
│        launched_product_value_proposition]
│     → STOP → tell client to add missing values to product_input.md → run again
│
├── STEP 3 — Merge writing_guidance ───────────────────────────────────
│   Source 1: company_profile.writing_guidance (Layer A)
│   Source 2: product_profile_raw.writing_guidance (Compactor)
│   Source 3: editorial_notes.md directives → writing_guidance.to_emphasize
│   Save complete product_profile.json to launch folder
│
├── STEP 4 — Assemble Full Context Object ─────────────────────────────
│   company_profile + product_profile + raw_gold
│
├── STEP 5 — Context Strategist Agent → context_strategy.json
│
├── STEP 6 — Run IN PARALLEL ──────────────────────────────────────────
│   ├── Researcher A (thesis A + queries from context_strategy.json)
│   ├── Researcher B (thesis B + queries from context_strategy.json)
│   └── Researcher C (thesis C + queries from context_strategy.json)
│
├── STEP 7 — Wave Validator Agent → validated_waves.json
├── STEP 8 — Brief Writer Agent → brief_final.md
│
OUTPUT: brief_final.md
```

---

## Agent Definitions

---

### AGENT 1 — Company Profiler

**File:** `.claude/agents/company-profiler.md`
**Runs:** Once per client. Output persisted to memory.
**Tools:** WebFetch, WebSearch
**Memory:** `clients/{company_id}/company_profile.json`

**Prompt law:** No company names, industry terms, or client-specific language.

**Job:** Scrape the company website and extract the stable strategic profile.
This is the brand bible — who the company is, why it exists, who it serves,
how it speaks, and who speaks for it. Also extracts global writing rules
that apply to all future launches.

**Input:** `{{company_website_url}}`, `{{company_id}}`
**Output:** `company_profile.json` matching Layer A schema.

---

### AGENT 2A — Launch Compactor

**File:** `.claude/agents/launch-compactor.md`
**Runs:** Once per launch, in parallel with Raw Gold Agent.
**Tools:** None (pure extraction, no web access)

**Prompt law:** No company names, product names, industry terms, or
launch-specific language. All specifics enter via `{{raw_launch_text}}`.

**Job:** Extract all factual product-level data from `{{raw_launch_text}}`
into clean structured JSON. Preservation, not compression.

**Derived fields (only inference permitted):**
After extracting `launched_product_core_problem` and
`launched_product_target_audience`, derives:
- `top_level_issue` — the macro structural pressure the audience faces
- `top_level_primary_subdomain` — the specific slice most relevant here
Both marked `"derived": true`. All other fields are extraction-only.

**Input:** `{{raw_launch_text}}`, `{{company_id}}`, `{{product_id}}`
**Output:** `product_profile_raw.json`

---

### AGENT 2B — Raw Gold

**File:** `.claude/agents/raw-gold.md`
**Runs:** Once per launch, in parallel with Launch Compactor.
**Tools:** None

**Prompt law:** No company names, product names, or launch-specific language.

**Job:** Find the 5 sentences in `{{raw_launch_text}}` a headline writer
would steal directly. Copy them verbatim. Do not write, analyze, or improve.

**Input:** `{{raw_launch_text}}`
**Output:** `raw_gold.json`

---

### AGENT 3 — Context Strategist

**File:** `.claude/agents/context-strategist.md`
**Runs:** After Full Context Object is assembled (Layer A + Layer B + raw_gold).
**Tools:** None

**Prompt law:** No company names, product names, industry terms, or
client-specific language. All specifics enter via variables at runtime.

**Job:** The core question this agent must answer is: **"What is happening in the
world right now that makes this product launch feel inevitable, timely, and
newsworthy?"**

Before producing any output, reason deeply about the external world context —
completely independently of the product itself. What structural forces, recent
events, regulatory shifts, cultural tensions, or economic realities created the
conditions this product addresses? These forces exist whether or not this product
exists. A journalist would be covering them regardless. The product's job is to
feel like the inevitable answer to forces already in motion.

This world-context reasoning is the first-class output of this agent. It is saved
explicitly and passed downstream — it is not a silent internal pre-step.

Only after grounding in that world context, produce in a single coherent pass:
1. **World context framing** — the structural forces, recent triggers, and core
   tension that make this launch newsworthy right now. This is the "why now"
   that the Brief Writer will use directly.
2. **Editorial strategy** — primary story angle, journalist archetypes, strongest
   narrative hook, framing risks to avoid. All rooted in the world context above.
3. **Research theses** — 3–5 specific, falsifiable claims about the world that,
   if substantiated with evidence, make this launch feel inevitable and timely.
   Each thesis must be rooted in the world context — not in the product's features.
4. **Search queries** — 3–5 specific searchable queries per thesis, assigned to
   researcher slots A, B, and C, ready for the research agents to execute.

Keeping all four jobs in one pass ensures the world-context reasoning stays
coherent across every downstream output.

**Wave standard:** A good wave is one that makes the launched product maximally
relevant — it sets the scene and answers the question "why launch this now?"
Every thesis generated here must clear this bar before it is assigned to a
researcher. If a thesis cannot be connected to the product's timeliness, it
is the wrong thesis.

**Input:** Full Context Object (Layer A + Layer B + raw_gold)
**Output:** `context_strategy.json`
```
world_context_framing
  .structural_forces[]
    ← Long-term pressures that created the conditions this product addresses.
    ← These exist independently of the product.
  .recent_triggers[]
    ← Specific recent events, data points, or shifts that made this urgent NOW.
    ← What changed in the last weeks or months — not the last decade.
  .core_tension
    ← One sentence. The sharpest "why now" a journalist would lead with.
    ← The contradiction or gap in the world that this launch lands into.

editorial_strategy
  .primary_angle
  .journalist_archetypes[]
  .narrative_hook
  .framing_risks[]

research_theses[]
  .thesis_id          ← "A", "B", or "C" — assigned researcher slot
  .claim              ← The specific falsifiable world-level claim
  .connection_to_launch ← Why proving this claim makes the launch feel inevitable
  .search_queries[]   ← 3–5 queries for the assigned researcher to execute
```

---

### AGENTS 4A / 4B / 4C — Research Agents (Parallel)

**Files:**
- `.claude/agents/researcher-a.md`
- `.claude/agents/researcher-b.md`
- `.claude/agents/researcher-c.md`

**Runs:** All three in parallel after Context Strategist.
**Tools:** WebSearch, WebFetch

**Job:** Each agent receives one assigned thesis from `context_strategy.json`
(assigned by slot: A, B, or C) along with its pre-generated search queries.
The agent does not decide what to look for — that was determined by the Context
Strategist. The agent's only job is to execute the assigned queries, find the
strongest real-world evidence that substantiates the thesis, and return a
`wave_candidate`.

The Context Strategist is the strategist. The research agents are the field
reporters sent to prove specific claims.

**Wave standard:** A good wave is one that makes the launched product maximally
relevant — it sets the scene and answers the question "why launch this now?"
When evaluating evidence, prioritize sources that make the product feel like
the inevitable response to forces already in motion. Evidence that is merely
interesting but does not sharpen the product's timeliness is weak evidence.

---

### AGENT 5 — Wave Validator

**File:** `.claude/agents/wave-validator.md`
**Runs:** After all three research agents complete.
**Tools:** None

**Job:** Score and filter all wave candidates. Remove weak or unsubstantiated
waves. Classify remaining as Lead, Supporting, or Broadening.

**Wave standard:** A good wave is one that makes the launched product maximally
relevant — it sets the scene and answers the question "why launch this now?"
This is the primary scoring criterion. A wave with strong evidence that does
not sharpen the product's timeliness must be scored lower than a wave with
moderate evidence that directly answers "why now." Waves that fail this test
are cut regardless of how interesting or well-sourced they are.

**Input:** All `wave_candidates[]` + Full Context Object
**Output:** `validated_waves.json` (Layer C)

---

### AGENT 6 — Brief Writer

**File:** `.claude/agents/brief-writer.md`
**Runs:** Last.
**Tools:** None

**Prompt law:** No company names, product names, industry terms, or
client-specific language. Every detail enters via variables at runtime.

**Job:** Produce the final journalist brief. Every claim backed by a wave.
Every key quote from `{{raw_gold}}` — verbatim, never rewritten.
`{{writing_guidance}}` is a hard constraint on every sentence.

**Output:** `brief_final.md`
1. Subject line
2. The problem — the world before (backed by waves)
3. Why now — the zeitgeist moment (backed by waves)
4. The announcement — what is launching
5. Why it matters — the so-what for the journalist's reader
6. The spokesperson quote — from raw_gold, in the right voice
7. Journalist angles — 3 story framings (tech / consumer / business)
8. Key facts — numbers, differentiation, offer
9. What we can offer — demo, interview, exclusive access

---

## File Structure

```
project-root/
│
├── CLAUDE.md
│
├── .claude/
│   ├── agents/
│   │   ├── company-profiler.md
│   │   ├── launch-compactor.md
│   │   ├── raw-gold.md
│   │   ├── context-strategist.md
│   │   ├── researcher-a.md
│   │   ├── researcher-b.md
│   │   ├── researcher-c.md
│   │   ├── wave-validator.md
│   │   └── brief-writer.md
│   │
│   └── commands/
│       ├── new-client.md
│       └── new-launch.md
│
├── clients/
│   └── {company_id}/
│       ├── company_profile.json               ← Layer A, persisted
│       └── launches/
│           └── {product_id}/
│               ├── launch_input.md            ← created on first run
│               ├── product_input.md           ← created on first run
│               ├── editorial_notes.md         ← created on first run
│               ├── user_stories.md            ← created on first run
│               ├── raw_launch_text.txt
│               ├── raw_gold.json
│               ├── product_profile_raw.json
│               ├── product_profile.json       ← Layer B, final, editable
│               ├── context_strategy.json
│               ├── wave_candidates_raw.json
│               ├── validated_waves.json       ← Layer C
│               └── brief_final.md             ← final deliverable
│
└── schemas/
    ├── company_profile.schema.json
    ├── product_profile.schema.json
    └── wave.schema.json
```

---

## Two Entry Commands

### `/new-client`
Triggers Company Profiler only.
Input: company website URL + company_id.
Output: `company_profile.json` saved to memory.

### `/new-launch {company_id} {product_id}`
Triggers the full launch flow.
Reads input files from `clients/{company_id}/launches/{product_id}/`.
First run creates four template files in the launch folder and stops.
Second run executes the full pipeline.
Output: `brief_final.md` + all intermediates saved.

---

## Re-run Logic

- **product_profile.json exists** → "Use saved profile or re-extract?"
- **validated_waves.json under 60 days** → "Reuse, refresh stale only, or rebuild?"
- **brief_final.md exists** → always overwrites without asking
- **All four input files** → always re-read on every run
- **product_input.md values** → always win over extracted values

---

## What This System Does Not Do (Yet)

- Press release writer
- Journalist matcher
- Pitch email writer
- Follow-up tracker

The brief is the foundation. Everything else builds on it.
