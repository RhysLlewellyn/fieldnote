/**
 * Fills an empty dataset with enough content to build against.
 *
 *   npm run seed
 *
 * Safe to run more than once: every document has a fixed id and is written
 * with createOrReplace, so a second run updates the same documents rather than
 * making copies. It only ever touches the ids listed below, so anything
 * written in the Studio is left alone.
 *
 * The content is deliberately awkward in places — a headline near the length
 * limit, an article with no issue and no topics, an author with no portrait.
 * Seed data where every field is filled in makes every layout look fine, and
 * the gaps are where layouts actually break.
 */
import {createClient} from '@sanity/client'
import sharp from 'sharp'

// -- Environment --------------------------------------------------------------

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Missing ${name}. Run this with "npm run seed", which loads .env.local.`,
    )
  }
  return value
}

const client = createClient({
  projectId: required('NEXT_PUBLIC_SANITY_PROJECT_ID'),
  dataset: required('NEXT_PUBLIC_SANITY_DATASET'),
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-08-19',
  // Editor permissions. A Viewer token can read the dataset but cannot write
  // to it, which is the failure this message exists to explain.
  token: required('SANITY_API_WRITE_TOKEN'),
  useCdn: false,
})

// -- Portable Text helpers ----------------------------------------------------

let counter = 0
const key = () => `k${(counter++).toString(36)}`

type Span = {_type: 'span'; _key: string; text: string; marks: string[]}
type MarkDef = {_type: 'link'; _key: string; href: string; openInNewTab: boolean}

/**
 * Turn a line of shorthand into spans and mark definitions.
 *
 * Square brackets make a link and double asterisks make bold — enough to write
 * realistic copy without hand-assembling span arrays. External links get
 * openInNewTab and internal ones do not, which is the rule the schema
 * describes to editors.
 */
function inline(text: string): {children: Span[]; markDefs: MarkDef[]} {
  const children: Span[] = []
  const markDefs: MarkDef[] = []
  const pattern = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g

  let cursor = 0
  let match: RegExpExecArray | null

  const push = (value: string, marks: string[] = []) => {
    if (value) children.push({_type: 'span', _key: key(), text: value, marks})
  }

  while ((match = pattern.exec(text)) !== null) {
    push(text.slice(cursor, match.index))

    if (match[1] !== undefined) {
      const markKey = key()
      markDefs.push({
        _type: 'link',
        _key: markKey,
        href: match[2],
        openInNewTab: !match[2].startsWith('/'),
      })
      push(match[1], [markKey])
    } else {
      push(match[3], ['strong'])
    }

    cursor = pattern.lastIndex
  }

  push(text.slice(cursor))
  return {children, markDefs}
}

function block(style: string, text: string, listItem?: string) {
  const {children, markDefs} = inline(text)
  return {
    _type: 'block',
    _key: key(),
    style,
    markDefs,
    children,
    ...(listItem ? {listItem, level: 1} : {}),
  }
}

const p = (text: string) => block('normal', text)
const h2 = (text: string) => block('h2', text)
const h3 = (text: string) => block('h3', text)
const quote = (text: string) => block('blockquote', text)
const bullets = (items: string[]) => items.map((i) => block('normal', i, 'bullet'))
const numbered = (items: string[]) => items.map((i) => block('normal', i, 'number'))

const pullQuote = (text: string, attribution?: string) => ({
  _type: 'pullQuote',
  _key: key(),
  quote: text,
  ...(attribution ? {attribution} : {}),
})

const aside = (
  title: string,
  paragraphs: string[],
  tone: 'note' | 'caution' = 'note',
) => ({
  _type: 'noteAside',
  _key: key(),
  title,
  tone,
  content: paragraphs.map((text) => block('normal', text)),
})

// -- Placeholder images -------------------------------------------------------

/**
 * Generated here rather than downloaded. Nothing is fetched from the internet:
 * the seed runs offline, produces the same bytes every time, and cannot break
 * because a placeholder service changed its URL scheme.
 *
 * No text is drawn into them on purpose — rendering text through sharp depends
 * on the fonts installed on whatever machine runs this, and a seed that looks
 * different on someone else's laptop is worse than one with no captions.
 */
type ImageSpec = {
  name: string
  width: number
  height: number
  alt: string
  credit?: string
}

/** A stable number in [0, 1) from a string, so the shapes never shuffle. */
function hash(text: string, salt: number): number {
  let value = 2166136261 ^ salt
  for (let i = 0; i < text.length; i++) {
    value = Math.imul(value ^ text.charCodeAt(i), 16777619)
  }
  return ((value >>> 0) % 10000) / 10000
}

function svg({name, width, height}: ImageSpec): string {
  const baseHue = Math.round(hash(name, 1) * 360)
  const secondHue = (baseHue + 40 + Math.round(hash(name, 2) * 80)) % 360

  const circles = Array.from({length: 4}, (_, i) => {
    const cx = Math.round(hash(name, 10 + i) * width)
    const cy = Math.round(hash(name, 20 + i) * height)
    const r = Math.round(
      (0.12 + hash(name, 30 + i) * 0.22) * Math.min(width, height),
    )
    const hue = (baseHue + i * 35) % 360
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="hsl(${hue} 70% 60%)" opacity="0.35"/>`
  }).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="hsl(${baseHue} 55% 32%)"/>
        <stop offset="100%" stop-color="hsl(${secondHue} 60% 62%)"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#g)"/>
    ${circles}
  </svg>`
}

const IMAGES: ImageSpec[] = [
  {
    name: 'cover-tideline',
    width: 2400,
    height: 1600,
    alt: 'Wet sand at low tide, the water line barely visible against a pale sky',
    credit: 'Tomás Iriarte',
  },
  {
    name: 'cover-kiln',
    width: 2400,
    height: 1600,
    alt: 'A brick bottle kiln standing against an overcast sky',
    credit: 'Tomás Iriarte',
  },
  {
    name: 'cover-transhumance',
    width: 2400,
    height: 1600,
    alt: 'A flock crossing a high pass in late afternoon light',
  },
  {
    name: 'cover-signal',
    width: 2400,
    height: 1600,
    alt: 'A radio mast on a hillside, seen through rain',
    credit: 'Wren Okonkwo',
  },
  {
    name: 'cover-ledger',
    width: 2400,
    height: 1600,
    alt: 'An open ledger, its columns filled in fading ink',
  },
  {
    name: 'cover-harbour',
    width: 2400,
    height: 1600,
    alt: 'Harbour lights reflected on black water',
    credit: 'Tomás Iriarte',
  },
  {
    name: 'issue-one',
    width: 1600,
    height: 2000,
    alt: 'Cover of issue one, The Long Way Round',
  },
  {
    name: 'issue-two',
    width: 1600,
    height: 2000,
    alt: 'Cover of issue two, Ground Truth',
  },
  {name: 'portrait-delacroix', width: 900, height: 900, alt: 'Mara Delacroix'},
  {name: 'portrait-iriarte', width: 900, height: 900, alt: 'Tomás Iriarte'},
  {
    name: 'body-saltmarsh',
    width: 2000,
    height: 1333,
    alt: 'Saltmarsh channels seen from above at low water',
    credit: 'Tomás Iriarte',
  },
  {
    name: 'body-kiln-interior',
    width: 1600,
    height: 1200,
    alt: 'The inside of the kiln, its walls glazed by decades of firing',
  },
  {
    name: 'body-kiln-tools',
    width: 1600,
    height: 1200,
    alt: 'Throwing tools laid out on a bench',
  },
  {
    name: 'body-kiln-stack',
    width: 1600,
    height: 1200,
    alt: 'Unfired pots stacked ready for the kiln',
  },
  {name: 'og-default', width: 1200, height: 630, alt: 'Fieldnote'},
]

async function uploadImages(): Promise<Map<string, string>> {
  const assets = new Map<string, string>()

  for (const spec of IMAGES) {
    const buffer = await sharp(Buffer.from(svg(spec)))
      .jpeg({quality: 80})
      .toBuffer()

    // Sanity keys assets by content hash, so a second run re-uses what is
    // already there instead of filling the media library with copies.
    const asset = await client.assets.upload('image', buffer, {
      filename: `${spec.name}.jpg`,
      contentType: 'image/jpeg',
    })

    assets.set(spec.name, asset._id)
    console.log(`  image   ${spec.name}`)
  }

  return assets
}

// -- Documents ----------------------------------------------------------------

/**
 * The documents are a mixed bag of shapes, so they are typed loosely on the
 * way out. Inferring a single shape from an array of six different document
 * types only produces an error about how they are not the same type, which is
 * the one thing already known about them. The schema is what validates these.
 */
type SeedDocument = {_id: string; _type: string; [field: string]: unknown}

const ref = (id: string) => ({_type: 'reference', _ref: id})
const keyedRef = (id: string) => ({_type: 'reference', _key: key(), _ref: id})

function buildDocuments(assets: Map<string, string>): SeedDocument[] {
  const image = (
    name: string,
    extra: {caption?: string; type?: string; key?: string} = {},
  ) => {
    const id = assets.get(name)
    const spec = IMAGES.find((s) => s.name === name)
    if (!id || !spec) throw new Error(`No image seeded under the name "${name}"`)

    return {
      _type: extra.type ?? 'image',
      ...(extra.key ? {_key: extra.key} : {}),
      asset: ref(id),
      alt: spec.alt,
      ...(spec.credit ? {credit: spec.credit} : {}),
      ...(extra.caption ? {caption: extra.caption} : {}),
    }
  }

  const figure = (name: string, caption?: string) =>
    image(name, {type: 'captionedImage', key: key(), caption})

  const gallery = (names: string[], layout: 'grid' | 'sideBySide') => ({
    _type: 'imageGallery',
    _key: key(),
    layout,
    images: names.map((name) => figure(name)),
  })

  return [
    // -- Site settings --
    {
      _id: 'siteSettings',
      _type: 'siteSettings',
      title: 'Fieldnote',
      description:
        'A quarterly about places, the people who work them, and what gets written down.',
      defaultOgImage: image('og-default'),
      navigation: [
        {_key: key(), label: 'Issues', href: '/issues'},
        {_key: key(), label: 'Topics', href: '/topics'},
        {_key: key(), label: 'About', href: '/about'},
        {_key: key(), label: 'Contact', href: '/contact'},
      ],
      footerText:
        'Fieldnote is published four times a year. Printed in Bristol.',
      socialLinks: [
        {_key: key(), label: 'Instagram', url: 'https://instagram.com/fieldnote'},
        {
          _key: key(),
          label: 'Mastodon',
          url: 'https://mastodon.social/@fieldnote',
        },
      ],
    },

    // -- Authors --
    {
      _id: 'author-delacroix',
      _type: 'author',
      name: 'Mara Delacroix',
      slug: {_type: 'slug', current: 'mara-delacroix'},
      role: 'Editor',
      portrait: image('portrait-delacroix'),
      bio: [
        p(
          'Mara founded Fieldnote in 2019 after a decade reporting on coastal planning. She lives on the Severn estuary and is still, by her own account, learning to read a tide table.',
        ),
      ],
      links: [{_key: key(), label: 'Website', url: 'https://example.com/delacroix'}],
    },
    {
      _id: 'author-iriarte',
      _type: 'author',
      name: 'Tomás Iriarte',
      slug: {_type: 'slug', current: 'tomas-iriarte'},
      role: 'Contributing photographer',
      portrait: image('portrait-iriarte'),
      bio: [
        p(
          'Tomás photographs working landscapes. His long project on the last industrial potteries of the Midlands ran across issues one and two.',
        ),
      ],
      links: null,
    },
    {
      // No portrait and no links — the author page has to survive both.
      _id: 'author-okonkwo',
      _type: 'author',
      name: 'Wren Okonkwo',
      slug: {_type: 'slug', current: 'wren-okonkwo'},
      role: 'Staff writer',
      bio: [
        p(
          'Wren writes about archives, infrastructure and the paperwork that outlasts the institutions that made it.',
        ),
      ],
      links: null,
    },

    // -- Topics --
    {
      _id: 'topic-landscape',
      _type: 'topic',
      title: 'Landscape',
      slug: {_type: 'slug', current: 'landscape'},
      description: 'Ground, water, and the lines people draw across both.',
    },
    {
      _id: 'topic-craft',
      _type: 'topic',
      title: 'Craft',
      slug: {_type: 'slug', current: 'craft'},
      description:
        'Making things by hand, and what happens when the last person who can retires.',
    },
    {
      _id: 'topic-migration',
      _type: 'topic',
      title: 'Migration',
      slug: {_type: 'slug', current: 'migration'},
      description: 'Seasonal movement, of people and of everything else.',
    },
    {
      // No description — the topic list has to cope.
      _id: 'topic-archive',
      _type: 'topic',
      title: 'Archive',
      slug: {_type: 'slug', current: 'archive'},
    },

    // -- Issues --
    {
      _id: 'issue-one',
      _type: 'issue',
      number: 1,
      title: 'The Long Way Round',
      slug: {_type: 'slug', current: '1'},
      coverImage: image('issue-one'),
      publishedAt: '2026-03-14T09:00:00.000Z',
      introduction: [
        p(
          'The pieces in this issue all take longer routes than they need to. That was not the plan — it is simply what happens when you follow people who work outdoors and let them set the pace.',
        ),
        p(
          'We start on a tideline that will not stay still, and end in a valley with one kiln left standing.',
        ),
      ],
      colophon:
        'Set in Söhne and Signifier. Printed on 120gsm uncoated stock by Taylor Brothers, Bristol. Edition of 900.',
    },
    {
      _id: 'issue-two',
      _type: 'issue',
      number: 2,
      title: 'Ground Truth',
      slug: {_type: 'slug', current: '2'},
      coverImage: image('issue-two'),
      publishedAt: '2026-06-20T09:00:00.000Z',
      introduction: [
        p(
          'Ground truth is a surveyor’s term: the measurement you take by standing in the place, against which everything modelled from a distance is checked.',
        ),
      ],
      colophon:
        'Set in Söhne and Signifier. Printed on 120gsm uncoated stock by Taylor Brothers, Bristol.',
    },

    // -- Articles --
    {
      _id: 'article-tideline',
      _type: 'article',
      title: 'The Tideline Moves Twice a Day and Nobody Told the Map Makers',
      slug: {_type: 'slug', current: 'tideline-moves-twice-a-day'},
      standfirst:
        'Ordnance Survey draws the coast as a single line. On the Severn, that line is a fiction the tide corrects twice a day — and the people who live there keep their own maps.',
      coverImage: image('cover-tideline'),
      publishedAt: '2026-03-14T09:00:00.000Z',
      featured: true,
      author: ref('author-delacroix'),
      issue: ref('issue-one'),
      topics: [keyedRef('topic-landscape'), keyedRef('topic-archive')],
      body: [
        p(
          'The mean high water mark is a legal object as much as a geographical one. It decides who owns what, who may build, and who is liable when the water arrives anyway. It is drawn as a line because a line is what a map can hold.',
        ),
        p(
          'On the Severn the difference between that line and the water is measured in hundreds of metres. The second highest tidal range in the world moves the edge of the land twice a day, and has been doing so for longer than anyone has been drawing it.',
        ),
        h2('What the survey records'),
        p(
          'The first detailed survey of this stretch was made in 1873. It is [held at the county archive](https://example.com/archive), it is beautiful, and where it is wrong it is confidently wrong.',
        ),
        figure(
          'body-saltmarsh',
          'Channels in the saltmarsh at low water. The pattern redraws itself every few years.',
        ),
        pullQuote(
          'A map is a claim about what will still be true tomorrow. Out here it is a claim with a shelf life of about six hours.',
          'Mara Delacroix',
        ),
        h2('What the tide records'),
        p(
          'The people who work this coast keep their own version. It is not written down in any form a surveyor would recognise, and it is more accurate:',
        ),
        ...bullets([
          'Where the channel has moved since last winter',
          'Which paths are passable at which state of the tide',
          'Which fields flooded in 2019 and will flood again',
        ]),
        aside('On tide tables', [
          'Predicted heights assume average atmospheric pressure and no wind. A deep low and a southwesterly can add half a metre to a prediction.',
          'The tables are right about the timing and only approximately right about the height, which is the opposite of how most people read them.',
        ]),
        p(
          'None of this makes the official line useless. It makes it one claim among several, and the only one with legal force — which is precisely the problem.',
        ),
        quote(
          'The map is not the territory, but it is the thing the court will look at.',
        ),
      ],
      seo: {
        title: 'The tideline that will not stay still',
        description:
          'On the Severn estuary, the legal edge of the land and the actual edge of the water are hundreds of metres apart, twice a day.',
      },
    },
    {
      _id: 'article-kiln',
      _type: 'article',
      title: 'The Last Bottle Kiln in the Valley',
      slug: {_type: 'slug', current: 'last-bottle-kiln'},
      standfirst:
        'There were four hundred of them within living memory. Now there is one that still fires, and the man who fires it is seventy-three.',
      coverImage: image('cover-kiln'),
      publishedAt: '2026-03-14T09:00:00.000Z',
      featured: false,
      author: ref('author-iriarte'),
      issue: ref('issue-one'),
      topics: [keyedRef('topic-craft')],
      body: [
        p(
          'A bottle kiln is not a kiln inside a building. The building **is** the kiln: a brick bottle thirty feet high, with the firing chamber at its base and the whole structure acting as the chimney.',
        ),
        p(
          'Firing one takes about forty hours and roughly two tonnes of coal. It cannot be paused.',
        ),
        gallery(
          ['body-kiln-interior', 'body-kiln-tools', 'body-kiln-stack'],
          'grid',
        ),
        h2('Forty hours'),
        p('The sequence has not changed much since the 1880s:'),
        ...numbered([
          'Pack the saggars, and pack them evenly, or the stack shifts at temperature.',
          'Bring the heat up slowly for the first twelve hours.',
          'Hold at top temperature until the trial rings say otherwise.',
          'Let it fall on its own. Opening early cracks everything inside.',
        ]),
        aside(
          'Do not try this at home',
          [
            'A firing produces carbon monoxide at the base of the kiln throughout. The ventilation that makes the kiln work is the same ventilation that keeps the person firing it alive.',
          ],
          'caution',
        ),
        pullQuote(
          'You do not learn this from a book. You learn it from standing next to someone for ten years.',
        ),
        p('There is no apprentice.'),
      ],
      seo: null,
    },
    {
      _id: 'article-transhumance',
      _type: 'article',
      title: 'Transhumance',
      slug: {_type: 'slug', current: 'transhumance'},
      standfirst:
        'Twice a year the flocks move between winter and summer pasture, along routes older than any of the borders they now cross.',
      coverImage: image('cover-transhumance'),
      publishedAt: '2026-04-02T09:00:00.000Z',
      featured: false,
      author: ref('author-okonkwo'),
      issue: ref('issue-one'),
      topics: [keyedRef('topic-migration'), keyedRef('topic-landscape')],
      body: [
        p(
          'The drove roads are still there, and in several countries they are still legally protected — wide green corridors running through land that has otherwise been enclosed for two centuries.',
        ),
        p('Whether anyone still walks them is a different question.'),
        h2('Right of way'),
        p(
          'Spain’s cañadas reales cover about 125,000 kilometres. They are public land. Every so often a shepherd drives a flock through the middle of Madrid to make the point that the right has not lapsed.',
        ),
        quote(
          'A right you never exercise is a right you are in the process of losing.',
        ),
      ],
      seo: null,
    },
    {
      _id: 'article-signal',
      _type: 'article',
      title: 'A Signal in the Noise',
      slug: {_type: 'slug', current: 'a-signal-in-the-noise'},
      standfirst:
        'For thirty years a transmitter on a Yorkshire hillside broadcast a sequence of numbers to nobody in particular. Then, one Tuesday, it stopped.',
      coverImage: image('cover-signal'),
      publishedAt: '2026-06-20T09:00:00.000Z',
      featured: false,
      author: ref('author-delacroix'),
      issue: ref('issue-two'),
      topics: [keyedRef('topic-archive')],
      body: [
        p(
          'Shortwave numbers stations are the most thoroughly documented mystery in radio. Enthusiasts have logged them since the 1970s: schedules, frequencies, the exact synthesised voice.',
        ),
        p(
          'What none of the logs record is why this one ran for three decades after the thing it served stopped existing.',
        ),
        pullQuote(
          'Somebody kept paying the electricity bill. That is the part nobody can explain.',
        ),
        p(
          'The site is now a car park. The mast came down in 2024 and the [planning record](https://example.com/planning) lists it, without irony, as a disused agricultural structure.',
        ),
      ],
      seo: null,
    },
    {
      _id: 'article-ledger',
      _type: 'article',
      title: 'The Ledger That Outlived the Company',
      slug: {_type: 'slug', current: 'the-ledger-that-outlived-the-company'},
      standfirst:
        'When the mill closed, the receivers took the machinery and left the paperwork. Forty years later the paperwork is the only reason anyone can prove they worked there.',
      coverImage: image('cover-ledger'),
      publishedAt: '2026-07-11T09:00:00.000Z',
      featured: false,
      author: ref('author-okonkwo'),
      issue: ref('issue-two'),
      topics: [keyedRef('topic-archive'), keyedRef('topic-craft')],
      body: [
        p(
          'Industrial disease claims turn on employment history. No employer, no personnel department, no record — no claim.',
        ),
        p(
          'Which is how a wages ledger rescued from a skip in 1983 came to be the decisive evidence in a case heard in 2021.',
        ),
        h3('What survived'),
        ...bullets([
          'Wages books, 1961 to 1979, complete',
          'Accident book, 1968 to 1974, partial',
          'Everything else: gone',
        ]),
        aside('Where it lives now', [
          'The ledgers are held by the county record office and have been digitised. Access is free; the finding aid is not online.',
        ]),
      ],
      seo: null,
    },
    {
      // Web-only: no issue, no topics. Both branches have to render.
      _id: 'article-harbour',
      _type: 'article',
      title: 'Harbour Lights',
      slug: {_type: 'slug', current: 'harbour-lights'},
      standfirst:
        'A short dispatch from a working harbour at two in the morning, when the only people awake are the ones loading ice.',
      coverImage: image('cover-harbour'),
      publishedAt: '2026-08-05T21:30:00.000Z',
      featured: false,
      author: ref('author-iriarte'),
      topics: null,
      body: [
        p(
          'The boats go out at four. The ice arrives at two, which means somebody has been awake since midnight making it.',
        ),
        p('Nobody photographs this part.'),
      ],
      seo: null,
    },

    // -- Pages --
    {
      _id: 'page-about',
      _type: 'page',
      title: 'About',
      slug: {_type: 'slug', current: 'about'},
      body: [
        p(
          'Fieldnote is a quarterly magazine about places and the work that happens in them. It was founded in 2019 and is published from Bristol.',
        ),
        h2('How it is made'),
        p(
          'Each issue is reported over about four months. We pay contributors on acceptance, at the [rates published here](/contact).',
        ),
        pullQuote('We would rather run four pieces properly than twelve in a hurry.'),
      ],
      seo: null,
    },
    {
      _id: 'page-contact',
      _type: 'page',
      title: 'Contact',
      slug: {_type: 'slug', current: 'contact'},
      body: [
        p(
          'Pitches, corrections and subscription queries all go to the same place: [hello@example.com](mailto:hello@example.com).',
        ),
        h2('Pitching'),
        p(
          'Send two paragraphs on what the piece is and one on why you are the person to write it. We answer everything, though not always quickly.',
        ),
      ],
      seo: null,
    },
  ]
}

// -- Run ----------------------------------------------------------------------

async function main() {
  const {projectId, dataset} = client.config()
  console.log(`Seeding ${projectId}/${dataset}\n`)

  const assets = await uploadImages()
  const documents = buildDocuments(assets)

  // One transaction, so references between these documents resolve on commit
  // and a failure halfway through leaves nothing behind.
  const transaction = client.transaction()
  for (const document of documents) transaction.createOrReplace(document)
  await transaction.commit()

  console.log('')
  for (const document of documents) {
    console.log(`  ${document._type.padEnd(13)} ${document._id}`)
  }
  console.log(`\nDone — ${documents.length} documents, ${IMAGES.length} images.`)
}

main().catch((error) => {
  console.error('\nSeed failed:', error instanceof Error ? error.message : error)
  process.exitCode = 1
})
