import React from 'react'

import Cta from '@/app/components/Cta'
import Info from '@/app/components/InfoSection'
import {dataAttr} from '@/sanity/lib/utils'
import {PageBuilderSection} from '@/sanity/lib/types'
import * as DynamicComponents from '@/app/components/Dynamic'

type DynamicComponentKeys = keyof typeof DynamicComponents

type BlockProps = {
  index: number
  block: PageBuilderSection
  pageId: string
  pageType: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BlocksType = Record<string, React.FC<any>>

const Blocks: BlocksType = {
  callToAction: Cta,
  infoSection: Info,
}

type JsonDataBlock = {
  _type: 'jsonData'
  _key: string
  title?: string
  data?: string
  componentType?: string
}

/**
 * Used by the <PageBuilder>, this component renders a the component that matches the block type.
 */
export default function BlockRenderer({block, index, pageId, pageType}: BlockProps) {
  // Handle jsonData blocks with dynamic components
  if ((block._type as string) === 'jsonData') {
    const jsonBlock = block as unknown as JsonDataBlock
    const componentName = jsonBlock.componentType as DynamicComponentKeys
    if (componentName && componentName in DynamicComponents) {
      const Component = DynamicComponents[componentName]
      const jsonData = jsonBlock.data ? JSON.parse(jsonBlock.data) : []
      return <Component jsonData={jsonData} />
    }
    // Fallback: show raw JSON if no matching dynamic component
    return (
      <div className="my-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No component found for: {jsonBlock.componentType}</p>
        <pre className="mt-2 text-sm">{jsonBlock.data}</pre>
      </div>
    )
  }

  // Block does exist
  if (typeof Blocks[block._type] !== 'undefined') {
    return (
      <div
        key={block._key}
        data-sanity={dataAttr({
          id: pageId,
          type: pageType,
          path: `pageBuilder[_key=="${block._key}"]`,
        }).toString()}
      >
        {React.createElement(Blocks[block._type], {
          key: block._key,
          block: block,
          index: index,
          pageId: pageId,
          pageType: pageType,
        })}
      </div>
    )
  }

  // Block doesn't exist yet
  return (
    <div className="w-full bg-gray-100 text-center text-gray-500 p-20 rounded">
      A &ldquo;{block._type}&rdquo; block hasn&apos;t been created
    </div>
  )
}
