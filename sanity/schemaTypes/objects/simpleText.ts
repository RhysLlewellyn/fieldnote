import {defineArrayMember, defineType} from 'sanity'

/**
 * Paragraphs and links, nothing else.
 *
 * Used for author bios, where headings and images would only ever be a
 * mistake. Restricting the schema is cheaper than reviewing the output.
 */
export const simpleText = defineType({
  name: 'simpleText',
  title: 'Text',
  type: 'array',
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
})
