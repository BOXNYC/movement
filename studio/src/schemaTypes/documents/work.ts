import {DocumentTextIcon} from '@sanity/icons'
import {format, parseISO} from 'date-fns'
import {defineField, defineType} from 'sanity'

/**
 * Work schema. Define and edit the fields for the 'work' content type.
 * Learn more: https://www.sanity.io/docs/schema-types
 */

export const work = defineType({
  name: 'work',
  title: 'Work',
  icon: DocumentTextIcon,
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Sub-title',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'A slug is required for the work to show up in the preview',
      options: {
        source: 'title',
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'blockContent',
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
        aiAssist: {
          imageDescriptionField: 'alt',
        },
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Important for SEO and accessibility.',
          validation: (rule) => {
            return rule.custom((alt, context) => {
              if ((context.document?.coverImage as any)?.asset?._ref && !alt) {
                return 'Required'
              }
              return true
            })
          },
        },
      ],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'video',
      title: 'Video',
      type: 'reference',
      to: [{type: 'mediaLibrary'}],
    }),
    defineField({
      name: 'videoEmbed',
      title: 'Video Embed',
      type: 'videoEmbed',
    }),
    defineField({
      name: 'iframes',
      title: 'Iframes',
      type: 'array',
      of: [{type: 'iframeEmbed'}],
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{type: 'person'}],
    }),
    defineField({
      name: 'pageBuilder',
      title: 'Page Builder',
      type: 'array',
      of: [{type: 'callToAction'}, {type: 'infoSection'}],
      options: {
        insertMenu: {
          views: [
            {
              name: 'grid',
              previewImageUrl: (schemaTypeName) =>
                `/static/page-builder-thumbnails/${schemaTypeName}.webp`,
            },
          ],
        },
      },
    }),
  ],
  preview: {
    select: {
      title: 'title',
      authorFirstName: 'author.firstName',
      authorLastName: 'author.lastName',
      date: 'date',
      media: 'coverImage',
      featured: 'featured',
    },
    prepare({title, media, authorFirstName, authorLastName, date, featured}) {
      const subtitles = [
        featured && '⭐ Featured',
        authorFirstName && authorLastName && `by ${authorFirstName} ${authorLastName}`,
        date && `on ${format(parseISO(date), 'LLL d, yyyy')}`,
      ].filter(Boolean)

      return {title, media, subtitle: subtitles.join(' ')}
    },
  },
})
