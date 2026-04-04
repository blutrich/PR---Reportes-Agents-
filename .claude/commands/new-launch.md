# /new-launch Command

## Usage

```
/new-launch {company_id} {product_id}
```

Both arguments are required.

**{company_id}** — the identifier for the client company.
Must match an existing folder under `clients/`.
Example: `riseup-israel`

**{product_id}** — the identifier for this specific launch.
Used as the launch subfolder name.
Example: `riseup-budget-2024`

Both must be lowercase and hyphenated.

---

## What This Command Does

Triggers the full launch pipeline for an existing client.

If the client does not have a company profile yet (`clients/{company_id}/company_profile.json`),
the pipeline will stop at Step 1 and tell the client to run `/new-client {company_id}` first.

### First run — input files don't exist yet

The Orchestrator creates four input template files inside the launch folder
and stops. The client fills them in and runs the command again.

Files created:
- `launch_input.md` — sources: URLs, Google Doc link, pasted notes
- `product_input.md` — authoritative field overrides (client values win)
- `editorial_notes.md` — framing and emphasis directives for the brief
- `user_stories.md` — optional customer testimonials

### Second run — input files are filled in

Executes the full pipeline:

**Step 0A** — Reads `launch_input.md`, fetches all sources, assembles
and saves `raw_launch_text.txt`

**Step 0B** — Reads `editorial_notes.md`, collects emphasis directives

**Step 0C** — Reads `user_stories.md`, collects testimonials (optional)

**Step 1** — Checks for company profile, runs Company Profiler if needed

**Step 2** — Runs Launch Compactor and Raw Gold in parallel,
then applies `product_input.md` overrides

**Step 3** — Merges writing_guidance from all sources, saves
`product_profile.json`

**Steps 4–10** — Added as agents are built and tested

Final output: `brief_final.md`

---

## Input File Format Reference

### launch_input.md
```markdown
## Pages
https://example.com/feature-page
https://example.com/blog/launch-post

## Google Doc
https://docs.google.com/document/d/your-doc-id

## Notes
Any raw text pasted directly here.
```

### product_input.md
```
launched_product_name: Your Product Name
launched_product_value_proposition: The concrete benefit the user receives
```

### editorial_notes.md
```
Emphasize that this is the first product in the market to do X
The financial independence angle matters more than the savings angle
```

### user_stories.md
```markdown
---
name: Customer Name
anonymous: false
job_title: Their role
story: The full text of their testimonial.
key_quote: The single most impactful sentence.
```

---

## Rules

- Lines starting with `#` in any input file are comments and are ignored
- `product_input.md` values always overwrite extracted values
- Fields not in `product_input.md` are never touched
- `user_stories.md` is optional — pipeline runs without it
- All input files are re-read on every run