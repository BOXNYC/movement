import {createPortal} from 'react-dom'
import {useCallback, useEffect} from 'react'
import {Box, Button, Card, Flex, Text} from '@sanity/ui'
import {CloseIcon} from '@sanity/icons'

interface IframeModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  url: string
}

export function IframeModal({isOpen, onClose, title, description, url}: IframeModalProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    },
    [onClose],
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  const modalContent = (
    <Box
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Backdrop */}
      <Box
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        }}
      />

      {/* Modal Content */}
      <Card
        radius={3}
        shadow={4}
        style={{
          position: 'relative',
          width: '90vw',
          maxWidth: '1200px',
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Flex
          padding={3}
          align="center"
          justify="space-between"
          style={{borderBottom: '1px solid var(--card-border-color)'}}
        >
          <Box>
            <Text size={2} weight="semibold">
              {title}
            </Text>
            {description && (
              <Text size={1} muted style={{marginTop: '4px'}}>
                {description}
              </Text>
            )}
          </Box>
          <Button
            icon={CloseIcon}
            mode="bleed"
            onClick={onClose}
            tone="default"
            aria-label="Close modal"
          />
        </Flex>

        {/* Iframe Container */}
        <Box style={{flex: 1, overflow: 'hidden'}}>
          <iframe
            src={url}
            title={title}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </Box>
      </Card>
    </Box>
  )

  return createPortal(modalContent, document.body)
}
