import Link from 'next/link'

import {sanityFetch} from '@/sanity/lib/live'
import {morePostsQuery, allPostsQuery} from '@/sanity/lib/queries'
import {AllPostsQueryResult} from '@/sanity.types'
// import DateComponent from '@/app/components/Date'
import OnBoarding from '@/app/components/Onboarding'
// import Avatar from '@/app/components/Avatar'
import {/* dataAttr, */ urlForImage} from '@/sanity/lib/utils'
import Image from 'next/image'

const Post = ({post, itemIndex}: {post: AllPostsQueryResult[number]; itemIndex: number}) => {
  const {title, slug, date, coverImage} = post
  const isEven = itemIndex % 2 === 0;

  return (
		<section className="w-full relative mb-20 block">
			{coverImage && <Image width={800} height={450} src={urlForImage(coverImage).url()} alt={title} className={`block ${isEven ? 'ml-0' : 'ml-auto'} w-full md:w-[85%] h-auto aspect-video object-cover rounded-xl`} />}
			<div className={`relative md:absolute px-3 md:px-0 top-0 md:top-[15px] md:top-[30px] text-center md:text-left z-10 flex flex-col items-center md:items-start w-full md:max-w-[35%] mt-2 md:mt-0 ${isEven ? 'right-0' : 'left-0'}`}>
				<h2 className="font-robuck text-[var(--color-mvmnt-blue)] bg-[var(--color-mvmnt-gold)] p-4 pb-5 m-0 text-2xl md:text-4xl leading-tight w-max max-w-full">{title}</h2>
				<p className="bg-[var(--color-mvmnt-darkbrown)] text-[var(--color-mvmnt-offwhite)] px-3 py-2 -mt-[15px] md:ml-[15px] mb-[10px] md:mb-[25px] w-max max-w-full md:text-[1.25rem] md:leading-[1.25rem]">{new Date(date).toLocaleDateString()}</p>
				<Link href={`/posts/${slug}`} className="px-3 md:px-5 py-2 text-[var(--color-mvmnt-gold)] bg-[var(--color-mvmnt-blue)] rounded-full hover:bg-[var(--color-mvmnt-gold)] hover:text-[var(--color-mvmnt-blue)] m-0 md:text-[1.25rem] md:leading-[1.25rem]">VIEW POST</Link>
			</div>
		</section>
  )

  /* return (
    <article
      data-sanity={dataAttr({id: _id, type: 'post', path: 'title'}).toString()}
      key={_id}
      className="border border-gray-200 rounded-sm p-6 bg-gray-50 flex flex-col justify-between transition-colors hover:bg-white relative"
    >
      <Link className="hover:text-brand underline transition-colors" href={`/posts/${slug}`}>
        <span className="absolute inset-0 z-10" />
      </Link>
      <div>
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

const Posts = ({
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

export const MorePosts = async ({skip, limit}: {skip: string; limit: number}) => {
  const {data} = await sanityFetch({
    query: morePostsQuery,
    params: {skip, limit},
  })

  if (!data || data.length === 0) {
    return null
  }

  return (
    <Posts heading={`Recent Posts`}>
      {data?.map((post: AllPostsQueryResult[number], index: number) => (
        <Post key={post._id} post={post} itemIndex={index} />
      ))}
    </Posts>
  )
}

export const AllPosts = async ({limit}: {limit?: number} = {}) => {
  const {data} = await sanityFetch({query: allPostsQuery})

  if (!data || data.length === 0) {
    return <OnBoarding />
  }

  const posts = limit ? data.slice(0, limit) : data

  return (
    <Posts>
      {posts.map((post: AllPostsQueryResult[number], index: number) => (
        <Post key={post._id} post={post} itemIndex={index} />
      ))}
    </Posts>
  )
}
