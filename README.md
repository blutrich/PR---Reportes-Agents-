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
company_name_local
  ← The company name in the local language (e.g. Hebrew transliteration).
  ← Needed because the Research Agents must recognize the company in
    local-language sources to filter out its own claims and marketing.
    A company named "RiseUp" may appear as "רייזאפ" in Hebrew press —
    without this field, the researcher would miss those mentions and
    risk including the company's own narrative as independent evidence.
  ← Populated by the Company Profiler from the company website.
  ← Null if the company operates in a single language.
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

### user_stories_input.md — Customer testimonials, raw (optional)

**Location:** `clients/{company_id}/launches/{product_id}/user_stories_input.md`
**Purpose:** Raw, unstructured customer testimonials in any format — WhatsApp
messages, emails, survey responses, copied notes. The client pastes everything
here without worrying about formatting.

**Processed by:** The **User Story Parser Agent** (Step 0C) reads this file,
identifies story boundaries, extracts structured fields, and outputs
`user_stories.json`. The client never needs to structure stories manually.

Rules:
- Any format is accepted — the parser handles it
- Lines starting with `#` are comments and are ignored
- If the file doesn't exist or is empty — skip silently, no prompting
- User stories are optional — the pipeline runs without them

**Structured output:** `user_stories.json`

```json
{
  "stories_count": 1,
  "stories": [
    {
      "name": "Customer name or Anonymous",
      "anonymous": false,
      "job_title": "Only if explicitly mentioned, null otherwise",
      "story": "Full testimonial text, preserved in original language",
      "key_quote": "The single most impactful sentence — a turning point",
      "has_hard_numbers": false,
      "impact_value": null
    }
  ]
}
```

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
├── STEP 0C — Structure and read user stories ─────────────────────────
│   If user_stories_input.md has content → run User Story Parser
│   → save user_stories.json
│   Read user_stories.json → collect as relevant_user_stories[]
│   If no stories found → skip silently, pipeline continues
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
├── STEP 4 — Assemble Context Strategist Input ────────────────────────
│   Extract filtered slices from company_profile.json, product_profile.json,
│   and raw_gold.json. Only fields relevant to world-context reasoning —
│   see Agent 3 definition for the full field list and exclusion rationale.
│
├── STEP 5 — Context Strategist Agent → context_strategy.json ────────
│   Input: filtered slices (not full files) + raw_gold
│   Agent reasons about world forces → editorial strategy → 3 theses
│   Output: context_strategy.json
│
│   GATE: Orchestrator validates context_strategy.json before proceeding:
│     - Exactly 3 research theses present
│     - Each thesis assigned to a unique slot (A, B, C)
│     - Each thesis has at least 3 search queries
│     - world_context_framing.core_tension is non-empty
│   If validation fails → retry the agent once.
│   If second attempt fails → stop and report to client.
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

### AGENT 2C — User Story Parser

**File:** `.claude/agents/user-story-parser.md`
**Runs:** In Step 0C, only if `user_stories_input.md` has content.
**Tools:** None (pure text parsing)

**Job:** Parse raw, unstructured customer testimonials into clean structured
JSON. Identifies story boundaries, extracts name, anonymity flag, job title,
full story text, key quote, and hard-number indicators. Preserves the
customer's original words — never rewrites, summarizes, or edits.

The key_quote selection prioritizes transformation and turning points over
generic praise. Stories with hard numbers (`has_hard_numbers: true`) are
flagged for downstream prioritization, but stories without numbers are
equally valid.

**Input:** `{{raw_stories_text}}` from `user_stories_input.md`
**Output:** `user_stories.json`

---

### AGENT 3 — Context Strategist

**File:** `.claude/agents/context-strategist.md`
**Runs:** After Full Context Object is assembled (Layer A + Layer B + raw_gold).
**Tools:** None — this agent is pure reasoning. It has no web access.

**Why no web access:** This was a deliberate architectural decision. The Context
Strategist's job is to *think* — to look at what the product solves and who it
serves, and reason about what forces in the world would make this launch feel
inevitable. Web searching is a different cognitive job that belongs to the
Research Agents (Step 6). Giving this agent search access would tempt it to go
shallow and wide instead of thinking deeply, and would duplicate the Researchers'
role. In this system, search happens in exactly one place: the Research Agents.

