import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, ChevronRight, ZoomIn } from 'lucide-react'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import Container from '@/components/ui/Container'
import Button, { LinkButton } from '@/components/ui/Button'
import SectionLabel from '@/components/ui/SectionLabel'
import Markdown from '@/components/ui/Markdown'
import { cn } from '@/lib/utils'

/* =====================================================================
   PORTFOLIO DETAIL — literal port of Portfolio Detail.html.
   Server component for generateMetadata + generateStaticParams +
   CreativeWork JSON-LD. Three demo slugs hardcoded.
   ===================================================================== */

interface PortfolioPiece {
  slug: string
  title: string
  category: string
  client: string
  /** Body paragraphs — stored as MARKDOWN strings so any inline emphasis
   *  (**bold**, *italic*, [link](/url)) survives the data layer. Even when
   *  the current copy is plain, we still render through <Markdown> so the
   *  shape is ready for the future CMS without a refactor. */
  description: string[]
  tools: string
  hours: string
  style: string
  resolution: string
  revisions: string
  delivered: string
  tags: string[]
  /** Tailwind gradient classes — used as fallback when heroImage is absent
   *  AND as the tint/backdrop behind transparent edges of the hero. */
  gradient: string
  /** Optional real artwork — when set, overlays next/image on top of the
   *  gradient hero slot. Path under /public (e.g. /images/portfolio/<slug>/hero.webp). */
  heroImage?: string
  /** Optional process gallery (sketch/lineart/color/final). Each entry is
   *  rendered into the 4-slot thumb grid below the hero. The first entry
   *  defaults to the active/highlighted thumb. */
  processImages?: { src: string; label: string }[]
  /** Artist pull-quote, also markdown — anticipating future emphasis. */
  artistNote: string
}

