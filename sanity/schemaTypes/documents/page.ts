import {defineField, defineType} from 'sanity'

/**
 * Standing pages — About, Contact. Anything that is not an article and does
 * not belong to an issue.
 */
export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL',
      type: 'slug',
      description:
        'Pages live at the top level — /about, /contact. Avoid “articles”, “issues”, “topics” and “authors”, which are taken.',
      options: {source: 'title', maxLength: 96},
      validation: (rule) =>
        rule.required().custom((value) => {
          const reserved = ['articles', 'issues', 'topics', 'authors', 'studio', 'feed']
          if (value?.current && reserved.includes(value.current)) {
            return 'That address is used by the site itself — pick another'
          }
          return true
        }),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
    }),
    defineField({
      name: 'seo',
      title: 'Search and social',
      type: 'seo',
    }),
  ],
  preview: {
    select: {title: 'title', slug: 'slug.current'},
    prepare: ({title, slug}) => ({
      title: title || 'Untitled page',
      subtitle: slug ? '/' + slug : 'No URL set',
    }),
  },
})
