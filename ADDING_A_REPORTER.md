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
Based on the profile in reporters/<name>/profile.md, create a SKILL.md for this reporter. Follow the same structure as the Gad Lior skill but adapt everything to this reporter's unique patterns.
```

Save the skill to `skills/<name>-SKILL.md`.

## Step 4: Install and Test

```bash
# Copy skill to Claude skills directory
mkdir -p ~/.claude/skills/<name>-reporter
cp skills/<name>-SKILL.md ~/.claude/skills/<name>-reporter/SKILL.md
```

Test with 3 prompts:
1. A topic the reporter typically covers
2. A topic in English (should still write in Hebrew in their style)
3. If they have a specific format (like Lior's 5 הערות), test that variant

## Step 5: Iterate

Read the outputs. Compare to the reporter's real columns. Adjust the skill.

## Reporter Candidates to Consider

When choosing reporters, aim for diversity in:
- **Beat**: Economy, politics, security, social, tech, legal
- **Outlet**: Yedioth, Haaretz, Globes, Calcalist, Channel 12/13, Kan
- **Style**: Data-driven vs narrative, investigative vs commentary, sharp vs measured
