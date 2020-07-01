import { Decoration, DecorationSet } from 'prosemirror-view'
import { Plugin, PluginKey } from 'prosemirror-state'

export const syncCursorKey = new PluginKey('syncCursor')

const syncPlugin = new Plugin({
  state: {
    init() {
      // No decorations set by default
    },
    apply(tr, value) {
      if (tr.getMeta(syncCursorKey)) {
        console.log('syncCursor Plugin')
        const { users } = tr.getMeta(syncCursorKey)
        let decorations: any[] = []
        Object.keys(users).forEach((userSocketID) => {
          if (users[userSocketID].cursor) {
            const w = Decoration.widget(users[userSocketID].cursor, () => defaultCursorBuilder({ color: 'orange', name: users[userSocketID].name }), {
              key: users[userSocketID].name + '&CURSOR',
              side: 10
            })
            decorations.push(w)
            if (users[userSocketID].selection && users[userSocketID].selection.from && users[userSocketID].selection.to) {
              const selectionWidget = Decoration.inline(
                users[userSocketID].selection.from,
                users[userSocketID].selection.to,
                { style: `background-color: silver` },
                { inclusiveEnd: true, inclusiveStart: false }
              )
              decorations.push(selectionWidget)
            }
          }
        })
        return DecorationSet.create(tr.doc, decorations)
      } else {
        // map "other" changes so our decoration "stays put"
        // (e.g. user is typing so decoration's pos must change)
        return value.map(tr.mapping, tr.doc)
      }
    }
  },
  props: {
    decorations(state) {
      return syncPlugin.getState(state)
    }
  }
})

export default syncPlugin

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
