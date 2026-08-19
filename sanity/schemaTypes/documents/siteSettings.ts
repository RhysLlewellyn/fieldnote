import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Singleton. One document, enforced in three places, because any one of them
 * on its own leaves a way to create a second:
 *   - structure.ts pins it to a single list item, so there is no list to
 *     "create new" from
 *   - sanity.config.ts strips the create, delete and duplicate actions
 *   - sanity.config.ts also removes it from the global new-document menu
 */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  groups: [
    {name: 'general', title: 'General', default: true},
    {name: 'navigation', title: 'Navigation'},
    {name: 'social', title: 'Social'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Site title',
      type: 'string',
      group: 'general',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Site description',
      type: 'text',
      rows: 2,
      group: 'general',
      description:
        'Used in search results and as the fallback social description across the site.',
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: 'defaultOgImage',
      title: 'Default social share image',
      type: 'image',
      group: 'general',
      description:
        'Used when a page has no image of its own. 1200x630 is the size to aim for.',
    }),
    defineField({
      name: 'navigation',
      title: 'Main navigation',
      type: 'array',
      group: 'navigation',
      description: 'The links across the top of every page, in order.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'href',
              title: 'Address',
              type: 'string',
              description: 'A path starting with a slash, like /issues',
              validation: (rule) =>
                rule
                  .required()
                  .custom((value) =>
                    value?.startsWith('/') ? true : 'Start the address with a slash',
                  ),
            }),
          ],
          preview: {select: {title: 'label', subtitle: 'href'}},
        }),
      ],
      validation: (rule) => rule.max(6).warning('More than six links is a crowded header'),
    }),
    defineField({
      name: 'footerText',
      title: 'Footer text',
      type: 'text',
      rows: 2,
      group: 'general',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      type: 'array',
      group: 'social',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Platform',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {select: {title: 'label', subtitle: 'url'}},
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({title: 'Site settings'}),
  },
})
