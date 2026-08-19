# Follow-ups

Things found during the finishing pass and deliberately not fixed, because they
are P2/P3 — no user-visible defect, or a change of scope rather than a fix.
P0s and P1s from that pass were fixed and are in the git history.

> `/impeccable audit` v4.1.1 has now run against the source and against both
> live pages at desktop and mobile viewports. Its P1 findings were fixed; what
> it raised and this pass did not act on is recorded below.

---

## Needs your decision — Impeccable vs the art direction

**Kickers.** The detector bans the small tracked label above a heading, and its
craft floor is unusually absolute about it: *"This one is a ban, not a default:
no brief earns it back."* But `art-direction-reference.html` shows exactly that
pattern — `<p class="kicker">Field report</p>` above the article title — so the
element is in your own pinned design.

Two instances: the topic name above an article headline, and "Current issue"
above the issue title on the homepage. The second is mine and has no backing in
the reference; the first does.

I have not removed either. Deleting a documented element of your art direction
on a third-party tool's say-so is your call, not mine, and this pass was scoped
to fixes rather than redesign. Either drop the kickers and update
`ART-DIRECTION.md`, or record the exception so the finding stops resurfacing.

## Accepted deviations — the brief wins

Impeccable's own precedence rule is that a pinned brief beats a
saturated-pattern warning. These three are flagged on every scan and are all
specified in `ART-DIRECTION.md`, so they stay:

- **`overused-font: Fraunces`** — named as a face that AI-generated interfaces
  converge on. It is the display face the art direction pins, with SOFT and
  WONK settings the spec gives explicitly.
- **`cream-palette` (#F7F4EE)** — flagged as the default "tasteful" AI surface.
  It is `--color-paper`, straight from the spec's token table.
- **`tight-leading` 1.02 and 1.18** — the rule wants 1.3 minimum and explains
  itself in terms of body text. These are display sizes: 1.02 is the article h1
  leading the spec sets by name, and 1.18 is a pull quote at 1.9rem. Body copy
  runs at 1.7.

Two more from the craft floor that the brief pins: monospace used for metadata
rather than code, and 01/02/03 index numbering. Both are in the spec's
signature details.

## P2 — worth doing before this goes in front of anyone

**Article copy is placeholder.** Nine articles were written by Claude for the
seed. `ART-DIRECTION.md` names machine-smooth prose as the disqualifying tell
with a design-led readership, and asks for at least two pieces written by hand.
The README says so plainly, so nothing currently misrepresents itself.

**`hello@example.com` on the contact page.** Fine as a reserved placeholder,
wrong if anyone might actually try to make contact through the site.

**No embedded-video block.** `FIELDNOTE-SPEC.md` §3 lists one among the custom
Portable Text blocks; the build has pull quote, captioned image, gallery and
aside. Adding it is a feature, which this pass was explicitly scoped out of.

**Largest Contentful Paint is 2.8–2.9s.** Green overall, but LCP itself is
amber — Lighthouse wants under 2.5s. The remaining cost is ~190KB of preloaded
webfonts, and the LCP element is text set in them. Every remaining lever trades
typography for milliseconds: `font-display: optional` would pin first-time
mobile visitors to a fallback face, and dropping the Newsreader italic would
mean synthesised obliques. Both are the wrong trade for a site whose audience
is design studios.

**The article's performance score sits close to the 95 line.** Across three
runs it scored 94, 96 and 96, and the homepage 95, 96 and 97. Lighthouse's
simulated throttling has a few points of variance, so a slow run can put the
article just under. Getting comfortable headroom means the LCP work above.

## P3 — cosmetic, or a decision to record rather than a defect

**The palette deviates from `ART-DIRECTION.md`.** Muted was specified as
`#7A7266` and ochre as `#B8642A`. At the 0.7rem the metadata is set in, those
measure 4.32:1 and 3.91:1 against paper, and WCAG AA needs 4.5:1. They are now
`#6F675B` (5.08:1) and `#A6551F` (4.85:1). The spec should be updated to match,
or the type scale changed so the old values pass — but not both left as they
were, because as written they cannot both be satisfied.

**Caution asides use ochre, not moss.** The spec gives asides a 3px moss border
and does not cover the `caution` tone the schema allows. Ochre distinguishes it;
moss for both would make the two tones identical.

**`font-optical-sizing: auto` in `globals.css` is a no-op.** It was added for
Newsreader, which is loaded without the `opsz` axis, so there is nothing for it
to act on. Harmless, and worth removing next time that file is touched.

**Article pages ship ~108KB of client JavaScript.** `DEMO-BRIEFS.md` sets
"zero client JS on article pages if you can manage it" as a stretch goal. What
remains is the React and Next runtime — the page's own components add nothing
measurable, and `VisualEditing` is correctly code-split out of the reader
bundle. Removing the rest is not possible in the App Router without abandoning
it.

**Social links point at `example.com`.** Correct as placeholders — the domain is
IANA-reserved and can never belong to anyone — but they are still links to
nothing. Replace with real accounts or delete the rows in Site settings.

**No custom domain.** The site is on `fieldnote-one.vercel.app`.

**`ART-DIRECTION.md` supersedes `FIELDNOTE-SPEC.md` on imagery.** The spec asks
for a required `coverImage`, an author `portrait`, and openly-licensed
photography. The art direction replaced all three with generated riso artwork,
and the schema no longer carries those fields. Recorded here so the two
documents are not read as contradicting each other by accident.
