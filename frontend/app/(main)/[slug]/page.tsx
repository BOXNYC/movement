import type {Metadata} from 'next'
import Head from 'next/head'
import {Suspense} from 'react'

import PageBuilderPage from '@/app/components/PageBuilder'
import {sanityFetch} from '@/sanity/lib/live'
import {getPageQuery, pagesSlugs} from '@/sanity/lib/queries'
import {GetPageQueryResult} from '@/sanity.types'
import {PageOnboarding} from '@/app/components/Onboarding'
import {AllWork} from '@/app/components/Works'
import { PortableText, PortableTextBlock } from 'next-sanity'
import { AllPosts } from '../../components/Posts'
import BG from '../../components/BG'
import { Heading, Subheading } from '../../components/Heading'
import Container from '../../components/Container'
import Parenthetical from '@/app/components/Parenthetical'

type Props = {
  params: Promise<{slug: string}>
}

/**
 * Generate the static params for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: pagesSlugs,
    // // Use the published perspective in generateStaticParams
    perspective: 'published',
    stega: false,
  })
  return data
}

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const {data: page} = await sanityFetch({
    query: getPageQuery,
    params,
    // Metadata should never contain stega
    stega: false,
  })

  return {
    title: page?.name,
    description: page?.heading,
  } satisfies Metadata
}

export default async function Page(props: Props) {
  const params = await props.params
  const [{data: page}] = await Promise.all([sanityFetch({query: getPageQuery, params})])

  if (!page?._id) {
    return (
      <div className="py-40">
        <PageOnboarding />
      </div>
    )
  }

  return (
    <div className="mb-12 lg:mb-24 px-8">
      <BG pathname={`/${params.slug}`} />
      <Head>
        <title>{page.heading}</title>
      </Head>
      <Container>
        <div className="pb-6 border-b border-gray-100">
          <div className="max-w-3xl mx-auto">
            <Heading>{page.heading}</Heading>
            <Subheading>{page.subheading}</Subheading>
            {page.parenthetical && (
              <Parenthetical>{page.parenthetical}</Parenthetical>
            )}  
            {/* Content field */}
            {page.content?.length && (
              <div className="max-w-2xl prose-headings:font-medium prose-headings:tracking-tight">
                <PortableText
                  value={page.content as PortableTextBlock[]}
                />
              </div>
            )}
            <PageBuilderPage page={page as GetPageQueryResult} />
            {/* Dynamic content */}
            {params.slug === 'our-work' && (
              <div className="mt-8">
                <Suspense>{await AllWork()}</Suspense>
              </div>
            )}
            {params.slug === 'feed' && (
              <div className="mt-8">
                <Suspense>{await AllPosts()}</Suspense>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  )
}
