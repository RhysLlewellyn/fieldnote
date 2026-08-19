import {defineField, defineType} from 'sanity'

export const issue = defineType({
  name: 'issue',
  title: 'Issue',
  type: 'document',
  fields: [
    defineField({
      name: 'number',
      title: 'Issue number',
      type: 'number',
      description: 'Whole numbers, counting up from one.',
      validation: (rule) =>
        rule
          .required()
          .integer()
          .positive()
          .error('Issue numbers are whole numbers above zero'),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The theme of the issue — “The Long Way Round”.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL',
      type: 'slug',
      description:
        'Generated from the issue number. Issues live at /issues/1, /issues/2 and so on.',
      options: {
        source: (doc) => String((doc as {number?: number}).number ?? ''),
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Publication date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'introduction',
      title: 'Editor’s introduction',
      type: 'blockContent',
      description: 'The letter that opens the issue.',
    }),
    defineField({
      name: 'colophon',
      title: 'Colophon',
      type: 'text',
      rows: 4,
      description:
        'Paper stock, typefaces, printer — the production note at the back of the issue.',
    }),
  ],
  orderings: [
    {
      title: 'Newest first',
      name: 'numberDesc',
      by: [{field: 'number', direction: 'desc'}],
    },
  ],
  preview: {
    select: {number: 'number', title: 'title'},
    prepare: ({number, title}) => ({
      title: 'Issue ' + (number ?? '—'),
      subtitle: title,
    }),
  },
})
