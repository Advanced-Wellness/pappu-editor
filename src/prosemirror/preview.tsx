import React, { useEffect, useState, useRef } from 'react'
import { EditorState as BaseEditorState } from 'prosemirror-state'
import { EditorView as BaseEditorView } from 'prosemirror-view'
import { Schema } from './schema'
import { createDocument } from './core'

type EditorView = BaseEditorView<Schema>

interface ProseMirrorProps {
  className?: string
  initialValue?: string
}

export const ProseMirror = (props: ProseMirrorProps) => {
  const { initialValue } = props
  const [instance, setInstance] = useState<EditorView | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = document.createElement('div')
    el.innerHTML = initialValue || ''
    const view = new BaseEditorView(ref.current as Node, {
      state: BaseEditorState.create({
        doc: createDocument(initialValue as string),
      }),
      editable: () => false,
    })
    setInstance(view)

    return () => {
      setInstance(null)
      view.destroy()
    }
  }, [])

  return <div ref={ref}></div>
}
