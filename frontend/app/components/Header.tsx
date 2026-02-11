import {settingsQuery, menuItemsQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'
import HeaderClient from './HeaderClient'

export default async function Header() {
  const [{data: settings}, {data: menuItems}] = await Promise.all([
    sanityFetch({query: settingsQuery}),
    sanityFetch({query: menuItemsQuery}),
  ])
  return (
    <HeaderClient  alt={settings?.title || 'Movement Strategy'} menuItems={menuItems || []} />
  )
}
