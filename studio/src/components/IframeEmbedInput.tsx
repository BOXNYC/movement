import {Stack} from '@sanity/ui'
import {ObjectInputProps} from 'sanity'
import {IframePreviewButton} from './IframePreviewButton'

export function IframeEmbedInput(props: ObjectInputProps) {
  const {value, renderDefault} = props

  const title = value?.title as string | undefined
  const description = value?.description as string | undefined
  const url = value?.url as string | undefined

  return (
    <Stack space={4}>
      <IframePreviewButton title={title} description={description} url={url} />
      {renderDefault(props)}
    </Stack>
  )
}
