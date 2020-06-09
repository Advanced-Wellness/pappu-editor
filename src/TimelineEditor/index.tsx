import React, { useEffect, useState } from 'react'
import { ITimelineEditorProps } from '../interfaces'

export default function TimelineEditor(props: ITimelineEditorProps) {
  const [instance, setInstance] = useState<ProseMirrorInstance | null>(null)
  useEffect(() => {
    return () => {
      cleanup
    }
  }, [input])
  return (
    <div>
      <h1>TimelineEditor</h1>
    </div>
  )
}