**Prompt law:** No company names, product names, industry terms, or
client-specific language. All specifics enter via variables at runtime.

**Input format:** The agent receives a deliberately filtered subset of the
available data — not the full files. This is an intentional design choice.

The Context Strategist's job is to reason about the *world*, not about the
product's pricing, writing rules, or spokesperson. Passing the full files
would flood the agent with details that pull its attention toward the product
instead of toward the world forces that make the product relevant. Every field
in the input was chosen because it helps the agent answer one question:
"What is happening in the world that makes this product inevitable?"

**From `product_profile.json` — the launch compass:**
```
{{launched_product_core_problem}}        ← What pain does this solve? This is the primary compass.
{{launched_product_target_audience}}     ← Who feels this pain? Defines which world forces matter.
{{top_level_issue}}                      ← The macro structural issue (e.g. cost of living).
{{top_level_primary_subdomain}}          ← The specific slice most relevant here.
{{launched_product_value_proposition}}   ← What changes for the user — helps gauge the gap in the world.
{{launched_product_differentiation_claim}} ← What's structurally new — signals what didn't exist before.
{{previous_product.switch_reason}}       ← Why the old approach failed — points to a shift in conditions.
```

**From `company_profile.json` — the company compass:**
```
{{company_mission}}                      ← Why this company exists — grounds the "why them" question.
{{company_target_audience}}              ← Who the company serves broadly — may be wider than the launch audience.
{{company_industry}}                     ← The sector — helps the agent reason about the right world domain.
{{search_config.geo_focus}}              ← Where in the world this matters (e.g. "Local (Israel)").
{{search_config.primary_geo}}            ← The specific geography (e.g. "IL").
```

**From `raw_gold.json`:**
```
{{raw_gold}}                             ← The verbatim high-impact sentences from the source material.
```

**What is deliberately excluded and why:**
- `offering_structure`, `hard_stats`, pricing → product details that would
  pull the agent toward describing the product instead of the world.
- `writing_guidance`, `forbidden_words`, `tone_rules` → constraints for the
  Brief Writer. Irrelevant to world-context reasoning and would add noise.
- `functional_breakdown` → how the product works step by step. The strategist
  needs to know *what problem it solves*, not *how it works*.
- `spokesperson`, `speaking_style` → relevant to the brief, not to the world.
- `stories_for_conversion`, `product_preferred_terms` → marketing assets
  for downstream agents.
- `gaps[]`, `limitations[]` → orchestrator and brief-writer concerns.
- `launched_product_name`, `launched_product_one_liner` → the agent should
  reason about the problem space, not the product's branding.

**Job:** The core question this agent must answer is: **"What is happening in the
world right now that makes this product launch feel inevitable, timely, and
newsworthy?"**

This is a reasoning job, not an information-retrieval job. The agent does not
start by producing outputs. It starts by *thinking*.

**How the reasoning works:**

This is one continuous chain of thought — not separate steps delegated to
different agents. The agent begins by asking itself: "Given what this product
solves and who it is for — what structural pressures, trends, or events in
the world created the conditions this product addresses?" That question is
the compass that guides everything else the agent produces.

Consider the difference:
- A product that helps gig workers save money → the agent should reason about
  the growth of gig work, the savings gap in variable-income populations,
  and the failure of traditional financial products to serve non-salaried workers.
- An AI assistant for financial literacy → the agent should reason about the
  cost of living crisis, rising financial illiteracy rates, and the growing
  complexity of personal cash flow management.

The product's core problem and target audience point the agent toward the right
world forces. From there, the editorial angle emerges naturally — it is the most
compelling frame for those forces. And the research theses operationalize that
angle — they are the specific claims that, if proven with evidence, make the
launch feel inevitable. This is why these are all one agent: the world context
reasoning, the editorial strategy, and the research plan are not three separate
cognitive jobs. They are one thought that builds on itself. Splitting them into
separate agents would force artificial handoffs between reasoning that should
stay connected.

The world-context reasoning is a **first-class output** of this agent. It is
saved explicitly in `context_strategy.json` and passed downstream to the Brief
Writer. It is not a silent internal pre-step — it is the foundation everything
else rests on.

