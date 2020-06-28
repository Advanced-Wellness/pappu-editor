import React, { ReactNode, useEffect, useState, createContext, useCallback, useContext, forwardRef, useImperativeHandle } from 'react'
import { DOMParser } from 'prosemirror-model'
import { Plugin as BasePlugin, EditorState as BaseEditorState, Transaction as BaseTransaction, PluginKey } from 'prosemirror-state'
import { EditorView as BaseEditorView, DirectEditorProps, Decoration, DecorationSet } from 'prosemirror-view'
import { Step, Transform } from 'prosemirror-transform'
import applyDevTools from 'prosemirror-dev-tools'

import schema, { Schema } from './schema'
import { Command } from './commands'
import { setup } from './plugins'
import { sendableSteps, getVersion, receiveTransaction } from 'prosemirror-collab'
import SocketClient from 'socket.io-client'
import syncCursorPlugin from './plugins/syncCursor'

export const ProseMirror = forwardRef<ProseMirrorInstance | null, ProseMirrorProps>((props, ref) => {
  const { className, initialValue, children, placeholder, onChange, realtimeEnabled } = props
  const [instance, setInstance] = useState<ProseMirrorInstance | null>(null)

  useImperativeHandle(ref, () => instance as ProseMirrorInstance, [instance])

  useEffect(() => {
    let proseMirror: ProseMirrorInstance

    const createprosemirror = () => {
      if (realtimeEnabled) {
        const Socket = SocketClient('http://192.168.1.8:8080/prose', {
          transports: ['websocket', 'polling', 'flashsocket'],
          autoConnect: true,
          path: '/aw'
        })
        const myClientID = Math.floor(Math.random() * 0xffffffff)
        let timeoutFunction: any = null
        Socket.emit('GIVE_ME_DOC', '123', myClientID, (status: boolean, version: number, initialContent: string) => {
          if (status) {
            proseMirror = createProseMirror({
              initialContent,
              clientID: myClientID,
              version,
              socket: Socket,
              realtimeEnabled,
              className,
              initialValue,
              placeholder,
              directEditorProps: {
                dispatchTransaction: (transaction) => {
                  const editorState = proseMirror.view.state.apply(transaction)
                  proseMirror.view.updateState(editorState)

                  const sendable = sendableSteps(editorState)

                  if (sendable) {
                    clearTimeout(timeoutFunction)
                    timeoutFunction = setTimeout(() => {
                      const sendable = sendableSteps(proseMirror.view.state)
                      console.log('sendable:', sendable)
                      if (sendable) {
                        var steps = sendable.steps.map((s) => s.toJSON())
                        let gettingNewVersion = false
                        const sendUpdate = () => {
                          Socket.emit('NEW_STEPS', getVersion(proseMirror.view.state), steps, myClientID, '123', (status: boolean, remoteVersion: number) => {
                            if (!status) {
                              console.log('OMG NEW STEP CLASH ON SERVER')
                              Socket.emit('GIVE_ME_CHANGES_SINCE_VERSION', getVersion(proseMirror.view.state), (status: boolean, steps: any[]) => {
                                console.log('NEW CHANGES FROM SERVER:', status, steps)
                                if (status) {
                                  let doc = proseMirror.view.state.doc
                                  let validSteps: Step[] = []
                                  let clientIDs: any[] = []
                                  steps.map((s) => {
                                    const scopy = s
                                    s = Step.fromJSON(schema, s)
                                    let applied = s.apply(doc)
                                    console.log('applied:', applied, scopy.clientID, s, scopy)
                                    if (applied.doc && !applied.failed) {
                                      doc = applied.doc
                                      validSteps.push(s)
                                      clientIDs.push(scopy.clientID)
                                    } else {
                                      console.warn('REBASE ERROR:', applied.failed)
                                    }
                                  })
                                  const updatedState = proseMirror.view.state.apply(receiveTransaction(proseMirror.view.state, validSteps, clientIDs))
                                  if (!gettingNewVersion) {
                                    gettingNewVersion = true
                                    proseMirror.view.updateState(updatedState)
                                    // sendUpdate()
                                  } else {
                                    console.error('Please refresh page')
                                  }
                                }
                              })
                            }
                          })
                        }
                        sendUpdate()
                      }
                    }, 250)
                  }

                  if (onChange && transaction.docChanged) {
                    onChange(proseMirror.view)
                  }
                }
              }
            })
            setInstance(proseMirror)
          }

          Socket.on('NEW_STEPS_RECIEVED', (data: { steps: any[]; clientID: number; versionHistory: number }) => {
            console.log('NEW_STEPS_RECIEVED:', data, getVersion(proseMirror.view.state), data.steps)

            if (getVersion(proseMirror.view.state) === data.versionHistory) {
              const clientIDs = Array(data.steps.length).fill(`${data.clientID}`)
              const updatedState = proseMirror.view.state.apply(
                receiveTransaction(
                  proseMirror.view.state,
                  data.steps.map((s: { [key: string]: any }) => Step.fromJSON(schema, s)),
                  clientIDs
                )
              )
              proseMirror.view.updateState(updatedState)
            } else {
              console.log('GIVE_ME_CHANGES')
              Socket.emit('GIVE_ME_CHANGES_SINCE_VERSION', getVersion(proseMirror.view.state), (status: boolean, steps: any[]) => {
                if (status) {
                  let doc = proseMirror.view.state.doc
                  let validSteps: Step[] = []
                  let clientIDs: any[] = []
                  steps.map((s) => {
                    s = Step.fromJSON(schema, s)
                    console.log('s:', s.clientID, s)
                    let applied = s.apply(doc)
                    console.log('applied:', applied)
                    if (applied.doc && !applied.failed) {
                      doc = applied.doc
                      validSteps.push(s)
                      clientIDs.push(s.clientID)
                    } else {
                      console.warn('REBASE ERROR:', applied.failed)
                    }
                  })
                  proseMirror.view.dispatch(receiveTransaction(proseMirror.view.state, validSteps, clientIDs))
                }
              })
            }
          })
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
  socket,
  directEditorProps = {},
  cursorSyncPlugin
}: CreateProseMirrorOptions): ProseMirrorInstance {
  const callbacks: Array<() => any> = []

  const el = document.createElement('div')
  el.innerHTML = initialValue || ''
  const content: string = realtimeEnabled ? (initialContent as string) : (initialValue as string)
  let plugin = [
    ...setup({ schema, className, placeholder }, realtimeEnabled, clientID, version, socket),
    new BasePlugin({
      view: () => ({
        update: () => {
          for (const callback of callbacks) {
            callback()
          }
        }
      })
    }),
    syncCursorPlugin(socket as SocketIOClient.Socket, clientID as number)
  ]
  if (cursorSyncPlugin) {
    plugin.push(cursorSyncPlugin)
  }
  const view = new BaseEditorView(undefined, {
    ...directEditorProps,
    state: BaseEditorState.create({
      doc: createDocument(content),
      plugins: plugin
    })
  })

  applyDevTools(view)

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
  console.log('DOMParser.fromSchema(schema).parse(el):', DOMParser.fromSchema(schema).parse(el))
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

function debounce(fn: Function, delay: number) {
  let timeout
  return function (...args) {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      fn(...args)
      timeout = null
    }, delay)
  }
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
  clientID?: number
  socket?: SocketIOClient.Socket
  cursorSyncPlugin?: BasePlugin<any, any> | null
}

interface sendable {
  version: number
  steps: Step<Schema>[]
  clientID: React.ReactText
  origins: BaseTransaction[]
}
