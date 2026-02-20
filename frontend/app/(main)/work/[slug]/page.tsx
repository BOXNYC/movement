import type {Metadata, ResolvingMetadata} from 'next'
import {notFound} from 'next/navigation'
import {type PortableTextBlock} from 'next-sanity'
import {Suspense} from 'react'

import Avatar from '@/app/components/Avatar'
import {MoreWork} from '@/app/components/Works'
import PortableText from '@/app/components/PortableText'
import Image from '@/app/components/SanityImage'
import VideoEmbed from '@/app/components/VideoEmbed'
import PageBuilder from '@/app/components/PageBuilder'
import {sanityFetch} from '@/sanity/lib/live'
import {workPagesSlugs, workQuery} from '@/sanity/lib/queries'
import {resolveOpenGraphImage, toCrop, toHotspot} from '@/sanity/lib/utils'
import Head from 'next/head'
import BG from '@/app/components/BG'
import { Heading, Subheading } from '@/app/components/Heading'
import Container from '@/app/components/Container'

type Props = {
  params: Promise<{slug: string}>
}

/**
 * Generate the static params for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: workPagesSlugs,
    // Use the published perspective in generateStaticParams
    perspective: 'published',
    stega: false,
  })
  return data
}

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params
  const {data: work} = await sanityFetch({
    query: workQuery,
    params,
    // Metadata should never contain stega
    stega: false,
  })
  const previousImages = (await parent).openGraph?.images || []
  const ogImage = resolveOpenGraphImage(work?.coverImage)

  return {
    authors:
      work?.author?.firstName && work?.author?.lastName
        ? [{name: `${work.author.firstName} ${work.author.lastName}`}]
        : [],
    title: work?.title,
    description: work?.excerpt,
    openGraph: {
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
  } satisfies Metadata
}

export default async function WorkPage(props: Props) {
  const params = await props.params
  const [{data: work}] = await Promise.all([sanityFetch({query: workQuery, params})])

  if (!work?._id) {
    return notFound()
  }

  return (
    <div className="mb-12 lg:mb-24 px-8">
      <BG pathname={`/work/${params.slug}`} />
      <Head>
        <title>{work.title}</title>
      </Head>
      <Container className="grid gap-12">
        <div>
          <div className="pb-6 grid gap-6 mb-6">
            <div className="mx-auto flex flex-col gap-6">
              <Heading className="text-mvmnt-darkbrown -mb-11 leading-[1]">{work.title}</Heading>
              {work.subtitle && (
                <Subheading className="text-mvmnt-darkbrown bg-mvmnt-pink text-xl font-base w-fit px-4 py-1 my-0 mx-auto">{work.subtitle}</Subheading>
              )}
            </div>
            {/* <div className="mx-auto flex gap-4 items-center">
              {work.author && work.author.firstName && work.author.lastName && (
                <Avatar
                  person={{
                    ...work.author,
                    picture: work.author.picture ?? undefined,
                  }}
                  date={work.date}
                />
              )}
              {work.tags && work.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {work.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div> */}
          </div>
          <article className="gap-6 grid max-w-4xl">
            <div className="">
              {work?.videoEmbed?.url ? (
                <VideoEmbed
                  url={work.videoEmbed.url}
                  title={work.videoEmbed.title}
                  aspectRatio={work.videoEmbed.aspectRatio}
                  className="w-full"
                />
              ) : work?.coverImage ? (
                <Image
                  id={work.coverImage.asset?._ref || ''}
                  alt={work.coverImage.alt || ''}
                  className="rounded-sm w-full"
                  width={1024}
                  height={538}
                  mode="cover"
                  hotspot={toHotspot(work.coverImage.hotspot)}
                  crop={toCrop(work.coverImage.crop)}
                />
              ) : null}
            </div>
            {work.content?.length && (
              <PortableText
                className="max-w-2xl prose-headings:font-medium prose-headings:tracking-tight"
                value={work.content as PortableTextBlock[]}
              />
            )}
            {work.pageBuilder && work.pageBuilder.length > 0 && (
              <PageBuilder page={work as any} />
            )}
            <div className="">
              <div className="py-12 lg:py-24 grid gap-12">
                <aside>
                  <Suspense>{await MoreWork({skip: work._id, limit: 2})}</Suspense>
                </aside>
              </div>
            </div>
          </article>
        </div>
      </Container>
    </div>
  )
}