In a single coherent pass, the agent produces:
1. **World context framing** — the structural forces, recent triggers, and core
   tension that make this launch newsworthy right now. This is the "why now"
   that the Brief Writer will use directly.
2. **Editorial strategy** — primary story angle, journalist archetypes, strongest
   narrative hook, framing risks to avoid. All rooted in the world context above.
3. **Research theses** — exactly 3 specific, falsifiable claims about the world,
   one per research lens (see below). Each thesis must be rooted in the world
   context — not in the product's features.
4. **Search queries** — 3–5 specific searchable queries per thesis, assigned to
   researcher slots A, B, and C, ready for the research agents to execute.

Keeping all four outputs in one pass ensures the world-context reasoning stays
coherent across every downstream output. The editorial angle emerges from the
world context, and the theses operationalize the angle — they are phases of the
same thought, not separate tasks.

**The Three Research Lenses:**

A journalist doesn't build a story from three pieces of the same kind of
evidence. A complete story needs three structurally different layers that
together form an arc:

- **Lens A — Human Pain:** Who is suffering, and how? The emotional entry point.
  Provable with hardship data, surveys, quality-of-life measures.
- **Lens B — Broken Status Quo:** Why aren't existing solutions working? The
  structural gap. Provable with failure rates, attrition data, expert criticism.
- **Lens C — Emerging Trend:** What is changing right now that makes a new
  approach possible? The "why now." Provable with adoption data, cross-industry
  parallels, recent shifts.

Together: people are hurting (A) → the current system is failing them (B) →
conditions just changed to make a new approach inevitable (C). That is a
complete journalistic case.

Without these lenses, the agent risks producing three theses that all prove the
same kind of thing — three variations of "the problem is bad" — which is
repetition, not a story. The lenses force diversity of evidence, making the
final brief structurally stronger.

The lenses are a structural constraint, not a rigid template. The specific claim
within each lens is the agent's creative judgment.

**Why exactly 3 theses:** Each thesis maps to exactly one researcher agent and
one lens. One thesis per slot, no ambiguity about routing.

**Wave standard:** A good wave is one that makes the launched product maximally
relevant — it sets the scene and answers the question "why launch this now?"
Every thesis generated here must clear this bar before it is assigned to a
researcher. If a thesis cannot be connected to the product's timeliness, it
is the wrong thesis.

**Output:** `context_strategy.json`
**Saved to:** `clients/{company_id}/launches/{product_id}/context_strategy.json`
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
  .lens               ← "human_pain" (A), "broken_status_quo" (B), or "emerging_trend" (C)
  .claim              ← The specific falsifiable world-level claim
  .connection_to_launch ← Why proving this claim makes the launch feel inevitable
  .search_queries[]   ← 3–5 queries for the assigned researcher to execute
