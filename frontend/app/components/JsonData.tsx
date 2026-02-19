type JsonDataBlock = {
  _type: 'jsonData'
  _key: string
  title?: string
  componentType?: string
  data?: string
}

type JsonDataProps = {
  index: number
  block: JsonDataBlock
  pageId: string
  pageType: string
}

/**
 * Renders JSON data blocks from the page builder.
 * The data is parsed and can be used to render custom components.
 */
export default function JsonData({block}: JsonDataProps) {
  let parsedData: unknown = null
  try {
    if (block.data) {
      parsedData = JSON.parse(block.data)
    }
  } catch {
    // Invalid JSON - will show error state
  }

  // You can extend this to render different components based on componentType
  // For now, it displays the raw JSON data for debugging/preview
  return (
    <div className="my-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
      {block.title && (
        <h3 className="text-lg font-semibold mb-2 text-gray-700">{block.title}</h3>
      )}
      {block.componentType && (
        <p className="text-sm text-gray-500 mb-4">Component: {block.componentType}</p>
      )}
      {parsedData ? (
        <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-sm">
          {JSON.stringify(parsedData, null, 2)}
        </pre>
      ) : (
        <p className="text-gray-500 italic">No data or invalid JSON</p>
      )}
    </div>
  )
}
