# Evaluation Results: e2e-1-riseup

**Date:** 2026-03-31
**Type:** good_fit
**Company:** riseup-israel
**Product:** financial-advisory

---

## E2E Assertions

| # | Assertion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | brief_final.md exists and is 200-300 words | **PASS** | File exists. Core sections (excluding Key Facts and What We Can Offer) = 300 words. At the upper boundary but within range. |
| 2 | Brief subject line contains a number, not a company name | **PASS** | Subject: "29% מבעלי הדירות בישראל לא מסגרים את החודש, וידע פיננסי לבד לא פותר את זה" -- contains "29%", no company name. |
| 3 | Brief contains no forbidden words | **PASS** | Checked all 7 forbidden words (תקציב, ריסון, צמצום, הידוק חגורה, חיסכון בכוח, ויתור, הגבלות). None found. |
| 4 | Brief contains no em dashes | **PASS** | No U+2014 (em dash), U+2013 (en dash), or U+2015 (horizontal bar) found anywhere in the document. |
| 5 | Brief mentions שיחת היכרות חינמית | **PASS** | Found in The Announcement section ("התהליך מתחיל בשיחת היכרות חינמית") and in Key Facts. |
| 6 | Brief mentions שילוב AI ויועץ אנושי | **PASS** | Found in The Announcement section ("המשלב AI ויועץ אנושי כתף אל כתף") and in Key Facts. |
| 7 | validated_waves.json has at least 1 lead wave with match_score >= 7 | **PASS** | Wave A classified as "lead" with match_score = 9. Wave B is "supporting" with match_score = 9. |
| 8 | Reporter article contains at least 5 specific numbers with sources | **PASS** | Found 9 distinct lines containing numbers with explicit source attribution (דף חדש/תובנות, S&P/Gallup, Management Science, Adjust 2025, עמותת לתת, הלמ"ס, בנק ישראל, ISS Market Intelligence). |
| 9 | guardian_review.md scores 9+ on brief | **NOT_RUN** | File `guardian_review.md` does not exist in the launch folder. Brand Guardian agent was not executed. |

---

## Agent-Specific: bw-1-hebrew-full (Brief Writer)

| # | Assertion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Brief is in Hebrew | **PASS** | All core content is in Hebrew. |
| 2 | Word count 200-300 (core sections) | **PASS** | 300 words in core sections (The Problem, Why Now, The Announcement, Why It Matters, Spokesperson Quote, Journalist Angles). |
| 3 | Subject line contains a number | **PASS** | "29%" in subject line. |
| 4 | Company name not in first sentence of The Problem | **PASS** | First sentence starts with "סקר דצמבר 2025 (דף חדש/תובנות...)" -- no company name. |
| 5 | No em dashes anywhere | **PASS** | Zero em dashes, en dashes, or horizontal bars found. |
| 6 | No words from global_forbidden_words list | **PASS** | All 7 forbidden words absent. |
| 7 | No AI vocabulary | **PASS** | None of: leverage, groundbreaking, seamless, transformative, unprecedented found. |
| 8 | No rule-of-three patterns | **PASS** | Journalist Angles has 4 angles (not 3). No obvious triple-parallel structures detected in body text. |
| 9 | Spokesperson Quote matches a raw_gold entry verbatim | **PASS** | Quote "ליווי הלקוח מבוסס על עבודה משותפת של AI ויועץ אנושי, כתף אל כתף" confirmed present in raw_gold.json. |
| 10 | must_include items are present | **PASS** | Both "שיחת היכרות חינמית" and "שילוב AI ויועץ אנושי" found. |
| 11 | Journalist Angles has 2 or 4 angles (never 3) | **PASS** | 4 angles: צרכנית, כלכלית-מחקרית, טכנולוגית-רגולטורית, בריאות הנפש. |

---

## Agent-Specific: gl-1-economy (Gad Lior Reporter Skill)

| # | Assertion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Article is in Hebrew | **PASS** | Entire article is in Hebrew. |
| 2 | Contains הערה ראשונה, הערה שנייה, הערה שלישית | **PASS** | All three section headers present. |
| 3 | Each הערה contains at least 1 specific number | **FAIL** | הערה ראשונה contains zero numbers -- it is a narrative setup section with no statistics. הערה שנייה has 31+ number occurrences. הערה שלישית has 12+ number occurrences. |
| 4 | Uses אנחנו/עלינו framing (not הם) | **PASS** | אנחנו/עלינו appears 5 times. הם appears 9 times but is used to refer to institutions/bankers ("הם רואים את המספרים"), not to distance from the reader. The dominant framing is inclusive. |
| 5 | No em dashes | **PASS** | No em dashes (U+2014), en dashes (U+2013), or horizontal bars (U+2015) found. |
| 6 | No English buzzwords | **PASS** | No English buzzwords found (checked: leverage, groundbreaking, seamless, transformative, unprecedented, synergy, disrupt). |
| 7 | 800-1200 words | **FAIL** | Word count = 704. Below the 800-word minimum by 96 words. |

---

## Summary

| Category | Pass | Fail | Not Run | Total |
|----------|------|------|---------|-------|
| E2E assertions | 8 | 0 | 1 | 9 |
| bw-1-hebrew-full | 11 | 0 | 0 | 11 |
| gl-1-economy | 5 | 2 | 0 | 7 |
| **Total** | **24** | **2** | **1** | **27** |

### Failures

1. **gl-1-economy #3**: הערה ראשונה has no specific numbers. It functions as a narrative/framing section that sets up the argument without data. The eval expects each הערה to contain at least one number.

2. **gl-1-economy #7**: Article is 704 words, 96 words short of the 800-word minimum. The article is dense with data but structurally compact.

### Not Run

1. **guardian_review.md**: Brand Guardian agent was never executed for this launch. File does not exist.
