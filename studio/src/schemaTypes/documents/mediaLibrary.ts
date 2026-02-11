import {PlayIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/**
 * Media Library schema for video content.
 * Learn more: https://www.sanity.io/docs/schema-types
 */

export const mediaLibrary = defineType({
  name: 'mediaLibrary',
  title: 'Media Library',
  icon: PlayIcon,
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      description: 'URL to the video (YouTube, Vimeo, etc.)',
    }),
    defineField({
      name: 'videoFile',
      title: 'Video File',
      type: 'file',
      description: 'Or upload a video file directly',
      options: {
        accept: 'video/*',
      },
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Important for SEO and accessibility.',
        },
      ],
    }),
    defineField({
      name: 'duration',
      title: 'Duration',
      type: 'string',
      description: 'Video duration (e.g., "5:30")',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'thumbnail',
      duration: 'duration',
    },
    prepare({title, media, duration}) {
      return {
        title,
        media,
        subtitle: duration ? `Duration: ${duration}` : 'Video',
      }
    },
  },
})
