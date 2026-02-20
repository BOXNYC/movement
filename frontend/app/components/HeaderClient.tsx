'use client'

import Link from 'next/link'
import NavLink from './NavLink'
import Image from 'next/image'
import { useState } from 'react';
import { cn } from '@/utils/className';

export default function HeaderClient({alt, menuItems}: {alt: string, menuItems: Array<{
    _id: string;
    name: string | null;
    slug: string | null;
    title: string | null;
    target: "" | "_blank" | "_parent" | "_self" | "_top" | null;
    weight: number;
}>}) {
  const [expanded, setExpanded] = useState<boolean>(false);
  return (<>
    <header className="sticky top-0 z-50 flex items-center mb-4 md:mb-16 scrolled-6:mb-[93px]">
      <div className="mx-auto flex">
        <div className="relative mx-auto">
          <div className="
            flex items-center justify-center gap-2 z-1
            relative mt-8
            md:mt-0 md:absolute md:top-8 md:left-1/2 md:-translate-x-1/2
            scrolled-6:relative scrolled-6:top-auto scrolled-6:left-auto scrolled-6:translate-x-0 scrolled-6:mt-8 scrolled-6:top-auto
          ">
            <span className="hidden md:inline-block scrolled-6:hidden">
              <Link href="/">
                <Image
                  src="/images/movement-logo.svg"
                  alt={alt}
                  width={200}
                  height={48}
                  className="h-12 w-auto"
                />
              </Link>
            </span>
            <span className="
              inline-flex space-x-2 mb-4 justify-center items-center
              md:hidden
              scrolled-6:inline-flex
            ">
              <Link href="/">
                <Image
                  src="/images/movement-logo-small.svg"
                  alt={alt}
                  width={200}
                  height={48}
                  className="h-16 w-auto"
                />
              </Link>
              <button onClick={() => setExpanded(!expanded)} className="cursor-pointer inline-flex flex-col p-1 gap-y-1 bg-mvmnt-pink w-8 h-8 justify-center items-center">
                <span className="bg-mvmnt-yellow h-1 w-full rounded-full" />
                <span className="bg-mvmnt-yellow h-1 w-full rounded-full" />
                <span className="bg-mvmnt-yellow h-1 w-full rounded-full" />
              </button>
            </span>
          </div>
          <nav className="
            absolute flex min-w-screen md:min-w-auto left-1/2 -translate-x-1/2
            md:items-end md:justify-end md:relative md:left-auto md:translate-x-0 md:w-full
            scrolled-6:absolute scrolled-6:min-w-screen scrolled-6:left-1/2 scrolled-6:-translate-x-1/2
          ">
            <ul
              role="list"
              className={cn('w-full flex-col md:flex-row md:h-35 scrolled-6:flex-col', expanded ? 'flex' : 'hidden md:flex scrolled-6:hidden')}
            >
                {menuItems?.map((item) => (
                <li key={item._id} className="group inline-flex items-start justify-start md:items-end md:justify-end scrolled-6:items-start scrolled-6:justify-start">
                  <NavLink
                    className="font-replay uppercase text-lg font-bold inline-flex justify-start items-start md:justify-end md:items-end md:hover:h-full scrolled-6:justify-start scrolled-6:items-start scrolled-6:w-full max-md:w-full"
                    activeClassName="md:h-full max-md:w-full scrolled-6:w-full scrolled-6:!font-replay-italic scrolled-6:!tracking-[1] md:scrolled-6:text-2xl max-md:!font-replay-italic max-md:!tracking-[1] max-md:text-xl scrolled-6:italic max-md:italic scrolled-6:!normal-case max-md:!normal-case"
                    onClick={() => setExpanded(false)} href={`/${item.slug}`} target={item.target || undefined}
                  >
                    <span className="px-4 py-4 md:min-h-18 md:max-w-32 not-scrolled-6:max-w-32 flex justify-center items-center text-center leading-[1]">
                      {item.title}
                    </span>
                  </NavLink>
                </li>
                ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
    {expanded && (
      <div
        className="fixed top-0 left-0 right-0 w-full h-screen !h-[100dvh] bg-mvmnt-offwhite/80 backdrop-blur-md md:hidden md:scrolled-6:block z-[20]"
        onClick={() => setExpanded(false)}
      />
    )}
  </>)
}
