import BlockRenderer from '@/app/components/BlockRenderer'
import {dataAttr} from '@/sanity/lib/utils'
import {PageBuilderSection} from '@/sanity/lib/types'

interface PageWithPageBuilder {
  _id: string
  _type: string
  pageBuilder: PageBuilderSection[] | null
}

type PageBuilderPageProps = {
  page: PageWithPageBuilder
}

/**
 * The PageBuilder component is used to render the blocks from the `pageBuilder` field in the Page type in your Sanity Studio.
 */

export default function PageBuilder({page}: PageBuilderPageProps) {
  if (!page?.pageBuilder || page.pageBuilder.length === 0) {
    return null
  }

  return (
    <div
      data-sanity={dataAttr({
        id: page._id,
        type: page._type,
        path: `pageBuilder`,
      }).toString()}
    >
      {page.pageBuilder.map((block: PageBuilderSection, index: number) => (
        <BlockRenderer
          key={block._key}
          index={index}
          block={block}
          pageId={page._id}
          pageType={page._type}
        />
      ))}
    </div>
  )
}
