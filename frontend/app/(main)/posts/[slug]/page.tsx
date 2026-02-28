import type {Metadata, ResolvingMetadata} from 'next'
import {notFound} from 'next/navigation'
import {type PortableTextBlock} from 'next-sanity'
import {Suspense} from 'react'

import Avatar from '@/app/components/Avatar'
import {PostNavigation} from '@/app/components/Posts'
import PortableText from '@/app/components/PortableText'
import Image from '@/app/components/SanityImage'
import VideoEmbed from '@/app/components/VideoEmbed'
import {sanityFetch} from '@/sanity/lib/live'
import {postPagesSlugs, postQuery} from '@/sanity/lib/queries'
import {resolveOpenGraphImage, toCrop, toHotspot} from '@/sanity/lib/utils'
import Head from 'next/head'
import BG from '@/app/components/BG'
import { Heading } from '@/app/components/Heading'
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
    query: postPagesSlugs,
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
  const {data: post} = await sanityFetch({
    query: postQuery,
    params,
    // Metadata should never contain stega
    stega: false,
  })
  const previousImages = (await parent).openGraph?.images || []
  const ogImage = resolveOpenGraphImage(post?.coverImage)

  return {
    authors:
      post?.author?.firstName && post?.author?.lastName
        ? [{name: `${post.author.firstName} ${post.author.lastName}`}]
        : [],
    title: post?.title,
    description: post?.excerpt,
    openGraph: {
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
  } satisfies Metadata
}

export default async function PostPage(props: Props) {
  const params = await props.params
  const [{data: post}] = await Promise.all([sanityFetch({query: postQuery, params})])

  if (!post?._id) {
    return notFound()
  }

  return (
    <div className="mb-12 lg:mb-24 px-8">
      <BG pathname={`/posts/${params.slug}`} />
      <Head>
        <title>{post.title}</title>
      </Head>
      <Container className="mb-12 lg:mb-24 grid gap-12">
        <div>
          <div className="pb-6 grid gap-6 mb-6">
            <div className="mx-auto flex flex-col gap-6">
              <Heading className="text-mvmnt-gold">{post.title}</Heading>
            </div>
            <div className="mx-auto flex gap-4 items-center">
              {post.author && post.author.firstName && post.author.lastName && (
                <Avatar
                  person={{
                    ...post.author,
                    picture: post.author.picture ?? undefined,
                  }}
                  date={post.date}
                />
              )}
            </div>
          </div>
          <article className="gap-6 grid max-w-4xl">
            <div className="">
              {post?.videoEmbed?.url ? (
                <VideoEmbed
                  url={post.videoEmbed.url}
                  title={post.videoEmbed.title}
                  aspectRatio={post.videoEmbed.aspectRatio}
                  className="w-full"
                />
              ) : post?.coverImage ? (
                <Image
                  id={post.coverImage.asset?._ref || ''}
                  alt={post.coverImage.alt || ''}
                  className="rounded-sm w-full"
                  width={1024}
                  height={538}
                  mode="cover"
                  hotspot={toHotspot(post.coverImage.hotspot)}
                  crop={toCrop(post.coverImage.crop)}
                />
              ) : null}
            </div>
            {post.content?.length && (
              <PortableText
                className="max-w-2xl prose-headings:font-medium prose-headings:tracking-tight"
                value={post.content as PortableTextBlock[]}
              />
            )}
            <div className="">
              <div className="py-12 lg:py-24 grid gap-12">
                <aside>
                  <Suspense>{post._createdAt && await PostNavigation({currentCreatedAt: post._createdAt, currentId: post._id})}</Suspense>
                </aside>
              </div>
            </div>
          </article>
        </div>
      </Container>
    </div>
  )
}
