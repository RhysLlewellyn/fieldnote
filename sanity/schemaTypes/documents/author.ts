import {defineArrayMember, defineField, defineType} from 'sanity'

export const author = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL',
      type: 'slug',
      description: 'The address of this author’s page.',
      options: {source: 'name', maxLength: 96},
      validation: (rule) =>
        rule.required().error('Click Generate to create the URL from the name'),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      description:
        'How they are described under their name — “Contributing editor”, “Photographer”.',
    }),
    defineField({
      name: 'bio',
      title: 'Biography',
      type: 'simpleText',
      description: 'A paragraph or two. Links are allowed, headings are not.',
    }),
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      description: 'Personal site, socials, anywhere else their work lives.',
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
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {title: 'label', subtitle: 'url'},
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'role'},
  },
})
