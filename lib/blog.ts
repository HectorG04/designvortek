/* =====================================================================
   BLOG — client-safe types + in-memory snapshot fallback.

   Mirrors the pattern used by lib/portfolio-pieces.ts and lib/reviews.ts:
   - Pure data + types in this file (no server-only imports, safe in
     client bundles).
   - lib/blog-server.ts wraps Supabase reads and falls back to the
     snapshot below when the table is empty or unreachable.

   Public surfaces (/blog, /blog/[slug], /blog/category/[c]) read via
   the server module, so admin edits propagate through ISR within
   `revalidate = 60`.
   ===================================================================== */

export type BlogCategory =
  | 'Guides'
  | 'Behind the scenes'
  | 'D&D'
  | 'Studio news'
  | 'Process'
  | 'Tutorials'
  | string

export interface BlogAuthor {
  name: string
  initials: string
  bio: string
}

export interface BlogPost {
  slug: string
  title: string
  category: BlogCategory
  /** ISO date for both <time dateTime> and sorting. */
  date: string
  /** Human-readable date label shown on cards/article header. */
  dateLabel: string
  /** Whole minutes — rendered as "{n} min read" on detail page,
   *  "{n} min" on cards. */
  readMin: number
  excerpt: string
  /** Markdown body rendered via the branded <Markdown> wrapper. */
  body: string
  authorName: string
  /** Featured post gets the big hero card on /blog. Only one should
   *  be featured at a time; the server picks the first featured post
   *  sorted by date desc. */
  featured?: boolean
  /** Optional URL — when absent the card falls back to a gradient. */
  featuredImage?: string
  /** Tailwind gradient classes (e.g. 'from-violet-900 via-...') used
   *  as the card placeholder when no featured_image is set. */
  gradient?: string
  tags?: string[]
  seoTitle?: string
  seoDescription?: string
}

/** Shared studio author byline. Future enhancement: per-author records. */
export const STUDIO_AUTHOR: BlogAuthor = {
  name: 'Hector G. · Design Vortex founder',
  initials: 'H',
  bio: 'Two years running Design Vortex. We write here about commissioning art, the painting process, and the occasional studio update.',
}

/* ----- 7 seeded posts. Bodies are markdown strings — single source
   of truth for both the snapshot fallback and the seed script. ----- */

const HOW_TO_WRITE_COMMISSION_BRIEF_BODY = `Every commission begins with a brief. Some briefs read like a screenplay, vivid, specific, layered with the kind of detail that gives a painter somewhere to stand. Others read like a Google form filled out in a hurry. **Both are valid**, but the first kind almost always ends up with better art.

This isn't because the second kind is bad. It's because the artist ends up filling in the gaps from their own imagination, and your character lives in *your* imagination, not theirs. The closer your brief gets to the picture in your head, the closer the final piece will land.

So here's what two years of taking briefs has taught us: the questions to answer, the parts to skip, and the words that always make the studio's job easier.

## Start with the one-line pitch

Before anything else, write one sentence that captures the character. Not their backstory, not their stats, the *essential vibe*. "A tired paladin who has stopped praying." "A bard who became a librarian." "A drow ranger who hates the surface but lives there anyway."

That one sentence is the lens. Everything that follows should reinforce it.

## The five details that matter most

After the pitch, lock down these five specifics. If you can answer all of them, you have a great brief. If you can't answer three, ask the artist what to add.

- **Species, build, age range.** "Half-elf, tall and lean, late thirties" beats "fantasy person."
- **Skin, hair, and eye specifics.** Hex codes are welcome. "Soft purple skin with darker freckles" is plenty.
- **Outfit and key items.** One distinctive piece is enough, "tattered violet robe with silver constellations stitched in," not a full inventory.
- **Mood and lighting.** "Melancholy but powerful, warm dramatic lighting" gives the artist a tonal palette.
- **Pose or moment.** Standing, in motion, mid-spell, holding something? Pick one. Vagueness here is what makes characters feel generic.

> A great brief isn't long. It's specific in the right places and silent on the rest.

## References are gold. Mood boards are diamonds.

If you only do one extra thing, **send 3 to 5 reference images**. Not "draw this exactly," references for vibe, lighting, color palette, similar species or outfit, even movie stills that capture the energy you want.

A Pinterest board with fifteen carefully-chosen images is more useful than a 2,000-word description. It lets the artist *see* what you see.

## What to leave out

Backstory longer than three paragraphs. The character's full stat block. Lists of every adventure they have ever been on. Every accessory they have ever owned.

All beautiful for your campaign. None of it makes the painting better.

## Closing the loop

The best briefs treat the commission as a collaboration. You bring the character. The artist brings the craft. The brief is the bridge. Get it right and the piece will feel like both of you painted it, which, in a way, you did.

If you've got a character waiting, [start a brief](/order). Or read more about [how character art commissions work](/services/character-work). Either way: the sooner you write that one-line pitch, the sooner your character ends up on the wall.`

