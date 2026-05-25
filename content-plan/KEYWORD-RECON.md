# Design Vortex — Free-Tool Keyword Recon

**Date:** 2026-05-25
**Sources used:** Google autocomplete (`suggestqueries.google.com`), Bing autocomplete (`api.bing.com/osjson.aspx`), DuckDuckGo autocomplete (`duckduckgo.com/ac`).
**Sources attempted but failed:** Reddit search (blocked by Claude Code WebFetch — both `www.reddit.com` and `old.reddit.com`, plus `reddit.com/search.json`). Google SERP "People Also Ask" boxes (not surfacing through WebFetch — likely DOM stripped). AnswerThePublic and Google Trends were not attempted after Google PAA returned NONE on every probe.
**Volume note:** No paid keyword volume data is available. All difficulty estimates are directional — based on (a) richness of autocomplete depth, (b) presence of high-CPC commercial intent terms, (c) competition from incumbents like ArtStation, Etsy, Fiverr. Treat as ranked priorities, not absolute numbers.

---

## Genre Topics

### 1. Fantasy — `fantasy character art commission`

- **Primary:** fantasy character art commission
- **Secondary:** rpg character art commission, fantasy character portrait commission, custom character portrait commission, fantasy rpg character portraits, commission portrait artist website
- **Verbatim user queries:**
  - "fantasy character art commission" (Google AC)
  - "rpg character art commission" (Google AC)
  - "character art commission prices" (Google AC, repeated across queries)
  - "how much should i charge for art commissions" (Google AC)
  - "what is fantasy in art" (Google AC — informational sibling)
- **Difficulty:** Moderate. High-intent commercial term but ArtStation/Etsy/Fiverr dominate generic head terms; long-tail is winnable.
- **Intent:** Commercial (mid-funnel buyer comparison).

### 2. D&D 5e — `D&D character art commission`

- **Primary:** dnd character art commission
- **Secondary:** dnd character art commission prices, dnd character portrait commission, dungeons and dragons character art commissions, dnd party art commission, commission dnd character art
- **Verbatim user queries:**
  - "dnd character art commission no ai" (Google AC — strong differentiator signal)
  - "dnd character art commission reddit" (Google AC — review-seeking intent)
  - "dnd character art commission prices" (Google AC)
  - "dnd character art creator commission" (Bing AC)
  - "custom dungeons and dragons figure commission" (Bing AC — adjacent print/physical intent)
- **Difficulty:** Moderate-to-high on head term; very winnable on "no ai" and "prices" qualifiers. "No AI" is the strongest competitive wedge surfaced in the entire recon.
- **Intent:** Commercial / transactional.

### 3. Sci-Fi — `sci-fi character commission` (Starfinder, Lancer, Mothership)

- **Primary:** sci fi character art commission
- **Secondary:** starfinder character art, lancer rpg character art, mothership rpg character art, starfinder character portraits, starfinder 2e character art
- **Verbatim user queries:**
  - "sci-fi character art commission" (Google AC — bare head term, no long-tail returned)
  - "starfinder character portraits" (Google AC)
  - "starfinder android character art" (Google AC — race/species qualifier)
  - "lancer rpg character portraits" (Google AC)
  - "mothership rpg concept art" (Google AC)
- **Difficulty:** Low. Autocomplete depth is shallow across all three systems — opportunity for a category-defining page bundle.
- **Intent:** Commercial (head term) + informational (system-name queries).

### 4. Cyberpunk — `cyberpunk character art commission` (Cyberpunk RED, Shadowrun)

- **Primary:** cyberpunk character art commission
- **Secondary:** cyberpunk red character art, cyberpunk red character creator, shadowrun character portrait, cyberpunk red character designer, cyberpunk red concept art
- **Verbatim user queries:**
  - "cyberpunk character art commission" (Google AC)
  - "cyberpunk red making a character" (Bing AC — strong session/player intent)
  - "cyberpunk red character creator online" (Bing AC)
  - "cyberpunk red character builder" (Bing AC)
  - "shadowrun character portrait" (Bing AC — Shadowrun has thin commercial autocomplete)
- **Difficulty:** Low-to-moderate. Cyberpunk RED has growing search interest; Shadowrun is a stagnant niche but loyal.
- **Intent:** Commercial (head term) + informational (system-related).

### 5. Horror — `horror character art commission` (Call of Cthulhu, Strahd)

