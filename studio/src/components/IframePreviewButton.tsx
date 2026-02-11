import {useState, useCallback} from 'react'
import {Button, Card, Stack, Text, Flex, Box} from '@sanity/ui'
import {PlayIcon, LinkIcon} from '@sanity/icons'
import {IframeModal} from './IframeModal'

interface IframePreviewButtonProps {
  title?: string
  description?: string
  url?: string
}

export function IframePreviewButton({title, description, url}: IframePreviewButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpen = useCallback(() => {
    if (url) {
      setIsModalOpen(true)
    }
  }, [url])

  const handleClose = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  if (!title && !url) {
    return (
      <Card padding={3} radius={2} tone="transparent" border>
        <Text size={1} muted>
          Add a title and URL to preview
        </Text>
      </Card>
    )
  }

  return (
    <>
      <Card
        padding={3}
        radius={2}
        border
        tone={url ? 'default' : 'caution'}
        style={{cursor: url ? 'pointer' : 'default'}}
      >
        <Flex align="center" gap={3}>
          <Box
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: url ? 'var(--card-badge-default-bg-color)' : 'var(--card-badge-caution-bg-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {url ? <LinkIcon /> : <PlayIcon />}
          </Box>

          <Stack space={2} flex={1}>
            <Text size={1} weight="semibold">
              {title || 'Untitled'}
            </Text>
            {description && (
              <Text size={1} muted style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '300px',
              }}>
                {description}
              </Text>
            )}
            {url && (
              <Text size={0} muted style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '300px',
              }}>
                {url}
              </Text>
            )}
          </Stack>

          {url && (
            <Button
              icon={PlayIcon}
              text="Preview"
              tone="primary"
              mode="ghost"
              onClick={handleOpen}
            />
          )}
        </Flex>
      </Card>

      <IframeModal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={title || 'Preview'}
        description={description}
        url={url || ''}
      />
    </>
  )
}
