import React from 'react'

import { ProseMirror } from '../prosemirror/preview'

export interface EditorProps {
  editorClassName?: string
  initialValue: string
}

const PTimelineEditor = ({ editorClassName, initialValue }: EditorProps) => {
  return <ProseMirror className={editorClassName} initialValue={initialValue} />
}

export default PTimelineEditor
