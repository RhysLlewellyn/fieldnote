/**
 * Fetches Zodiak from Fontshare into `app/fonts/`, which is gitignored.
 *
 * Zodiak is free for commercial use, and the ITF Free Font License permits
 * self-hosting it on your own site — which is what the deployed build does.
 * What it does not permit is redistributing the file, and it names
 * repositories and publicly accessible servers explicitly. This repo is
 * public, so the font cannot live in it. The build fetches it instead.
 *
 * The same licence forbids subsetting and format conversion, so the official
 * woff2 is written through byte for byte. Do not run it through a subsetter to
 * save the 37KB.
 *
 * Runs from `predev` and `prebuild`, and is a no-op once the file is there.
 */
import {createHash} from 'node:crypto'
import {mkdir, readFile, writeFile} from 'node:fs/promises'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {inflateRawSync} from 'node:zlib'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(ROOT, 'app', 'fonts')

const SOURCE = 'https://api.fontshare.com/v2/fonts/download/zodiak'
const WANTED = 'Fonts/WEB/fonts/Zodiak-Variable.woff2'
const OUT = join(OUT_DIR, 'Zodiak-Variable.woff2')

/**
 * A one-file reader for the one archive this script downloads.
 *
 * Node ships deflate but not zip, and pulling a zip library in as a
 * dependency to read a single member is the more expensive answer. The
 * central directory is walked from the end-of-central-directory record, which
 * is the only reliable way in: the local headers alone can carry sizes of
 * zero and defer them to a trailing descriptor.
 */
function readZipEntry(buf, name) {
  const EOCD = 0x06054b50
  let eocd = -1
  for (let i = buf.length - 22; i >= 0; i--) {
    if (buf.readUInt32LE(i) === EOCD) {
      eocd = i
      break
    }
  }
  if (eocd < 0) throw new Error('not a zip archive: no end-of-central-directory record')

  const count = buf.readUInt16LE(eocd + 10)
  let p = buf.readUInt32LE(eocd + 16)

  for (let i = 0; i < count; i++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error('corrupt central directory')

    const method = buf.readUInt16LE(p + 10)
    const compressed = buf.readUInt32LE(p + 20)
    const size = buf.readUInt32LE(p + 24)
    const nameLen = buf.readUInt16LE(p + 28)
    const extraLen = buf.readUInt16LE(p + 30)
    const commentLen = buf.readUInt16LE(p + 32)
    const localAt = buf.readUInt32LE(p + 42)
    const entry = buf.toString('utf8', p + 46, p + 46 + nameLen)

    if (entry.endsWith(name)) {
      if (buf.readUInt32LE(localAt) !== 0x04034b50) throw new Error('corrupt local header')
      const start =
        localAt + 30 + buf.readUInt16LE(localAt + 26) + buf.readUInt16LE(localAt + 28)
      const raw = buf.subarray(start, start + compressed)
      const out = method === 0 ? raw : inflateRawSync(raw)
      if (out.length !== size) throw new Error(`${entry}: expected ${size} bytes, got ${out.length}`)
      return out
    }

    p += 46 + nameLen + extraLen + commentLen
  }

  throw new Error(`${name} is not in the archive`)
}

async function alreadyThere() {
  try {
    const existing = await readFile(OUT)
    // 'wOF2'. A truncated or half-written file is worse than a missing one:
    // the build succeeds and the site ships an unparseable face.
    return existing.length > 1024 && existing.toString('ascii', 0, 4) === 'wOF2'
  } catch {
    return false
  }
}

if (await alreadyThere()) {
  process.exit(0)
}

const response = await fetch(SOURCE)
if (!response.ok) {
  throw new Error(`Fontshare returned ${response.status} ${response.statusText} for ${SOURCE}`)
}

const font = readZipEntry(Buffer.from(await response.arrayBuffer()), WANTED)
if (font.toString('ascii', 0, 4) !== 'wOF2') {
  throw new Error('the extracted file is not a woff2')
}

await mkdir(OUT_DIR, {recursive: true})
await writeFile(OUT, font)

const digest = createHash('sha256').update(font).digest('hex').slice(0, 16)
console.log(`Zodiak-Variable.woff2 — ${font.length} bytes, sha256:${digest}`)
