# Design Vortex — Article Image Prompt Style Guide

> ⚠️ **POSITIONING — READ FIRST:** Design Vortex is a **digital character art studio**. The artist (Hector G.) makes digital paintings on a tablet using Procreate, Photoshop, Clip Studio Paint, Krita, and Affinity Photo. The studio's differentiator is "human-painted, not AI-generated" — NOT "physical media vs digital." Image prompts can use painterly aesthetic vocabulary (visible brushwork, painterly light, editorial illustration) because that aesthetic is achievable in digital painting. AVOID explicit physical-medium imagery: oil paint tubes, brush jars, easels, sable brushes, gesso, linseed oil. If a prompt needs to show "the studio," show a digital workstation (tablet + stylus + monitor), NOT an oil-painter's bench.

Use this as the master reference when generating cover images and inline images for every blog/guide. Every image prompt in `pillars/<slug>/image-prompts.md` and `evergreen/<slug>.md` follows the conventions below. Feed these prompts into Midjourney, Imagen, Flux, or Stable Diffusion — they're designed to be model-agnostic.

---

## The North Star

Brand aesthetic: **"The Cartographer's Hand"** — scholarly-fantasy, illuminated medieval manuscripts, candlelit study. NOT goth, NOT grimdark, NOT generic D&D kitsch. Editorial gravitas. The painted artwork can breathe. Penguin Classics fantasy line + a candlelit study.

**Important:** the aesthetic is "painterly digital illustration." Visible brushwork is fine in a prompt (it describes a *look*, not a medium). What's NOT fine is depicting traditional-medium imagery as if it were the studio's actual workspace.

Reader behaviour goal: **stop the scroll, generate curiosity.** Cover images should make a reader ask one question that the article answers. Think long-form editorial covers (Atlantic, NYT Magazine), not stock blog headers.

---

## Three image slots per article

Every article delivers three image prompts:

| Slot | Aspect | Use | Energy |
|---|---|---|---|
| **Cover (hero)** | 16:9 (1920×1080) | Top of article, blog index card, OG share image | YouTube-thumbnail curiosity — bold typography + painted subject peeking from behind |
| **Inline mid-article** | 4:5 portrait (1080×1350) | After H2 #3 or #4, breaks the wall of text | Painted character or scene, NO typography overlay, atmospheric |
| **Inline close** | Square 1:1 (1080×1080) | Before final CTA, reinforces the visual identity | Detail crop — hands gripping a sword, eyes catching candlelight, a small object on a desk |

---

## Cover image specification

The cover is text-first. It works at 1920×1080 down to a 280×280 thumbnail.

### Required composition

- **One bold word or short phrase** taking up 35-50% of the canvas, set in **Cinzel** (the brand display font), weight 600-700. The word is the curiosity hook from the article title. Example: for the D&D 5e guide, the word is **"PORTRAIT"** or **"GOLD"** or **"PARTY"** — not the full title.
- **A painted subject** (character, hand, candle, sword, scroll) **half-occluded by the text** — the character peeks from behind a letter, or the typography is set INSIDE a painted scene. Never plain text on a flat background.
- **A small kicker line** above or below the bold word, set in **Inter** uppercase 600 with 0.15em letter-spacing, in `#B23A2A` (Crimson) — one short line, e.g. "A PLAYER'S GUIDE" or "BEFORE YOU COMMISSION".
- **A 60×3px gold accent line** under the kicker, color `#D4A24C`.

### Required palette (use exact hex values)

```
Parchment    #F4ECD8   page tone — warm not white
Ink          #16110D   primary text, deep dramatic shadow
Gold         #D4A24C   accent lines, candlelight, gilded letters
Crimson      #B23A2A   kicker text, illuminated red ink
Indigo       #2C3E5C   tertiary accent (use ONCE per piece if at all)
Cream        #FAF4E2   subtle background variation
```

Cover backgrounds are either **Ink-dark** (a tavern at midnight, the candlelit study at night) OR **Parchment-warm** (a page from a manuscript, morning light). Pick one per piece.

### Required typography rules

- Headline = Cinzel, never sans-serif on the cover
- Kicker = Inter uppercase
- Body labels (if any) = Inter regular
- NO blackletter / Old English. NO script fonts. NO comic-style display fonts.
- Letter-spacing on the bold word: -0.015em (tight)

### Composition energy

The cover should look like:
- A **frame from a film**, not a stock photo
- The painted element is rendered in oil-painting style with **visible brushwork** — soft edges, warm rim light from a candle, deep shadows on the opposite side
- The text is **integrated into the scene** — gold leaf on parchment, illuminated initial, candlelit inscription — never floating in white space
- **Slight asymmetric composition** — the eye keeps scanning, the hook word sits off-center

### Curiosity hook patterns (pick one per piece)

