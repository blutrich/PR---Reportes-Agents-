# How to Add a New Reporter Agent

## Step 1: Research (1-2 hours with Claude)

Tell Claude:
```
I need to learn about [REPORTER NAME]. Find their bio, then pull 8-10 of their actual columns/articles. Analyze their writing patterns like we did for Gad Lior.
```

What to look for:
- **Signature format** - Do they have a recurring column structure?
- **Opening patterns** - How do they start? Data? Anecdote? Quote?
- **Argument structure** - Sequential build-up or independent observations?
- **Voice markers** - Short sentences? Long? Formal? Colloquial? Ironic?
- **Data usage** - Heavy numbers? More narrative? Quotes from sources?
- **Closing style** - Call to action? Moral conclusion? Open question?
- **What they'd NEVER do** - This is often the most revealing

## Step 2: Fill the Profile

Copy `reporters/_template/profile.md` to `reporters/<name>/profile.md` and fill it in based on the research.

## Step 3: Generate the Skill

Tell Claude:
```
Based on the profile in reporters/<name>/profile.md, create a SKILL.md for this reporter. Follow the same structure as the Gad Lior skill but adapt everything to this reporter's unique patterns. The skill must include both Brief format and Article format sections.
```

Save the skill to `skills/<name>/SKILL.md` (in a subdirectory, not a flat file).

## Step 4: Generate the Guardian

Tell Claude:
```
Based on the reporter skill at skills/<name>/SKILL.md, create a guardian agent. Follow the same structure as agents/gad-lior-guardian.md — separate 10-point checklists for briefs and articles, scoring rubric, auto-revise rules.
```

Save to `agents/<name>-guardian.md`.

## Step 5: Register in the Router

1. Add the reporter to the Beat-to-Reporter Map in `skills/pr-router/SKILL.md`
2. Add to the Reporters table in `CLAUDE.md`
3. Add skill and agent entries to `.claude-plugin/plugin.json`

## Step 6: Test

Test with 3 company briefs:
1. **Good fit** — A topic the reporter typically covers
2. **Stretch** — Adjacent to their beat but requiring creative angle
3. **Bad fit** — A topic clearly outside their beat (guardian should flag it)

For each, generate both documents:
- Brief — Does it make this reporter want to write?
- Article — Could they publish it with light edits?

Save outputs to `pr-pipeline-workspace/` for comparison.

## Step 7: Iterate

Read the outputs. Compare to the reporter's real columns. Adjust the skill and guardian. Focus on:
- Does the brief answer "מה הבשורה?" in 2 sentences?
- Does the article sound like THIS journalist, not generic journalism?
- Does the guardian correctly reject bad-fit stories?

## Reporter Candidates to Consider

When choosing reporters, aim for diversity in:
- **Beat**: Economy, politics, security, social, tech, legal
- **Outlet**: Yedioth, Haaretz, Globes, Calcalist, Channel 12/13, Kan
- **Style**: Data-driven vs narrative, investigative vs commentary, sharp vs measured
- **Mental model**: How they think about stories (numbers-first, human-interest, institutional-failure, etc.)
