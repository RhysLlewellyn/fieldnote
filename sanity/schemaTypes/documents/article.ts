import {defineArrayMember, defineField, defineType} from 'sanity'

export const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'meta', title: 'Filing'},
    {name: 'seo', title: 'Search and social'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (rule) => [
        rule.required().error('An article needs a title before it can be published'),
        rule.max(90).error('Titles over 90 characters break the layout on the homepage'),
      ],
    }),
    defineField({
      name: 'slug',
      title: 'URL',
      type: 'slug',
      group: 'content',
      description:
        'The address this article lives at. Generated from the title — only change it before publishing, because changing it later breaks any existing links.',
      options: {source: 'title', maxLength: 96},
      validation: (rule) =>
        rule.required().error('Click Generate to create the URL from the title'),
    }),
    defineField({
      name: 'standfirst',
      title: 'Standfirst',
      type: 'text',
      rows: 3,
      group: 'content',
      description:
        'The short intro under the headline. Two or three sentences — it also becomes the search description and the social share text.',
      validation: (rule) => [
        rule.required().error('The standfirst is used on the homepage and in search results'),
        rule.max(200).error('Keep the standfirst under 200 characters'),
      ],
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      group: 'content',
      options: {hotspot: true},
      description:
        'Landscape works best. Use the hotspot to set what stays visible when the image is cropped square on the homepage.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          description:
            'Describe the image for someone who cannot see it.',
          validation: (rule) =>
            rule
              .required()
              .error('Alt text is required — the page fails accessibility without it'),
        }),
        defineField({
          name: 'credit',
          title: 'Credit',
          type: 'string',
          description: 'Photographer or source.',
        }),
      ],
      validation: (rule) => rule.required().error('Every article needs a cover image'),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
      group: 'content',
    }),

    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      group: 'meta',
      to: [{type: 'author'}],
      validation: (rule) => rule.required().error('Every article needs an author'),
    }),
    defineField({
      name: 'issue',
      title: 'Issue',
      type: 'reference',
      group: 'meta',
      to: [{type: 'issue'}],
      description:
        'Leave empty for web-only pieces that are not part of a printed issue.',
    }),
    defineField({
      name: 'topics',
      title: 'Topics',
      type: 'array',
      group: 'meta',
      of: [defineArrayMember({type: 'reference', to: [{type: 'topic'}]})],
      description:
        'Up to three. Topics are how readers navigate — more than three and they stop meaning anything.',
      validation: (rule) => rule.max(3).error('Three topics maximum'),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Publication date',
      type: 'datetime',
      group: 'meta',
      description: 'Controls the order articles appear in. Defaults to now.',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Feature on the homepage',
      type: 'boolean',
      group: 'meta',
      description:
        'The most recently published featured article takes the large slot at the top of the homepage.',
      initialValue: false,
    }),

    defineField({
      name: 'seo',
      title: 'Search and social',
      type: 'seo',
      group: 'seo',
    }),
  ],
  orderings: [
    {
      title: 'Newest first',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
    {
      title: 'Title A–Z',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'coverImage',
      publishedAt: 'publishedAt',
      featured: 'featured',
    },
    prepare: ({title, author, media, publishedAt, featured}) => {
      const date = publishedAt
        ? new Date(publishedAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : 'No date'
      return {
        title: (featured ? '★ ' : '') + (title || 'Untitled article'),
        subtitle: (author ? author + ' · ' : '') + date,
        media,
      }
    },
  },
})
