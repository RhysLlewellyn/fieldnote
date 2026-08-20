import {getSiteSettings} from '../lib/site'
import {siteUrl} from '../lib/site-url'

/**
 * `/llms.txt` — the site described in markdown, for agents that would
 * otherwise infer the structure by crawling.
 *
 * It lists sections rather than every article. A list of nine articles would
 * be a worse sitemap than the sitemap, and the feed already carries the
 * articles themselves; what an agent cannot get from either is what this
 * publication is and how it is laid out.
 *
 * Static and untagged: nothing here changes when an article is published.
 * Only the title and description come from the dataset, and those change on
 * the order of never.
 */
export const dynamic = 'force-static'

export async function GET() {
  const base = siteUrl()
  const settings = await getSiteSettings()

  const title = settings?.title ?? 'Fieldnote'
  const description =
    settings?.description ??
    'A quarterly about places, the people who work them, and what gets written down.'

  const body = `# ${title}

> ${description}

The articles are original writing produced for a demonstration publication. Fieldnote is
not a commercial magazine and the bylines are not real people.

## Sections

- [Home](${base}): the current issue and the full article index.
- [Issues](${base}/issues): articles grouped by the issue they appeared in.
- [Topics](${base}/topics): articles grouped by subject.
- [About](${base}/about): what the publication is.
- [Contact](${base}/contact): where pitches and corrections go.

## Full text

- [RSS feed](${base}/feed.xml): every article as XML, newest first.
- [Sitemap](${base}/sitemap.xml): every page, including authors and individual articles.
`

  return new Response(body, {
    headers: {'Content-Type': 'text/markdown; charset=utf-8'},
  })
}