- **Primary:** call of cthulhu character art
- **Secondary:** horror character concept art, 1920s call of cthulhu character art, call of cthulhu investigator art, call of cthulhu female character art, curse of strahd character art
- **Verbatim user queries:**
  - "call of cthulhu character art generator" (Google AC — AI competitor signal)
  - "call of cthulhu investigator art" (Google AC)
  - "1920s call of cthulhu character art" (Google AC — period/era qualifier)
  - "curse of strahd character portraits" (Google AC)
  - "curse of strahd character ideas" (Bing AC — pre-commission research)
- **Difficulty:** Low. Niche but underserved. "Horror character art commission" head term has nearly empty autocomplete — wide open.
- **Intent:** Commercial (commission) + informational (system art lookup).

### 6. Modern — `modern character art commission` (World of Darkness, urban fantasy)

- **Primary:** vampire the masquerade character art
- **Secondary:** world of darkness character art, world of darkness character portraits, vampire the masquerade character creator, urban fantasy character art, world of darkness concept art
- **Verbatim user queries:**
  - "vampire the masquerade character art" (Bing AC)
  - "vampire the masquerade character creation" (Bing AC)
  - "vampire the masquerade character concepts" (Bing AC — pre-commission ideation)
  - "world of darkness character portraits" (Google AC)
  - "urban fantasy concept art" (Google AC)
- **Difficulty:** Low. World of Darkness has a small but high-spend audience; Vampire 5e renaissance gives this category lift.
- **Intent:** Commercial / informational mixed; lots of pre-purchase ideation queries.

### 7. Historical — `historical character art commission` (medieval, viking, samurai)

- **Primary:** medieval character art commission *(directional — no autocomplete depth on any historical term)*
- **Secondary:** samurai character art, viking character art, samurai art commission, medieval portrait commission, historical character portrait
- **Verbatim user queries:**
  - "samurai character art commission" (Google AC — only the head term, no long-tail)
  - "viking character art commission" (Google AC — empty long-tail)
  - "samurai art commission" (DuckDuckGo AC)
  - "medieval character art commission" (Bing AC — empty long-tail)
  - "viking character commission" (Bing AC — only the head term)
- **Difficulty:** Low autocomplete signal across all three sub-genres. Either genuinely thin demand or queries are being routed to Etsy/Reddit directly. Recommend testing with a single pillar page before investing in sub-pages.
- **Intent:** Commercial — but uncertain volume. **Confidence: LOW.**

### 8. Souls / Anime — `anime style commission`, `elden ring fan art commission`

- **Primary:** anime style commission
- **Secondary:** manga style commission, anime style art commissions, anime portrait commission, elden ring fan art, elden ring oc art
- **Verbatim user queries:**
  - "anime style commission" (Google AC)
  - "manga style commission" (Google AC)
  - "90s anime style commission" (Google AC — strong nostalgia niche)
  - "80s anime style commission" (Google AC — strong nostalgia niche)
  - "elden ring oc art" (Bing AC — "OC" = original character, exactly our buyer)
- **Difficulty:** Moderate. "Anime commission" is competitive and price-eroded by VGen/Skeb/Picarto; nostalgic era qualifiers (80s/90s anime style) and "Elden Ring OC" are the wedge.
- **Intent:** Commercial / transactional.

### 9. Western — `western character art commission` (Deadlands, weird west)

- **Primary:** deadlands character art
- **Secondary:** weird west character art, weird west character portraits, deadlands character builder, oxventure deadlands character art, weird west concept art
- **Verbatim user queries:**
  - "deadlands character art" (Google AC)
  - "oxventure deadlands character art" (Google AC — content-creator influence signal)
  - "deadlands character classes" (Google AC)
  - "weird west character portraits" (Google AC)
  - "deadlands classic character creation" (Bing AC)
- **Difficulty:** Low. Genuinely niche. Single pillar page should rank quickly; not enough demand to support a multi-page sub-cluster.
- **Intent:** Mostly informational (system queries) with a thin commercial layer.

---

## Evergreen Topics

### A. Character art commission pricing

- **Primary:** character art commission prices
- **Secondary:** how much should i charge for art commissions, how much is commission art, concept art commission prices, dnd art commission prices, how to price art commissions
- **Verbatim user queries:**
  - "character art commission prices" (Google AC — appears across multiple unrelated probes, very strong signal)
  - "concept art commission prices" (Google AC)
  - "how much should i charge for art commissions" (Google AC — artist-side query, but useful for cost transparency content)
  - "how much is commission art" (Google AC)
  - "how much does it cost to commission character art" (Google AC)
