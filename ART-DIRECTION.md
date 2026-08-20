# Fieldnote — art direction

Visual reference: `art-direction-reference.html`. Open it in a browser; the build should look
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

  --font-display: "Zodiak", Georgia, serif;
  --font-body:    "Newsreader", Georgia, serif;
  --font-meta:    "IBM Plex Mono", ui-monospace, monospace;
}
```

Newsreader and IBM Plex Mono load with `next/font/google`, variable, `display: "swap"`,
subset `latin`. Zodiak is not on Google Fonts — that is part of why it is here — so it loads
with `next/font/local` from a file the build fetches from [Fontshare](https://www.fontshare.com/fonts/zodiak).
It is free for commercial use, but its licence forbids both redistribution and subsetting, so
the font is not committed to this repo and is never run through a subsetter.
`scripts/fetch-fonts.mjs` holds the detail.

Zodiak's only axis is weight. Nothing sets `font-variation-settings` on it: the weight in the
table below is the whole instruction.

**Display face history.** This was Fraunces, with its SOFT and WONK axes. Fraunces is one of
a small set of faces that generated interfaces converge on, and with this audience that
association is the problem — not the drawing, which is good. Zodiak gives the same
high-contrast display serif with real character and no such inheritance. Newsreader stays;
body text was never what was being read as generated.

## Type

| Role | Face | Size | Leading | Tracking |
|---|---|---|---|---|
| Masthead | Zodiak 300 | `clamp(3.5rem, 11vw, 9rem)` | 0.86 | −0.035em |
| Article h1 | Zodiak 300 | `clamp(2.25rem, 5vw, 3.25rem)` | 1.02 | −0.028em |
| h2 | Zodiak 400 | 2.5rem | 1.08 | −0.02em |
| h3 | Zodiak 500 | 1.5rem | 1.2 | 0 |
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

- **Drop cap**, Zodiak, ochre, first paragraph of an article only. Never elsewhere.
- **Hanging punctuation** on body copy (`hanging-punctuation: first last`).
- **Rules above and below pull quotes**, 2px solid ink, quote in Zodiak 300.
- **Byline bar** — mono, uppercase, hairline rule top and bottom, author left, issue and
  reading time right.
- **Asides** — 3px moss left border, mono label above the text.
- **Captions** — mono, muted, description left, credit pushed right on the same line.
- **Index rows** — number, title with mono sub-line, reading time right; hairline between.
- **Topic kicker** — the topic name in mono ochre, tracked and uppercase, above an article
  headline. One per headline, and only the topic; never a label invented for the layout.

### The kicker is a deliberate exception

Automated design audits ban the small tracked label above a heading outright — `/impeccable`
calls it "a ban, not a default: no brief earns it back". It is kept here anyway. It is in
`art-direction-reference.html`, it is how a magazine signals section before it signals story,
and a topic name is real information rather than decoration.

What the ban is actually right about is the invented kicker. A "Current issue" label above
the issue block on the homepage had no backing in the reference and said nothing the block
did not already say; it has been removed. The rule is therefore: a kicker carries a topic, or
it does not exist.

## Motion

A 150ms colour transition on links. Nothing animates on scroll. `prefers-reduced-motion`
honoured regardless — and say so in the README, because it's the kind of thing this audience
checks.

## One accent per view

Ochre for editorial emphasis, moss for structural asides. Never both in the same component.
