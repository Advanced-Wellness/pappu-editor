import { EditorState, Transaction } from 'prosemirror-state'

export function ChangeAlignment(state: EditorState, align: string | null, dispatch: (tr: Transaction<any>) => void) {
  // TODO: This is not working when we select text in editor
  let transaction = state.tr
  console.log('Change Alignment:', state.selection.from, state.selection.to)
  if (state.selection.from === state.selection.to) {
    state.doc.nodesBetween(state.selection.from, state.selection.to, (node, pos) => {
      console.log(node, pos)
      transaction.setNodeMarkup(pos, undefined, { ...node.attrs, align })
    })
    dispatch(transaction)
  }
}
