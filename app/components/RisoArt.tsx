/**
 * Fieldnote's imagery: two-colour abstract forms, generated rather than
 * photographed.
 *
 * Everything derives from a seed string — usually a slug — so a given article
 * always gets the same artwork, on the server and on the client, this build
 * and the next. No randomness, no stored assets, nothing to upload.
 *
 * The three defences against it reading as procedural, in order of effect:
 *
 *   Misregistration. Real risograph printing offsets each colour layer by a
 *   millimetre or two because the paper shifts between passes. The second
 *   layer here is offset a few pixels on both axes, varied per seed. This one
 *   change is most of the difference between "print" and "vector art".
 *
 *   Ink density. Shapes take opacities across a range rather than one flat
 *   value, and edges are jittered off their mathematical positions, because
 *   ink does not lay down evenly and paper is not perfectly flat.
 *
 *   Grain. A turbulence overlay across the whole image at a few percent, which
 *   is the paper showing through.
 */

const OCHRE = '#B8642A'
const MOSS = '#3D5142'

export type RisoFamily = 'ridgeline' | 'ellipses' | 'contour'

/** Deterministic PRNG, so the same seed always draws the same picture. */
function makeRandom(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  }

  return function next(): number {
    h += 0x6d2b79f5
    let t = h
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const between = (random: () => number, min: number, max: number) =>
  min + random() * (max - min)

/** Ink density. Never a flat value — that is what reads as machine-made. */
const density = (random: () => number) =>
  Number(between(random, 0.55, 0.85).toFixed(3))

/**
 * Angular polygons stacked like a ridge seen against another ridge.
 */
function ridgeline(random: () => number, w: number, h: number) {
  return [0, 1, 2].map((layer) => {
    const baseline = h * (0.45 + layer * 0.16)
    const steps = Math.round(between(random, 4, 7))
    const points: string[] = [`0,${h}`]

    for (let i = 0; i <= steps; i++) {
      const x = (w / steps) * i
      // Jitter keeps the peaks off a regular interval.
      const y = baseline - between(random, 0, h * 0.22) + between(random, -6, 6)
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`)
    }

    points.push(`${w},${h}`)
    return {points: points.join(' '), opacity: density(random)}
  })
}

/** Overlapping ellipses — the most obviously "printed" of the three. */
function ellipses(random: () => number, w: number, h: number) {
  return Array.from({length: Math.round(between(random, 3, 5))}, () => ({
    cx: between(random, w * 0.2, w * 0.8),
    cy: between(random, h * 0.2, h * 0.8),
    rx: between(random, w * 0.18, w * 0.42),
    ry: between(random, h * 0.14, h * 0.34),
    rotate: between(random, -35, 35),
    opacity: density(random),
  }))
}

/** Contour lines with one solid block sitting across them. */
function contour(random: () => number, w: number, h: number) {
  const lines = Array.from({length: Math.round(between(random, 6, 10))}, (_, i) => {
    const y = h * 0.18 + i * (h * 0.075)
    const lift = between(random, h * 0.05, h * 0.14)
    const skew = between(random, -w * 0.1, w * 0.1)
    return `M0,${y.toFixed(1)} C${(w * 0.3).toFixed(1)},${(y - lift).toFixed(1)} ${(w * 0.7 + skew).toFixed(1)},${(y + lift).toFixed(1)} ${w},${(y - lift * 0.4).toFixed(1)}`
  })

  const block = {
    x: between(random, w * 0.08, w * 0.5),
    y: between(random, h * 0.55, h * 0.72),
    size: between(random, w * 0.22, w * 0.38),
    opacity: density(random),
  }

  return {lines, block}
}

export function RisoArt({
  seed,
  family,
  width = 800,
  height = 500,
  className,
}: {
  seed: string
  /** Left out, the family is chosen from the seed, so a page varies on its own. */
  family?: RisoFamily
  width?: number
  height?: number
  className?: string
}) {
  const random = makeRandom(seed)

  const families: RisoFamily[] = ['ridgeline', 'ellipses', 'contour']
  const chosen = family ?? families[Math.floor(random() * families.length)]

  // The misregistration, in SVG units. Both axes, varied, never zero.
  const offsetX = between(random, 2, 4) * (random() > 0.5 ? 1 : -1)
  const offsetY = between(random, 2, 4) * (random() > 0.5 ? 1 : -1)

  // Filter ids must be unique per instance or several images on one page share
  // whichever definition rendered last.
  const grainId = `grain-${seed.replace(/[^a-z0-9]/gi, '')}`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      // Decorative. It carries no information a caption does not already give,
      // and describing abstract artwork to a screen reader is noise.
      aria-hidden="true"
      className={className}
      style={{display: 'block', width: '100%', height: '100%'}}
    >
      <defs>
        <filter id={grainId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={3}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>

      <rect width={width} height={height} fill="#EFEAE0" />

      {chosen === 'ridgeline' &&
        (() => {
          const layers = ridgeline(random, width, height)
          return (
            <>
              {layers.map((layer, i) => (
                <polygon
                  key={`moss-${i}`}
                  points={layer.points}
                  fill={MOSS}
                  opacity={layer.opacity}
                  style={{mixBlendMode: 'multiply'}}
                />
              ))}
              <g transform={`translate(${offsetX} ${offsetY})`}>
                {layers.slice(0, 2).map((layer, i) => (
                  <polygon
                    key={`ochre-${i}`}
                    points={layer.points}
                    fill={OCHRE}
                    opacity={layer.opacity * 0.75}
                    style={{mixBlendMode: 'multiply'}}
                  />
                ))}
              </g>
            </>
          )
        })()}

      {chosen === 'ellipses' &&
        (() => {
          const shapes = ellipses(random, width, height)
          return (
            <>
              {shapes.map((s, i) => (
                <ellipse
                  key={`moss-${i}`}
                  cx={s.cx}
                  cy={s.cy}
                  rx={s.rx}
                  ry={s.ry}
                  fill={MOSS}
                  opacity={s.opacity}
                  transform={`rotate(${s.rotate} ${s.cx} ${s.cy})`}
                  style={{mixBlendMode: 'multiply'}}
                />
              ))}
              <g transform={`translate(${offsetX} ${offsetY})`}>
                {shapes.slice(1).map((s, i) => (
                  <ellipse
                    key={`ochre-${i}`}
                    cx={s.cx}
                    cy={s.cy}
                    rx={s.rx * 0.9}
                    ry={s.ry * 0.9}
                    fill={OCHRE}
                    opacity={s.opacity * 0.8}
                    transform={`rotate(${s.rotate} ${s.cx} ${s.cy})`}
                    style={{mixBlendMode: 'multiply'}}
                  />
                ))}
              </g>
            </>
          )
        })()}

      {chosen === 'contour' &&
        (() => {
          const {lines, block} = contour(random, width, height)
          return (
            <>
              <g
                fill="none"
                stroke={MOSS}
                strokeWidth={2}
                opacity={0.75}
                style={{mixBlendMode: 'multiply'}}
              >
                {lines.map((d, i) => (
                  <path key={i} d={d} />
                ))}
              </g>
              <g transform={`translate(${offsetX} ${offsetY})`}>
                <rect
                  x={block.x}
                  y={block.y}
                  width={block.size}
                  height={block.size}
                  fill={OCHRE}
                  opacity={block.opacity}
                  style={{mixBlendMode: 'multiply'}}
                />
              </g>
            </>
          )
        })()}

      <rect
        width={width}
        height={height}
        filter={`url(#${grainId})`}
        opacity={0.07}
        style={{mixBlendMode: 'multiply'}}
      />
    </svg>
  )
}
