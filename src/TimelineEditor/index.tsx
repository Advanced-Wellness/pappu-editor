import React, { forwardRef, useRef, useCallback, useImperativeHandle, FocusEventHandler, ForwardRefRenderFunction } from 'react'

import { ProseMirror, ProseMirrorInstance, EditorView, Ref, createAPI, EditorAPI } from '../prosemirror'
import isMobile from 'ismobilejs'
import MobileLayout from './MobileLayout'
import DesktopLayout from './DesktopLayout'

export { EditorAPI }

export interface EditorProps {
  className?: string
  editorClassName?: string
  desktopMenuClassName?: string
  initialValue?: string
  placeholder?: string
  onChange?: (view: EditorView) => void
  onFocus?: FocusEventHandler<HTMLDivElement>
  onBlur?: FocusEventHandler<HTMLDivElement>
  realtimeEnabled?: boolean
}

const Editor: ForwardRefRenderFunction<EditorAPI, EditorProps> = (
  { className, editorClassName, desktopMenuClassName, initialValue, placeholder, onChange, onFocus, onBlur, realtimeEnabled, ...other },
  ref
) => {
  const proseMirrorRef = useRef<ProseMirrorInstance>(null)

  useImperativeHandle(ref, () => createAPI(proseMirrorRef), [])

  const render = useCallback(
    (ref: Ref) => {
      const element = <div ref={ref} />
      return isMobile.any ? (
        <MobileLayout className={className} onFocus={onFocus} onBlur={onBlur}>
          {element}
        </MobileLayout>
      ) : (
        <DesktopLayout className={className} menuClassName={desktopMenuClassName} onFocus={onFocus} onBlur={onBlur}>
          {element}
        </DesktopLayout>
      )
    },
    [className, desktopMenuClassName, onFocus, onBlur]
  )

  return (
    <ProseMirror onChange={onChange} className={editorClassName} initialValue={initialValue} placeholder={placeholder || ''} ref={proseMirrorRef} realtimeEnabled={realtimeEnabled}>
      {render}
    </ProseMirror>
  )
}

export default forwardRef(Editor)
