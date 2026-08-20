'use client'

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {defineDocuments, defineLocations, presentationTool} from 'sanity/presentation'
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
      // Without `resolve` the preview opens the homepage whatever document is
      // being edited, which makes the pane useless for anything not on it —
      // and loads the heaviest page on the site to do it.
      resolve: {
        // URL -> document. Which document is this page about? This is what
        // makes clicking through the preview select the right document in the
        // pane beside it.
        mainDocuments: defineDocuments([
          {route: '/articles/:slug', filter: '_type == "article" && slug.current == $slug'},
          {route: '/issues/:slug', filter: '_type == "issue" && slug.current == $slug'},
          {route: '/topics/:slug', filter: '_type == "topic" && slug.current == $slug'},
          {route: '/authors/:slug', filter: '_type == "author" && slug.current == $slug'},
          {route: '/:slug', filter: '_type == "page" && slug.current == $slug'},
        ]),
        // Document -> URL. Where can this document be seen? The first entry is
        // where the preview opens, so it is always the document's own page.
        // The homepage follows for the types that appear on it, because an
        // editor changing a headline wants to check both.
        locations: {
          article: defineLocations({
            select: {title: 'title', slug: 'slug.current'},
            resolve: (doc) => ({
              locations: [
                {title: doc?.title || 'Untitled', href: `/articles/${doc?.slug}`},
                {title: 'Home', href: '/'},
              ],
            }),
          }),
          issue: defineLocations({
            select: {title: 'title', slug: 'slug.current'},
            resolve: (doc) => ({
              locations: [
                {title: doc?.title || 'Untitled', href: `/issues/${doc?.slug}`},
                {title: 'All issues', href: '/issues'},
              ],
            }),
          }),
          topic: defineLocations({
            select: {title: 'title', slug: 'slug.current'},
            resolve: (doc) => ({
              locations: [
                {title: doc?.title || 'Untitled', href: `/topics/${doc?.slug}`},
                {title: 'All topics', href: '/topics'},
              ],
            }),
          }),
          author: defineLocations({
            select: {name: 'name', slug: 'slug.current'},
            resolve: (doc) => ({
              locations: [{title: doc?.name || 'Untitled', href: `/authors/${doc?.slug}`}],
            }),
          }),
          page: defineLocations({
            select: {title: 'title', slug: 'slug.current'},
            resolve: (doc) => ({
              locations: [{title: doc?.title || 'Untitled', href: `/${doc?.slug}`}],
            }),
          }),
          // Site settings has no page of its own; it is the header, the footer
          // and the metadata on every one of them.
          siteSettings: defineLocations({
            select: {},
            resolve: () => ({
              message: 'Shown on every page — the masthead, the navigation and the footer.',
              tone: 'caution',
              locations: [{title: 'Home', href: '/'}],
            }),
          }),
        },
      },
    }),
    // Vision is the GROQ playground. Useful while building, and harmless in
    // production because it can only read what the viewer's token allows.
    visionTool({defaultApiVersion: apiVersion}),
  ],
})
