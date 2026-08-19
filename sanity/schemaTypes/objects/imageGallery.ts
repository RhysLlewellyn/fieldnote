import {defineArrayMember, defineField, defineType} from 'sanity'

export const imageGallery = defineType({
  name: 'imageGallery',
  title: 'Image gallery',
  type: 'object',
  fields: [
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [defineArrayMember({type: 'captionedImage'})],
      validation: (rule) =>
        rule
          .required()
          .min(2)
          .max(6)
          .error('A gallery needs between 2 and 6 images'),
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      description:
        'Side by side works best for two images of the same orientation.',
      options: {
        list: [
          {title: 'Grid', value: 'grid'},
          {title: 'Side by side', value: 'sideBySide'},
        ],
        layout: 'radio',
      },
      initialValue: 'grid',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {images: 'images', layout: 'layout', media: 'images.0.asset'},
    prepare: ({images, layout, media}) => ({
      title: 'Gallery — ' + (images?.length ?? 0) + ' images',
      subtitle: layout === 'sideBySide' ? 'Side by side' : 'Grid',
      media,
    }),
  },
})
