'use client'

interface VideoEmbedProps {
  url?: string | null
  title?: string | null
  aspectRatio?: string | null
  className?: string
}

/**
 * Converts various video URLs to embeddable format
 */
function getEmbedUrl(url: string): string | null {
  if (!url) return null

  // Already an embed URL
  if (url.includes('player.vimeo.com') || url.includes('youtube.com/embed')) {
    return url
  }

  // Vimeo: https://vimeo.com/123456789 or https://vimeo.com/123456789/abcdef (unlisted)
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)(?:\/([a-zA-Z0-9]+))?/)
  if (vimeoMatch) {
    const videoId = vimeoMatch[1]
    const hash = vimeoMatch[2]
    return hash
      ? `https://player.vimeo.com/video/${videoId}?h=${hash}`
      : `https://player.vimeo.com/video/${videoId}`
  }

  // YouTube: various formats
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
  )
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`
  }

  // Return original URL if it might be embeddable
  return url
}

export default function VideoEmbed({
  url,
  title,
  aspectRatio = '16/9',
  className = '',
}: VideoEmbedProps) {
  if (!url) return null

  const embedUrl = getEmbedUrl(url)
  if (!embedUrl) return null

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg bg-black ${className}`}
      style={{aspectRatio: aspectRatio || '16/9'}}
    >
      <iframe
        src={embedUrl}
        title={title || 'Video'}
        className="absolute inset-0 w-full h-full border-0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
