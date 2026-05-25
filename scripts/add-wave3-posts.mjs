/**
 * Appends Wave 3a SEO blog posts to blog-snapshot.json.
 * Run once: node scripts/add-wave3-posts.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const snapshotPath = resolve(__dirname, 'blog-snapshot.json')

const existing = JSON.parse(readFileSync(snapshotPath, 'utf-8'))

const newPosts = [
  {
    slug: 'dnd-character-art-commission-prices-2026',
    title: 'D&D Character Art Commission Prices 2026 — Real Studio Guide',
    category: 'Guides',
    date: '2026-05-26',
    dateLabel: 'May 26, 2026',
    readMin: 9,
    excerpt: "Real prices for D&D character art commissions in 2026 — bust from $60, full body from $120, party portraits, NPC packs. From a studio that's been doing this since 2024.",
    seoTitle: 'D&D Character Art Commission Prices 2026 | Real Studio Guide',
    seoDescription: "Real pricing for D&D character art commissions in 2026 — bust from $60, full body from $120, party portraits, NPC packs. From a studio that's been doing this since 2024.",
    body: `I've been fielding the same question almost every week since I opened commissions: *"How much does D&D character art actually cost?"* And every time, I watch people wade through a swamp of outdated Reddit threads, affiliate sites with no actual price data, and AI-generated "commission guides" written by people who have never held a stylus. So here's the straightforward version — real prices, real turnaround times, from a studio that has been doing this since 2024. No guessing, no padding, no upsell disguised as a guide.

## Why D&D Commission Prices Are All Over the Place

The short answer is that "character art" covers an enormous range of skill levels, tools, and time investment. A hobbyist on their third month of digital painting and a professional illustrator with a decade of experience are both listed under the same search results. That's genuinely confusing if you don't know what to look for.

Then there's the AI problem. There are shops — some with slick websites and fast turnarounds — charging $5 to $20 for "hand-painted" portraits that are a Midjourney output with a color grade slapped on top. **Those aren't commissions. They're printouts.** And they're dragging down price expectations for everyone doing actual work.

Hand-painted digital art takes time. A solid bust portrait, done properly with real line work, color theory, lighting passes, and texture work, takes me between 4 and 8 focused hours depending on complexity. A full-body piece with detailed armor can push 15 to 20 hours. When you see a "full character" for $15, someone is either using AI, rushing so badly the work shows it, or losing money. None of those outcomes are good for you as the client.

> The price you pay for a commission reflects the hours of human skill behind it. If the math doesn't work out, the art isn't what it claims to be.

## Commission Types and What They Cost

Here's the current price list for [Design Vortex character work](/services/character-work). These are the numbers I actually charge — not ranges pulled from a survey.

| Commission Type | Price Range | Turnaround |
|---|---|---|
| Character bust portrait | $60–$80 | 5–10 days |
| Half-body character art | $90–$120 | 7–14 days |
| Full-body character art | $120–$180 | 7–14 days |
| Reference sheet (character + expressions + outfits) | $250–$450 | Custom |
| VTT token (single) | $40–$60 | 5–10 days |
| VTT token pack (5) | $180 | 5–10 days |
| NPC pack of 5 | $220 ($44 each) | Custom |
| NPC pack of 10 | $400 ($40 each) | Custom |
| Party portrait (group scene) | $80–$120 per character | 14–21 days |

The full breakdown with add-ons lives on the [pricing page](/pricing). But this table covers the majority of what people actually order.

A few things worth noting. The reference sheet range is wide — $250 is a fairly simple character with clean outfits, while $450 is a complex character with layered armor, multiple expression variants, and outfit swaps. I'll always give you a fixed quote before you commit. The party portrait is priced per character in the scene because the composition, lighting, and interaction effects scale with the headcount in ways that aren't linear.

## What Makes a Commission More Expensive

Not every character is the same amount of work. Here's what actually moves the needle on price.

**Armor and mechanical complexity.** A wizard in robes is genuinely faster to paint than a paladin in full plate with custom heraldry. Each pauldron, visor, and layered metal piece requires separate rendering passes. I don't charge for this arbitrarily — it's a real time difference of several hours on a detailed armored build.

**Number of characters in one piece.** Anything beyond a single character involves additional composition planning, consistent lighting across multiple subjects, and significantly more rendering time. Party portraits are priced per character for exactly this reason.

**Background inclusion.** Most of the base prices on my [services page](/services/character-work) assume a simple gradient or atmospheric background. A full illustrated environment — a tavern, a dungeon chamber, a battlefield — is a separate scope of work and will be quoted accordingly.

**Rush delivery.** My standard turnarounds are listed above. If you need something faster, I can sometimes accommodate it, but that costs extra because it means pushing other client work. I'm upfront about this at the quote stage. **I won't promise a rush I can't deliver.**

**Commercial licensing.** If you're using the art for a published product — a TTRPG supplement, a Kickstarter campaign, a commercial video game — the commercial licensing add-on is **+40% of the base price**. Personal use (your own character, VTT avatar, printing for yourself) is included in the standard rate. If you're unsure whether your use case qualifies, the [FAQ](/faq) covers this in detail, or just ask when you submit your brief.

## What You Actually Get

I want to be specific here because "what's included" varies enormously between studios and it matters when you're comparing prices.

Every commission at Design Vortex includes **4K resolution final files** in PNG format, suitable for print, VTT use, or high-resolution display. You're not getting a web-resolution JPEG. If you ever need to reprint or resize, the file holds up.

Revisions are included. The number depends on the tier, but the goal is always that you're happy with the final piece — not that I hit a revision limit and call it done. I do a sketch approval stage before moving to full color, so major changes can be caught early when they're easy to fix rather than late when they're expensive to redo.

**Process updates** are part of the workflow. You'll see the sketch, you'll see the color rough, and you'll see the final before I send the high-res file. This isn't just a courtesy — it's a practical checkpoint system that protects both of us. Clients who see the work in stages end up much happier with the final result because surprises are essentially eliminated.

The payment structure is a **30% deposit upfront** to hold your spot and cover the sketch phase, with the remaining **70% due on delivery** after you've approved the final. You never pay the full amount before you've seen the finished work.

## Red Flags: When the Price Looks Too Good

There are specific patterns worth knowing, because I've seen clients come to me after being burned.

**No portfolio or a very thin one.** Any studio doing legitimate commission work for more than a few months should have a substantial body of completed work they can show you. If the portfolio is three pieces or is suspiciously uniform in style, be cautious. You can browse the [Design Vortex portfolio](/portfolio) and see the actual range and consistency of finished work.

**AI-generated art sold as hand-painted.** There are tells: identical texture patterns across different pieces, hands and fingers that don't quite work anatomically, text in the image that dissolves into nonsense, or a general smoothness that looks rendered rather than painted. **Ask the artist directly if the work is 100% hand-made.** A legitimate artist will say yes without hesitation.

**No deposit policy.** Reputable studios take a deposit. It protects the artist's time and signals that the client is serious. A studio that takes zero upfront and promises to start immediately is either very new, has no queue, or is in a model that doesn't involve much actual time per piece.

**No revisions offered.** If a shop delivers the art and considers the transaction complete regardless of whether you're satisfied, that's a red flag. Revisions are standard in professional commission work.

> Fast, cheap, and hand-painted are three things that don't coexist. Pick two and ask yourself which two this studio is actually offering.

## The Subscription Option

For DMs running ongoing campaigns or players building out a world over time, I offer monthly subscription tiers rather than one-off commissions.

The **Companion plan** is $75/month and covers regular personal use — character updates, session recaps, ongoing creative work. The **GM plan** is $150/month for game masters managing NPC rosters, location art, and world-building assets at higher volume.

Both plans require a **6-month minimum** because the economics only work if I can plan my capacity around it. If you're running a long campaign and expect to need consistent art, the per-piece savings are significant. The [pricing page](/pricing) has the full scope of what each tier covers.

## How the Quote Process Works

You submit a brief through the [order page](/order). The brief asks for your character concept, reference images if you have them, the commission type you're interested in, and any specific requirements around timeline or usage. It takes about five minutes to fill out well, and the more detail you include upfront, the more accurate the quote.

I review briefs and respond with a quote within **48 hours**, usually faster. The quote is fixed — it doesn't change unless your brief changes. Once you approve the quote, you pay the 30% deposit and I add you to the active queue.

**There's no obligation when you submit a brief.** Getting a quote costs nothing. If the number doesn't work for your budget, that's fine — I'd rather you know upfront than feel stuck after paying a deposit.

---

The [full price list is on the pricing page](/pricing) if you want all the numbers in one place. If you're ready to talk about your character, the [order page](/order) is where to start.`,
    authorName: 'Hector G. · Design Vortex founder',
    gradient: 'from-amber-900 via-yellow-700 to-gold-600',
    tags: ['pricing', 'commissions', 'guide', 'dnd-5e'],
  },

  {
    slug: 'best-gifts-for-dnd-players-2026',
    title: 'Best Gifts for D&D Players in 2026 — From Someone Who Makes Them',
    category: 'Guides',
    date: '2026-05-25',
    dateLabel: 'May 25, 2026',
    readMin: 8,
    excerpt: "After 200+ commissions for D&D players, here's what actually makes them light up — and what's just filler with a dragon on it.",
    seoTitle: 'Best Gifts for D&D Players 2026 | Custom Character Art & More',
    seoDescription: "Looking for the perfect D&D gift? A custom character portrait hits different. Plus 5 other genuinely useful gifts from someone who makes them for a living.",
    body: `After 200+ commissions, I know what actually makes a D&D player react. Not a polite "oh, thank you" reaction — the kind where they go quiet for a second, or send you a message three days later that says more than you expected. Most of the gifts on those "best D&D gifts" lists are fine. Perfectly acceptable. One thing, though, consistently hits different. Here's my honest take on what to buy, what to skip, and why custom character art keeps showing up as the thing people remember.

## The Gift That Actually Lands: Custom Character Art

Here's what you need to understand about a D&D character. That person has probably been playing them for one, two, maybe five years. They've made decisions for that character under pressure, mourned their failures, celebrated their victories. The character lives in a shared imagination — their own mental image, the DM's description, maybe a rough sketch on a character sheet.

**Seeing that character painted, properly rendered, for the first time — it hits like seeing a favourite book character finally get the movie casting exactly right.** Except more personal. Because no one else in the world has this character.

I've had people tear up at conventions. I've had players message me after the reveal saying it was the best gift they'd ever received. That's not marketing copy — that's just what happens when you give someone something that says "I took the time to understand what matters to you."

> A character portrait isn't just art. It's proof that someone paid attention.

A single character portrait starts at a straightforward price point — you can [check current pricing here](/pricing) — and it scales up if you want to add party members, backgrounds, or extra detail passes. For most gift budgets, a standard [character commission](/services/character-work) lands squarely in "genuinely impressive" territory without being excessive.

## How to Commission Art as a Surprise Gift

The most common worry I hear: "I don't know enough about their character to commission it."

You know more than you think. And for the rest, there's an easy approach.

**Frame it as curiosity.** Say something like "I've been wanting to understand your D&D character better — can you show me some reference images or describe what they look like?" Most players are delighted someone asked. They'll overshare. Let them. Every detail they give you is briefing material.

If you want to go completely reference-free for the surprise, I also offer **open brief options** — you buy the commission slot, and the recipient fills in their character details themselves at a time that suits them. They still get the excitement of the reveal, plus full control over the brief. It's a good middle path when you genuinely can't get the information without spoiling it.

On timing: **order at least 3–4 weeks before the date.** My standard turnaround is 2–3 weeks, and I'd rather have buffer for revisions than be rushing toward a birthday. Party portraits — multiple characters in one piece — need a bit more lead time, so reach out through the [order page](/order) early if that's the direction you're going.

For the reveal itself: printing the final file and framing it is a great move. A digital file on a phone screen is fine; a framed print on a table at a birthday dinner is memorable.

## 5 Other Genuinely Good D&D Gifts

If custom art isn't in the budget right now, or you want to pair it with something physical, here are five things that actually get used.

**A quality set of dice.** Not novelty dice. A real set from Chessex, Kraken Dice, or DNDICE — these are the brands players actually know and want. A matching full set in a colour that fits their character or aesthetic shows you did a little research. Expect to spend $15–$40 for something they'll keep.

**A campaign journal or quality notebook.** Session notes, character backstory drafts, loot lists, NPC names they'll forget — D&D players write things down constantly. A well-made notebook (Leuchtturm1917 or Moleskine work; there are D&D-specific ones too) gets genuine use every session.

**A DM screen, if they run games.** Dungeon Masters use these constantly — it hides their rolls and keeps reference tables in view. This one requires knowing whether your person DMs or plays; if you're not sure, ask.

**A D&D Beyond subscription.** This is the official digital platform most players use to manage character sheets, access rulebooks, and roll dice online. A gift subscription is legitimately useful and easy to send digitally.

**A Hero Forge miniature.** Hero Forge lets you build a custom 3D miniature of a character using an online designer. If your person is into physical minis at the table, this pairs incredibly well with a character portrait — same character, two different artistic renderings.

## What Not to Buy

I'll be blunt: the "I can't fix stupid but I can roll for it" mug tells someone you Googled "D&D gift" and bought the first result. Same with generic d20 coasters, novelty "nat 20" socks, and anything that has a dragon on it and no other connection to what they actually play.

**The tell is specificity.** A gift that could be for any D&D player says you didn't really think about them. A gift tied to their character, their campaign, or the way they specifically play the game says the opposite.

If you're unsure what they play beyond "D&D," ask. "What's your campaign like right now?" is a totally normal question and the answer will point you in the right direction.

## Gifts for Dungeon Masters Specifically

What a DM wants is genuinely different from what a player wants. Players are invested in their own character. DMs are invested in everyone else's.

**The most underrated gift for a DM: NPC art.** A DM who runs a long campaign will have 10, 20, 30 recurring non-player characters living only in their head and in rough notes. Commissioning portraits of two or three key NPCs — a villain, a beloved merchant, a mysterious patron — gives them visual assets they can show players at the table. It changes the game. Literally.

I offer [NPC portrait packs](/services/gm-world-building) specifically because of how often DMs use them. A pack of three or four NPC portraits makes a genuinely powerful gift for a DM who runs a home campaign.

The other thing DMs love: **a party portrait of their players' characters.** They built the world. They watched those characters grow. A single image of the whole party, rendered properly, is something most DMs never think to ask for — which is exactly why it lands so well as a surprise. [Party work is a separate service](/services/party-work) with its own brief process; take a look if your DM has a group of 3–5 players.

## Frequently Asked Questions

### When should I order?

Three to four weeks before the date is the comfortable window. If you're ordering a party portrait with multiple characters, give it five to six weeks. The earlier you come to me, the better the result.

### What if I don't know what their character looks like?

Start with a casual conversation. Ask them to tell you about their character, or if they have any art or references they like. Players are almost never suspicious when someone shows genuine interest — they're usually thrilled. If you truly can't risk the conversation, the open brief route lets them fill in the details themselves after the reveal.

### What if they don't like it?

Every commission includes **two revision rounds**, and I take the brief seriously before I ever put brush to canvas. In practice, unhappy clients are rare — the revision process exists to fine-tune, not to redo from scratch. If we're genuinely not hitting the mark, we figure it out.

---

If you're buying for someone who has poured real time and love into a character, commissioning art for them is the move. It's not the cheapest option on this list. It is the one they'll still have on their wall in ten years.

You can [start an order here](/order) — the brief form walks you through everything, and if you have questions before committing, just reach out. I'm happy to talk through what would work best for your specific person and budget.`,
    authorName: 'Hector G. · Design Vortex founder',
    gradient: 'from-purple-900 via-violet-700 to-rose-800',
    tags: ['gifts', 'commissioning', 'dnd-5e', 'guide'],
  },

  {
    slug: 'how-to-commission-dnd-character-art',
    title: 'How to Commission D&D Character Art — A Step by Step Guide',
    category: 'Guides',
    date: '2026-05-24',
    dateLabel: 'May 24, 2026',
    readMin: 9,
    excerpt: "What actually helps when commissioning character art, from the artist who reads those briefs every week.",
    seoTitle: 'How to Commission D&D Character Art — Step by Step Guide',
    seoDescription: 'How to commission D&D character art from start to finish — what type to order, how to set a budget, write a brief, and find the right artist. From the studio.',
    body: `Most people who commission their first piece of character art either over-prepare or under-prepare. I get briefs that are fifty paragraphs of backstory with zero reference images, and I get briefs that say "half-elf rogue, she's cool." Neither gives me what I need to paint your character well. Here's what actually helps, from the perspective of the artist who reads those briefs every week.

The commissions that come out best aren't always the ones with the most detailed lore. They're the ones where the client knew what they wanted before they typed a single word.

## Step 1: Know What Type of Art You Want

Before you contact any artist, decide what you're actually ordering. Different formats serve different purposes and the distinction matters more than most people expect.

A **bust** (shoulders and up) costs less and works perfectly for a VTT token, a Discord avatar, or a quick visual to show your table what your character looks like. It's not a compromise — for a lot of characters, it's exactly the right format.

A **half-body** (waist up) lets me show the outfit from the torso up, which is useful when costume detail matters but you don't need to see the boots.

A **full-body** piece is the one you frame, use for a campaign poster, or order when you want the whole character — posture, weapon, stance — in one image. It takes longer, and every extra limb means more decisions I'm making about your character on your behalf.

**VTT tokens** are their own product. They're cropped circular portraits built to sit on a grid at small sizes. If your goal is a Foundry or Roll20 token, say so upfront — the composition and file delivery are different from a standard portrait.

**Reference sheets** are for long campaigns or developers who need the character documented from multiple angles with color swatches and callouts. That's a separate project.

If you're not sure which format fits, the [services page](/services/character-work) has examples for all of them.

## Step 2: Set Your Budget Before Anything Else

I'll be direct because it saves us both time. Busts typically run **$60–80**. Half-body work sits around **$90–120**. Full-body runs **$120–180** and up.

What drives price up: intricate armor with a lot of small details, a fully painted background instead of a gradient, more than one character in the piece, and commercial licensing if you're using the art for a published product or stream branding.

What doesn't affect price: your character's backstory, how much you love them, or how complex their personality is. The price reflects what I have to actually render.

One thing worth saying plainly — don't go hunting for the $10 commission. I know those exist. What you're usually buying is either a heavily AI-generated image with some light retouching, or work from an artist being paid below minimum wage per hour. The art might look passable in a thumbnail. It won't hold up at full size and there's rarely a real revision process attached to it. Your character deserves better. Full pricing is [here](/pricing).

## Step 3: Gather References Before You Write a Single Word

This is the most useful thing you can do before you contact me. Clients who come in with good references consistently get better paintings.

Three types of references actually matter.

**Visual likeness references** cover what your character looks like — species, face shape, distinguishing features, the specific armor or outfit. Screenshots from character creators, similar art you've found online, photos of a hairstyle. I'm not copying these images; I'm using them to understand what's in your head.

**Color references** are the most underrated. If you tell me "dark red armor," I'm guessing. A Pinterest board or a hex code means I'm painting your version of dark red, not mine. Even a film still with the right color mood is more useful than a word description.

**Tone and atmosphere references** tell me how the painting should feel. Gritty and weathered? Clean and heroic? Show me illustrations or film stills with the right atmosphere, even if the subject is completely different.

Three to five solid references per category is plenty. Thirty-seven conflicting ones is actually harder to work from than three clear ones.

> The client who sends me a Pinterest board of eight well-chosen images usually gets a better result than the client who sends sixty.

## Step 4: Write the Brief

Once you have references, the written brief becomes much shorter than you think it needs to be.

Every brief needs five things:

1. **Species, build, and rough age.** "Half-orc, stocky and broad, mid-30s."
2. **Skin tone, hair, and eye color.** Be specific. "Warm brown skin, silver locs pulled back, amber eyes."
3. **Key outfit items.** Not every item — the three or four things that define the silhouette. "Tattered traveling cloak, leather chest armor with a clan sigil on the left shoulder, no helmet."
4. **Mood or emotional state for the piece.** "Tired but determined" tells me more than "heroic."
5. **Pose or moment.** "Standing with one hand on the pommel of her sword, looking off to the left" gives me a composition. "She's ready to fight" doesn't.

Then write one sentence about who this person is. Not their class and level. Not their backstory. The essential vibe.

Leave out the full backstory, every stat, every item in the inventory. I don't need it. If a specific story detail affects the image — a scar from a particular battle, a locket they always carry — mention that. Everything else stays in your campaign notes.

## Step 5: Vet the Artist Before You Pay a Deposit

Not all commission work is equivalent, and who you hire matters as much as what you're asking for.

**Look at portfolio consistency, not just the best pieces.** Every artist has a standout image or two. What matters is whether the rest holds up. Wild quality variation is either a sign those best pieces are exceptions — or, increasingly, that some work is AI-generated and some isn't.

**Check the revision policy.** How many rounds? At what stage do revisions stop being free? An artist who won't show you a sketch before moving to final color is setting you up for a surprise. The sketch stage exists so you can steer the painting before I've committed hours to it.

**Ask about turnaround and communication.** A two-week turnaround with no updates is a different experience from a four-week process with sketch check-ins. Know what you're paying for.

On AI — consistent hand-painted work has a texture and variation that generated images still don't convincingly replicate. Look closely at whether the style holds up across different subjects, and look at how the hands are handled. You can also just ask the artist directly.

## Step 6: How to Give Feedback on Sketches

When I send a sketch, I'm asking one question: does this capture your character? That's the moment to steer the painting. The quality of your feedback here shapes the final piece more than anything else.

Specific feedback is useful. "The jawline feels too soft — can we go squarer?" is something I can act on. "Something feels off" is not. Hold the sketch up against your reference images and identify exactly what's different from what you pictured.

When revisions are listed as unlimited at the sketch stage, that means we keep working the sketch until you're happy with the direction — before I paint anything. It doesn't mean approving a sketch and then asking for a completely different pose after I've finished the color work. Once I'm at final color, structural changes add time.

The [process page](/process) walks through every stage so you know what to expect and when to give feedback.

## Step 7: Delivery and What You Can Do With the File

When the painting is done, you'll receive a high-resolution PNG suitable for print and screen use. Depending on what you ordered, you may also receive a layered file or a token crop.

**Personal use** covers printing it, using it as an avatar, sharing it on social media, showing it at your table. That's what a standard commission covers.

**Commercial use** — selling it on merchandise, using it in a published product, stream branding where the art is part of a monetized channel — requires a commercial license. That's worth discussing before you order if you think you'll need it. The [FAQ](/faq) has the full breakdown.

## Mistakes Worth Avoiding

Contacting the artist before gathering references is the most common one. You can't accurately describe what you want until you've seen something close to it. Get the references together first.

Picking an artist based on price alone almost always costs more in time and frustration than the higher-priced commission would have. The $10 commission and the $80 commission are not the same product.

Approving a sketch you're not happy with. If something is wrong at the sketch stage, say so — it's easier to fix there than after I've painted over it.

Waiting until the last minute. Quality commissions have queues. If you need something for a campaign session on a specific date, reach out weeks ahead, not days.

---

If you've read this far, you're already more prepared than most of the people who come through my order form. You know what format you want, you have a budget in mind, you've thought about references, and you know what goes in a brief.

[Fill out the order form](/order) when you're ready and I'll look at your brief personally. I paint every piece by hand, and I'd like to paint yours.`,
    authorName: 'Hector G. · Design Vortex founder',
    gradient: 'from-teal-900 via-emerald-700 to-burgundy-700',
    tags: ['commissioning', 'guide', 'briefs', 'process', 'dnd-5e'],
  },
]

// Check for duplicate slugs
const existingSlugs = new Set(existing.map(p => p.slug))
const toAdd = newPosts.filter(p => {
  if (existingSlugs.has(p.slug)) {
    console.log(`  Skipping duplicate slug: ${p.slug}`)
    return false
  }
  return true
})

const merged = [...existing, ...toAdd]
writeFileSync(snapshotPath, JSON.stringify(merged, null, 2), 'utf-8')
console.log(`\nDone. Added ${toAdd.length} new posts. Total: ${merged.length}`)
toAdd.forEach(p => console.log(`  + ${p.slug}`))
