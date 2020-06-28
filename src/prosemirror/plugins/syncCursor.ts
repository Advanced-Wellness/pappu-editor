import { Decoration, DecorationSet } from 'prosemirror-view'
import { Plugin, PluginKey, Transaction, EditorState } from 'prosemirror-state'
import underscore from 'underscore'

const syncCursorKey = new PluginKey('syncCursor')

let appliedDecorations: any = {}
let newDecorations: any = {}
let myLastSent: any = {}

const createCursorDecorations = (state: EditorState, ourSocketID: string, myClientID: number): DecorationSet => {
  console.log('createCursorDecorations')
  let decorations: Decoration[] = []
  Object.keys(newDecorations).forEach((id) => {
    if (id !== ourSocketID && newDecorations[id].cursor !== null) {
      console.log('pushing Decoration:', newDecorations[id].cursor, newDecorations)
      const wid = Decoration.widget(newDecorations[id].cursor, () => defaultCursorBuilder({ name: myClientID.toString(), color: 'orange' }), {
        key: `${myClientID.toString()}`,
        side: 10
      })
      console.log('wid:', wid)
      decorations.push(wid)
    }
  })
  appliedDecorations = newDecorations
  console.log('dec:', decorations)
  return DecorationSet.create(state.doc, decorations)
}

const syncCursor = (socket: SocketIOClient.Socket, myClientID: number): Plugin => {
  return new Plugin({
    key: syncCursorKey,
    state: {
      init(_, state) {
        socket.on('USER_UPDATED', (data: any, socketID: string) => {
          if (socket.id !== socketID) {
            console.log('user_update', data)
            newDecorations = data
            state.apply(state.tr.setMeta(syncCursorKey, { cursorUpdated: true }))
          }
        })
        return createCursorDecorations(state, socket.id, myClientID)
      },
      apply(tr, prevState, oldState, newState) {
        const cursorState = tr.getMeta(syncCursorKey)
        if (cursorState && cursorState.cursorUpdated) {
          console.log('tr:', cursorState)
          return createCursorDecorations(newState, socket.id, myClientID)
        }
        return prevState.map(tr.mapping, tr.doc)
      }
    },
    view: function () {
      return {
        update: (editorView) => {
          if (editorView.hasFocus() && myLastSent.cursor !== editorView.state.selection.anchor) {
            socket.emit('USER_CURSOR_UPDATE', editorView.state.selection.anchor, '123')
            myLastSent.cursor = editorView.state.selection.anchor
          }
        },
        destroy: () => {
          socket.emit('USER_LEFT', '123')
        }
      }
    },
    props: {
      decorations(state) {
        return syncCursorKey.getState(state)
      }
    }
  })
}

export const defaultCursorBuilder = (user) => {
  const cursor = document.createElement('span')
  cursor.classList.add('ProseMirror-yjs-cursor')
  cursor.setAttribute('style', `border-color: ${user.color}`)
  const userDiv = document.createElement('div')
  userDiv.setAttribute('style', `background-color: ${user.color}`)
  userDiv.insertBefore(document.createTextNode(user.name), null)
  cursor.insertBefore(userDiv, null)
  return cursor
}

export default syncCursor
