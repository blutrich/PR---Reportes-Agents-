---
name: pr-router
description: |
  Entry point for the PR Reporter Agents pipeline. Takes a company brief and routes it to 10 reporter sub-agents, each producing a tailored article brief.

  Triggers on: PR brief, article brief, press release, media pitch, reporter brief, journalist pitch, write briefs, pitch reporters, PR pipeline, company announcement, כתוב בריף, תדרוך עיתונאים.

  Executes workflows immediately. Never lists capabilities.
---

# PR Router

**EXECUTION ENGINE.** When loaded: Read brief > Load client brand > Analyze angles > Assign reporters > Execute in parallel > Brand guardian review.

**NEVER** list capabilities. **ALWAYS** execute.

## Intent Detection

### Phase 1: Understand the Request

If the request is NOT already clear, ask:

```
AskUserQuestion(questions=[{
  "question": "What would you like to do?",
  "header": "PR Router",
  "options": [
    {"label": "Full pipeline", "description": "Generate briefs for all 10 reporters from a company brief"},
    {"label": "Single reporter", "description": "Generate a brief for one specific reporter"},
    {"label": "Select reporters", "description": "Choose which reporters to brief"},
    {"label": "Analyze brief", "description": "Just analyze the brief and suggest angles (no writing)"}
  ],
  "multiSelect": false
}])
```

Then ask for the company brief if not provided:

```
AskUserQuestion(questions=[{
  "question": "Paste the company brief, press release, or describe the announcement:",
  "header": "Company Brief"
}])
```

And the client:

```
AskUserQuestion(questions=[{
  "question": "Which client is this for?",
  "header": "Client",
  "options": [
    {"label": "Rise Up", "description": "Rise Up"},
    {"label": "New client", "description": "Set up a new client brand folder"},
    {"label": "Generic", "description": "No specific client rules"}
  ],
  "multiSelect": false
}])
```

**Fast path:** If the user already specified everything ("Write briefs for all reporters about Rise Up's new AI training feature"), skip directly to execution.

### Phase 2: Brief Analysis

Before routing to reporters, analyze the company brief:

1. **Extract core story:** What happened? What's new? What changed?
2. **Identify data points:** Numbers, dates, milestones, quotes
3. **Find news hooks:** Why now? What's the timing?
4. **Map to beats:** Which reporter beats does this story touch?
   - Economy/Budget -> Gad Lior
   - Tech/Startups -> [Reporter TBD]
   - Politics/Policy -> [Reporter TBD]
   - Social/Labor -> [Reporter TBD]
   - etc.
5. **Suggest angles:** Different reporters need different angles on the same story

### Phase 3: Route to Reporters

For each assigned reporter, spawn a sub-agent with:

```
Agent(
  description="Reporter brief: [reporter name]",
  prompt="
    Read the reporter skill: skills/[reporter-skill]/SKILL.md
    Read shared instructions: skills/shared-instructions/SKILL.md
    Read client brand: brands/[client]/RULES.md

    Company brief:
    [THE BRIEF]

    Suggested angle for this reporter:
    [ANGLE]

    Write an article brief tailored to this reporter's voice, beat, and outlet.
    The brief should make the reporter want to write this story.
    300-500 words. Save to: output/[client]/[reporter-name]-brief.md
  ",
  run_in_background=true
)
```

Run all reporters in parallel.

### Phase 4: Brand Guardian Review

After all reporter briefs are complete, run brand-guardian on each:

```
Agent(
  subagent_type="brand-guardian",
  prompt="Review this article brief: output/[client]/[reporter-name]-brief.md"
)
```

### Phase 5: Deliver

Present all approved briefs to the user with:
- Reporter name and outlet
- Score from brand guardian
- The brief itself
- Any notes on angle or timing

## Reporter Registry

| Reporter | Skill | Beat | Angle Style |
|----------|-------|------|-------------|
| Gad Lior | gad-lior-hearot | Economy, Budget, Policy | Numbers-first, promise vs reality, citizen impact |
| [TBD] | | | |
| [TBD] | | | |
| [TBD] | | | |
| [TBD] | | | |
| [TBD] | | | |
| [TBD] | | | |
| [TBD] | | | |
| [TBD] | | | |
| [TBD] | | | |

## Adding a Reporter

When a new reporter skill is added:
1. Add them to the registry table above
2. Update the beat mapping in Phase 2
3. Test with a sample brief