- **Difficulty:** Moderate. Mostly artist-side ("how to charge") content rules SERPs — gap is buyer-side ("what should I expect to pay") content.
- **Intent:** Commercial / informational pre-purchase research.

### B. VTT tokens vs portraits commission

- **Primary:** vtt token commission
- **Secondary:** foundry vtt token art, roll20 token commission, how to make vtt tokens, free vtt token maker, foundry vtt change token artwork
- **Verbatim user queries:**
  - "foundry vtt token variant art" (Google AC)
  - "foundry vtt change token artwork" (Google AC)
  - "foundry vtt pf2e token art" (Google AC — system-specific)
  - "how to make vtt tokens" (Bing AC)
  - "free vtt token maker" (Bing AC — competitor "free" wedge to address head-on)
- **Difficulty:** Low. "Token vs portrait" as a comparison framing is essentially absent in autocomplete — content gap. Roll20/Foundry-specific queries are easy to capture.
- **Intent:** Informational (mostly DIY-seeking) with a buyer-conversion opportunity.

### C. Commission art print delivery (sizes, paper, framing)

- **Primary:** fine art print sizes
- **Secondary:** what paper for art prints, what gsm paper for art prints, archival paper for art prints, giclee print on paper, standard art print sizes
- **Verbatim user queries:**
  - "what gsm paper for art prints" (Google AC)
  - "what is archival paper for art prints" (Google AC)
  - "what paper to use for art prints reddit" (Google AC — review-seeking)
  - "what are standard sizes for art prints" (Bing AC)
  - "is it worth buying a giclee print" (Google AC — purchase justification)
- **Difficulty:** Moderate. Print/framing sites (Fine Art America, Saatchi) dominate. Differentiate via "commissioned art print" angle rather than competing on generic "art print" terms.
- **Intent:** Informational pre-purchase + transactional.

### D. Commercial licensing for commissioned art

- **Primary:** art commission commercial use
- **Secondary:** art commission commercial use price, licensing artwork for commercial use, commercial license for images, do i own commissioned art, can i post commissioned art
- **Verbatim user queries:**
  - "art commission commercial use" (Bing AC)
  - "art commission commercial use price" (Bing AC — exactly maps to a pricing page)
  - "can i post commissioned art" (Bing AC — sharing rights, very common confusion)
  - "do i own commissioned art" (Bing AC)
  - "is it legal to commission fanart" (Google AC — IP question; aligns with our IP-derivative policy)
- **Difficulty:** Low-to-moderate. Mostly law firm blog content; specialty studio offering plain-English licensing breakdowns has clear lane.
- **Intent:** Informational + commercial (license-pricing page intent).

### E. Character art commission process (sketch / color / final)

- **Primary:** art commission process
- **Secondary:** digital art commission process, artist commission process, how long do art commissions take, art commission sketch color final, art commission sheet template
- **Verbatim user queries:**
  - "art commission process reddit" (Google AC — peer-review intent)
  - "how long do art commissions take" (Google AC — timeline anxiety query)
  - "how long does an art commission take" (Google AC — variant)
  - "art commission sketch color final" (Bing AC — matches our 3-stage process)
  - "how does art commission work" (Bing AC)
- **Difficulty:** Low. Process-explainer content is heavily artist-blog dominated; few clean buyer-facing walkthroughs.
- **Intent:** Informational, top-of-funnel — strong "trust-builder" content for new commissioners.

---

## Coverage notes / data caveats

- **Reddit was 100% blocked** by WebFetch on all three URL patterns tried. The 3-5 verbatim queries per topic are pulled from autocomplete (Google + Bing + DuckDuckGo) rather than Reddit thread titles. Autocomplete reflects actual user typing behavior, so the verbatim queries are real — but they skew toward shorter, less narrative phrasing than Reddit post titles would.
- **Google PAA didn't render** through WebFetch (Google likely returns a JS-only SERP to non-browser clients). PAA would have added 2-4 question-form keywords per topic.
- **Historical (Topic 7) signal is weakest.** Three different historical sub-genre probes returned empty long-tails on both Google and Bing. Either real demand is low, or users phrase these very differently (e.g., "portrait of my OC as a samurai"). Recommend low investment until validated.
- **"No AI" emerged organically** as a Google autocomplete suggestion for the D&D head term — the single strongest positioning differentiator surfaced. Reuse across all genre pages.
- **"Reddit" appears as autocomplete suffix** on multiple queries ("dnd character art commission reddit", "art commission process reddit", "what paper to use for art prints reddit") — users explicitly want peer reviews. Implies trust signals (testimonials, named-client work) matter heavily for conversion.
