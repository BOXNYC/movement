import {useState, useMemo} from 'react'
import {Stack, Card, Text, Box} from '@sanity/ui'
import {ObjectInputProps} from 'sanity'

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

export function VideoEmbedInput(props: ObjectInputProps) {
  const {value, renderDefault} = props

  const url = value?.url as string | undefined
  const title = value?.title as string | undefined
  const aspectRatio = (value?.aspectRatio as string) || '16/9'

  const embedUrl = useMemo(() => (url ? getEmbedUrl(url) : null), [url])

  return (
    <Stack space={4}>
      {embedUrl ? (
        <Card radius={2} overflow="hidden" border>
          <Box
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: aspectRatio,
              backgroundColor: '#000',
            }}
          >
            <iframe
              src={embedUrl}
              title={title || 'Video embed'}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </Box>
        </Card>
      ) : (
        <Card padding={3} radius={2} tone="transparent" border>
          <Text size={1} muted>
            Add a video URL to see preview
          </Text>
        </Card>
      )}
      {renderDefault(props)}
    </Stack>
  )
}
