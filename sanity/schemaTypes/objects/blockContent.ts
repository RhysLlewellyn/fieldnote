import {defineArrayMember, defineType} from 'sanity'

/**
 * The article body.
 *
 * H1 is deliberately absent. The article title is the page's only h1, and
 * letting an editor add a second one is the most common way a CMS-backed site
 * fails an accessibility audit.
 */
export const blockContent = defineType({
  name: 'blockContent',
  title: 'Body',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Paragraph', value: 'normal'},
        {title: 'Heading', value: 'h2'},
        {title: 'Subheading', value: 'h3'},
        {title: 'Quote', value: 'blockquote'},
      ],
      lists: [
        {title: 'Bulleted', value: 'bullet'},
        {title: 'Numbered', value: 'number'},
      ],
      marks: {
        decorators: [
          {title: 'Bold', value: 'strong'},
          {title: 'Italic', value: 'em'},
          {title: 'Code', value: 'code'},
        ],
        annotations: [defineArrayMember({type: 'link'})],
      },
    }),
    defineArrayMember({type: 'pullQuote'}),
    defineArrayMember({type: 'captionedImage'}),
    defineArrayMember({type: 'imageGallery'}),
    defineArrayMember({type: 'noteAside'}),
  ],
})
