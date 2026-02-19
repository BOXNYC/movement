import {defineField, defineType} from 'sanity'
import {PlayIcon} from '@sanity/icons'
import {VideoEmbedInput} from '../../components/VideoEmbedInput'

/**
 * Video Embed schema for embedding videos via URL.
 * Supports Vimeo (including unlisted), YouTube, and other video platforms.
 */

export const videoEmbed = defineType({
  name: 'videoEmbed',
  title: 'Video Embed',
  type: 'object',
  icon: PlayIcon,
  components: {
    input: VideoEmbedInput,
  },
  fields: [
    defineField({
      name: 'url',
      title: 'Video URL',
      type: 'url',
      description: 'Paste the video embed URL (e.g., https://player.vimeo.com/video/123456789?h=abcdef)',
      validation: (rule) =>
        rule.uri({
          scheme: ['http', 'https'],
        }),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Optional title for accessibility',
    }),
    defineField({
      name: 'aspectRatio',
      title: 'Aspect Ratio',
      type: 'string',
      options: {
        list: [
          {title: '16:9 (Widescreen)', value: '16/9'},
          {title: '4:3 (Standard)', value: '4/3'},
          {title: '1:1 (Square)', value: '1/1'},
          {title: '9:16 (Vertical)', value: '9/16'},
        ],
      },
      initialValue: '16/9',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      url: 'url',
    },
    prepare({title, url}) {
      return {
        title: title || 'Video Embed',
        subtitle: url || 'No URL set',
        media: PlayIcon,
      }
    },
  },
})
