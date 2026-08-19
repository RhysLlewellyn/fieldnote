# Finish Fieldnote — run this to completion

You are finishing the Fieldnote demo build. The site is already live at
**https://fieldnote-one.vercel.app/** and the code is essentially complete. This is a
finishing pass, not a feature phase.

Read `ART-DIRECTION.md` and `README.md` first. `DEMO-BRIEFS.md` and `FIELDNOTE-SPEC.md` in
`C:\Projects\rhysllewellyn\` are the original spec if you need to check intent.

## Hard rules — these override any judgement you form later

1. **Add no features.** No search, no newsletter signup, no dark mode toggle, no comments, no
   pagination beyond what exists, no animation. If you find yourself designing something,
   stop.
2. **Fix P0 and P1 only.** Anything an audit rates P2 or P3 gets written to
   `FOLLOW-UPS.md` and left alone.
3. **Do not restructure.** No renaming components, no moving files, no refactors that aren't
   required to fix a P0/P1.
4. **Do not touch the seed prose.** The article copy is deliberate. You may fix typos. You may
   not rewrite, extend or "improve" any article.
5. **Commit after each numbered task**, with a message describing what changed and why, in the
   style of the existing history (imperative, specific, no "chore:" prefixes).
6. **Maximum 5 cycles.** If the exit criteria aren't all met after five passes, stop and
   report what's blocking.

## Tasks, in order

**1. Clean the working tree.**
`git status` currently shows ~23 files changed with insertions exactly equal to deletions —
CRLF churn, not real edits. Add a `.gitattributes` that normalises line endings
(`* text=auto eol=lf`), run `git add --renormalize .`, and commit. Confirm `git status` is
clean afterwards.

**2. Delete the unreferenced starter assets.**
`public/next.svg`, `public/vercel.svg`, `public/window.svg`, `public/file.svg`. Grep first to
confirm nothing references them. Commit.

**3. Build the RSS feed at `/feed.xml`.**
`app/feed.xml/route.ts`, returning `application/rss+xml`. Include the 20 most recent
articles: title, link, description from the standfirst, `pubDate` from `publishedAt`, GUID
from the slug, plus channel title, link, description and language `en-GB`. Reuse the existing
Sanity query layer and the site URL helper in `app/lib/site-url.ts`. Add
`<link rel="alternate" type="application/rss+xml">` to the site layout head. Verify it
returns valid XML locally. Commit.

**4. Run Lighthouse against the live URL.**
`npx lighthouse https://fieldnote-one.vercel.app/ --output=json --output=html
--output-path=./lighthouse --chrome-flags="--headless"`, and again for one article page.
Record the four category scores for both. If Chrome can't be found, say so and stop this task
rather than substituting localhost numbers — localhost scores are not the claim being made.

**5. Run the Impeccable audit.**
`/impeccable audit` across the site. Triage every finding into P0/P1 (fix now) or P2/P3
(write to `FOLLOW-UPS.md`). Fix the P0s and P1s. Pay particular attention to hard-coded
colours that should be theme tokens, contrast ratios against the paper/ink/muted palette, and
touch target sizes on the index rows. Commit fixes in logical groups, not one giant commit.

**6. Re-run Lighthouse after the fixes.** If any category is below 95 on either page,
diagnose and fix, then re-run. This is the loop: audit → fix → re-measure → repeat until 95+
across all four categories on both pages, or five cycles, whichever comes first.

**7. Update the README.**
Add, in this order: the live URL, the Studio URL, a Lighthouse section with the real
per-category scores for both pages and the report screenshots committed to `docs/`, and a
placeholder block for read-only Studio demo credentials marked `TODO — Rhys to create a
viewer-role user in Sanity and paste here`. Keep the existing decisions section; extend it
with a short paragraph on how the generative riso imagery works and why there is no
photography. Commit.

## Exit criteria — verify all of these before declaring done

- [ ] `git status` clean, no phantom CRLF changes
- [ ] No unreferenced starter assets in `public/`
- [ ] `https://fieldnote-one.vercel.app/feed.xml` returns valid RSS after deploy
- [ ] Lighthouse 95+ on all four categories, homepage and one article page, measured against
      the live URL
- [ ] Zero P0 and zero P1 findings outstanding
- [ ] `FOLLOW-UPS.md` exists and lists every P2/P3 you chose not to fix
- [ ] README carries real Lighthouse numbers, both URLs, and the credentials placeholder
- [ ] Everything committed and pushed, and the Vercel deploy is green

## Then stop and report

Print a short summary: what changed, the final Lighthouse numbers, and the two items that
need Rhys personally and that you must NOT attempt:

1. **Keyboard and screen-reader pass** — 20 minutes with the mouse unplugged and NVDA
   running. Automated tooling catches roughly a third of real WCAG issues; the accessibility
   claim in the pitch needs a human to have actually done this once.
2. **60-second screen recording** of the Studio editing experience — open an article, change
   the standfirst, hit preview, show it live. Link it from the README.

Do not attempt either. Report them and finish.