const THREE_WEEKS_WITH_LYRA_BODY = `Lyra Vexweaver arrived in my inbox on a Tuesday in February, in a brief Aria had clearly spent her lunch hour writing. By the time I closed my laptop **three weeks later**, the painting was done. Here is what happened in between.

## Week one, sketches

I always start with **three thumbnail sketches** at low resolution. Different poses, different framings. The point is not to be precious; the point is to find the version that snaps into focus for both of us.

Aria picked the second thumbnail, Lyra mid-step, glass orb cupped in one hand, looking somewhere off-frame. We refined it over two passes.

## Week two, color block

Color blocks are where the painting starts to feel inevitable. Big shapes of color, no detail, just temperature and value. This stage often surprises clients, it looks like a watercolor study, not a finished portrait. But it locks the mood.

> The color block is the bones. If the bones are wrong, no amount of polish will save it.

## Week three, paint and polish

Paint is the longest stage but also the most predictable. Layers of detail, working from large to small, eyes always last. I sent Aria three progress shots across five days.

### The revision that mattered

On the second-to-last day, Aria asked if Lyra could be looking *slightly* higher, not at the orb, but past it. Five minutes of paint. Different painting.

That is the value of **two paint revisions** baked into every commission. Most clients use only one. But when the second one matters, it really matters.

Want to see how it works for your character? [Start a brief](/order) or browse the [portfolio](/portfolio) for more before-and-afters.`

const VTT_TOKEN_DESERVES_MORE_BODY = `Most VTT tokens are *crops*. A square portrait gets a circular mask slapped on top, the head ends up too small, and the corners look awkward at any zoom level. There is a better way.

## Design for the circle from the start

A purpose-painted token uses the round frame as composition. The head fills more of the canvas. The shoulders curve into the edge. **Decorative borders pull the eye inward**.

## Three tokens that earned their pixel budget

- A **wraith** with smoke that breaks the circle slightly, only visible at hover zoom.
- A **dwarf cleric** whose hammer rests across the lower third, giving the token visual weight.
- A **drow ranger** with two glowing eyes that read clearly at 64 pixels, token-first detailing.

At 512 pixels, every choice matters. A token that was a full portrait first will always look like a portrait someone clipped. A token painted as a token reads at every zoom.

Browse our [VTT token service](/services/tokens) or start a [commission](/order) for your party.`

