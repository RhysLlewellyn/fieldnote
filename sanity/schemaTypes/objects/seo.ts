import {defineField, defineType} from 'sanity'

/**
 * Every field here is optional on purpose. Left empty, the renderer falls back
 * to the article's own title, standfirst and cover image, so an editor only
 * fills this in when they want to override the default.
 */
export const seo = defineType({
  name: 'seo',
  title: 'Search and social',
  type: 'object',
  options: {collapsible: true, collapsed: true},
  fields: [
    defineField({
      name: 'title',
      title: 'Title override',
      type: 'string',
      description:
        'Only if the headline is wrong for search results. Leave empty to use the article title.',
      validation: (rule) =>
        rule
          .max(60)
          .warning('Titles over 60 characters get cut off in search results'),
    }),
    defineField({
      name: 'description',
      title: 'Description override',
      type: 'text',
      rows: 3,
      description:
        'Leave empty to use the standfirst, which is usually the better text anyway.',
      validation: (rule) =>
        rule.max(160).warning('Descriptions over 160 characters get cut off'),
    }),
    defineField({
      name: 'ogImage',
      title: 'Social share image override',
      type: 'image',
      description:
        'Leave empty to use the cover image. Only set this if the cover crops badly at 1200x630.',
    }),
  ],
})
