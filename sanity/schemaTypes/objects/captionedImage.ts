import {defineField, defineType} from 'sanity'

export const captionedImage = defineType({
  name: 'captionedImage',
  title: 'Image',
  type: 'image',
  options: {hotspot: true},
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternative text',
      type: 'string',
      description:
        'Describe the image for someone who cannot see it. Not the same as the caption.',
      validation: (rule) =>
        rule
          .required()
          .error('Alt text is required — the page fails accessibility without it'),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Shown under the image. Optional.',
    }),
    defineField({
      name: 'credit',
      title: 'Credit',
      type: 'string',
      description: 'Photographer or source. Shown alongside the caption.',
    }),
  ],
  preview: {
    select: {media: 'asset', alt: 'alt', caption: 'caption'},
    prepare: ({media, alt, caption}) => ({
      title: caption || alt || 'Image',
      subtitle: caption && alt ? alt : 'Image',
      media,
    }),
  },
})
