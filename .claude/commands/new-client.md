Onboard a new client.

Ask the user for the following, one at a time.
Wait for each answer before asking the next question.

1. "Please provide a short company ID — lowercase and hyphenated.
   Example: acme-corp"

2. "What language are your materials in?
   This will be the language of all extracted values.
   Examples: Hebrew, English, German, French."

3. "Who is your target audience?
   Describe them in detail — who they are, what problem they face,
   and what they are trying to achieve.
   Be as specific as possible. You know your audience better
   than your website does."

4. "Who is the designated spokesperson for press coverage?
   Please provide their full name and exact title.
   If none designated — we will default to the CEO."

5. "Please provide all URLs that carry relevant brand information.
   Examples: homepage, about page, product pages, how-it-works,
   blog posts, leadership page, press page, case studies.
   The more relevant pages you provide, the richer the profile."

Once all answers are collected, pass the following to the
company-profiler agent:
- `{{company_id}}`
- `{{content_language}}`
- `{{company_target_audience}}`
- `{{spokesperson_name}}`
- `{{spokesperson_title}}`
- `{{company_urls[]}}`

Then follow STEP 1 in CLAUDE.md.