Onboard a new client.

## Usage

```
/new-client {company_id}
```

**{company_id}** — the identifier for the client company.
Must be lowercase and hyphenated.
Example: `acme-corp`

---

## What This Command Does

### First run — company_input.md does not exist

Create the client folder if it does not exist:
`clients/{company_id}/`

Create the template file:
`clients/{company_id}/company_input.md`

```markdown
# Company Input

## Content Language
# The language of your materials and all extracted values.
# Examples: Hebrew, English, German, French
# Hebrew

## Target Audience
# Describe your target audience in detail — who they are,
# what problem they face, and what they are trying to achieve.
# Be as specific as possible. You know your audience better
# than your website does.

## Anti Target Audience
# Populations the company explicitly does NOT serve or want
# to be associated with. Used as a negative filter across the pipeline.
# Optional — remove the # and fill in if relevant.

## Spokesperson
# The designated spokesperson for press coverage.
# Format: Full Name, Exact Title
# If none designated — we will default to the CEO.
# Example: Jane Doe, CEO

## Term Substitutions
# Words or phrases you want replaced in all briefs.
# Format: instead_of: X | say: Y
# One substitution per line. Remove the # to activate.
#
# instead_of: users | say: customers
# instead_of: artificial intelligence | say: AI
# instead_of: cheap | say: affordable

## Company URLs
# All URLs that carry relevant brand information.
# One URL per line.
# Examples: homepage, about page, product pages, how-it-works,
# blog posts, leadership page, press page, case studies.
# The more relevant pages you provide, the richer the profile.
# https://example.com
# https://example.com/about
```

Then stop and tell the client:

"I've created the input file for this client:
`clients/{company_id}/company_input.md`

Fill in your details — language, target audience, spokesperson, and URLs.
Then run `/new-client {company_id}` again."

Do not proceed further. Wait for the client to fill in the file and re-run.

---

### Second run — company_input.md exists

Read: `clients/{company_id}/company_input.md`

Parse each section. For each section:
- Read all lines under the heading
- Skip any line starting with `#` — these are comments
- Skip empty lines
- Collect the remaining content

**## Content Language** → `content_language` (single value)
**## Target Audience** → `company_target_audience` (full text)
**## Anti Target Audience** → `company_anti_target_audience` (full text, may be empty)
**## Spokesperson** → parse as `spokesperson_name, spokesperson_title`
**## Term Substitutions** → `global_term_substitutions[]` (parsed as `{ "instead_of": X, "say": Y }` per line; empty array if section is empty or all commented)
**## Company URLs** → `company_urls[]` (one URL per line)

Validation:
- `content_language` must be non-empty
- `company_target_audience` must be non-empty
- `company_urls[]` must have at least one URL
- If `spokesperson` is empty — tell the client: "No spokesperson specified.
  Add one to company_input.md and run again." Stop.

If all required fields are present:
  Pass the following to the company-profiler agent:
  - `company_id`
  - `content_language`
  - `company_target_audience`
  - `company_anti_target_audience` (may be null if section was empty)
  - `spokesperson_name`
  - `spokesperson_title`
  - `global_term_substitutions[]` (may be empty array if section was empty or all commented)
  - `company_urls[]`

  Wait for output.
  Save output to: `clients/{company_id}/company_profile.json`
  Tell the client: "Company profile saved for {company_id}."
