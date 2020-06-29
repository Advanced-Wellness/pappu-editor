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
import syncCursorPlugin, { syncCursorKey } from './plugins/syncCursor'

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
        Socket.on('disconnect', () => {
          setInstance(null)
        })
        Socket.on('connect', () => {
          const myClientID = Math.floor(Math.random() * 0xffffffff)
          let timeoutFunction: any = null
          let myLastCursor: null | number = null
          let myLastFrom: null | number = null
          let myLastTo: null | number = null
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

                    if (proseMirror.view.state.selection.anchor !== myLastCursor && proseMirror.view.hasFocus() && !sendable) {
                      Socket.emit('USER_CURSOR_UPDATE', proseMirror.view.state.selection.anchor, '123')
                      myLastCursor = proseMirror.view.state.selection.anchor
                    }

                    if ((proseMirror.view.state.selection.from !== myLastFrom || proseMirror.view.state.selection.to !== myLastTo) && proseMirror.view.hasFocus() && !sendable) {
                      Socket.emit('USER_SELECTION_UPDATE', proseMirror.view.state.selection.from, proseMirror.view.state.selection.to, '123')
                      myLastFrom = proseMirror.view.state.selection.from
                      myLastTo = proseMirror.view.state.selection.to
                    }

                    if (sendable) {
                      clearTimeout(timeoutFunction)
                      timeoutFunction = setTimeout(() => {
                        const sendable = sendableSteps(proseMirror.view.state)
                        if (sendable) {
                          var steps = sendable.steps.map((s) => s.toJSON())
                          let gettingNewVersion = false
                          const sendUpdate = () => {
                            Socket.emit('NEW_STEPS', getVersion(proseMirror.view.state), steps, myClientID, '123', (status: boolean, remoteVersion: number) => {
                              if (!status) {
                                Socket.emit('GIVE_ME_CHANGES_SINCE_VERSION', getVersion(proseMirror.view.state), (status: boolean, steps: any[]) => {
                                  if (status) {
                                    let doc = proseMirror.view.state.doc
                                    let validSteps: Step[] = []
                                    let clientIDs: any[] = []
                                    steps.map((s) => {
                                      const scopy = s
                                      s = Step.fromJSON(schema, s)
                                      let applied = s.apply(doc)
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

            Socket.on('USER_UPDATED', (users: any, socketid: string) => {
              if (Socket.id !== socketid) {
                const usersWithoutThisUser = Object.assign({}, users)
                delete usersWithoutThisUser[Socket.id]
                console.log('users:', usersWithoutThisUser)
                let transaction = proseMirror.view.state.tr.setMeta(syncCursorKey, { users: usersWithoutThisUser })
                proseMirror.view.dispatch(transaction)
              }
            })

            Socket.on('NEW_STEPS_RECIEVED', (data: { steps: any[]; clientID: number; versionHistory: number }) => {
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
                Socket.emit('GIVE_ME_CHANGES_SINCE_VERSION', getVersion(proseMirror.view.state), (status: boolean, steps: any[]) => {
                  if (status) {
                    let doc = proseMirror.view.state.doc
                    let validSteps: Step[] = []
                    let clientIDs: any[] = []
                    steps.map((s) => {
                      s = Step.fromJSON(schema, s)
                      let applied = s.apply(doc)
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
  directEditorProps = {}
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
    syncCursorPlugin
  ]
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