const HERO_FORGE_TO_HANDPAINTED_BODY = `Hero Forge is a launchpad, not a destination. It's the fastest way I've found for a player to show me what they see in their head without having to write three paragraphs about pauldron asymmetry. But the moment a screenshot lands in my inbox, my job starts: figuring out which parts of that 3D mannequin are load-bearing for your character, and which parts are just defaults the software picked because you had to pick *something*.

## What Hero Forge actually captures

The tool is genuinely good at a few things, and I lean on it whenever a client sends one over. Pose is the big one. If your tiefling warlock stands with her weight on the back foot and a hand resting on a hip, that reads instantly, and I can build a portrait around that silhouette. Proportions are the second win. Hero Forge gives me a rough body type, a height read against the gear, and a sense of how broad or narrow you picture your character. The third thing is gear placement, where the sword sits, which shoulder the cloak falls off, whether the holy symbol hangs at the chest or the belt.

Those three reads save me an entire back-and-forth round of clarifying questions. When a brief comes in with a Hero Forge screenshot attached, I usually know within thirty seconds whether we're painting a half-elf ranger who moves like a dancer or a half-elf ranger who moves like she's been sleeping in armor for a week.

## What gets lost in the translation

Here's where the screenshot stops being enough. Hero Forge renders everyone in the same flat studio light, with the same plastic skin shader, and the same neutral expression that lives somewhere between "mild constipation" and "thinking about taxes." None of that survives the trip to a painted portrait.

Texture is the first casualty. The leather on a Hero Forge cuirass looks like leather the way a stock photo looks like leather, technically correct, emotionally absent. When I paint it, I have to decide: is this armor a hand-me-down with cracked oil finish, or is it fresh from a Waterdeep armorer with the maker's stamp still legible? The screenshot can't tell me.

Light goes next. A painted portrait lives or dies on its light source, and Hero Forge doesn't have one, not really. I need to know if your drow assassin is lit by a single guttering torch in a tomb, or by the cold blue of a moonwell, or by nothing at all because she's a silhouette against a fire she just set.

And then there's the part I find hardest to name. Call it gesture, or presence, or the thing in the eyes. A Hero Forge model holds its sword. A painted character *grips* it, or balances it, or has just lowered it because the fight is over. That distinction is the whole job.

## Send these alongside the screenshot

If you want the portrait to land closer to the character in your head, attach a few extras when you send the Hero Forge link or render:

- **A palette reference.** Two or three images with colors you want in the piece. Hex codes if you have a strong opinion on skin or eye color. Pinterest boards are fine, just trim them to the hits.
- **A mood note.** One or two sentences on the emotional register. "Tired but not beaten" tells me more than three paragraphs of backstory.
- **Scene context.** Is she mid-spell, post-battle, sitting at a tavern table, standing on a cliff? Even a vague "indoor, candlelight" gives me a light source to work from.
- **Key items that must be visible.** The locket from her dead mentor. The Pathfinder-style spiked chakram she insists on using in a 5e campaign. The patron's sigil tattooed under her left ear. Tell me what cannot be cropped or obscured.

> Hero Forge is scaffolding. Useful, structural, and meant to come down before the painting is finished. The best briefs I get treat it that way: here is the frame, now help me paint what stands inside it.

## What I sketch around

Every Hero Forge screenshot has parts I quietly ignore, and parts I lean on. The face is almost always the first thing I sketch around. The software's facial sliders are improving, but they still produce a generic doll-face that won't carry the weight of a character who has, say, lost a sibling or pacted with something old. So I take the species, the rough age, the build, and then I sketch the face from scratch using your mood notes and any human reference photos you've sent.

Hands are the second. Hero Forge hands are placeholders. In a painted portrait, hands do a tremendous amount of the storytelling, whether they're clenched, open, gesturing, casting, holding something with a specific grip. I redraw them every time.

The third area is anything to do with cloth in motion. Static cape on a 3D model becomes a wind-caught cape in the portrait, or a heavy wool one that hangs dead, depending on the scene. That choice belongs to the painting, not the screenshot.

### A small example

Last month a player sent me a Hero Forge of his paladin: full plate, longsword, classic heroic stance. The screenshot was clean. But his note said, "He just buried his squire. He doesn't want to be wearing this armor anymore." That single sentence rerouted the entire portrait. Same pose, same gear, completely different painting. The sword tip dropped two inches. The helm went under his arm instead of on his head. The light came in low and amber, the way late afternoon does when you've been standing in one place too long. The Hero Forge file gave me the bones. His note gave me the painting.

If you're putting together a brief and want to see how this works in practice, the [character art service page](/services/character-work) walks through the full process, and the [order form](/order) has a field specifically for Hero Forge links and reference attachments. Send the screenshot, send the extras, and tell me what the model can't. That's where the portrait actually begins.`

