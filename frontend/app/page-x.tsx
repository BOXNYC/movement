import {Suspense} from 'react'

import {AllPosts} from '@/app/components/Posts'
import {AllWork} from '@/app/components/Works'
import {settingsQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'
import { dataAttr } from '@/sanity/lib/utils'

export default async function Page() {
  const {data: settings} = await sanityFetch({
    query: settingsQuery,
  })

  return (
    <>
      <div className="relative">
        <div className="relative bg-[url(/images/tile-1-black.png)] bg-size-[5px]">
          <div className="bg-gradient-to-b from-white w-full h-full absolute top-0"></div>
          <div className="container">
            <div className="relative min-h-[40vh] mx-auto max-w-2xl pt-10 xl:pt-20 pb-30 space-y-6 lg:max-w-4xl lg:px-12 flex flex-col items-center justify-center">
              <div className="flex flex-col gap-4 items-center">
                <div className="text-md leading-6 prose uppercase py-1 px-3 bg-white font-mono italic">
                  {settings?.title && (
                    <div
                      data-sanity={dataAttr({
                        id: settings._id,
                        type: 'settings',
                        path: 'title',
                      }).toString()}
                    >
                      <span>Home Page Content for {settings.title}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100 bg-gray-50">
        <div className="container">
          <aside className="py-12 sm:py-20">
            <Suspense>{await AllWork({featuredOnly: true})}</Suspense>
          </aside>
        </div>
      </div>
      <div className="border-t border-gray-100">
        <div className="container">
          <aside className="py-12 sm:py-20">
            <Suspense>{await AllPosts({limit: 5})}</Suspense>
          </aside>
        </div>
      </div>
    </>
  )
}
