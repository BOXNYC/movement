import {GetPageQueryResult, SanityImageAssetReference, SanityImageCrop, SanityImageHotspot} from '@/sanity.types'

export type PageBuilderSection = NonNullable<NonNullable<GetPageQueryResult>['pageBuilder']>[number]
export type ExtractPageBuilderType<T extends PageBuilderSection['_type']> = Extract<
  PageBuilderSection,
  {_type: T}
>

// Represents a Link after GROQ dereferencing (page/post become slug strings)
export type DereferencedLink = {
  _type: 'link'
  linkType?: 'href' | 'page' | 'post'
  href?: string
  page?: string | null
  post?: string | null
  openInNewTab?: boolean
}

export type Work = {
    _id: string;
    status: "draft" | "published";
    title: string;
    subtitle: string | null;
    slug: string | null;
    excerpt: string | null;
    coverImage: {
        asset?: SanityImageAssetReference | undefined;
        media?: unknown;
        hotspot?: SanityImageHotspot;
        crop?: SanityImageCrop;
        alt?: string;
        _type: "image";
    } | null;
    tags: Array<string> | null;
    featured: boolean | null;
    date: string;
    author: {
        firstName: string | null;
        lastName: string | null;
        picture: {
            asset?: SanityImageAssetReference;
            media?: unknown;
            hotspot?: SanityImageHotspot;
            crop?: SanityImageCrop;
            alt?: string;
            _type: "image";
        } | null;
    } | null;
}