const FIRST_ART_FAIR_BOOTH_BODY = `The con was in Mossfield, a town just big enough to host a one-day "Arts & Tabletop" fair in a converted grange hall. I had a six-foot table near the back wall, between a woman selling resin dice and a guy who made leather dragon masks. I had been painting commissions out of my spare bedroom for almost two years at that point, and this was the first time I was going to sit behind my own work in public. I got there an hour early and immediately drank too much coffee.

I want to write this down before I forget, because next year I will absolutely tell myself I remember, and I will absolutely be wrong.

## What earned its space

The single best thing I brought was a stack of **eleven framed originals**, propped on small wooden easels at staggered heights. People stopped for the originals. They walked past the prints. I had assumed it would be the other way around, that prints at fifteen dollars would be the easy yes and the originals would just be decoration. Wrong. The originals made the booth feel like a booth and not a yard sale.

After that, in rough order of usefulness:

- A binder of past commissions, sleeved, with the character name and a one-line backstory on each page. Three separate people sat down at my table and read the whole thing.
- Palette samples on small primed boards. Just little 3x3 squares showing skin tones, leather textures, metallics. People love touching things. I underestimated how much.
- A square reader that worked. Mine did, on the venue wifi, which I genuinely had not planned for.
- Business cards with a QR code on the back, no front-of-card glamour, just my name and the URL. I gave away about ninety of these and got two commissions in the following month from them.
- A folding stool for *me*. I almost did not bring one. I would have died standing for nine hours.

The other thing that worked, which I did not expect, was a hand-lettered sign that just said "Yes, painted by hand. No, no AI." I put it up around hour two after the fourth person asked. After that the question mostly stopped, and the people who *did* ask were already interested, not suspicious.

## What I'd cut

Now the part where I am honest with myself.

The print bin was too big. I brought roughly sixty prints across fifteen designs and sold eleven. The bin took up about a third of my table real estate and most of it came home with me. Next time: four designs, twelve prints each, max.

I also brought a small portable speaker, thinking I'd play quiet ambient music. The hall was so loud you could not have heard a marching band at my table. The speaker sat in its case the entire day.

The "tip jar" I'd lettered the night before. Embarrassing in retrospect. It is not a coffee shop. Nobody is tipping the painter. Threw it in the trunk at lunch.

A clipboard with a mailing list signup. Two signatures. Both were friends I'd told to come by. The QR code on the back of the cards did the same job better.

And finally, the second tablecloth. I brought a backup in case I spilled something on the first one. Reader, the only thing I spilled was my own coffee, onto my own jeans, in the parking lot, before I'd even unloaded the car.

## The one thing I should have left at home

A space heater.

I had read on some forum that grange halls run cold in the morning and to bring a small heater for under the table. So I brought one. The hall was packed by ten and stayed at roughly the temperature of a sauna for the entire afternoon. The heater sat by my feet, off, and I tripped over the cord twice. Once in front of a customer who was three sentences into describing her tiefling warlock. She was very gracious about it. I still think about it.

> An art fair is not a gallery show. Nobody is hushed. Nobody is reverent. A kid will ask if you painted that or if your mom did, and a guy in a kilt will tell you about his bard for ten minutes, and that is the actual job.

## What I'd add next time

A second chair on the customer side of the table. The commission conversations that turned into actual sales all happened when someone sat down. Standing across from me they would look for thirty seconds and drift. Sitting, they would talk for ten minutes and book something.

A printed price sheet for [character art](/services/character-work) and [VTT tokens](/services/tokens), laminated, one copy. Not a brochure. Just a single sheet I could slide across the table when someone asked "so how does this work." I improvised it four or five times that day and the answer got worse each time I gave it.

Also: a real lunch. I packed a granola bar and an apple. By 3pm I was running on caffeine and pure social adrenaline, and I could feel my pitch getting weirder. Next time, a proper sandwich in a cooler under the table.

### The conversation I keep thinking about

A woman in her sixties stopped at the booth around four. She had no D&D context at all. She picked up the binder, flipped to a portrait of a half-orc paladin I'd done in October, and asked, very quietly, "is this someone's daughter?" I said no, it was a character from a tabletop game, that the client had played her for two years. She nodded for a long time and said, "well, it looks like a real person." Then she bought a small print of a different painting and left.

I do not have a tidy lesson from that. I just liked it. It reminded me that the work travels further than the genre, which I think is the thing I most wanted out of doing the fair in the first place.

## Closing up

I broke down the booth at seven, drove home with most of my prints still in the bin, and slept for ten hours. The honest math: I sold enough to cover the table fee, the gas, and a decent dinner. The two commissions that came in over the following weeks are what made it actually worth it, and those came from cards, not from anything I sold at the table.

If you want to see the originals I had at Mossfield (and the ones I have made since), the [portfolio](/portfolio) is the same binder, more or less, just digital. If you have a character you have been carrying around for a while, the [order page](/order) explains how the process works without me tripping over a heater cord.

I'll be doing another fair in the fall. Smaller print bin. No speaker. Definitely no heater.`

