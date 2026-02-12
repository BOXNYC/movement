// import {Suspense} from 'react'
// import {AllPosts} from '@/app/components/Posts'
// import {AllWork} from '@/app/components/Works'
import {featuredWorkQuery/* , settingsQuery */} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'
import Home from './Home'

export default async function Page() {
  /* const {data: settings} = await sanityFetch({
    query: settingsQuery,
  }) */

  const {data: featuredWork} = await sanityFetch({query: featuredWorkQuery});
  console.log('Featured work data:', featuredWork);

  return (
    <>
      <Home /* settings={settings} */ featuredWork={featuredWork} />
    </>
  )
}
