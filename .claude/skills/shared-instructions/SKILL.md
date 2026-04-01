---
name: shared-instructions
description: "Anti-AI writing patterns, banned structures, banned vocabulary, and Hebrew-specific quality rules. Preload into any writing agent to prevent AI-detectable output. Covers em dashes, rule-of-three, contrast framing, synonym cycling, and 60+ banned words. Use whenever generating PR briefs, articles, or any client-facing written content."
user-invocable: false
---

# Shared Writing Instructions

> Single source of truth for anti-AI quality rules. Referenced by writing and quality agents.

## Anti-AI Patterns (MANDATORY)

Every piece of written content must pass these checks. These patterns are dead giveaways that content was AI-generated. Journalists and editors spot them instantly.

### Banned Structures

- **No em dashes. Period.** Use commas, periods, or parentheses. Em dashes are the single biggest AI tell.
- **No rule-of-three.** Three adjectives, three bullets, three parallel phrases in a row = AI pattern. Use two, or four+.
- **No contrast framing.** "It's not X, it's Y" or "Not just A, but B" = AI-coded. Just say what it is.
- **No self-narration.** "Here's why this matters", "Let me explain", "Here's the thing" = AI pattern. Just make the point.
- **No significance inflation.** "Marking a pivotal moment", "a game-changer", "reshaping the landscape" = AI slop. State what happened, let the reader judge significance.
- **No transition openers.** However, Moreover, Furthermore, Additionally, Importantly = AI tells. Start sentences with the subject.
- **No synonym cycling.** If you said "company" don't switch to "firm" then "enterprise" then "organization". Pick one and stick with it.
- **No fake naming.** "The Innovation Paradox", "The Growth Dilemma" = AI pattern. Don't name concepts that don't have established names.
- **No stacked short sentences for drama.** "One product. Three markets. Zero limits." = advertising melody, not journalism.

### Banned Vocabulary

These words scream "AI wrote this":

**Verbs:** leverage, utilize, craft, empower, streamline, curate, facilitate, optimize, harness, revolutionize, spearhead, bolster, elevate, foster, amplify, catalyze, synergize, navigate (figurative), reimagine, unlock

**Adjectives:** groundbreaking, seamless, robust, transformative, unprecedented, innovative, cutting-edge, holistic, comprehensive, scalable, disruptive, synergistic, dynamic, forward-thinking, state-of-the-art, next-generation

**Nouns:** paradigm, ecosystem (non-biological), landscape (non-physical), stakeholder, bandwidth (non-technical), synergy, deep dive, game-changer, thought leader, best practice, pain point, low-hanging fruit

**Phrases:** "at the end of the day", "it goes without saying", "needless to say", "in today's world", "the fact of the matter", "when it comes to", "in terms of", "at its core"

### What to Use Instead

Write like a journalist talks. Short, direct, specific.
- "leverage AI" -> "use AI"
- "groundbreaking platform" -> "new platform" or just describe what it does
- "seamless integration" -> "it connects to X"
- "empower builders" -> "let people build"
- "transformative solution" -> describe what it actually changes

## Hebrew-Specific Rules

When writing in Hebrew:
- Avoid direct translations of English AI-speak into Hebrew
- Use natural Hebrew sentence structure (verb-subject-object is fine)
- Prefer Hebrew words over borrowed English when both exist
- Keep sentences shorter in Hebrew than you would in English
- Israeli journalism is direct, not flowery

## Two-Document Output

The pipeline produces **two separate documents**:

### Document 1: Brief
A pitch that sells the STORY to the journalist. 200-300 words. Leads with the news revelation, not the company or product. Used for client alignment.

### Document 2: Article
A full draft article in the journalist's voice. 800-1200 words. Written as the journalist would write it. Third person, data-sourced, reads like it belongs in their outlet.

### Critical Distinction
The brief is NOT a shorter article. The article is NOT an expanded brief. They serve different purposes and have different structures.