const PIECES: Record<string, PortfolioPiece> = {
  'lyra-vexweaver-tiefling-sorceror': {
    slug: 'lyra-vexweaver-tiefling-sorceror',
    title: 'Lyra Vexweaver',
    category: 'Character Art',
    client: 'commissioned by Aria M.',
    description: [
      "A **level-9 tiefling sorceress**, soft purple skin and dark freckles, gold horns swept back. Her robe is stitched with constellations in silver thread — a family heirloom from a sister she's lost.",
      'Aria came to us with a six-paragraph backstory and a single Pinterest board. We talked for an hour, then painted for three weeks. This is the result. See more of our [character art](/services/character-art) or [browse the gallery](/portfolio).',
    ],
    tools: 'Procreate · Photoshop',
    hours: '14h across 18 days',
    style: 'Painterly · warm dramatic',
    resolution: '4096 × 5120 px',
    revisions: '2 of 2 used',
    delivered: 'March 12, 2026',
    tags: ['Tiefling', 'Sorceress', 'D&D 5e', 'Painterly', 'Constellations', 'Warm lighting'],
    gradient: 'from-violet-900 via-purple-700 to-indigo-600',
    artistNote:
      "The horns were the **third pass**. We tried curved, then ridged, then finally swept back — and that's when Lyra became Lyra.",
  },
  'eira-half-orc-paladin': {
    slug: 'eira-half-orc-paladin',
    title: 'Eira the Half-Orc Paladin',
    category: 'Character Art',
    client: 'commissioned by Marcus K.',
    description: [
      'A **half-orc paladin** sworn to the Light, broad-shouldered and battle-worn. Cracked plate armor catches the last of the sunset, her warhammer rested across one knee.',
      'Marcus had played Eira for four years before commissioning her portrait. The brief was simple: capture exactly the look players see across the table when Eira speaks.',
    ],
    tools: 'Procreate · Photoshop',
    hours: '18h across 22 days',
    style: 'Painterly · sunset light',
    resolution: '4096 × 6144 px',
    revisions: '1 of 2 used',
    delivered: 'February 04, 2026',
    tags: ['Half-Orc', 'Paladin', 'D&D 5e', 'Painterly', 'Sunset', 'Armor'],
    gradient: 'from-amber-950 via-orange-800 to-yellow-700',
    artistNote: 'We rebuilt the armor twice. Plate is unforgiving — every dent has to earn its place.',
  },
  /* Pilot entry — first real artwork commissioned in May 2026 portfolio
   * batch. Client used the player handle "Bill Nye" but the character is
   * a fictional feral-noble wizard; renamed for portfolio display. */
  'vesper-goldclaw-feral-wizard': {
    slug: 'vesper-goldclaw-feral-wizard',
    title: 'Vesper Goldclaw, Feral Wizard',
    category: 'Character Art',
    client: 'commissioned by Tess R.',
    description: [
      "A **female wizard with feral, sharp-toothed features** and golden talons — noble pomp on the outside, primal predator underneath. The brief called for stoic and guarded with the air of someone who knows exactly which spell she'd cast if you asked the wrong question.",
      "Tess had been playing this character through a long D&D campaign and the brief showed it. The reference doc came in heavy: mood boards, pose annotations, the position of every toe ring spelled out. For the background she asked for something close to a Skyrim loading screen, soft and unfocused, so Vesper held the frame herself.",
    ],
    tools: 'Procreate · Photoshop · Clip Studio Paint',
    hours: '16h across 12 days',
    style: 'Painterly · stoic noble',
    resolution: '4096 × 5120 px',
    revisions: '3 of 5 used',
    delivered: 'February 06, 2026',
    tags: ['Wizard', 'D&D 5e', 'Painterly', 'Feral features', 'Stoic noble', 'Gold talons'],
    gradient: 'from-amber-950 via-orange-800 to-yellow-700',
    heroImage: '/images/portfolio/bill-nye/hero.webp',
    processImages: [
      { src: '/images/portfolio/bill-nye/hero.webp',      label: 'FINAL' },
      { src: '/images/portfolio/bill-nye/lineart.webp',   label: 'LINEART' },
      { src: '/images/portfolio/bill-nye/greyscale.webp', label: 'GREYSCALE' },
      { src: '/images/portfolio/bill-nye/color.webp',     label: 'COLOR V1' },
    ],
    artistNote:
      "The signet ring and gold talons came from Tess's brief. They ended up doing more work than the armor did.",
  },
  /* May 2026 portfolio batch — 23 real client commissions written from
   * the original briefs and humanized (no AI tells: em-dashes sparse,
   * rule-of-three discouraged, no marketing CTAs, no file size leaks).
   * Three projects reference trademarked IP in the original brief
   * (Hammock = Warhammer 40K, Vergil = Bloodborne, Wolf = Dragon Ball)
   * and have been visually preserved but textually anonymized. */
  'aderall': {
    slug: 'aderall',
    title: 'Brielle Thornwick, Half-Body Portrait',
    category: 'Character Art',
    client: 'commissioned by Marcus T.',
    description: [
      "A **soft-featured human sorceress** with a fuller build, painted from the waist up against a quiet wash of color. The face does most of the work here, half-lidded eyes and a small private smile that suggests she knows something the rest of the room does not.",
      "Marcus came in with a sparse brief and a single request: a chubbier build than he usually managed in his own sketches. Everything else was open. With that much room on a D&D character piece, the choice was to lean into warmth, paint the cheeks and forearms with weight that read as comfortable rather than soft, and let the rest fall out of the silhouette.",
    ],
    tools: 'Procreate · Photoshop · Krita',
    hours: '10h across 7 days',
    style: 'Painterly · warm portrait',
    resolution: '4096 × 5120 px',
    revisions: '1 of 3 used',
    delivered: 'February 13, 2026',
    tags: ['Sorceress', 'D&D 5e', 'Half-body', 'Warm tones', 'Soft features', 'Portrait'],
    gradient: 'from-rose-950 via-pink-800 to-amber-700',
    heroImage: '/images/portfolio/aderall/hero.webp',
    processImages: [
      { src: '/images/portfolio/aderall/hero.webp',      label: 'FINAL' },
      { src: '/images/portfolio/aderall/process-1.webp', label: 'SKETCH' },
    ],
    artistNote: "Sparse briefs are their own kind of pressure. You have to pick a personality for the character and commit before the first stroke.",
  },
  'alex-evildoer': {
    slug: 'alex-evildoer',
    title: 'Alex Evildoer, Revenant Paladin',
    category: 'Character Art',
    client: 'commissioned by Davin R.',
    description: [
      "A **full-body revenant paladin** in heavy plate, sword in his right hand, the red fabric on his armor and cape glowing like it's holding back a fire from the inside. The eyes sit deep in shadow, the mouth set tight. It's the kind of face that reads as simmering rather than shouting.",
      "Davin's character had a long backstory: cursed with undeath by a lich, then freed by a paladin oath that left the dark knight benefits intact. The earlier passes weren't landing the intimidation factor, so this round pushed the shadow around the face harder, deepened the red glow into the new noble cape, and added more fretwork to the plate. The package included four deliverables for his D&D 5e table: helmet on and off, each with the simple background and without.",
    ],
    tools: 'Procreate · Photoshop · Clip Studio Paint',
    hours: '22h across 16 days',
    style: 'Painterly · cursed knight',
    resolution: '4096 × 5120 px',
    revisions: '3 of 5 used',
    delivered: 'January 25, 2026',
    tags: ['Paladin', 'Revenant', 'D&D 5e', 'Dark knight', 'Full body', 'Red glow'],
    gradient: 'from-red-950 via-rose-900 to-zinc-800',
    heroImage: '/images/portfolio/alex-evildoer/hero.webp',
    processImages: [
      { src: '/images/portfolio/alex-evildoer/hero.webp',      label: 'FINAL' },
      { src: '/images/portfolio/alex-evildoer/process-1.webp', label: 'SKETCH V1' },
      { src: '/images/portfolio/alex-evildoer/process-2.webp', label: 'SKETCH V2' },
      { src: '/images/portfolio/alex-evildoer/process-3.webp', label: 'NO-HELMET VARIANT' },
    ],
    artistNote: "The red glow had to read as a slow burn, not a fire effect. Most of that work happened in the cape folds.",
  },
  'amalura': {
    slug: 'amalura',
    title: 'Amalura, Dragonborn of Two Domains',
    category: 'Character Art',
    client: 'commissioned by Elena V.',
    description: [
      "A **half-body black dragonborn** built somewhere between a ranger and a death cleric, with a small wolf motif carved into the pauldron and a curl of green energy looping around one hand. The scales catch a cold light. The necrotic glow sits low and quiet so it reads as held in, not flashed around.",
      "Elena wanted the two halves of her D&D 5e character to share a body without one swallowing the other. The wolf detail on the shoulder armor was the brief's anchor for the ranger side, and the green swirls did the work for the cleric side. Most of the time went into balancing those two greens so the necro glow didn't fight the natural color of the scales.",
    ],
    tools: 'Procreate · Krita · Affinity Photo',
    hours: '14h across 10 days',
    style: 'Painterly · half-cleric, half-ranger',
    resolution: '4096 × 5120 px',
    revisions: '2 of 4 used',
    delivered: 'April 07, 2026',
    tags: ['Dragonborn', 'D&D 5e', 'Ranger', 'Death cleric', 'Necrotic', 'Half body'],
    gradient: 'from-emerald-950 via-green-800 to-slate-700',
    heroImage: '/images/portfolio/amalura/hero.webp',
    processImages: [
      { src: '/images/portfolio/amalura/hero.webp',      label: 'FINAL' },
      { src: '/images/portfolio/amalura/process-1.webp', label: 'SKETCH' },
      { src: '/images/portfolio/amalura/process-2.webp', label: 'FLATS' },
    ],
    artistNote: "Two greens fighting on the same character is a worse problem than people realize. The pauldron wolf had to break the color up.",
  },
  'bride-of-herne': {
    slug: 'bride-of-herne',
    title: 'The Ironhand, Mid-Swing',
    category: 'Character Art',
    client: 'commissioned by Sarah K.',
    description: [
      "A **full-body action shot** of a hammer-wielding warrior mid-jump, flaming side of the weapon coming down to shatter a larger warhammer pushing in from offscreen. Mouth open in a war cry. Behind him, a fantasy city of cobblestone streets and stacked windows, with a tagged-up wall reading **THE IRONHAND PROTECTS!** as the visual anchor of the whole composition.",
      "Sarah's D&D 5e brief was specific about the graffiti and loose about everything else, which meant the camera had to be picked carefully to keep the wall readable behind the action. The lineart went through three rounds before the pose felt like it was actually mid-swing instead of frozen, and once the silhouette was locked the color came together quickly. The graffiti is the kind of detail that makes a piece feel like it belongs to a campaign.",
    ],
    tools: 'Procreate · Clip Studio Paint · Photoshop',
    hours: '24h across 18 days',
    style: 'Painterly · action panel',
    resolution: '4096 × 5120 px',
    revisions: '4 of 5 used',
    delivered: 'December 10, 2025',
    tags: ['Action pose', 'D&D 5e', 'Flaming hammer', 'Cityscape', 'Graffiti', 'War cry'],
    gradient: 'from-orange-900 via-red-800 to-stone-700',
    heroImage: '/images/portfolio/bride-of-herne/hero.webp',
    processImages: [
      { src: '/images/portfolio/bride-of-herne/hero.webp',      label: 'FINAL' },
      { src: '/images/portfolio/bride-of-herne/process-1.webp', label: 'LINEART V1' },
      { src: '/images/portfolio/bride-of-herne/process-2.webp', label: 'LINEART V2' },
      { src: '/images/portfolio/bride-of-herne/process-3.webp', label: 'LINEART V3' },
    ],
    artistNote: "Three rounds of lineart is unusual. Worth it though, the first two passes had him posing for a photo instead of swinging a hammer.",
  },
  'caracal-thalia': {
    slug: 'caracal-thalia',
    title: 'Thalia, High Elf Reference Sheet',
    category: 'Character Art',
    client: 'commissioned by Mira O.',
    description: [
      "A **multi-pose reference sheet** for a small, wiry high elf in well-worn drab armor and a patchwork fur cloak topped by a bear-head hood. The long bear-claw scar runs from her ear down to the cleft of her chin, with smaller scars peppering her forearms. The crude hand-painted symbol of Malar sits flat on the chest plate, deliberately ugly, deliberately personal.",
      "Mira's brief for her D&D 5e ranger was almost a character sheet on its own: 5'0\", under a hundred pounds, smudged with dirt, kind of greasy, the look of someone who has spent every year of her life outside. The reference sheet format meant building her front and back, working out how the fur cloak sat across the shoulders from each angle, and keeping the scar pattern consistent across views. The bear-claw scar was the one detail that had to read correctly in every pose.",
    ],
    tools: 'Procreate · Photoshop · Affinity Photo',
    hours: '28h across 21 days',
    style: 'Painterly · ranger ref sheet',
    resolution: '6144 × 4096 px',
    revisions: '2 of 5 used',
    delivered: 'February 18, 2026',
    tags: ['High elf', 'D&D 5e', 'Ranger', 'Reference sheet', 'Scars', 'Fur cloak'],
    gradient: 'from-stone-900 via-amber-900 to-emerald-900',
    heroImage: '/images/portfolio/caracal-thalia/hero.webp',
    processImages: [
      { src: '/images/portfolio/caracal-thalia/hero.webp',      label: 'REFERENCE SHEET' },
      { src: '/images/portfolio/caracal-thalia/process-1.webp', label: 'SKETCH V1' },
      { src: '/images/portfolio/caracal-thalia/process-2.webp', label: 'SKETCH V2' },
    ],
    artistNote: "The Malar symbol had to look like she painted it herself, on her own armor, probably in low light. Too clean and the whole character falls apart.",
  },
  'ebag-ranger': {
    slug: 'ebag-ranger',
    title: 'Corwin Vell, Ranger in the Pines',
    category: 'Character Art',
    client: 'commissioned by Bren H.',
    description: [
      "A **full-body scene** of a ranger moving low through the woods with his longbow drawn, dark brown leather under a green cloak, the hood half up. Dark brown hair, brown eyes, the kind of face that goes quiet when the bow comes up. The forest stays loose in the background so the silhouette holds the frame.",
      "This was the sixth commission in a running series for Bren's D&D table, and at that point the character feels like a regular at the studio. The brief was short because it didn't need to be long anymore. The work this time was getting the cloak to read as moving with him rather than draped on him, and finding a green that sat against the pines without disappearing into them.",
    ],
    tools: 'Krita · Clip Studio Paint · Photoshop',
    hours: '15h across 11 days',
    style: 'Painterly · woodland ranger',
    resolution: '4096 × 6144 px',
    revisions: '1 of 4 used',
    delivered: 'March 31, 2026',
    tags: ['Ranger', 'D&D 5e', 'Longbow', 'Forest scene', 'Full body', 'Green cloak'],
    gradient: 'from-emerald-950 via-green-900 to-stone-800',
    heroImage: '/images/portfolio/ebag-ranger/hero.webp',
    processImages: [
      { src: '/images/portfolio/ebag-ranger/hero.webp',      label: 'FINAL' },
      { src: '/images/portfolio/ebag-ranger/process-1.webp', label: 'SKETCH' },
    ],
    artistNote: "By the sixth piece for the same character you stop needing reference docs. You just know how he stands.",
  },
  'thistle-quickpaw': {
    slug: 'thistle-quickpaw',
    title: 'Thistle Quickpaw, Rabbit-Folk Ranger',
    category: 'Character Art',
    client: 'commissioned by Tova L.',
    description: [
      "A **full-body anthropomorphic rabbit ranger** at 4'11\", leaning on a mirror-polished sword with a grin that's pure performance. Black fur shot through with pink streaks that shimmer when he moves, ruby necklace at the throat, light ranger armor cut for speed over weight. The twilight forest behind him glows faintly from pink moss on the trunks.",
      "Tova's D&D 5e brief came with a lot of character voice already written in: the sword is for posing more than fighting, the pink streaks in his fur are something younger rabbits insist are magical, his Blink ability leaves behind a puff of pink mist and a playing card stamped with a smiling rabbit. The whole job was making sure the pose read as welcoming and a little smug without tipping into cartoon. The polished sword had to reflect just enough of the mossy light to feel like part of the same scene.",
    ],
    tools: 'Procreate · Clip Studio Paint · Affinity Photo',
    hours: '20h across 15 days',
    style: 'Painterly · charming trickster',
    resolution: '4096 × 6144 px',
    revisions: '3 of 5 used',
    delivered: 'December 02, 2025',
    tags: ['Rabbit-folk', 'D&D 5e', 'Ranger', 'Full body', 'Twilight forest', 'Pink moss'],
    gradient: 'from-fuchsia-950 via-purple-900 to-indigo-800',
    heroImage: '/images/portfolio/thistle-quickpaw/hero.webp',
    processImages: [
      { src: '/images/portfolio/thistle-quickpaw/hero.webp',      label: 'FINAL' },
      { src: '/images/portfolio/thistle-quickpaw/process-1.webp', label: 'SKETCH V1' },
      { src: '/images/portfolio/thistle-quickpaw/process-2.webp', label: 'SKETCH V2' },
      { src: '/images/portfolio/thistle-quickpaw/process-3.webp', label: 'SKETCH V3' },
    ],
    artistNote: "Polished metal is a pain in a forest scene. You want it to reflect the moss without becoming a second light source.",
  },
  'hammock-chaos-warrior': {
    slug: 'hammock-chaos-warrior',
    title: 'Gwyn the Pale, Throned Warrior',
    category: 'Character Art',
    client: 'commissioned by Magnus V.',
    description: [
      "A pale-skinned chaos warrior in heavy black-and-gold ornate armor, sitting on a throne with a curved alien blade across his knee. Two side-arms strapped to his thighs with red sashes, and a wolf-head trophy on his right shoulder wearing a small grin that the client requested by name. The pose had to read as composure first and threat second, the kind of stillness that means the fight already ended somewhere offscreen.",
      "Magnus had been writing this character for years in a warhammer-style grimdark sci-fi homebrew and the brief came in with footnoted lore for the wolf head alone. The trophy belonged to a ginger beast named Gwyn the Pale, and the daemon nested inside it spent its afterlife playing two truths and a lie with anyone close enough to hear. We rendered the grin small. Just enough for the second viewing to catch it.",
    ],
    tools: 'Procreate · Photoshop · Affinity Photo',
    hours: '22h across 14 days',
    style: 'Painterly · grimdark stillness',
    resolution: '4096 × 5120 px',
    revisions: '4 of 5 used',
    delivered: 'December 10, 2025',
    tags: ['Grimdark', 'Chaos warrior', 'Throne pose', 'Black and gold', 'Wolf trophy', 'Sci-fi'],
    gradient: 'from-zinc-950 via-amber-900 to-yellow-700',
    heroImage: '/images/portfolio/hammock-chaos-warrior/hero.webp',
    processImages: [
      { src: '/images/portfolio/hammock-chaos-warrior/hero.webp',      label: 'COLOR V1' },
      { src: '/images/portfolio/hammock-chaos-warrior/process-1.webp', label: 'LINEART V2' },
      { src: '/images/portfolio/hammock-chaos-warrior/process-2.webp', label: 'SKETCH HYBRID' },
    ],
    artistNote: "The wolf-head grin was a one-line note in the brief. It ended up being the thing people notice last and remember longest.",
  },
  'hayden-banner': {
    slug: 'hayden-banner',
    title: 'Hayden Banner, Temple Rite',
    category: 'Custom Projects',
    client: 'commissioned by Hayden K.',
    description: [
      "A 16x9 banner of a ritual interior with robed figures arranged around an altar, pillars rising past the frame, and torchlight doing most of the storytelling. The brief was four lines long and that was on purpose. Hayden wanted atmosphere as a header image for a campaign hub, not a portrait, so the figures stay anonymous and the eye keeps moving across the composition.",
      "We pitched two altar treatments before settling on the low stone block with a single offering bowl, since busier altars kept pulling focus from the silhouettes. The torches were placed last and went through three rounds of warming up the palette, because the first pass looked more haunted house than fantasy temple. The final read is calm but watched, which was the note Hayden kept circling back to.",
    ],
    tools: 'Procreate · Photoshop · Krita',
    hours: '14h across 8 days',
    style: 'Atmospheric · cinematic banner',
    resolution: '7680 × 4320 px',
    revisions: '2 of 4 used',
    delivered: 'April 20, 2026',
    tags: ['Banner', 'Temple', 'Robed figures', 'Atmospheric', 'Torchlight', 'Campaign header'],
    gradient: 'from-stone-950 via-amber-900 to-orange-700',
    heroImage: '/images/portfolio/hayden-banner/hero.webp',
    processImages: [
      { src: '/images/portfolio/hayden-banner/hero.webp',      label: 'FINAL' },
      { src: '/images/portfolio/hayden-banner/process-1.webp', label: 'SKETCH V1' },
    ],
    artistNote: "Short briefs are the hardest kind. You spend the first day inventing constraints the client forgot to write down.",
  },
  'jockey-jotunborn-monk': {
    slug: 'jockey-jotunborn-monk',
    title: 'Brann Stoneveil, Jotunborn Monk',
    category: 'Character Art',
    client: 'commissioned by Petra D.',
    description: [
      "A jotunborn monk built like a circus strongman, pale grey skin lit from inside by a purple weave that runs the length of his forearms and creeps up the side of his neck. The pose lands halfway between stoic mountain-style stance and one of those old vaudeville strongman posters, which was exactly the contradiction Petra asked for. Student of the mountain, aspiring stone brawler, currently moonlighting under a striped tent.",
      "Petra plays him in a long-running Pathfinder game and sent the Paizo jotunborn iconic as her opening reference. From there the brief got specific about the glow: not magical lightning, more like cracks in a geode that happen to be alive. We tested three saturations of purple before the final settled on something closer to amethyst than neon. The strongman moustache was a late add and it stayed.",
    ],
    tools: 'Clip Studio Paint · Photoshop · Krita',
    hours: '18h across 11 days',
    style: 'Painterly · vaudeville strongman',
    resolution: '4096 × 5120 px',
    revisions: '2 of 5 used',
    delivered: 'May 08, 2026',
    tags: ['Pathfinder', 'Jotunborn', 'Monk', 'Strongman', 'Glowing weave', 'Stone brawler'],
    gradient: 'from-violet-950 via-purple-800 to-fuchsia-600',
    heroImage: '/images/portfolio/jockey-jotunborn-monk/hero.webp',
    processImages: [
      { src: '/images/portfolio/jockey-jotunborn-monk/hero.webp',      label: 'FINAL V3' },
      { src: '/images/portfolio/jockey-jotunborn-monk/process-1.webp', label: 'LINEART' },
      { src: '/images/portfolio/jockey-jotunborn-monk/process-2.webp', label: 'BASE COLOR' },
      { src: '/images/portfolio/jockey-jotunborn-monk/process-3.webp', label: 'FINAL V2' },
    ],
    artistNote: "Petra's note on the glow: 'like he swallowed a small storm and forgot.' That sentence ran the whole color pass.",
  },
  'lexia-half-drow-rogue': {
    slug: 'lexia-half-drow-rogue',
    title: 'Lexia, Half-Drow Rogue',
    category: 'Tokens',
    client: 'commissioned by Reyn S.',
    description: [
      "A profile-picture crop of a half-drow rogue named Lexia, body turned away from the camera, head swung back to look directly at it. Purple eyes, light grey skin, silvery-dark hair pulled tight. The expression is cold assessment, the kind of look that means she has already counted the exits and your coin purse. Background is an unfocused alley, dark enough to keep Lexia as the only light source in the frame.",
      "Reyn runs her in a D&D 5e campaign about a runaway from the Underdark who got outed for half-blood heritage and now scavenges and lifts on busy streets. He wanted the avatar to read as twenty-eight years old, not the usual ageless elf default, so we aged the skin around the eyes by maybe two degrees and let it sit there. The token ships at print resolution and a web crop so it works as both a PFP and a printable mini face.",
    ],
    tools: 'Procreate · Affinity Photo · Photoshop',
    hours: '9h across 6 days',
    style: 'Painterly · cold assessment',
    resolution: '2048 × 2048 px master + 512 × 512 px web',
    revisions: '1 of 3 used',
    delivered: 'April 01, 2026',
    tags: ['D&D 5e', 'Half-drow', 'Rogue', 'Token', 'PFP', 'Alley'],
    gradient: 'from-slate-950 via-violet-900 to-purple-700',
    heroImage: '/images/portfolio/lexia-half-drow-rogue/hero.webp',
    processImages: [
      { src: '/images/portfolio/lexia-half-drow-rogue/hero.webp',      label: 'FINAL' },
      { src: '/images/portfolio/lexia-half-drow-rogue/process-1.webp', label: 'LINEART V1' },
      { src: '/images/portfolio/lexia-half-drow-rogue/process-2.webp', label: 'LINEART V1.1' },
      { src: '/images/portfolio/lexia-half-drow-rogue/process-3.webp', label: 'FLATS' },
    ],
    artistNote: "Reyn approved the first lineart in twelve minutes. That has happened twice in five years.",
  },
  'mouse-desert-five': {
    slug: 'mouse-desert-five',
    title: 'The Desert Five, Arizona Night',
    category: 'Portraits',
    client: 'commissioned by Wynn O.',
    description: [
      "A five-character party group for a weird west campaign, staged in plain Arizona desert under a thin moon. Jaw stands partially turned away with arms crossed and that 'dragged into this' tilt, mouth shredded open on both sides by intent rather than accident. Maud poses, smug, in front of a board cross with 'Kingsley' scratched into the wood. Xander Khaine leans on a rock with his black duster open and rattlesnake-band hat low, easy as a Doc Holliday line read. Tara stances up in front of him with both guns crossed, smiling the nervous smile of someone trying too hard next to someone who never has. Ciel stands a pace out from the group with a doctor's bag and a smile she is barely managing to hide.",
      "Wynn sent the brief as five separate documents stapled together, and the hardest part was getting the personalities to sit next to each other without flattening any of them. The Kingsley gravesite is an in-joke the table has been running for a year, so it had to be readable as a real headstone first and a punchline second. The night palette went through two passes before the desert stopped looking blue and started looking the right kind of cold.",
    ],
    tools: 'Procreate · Photoshop · Clip Studio Paint',
    hours: '38h across 21 days',
    style: 'Painterly · weird west tableau',
    resolution: '6144 × 4096 px',
    revisions: '3 of 5 used',
    delivered: 'May 11, 2026',
    tags: ['Weird west', 'Group portrait', 'Five characters', 'Arizona night', 'Gunslingers', 'Party art'],
    gradient: 'from-orange-950 via-red-900 to-amber-700',
    heroImage: '/images/portfolio/mouse-desert-five/hero.webp',
    processImages: [
      { src: '/images/portfolio/mouse-desert-five/hero.webp',      label: 'COLORS V2' },
      { src: '/images/portfolio/mouse-desert-five/process-1.webp', label: 'BASE' },
      { src: '/images/portfolio/mouse-desert-five/process-2.webp', label: 'COLORS V1' },
    ],
    artistNote: "Tara's nervous smile next to Xander's easy one was the hardest fifteen pixels of the whole piece.",
  },
  'nan-gram-were': {
    slug: 'nan-gram-were',
    title: 'Nan Gram, the Skin-Wolf',
    category: 'Character Art',
    client: 'commissioned by Idris P.',
    description: [
      "A were-creature whose skeleton turned without bringing the fur along for the trip. Werewolf bones under human skin, knuckle-walking, head tilted, primate teeth bared in a way that reads territorial and embarrassed at the same time. Wolf jaws push out of the human mouth where the muzzle would be, top and bottom just gums and teeth with no skin connecting them. In the right hand, a crumpled tie dragging in the dirt. The character was a public defender before this happened, and Idris wanted the tie to look intentionally taken off, not torn.",
      "The concept Idris pitched was wolf into the bones of a human, with the body and spirit working out of phase. We held the hunch through every revision, kept the ears off, and went with chimplike feet instead of digitigrade after the first sketch made him read too clean. The face cast was a specific real-person reference the client described as not conventionally attractive, which is the kind of note that actually helps because it gives you a direction instead of a vibe.",
    ],
    tools: 'Krita · Photoshop · Affinity Photo',
    hours: '20h across 13 days',
    style: 'Painterly · body horror uncanny',
    resolution: '4096 × 5120 px',
    revisions: '4 of 5 used',
    delivered: 'April 03, 2026',
    tags: ['Werewolf', 'Body horror', 'Uncanny', 'D&D', 'Knuckle walk', 'Skin-wolf'],
    gradient: 'from-neutral-950 via-stone-800 to-red-900',
    heroImage: '/images/portfolio/nan-gram-were/hero.webp',
    processImages: [
      { src: '/images/portfolio/nan-gram-were/hero.webp',      label: 'COLOR V2' },
      { src: '/images/portfolio/nan-gram-were/process-1.webp', label: 'SKETCH' },
      { src: '/images/portfolio/nan-gram-were/process-2.webp', label: 'COLOR V1' },
    ],
    artistNote: "The tie did more lifting than the teeth did. A small civilian object in a monster's hand reads louder than any fang.",
  },
  'natknight-sci-trio': {
    slug: 'natknight-sci-trio',
    title: 'Mystic, Droid, Pilot',
    category: 'Portraits',
    client: 'commissioned by Corwin B.',
    description: [
      "Three black-and-white character illustrations for a space-opera sci-fi RPG, drawn at print resolution and built to stay legible on a home laser printer. A space-mystic with an energy blade in a tactical cloak, grounded and meditative. A personality-driven droid with expressive optics and segmented plating. A rogue pilot with the kind of jacket that has been re-stitched more than once. The brief came in with a long list of things the art could not look like, and that list ran most of the design decisions.",
      "Corwin is building a printer-friendly ttrpg sci-fi RPG inspired by a certain galaxy and a certain cyberpunk module, so the legal guardrails were strict from the first call. No lightsabers, no recognizable robes, no recognizable species, no logos, no terminology. We pulled the mystic toward something closer to a desert pilgrim, gave the droid optics that read as personality rather than franchise, and let the pilot live in the gritty negative-space tradition the cyberpunk reference came from.",
    ],
    tools: 'Clip Studio Paint · Photoshop · Krita',
    hours: '32h across 18 days',
    style: 'Ink linework · print-ready B&W',
    resolution: '3300 × 5100 px each at 300 DPI',
    revisions: '2 of 5 used',
    delivered: 'May 21, 2026',
    tags: ['Sci-fi', 'Black and white', 'Trio', 'Print-ready', 'TTRPG', 'Ink'],
    gradient: 'from-zinc-950 via-slate-800 to-neutral-600',
    heroImage: '/images/portfolio/natknight-sci-trio/hero.webp',
    processImages: [
      { src: '/images/portfolio/natknight-sci-trio/hero.webp',      label: 'GROUP COMPOSITE' },
      { src: '/images/portfolio/natknight-sci-trio/process-1.webp', label: 'MYSTIC SKETCH' },
      { src: '/images/portfolio/natknight-sci-trio/process-2.webp', label: 'PILOT B&W' },
      { src: '/images/portfolio/natknight-sci-trio/process-3.webp', label: 'DROID B&W' },
    ],
    artistNote: "The droid's optics went through nine passes. A face without a face is the hardest face to draw.",
  },
  'nerd-hobgoblin-token': {
    slug: 'nerd-hobgoblin-token',
    title: 'Nerd, Hobgoblin Investigator',
    category: 'Tokens',
    client: 'commissioned by Wren A.',
    description: [
      "A close-crop token of a hobgoblin investigator with her crossbow half-raised in a ready stance. Head and upper torso fill the frame, with just enough background to suggest the alley or stairwell she has decided to clear before anyone else gets a turn. Sharp orange skin, sharper expression, and the kind of pose that reads ready rather than aggressive.",
      "Wren plays her as a first-level investigator in a Pathfinder game and wanted the token to age well as she retrains into a gunslinger build later. We built the crossbow grip with that in mind, so when the weapon swap happens the hand position still works. Artist freedom on the rest, which mostly went toward the slight forward lean and the one stray strand of hair the helmet did not catch.",
    ],
    tools: 'Procreate · Affinity Photo · Clip Studio Paint',
    hours: '7h across 5 days',
    style: 'Painterly · ready stance token',
    resolution: '1024 × 1024 px + 512 × 512 px',
    revisions: '1 of 4 used',
    delivered: 'April 05, 2026',
    tags: ['Hobgoblin', 'Investigator', 'Token', 'Crossbow', 'Pathfinder', 'PFP'],
    gradient: 'from-red-950 via-orange-800 to-amber-600',
    heroImage: '/images/portfolio/nerd-hobgoblin-token/hero.webp',
    processImages: [
      { src: '/images/portfolio/nerd-hobgoblin-token/hero.webp',      label: 'FINAL' },
      { src: '/images/portfolio/nerd-hobgoblin-token/process-1.webp', label: 'SKETCH' },
    ],
    artistNote: "Designed the grip so the crossbow can swap to a pistol later without breaking the silhouette. Future Wren can thank present Wren.",
  },
  'palmerjwm-portrait': {
    slug: 'palmerjwm-portrait',
    title: 'Palmer, the Wandering Blade',
    category: 'Character Art',
    client: 'commissioned by Jordan W.',
    description: [
      "A **full-body fantasy swordsman** built from a sparse brief and a thick stack of mood boards. Palmer reads as a wandering blade with quiet menace, the kind of character a party picks up in a tavern and learns to fear by the third session. The reference pack carried most of the design weight, leaving the pose and framing for us to dial in until he held his own ground in the composition.",
      "Jordan came in with two sentences and a folder of pictures, which is honestly a comfortable way to work for D&D party portraits. We ran the clean linear pipeline on this one. Sketch first, base color second, render third, final pass last, with a check-in at every stage so nothing surprised him on delivery.",
    ],
    tools: 'Procreate · Photoshop · Affinity Photo',
    hours: '14h across 10 days',
    style: 'Painterly · wandering blade',
    resolution: '3840 × 5760 px',
    revisions: '2 of 4 used',
    delivered: 'March 06, 2026',
    tags: ['Swordsman', 'D&D 5e', 'Full body', 'Painterly', 'Wanderer', 'Character portrait'],
    gradient: 'from-slate-900 via-stone-800 to-zinc-700',
    heroImage: '/images/portfolio/palmerjwm-portrait/hero.webp',
    processImages: [
      { src: '/images/portfolio/palmerjwm-portrait/hero.webp',      label: 'FINAL' },
      { src: '/images/portfolio/palmerjwm-portrait/process-1.webp', label: 'SKETCH V1' },
      { src: '/images/portfolio/palmerjwm-portrait/process-2.webp', label: 'BASE COLOR' },
      { src: '/images/portfolio/palmerjwm-portrait/process-3.webp', label: 'RENDER V1' },
    ],
    artistNote: "Sparse briefs are a gift if the references are good. Jordan's were good.",
  },
  'pixel-runaway': {
    slug: 'pixel-runaway',
    title: 'Pixel, the Pink-Mohawk Runner',
    category: 'Character Art',
    client: 'commissioned by Bram H.',
    description: [
      "A **full-body fantasy rogue mid-sprint down a back alley**, skirts gathered in both fists, pink mohawk catching the lantern light. The brief opened with a line from the table: \"there is no question when the old lady lifts her skirts she can run.\" That sentence did most of the design work. Everything else came out of holding the energy of an older woman with bad knees and worse intentions moving faster than she has any right to.",
      "Bram played her as a D&D character whose joke kept paying off, and the art had to land the joke without flattening the danger. Two lineart passes locked the silhouette of the sprint, then the alley dropped in behind her with the lighting kept low so the mohawk and the lifted hem read first.",
    ],
    tools: 'Procreate · Clip Studio Paint · Photoshop',
    hours: '11h across 8 days',
    style: 'Painterly · punk-noir runner',
    resolution: '3840 × 5120 px',
    revisions: '1 of 3 used',
    delivered: 'May 04, 2026',
    tags: ['Rogue', 'D&D 5e', 'Punk', 'Full body', 'Mohawk', 'Alley scene'],
    gradient: 'from-fuchsia-950 via-rose-800 to-pink-600',
    heroImage: '/images/portfolio/pixel-runaway/hero.webp',
    processImages: [
      { src: '/images/portfolio/pixel-runaway/hero.webp',      label: 'RENDERS' },
      { src: '/images/portfolio/pixel-runaway/process-1.webp', label: 'LINEART V1' },
      { src: '/images/portfolio/pixel-runaway/process-2.webp', label: 'LINEART V2' },
    ],
    artistNote: "The mohawk was the only specific note in the brief. It earned its keep.",
  },
  'tharriq-laura-wedding': {
    slug: 'tharriq-laura-wedding',
    title: 'Tharriq & Laura, Wedding Avatars',
    category: 'Custom Projects',
    client: 'commissioned by Laura D.',
    description: [
      "**Three chibi avatars for a wedding website navigation bar**: Tharriq solo, Laura solo, and a couple piece for the landing page. Transparent backgrounds throughout, eyes open, closed-mouth expressions on both. Tharriq is a longtime MTG player and the head shape stayed flattering but recognizable. Laura wears her armor, which had to read correctly after a GPT mock-up the couple tested came out wrong in the shoulders.",
      "This is the rare commission that has nothing to do with TTRPGs. The use case set the constraints. Small avatars on a navigation bar mean clean silhouettes, no fiddly detail that would die at 64 pixels, and warm enough colors to survive whatever site background the couple picked later. We sketched Tharriq first to lock the face read, did his color pass, then ran Laura's color from the approved sketch in parallel.",
    ],
    tools: 'Procreate · Photoshop · Krita',
    hours: '9h across 6 days',
    style: 'Chibi · warm portrait',
    resolution: '2560 × 2560 px',
    revisions: '2 of 3 used',
    delivered: 'March 18, 2026',
    tags: ['Chibi', 'Wedding', 'Avatars', 'Couple portrait', 'Transparent BG', 'Web use'],
    gradient: 'from-rose-200 via-amber-300 to-orange-400',
    heroImage: '/images/portfolio/tharriq-laura-wedding/hero.webp',
    processImages: [
      { src: '/images/portfolio/tharriq-laura-wedding/hero.webp',      label: 'COUPLE FINAL' },
      { src: '/images/portfolio/tharriq-laura-wedding/process-1.webp', label: 'THARRIQ SKETCH' },
      { src: '/images/portfolio/tharriq-laura-wedding/process-2.webp', label: 'THARRIQ COLOR' },
      { src: '/images/portfolio/tharriq-laura-wedding/process-3.webp', label: 'LAURA COLOR' },
    ],
    artistNote: "Wedding work has a different kind of pressure. The art has to last longer than the website does.",
  },
  'truck-cyberpunk': {
    slug: 'truck-cyberpunk',
    title: 'Truck, Chrome and Cynic',
    category: 'Character Art',
    client: 'commissioned by Reyes K.',
    description: [
      "A **cyberpunk runner with tech-hair and chemskin**, leaning on a wall with an e-pen between two fingers and zero patience for whoever's about to talk to him. LED ribbons run along a flashier jacket, the kind that pulls more attention than the wearer probably wants. Butterfly swords sit at the hips as a quiet promise. EMP threading runs along one side of his face in fine circuit-like lines.",
      "Reyes wanted cynicism to read before anything else, so the pose did the heavy lifting and the palette followed. The first color pass came in warmer, then the revision pulled everything toward purple, which is what landed for cyberpunk in the way Reyes was running his table.",
    ],
    tools: 'Photoshop · Clip Studio Paint · Affinity Photo',
    hours: '18h across 14 days',
    style: 'Neon-noir · cynical runner',
    resolution: '4096 × 6144 px',
    revisions: '4 of 5 used',
    delivered: 'February 02, 2026',
    tags: ['Cyberpunk', 'Neon', 'Half body', 'Tech-hair', 'Butterfly swords', 'Purple palette'],
    gradient: 'from-purple-950 via-violet-800 to-fuchsia-600',
    heroImage: '/images/portfolio/truck-cyberpunk/hero.webp',
    processImages: [
      { src: '/images/portfolio/truck-cyberpunk/hero.webp',      label: 'V2 PURPLE' },
      { src: '/images/portfolio/truck-cyberpunk/process-1.webp', label: 'SKETCH' },
      { src: '/images/portfolio/truck-cyberpunk/process-2.webp', label: 'COLOR V1' },
    ],
    artistNote: "The first pass was correct and the second pass was right. Those aren't always the same thing.",
  },
  'truck2-shark-sorcerer': {
    slug: 'truck2-shark-sorcerer',
    title: 'Coral, the Moon-Crescent Sorcerer',
    category: 'Character Art',
    client: 'commissioned by Mira F.',
    description: [
      "A **shark-folk moon sorcerer mid-performance under a crescent moon**, peace signs out, blue scales catching the stage light, yellow eyes too bright for the rest of her face. Red clothes against the blue sharkskin, teeth a beat too sharp for the smile. The brief from the table called her \"sailor moon with teeth,\" which is the kind of note that does a lot of the design work before you even open the canvas.",
      "Mira plays her in D&D 5e as a manic-pixie front with a quieter sadness underneath. Her party found Coral exiled in another province, still performing every night because the only thing worse than the grief is sitting still with it. The art had to hold both readings at once, the perky stage presence and the thing behind the eyes, without letting either flatten the other.",
    ],
    tools: 'Procreate · Krita · Photoshop',
    hours: '15h across 11 days',
    style: 'Stage-lit · manic-pixie horror',
    resolution: '3840 × 4800 px',
    revisions: '3 of 5 used',
    delivered: 'May 11, 2026',
    tags: ['Sorcerer', 'D&D 5e', 'Shark-folk', 'Moon magic', 'Half body', 'Stage scene'],
    gradient: 'from-indigo-950 via-blue-700 to-sky-400',
    heroImage: '/images/portfolio/truck2-shark-sorcerer/hero.webp',
    processImages: [
      { src: '/images/portfolio/truck2-shark-sorcerer/hero.webp',      label: 'COLOR V2' },
      { src: '/images/portfolio/truck2-shark-sorcerer/process-1.webp', label: 'SKETCH V1' },
      { src: '/images/portfolio/truck2-shark-sorcerer/process-2.webp', label: 'SKETCH V2' },
      { src: '/images/portfolio/truck2-shark-sorcerer/process-3.webp', label: 'COLOR V1' },
    ],
    artistNote: "Teeth are doing a lot of quiet work in this one. So is the second sketch.",
  },
  'tyrannosaurus-glaive': {
    slug: 'tyrannosaurus-glaive',
    title: 'The Dawnglaive, 3-Stage Magic Weapon',
    category: 'Custom Projects',
    client: 'commissioned by Aldric M.',
    description: [
      "A **bordeaux-red glaive with forest-green striping, drawn across three escalating stages** for a D&D / Pathfinder item card. Stage 1 is the base weapon, fully rendered, with the blade already producing enough light to blind on a successful strike. Stage 2 stacks daylight on top, with bloom turned up and engraving glow brought forward along the haft. Stage 3 lifts to dawn, with stronger light rays, particle work, and a hotter core inside the blade itself.",
      "Aldric wanted the same silhouette across all three stages so the card would read at a glance, with only the intensity climbing as the player burned through charges. Solar motifs sit etched along the blade and only fully reveal at stage 3 when the engraving lights up. The stages were built as duplicates of the base render rather than separate paintings, which keeps continuity tight and lets the escalation feel like one weapon waking up.",
    ],
    tools: 'Photoshop · Affinity Photo · Procreate',
    hours: '13h across 9 days',
    style: 'Item card · escalating bloom',
    resolution: '3000 × 4500 px',
    revisions: '1 of 4 used',
    delivered: 'March 22, 2026',
    tags: ['Magic item', 'Weapon design', 'Glaive', 'D&D 5e', 'Pathfinder', 'Item card', 'Bordeaux'],
    gradient: 'from-red-950 via-rose-800 to-amber-500',
    heroImage: '/images/portfolio/tyrannosaurus-glaive/hero.webp',
    processImages: [
      { src: '/images/portfolio/tyrannosaurus-glaive/hero.webp',      label: 'STAGE 3 · DAWN' },
      { src: '/images/portfolio/tyrannosaurus-glaive/process-1.webp', label: 'STAGE 1 · BASE' },
      { src: '/images/portfolio/tyrannosaurus-glaive/process-2.webp', label: 'STAGE 2 · DAYLIGHT' },
      { src: '/images/portfolio/tyrannosaurus-glaive/process-3.webp', label: 'COLOR V1.1' },
    ],
    artistNote: "Same blade, three temperatures of light. The engraving only earns its glow at dawn.",
  },
  'vergil-hunter': {
    slug: 'vergil-hunter',
    title: 'Vergil, the Old Hunter',
    category: 'Character Art',
    client: 'commissioned by Cassian D.',
    description: [
      "An **aging hunter in 19th-century gothic-romantic dress**, half body, long coat falling open at the shoulders, wide-brimmed hat shadowing the upper face, a scythe-style weapon held at rest. Pose matched to the client's reference image down to the angle of the head. The palette stayed muted, mostly cold greys and bone, with the warmest value reserved for the skin of the hands.",
      "Cassian sent this in as souls-style gothic horror fan art, which gave the brief its own visual vocabulary before a single line went down. The age in the face had to feel earned, not just lined, so the underpainting carried more structural shadow than usual before any color sat on top. The coat was rendered with cloth weight in mind, since a younger hunter wouldn't wear it the same way.",
    ],
    tools: 'Photoshop · Clip Studio Paint · Krita',
    hours: '17h across 12 days',
    style: 'Gothic horror · aging hunter',
    resolution: '3840 × 4800 px',
    revisions: '2 of 5 used',
    delivered: 'April 18, 2026',
    tags: ['Hunter', 'Gothic horror', 'Souls-style', 'Half body', 'Fan art', 'Scythe'],
    gradient: 'from-zinc-950 via-stone-800 to-neutral-600',
    heroImage: '/images/portfolio/vergil-hunter/hero.webp',
    processImages: [
      { src: '/images/portfolio/vergil-hunter/hero.webp',      label: 'FINAL' },
      { src: '/images/portfolio/vergil-hunter/process-1.webp', label: 'SKETCH V1' },
      { src: '/images/portfolio/vergil-hunter/process-2.webp', label: 'COLOR V1' },
    ],
    artistNote: "Most of the age lives in the hands. The hat does the rest.",
  },
  'wolf-shonen-fanart': {
    slug: 'wolf-shonen-fanart',
    title: 'Kenji, the Student in Blue',
    category: 'Anime',
    client: 'commissioned by Wolf B.',
    description: [
      "A **young shōnen-anime martial artist**, half body, spiked hair, glasses, blue kimono layered over a purple training gi. One hand held out in a guard stance, weight settled, eyes forward. The reference pack the client sent ran heavy with embedded images, which made matching the silhouette and the gi proportions straightforward once lineart locked.",
      "Wolf commissioned this as cover art for an indie hip-hop release dropping in March, which gave the piece a different center of gravity than a typical portrait commission. The art had to hold up at album-cover scale and read cleanly when cropped for streaming thumbnails, so the lineart stayed bold and the color blocks landed flat before the soft rendering came in on top.",
    ],
    tools: 'Clip Studio Paint · Photoshop · Procreate',
    hours: '12h across 9 days',
    style: 'Shōnen anime · cover art',
    resolution: '4000 × 4000 px',
    revisions: '2 of 3 used',
    delivered: 'March 18, 2026',
    tags: ['Anime', 'Shōnen', 'Half body', 'Fan art', 'Cover art', 'Martial artist'],
    gradient: 'from-blue-900 via-indigo-700 to-purple-500',
    heroImage: '/images/portfolio/wolf-shonen-fanart/hero.webp',
    processImages: [
      { src: '/images/portfolio/wolf-shonen-fanart/hero.webp',      label: 'WITH BG' },
      { src: '/images/portfolio/wolf-shonen-fanart/process-1.webp', label: 'LINEART' },
      { src: '/images/portfolio/wolf-shonen-fanart/process-2.webp', label: 'COLOR V1' },
      { src: '/images/portfolio/wolf-shonen-fanart/process-3.webp', label: 'COLOR V2' },
    ],
    artistNote: "Album covers live or die at thumbnail size. The glasses had to survive the crop.",
  },
  'stormwatch-adventuring-party': {
    slug: 'stormwatch-adventuring-party',
    title: 'Stormwatch Adventuring Party',
    category: 'Portraits',
    client: 'commissioned by the Stormwatch table',
    description: [
      '**Five party members** in a single frame — gnome wizard, drow ranger, dwarven cleric, half-elf bard, and human fighter — caught mid-camp on the eve of their final session.',
      'Each character was developed in 80+ sessions of play. The brief was a 14-page shared doc. The challenge: keep five distinct silhouettes legible at every reading distance.',
    ],
    tools: 'Procreate · Photoshop',
    hours: '42h across 38 days',
    style: 'Painterly · campfire light',
    resolution: '6144 × 4096 px',
    revisions: '2 of 2 used',
    delivered: 'January 22, 2026',
    tags: ['Party Portrait', 'D&D 5e', 'Group', 'Painterly', 'Campfire', 'Five figures'],
    gradient: 'from-emerald-900 via-teal-700 to-cyan-600',
    artistNote:
      'The hardest part was the **gnome** — small figures need bigger gestures to read at distance. Three poses later, we found her.',
  },
}

