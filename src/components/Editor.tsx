import React, {
  forwardRef,
  RefForwardingComponent,
  useRef,
  useCallback,
  useImperativeHandle,
  FocusEventHandler,
} from 'react'
import isMobile from 'ismobilejs'

import {
  ProseMirror,
  ProseMirrorInstance,
  EditorView,
  Ref,
  createAPI,
  EditorAPI,
} from '../prosemirror'
import DesktopLayout from './DesktopLayout'
import MobileLayout from './MobileLayout'

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
}

const Editor: RefForwardingComponent<EditorAPI, EditorProps> = (
  {
    className,
    editorClassName,
    desktopMenuClassName,
    initialValue,
    placeholder,
    onChange,
    onFocus,
    onBlur,
    ...other
  },
  ref,
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
        <DesktopLayout
          className={className}
          menuClassName={desktopMenuClassName}
          onFocus={onFocus}
          onBlur={onBlur}
        >
          {element}
        </DesktopLayout>
      )
    },
    [className, desktopMenuClassName, onFocus, onBlur],
  )

  return (
    <ProseMirror
      onChange={onChange}
      className={editorClassName}
      initialValue={initialValue}
      placeholder={placeholder || ''}
      ref={proseMirrorRef}
    >
      {render}
    </ProseMirror>
  )
}

export default forwardRef(Editor)
