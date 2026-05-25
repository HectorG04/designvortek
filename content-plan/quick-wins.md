# Quick Wins — re-tag existing 7 posts as pillar spokes

Five existing posts already cover spoke topics from the new content plan. Re-tagging them takes 60 seconds in Supabase and makes them immediately appear as spokes under the relevant pillar pages. Do this *before* the new content lands so the pillar pages don't show empty spoke racks.

## What needs to change

Each post needs:
- The genre slug added to `tags` (so `fetchPostsByGenre()` finds it)
- `is_pillar = false` (already the default, but verify)
- Category stays as-is

## SQL — paste into Supabase SQL Editor

```sql
-- 1. Hero Forge → hand-painted: tag as D&D 5e spoke
update public.blog_posts
   set tags = array(select distinct unnest(coalesce(tags, '{}'::text[]) || array['dnd-5e', 'commissioning']))
 where slug = 'hero-forge-to-handpainted';

-- 2. VTT token deserves more: tag as D&D 5e + cyberpunk + sci-fi spoke (multi-genre — tokens span genres)
update public.blog_posts
   set tags = array(select distinct unnest(coalesce(tags, '{}'::text[]) || array['dnd-5e']))
 where slug = 'vtt-token-deserves-more';

-- 3. Curse of Strahd NPC pack: tag as horror + D&D 5e spoke
update public.blog_posts
   set tags = array(select distinct unnest(coalesce(tags, '{}'::text[]) || array['horror', 'dnd-5e']))
 where slug = 'strahd-npc-pack-six-weeks';

-- 4. Three weeks with Lyra: tag as fantasy + D&D 5e spoke (Lyra is a tiefling sorcerer — fantasy first, D&D second)
update public.blog_posts
   set tags = array(select distinct unnest(coalesce(tags, '{}'::text[]) || array['fantasy', 'dnd-5e']))
 where slug = 'three-weeks-with-lyra';

-- 5. Choosing a commission style: cross-genre evergreen — tag with multiple genres so it appears under every pillar's spoke rail
update public.blog_posts
   set tags = array(select distinct unnest(coalesce(tags, '{}'::text[]) || array['fantasy', 'dnd-5e', 'sci-fi', 'cyberpunk', 'horror', 'modern', 'historical', 'souls-anime', 'western']))
 where slug = 'choosing-a-commission-style';

-- 6. How to write a commission brief: cross-genre evergreen — same multi-genre tagging
update public.blog_posts
   set tags = array(select distinct unnest(coalesce(tags, '{}'::text[]) || array['fantasy', 'dnd-5e', 'sci-fi', 'cyberpunk', 'horror', 'modern', 'historical', 'souls-anime', 'western']))
 where slug = 'how-to-write-commission-brief';

-- 7. First art fair booth: studio reflection — tag lightly with 'studio' so it doesn't pollute pillar pages
update public.blog_posts
   set tags = array(select distinct unnest(coalesce(tags, '{}'::text[]) || array['studio']))
 where slug = 'first-art-fair-booth';
```

## Verify after running

```sql
select slug, tags, is_pillar, pillar_genre
  from public.blog_posts
 where slug in (
   'hero-forge-to-handpainted',
   'vtt-token-deserves-more',
   'strahd-npc-pack-six-weeks',
   'three-weeks-with-lyra',
   'choosing-a-commission-style',
   'how-to-write-commission-brief',
   'first-art-fair-booth'
 )
 order by slug;
```

Each row should now have the genre slug(s) in its tags array. The `/pillars/[genre]` page will pull them via `fetchPostsByGenre()` and they'll appear immediately on the next ISR refresh (≤ 60 seconds).

## When to run

Run this BEFORE pushing the 75 new articles. That way:
1. Existing posts appear as spokes immediately
2. New articles land into populated genre rails (not empty pillars)
3. The "huge web" interlinking feels live from day one

If new articles ship first, run this anyway — the genre rails will just be sparser until step 1 completes.