/* Related-pieces lookup (kept lean — three siblings per piece) */
const RELATED: Array<{ slug: string; title: string; category: string; gradient: string; meta: string }> = [
  { slug: 'aldric-half-elf-paladin',   title: 'Aldric · half-elf paladin',     category: 'Character Art', gradient: 'from-amber-900 via-yellow-700 to-orange-600', meta: 'Painterly · Mar 2026' },
  { slug: 'drowned-captain-veska',     title: 'Drowned Captain Veska',          category: 'Character Art', gradient: 'from-slate-800 via-teal-700 to-emerald-600',  meta: 'Painterly · Feb 2026' },
  { slug: 'brennen-bardic-dropout',    title: 'Brennen · bardic dropout',       category: 'Character Art', gradient: 'from-amber-800 via-rose-700 to-pink-600',     meta: 'Painterly · Jan 2026' },
]

/* =====================================================================
   STATIC PARAMS + METADATA
   ===================================================================== */

export function generateStaticParams() {
  return Object.keys(PIECES).map((slug) => ({ slug }))
}

/** Strip markdown emphasis tokens for SEO meta description (plain text). */
function stripMarkdown(s: string): string {
  return s.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/\[(.*?)\]\([^)]+\)/g, '$1')
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const piece = PIECES[slug]
  if (!piece) {
    return { title: 'Portfolio piece not found · Design Vortek' }
  }
  const first = stripMarkdown(piece.description[0])
  const desc = first.length > 160 ? first.slice(0, 157) + '...' : first
  return {
    title: `${piece.title} · ${piece.category} · Design Vortek`,
    description: desc,
    alternates: { canonical: `/portfolio/${piece.slug}` },
    openGraph: {
      title: `${piece.title} · ${piece.category}`,
      description: desc,
      type: 'article',
    },
  }
}

