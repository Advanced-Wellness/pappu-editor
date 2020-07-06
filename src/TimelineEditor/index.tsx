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
  ClientID?: number
  Socket?: SocketIOClient.Socket
  SocketURL?: string
  SocketTransports?: string[]
  SocketPath?: string
  InitEvent?: string
  DocumentRoomName?: string
  EmitNewStepsEvent?: string
  GetChangesEvent?: string
  RecieveNewStepsEvent?: string
  HeartBeatPingEvent?: string
}

const Editor: ForwardRefRenderFunction<EditorAPI, EditorProps> = (
  {
    className,
    editorClassName,
    desktopMenuClassName,
    initialValue,
    placeholder,
    onChange,
    onFocus,
    onBlur,
    realtimeEnabled,
    ClientID,
    Socket,
    SocketURL,
    SocketTransports,
    SocketPath,
    InitEvent,
    DocumentRoomName,
    EmitNewStepsEvent,
    GetChangesEvent,
    RecieveNewStepsEvent,
    HeartBeatPingEvent,
    ...other
  },
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
    <ProseMirror
      onChange={onChange}
      className={editorClassName}
      initialValue={initialValue}
      placeholder={placeholder || ''}
      ref={proseMirrorRef}
      realtimeEnabled={realtimeEnabled}
      ClientID={ClientID}
      Socket={Socket}
      SocketURL={SocketURL}
      SocketTransports={SocketTransports}
      SocketPath={SocketPath}
      InitEvent={InitEvent}
      DocumentRoomName={DocumentRoomName}
      EmitNewStepsEvent={EmitNewStepsEvent}
      GetChangesEvent={GetChangesEvent}
      RecieveNewStepsEvent={RecieveNewStepsEvent}
      HeartBeatPingEvent={HeartBeatPingEvent}
    >
      {render}
    </ProseMirror>
  )
}

export default forwardRef(Editor)
