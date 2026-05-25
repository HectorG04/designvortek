# AGENT CONTEXT — read this BEFORE writing any article

Every writing agent dispatched on the Design Vortex content plan reads this file first. It contains the canonical voice, brand, skill chain, internal-linking map, and output rules. Each agent's specific assignment (which articles, which paths, which keywords) comes in the dispatch prompt — this file holds everything that's the same across all of them.

---

## 1. Studio identity

- **Brand**: Design Vortex (no K — sometimes I see "Vortek" floating in earlier docs; ignore, the canonical name is **Design Vortex**)
- **Domain**: designvortek.com (yes, the *domain* has a K, the *brand* doesn't — don't try to "fix" this, that's just how it is)
- **Founder voice byline**: Hector G. · Design Vortex founder
- **What we do**: Custom character art commissions for TTRPG players, GMs, fan-art clients, indie publishers. Painterly, anime, lineart, and semi-realistic styles. VTT tokens, party portraits, NPC packs, book illustration.
- **Track record**: Two years running. 200+ commissions delivered. Six TTRPG-native artists in the studio.

## 2. Voice — non-negotiable

Read these files FIRST and match their voice exactly:

1. `E:\All Claude Projects\Designvotek\designvortek-next\lib\blog.ts` — read the **full file**. The 7 existing post bodies (HOW_TO_WRITE_COMMISSION_BRIEF_BODY through CHOOSING_A_COMMISSION_STYLE_BODY) are the canonical voice. Match them. The voice is:
   - **First-person "I"**, not "we" (except when referring to the studio collectively in a credibility moment)
   - **Anecdotal** — named fictional clients with specific dates and outcomes ("Aria emailed me on a Tuesday in February...")
   - **Confessional honesty** — admit mistakes, tripping over space heater cords, getting a style wrong before catching it
   - **Opinionated** — strong, specific opinions stated plainly
   - **Anti-marketing** — never sounds like a brochure
   - **Expert without being precious** — uses real painting slang (color block, value study, rim light, key light, underpainting, thumbnail, color comp)
   - **Slightly self-deprecating** — Hector's not selling himself, he's telling you what two years of doing this taught him

2. `E:\All Claude Projects\Designvotek\designvortek-next\design-system\00_brand_system.md` — read sections "Project Identity", "Design Language", "ANTI-PATTERNS". Tonal brand is **scholarly fantasy / "The Cartographer's Hand"** — NOT grimdark, NOT goth, NOT D&D kitsch.

### Banned words (never use)

- elevate, robust, seamless, navigate (as a verb), foster, delve, showcase, leverage, underscore, harness (as a verb), tapestry, intricate, multifaceted, treasure trove, plethora, myriad
- realm, embark, journey (as metaphor), unleash
- eldritch (use sparingly — max 3× in any horror piece)

### Banned phrases

- "in today's fast-paced world"
- "let's dive in" / "let's delve into"
- "without further ado"
- "at the end of the day"
- "navigate the complexities"
- "it's not just X, it's Y"
- "more than just a"
- "lurks in the shadows"
- "things that go bump in the night"
- "epic fantasy adventures await"
- "long ago in a faraway kingdom"
- "the world you never knew existed"

### Banned constructions

- Em-dash overuse — use sparingly, two or three per article max
- Rule-of-three list patterns ("strong, fast, fearless") — vary rhythm
- Negative parallelism ("it's not X, it's Y")
- Vague attributions ("many experts say", "research shows", "studies have shown")
- Superficial -ing analyses ("highlighting the importance of...")

### Always use

- Specific numbers ("six weeks", "around hour two", "eleven framed originals")
- Specific dates ("a Tuesday in February", "Sunday night in March")
- Named fictional clients (invent new names — don't reuse Aria, Wren, Marcus, Daichi if those are already used in your siblings; use names like Imogen, Tomasz, Sera, Yusra, Bran, Mei, Diego, Eitan, Nadia, Olu, Sven, Helene, Jonas, Priya, Lior, Quentin, Selene, Kestrel, Owen, Linnea, Theo)
- Real painting terminology
- Strong opinions stated plainly
- Internal links woven naturally into sentences (never "click here" — link the noun phrase)

### Never use

- The word **"pillar"** anywhere in any article copy. "Pillar" is internal team nomenclature only. Reader-facing terms are **guide**, **complete guide**, **player's guide**, **field notes**, **starter guide**, **process walkthrough**.

---

## 3. Skill chain — invoke in this order on EVERY article

1. **Before drafting**: invoke the `seo-content-brief` skill. Pass it the primary keyword + a 2-line audience note + the working title. It returns a structured outline with H2/H3 hierarchy, per-section word counts, and keyword targets. Use the outline as your scaffold.

2. **Draft the article** in markdown, in Hector G's voice, matching the target word count for this piece's type (see assignment).

3. **After draft, quality check**: invoke the `seo-content` skill on the full draft. It returns E-E-A-T scoring, AI-citation readiness flags, and thin-content warnings. Apply every fix it suggests.

4. **Final pass — humanize**: invoke the `humanizer` skill on the polished draft. It returns a list of AI-tells (em-dash overuse, banned vocabulary, rule-of-three, vague attributions, filler phrases, etc.). Apply every fix.

If a skill can't be invoked, note it in your return summary and proceed — but make a best-effort manual pass for whatever the skill would have caught.

---

## 4. Article structure (firm across all article types)

Every article — pillar, spoke, evergreen, character/campaign — follows this skeleton:

1. **Opening hook** — one strong sentence or short anecdote in Hector's voice. Curiosity-forward. Never "In this article we will discuss..."
2. **Lead paragraph** — names the audience + the specific problem this piece solves
3. **Markdown table of contents** for any article over 2000 words — bullet list linking to H2 anchors
4. **6-8 H2 sections** with H3 subsections where the structure genuinely needs them
5. **AT LEAST ONE detailed anecdote** with a named fictional client, specific dates, and a concrete outcome
6. **AT LEAST ONE pull quote** (markdown `>` blockquote) mid-article — a sentence worth lifting
7. **AT LEAST ONE bulleted list** with substantive items (not generic platitudes)
8. **AT LEAST ONE "common mistakes" / "what gets lost" / "what I sketch around" section** — show expertise by naming failure modes
9. **Closing CTA section** — 2-3 internal links woven naturally. Never sales-pitchy.

### How to handle the CTA

Hector doesn't pitch. He **invites**. The CTA section reads like a friend ending an email, not a marketer ending a funnel page:

> If you've got a [character / campaign / portrait] sitting on the back burner, the [order form] is the most efficient way to get a brief in front of me. The [portfolio] has the closest visual references for what we just talked about. Either way — the sooner you write the one-line pitch, the sooner the character ends up on the wall.

Vary the phrasing piece-to-piece. Never reuse the same closing template verbatim across articles.

---

## 5. Internal linking — the web

The user's intent is to build a **huge interconnected web** where every article naturally links 3-5 sibling articles plus services + portfolio + /order. Reader lands on any article → discovers 3 more → eventually hits /order.

### Required links (each article must include at least these)

- **/order** — anchor: "start a brief", "the order form", "send me a brief", "drop a brief"
- **/portfolio** — anchor: "the portfolio", "the gallery", "see the painted versions"
- **/services/character-work** — anchor relevant to context
- **One genre-relevant service**: `/services/tokens` (VTT), `/services/gm-world-building` (NPC packs), `/services/party-portraits`, `/services/custom-projects` (original IPs / books)

### Sibling/cross-genre links (3-5 per article)

Pick from the master article list (Section 6 below). Choose articles that naturally extend or sister your topic. Anchor text = the title's noun phrase, not the URL.

### Existing post cross-links (use when relevant)

Existing posts already published — link them when topically adjacent:

- `/blog/how-to-write-commission-brief` — for any brief-related discussion
- `/blog/choosing-a-commission-style` — for style-choice discussions
- `/blog/three-weeks-with-lyra` — for process walkthroughs
- `/blog/hero-forge-to-handpainted` — for D&D / lineage / brief discussions
- `/blog/vtt-token-deserves-more` — for VTT-related discussions
- `/blog/strahd-npc-pack-six-weeks` — for horror / NPC pack discussions
- `/blog/first-art-fair-booth` — for studio/business reflections

### Anchor text rules

- Link **noun phrases**, never "click here", "read more", "learn more"
- The anchor should describe the destination concretely
- Vary anchor text — don't link the same phrase to the same URL repeatedly across an article
- Anchor 3-5 words is ideal — not single words, not full sentences

---

## 6. Master article slug map

The full content web. Use these exact slugs in internal links. (Articles marked ✓ exist already; others are being written in parallel.)

### Genre guides (9 — primary authority pages)

- `/blog/fantasy-character-art-commission-guide` (fantasy)
- `/blog/dnd-5e-character-art-commission-guide` (dnd-5e)
- `/blog/sci-fi-character-art-commission-guide` (sci-fi)
- `/blog/cyberpunk-character-art-commission-guide` (cyberpunk)
- `/blog/horror-character-art-commission-guide` (horror)
- `/blog/modern-character-art-commission-guide` (modern)
- `/blog/historical-character-art-commission-guide` (historical)
- `/blog/anime-souls-fan-art-commission-guide` (souls-anime)
- `/blog/western-character-art-commission-guide` (western)

### Spokes — Fantasy (5)

- `/blog/how-to-brief-fantasy-character-commission`
- `/blog/painting-elves-dwarves-orcs-race-specific-cues`
- `/blog/fantasy-color-palette-faction-warmth`
- `/blog/magical-effects-character-art-glow-runes`
- `/blog/fantasy-weapon-design-references`

### Spokes — D&D 5e (4 new + 2 existing ✓)

- `/blog/dnd-class-by-class-portrait-inspiration`
- `/blog/dnd-party-portrait-commission-guide`
- `/blog/dnd-subspecies-lineage-character-art`
- `/blog/dnd-multiclass-character-art-visual-storytelling`
- ✓ `/blog/hero-forge-to-handpainted`
- ✓ `/blog/vtt-token-deserves-more`

### Spokes — Sci-fi (5)

- `/blog/sci-fi-armor-design-hardsuit-mech-softsuit`
- `/blog/painting-alien-species-humanoid-non-humanoid`
- `/blog/cyberware-vs-bioware-visual-language`
- `/blog/starfinder-character-art-guide`
- `/blog/original-sci-fi-ip-commission-worldbuilding`

### Spokes — Cyberpunk (5)

- `/blog/cyberpunk-red-character-art-tips`
- `/blog/neon-palette-painting-pink-cyan-sodium`
- `/blog/cybernetic-limb-face-design-references`
- `/blog/street-samurai-vs-netrunner-archetypes`
- `/blog/crt-scanlines-when-they-work`

### Spokes — Horror (4 new + 1 existing ✓)

- `/blog/eldritch-horror-design-tentacles-done-right`
- `/blog/body-horror-character-commissions`
- `/blog/atmosphere-effects-in-character-art`
- `/blog/investigator-portrait-call-of-cthulhu-1920s`
- ✓ `/blog/strahd-npc-pack-six-weeks`

### Spokes — Modern (4)

- `/blog/world-of-darkness-commission-guide-vampire-werewolf`
- `/blog/urban-fantasy-character-art-dresden-rivers-of-london`
- `/blog/modern-fashion-in-character-art`
- `/blog/painting-regular-person-without-fantasy-crutches`

### Spokes — Historical (5)

- `/blog/medieval-armor-reference-5-mistakes`
- `/blog/viking-era-character-art-forbidden-lands`
- `/blog/edwardian-victorian-portrait-commissions`
- `/blog/samurai-character-art-japanese-periods`
- `/blog/historical-reference-checking-period-accuracy`

### Spokes — Souls/anime (5)

- `/blog/souls-style-character-art-commission`
- `/blog/anime-style-portrait-commission-guide`
- `/blog/genshin-honkai-fan-art-commissions`
- `/blog/fan-art-ip-gray-area`
- `/blog/fan-art-vs-original-character-anime`

### Spokes — Western (4)

- `/blog/deadlands-character-art-guide`
- `/blog/western-firearms-reference-painting`
- `/blog/cowboy-fashion-across-the-eras`
- `/blog/weird-west-blending-horror-frontier`

### Game/campaign/character articles (27 — 3 per genre)

**Fantasy** (3):
- `/blog/playing-a-tiefling-lineage-paint-hooks`
- `/blog/the-elf-spectrum-high-wood-drow-sea-eladrin`
- `/blog/drizzt-do-urden-portrait-references`

**D&D 5e** (3):
- `/blog/5e-warlock-player-guide-patrons-builds-portraits`
- `/blog/5e-paladin-painted-oaths-gear-long-campaign`
- `/blog/storm-kings-thunder-npc-portrait-guide`

**Sci-fi** (3):
- `/blog/starfinder-solarian-painted-bright-soldiers`
- `/blog/lancer-at-a-glance-mech-pilots-nhps`
- `/blog/master-chief-helmeted-hero-portrait-problem`

**Cyberpunk** (3):
- `/blog/netrunner-portrait-painting-another-world`
- `/blog/cyberpunk-red-at-a-glance-roles-archetypes`
- `/blog/v-cyberpunk-2077-customizable-protagonist-portrait`

**Horror** (3):
- `/blog/strahd-von-zarovich-most-painted-vampire`
- `/blog/curse-of-strahd-npc-portrait-roadmap`
- `/blog/call-of-cthulhu-1920s-investigator-archetype`

**Modern** (3):
- `/blog/world-of-darkness-clans-visual-cheat-sheet`
- `/blog/dresden-files-portrait-guide-harry-murphy-chicago`
- `/blog/john-constantine-hellblazer-portrait`

**Historical** (3):
- `/blog/viking-portrait-helmets-braids-period-accurate`
- `/blog/samurai-portrait-kabuto-kimono-era-accurate`
- `/blog/eleanor-of-aquitaine-queen-portrait-commission`

**Souls/anime** (3):
- `/blog/malenia-blade-of-miquella-portrait-souls-bosses`
- `/blog/geralt-of-rivia-witcher-portrait-references`
- `/blog/tarnished-oc-painting-your-own-elden-ring-character`

**Western** (3):
- `/blog/deadlands-at-a-glance-huckster-mad-scientist-gunslinger`
- `/blog/man-with-no-name-western-archetype-portrait`
- `/blog/outlaw-portrait-wanted-poster-face`

### Evergreens (5)

- `/blog/character-art-commission-pricing`
- `/blog/vtt-tokens-vs-portraits-which-to-commission`
- `/blog/character-art-print-delivery-sizes-paper-framing`
- `/blog/commercial-licensing-for-commissioned-art`
- `/blog/character-art-process-sketch-color-final`

---

## 7. Fair-use commentary on copyrighted material

User has approved fair-use transformative commentary. Rules:

- **Name proper nouns freely** in commentary/criticism — Strahd von Zarovich, Malenia Blade of Miquella, V (Cyberpunk 2077), Geralt of Rivia, Drizzt Do'Urden, John Constantine, etc. This is journalism-style commentary, protected fair use.
- **Don't reproduce trademarked artwork** in our own image prompts. Image prompts always describe **original studio paintings** of characters in our style — never "in the style of Yoshitaka Amano" or "official artwork of Malenia."
- **Don't quote game text verbatim** beyond short fair-use snippets (1-2 sentences for criticism/commentary). Paraphrase mechanics and lore.
- **Always note in IP-sensitive pieces** that fan-art commissions are personal-use only, not for commercial resale. Frame this conversationally (Hector's voice), not legalistically.

---

## 8. Output requirements per article

Every article produces THREE files in its assigned folder:

### `article.md`
Pure markdown body. No frontmatter. No YAML. No JSON. Just the markdown that goes into `blog_posts.content`. Start with the opening hook H1 is NOT used — the title is in `metadata.json` and rendered by the page template. Start the body with the lead paragraph, then ToC, then H2 sections.

### `metadata.json`
Exact fields, matching the assignment's stated slug + title + tags:

```json
{
  "slug": "<exact-slug-from-assignment>",
  "title": "<final-article-title>",
  "excerpt": "<150-180 char excerpt, no marketing voice, no banned phrases>",
  "category": "<see below>",
  "tags": ["<genre-slug>", ...up to 4 more SEO-relevant tags],
  "author_name": "Hector G. · Design Vortex founder",
  "is_published": false,
  "read_time_minutes": <integer based on word count: words ÷ 220>,
  "seo_title": "<60 char max, includes primary keyword>",
  "seo_description": "<155 char max, includes primary keyword + curiosity hook>",
  "is_pillar": <true ONLY for the 9 genre guides; false for everything else>,
  "pillar_genre": "<genre-slug for is_pillar=true items; null otherwise>",
  "featured_image": null,
  "published_at": null
}
```

### Category values (use exactly these)

Pick the best fit per article:
- `Guides` — genre guides, evergreens, "how to" articles
- `Behind the scenes` — process walkthroughs, studio reflections
- `D&D` — D&D 5e-specific posts
- `Process` — sketch-to-final, technique deep-dives
- `Tutorials` — explicit step-by-step instruction
- `Studio news` — only for announcements (rare)

### `image-prompts.md`
Three image prompts using the template in `content-plan/IMAGE-STYLE-GUIDE.md`:
- Cover (16:9) with text-first composition and the genre accent
- Inline mid-article (4:5 portrait), atmospheric, no typography
- Inline close (1:1 square), detail crop, no typography

---

## 9. Return to coordinator — keep it tight

When your batch is done, return ONLY:

1. List of file paths created
2. Final word count per article
3. 2-sentence summary per article (hook + structure)
4. Any AI-tells the humanizer skill flagged that you fixed
5. Any skill that wasn't available and what you did manually instead

**DO NOT** paste the full article bodies back. The files are the deliverable.

---

## 10. End of context

This is the canonical brief. The dispatch prompt that called you will tell you which specific articles to write and where to save them. Read this file once, then execute that assignment.
