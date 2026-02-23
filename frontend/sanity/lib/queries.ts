import {defineQuery} from 'next-sanity'

export const settingsQuery = defineQuery(`*[_type == "settings"][0]`)

const postFields = /* groq */ `
  _id,
  _createdAt,
  "status": select(_originalId in path("drafts.**") => "draft", "published"),
  "title": coalesce(title, "Untitled"),
  "slug": slug.current,
  excerpt,
  coverImage,
  "date": coalesce(date, _updatedAt),
  "author": author->{firstName, lastName, picture},
`

const linkReference = /* groq */ `
  _type == "link" => {
    "page": page->slug.current,
    "post": post->slug.current
  }
`

const linkFields = /* groq */ `
  link {
      ...,
      ${linkReference}
      }
`

export const getPageQuery = defineQuery(`
  *[_type == 'page' && slug.current == $slug][0]{
    _id,
    _type,
    name,
    slug,
    heading,
    subheading,
    parenthetical,
    content[]{
      ...,
      markDefs[]{
        ...,
        ${linkReference}
      }
    },
    "pageBuilder": pageBuilder[]{
      ...,
      _type == "callToAction" => {
        ...,
        button {
          ...,
          ${linkFields}
        }
      },
      _type == "infoSection" => {
        content[]{
          ...,
          markDefs[]{
            ...,
            ${linkReference}
          }
        }
      },
    },
  }
`)

export const sitemapData = defineQuery(`
  *[_type == "page" || _type == "post" && defined(slug.current)] | order(_type asc) {
    "slug": slug.current,
    _type,
    _updatedAt,
  }
`)

export const allPostsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(_createdAt desc) {
    ${postFields}
  }
`)

export const recentPostsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(_createdAt desc) [0...5] {
    ${postFields}
  }
`)

export const morePostsQuery = defineQuery(`
  *[_type == "post" && _id != $skip && defined(slug.current)] | order(_createdAt desc) [0...$limit] {
    ${postFields}
  }
`)

export const postQuery = defineQuery(`
  *[_type == "post" && slug.current == $slug] [0] {
    content[]{
    ...,
    markDefs[]{
      ...,
      ${linkReference}
    }
  },
    ${postFields}
  }
`)

export const postPagesSlugs = defineQuery(`
  *[_type == "post" && defined(slug.current)]
  {"slug": slug.current}
`)

export const adjacentPostQuery = defineQuery(`
  {
    "previous": *[_type == "post" && defined(slug.current) && _createdAt > $currentCreatedAt] | order(_createdAt asc) [0] {
      _id,
      "title": coalesce(title, "Untitled"),
      _createdAt,
      "slug": slug.current,
      coverImage
    },
    "next": *[_type == "post" && defined(slug.current) && _createdAt < $currentCreatedAt] | order(_createdAt desc) [0] {
      _id,
      "title": coalesce(title, "Untitled"),
      _createdAt,
      "slug": slug.current,
      coverImage
    },
    "related": *[_type == "post" && defined(slug.current) && _id != $currentId && _createdAt != $currentCreatedAt] | order(_createdAt desc) [0] {
      _id,
      "title": coalesce(title, "Untitled"),
      _createdAt,
      "slug": slug.current,
      coverImage
    }
  }
`)

export const pagesSlugs = defineQuery(`
  *[_type == "page" && defined(slug.current)]
  {"slug": slug.current}
`)

export const menuItemsQuery = defineQuery(`
  *[_type == "page" && menuItem.enabled == true] | order(coalesce(menuItem.weight, 0) asc) {
    _id,
    name,
    "slug": slug.current,
    "title": coalesce(menuItem.title, name),
    "target": menuItem.target,
    "weight": coalesce(menuItem.weight, 0)
  }
`)

const workFields = /* groq */ `
  _id,
  _type,
  orderRank,
  "status": select(_originalId in path("drafts.**") => "draft", "published"),
  "title": coalesce(title, "Untitled"),
  "subtitle": subtitle,
  "slug": slug.current,
  excerpt,
  coverImage,
  tags,
  featured,
  "date": coalesce(date, _updatedAt),
  "author": author->{firstName, lastName, picture},
`

export const allWorkQuery = defineQuery(`
  *[_type == "work" && defined(slug.current)] | order(orderRank) {
    ${workFields}
  }
`)

export const moreWorkQuery = defineQuery(`
  *[_type == "work" && _id != $skip && defined(slug.current)] | order(orderRank) [0...$limit] {
    ${workFields}
  }
`)

export const workQuery = defineQuery(`
  *[_type == "work" && slug.current == $slug] [0] {
    content[]{
    ...,
    markDefs[]{
      ...,
      ${linkReference}
    }
  },
    ${workFields}
    video->{
      _id,
      title,
      description,
      videoUrl,
      "videoFileUrl": videoFile.asset->url,
      thumbnail,
      duration
    },
    videoEmbed,
    iframes,
    "pageBuilder": pageBuilder[]{
      ...,
      _type == "callToAction" => {
        ...,
        button {
          ...,
          ${linkFields}
        }
      },
      _type == "infoSection" => {
        content[]{
          ...,
          markDefs[]{
            ...,
            ${linkReference}
          }
        }
      },
    },
  }
`)

export const featuredWorkQuery = defineQuery(`
  *[_type == "work" && featured == true && defined(slug.current)] | order(orderRank) {
    ${workFields}
  }
`)

export const workPagesSlugs = defineQuery(`
  *[_type == "work" && defined(slug.current)]
  {"slug": slug.current}
`)

export const adjacentWorkQuery = defineQuery(`
  {
    "previous": *[_type == "work" && defined(slug.current) && date < $currentDate] | order(date desc) [0] {
      _id,
      "title": coalesce(title, "Untitled"),
      subtitle,
      "slug": slug.current,
      coverImage
    },
    "next": *[_type == "work" && defined(slug.current) && date > $currentDate] | order(date asc) [0] {
      _id,
      "title": coalesce(title, "Untitled"),
      subtitle,
      "slug": slug.current,
      coverImage
    },
    "related": *[_type == "work" && defined(slug.current) && _id != $currentId && date != $currentDate] | order(date desc) [0] {
      _id,
      "title": coalesce(title, "Untitled"),
      subtitle,
      "slug": slug.current,
      coverImage
    }
  }
`)
