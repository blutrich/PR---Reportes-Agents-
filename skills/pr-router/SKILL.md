---
name: pr-router
description: |
  Entry point for the PR Reporter Agents pipeline. Takes a company brief and produces tailored article briefs for specific Israeli journalists, each written in that reporter's voice and analytical framework.

  Use this skill whenever someone wants to: write PR briefs, pitch reporters, create article briefs for journalists, run the PR pipeline, write a media pitch, write a brief for Gad Lior or any other Israeli reporter, or analyze which reporters fit a story. Also triggers on Hebrew: כתוב בריף, תדרוך עיתונאים, בריף לעיתונאים, פיץ' לעיתונאי.

  Executes workflows immediately. Never lists capabilities.
---

# PR Router

Takes a company brief, routes it through the right reporters, and delivers quality-gated article briefs.

## Step 1: Understand the Request

If the user already specified everything (reporter + topic + client), skip to Step 2.

Otherwise, ask what's needed:

```
AskUserQuestion(questions=[{
  "question": "What would you like to do?",
  "header": "PR Pipeline",
  "options": [
    {"label": "Full pipeline", "description": "Briefs for all active reporters"},
    {"label": "Single reporter", "description": "Brief for one specific reporter"},
    {"label": "Select reporters", "description": "Pick which reporters to use"},
    {"label": "Analyze only", "description": "Analyze the brief and suggest which reporters fit (no writing)"}
  ],
  "multiSelect": false
}])
```

Then get the brief and client if not provided:

```
AskUserQuestion(questions=[{
  "question": "Paste the company brief, press release, or describe the announcement:",
  "header": "Company Brief"
}])
```

```
AskUserQuestion(questions=[{
  "question": "Which client?",
  "header": "Client Brand",
  "options": [
    {"label": "Rise Up", "description": "Fintech - family financial management"},
    {"label": "New client", "description": "I'll set up brand rules"},
    {"label": "No client rules", "description": "Skip brand-specific checks"}
  ],
  "multiSelect": false
}])
```

## Step 2: Analyze the Brief

Before routing, extract:

1. **Core story** — What happened? What's new?
2. **Data points** — Numbers, dates, milestones, quotes available
3. **News hooks** — Why now? What current story does this connect to?
4. **Beat mapping** — Which reporter beats does this touch?

### Beat-to-Reporter Map

| Beat | Reporter | Skill | Status |
|------|----------|-------|--------|
| Economy, Budget, Policy | Gad Lior | `gad-lior-hearot` | Active |
| Tech, Startups | TBD | — | Planned |
| Politics, Policy | TBD | — | Planned |
| Social, Labor | TBD | — | Planned |
| Legal, Regulation | TBD | — | Planned |
| Security, Defense | TBD | — | Planned |
| Consumer, Lifestyle | TBD | — | Planned |
| Investigative | TBD | — | Planned |
| Local, Municipal | TBD | — | Planned |
| International | TBD | — | Planned |

**Important:** Not every story fits every reporter. If a story is a poor fit for a reporter's beat, say so. A tech-only story shouldn't be forced on an economy journalist. Better to skip a reporter than produce a weak brief that wastes the PR team's time and damages credibility with the journalist.

For each assigned reporter, write a one-line **angle suggestion** — the specific hook for THAT journalist.

### "Analyze Only" Mode

If the user chose "Analyze only", stop here. Present:
- The beat mapping
- Which reporters are a good fit (and why)
- Which reporters are a poor fit (and why)
- Suggested angles per reporter

## Step 3: Generate Briefs (3-Layer Quality Chain)

For each assigned reporter, run a sub-agent. The sub-agent goes through three quality layers before delivering.

### Layer 1: Write the Brief

Spawn one agent per reporter. Run all reporters **in parallel**:

```
Agent(
  description="Brief: [reporter name]",
  prompt="
    You are writing a PR article brief tailored to a specific Israeli journalist.

    STEP 1 - Load instructions (read these files IN ORDER):
    1. Read: skills/shared-instructions/SKILL.md (anti-AI patterns, voice rules)
    2. Read: skills/[reporter-skill]/SKILL.md (reporter profile and voice)
    3. Read: brands/[client]/RULES.md (client rules - skip if no client)
    4. Read: brands/[client]/banned-words.md (skip if no client)
    5. Read: brands/[client]/tone-of-voice.md (skip if no client)

    STEP 2 - Write the brief:
    Company brief: [THE BRIEF]
    Suggested angle: [ANGLE]

    Follow the reporter skill's Article Mode / brief format exactly.
    The brief should make this reporter want to write the story.
    300-500 words.

    STEP 3 - Self-check against shared-instructions anti-AI rules.
    Fix any violations before saving.

    Save the brief to: output/[client]/[reporter-name]-brief.md
  ",
  run_in_background=true
)
```

### Layer 2: Reporter Guardian

After each brief is written, run the reporter-specific guardian. Each reporter has a guardian agent in `agents/` that checks whether the brief matches THAT journalist's instincts.

```
Agent(
  description="Guardian: [reporter name]",
  prompt="
    Read: agents/[reporter-name]-guardian.md
    Read: skills/shared-instructions/SKILL.md

    Review this brief: output/[client]/[reporter-name]-brief.md

    Score it against the reporter's 10-point checklist.
    If score < 9/10, rewrite and re-score (max 2 attempts).
    Save the review to: output/[client]/[reporter-name]-guardian-review.md
    Save the final brief (approved or best attempt) to: output/[client]/[reporter-name]-brief-final.md
  "
)
```

**If a reporter guardian scores below 7/10**, flag it as a poor fit. Don't force it through brand guardian. Tell the user: "This story isn't a natural fit for [reporter]. Here's why: [reason from guardian]. Skip, or want me to try a different angle?"

### Layer 3: Brand Guardian

After reporter guardian approves (9+/10), run brand-guardian on the final brief:

```
Agent(
  description="Brand guardian: [reporter name]",
  prompt="
    Read: agents/brand-guardian.md
    Read: skills/shared-instructions/SKILL.md
    Read: brands/[client]/RULES.md
    Read: brands/[client]/banned-words.md
    Read: brands/[client]/tone-of-voice.md

    Review this brief: output/[client]/[reporter-name]-brief-final.md

    Score against the 10-point brand checklist.
    If score < 9/10, rewrite and re-score (max 2 attempts).
    Save review to: output/[client]/[reporter-name]-brand-review.md
  "
)
```

**Skip Layer 3** if the user chose "No client rules".

## Step 4: Deliver

Present all completed briefs to the user:

```markdown
# PR Briefs: [Client Name] - [Topic]

## [Reporter Name] ([Outlet])
**Reporter Guardian:** [X]/10 | **Brand Guardian:** [X]/10
**Angle:** [one-line description]

[The brief]

---
[Repeat for each reporter]
```

Include at the bottom:
- Any reporters that were skipped (and why)
- Any briefs that needed rewrites (and what was fixed)
- Suggested next steps (e.g., "add contact info before sending")

## Adding a New Reporter

When a new reporter skill is created:
1. Add them to the Beat-to-Reporter Map above (Step 2)
2. Create their guardian agent in `agents/[name]-guardian.md`
3. Create their skill in `skills/[name]/SKILL.md`
4. Test with 3 briefs: one perfect-fit topic, one stretch topic, one bad-fit topic
