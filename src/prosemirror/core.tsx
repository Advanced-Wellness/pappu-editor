import React, { ReactNode, useEffect, useState, createContext, useCallback, useContext, forwardRef, useImperativeHandle } from 'react'
import { DOMParser } from 'prosemirror-model'
import { Plugin as BasePlugin, EditorState as BaseEditorState, Transaction as BaseTransaction } from 'prosemirror-state'

import { EditorView as BaseEditorView, DirectEditorProps } from 'prosemirror-view'

import schema, { Schema } from './schema'
import { Command } from './commands'
import { setup } from './plugins'
import { sendableSteps } from 'prosemirror-collab'
import SocketClient from 'socket.io-client'

export const ProseMirror = forwardRef<ProseMirrorInstance | null, ProseMirrorProps>((props, ref) => {
  const { className, initialValue, children, placeholder, onChange, realtimeEnabled } = props
  const [instance, setInstance] = useState<ProseMirrorInstance | null>(null)

  useImperativeHandle(ref, () => instance as ProseMirrorInstance, [instance])

  useEffect(() => {
    let proseMirror: ProseMirrorInstance

    const createprosemirror = () => {
      if (realtimeEnabled) {
        const Socket = SocketClient('http://localhost:8080/prose', {
          transports: ['websocket', 'polling', 'flashsocket'],
          autoConnect: true,
          path: '/aw'
        })
        Socket.emit('GIVE_ME_DOC', '123', (status: boolean, version: number, initialContent: string) => {
          if (status) {
            proseMirror = createProseMirror({
              initialContent,
              clientID: 'MrFambo',
              version,
              realtimeEnabled,
              className,
              initialValue,
              placeholder,
              directEditorProps: {
                dispatchTransaction: (transaction) => {
                  const editorState = proseMirror.view.state.apply(transaction)
                  proseMirror.view.updateState(editorState)
                  let sendable = sendableSteps(editorState)
                  console.log('sendable:', sendable)
                  if (onChange && transaction.docChanged) {
                    onChange(proseMirror.view)
                  }
                }
              }
            })
            setInstance(proseMirror)
          }
        })
      } else {
        proseMirror = createProseMirror({
          realtimeEnabled,
          className,
          initialValue,
          placeholder,
          directEditorProps: {
            dispatchTransaction: (transaction) => {
              const editorState = proseMirror.view.state.apply(transaction)
              proseMirror.view.updateState(editorState)
              if (onChange && transaction.docChanged) {
                onChange(proseMirror.view)
              }
            }
          }
        })
        setInstance(proseMirror)
      }
    }

    createprosemirror()

    return () => {
      setInstance(null)
      proseMirror.view.destroy()
    }
  }, [className, onChange, placeholder])

  const handleRef = useCallback(
    (dom: HTMLDivElement | null) => {
      if (!dom || !instance) {
        return
      }
      dom.appendChild(instance.view.dom)
    },
    [instance]
  )

  if (!instance) {
    return null
  }

  return <ProseMirrorContext.Provider value={instance}>{children(handleRef)}</ProseMirrorContext.Provider>
})

// ******* CREATE PROSEMIRROR FUNCTION ***********

export function createProseMirror({
  initialValue,
  className,
  placeholder,
  initialContent,
  realtimeEnabled,
  version,
  clientID,
  directEditorProps = {}
}: CreateProseMirrorOptions): ProseMirrorInstance {
  const callbacks: Array<() => any> = []

  const el = document.createElement('div')
  el.innerHTML = initialValue || ''
  const content: string = realtimeEnabled ? (initialContent as string) : (initialValue as string)
  const view = new BaseEditorView(undefined, {
    ...directEditorProps,
    state: BaseEditorState.create({
      doc: createDocument(content),
      plugins: [
        ...setup({ schema, className, placeholder }, realtimeEnabled, clientID, version),
        new BasePlugin({
          view: () => ({
            update: () => {
              for (const callback of callbacks) {
                callback()
              }
            }
          })
        })
      ]
    })
  })

  function subscribe(callback: () => any) {
    callbacks.push(callback)
    return () => {
      const index = callbacks.indexOf(callback)
      if (index >= 0) {
        callbacks.splice(index, 1)
      }
    }
  }

  function applyCommand(command: Command) {
    command(view.state, view.dispatch, view)
  }

  return { view, initialState: view.state, subscribe, applyCommand }
}

// ************* IT CREATES THE DOCUMENT ****************
export function createDocument(content: string) {
  const el = document.createElement('div')
  el.innerHTML = content || ''

  if (typeof content === 'string') {
    try {
      return schema.nodeFromJSON(JSON.parse(content))
    } catch (error) {
      console.log('error:', error)
      const element = document.createElement('div')
      element.innerHTML = content.trim()
      return DOMParser.fromSchema(schema).parse(element)
    }
  }

  return DOMParser.fromSchema(schema).parse(el)
}

// Context of Prosemirror
const ProseMirrorContext = createContext<ProseMirrorInstance | null>(null)

export type Ref = (dom: HTMLElement | null) => any

//*********** HOOOOOKKKKSSSSS ************* */

// Custom hook for prosemirror
export function useProseMirror() {
  const proseMirror = useContext(ProseMirrorContext)
  if (!proseMirror) {
    throw new Error('Cannot find ProseMirror instance')
  }

  return proseMirror
}
// Custom hook for prosemirror
export function useProseMirrorState<T>(mapState: (state: EditorState, view: EditorView) => T): [T, ApplyCommand, EditorView] {
  const { applyCommand, view, subscribe } = useProseMirror()
  const [value, setValue] = useState(() => {
    return mapState(view.state, view)
  })

  useEffect(() => {
    return subscribe(() => {
      const nextValue = mapState(view.state, view)
      setValue(nextValue)
    })
  }, [view, subscribe, mapState])

  return [value, applyCommand, view]
}

ProseMirror.displayName = 'ProseMirror'
// Types and interfaces
export type EditorView = BaseEditorView<Schema>
export type EditorState = BaseEditorState<Schema>
export type Transaction = BaseTransaction<Schema>
export type Dispatch = (tr: Transaction) => void

export type ApplyCommand = (command: Command) => any

export interface ProseMirrorInstance {
  view: EditorView
  initialState: EditorState
  subscribe: (callback: () => any) => () => any
  applyCommand: ApplyCommand
}

interface ProseMirrorProps {
  className?: string
  initialValue?: string
  placeholder?: string
  children: (ref: Ref) => ReactNode
  onChange?: (editorView: EditorView) => void
  realtimeEnabled?: boolean
}

interface CreateProseMirrorOptions {
  initialValue?: string
  className?: string
  placeholder?: string
  directEditorProps?: Omit<DirectEditorProps<Schema>, 'state'>
  realtimeEnabled?: boolean
  initialContent?: string
  version?: number
  clientID?: string
}
