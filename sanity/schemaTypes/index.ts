import type {SchemaTypeDefinition} from 'sanity'

import {blockContent} from './objects/blockContent'
import {captionedImage} from './objects/captionedImage'
import {imageGallery} from './objects/imageGallery'
import {link} from './objects/link'
import {noteAside} from './objects/noteAside'
import {pullQuote} from './objects/pullQuote'
import {seo} from './objects/seo'
import {simpleText} from './objects/simpleText'

import {article} from './documents/article'
import {author} from './documents/author'
import {issue} from './documents/issue'
import {page} from './documents/page'
import {siteSettings} from './documents/siteSettings'
import {topic} from './documents/topic'

export const schemaTypes: SchemaTypeDefinition[] = [
  // Documents
  article,
  author,
  issue,
  topic,
  page,
  siteSettings,

  // Portable Text and shared objects
  blockContent,
  simpleText,
  link,
  seo,
  pullQuote,
  captionedImage,
  imageGallery,
  noteAside,
]
