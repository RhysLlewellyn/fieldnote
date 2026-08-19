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
 * The content is deliberately uneven, which is the point. A real magazine is
 * not twelve pieces of the same length: there are long reports, short notes
 * and single-paragraph fragments, and the index holds an odd number of them.
 * Evenness is what makes a demo look generated.
 *
 * It is awkward in places for the same reason — a headline near the length
 * limit, an article belonging to no issue and no topic, an author with no
 * links, a topic with no description. Seed data where every field is filled in
 * makes every layout look fine, and the gaps are where layouts break.
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
  // Fieldnote's imagery is two-colour riso on paper. These are the seeded body
  // images; the artwork on covers and article heroes is generated at render
  // time by app/components/RisoArt.tsx and is not stored anywhere.
  const OCHRE = '#B8642A'
  const MOSS = '#3D5142'

  // Misregistration: the second colour lays down a few pixels off, the way it
  // does when paper shifts between passes.
  const dx = 2 + hash(name, 3) * 2
  const dy = 2 + hash(name, 4) * 2

  const shapes = (fill: string, salt: number) =>
    Array.from({length: 4}, (_, i) => {
      const cx = Math.round(hash(name, salt + i) * width)
      const cy = Math.round(hash(name, salt + 10 + i) * height)
      const rx = Math.round((0.14 + hash(name, salt + 20 + i) * 0.24) * width)
      const ry = Math.round((0.12 + hash(name, salt + 30 + i) * 0.22) * height)
      // Ink density varies rather than sitting at one flat value.
      const opacity = (0.55 + hash(name, salt + 40 + i) * 0.3).toFixed(3)
      return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" opacity="${opacity}" style="mix-blend-mode:multiply"/>`
    }).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="${width}" height="${height}" fill="#EFEAE0"/>
    <g>${shapes(MOSS, 100)}</g>
    <g transform="translate(${dx.toFixed(1)} ${dy.toFixed(1)})">${shapes(OCHRE, 200)}</g>
  </svg>`
}

const IMAGES: ImageSpec[] = [
  // Only the images an editor would genuinely place: documentary material
  // inside an article body, and the social share image, which has to be a
  // raster file a third-party crawler can fetch. Covers and heroes are drawn
  // at render time and are not files at all.
  {
    name: 'body-saltmarsh',
    width: 2000,
    height: 1333,
    alt: 'Saltmarsh channels seen from above at low water',
    credit: 'Riso — generated',
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
      // example.com and nothing else. It is reserved by IANA precisely for
      // this and can never belong to anyone; instagram.com/<anything> and
      // mastodon.social/@<anything> are live namespaces, so a made-up handle
      // there is either a stranger's account or a 404 — and a footer that
      // links a stranger's Instagram from a masthead is worse than a footer
      // with no social links at all.
      socialLinks: [
        {_key: key(), label: 'Instagram', url: 'https://example.com/instagram'},
        {_key: key(), label: 'Mastodon', url: 'https://example.com/mastodon'},
      ],
    },

    // -- Authors --
    {
      _id: 'author-delacroix',
      _type: 'author',
      name: 'Mara Delacroix',
      slug: {_type: 'slug', current: 'mara-delacroix'},
      role: 'Editor',
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
      bio: [
        p(
          'Tomás photographs working landscapes. His long project on the last industrial potteries of the Midlands ran across issues one and two.',
        ),
      ],
      links: null,
    },
    {
      // No links — the author page has to survive their absence.
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
      publishedAt: '2026-03-14T09:00:00.000Z',
      featured: true,
      author: ref('author-delacroix'),
      issue: ref('issue-one'),
      topics: [keyedRef('topic-landscape'), keyedRef('topic-archive')],
      body: [
        p(
          'The mean high water mark is a legal object as much as a geographical one. It decides who owns what, who may build, and who carries the loss when the water arrives anyway. It is drawn as a line because a line is what a map can hold.',
        ),
        p(
          'On the Severn the difference between that line and the water is measured in hundreds of metres. The range at Avonmouth runs to about fourteen metres on the biggest spring tides — the second largest in the world — and it moves the edge of the land twice a day, and has been doing so for a great deal longer than anyone has been drawing it.',
        ),
        h2('What the survey records'),
        p(
          'The first detailed survey of this stretch was made in 1873 by a man named Pritchard, working from a rowing boat with a lead line and a theodolite set up on the sea wall. It is [held at the county archive](https://example.com/archive) in six sheets. It is beautiful. Where it is wrong, it is confidently wrong.',
        ),
        p(
          'Pritchard drew the saltmarsh edge as a firm line and the channels behind it as fixed. Both were reasonable things to believe in 1873 and neither has been true since. The main channel at Sheperdine has moved roughly 300 metres east in the intervening century and a half, and moved back about half that distance in the four years after the 2013 surge.',
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
          'The people who work this coast keep their own version. It is not written down in any form a surveyor would recognise, and within its scope it is considerably more accurate. Ask a fisherman where the channel is and you will get an answer referenced to a pylon, a gate and a state of the tide, which is three pieces of information a grid reference does not carry.',
        ),
        p('What that knowledge covers, roughly:'),
        ...bullets([
          'Where the channel has moved since last winter, and which way it is still going',
          'Which paths are passable at which state of the tide, and how long the window is',
          'Which fields flooded in 2013 and in 2019, and therefore which will flood again',
          'Where the old sea wall runs under the marsh, and where it has gone',
        ]),
        p(
          'None of it is legally admissible. All of it is what people actually use.',
        ),
        aside('On tide tables', [
          'Predicted heights assume average atmospheric pressure and no wind. A deep low and a sustained southwesterly can add half a metre to a prediction, and on this coast half a metre is the difference between a wet lane and a wet kitchen.',
          'The tables are reliable about timing and only approximately right about height, which is the opposite of how most people read them.',
        ]),
        h2('The part that goes to court'),
        p(
          'In 2019 a dispute over a field boundary near Oldbury turned on where mean high water had been in 1954. The claimant had aerial photographs. The defendant had Pritchard, or rather a plan derived from a plan derived from Pritchard. Neither party had anything from the tide itself, because the tide does not keep records; it only keeps changing the thing the records describe.',
        ),
        p(
          'The judgment ran to forty pages and turned, in the end, on the position of a hedge.',
        ),
        quote(
          'The map is not the territory, but it is the thing the court will look at.',
        ),
        p(
          'This is not an argument against surveying. It is an argument for reading a survey as a dated document — a claim made by a particular person, in a particular boat, in a particular year, about something that had already started moving before he got back to shore.',
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
      publishedAt: '2026-03-14T09:00:00.000Z',
      featured: false,
      author: ref('author-iriarte'),
      issue: ref('issue-one'),
      topics: [keyedRef('topic-craft')],
      body: [
        p(
          'A bottle kiln is not a kiln inside a building. The building **is** the kiln: a brick bottle some thirty feet high, with the firing chamber at its base and the whole structure acting as the chimney. From outside it looks like industrial architecture. From inside it is a single enormous appliance.',
        ),
        p(
          'There were something over four thousand of them in North Staffordshire in 1910. The Clean Air Act of 1956 finished most of what economics had started, and by 1978 the last commercial firing had happened. Forty-seven survive as listed structures. One still fires.',
        ),
        gallery(
          ['body-kiln-interior', 'body-kiln-tools', 'body-kiln-stack'],
          'grid',
        ),
        h2('Forty hours'),
        p(
          'A firing takes about forty hours and roughly two tonnes of coal, and it cannot be paused. Once the chamber is above about 600°C the only way out is forwards.',
        ),
        p('The sequence has not changed much since the 1880s:'),
        ...numbered([
          'Pack the saggars — the fireclay boxes that hold the ware — and pack them evenly, or the stack shifts at temperature and takes a column of pots down with it.',
          'Bring the heat up slowly for the first twelve hours. Too fast and any water left in the clay turns to steam inside the body of the pot.',
          'Hold at top temperature, about 1,120°C, until the trial rings say otherwise. The rings are drawn out through a spy hole with an iron rod and quenched; you read the glaze on them.',
          'Let it fall on its own, which takes another day. Opening early cracks everything inside.',
        ]),
        aside(
          'Do not try this at home',
          [
            'A firing produces carbon monoxide at the base of the kiln throughout. The draught that makes the kiln work is the same draught that keeps the person firing it alive, and it depends on wind direction.',
          ],
          'caution',
        ),
        h3('Reading the rings'),
        p(
          'There is a pyrometer now, bolted to the wall in a steel box, and the man who fires the kiln looks at it perhaps twice in forty hours. The rings tell him what he needs and the colour through the spy hole tells him the rest. Straw colour is not hot enough. Lemon is close. He describes the target as "like looking into the sun with your eyes shut", which is not a measurement and is also exactly right.',
        ),
        pullQuote(
          'You do not learn this from a book. You learn it from standing next to someone for ten years.',
        ),
        p(
          'He started in 1969, at fifteen, sweeping. He was allowed to touch the damper in 1974. He fired his first kiln alone in 1981, by which time the industry that trained him had largely stopped existing.',
        ),
        h2('After'),
        p(
          'The kiln fires twice a year now, for a trust, and the pots go to a shop and a mailing list. The economics are not really economics. The coal costs more than the ware is worth and the insurance costs more than the coal.',
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
      publishedAt: '2026-04-02T09:00:00.000Z',
      featured: false,
      author: ref('author-okonkwo'),
      issue: ref('issue-one'),
      topics: [keyedRef('topic-migration'), keyedRef('topic-landscape')],
      body: [
        p(
          'The drove roads are still there, and in several countries they are still legally protected — wide green corridors running through land that has otherwise been enclosed for two centuries. In Spain they are cañadas reales, and there are about 125,000 kilometres of them. They are public land, ninety varas wide, which is a little over seventy-five metres.',
        ),
        p('Whether anyone still walks them is a different question.'),
        h2('Right of way'),
        p(
          'Every autumn a shepherd drives a flock through the centre of Madrid, down the Gran Vía, past the department stores, to make the point that the right has not lapsed. It is a piece of theatre and it is also a legal manoeuvre: rights of way in Spanish law can be weakened by disuse, and the walk is evidence of use.',
        ),
        p(
          'The flock is around 1,500 head. The city pays a toll, notionally, of fifty maravedís per thousand animals — a coin that has not been minted since the nineteenth century, so it is settled in a token payment and a photograph.',
        ),
        quote(
          'A right you never exercise is a right you are in the process of losing.',
        ),
        h2('The practical version'),
        p(
          'Away from the cameras the movement is mostly by lorry now. A flock that took three weeks to walk from Extremadura to the Cantabrian pastures takes eight hours on the A-66, and the lorry does not need a shepherd, three dogs and a route with water on it every fifteen kilometres.',
        ),
        p(
          'What the lorry does not do is graze the corridor on the way. The cañadas were maintained by the animals that used them; without that, scrub closes in, and a right of way that cannot be walked is harder to defend than one that can.',
        ),
        aside('Where to see it', [
          'The Fiesta de la Trashumancia runs through central Madrid on a Sunday in late October. The route and date are announced only a few weeks ahead, because it depends on the weather at the other end.',
        ]),
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
      publishedAt: '2026-07-11T09:00:00.000Z',
      featured: false,
      author: ref('author-okonkwo'),
      issue: ref('issue-two'),
      topics: [keyedRef('topic-archive'), keyedRef('topic-craft')],
      body: [
        p(
          'Industrial disease claims turn on employment history. To bring one you must show where you worked, when, and what you were exposed to. No employer, no personnel department, no record — no claim, however obvious the illness.',
        ),
        p(
          'Which is how a wages ledger rescued from a skip in 1983 came to be the decisive evidence in a case heard in 2021.',
        ),
        h2('What survived'),
        p(
          'The mill closed in March 1979. The receivers took the machinery, the vehicles and the fixtures, and left the paperwork, because paperwork has no resale value. A former timekeeper, told the building was being cleared, filled the boot of a Cortina with what he could reach.',
        ),
        ...bullets([
          'Wages books, 1961 to 1979, complete',
          'Accident book, 1968 to 1974, partial',
          'Two boxes of clock cards, undated',
          'Everything else: gone',
        ]),
        p(
          'He kept them in a garage for twenty-six years. In 2009 he gave them to the county record office, who catalogued them, digitised them in 2016, and put the finding aid on a shelf.',
        ),
        pullQuote(
          'The records that survive are not the important ones. They are the ones somebody happened to be able to carry.',
        ),
        h2('The case'),
        p(
          'The claimant had worked at the mill between 1971 and 1977 and had no documents at all — no payslips, no contract, no P60s. The company had been dissolved, its insurer had been through two mergers, and the insurer\u2019s position was that there was no evidence he had ever been employed there.',
        ),
        p(
          'The wages books listed him by name, works number and department, week by week, for six years. The department was the one where the dust was.',
        ),
        aside('Where it lives now', [
          'The ledgers are held by the county record office and have been digitised. Access is free and the catalogue reference is straightforward once you know it exists; the finding aid is not online, which is the part that matters.',
        ]),
        p(
          'There is no policy here, no lesson about archives that anyone acted on. A man put some books in a car boot because it seemed wrong to leave them, and forty-two years later that decision was worth a great deal of money to somebody he never met.',
        ),
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

    {
      // Short note. Not everything is a 1,200-word report.
      _id: 'article-green-oak',
      _type: 'article',
      title: 'Green Oak, and Waiting',
      slug: {_type: 'slug', current: 'green-oak-and-waiting'},
      standfirst:
        'The rule of thumb is an inch a year. For the beams of a small barn, that is a decision someone made before you were born.',
      publishedAt: '2026-05-08T09:00:00.000Z',
      featured: false,
      author: ref('author-okonkwo'),
      issue: ref('issue-two'),
      topics: [keyedRef('topic-craft')],
      body: [
        p(
          'Air-dried oak loses moisture at roughly an inch of thickness a year. A four-inch beam is therefore four years from the saw, and nobody has found a way to hurry it that does not show up later as a split running the length of the timber.',
        ),
        p(
          'Kilning gets there in weeks. It also drives the moisture out unevenly, and in structural sections that unevenness is a stress the frame has to carry for its whole life.',
        ),
        p(
          'So the stack behind the workshop is not storage. It is the part of the job that was started by whoever was here before, and the part of it you do for whoever comes next.',
        ),
      ],
      seo: null,
    },
    {
      _id: 'article-abergwesyn',
      _type: 'article',
      title: 'Eleven Miles Unsurfaced',
      slug: {_type: 'slug', current: 'eleven-miles-unsurfaced'},
      standfirst:
        'The Abergwesyn pass carries no gritters, no white lines and, for most of the winter, no traffic. It is still a public road.',
      publishedAt: '2026-05-22T09:00:00.000Z',
      featured: false,
      author: ref('author-delacroix'),
      issue: ref('issue-two'),
      topics: [keyedRef('topic-landscape')],
      body: [
        p(
          'Between Abergwesyn and Tregaron the road runs unsurfaced for about eleven miles, climbing to roughly 440 metres at the Devil’s Staircase. There is one cattle grid, no passing-place markings worth the name, and a gradient that in places touches 25 per cent.',
        ),
        p(
          'It appears on the map exactly as any other unclassified road appears. That is the whole problem with maps, and the reason people who live at either end give directions by time rather than distance.',
        ),
        aside('If you are driving it', [
          'Low gear down the Staircase, not brakes. The surface is loose enough that a locked wheel simply carries on.',
        ], 'caution'),
      ],
      seo: null,
    },
    {
      // A single-paragraph fragment. A magazine has these; a content model that
      // cannot hold one is a content model that produces evenly-sized filler.
      _id: 'article-slack',
      _type: 'article',
      title: 'Two Inches of Slack',
      slug: {_type: 'slug', current: 'two-inches-of-slack'},
      standfirst:
        'On rigging a load that has to move, and why the tightest strap is the wrong one.',
      publishedAt: '2026-06-02T09:00:00.000Z',
      featured: false,
      author: ref('author-iriarte'),
      topics: [keyedRef('topic-craft')],
      body: [
        p(
          'Every rigger says a version of the same thing: the strap you pull hardest is the one that fails. A load on a trailer moves — over a cattle grid, into a dip, under braking — and a strap with no give in it takes that movement as shock rather than as travel. Two inches of slack, taken up by a ratchet that can still turn, absorbs what a bar-tight strap transmits. It looks worse. It is the reason the load is still on the trailer at the other end.',
        ),
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