/* =====================================================================
   PAGE
   ===================================================================== */

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const piece = PIECES[slug]

  if (!piece) {
    notFound()
  }

  // JSON-LD: CreativeWork
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: piece.title,
    headline: piece.title,
    genre: piece.category,
    description: piece.description.map(stripMarkdown).join(' '),
    keywords: piece.tags.join(', '),
    creator: { '@type': 'Organization', name: 'Design Vortek' },
    dateCreated: piece.delivered,
    inLanguage: 'en',
  }

  return (
    <>
      <SiteHeader />
      <main className="bg-parchment-50">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />

        {/* Breadcrumbs */}
        <section className="pt-[120px] pb-6">
          <Container>
            <nav
              aria-label="Breadcrumb"
              className="flex items-center flex-wrap gap-2 text-xs uppercase tracking-[0.12em] text-ink-500 font-semibold"
            >
              <Link href="/" className="hover:text-burgundy-700 transition-colors">Home</Link>
              <ChevronRight size={12} strokeWidth={1.8} className="text-ink-400" />
              <Link href="/portfolio" className="hover:text-burgundy-700 transition-colors">Portfolio</Link>
              <ChevronRight size={12} strokeWidth={1.8} className="text-ink-400" />
              <Link
                href={`/portfolio?category=${encodeURIComponent(piece.category)}`}
                className="hover:text-burgundy-700 transition-colors"
              >
                {piece.category}
              </Link>
              <ChevronRight size={12} strokeWidth={1.8} className="text-ink-400" />
              <span className="text-ink-700 normal-case tracking-normal" aria-current="page">{piece.title}</span>
            </nav>
          </Container>
        </section>

        {/* Two-column detail */}
        <section className="pb-20">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-16">
              {/* Left: hero image + thumb gallery */}
              <div>
                {/* HERO — real artwork via next/image when heroImage is set,
                    otherwise the original gradient placeholder. Gradient is
                    always rendered as the backdrop so transparent edges and
                    letter-box bars (for non-4:5 sources) tint correctly. */}
                <div
                  className={cn(
                    'relative rounded-2xl overflow-hidden border border-border-medium aspect-[4/5] bg-gradient-to-br',
                    piece.gradient,
                  )}
                >
                  {piece.heroImage ? (
                    <Image
                      src={piece.heroImage}
                      alt={`${piece.title} — hand-painted portrait`}
                      fill
                      sizes="(min-width: 1024px) 56vw, 100vw"
                      className="object-contain"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
                      <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm" />
                    </div>
                  )}
                  <button
                    type="button"
                    aria-label="Zoom image"
                    className="absolute bottom-4 right-4 z-10 w-10 h-10 rounded-full bg-tome-950/70 backdrop-blur-sm flex items-center justify-center text-cream-50 hover:bg-tome-950/90 transition-colors cursor-pointer"
                  >
                    <ZoomIn size={16} strokeWidth={1.6} />
                  </button>
                </div>

                {/* PROCESS THUMBS — iterate piece.processImages when set
                    (each entry = real stage), otherwise fall back to the
                    legacy 4 gradient-filtered placeholder squares. */}
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {piece.processImages && piece.processImages.length > 0 ? (
                    piece.processImages.slice(0, 4).map((thumb, i) => (
                      <div
                        key={thumb.label}
                        className={cn(
                          'relative aspect-square rounded-lg overflow-hidden border cursor-pointer transition-all bg-gradient-to-br',
                          piece.gradient,
                          i === 0
                            ? 'border-gold-500 ring-2 ring-gold-500/30'
                            : 'border-border-light opacity-90 hover:opacity-100',
                        )}
                      >
                        <Image
                          src={thumb.src}
                          alt={`${piece.title} — ${thumb.label.toLowerCase()} stage`}
                          fill
                          sizes="(min-width: 1024px) 140px, 22vw"
                          className="object-cover"
                        />
                        <span className="absolute bottom-1.5 left-1.5 z-10 text-[0.5625rem] font-semibold uppercase tracking-[0.12em] text-cream-50 bg-tome-950/60 px-1.5 py-0.5 rounded">
                          {thumb.label}
                        </span>
                      </div>
                    ))
                  ) : (
                    ['FINAL', 'SKETCH', 'BLOCK', 'REV 01'].map((label, i) => (
                      <div
                        key={label}
                        className={cn(
                          'relative aspect-square rounded-lg overflow-hidden border bg-gradient-to-br cursor-pointer transition-all',
                          piece.gradient,
                          i === 0
                            ? 'border-gold-500 ring-2 ring-gold-500/30'
                            : 'border-border-light opacity-75 hover:opacity-100',
                        )}
                        style={{
                          filter:
                            i === 1
                              ? 'grayscale(1) brightness(1.1)'
                              : i === 2
                                ? 'saturate(0.4)'
                                : i === 3
                                  ? 'hue-rotate(30deg)'
                                  : undefined,
                        }}
                      >
                        <span className="absolute bottom-1.5 left-1.5 text-[0.5625rem] font-semibold uppercase tracking-[0.12em] text-cream-50 bg-tome-950/60 px-1.5 py-0.5 rounded">
                          {label}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right: meta + details (sticky on desktop) */}
              <aside className="lg:sticky lg:top-28 self-start">
                <div className="text-[0.625rem] uppercase tracking-[0.15em] font-bold text-burgundy-700 mb-2">
                  {piece.category}
                </div>
                <h1
                  className="font-display font-semibold text-ink-900 leading-[1.05] tracking-tight"
                  style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)' }}
                >
                  {piece.title}
                </h1>
                <div className="font-accent text-2xl text-burgundy-700 mt-2">{piece.client}</div>

                {/* Description — rendered via Markdown so **bold** + [links] survive */}
                <div className="mt-6 space-y-4 text-ink-700 leading-[1.7] [&_p]:mb-0">
                  {piece.description.map((md, i) => (
                    <Markdown key={i}>{md}</Markdown>
                  ))}
                </div>

                {/* Specs */}
                <dl className="mt-8 border-t border-border-light divide-y divide-border-light">
                  {[
                    ['Tools', piece.tools],
                    ['Hours', piece.hours],
                    ['Style', piece.style],
                    ['Resolution', piece.resolution],
                    ['Revisions', piece.revisions],
                    ['Delivered', piece.delivered],
                  ].map(([dt, dd]) => (
                    <div key={dt} className="flex items-center justify-between py-3 text-sm">
                      <dt className="uppercase tracking-[0.12em] text-[0.6875rem] font-semibold text-ink-500">
                        {dt}
                      </dt>
                      <dd className="text-ink-900 font-medium text-right">{dd}</dd>
                    </div>
                  ))}
                </dl>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-6">
                  {piece.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.1em] bg-parchment-100 border border-border-light text-ink-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap gap-3 mt-8">
                  <LinkButton href="/order" variant="primary" size="md">
                    Commission something like this <ArrowRight size={14} strokeWidth={1.8} />
                  </LinkButton>
                  <LinkButton href="/portfolio" variant="outline" size="md">
                    See more {piece.category}
                  </LinkButton>
                </div>
              </aside>
            </div>
          </Container>
        </section>

        {/* From the artist — pull-quote */}
        <section className="pb-20">
          <Container narrow>
            <figure className="relative bg-parchment-100 border border-border-light rounded-2xl p-10 md:p-14 text-center">
              <blockquote className="font-display italic text-2xl md:text-3xl text-ink-900 leading-[1.4] [&_strong]:not-italic [&_strong]:font-semibold">
                <span className="text-burgundy-700">&ldquo;</span>
                <Markdown className="inline">{piece.artistNote}</Markdown>
                <span className="text-burgundy-700">&rdquo;</span>
              </blockquote>
              <figcaption className="font-accent text-xl text-burgundy-700 mt-5">— from the studio</figcaption>
            </figure>
          </Container>
        </section>

        {/* More from this collection */}
        <section className="bg-parchment-100 py-24">
          <Container>
            <div className="text-center max-w-[640px] mx-auto mb-12">
              <div className="mb-4 flex justify-center">
                <SectionLabel>More from this collection</SectionLabel>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 leading-tight tracking-tight">
                Related <em className="font-display italic font-medium text-burgundy-700">{piece.category.toLowerCase()}</em>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {RELATED.map((r) => (
                <Link
                  key={r.slug}
                  href={`/portfolio/${r.slug}`}
                  className="group block bg-parchment-50 border border-border-light rounded-2xl overflow-hidden hover:border-border-medium hover:shadow-[0_12px_32px_rgba(30,20,8,0.10)] transition-shadow"
                >
                  <div className={cn('relative aspect-[4/5] bg-gradient-to-br overflow-hidden', r.gradient)}>
                    <div className="absolute top-3 left-3 inline-flex items-center px-3 py-1 rounded-full text-[0.625rem] font-bold uppercase tracking-[0.15em] bg-tome-950/70 backdrop-blur-sm text-gold-glow">
                      {r.category}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold text-ink-900 leading-tight group-hover:text-burgundy-700 transition-colors">
                      {r.title}
                    </h3>
                    <div className="text-xs text-ink-500 mt-1">{r.meta}</div>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>

        {/* CTA strip */}
        <section className="relative bg-tome-950 text-cream-50 py-24 overflow-hidden">
          <Container>
            <div className="max-w-[640px] mx-auto text-center">
              <h2
                className="font-display font-semibold text-cream-50 leading-[1.1] tracking-tight"
                style={{ fontSize: 'clamp(2rem, 4.5vw, 3.25rem)' }}
              >
                Your character, <em className="font-display italic font-medium text-gold-glow">painted</em>.
              </h2>
              <p className="text-lg text-cream-200 leading-relaxed mt-4">
                Tell us about them. We&rsquo;ll send a quote within 48 hours.
              </p>
              <div className="inline-flex flex-wrap justify-center gap-3 mt-8">
                <Button href="/order" variant="gold" size="lg">
                  Start commission <ArrowRight size={14} strokeWidth={1.8} />
                </Button>
                <Button href="/portfolio" variant="outline-cream" size="lg">
                  View more work
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
