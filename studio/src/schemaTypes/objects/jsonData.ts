import {defineField, defineType} from 'sanity'
import {CodeBlockIcon} from '@sanity/icons'

/**
 * JSON Data schema object for storing arbitrary JSON data in page builder.
 * Useful for custom components, configuration, or structured data.
 */

export const jsonData = defineType({
  name: 'jsonData',
  title: 'JSON Data',
  type: 'object',
  icon: CodeBlockIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'A label to identify this data block',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'componentType',
      title: 'Component Type',
      type: 'string',
      description: 'Identifier for the frontend component that should render this data',
    }),
    defineField({
      name: 'data',
      title: 'JSON Data',
      type: 'text',
      description: 'Enter valid JSON data',
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value) return true
          try {
            JSON.parse(value)
            return true
          } catch {
            return 'Invalid JSON format'
          }
        }),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      componentType: 'componentType',
    },
    prepare({title, componentType}) {
      return {
        title: title || 'JSON Data',
        subtitle: componentType ? `Component: ${componentType}` : 'JSON Data Block',
      }
    },
  },
})
