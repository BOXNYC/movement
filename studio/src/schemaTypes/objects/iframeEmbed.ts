import {defineField, defineType} from 'sanity'
import {CodeBlockIcon} from '@sanity/icons'
import {IframeEmbedInput} from '../../components/IframeEmbedInput'

/**
 * Iframe Embed schema object for embedding external content.
 * Learn more: https://www.sanity.io/docs/object-type
 */

export const iframeEmbed = defineType({
  name: 'iframeEmbed',
  title: 'Iframe Embed',
  type: 'object',
  icon: CodeBlockIcon,
  components: {
    input: IframeEmbedInput,
  },
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: (rule) =>
        rule.uri({
          scheme: ['http', 'https'],
        }),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      url: 'url',
    },
    prepare({title, url}) {
      return {
        title: title || 'Untitled Iframe',
        subtitle: url || 'No URL set',
      }
    },
  },
})