const STRAHD_NPC_PACK_SIX_WEEKS_BODY = `Wren emailed me on a Sunday night in March. She was running Curse of Strahd in person for the first time, eight players around her dining table, and she wanted portraits the group could actually hold in their hands. Index cards with names, she said, were not cutting it. The party kept forgetting who Ismark was. Could I paint the whole core cast as a pack, matched in style, ready before her session zero in May?

Six weeks later, I shipped her eight portraits and a small handoff PDF. This is how that pack came together, and what I learned about keeping a roster of NPCs visually coherent when the source material spans a vampire lord, a Vistani seer, and a teenage politician with bad hair.

## Why an NPC pack works for a campaign module

A published module gives you a known cast. Players who have done any research at all will arrive at the table with a mental image of Strahd, and that image is usually wrong, or at least generic. Painting the pack in one continuous run lets me solve a problem that single commissions can't: every face shares a lighting language, a paper texture, a color logic. When Wren slides Ireena across the table and then Madam Eva, the players feel like they are inside one world, not flipping between fan art tabs.

There is also a schedule argument. Eight separate commissions, spaced across a year, would cost more and look less unified. A pack lets me batch the early stages. I do all the thumbnails in one week, all the value studies in another, and then go deep on rendering with the palette already locked. The math works out for everyone.

## The kickoff call

Wren and I spent ninety minutes on a video call before I touched a brush. We made four decisions that constrained every painting that followed.

**Palette.** Barovia is desaturated. The book leans into greens, browns, blood reds, candlelight yellows. I proposed a palette of seven colors plus a near-black and a bone white, and we agreed to ban pure cyan, pure magenta, and any saturated orange. That sounds restrictive. It is the whole point.

**Era.** Late Renaissance dress with Eastern European cuts. Ireena would wear something her father, a burgomaster, could afford. Strahd would dress in centuries-old fashion that he refuses to update. Ezmerelda was the only character allowed any visible modernity, leather boots and a coat that has seen actual travel.

**Tone.** Wren wanted dread, not horror. The portraits should feel like the players walked into a house at dusk, not into a haunted attraction. That meant no blood on faces, no glowing eyes, no obvious fang reveals. The horror sits in the eyes and the posture.

**Light direction.** This was the decision I cared about most. I picked a low, warm key light from camera-left for every portrait, with a cooler ambient fill from the right. Eight portraits, one sun. When you lay them side by side on a table, your brain reads them as the same room.

## Week 1-2: Strahd and Ireena

I started with the central duo because they would set the standard for everything else. If I could nail the visual relationship between them, the rest of the pack would have a north star.

Strahd was painted in three-quarter view, looking slightly past the viewer. I gave him a high collar in deep ox-blood, almost black until you tilt the page, with the warm key catching the right side of his jaw and leaving the left half of his face in shadow. His skin is a thin layer of pale ochre over a green underpainting, which is the technique I use when I want something to read as not-quite-alive without going full corpse. His eyes are a desaturated gray, not red. Players see red eyes in every Strahd image online. Gray is more unsettling because it reads as human first, then wrong.

Ireena was the mirror. Same lighting setup, same camera angle, but flipped: she catches the key light on the *left* side of her face, so when the two portraits sit next to each other on the table, the light falls toward each other. They are illuminating each other across the page gap. Her palette is warmer, copper hair against a soft moss-green dress, with skin painted over a pink underlayer so she reads as fully alive. The contrast does the storytelling. I did not need to put a vampire next to a victim. The light did it.

> The color block is the bones. If the bones are wrong, no amount of polish will save it.

I think about that sentence every time I start a pack.

## Week 3-4: Madam Eva, Rictavio, Ezmerelda

The supporting cast is where a pack can fall apart, because each character has a strong visual hook that wants to dominate. My job is to honor the hook while keeping the palette and lighting under control.

**Madam Eva** got the most saturated piece in the pack, which was a deliberate exception. Her shawl uses a deep madder red that I kept off every other portrait, so when she enters the story, she enters with a color the players have not seen. Her face is painted with heavy texture, deliberate brush marks left visible in the skin, because she is meant to read as ancient and weathered. I lit her from below with the campfire bouncing warm light up under her chin, then dropped the key light to almost nothing. She is the only portrait in the set lit primarily by fire.

Rictavio was the trickiest. He is Rudolph van Richten in disguise, a vampire hunter performing as a traveling entertainer, which means I had to paint a portrait that hides a second portrait inside it. I gave him a slightly theatrical posture, a waxed mustache that does not quite sit right, and eyes that are doing none of the work his smile is doing. Wren told me later that her players spent twenty minutes at the table just staring at his face trying to figure out what was off. That is the painting working.

Ezmerelda was a relief to paint after Rictavio. She is straightforward: a half-Vistani monster hunter who knows exactly who she is. I painted her in a leather coat with a silver holy symbol just visible at her throat, lit cleanly, looking directly at the camera. She is the only NPC in the pack making direct eye contact. The players were meant to read her as trustworthy, and direct gaze is the cheapest, most reliable way to do that.

## Week 5: Kasimir and Victor

Most Strahd packs stop at six NPCs. Wren and I agreed early on that the last two slots should go to characters who are easy to overlook but who reward a portrait at the table.

Kasimir Velikov is a dusk elf in mourning, obsessed with bringing back his sister. He was a chance to break the human-face monotony that creeps in across a pack of eight. I painted him in profile, looking off-frame, with the key light catching the back of his head and rim-lighting his ear rather than his face. His skin is the coolest in the pack, a desaturated lavender-gray, which lets him sit visually apart from the Barovian humans without screaming "elf." His grief is in the posture, shoulders rotated slightly away from the viewer, hands not visible.

Victor Vallakovich was the wildcard. He is a sixteen-year-old apprentice wizard with delusions of competence, son of the Vallaki burgomaster, and he is genuinely funny if you play him right. I painted him three-quarter, slightly too close to the picture plane, with a robe that is one size too big and a singed sleeve he clearly does not want you to notice. His key light is brighter than anyone else's in the pack, almost overexposing his forehead, because he is the one character whose tone is comic relief, and warm overexposure reads as that. He is also the only portrait where I let the background go nearly white. Every other piece has a dim, textured background. Victor gets clean light because he does not yet understand what he is living through.

## Week 6: Final pass and tokens

The last week is mostly invisible work. I pulled all eight portraits onto one canvas, scaled them to identical head sizes, and went through correcting drift. Strahd's skin had crept warmer over the weeks. Ireena's hair had gotten slightly too red. Madam Eva's red shawl needed to come down half a step in saturation so it stayed special without screaming. Pack consistency is mostly about week six.

Then I cropped each portrait to a circular [VTT token](/services/tokens) at 280px, color-matched the rings, and built a one-page style guide for Wren: the palette swatches, the lighting diagram, a note on how to describe each NPC's voice if she ever wanted commissions of related characters later. The whole package shipped on a Thursday morning.

> Consistency is the hardest part of a pack. Any one painting is a problem you can solve. Eight paintings that feel like they were painted on the same afternoon, in the same room, by someone who knows all eight people personally, that is a different problem entirely.

### A revision that taught me something

Wren asked for one revision in week four. Ireena's first version had her looking directly at the viewer, same as Ezmerelda. Wren wrote back: "She looks too confident. She is supposed to be the one being protected." I had defaulted to direct gaze because it is flattering. I repainted her looking slightly down and to the side, not avoiding the viewer but not quite meeting them either. It was a two-hour fix that changed the whole emotional register of the central duo. Now Strahd looks past you and Ireena looks away from you, and the players are the only ones in the room actually seeing what is happening. I would not have found that without Wren pushing back.

If you are prepping a campaign module and want the table to feel like one world, an [NPC pack](/services/gm-world-building) is the most efficient way to get there. I take a limited number of pack commissions each quarter to keep the per-piece attention high. You can [start an order here](/order), and we will get on a kickoff call before anything gets painted.`

