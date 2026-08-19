'use client'

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {presentationTool} from 'sanity/presentation'
import {structureTool} from 'sanity/structure'

import {apiVersion, dataset, projectId} from './sanity/env'
import {schemaTypes} from './sanity/schemaTypes'
import {structure} from './sanity/structure'

/** Document types that must never have a second instance. */
const SINGLETONS = new Set(['siteSettings'])

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  title: 'Fieldnote',
  schema: {types: schemaTypes},
  document: {
    // Strip create, delete and duplicate from the singleton, leaving an editor
    // with a document they can only ever edit and publish.
    actions: (actions, {schemaType}) =>
      SINGLETONS.has(schemaType)
        ? actions.filter(
            ({action}) =>
              action && ['publish', 'discardChanges', 'restore'].includes(action),
          )
        : actions,
    // And keep it out of the global "create new" menu, which bypasses the
    // structure entirely.
    newDocumentOptions: (items, {creationContext}) =>
      creationContext.type === 'global'
        ? items.filter((item) => !SINGLETONS.has(item.templateId))
        : items,
  },
  plugins: [
    structureTool({structure}),
    // Side-by-side editing: the site on the right, the document on the left,
    // updating as it is typed. `enable` points at the route that turns draft
    // mode on; without draft mode the preview would show published content
    // and silently be useless.
    presentationTool({
      previewUrl: {
        previewMode: {enable: '/api/draft-mode/enable'},
      },
    }),
    // Vision is the GROQ playground. Useful while building, and harmless in
    // production because it can only read what the viewer's token allows.
    visionTool({defaultApiVersion: apiVersion}),
  ],
})
