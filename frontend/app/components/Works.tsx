import Link from 'next/link'

import {sanityFetch} from '@/sanity/lib/live'
import {moreWorkQuery, allWorkQuery, adjacentWorkQuery} from '@/sanity/lib/queries'
import {AllWorkQueryResult} from '@/sanity.types'
// import DateComponent from '@/app/components/Date'
import {WorkOnboarding} from '@/app/components/Onboarding'
// import Avatar from '@/app/components/Avatar' 
import {dataAttr, urlForImage} from '@/sanity/lib/utils'
import Image from 'next/image'

const WorkItem = ({work, itemIndex}: {work: AllWorkQueryResult[number], itemIndex: number}) => {
  const {_id, title, slug, coverImage, subtitle, /* excerpt, date, author, tags, featured */} = work
  const isEven = itemIndex % 2 === 0;
  
  return (
    <section 
      data-sanity={dataAttr({id: _id, type: 'work', path: 'title'}).toString()}
      className="w-full relative mb-20 block"
    >
      {coverImage && <Image alt={title} src={urlForImage(coverImage).url()} width={800} height={450} className={`block ${isEven ? 'ml-auto' : 'ml-0'} w-full md:w-[85%] h-auto aspect-video object-cover rounded-xl`} />}
			<div className={`relative md:absolute px-3 md:px-0 top-0 md:top-[15px] md:top-[30px] text-center md:text-left z-10 flex flex-col items-center md:items-start w-full md:max-w-[35%] mt-2 md:mt-0 ${isEven ? 'left-0' : 'right-0'}`}>
				<h2 className="text-[var(--color-mvmnt-darkbrown)] bg-[var(--color-mvmnt-pink)] p-4 pb-5 m-0 text-2xl md:text-4xl leading-tight w-max max-w-full">{title}</h2>
				<p className="bg-[var(--color-mvmnt-darkbrown)] text-[var(--color-mvmnt-offwhite)] px-3 py-2 -mt-[15px] md:ml-[15px] mb-[10px] md:mb-[25px] w-max max-w-full md:text-[1.25rem] md:leading-[1.25rem]">{subtitle}</p>
				<Link href={`/work/${slug}`} className="px-3 md:px-5 py-2 text-[var(--color-mvmnt-darkbrown)] bg-[var(--color-mvmnt-pink)] rounded-full hover:bg-[var(--color-mvmnt-darkbrown)] hover:text-[var(--color-mvmnt-pink)] m-0 md:text-[1.25rem] md:leading-[1.25rem]">VIEW PROJECT</Link>
			</div>
		</section>
  );

  /* return (
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
  ) */
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
    <Works heading={`More Work`}>
      {data?.map((work: AllWorkQueryResult[number], index: number) => (
        <WorkItem key={work._id} work={work} itemIndex={index} />
      ))}
    </Works>
  )
}

export const WorkNavigation = async ({currentOrderRank, currentId}: {currentOrderRank: string; currentId: string}) => {
  const {data} = await sanityFetch({
    query: adjacentWorkQuery,
    params: {currentOrderRank, currentId},
  })

  if (!data || (!data.previous && !data.next && !data.related)) {
    return null
  }

  return (
    <div className="flex flex-col gap-12">
      <nav className="flex flex-col md:flex-row md:justify-between gap-8">
        {data.previous ? (
          <Link href={`/work/${data.previous.slug}`} className="relative flex-1 block">
            {data.previous.coverImage && (
              <Image
                alt={data.previous.title}
                src={urlForImage(data.previous.coverImage).url()}
                width={600}
                height={338}
                className="w-full h-auto aspect-video object-cover rounded-xl"
              />
            )}
            <div className="relative md:absolute px-3 md:px-0 top-0 md:top-[15px] text-center md:text-left z-10 flex flex-col items-center md:items-start w-full mt-2 md:mt-0 left-0">
              <span className="bg-mvmnt-darkbrown text-mvmnt-offwhite px-3 py-1 text-sm mb-2 -translate-x-3">← Previous Project</span>
              <h2 className="font-robuck text-mvmnt-darkbrown bg-mvmnt-pink p-3 m-0 text-2xl md:text-3xl lg:text-4xl leading-tight w-max max-w-full -mb-3">{data.previous.title}</h2>
              <h3 className="text-mvmnt-offwhite bg-mvmnt-darkbrown p-3 m-0 leading-tight w-max max-w-full">{data.previous.subtitle}</h3>
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        {data.next ? (
          <Link href={`/work/${data.next.slug}`} className="relative flex-1">
            {data.next.coverImage && (
              <Image
                alt={data.next.title}
                src={urlForImage(data.next.coverImage).url()}
                width={600}
                height={338}
                className="w-full h-auto aspect-video object-cover rounded-xl"
              />
            )}
            <div className="relative md:absolute px-3 md:px-0 top-0 md:top-[15px] text-center md:text-right z-10 flex flex-col items-center md:items-end w-full mt-2 md:mt-0 right-0">
              <span className="bg-mvmnt-darkbrown text-mvmnt-offwhite px-3 py-1 text-sm mb-2 translate-x-3">Next Project →</span>
              <h2 className="font-robuck text-mvmnt-darkbrown bg-mvmnt-pink p-3 m-0 text-2xl md:text-3xl lg:text-4xl leading-tight w-max max-w-full -mb-3">{data.next.title}</h2>
              <h3 className="text-mvmnt-offwhite bg-mvmnt-darkbrown p-3 m-0 leading-tight w-max max-w-full">{data.next.subtitle}</h3>
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </nav>
      {data.related && (
        <div className="flex justify-center">
          <Link href={`/work/${data.related.slug}`} className="relative w-full md:w-2/3">
            {data.related.coverImage && (
              <Image
                alt={data.related.title}
                src={urlForImage(data.related.coverImage).url()}
                width={800}
                height={450}
                className="w-full h-auto aspect-video object-cover rounded-xl"
              />
            )}
            <div className="relative md:absolute px-3 md:px-0 top-0 md:top-[15px] text-center z-10 flex flex-col items-center w-full mt-2 md:mt-0 left-1/2 md:-translate-x-1/2">
              <span className="bg-mvmnt-darkbrown text-mvmnt-offwhite px-3 py-1 text-sm mb-2">Related Project</span>
              <h2 className="font-robuck text-mvmnt-darkbrown bg-mvmnt-pink p-3 m-0 text-2xl md:text-3xl lg:text-4xl leading-tight w-max max-w-full -mb-3">{data.related.title}</h2>
              <h3 className="text-mvmnt-offwhite bg-mvmnt-darkbrown p-3 m-0 leading-tight w-max max-w-full">{data.related.subtitle}</h3>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}

export const AllWork = async ({featuredOnly}: {featuredOnly?: boolean} = {}) => {
  // TODO: use featuredWorkQuery
  const {data} = await sanityFetch({query: allWorkQuery})

  if (!data || data.length === 0) {
    return <WorkOnboarding />
  }

  const workItems = featuredOnly ? data.filter((work: AllWorkQueryResult[number]) => work.featured) : data

  if (workItems.length === 0) {
    return null
  }

  return (
    <Works>
      {workItems.map((work: AllWorkQueryResult[number], index: number) => (
        <WorkItem key={work._id} work={work} itemIndex={index} />
      ))}
    </Works>
  )
}