```

---

### AGENTS 4A / 4B / 4C — Research Agents (Parallel)

**File:** `.claude/agents/researcher.md` (one prompt, called three times)
Each call receives a different thesis and lens from `context_strategy.json`.

**Runs:** All three in parallel after Context Strategist.
**Tools:** WebSearch, WebFetch

**Why one file, not three:** The cognitive job is identical — search the web,
read articles, extract evidence, synthesize a wave narrative. The only difference
is what they're looking for, which is determined by the thesis and lens they
receive as input. Maintaining three identical files would create sync problems
when the prompt is improved.

**Research lenses (passed as `{{lens}}` variable):**

The lens does not change the researcher's mechanics — it still searches, reads,
and extracts the same way. The lens changes what the researcher considers
strong evidence.

- **Researcher A — Lens: `human_pain` — Who is suffering, and how?**
  Prioritizes: surveys and polls showing hardship, statistics on personal or
  household impact, quality-of-life indicators, cost-of-living data, stress
  or wellbeing measures, demographic breakdowns showing who is most affected.
  Strong evidence: a government report showing that X% of a specific population
  reports Y hardship. Weak evidence: an opinion piece saying "things are tough."

- **Researcher B — Lens: `broken_status_quo` — Why aren't existing solutions working?**
  Prioritizes: user attrition or churn rates for existing solutions, expert
  criticism of current approaches, studies showing that a common method fails
  to achieve its stated goal, industry reports on stagnation or failure, data
  showing that despite available tools the problem persists or worsens.
  Strong evidence: a study showing that users of a common approach still
  experience the problem at the same rate. Weak evidence: a blog post
  complaining about a competitor.

- **Researcher C — Lens: `emerging_trend` — What is changing right now?**
  Prioritizes: adoption data for new approaches, cross-industry parallels where
  a similar shift already happened, regulatory changes enabling new models,
  technology breakthroughs making something newly feasible, expert predictions
  from credible sources, investment or funding data signaling market direction.
  Strong evidence: a report showing that hybrid human+technology models in a
  parallel industry improved outcomes by X%. Weak evidence: a startup press
  release claiming to be "revolutionary."

**Job:** Each agent receives one assigned thesis from `context_strategy.json`
(assigned by slot: A, B, or C) along with its pre-generated search queries and
its research lens. The agent does not decide what to look for — that was
determined by the Context Strategist. The agent's job is to:
1. Execute the assigned queries via WebSearch
2. Read the top 3 results per query (WebFetch) — not just snippets
3. Extract hard evidence: specific numbers, dates, sources, quotes
4. Synthesize a cohesive **wave narrative** — what does all this evidence mean
   together, told as a journalist would use it
5. Return a `wave_candidate` with evidence details and citations

The researcher also receives minimal product context — just enough to judge
whether found evidence is relevant to the launch:
- `{{launched_product_core_problem}}`
- `{{launched_product_target_audience}}`
- `{{top_level_issue}}`
- `{{launched_product_differentiation_claim}}` — what is structurally new.
  Especially important for Lens C (Emerging Trend): the researcher needs to
  know what the new approach is in order to judge whether a trend it finds
  actually supports the launch.

**Evidence standard:** Key points must be hard evidence — specific numbers,
percentages, dates, named sources. "The situation is getting worse" is not a
key point. "Household debt rose 12% in 2025 according to Bank of Israel data"
is. Every key point must have a URL. No key point without a source. No source
without a key point.

**If a thesis cannot be substantiated:** The researcher does NOT pivot to a
different angle. It returns a wave_candidate with low confidence and a clear
statement of what was searched and what was (not) found. The Wave Validator
decides what to do with it.

The Context Strategist is the strategist. The research agents are the field
reporters sent to prove specific claims.

**Wave standard:** A good wave is one that makes the launched product maximally
relevant — it sets the scene and answers the question "why launch this now?"
When evaluating evidence, prioritize sources that make the product feel like
the inevitable response to forces already in motion. Evidence that is merely
interesting but does not sharpen the product's timeliness is weak evidence.

**Input:** One thesis from `context_strategy.json` + minimal product context
(see CLAUDE.md Step 6 for the full input assembly).
**Output:** `wave_candidate_{A|B|C}.json`
**Saved to:** `clients/{company_id}/launches/{product_id}/wave_candidate_{A|B|C}.json`

```
wave_candidate
  .thesis_id            ← "A", "B", or "C"
  .lens                 ← "human_pain", "broken_status_quo", or "emerging_trend"
  .claim                ← The original claim, copied from input

  .wave_title           ← Short descriptive title for the wave — the core finding.
                          Written as a journalist would title a section.
  .wave_narrative       ← 3–6 sentences. The cohesive story the evidence tells.
                          References specific data points and sources. Written so
                          a journalist could use it almost directly.
  .core_tension         ← One sentence. The sharpest contradiction or pressure
                          this evidence reveals — grounded in found evidence,
                          not in reasoning alone.
  .affected_groups[]    ← Specific populations affected. Precise demographics,
                          segments, or roles the evidence names.

  .evidence_details[]
    .url                ← Full URL of the source article or report
    .source_name        ← Name of the publication, institution, or organization
    .date               ← Publication date (YYYY-MM-DD), null if unknown
    .key_points[]       ← Hard facts from this source. Numbers, percentages,
                          dates, named findings. One fact per entry.
                          No interpretations, no summaries, no vague claims.
                          Every key point must have a source URL — this is
                          what flows to the brief as citations.

  .confidence           ← "high", "medium", or "low"
  .limitations          ← What this evidence does NOT prove, what gaps remain,
                          or what caveats apply. One paragraph.