const CHOOSING_A_COMMISSION_STYLE_BODY = `Most clients open the conversation the same way. They send a reference sheet, a couple of mood images, and a single question: which style is right for my character? The honest answer is that it depends on what you want the portrait to do. A piece you hang above your desk does different work than a piece you drop into a Discord server before session zero. Same character, different job, different style.

Here is how I think about the four options on offer, and what each one actually costs you in trade.

## Painterly

This is the house style at Design Vortex, and the one I default to when a brief is ambiguous. Warm light, deep shadows, brushwork you can see if you lean in close. The lineage is oil painting, with a heavy debt to Frazetta and the older fantasy illustrators who treated a character like a body in real light, not a flat silhouette on a card.

Painterly is best for **heroic player characters**, party portraits, and anyone you want to feel weighty and a little old. It carries grime well. It carries gold leaf well. It carries the kind of haunted, mid-life paladin energy that a lot of long-running campaigns produce by year three. If your character has a story behind their eyes, painterly gives me room to paint that story into the work.

What it costs you is time. A painterly portrait takes longer than the other styles by a real margin, because the rendering pass is where most of the hours go. It also costs a small amount of legibility at thumbnail size. Painterly pieces want to be seen at full resolution, ideally printed. If your main use case is a 64-pixel Roll20 token, painterly is overkill and the detail will not survive the downscale.

## Anime

Cell-shaded, clean line, expressive faces. The shadow work is graphic rather than atmospheric, which means the read is faster and the personality lands harder. Anime style is the one I reach for when a character is *personality-forward*, when the brief is full of phrases like "she always has this smirk" or "he never stops talking."

It works beautifully for younger PCs, for bards, for any character whose energy is kinetic. Anime is also the most forgiving style for distinctive hair, exaggerated weapons, and color palettes that would look garish in oil. A neon-pink coat reads as charm in anime and as a costume mistake in painterly. The style sets the rules for what is allowed.

What it costs you is suitability for grim and grimy aesthetics. I can paint a brooding anime character, but the style has an inherent brightness to it that fights against true horror or true gravitas. If your warlock has just made a pact with something cosmic and is unraveling at the edges, anime will undersell it. Pick a different tool.

## Lineart

Clean ink, light wash, a finished sketch feel. Lineart commissions are the workhorses of the studio. They are the right choice when **speed matters more than spectacle**, which covers a lot of real use cases: NPC packs for a DM building out a city, character sheet illustrations for a one-shot, secondary characters in a larger party shot.

> A style is a delivery mechanism for the character. It is not a flex, and the goal of a portrait is never to show off the style at the character's expense.

Lineart also reads well at small sizes, which makes it the best choice for tokens and printable handouts. The sketch aesthetic carries a particular charm too. Some characters look better as a confident ink drawing than they ever would as a full painting, the same way some songs are better acoustic.

What it costs you is standalone impact at full resolution. Lineart prints fine, but it does not have the surface that painterly does. You will not get the same "wait, is that a real painting?" reaction when someone walks past it on your wall. That is not the job lineart is doing.

## Semi-realistic

The fourth style, and the one I treat as a specialist tool rather than a default. Semi-realistic is closer to portrait painting than to fantasy illustration. The proportions tighten, the lighting becomes more naturalistic, and the work starts to read as a *person* before it reads as a character.

I steer people toward semi-realistic for **heirloom pieces**, gift commissions, and characters who carry a real-world resemblance the player wants honored. If your rogue is based on your partner's face, or your cleric is a tribute to a friend who passed, semi-realistic respects that lineage in a way the other styles cannot. It is the slowest of the four, and the most fragile to bad reference photos, so I ask for more material upfront when we go this direction.

## How to decide

Here is the rough framework I use in client calls, when someone is genuinely torn between options.

- If you want a piece that lives on your **wall**, pick painterly.
- If you want a piece that lives on your **character sheet**, pick lineart.
- If you want a piece that captures your character's *personality* before their look, pick anime.
- If you want a piece that captures a real person, pick semi-realistic.

Most briefs answer themselves once you sit with those four lines for a minute. The rest are edge cases, and edge cases are where it helps to talk to me directly before locking the order in.

### When the wrong style nearly shipped

Last month a player came in asking for anime. The brief described a half-orc cleric, late forties, missing an eye, mourning a dead wife, walking back into a temple she had abandoned twenty years earlier. The reference images they sent were all anime. The character they had written was not.

I pushed back gently. The grief in that brief was the load-bearing element of the piece, and anime's graphic shadow language would have flattened it. We talked it through on a fifteen-minute call, looked at a few painterly examples of older characters together, and agreed to move the commission to painterly. The final piece came out heavier and quieter than an anime version would have, which was what the character needed. The player has since ordered two more.

That is the kind of catch a brief intake is for. The style you arrive with is often correct. Sometimes it is not, and saying so is part of the job.

If you have read this far and you still are not sure which way to go, the easiest next step is to look through the [portfolio](/portfolio) with these four buckets in mind and notice which pieces stop you. That instinct, the one that pulls your eye, is usually pointing at the right style for your character.

When you are ready, the full breakdown of what each style includes, with current pricing and turnaround, lives on the [character art services page](/services/character-work). You can also skip straight to the [order form](/order) and tell me about the character in your own words. I read every brief myself, and if I think you have picked the wrong style I will say so before I take the deposit.`