1. **The half-reveal**: subject partially behind text, you can't see all of them
2. **The detail crop**: a hand, an eye, a candle flame, a single object — implies a bigger scene
3. **The "wait, what?"**: an unexpected pairing (a paladin's helm next to a teapot, a sword on a Persian rug)
4. **The before-after split**: left half rough sketch / right half painted — visually demonstrates the article's thesis
5. **The illuminated letter**: the article's first letter rendered as a giant illuminated capital with the painted subject inside the letter form

### Anti-patterns — never include

- ❌ Pure black `#000` or pure white `#FFF`
- ❌ Faux-parchment textures, weathered scroll borders, wax seals
- ❌ Skulls, ornate scrollwork, heraldic shields, dragon ornaments as decorative elements
- ❌ Blackletter / Old English typography
- ❌ AI-cliché "epic fantasy" lighting — purple-and-orange dual rim light, lens flares, magical particles everywhere
- ❌ Stock fantasy character poses (sword raised to the sky, looking heroically into the distance)
- ❌ Text outlined or shadowed with cheap drop shadows — typography sits ON the parchment, integrated
- ❌ Generic D&D iconography (d20 dice, dungeon doors) unless the article is literally about that
- ❌ Emoji or modern UI elements
- ❌ Stable-diffusion "fantasy painting" defaults — over-rendered armor, beauty-filtered faces, sparkles

---

## Inline image prompts

Inline images are quieter. No typography. They serve the article's reading flow.

### Mid-article (4:5 portrait)

- A painted character or scene
- Same palette, same brushwork style
- Composition serves the section it sits next to — if H2 is about "Class-by-class portraits," show a single class portrait
- Center subject, breathing room
- Atmospheric — single light source, deep shadow, painterly

### Close (1:1 square)

- A detail. Not the whole character. Just hands on a hilt, or eyes catching light, or a single illuminated initial on a desk
- Strong negative space — let one element dominate
- This is the image that sits before the final CTA, so it should feel like a **closing chord**, not a flourish

---

## Prompt template (use for every image)

Each `image-prompts.md` file uses this structure so the user can copy-paste into any model:

```
### Cover image (16:9, 1920×1080)

Subject:        [what the painted element is]
Typography:     [the bold word/phrase, font Cinzel 700, color, placement]
Kicker line:    [the uppercase Inter line above/below, in Crimson #B23A2A]
Background:     [Ink dark OR Parchment warm — describe the setting]
Palette:        Parchment #F4ECD8, Ink #16110D, Gold #D4A24C, Crimson #B23A2A
Composition:    [where the text sits, where the painted element sits, how they interact]
Lighting:       [single source, warm/cool, where it falls]
Mood:           [one line — e.g. "candlelit study at 2am, the painter has been working for hours"]
Style:          painterly digital illustration with visible brushwork, soft edges, Frazetta + Klimt + medieval illumination
Negative:       no oil paint tubes, no brush jars, no easels (the studio is digital), no skulls, no wax seals, no blackletter, no AI-cliché purple-orange lighting, no dragons unless specified, no lens flares, no sparkles, no stock fantasy poses
```

---

## Per-genre palette accents

Each of the 9 genres gets ONE accent flourish that signals the genre without breaking the brand palette. Apply to the cover only.

| Genre | Accent | Where it lives in the cover |
|---|---|---|
| Fantasy | Gold leaf border ornament, soft glow | Top-left corner illuminated initial |
| D&D 5e | Faint d20 silhouette in the negative space | Behind/inside one of the letters |
| Sci-fi | A thin cyan circuit-line in the gold | One letter has the circuit etched into its serif |
| Cyberpunk | A single neon-pink (`#FF2D9C`) rim light | On the character's profile only, breaks the palette intentionally |
| Horror | The text is fraying / partially dissolved at the edges | One letter has a tendril of smoke trailing off |
| Modern | A streetlight sodium-yellow glow | Behind the painted figure |
| Historical | An aged-paper warm spotting / foxing | Around the text, like an old book |
| Souls & anime | Cell-shaded line + a small katana-grip wrap pattern | One letter has a tassel hanging from its descender |
| Western | A dust-mote light shaft | Cuts diagonally across the cover, behind the typography |

---

## The "did this prompt fail?" test

Before you generate or accept a cover, ask:

1. **If I crop this to a 280×280 thumbnail, is the bold word still legible?** If no → enlarge or reduce typography weight.
2. **Could this image be on the cover of an Atlantic feature?** If it screams "stock fantasy blog header," kill it.
3. **Does the painted element have visible brushwork?** If it looks like a 3D render or photobash, push the prompt toward "oil painting, visible brush marks, hand-painted texture."
4. **Is the kicker actually short?** Three to five words max. If it's a sentence, cut.
5. **Does the cover make me ask a question?** If a reader scrolls past without slowing, the curiosity hook failed.

---

## File structure

Every article folder has:

```
pillars/
  01-dnd-5e/
    article.md            ← the article body (markdown, goes into blog_posts.content)
    image-prompts.md      ← the three image prompts (cover + 2 inline)
    metadata.json         ← seo_title, seo_description, excerpt, tags, slug, category
```

The image-prompts.md is a reference asset — the user generates images outside this codebase using a model of their choice and uploads the result to `/public/images/blog/<slug>-cover.jpg` etc, then sets the `featured_image` column on the row.

---

## End of style guide

This file is the canonical reference. When in doubt, re-read the "Cartographer's Hand" lead and check the anti-pattern list before generating.
