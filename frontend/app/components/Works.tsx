import Link from 'next/link'

import {sanityFetch} from '@/sanity/lib/live'
import {moreWorkQuery, allWorkQuery} from '@/sanity/lib/queries'
import {AllWorkQueryResult} from '@/sanity.types'
import DateComponent from '@/app/components/Date'
import {WorkOnboarding} from '@/app/components/Onboarding'
import Avatar from '@/app/components/Avatar'
import {dataAttr} from '@/sanity/lib/utils'

const WorkItem = ({work}: {work: AllWorkQueryResult[number]}) => {
  const {_id, title, slug, excerpt, date, author, tags, featured} = work

  return (
    <article
      data-sanity={dataAttr({id: _id, type: 'work', path: 'title'}).toString()}
      key={_id}
      className="border border-gray-200 rounded-sm p-6 bg-gray-50 flex flex-col justify-between transition-colors hover:bg-white relative"
    >
      <Link className="hover:text-brand underline transition-colors" href={`/work/${slug}`}>
        <span className="absolute inset-0 z-10" />
      </Link>
      <div>
        <div className="flex items-center gap-2 mb-2">
          {featured && (
            <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
              Featured
            </span>
          )}
          {tags && tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <h3 className="text-2xl mb-4">{title}</h3>

        <p className="line-clamp-3 text-sm leading-6 text-gray-600 max-w-[70ch]">{excerpt}</p>
      </div>
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
        {author && author.firstName && author.lastName && (
          <div className="flex items-center">
            <Avatar
              person={{...author, picture: author.picture ?? undefined}}
              small={true}
            />
          </div>
        )}
        <time className="text-gray-500 text-xs font-mono" dateTime={date}>
          <DateComponent dateString={date} />
        </time>
      </div>
    </article>
  )
}

const Works = ({
  children,
  heading,
  subHeading,
}: {
  children: React.ReactNode
  heading?: string
  subHeading?: string
}) => (
  <div>
    {heading && <h2 className="text-3xl text-gray-900 sm:text-4xl lg:text-5xl">{heading}</h2>}
    {subHeading && <p className="mt-2 text-lg leading-8 text-gray-600">{subHeading}</p>}
    <div className="pt-6 space-y-6">{children}</div>
  </div>
)

export const MoreWork = async ({skip, limit}: {skip: string; limit: number}) => {
  const {data} = await sanityFetch({
    query: moreWorkQuery,
    params: {skip, limit},
  })

  if (!data || data.length === 0) {
    return null
  }

  return (
    <Works heading={`More Work (${data?.length})`}>
      {data?.map((work: AllWorkQueryResult[number]) => (
        <WorkItem key={work._id} work={work} />
      ))}
    </Works>
  )
}

export const AllWork = async ({featuredOnly}: {featuredOnly?: boolean} = {}) => {
  // TODO: use featuredWorkQuery
  const {data} = await sanityFetch({query: allWorkQuery})

  if (!data || data.length === 0) {
    return <WorkOnboarding />
  }

  const workItems = featuredOnly ? data.filter((work) => work.featured) : data

  if (workItems.length === 0) {
    return null
  }

  return (
    <Works
      heading={featuredOnly ? 'Featured Work' : 'Our Work'}
      subHeading={featuredOnly ? undefined : `${workItems.length === 1 ? 'This work item is' : `These ${workItems.length} work items are`} populated from your Sanity Studio.`}
    >
      {workItems.map((work: AllWorkQueryResult[number]) => (
        <WorkItem key={work._id} work={work} />
      ))}
    </Works>
  )
}