export const POSTS: readonly BlogPost[] = [
  {
    slug: 'how-to-write-commission-brief',
    title: 'How to write a commission brief that gets the art you actually want',
    category: 'Guides',
    date: '2026-03-12',
    dateLabel: 'Mar 12, 2026',
    readMin: 8,
    excerpt:
      'The difference between "tiefling sorcerer" and a brief I can paint from. A working checklist with examples.',
    body: HOW_TO_WRITE_COMMISSION_BRIEF_BODY,
    authorName: STUDIO_AUTHOR.name,
    featured: true,
    gradient: 'from-violet-900 via-burgundy-700 to-amber-800',
    tags: ['briefs', 'commissioning', 'process'],
  },
  {
    slug: 'three-weeks-with-lyra',
    title: "Three weeks with Lyra: from a player's note to a final painting",
    category: 'Behind the scenes',
    date: '2026-02-28',
    dateLabel: 'Feb 28, 2026',
    readMin: 12,
    excerpt:
      'Sketches, color blocks, and the revision where everything clicked. A full process walkthrough.',
    body: THREE_WEEKS_WITH_LYRA_BODY,
    authorName: STUDIO_AUTHOR.name,
    gradient: 'from-amber-900 via-orange-700 to-rose-700',
    tags: ['process', 'walkthrough', 'character art'],
  },
  {
    slug: 'vtt-token-deserves-more',
    title: 'Why your VTT token deserves more than a clipped headshot',
    category: 'D&D',
    date: '2026-02-11',
    dateLabel: 'Feb 11, 2026',
    readMin: 5,
    excerpt:
      'A defense of the round portrait at 512px. Plus three tokens that earned their pixel budget.',
    body: VTT_TOKEN_DESERVES_MORE_BODY,
    authorName: STUDIO_AUTHOR.name,
    gradient: 'from-emerald-900 via-teal-700 to-burgundy-700',
    tags: ['vtt', 'tokens', 'roll20', 'foundry'],
  },
  {
    slug: 'hero-forge-to-handpainted',
    title: 'Hero Forge to hand-painted: a starter guide for D&D players',
    category: 'Guides',
    date: '2026-01-22',
    dateLabel: 'Jan 22, 2026',
    readMin: 6,
    excerpt:
      'What translates from Hero Forge to a painted portrait, and what we sketch around.',
    body: HERO_FORGE_TO_HANDPAINTED_BODY,
    authorName: STUDIO_AUTHOR.name,
    gradient: 'from-violet-950 via-purple-800 to-indigo-700',
    tags: ['hero forge', 'references', 'briefs'],
  },
  {
    slug: 'first-art-fair-booth',
    title: "What I packed for my first art-fair booth (and what I'd cut)",
    category: 'Behind the scenes',
    date: '2026-01-09',
    dateLabel: 'Jan 9, 2026',
    readMin: 7,
    excerpt:
      'Prints, palette samples, and the one thing I should have left at home.',
    body: FIRST_ART_FAIR_BOOTH_BODY,
    authorName: STUDIO_AUTHOR.name,
    gradient: 'from-amber-950 via-orange-800 to-yellow-700',
    tags: ['studio', 'conventions', 'lessons'],
  },
  {
    slug: 'strahd-npc-pack-six-weeks',
    title: 'The Curse of Strahd NPC pack, painted over six weeks',
    category: 'D&D',
    date: '2025-12-19',
    dateLabel: 'Dec 19, 2025',
    readMin: 10,
    excerpt:
      'Strahd, Ireena, Madam Eva, and the other six. How we kept style consistent across eight portraits.',
    body: STRAHD_NPC_PACK_SIX_WEEKS_BODY,
    authorName: STUDIO_AUTHOR.name,
    gradient: 'from-burgundy-900 via-red-800 to-rose-700',
    tags: ['npc pack', 'curse of strahd', 'process'],
  },
  {
    slug: 'choosing-a-commission-style',
    title: 'Choosing a commission style: painterly vs anime vs lineart',
    category: 'Guides',
    date: '2025-12-04',
    dateLabel: 'Dec 4, 2025',
    readMin: 9,
    excerpt:
      'What each style is best for, side-by-side examples, and how to decide for your character.',
    body: CHOOSING_A_COMMISSION_STYLE_BODY,
    authorName: STUDIO_AUTHOR.name,
    gradient: 'from-emerald-900 via-teal-700 to-cyan-600',
    tags: ['styles', 'buyers guide', 'painterly'],
  },
]