```

---

### AGENT 5 — Wave Validator

**File:** `.claude/agents/wave-validator.md`
**Runs:** After all three research agents complete.
**Tools:** None — pure judgment. Does not search the web, does not rewrite
narratives, does not add evidence. It works with what the researchers found.

**Prompt law:** No company names, product names, industry terms, or
client-specific language. All specifics enter via variables at runtime.

**Job:** The Wave Validator has three jobs:
1. **Score** each wave candidate on multiple dimensions
2. **Cut** waves that fall below the quality threshold
3. **Cluster** the surviving waves into a coherent story arc for the Brief Writer

This is reality framing, not marketing. The Validator is an editor who asks:
"Is this evidence strong enough and relevant enough to anchor a journalist's
story about why this launch matters right now?"

---

**The Thin Line — the most important validation criterion:**

Each wave describes something happening in the world. It must never mention
the product. But it must set the scene so that a journalist who reads it
would independently conclude that something like this product needs to exist.

This is a thin line:
- A wave that mentions the product → **fails** (it's marketing, not journalism)
- A wave about the world that has zero connection to what this product
  solves → **fails** (it's interesting but irrelevant)
- A wave about the world that makes a reader think "someone should build
  exactly this" → **passes** (it sets the scene without selling)

To judge this line, the Validator receives product context — not to inject
into the wave, but to evaluate whether the wave naturally leads a reader
toward the problem space this product addresses.

---

**Input — filtered product context for relevance judgment:**

The Validator receives the same compass the other agents used:

**From `product_profile.json`:**
- `launched_product_core_problem`
- `launched_product_target_audience`
- `launched_product_value_proposition`
- `launched_product_differentiation_claim`
- `top_level_issue`
- `top_level_primary_subdomain`

**From `company_profile.json`:**
- `company_industry`
- `search_config.geo_focus`
- `search_config.primary_geo`

**From `context_strategy.json`:**
- The full strategy output — so the Validator can compare what was asked
  (the thesis) vs what was found (the wave candidate)

**The three `wave_candidate` files:**
- `wave_candidate_A.json`
- `wave_candidate_B.json`
- `wave_candidate_C.json`

**What is deliberately excluded:** pricing, writing guidance, functional
breakdown, spokesperson, offering structure, raw_gold — same exclusions as
the other agents, same reason. Raw gold is for the Brief Writer, not for
the Validator — it would add context load without helping the validation job.

---

**Scoring dimensions — for each wave (all on the same 0–10 scale):**

- **Evidence strength** (0–10): Are the sources credible, recent, with hard
  data? Multiple independent sources with concrete numbers score high.
  Blog posts, vague claims, and aggregator sites score low.

- **Story utility** (0–10): Does this evidence help a local journalist tell
  this launch's story to a local audience? This is NOT a geographic origin
  check — it's about whether the evidence serves the story. A foreign study
  that proves a universal structural pattern (e.g. a meta-analysis showing
  that education alone doesn't change behavior) scores high — because any
  journalist can use it. A foreign study about a foreign-specific problem
  that the local audience doesn't relate to scores low. A local source
  about the target population scores highest. The question is always:
  "Would a journalist writing for THIS audience actually cite this?"

- **Narrative-evidence alignment** (0–10): Does the wave narrative accurately
  reflect what the evidence actually says? Or does the narrative oversell,
  cherry-pick, or draw conclusions the evidence doesn't support? The
  Validator reads the evidence_details and checks whether the narrative
  is honest. A narrative that claims a strong trend when the evidence shows
  a weak signal scores low. A narrative that faithfully represents mixed
  evidence scores high.

- **"Why now" power** (0–10): Does this wave make the launch feel timely
  and inevitable? This is the primary criterion. A wave with strong evidence
  that doesn't sharpen the product's timeliness scores low. A wave with
  moderate evidence that directly answers "why launch this now?" scores high.

- **Thin line check** (0–10): Does the wave set the scene for the product
  without mentioning it? Does it make a reader independently conclude that
  this kind of solution is needed? Uses `core_problem`, `target_audience`,
  `value_proposition`, and `differentiation_claim` to judge the connection.
  A wave that mentions the product scores 0. A wave about the world with
  zero connection to the product's problem space scores 0. A wave that
  naturally leads a reader to the problem this product solves — without
  ever naming it — scores 10.

Total possible score: **50 points per wave.**

---

**Cut threshold:**

Waves scoring below **38/50 (76%)** are rejected. A weak wave in the brief
is worse than no wave — it undermines the credibility of the entire story.
When a wave is rejected, the Validator must explain why, so the client can
decide whether to adjust inputs and re-run or accept the gap.

---

**Cluster formation — shaping the story arc:**

After scoring and cutting, the Validator forms a cluster from the surviving
waves. The best case is a 3-wave arc. But 2 or even 1 is acceptable if the
others didn't pass the threshold. The Validator must never force a weak wave
into the cluster just to have three.

For surviving waves, the Validator:
1. **Assigns a role** to each wave:
   - **Lead:** The emotional or factual entry point — what pulls the reader in.
   - **Supporting:** Deepens the case — adds proof, consequence, or structural explanation.
   - **Broadening:** Widens the frame — shows the shift, the trend, the "why now."

   The natural mapping from lenses is: Human Pain → Lead, Broken Status Quo →
   Supporting, Emerging Trend → Broadening. But the Validator may reclassify
   if the evidence warrants it — the role depends on evidence strength, not
   on which lens produced it.

2. **Writes a continuity chain** — a causal arc that connects the waves:
   "Wave A [specific content] → Wave B [specific content] → Wave C [specific content]."
   This chain must use the actual wave content, never templated language.
   It must be generic enough to work for any product in any domain.

3. **Writes a cluster summary** — 2–4 sentences describing the combined
   story the Brief Writer should tell. Written in newsroom style — concise,
   factual, no marketing language.

---

**Output:** `validated_waves.json`
**Saved to:** `clients/{company_id}/launches/{product_id}/validated_waves.json`

The output carries forward the **full wave data** from each surviving wave —
wave_narrative, evidence_details (URLs, key_points, source_name, date),
core_tension, affected_groups. The Validator adds its scoring, classification,
and cluster on top. It does not replace or strip the raw evidence — the Brief
Writer needs it.

```
validated_waves
  .cluster_summary        ← 2–4 newsroom-style sentences: the combined story arc
  .continuity_chain       ← Causal chain using actual wave content: A → B → C
  .waves_count            ← How many waves survived (1, 2, or 3)

  .waves[]
    .thesis_id            ← "A", "B", or "C"
    .lens                 ← "human_pain", "broken_status_quo", or "emerging_trend"
    .classification       ← "Lead", "Supporting", or "Broadening"
    .status               ← "approved"

    .score
      .total              ← Sum out of 50
      .evidence_strength  ← 0–10
      .story_utility      ← 0–10
      .narrative_alignment ← 0–10
      .why_now_power      ← 0–10
      .thin_line_check    ← 0–10

    .reasoning_trace
      .evidence_assessment       ← Why this score for evidence strength
      .story_utility_assessment  ← Why this score — does the evidence serve this story for this audience?
      .narrative_alignment_check ← Does the narrative match the evidence honestly?
      .why_now_assessment        ← Does this wave answer "why launch now?"
      .thin_line_assessment      ← Does it set the scene without selling?

    ← FULL WAVE DATA carried forward from wave_candidate:
    .claim
    .wave_title
    .wave_narrative
    .core_tension
    .affected_groups[]
    .evidence_details[]
      .url
      .source_name
      .date
      .key_points[]
    .confidence
    .limitations

  .rejected_waves[]
    .thesis_id
    .lens
    .status               ← "rejected"
    .score.total
    .reject_reason        ← Clear explanation of why this wave was dropped
```

---

**What this agent does NOT do:**
- Does not rewrite wave narratives — that's the researcher's work
- Does not search the web or add new evidence
- Does not validate URLs by fetching them
- Does not produce the brief — that's the Brief Writer's job
- Does not receive writing guidance, pricing, or spokesperson data

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
│   │   ├── user-story-parser.md
│   │   ├── context-strategist.md
│   │   ├── researcher.md          ← one prompt, called 3× with different inputs
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
│               ├── user_stories_input.md      ← created on first run, raw testimonials
│               ├── user_stories.json          ← structured by User Story Parser
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
