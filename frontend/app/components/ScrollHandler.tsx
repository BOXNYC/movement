'use client'

import { useEffect } from 'react'

function handleWindowScroll() {
  const scrollY = window.scrollY
  const html = document.documentElement

  if (scrollY === 0) html.classList.add('not-scrolled')
  else html.classList.remove('not-scrolled')

  if (scrollY > 0) html.classList.add('scrolled')
  else html.classList.remove('scrolled')

  if (scrollY > 16) html.classList.add('scrolled-1')
  else html.classList.remove('scrolled-1')

  if (scrollY > 32) html.classList.add('scrolled-2')
  else html.classList.remove('scrolled-2')

  if (scrollY > 48) html.classList.add('scrolled-3')
  else html.classList.remove('scrolled-3')

  if (scrollY > 64) html.classList.add('scrolled-4')
  else html.classList.remove('scrolled-4')

  if (scrollY > 80) html.classList.add('scrolled-5')
  else html.classList.remove('scrolled-5')

  if (scrollY > 96) html.classList.add('scrolled-6')
  else html.classList.remove('scrolled-6')
  if (scrollY > 96) html.classList.remove('not-scrolled-6')
  else html.classList.add('note-scrolled-6')
}

export default function ScrollHandler() {
  useEffect(() => {
    window.removeEventListener('scroll', handleWindowScroll)
    window.addEventListener('scroll', handleWindowScroll)
    handleWindowScroll() // Run once on mount

    return () => window.removeEventListener('scroll', handleWindowScroll)
  }, [])

  return null
}
