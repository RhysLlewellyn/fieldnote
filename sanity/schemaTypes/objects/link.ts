import {defineField, defineType} from 'sanity'

/**
 * The `link` annotation used inside Portable Text.
 *
 * `openInNewTab` is a boolean rather than a free-text `target` so an editor
 * cannot type something the renderer does not understand.
 */
export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({
      name: 'href',
      title: 'URL',
      type: 'url',
      description: 'Where the link goes. External links need https://',
      validation: (rule) =>
        rule
          .required()
          .uri({
            scheme: ['http', 'https', 'mailto', 'tel'],
            allowRelative: true,
          })
          .error('Enter a full URL starting https://, or a path starting /'),
    }),
    defineField({
      name: 'openInNewTab',
      title: 'Open in a new tab',
      type: 'boolean',
      description:
        'Leave off for links within Fieldnote. Turn on for links to other sites.',
      initialValue: false,
    }),
  ],
})
