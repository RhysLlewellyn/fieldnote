# Fieldnote

A magazine site: [Next.js](https://nextjs.org) App Router on the front, [Sanity](https://www.sanity.io) for the content, both served from one deployment.

The Studio is embedded at `/studio` rather than hosted separately, so there is one deploy, one domain, and one thing for an editor to bookmark.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill it in, see below
npm run dev                  # http://localhost:3001
```

### Environment

| Variable | Needed for | Where it comes from |
| --- | --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | everything | [sanity.io/manage](https://www.sanity.io/manage) |
| `NEXT_PUBLIC_SANITY_DATASET` | everything | `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | everything | a date; pinning it is what stops Sanity changing behaviour under you |
| `SANITY_API_READ_TOKEN` | reads, and draft mode later | API → Tokens → **Viewer** |
| `SANITY_REVALIDATE_SECRET` | the publish webhook | any long random string |
| `SANITY_API_WRITE_TOKEN` | `npm run seed` only | API → Tokens → **Editor** |

The two `NEXT_PUBLIC_` values reach the browser and are safe there — they identify the dataset, they do not grant access to it. The rest are server-only and must never gain that prefix.

`SANITY_API_WRITE_TOKEN` is the one to be careful with: it can change anything in the dataset, nothing at runtime reads it, and it should be revoked once the dataset is populated.

You will also need to add your local URL as a CORS origin — API → CORS origins → `http://localhost:3001`, with credentials allowed — or the Studio cannot reach the dataset.

### Content to work against

```bash
npm run seed
```

Fills an empty dataset with a couple of issues, a handful of articles, authors, topics and pages, plus generated placeholder images. Safe to re-run: every document has a fixed id, and Sanity dedupes the assets by content hash.

The seeded content is deliberately uneven — a headline near the length limit, an article belonging to no issue and no topic, an author with no portrait. Content where every field is filled in makes every layout look fine, and the gaps are where layouts actually break.

## Scripts

| | |
| --- | --- |
| `npm run dev` | dev server on port 3001 |
| `npm run build` | production build |
| `npm run start` | serve the production build |
| `npm run lint` | eslint |
| `npm run seed` | populate the dataset (needs the Editor token) |

The dev port is pinned to 3001 rather than left at 3000, so that the CORS origin registered with Sanity stays correct even when something else has taken 3000.

## How it fits together

```text
app/
  (site)/          the site proper — everything here gets the header and footer
  studio/          the embedded Studio, deliberately outside (site)
  components/      rendering: Portable Text, images, article cards, chrome
  lib/             site settings, metadata, date formatting
sanity/
  schemaTypes/     the content model — six document types, four custom blocks
  lib/             client, queries, typed results, the cached fetch
scripts/seed.mts   the seed described above
```

A few decisions worth knowing before changing things:

**The Studio sits outside the `(site)` route group.** The root layout is `html`, `body` and the fonts and nothing else. Anything added there is drawn around the Studio too, which is how a site header ends up on top of the Studio's own interface.

**Nothing revalidates on a timer.** An article is not stale sixty seconds after it was fetched; it is stale when an editor changes it. Responses are cached indefinitely and tagged by document type and identity (`article`, `article:some-slug`), and a webhook clears the matching tags on publish. Polling on a timer would spend requests re-fetching identical content and still show the old version for up to a minute after a real change.

**Pages tag the types they render, not just their own.** The byline, the topic names and the issue number on an article page all come from referenced documents, so renaming an author has to invalidate the articles they wrote.

**`perspective: 'published'` is load-bearing.** The client sends a token on every read, and a token can see drafts. Without that setting an unpublished article would appear on the live site the moment someone started writing it.

**Alt text is required by the schema.** An empty `alt` in a component therefore means the image is decorative, not that somebody forgot.

## Not built yet

- `/api/revalidate` — the webhook receiver the `SANITY_REVALIDATE_SECRET` is for
- Draft mode and the Presentation tool, so editors can preview unpublished changes
- Generated types. The queries are wrapped in `defineQuery` so `sanity typegen` can derive result types from the schema; until then `sanity/lib/types.ts` is hand-written and has to be kept in step with `sanity/lib/queries.ts`
