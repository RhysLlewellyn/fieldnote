import {defineField, defineType} from 'sanity'

export const pullQuote = defineType({
  name: 'pullQuote',
  title: 'Pull quote',
  type: 'object',
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 3,
      description: 'Without quotation marks — the design adds those.',
      validation: (rule) =>
        rule
          .required()
          .max(240)
          .error('Pull quotes work best under 240 characters'),
    }),
    defineField({
      name: 'attribution',
      title: 'Attribution',
      type: 'string',
      description:
        'Who said it. Leave empty if the quote is from the article itself.',
    }),
  ],
  preview: {
    select: {quote: 'quote', attribution: 'attribution'},
    prepare: ({quote, attribution}) => ({
      title: quote ? '“' + quote + '”' : 'Empty pull quote',
      subtitle: attribution ? '— ' + attribution : 'Pull quote',
    }),
  },
})
