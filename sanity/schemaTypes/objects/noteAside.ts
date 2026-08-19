import {defineArrayMember, defineField, defineType} from 'sanity'

export const noteAside = defineType({
  name: 'noteAside',
  title: 'Aside',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      description:
        'Paragraphs only. An aside is not the place for headings or images.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{title: 'Paragraph', value: 'normal'}],
          lists: [],
          marks: {
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
            ],
            annotations: [defineArrayMember({type: 'link'})],
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'tone',
      title: 'Tone',
      type: 'string',
      options: {
        list: [
          {title: 'Note', value: 'note'},
          {title: 'Caution', value: 'caution'},
        ],
        layout: 'radio',
      },
      initialValue: 'note',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {title: 'title', tone: 'tone'},
    prepare: ({title, tone}) => ({
      title: title || 'Untitled aside',
      subtitle: tone === 'caution' ? 'Aside — caution' : 'Aside — note',
    }),
  },
})
