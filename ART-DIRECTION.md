# Fieldnote — art direction

Visual reference: `fieldnote-art-direction.html`. Open it in a browser; the build should look
like that.

**Supersedes** the imagery instruction in `DEMO-BRIEFS.md`. That said "openly-licensed
photography", which contradicts the standing no-stock-photography rule. The rule wins.
Fieldnote uses **generated riso artwork**, never photographs.

---

## Tokens — Tailwind v4 `@theme`

```css
@theme {
  --color-paper:   #F7F4EE;
  --color-paper-2: #EFEAE0;
  --color-ink:     #14120F;
  --color-ink-2:   #3A352E;
  --color-muted:   #7A7266;
  --color-rule:    #DDD5C7;
  --color-ochre:   #B8642A;   /* editorial emphasis */
  --color-moss:    #3D5142;   /* structural asides */

  --font-display: "Fraunces", Georgia, serif;
  --font-body:    "Newsreader", Georgia, serif;
  --font-meta:    "IBM Plex Mono", ui-monospace, monospace;
}
```

Load with `next/font/google`, all three variable, `display: "swap"`, subset `latin`.
Fraunces uses `font-variation-settings: "SOFT" 20, "WONK" 1` at display sizes — that's what
gives it character rather than looking like default Georgia.

## Type

| Role | Face | Size | Leading | Tracking |
|---|---|---|---|---|
| Masthead | Fraunces 300 | `clamp(3.5rem, 11vw, 9rem)` | 0.86 | −0.035em |
| Article h1 | Fraunces 300 | `clamp(2.25rem, 5vw, 3.25rem)` | 1.02 | −0.028em |
| h2 | Fraunces 400 | 2.5rem | 1.08 | −0.02em |
| h3 | Fraunces 500 | 1.5rem | 1.2 | 0 |
| Standfirst | Newsreader italic | 1.3rem | 1.5 | 0 |
| Body | Newsreader 400 | 1.125rem | 1.7 | 0 |
| Metadata | IBM Plex Mono 400 | 0.7rem | 1.6 | 0.14em, uppercase |

Negative tracking on display sizes only. Never on body.

## Layout

- Body measure capped at **34rem** (~66 characters). Pull quotes and figures may break it;
  nothing else may.
- Page container 1100px max, 32px gutters.
- Structure via **hairline rules and whitespace**. No cards, no shadows, no rounded corners.

## Imagery — generative riso

Two-colour abstract SVG forms on paper: ochre and moss at 50–85% opacity with
`mix-blend-mode: multiply`, which produces the overprint look of real risograph printing.
Three families in the reference: **ridgelines** (angular polygons), **overlapping ellipses**,
and **contour lines** with a solid block.

Build these as a small React component taking a seed and a shape family, so every article
gets a distinct, deterministic image. **That component is itself a talking point in the
README** — it's the answer to "where did the images come from", and it's more interesting
than a stock photo credit.

## Signature details

These are what make it read as designed rather than themed. Do not skip them.

- **Drop cap**, Fraunces, ochre, first paragraph of an article only. Never elsewhere.
- **Hanging punctuation** on body copy (`hanging-punctuation: first last`).
- **Rules above and below pull quotes**, 2px solid ink, quote in Fraunces 300.
- **Byline bar** — mono, uppercase, hairline rule top and bottom, author left, issue and
  reading time right.
- **Asides** — 3px moss left border, mono label above the text.
- **Captions** — mono, muted, description left, credit pushed right on the same line.
- **Index rows** — number, title with mono sub-line, reading time right; hairline between.

## Motion

A 150ms colour transition on links. Nothing animates on scroll. `prefers-reduced-motion`
honoured regardless — and say so in the README, because it's the kind of thing this audience
checks.

## Not looking AI-generated

The audience is design-led studios and editorial people. They detect the generated look
quickly, and it is disqualifying. Three specific defences.

### 1. Riso art must be imperfect

Clean procedural shapes read as "AI abstract art". Three fixes, in order of effect:

- **Misregistration.** Real riso offsets colour layers by a millimetre or two because the
  paper shifts between passes. Offset the second colour layer by **2–4px** on both axes,
  varied per seed. This single change is what makes it read as print rather than vector.
- **Paper grain.** A low-opacity `feTurbulence` / `feColorMatrix` noise overlay across the
  whole image, ~4–8% opacity.
- **Ink density variation.** Vary shape opacity slightly (say 0.55–0.85) rather than using
  one flat value, and let edges be marginally rough rather than mathematically perfect.

### 2. The prose is the real risk

These studios read writing for a living. Fluent, evenly-paced, structurally identical
articles are the tell.

- **Vary the shape of the publication.** Not 12 × 900 words. Four full articles, three short
  notes of ~200 words, two single-paragraph fragments. That's how a real magazine
  distributes.
- **Concrete, checkable specifics.** "The Abergwesyn pass is unsurfaced for eleven miles"
  reads as real. "A journey through beautiful landscape" reads as generated. Place names,
  distances, dates, prices, tool gauges, timings.
- **Write at least two pieces yourself.** Uneven human writing beats smooth machine writing
  with this audience. It does not need to be good.

### 3. Let it be irregular

Every article the same length, every entry with an image, every row aligned — that evenness
is itself a signal. Let one article run long, one carry no image, and the index hold an odd
number of entries.

## One accent per view

Ochre for editorial emphasis, moss for structural asides. Never both in the same component.
