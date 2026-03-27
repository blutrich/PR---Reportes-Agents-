# PR - Reporter Agents

A collection of AI agent skills that write in the voice and analytical framework of Israel's top journalists.

Each reporter agent is built from deep analysis of the journalist's actual writing patterns, structural habits, voice rules, and thinking frameworks.

## Reporters

| # | Name | Beat | Status |
|---|------|------|--------|
| 1 | [Gad Lior (גד ליאור)](reporters/gad-lior/) | Economy, Budget, Policy | Active |
| 2 | TBD | | Planned |
| 3 | TBD | | Planned |
| 4 | TBD | | Planned |
| 5 | TBD | | Planned |
| 6 | TBD | | Planned |
| 7 | TBD | | Planned |
| 8 | TBD | | Planned |
| 9 | TBD | | Planned |
| 10 | TBD | | Planned |

## How to Add a New Reporter

1. Copy `reporters/_template/` to `reporters/<reporter-name>/`
2. Fill in the research: read 8-10 of their columns, identify patterns
3. Write the `profile.md` following the template
4. Generate the skill using the profile
5. Test with 3 prompts and iterate

## Structure

```
reporters/
  _template/          # Copy this to add a new reporter
    profile.md        # Research template
    research/         # Raw article analysis
  gad-lior/           # First reporter
    profile.md        # Analyzed writing patterns
    research/         # Source articles and notes
skills/               # Generated SKILL.md files ready to install
```