/* ---------- Synchronous accessors over the snapshot ---------- */

/** All posts, newest first. */
export function getAllPosts(): BlogPost[] {
  return [...POSTS].sort((a, b) => (a.date < b.date ? 1 : -1))
}

/** The single featured post for the /blog hero card. Picks the newest
 *  post with featured=true; falls back to the newest post overall. */
export function getFeaturedPost(): BlogPost | undefined {
  const sorted = getAllPosts()
  return sorted.find((p) => p.featured) ?? sorted[0]
}

/** Posts shown in the /blog grid, excluding whichever one is featured. */
export function getGridPosts(): BlogPost[] {
  const featured = getFeaturedPost()
  return getAllPosts().filter((p) => p.slug !== featured?.slug)
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug)
}

export function getPostsByCategory(category: string): BlogPost[] {
  const target = category.toLowerCase()
  return getAllPosts().filter((p) => p.category.toLowerCase() === target)
}

/** Up to `limit` posts excluding the given slug, newest first.
 *  Used by the "More articles" rail on the detail page. */
export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
  return getAllPosts().filter((p) => p.slug !== slug).slice(0, limit)
}

/** Category labels + counts for the chip row on /blog. The "All" chip is
 *  always first and is special-cased by the UI. */
export function getCategoryCounts(): Array<{ label: string; count: number }> {
  const counts = new Map<string, number>()
  for (const p of POSTS) {
    counts.set(p.category, (counts.get(p.category) ?? 0) + 1)
  }
  return [
    { label: 'All', count: POSTS.length },
    ...Array.from(counts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count),
  ]
}

/** Slug-safe form of a category label, used in /blog/category/[c] URLs. */
export function categoryToSlug(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Inverse of categoryToSlug — finds the original label by matching
 *  every known category through the slug helper. */
export function slugToCategory(slug: string): string | undefined {
  for (const p of POSTS) {
    if (categoryToSlug(p.category) === slug) return p.category
  }
  return undefined
}

/** Format an ISO date as "Mon DD, YYYY" for the article header timestamp. */
export function formatPostDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
